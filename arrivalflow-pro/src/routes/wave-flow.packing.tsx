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
import { Boxes, Printer, Scale, Camera, CheckCircle2 } from "lucide-react";
import { packStations } from "@/apps/wave-flow/lib/wms-data";

export const Route = createFileRoute("/wave-flow/packing")({
  head: () => ({
    meta: [
      { title: "Packing Management â€” NexusWMS" },
      {
        name: "description",
        content:
          "Packing queue, station checklists, carton weight and dimension capture and shipping label printing.",
      },
      { property: "og:title", content: "Packing Management â€” NexusWMS" },
      {
        property: "og:description",
        content:
          "Packing queue, station checklists, carton weight and dimension capture and shipping label printing.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Packing Management"
        description="3 stations Â· 37 orders in queue Â· avg 6m 12s per carton"
        breadcrumb={["Outbound", "Packing"]}
        actions={
          <Button onClick={() => toast.success("Shipping labels sent to printer LP-02")}>
            <Printer className="size-4" /> Print labels
          </Button>
        }
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Packing queue"
          value={37}
          sub="12 cartons open"
          icon={<Boxes className="size-4" />}
        />
        <KpiCard
          label="Packed today"
          value={128}
          sub="Target 150"
          tone="success"
          delta="+14%"
          icon={<CheckCircle2 className="size-4" />}
        />
        <KpiCard
          label="Avg carton weight"
          value="21.4 kg"
          sub="Across 3 stations"
          tone="secondary"
          icon={<Scale className="size-4" />}
        />
        <KpiCard
          label="Photos captured"
          value={64}
          sub="Damage evidence"
          tone="warning"
          icon={<Camera className="size-4" />}
        />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {packStations.map((s) => (
          <SectionCard
            key={s.id}
            title={s.id}
            description={s.packer}
            actions={<StatusBadge status={s.status} />}
          >
            {s.order === "â€”" ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Station idle â€” waiting for picked orders.
              </p>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Metric label="Order" value={s.order} />
                  <Metric label="Cartons" value={s.cartons} />
                  <Metric label="Weight" value={`${s.weightKg} kg`} />
                  <Metric label="Dimensions" value={s.dims} />
                </div>
                <ProgressBar value={s.progress} tone={s.progress === 100 ? "success" : "warning"} />
                <ul className="space-y-1.5">
                  {s.checklist.map((c) => (
                    <li key={c.label} className="flex items-start gap-2 text-xs">
                      <span
                        className={`mt-0.5 grid size-4 shrink-0 place-items-center rounded-full border ${c.done ? "border-success bg-success text-success-foreground" : "border-border"}`}
                      >
                        {c.done ? "âœ“" : ""}
                      </span>
                      <span className={c.done ? "" : "text-muted-foreground"}>{c.label}</span>
                    </li>
                  ))}
                </ul>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toast.success("Packing photo captured")}
                  >
                    <Camera className="size-4" /> Photo
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => toast.success(`${s.order} packed Â· label printed`)}
                  >
                    Complete
                  </Button>
                </div>
              </div>
            )}
          </SectionCard>
        ))}
      </div>
      <SectionCard title="Label management" description="Shipping, barcode, QR and pallet labels">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { t: "Shipping label", d: "4x6 thermal Â· DHL Freight", s: "Printed" },
            { t: "Barcode label", d: "Code-128 Â· carton ID", s: "Printed" },
            { t: "QR label", d: "Track & trace deep link", s: "Queued" },
            { t: "Pallet label", d: "SSCC-18 Â· GS1 compliant", s: "Queued" },
          ].map((l) => (
            <div key={l.t} className="glass-panel rounded-xl p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium">{l.t}</p>
                <StatusBadge status={l.s === "Printed" ? "Completed" : "Queued"} />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{l.d}</p>
              <div className="mt-3 rounded-lg border border-dashed border-border p-3">
                <div className="flex h-10 items-end gap-[2px]">
                  {Array.from({ length: 34 }).map((_, i) => (
                    <span
                      key={i}
                      className="flex-1 bg-foreground"
                      style={{ height: `${40 + ((i * 37) % 60)}%` }}
                    />
                  ))}
                </div>
                <p className="num mt-1 text-center text-[10px] text-muted-foreground">
                  8712345678904
                </p>
              </div>
              <div className="mt-2 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => toast.success(`${l.t} preview opened`)}
                >
                  Preview
                </Button>
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => toast.success(`${l.t} reprinted`)}
                >
                  Reprint
                </Button>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
