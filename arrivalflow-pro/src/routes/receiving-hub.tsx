import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router";
import { AppLayout } from "@/apps/receiving-hub/layout/AppLayout";
import { WmsProvider } from "@/apps/receiving-hub/context/WmsContext";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/receiving-hub")({ component: ReceivingHubLayout });

function ReceivingHubLayout() {
  const { canAccess } = useAuth();
  if (!canAccess("receiving")) return <Navigate to="/dashboard" replace />;
  return <WmsProvider><AppLayout><Outlet /></AppLayout></WmsProvider>;
}
