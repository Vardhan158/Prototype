import { Link, useRouterState } from "@tanstack/react-router";
import { Box, ChevronLeft } from "lucide-react";
import {
  LayoutDashboard,
  ShoppingCart,
  FileText,
  Truck,
  CheckCircle2,
  Gauge,
  FileSignature,
  BarChart3,
  PackageOpen,
  Boxes,
  Wrench,
  Send,
  Building2,
  Users,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = { title: string; url: string; icon: React.ElementType };
type NavGroup = { label?: string; items: NavItem[] };

const groups: NavGroup[] = [
  { items: [{ title: "Dashboard", url: "/ams-insights", icon: LayoutDashboard }] },
  {
    label: "Procurement",
    items: [
      { title: "Supplier & PO Management", url: "/ams-insights/procurement/suppliers", icon: ShoppingCart },
      { title: "Purchase Orders", url: "/ams-insights/procurement/purchase-orders", icon: FileText },
      { title: "ASN / Shipments", url: "/ams-insights/procurement/asn", icon: Truck },
      { title: "PO Approvals", url: "/ams-insights/procurement/approvals", icon: CheckCircle2 },
      { title: "Supplier Performance", url: "/ams-insights/procurement/performance", icon: Gauge },
      { title: "Contracts (Blanket PO)", url: "/ams-insights/procurement/contracts", icon: FileSignature },
      { title: "Reports", url: "/ams-insights/reports", icon: BarChart3 },
    ],
  },
  {
    label: "Inventory & WMS",
    items: [
      { title: "Receiving", url: "/ams-insights/receiving", icon: PackageOpen },
      { title: "Inventory", url: "/ams-insights/inventory", icon: Boxes },
      { title: "Assembly", url: "/ams-insights/assembly", icon: Wrench },
      { title: "Dispatch", url: "/ams-insights/dispatch", icon: Send },
    ],
  },
  {
    label: "Settings",
    items: [
      { title: "Suppliers", url: "/ams-insights/procurement/suppliers", icon: Building2 },
      { title: "Users & Roles", url: "/ams-insights/settings/users", icon: Users },
      { title: "System Settings", url: "/ams-insights/settings/system", icon: Settings },
    ],
  },
];

export function Sidebar({
  collapsed,
  onCollapse,
}: {
  collapsed: boolean;
  onCollapse: () => void;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex flex-col bg-sidebar text-sidebar-foreground transition-[width] duration-300",
        collapsed ? "w-[76px]" : "w-[268px]",
      )}
    >
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-sidebar-border px-5">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
          <Box className="size-5" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight">AMS</p>
            <p className="truncate text-[11px] text-sidebar-muted">Asset Management System</p>
          </div>
        )}
        <button
          onClick={onCollapse}
          aria-label="Collapse sidebar"
          className={cn(
            "ml-auto hidden size-7 items-center justify-center rounded-md text-sidebar-muted transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground lg:flex",
            collapsed && "hidden",
          )}
        >
          <ChevronLeft className="size-4" />
        </button>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {groups.map((group, gi) => (
          <div key={gi} className="space-y-1">
            {group.label && !collapsed && (
              <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-sidebar-muted">
                {group.label}
              </p>
            )}
            {group.items.map((item) => {
              const active = pathname === item.url;
              return (
                <Link
                  key={item.title + item.url}
                  to={item.url}
                  title={collapsed ? item.title : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    collapsed && "justify-center px-0",
                  )}
                >
                  <item.icon className="size-4 shrink-0" />
                  {!collapsed && <span className="truncate">{item.title}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="border-t border-sidebar-border px-4 py-3">
        {!collapsed ? (
          <p className="text-[11px] text-sidebar-muted">Version 2.0 · Enterprise</p>
        ) : (
          <p className="text-center text-[11px] text-sidebar-muted">2.0</p>
        )}
      </div>
    </aside>
  );
}
