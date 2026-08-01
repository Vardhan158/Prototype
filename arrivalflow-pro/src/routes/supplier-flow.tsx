import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/apps/supplier-flow/components/app-shell";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/supplier-flow")({
  component: SupplierFlowLayout,
});

function SupplierFlowLayout() {
  const { ready, canAccess } = useAuth();

  if (!ready) return null;
  if (!canAccess("supplier")) return <Navigate to="/dashboard" replace />;

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
