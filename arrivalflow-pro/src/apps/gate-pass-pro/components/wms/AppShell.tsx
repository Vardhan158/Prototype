import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, ClipboardList, Columns3, CalendarClock, ShieldQuestion, BellRing,
  LogOut, BarChart3, ScrollText, Settings, Truck, Search, Bell, Globe, Moon, Sun,
  Menu, ChevronDown, PackageCheck,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { notifications } from "@/apps/gate-pass-pro/lib/wms-data";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/gate-pass-pro/gate-entry", label: "Gate Entry", icon: ClipboardList },
  { to: "/gate-pass-pro/queue", label: "Vehicle Queue", icon: Columns3 },
  { to: "/gate-pass-pro/appointments", label: "Appointments", icon: CalendarClock },
  { to: "/gate-pass-pro/pending-approval", label: "Pending Approval", icon: ShieldQuestion, badge: "3" },
  { to: "/gate-pass-pro/arrival-notifications", label: "Arrival Notifications", icon: BellRing },
  { to: "/gate-pass-pro/vehicle-exit", label: "Vehicle Exit", icon: LogOut },
  { to: "/gate-pass-pro/reports", label: "Reports", icon: BarChart3 },
  { to: "/gate-pass-pro/audit", label: "Audit Logs", icon: ScrollText },
  { to: "/gate-pass-pro/settings", label: "Settings", icon: Settings },
];

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="flex flex-col gap-1 p-3">
      <p className="px-3 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        Gate Operations
      </p>
      {nav.map((item) => {
        const active = path === item.to || path.startsWith(item.to + "/");
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
            )}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            <span className="flex-1 truncate">{item.label}</span>
            {item.badge && (
              <Badge className="h-5 rounded-full bg-warning px-1.5 text-[10px] text-warning-foreground">
                {item.badge}
              </Badge>
            )}
          </Link>
        );
      })}
      <p className="px-3 pb-2 pt-5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        Next Module
      </p>
      <Link
        to="/gate-pass-pro/receiving"
        onClick={onNavigate}
        className="flex items-center gap-3 rounded-lg border border-dashed border-secondary/50 px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary/10"
      >
        <PackageCheck className="h-4 w-4 text-secondary" />
        Goods Receiving &amp; GRN
      </Link>
    </nav>
  );
}

function Brand() {
  return (
    <Link to="/dashboard" className="flex items-center gap-3 border-b border-sidebar-border px-5 py-4">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-card">
        <Truck className="h-5 w-5" />
      </span>
      <span className="leading-tight">
        <span className="block text-sm font-semibold tracking-tight">NexusWMS</span>
        <span className="block text-[11px] text-muted-foreground">Gate &amp; Arrival Control</span>
      </span>
    </Link>
  );
}

export function AppShell({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const [dark, setDark] = useState(false);
  const [lang, setLang] = useState("EN");
  const unread = notifications.filter((n) => !n.read).length;
  const { user, logout } = useAuth();

  const toggleTheme = () => {
    setDark((d) => {
      const next = !d;
      if (typeof document !== "undefined") document.documentElement.classList.toggle("dark", next);
      return next;
    });
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        <Brand />
        <div className="flex-1 overflow-y-auto">
          <NavList />
        </div>
        <div className="border-t border-sidebar-border p-3 text-[11px] text-muted-foreground">
          Gate 01 · Bhiwandi DC · v3.4.1
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 glass-panel flex h-16 items-center gap-3 px-4 lg:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 bg-sidebar p-0">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <Brand />
              <NavList />
            </SheetContent>
          </Sheet>

          <div className="relative hidden max-w-md flex-1 md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search truck no, gate entry, PO, driver, vendor…"
              className="h-9 rounded-lg pl-9"
            />
          </div>

          <div className="ml-auto flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1 px-2">
                  <Globe className="h-4 w-4" />
                  <span className="text-xs font-semibold">{lang}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {["EN", "HI", "AR", "DE"].map((l) => (
                  <DropdownMenuItem key={l} onClick={() => setLang(l)}>
                    {l === "EN" ? "English" : l === "HI" ? "हिन्दी" : l === "AR" ? "العربية" : "Deutsch"}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="icon" asChild aria-label="Notifications">
              <Link to="/gate-pass-pro/notifications" className="relative">
                <Bell className="h-4 w-4" />
                {unread > 0 && (
                  <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[9px] font-bold text-destructive-foreground">
                    {unread}
                  </span>
                )}
              </Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 pl-1 pr-2">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-primary text-[11px] text-primary-foreground">NA</AvatarFallback>
                  </Avatar>
                  <span className="hidden text-left leading-tight sm:block">
                    <span className="block text-xs font-semibold">Administrator</span>
                    <span className="block text-[10px] text-muted-foreground">admin@nexuswms.com</span>
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuLabel>
                  <span className="block text-sm">Administrator</span>
                  <span className="block text-xs font-normal text-muted-foreground">{user?.email ?? "admin@nexuswms.com"}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={logout} className="text-destructive">
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 lg:px-8">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
              {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
            </div>
            {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
