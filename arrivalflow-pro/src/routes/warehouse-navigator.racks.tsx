import { createFileRoute } from "@tanstack/react-router";
import { Barcode, Boxes, Plus, Weight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { DataTable, type Column } from "@/apps/warehouse-navigator/components/data-table";
import { KeyValue, Meter, PageHeader, StatCard, StatusChip } from "@/apps/warehouse-navigator/components/ui-kit";
import { aisles, racks, shelves, type Rack } from "@/apps/warehouse-navigator/data";

export const Route = createFileRoute("/warehouse-navigator/racks")({
  head: () => ({
    meta: [
      { title: "Rack Management | StoreGrid WMS Storage & Locations" },
      {
        name: "description",
        content:
          "Rack master data with height, width, level count, maximum weight, current load utilisation, rack barcode and blocked-for-inspection status.",
      },
      { property: "og:title", content: "Rack Management | StoreGrid WMS" },
      { property: "og:description", content: "Rack dimensions, weight limits, load utilisation and barcodes." },
    ],
  }),
  component: RackManagement,
});

type Errors = { code?: string; maxWeight?: string; height?: string };

function RackManagement() {
  const [aisle, setAisle] = useState("All aisles");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [detail, setDetail] = useState<Rack | null>(null);
  const [form, setForm] = useState({ code: "", aisle: "A-01", height: "", width: "2.4", levels: "5", maxWeight: "", barcode: "" });
  const [errors, setErrors] = useState<Errors>({});

  const rows = racks.filter((r) => aisle === "All aisles" || r.aisle === aisle);

  function submit() {
    const next: Errors = {};
    if (!/^R-A\d{2}-\d{2}$/.test(form.code)) next.code = "Rack pattern is R-A00-00 (e.g. R-A01-04).";
    if (!form.height || Number(form.height) <= 0) next.height = "Enter rack height in metres.";
    if (!form.maxWeight || Number(form.maxWeight) < 100) next.maxWeight = "Max weight must be at least 100 kg.";
    setErrors(next);
    if (Object.keys(next).length) return;
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setOpen(false);
      toast.success("Rack created", { description: `${form.code} registered with barcode ${form.barcode || "auto-generated"}.` });
      setForm({ ...form, code: "", height: "", maxWeight: "", barcode: "" });
    }, 1000);
  }

  const columns: Column<Rack>[] = [
    {
      key: "code",
      header: "Rack number",
      cell: (r) => (
        <div className="min-w-0">
          <p className="num truncate font-semibold">{r.code}</p>
          <p className="truncate text-[11px] text-muted-foreground">
            {r.warehouse} · {r.zone} · {r.aisle}
          </p>
        </div>
      ),
    },
    { key: "dims", header: "Height × Width", cell: (r) => <span className="num">{r.height} × {r.width}</span> },
    { key: "levels", header: "Levels", cell: (r) => <span className="num">{r.levels}</span> },
    { key: "maxWeight", header: "Max weight", cell: (r) => <span className="num">{r.maxWeight.toLocaleString()} kg</span> },
    {
      key: "load",
      header: "Current load",
      cell: (r) => (
        <div className="w-36">
          <Meter value={Math.round((r.currentLoad / r.maxWeight) * 100)} showLabel />
          <p className="num mt-1 text-[10px] text-muted-foreground">{r.currentLoad.toLocaleString()} kg</p>
        </div>
      ),
    },
    {
      key: "barcode",
      header: "Barcode",
      cell: (r) => (
        <span className="num flex items-center gap-1.5 text-[12px]">
          <Barcode className="h-3.5 w-3.5 text-muted-foreground" />
          {r.barcode}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (r) => (
        <StatusChip
          className={
            r.status === "Active"
              ? "bg-success-soft text-success"
              : r.status === "Maintenance"
                ? "bg-warning-soft text-warning"
                : "bg-danger-soft text-danger"
          }
        >
          {r.status}
        </StatusChip>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: "Warehouse", to: "/warehouse-navigator/warehouses" }, { label: "Rack Management" }]}
        eyebrow="Screen 07"
        title="Rack Management"
        subtitle="Structural and load master data. Weight limits are enforced by the slotting engine before a put away task is generated."
        actions={
          <Button size="sm" className="gap-1.5" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> Create rack
          </Button>
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total racks" value={racks.length} icon={Boxes} />
        <StatCard label="Load above 90%" value={racks.filter((r) => r.currentLoad / r.maxWeight >= 0.9).length} icon={Weight} tone="danger" />
        <StatCard label="Blocked racks" value={racks.filter((r) => r.status !== "Active").length} icon={Boxes} tone="warning" footer="Beam inspection due" />
        <StatCard label="Total shelves" value={shelves.length} icon={Boxes} tone="secondary" />
      </div>

      <DataTable
        rows={rows}
        columns={columns}
        searchKeys={(r) => `${r.code} ${r.aisle} ${r.zone} ${r.barcode} ${r.status}`}
        filter={{
          label: "Aisle",
          options: ["All aisles", ...Array.from(new Set(racks.map((r) => r.aisle)))],
          value: aisle,
          onChange: setAisle,
        }}
        onRowClick={setDetail}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create rack</DialogTitle>
            <DialogDescription>Dimensions and weight limits are validated against the aisle equipment class.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="text-xs">Rack number</Label>
              <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="R-A01-04" className="mt-1.5" />
              {errors.code && <p className="mt-1 text-[11px] text-danger">{errors.code}</p>}
            </div>
            <div>
              <Label className="text-xs">Aisle</Label>
              <Select value={form.aisle} onValueChange={(v) => setForm({ ...form, aisle: v })}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {aisles.map((a) => (
                    <SelectItem key={a.id} value={a.code}>
                      {a.code} · {a.zone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Rack height (m)</Label>
              <Input value={form.height} onChange={(e) => setForm({ ...form, height: e.target.value })} placeholder="7.2" className="mt-1.5" />
              {errors.height && <p className="mt-1 text-[11px] text-danger">{errors.height}</p>}
            </div>
            <div>
              <Label className="text-xs">Rack width (m)</Label>
              <Input value={form.width} onChange={(e) => setForm({ ...form, width: e.target.value })} className="mt-1.5" />
            </div>
            <div>
              <Label className="text-xs">Levels</Label>
              <Input value={form.levels} onChange={(e) => setForm({ ...form, levels: e.target.value.replace(/\D/g, "") })} className="mt-1.5" />
            </div>
            <div>
              <Label className="text-xs">Max weight (kg)</Label>
              <Input value={form.maxWeight} onChange={(e) => setForm({ ...form, maxWeight: e.target.value.replace(/\D/g, "") })} placeholder="4800" className="mt-1.5" />
              {errors.maxWeight && <p className="mt-1 text-[11px] text-danger">{errors.maxWeight}</p>}
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs">Barcode (leave blank to auto-generate)</Label>
              <Input value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value })} placeholder="RK4800100104" className="mt-1.5" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={saving}>
              {saving ? "Saving…" : "Create rack"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Sheet open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          {detail && (
            <>
              <SheetHeader>
                <SheetTitle className="num">{detail.code}</SheetTitle>
                <SheetDescription>
                  {detail.warehouse} / {detail.zone} / {detail.aisle}
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-5 px-4 pb-8">
                <div className="rounded-2xl bg-muted/60 p-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[11px] tracking-wide text-muted-foreground uppercase">Load utilisation</span>
                    <span className="num text-2xl font-bold">{Math.round((detail.currentLoad / detail.maxWeight) * 100)}%</span>
                  </div>
                  <Meter value={Math.round((detail.currentLoad / detail.maxWeight) * 100)} className="mt-2" />
                </div>
                <KeyValue
                  items={[
                    { label: "Height", value: detail.height },
                    { label: "Width", value: detail.width },
                    { label: "Levels", value: String(detail.levels) },
                    { label: "Max weight", value: `${detail.maxWeight.toLocaleString()} kg` },
                    { label: "Current load", value: `${detail.currentLoad.toLocaleString()} kg` },
                    { label: "Barcode", value: detail.barcode },
                  ]}
                />
                <div className="rounded-2xl border border-border p-4">
                  <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">Shelves on this rack</p>
                  <div className="mt-3 space-y-2">
                    {shelves
                      .filter((s) => s.rack === detail.code)
                      .map((s) => (
                        <div key={s.id} className="flex items-center justify-between gap-3">
                          <span className="num text-[12px] font-medium">Level {s.level}</span>
                          <span className="w-28">
                            <Meter value={Math.round((s.occupied / s.capacity) * 100)} showLabel />
                          </span>
                        </div>
                      ))}
                    {shelves.filter((s) => s.rack === detail.code).length === 0 && (
                      <p className="text-[12px] text-muted-foreground">No shelves configured yet on this rack.</p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
