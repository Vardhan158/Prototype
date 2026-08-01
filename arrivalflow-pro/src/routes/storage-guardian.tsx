import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/apps/storage-guardian/components/warehouse/app-shell";
import { WarehouseProvider } from "@/apps/storage-guardian/lib/warehouse/store";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/storage-guardian")({ component: StorageGuardianLayout });

function StorageGuardianLayout() {
  const { ready, canAccess } = useAuth();
  if (!ready) return null;
  if (!canAccess("storage")) return <Navigate to="/dashboard" replace />;
  return (
    <WarehouseProvider>
      <AppShell><Outlet /></AppShell>
    </WarehouseProvider>
  );
}
