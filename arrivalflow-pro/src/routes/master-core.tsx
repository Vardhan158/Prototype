import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/apps/master-core/AppSidebar";
import { TopBar } from "@/apps/master-core/TopBar";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/master-core")({ component: MasterCoreLayout });

function MasterCoreLayout() {
  const { canAccess } = useAuth();
  if (!canAccess("master")) return <Navigate to="/dashboard" replace />;
  return <SidebarProvider><div className="flex min-h-screen w-full bg-muted/20"><AppSidebar /><div className="flex min-w-0 flex-1 flex-col"><TopBar /><main className="min-w-0 flex-1"><Outlet /></main></div></div></SidebarProvider>;
}
