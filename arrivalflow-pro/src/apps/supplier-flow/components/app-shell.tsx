import { Link, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  Boxes,
  ChevronDown,
  ClipboardCheck,
  FileBarChart,
  Gauge,
  Globe,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Sun,
  Truck,
  Users,
  UserCog,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { notifications, purchaseOrders, suppliers, asns } from "@/apps/supplier-flow/data/procurement";
import { StatusBadge } from "@/apps/supplier-flow/components/status-badge";
import { useAuth } from "@/lib/auth";

const nav = [
  { group: "Overview", items: [{ label: "Dashboard", to: "/supplier-flow", icon: LayoutDashboard }] },
  {
    group: "Procurement",
    items: [
      { label: "Supplier Master", to: "/supplier-flow/suppliers", icon: Users },
      { label: "Purchase Orders", to: "/supplier-flow/purchase-orders", icon: ShoppingCart },
      { label: "ASN", to: "/supplier-flow/asn", icon: Truck },
      { label: "Approvals", to: "/supplier-flow/approvals", icon: ClipboardCheck },
      { label: "Vendor Performance", to: "/supplier-flow/vendor-performance", icon: Gauge },
    ],
  },
  {
    group: "Insights",
    items: [
      { label: "Reports", to: "/supplier-flow/reports", icon: FileBarChart },
      { label: "Settings", to: "/supplier-flow/settings", icon: Settings },
    ],
  },
];

const roles = [
  "Procurement Manager",
  "Purchase Manager",
  "Vendor Manager",
  "Warehouse Manager",
  "Finance Controller",
  "Approver",
  "Administrator",
];

function useDark() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);
  return { dark, setDark };
}

