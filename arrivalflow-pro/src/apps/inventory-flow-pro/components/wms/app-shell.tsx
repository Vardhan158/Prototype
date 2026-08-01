import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  PackageSearch,
  Warehouse,
  Boxes,
  Workflow,
  Hand,
  PackageOpen,
  Truck,
  FileBarChart,
  Settings2,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Bell,
  Globe,
  Moon,
  SunMedium,
  ChevronsUpDown,
  Menu,
  LogOut,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { AVAILABLE_ROLES, useWms, WAREHOUSES } from "@/apps/inventory-flow-pro/lib/wms/store";
import { ALERTS } from "@/apps/inventory-flow-pro/lib/wms/data";
import { GlobalSearch } from "./global-search";
import { useAuth } from "@/lib/auth";

type NavItem = { label: string; to: string };
type NavGroup = { label: string; icon: LucideIcon; to?: string; items?: NavItem[] };

export const NAV: NavGroup[] = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    items: [
      { label: "Lifecycle Dashboard", to: "/inventory-flow-pro" },
      { label: "Status Analytics", to: "/inventory-flow-pro/analytics" },
      { label: "Inventory Alerts", to: "/inventory-flow-pro/alerts" },
    ],
  },
  {
    label: "Receiving",
    icon: PackageSearch,
    items: [
      { label: "Inventory Status Board", to: "/inventory-flow-pro/status-board" },
      { label: "Quality Hold", to: "/inventory-flow-pro/quality-hold" },
      { label: "Damaged Inventory", to: "/inventory-flow-pro/damaged" },
    ],
  },
  {
    label: "Warehouse",
    icon: Warehouse,
    items: [
      { label: "Movement History", to: "/inventory-flow-pro/movement-history" },
      { label: "Quarantine", to: "/inventory-flow-pro/quarantine" },
      { label: "Recall Control", to: "/inventory-flow-pro/recall" },
    ],
  },
  { label: "Inventory", icon: Boxes, items: [{ label: "Inventory List", to: "/inventory-flow-pro/inventory" }] },
  {
    label: "Lifecycle",
    icon: Workflow,
    items: [
      { label: "Inventory Timeline", to: "/inventory-flow-pro/timeline" },
      { label: "Status Transition", to: "/inventory-flow-pro/transition" },
      { label: "Reservation Management", to: "/inventory-flow-pro/reservations" },
      { label: "Lifecycle Rules", to: "/inventory-flow-pro/lifecycle-rules" },
    ],
  },
  { label: "Picking", icon: Hand, to: "/inventory-flow-pro/picking" },
  { label: "Packing", icon: PackageOpen, to: "/inventory-flow-pro/packing" },
  { label: "Dispatch", icon: Truck, to: "/inventory-flow-pro/dispatch" },
  { label: "Reports", icon: FileBarChart, to: "/inventory-flow-pro/reports" },
  { label: "Settings", icon: Settings2, to: "/inventory-flow-pro/status-config" },
];

function BrandMark({ compact }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5 px-3 py-4">
      <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-primary-glow text-primary-foreground shadow-card">
        <Boxes className="size-5" />
      </div>
      {!compact && (
        <div className="leading-tight">
          <p className="text-sm font-semibold tracking-tight">AXIOM WMS</p>
          <p className="text-[11px] text-muted-foreground">Inventory Lifecycle Suite</p>
        </div>
      )}
    </div>
  );
}

