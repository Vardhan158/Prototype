import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  Bell,
  Check,
  CheckCircle2,
  Plus,
  ScanLine,
  ShieldCheck,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ApprovalDialog, type ApprovalResult } from "@/apps/receiving-hub/shared/ApprovalDialog";
import { PageHeader } from "@/apps/receiving-hub/shared/PageHeader";
import { StatusChip } from "@/apps/receiving-hub/shared/StatusChip";
import { Stepper } from "@/apps/receiving-hub/shared/Stepper";
import { useWms } from "@/apps/receiving-hub/context/WmsContext";
import { supplierById, warehouseById, warehouses } from "@/apps/receiving-hub/data";
import { fmtDateTime, inr, qty, variance } from "@/apps/receiving-hub/format";
import type { Discrepancy, DiscrepancyType, Grn, GrnLine } from "@/apps/receiving-hub/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/receiving-hub/grn/new")({
  validateSearch: (s: Record<string, unknown>) => ({
    po: typeof s["po"] === "string" ? (s["po"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "New Goods Receipt Note — NexusWMS" },
      {
        name: "description",
        content:
          "Capture gate entry, line quantities, serials and batches, discrepancies and generate a GRN.",
      },
      { property: "og:title", content: "New Goods Receipt Note — NexusWMS" },
      {
        property: "og:description",
        content: "Capture receipt details and generate a goods receipt note.",
      },
    ],
  }),
  component: NewGrn,
});

const STEPS = ["Header", "Line Items", "Serial & Batch", "Discrepancies", "Review & Submit"];
const DSC_TYPES: DiscrepancyType[] = [
  "Damage",
  "Quantity Mismatch",
  "Wrong Item",
  "Missing Documents",
  "Packaging Damage",
];

interface DraftBatch {
  id: string;
  lineId: string;
  batchNo: string;
  mfgDate: string;
  expiryDate: string;
  qty: number;
}

