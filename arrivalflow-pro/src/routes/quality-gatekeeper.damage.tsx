import { createFileRoute, Link } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { PageHeader, SectionCard } from "@/apps/quality-gatekeeper/components/qm/Primitives";
import { StatusPill } from "@/apps/quality-gatekeeper/components/qm/StatusPill";
import { damageTypes, photoEvidence } from "@/apps/quality-gatekeeper/lib/qm-data";

export const Route = createFileRoute("/quality-gatekeeper/damage")({
  head: () => ({
    meta: [
      { title: "Damage Reports Â· Axiom WMS" },
      {
        name: "description",
        content:
          "All damage records captured during incoming inspection with severity and photo evidence",
      },
      { property: "og:title", content: "Damage Reports Â· Axiom WMS" },
      {
        property: "og:description",
        content:
          "All damage records captured during incoming inspection with severity and photo evidence",
      },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <>
      <PageHeader
        breadcrumb={[{ label: "Quality", to: "/quality-gatekeeper" }, { label: "Damage Reports" }]}
        eyebrow="Screen 09"
        title="Damage Reports"
        description="All damage records captured during incoming inspection with severity and photo evidence"
        actions={
          <Button variant="outline" size="sm" onClick={() => toast.success("Exported")}>
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
        }
      />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {photoEvidence.map((p, idx) => (
          <SectionCard key={p.id} padded={false}>
            <img src={p.src} alt={p.label} loading="lazy" className="h-40 w-full object-cover" />
            <div className="p-4">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                <p className="num truncate text-xs font-semibold text-primary">
                  DMG-2026-002{10 + idx}
                </p>
                <StatusPill
                  tone={idx % 3 === 0 ? "danger" : idx % 3 === 1 ? "warning" : "info"}
                  dot={false}
                >
                  {idx % 3 === 0 ? "Critical" : idx % 3 === 1 ? "Major" : "Minor"}
                </StatusPill>
              </div>
              <p className="mt-1 truncate text-sm font-medium">
                {damageTypes[idx % damageTypes.length]}
              </p>
              <p className="truncate text-[11px] text-muted-foreground">
                {p.label} Â· {p.tag}
              </p>
              <Button size="sm" variant="outline" className="mt-3 w-full" asChild>
                <Link to="/quality-gatekeeper/ncr/new">Escalate to NCR</Link>
              </Button>
            </div>
          </SectionCard>
        ))}
      </div>
    </>
  );
}