function SidebarNav({ compact, onNavigate }: { compact?: boolean; onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const activeGroup = useMemo(
    () =>
      NAV.find(
        (g) =>
          g.to === pathname ||
          g.items?.some((i) => i.to === pathname || (i.to !== "/inventory-flow-pro" && pathname.startsWith(i.to))),
      )?.label,
    [pathname],
  );
  const [open, setOpen] = useState<string | null>(activeGroup ?? "Dashboard");
  const expanded = open ?? activeGroup ?? null;

  return (
    <ScrollArea className="flex-1">
      <nav className="space-y-1 px-2 pb-6">
        {NAV.map((group) => {
          const Icon = group.icon;
          const isActiveGroup = activeGroup === group.label;
          if (group.to) {
            const active = pathname === group.to;
            return (
              <Link
                key={group.label}
                to={group.to}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                )}
              >
                <Icon className="size-4 shrink-0" />
                {!compact && group.label}
              </Link>
            );
          }
          const isOpen = expanded === group.label;
          return (
            <div key={group.label}>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? "" : group.label)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActiveGroup
                    ? "text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                )}
              >
                <Icon className="size-4 shrink-0" />
                {!compact && (
                  <>
                    <span className="flex-1 text-left">{group.label}</span>
                    <ChevronDown
                      className={cn("size-3.5 transition-transform", isOpen && "rotate-180")}
                    />
                  </>
                )}
              </button>
              {!compact && isOpen && (
                <div className="ml-[1.4rem] mt-0.5 space-y-0.5 border-l border-sidebar-border pl-3">
                  {group.items?.map((item) => {
                    const active =
                      item.to === "/inventory-flow-pro"
                        ? pathname === "/inventory-flow-pro" || pathname === "/inventory-flow-pro/"
                        : pathname.startsWith(item.to);
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={onNavigate}
                        className={cn(
                          "block rounded-md px-2.5 py-1.5 text-[13px] transition-colors",
                          active
                            ? "bg-primary/10 font-medium text-primary"
                            : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
                        )}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </ScrollArea>
  );
}

function Header({ onOpenMobile }: { onOpenMobile: () => void }) {
  const { warehouse, setWarehouse, currentUser, setRole, dark, toggleDark } = useWms();
  const { user, logout } = useAuth();
  const [lang, setLang] = useState("en");
  const [searchOpen, setSearchOpen] = useState(false);
  const activeWh = WAREHOUSES.find((w) => w.code === warehouse);
  const critical = ALERTS.filter((a) => a.severity === "Critical" || a.severity === "High").length;

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border/70 glass px-3 sm:px-4">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onOpenMobile}>
        <Menu className="size-4" />
      </Button>

      <button
        type="button"
        onClick={() => setSearchOpen(true)}
        className="flex h-9 flex-1 max-w-md items-center gap-2 rounded-lg border border-border bg-card/70 px-3 text-sm text-muted-foreground transition-colors hover:border-primary/40"
      >
        <Search className="size-4" />
        <span className="hidden sm:inline">Search material, serial, batch, GRN…</span>
        <span className="sm:hidden">Search</span>
        <kbd className="ml-auto hidden rounded border border-border bg-muted px-1.5 text-[10px] font-medium sm:inline">
          ⌘K
        </kbd>
      </button>
      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />

      <div className="ml-auto flex items-center gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="hidden h-9 gap-2 px-2.5 text-xs font-medium md:flex">
              <Warehouse className="size-4 text-primary" />
              <span>{activeWh ? activeWh.code : "All Warehouses"}</span>
              <ChevronsUpDown className="size-3 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuLabel>Warehouse scope</DropdownMenuLabel>
            <DropdownMenuRadioGroup value={warehouse} onValueChange={setWarehouse}>
              <DropdownMenuRadioItem value="ALL">All warehouses (global)</DropdownMenuRadioItem>
              {WAREHOUSES.map((w) => (
                <DropdownMenuRadioItem key={w.code} value={w.code}>
                  <span className="flex flex-col">
                    <span className="text-sm">{w.name}</span>
                    <span className="text-[11px] text-muted-foreground">
                      {w.code} · {w.city} · {w.utilization}% utilised
                    </span>
                  </span>
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="size-4" />
              <span className="absolute right-1.5 top-1.5 grid size-4 place-items-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
                {critical}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              Notifications
              <Badge variant="outline" className="text-[10px]">
                {ALERTS.length} open
              </Badge>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {ALERTS.slice(0, 4).map((a) => (
              <DropdownMenuItem key={a.id} asChild>
                <Link to="/inventory-flow-pro/alerts" className="flex flex-col items-start gap-0.5">
                  <span className="text-xs font-semibold">{a.title}</span>
                  <span className="text-[11px] text-muted-foreground">
                    {a.type} · {a.raised}
                  </span>
                </Link>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/inventory-flow-pro/alerts" className="justify-center text-xs font-medium text-primary">
                View all alerts
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="hidden sm:inline-flex">
              <Globe className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Language</DropdownMenuLabel>
            <DropdownMenuRadioGroup value={lang} onValueChange={setLang}>
              <DropdownMenuRadioItem value="en">English (UK)</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="de">Deutsch</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="ar">العربية</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="hi">हिन्दी</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" size="icon" onClick={toggleDark} aria-label="Toggle dark mode">
          {dark ? <SunMedium className="size-4" /> : <Moon className="size-4" />}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-9 gap-2 px-1.5 sm:px-2">
              <Avatar className="size-7">
                <AvatarFallback className="bg-primary/10 text-[11px] font-semibold text-primary">
                  {(user?.name ?? currentUser.name)
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <span className="hidden text-left leading-tight lg:block">
                <span className="block text-xs font-semibold">{user?.name ?? currentUser.name}</span>
                <span className="block text-[10px] text-muted-foreground">{user?.role ?? currentUser.role}</span>
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel>Switch active role</DropdownMenuLabel>
            <DropdownMenuRadioGroup value={currentUser.role} onValueChange={setRole}>
              {AVAILABLE_ROLES.map((r) => (
                <DropdownMenuRadioItem key={r.role} value={r.role}>
                  <span className="flex flex-col">
                    <span className="text-sm">{r.role}</span>
                    <span className="text-[11px] text-muted-foreground">{r.name}</span>
                  </span>
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 text-xs">
              <ShieldCheck className="size-3.5" /> Authorisation profile: WMS_LIFECYCLE_ALL
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 text-destructive" onSelect={logout}>
              <LogOut className="size-3.5" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full surface-mesh">
      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar/80 backdrop-blur-xl transition-all lg:flex",
          collapsed ? "w-[68px]" : "w-64",
        )}
      >
        <BrandMark compact={collapsed} />
        <SidebarNav compact={collapsed} />
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className="flex items-center gap-2 border-t border-sidebar-border px-4 py-3 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          {collapsed ? (
            <PanelLeftOpen className="size-4" />
          ) : (
            <>
              <PanelLeftClose className="size-4" /> Collapse navigation
            </>
          )}
        </button>
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger className="hidden" />
        <SheetContent side="left" className="w-72 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <div className="flex h-full flex-col">
            <BrandMark />
            <SidebarNav onNavigate={() => setMobileOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <Header onOpenMobile={() => setMobileOpen(true)} />
        <main className="min-w-0 flex-1 px-3 pb-16 pt-4 sm:px-5 lg:px-7">{children}</main>
      </div>
    </div>
  );
}
