import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Truck,
  ClipboardCheck,
  Warehouse,
  Boxes,
  AlertTriangle,
  BarChart3,
  Settings,
  Search,
  Bell,
  Globe,
  ChevronDown,
  PanelLeftClose,
  PanelLeft,
  ListChecks,
  ShieldAlert,
  FileWarning,
  Undo2,
  History,
  CircleUser,
  LogOut,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { actions, useWms } from "@/apps/quality-gatekeeper/lib/wms-store";
import { ACTIVITY } from "@/apps/quality-gatekeeper/lib/wms-data";
import { useAuth } from "@/lib/auth";

const NAV = [
  { to: "/quality-gatekeeper", label: "Dashboard", icon: LayoutDashboard },
  { to: "/quality-gatekeeper/receiving", label: "Receiving", icon: Truck },
  {
    label: "Quality Inspection",
    icon: ClipboardCheck,
    children: [
      { to: "/quality-gatekeeper/queue", label: "Inspection Queue", icon: ListChecks },
      { to: "/quality-gatekeeper/hold", label: "Quality Hold", icon: ShieldAlert },
      { to: "/quality-gatekeeper/ncr", label: "NCR Register", icon: FileWarning },
      { to: "/quality-gatekeeper/rts", label: "Return To Supplier", icon: Undo2 },
      { to: "/quality-gatekeeper/history", label: "Inspection History", icon: History },
    ],
  },
  { to: "/quality-gatekeeper/warehouse", label: "Warehouse", icon: Warehouse },
  { to: "/quality-gatekeeper/inventory", label: "Inventory", icon: Boxes },
  { to: "/quality-gatekeeper/damage", label: "Damage Management", icon: AlertTriangle },
  { to: "/quality-gatekeeper/reports", label: "Reports", icon: BarChart3 },
  { to: "/quality-gatekeeper/settings", label: "Settings", icon: Settings },
] as const;

