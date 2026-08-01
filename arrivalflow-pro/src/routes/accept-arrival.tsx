import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/accept-arrival")({
  beforeLoad: () => {
    throw redirect({ to: "/gatepass-pro/gate-entry/review" });
  },
});
