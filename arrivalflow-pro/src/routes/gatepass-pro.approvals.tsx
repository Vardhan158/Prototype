import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/apps/gatepass-pro/components/wms/AppShell";
import { StatusChip } from "@/apps/gatepass-pro/components/wms/StatusChip";
import { Button } from "@/components/ui/button";
import { useWms } from "@/apps/gatepass-pro/lib/wms/store";

export const Route = createFileRoute("/gatepass-pro/approvals")({
  head: () => ({
    meta: [
      { title: "Pending Approvals — GateFlow WMS" },
      { name: "description", content: "Supervisor queue for held trucks with hold reasons, approve and reject actions." },
      { property: "og:title", content: "Pending Approvals — GateFlow WMS" },
      { property: "og:description", content: "Clear held trucks with supervisor approve or reject decisions." },
    ],
  }),
  component: Approvals,
});

function Approvals() {
  const { entries, setStatus, pushNotification } = useWms();
  const [busy, setBusy] = useState<string | null>(null);
  const held = entries.filter((e) => e.status === "Hold");

  const act = (id: string, approve: boolean) => {
    setBusy(id);
    const e = entries.find((x) => x.id === id);
    setStatus(id, approve ? "Waiting Warehouse" : "Rejected");
    pushNotification({
      kind: approve ? "accepted" : "rejected",
      title: `${e?.vehicle.number} ${approve ? "approved by supervisor" : "rejected by supervisor"}`,
      body: e?.holdReason ?? "",
    });
    toast[approve ? "success" : "error"](approve ? "Hold released" : "Truck rejected");
    setBusy(null);
  };

  return (
    <AppShell title="Pending Approvals" subtitle={`${held.length} trucks on hold`} back="/gatepass-pro">
      {held.length === 0 ? (
        <p className="mt-10 text-center text-sm text-muted-foreground">No trucks waiting for supervisor approval.</p>
      ) : (
        <div className="grid gap-3">
          {held.map((e) => (
            <div key={e.id} className="card-elevated p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-base font-semibold">{e.vehicle.number}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {e.delivery.vendor} · PO {e.delivery.po} · {e.arrival}
                  </p>
                </div>
                <StatusChip status={e.status} />
              </div>
              <p className="mt-3 rounded-xl bg-warning/15 p-3 text-xs font-medium text-warning">
                Hold reason: {e.holdReason}
              </p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <Button
                  disabled={busy === e.id}
                  className="h-14 rounded-2xl bg-success text-success-foreground hover:bg-success/90"
                  onClick={() => act(e.id, true)}
                >
                  <CheckCircle2 className="size-5" /> Approve
                </Button>
                <Button
                  disabled={busy === e.id}
                  variant="outline"
                  className="h-14 rounded-2xl border-destructive text-destructive"
                  onClick={() => act(e.id, false)}
                >
                  <XCircle className="size-5" /> Reject
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}