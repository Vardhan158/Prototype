import { createFileRoute, Link } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { PageHeader, SectionCard } from "@/apps/quality-gatekeeper/components/qm/Primitives";
import { StatusPill } from "@/apps/quality-gatekeeper/components/qm/StatusPill";
import { inspections } from "@/apps/quality-gatekeeper/lib/qm-data";

export const Route = createFileRoute("/quality-gatekeeper/sampling")({
  head: () => ({
    meta: [
      { title: "Sampling Plans Â· Axiom WMS" },
      {
        name: "description",
        content: "Active AQL and random sampling plans applied to open inspection lots",
      },
      { property: "og:title", content: "Sampling Plans Â· Axiom WMS" },
      {
        property: "og:description",
        content: "Active AQL and random sampling plans applied to open inspection lots",
      },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <>
      <PageHeader
        breadcrumb={[{ label: "Quality", to: "/quality-gatekeeper" }, { label: "Sampling Plans" }]}
        eyebrow="Screen 05"
        title="Sampling Plans"
        description="Active AQL and random sampling plans applied to open inspection lots"
        actions={
          <Button variant="outline" size="sm" onClick={() => toast.success("Exported")}>
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
        }
      />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {inspections.slice(0, 6).map((i) => (
          <SectionCard key={i.id} title={i.id} description={i.material}>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Lot size</span>
                <span className="num font-medium">
                  {i.qty} {i.uom}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Plan</span>
                <span className="font-medium">AQL 1.0 Â· Level II</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sample size</span>
                <span className="num font-medium">{Math.max(5, Math.round(i.qty * 0.1))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Accept / Reject</span>
                <span className="num font-medium">1 / 2</span>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <StatusPill tone="brand" dot={false}>
                ISO 2859-1
              </StatusPill>
              <StatusPill tone="info">Normal severity</StatusPill>
            </div>
            <Button size="sm" className="mt-3 w-full" asChild>
              <Link to="/quality-gatekeeper/inspection/$id" params={{ id: i.id }}>
                Open sampling step
              </Link>
            </Button>
          </SectionCard>
        ))}
      </div>
    </>
  );
}
