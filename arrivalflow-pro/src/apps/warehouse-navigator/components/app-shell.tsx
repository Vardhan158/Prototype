import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  Boxes,
  ChevronsUpDown,
  Globe,
  LayoutDashboard,
  Moon,
  QrCode,
  Search,
  Settings,
  Sun,
  Truck,
  Warehouse as WarehouseIcon,
  ClipboardCheck,
  PackageSearch,
  Wrench,
  BarChart3,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Map as MapIcon,
  Flame,
  Sparkles,
  LogOut,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { notifications, warehouses } from "@/apps/warehouse-navigator/data";
import { useAuth } from "@/lib/auth";

type NavItem = { label: string; to: string; icon: typeof LayoutDashboard; children?: { label: string; to: string }[] };

const NAV: NavItem[] = [
  { label: "Dashboard", to: "/warehouse-navigator/", icon: LayoutDashboard },
  { label: "Receiving", to: "/warehouse-navigator/cross-dock", icon: Truck },
  {
    label: "Warehouse",
    to: "/warehouse-navigator/warehouses",
    icon: WarehouseIcon,
    children: [
      { label: "Warehouse List", to: "/warehouse-navigator/warehouses" },
      { label: "Layout Map", to: "/warehouse-navigator/layout" },
      { label: "Zones", to: "/warehouse-navigator/zones" },
      { label: "Aisles", to: "/warehouse-navigator/aisles" },
      { label: "Racks", to: "/warehouse-navigator/racks" },
      { label: "Shelves", to: "/warehouse-navigator/shelves" },
      { label: "Bins", to: "/warehouse-navigator/bins" },
    ],
  },
  {
    label: "Put Away",
    to: "/warehouse-navigator/put-away",
    icon: ClipboardCheck,
    children: [
      { label: "Queue", to: "/warehouse-navigator/put-away" },
      { label: "Recommendation", to: "/warehouse-navigator/recommendation" },
      { label: "Scanner", to: "/warehouse-navigator/scanner" },
    ],
  },
  { label: "Inventory", to: "/warehouse-navigator/capacity", icon: PackageSearch },
  { label: "Assets", to: "/warehouse-navigator/visualization", icon: Wrench },
  { label: "Barcode", to: "/warehouse-navigator/scanner", icon: QrCode },
  { label: "Reports", to: "/warehouse-navigator/reports", icon: BarChart3 },
  { label: "Settings", to: "/warehouse-navigator/settings", icon: Settings },
];

const QUICK = [
  { label: "Heat Map", to: "/warehouse-navigator/heat-map", icon: Flame },
  { label: "Layout", to: "/warehouse-navigator/layout", icon: MapIcon },
  { label: "3D View", to: "/warehouse-navigator/visualization", icon: Boxes },
];

