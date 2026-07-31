import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/apps/warehouse-flow/components/app-shell";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/warehouse-flow")({ component: WarehouseFlowLayout });

function WarehouseFlowLayout() {
  const { canAccess } = useAuth();
  if (!canAccess("warehouse")) return <Navigate to="/dashboard" replace />;
  return <AppShell><Outlet /></AppShell>;
}
