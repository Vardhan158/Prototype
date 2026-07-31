import { createFileRoute } from "@tanstack/react-router";
import { Forklift, Plus, Rows3 } from "lucide-react";
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
import { DataTable, type Column } from "@/apps/warehouse-navigator/components/data-table";
import { Meter, PageHeader, Panel, StatCard, StatusChip } from "@/apps/warehouse-navigator/components/ui-kit";
import { aisles, zones, type Aisle } from "@/apps/warehouse-navigator/data";

export const Route = createFileRoute("/warehouse-navigator/aisles")({
  head: () => ({
    meta: [
      { title: "Aisle Management | StoreGrid WMS Storage & Locations" },
      {
        name: "description",
        content:
          "Configure warehouse aisles — aisle number, connected zone, rack count, capacity, live occupancy and material handling equipment class.",
      },
      { property: "og:title", content: "Aisle Management | StoreGrid WMS" },
      { property: "og:description", content: "Aisle master data with connected zone, capacity and current occupancy." },
    ],
  }),
  component: AisleManagement,
});

type Errors = { code?: string; capacity?: string };

function AisleManagement() {
  const [zone, setZone] = useState("All zones");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ code: "", zone: "Z-B", capacity: "", occupancy: "", equipment: "Reach Truck" });
  const [errors, setErrors] = useState<Errors>({});

  const rows = aisles.filter((a) => zone === "All zones" || a.zone === zone);

  function submit() {
    const next: Errors = {};
    if (!/^A-\d{2}$/.test(form.code)) next.code = "Aisle number pattern is A-00 (e.g. A-11).";
    if (!form.capacity || Number(form.capacity) < 20) next.capacity = "Capacity must be at least 20 units.";
    else if (form.occupancy && Number(form.occupancy) > Number(form.capacity))
      next.capacity = "Current occupancy cannot exceed aisle capacity.";
    setErrors(next);
    if (Object.keys(next).length) return;
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setOpen(false);
      toast.success("Aisle created", { description: `${form.code} linked to zone ${form.zone}.` });
      setForm({ ...form, code: "", capacity: "", occupancy: "" });
    }, 950);
  }

  const columns: Column<Aisle>[] = [
    {
      key: "code",
      header: "Aisle number",
      cell: (a) => (
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary-soft text-[11px] font-bold text-primary">
            {a.code.replace("A-", "")}
          </span>
          <span>
            <span className="num block font-semibold">{a.code}</span>
            <span className="block text-[11px] text-muted-foreground">{a.warehouse}</span>
          </span>
        </div>
      ),
    },
    { key: "zone", header: "Connected zone", cell: (a) => <StatusChip className="bg-secondary-soft text-secondary">{a.zone}</StatusChip> },
    { key: "racks", header: "Racks", cell: (a) => <span className="num">{a.racks}</span> },
    { key: "capacity", header: "Capacity", cell: (a) => <span className="num">{a.capacity.toLocaleString()}</span> },
    {
      key: "occupied",
      header: "Current occupancy",
      cell: (a) => (
        <div className="w-36">
          <Meter value={Math.round((a.occupied / a.capacity) * 100)} showLabel />
          <p className="num mt-1 text-[10px] text-muted-foreground">{a.occupied.toLocaleString()} units</p>
        </div>
      ),
    },
    { key: "equipment", header: "MHE class", cell: (a) => a.equipment },
    {
      key: "status",
      header: "Status",
      cell: (a) => (
        <StatusChip className={a.status === "Active" ? "bg-success-soft text-success" : "bg-danger-soft text-danger"}>
          {a.status}
        </StatusChip>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: "Warehouse", to: "/warehouse-navigator/warehouses" }, { label: "Aisle Management" }]}
        eyebrow="Screen 06"
        title="Aisle Management"
        subtitle="Aisles define travel paths and equipment constraints between zones and racks."
        actions={
          <Button size="sm" className="gap-1.5" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> Create aisle
          </Button>
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total aisles" value={aisles.length} icon={Rows3} />
        <StatCard label="Blocked aisles" value={aisles.filter((a) => a.status === "Blocked").length} icon={Rows3} tone="danger" />
        <StatCard label="Narrow-aisle VNA" value={3} icon={Forklift} tone="secondary" footer="Requires certified operators" />
        <StatCard label="Avg occupancy" value={`${Math.round((aisles.reduce((s, a) => s + a.occupied / a.capacity, 0) / aisles.length) * 100)}%`} icon={Rows3} tone="warning" />
      </div>

      <DataTable
        rows={rows}
        columns={columns}
        searchKeys={(a) => `${a.code} ${a.zone} ${a.warehouse} ${a.equipment} ${a.status}`}
        filter={{
          label: "Zone",
          options: ["All zones", ...Array.from(new Set(aisles.map((a) => a.zone)))],
          value: zone,
          onChange: setZone,
        }}
      />

      <Panel className="mt-4" title="Aisle travel density" description="Picks per aisle in the current shift">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {aisles.slice(0, 10).map((a) => {
            const density = Math.round((a.occupied / a.capacity) * 100);
            return (
              <div key={a.id} className="rounded-xl border border-border bg-surface/70 p-3">
                <p className="num text-[12px] font-bold">{a.code}</p>
                <p className="text-[10px] text-muted-foreground">{a.racks} racks</p>
                <Meter value={density} className="mt-2" />
              </div>
            );
          })}
        </div>
      </Panel>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create aisle</DialogTitle>
            <DialogDescription>Aisles must be linked to an active zone before racks can be added.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="text-xs">Aisle number</Label>
              <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="A-11" className="mt-1.5" />
              {errors.code && <p className="mt-1 text-[11px] text-danger">{errors.code}</p>}
            </div>
            <div>
              <Label className="text-xs">Connected zone</Label>
              <Select value={form.zone} onValueChange={(v) => setForm({ ...form, zone: v })}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {zones.map((z) => (
                    <SelectItem key={z.id} value={z.code}>
                      {z.code} · {z.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Capacity (units)</Label>
              <Input value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value.replace(/\D/g, "") })} placeholder="1200" className="mt-1.5" />
              {errors.capacity && <p className="mt-1 text-[11px] text-danger">{errors.capacity}</p>}
            </div>
            <div>
              <Label className="text-xs">Current occupancy</Label>
              <Input value={form.occupancy} onChange={(e) => setForm({ ...form, occupancy: e.target.value.replace(/\D/g, "") })} placeholder="0" className="mt-1.5" />
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs">Equipment class</Label>
              <Select value={form.equipment} onValueChange={(v) => setForm({ ...form, equipment: v })}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Reach Truck", "Counterbalance", "Order Picker", "Pallet Jack", "VNA Crane", "Cold-rated Reach"].map((e) => (
                    <SelectItem key={e} value={e}>
                      {e}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={saving}>
              {saving ? "Saving…" : "Create aisle"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
