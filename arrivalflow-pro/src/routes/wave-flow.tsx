import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router";
import { AppLayout } from "@wave/components/layout/app-layout";
import { RoleProvider, type Role } from "@wave/context/role-context";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/wave-flow")({ component: WaveFlowLayout });

function WaveFlowLayout() {
  const { user, canAccess } = useAuth();
  if (!canAccess("wave")) return <Navigate to="/dashboard" replace />;
  const role: Role = user?.role === "Wave Planner" ? "Warehouse Executive" : "Administrator";
  return <RoleProvider initialRole={role}><AppLayout><Outlet /></AppLayout></RoleProvider>;
}
