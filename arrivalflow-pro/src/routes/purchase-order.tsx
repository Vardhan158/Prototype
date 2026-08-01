import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/purchase-order")({
  beforeLoad: () => {
    throw redirect({ to: "/gatepass-pro/gate-entry/delivery" });
  },
});
