import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, SectionCard } from "@/apps/supplier-flow/components/page-parts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { money, suppliers } from "@/apps/supplier-flow/data/procurement";

export const Route = createFileRoute("/supplier-flow/purchase-orders/new")({
  head: () => ({
    meta: [
      { title: "Create Purchase Order | AxisWMS Procurement" },
      { name: "description", content: "Raise a purchase order with vendor selection, item pricing, tax computation and budget validation." },
      { property: "og:title", content: "Create Purchase Order | AxisWMS Procurement" },
      { property: "og:description", content: "Four-step purchase order creation with live budget and tax validation." },
    ],
  }),
  component: CreatePO,
});

const steps = ["Vendor & header", "Items & pricing", "Budget & tax", "Review & submit"];
const catalog = [
  { code: "MAT-88214", desc: "Machined Gearbox Housing — GH-450 Alloy", hsn: "84839000", uom: "NOS", price: 4850, tax: 18 },
  { code: "MAT-10021", desc: "HR Coil IS 2062 E250 BR — 3.0 mm × 1250 mm", hsn: "72085190", uom: "MT", price: 58400, tax: 18 },
  { code: "MAT-55012", desc: "Deep Groove Ball Bearing 6208-2RS (SKF)", hsn: "84821011", uom: "NOS", price: 780, tax: 18 },
  { code: "MAT-70012", desc: "5-Ply Corrugated Carton 600×400×400 mm", hsn: "48191010", uom: "NOS", price: 62, tax: 12 },
];

interface Row { code: string; desc: string; hsn: string; uom: string; qty: number; price: number; disc: number; tax: number }

