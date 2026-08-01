import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/gate-entry")({
  beforeLoad: () => {
    throw redirect({ to: "/gatepass-pro/gate-entry/vehicle" });
  },
});
