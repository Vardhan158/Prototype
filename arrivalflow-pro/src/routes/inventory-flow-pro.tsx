import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/apps/inventory-flow-pro/components/wms/app-shell";
import { WmsProvider } from "@/apps/inventory-flow-pro/lib/wms/store";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/inventory-flow-pro")({ component: InventoryFlowProLayout });

function InventoryFlowProLayout() {
  const { ready, canAccess } = useAuth();
  if (!ready) return null;
  if (!canAccess("lifecycle")) return <Navigate to="/dashboard" replace />;
  return (
    <WmsProvider>
      <AppShell><Outlet /></AppShell>
    </WmsProvider>
  );
}
