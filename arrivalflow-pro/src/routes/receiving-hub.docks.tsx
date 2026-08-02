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
import { useState } from "react";
import { Warehouse } from "lucide-react";
import { DOCKS } from "@/apps/receiving-hub/lib/wms-data";
import { AssignDockDialog } from "@/apps/receiving-hub/components/wms/dialogs";

export const Route = createFileRoute("/receiving-hub/docks")({
  head: () => ({
    meta: [
      { title: "Dock Management | AXIOM WMS Inbound" },
      {
        name: "description",
        content:
          "Live warehouse dock map with bay availability, capacity, occupancy and suggested allocation for inbound trucks.",
      },
      { property: "og:title", content: "Dock Management | AXIOM WMS Inbound" },
      {
        property: "og:description",
        content:
          "Live warehouse dock map with bay availability, capacity, occupancy and suggested allocation for inbound trucks.",
      },
    ],
  }),
  component: DocksPage,
});

function DocksPage() {
  const { state } = useWms();
  const [assign, setAssign] = useState<string | null>(null);
  const waiting = state.shipments.filter((s) => !s.dock && s.status === "Waiting");
  return (
    <div className="mx-auto max-w-[1600px]">
      <PageHeader
        title="Dock Management"
        subtitle="10 inbound bays across 4 zones Â· live occupancy from yard sensors"
        crumbs={[{ label: "Inbound", to: "/receiving-hub" }, { label: "Dock Management" }]}
      />
      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="elevated-card xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Warehouse dock map</CardTitle>
            <CardDescription>Tap a bay to inspect capacity and current vehicle</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {DOCKS.map((d) => (
              <div
                key={d.id}
                className={`rounded-2xl border p-3 transition ${d.status === "Available" ? "border-success/30 bg-success-soft" : d.status === "Maintenance" ? "border-destructive/25 bg-destructive-soft" : "border-warning/30 bg-warning-soft"}`}
              >
                <p className="num text-sm font-semibold">{d.id}</p>
                <p className="text-[0.7rem] text-muted-foreground">{d.type}</p>
                <p className="num mt-2 text-xs">
                  {d.occupied}/{d.capacity} bays
                </p>
                <p className="text-[0.68rem] text-muted-foreground">{d.temp}</p>
                <Tone
                  tone={
                    d.status === "Available"
                      ? "success"
                      : d.status === "Maintenance"
                        ? "destructive"
                        : "warning"
                  }
                  className="mt-2"
                >
                  {d.status}
                </Tone>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="elevated-card">
          <CardHeader>
            <CardTitle className="text-base">Awaiting allocation</CardTitle>
            <CardDescription>{waiting.length} trucks in yard queue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {waiting.length === 0 && (
              <EmptyState
                icon={Warehouse}
                title="Yard is clear"
                body="Every truck in the yard has an assigned dock. New arrivals appear here automatically."
              />
            )}
            {waiting.map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-3 rounded-xl border border-border bg-surface-2/50 p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="num text-sm font-semibold">{s.truckNo}</p>
                  <p className="truncate text-xs text-muted-foreground">{s.vendor}</p>
                </div>
                <Button size="sm" onClick={() => setAssign(s.id)}>
                  Assign
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <AssignDockDialog shipmentId={assign} onClose={() => setAssign(null)} />
    </div>
  );
}
