import { Navigate, Outlet, createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/apps/quality-gatekeeper/components/qm/AppShell";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/quality-gatekeeper")({
  component: QualityInspectionLayout,
});

function QualityInspectionLayout() {
  const { ready, canAccess } = useAuth();

  if (!ready) return null;
  if (!canAccess("quality")) return <Navigate to="/dashboard" replace />;

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
