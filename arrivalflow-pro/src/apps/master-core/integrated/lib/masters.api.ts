import { supabase } from "@/apps/master-core/integrated/integrations/supabase/client";

export type MasterTable =
  | "suppliers"
  | "customers"
  | "items"
  | "warehouses"
  | "employees"
  | "carriers"
  | "vehicles"
  | "countries";

type FieldKind = "text" | "number" | "int" | "bool" | "array" | "status";

/** Column coercion map: form values arrive as strings, the database expects real types. */
const SCHEMA: Record<MasterTable, { prefix: string; fields: Record<string, FieldKind> }> = {
  suppliers: {
    prefix: "SUP",
    fields: { commodities: "array", status: "status" },
  },
  customers: {
    prefix: "CUS",
    fields: { deliveryLocations: "int", status: "status" },
  },
  items: {
    prefix: "ITM",
    fields: {
      cost: "number",
      price: "number",
      minStock: "int",
      maxStock: "int",
      reorderLevel: "int",
      status: "status",
    },
  },
  warehouses: {
    prefix: "WH",
    fields: { capacity: "int", utilization: "int", status: "status" },
  },
  employees: { prefix: "EMP", fields: { status: "status" } },
  carriers: {
    prefix: "CAR",
    fields: { refrigerated: "bool", hazardTransport: "bool", status: "status" },
  },
  vehicles: { prefix: "VEH", fields: { status: "status" } },
  countries: { prefix: "CTY", fields: { exchangeRate: "number", status: "status" } },
};

export type MasterRecord = Record<string, unknown> & { id: string; code: string };

function coerce(table: MasterTable, values: Record<string, string>) {
  const kinds = SCHEMA[table].fields;
  const out: Record<string, unknown> = {};
  for (const [key, raw] of Object.entries(values)) {
    if (raw === undefined) continue;
    const kind = kinds[key] ?? "text";
    const v = typeof raw === "string" ? raw.trim() : raw;
    switch (kind) {
      case "int":
        out[key] = v === "" ? 0 : Math.round(Number(v)) || 0;
        break;
      case "number":
        out[key] = v === "" ? 0 : Number(v) || 0;
        break;
      case "bool":
        out[key] = v === "true" || v === "Yes" || v === "true";
        break;
      case "array":
        out[key] = String(v)
          .split(/[;,]/)
          .map((s) => s.trim())
          .filter(Boolean);
        break;
      case "status":
        // the form uses a switch (true/false); lists use Active/Inactive/Draft
        out[key] = v === "true" ? "Active" : v === "false" ? "Inactive" : v || "Active";
        break;
      default:
        out[key] = v;
    }
  }
  return out;
}

