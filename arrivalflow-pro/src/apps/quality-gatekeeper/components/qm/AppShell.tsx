import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  ListChecks,
  FlaskConical,
  ShieldAlert,
  FileWarning,
  Lock,
  Undo2,
  Wrench,
  Trash2,
  BarChart3,
  ScrollText,
  Settings,
  Bell,
  Search,
  Warehouse,
  Sun,
  Moon,
  Languages,
  ChevronDown,
  PackageCheck,
  History,
  Menu,
  X,
} from "lucide-react";
import { useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { StatusPill } from "@/apps/quality-gatekeeper/components/qm/StatusPill";
import { notifications, warehouses } from "@/apps/quality-gatekeeper/lib/qm-data";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";

const nav = [
  {
    group: "Operations",
    items: [
      { to: "/quality-gatekeeper", label: "Dashboard", icon: LayoutDashboard, exact: true },
      { to: "/quality-gatekeeper/queue", label: "Inspection Queue", icon: ListChecks, badge: "12" },
      { to: "/quality-gatekeeper/sampling", label: "Sampling", icon: FlaskConical },
      { to: "/quality-gatekeeper/damage", label: "Damage Reports", icon: ShieldAlert },
    ],
  },
  {
    group: "Non-Conformance",
    items: [
      { to: "/quality-gatekeeper/ncr", label: "NCR", icon: FileWarning, badge: "4" },
      { to: "/quality-gatekeeper/hold", label: "Quality Hold", icon: Lock, badge: "3" },
      { to: "/quality-gatekeeper/rts", label: "Return To Supplier", icon: Undo2 },
      { to: "/quality-gatekeeper/rework", label: "Rework", icon: Wrench },
      { to: "/quality-gatekeeper/scrap", label: "Scrap", icon: Trash2 },
    ],
  },
  {
    group: "Inventory & Insight",
    items: [
      { to: "/quality-gatekeeper/release", label: "Inventory Release", icon: PackageCheck },
      { to: "/quality-gatekeeper/history", label: "Inspection History", icon: History },
      { to: "/quality-gatekeeper/reports", label: "Reports", icon: BarChart3 },
      { to: "/quality-gatekeeper/audit", label: "Audit Trail", icon: ScrollText },
      { to: "/quality-gatekeeper/settings", label: "Settings", icon: Settings },
    ],
  },
];

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="flex flex-col gap-5 px-3 py-4">
      {nav.map((section) => (
        <div key={section.group}>
          <p className="px-3 pb-2 text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            {section.group}
          </p>
          <ul className="space-y-0.5">
            {section.items.map((item) => {
              const active = item.exact
                ? path === item.to || path === `${item.to}/`
                : path.startsWith(item.to);
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    onClick={onNavigate}
                    className={cn(
                      "group grid min-h-10 grid-cols-[20px_minmax(0,1fr)_auto] items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-[inset_2px_0_0_0_var(--sidebar-primary)]"
                        : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                    )}
                  >
                    <span className="grid h-5 w-5 place-items-center">
                      <item.icon className={cn("h-4 w-4", active && "text-primary")} />
                    </span>
                    <span className="min-w-0 flex-1 truncate">{item.label}</span>
                    {"badge" in item && item.badge ? (
                      <span className="num rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                        {item.badge}
                      </span>
                    ) : (
                      <span aria-hidden="true" />
                    )}
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

function Brand() {
  return (
    <Link to="/quality-gatekeeper" className="flex h-16 items-center gap-3 px-5">
      <div className="brand-gradient grid h-9 w-9 shrink-0 place-items-center rounded-xl text-primary-foreground shadow-sm">
        <ShieldAlert className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold tracking-tight">Axiom WMS</p>
        <p className="truncate text-[11px] text-muted-foreground">Quality Inspection Â· M05</p>
      </div>
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [mobileNav, setMobileNav] = useState(false);
  const [dark, setDark] = useState(false);
  const [wh, setWh] = useState(warehouses[0]!);
  const unread = notifications.filter((n) => n.unread).length;
  const { user, logout } = useAuth();
  const initials =
    user?.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "AS";

  const toggleTheme = () => {
    setDark((d) => {
      const next = !d;
      if (typeof document !== "undefined") document.documentElement.classList.toggle("dark", next);
      return next;
    });
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside className="sticky top-0 hidden h-screen w-[264px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        <Brand />
        <Separator />
        <div className="min-h-0 flex-1 overflow-y-auto">
          <NavList />
        </div>
        <div className="border-t border-sidebar-border p-3">
          <div className="surface-card rounded-xl p-3">
            <p className="text-xs font-semibold">Module 05 progress</p>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div className="brand-gradient h-full w-[72%] rounded-full" />
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">72% of today's lots cleared</p>
          </div>
        </div>
      </aside>

      <Sheet open={mobileNav} onOpenChange={setMobileNav}>
        <SheetContent side="left" className="w-[280px] bg-sidebar p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <Brand />
          <Separator />
          <div className="overflow-y-auto pb-8">
            <NavList onNavigate={() => setMobileNav(false)} />
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="glass-panel sticky top-0 z-30 flex h-16 items-center rounded-none border-x-0 border-t-0 px-3 sm:px-5">
          <div className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileNav(true)}
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="relative hidden min-w-0 md:block md:pr-4 xl:pr-8">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search inspection, GRN, PO, NCR, materialâ€¦"
                className="h-10 w-full rounded-xl bg-background/70 pr-4 pl-9"
              />
            </div>
            <div className="md:hidden" />
            <div className="flex h-10 items-center justify-end gap-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="hidden h-9 gap-2 rounded-xl px-2.5 text-xs sm:flex"
                  >
                    <Warehouse className="h-4 w-4 text-primary" />
                    <span className="max-w-[140px] truncate">{wh}</span>
                    <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Warehouse context</DropdownMenuLabel>
                  {warehouses.map((w) => (
                    <DropdownMenuItem key={w} onClick={() => setWh(w)}>
                      {w}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative rounded-xl"
                    aria-label="Notifications"
                  >
                    <Bell className="h-[18px] w-[18px]" />
                    {unread > 0 && (
                      <span className="num absolute top-1 right-1 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[9px] font-bold text-destructive-foreground">
                        {unread}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[320px]">
                  <DropdownMenuLabel className="flex items-center justify-between">
                    Notifications <StatusPill tone="brand">{unread} new</StatusPill>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {notifications.slice(0, 4).map((n) => (
                    <DropdownMenuItem key={n.id} asChild>
                      <Link
                        to="/quality-gatekeeper/notifications"
                        className="flex flex-col items-start gap-0.5 py-2"
                      >
                        <span className="text-xs font-semibold">{n.title}</span>
                        <span className="line-clamp-1 text-[11px] text-muted-foreground">
                          {n.body}
                        </span>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link
                      to="/quality-gatekeeper/notifications"
                      className="justify-center text-xs font-medium text-primary"
                    >
                      View all notifications
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="ghost"
                size="icon"
                className="rounded-xl"
                onClick={toggleTheme}
                aria-label="Toggle theme"
              >
                {dark ? (
                  <Sun className="h-[18px] w-[18px]" />
                ) : (
                  <Moon className="h-[18px] w-[18px]" />
                )}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hidden rounded-xl sm:inline-flex"
                    aria-label="Language"
                  >
                    <Languages className="h-[18px] w-[18px]" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Language</DropdownMenuLabel>
                  <DropdownMenuItem>English (UK)</DropdownMenuItem>
                  <DropdownMenuItem>Ø§Ù„Ø¹Ø±Ø¨ÙŠØ©</DropdownMenuItem>
                  <DropdownMenuItem>Deutsch</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-9 gap-2 rounded-xl pr-2 pl-1.5">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-primary/12 text-[11px] font-bold text-primary">
                      {initials}
                    </span>
                    <span className="hidden text-left leading-tight xl:block">
                      <span className="block text-xs font-semibold">
                        {user?.name ?? "A. Sharma"}
                      </span>
                      <span className="block text-[10px] text-muted-foreground">
                        {user?.role ?? "Quality Inspection"}
                      </span>
                    </span>
                    <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>{user?.email ?? "quality@nexuswms.com"}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/quality-gatekeeper/settings">Preferences</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive" onClick={logout}>
                    <X className="mr-2 h-3.5 w-3.5" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="min-w-0 flex-1 px-3 py-5 sm:px-6 sm:py-6">{children}</main>
      </div>
    </div>
  );
}
