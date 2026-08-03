import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  FileText,
  FilePlus2,
  ClipboardCheck,
  Layers,
  ListChecks,
  ScanBarcode,
  PackageCheck,
  Undo2,
  SearchCheck,
  BarChart3,
  Bell,
  History,
  Settings,
  Menu,
  Search,
  Warehouse,
  Moon,
  Sun,
  LogOut,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";

const nav = [
  {
    group: "Operations",
    items: [
      { to: "/warehouse-flow/", label: "Dashboard", icon: LayoutDashboard },
      { to: "/warehouse-flow/requests", label: "Material Requests", icon: FileText },
      { to: "/warehouse-flow/requests/new", label: "Create Request", icon: FilePlus2 },
      { to: "/warehouse-flow/approvals", label: "Approval Workflow", icon: ClipboardCheck },
      { to: "/warehouse-flow/reservations", label: "Inventory Reservation", icon: Layers },
    ],
  },
  {
    group: "Fulfilment",
    items: [
      { to: "/warehouse-flow/pick-lists", label: "Pick Lists", icon: ListChecks },
      { to: "/warehouse-flow/picking", label: "Warehouse Picking", icon: ScanBarcode },
      { to: "/warehouse-flow/issue", label: "Material Issue", icon: PackageCheck },
    ],
  },
  {
    group: "Reverse Logistics",
    items: [
      { to: "/warehouse-flow/returns", label: "Material Returns", icon: Undo2 },
      { to: "/warehouse-flow/inspection", label: "Return Inspection", icon: SearchCheck },
    ],
  },
  {
    group: "Insights & Admin",
    items: [
      { to: "/warehouse-flow/reports", label: "Reports", icon: BarChart3 },
      { to: "/warehouse-flow/notifications", label: "Notifications", icon: Bell },
      { to: "/warehouse-flow/audit-logs", label: "Audit Logs", icon: History },
      { to: "/warehouse-flow/settings", label: "Settings", icon: Settings },
    ],
  },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-3 border-b border-sidebar-border px-5 py-4">
        <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
          <Warehouse className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate font-display text-sm font-semibold text-sidebar-accent-foreground">
            WMS Console
          </p>
          <p className="truncate text-[10px] uppercase tracking-[0.14em] opacity-70">
            Material Request &amp; Issue
          </p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {nav.map((section) => (
          <div key={section.group} className="mb-5">
            <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.16em] opacity-55">
              {section.group}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active =
                  item.to === "/warehouse-flow/" ? pathname === "/warehouse-flow/" : pathname === item.to;
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      onClick={onNavigate}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                        active
                          ? "bg-sidebar-accent font-semibold text-sidebar-accent-foreground shadow-[inset_3px_0_0_0_var(--color-sidebar-primary)]"
                          : "hover:bg-sidebar-accent/60",
                      )}
                    >
                      <item.icon className="size-4 shrink-0 opacity-90" />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-sidebar-border px-5 py-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-success" />
          <span className="opacity-80">All services operational</span>
        </div>
        <p className="num mt-1 text-[10px] opacity-55">build 2026.07.31 · v4.2.1</p>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 lg:block">
        <SidebarContent />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-border bg-card/85 backdrop-blur">
          <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:px-6">
            <div className="flex items-center gap-2 lg:hidden">
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Open navigation">
                    <Menu className="size-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 p-0">
                  <SheetTitle className="sr-only">Navigation</SheetTitle>
                  <SidebarContent onNavigate={() => setOpen(false)} />
                </SheetContent>
              </Sheet>
            </div>
            <div className="hidden lg:block" />

            <div className="relative min-w-0">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search requests, materials, bins..."
                className="h-10 w-full max-w-xl rounded-lg pl-9"
              />
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Toggle theme"
                onClick={() => setDark((d) => !d)}
              >
                {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
              </Button>
              <Link to="/warehouse-flow/notifications" aria-label="Notifications">
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="size-4" />
                  <span className="absolute right-2 top-2 size-2 rounded-full bg-destructive" />
                </Button>
              </Link>
              <div className="ml-1 hidden items-center gap-2 border-l border-border pl-3 sm:flex">
                <Avatar className="size-8">
                  <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                    AS
                  </AvatarFallback>
                </Avatar>
                <div className="leading-tight">
                  <p className="text-sm font-semibold">{user?.name ?? "Anjali Sharma"}</p>
                  <p className="text-[11px] text-muted-foreground">{user?.role ?? "Warehouse Executive / Department Manager"}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Logout"
                onClick={() => {
                  logout();
                  navigate({ to: "/login" });
                }}
              >
                <LogOut className="size-4" />
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>

        <footer className="border-t border-border px-6 py-4 text-xs text-muted-foreground">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span>Asset Management System · Material Request, Issue &amp; Returns</span>
            <Badge variant="outline" className="num">
              Environment: UAT
            </Badge>
          </div>
        </footer>
      </div>
    </div>
  );
}
