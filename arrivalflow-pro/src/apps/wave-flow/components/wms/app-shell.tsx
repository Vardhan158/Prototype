import { useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  PackageSearch,
  Waves,
  ScanBarcode,
  Boxes,
  ShieldCheck,
  Warehouse,
  Truck,
  ClipboardCheck,
  Radar,
  TriangleAlert,
  FileBarChart,
  ChartNoAxesCombined,
  Settings,
  Search,
  Bell,
  Moon,
  Sun,
  Globe,
  ChevronDown,
  Menu,
  X,
  CircleUser,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { notifications, warehouses } from "@/apps/wave-flow/lib/wms-data";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const nav = [
  { to: "/wave-flow", label: "Dashboard", icon: LayoutDashboard },
  { to: "/wave-flow/orders", label: "Outbound Orders", icon: PackageSearch, badge: "24" },
  { to: "/wave-flow/sales-orders", label: "Sales Orders", icon: PackageSearch },
  { to: "/wave-flow/allocation", label: "Inventory Allocation", icon: Boxes },
  { to: "/wave-flow/backorders", label: "Backorders", icon: TriangleAlert },
  { to: "/wave-flow/waves", label: "Wave Management", icon: Waves, badge: "6" },
  { to: "/wave-flow/wave-planning", label: "Wave Planning", icon: Waves },
  { to: "/wave-flow/wave-release", label: "Wave Release", icon: ClipboardCheck },
  { to: "/wave-flow/pick-lists", label: "Pick Lists", icon: ScanBarcode },
  { to: "/wave-flow/picking", label: "Picking", icon: ScanBarcode, badge: "18" },
  { to: "/wave-flow/packing", label: "Packing", icon: Boxes },
  { to: "/wave-flow/shipping-labels", label: "Shipping Labels", icon: FileBarChart },
  { to: "/wave-flow/quality", label: "Quality Verification", icon: ShieldCheck },
  { to: "/wave-flow/staging", label: "Staging", icon: Warehouse },
  { to: "/wave-flow/loading", label: "Truck Loading", icon: Truck },
  { to: "/wave-flow/load-verification", label: "Load Verification", icon: ShieldCheck },
  { to: "/wave-flow/dispatch", label: "Dispatch", icon: ClipboardCheck },
  { to: "/wave-flow/tracking", label: "Shipment Tracking", icon: Radar },
  { to: "/wave-flow/shipping", label: "Shipping", icon: Truck },
  { to: "/wave-flow/exceptions", label: "Exceptions", icon: TriangleAlert, badge: "2" },
  { to: "/wave-flow/reports", label: "Reports", icon: FileBarChart },
  { to: "/wave-flow/analytics", label: "Analytics", icon: ChartNoAxesCombined },
  { to: "/wave-flow/settings", label: "Settings", icon: Settings },
] as const;

function toneDot(tone: string) {
  return tone === "danger"
    ? "bg-danger"
    : tone === "warning"
      ? "bg-warning"
      : tone === "success"
        ? "bg-success"
        : "bg-primary";
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [warehouse, setWarehouse] = useState(warehouses[0]!);
  const [lang, setLang] = useState("EN");
  const { user, logout } = useAuth();

  const toggleDark = () => {
    setDark((d) => {
      const next = !d;
      if (typeof document !== "undefined") document.documentElement.classList.toggle("dark", next);
      return next;
    });
  };

  const isActive = (to: string) =>
    to === "/wave-flow"
      ? pathname === "/wave-flow" || pathname === "/wave-flow/"
      : pathname.startsWith(to);

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 shrink-0 items-center gap-2.5 border-b border-sidebar-border px-4">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
          <Warehouse className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">NexusWMS</p>
          <p className="truncate text-[11px] text-muted-foreground">Outbound Fulfillment</p>
        </div>
        <button
          className="ml-auto rounded-lg p-1.5 text-muted-foreground hover:bg-muted lg:hidden"
          onClick={() => setOpen(false)}
          aria-label="Close navigation"
        >
          <X className="size-4" />
        </button>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        <p className="px-3 pb-1 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
          Operations
        </p>
        {nav.map((item, i) => {
          const Icon = item.icon;
          const active = isActive(item.to);
          return (
            <div key={item.to}>
              {i === 11 && (
                <p className="px-3 pt-4 pb-1 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                  Insights
                </p>
              )}
              <Link
                to={item.to}
                onClick={() => setOpen(false)}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className={cn("size-4 shrink-0", active && "text-primary")} />
                <span className="truncate">{item.label}</span>
                {"badge" in item && item.badge && (
                  <span className="num ml-auto rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                    {item.badge}
                  </span>
                )}
              </Link>
            </div>
          );
        })}
      </nav>
      <div className="border-t border-sidebar-border p-3">
        <div className="glass-panel flex items-center gap-2.5 rounded-xl p-2.5">
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-secondary-soft text-xs font-semibold text-secondary-foreground">
            {user?.name
              .split(" ")
              .map((part) => part[0])
              .join("")
              .slice(0, 2)
              .toUpperCase() ?? "KA"}
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-medium">{user?.name ?? "Karan Arora"}</p>
            <p className="truncate text-[11px] text-muted-foreground">
              {user?.role ?? "Outbound Order Fulfillment & Wave Management"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {open && (
        <div
          className="fixed inset-0 z-40 bg-foreground/30 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[264px] border-r border-sidebar-border bg-sidebar transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {sidebar}
      </aside>

      <div className="lg:pl-[264px]">
        <header className="glass-topbar sticky top-0 z-30 border-b border-border">
          <div className="grid h-16 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-3 sm:px-5">
            <button
              className="rounded-lg p-2 text-muted-foreground hover:bg-muted lg:hidden"
              onClick={() => setOpen(true)}
              aria-label="Open navigation"
            >
              <Menu className="size-5" />
            </button>
            <div className="relative hidden min-w-0 md:block">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                className="h-10 w-full rounded-xl border border-input bg-surface pr-3 pl-9 text-sm outline-none focus:ring-2 focus:ring-ring"
                placeholder="Search orders, waves, materials, trucks…"
              />
            </div>
            <div className="md:hidden" />
            <div className="flex shrink-0 items-center gap-1.5">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="hidden h-9 gap-1.5 sm:inline-flex">
                    <Warehouse className="size-4" />
                    <span className="num">{warehouse.code}</span>
                    <ChevronDown className="size-3.5 opacity-60" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel>Warehouse</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {warehouses.map((w) => (
                    <DropdownMenuItem key={w.code} onClick={() => setWarehouse(w)}>
                      <span className="num mr-2 font-medium">{w.code}</span>
                      <span className="truncate text-muted-foreground">{w.name}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative size-9"
                    aria-label="Notifications"
                  >
                    <Bell className="size-4.5" />
                    <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-danger" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel className="flex items-center justify-between">
                    Notifications <span className="text-xs text-muted-foreground">5 new</span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {notifications.map((n) => (
                    <DropdownMenuItem key={n.title + n.at} className="items-start gap-2.5 py-2.5">
                      <span
                        className={cn("mt-1.5 size-2 shrink-0 rounded-full", toneDot(n.tone))}
                      />
                      <span className="min-w-0">
                        <span className="block text-xs font-medium">{n.title}</span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {n.body}
                        </span>
                        <span className="block text-[11px] text-muted-foreground">{n.at}</span>
                      </span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hidden size-9 sm:inline-flex"
                    aria-label="Language"
                  >
                    <Globe className="size-4.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {["EN", "DE", "NL", "ES", "ZH"].map((l) => (
                    <DropdownMenuItem key={l} onClick={() => setLang(l)}>
                      {l} {lang === l && "✓"}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="ghost"
                size="icon"
                className="size-9"
                onClick={toggleDark}
                aria-label="Toggle dark mode"
              >
                {dark ? <Sun className="size-4.5" /> : <Moon className="size-4.5" />}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-9 gap-2 px-1.5 sm:px-2">
                    <CircleUser className="size-5" />
                    <span className="hidden text-sm font-medium lg:inline">
                      {user?.name ?? "Karan Arora"}
                    </span>
                    <ChevronDown className="hidden size-3.5 opacity-60 lg:inline" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <p className="text-sm">{user?.name ?? "Karan Arora"}</p>
                    <p className="text-xs font-normal text-muted-foreground">
                      {user?.email ?? "karan@nexuswms.com"}
                    </p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>My tasks</DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/wave-flow/settings">Preferences</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive" onClick={logout}>
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1600px] space-y-4 p-3 sm:p-5">{children}</main>
      </div>
    </div>
  );
}
