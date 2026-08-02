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
import { ShieldCheck, Camera, Check, X } from "lucide-react";

export const Route = createFileRoute("/wave-flow/quality")({
  head: () => ({
    meta: [
      { title: "Quality Verification â€” NexusWMS" },
      {
        name: "description",
        content:
          "Outbound quality gate: packaging quality, item and quantity checks, damage and seal verification with inspector sign-off.",
      },
      { property: "og:title", content: "Quality Verification â€” NexusWMS" },
      {
        property: "og:description",
        content:
          "Outbound quality gate: packaging quality, item and quantity checks, damage and seal verification with inspector sign-off.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Quality Verification"
        description="Pre-dispatch inspection gate Â· 9 orders awaiting QC"
        breadcrumb={["Outbound", "Quality"]}
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Awaiting QC"
          value={9}
          sub="2 critical priority"
          icon={<ShieldCheck className="size-4" />}
        />
        <KpiCard
          label="Approved today"
          value={112}
          sub="98.4% first-pass"
          tone="success"
          icon={<Check className="size-4" />}
        />
        <KpiCard
          label="Rejected"
          value={3}
          sub="2 damage Â· 1 wrong item"
          tone="danger"
          icon={<X className="size-4" />}
        />
        <KpiCard
          label="Photos on file"
          value={48}
          sub="Evidence archive"
          tone="secondary"
          icon={<Camera className="size-4" />}
        />
      </div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <SectionCard
          title="Inspection Â· OB-2026-104877"
          description="Helvetia Medical Devices Â· 9 cartons Â· PACK-02"
          actions={<StatusBadge status="Awaiting QC" />}
        >
          <ul className="space-y-2">
            {[
              "Packaging quality and void fill",
              "Correct item vs pick list",
              "Correct quantity per carton",
              "Damage and contamination check",
              "Seal integrity and tamper evidence",
              "Cold-chain indicator within range",
            ].map((c, i) => (
              <li
                key={c}
                className="glass-panel flex items-center justify-between gap-3 rounded-xl px-3 py-2.5"
              >
                <span className="min-w-0 truncate text-sm">{c}</span>
                <span className="flex shrink-0 gap-1.5">
                  <Button
                    variant={i < 5 ? "default" : "outline"}
                    size="sm"
                    onClick={() => toast.success(`${c} passed`)}
                  >
                    <Check className="size-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-danger"
                    onClick={() => toast.error(`${c} failed â€” exception raised`)}
                  >
                    <X className="size-4" />
                  </Button>
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-dashed border-border p-4 text-center">
              <Camera className="mx-auto size-5 text-muted-foreground" />
              <p className="mt-1 text-xs text-muted-foreground">4 inspection photos attached</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => toast.success("Photo captured")}
              >
                Capture photo
              </Button>
            </div>
            <div className="rounded-xl border border-dashed border-border p-4 text-center">
              <p className="font-[cursive] text-lg">A. Rossi</p>
              <p className="text-xs text-muted-foreground">Inspector signature Â· 18 Mar 11:04</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => toast.success("Signature captured")}
              >
                Re-sign
              </Button>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              onClick={() => toast.success("OB-2026-104877 quality verified â€” moved to staging")}
            >
              Approve inspection
            </Button>
            <Button
              variant="outline"
              className="text-danger"
              onClick={() => toast.error("Inspection rejected â€” returned to packing")}
            >
              Reject
            </Button>
          </div>
        </SectionCard>
        <SectionCard title="QC timeline">
          <Timeline
            steps={[
              { label: "Packed at PACK-02", at: "18 Mar Â· 10:41", by: "K. Larsen", done: true },
              { label: "QC queue entry", at: "18 Mar Â· 10:48", by: "System", done: true },
              { label: "Inspection started", at: "18 Mar Â· 10:57", by: "A. Rossi", done: true },
              { label: "Approved", at: "â€”", by: "â€”", done: false },
              { label: "Moved to staging", at: "â€”", by: "â€”", done: false },
            ]}
          />
        </SectionCard>
      </div>
    </div>
  );
}
