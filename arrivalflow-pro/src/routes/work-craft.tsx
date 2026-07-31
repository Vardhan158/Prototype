import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router";
import { AmsProvider } from "@work/lib/ams/store";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/work-craft")({ component: WorkCraftLayout });

function WorkCraftLayout() {
  const { canAccess } = useAuth();
  if (!canAccess("workcraft")) return <Navigate to="/dashboard" replace />;
  return <AmsProvider><Outlet /></AmsProvider>;
}
