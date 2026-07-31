import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/apps/warehouse-navigator/components/app-shell";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/warehouse-navigator")({ component: WarehouseNavigatorLayout });

function WarehouseNavigatorLayout() {
  const { canAccess } = useAuth();
  if (!canAccess("navigator")) return <Navigate to="/dashboard" replace />;
  return <AppShell><Outlet /></AppShell>;
}
