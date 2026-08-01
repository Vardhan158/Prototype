import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { BellRing, CheckCheck, Info, ShieldAlert, TriangleAlert } from "lucide-react";
import { PageHeader } from "@/apps/storage-guardian/components/warehouse/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWarehouse } from "@/apps/storage-guardian/lib/warehouse/store";

export const Route = createFileRoute("/storage-guardian/alerts")({
  head: () => ({
    meta: [
      { title: "Exception Alerts — NODE·WMS" },
      {
        name: "description",
        content:
          "Exception handling console: ASN/PO mismatch, receiving variance, failed QC, QR errors, zone-full escalations and resolution actions.",
      },
      { property: "og:title", content: "Exception Alerts — NODE·WMS" },
      {
        property: "og:description",
        content: "Track and resolve every warehouse exception from receiving through put-away.",
      },
    ],
  }),
  component: AlertsPage,
});

const ICON = {
  critical: ShieldAlert,
  warning: TriangleAlert,
  info: Info,
} as const;

const TONE = {
  critical: "border-destructive/40 bg-destructive/10 text-destructive",
  warning: "border-warning/40 bg-warning/10 text-warning",
  info: "border-primary/40 bg-primary/10 text-primary",
} as const;

function AlertsPage() {
  const { alerts, resolveAlert } = useWarehouse();
  const [tab, setTab] = useState("open");
  const rows = alerts.filter((a) => (tab === "open" ? !a.resolved : tab === "resolved" ? a.resolved : true));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Exception Alerts"
        subtitle="Every stage exception with its recommended resolution workflow."
        action={
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="open">Open ({alerts.filter((a) => !a.resolved).length})</TabsTrigger>
              <TabsTrigger value="resolved">Resolved</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>
          </Tabs>
        }
      />

      <div className="space-y-3">
        {rows.length === 0 && (
          <p className="panel flex items-center gap-2 p-6 text-sm text-muted-foreground">
            <BellRing className="size-4" /> Nothing here — the floor is clean.
          </p>
        )}
        {rows.map((a) => {
          const Icon = ICON[a.severity];
          return (
            <article key={a.id} className="panel flex flex-wrap items-start gap-4 p-4">
              <div className={`grid size-9 shrink-0 place-items-center rounded-md border ${TONE[a.severity]}`}>
                <Icon className="size-4" />
              </div>
              <div className="min-w-56 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold">{a.type}</h3>
                  <Badge variant="outline" className={TONE[a.severity]}>{a.severity}</Badge>
                  {a.itemId && <span className="font-mono text-[11px] text-muted-foreground">{a.itemId}</span>}
                  {a.resolved && <Badge variant="secondary">resolved</Badge>}
                </div>
                <p className="mt-1 text-sm">{a.message}</p>
                <p className="mt-1 text-xs text-muted-foreground">Suggested action: {a.suggestion}</p>
              </div>
              {!a.resolved && (
                <Button size="sm" variant="outline" onClick={() => { resolveAlert(a.id); toast.success("Exception resolved and logged."); }}>
                  <CheckCheck className="size-4" /> Resolve
                </Button>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
