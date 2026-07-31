import { Link, useRouterState } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowLeftRight,
  ClipboardCheck,
  FileBarChart,
  LayoutDashboard,
  Network,
  Package,
  PackageSearch,
  Settings,
  SlidersHorizontal,
  Target,
  Zap,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const OPERATIONS = [
  { title: "Dashboard", url: "/inventory-flow", icon: LayoutDashboard, br: "BR-056" },
  { title: "Inventory Explorer", url: "/inventory-flow/explorer", icon: PackageSearch, br: "BR-057" },
  { title: "Inventory Details", url: "/inventory-flow/inventory", icon: Package, br: "BR-058" },
  { title: "Cycle Count & Audit", url: "/inventory-flow/cycle-count", icon: ClipboardCheck, br: "BR-060" },
  { title: "Stock Adjustments", url: "/inventory-flow/adjustments", icon: SlidersHorizontal, br: "BR-062" },
];

const PLANNING = [
  { title: "Inventory Planning", url: "/inventory-flow/planning", icon: Target, br: "BR-064" },
  { title: "Warehouse Transfers", url: "/inventory-flow/transfers", icon: ArrowLeftRight, br: "BR-067" },
  { title: "Damaged & Quarantine", url: "/inventory-flow/quarantine", icon: AlertTriangle, br: "BR-068" },
  { title: "Serial Genealogy", url: "/inventory-flow/genealogy", icon: Network, br: "BR-069" },
];

const SYSTEM = [
  { title: "Reports", url: "/inventory-flow/reports", icon: FileBarChart, br: "BR-070" },
  { title: "Settings", url: "/inventory-flow/settings", icon: Settings, br: "" },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  const isActive = (url: string) => (url === "/" ? pathname === "/" : pathname.startsWith(url));

  const renderGroup = (label: string, items: typeof OPERATIONS) => (
    <SidebarGroup>
      {!collapsed && (
        <SidebarGroupLabel className="text-[10px] font-semibold tracking-widest uppercase">
          {label}
        </SidebarGroupLabel>
      )}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                <Link to={item.url} className="gap-2.5">
                  <item.icon className="size-4 shrink-0" />
                  {!collapsed && <span className="truncate">{item.title}</span>}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border px-3 py-3.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Zap className="size-4" />
          </span>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold tracking-tight">VoltCore WMS</p>
              <p className="truncate text-[11px] text-muted-foreground">Inventory Management</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {renderGroup("Operations", OPERATIONS)}
        {renderGroup("Planning & Control", PLANNING)}
        {renderGroup("System", SYSTEM)}
      </SidebarContent>

      {!collapsed && (
        <SidebarFooter className="border-t border-sidebar-border p-3">
          <div className="rounded-lg bg-sidebar-accent px-3 py-2.5">
            <p className="text-[11px] font-medium text-sidebar-accent-foreground">Module BR-056 → BR-070</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Inventory Management v4.2.1</p>
          </div>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
