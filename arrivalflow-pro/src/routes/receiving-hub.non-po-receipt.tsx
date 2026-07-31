import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, CheckCircle2, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { useWms } from "@/apps/receiving-hub/context/WmsContext";
import { items, itemBySku, suppliers, warehouseById, warehouses } from "@/apps/receiving-hub/data";
import { fmtDateTime, inr, qty } from "@/apps/receiving-hub/format";
import type { Grn } from "@/apps/receiving-hub/types";

export const Route = createFileRoute("/receiving-hub/non-po-receipt")({
  head: () => ({
    meta: [
      { title: "Non-PO Receipt — NexusWMS" },
      {
        name: "description",
        content:
          "Receive goods without a purchase order with mandatory reason capture and supervisor approval.",
      },
      { property: "og:title", content: "Non-PO Receipt — NexusWMS" },
      {
        property: "og:description",
        content: "Receive goods without a purchase order, with supervisor approval.",
      },
    ],
  }),
  component: NonPoReceipt,
});

const REASONS = [
  "Emergency Purchase",
  "Sample Receipt",
  "Warranty Replacement",
  "Free of Cost",
  "Customer Return",
  "Inter-warehouse Transfer",
];

interface Row {
  id: string;
  sku: string;
  qty: number;
}

function NonPoReceipt() {
  const { nextGrnId, commitGrn } = useWms();
  const [grnId] = useState(() => nextGrnId());
  const [unregistered, setUnregistered] = useState(false);
  const [supplierId, setSupplierId] = useState("SUP-1265");
  const [supplierName, setSupplierName] = useState("");
  const [supplierGstin, setSupplierGstin] = useState("");
  const [reason, setReason] = useState("Emergency Purchase");
  const [refDoc, setRefDoc] = useState("");
  const [warehouseId, setWarehouseId] = useState("WH-01");
  const [dockId, setDockId] = useState("");
  const [vehicleNo, setVehicleNo] = useState("");
  const [driverName, setDriverName] = useState("");
  const [justification, setJustification] = useState("");
  const [rows, setRows] = useState<Row[]>([{ id: "r1", sku: "ELC-BR-6300", qty: 12 }]);
  const [approval, setApproval] = useState<ApprovalResult | null>(null);
  const [approvalOpen, setApprovalOpen] = useState(false);
  const [doneOpen, setDoneOpen] = useState(false);

  const wh = warehouseById(warehouseId);
  const value = rows.reduce((s, r) => s + (r.sku ? itemBySku(r.sku).unitPrice * r.qty : 0), 0);
  const ready =
    !!reason &&
    !!dockId &&
    !!vehicleNo &&
    justification.trim().length > 0 &&
    rows.length > 0 &&
    rows.every((r) => r.sku && r.qty > 0) &&
    (!unregistered || supplierName.trim().length > 0);

  const post = () => {
    const grn: Grn = {
      id: grnId,
      poNumber: null,
      supplierId: unregistered ? "SUP-1265" : supplierId,
      warehouseId,
      dockId,
      vehicleNo,
      driverName,
      driverPhone: "",
      transporter: "Own Fleet",
      gateEntryNo: `GE-2026-${Math.floor(1200 + Math.random() * 90)}`,
      gateEntryTime: new Date().toISOString(),
      receiver: "A. Mehta",
      invoiceNo: refDoc || "—",
      remarks: justification,
      receiptDate: new Date().toISOString().slice(0, 10),
      status: "Completed",
      isPartial: false,
      lines: rows.map((r, i) => {
        const it = itemBySku(r.sku);
        return {
          id: `${grnId}-L${i + 1}`,
          sku: r.sku,
          description: it.description,
          uom: it.uom,
          orderedQty: r.qty,
          previouslyReceived: 0,
          receivedQty: r.qty,
          rejectedQty: 0,
          trackingType: it.trackingType,
        };
      }),
      serials: [],
      batches: [],
      discrepancyIds: [],
      ...(approval ? { approval } : {}),
      stages: { gateEntry: 28, grn: 47, inspection: 65, putaway: 52 },
      nonPoReason: reason,
    };
    commitGrn(grn, []);
    setDoneOpen(true);
    toast.success(`${grnId} generated from non-PO receipt`);
  };

  return (
    <>
      <PageHeader
        crumbs={[{ label: "Receiving", to: "/receiving-hub/" }, { label: "Non-PO Receipt" }]}
        title="Non-PO Receipt"
        subtitle={`${grnId} — receive goods that are not backed by a purchase order`}
        actions={approval ? <StatusChip status="Supervisor Approved" tone="success" /> : undefined}
      />

      <Alert className={approval ? "mb-4 border-success/30 bg-success-subtle" : "mb-4 border-warning/30 bg-warning-subtle"}>
        {approval ? <ShieldCheck className="h-4 w-4 text-success" /> : <AlertTriangle className="h-4 w-4 text-warning" />}
        <AlertTitle className={approval ? "text-success" : "text-warning"}>
          {approval ? "Approved for posting" : "Supervisor approval required"}
        </AlertTitle>
        <AlertDescription>
          {approval
            ? `${approval.supervisor} authorised this non-PO receipt on ${fmtDateTime(approval.at)}.`
            : "Non-PO receipts must be authorised by a supervisor before a GRN can be generated."}
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <section className="erp-card p-5">
            <h2 className="mb-4 text-[15px] font-semibold">Supplier & Reason</h2>
            <div className="mb-4 flex items-center gap-2">
              <Checkbox id="unreg" checked={unregistered} onCheckedChange={(v) => setUnregistered(!!v)} />
              <Label htmlFor="unreg" className="text-[13px]">Unregistered supplier</Label>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {unregistered ? (
                <>
                  <div>
                    <Label className="label-xs">Supplier name *</Label>
                    <Input className="mt-1.5 h-9" value={supplierName} onChange={(e) => setSupplierName(e.target.value)} placeholder="Enter supplier name" />
                  </div>
                  <div>
                    <Label className="label-xs">GSTIN / PAN</Label>
                    <Input className="mt-1.5 h-9" value={supplierGstin} onChange={(e) => setSupplierGstin(e.target.value.toUpperCase())} placeholder="Optional" />
                  </div>
                </>
              ) : (
                <div>
                  <Label className="label-xs">Registered supplier</Label>
                  <Select value={supplierId} onValueChange={setSupplierId}>
                    <SelectTrigger className="mt-1.5 h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {suppliers.map((s) => <SelectItem key={s.id} value={s.id}>{s.id} · {s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div>
                <Label className="label-xs">Reason *</Label>
                <Select value={reason} onValueChange={setReason}>
                  <SelectTrigger className="mt-1.5 h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {REASONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="label-xs">Reference document</Label>
                <Input className="mt-1.5 h-9" value={refDoc} onChange={(e) => setRefDoc(e.target.value)} placeholder="DC / challan / RMA number" />
              </div>
            </div>
          </section>

          <section className="erp-card p-5">
            <h2 className="mb-4 text-[15px] font-semibold">Logistics</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label className="label-xs">Warehouse</Label>
                <Select value={warehouseId} onValueChange={(v) => { setWarehouseId(v); setDockId(""); }}>
                  <SelectTrigger className="mt-1.5 h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {warehouses.map((w) => <SelectItem key={w.id} value={w.id}>{w.id} · {w.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="label-xs">Dock *</Label>
                <Select value={dockId} onValueChange={setDockId}>
                  <SelectTrigger className="mt-1.5 h-9"><SelectValue placeholder="Assign dock" /></SelectTrigger>
                  <SelectContent>
                    {wh.docks.map((d) => <SelectItem key={d.id} value={d.id}>{d.name} — {d.status}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="label-xs">Vehicle number *</Label>
                <Input className="mt-1.5 h-9" value={vehicleNo} onChange={(e) => setVehicleNo(e.target.value.toUpperCase())} placeholder="MH-43-XY-2201" />
              </div>
              <div>
                <Label className="label-xs">Driver name</Label>
                <Input className="mt-1.5 h-9" value={driverName} onChange={(e) => setDriverName(e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <Label className="label-xs">Justification *</Label>
                <Textarea className="mt-1.5" rows={2} value={justification} onChange={(e) => setJustification(e.target.value)} placeholder="Why is this receipt being made without a purchase order?" />
              </div>
            </div>
          </section>

          <section className="erp-card overflow-hidden">
            <header className="flex items-center justify-between border-b border-border px-5 py-3.5">
              <h2 className="text-[15px] font-semibold">Items Received</h2>
              <Button size="sm" className="h-8 gap-1.5" onClick={() => setRows((r) => [...r, { id: `r${Date.now()}`, sku: "", qty: 1 }])}>
                <Plus className="h-3.5 w-3.5" />
                Add item
              </Button>
            </header>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-muted">
                  {["SKU", "Description", "UOM", "Quantity", "Est. Value", ""].map((h, i) => (
                    <th key={h} className={`border-b border-border px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground ${i >= 3 ? "text-right" : "text-left"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const it = r.sku ? itemBySku(r.sku) : null;
                  return (
                    <tr key={r.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-2.5">
                        <Select value={r.sku} onValueChange={(v) => setRows((s) => s.map((x) => (x.id === r.id ? { ...x, sku: v } : x)))}>
                          <SelectTrigger className="h-8 w-[180px]"><SelectValue placeholder="Select SKU" /></SelectTrigger>
                          <SelectContent>
                            {items.map((i) => <SelectItem key={i.sku} value={i.sku}>{i.sku}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground">{it?.description ?? "—"}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{it?.uom ?? "—"}</td>
                      <td className="px-4 py-2.5 text-right">
                        <Input type="number" min={1} className="ml-auto h-8 w-24 text-right" value={r.qty} onChange={(e) => setRows((s) => s.map((x) => (x.id === r.id ? { ...x, qty: Number(e.target.value) || 0 } : x)))} />
                      </td>
                      <td className="px-4 py-2.5 text-right font-medium">{it ? inr(it.unitPrice * r.qty) : "—"}</td>
                      <td className="px-4 py-2.5 text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setRows((s) => s.filter((x) => x.id !== r.id))}>
                          <Trash2 className="h-4 w-4 text-danger" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-surface-muted font-medium">
                  <td className="px-4 py-3" colSpan={3}>Total</td>
                  <td className="px-4 py-3 text-right">{qty(rows.reduce((s, r) => s + r.qty, 0))}</td>
                  <td className="px-4 py-3 text-right">{inr(value)}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </section>
        </div>

        <section className="erp-card h-fit p-5">
          <h2 className="text-[15px] font-semibold">Approval & Posting</h2>
          <dl className="mt-4 space-y-3 text-[13px]">
            <div className="flex justify-between"><dt className="text-muted-foreground">GRN number</dt><dd className="font-medium">{grnId}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Reason</dt><dd className="font-medium">{reason}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Lines</dt><dd className="font-medium">{rows.length}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Estimated value</dt><dd className="font-medium">{inr(value)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Approval</dt><dd>{approval ? <StatusChip status="Approved" /> : <StatusChip status="Pending Approval" />}</dd></div>
          </dl>
          <Button className="mt-5 w-full" disabled={!ready} onClick={() => setApprovalOpen(true)}>
            Submit for approval
          </Button>
          <Button className="mt-2 w-full" variant="outline" disabled={!approval} onClick={post}>
            Generate GRN
          </Button>
          {!ready && <p className="mt-2 text-xs text-muted-foreground">Complete the mandatory fields marked with * to submit.</p>}
        </section>
      </div>

      <ApprovalDialog
        open={approvalOpen}
        onOpenChange={setApprovalOpen}
        reason="This receipt has no backing purchase order. Supervisor authorisation is mandatory."
        onApprove={(a) => { setApproval(a); toast.success("Non-PO receipt approved"); }}
      />

      <Dialog open={doneOpen} onOpenChange={setDoneOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-success" />
              {grnId} generated
            </DialogTitle>
            <DialogDescription>
              Non-PO receipt posted. Procurement, Quality and the supplier have been notified.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" asChild><Link to="/receiving-hub/grn">Goods receipts</Link></Button>
            <Button asChild><Link to="/receiving-hub/grn/$id" params={{ id: grnId }}>View GRN</Link></Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
