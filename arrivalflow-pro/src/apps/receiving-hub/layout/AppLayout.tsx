import { useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  Boxes,
  CircleHelp,
  ClipboardList,
  FileWarning,
  Gauge,
  LayoutDashboard,
  Microscope,
  PackagePlus,
  PanelLeft,
  Search,
  ShoppingCart,
  Truck,
  Warehouse as WarehouseIcon,
  LogOut,
} from "lucide-react";
import type { ReactNode } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useWms } from "@/apps/receiving-hub/context/WmsContext";
import { warehouses } from "@/apps/receiving-hub/data";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";

const NAV = [
  {
    group: "Receiving",
    items: [
      { to: "/receiving-hub/", label: "Dashboard", icon: LayoutDashboard, exact: true },
      { to: "/receiving-hub/purchase-orders", label: "Purchase Orders", icon: ShoppingCart },
      { to: "/receiving-hub/grn", label: "Goods Receipts", icon: ClipboardList },
      { to: "/receiving-hub/non-po-receipt", label: "Non-PO Receipt", icon: PackagePlus },
    ],
  },
  {
    group: "Quality & Flow",
    items: [
      { to: "/receiving-hub/discrepancies", label: "Discrepancies", icon: FileWarning },
      { to: "/receiving-hub/quality-inspection", label: "Quality Inspection", icon: Microscope },
      { to: "/receiving-hub/put-away", label: "Put-away", icon: Boxes },
    ],
  },
  {
    group: "Insights",
    items: [{ to: "/receiving-hub/kpi/dock-to-stock", label: "Dock-to-Stock KPI", icon: Gauge }],
  },
];

function SidebarContent({ collapsed }: { collapsed: boolean }) {
  const { user } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname.startsWith(to);

  return (
    <div className="flex h-full flex-col bg-sidebar">
      <div
        className={cn(
          "flex h-[60px] items-center gap-2.5 border-b border-sidebar-border px-4",
          collapsed && "justify-center px-0",
        )}
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
          <Truck className="h-4 w-4 text-primary-foreground" strokeWidth={2} />
        </span>
        {!collapsed && (
          <div className="leading-tight">
            <p className="text-[15px] font-semibold tracking-tight">NexusWMS</p>
            <p className="text-[11px] text-muted-foreground">Document Management & OCR</p>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {NAV.map((g) => (
          <div key={g.group} className="mb-5">
            {!collapsed && <p className="label-xs mb-2 px-2">{g.group}</p>}
            <ul className="space-y-0.5">
              {g.items.map((item) => {
                const active = isActive(item.to, item.exact);
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      title={item.label}
                      className={cn(
                        "flex h-[38px] items-center gap-2.5 rounded-lg px-2.5 text-sm transition-colors",
                        collapsed && "justify-center px-0",
                        active
                          ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                          : "text-sidebar-foreground hover:bg-surface-muted",
                      )}
                    >
                      <item.icon
                        className={cn(
                          "h-4 w-4 shrink-0",
                          active ? "text-primary" : "text-muted-foreground",
                        )}
                        strokeWidth={1.75}
                      />
                      {!collapsed && <span>{item.label}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <div
          className={cn(
            "flex items-center gap-2.5 rounded-lg px-2 py-2",
            collapsed && "justify-center px-0",
          )}
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary-subtle text-xs font-semibold text-primary">
              AM
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="leading-tight">
              <p className="text-[13px] font-medium">{user?.name ?? "A. Mehta"}</p>
              <p className="text-[11px] text-muted-foreground">
                {user?.role ?? "Goods Receiving"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function AppLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { activeWarehouse, setActiveWarehouse } = useWms();
  const wh = warehouses.find((w) => w.id === activeWarehouse)!;

  return (
    <div className="min-h-screen bg-background">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden border-r border-sidebar-border lg:block",
          collapsed ? "w-[68px]" : "w-[260px]",
        )}
      >
        <SidebarContent collapsed={collapsed} />
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[260px] p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarContent collapsed={false} />
        </SheetContent>
      </Sheet>

      <div
        className={cn(
          "flex min-h-screen flex-col transition-[padding]",
          collapsed ? "lg:pl-[68px]" : "lg:pl-[260px]",
        )}
      >
        <header className="sticky top-0 z-20 flex h-[60px] items-center gap-3 border-b border-border bg-card px-4 md:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={() => {
              if (window.innerWidth < 1024) setMobileOpen(true);
              else setCollapsed((c) => !c);
            }}
          >
            <PanelLeft className="h-4 w-4" strokeWidth={1.75} />
          </Button>

          <div className="relative hidden max-w-96 flex-1 md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-9 pl-9"
              placeholder="Search PO, GRN, supplier, item…"
            />
          </div>

          <div className="ml-auto flex items-center gap-1.5">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="hidden h-9 gap-2 text-[13px] font-normal sm:flex"
                >
                  <WarehouseIcon className="h-4 w-4 text-muted-foreground" />
                  {wh.id} · {wh.name}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Active warehouse</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {warehouses.map((w) => (
                  <DropdownMenuItem
                    key={w.id}
                    onClick={() => setActiveWarehouse(w.id)}
                  >
                    {w.id} · {w.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="icon" className="relative h-9 w-9">
              <Bell className="h-4 w-4" strokeWidth={1.75} />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-danger" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <CircleHelp className="h-4 w-4" strokeWidth={1.75} />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="ml-1 rounded-full outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-ring">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary-subtle text-xs font-semibold text-primary">
                      AM
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user?.name ?? "A. Mehta"}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>My profile</DropdownMenuItem>
                <DropdownMenuItem>Preferences</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => { logout(); navigate({ to: "/login" }); }}>
                  <LogOut className="mr-2 size-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
