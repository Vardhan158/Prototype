import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/apps/quality-gatekeeper/components/wms/AppShell";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/quality-gatekeeper")({ component: QualityGatekeeperLayout });

function QualityGatekeeperLayout() {
  const { ready, canAccess } = useAuth();
  if (!ready) return null;
  if (!canAccess("quality")) return <Navigate to="/dashboard" replace />;
  return <AppShell><Outlet /></AppShell>;
}
