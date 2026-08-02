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
import { TriangleAlert, Check, Search } from "lucide-react";
import { exceptions } from "@/apps/wave-flow/lib/wms-data";

export const Route = createFileRoute("/wave-flow/exceptions")({
  head: () => ({
    meta: [
      { title: "Exception Management â€” NexusWMS" },
      {
        name: "description",
        content:
          "Track and resolve shortage, damage, wrong item, picking, packing and loading exceptions across the outbound flow.",
      },
      { property: "og:title", content: "Exception Management â€” NexusWMS" },
      {
        property: "og:description",
        content:
          "Track and resolve shortage, damage, wrong item, picking, packing and loading exceptions across the outbound flow.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Exception Management"
        description="2 open Â· 2 in review Â· 1 resolved today"
        breadcrumb={["Outbound", "Exceptions"]}
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Open exceptions"
          value={1}
          sub="1 critical shortage"
          tone="danger"
          icon={<TriangleAlert className="size-4" />}
        />
        <KpiCard
          label="In review"
          value={2}
          sub="Avg age 42 min"
          tone="warning"
          icon={<Search className="size-4" />}
        />
        <KpiCard
          label="Resolved today"
          value={2}
          sub="Avg resolution 26 min"
          tone="success"
          icon={<Check className="size-4" />}
        />
        <KpiCard
          label="Impacted orders"
          value={4}
          sub="1 SLA at risk"
          tone="primary"
          icon={<TriangleAlert className="size-4" />}
        />
      </div>
      <SectionCard bodyClassName="p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-sm">
            <thead className="bg-surface-muted text-xs text-muted-foreground">
              <tr>
                {[
                  "ID",
                  "Type",
                  "Severity",
                  "Order",
                  "Wave",
                  "Location",
                  "Raised by",
                  "Raised at",
                  "Status",
                  "",
                ].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left font-medium whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {exceptions.map((e) => (
                <tr key={e.id} className="hover:bg-muted/50">
                  <td className="num px-4 py-3 font-medium">{e.id}</td>
                  <td className="px-4 py-3">{e.type}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={e.severity} />
                  </td>
                  <td className="num px-4 py-3 text-muted-foreground">{e.order}</td>
                  <td className="num px-4 py-3 text-muted-foreground">{e.wave}</td>
                  <td className="num px-4 py-3">{e.bin}</td>
                  <td className="px-4 py-3 text-muted-foreground">{e.raisedBy}</td>
                  <td className="num px-4 py-3 whitespace-nowrap text-muted-foreground">{e.at}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={e.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toast.success(`${e.id} resolved`, { description: e.detail })}
                    >
                      Resolve
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
      <div className="grid gap-4 lg:grid-cols-2">
        {exceptions.slice(0, 2).map((e) => (
          <SectionCard
            key={e.id}
            title={`${e.id} Â· ${e.type}`}
            description={e.detail}
            actions={<StatusBadge status={e.status} />}
          >
            <div className="grid grid-cols-2 gap-3">
              <Metric label="Order" value={e.order} />
              <Metric label="Wave" value={e.wave} />
              <Metric label="Location" value={e.bin} />
              <Metric label="Raised" value={e.at} />
            </div>
            <div className="mt-3 flex gap-2">
              <Button size="sm" onClick={() => toast.success(`Cycle count requested for ${e.bin}`)}>
                Request cycle count
              </Button>
              <Button size="sm" variant="outline" onClick={() => toast.info("Supervisor notified")}>
                Escalate
              </Button>
            </div>
          </SectionCard>
        ))}
      </div>
    </div>
  );
}
