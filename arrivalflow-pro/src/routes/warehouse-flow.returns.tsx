import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Save, Undo2 } from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader, SectionCard, StatusBadge } from "@/apps/warehouse-flow/components/ui-kit";
import { KpiCard } from "@/apps/warehouse-flow/components/kpi-card";
import {
  materialCatalog,
  materialConditions,
  materialRequests,
  returnReasons,
  returns,
  warehouses,
} from "@/apps/warehouse-flow/data";

export const Route = createFileRoute("/warehouse-flow/returns")({
  head: () => ({
    meta: [
      { title: "Material Returns — WMS Console" },
      {
        name: "description",
        content:
          "Log surplus, wrong, damaged, quality-failed, excess and cancelled work-order returns with condition and return bin.",
      },
      { property: "og:title", content: "Material Returns — WMS Console" },
      {
        property: "og:description",
        content: "Log shop-floor material returns and route them for inspection.",
      },
    ],
  }),
  component: ReturnsPage,
});

function ReturnsPage() {
  const [form, setForm] = useState({
    request: "MR-2026-00842",
    issue: "GI-2026-00842",
    material: "MAT-10082",
    qty: "0",
    warehouse: "WH-01",
    bin: "RB-01",
    reason: returnReasons[0]!,
    condition: materialConditions[0]!,
    remarks: "",
  });

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <>
      <PageHeader
        title="Material Returns"
        description="Log material returns from the shop floor and route them for inspection."
        breadcrumbs={[{ label: "Home", to: "/warehouse-flow/" }, { label: "Material Returns" }]}
      />

      <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Returns This Week" value="23" delta="-2" trend="down" hint="1.8% of issued" icon="Undo2" />
        <KpiCard label="Awaiting Inspection" value="8" delta="+3" trend="up" hint="2 overdue" icon="SearchCheck" />
        <KpiCard label="Returned to Stock" value="11" delta="+4" trend="up" hint="good condition" icon="PackageCheck" />
        <KpiCard label="Scrapped" value="4" delta="+1" trend="up" hint="₹42,800 write-off" icon="Trash2" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[400px_minmax(0,1fr)]">
        <SectionCard title="New Return" description="Return number is generated on save">
          <div className="space-y-4">
            <Field label="Return Number">
              <Input value="MRTN-2026-00126" readOnly className="num bg-muted/50" />
            </Field>
            <Field label="Reference Request">
              <Select value={form.request} onValueChange={(v) => set("request", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {materialRequests.map((r) => (
                    <SelectItem key={r.requestNo} value={r.requestNo}>{r.requestNo}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Reference Issue">
              <Input value={form.issue} onChange={(e) => set("issue", e.target.value)} className="num" />
            </Field>
            <Field label="Material">
              <Select value={form.material} onValueChange={(v) => set("material", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {materialCatalog.map((m) => (
                    <SelectItem key={m.code} value={m.code}>
                      {m.code} — {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Returned Quantity">
                <Input
                  type="number"
                  min={0}
                  className="num"
                  value={form.qty}
                  onChange={(e) => set("qty", e.target.value)}
                />
              </Field>
              <Field label="Unit">
                <Input
                  readOnly
                  className="bg-muted/50"
                  value={materialCatalog.find((m) => m.code === form.material)?.unit ?? "PCS"}
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Warehouse">
                <Select value={form.warehouse} onValueChange={(v) => set("warehouse", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {warehouses.map((w) => (
                      <SelectItem key={w.code} value={w.code}>{w.code}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Return Bin">
                <Input value={form.bin} onChange={(e) => set("bin", e.target.value)} className="num" />
              </Field>
            </div>
            <Field label="Return Reason">
              <Select value={form.reason} onValueChange={(v) => set("reason", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {returnReasons.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Material Condition">
              <Select value={form.condition} onValueChange={(v) => set("condition", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {materialConditions.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Remarks">
              <Textarea
                rows={3}
                placeholder="Optional description"
                value={form.remarks}
                onChange={(e) => set("remarks", e.target.value)}
              />
            </Field>
            <div className="flex flex-wrap gap-2">
              <Button
                className="flex-1"
                onClick={() => toast.success("MRTN-2026-00126 logged and routed for inspection")}
              >
                <Undo2 className="size-4" /> Submit Return
              </Button>
              <Button variant="outline" onClick={() => toast("Return draft saved")}>
                <Save className="size-4" /> Draft
              </Button>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Recent Returns"
          description="Returns awaiting inspection or completed this week"
          bodyClassName="p-0"
        >
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/60">
                  <TableHead>Return ID</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Material</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Condition</TableHead>
                  <TableHead>By</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {returns.map((r) => (
                  <TableRow key={r.returnNo}>
                    <TableCell className="num text-sm font-semibold text-primary">{r.returnNo}</TableCell>
                    <TableCell className="num text-xs text-muted-foreground">
                      {r.request}
                      <br />
                      {r.issue}
                    </TableCell>
                    <TableCell>
                      <p className="text-sm font-medium">{r.material}</p>
                      <p className="num text-xs text-muted-foreground">{r.code}</p>
                    </TableCell>
                    <TableCell className="num text-right text-sm font-semibold">
                      {r.qty} {r.unit}
                    </TableCell>
                    <TableCell className="text-sm">{r.reason}</TableCell>
                    <TableCell><StatusBadge status={r.condition} dot={false} /></TableCell>
                    <TableCell className="text-sm">{r.by}</TableCell>
                    <TableCell className="num text-sm">{r.date}</TableCell>
                    <TableCell><StatusBadge status={r.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </SectionCard>
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
