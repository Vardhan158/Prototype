import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";

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

  return <Navigate to="/inventory-flow-pro" replace />;
}
