import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Building2, CheckCircle2, Clock, IdCard, PauseCircle, Truck, XCircle } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/apps/gatepass-pro/components/wms/AppShell";
import { StepIndicator } from "@/apps/gatepass-pro/components/wms/StepIndicator";
import { SummaryCard } from "@/apps/gatepass-pro/components/wms/SummaryCard";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { HOLD_REASONS } from "@/apps/gatepass-pro/lib/wms/data";
import { useWms } from "@/apps/gatepass-pro/lib/wms/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/gatepass-pro/gate-entry/review")({
  head: () => ({
    meta: [
      { title: "Review Gate Entry — GateFlow WMS" },
      { name: "description", content: "Step 4: review truck, driver, vendor and PO details, then approve, hold or reject the arrival." },
      { property: "og:title", content: "Review Gate Entry — GateFlow WMS" },
      { property: "og:description", content: "Confirm the arrival summary and decide: approve, hold or reject." },
    ],
  }),
  component: Review,
});

function Review() {
  const { draft, commitDraft, pushNotification, officer } = useWms();
  const navigate = useNavigate();
  const [decision, setDecision] = useState<null | "Hold" | "Rejected">(null);
  const [reason, setReason] = useState(HOLD_REASONS[0]!);
  const arrival = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

  const approve = () => {
    const created = commitDraft("Waiting Warehouse");
    pushNotification({
      kind: "message",
      title: `Warehouse notified · ${created.vehicle.number}`,
      body: `${created.delivery.dock} · ${created.delivery.vendor} awaiting acceptance.`,
    });
    navigate({ to: "/gatepass-pro/gatepass/$id", params: { id: created.id } });
  };

  const confirmDecision = () => {
    if (!decision) return;
    const created = commitDraft(decision, reason);
    pushNotification({
      kind: decision === "Hold" ? "hold" : "rejected",
      title: `${created.vehicle.number} ${decision === "Hold" ? "put on hold" : "rejected"}`,
      body: reason,
    });
    setDecision(null);
    toast[decision === "Hold" ? "warning" : "error"](
      decision === "Hold" ? "Entry held for supervisor" : "Entry rejected",
      { description: reason },
    );
    navigate({ to: decision === "Hold" ? "/gatepass-pro/approvals" : "/gatepass-pro/entries" });
  };

  return (
    <AppShell title="Review Entry" subtitle="Step 4 · confirm before gate pass" back="/gatepass-pro/gate-entry/delivery">
      <StepIndicator current={4} />

      <div className="grid gap-3">
        <SummaryCard
          icon={Truck}
          title="Truck"
          rows={[
            ["Vehicle No.", draft.vehicle.number ?? "—"],
            ["Type", draft.vehicle.type ?? "—"],
            ["Transporter", draft.vehicle.transporter ?? "—"],
            ["Photos", `${draft.vehicle.truckPhoto ? 1 : 0} truck · ${draft.vehicle.platePhoto ? 1 : 0} plate`],
          ]}
        />
        <SummaryCard
          icon={IdCard}
          title="Driver"
          rows={[
            ["Name", draft.driver.name ?? "—"],
            ["Phone", draft.driver.phone ?? "—"],
            ["License", draft.driver.license ?? "—"],
            ["Expiry", draft.driver.licenseExpiry ?? "—"],
            ["Gov ID", draft.driver.govId ?? "—"],
          ]}
        />
        <SummaryCard
          icon={Building2}
          title="Vendor & PO"
          rows={[
            ["Vendor", draft.delivery.vendor ?? "—"],
            ["PO", draft.delivery.po ?? "—"],
            ["Category", draft.delivery.category ?? "—"],
            ["Dock", draft.delivery.dock ?? "—"],
            ["Pallets", draft.delivery.pallets ?? "—"],
          ]}
        />
        <SummaryCard
          icon={Clock}
          title="Arrival"
          rows={[
            ["Arrival time", arrival],
            ["Gate", officer.gate],
            ["Officer", `${officer.name} (${officer.empId})`],
            ["Voice note", draft.voiceNote ? `${draft.voiceNote}s attached` : "None"],
          ]}
        />
      </div>

      <div className="mt-6 grid gap-3 pb-4">
        <Button className="h-16 rounded-2xl bg-success text-base font-semibold text-success-foreground hover:bg-success/90" onClick={approve}>
          <CheckCircle2 className="size-6" /> Approve &amp; Generate Gate Pass
        </Button>
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="h-14 rounded-2xl border-warning text-warning"
            onClick={() => setDecision("Hold")}
          >
            <PauseCircle className="size-5" /> Hold
          </Button>
          <Button
            variant="outline"
            className="h-14 rounded-2xl border-destructive text-destructive"
            onClick={() => setDecision("Rejected")}
          >
            <XCircle className="size-5" /> Reject
          </Button>
        </div>
      </div>

      <Dialog open={!!decision} onOpenChange={(o) => !o && setDecision(null)}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle>{decision === "Hold" ? "Hold this truck" : "Reject this truck"}</DialogTitle>
            <DialogDescription>Select a reason — it is sent to the warehouse supervisor.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            {HOLD_REASONS.map((r) => (
              <button
                key={r}
                onClick={() => setReason(r)}
                className={cn(
                  "rounded-2xl border p-3 text-left text-sm",
                  reason === r ? "border-primary bg-accent text-accent-foreground" : "border-border",
                )}
              >
                {r}
              </button>
            ))}
          </div>
          <DialogFooter>
            <Button
              className={cn(
                "h-14 w-full rounded-2xl text-base font-semibold",
                decision === "Rejected" && "bg-destructive text-destructive-foreground hover:bg-destructive/90",
              )}
              onClick={confirmDecision}
            >
              Confirm {decision === "Hold" ? "Hold" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}