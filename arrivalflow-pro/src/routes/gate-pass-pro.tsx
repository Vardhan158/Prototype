import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/gate-pass-pro")({
  component: GatePassProLayout,
});

function GatePassProLayout() {
  const { ready, user } = useAuth();

  if (!ready) return null;
  if (user?.role !== "Administrator") return <Navigate to="/dashboard" replace />;

  return <Outlet />;
}
