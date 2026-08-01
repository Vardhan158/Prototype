import { createFileRoute } from "@tanstack/react-router";
import { Dashboard as GatePassDashboard } from "./gate-pass-pro.index";

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
