import { createFileRoute } from "@tanstack/react-router";
import { Route as GatePassRoute } from "./gate-pass-pro.index";

const GatePassDashboard = GatePassRoute.options.component;

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Gate Control Dashboard | NexusWMS" },
      {
        name: "description",
        content: "Live gate KPIs, truck queue, arrivals and approvals for warehouse gate operations.",
      },
    ],
  }),
  component: GatePassDashboard,
});
