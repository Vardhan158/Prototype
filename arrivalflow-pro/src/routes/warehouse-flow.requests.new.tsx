import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Check, Plus, Save, Send, Trash2, X } from "lucide-react";
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
import { PageHeader, SectionCard, StatusBadge } from "@/apps/warehouse-flow/components/ui-kit";
import { cn } from "@/lib/utils";
import { departments, inr, materialCatalog, warehouses } from "@/apps/warehouse-flow/data";

export const Route = createFileRoute("/warehouse-flow/requests/new")({
  head: () => ({
    meta: [
      { title: "Create Material Request — WMS Console" },
      {
        name: "description",
        content:
          "Multi-step form to raise a material request with dynamic line items, bin locations and approval routing.",
      },
      { property: "og:title", content: "Create Material Request — WMS Console" },
      {
        property: "og:description",
        content: "Raise a warehouse material request with dynamic line items and approval routing.",
      },
    ],
  }),
  component: CreateRequestPage,
});

interface Line {
  id: number;
  code: string;
  warehouse: string;
  zone: string;
  rack: string;
  shelf: string;
  bin: string;
  available: number;
  requested: number;
}

const steps = ["Request Header", "Material Lines", "Review & Submit"];

let seq = 2;

function CreateRequestPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [header, setHeader] = useState({
    workOrder: "",
    department: "Production",
    warehouse: "WH-01",
    priority: "Medium",
    requiredDate: "2026-08-08",
    costCenter: "CC-4020",
    requestedBy: "Anjali Sharma",
    notes: "",
  });
  const [lines, setLines] = useState<Line[]>([
    {
      id: 1,
      code: "MAT-10045",
      warehouse: "WH-01",
      zone: "Z-A",
      rack: "R-12",
      shelf: "S-3",
      bin: "B-014",
      available: 320,
      requested: 40,
    },
  ]);

  const addLine = () =>
    setLines((l) => [
      ...l,
      {
        id: seq++,
        code: materialCatalog[l.length % materialCatalog.length]!.code,
        warehouse: header.warehouse,
        zone: "Z-A",
        rack: "R-01",
        shelf: "S-1",
        bin: "B-001",
        available: 250,
        requested: 1,
      },
    ]);

  const update = (id: number, patch: Partial<Line>) =>
    setLines((ls) => ls.map((l) => (l.id === id ? { ...l, ...patch } : l)));

  const total = lines.reduce((s, l) => {
    const m = materialCatalog.find((x) => x.code === l.code);
    return s + (m ? m.rate * l.requested : 0);
  }, 0);
  const totalQty = lines.reduce((s, l) => s + l.requested, 0);

  return (
    <>
      <PageHeader
        title="Create Material Request"
        description="Submit a new request for materials from your warehouse inventory."
        breadcrumbs={[
          { label: "Home", to: "/warehouse-flow/" },
          { label: "Material Requests", to: "/warehouse-flow/requests" },
          { label: "New" },
        ]}
        actions={
          <>
            <Button variant="ghost" onClick={() => navigate({ to: "/warehouse-flow/requests" })}>
              <X className="size-4" /> Cancel
            </Button>
            <Button variant="outline" onClick={() => toast.success("Draft saved as MR-2026-00851")}>
              <Save className="size-4" /> Save Draft
            </Button>
            <Button
              onClick={() => {
                toast.success("MR-2026-00851 submitted for approval");
                navigate({ to: "/warehouse-flow/approvals" });
              }}
            >
              <Send className="size-4" /> Submit for Approval
            </Button>
          </>
        }
      />

      <SectionCard className="mb-4" bodyClassName="p-4">
        <ol className="grid gap-3 sm:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s}>
              <button
                onClick={() => setStep(i)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors",
                  i === step
                    ? "border-primary/40 bg-primary/8"
                    : "border-border hover:bg-muted/60",
                )}
              >
                <span
                  className={cn(
                    "num grid size-7 shrink-0 place-items-center rounded-full text-xs font-semibold",
                    i < step
                      ? "bg-success text-success-foreground"
                      : i === step
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground",
                  )}
                >
                  {i < step ? <Check className="size-3.5" /> : i + 1}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">{s}</span>
                  <span className="block text-xs text-muted-foreground">Step {i + 1} of 3</span>
                </span>
              </button>
            </li>
          ))}
        </ol>
      </SectionCard>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          {step === 0 && (
            <SectionCard title="Request Header" description="Requester and routing details">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Work Order">
                  <Input
                    value={header.workOrder}
                    placeholder="e.g. WO-88300"
                    onChange={(e) => setHeader({ ...header, workOrder: e.target.value })}
                  />
                </Field>
                <Field label="Requester">
                  <Input value={header.requestedBy} readOnly className="bg-muted/50" />
                </Field>
                <Field label="Department">
                  <Select
                    value={header.department}
                    onValueChange={(v) => setHeader({ ...header, department: v })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {departments.map((d) => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Warehouse">
                  <Select
                    value={header.warehouse}
                    onValueChange={(v) => setHeader({ ...header, warehouse: v })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {warehouses.map((w) => (
                        <SelectItem key={w.code} value={w.code}>
                          {w.code} — {w.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Priority">
                  <Select
                    value={header.priority}
                    onValueChange={(v) => setHeader({ ...header, priority: v })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["Low", "Medium", "High", "Critical"].map((p) => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Required By">
                  <Input
                    type="date"
                    value={header.requiredDate}
                    onChange={(e) => setHeader({ ...header, requiredDate: e.target.value })}
                  />
                </Field>
                <Field label="Cost Center">
                  <Input
                    value={header.costCenter}
                    onChange={(e) => setHeader({ ...header, costCenter: e.target.value })}
                  />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Description / Notes">
                    <Textarea
                      rows={4}
                      placeholder="Optional description for approvers"
                      value={header.notes}
                      onChange={(e) => setHeader({ ...header, notes: e.target.value })}
                    />
                  </Field>
                </div>
              </div>
            </SectionCard>
          )}

          {step === 1 && (
            <SectionCard
              title="Line Items"
              description="Add the materials required for this request"
              actions={
                <Button size="sm" onClick={addLine}>
                  <Plus className="size-4" /> Add Line
                </Button>
              }
            >
              <div className="space-y-4">
                {lines.map((l, idx) => {
                  const m = materialCatalog.find((x) => x.code === l.code)!;
                  const short = l.requested > l.available;
                  return (
                    <div key={l.id} className="rounded-xl border border-border p-4">
                      <div className="mb-3 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                        <p className="truncate text-sm font-semibold">
                          Line {idx + 1} · {m.name}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Remove line"
                          onClick={() => setLines((ls) => ls.filter((x) => x.id !== l.id))}
                        >
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <Field label="Material Code">
                          <Select value={l.code} onValueChange={(v) => update(l.id, { code: v })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {materialCatalog.map((mm) => (
                                <SelectItem key={mm.code} value={mm.code}>
                                  {mm.code} — {mm.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </Field>
                        <Field label="Material Name">
                          <Input value={m.name} readOnly className="bg-muted/50" />
                        </Field>
                        <Field label="Warehouse">
                          <Select
                            value={l.warehouse}
                            onValueChange={(v) => update(l.id, { warehouse: v })}
                          >
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {warehouses.map((w) => (
                                <SelectItem key={w.code} value={w.code}>{w.code}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </Field>
                        <Field label="Zone">
                          <Input value={l.zone} onChange={(e) => update(l.id, { zone: e.target.value })} />
                        </Field>
                        <Field label="Rack">
                          <Input value={l.rack} onChange={(e) => update(l.id, { rack: e.target.value })} />
                        </Field>
                        <Field label="Shelf">
                          <Input value={l.shelf} onChange={(e) => update(l.id, { shelf: e.target.value })} />
                        </Field>
                        <Field label="Bin">
                          <Input value={l.bin} onChange={(e) => update(l.id, { bin: e.target.value })} />
                        </Field>
                        <Field label="Available Qty">
                          <Input value={`${l.available} ${m.unit}`} readOnly className="num bg-muted/50" />
                        </Field>
                        <Field label="Requested Qty">
                          <Input
                            type="number"
                            min={1}
                            value={l.requested}
                            className="num"
                            onChange={(e) => update(l.id, { requested: Number(e.target.value) })}
                          />
                        </Field>
                        <Field label="Unit">
                          <Input value={m.unit} readOnly className="bg-muted/50" />
                        </Field>
                        <Field label="Line Value">
                          <Input value={inr(m.rate * l.requested)} readOnly className="num bg-muted/50" />
                        </Field>
                      </div>
                      {short && (
                        <p className="mt-3 text-xs font-medium text-destructive">
                          Requested quantity exceeds available stock — a shortage will be raised on
                          reservation.
                        </p>
                      )}
                    </div>
                  );
                })}
                {lines.length === 0 && (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    No lines added yet. Use “Add Line” to include materials.
                  </p>
                )}
              </div>
            </SectionCard>
          )}

          {step === 2 && (
            <SectionCard title="Review & Submit" description="Verify before routing for approval">
              <dl className="grid gap-4 sm:grid-cols-3">
                {[
                  ["Work Order", header.workOrder || "—"],
                  ["Department", header.department],
                  ["Warehouse", header.warehouse],
                  ["Priority", header.priority],
                  ["Required By", header.requiredDate],
                  ["Cost Center", header.costCenter],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-xs uppercase tracking-wide text-muted-foreground">{k}</dt>
                    <dd className="num mt-0.5 text-sm font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-5 space-y-2">
                {lines.map((l) => {
                  const m = materialCatalog.find((x) => x.code === l.code)!;
                  return (
                    <div
                      key={l.id}
                      className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-lg border border-border px-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{m.name}</p>
                        <p className="num text-xs text-muted-foreground">
                          {l.code} · {l.warehouse}/{l.zone}/{l.rack}/{l.shelf}/{l.bin}
                        </p>
                      </div>
                      <p className="num text-sm font-semibold">
                        {l.requested} {m.unit} · {inr(m.rate * l.requested)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </SectionCard>
          )}

          <div className="flex justify-between gap-2">
            <Button variant="outline" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
              Back
            </Button>
            <Button disabled={step === 2} onClick={() => setStep((s) => s + 1)}>
              Continue
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <SectionCard title="Approval Path">
            <ol className="space-y-3">
              {[
                ["1", "Rohit Menon", "Ops Manager"],
                ["2", "Lena Fernandes", "Finance"],
                ["3", "Store Desk", "Reservation"],
              ].map(([n, name, role]) => (
                <li key={n} className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5">
                  <span className="num grid size-7 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {n}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{name}</p>
                    <p className="text-xs text-muted-foreground">{role}</p>
                  </div>
                </li>
              ))}
            </ol>
          </SectionCard>

          <SectionCard title="Summary">
            <dl className="space-y-3 text-sm">
              <Row k="Line items" v={String(lines.length)} />
              <Row k="Total quantity" v={String(totalQty)} />
              <Row k="Cost estimate" v={inr(total)} />
              <Row k="Estimated pick time" v={`${Math.max(6, lines.length * 9)} min`} />
            </dl>
            <div className="mt-4">
              <StatusBadge status="Draft" />
            </div>
          </SectionCard>
        </div>
      </div>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="num font-semibold">{v}</dd>
    </div>
  );
}
