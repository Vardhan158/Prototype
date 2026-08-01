import { createFileRoute, useParams, Link } from "@tanstack/react-router";
import { Truck, Weight, FileCheck2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AppShell } from "@/apps/gate-pass-pro/components/wms/AppShell";

export const Route = createFileRoute("/gate-pass-pro/vehicles/$id")({
  head: () => ({
    meta: [
      { title: "Vehicle Master — NexusWMS" },
      { name: "description", content: "Vehicle master record: registration, capacity, insurance, PUC/fitness validity and gate visit history." },
      { property: "og:title", content: "Vehicle Master — NexusWMS" },
      { property: "og:description", content: "Vehicle compliance and visit history." },
    ],
  }),
  component: VehicleDetail,
});

function VehicleDetail() {
  const { id } = useParams({ from: "/gate-pass-pro/vehicles/$id" });

  return (
    <AppShell title="Vehicle Master" subtitle={`Registration ${id}`}>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="surface-card p-5">
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary"><Truck className="h-5 w-5" /></span>
          <h2 className="mt-3 font-mono text-base font-semibold">{id}</h2>
          <p className="text-xs text-muted-foreground">Trailer 40ft · VRL Logistics Ltd.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge className="bg-success/15 text-[10px] text-success">Insurance valid</Badge>
            <Badge className="bg-success/15 text-[10px] text-success">Fitness valid</Badge>
            <Badge className="bg-warning/15 text-[10px] text-warning">PUC expires in 21 days</Badge>
          </div>
          <dl className="mt-4 space-y-2 text-xs">
            <div className="flex justify-between"><dt className="text-muted-foreground">Tare weight</dt><dd className="inline-flex items-center gap-1"><Weight className="h-3 w-3" />14.20 T</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Payload capacity</dt><dd>25.00 T</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Total gate visits</dt><dd>132</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Last visit</dt><dd>18 Feb 2026</dd></div>
          </dl>
        </div>

        <div className="surface-card p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold">Gate visit history</h3>
          <div className="mt-3 divide-y divide-border">
            {[
              ["GE-2026-004821", "Tata Steel Ltd.", "18 Feb 2026 · 08:42", "24.6 T net", "Completed"],
              ["GE-2026-004566", "Tata Steel Ltd.", "11 Feb 2026 · 09:15", "23.9 T net", "Completed"],
              ["GE-2026-004230", "Reliance Polymers", "29 Jan 2026 · 11:30", "21.4 T net", "Completed"],
            ].map((r) => (
              <div key={r[0]} className="flex flex-wrap items-center gap-3 py-3 text-xs">
                <Link to="/gate-pass-pro/gate-entry" className="font-mono font-semibold text-primary hover:underline">{r[0]}</Link>
                <span className="text-muted-foreground">{r[1]}</span>
                <span className="ml-auto text-muted-foreground">{r[2]}</span>
                <span>{r[3]}</span>
                <span className="text-muted-foreground">{r[4]}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 inline-flex items-center gap-2 text-[11px] text-muted-foreground">
            <FileCheck2 className="h-3.5 w-3.5" /> Documents auto-validated against the transporter master at every entry.
          </p>
          <Button variant="outline" size="sm" className="mt-4" asChild><Link to="/gate-pass-pro/gate-entry">Back to register</Link></Button>
        </div>
      </div>
    </AppShell>
  );
}
