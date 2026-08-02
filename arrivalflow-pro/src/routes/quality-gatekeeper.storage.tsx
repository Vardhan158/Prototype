import { createFileRoute, Link } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { PageHeader, SectionCard } from "@/apps/quality-gatekeeper/components/qm/Primitives";
import { StatusPill } from "@/apps/quality-gatekeeper/components/qm/StatusPill";

export const Route = createFileRoute("/quality-gatekeeper/storage")({
  head: () => ({
    meta: [
      { title: "Module 06 Â· Warehouse Storage & Location Management Â· Axiom WMS" },
      {
        name: "description",
        content:
          "Released stock handed over from Quality Inspection for putaway, bin assignment and slotting",
      },
      {
        property: "og:title",
        content: "Module 06 Â· Warehouse Storage & Location Management Â· Axiom WMS",
      },
      {
        property: "og:description",
        content:
          "Released stock handed over from Quality Inspection for putaway, bin assignment and slotting",
      },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <>
      <PageHeader
        breadcrumb={[
          { label: "Quality", to: "/quality-gatekeeper" },
          { label: "Module 06 Â· Warehouse Storage & Location Management" },
        ]}
        eyebrow="Screen 06"
        title="Module 06 Â· Warehouse Storage & Location Management"
        description="Released stock handed over from Quality Inspection for putaway, bin assignment and slotting"
        actions={
          <Button variant="outline" size="sm" onClick={() => toast.success("Exported")}>
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
        }
      />
      <SectionCard
        title="Handover from Module 05"
        description="Quality Inspection completed â€” lots ready for putaway"
      >
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            ["Lots handed over", "3"],
            ["Units to putaway", "69"],
            ["Open warehouse tasks", "5"],
          ].map(([l, v]) => (
            <div key={l} className="rounded-xl border border-border bg-background/60 p-4">
              <p className="text-[11px] text-muted-foreground">{l}</p>
              <p className="num mt-1 text-2xl font-semibold">{v}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-xl border border-primary/25 bg-primary/5 p-4">
          <p className="text-xs font-semibold">Continuing into Module 06</p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            LPN-004422 Â· 45 EA Stainless Steel Flange DN80 Â· target bin A-12-04-B, Zone A
            fast-moving racking, WH-01 Dammam Central. Putaway strategy: fixed bin with capacity
            check.
          </p>
          <Button size="sm" className="mt-3" asChild>
            <Link to="/quality-gatekeeper">Back to Quality Dashboard</Link>
          </Button>
        </div>
      </SectionCard>
    </>
  );
}