function NavList({ onNavigate, collapsed }: { onNavigate?: () => void; collapsed?: boolean }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="space-y-5 px-3 py-4">
      {nav.map((section) => (
        <div key={section.group}>
          {!collapsed && (
            <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {section.group}
            </p>
          )}
          <ul className="space-y-0.5">
            {section.items.map((item) => {
              const active =
                item.to === "/supplier-flow"
                  ? pathname === "/supplier-flow" || pathname === "/supplier-flow/"
                  : pathname.startsWith(item.to);
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    onClick={onNavigate}
                    title={item.label}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
                      collapsed && "justify-center px-0",
                      active
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                    )}
                  >
                    <item.icon className={cn("size-4.5 shrink-0", active && "text-primary")} />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function Brand({ collapsed }: { collapsed?: boolean }) {
  return (
    <div className={cn("flex h-14 items-center gap-2.5 border-b px-4", collapsed && "justify-center px-0")}>
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Boxes className="size-4.5" />
      </span>
      {!collapsed && (
        <div className="min-w-0 leading-tight">
          <p className="truncate text-sm font-semibold tracking-tight">AxisWMS</p>
          <p className="truncate text-[11px] text-muted-foreground">Procurement Suite</p>
        </div>
      )}
    </div>
  );
}

function GlobalSearch({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [q, setQ] = useState("");
  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    const all = [
      ...suppliers.map((s) => ({ id: s.id, title: s.name, sub: `${s.code} · ${s.category}`, to: `/suppliers/${s.id}`, kind: "Supplier", status: s.status })),
      ...purchaseOrders.map((p) => ({ id: p.id, title: p.id, sub: `${p.supplier} · ${p.warehouse.split(" · ")[0]}`, to: `/purchase-orders/${p.id}`, kind: "Purchase Order", status: p.status })),
      ...asns.map((a) => ({ id: a.id, title: a.id, sub: `${a.supplier} · ${a.vehicleNo}`, to: `/asn/${a.id}`, kind: "ASN", status: a.status })),
    ];
    if (!term) return all.slice(0, 8);
    return all.filter((r) => `${r.title} ${r.sub} ${r.id}`.toLowerCase().includes(term)).slice(0, 12);
  }, [q]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl gap-0 overflow-hidden p-0">
        <div className="flex items-center gap-2 border-b px-4">
          <Search className="size-4 text-muted-foreground" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search suppliers, purchase orders, ASNs, invoices…"
            className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <kbd className="hidden rounded border px-1.5 py-0.5 text-[10px] text-muted-foreground sm:block">ESC</kbd>
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          {results.length === 0 ? (
            <p className="px-3 py-10 text-center text-sm text-muted-foreground">No records matched “{q}”.</p>
          ) : (
            results.map((r) => (
              <Link
                key={r.kind + r.id}
                to={r.to as never}
                onClick={() => onOpenChange(false)}
                className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 hover:bg-accent"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{r.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {r.kind} · {r.sub}
                  </p>
                </div>
                <StatusBadge status={r.status} dot={false} />
              </Link>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [lang, setLang] = useState("en-IN");
  const [role, setRole] = useState<string>(roles[0]!);
  const { dark, setDark } = useDark();
  const { user, logout } = useAuth();

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 border-r bg-sidebar transition-all duration-200 lg:block",
          collapsed ? "w-16" : "w-64",
        )}
      >
        <Brand collapsed={collapsed} />
        <div className="h-[calc(100vh-3.5rem-3.25rem)] overflow-y-auto">
          <NavList collapsed={collapsed} />
        </div>
        <div className="flex h-13 items-center border-t px-3 py-2.5">
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2" onClick={() => setCollapsed((c) => !c)}>
            {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
            {!collapsed && <span className="text-xs">Collapse</span>}
          </Button>
        </div>
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 bg-sidebar p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <Brand />
          <NavList onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="glass-panel sticky top-0 z-30 flex h-14 items-center gap-2 px-3 sm:px-4">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)}>
            <Menu className="size-5" />
          </Button>

          <button
            onClick={() => setSearchOpen(true)}
            className="flex h-9 flex-1 items-center gap-2 rounded-lg border bg-background/70 px-3 text-sm text-muted-foreground transition-colors hover:border-primary/40 md:max-w-md"
          >
            <Search className="size-4" />
            <span className="truncate">Search suppliers, POs, ASNs…</span>
            <kbd className="ml-auto hidden rounded border px-1.5 py-0.5 text-[10px] md:block">⌘K</kbd>
          </button>

          <div className="ml-auto flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="hidden sm:inline-flex" aria-label="Language">
                  <Globe className="size-4.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuLabel>Language</DropdownMenuLabel>
                <DropdownMenuRadioGroup value={lang} onValueChange={setLang}>
                  <DropdownMenuRadioItem value="en-IN">English (India)</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="en-US">English (US)</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="de-DE">Deutsch</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="zh-CN">中文 (简体)</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="icon" aria-label="Toggle theme" onClick={() => setDark(!dark)}>
              {dark ? <Sun className="size-4.5" /> : <Moon className="size-4.5" />}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
                  <Bell className="size-4.5" />
                  <span className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[9px] font-semibold text-destructive-foreground">
                    6
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-84 p-0">
                <div className="flex items-center justify-between border-b px-3 py-2.5">
                  <p className="text-sm font-semibold">Notifications</p>
                  <span className="text-xs text-muted-foreground">6 unread</span>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((n) => (
                    <Link key={n.id} to={n.link as never} className="flex gap-3 border-b px-3 py-3 last:border-0 hover:bg-accent">
                      <span
                        className={cn(
                          "mt-1.5 size-2 shrink-0 rounded-full",
                          n.type === "success" && "bg-success",
                          n.type === "warning" && "bg-warning",
                          n.type === "danger" && "bg-destructive",
                          n.type === "info" && "bg-primary",
                        )}
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{n.title}</p>
                        <p className="text-xs text-muted-foreground">{n.body}</p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">{n.time}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="ml-1 flex items-center gap-2 rounded-lg py-1 pl-1 pr-2 hover:bg-accent">
                  <span className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                    {(user?.name ?? "Ananya Gupta").split(" ").map((part) => part[0]).join("").slice(0, 2)}
                  </span>
                  <span className="hidden text-left leading-tight xl:block">
                    <span className="block text-xs font-semibold">{user?.name ?? "Ananya Gupta"}</span>
                    <span className="block text-[11px] text-muted-foreground">{user?.role ?? role}</span>
                  </span>
                  <ChevronDown className="hidden size-3.5 text-muted-foreground xl:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuLabel className="font-normal">
                  <p className="text-sm font-semibold">{user?.name ?? "Ananya Gupta"}</p>
                  <p className="text-xs text-muted-foreground">{user?.email ?? "supplier@nexuswms.com"}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs text-muted-foreground">Switch role</DropdownMenuLabel>
                <DropdownMenuRadioGroup value={role} onValueChange={setRole}>
                  {roles.map((r) => (
                    <DropdownMenuRadioItem key={r} value={r} className="text-sm">
                      {r}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/supplier-flow/settings">
                    <UserCog className="size-4" /> Preferences
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/supplier-flow/settings">
                    <ShieldCheck className="size-4" /> Security & audit
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive" onSelect={logout}>
                  <LogOut className="size-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="min-w-0 flex-1 px-3 py-4 sm:px-5 sm:py-6">{children}</main>
      </div>

      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
      <span className="hidden">
        <X />
      </span>
    </div>
  );
}