export async function listRecords(table: MasterTable): Promise<MasterRecord[]> {
  const { data, error } = await supabase.from(table).select("*").order("code", { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as MasterRecord[];
}

export async function getRecord(table: MasterTable, id: string): Promise<MasterRecord | null> {
  const { data, error } = await supabase.from(table).select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return (data as unknown as MasterRecord) ?? null;
}

export async function nextCode(table: MasterTable) {
  const { data } = await supabase
    .from(table)
    .select("code")
    .order("code", { ascending: false })
    .limit(1);
  const last = (data?.[0] as { code?: string } | undefined)?.code ?? "";
  const n = Number(last.replace(/\D/g, "")) || 1000;
  return `${SCHEMA[table].prefix}-${n + 1}`;
}

export async function createRecord(table: MasterTable, values: Record<string, string>) {
  const payload = coerce(table, values);
  if (!payload["code"]) payload["code"] = await nextCode(table);
  const { data: auth } = await supabase.auth.getUser();
  payload["created_by"] = auth.user?.id ?? null;
  const { data, error } = await supabase
    .from(table)
    .insert(payload as never)
    .select()
    .single();
  if (error) throw friendly(error);
  return data as unknown as MasterRecord;
}

export async function updateRecord(table: MasterTable, id: string, values: Record<string, string>) {
  const payload = coerce(table, values);
  delete payload["created_by"];
  const { data, error } = await supabase
    .from(table)
    .update(payload as never)
    .eq("id", id)
    .select()
    .single();
  if (error) throw friendly(error);
  return data as unknown as MasterRecord;
}

export async function deleteRecords(table: MasterTable, ids: string[]) {
  const { error } = await supabase.from(table).delete().in("id", ids);
  if (error) throw friendly(error);
}

function friendly(error: { code?: string; message: string }) {
  if (error.code === "23505") return new Error("That code already exists — codes must be unique.");
  if (error.code === "42501")
    return new Error("You don't have permission for this action. Please sign in again.");
  return new Error(error.message);
}

/* ---------------- documents ---------------- */

export type DocumentRow = {
  id: string;
  entity: string;
  recordId: string | null;
  recordCode: string | null;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string | null;
  created_at: string;
};

export const BUCKET = "master-documents";

export async function uploadDocument(opts: {
  entity: string;
  recordId?: string | null;
  recordCode?: string | null;
  file: File;
}) {
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id;
  if (!userId) throw new Error("You must be signed in to upload documents.");
  if (opts.file.size > 25 * 1024 * 1024) throw new Error("Files must be 25 MB or smaller.");

  const safe = opts.file.name.replace(/[^\w.\-]+/g, "_");
  const path = `${userId}/${opts.entity}/${crypto.randomUUID()}-${safe}`;

  const { error: upErr } = await supabase.storage
    .from(BUCKET)
    .upload(path, opts.file, { cacheControl: "3600", upsert: false });
  if (upErr) throw new Error(upErr.message);

  const { data, error } = await supabase
    .from("documents")
    .insert({
      entity: opts.entity,
      recordId: opts.recordId ?? null,
      recordCode: opts.recordCode ?? null,
      fileName: opts.file.name,
      filePath: path,
      fileSize: opts.file.size,
      mimeType: opts.file.type,
      uploadedBy: userId,
    } as never)
    .select()
    .single();
  if (error) throw friendly(error);
  return data as unknown as DocumentRow;
}

export async function listDocuments(entity: string, recordId?: string | null) {
  let q = supabase
    .from("documents")
    .select("*")
    .eq("entity", entity)
    .order("created_at", { ascending: false });
  if (recordId) q = q.eq("recordId", recordId);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as unknown as DocumentRow[];
}

export async function attachDocumentsToRecord(ids: string[], recordId: string, recordCode: string) {
  if (!ids.length) return;
  const { error } = await supabase
    .from("documents")
    .update({ recordId, recordCode } as never)
    .in("id", ids);
  if (error) throw friendly(error);
}

export async function documentUrl(path: string) {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60 * 10);
  if (error) throw new Error(error.message);
  return data.signedUrl;
}

export async function deleteDocument(doc: { id: string; filePath: string }) {
  await supabase.storage.from(BUCKET).remove([doc.filePath]);
  const { error } = await supabase.from("documents").delete().eq("id", doc.id);
  if (error) throw friendly(error);
}

/* ---------------- audit ---------------- */

export type AuditRow = {
  id: string;
  entity: string;
  recordId: string | null;
  recordCode: string | null;
  action: string;
  created_at: string;
};

export async function listAudit(entity?: string, recordId?: string) {
  let q = supabase
    .from("audit_logs")
    .select("id, entity, recordId, recordCode, action, created_at")
    .order("created_at", { ascending: false })
    .limit(25);
  if (entity) q = q.eq("entity", entity);
  if (recordId) q = q.eq("recordId", recordId);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as unknown as AuditRow[];
}

export async function counts() {
  const tables: MasterTable[] = [
    "suppliers",
    "customers",
    "items",
    "warehouses",
    "employees",
    "carriers",
    "vehicles",
    "countries",
  ];
  const entries = await Promise.all(
    tables.map(async (t) => {
      const { count } = await supabase.from(t).select("*", { count: "exact", head: true });
      return [t, count ?? 0] as const;
    }),
  );
  return Object.fromEntries(entries) as Record<MasterTable, number>;
}
