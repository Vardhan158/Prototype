import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router";
import { WmsProvider } from "@/apps/gatepass-pro/lib/wms/store";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/gatepass-pro")({
  component: GatepassProLayout,
});

function GatepassProLayout() {
  const { ready, canAccess } = useAuth();

  if (!ready) return null;
  if (!canAccess("arrival")) return <Navigate to="/dashboard" replace />;

  return (
    <WmsProvider>
      <div className="gatepass-theme">
        <Outlet />
      </div>
    </WmsProvider>
  );
}
