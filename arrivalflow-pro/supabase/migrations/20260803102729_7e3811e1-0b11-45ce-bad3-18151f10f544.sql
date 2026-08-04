-- ===== roles & profiles =====
create type public.app_role as enum ('admin','manager','viewer');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  "fullName" text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "profiles readable by authenticated" on public.profiles for select to authenticated using (true);
create policy "users update own profile" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "user_roles readable by authenticated" on public.user_roles for select to authenticated using (true);

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, "fullName")
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', new.email))
  on conflict (id) do nothing;
  insert into public.user_roles (user_id, role) values (new.id, 'manager')
  on conflict do nothing;
  return new;
end; $$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ===== shared helpers =====
create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  entity text not null,
  "recordId" uuid,
  "recordCode" text,
  action text not null,
  changes jsonb,
  actor uuid,
  created_at timestamptz not null default now()
);
grant select on public.audit_logs to authenticated;
grant all on public.audit_logs to service_role;
alter table public.audit_logs enable row level security;
create policy "audit readable by authenticated" on public.audit_logs for select to authenticated using (true);
create index audit_logs_entity_idx on public.audit_logs (entity, created_at desc);

create or replace function public.log_audit()
returns trigger language plpgsql security definer set search_path = public as $$
declare _code text;
begin
  if (tg_op = 'DELETE') then
    _code := (to_jsonb(old) ->> 'code');
    insert into public.audit_logs (entity, "recordId", "recordCode", action, changes, actor)
    values (tg_table_name, old.id, _code, 'delete', to_jsonb(old), auth.uid());
    return old;
  elsif (tg_op = 'UPDATE') then
    _code := (to_jsonb(new) ->> 'code');
    insert into public.audit_logs (entity, "recordId", "recordCode", action, changes, actor)
    values (tg_table_name, new.id, _code, 'update',
      jsonb_build_object('before', to_jsonb(old), 'after', to_jsonb(new)), auth.uid());
    return new;
  else
    _code := (to_jsonb(new) ->> 'code');
    insert into public.audit_logs (entity, "recordId", "recordCode", action, changes, actor)
    values (tg_table_name, new.id, _code, 'create', to_jsonb(new), auth.uid());
    return new;
  end if;
end; $$;

-- ===== master tables =====
create table public.suppliers (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  type text default 'Manufacturer',
  "contactPerson" text default '',
  phone text default '',
  email text default '',
  website text default '',
  address text default '',
  city text default '',
  state text default '',
  country text default '',
  "postalCode" text default '',
  "gstNumber" text default '',
  "taxNumber" text default '',
  certification text not null default 'Pending',
  "certificationExpiry" text default '',
  commodities text[] not null default '{}',
  "paymentTerms" text default 'Net 30',
  currency text default 'EUR',
  bank text default '',
  status text not null default 'Active',
  notes text default '',
  "createdAt" date not null default current_date,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  "contactPerson" text default '',
  phone text default '',
  email text default '',
  "billingAddress" text default '',
  "shippingAddress" text default '',
  "deliveryLocations" integer not null default 1,
  "shipmentPreference" text default '',
  "paymentTerms" text default 'Net 30',
  currency text default 'EUR',
  "taxNumber" text default '',
  country text default '',
  priority text not null default 'Medium',
  category text default '',
  status text not null default 'Active',
  notes text default '',
  "createdAt" date not null default current_date,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.items (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text default '',
  category text not null default 'Raw Material',
  "subCategory" text default '',
  unit text default 'EA',
  weight text default '',
  dimensions text default '',
  manufacturer text default '',
  brand text default '',
  barcode text default '',
  sku text default '',
  cost numeric not null default 0,
  price numeric not null default 0,
  "minStock" integer not null default 0,
  "maxStock" integer not null default 0,
  "reorderLevel" integer not null default 0,
  "shelfLife" text default '',
  hazard text default 'None',
  storage text default '',
  "hsnCode" text default '',
  status text not null default 'Active',
  "createdAt" date not null default current_date,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.warehouses (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  location text default '',
  manager text default '',
  capacity integer not null default 0,
  utilization integer not null default 0,
  status text not null default 'Active',
  "createdAt" date not null default current_date,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.employees (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  department text default '',
  designation text default '',
  role text default '',
  email text default '',
  phone text default '',
  "joiningDate" text default '',
  manager text default '',
  shift text default '',
  warehouse text default '',
  status text not null default 'Active',
  "createdAt" date not null default current_date,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.carriers (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  "contactPerson" text default '',
  phone text default '',
  email text default '',
  refrigerated boolean not null default false,
  "hazardTransport" boolean not null default false,
  "licenseNumber" text default '',
  status text not null default 'Active',
  "createdAt" date not null default current_date,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.vehicles (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  "vehicleNumber" text not null,
  type text default '',
  capacity text default '',
  weight text default '',
  volume text default '',
  driver text default '',
  "insuranceExpiry" text default '',
  "fitnessExpiry" text default '',
  gps text not null default 'Enabled',
  carrier text default '',
  status text not null default 'Active',
  "createdAt" date not null default current_date,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.countries (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  flag text default '',
  currency text default '',
  symbol text default '',
  "exchangeRate" numeric not null default 1,
  "taxRule" text default '',
  "importDuty" text default '',
  "timeZone" text default '',
  language text default '',
  status text not null default 'Active',
  "createdAt" date not null default current_date,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  entity text not null,
  "recordId" uuid,
  "recordCode" text,
  "fileName" text not null,
  "filePath" text not null unique,
  "fileSize" bigint not null default 0,
  "mimeType" text default '',
  "uploadedBy" uuid,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.documents to authenticated;
grant all on public.documents to service_role;
alter table public.documents enable row level security;
create policy "documents readable by authenticated" on public.documents for select to authenticated using (true);
create policy "documents insert by authenticated" on public.documents for insert to authenticated with check (auth.uid() = "uploadedBy");
create policy "documents delete by uploader or admin" on public.documents for delete to authenticated
  using (auth.uid() = "uploadedBy" or public.has_role(auth.uid(),'admin'));
create index documents_entity_idx on public.documents (entity, "recordId");

-- grants, RLS, policies, triggers for each master table
do $$
declare t text;
begin
  foreach t in array array['suppliers','customers','items','warehouses','employees','carriers','vehicles','countries']
  loop
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
    execute format('grant all on public.%I to service_role', t);
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "read %1$s" on public.%1$I for select to authenticated using (true)', t);
    execute format('create policy "insert %1$s" on public.%1$I for insert to authenticated with check (true)', t);
    execute format('create policy "update %1$s" on public.%1$I for update to authenticated using (true) with check (true)', t);
    execute format($p$create policy "delete %1$s" on public.%1$I for delete to authenticated using (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'manager'))$p$, t);
    execute format('create trigger %1$s_set_updated_at before update on public.%1$I for each row execute function public.set_updated_at()', t);
    execute format('create trigger %1$s_audit after insert or update or delete on public.%1$I for each row execute function public.log_audit()', t);
  end loop;
end $$;