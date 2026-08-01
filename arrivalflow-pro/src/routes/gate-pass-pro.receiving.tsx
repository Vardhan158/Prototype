import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, PackageCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppShell } from "@/apps/gate-pass-pro/components/wms/AppShell";

export const Route = createFileRoute("/gate-pass-pro/receiving")({
  head: () => ({
    meta: [
      { title: "Goods Receiving & GRN — NexusWMS" },
      { name: "description", content: "Handoff from gate entry into Module 03: Goods Receiving and GRN management." },
      { property: "og:title", content: "Goods Receiving & GRN — NexusWMS" },
      { property: "og:description", content: "Next module in the inbound flow." },
    ],
  }),
  component: Receiving,
});

function Receiving() {
  return (
    <AppShell title="Goods Receiving &amp; GRN Management" subtitle="Module 03 · continues from Gate Entry &amp; Arrival Management">
      <div className="surface-card mx-auto max-w-xl p-10 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
          <PackageCheck className="h-6 w-6" />
        </span>
        <h2 className="mt-4 text-lg font-semibold">Truck handed over to Receiving</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Gate pass GP-2026-004821 verified at Dock D-04. Unloading, quality inspection and GRN posting
          are handled in Module 03, which is outside this prototype's scope.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Button variant="outline" asChild><Link to="/gate-pass-pro/queue">Back to yard queue</Link></Button>
          <Button asChild><Link to="/gate-pass-pro">Gate control tower <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
        </div>
      </div>
    </AppShell>
  );
}