const WAREHOUSES = ["PL-1000 · Pune Plant", "PL-2000 · Chennai DC", "PL-3000 · Rotterdam Hub"];
const LANGUAGES = ["English (EN)", "Deutsch (DE)", "हिन्दी (HI)", "العربية (AR)"];
const ROLES = ["Quality Inspector", "Quality Manager", "Warehouse Manager", "Store Keeper", "Procurement"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { warehouse, language, role } = useWms();
  const { user, logout } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const isActive = (to: string) => (to === "/quality-gatekeeper" ? pathname === "/quality-gatekeeper" || pathname === "/quality-gatekeeper/" : pathname.startsWith(to));

  const nav = (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
      {NAV.map((item) => {
        if ("children" in item) {
          const open = item.children.some((c) => isActive(c.to));
          return (
            <div key={item.label} className="mt-2">
              <p
                className={cn(
                  "flex items-center gap-2 px-3 py-2 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase",
                  collapsed && "justify-center px-0",
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {!collapsed && item.label}
              </p>
              <div className={cn("space-y-1", !collapsed && "ml-3 border-l border-sidebar-border pl-2")}>
                {item.children.map((c) => (
                  <NavLink key={c.to} to={c.to} label={c.label} icon={c.icon} active={isActive(c.to) || (open && false)} collapsed={collapsed} onNavigate={() => setMobileOpen(false)} />
                ))}
              </div>
            </div>
          );
        }
        return (
          <NavLink key={item.to} to={item.to} label={item.label} icon={item.icon} active={isActive(item.to)} collapsed={collapsed} onNavigate={() => setMobileOpen(false)} />
        );
      })}
    </nav>
  );

  const sidebar = (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-200",
        collapsed ? "w-[76px]" : "w-64",
      )}
    >
      <div className={cn("flex h-16 items-center gap-2 border-b border-sidebar-border px-4", collapsed && "justify-center px-0")}>
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
          <ClipboardCheck className="h-5 w-5" />
        </span>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">AXIOM WMS</p>
            <p className="truncate text-[11px] text-muted-foreground">Quality Management</p>
          </div>
        )}
      </div>
      {nav}
      <div className="border-t border-sidebar-border p-3">
        <Button variant="ghost" size="sm" className="w-full justify-start gap-2" onClick={() => setCollapsed((c) => !c)}>
          {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          {!collapsed && <span className="text-xs">Collapse menu</span>}
        </Button>
      </div>
    </aside>
  );

  return (
    <div className="page-gradient flex min-h-screen w-full bg-background">
      <div className="sticky top-0 hidden h-screen shrink-0 lg:block">{sidebar}</div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-foreground/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute top-0 left-0 h-full">{sidebar}</div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="glass-panel sticky top-0 z-40 grid h-16 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-none border-x-0 border-t-0 px-4">
          <div className="flex min-w-0 items-center gap-2">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)}>
              <PanelLeft className="h-5 w-5" />
            </Button>
            <div className="relative hidden min-w-0 flex-1 sm:block sm:max-w-md">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search GRN, PO, material, vendor, NCR…" className="h-10 rounded-xl bg-card pl-9" />
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="hidden h-10 gap-2 rounded-xl md:inline-flex">
                  <Building2 className="h-4 w-4 text-primary" />
                  <span className="max-w-[150px] truncate text-xs">{warehouse}</span>
                  <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Warehouse / Plant</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {WAREHOUSES.map((w) => (
                  <DropdownMenuItem key={w} onClick={() => actions.setWarehouse(w)}>
                    {w}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl">
                  <Globe className="h-4.5 w-4.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Language — {language}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {LANGUAGES.map((l) => (
                  <DropdownMenuItem key={l} onClick={() => actions.setLanguage(l)}>
                    {l}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-xl">
                  <Bell className="h-4.5 w-4.5" />
                  <span className="absolute top-2 right-2 grid h-4 w-4 place-items-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                    4
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-88 p-0">
                <div className="border-b border-border px-4 py-3">
                  <p className="text-sm font-semibold">Notifications</p>
                  <p className="text-xs text-muted-foreground">4 unread · Quality Management</p>
                </div>
                <ul className="max-h-80 divide-y divide-border overflow-y-auto">
                  {ACTIVITY.slice(0, 5).map((a, i) => (
                    <li key={i} className="flex gap-3 px-4 py-3">
                      <span
                        className={cn(
                          "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                          a.tone === "danger" && "bg-destructive",
                          a.tone === "warn" && "bg-warning",
                          a.tone === "success" && "bg-success",
                          a.tone === "info" && "bg-primary",
                        )}
                      />
                      <div className="min-w-0">
                        <p className="text-xs leading-relaxed">{a.text}</p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">{a.at}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </PopoverContent>
            </Popover>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-xl px-1.5 py-1 hover:bg-accent">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">{user?.name.split(" ").map((part) => part[0]).join("").slice(0, 2) ?? "AS"}</AvatarFallback>
                  </Avatar>
                  <span className="hidden text-left lg:block">
                    <span className="block text-xs font-semibold">{user?.name ?? "A. Sharma"}</span>
                    <span className="block text-[11px] text-muted-foreground">{user?.role ?? role}</span>
                  </span>
                  <ChevronDown className="hidden h-3.5 w-3.5 opacity-60 lg:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Switch role</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {ROLES.map((r) => (
                  <DropdownMenuItem key={r} onClick={() => actions.setRole(r)}>
                    <CircleUser className="h-4 w-4" /> {r}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive" onSelect={logout}>
                  <LogOut className="h-4 w-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="min-w-0 flex-1 px-4 py-6 md:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

function NavLink({
  to,
  label,
  icon: Icon,
  active,
  collapsed,
  onNavigate,
}: {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  collapsed: boolean;
  onNavigate: () => void;
}) {
  return (
    <Link
      to={to}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
        active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent/60",
        collapsed && "justify-center px-0",
      )}
      title={label}
    >
      <Icon className="h-4.5 w-4.5 shrink-0" />
      {!collapsed && <span className="truncate">{label}</span>}
    </Link>
  );
}
