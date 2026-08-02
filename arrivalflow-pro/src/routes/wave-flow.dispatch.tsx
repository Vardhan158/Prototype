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
import { ClipboardCheck, Check, FileText, Signature } from "lucide-react";

export const Route = createFileRoute("/wave-flow/dispatch")({
  head: () => ({
    meta: [
      { title: "Dispatch Verification â€” NexusWMS" },
      {
        name: "description",
        content:
          "Final dispatch checklist: vehicle, driver, shipment and seal verification with digital signature and dispatch pass.",
      },
      { property: "og:title", content: "Dispatch Verification â€” NexusWMS" },
      {
        property: "og:description",
        content:
          "Final dispatch checklist: vehicle, driver, shipment and seal verification with digital signature and dispatch pass.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Dispatch Verification"
        description="Final gate before release Â· 2 shipments awaiting approval"
        breadcrumb={["Outbound", "Dispatch"]}
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Awaiting verification"
          value={2}
          sub="TRK-4471 Â· TRK-4482"
          icon={<ClipboardCheck className="size-4" />}
        />
        <KpiCard
          label="Approved today"
          value={28}
          sub="100% seal match"
          tone="success"
          icon={<Check className="size-4" />}
        />
        <KpiCard
          label="Dispatch passes issued"
          value={28}
          sub="Gate integration live"
          tone="primary"
          icon={<FileText className="size-4" />}
        />
        <KpiCard
          label="Avg gate time"
          value="7 min"
          sub="Check-in to exit"
          tone="secondary"
          delta="-2m"
          icon={<Signature className="size-4" />}
        />
      </div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <SectionCard
          title="Dispatch checklist Â· TRK-4471"
          description="Schneider National Â· BX-482-KL Â· DOCK-01"
          actions={<StatusBadge status="Loaded" />}
        >
          <div className="space-y-3">
            {[
              {
                g: "Vehicle verification",
                items: [
                  "Plate matches booking (BX-482-KL)",
                  "Trailer roadworthy inspection valid",
                  "Tail-lift and straps present",
                ],
              },
              {
                g: "Driver verification",
                items: [
                  "Driver ID matched (Ray Kowalski)",
                  "Licence OH-77120394 valid to 2029",
                  "Site induction completed",
                ],
              },
              {
                g: "Shipment verification",
                items: [
                  "Manifest LM-3391 matches loaded pallets",
                  "Gross weight 15,980 kg within limit",
                  "Customs documents attached",
                ],
              },
              {
                g: "Seal verification",
                items: ["Seal SL-778102 applied", "Seal number photographed and logged"],
              },
            ].map((grp) => (
              <div key={grp.g} className="glass-panel rounded-xl p-3">
                <p className="text-sm font-medium">{grp.g}</p>
                <ul className="mt-2 space-y-1.5">
                  {grp.items.map((i) => (
                    <li key={i} className="flex items-start gap-2 text-xs">
                      <span className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full border border-success bg-success text-success-foreground">
                        âœ“
                      </span>
                      <span>{i}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={() => toast.success("Dispatch approved Â· pass DP-88214 issued")}>
              Approve dispatch
            </Button>
            <Button variant="outline" onClick={() => toast.success("Digital signature captured")}>
              <Signature className="size-4" /> Sign
            </Button>
            <Button
              variant="outline"
              className="text-danger"
              onClick={() => toast.error("Dispatch held â€” exception raised")}
            >
              Hold shipment
            </Button>
          </div>
        </SectionCard>
        <SectionCard title="Dispatch pass preview">
          <div className="rounded-xl border border-border p-4">
            <p className="text-xs text-muted-foreground">DISPATCH PASS</p>
            <p className="num text-xl font-semibold">DP-88214</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Metric label="Truck" value="TRK-4471" />
              <Metric label="Plate" value="BX-482-KL" />
              <Metric label="Driver" value="Ray Kowalski" />
              <Metric label="Seal" value="SL-778102" />
              <Metric label="Order" value="OB-2026-104878" />
              <Metric label="Dock" value="DOCK-01" />
            </div>
            <div className="mt-3 flex h-12 items-end gap-[2px]">
              {Array.from({ length: 48 }).map((_, i) => (
                <span
                  key={i}
                  className="flex-1 bg-foreground"
                  style={{ height: `${40 + ((i * 29) % 60)}%` }}
                />
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 w-full"
              onClick={() => toast.success("Dispatch pass printed at gatehouse")}
            >
              Print pass
            </Button>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