function CreatePO() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [supplierId, setSupplierId] = useState("");
  const [warehouse, setWarehouse] = useState("");
  const [delivery, setDelivery] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [remarks, setRemarks] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [confirm, setConfirm] = useState(false);
  const [done, setDone] = useState(false);
  const [touched, setTouched] = useState(false);

  const supplier = suppliers.find((s) => s.id === supplierId);
  const blocked = supplier && supplier.status !== "Active";
  const net = rows.reduce((s, r) => s + r.qty * r.price * (1 - r.disc / 100), 0);
  const tax = rows.reduce((s, r) => s + r.qty * r.price * (1 - r.disc / 100) * (r.tax / 100), 0);
  const total = net + tax;
  const budget = 18400000;

  const errors =
    step === 0
      ? [!supplierId && "Select a supplier", !warehouse && "Select a receiving warehouse", !delivery && "Enter expected delivery date", blocked && `${supplier?.name} is not approved for purchasing`].filter(Boolean)
      : step === 1
        ? [rows.length === 0 && "Add at least one line item", rows.some((r) => r.qty <= 0) && "Quantity must be greater than zero"].filter(Boolean)
        : step === 2
          ? [total > budget && "Order value exceeds available budget"].filter(Boolean)
          : [];

  const addRow = (code: string) => {
    const c = catalog.find((x) => x.code === code)!;
    setRows((r) => [...r, { code: c.code, desc: c.desc, hsn: c.hsn, uom: c.uom, qty: 100, price: c.price, disc: 0, tax: c.tax }]);
  };

  const next = () => {
    setTouched(true);
    if (errors.length) {
      toast.error("Fix validation errors to continue");
      return;
    }
    setTouched(false);
    setStep((s) => Math.min(3, s + 1));
  };

  if (done) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center py-16 text-center">
        <span className="flex size-16 items-center justify-center rounded-2xl bg-success-soft text-success"><Check className="size-8" /></span>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight">Purchase order submitted</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          <span className="num font-medium text-foreground">PO-2026-004942</span> for {money(total)} has been routed to the approval matrix.
          Level 1 approval sits with Rohit Bansal (SLA 48 hrs).
        </p>
        <div className="mt-6 flex gap-2">
          <Button variant="outline" onClick={() => { setDone(false); setStep(0); setRows([]); }}>Create another</Button>
          <Button onClick={() => navigate({ to: "/supplier-flow/purchase-orders" })}>View all orders</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        breadcrumbs={[{ label: "Home", to: "/supplier-flow" }, { label: "Purchase Orders", to: "/supplier-flow/purchase-orders" }, { label: "Create" }]}
        title="Create purchase order"
        subtitle="Vendor selection, item pricing, budget validation and approval routing"
        actions={
          <>
            <Button variant="outline" onClick={() => toast.success("Draft saved")}><Save className="size-4" /> Save draft</Button>
            <Button variant="ghost" asChild><Link to="/supplier-flow/purchase-orders">Cancel</Link></Button>
          </>
        }
      />

      <ol className="card-elevate mb-4 flex overflow-x-auto rounded-xl p-2">
        {steps.map((s, i) => (
          <li key={s} className="flex min-w-max flex-1 items-center gap-2 px-2 py-1.5">
            <button onClick={() => setStep(i)} className={cn("flex items-center gap-2 rounded-lg px-2 py-1.5", step === i ? "bg-primary-soft text-primary" : "hover:bg-accent")}>
              <span className={cn("num flex size-6 items-center justify-center rounded-full text-xs font-semibold", step > i ? "bg-success text-background" : step === i ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                {step > i ? <Check className="size-3.5" /> : i + 1}
              </span>
              <span className="text-xs font-medium">{s}</span>
            </button>
            {i < steps.length - 1 && <span className="hidden h-px flex-1 bg-border sm:block" />}
          </li>
        ))}
      </ol>

      {touched && errors.length > 0 && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Validation failed</AlertTitle>
          <AlertDescription><ul className="list-disc pl-4">{errors.map((e) => <li key={String(e)}>{e}</li>)}</ul></AlertDescription>
        </Alert>
      )}

      <SectionCard title={steps[step]}>
        {step === 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="text-xs">Supplier *</Label>
              <Select value={supplierId} onValueChange={setSupplierId}>
                <SelectTrigger className="mt-1.5 w-full"><SelectValue placeholder="Select supplier…" /></SelectTrigger>
                <SelectContent>
                  {suppliers.map((s) => <SelectItem key={s.id} value={s.id}>{s.name} — {s.status}</SelectItem>)}
                </SelectContent>
              </Select>
              {blocked && <p className="mt-1 text-[11px] text-destructive">Supplier status is “{supplier?.status}” — purchasing is disabled.</p>}
            </div>
            <div>
              <Label className="text-xs">Receiving warehouse *</Label>
              <Select value={warehouse} onValueChange={setWarehouse}>
                <SelectTrigger className="mt-1.5 w-full"><SelectValue placeholder="Select warehouse…" /></SelectTrigger>
                <SelectContent>
                  {["WH-PUN-01 · Chakan Central Warehouse", "WH-MUM-02 · JNPT Bonded Warehouse", "WH-AHM-03 · Sanand Raw Material Yard", "WH-CHN-04 · Oragadam Spares Store", "WH-BLR-05 · Peenya Consumables Store"].map((w) => <SelectItem key={w} value={w}>{w}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs">Expected delivery *</Label><Input type="date" className="mt-1.5" value={delivery} onChange={(e) => setDelivery(e.target.value)} /></div>
            <div>
              <Label className="text-xs">Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="mt-1.5 w-full"><SelectValue /></SelectTrigger>
                <SelectContent>{["Low", "Medium", "High", "Critical"].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2"><Label className="text-xs">Remarks</Label><Textarea className="mt-1.5" rows={2} value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Special instructions for the supplier" /></div>
            {supplier && (
              <div className="sm:col-span-2 grid gap-3 rounded-lg border bg-muted/40 p-3 text-sm sm:grid-cols-4">
                <div><p className="text-xs text-muted-foreground">Payment terms</p><p className="font-medium">{supplier.paymentTerms}</p></div>
                <div><p className="text-xs text-muted-foreground">Currency</p><p className="font-medium">{supplier.currency}</p></div>
                <div><p className="text-xs text-muted-foreground">Lead time</p><p className="num font-medium">{supplier.leadTimeDays} days</p></div>
                <div><p className="text-xs text-muted-foreground">Rating</p><p className="num font-medium">{supplier.rating}/5</p></div>
              </div>
            )}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Select onValueChange={addRow}>
                <SelectTrigger className="w-full sm:w-96"><SelectValue placeholder="Search material catalogue…" /></SelectTrigger>
                <SelectContent>{catalog.map((c) => <SelectItem key={c.code} value={c.code}>{c.code} — {c.desc}</SelectItem>)}</SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={() => addRow(catalog[0]!.code)}><Plus className="size-4" /> Add line</Button>
            </div>
            {rows.length === 0 ? (
              <div className="rounded-lg border border-dashed px-4 py-12 text-center text-sm text-muted-foreground">No line items yet — add materials from the catalogue.</div>
            ) : (
              <div className="overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Material</TableHead><TableHead className="w-24">Qty</TableHead><TableHead className="w-28">Rate</TableHead>
                      <TableHead className="w-20">Disc %</TableHead><TableHead className="w-20">Tax %</TableHead>
                      <TableHead className="text-right">Amount</TableHead><TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((r, i) => (
                      <TableRow key={i}>
                        <TableCell><p className="text-sm font-medium">{r.desc}</p><p className="num text-xs text-muted-foreground">{r.code} · HSN {r.hsn} · {r.uom}</p></TableCell>
                        <TableCell><Input className="h-8" type="number" value={r.qty} onChange={(e) => setRows((p) => p.map((x, j) => (j === i ? { ...x, qty: +e.target.value } : x)))} /></TableCell>
                        <TableCell><Input className="h-8" type="number" value={r.price} onChange={(e) => setRows((p) => p.map((x, j) => (j === i ? { ...x, price: +e.target.value } : x)))} /></TableCell>
                        <TableCell><Input className="h-8" type="number" value={r.disc} onChange={(e) => setRows((p) => p.map((x, j) => (j === i ? { ...x, disc: +e.target.value } : x)))} /></TableCell>
                        <TableCell><Input className="h-8" type="number" value={r.tax} onChange={(e) => setRows((p) => p.map((x, j) => (j === i ? { ...x, tax: +e.target.value } : x)))} /></TableCell>
                        <TableCell className="num text-right text-sm font-medium">{money(r.qty * r.price * (1 - r.disc / 100) * (1 + r.tax / 100))}</TableCell>
                        <TableCell><Button size="icon" variant="ghost" onClick={() => setRows((p) => p.filter((_, j) => j !== i))}><Trash2 className="size-4 text-destructive" /></Button></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-lg border p-4">
              <p className="text-sm font-semibold">Budget validation — CAPEX-FY27-MACH</p>
              <Progress value={Math.min(100, (total / budget) * 100)} className="mt-3 h-2" />
              <dl className="mt-3 space-y-1.5 text-sm">
                <div className="flex justify-between"><dt className="text-muted-foreground">Available budget</dt><dd className="num">{money(budget)}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">This order</dt><dd className="num">{money(total)}</dd></div>
                <div className="flex justify-between border-t pt-1.5 font-semibold"><dt>Balance after commit</dt><dd className="num">{money(budget - total)}</dd></div>
              </dl>
              <p className={cn("mt-3 rounded-md px-3 py-2 text-xs", total > budget ? "bg-danger-soft text-destructive" : "bg-success-soft text-success-foreground")}>
                {total > budget ? "Budget exceeded — request supplementary budget or reduce scope." : "Budget check passed."}
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-semibold">Tax computation</p>
              <dl className="mt-3 space-y-1.5 text-sm">
                <div className="flex justify-between"><dt className="text-muted-foreground">Taxable value</dt><dd className="num">{money(net)}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">CGST 9%</dt><dd className="num">{money(tax / 2)}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">SGST 9%</dt><dd className="num">{money(tax / 2)}</dd></div>
                <div className="flex justify-between border-t pt-1.5 font-semibold"><dt>Order total</dt><dd className="num">{money(total)}</dd></div>
              </dl>
              <p className="mt-3 text-xs text-muted-foreground">Approval path: Purchase Manager → Finance Controller{total > 7500000 ? " → Director — Operations" : ""}</p>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <dl className="grid gap-4 sm:grid-cols-4">
              <div><dt className="text-xs text-muted-foreground">Supplier</dt><dd className="text-sm font-medium">{supplier?.name ?? "—"}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Warehouse</dt><dd className="text-sm font-medium">{warehouse || "—"}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Delivery</dt><dd className="num text-sm font-medium">{delivery || "—"}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Priority</dt><dd className="text-sm font-medium">{priority}</dd></div>
            </dl>
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader><TableRow className="bg-muted/50"><TableHead>Material</TableHead><TableHead className="text-right">Qty</TableHead><TableHead className="text-right">Rate</TableHead><TableHead className="text-right">Amount</TableHead></TableRow></TableHeader>
                <TableBody>
                  {rows.map((r, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-sm">{r.desc}</TableCell>
                      <TableCell className="num text-right text-sm">{r.qty} {r.uom}</TableCell>
                      <TableCell className="num text-right text-sm">{money(r.price)}</TableCell>
                      <TableCell className="num text-right text-sm font-medium">{money(r.qty * r.price * (1 - r.disc / 100))}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <p className="num text-right text-lg font-semibold">Total incl. tax: {money(total)}</p>
          </div>
        )}

        <div className="mt-6 flex items-center justify-between border-t pt-4">
          <Button variant="outline" disabled={step === 0} onClick={() => setStep((s) => s - 1)}><ArrowLeft className="size-4" /> Back</Button>
          <p className="text-xs text-muted-foreground">Step {step + 1} of 4</p>
          {step < 3 ? <Button onClick={next}>Continue <ArrowRight className="size-4" /></Button> : <Button onClick={() => setConfirm(true)}>Submit for approval</Button>}
        </div>
      </SectionCard>

      <Dialog open={confirm} onOpenChange={setConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit purchase order?</DialogTitle>
            <DialogDescription>{money(total)} will be committed against the budget and routed for approval.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirm(false)}>Keep editing</Button>
            <Button onClick={() => { setConfirm(false); setDone(true); toast.success("Purchase order submitted"); }}>Confirm & submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
