import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/ams-insights")({ component: AmsInsightsLayout });

function AmsInsightsLayout() {
  const { ready, canAccess } = useAuth();
  if (!ready) return null;
  if (!canAccess("procurement")) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
