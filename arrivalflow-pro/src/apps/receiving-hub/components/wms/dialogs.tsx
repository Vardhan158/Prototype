import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  CheckCircle2,
  PenLine,
  Truck,
  Warehouse,
  AlertTriangle,
  Boxes,
  ShieldCheck,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { DOCKS } from "@/apps/receiving-hub/lib/wms-data";
import { useWms } from "@/apps/receiving-hub/lib/wms-store";
import { Tone } from "./primitives";

/** Screen 04 â€” Assign Dock (dialog form used from queue, details and dock map). */
export function AssignDockDialog({
  shipmentId,
  onClose,
}: {
  shipmentId: string | null;
  onClose: () => void;
}) {
  const { state, dispatch } = useWms();
  const shipment = state.shipments.find((s) => s.id === shipmentId);
  const free = DOCKS.filter((d) => d.status !== "Maintenance" && d.occupied < d.capacity);
  const suggested = free[0]?.id ?? "D-03";
  const [dock, setDock] = useState(suggested);
  const [confirming, setConfirming] = useState(false);

  if (!shipment) return null;

  return (
    <>
      <Dialog open={!!shipmentId} onOpenChange={(o) => !o && onClose()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Warehouse className="h-4 w-4" /> Assign receiving dock
            </DialogTitle>
            <DialogDescription>
              {shipment.truckNo} Â· {shipment.vendor} Â· {shipment.pallets} pallets Â·{" "}
              {shipment.priority} priority
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-xl border border-primary/30 bg-primary-soft/60 p-3 text-sm">
            <p className="font-medium text-primary">
              Suggested dock {suggested} â€” nearest free bay to{" "}
              {shipment.lines[0]?.storageCondition.includes("Cold")
                ? "cold chain staging"
                : "put-away zone"}
              .
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Optimised on travel distance, bay type and appointment window.
            </p>
          </div>

          <RadioGroup
            value={dock}
            onValueChange={setDock}
            className="max-h-[46vh] gap-2 overflow-y-auto pr-1"
          >
            {DOCKS.map((d) => {
              const disabled = d.status === "Maintenance" || d.occupied >= d.capacity;
              return (
                <label
                  key={d.id}
                  className={`flex items-center gap-3 rounded-xl border p-3 transition ${
                    dock === d.id
                      ? "border-primary bg-primary-soft/50"
                      : "border-border bg-surface-2/40"
                  } ${disabled ? "opacity-50" : "cursor-pointer hover:border-ring"}`}
                >
                  <RadioGroupItem value={d.id} disabled={disabled} />
                  <div className="min-w-0 flex-1">
                    <p className="num text-sm font-semibold">{d.id}</p>
                    <p className="text-xs text-muted-foreground">
                      {d.zone} Â· {d.type} Â· {d.temp}
                    </p>
                  </div>
                  <span className="num text-xs text-muted-foreground">
                    {d.occupied}/{d.capacity}
                  </span>
                  <Tone
                    tone={
                      d.status === "Available"
                        ? "success"
                        : d.status === "Maintenance"
                          ? "destructive"
                          : "warning"
                    }
                  >
                    {d.status}
                  </Tone>
                </label>
              );
            })}
          </RadioGroup>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={() => setConfirming(true)}>Assign dock {dock}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm dock allocation</AlertDialogTitle>
            <AlertDialogDescription>
              {shipment.truckNo} will be called to dock {dock} and reserved for 120 minutes. The
              driver receives an SMS with bay directions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Back</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                dispatch({ type: "assign-dock", id: shipment.id, dock });
                toast.success(`Dock ${dock} assigned`, {
                  description: `${shipment.truckNo} called to bay. Driver notified.`,
                });
                setConfirming(false);
                onClose();
              }}
            >
              Confirm allocation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

/** Screen 17 â€” Approval decision dialog with manager comments + digital signature. */
export function ApprovalDialog({
  shipmentId,
  mode,
  onClose,
}: {
  shipmentId: string | null;
  mode: "approve" | "reject" | "hold";
  onClose: () => void;
}) {
  const { state, dispatch } = useWms();
  const shipment = state.shipments.find((s) => s.id === shipmentId);
  const [comment, setComment] = useState("");
  const [signature, setSignature] = useState("");
  const [ack, setAck] = useState(false);
  if (!shipment) return null;

  const copy = {
    approve: {
      title: "Approve receiving",
      body: "Accepted quantities will be posted and the GRN becomes eligible for generation.",
      cta: "Approve & continue",
    },
    reject: {
      title: "Reject receiving",
      body: "The consignment is refused. A debit note request is raised to procurement.",
      cta: "Confirm rejection",
    },
    hold: {
      title: "Hold receiving",
      body: "Receiving pauses on the dock until the hold is released by a warehouse manager.",
      cta: "Place on hold",
    },
  }[mode];

  return (
    <Dialog open={!!shipmentId} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === "approve" ? (
              <CheckCircle2 className="h-4 w-4 text-success" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-warning" />
            )}
            {copy.title}
          </DialogTitle>
          <DialogDescription>{copy.body}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 rounded-xl border border-border bg-surface-2/50 p-3 text-xs">
            <div>
              <p className="text-muted-foreground">Shipment</p>
              <p className="num font-semibold">{shipment.id}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Truck</p>
              <p className="num font-semibold">{shipment.truckNo}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Vendor</p>
              <p className="font-semibold">{shipment.vendor}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Accepted units</p>
              <p className="num font-semibold">
                {shipment.lines.reduce((a, l) => a + l.accepted, 0).toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mgr-comment">Manager comments</Label>
            <Textarea
              id="mgr-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="e.g. Damaged cartons segregated at bay, vendor claim raised under SLA clause 7.2."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="signature" className="flex items-center gap-1.5">
              <PenLine className="h-3.5 w-3.5" /> Digital signature
            </Label>
            <Input
              id="signature"
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              placeholder="Type full name to sign"
            />
            <p className="text-[0.7rem] text-muted-foreground">
              Signed as {state.role} Â· timestamped and written to the immutable audit log.
            </p>
          </div>

          <label className="flex items-start gap-2 text-xs">
            <Checkbox checked={ack} onCheckedChange={(v) => setAck(!!v)} className="mt-0.5" />
            <span>
              I confirm physical verification against the packing list, invoice and ASN was
              performed.
            </span>
          </label>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant={mode === "reject" ? "destructive" : "default"}
            disabled={!signature || !ack}
            onClick={() => {
              dispatch({
                type: "status",
                id: shipment.id,
                status:
                  mode === "approve" ? "Verification" : mode === "reject" ? "Rejected" : "On Hold",
                note: `${copy.title} by ${state.role}${comment ? ` â€” ${comment}` : ""}`,
              });
              toast[mode === "reject" ? "error" : mode === "hold" ? "warning" : "success"](
                copy.title + " recorded",
                {
                  description: `${shipment.truckNo} Â· signed by ${signature}`,
                },
              );
              onClose();
            }}
          >
            {copy.cta}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Screen 18 â€” Quality inspection transfer. */
export function QualityTransferDialog({
  shipmentId,
  onClose,
}: {
  shipmentId: string | null;
  onClose: () => void;
}) {
  const { state, dispatch } = useWms();
  const navigate = useNavigate();
  const shipment = state.shipments.find((s) => s.id === shipmentId);
  const [inspector, setInspector] = useState("Nisha Bhatt");
  const [priority, setPriority] = useState("High");
  const [due, setDue] = useState("2026-08-01 16:00");
  if (!shipment) return null;

  return (
    <Dialog open={!!shipmentId} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" /> Move to quality inspection
          </DialogTitle>
          <DialogDescription>
            {shipment.grn ?? shipment.id} Â· {shipment.lines.length} line(s) will be staged at
            QA-STAGE-01 under inspection hold.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Assign inspector</Label>
            <Select value={inspector} onValueChange={setInspector}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["Nisha Bhatt", "Ajay Menon", "Farah Qureshi", "Rohit Sinha"].map((i) => (
                  <SelectItem key={i} value={i}>
                    {i}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Inspection priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Critical", "High", "Normal", "Low"].map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="due">Expected completion</Label>
              <Input
                id="due"
                value={due}
                onChange={(e) => setDue(e.target.value)}
                className="num"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              dispatch({ type: "quality", id: shipment.id, inspector, priority, due });
              toast.success("Transferred to quality inspection", {
                description: `${inspector} notified Â· due ${due}`,
              });
              onClose();
              navigate({ to: "/receiving-hub/quality" });
            }}
          >
            Transfer to QA
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Screen 19 â€” Inventory creation. */
export function InventoryDialog({
  shipmentId,
  onClose,
}: {
  shipmentId: string | null;
  onClose: () => void;
}) {
  const { state, dispatch } = useWms();
  const navigate = useNavigate();
  const shipment = state.shipments.find((s) => s.id === shipmentId);
  const [zone, setZone] = useState("Zone C â€” Small Parts");
  const [location, setLocation] = useState("C-12-04");
  if (!shipment) return null;

  return (
    <Dialog open={!!shipmentId} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Boxes className="h-4 w-4 text-primary" /> Generate inventory
          </DialogTitle>
          <DialogDescription>
            Accepted stock from {shipment.grn ?? shipment.id} becomes unrestricted-use inventory
            pending put away.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Warehouse</Label>
              <Input value={shipment.warehouse} readOnly className="num" />
            </div>
            <div className="space-y-2">
              <Label>Storage zone</Label>
              <Select value={zone} onValueChange={setZone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "Zone A â€” Bulk Yard",
                    "Zone B â€” Reels",
                    "Zone C â€” Small Parts",
                    "Zone D â€” Cold Chain",
                  ].map((z) => (
                    <SelectItem key={z} value={z}>
                      {z}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="loc">Temporary location</Label>
            <Input
              id="loc"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="num"
            />
          </div>
          <div className="rounded-xl border border-border bg-surface-2/50 p-3 text-xs">
            {shipment.lines.map((l) => (
              <div key={l.id} className="flex items-center justify-between py-1">
                <span className="num">{l.code}</span>
                <span className="num font-semibold">
                  {l.accepted} {l.uom}
                </span>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              dispatch({ type: "inventory", id: shipment.id, zone, location });
              toast.success("Inventory created", {
                description: `Staged at ${location} Â· pending put away`,
              });
              onClose();
              navigate({ to: "/receiving-hub/inventory" });
            }}
          >
            Create inventory
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Reusable confirmation for destructive floor actions. */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  body,
  cta,
  destructive,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  body: string;
  cta: string;
  destructive?: boolean;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Truck className="h-4 w-4" /> {title}
          </AlertDialogTitle>
          <AlertDialogDescription>{body}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className={
              destructive
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                : ""
            }
            onClick={onConfirm}
          >
            {cta}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
