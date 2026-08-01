import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldQuestion, CheckCircle2, XCircle, MessageSquare, Clock, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { AppShell } from "@/apps/gate-pass-pro/components/wms/AppShell";
import { StatusChip } from "@/apps/gate-pass-pro/components/wms/StatusChip";
import { gateEntries, holdReasons } from "@/apps/gate-pass-pro/lib/wms-data";

export const Route = createFileRoute("/gate-pass-pro/pending-approval")({
  head: () => ({
    meta: [
      { title: "Pending Approvals — NexusWMS" },
      { name: "description", content: "Security supervisor queue for trucks on hold or awaiting gate entry approval with reasons and SLA timers." },
      { property: "og:title", content: "Pending Approvals — NexusWMS" },
      { property: "og:description", content: "Supervisor decisions on held and pending trucks." },
    ],
  }),
  component: PendingApproval,
});

function PendingApproval() {
  const [items, setItems] = useState(() =>
    gateEntries.filter((e) => ["Pending Approval", "On Hold"].includes(e.status)),
  );
  const [dialog, setDialog] = useState<null | { type: "approve" | "reject" | "info"; id: string }>(null);

  return (
    <AppShell
      title="Pending Approvals"
      subtitle="Security Supervisor · M. Deshpande · SLA breach after 45 minutes at gate"
    >
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ["Awaiting decision", String(items.length), "text-warning"],
          ["Breaching SLA", "1", "text-destructive"],
          ["Approved today", "12", "text-success"],
        ].map(([k, v, c]) => (
          <div key={k} className="surface-card p-4">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{k}</p>
            <p className={`mt-1 text-2xl font-semibold ${c}`}>{v}</p>
          </div>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="mt-4 surface-card p-16 text-center">
          <ShieldQuestion className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 text-sm font-semibold">Nothing waiting for approval</p>
          <p className="text-xs text-muted-foreground">All trucks at the gate have been cleared.</p>
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          {items.map((e) => (
            <div key={e.id} className="surface-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Link to="/gate-pass-pro/gate-entry/$id" params={{ id: e.id }} className="font-mono text-sm font-semibold text-primary hover:underline">
                      {e.id}
                    </Link>
                    <StatusChip status={e.status} />
                    {e.waitingMin > 35 && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold text-destructive">
                        <AlertTriangle className="h-3 w-3" /> SLA breach
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm font-medium">{e.truck} · {e.vendor}</p>
                  <p className="text-[11px] text-muted-foreground">
                    Driver {e.driver} · PO {e.po} · Arrived {e.arrival.slice(11)} · {e.gate}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-lg bg-muted px-2 py-1 text-[11px] font-medium">
                  <Clock className="h-3.5 w-3.5" /> {e.waitingMin} min at gate
                </span>
              </div>

              <p className="mt-3 rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-xs font-medium text-warning">
                Reason: {e.holdReason ?? "Awaiting supervisor review"}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" onClick={() => setDialog({ type: "approve", id: e.id })}>
                  <CheckCircle2 className="mr-2 h-4 w-4" />Approve
                </Button>
                <Button size="sm" variant="destructive" onClick={() => setDialog({ type: "reject", id: e.id })}>
                  <XCircle className="mr-2 h-4 w-4" />Reject
                </Button>
                <Button size="sm" variant="outline" onClick={() => setDialog({ type: "info", id: e.id })}>
                  <MessageSquare className="mr-2 h-4 w-4" />Request more information
                </Button>
                <Button size="sm" variant="ghost" asChild>
                  <Link to="/gate-pass-pro/gate-entry/$id" params={{ id: e.id }}>Open full entry</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!dialog} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialog?.type === "approve" && "Approve gate entry"}
              {dialog?.type === "reject" && "Reject gate entry"}
              {dialog?.type === "info" && "Request more information"}
            </DialogTitle>
            <DialogDescription>{dialog?.id} · decision is written to the audit trail with your user ID.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {dialog?.type !== "approve" && (
              <div className="space-y-1.5">
                <Label>Reason</Label>
                <Select defaultValue={holdReasons[0]!}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{holdReasons.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-1.5">
              <Label>Supervisor remarks</Label>
              <Textarea placeholder="Add context for the security officer and vendor…" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>Cancel</Button>
            <Button
              variant={dialog?.type === "reject" ? "destructive" : "default"}
              onClick={() => {
                if (!dialog) return;
                if (dialog.type === "approve") {
                  const entry = gateEntries.find((e) => e.id === dialog.id);
                  if (entry) entry.status = "Approved";
                  toast.success(`${dialog.id} approved · gate pass generated`);
                  setItems((p) => p.filter((i) => i.id !== dialog.id));
                } else if (dialog.type === "reject") {
                  const entry = gateEntries.find((e) => e.id === dialog.id);
                  if (entry) entry.status = "Rejected";
                  toast.error(`${dialog.id} rejected · vendor notified`);
                  setItems((p) => p.filter((i) => i.id !== dialog.id));
                } else if (dialog.type === "info") {
                  const entry = gateEntries.find((e) => e.id === dialog.id);
                  // In a real app, you might change status to something like "Info Requested"
                  // For now, we just show a toast.
                  toast.info(`Information requested for ${dialog.id}`);
                }
                setDialog(null);
              }}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