function NewGrn() {
  const { po: poParam } = Route.useSearch();
  const navigate = useNavigate();
  const { pos, nextGrnId, nextDiscrepancyId, commitGrn } = useWms();

  const [poNumber, setPoNumber] = useState(poParam ?? pos.find((p) => p.status === "Open")?.poNumber ?? "");
  const po = pos.find((p) => p.poNumber === poNumber);
  const [grnId] = useState(() => nextGrnId());

  const [step, setStep] = useState(0);
  const [warehouseId, setWarehouseId] = useState(po?.warehouseId ?? "WH-01");
  const [dockId, setDockId] = useState("");
  const [vehicleNo, setVehicleNo] = useState("");
  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");
  const [transporter, setTransporter] = useState("Safexpress");
  const [gateEntryNo] = useState(`GE-2026-${Math.floor(1200 + Math.random() * 90)}`);
  const [gateEntryTime] = useState(() => new Date().toISOString());
  const [receiver, setReceiver] = useState("A. Mehta");
  const [invoiceNo, setInvoiceNo] = useState("");
  const [remarks, setRemarks] = useState("");

  const [received, setReceived] = useState<Record<string, number>>({});
  const [rejected, setRejected] = useState<Record<string, number>>({});
  const [serials, setSerials] = useState<Record<string, string[]>>({});
  const [batches, setBatches] = useState<DraftBatch[]>([]);
  const [drafts, setDrafts] = useState<Discrepancy[]>([]);
  const [approval, setApproval] = useState<ApprovalResult | null>(null);
  const [approvalOpen, setApprovalOpen] = useState(false);
  const [serialLine, setSerialLine] = useState<string | null>(null);
  const [dscOpen, setDscOpen] = useState(false);
  const [doneOpen, setDoneOpen] = useState(false);

  const wh = warehouseById(warehouseId);

  const lines: GrnLine[] = useMemo(
    () =>
      (po?.lines ?? []).map((l) => ({
        id: l.id,
        sku: l.sku,
        description: l.description,
        uom: l.uom,
        orderedQty: l.orderedQty,
        previouslyReceived: l.receivedQty,
        receivedQty: received[l.id] ?? 0,
        rejectedQty: rejected[l.id] ?? 0,
        trackingType: l.trackingType,
      })),
    [po, received, rejected],
  );

  const remainingOf = (l: GrnLine) =>
    Math.max(0, l.orderedQty - l.previouslyReceived - l.receivedQty);
  const openBefore = (l: GrnLine) => l.orderedQty - l.previouslyReceived;

  const breaches = lines.filter((l) => {
    const v = variance(openBefore(l), l.receivedQty);
    return v === "over" || v === "under";
  });
  const isPartial = lines.some((l) => l.receivedQty > 0 && remainingOf(l) > 0);
  const anyReceived = lines.some((l) => l.receivedQty > 0);
  const needsApproval = breaches.length > 0;
  const approved = !!approval;

  const serialLineObj = lines.find((l) => l.id === serialLine);

  const trackingIssues = lines.filter((l) => {
    if (l.receivedQty <= 0) return false;
    if (l.trackingType === "serial")
      return (serials[l.id]?.length ?? 0) !== l.receivedQty;
    if (l.trackingType === "batch") {
      const sum = batches.filter((b) => b.lineId === l.id).reduce((s, b) => s + b.qty, 0);
      return sum !== l.receivedQty;
    }
    return false;
  });

  const canSubmit =
    !!po &&
    anyReceived &&
    !!dockId &&
    !!vehicleNo &&
    !!driverName &&
    !!invoiceNo &&
    trackingIssues.length === 0 &&
    (!needsApproval || approved);

  const submit = () => {
    if (!po) return;
    const grn: Grn = {
      id: grnId,
      poNumber: po.poNumber,
      supplierId: po.supplierId,
      warehouseId,
      dockId,
      vehicleNo,
      driverName,
      driverPhone,
      transporter,
      gateEntryNo,
      gateEntryTime,
      receiver,
      invoiceNo,
      remarks,
      receiptDate: new Date().toISOString().slice(0, 10),
      status: "Completed",
      isPartial,
      lines: lines.filter((l) => l.receivedQty > 0),
      serials: Object.entries(serials).map(([lineId, s]) => ({ lineId, serials: s })),
      batches,
      discrepancyIds: drafts.map((d) => d.id),
      ...(approval ? { approval } : {}),
      stages: { gateEntry: 31, grn: 58, inspection: 74, putaway: 57 },
    };
    commitGrn(grn, drafts);
    setDoneOpen(true);
    toast.success(`${grnId} generated successfully`);
  };

  if (!po) {
    return (
      <>
        <PageHeader
          crumbs={[{ label: "Receiving", to: "/receiving-hub/" }, { label: "Goods Receipt" }]}
          title="New Goods Receipt Note"
          subtitle="Select a purchase order to begin receiving"
        />
        <div className="erp-card max-w-lg p-5">
          <Label className="label-xs">Purchase Order</Label>
          <Select value={poNumber} onValueChange={setPoNumber}>
            <SelectTrigger className="mt-1.5 h-9">
              <SelectValue placeholder="Choose a purchase order" />
            </SelectTrigger>
            <SelectContent>
              {pos
                .filter((p) => p.status !== "Closed" && p.status !== "Fully Received")
                .map((p) => (
                  <SelectItem key={p.poNumber} value={p.poNumber}>
                    {p.poNumber} · {supplierById(p.supplierId).name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </>
    );
  }

  const supplier = supplierById(po.supplierId);

  return (
    <>
      <PageHeader
        crumbs={[
          { label: "Receiving", to: "/receiving-hub/" },
          { label: "Goods Receipts", to: "/receiving-hub/grn" },
          { label: grnId },
        ]}
        title={`Goods Receipt Note ${grnId}`}
        subtitle={`${po.poNumber} · ${supplier.name}`}
        actions={
          <>
            {isPartial && <StatusChip status="Partial Receipt" tone="warning" />}
            {approved && <StatusChip status="Supervisor Approved" tone="success" />}
            <Button variant="outline" onClick={() => toast.info("Draft saved locally")}>
              Save as draft
            </Button>
          </>
        }
      />

      <Stepper
        steps={STEPS}
        current={step}
        onSelect={setStep}
        badges={[undefined, breaches.length || undefined, trackingIssues.length || undefined, drafts.length || undefined, undefined]}
      />

      <div className="mt-4 space-y-4">
        {step === 0 && (
          <>
            <section className="erp-card p-5">
              <h2 className="mb-4 text-[15px] font-semibold">Receipt Header</h2>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label className="label-xs">GRN Number (auto)</Label>
                  <Input className="mt-1.5 h-9 bg-muted font-medium" value={grnId} readOnly />
                </div>
                <div>
                  <Label className="label-xs">Purchase Order</Label>
                  <Input className="mt-1.5 h-9 bg-muted" value={po.poNumber} readOnly />
                </div>
                <div>
                  <Label className="label-xs">Supplier</Label>
                  <Input className="mt-1.5 h-9 bg-muted" value={`${supplier.id} · ${supplier.name}`} readOnly />
                </div>
                <div>
                  <Label className="label-xs">Warehouse</Label>
                  <Select
                    value={warehouseId}
                    onValueChange={(v) => {
                      setWarehouseId(v);
                      setDockId("");
                    }}
                  >
                    <SelectTrigger className="mt-1.5 h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {warehouses.map((w) => (
                        <SelectItem key={w.id} value={w.id}>{w.id} · {w.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="label-xs">Dock *</Label>
                  <Select value={dockId} onValueChange={setDockId}>
                    <SelectTrigger className="mt-1.5 h-9"><SelectValue placeholder="Assign dock" /></SelectTrigger>
                    <SelectContent>
                      {wh.docks.map((d) => (
                        <SelectItem key={d.id} value={d.id} disabled={d.status === "Maintenance"}>
                          {d.name} — {d.status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {!dockId && <p className="mt-1 text-xs text-danger">Dock assignment is mandatory.</p>}
                </div>
                <div>
                  <Label className="label-xs">Receiver</Label>
                  <Select value={receiver} onValueChange={setReceiver}>
                    <SelectTrigger className="mt-1.5 h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["A. Mehta", "P. Bhatt", "L. Ganesan"].map((r) => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </section>

            <section className="erp-card p-5">
              <h2 className="mb-4 text-[15px] font-semibold">Gate Entry & Transport</h2>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label className="label-xs">Gate entry no.</Label>
                  <Input className="mt-1.5 h-9 bg-muted" value={gateEntryNo} readOnly />
                </div>
                <div>
                  <Label className="label-xs">Gate entry time</Label>
                  <Input className="mt-1.5 h-9 bg-muted" value={fmtDateTime(gateEntryTime)} readOnly />
                </div>
                <div>
                  <Label className="label-xs">Transporter</Label>
                  <Select value={transporter} onValueChange={setTransporter}>
                    <SelectTrigger className="mt-1.5 h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["Safexpress", "TCI Freight", "VRL Logistics", "Gati KWE", "Delhivery Freight", "Own Fleet"].map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="label-xs">Vehicle number *</Label>
                  <Input className="mt-1.5 h-9" placeholder="MH-04-KJ-8821" value={vehicleNo} onChange={(e) => setVehicleNo(e.target.value.toUpperCase())} />
                </div>
                <div>
                  <Label className="label-xs">Driver name *</Label>
                  <Input className="mt-1.5 h-9" placeholder="Full name" value={driverName} onChange={(e) => setDriverName(e.target.value)} />
                </div>
                <div>
                  <Label className="label-xs">Driver phone</Label>
                  <Input className="mt-1.5 h-9" placeholder="+91 …" value={driverPhone} onChange={(e) => setDriverPhone(e.target.value)} />
                </div>
                <div>
                  <Label className="label-xs">Invoice / DC number *</Label>
                  <Input className="mt-1.5 h-9" placeholder="INV/…" value={invoiceNo} onChange={(e) => setInvoiceNo(e.target.value)} />
                </div>
                <div className="md:col-span-2">
                  <Label className="label-xs">Remarks</Label>
                  <Textarea className="mt-1.5" rows={2} value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Condition of consignment, seal number, observations…" />
                </div>
              </div>
            </section>
          </>
        )}

        {step === 1 && (
          <>
            {needsApproval && (
              <Alert className={approved ? "border-success/30 bg-success-subtle" : "border-danger/30 bg-danger-subtle"}>
                {approved ? <ShieldCheck className="h-4 w-4 text-success" /> : <AlertTriangle className="h-4 w-4 text-danger" />}
                <AlertTitle className={approved ? "text-success" : "text-danger"}>
                  {approved ? "Tolerance exception approved" : `${breaches.length} line(s) breach the ±2% tolerance`}
                </AlertTitle>
                <AlertDescription className="flex flex-wrap items-center gap-3">
                  {approved ? (
                    <span>Approved by {approval!.supervisor} on {fmtDateTime(approval!.at)}.</span>
                  ) : (
                    <>
                      <span>Supervisor approval is required before this GRN can be generated.</span>
                      <Button size="sm" className="h-8" onClick={() => setApprovalOpen(true)}>
                        Request approval
                      </Button>
                    </>
                  )}
                </AlertDescription>
              </Alert>
            )}

            <section className="erp-card overflow-hidden">
              <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-5 py-3.5">
                <div>
                  <h2 className="text-[15px] font-semibold">PO Line Items</h2>
                  <p className="text-xs text-muted-foreground">Enter received quantities — remaining quantity recalculates live</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setReceived(Object.fromEntries(lines.map((l) => [l.id, openBefore(l)])))}>
                    Receive all
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setReceived({})}>Clear all</Button>
                </div>
              </header>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1080px] text-sm">
                  <thead>
                    <tr className="bg-surface-muted">
                      {["SKU", "Description", "UOM", "Ordered", "Prev. Recd", "Received Qty", "Rejected", "Remaining", "Tracking", "Status", ""].map((h, i) => (
                        <th key={h} className={cn("border-b border-border px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground", i >= 3 && i <= 7 ? "text-right" : "text-left")}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {lines.map((l) => {
                      const v = variance(openBefore(l), l.receivedQty);
                      return (
                        <tr key={l.id} className={cn("border-b border-border last:border-0", v === "over" && "bg-danger-subtle/40", v === "under" && "bg-warning-subtle/40")}>
                          <td className="px-4 py-3 font-medium">{l.sku}</td>
                          <td className="px-4 py-3 text-muted-foreground">{l.description}</td>
                          <td className="px-4 py-3 text-muted-foreground">{l.uom}</td>
                          <td className="px-4 py-3 text-right">{qty(l.orderedQty)}</td>
                          <td className="px-4 py-3 text-right text-muted-foreground">{qty(l.previouslyReceived)}</td>
                          <td className="px-4 py-3 text-right">
                            <Input
                              type="number"
                              min={0}
                              value={l.receivedQty || ""}
                              onChange={(e) => setReceived((s) => ({ ...s, [l.id]: Math.max(0, Number(e.target.value) || 0) }))}
                              className={cn("ml-auto h-8 w-24 text-right", v === "over" && "border-danger focus-visible:ring-danger")}
                            />
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Input
                              type="number"
                              min={0}
                              value={l.rejectedQty || ""}
                              onChange={(e) => setRejected((s) => ({ ...s, [l.id]: Math.max(0, Number(e.target.value) || 0) }))}
                              className="ml-auto h-8 w-20 text-right"
                            />
                          </td>
                          <td className="px-4 py-3 text-right font-medium">
                            <span className={remainingOf(l) > 0 ? "text-warning" : "text-success"}>{qty(remainingOf(l))}</span>
                          </td>
                          <td className="px-4 py-3">
                            <StatusChip status={l.trackingType === "serial" ? "Serial" : l.trackingType === "batch" ? "Batch" : "None"} />
                          </td>
                          <td className="px-4 py-3">
                            {l.receivedQty === 0 ? (
                              <span className="text-xs text-muted-foreground">Not received</span>
                            ) : v === "over" ? (
                              <StatusChip status="Over Receipt" />
                            ) : v === "under" ? (
                              <StatusChip status="Under Receipt" />
                            ) : remainingOf(l) > 0 ? (
                              <StatusChip status="Partial" />
                            ) : (
                              <StatusChip status="Within tolerance" />
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {l.trackingType !== "none" && (
                              <Button variant="outline" size="sm" className="h-8" disabled={l.receivedQty === 0} onClick={() => { setSerialLine(l.id); setStep(2); }}>
                                Capture
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-surface-muted font-medium">
                      <td className="px-4 py-3" colSpan={3}>Totals</td>
                      <td className="px-4 py-3 text-right">{qty(lines.reduce((s, l) => s + l.orderedQty, 0))}</td>
                      <td className="px-4 py-3 text-right">{qty(lines.reduce((s, l) => s + l.previouslyReceived, 0))}</td>
                      <td className="px-4 py-3 text-right">{qty(lines.reduce((s, l) => s + l.receivedQty, 0))}</td>
                      <td className="px-4 py-3 text-right">{qty(lines.reduce((s, l) => s + l.rejectedQty, 0))}</td>
                      <td className="px-4 py-3 text-right">{qty(lines.reduce((s, l) => s + remainingOf(l), 0))}</td>
                      <td colSpan={3} />
                    </tr>
                  </tfoot>
                </table>
              </div>
            </section>
          </>
        )}

        {step === 2 && (
          <SerialBatchStep
            lines={lines.filter((l) => l.trackingType !== "none" && l.receivedQty > 0)}
            serials={serials}
            setSerials={setSerials}
            batches={batches}
            setBatches={setBatches}
            activeLine={serialLineObj?.id ?? null}
            setActiveLine={setSerialLine}
          />
        )}

        {step === 3 && (
          <section className="erp-card overflow-hidden">
            <header className="flex items-center justify-between border-b border-border px-5 py-3.5">
              <div>
                <h2 className="text-[15px] font-semibold">Receiving Discrepancies</h2>
                <p className="text-xs text-muted-foreground">Log damage, shortages, wrong items or missing documents</p>
              </div>
              <Button size="sm" className="h-8 gap-1.5" onClick={() => setDscOpen(true)}>
                <Plus className="h-3.5 w-3.5" />
                Add discrepancy
              </Button>
            </header>
            {drafts.length === 0 ? (
              <p className="px-5 py-12 text-center text-sm text-muted-foreground">
                No discrepancies recorded. This step is optional.
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-surface-muted">
                    {["Discrepancy ID", "Type", "SKU", "Qty Affected", "Severity", "Status", ""].map((h) => (
                      <th key={h} className="border-b border-border px-5 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {drafts.map((d) => (
                    <tr key={d.id} className="border-b border-border last:border-0">
                      <td className="px-5 py-3 font-medium text-primary">{d.id}</td>
                      <td className="px-5 py-3">{d.type}</td>
                      <td className="px-5 py-3 text-muted-foreground">{d.sku}</td>
                      <td className="px-5 py-3">{qty(d.qtyAffected)}</td>
                      <td className="px-5 py-3"><StatusChip status={d.severity} /></td>
                      <td className="px-5 py-3"><StatusChip status={d.status} /></td>
                      <td className="px-5 py-3 text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDrafts((s) => s.filter((x) => x.id !== d.id))}>
                          <Trash2 className="h-4 w-4 text-danger" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        )}

        {step === 4 && (
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              <section className="erp-card p-5">
                <h2 className="mb-4 text-[15px] font-semibold">Receipt Summary</h2>
                <div className="grid gap-4 text-[13px] md:grid-cols-3">
                  {[
                    ["GRN number", grnId], ["Purchase order", po.poNumber], ["Supplier", supplier.name],
                    ["Warehouse", `${wh.id} · ${wh.name}`], ["Dock", dockId || "—"], ["Receiver", receiver],
                    ["Vehicle", vehicleNo || "—"], ["Driver", driverName || "—"], ["Invoice / DC", invoiceNo || "—"],
                    ["Gate entry", gateEntryNo], ["Transporter", transporter], ["Receipt type", isPartial ? "Partial" : "Full"],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <p className="label-xs">{k}</p>
                      <p className="mt-0.5 font-medium">{v}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="erp-card overflow-hidden">
                <header className="border-b border-border px-5 py-3.5">
                  <h2 className="text-[15px] font-semibold">Lines to Post</h2>
                </header>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-surface-muted">
                      {["SKU", "Received", "Rejected", "Remaining", "Value"].map((h, i) => (
                        <th key={h} className={cn("border-b border-border px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground", i > 0 ? "text-right" : "text-left")}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {lines.filter((l) => l.receivedQty > 0).map((l) => {
                      const price = po.lines.find((x) => x.id === l.id)?.unitPrice ?? 0;
                      return (
                        <tr key={l.id} className="border-b border-border last:border-0">
                          <td className="px-5 py-3 font-medium">{l.sku}</td>
                          <td className="px-5 py-3 text-right">{qty(l.receivedQty)} {l.uom}</td>
                          <td className="px-5 py-3 text-right">{qty(l.rejectedQty)}</td>
                          <td className="px-5 py-3 text-right">{qty(remainingOf(l))}</td>
                          <td className="px-5 py-3 text-right font-medium">{inr(price * l.receivedQty)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </section>
            </div>

            <section className="erp-card h-fit p-5">
              <h2 className="text-[15px] font-semibold">Validation Checklist</h2>
              <ul className="mt-4 space-y-2.5 text-[13px]">
                {[
                  ["Header details complete", !!dockId && !!vehicleNo && !!driverName && !!invoiceNo],
                  ["At least one line received", anyReceived],
                  ["Tolerance validated (±2%)", !needsApproval || approved],
                  ["Serial / batch capture complete", trackingIssues.length === 0],
                  ["Discrepancies reviewed", true],
                ].map(([label, ok]) => (
                  <li key={String(label)} className="flex items-center gap-2">
                    <span className={cn("flex h-4 w-4 items-center justify-center rounded-full", ok ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger")}>
                      {ok ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                    </span>
                    <span className={ok ? "" : "text-danger"}>{label}</span>
                  </li>
                ))}
              </ul>
              <Button className="mt-5 w-full" disabled={!canSubmit} onClick={submit}>
                Generate GRN
              </Button>
              {!canSubmit && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Resolve the outstanding checklist items to post this receipt.
                </p>
              )}
            </section>
          </div>
        )}
      </div>

      <div className="erp-card mt-4 flex items-center justify-between p-3">
        <Button variant="outline" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
          Back
        </Button>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => navigate({ to: "/receiving-hub/purchase-orders" })}>Cancel</Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep((s) => s + 1)}>Next</Button>
          ) : (
            <Button disabled={!canSubmit} onClick={submit}>Generate GRN</Button>
          )}
        </div>
      </div>

      <ApprovalDialog
        open={approvalOpen}
        onOpenChange={setApprovalOpen}
        reason={`${breaches.length} line(s) fall outside the ±2% receiving tolerance. Supervisor authorisation is needed to post this GRN.`}
        onApprove={setApproval}
      />

      <DiscrepancyDialog
        open={dscOpen}
        onOpenChange={setDscOpen}
        lines={lines}
        onCreate={(d) => {
          setDrafts((s) => [...s, { ...d, id: `DSC-2026-${String(24 + s.length + 1).padStart(4, "0")}`, grnId, poNumber: po.poNumber }]);
          toast.success("Discrepancy logged");
        }}
        nextId={nextDiscrepancyId()}
      />

      <Dialog open={doneOpen} onOpenChange={setDoneOpen}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-success" />
              {grnId} generated
            </DialogTitle>
            <DialogDescription>
              Goods receipt posted against {po.poNumber}. Stock is now in the quarantine zone pending inspection.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border border-border bg-surface-muted p-4">
            <p className="label-xs mb-3 flex items-center gap-1.5">
              <Bell className="h-3.5 w-3.5" /> Notifications dispatched
            </p>
            <ul className="space-y-2.5 text-[13px]">
              {[
                ["Procurement", "PO update and receipt confirmation sent"],
                ["Quality", `Inspection request created (INS-2026-0${Math.floor(100 + Math.random() * 800)})`],
                ["Supplier", `Receipt acknowledgement emailed to ${supplier.email}`],
              ].map(([who, what]) => (
                <li key={who} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  <span>
                    <span className="font-medium">{who}</span> — {what}
                    <span className="block text-[11px] text-muted-foreground">just now</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => window.print()}>Print GRN</Button>
            <Button variant="outline" asChild><Link to="/receiving-hub/grn/$id" params={{ id: grnId }}>View GRN</Link></Button>
            <Button asChild><Link to="/receiving-hub/purchase-orders">New receipt</Link></Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function SerialBatchStep({
  lines,
  serials,
  setSerials,
  batches,
  setBatches,
  activeLine,
  setActiveLine,
}: {
  lines: GrnLine[];
  serials: Record<string, string[]>;
  setSerials: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
  batches: DraftBatch[];
  setBatches: React.Dispatch<React.SetStateAction<DraftBatch[]>>;
  activeLine: string | null;
  setActiveLine: (id: string | null) => void;
}) {
  const [entry, setEntry] = useState("");
  const [error, setError] = useState("");
  const [scanning, setScanning] = useState(false);
  const line = lines.find((l) => l.id === (activeLine ?? lines[0]?.id));

  if (lines.length === 0) {
    return (
      <section className="erp-card p-12 text-center">
        <p className="text-sm text-muted-foreground">
          No serialised or batch-tracked lines with a received quantity. Continue to the next step.
        </p>
      </section>
    );
  }
  if (!line) return null;

  const captured = serials[line.id] ?? [];
  const lineBatches = batches.filter((b) => b.lineId === line.id);
  const batchSum = lineBatches.reduce((s, b) => s + b.qty, 0);

  const addSerial = (value: string) => {
    const v = value.trim().toUpperCase();
    if (!v) return;
    if (captured.includes(v)) {
      setError(`Duplicate serial ${v} — already captured for this line.`);
      toast.error(`Duplicate serial: ${v}`);
      return;
    }
    if (captured.length >= line.receivedQty) {
      setError(`Cannot exceed received quantity of ${line.receivedQty}.`);
      return;
    }
    setError("");
    setSerials((s) => ({ ...s, [line.id]: [...(s[line.id] ?? []), v] }));
    setEntry("");
  };

  const simulateScan = () => {
    setScanning(true);
    setTimeout(() => {
      const serial = `SN-${line.sku.split("-").pop()}-${Math.floor(10000000 + Math.random() * 89999999)}`;
      addSerial(serial);
      setScanning(false);
    }, 400);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-4">
      <section className="erp-card h-fit p-3 lg:col-span-1">
        <p className="label-xs mb-2 px-2">Tracked lines</p>
        <ul className="space-y-0.5">
          {lines.map((l) => {
            const done =
              l.trackingType === "serial"
                ? (serials[l.id]?.length ?? 0) === l.receivedQty
                : batches.filter((b) => b.lineId === l.id).reduce((s, b) => s + b.qty, 0) === l.receivedQty;
            return (
              <li key={l.id}>
                <button
                  onClick={() => setActiveLine(l.id)}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-[13px] transition-colors",
                    l.id === line.id ? "bg-primary-subtle font-medium text-primary" : "hover:bg-surface-muted",
                  )}
                >
                  <span className="truncate">{l.sku}</span>
                  <span className={cn("h-2 w-2 shrink-0 rounded-full", done ? "bg-success" : "bg-warning")} />
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="erp-card p-5 lg:col-span-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="text-[15px] font-semibold">{line.sku}</h2>
            <p className="text-xs text-muted-foreground">{line.description}</p>
          </div>
          <StatusChip status={line.trackingType === "serial" ? "Serial" : "Batch"} />
        </div>

        {line.trackingType === "serial" ? (
          <>
            <div className="mt-4 flex flex-wrap items-end gap-2">
              <div className="min-w-[240px] flex-1">
                <Label className="label-xs">Scan or key in serial</Label>
                <Input
                  autoFocus
                  className={cn("mt-1.5 h-9", scanning && "animate-pulse border-primary")}
                  placeholder="Scan barcode or type serial and press Enter"
                  value={entry}
                  onChange={(e) => setEntry(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSerial(entry);
                    }
                  }}
                />
              </div>
              <Button variant="outline" className="h-9 gap-1.5" onClick={simulateScan} disabled={scanning}>
                <ScanLine className="h-4 w-4" />
                {scanning ? "Scanning…" : "Simulate scan"}
              </Button>
              <Button className="h-9" onClick={() => addSerial(entry)}>Add</Button>
            </div>
            {error && <p className="mt-2 text-xs text-danger">{error}</p>}

            <div className="mt-4 flex items-center justify-between">
              <p className="text-[13px] font-medium">
                Captured {captured.length} of {line.receivedQty}
              </p>
              {captured.length === line.receivedQty ? (
                <StatusChip status="Complete" tone="success" />
              ) : (
                <StatusChip status={`${line.receivedQty - captured.length} remaining`} tone="warning" />
              )}
            </div>
            <div className="mt-3 max-h-64 overflow-y-auto rounded-lg border border-border bg-surface-muted p-3">
              {captured.length === 0 ? (
                <p className="py-6 text-center text-xs text-muted-foreground">No serials captured yet.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {captured.map((s) => (
                    <span key={s} className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1 text-xs font-medium">
                      {s}
                      <button onClick={() => setSerials((st) => ({ ...st, [line.id]: (st[line.id] ?? []).filter((x) => x !== s) }))}>
                        <X className="h-3 w-3 text-muted-foreground hover:text-danger" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="mt-4 flex items-center justify-between">
              <p className="text-[13px] font-medium">
                Allocated {qty(batchSum)} of {qty(line.receivedQty)} {line.uom}
              </p>
              <Button
                size="sm"
                className="h-8 gap-1.5"
                onClick={() =>
                  setBatches((b) => [
                    ...b,
                    {
                      id: `B${Date.now()}`,
                      lineId: line.id,
                      batchNo: `BN-${line.sku.split("-").pop()}-${Math.floor(1000 + Math.random() * 8999)}`,
                      mfgDate: "2026-06-01",
                      expiryDate: "2028-06-01",
                      qty: Math.max(0, line.receivedQty - batchSum),
                    },
                  ])
                }
              >
                <Plus className="h-3.5 w-3.5" />
                Add batch
              </Button>
            </div>
            <table className="mt-3 w-full text-sm">
              <thead>
                <tr className="bg-surface-muted">
                  {["Batch No", "Mfg Date", "Expiry Date", "Quantity", ""].map((h) => (
                    <th key={h} className="border-b border-border px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lineBatches.map((b) => {
                  const expired = new Date(b.expiryDate) <= new Date();
                  return (
                    <tr key={b.id} className="border-b border-border last:border-0">
                      <td className="px-3 py-2">
                        <Input className="h-8" value={b.batchNo} onChange={(e) => setBatches((s) => s.map((x) => (x.id === b.id ? { ...x, batchNo: e.target.value } : x)))} />
                      </td>
                      <td className="px-3 py-2">
                        <Input type="date" className="h-8" value={b.mfgDate} onChange={(e) => setBatches((s) => s.map((x) => (x.id === b.id ? { ...x, mfgDate: e.target.value } : x)))} />
                      </td>
                      <td className="px-3 py-2">
                        <Input type="date" className={cn("h-8", expired && "border-danger")} value={b.expiryDate} onChange={(e) => setBatches((s) => s.map((x) => (x.id === b.id ? { ...x, expiryDate: e.target.value } : x)))} />
                        {expired && <p className="mt-1 text-[11px] text-danger">Expiry must be in the future</p>}
                      </td>
                      <td className="px-3 py-2">
                        <Input type="number" className="h-8 w-28" value={b.qty} onChange={(e) => setBatches((s) => s.map((x) => (x.id === b.id ? { ...x, qty: Number(e.target.value) || 0 } : x)))} />
                      </td>
                      <td className="px-3 py-2 text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setBatches((s) => s.filter((x) => x.id !== b.id))}>
                          <Trash2 className="h-4 w-4 text-danger" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
                {lineBatches.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-3 py-8 text-center text-xs text-muted-foreground">
                      No batches allocated yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {batchSum !== line.receivedQty && (
              <p className="mt-2 text-xs text-danger">
                Batch quantities must total the received quantity of {qty(line.receivedQty)}.
              </p>
            )}
          </>
        )}
      </section>
    </div>
  );
}

function DiscrepancyDialog({
  open,
  onOpenChange,
  lines,
  onCreate,
  nextId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  lines: GrnLine[];
  onCreate: (d: Omit<Discrepancy, "id" | "grnId" | "poNumber">) => void;
  nextId: string;
}) {
  const [type, setType] = useState<DiscrepancyType>("Damage");
  const [sku, setSku] = useState(lines[0]?.sku ?? "");
  const [qtyAffected, setQtyAffected] = useState(1);
  const [severity, setSeverity] = useState<"Low" | "Medium" | "High">("Medium");
  const [description, setDescription] = useState("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Log Receiving Discrepancy</DialogTitle>
          <DialogDescription>A discrepancy ID will be generated on save (next: {nextId}).</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-1 sm:grid-cols-2">
          <div>
            <Label className="label-xs">Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as DiscrepancyType)}>
              <SelectTrigger className="mt-1.5 h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                {DSC_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="label-xs">Affected line</Label>
            <Select value={sku} onValueChange={setSku}>
              <SelectTrigger className="mt-1.5 h-9"><SelectValue placeholder="Select SKU" /></SelectTrigger>
              <SelectContent>
                {lines.map((l) => <SelectItem key={l.id} value={l.sku}>{l.sku}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="label-xs">Quantity affected</Label>
            <Input type="number" min={0} className="mt-1.5 h-9" value={qtyAffected} onChange={(e) => setQtyAffected(Number(e.target.value) || 0)} />
          </div>
          <div>
            <Label className="label-xs">Severity</Label>
            <Select value={severity} onValueChange={(v) => setSeverity(v as "Low" | "Medium" | "High")}>
              <SelectTrigger className="mt-1.5 h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["Low", "Medium", "High"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="sm:col-span-2">
            <Label className="label-xs">Description</Label>
            <Textarea className="mt-1.5" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe what was observed…" />
          </div>
          <div className="sm:col-span-2">
            <Label className="label-xs">Evidence</Label>
            <div className="mt-1.5 flex flex-col items-center gap-1 rounded-lg border border-dashed border-border bg-surface-muted py-6 text-center">
              <Upload className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Drop photos here or click to upload</p>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            disabled={!sku || !description.trim()}
            onClick={() => {
              onCreate({
                type,
                sku,
                qtyAffected,
                severity,
                description,
                status: "Open",
                raisedBy: "A. Mehta",
                raisedOn: new Date().toISOString().slice(0, 10),
              });
              setDescription("");
              onOpenChange(false);
            }}
          >
            Save discrepancy
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
