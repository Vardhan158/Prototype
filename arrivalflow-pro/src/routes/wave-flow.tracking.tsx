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
import { Radar, MapPin, Truck, Bell } from "lucide-react";
import { shipments } from "@/apps/wave-flow/lib/wms-data";

export const Route = createFileRoute("/wave-flow/tracking")({
  head: () => ({
    meta: [
      { title: "Shipment Tracking â€” NexusWMS" },
      {
        name: "description",
        content:
          "Live shipment status, dispatch timeline, carrier scans, map view and estimated delivery with customer updates.",
      },
      { property: "og:title", content: "Shipment Tracking â€” NexusWMS" },
      {
        property: "og:description",
        content:
          "Live shipment status, dispatch timeline, carrier scans, map view and estimated delivery with customer updates.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Shipment Tracking"
        description="Live visibility across carriers and lanes"
        breadcrumb={["Outbound", "Tracking"]}
        actions={
          <Button
            variant="outline"
            onClick={() => toast.success("Customer notifications sent for 3 shipments")}
          >
            <Bell className="size-4" /> Notify customers
          </Button>
        }
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="In transit"
          value={12}
          sub="4 carriers"
          icon={<Truck className="size-4" />}
        />
        <KpiCard
          label="Delivered today"
          value={19}
          sub="97% on time"
          tone="success"
          icon={<Radar className="size-4" />}
        />
        <KpiCard
          label="At risk"
          value={2}
          sub="Weather delay I-40"
          tone="warning"
          icon={<MapPin className="size-4" />}
        />
        <KpiCard
          label="Avg transit"
          value="1.4 days"
          sub="Rolling 30 days"
          tone="secondary"
          delta="-0.2d"
          icon={<Radar className="size-4" />}
        />
      </div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          {shipments.map((s) => (
            <SectionCard
              key={s.id}
              title={s.id}
              description={`${s.carrier} Â· ${s.tracking} Â· ${s.vehicle}`}
              actions={<StatusBadge status={s.status} />}
            >
              <div className="grid gap-3 sm:grid-cols-4">
                <Metric label="Order" value={s.order} />
                <Metric label="Driver" value={s.driver} />
                <Metric label="Dispatched" value={s.dispatchedAt} />
                <Metric label="ETA" value={s.eta} />
              </div>
              <div className="mt-3">
                <ProgressBar
                  value={s.progressPct}
                  tone={s.progressPct === 100 ? "success" : "primary"}
                />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Last scan: {s.lastScan}</p>
              <div className="mt-3">
                <Timeline
                  steps={s.milestones.map((m) => ({ label: m.label, at: m.at, done: m.done }))}
                />
              </div>
            </SectionCard>
          ))}
        </div>
        <SectionCard title="Map view" description="Active lanes from DC-01, DC-04, DC-07">
          <div className="relative h-80 overflow-hidden rounded-xl bg-muted">
            <div
              className="absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
                backgroundSize: "28px 28px",
              }}
            />
            <svg
              className="absolute inset-0 h-full w-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <path
                d="M12 78 C 35 40, 58 62, 88 18"
                fill="none"
                stroke="var(--chart-1)"
                strokeWidth="0.8"
                strokeDasharray="3 2"
              />
              <path
                d="M18 20 C 44 38, 62 30, 86 66"
                fill="none"
                stroke="var(--chart-2)"
                strokeWidth="0.8"
                strokeDasharray="3 2"
              />
            </svg>
            {[
              { x: "12%", y: "78%", l: "DC-01" },
              { x: "88%", y: "18%", l: "Hoofddorp" },
              { x: "18%", y: "20%", l: "DC-04" },
              { x: "86%", y: "66%", l: "Memphis" },
            ].map((p) => (
              <span
                key={p.l}
                className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-surface px-2 py-0.5 text-[10px] font-medium shadow-[var(--shadow-elev-1)]"
                style={{ left: p.x, top: p.y }}
              >
                {p.l}
              </span>
            ))}
          </div>
          <ul className="mt-3 space-y-2 text-xs">
            <li className="flex justify-between">
              <span>DHL-4410287731</span>
              <span className="text-success-foreground">Delivered 08:52</span>
            </li>
            <li className="flex justify-between">
              <span>FDX-7712004488</span>
              <span className="text-primary">In transit Â· Nashville</span>
            </li>
            <li className="flex justify-between">
              <span>SCH-9920114</span>
              <span className="text-warning-foreground">Loading at DOCK-01</span>
            </li>
          </ul>
        </SectionCard>
      </div>
    </div>
  );
}
