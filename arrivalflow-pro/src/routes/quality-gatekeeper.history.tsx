import { createFileRoute, Link } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { PageHeader, SectionCard } from "@/apps/quality-gatekeeper/components/qm/Primitives";
import { StatusPill } from "@/apps/quality-gatekeeper/components/qm/StatusPill";
import { inspections, statusTone } from "@/apps/quality-gatekeeper/lib/qm-data";

export const Route = createFileRoute("/quality-gatekeeper/history")({
  head: () => ({
    meta: [
      { title: "Inspection History Â· Axiom WMS" },
      {
        name: "description",
        content:
          "Chronological record of completed inspections with inspector, disposition and linked documents",
      },
      { property: "og:title", content: "Inspection History Â· Axiom WMS" },
      {
        property: "og:description",
        content:
          "Chronological record of completed inspections with inspector, disposition and linked documents",
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
          { label: "Inspection History" },
        ]}
        eyebrow="Screen 18"
        title="Inspection History"
        description="Chronological record of completed inspections with inspector, disposition and linked documents"
        actions={
          <Button variant="outline" size="sm" onClick={() => toast.success("Exported")}>
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
        }
      />
      <SectionCard padded={false}>
        <ol className="divide-y divide-border">
          {inspections.map((i) => (
            <li
              key={i.id}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Link
                    to="/quality-gatekeeper/queue/$id"
                    params={{ id: i.id }}
                    className="num truncate text-xs font-semibold text-primary hover:underline"
                  >
                    {i.id}
                  </Link>
                  <span className="num text-[11px] text-muted-foreground">{i.receivedOn}</span>
                </div>
                <p className="mt-0.5 truncate text-sm font-medium">{i.material}</p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {i.vendor} Â· {i.inspector} Â· {i.qty} {i.uom} Â· 6 photos
                </p>
              </div>
              <StatusPill tone={statusTone[i.status]}>{i.status}</StatusPill>
            </li>
          ))}
        </ol>
      </SectionCard>
    </>
  );
}