function SidebarBody({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex h-full flex-col gap-1 overflow-y-auto px-3 pb-6">
      {NAV.map((item) => {
        const active = item.to === "/warehouse-navigator/" ? pathname === "/warehouse-navigator/" : pathname.startsWith(item.to);
        const childActive = item.children?.some((c) => pathname === c.to);
        return (
          <div key={item.label}>
            <Link
              to={item.to}
              onClick={onNavigate}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                active || childActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground elev-1"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
              title={item.label}
            >
              <item.icon className="h-[18px] w-[18px] shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
            {!collapsed && item.children && (active || childActive) && (
              <div className="mt-1 ml-[22px] space-y-0.5 border-l border-border pl-3">
                {item.children.map((child) => (
                  <Link
                    key={child.to}
                    to={child.to}
                    onClick={onNavigate}
                    className={cn(
                      "block rounded-lg px-2.5 py-1.5 text-[13px] transition-colors",
                      pathname === child.to
                        ? "bg-primary-soft font-semibold text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {!collapsed && (
        <div className="mt-6 rounded-2xl bg-gradient-to-br from-primary to-secondary p-4 text-primary-foreground elev-2">
          <Sparkles className="h-5 w-5" />
          <p className="mt-2 text-sm font-semibold">Slotting Optimizer</p>
          <p className="mt-1 text-xs opacity-90">
            18 bins can be re-slotted to cut travel time by 12%.
          </p>
          <Link to="/warehouse-navigator/recommendation" onClick={onNavigate}>
            <Button size="sm" variant="secondary" className="mt-3 h-8 w-full text-xs">
              Review suggestions
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [dark, setDark] = useState(false);
  const [warehouse, setWarehouse] = useState(warehouses[0]!);
  const [lang, setLang] = useState("EN");
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <div className="min-h-screen w-full bg-background">
      {/* ambient glass background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-24 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute top-1/3 -right-32 h-[28rem] w-[28rem] rounded-full bg-secondary/10 blur-3xl" />
      </div>

      <div className="relative flex">
        <aside
          className={cn(
            "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar/80 backdrop-blur-xl transition-[width] duration-300 lg:flex",
            collapsed ? "w-[76px]" : "w-[264px]",
          )}
        >
          <div className="flex h-16 items-center gap-2.5 px-4">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-secondary text-primary-foreground elev-2">
              <WarehouseIcon className="h-5 w-5" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">StoreGrid WMS</p>
                <p className="truncate text-[11px] text-muted-foreground">Storage & Locations</p>
              </div>
            )}
          </div>
          <SidebarBody collapsed={collapsed} />
          <div className="mt-auto border-t border-sidebar-border p-3">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 text-muted-foreground"
              onClick={() => setCollapsed((c) => !c)}
            >
              {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
              {!collapsed && <span className="text-xs">Collapse</span>}
            </Button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-40 border-b border-border glass">
            <div className="grid h-16 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-3 sm:px-5">
              <div className="flex items-center gap-2">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="lg:hidden">
                      <PanelLeftOpen className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[280px] p-0 pt-4">
                    <div className="flex h-14 items-center gap-2.5 px-5">
                      <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-secondary text-primary-foreground">
                        <WarehouseIcon className="h-5 w-5" />
                      </div>
                      <p className="text-sm font-bold">StoreGrid WMS</p>
                    </div>
                    <SidebarBody collapsed={false} />
                  </SheetContent>
                </Sheet>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-9 gap-2 rounded-xl bg-surface/70 px-2.5 text-xs sm:px-3">
                      <span className="h-2 w-2 shrink-0 rounded-full bg-success" />
                      <span className="max-w-[110px] truncate font-semibold sm:max-w-none">
                        {warehouse.code}
                      </span>
                      <ChevronsUpDown className="h-3.5 w-3.5 opacity-60" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-72">
                    <DropdownMenuLabel className="text-xs">Warehouse selector</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {warehouses.map((w) => (
                      <DropdownMenuItem key={w.id} onClick={() => setWarehouse(w)} className="gap-2">
                        <span className="flex-1">
                          <span className="block text-sm font-medium">{w.name}</span>
                          <span className="block text-[11px] text-muted-foreground">
                            {w.code} · {w.city}
                          </span>
                        </span>
                        {w.id === warehouse.id && <Badge className="bg-primary-soft text-primary">Active</Badge>}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="relative min-w-0">
                <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search locations, SKUs, GRN, tasks…  (⌘K)"
                  className="h-9 rounded-xl border-border bg-surface/70 pl-9 text-sm"
                />
              </div>

              <div className="flex items-center gap-1">
                <div className="hidden items-center gap-1 xl:flex">
                  {QUICK.map((q) => (
                    <Link key={q.to} to={q.to}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn("h-9 gap-1.5 rounded-xl text-xs", pathname === q.to && "bg-primary-soft text-primary")}
                      >
                        <q.icon className="h-4 w-4" />
                        {q.label}
                      </Button>
                    </Link>
                  ))}
                </div>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative rounded-xl">
                      <Bell className="h-[18px] w-[18px]" />
                      <span className="absolute top-1.5 right-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-danger px-1 text-[10px] font-bold text-danger-foreground">
                        4
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-80 p-0">
                    <div className="border-b border-border px-4 py-3">
                      <p className="text-sm font-semibold">Notifications</p>
                      <p className="text-[11px] text-muted-foreground">4 unread alerts across 6 warehouses</p>
                    </div>
                    <div className="max-h-80 divide-y divide-border overflow-y-auto">
                      {notifications.map((n) => (
                        <div key={n.id} className="flex gap-3 px-4 py-3">
                          <span
                            className={cn(
                              "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                              n.tone === "warning" && "bg-warning",
                              n.tone === "danger" && "bg-danger",
                              n.tone === "success" && "bg-success",
                            )}
                          />
                          <div className="min-w-0">
                            <p className="text-[13px] font-medium">{n.title}</p>
                            <p className="text-[11px] text-muted-foreground">{n.detail}</p>
                            <p className="mt-0.5 text-[10px] text-muted-foreground">{n.time} ago</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>

                <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => setDark((d) => !d)}>
                  {dark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="hidden rounded-xl sm:inline-flex">
                      <Globe className="h-[18px] w-[18px]" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {["EN", "DE", "AR", "HI", "ZH"].map((l) => (
                      <DropdownMenuItem key={l} onClick={() => setLang(l)}>
                        {l === lang ? "✓ " : ""}
                        {{ EN: "English", DE: "Deutsch", AR: "العربية", HI: "हिन्दी", ZH: "中文" }[l]}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="ml-1 flex items-center gap-2 rounded-xl p-1 pr-2 transition-colors hover:bg-muted">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
                        RK
                      </span>
                      <span className="hidden text-left md:block">
                        <span className="block text-xs font-semibold leading-tight">{user?.name ?? "Rajesh Kumar"}</span>
                        <span className="block text-[10px] leading-tight text-muted-foreground">{user?.role ?? "Warehouse Manager"}</span>
                      </span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                      Signed in as rajesh.k@storegrid.io
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Switch role · Store Keeper</DropdownMenuItem>
                    <DropdownMenuItem>Switch role · Inventory Manager</DropdownMenuItem>
                    <DropdownMenuItem>Switch role · Supervisor</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => { logout(); navigate({ to: "/login" }); }}>
                      <LogOut className="mr-2 size-4" /> Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          <main className="min-w-0 flex-1 px-3 pt-5 pb-24 sm:px-5 lg:px-7">{children}</main>
        </div>
      </div>

      {/* Floating action button */}
      <div className="fixed right-5 bottom-6 z-50">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" className="h-14 w-14 rounded-2xl elev-3">
              <Plus className="h-6 w-6" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" className="w-56">
            <DropdownMenuLabel className="text-xs">Quick create</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/warehouse-navigator/warehouses">Create warehouse</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/warehouse-navigator/zones">Create zone</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/warehouse-navigator/put-away">Generate put away task</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/warehouse-navigator/scanner">Open scanner</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/warehouse-navigator/bins">Generate bin QR</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
