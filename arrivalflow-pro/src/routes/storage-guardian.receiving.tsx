import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowRight, CheckCircle2, QrCode as QrIcon, ScanBarcode, ShieldCheck, XCircle } from "lucide-react";
import { PageHeader } from "@/apps/storage-guardian/components/warehouse/app-shell";
import { QrCode } from "@/apps/storage-guardian/components/warehouse/qr-code";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { useWarehouse } from "@/apps/storage-guardian/lib/warehouse/store";
import { CATEGORIES, HAZARDS, SUPPLIERS, zoneById } from "@/apps/storage-guardian/lib/warehouse/data";
import { STAGES, stageIndex, validateStorageRules } from "@/apps/storage-guardian/lib/warehouse/rules";
import { itemStatusTone } from "@/apps/storage-guardian/lib/warehouse/stats";
import type { AllocationResult, Item, ItemCategory } from "@/apps/storage-guardian/lib/warehouse/types";

export const Route = createFileRoute("/storage-guardian/receiving")({
  head: () => ({
    meta: [
      { title: "Receiving & Pipeline — NODE·WMS" },
      {
        name: "description",
        content:
          "Log supplier deliveries against PO/ASN, inspect goods, generate QR labels and validate storage rules through the 11-stage pipeline.",
      },
      { property: "og:title", content: "Receiving & Pipeline — NODE·WMS" },
      {
        property: "og:description",
        content: "Log deliveries against PO/ASN and drive items through the storage pipeline.",
      },
    ],
  }),
  component: ReceivingPage,
});

const blank = {
  name: "",
  category: CATEGORIES[0] as ItemCategory,
  hazard: "None" as Item["hazard"],
  temp: "Ambient" as Item["temp"],
  size: "Medium" as Item["size"],
  weightKg: "10",
  valueUsd: "1200",
  po: "PO-88500",
  asn: "ASN-55200",
  supplier: SUPPLIERS[0] as string,
  expectedQty: "10",
  receivedQty: "10",
};

