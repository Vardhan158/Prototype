import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/warehouse-flow")({ component: WarehouseFlowLayout });

function WarehouseFlowLayout() {
  const { canAccess } = useAuth();
  if (!canAccess("warehouse")) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
