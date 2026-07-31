import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/apps/inventory-flow/components/AppSidebar";
import { AppHeader } from "@/apps/inventory-flow/components/AppHeader";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/inventory-flow")({ component: InventoryFlowLayout });

function InventoryFlowLayout() {
  const { canAccess } = useAuth();
  if (!canAccess("inventory")) return <Navigate to="/dashboard" replace />;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <AppHeader />
          <main className="flex-1 px-3 py-5 sm:px-6 sm:py-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