function ReceivingPage() {
  const { items, receive } = useWarehouse();
  const [form, setForm] = useState(blank);
  const set = (k: keyof typeof blank, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const pipeline = items.filter((i) => i.stage !== "completed");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Item description is required.");
      return;
    }
    if (!/^PO-\d+$/.test(form.po) || !/^ASN-\d+$/.test(form.asn)) {
      toast.error("PO/ASN mismatch — expected format PO-##### / ASN-#####.");
      return;
    }
    const item = receive({
      name: form.name,
      category: form.category,
      hazard: form.hazard,
      temp: form.temp,
      size: form.size,
      weightKg: Number(form.weightKg) || 0,
      valueUsd: Number(form.valueUsd) || 0,
      po: form.po,
      asn: form.asn,
      supplier: form.supplier,
      expectedQty: Number(form.expectedQty) || 0,
      receivedQty: Number(form.receivedQty) || 0,
    });
    toast.success(`${item.id} received — moved to Quality Inspection.`);
    setForm({ ...blank, name: "" });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Receiving & Pipeline"
        subtitle="Capture supplier deliveries against PO/ASN, then advance each item through the 11-stage storage pipeline."
      />

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <form onSubmit={submit} className="panel h-fit space-y-4 p-5">
          <h2 className="text-lg font-semibold">Document Management & OCR</h2>

          <div className="space-y-1.5">
            <Label htmlFor="name">Item description</Label>
            <Input id="name" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. PowerEdge R760 Rack Server" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="po">PO number</Label>
              <Input id="po" value={form.po} onChange={(e) => set("po", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="asn">ASN number</Label>
              <Input id="asn" value={form.asn} onChange={(e) => set("asn", e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select value={form.category} onValueChange={(v) => set("category", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <p className="text-[11px] text-muted-foreground">
              Preferred zone: {zoneById(validateStorageRules({ ...(blankItem(form)) }).preferredZone).name}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Hazard class</Label>
              <Select value={form.hazard} onValueChange={(v) => set("hazard", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {HAZARDS.map((h) => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Temperature</Label>
              <Select value={form.temp} onValueChange={(v) => set("temp", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Ambient", "Climate Controlled", "Cold"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Size</Label>
              <Select value={form.size} onValueChange={(v) => set("size", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Small", "Medium", "Large"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="w">Weight (kg)</Label>
              <Input id="w" type="number" value={form.weightKg} onChange={(e) => set("weightKg", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="v">Value (USD)</Label>
              <Input id="v" type="number" value={form.valueUsd} onChange={(e) => set("valueUsd", e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Supplier</Label>
              <Select value={form.supplier} onValueChange={(v) => set("supplier", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SUPPLIERS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="eq">Expected qty</Label>
              <Input id="eq" type="number" value={form.expectedQty} onChange={(e) => set("expectedQty", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rq">Received qty</Label>
              <Input id="rq" type="number" value={form.receivedQty} onChange={(e) => set("receivedQty", e.target.value)} />
            </div>
          </div>

          {Number(form.receivedQty) !== Number(form.expectedQty) && (
            <p className="rounded-md border border-warning/40 bg-warning/10 px-3 py-2 text-xs text-warning">
              Variance of {Number(form.receivedQty) - Number(form.expectedQty)} units will be recorded and an exception raised.
            </p>
          )}

          <Button type="submit" className="w-full">Log receipt</Button>
        </form>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Active pipeline ({pipeline.length})</h2>
          {pipeline.length === 0 && (
            <p className="panel p-6 text-sm text-muted-foreground">No items in the pipeline. Log a receipt to start one.</p>
          )}
          {pipeline.map((item) => <PipelineCard key={item.id} item={item} />)}
        </div>
      </div>
    </div>
  );
}

function blankItem(form: typeof blank): Item {
  return {
    id: "PREVIEW",
    name: form.name,
    category: form.category,
    code: "",
    hazard: form.hazard,
    temp: form.temp,
    size: form.size,
    weightKg: Number(form.weightKg) || 0,
    valueUsd: Number(form.valueUsd) || 0,
    qty: Number(form.receivedQty) || 0,
    po: form.po,
    asn: form.asn,
    supplier: form.supplier,
    stage: "delivery",
    status: "In Pipeline",
    createdAt: "",
  };
}

function PipelineCard({ item }: { item: Item }) {
  const { inspect, generateCode, runValidation, runCapacity } = useWarehouse();
  const [notes, setNotes] = useState("");
  const [allocation, setAllocation] = useState<AllocationResult | null>(null);
  const idx = stageIndex(item.stage);
  const validation = validateStorageRules(item);

  return (
    <article className="panel p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{item.name}</h3>
            <Badge variant="outline" className={itemStatusTone(item.status)}>{item.status}</Badge>
          </div>
          <p className="mt-0.5 font-mono text-xs text-muted-foreground">
            {item.id} · {item.po} / {item.asn} · {item.qty} units · {item.category}
          </p>
        </div>
        <Badge variant="secondary">
          Stage {idx + 1}/11 · {STAGES[idx]?.label}
        </Badge>
      </div>

      <div className="mt-3 flex gap-0.5">
        {STAGES.map((s, i) => (
          <span
            key={s.id}
            title={s.label}
            className={`h-1.5 flex-1 rounded-full ${i <= idx ? "bg-primary" : "bg-muted"}`}
          />
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {item.stage === "inspection" && (
          <div className="space-y-2">
            <Label htmlFor={`n-${item.id}`}>Inspection notes</Label>
            <Textarea id={`n-${item.id}`} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Packaging, seals, visible damage…" rows={2} />
            <div className="flex gap-2">
              <Button size="sm" onClick={() => { inspect(item.id, "Pass", notes); toast.success("Inspection passed."); }}>
                <CheckCircle2 className="size-4" /> Pass
              </Button>
              <Button size="sm" variant="destructive" onClick={() => { inspect(item.id, "Fail", notes); toast.error("Failed — routed to Return/Repair Zone."); }}>
                <XCircle className="size-4" /> Fail
              </Button>
            </div>
          </div>
        )}

        {item.stage === "qr" && (
          <Button size="sm" onClick={() => { const c = generateCode(item.id); toast.success(`Label ${c} generated.`); }}>
            <QrIcon className="size-4" /> Generate QR / barcode
          </Button>
        )}

        {item.stage === "rules" && (
          <div className="space-y-2">
            <ul className="space-y-1 text-xs">
              {validation.checks.map((c) => (
                <li key={c.rule} className="flex gap-2">
                  {c.passed ? <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-success" /> : <XCircle className="mt-0.5 size-3.5 shrink-0 text-warning" />}
                  <span><strong className="font-medium">{c.rule}:</strong> {c.detail}</span>
                </li>
              ))}
            </ul>
            <Button size="sm" onClick={() => { runValidation(item.id); toast.success(`Validated → ${zoneById(validation.recommendedZone).name}`); }}>
              <ShieldCheck className="size-4" /> Accept & continue to capacity check
            </Button>
          </div>
        )}

        {item.stage === "capacity" && (
          <div className="space-y-2">
            <Button size="sm" onClick={() => {
              const res = runCapacity(item.id);
              setAllocation(res);
              res.failed ? toast.error("No capacity — escalated to Warehouse Manager.") : toast.success(`Assigned ${res.locationCode}`);
            }}>
              <ArrowRight className="size-4" /> Run capacity decision tree
            </Button>
            {allocation && (
              <ol className="space-y-1 text-xs">
                {allocation.steps.map((s) => (
                  <li key={s.step} className={s.outcome === "pass" ? "text-success" : s.outcome === "escalate" ? "text-warning" : "text-muted-foreground"}>
                    {s.step}. {s.label} — {s.detail}
                  </li>
                ))}
              </ol>
            )}
          </div>
        )}

        {item.stage === "task" && (
          <div className="flex flex-wrap items-center gap-3">
            {item.code && <QrCode value={item.code} size={96} />}
            <Button size="sm" variant="outline" asChild>
              <Link to="/storage-guardian/putaway"><ScanBarcode className="size-4" /> Go to put-away queue</Link>
            </Button>
          </div>
        )}
      </div>
    </article>
  );
}
