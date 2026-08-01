import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/vehicle-verification")({
  beforeLoad: () => {
    throw redirect({ to: "/gatepass-pro/gate-entry/vehicle" });
  },
});
