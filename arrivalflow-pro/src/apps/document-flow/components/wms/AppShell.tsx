import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  DoorOpen,
  PackageCheck,
  FileStack,
  ScanText,
  Boxes,
  Wrench,
  Building2,
  FileBarChart,
  LineChart,
  Settings,
  Search,
  Bell,
  Moon,
  Sun,
  Languages,
  ChevronDown,
  Menu,
  Warehouse,
  LogOut,
  UserRound,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { notifications } from "@/apps/document-flow/wms-data";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuth } from "@/lib/auth";

const nav = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/document-flow", match: "/document-flow" },
  { label: "Gate Entry", icon: DoorOpen, to: "/document-flow", match: null },
  { label: "Receiving", icon: PackageCheck, to: "/document-flow", match: null },
  { label: "Document Management", icon: FileStack, to: "/document-flow/documents", match: "/document-flow/documents" },
  { label: "OCR Processing", icon: ScanText, to: "/document-flow/ocr", match: "/document-flow/ocr" },
  { label: "Inventory", icon: Boxes, to: "/document-flow", match: null },
  { label: "Assets", icon: Wrench, to: "/document-flow", match: null },
  { label: "Vendors", icon: Building2, to: "/document-flow", match: null },
  { label: "Reports", icon: FileBarChart, to: "/document-flow", match: null },
  { label: "Analytics", icon: LineChart, to: "/document-flow", match: null },
  { label: "Settings", icon: Settings, to: "/document-flow", match: null },
];

const toneDot: Record<string, string> = {
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-destructive",
  primary: "bg-primary",
};

export function AppShell({
  children,
  title,
  subtitle,
  breadcrumb,
  actions,
}: {
  children: ReactNode;
  title: string;
  subtitle?: string;
  breadcrumb?: { label: string; to?: string }[];
  actions?: ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [dark, setDark] = useState(false);
  const { user, logout } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-300 lg:flex",
          collapsed ? "w-[76px]" : "w-[268px]",
        )}
      >
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-4">
          <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Warehouse className="size-5" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">Axion WMS</p>
              <p className="truncate text-[11px] text-muted-foreground">Enterprise Suite 12.4</p>
            </div>
          )}
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {nav.map((item) => {
            const active = item.match !== null && pathname.startsWith(item.match);
            return (
              <Link
                key={item.label}
                to={item.to}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/60",
                )}
              >
                <item.icon
                  className={cn("size-[18px] shrink-0", active && "text-sidebar-primary")}
                />
                {!collapsed && <span className="truncate">{item.label}</span>}
                {!collapsed && active && (
                  <span className="ml-auto h-5 w-1 rounded-full bg-sidebar-primary" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border p-3">
          <div
            className={cn(
              "rounded-xl bg-primary-soft p-3",
              collapsed && "flex justify-center p-2",
            )}
          >
            <ShieldCheck className="size-5 text-primary" />
            {!collapsed && (
              <>
                <p className="mt-2 text-xs font-semibold text-primary">OCR Engine v4.2</p>
                <p className="text-[11px] text-muted-foreground">
                  97.3% accuracy · 412 docs in queue
                </p>
              </>
            )}
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b glass px-4 lg:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={() => setCollapsed((c) => !c)}
          >
            <Menu className="size-5" />
          </Button>

          <div className="relative hidden max-w-md flex-1 md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search documents, PO, ASN, vendor, vehicle…"
              className="h-10 rounded-xl pl-9"
            />
          </div>

          <div className="ml-auto flex items-center gap-1">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="size-5" />
                  <span className="absolute right-2 top-2 size-2 rounded-full bg-destructive" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-88 rounded-2xl p-0">
                <div className="border-b px-4 py-3 text-sm font-semibold">Notifications</div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((n) => (
                    <div key={n.title + n.time} className="flex gap-3 border-b px-4 py-3 last:border-0">
                      <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", toneDot[n.tone])} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{n.title}</p>
                        <p className="text-xs text-muted-foreground">{n.body}</p>
                        <p className="mt-1 text-[11px] text-muted-foreground">{n.time} ago</p>
                      </div>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            <Button variant="ghost" size="icon" onClick={() => setDark((d) => !d)}>
              {dark ? <Sun className="size-5" /> : <Moon className="size-5" />}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-1.5 px-2">
                  <Languages className="size-5" />
                  <span className="hidden text-xs font-medium sm:inline">EN</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl">
                <DropdownMenuItem>English (India)</DropdownMenuItem>
                <DropdownMenuItem>हिन्दी</DropdownMenuItem>
                <DropdownMenuItem>Deutsch</DropdownMenuItem>
                <DropdownMenuItem>العربية</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="ml-1 gap-2 rounded-xl px-2">
                  <span className="grid size-8 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                    {user?.name.split(" ").map((part) => part[0]).join("").slice(0, 2) ?? "RD"}
                  </span>
                  <span className="hidden text-left leading-tight sm:block">
                    <span className="block text-xs font-semibold">{user?.name ?? "R. Deshmukh"}</span>
                    <span className="block text-[11px] text-muted-foreground">{user?.role ?? "Document Controller"}</span>
                  </span>
                  <ChevronDown className="size-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl">
                <DropdownMenuLabel>EMP-2041 · WH-01 Bhiwandi</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <UserRound className="mr-2 size-4" /> My profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 size-4" /> Preferences
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={logout}>
                  <LogOut className="mr-2 size-4" /> Sign out
                </DropdownMenuItem>

              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <div className="border-b bg-card/60 px-4 py-5 lg:px-8">
          {breadcrumb && (
            <div className="mb-1.5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
              {breadcrumb.map((b, i) => (
                <span key={b.label} className="flex items-center gap-1.5">
                  {b.to ? (
                    <Link to={b.to} className="hover:text-primary">
                      {b.label}
                    </Link>
                  ) : (
                    <span className="text-foreground">{b.label}</span>
                  )}
                  {i < breadcrumb.length - 1 && <span>/</span>}
                </span>
              ))}
            </div>
          )}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-xl font-semibold tracking-tight lg:text-2xl">{title}</h1>
              {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
            </div>
            {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
          </div>
        </div>

        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
