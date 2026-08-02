import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  KpiCard,
  PageHeader,
  ProgressBar,
  SectionCard,
  StatusBadge,
  Metric,
  Timeline,
} from "@/apps/wave-flow/components/wms/ui";
import { Button } from "@/components/ui/button";
import { Warehouse, Truck, Clock, CheckCircle2 } from "lucide-react";
import { docks, orders } from "@/apps/wave-flow/lib/wms-data";

export const Route = createFileRoute("/wave-flow/staging")({
  head: () => ({
    meta: [
      { title: "Staging Management â€” NexusWMS" },
      {
        name: "description",
        content:
          "Staging lane map, dock assignment, waiting trucks and staging queue for outbound shipments.",
      },
      { property: "og:title", content: "Staging Management â€” NexusWMS" },
      {
        property: "og:description",
        content:
          "Staging lane map, dock assignment, waiting trucks and staging queue for outbound shipments.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Staging Management"
        description="6 docks Â· 4 staging lanes Â· 2 trucks waiting at gatehouse"
        breadcrumb={["Outbound", "Staging"]}
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Staged shipments"
          value={4}
          sub="Lanes S-01 to S-04"
          icon={<Warehouse className="size-4" />}
        />
        <KpiCard
          label="Waiting trucks"
          value={2}
          sub="Avg wait 18 min"
          tone="warning"
          icon={<Clock className="size-4" />}
        />
        <KpiCard
          label="Docks in use"
          value="3 / 6"
          sub="1 under maintenance"
          tone="primary"
          icon={<Truck className="size-4" />}
        />
        <KpiCard
          label="Completed"
          value={11}
          sub="Handed to loading"
          tone="success"
          icon={<CheckCircle2 className="size-4" />}
        />
      </div>
      <SectionCard title="Staging area map" description="Live dock and lane occupancy">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {docks.map((d) => (
            <div key={d.id} className="glass-panel rounded-xl p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="num text-sm font-semibold">{d.id}</p>
                <StatusBadge status={d.status} />
              </div>
              <p className="mt-1 truncate text-xs text-muted-foreground">
                {d.truck !== "â€”" ? `${d.truck} Â· ${d.order}` : "Available"}
              </p>
              <p className="num mt-1 text-xs text-muted-foreground">ETA {d.eta}</p>
              <div className="mt-2">
                <ProgressBar
                  value={d.utilization}
                  tone={d.utilization > 75 ? "success" : "warning"}
                />
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
      <SectionCard title="Staging queue" bodyClassName="p-0">
        <ul className="divide-y divide-border">
          {orders
            .filter((o) => ["Staged", "Packed", "Quality Verified"].includes(o.status))
            .map((o) => (
              <li
                key={o.id}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="num truncate text-sm font-medium">{o.id}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {o.customer} Â· {o.carrier} Â· {o.dispatchWindow}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <StatusBadge status={o.status} />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toast.success(`${o.id} assigned to DOCK-03`)}
                  >
                    Assign dock
                  </Button>
                </div>
              </li>
            ))}
        </ul>
      </SectionCard>
    </div>
  );
}
