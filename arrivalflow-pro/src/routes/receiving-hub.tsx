import { Navigate, Outlet, createFileRoute } from "@tanstack/react-router";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppHeader } from "@/apps/receiving-hub/components/wms/AppHeader";
import { AppSidebar } from "@/apps/receiving-hub/components/wms/AppSidebar";
import { WmsProvider } from "@/apps/receiving-hub/lib/wms-store";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/receiving-hub")({
  component: ReceivingHubLayout,
});

function ReceivingHubLayout() {
  const { ready, canAccess } = useAuth();

  if (!ready) return null;
  if (!canAccess("receiving")) return <Navigate to="/dashboard" replace />;

  return (
    <WmsProvider>
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-background">
          <AppSidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <AppHeader />
            <main className="flex-1 px-4 py-6 md:px-7 md:py-8">
              <Outlet />
            </main>
          </div>
        </div>
      </SidebarProvider>
    </WmsProvider>
  );
}
