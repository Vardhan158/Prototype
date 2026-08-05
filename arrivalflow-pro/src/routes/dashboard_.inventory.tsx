import { createFileRoute, Navigate } from "@tanstack/react-router";
import { AppShell } from "@/apps/inventory-flow-pro/components/wms/app-shell";
import { WmsProvider } from "@/apps/inventory-flow-pro/lib/wms/store";
import { useAuth } from "@/lib/auth";
import { Route as InventoryFlowRoute } from "./inventory-flow-pro.index";

const DashboardScreen = InventoryFlowRoute.options.component;

export const Route = createFileRoute("/dashboard_/inventory")({
  head: () => ({
    meta: [
      { title: "Inventory Lifecycle Dashboard | AXIOM WMS" },
      {
        name: "description",
        content:
          "Real-time warehouse inventory lifecycle control, stock status, reservations, picking and dispatch.",
      },
    ],
  }),
  component: InventoryDashboard,
});

function InventoryDashboard() {
  const { ready, canAccess } = useAuth();

  if (!ready) return null;
  if (!canAccess("lifecycle")) return <Navigate to="/dashboard" replace />;

  return (
    <WmsProvider>
      <AppShell>
        <DashboardScreen />
      </AppShell>
    </WmsProvider>
  );
}
