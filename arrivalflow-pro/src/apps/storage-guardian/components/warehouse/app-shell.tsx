import { Link } from "@tanstack/react-router";
import {
  Boxes,
  ClipboardList,
  Gauge,
  History,
  LayoutDashboard,
  LogOut,
  MapPinned,
  PackagePlus,
  ShieldAlert,
  Split,
  Warehouse,
} from "lucide-react";
import type { ReactNode } from "react";
import { useWarehouse } from "@/apps/storage-guardian/lib/warehouse/store";
import { CURRENT_USER } from "@/apps/storage-guardian/lib/warehouse/data";
import { useAuth } from "@/lib/auth";

const NAV = [
  { to: "/storage-guardian", label: "Dashboard", icon: LayoutDashboard },
  { to: "/storage-guardian/receiving", label: "Receiving & Pipeline", icon: PackagePlus },
  { to: "/storage-guardian/putaway", label: "Put-Away Queue", icon: ClipboardList },
  { to: "/storage-guardian/locations", label: "Location Browser", icon: MapPinned },
  { to: "/storage-guardian/overflow", label: "Overflow Simulator", icon: Split },
  { to: "/storage-guardian/alerts", label: "Alerts", icon: ShieldAlert },
  { to: "/storage-guardian/audit", label: "Audit Trail", icon: History },
  { to: "/storage-guardian/reports", label: "Reports", icon: Gauge },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { alerts } = useWarehouse();
  const { user, logout } = useAuth();
  const open = alerts.filter((a) => !a.resolved).length;

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        <div className="flex items-center gap-2.5 border-b border-sidebar-border px-5 py-4">
          <div className="grid size-9 place-items-center rounded-md bg-primary/15 text-primary">
            <Warehouse className="size-5" />
          </div>
          <div>
            <p className="font-display text-sm font-bold leading-tight">NODE·WMS</p>
            <p className="text-[11px] text-muted-foreground">Data Center Storage</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: to === "/storage-guardian" }}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[status=active]:bg-primary/15 data-[status=active]:font-medium data-[status=active]:text-primary"
            >
              <Icon className="size-4" />
              <span className="flex-1">{label}</span>
              {label === "Alerts" && open > 0 && (
                <span className="rounded-full bg-destructive px-1.5 py-0.5 text-[10px] font-semibold text-destructive-foreground">
                  {open}
                </span>
              )}
            </Link>
          ))}
        </nav>

        <div className="border-t border-sidebar-border p-4 text-xs text-muted-foreground">
          <p className="flex items-center gap-2">
            <Boxes className="size-3.5" /> Site: DC-EU-WEST-01
          </p>
          <p className="mt-1 truncate">{user?.name ?? CURRENT_USER}</p>
          <button type="button" onClick={logout} className="mt-3 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition hover:bg-destructive/10 hover:text-destructive">
            <LogOut className="size-3.5" /> Sign out
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="flex items-center gap-3 overflow-x-auto border-b border-border bg-background/80 px-4 py-2 backdrop-blur lg:hidden">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: to === "/storage-guardian" }}
              className="flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground data-[status=active]:bg-primary/15 data-[status=active]:text-primary"
            >
              <Icon className="size-3.5" />
              {label}
            </Link>
          ))}
          <button type="button" onClick={logout} className="ml-auto flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
            <LogOut className="size-3.5" /> Sign out
          </button>
        </header>
        <main className="mx-auto max-w-[1400px] p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}
