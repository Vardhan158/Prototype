import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/document-flow")({ component: DocumentFlowLayout });

function DocumentFlowLayout() {
  const { ready, canAccess } = useAuth();
  if (!ready) return null;
  if (!canAccess("document")) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
