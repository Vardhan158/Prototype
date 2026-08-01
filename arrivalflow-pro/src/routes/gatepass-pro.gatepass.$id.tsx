import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { CheckCircle2, Copy, Printer, Send } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/apps/gatepass-pro/components/wms/AppShell";
import { QrBlock } from "@/apps/gatepass-pro/components/wms/QrBlock";
import { Button } from "@/components/ui/button";
import { StatusChip } from "@/apps/gatepass-pro/components/wms/StatusChip";
import { useWms } from "@/apps/gatepass-pro/lib/wms/store";

export const Route = createFileRoute("/gatepass-pro/gatepass/$id")({
  head: () => ({
    meta: [
      { title: "Gate Pass Generated — GateFlow WMS" },
      { name: "description", content: "QR gate pass with gate entry number, arrival timestamp and warehouse notification status." },
      { property: "og:title", content: "Gate Pass Generated — GateFlow WMS" },
      { property: "og:description", content: "Share or print the QR gate pass and notify the warehouse team." },
    ],
  }),
  component: GatePass,
});

function GatePass() {
  const { id } = useParams({ from: "/gatepass-pro/gatepass/$id" });
  const { entries } = useWms();
  const entry = entries.find((e) => e.id === id) ?? entries[0]!;

  return (
    <AppShell title="Gate Pass Generated" subtitle="Step 5 of 5" back="/gatepass-pro">
      <div className="card-elevated animate-pop-in mb-4 flex flex-col items-center p-6 text-center">
        <span className="grid size-16 place-items-center rounded-full bg-success/15 text-success">
          <CheckCircle2 className="size-9" />
        </span>
        <h2 className="mt-3 text-lg font-bold">Entry Approved</h2>
        <p className="text-xs text-muted-foreground">Warehouse has been notified automatically</p>

        <div className="mt-5 rounded-2xl border p-3">
          <QrBlock value={`${entry.gateNo}|${entry.vehicle.number}|${entry.delivery.po}`} />
        </div>
        <p className="mt-3 text-xl font-extrabold tracking-tight">{entry.gateNo}</p>
        <p className="text-xs text-muted-foreground">
          {entry.vehicle.number} · Arrived {entry.arrival}
        </p>
        <StatusChip status={entry.status} className="mt-3" />
      </div>

      <div className="card-elevated mb-4 grid gap-2 p-4 text-sm">
        {[
          ["Vendor", entry.delivery.vendor],
          ["PO", entry.delivery.po],
          ["Assigned dock", entry.delivery.dock],
          ["Warehouse", entry.warehouse],
          ["Driver", entry.driver.name],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4">
            <span className="text-muted-foreground">{k}</span>
            <span className="text-right font-medium">{v}</span>
          </div>
        ))}
      </div>

      <div className="grid gap-3 pb-4">
        <Button asChild className="h-16 rounded-2xl text-base font-semibold">
          <Link to="/gatepass-pro/entry/$id" params={{ id: entry.id }}>
            <Send className="size-5" /> Track Warehouse Acceptance
          </Link>
        </Button>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="h-14 rounded-2xl" onClick={() => toast.success("Gate pass sent to printer")}>
            <Printer className="size-5" /> Print
          </Button>
          <Button variant="outline" className="h-14 rounded-2xl" onClick={() => toast.success("Gate pass number copied")}>
            <Copy className="size-5" /> Copy No.
          </Button>
        </div>
      </div>
    </AppShell>
  );
}