import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/driver-verification")({
  beforeLoad: () => {
    throw redirect({ to: "/gatepass-pro/gate-entry/driver" });
  },
});
