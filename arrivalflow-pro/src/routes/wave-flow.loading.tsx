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
import { Truck, Camera, Lock, CheckCircle2 } from "lucide-react";
import { trucks } from "@/apps/wave-flow/lib/wms-data";

export const Route = createFileRoute("/wave-flow/loading")({
  head: () => ({
    meta: [
      { title: "Truck Loading â€” NexusWMS" },
      {
        name: "description",
        content:
          "Truck assignment, loading sequence, checklist, live progress, seal capture and loading timeline.",
      },
      { property: "og:title", content: "Truck Loading â€” NexusWMS" },
      {
        property: "og:description",
        content:
          "Truck assignment, loading sequence, checklist, live progress, seal capture and loading timeline.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Truck Loading"
        description="3 trucks loading Â· avg 41 min per truck Â· 62% utilisation"
        breadcrumb={["Outbound", "Loading"]}
        actions={
          <Button onClick={() => toast.success("Truck TRK-4495 assigned to DOCK-03")}>
            <Truck className="size-4" /> Assign truck
          </Button>
        }
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Trucks loading"
          value={3}
          sub="Docks 01, 02, 05"
          icon={<Truck className="size-4" />}
        />
        <KpiCard
          label="Avg load time"
          value="41 min"
          sub="Target 45 min"
          tone="success"
          delta="-6m"
          icon={<CheckCircle2 className="size-4" />}
        />
        <KpiCard
          label="Capacity used"
          value="68%"
          sub="Weight-based"
          tone="secondary"
          icon={<Truck className="size-4" />}
        />
        <KpiCard
          label="Seals applied"
          value={11}
          sub="All verified"
          tone="primary"
          icon={<Lock className="size-4" />}
        />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {trucks.map((t) => (
          <SectionCard
            key={t.id}
            title={t.id}
            description={`${t.carrier} Â· ${t.plate}`}
            actions={<StatusBadge status={t.status} />}
          >
            <div className="grid grid-cols-2 gap-3">
              <Metric label="Driver" value={t.driver} />
              <Metric label="Licence" value={t.licence} />
              <Metric label="Trailer" value={t.trailer} />
              <Metric label="Dock" value={t.dock} />
              <Metric label="Capacity" value={`${t.capacityKg.toLocaleString()} kg`} />
              <Metric label="Loaded" value={`${t.loadedKg.toLocaleString()} kg`} />
              <Metric label="Seal number" value={t.seal} />
              <Metric label="Progress" value={`${t.progress}%`} />
            </div>
            <div className="mt-3">
              <ProgressBar value={t.progress} tone={t.progress > 75 ? "success" : "warning"} />
            </div>
            <ul className="mt-3 space-y-1.5 text-xs">
              {[
                "Loading sequence verified (LIFO by drop)",
                "Pallets scanned into trailer",
                "Load secured and strapped",
                "Seal applied and photographed",
              ].map((c, i) => (
                <li key={c} className="flex gap-2">
                  <span
                    className={`mt-0.5 grid size-4 shrink-0 place-items-center rounded-full border ${i < 3 ? "border-success bg-success text-success-foreground" : "border-border"}`}
                  >
                    {i < 3 ? "âœ“" : ""}
                  </span>
                  <span className={i < 3 ? "" : "text-muted-foreground"}>{c}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.success("Loading photo captured")}
              >
                <Camera className="size-4" /> Photo
              </Button>
              <Button
                size="sm"
                onClick={() => toast.success(`${t.id} loading completed Â· seal ${t.seal}`)}
              >
                Complete
              </Button>
            </div>
          </SectionCard>
        ))}
      </div>
      <SectionCard title="Loading timeline Â· TRK-4471">
        <Timeline
          steps={[
            {
              label: "Truck checked in at gatehouse",
              at: "18 Mar Â· 09:31",
              by: "Gatehouse",
              done: true,
            },
            { label: "Assigned to DOCK-01", at: "18 Mar Â· 09:48", by: "G. Ruiz", done: true },
            { label: "Loading started", at: "18 Mar Â· 10:55", by: "Loading crew B", done: true },
            {
              label: "Axle weight exception resolved",
              at: "18 Mar Â· 11:12",
              by: "G. Ruiz",
              done: true,
            },
            { label: "Seal applied", at: "â€”", by: "â€”", done: false },
            { label: "Released to dispatch verification", at: "â€”", by: "â€”", done: false },
          ]}
        />
      </SectionCard>
    </div>
  );
}
