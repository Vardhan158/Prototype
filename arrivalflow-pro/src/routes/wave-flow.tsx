import { Navigate, Outlet, createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/apps/wave-flow/components/wms/app-shell";
import { RoleProvider } from "@/apps/wave-flow/integrated/context/role-context";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/wave-flow")({ component: WaveFlowLayout });

function WaveFlowLayout() {
  const { ready, canAccess } = useAuth();
  if (!ready) return null;
  if (!canAccess("wave")) return <Navigate to="/dashboard" replace />;
  return (
    <RoleProvider>
      <AppShell>
        <Outlet />
      </AppShell>
    </RoleProvider>
  );
}
