import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Truck,
  Warehouse,
  FileText,
  History,
  Boxes,
  ShieldCheck,
  BarChart3,
  ScrollText,
  Settings,
  PackageCheck,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { useWms } from "@/apps/receiving-hub/lib/wms-store";

const operations = [
  { title: "Dashboard", url: "/receiving-hub", icon: LayoutDashboard },
  { title: "Receiving Queue", url: "/receiving-hub/queue", icon: Truck },
  { title: "Dock Management", url: "/receiving-hub/docks", icon: Warehouse },
  { title: "GRN", url: "/receiving-hub/grn", icon: FileText },
  { title: "Receiving History", url: "/receiving-hub/history", icon: History },
];

const downstream = [
  { title: "Inventory", url: "/receiving-hub/inventory", icon: Boxes },
  { title: "Quality Inspection", url: "/receiving-hub/quality", icon: ShieldCheck },
  { title: "Approvals", url: "/receiving-hub/approvals", icon: PackageCheck },
];

const governance = [
  { title: "Reports", url: "/receiving-hub/reports", icon: BarChart3 },
  { title: "Audit Logs", url: "/receiving-hub/audit", icon: ScrollText },
  { title: "Settings", url: "/receiving-hub/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const { state: wms } = useWms();
  const pending = wms.shipments.filter((s) => s.status === "Waiting").length;

  const isActive = (url: string) =>
    url === "/receiving-hub"
      ? pathname === "/receiving-hub" || pathname === "/receiving-hub/"
      : pathname.startsWith(url);

  const group = (label: string, items: typeof operations) => (
    <SidebarGroup>
      {!collapsed && (
        <SidebarGroupLabel className="text-[0.68rem] tracking-[0.14em] uppercase">
          {label}
        </SidebarGroupLabel>
      )}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                <Link to={item.url} className="flex items-center gap-3">
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span className="truncate text-sm">{item.title}</span>}
                  {!collapsed && item.url === "/receiving-hub/queue" && pending > 0 && (
                    <span className="num ml-auto rounded-full bg-sidebar-primary px-2 py-0.5 text-[0.65rem] font-semibold text-sidebar-primary-foreground">
                      {pending}
                    </span>
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar collapsible="icon" className="border-sidebar-border">
      <div className="flex items-center gap-3 px-3 py-4">
        <div className="brand-gradient grid h-9 w-9 shrink-0 place-items-center rounded-xl shadow-md">
          <PackageCheck className="h-5 w-5 text-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-sidebar-foreground">AXIOM WMS</p>
            <p className="truncate text-[0.7rem] text-sidebar-foreground/60">
              Inbound Operations Suite
            </p>
          </div>
        )}
      </div>
      <SidebarContent>
        {group("Receiving", operations)}
        {group("Downstream", downstream)}
        {group("Governance", governance)}
      </SidebarContent>
      <SidebarFooter>
        {!collapsed && (
          <div className="rounded-xl border border-sidebar-border bg-sidebar-accent/60 p-3">
            <p className="text-[0.7rem] font-medium text-sidebar-foreground/70">Module 03 of 12</p>
            <p className="mt-1 text-xs font-semibold text-sidebar-foreground">
              Goods Receiving &amp; GRN
            </p>
            <Link
              to="/receiving-hub/module-complete"
              className="mt-2 inline-block text-[0.7rem] text-sidebar-primary hover:underline"
            >
              Next: Document Mgmt &amp; OCR â†’
            </Link>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
