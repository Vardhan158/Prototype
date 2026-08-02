import { createFileRoute, Link } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { PageHeader, SectionCard } from "@/apps/quality-gatekeeper/components/qm/Primitives";
import { StatusPill } from "@/apps/quality-gatekeeper/components/qm/StatusPill";
import { inspections } from "@/apps/quality-gatekeeper/lib/qm-data";

export const Route = createFileRoute("/quality-gatekeeper/release")({
  head: () => ({
    meta: [
      { title: "Inventory Release Â· Axiom WMS" },
      {
        name: "description",
        content: "Approved quantities queued for posting to unrestricted-use stock and putaway",
      },
      { property: "og:title", content: "Inventory Release Â· Axiom WMS" },
      {
        property: "og:description",
        content: "Approved quantities queued for posting to unrestricted-use stock and putaway",
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
          { label: "Inventory Release" },
        ]}
        eyebrow="Screen 17"
        title="Inventory Release"
        description="Approved quantities queued for posting to unrestricted-use stock and putaway"
        actions={
          <Button variant="outline" size="sm" onClick={() => toast.success("Exported")}>
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
        }
      />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {inspections
          .filter((i) => ["Passed", "Released", "Completed", "Under Review"].includes(i.status))
          .map((i) => (
            <SectionCard key={i.id} title={i.id} description={i.material}>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Approved qty</span>
                  <span className="num font-medium">
                    {i.qty} {i.uom}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Warehouse</span>
                  <span className="truncate font-medium">{i.warehouse}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Zone / bin</span>
                  <span className="num font-medium">A-12-04-B</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Inventory status</span>
                  <span className="font-medium">Unrestricted</span>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="outline" className="flex-1" asChild>
                  <Link to="/quality-gatekeeper/queue/$id" params={{ id: i.id }}>
                    Details
                  </Link>
                </Button>
                <Button size="sm" className="flex-1" asChild>
                  <Link to="/quality-gatekeeper/storage">Move to storage</Link>
                </Button>
              </div>
            </SectionCard>
          ))}
      </div>
    </>
  );
}
