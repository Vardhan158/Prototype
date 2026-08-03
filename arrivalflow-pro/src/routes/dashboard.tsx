import { createFileRoute } from "@tanstack/react-router";
import { Dashboard as GatePassDashboard } from "./gate-pass-pro.index";
import { getDashboardData } from "@/apps/gate-pass-pro/lib/dashboard-api";

export const Route = createFileRoute("/dashboard")({
  loader: () => getDashboardData(),
  head: () => ({
    meta: [
      { title: "Gate Control Dashboard | NexusWMS" },
      {
        name: "description",
        content: "Live gate KPIs, truck queue, arrivals and approvals for warehouse gate operations.",
      },
    ],
  }),
  component: DashboardRoute,
});

function DashboardRoute() {
  const data = Route.useLoaderData();
  return <GatePassDashboard data={data} />;
}
