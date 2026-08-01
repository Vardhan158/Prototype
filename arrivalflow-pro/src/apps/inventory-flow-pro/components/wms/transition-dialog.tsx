import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, PenLine, ShieldCheck, XCircle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { STATUS_META, TRANSITIONS, statusTone, type InventoryStatus } from "@/apps/inventory-flow-pro/lib/wms/statuses";
import { TRANSITION_REASONS } from "@/apps/inventory-flow-pro/lib/wms/derive";
import type { InventoryItem } from "@/apps/inventory-flow-pro/lib/wms/data";
import { useWms } from "@/apps/inventory-flow-pro/lib/wms/store";
import { StatusChip } from "./primitives";

export function TransitionDialog({
  item,
  open,
  onOpenChange,
  presetNext,
}: {
  item: InventoryItem | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  presetNext?: InventoryStatus;
}) {
  const { transition, validate, currentUser } = useWms();
  const [next, setNext] = useState<InventoryStatus | "">("");
  const [reason, setReason] = useState(TRANSITION_REASONS[0]!);
  const [remarks, setRemarks] = useState("");
  const [signature, setSignature] = useState("");
  const [ack, setAck] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setNext(presetNext ?? "");
      setRemarks("");
      setSignature("");
      setAck(false);
      setSubmitting(false);
    }
  }, [open, presetNext, item?.id]);

  const allowed = item ? TRANSITIONS[item.status] : [];
  const blocked = useMemo(
    () =>
      item
        ? (Object.keys(STATUS_META) as InventoryStatus[]).filter(
            (s) => s !== item.status && !allowed.includes(s),
          )
        : [],
    [item, allowed],
  );

  const check = item && next ? validate(item.id, next) : null;
  const approvalNeeded = next ? STATUS_META[next].approvalRequired : false;
  const canSubmit =
    !!item && !!next && !!check?.ok && (!approvalNeeded || (signature.trim().length > 2 && ack));

  if (!item) return null;

  const submit = () => {
    if (!next) return;
    setSubmitting(true);
    setTimeout(() => {
      const res = transition(item.id, next, {
        reason,
        remarks,
        ...(signature.trim() ? { signature: signature.trim() } : {}),
      });
      setSubmitting(false);
      if (res.ok) onOpenChange(false);
    }, 700);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            Status transition · {item.id}
          </DialogTitle>
          <DialogDescription>
            {item.materialCode} — {item.materialName} · {item.quantity} {item.uom} ·{" "}
            {item.warehouseCode}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-muted/40 p-3">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Current status
              </p>
              <div className="mt-1">
                <StatusChip status={item.status} size="md" />
              </div>
            </div>
            <span className="text-muted-foreground">→</span>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Target status
              </p>
              <div className="mt-1">
                {next ? (
                  <StatusChip status={next} size="md" />
                ) : (
                  <span className="text-xs text-muted-foreground">Select a target status</span>
                )}
              </div>
            </div>
          </div>

          <div>
            <Label className="text-xs">Next allowed status (per lifecycle rule matrix)</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {allowed.map((s) => {
                const tone = statusTone(s);
                const active = next === s;
                const Icon = STATUS_META[s].icon;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setNext(s)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all",
                      active ? cn(tone.chip, "ring-2 ring-primary/30") : "border-border hover:bg-muted",
                    )}
                  >
                    <Icon className="size-3.5" /> {STATUS_META[s].label}
                  </button>
                );
              })}
              {allowed.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Terminal status — no further transitions are permitted.
                </p>
              )}
            </div>
            {blocked.length > 0 && (
              <p className="mt-2 text-[11px] text-muted-foreground">
                Blocked by rules: {blocked.slice(0, 6).map((b) => STATUS_META[b].label).join(", ")}
                {blocked.length > 6 ? ` +${blocked.length - 6} more` : ""}
              </p>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label className="text-xs">Reason code</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger className="mt-1.5 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TRANSITION_REASONS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Processed by</Label>
              <Input
                className="mt-1.5"
                readOnly
                value={`${currentUser.name} · ${currentUser.role}`}
              />
            </div>
          </div>

          <div>
            <Label className="text-xs">Remarks / inspection note</Label>
            <Textarea
              className="mt-1.5"
              rows={2}
              placeholder="Recorded on the audit trail against this transition…"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>

          {check && (
            <div
              className={cn(
                "flex items-start gap-2.5 rounded-xl border p-3 text-xs",
                check.ok
                  ? "border-success/30 bg-success/10 text-success"
                  : "border-destructive/30 bg-destructive/10 text-destructive",
              )}
            >
              {check.ok ? (
                <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
              ) : (
                <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              )}
              <div>
                <p className="font-semibold">
                  {check.ok ? "Validation passed" : "Transition blocked by business rule"}
                </p>
                <p className="mt-0.5 opacity-90">{check.message}</p>
              </div>
            </div>
          )}

          {approvalNeeded && (
            <div className="space-y-3 rounded-xl border border-warning/30 bg-warning/10 p-3">
              <p className="flex items-center gap-2 text-xs font-semibold text-warning">
                <ShieldCheck className="size-4" /> Approval and digital signature required for{" "}
                {next ? STATUS_META[next].label : ""}
              </p>
              <div>
                <Label className="text-xs">Digital signature (type full name)</Label>
                <div className="relative mt-1.5">
                  <PenLine className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                  <Input
                    className="pl-8 font-medium italic"
                    placeholder={currentUser.name}
                    value={signature}
                    onChange={(e) => setSignature(e.target.value)}
                  />
                </div>
              </div>
              <label className="flex items-start gap-2 text-[11px] leading-snug">
                <Checkbox checked={ack} onCheckedChange={(v) => setAck(v === true)} />
                <span>
                  I confirm this transition complies with SOP-WM-114 and understand it is written to
                  the immutable audit trail.
                </span>
              </label>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          <Button
            variant="outline"
            className="border-destructive/40 text-destructive hover:bg-destructive/10"
            onClick={() => onOpenChange(false)}
          >
            <XCircle className="size-4" /> Reject
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button disabled={!canSubmit || submitting} onClick={submit}>
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Posting…
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-4" /> Approve transition
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
