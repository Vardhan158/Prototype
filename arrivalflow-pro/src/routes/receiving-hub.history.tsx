import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  PageHeader,
  StatusPill,
  Tone,
  Field,
  EmptyState,
} from "@/apps/receiving-hub/components/wms/primitives";
import { useWms } from "@/apps/receiving-hub/lib/wms-store";

export const Route = createFileRoute("/receiving-hub/history")({
  head: () => ({
    meta: [
      { title: "Receiving History | AXIOM WMS Inbound" },
      {
        name: "description",
        content:
          "Historical receipts by truck, vendor, GRN and material with a full chronological timeline.",
      },
      { property: "og:title", content: "Receiving History | AXIOM WMS Inbound" },
      {
        property: "og:description",
        content:
          "Historical receipts by truck, vendor, GRN and material with a full chronological timeline.",
      },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const { state } = useWms();
  const done = state.shipments.filter((s) =>
    ["Completed", "GRN Generated", "Transferred To Quality", "Rejected"].includes(s.status),
  );
  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        title="Receiving History"
        subtitle={`${done.length} closed receipts in the last 7 days`}
        crumbs={[{ label: "Inbound", to: "/receiving-hub" }, { label: "Receiving History" }]}
      />
      <div className="space-y-3">
        {done.map((s) => (
          <Card key={s.id} className="elevated-card">
            <CardContent className="p-5">
              <div className="flex flex-wrap items-center gap-4">
                <div className="min-w-[220px] flex-1">
                  <Link
                    to="/receiving-hub/queue/$id"
                    params={{ id: s.id }}
                    className="num text-sm font-semibold text-primary hover:underline"
                  >
                    {s.truckNo}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {s.vendor} Â· {s.po} Â· {s.grn ?? "No GRN"}
                  </p>
                </div>
                <StatusPill status={s.status} />
                <span className="num text-xs text-muted-foreground">{s.arrival}</span>
              </div>
              <ol className="mt-4 space-y-2 border-l border-border pl-4">
                {s.timeline.slice(-3).map((t, i) => (
                  <li key={i} className="text-xs">
                    <span className="num text-muted-foreground">{t.at}</span> â€” {t.label}{" "}
                    <span className="text-muted-foreground">({t.actor})</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
