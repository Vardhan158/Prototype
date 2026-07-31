import { createFileRoute } from "@tanstack/react-router";
import { Layers, Plus, Snowflake, Sparkles } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { DataTable, type Column } from "@/apps/warehouse-navigator/components/data-table";
import { KeyValue, Meter, PageHeader, StatCard, StatusChip } from "@/apps/warehouse-navigator/components/ui-kit";
import { OCCUPANCY_META, occupancyState, zoneTypes, zones, type Zone } from "@/apps/warehouse-navigator/data";

export const Route = createFileRoute("/warehouse-navigator/zones")({
  head: () => ({
    meta: [
      { title: "Zone Management | StoreGrid WMS Storage & Locations" },
      {
        name: "description",
        content:
          "Create and govern storage zones — raw material, finished goods, semi finished, rejected, quarantine, hazardous and cold storage — with live occupancy.",
      },
      { property: "og:title", content: "Zone Management | StoreGrid WMS" },
      { property: "og:description", content: "Zone master data, zone types and live occupancy control." },
    ],
  }),
  component: ZoneManagement,
});

type ZoneErrors = { code?: string; name?: string; capacity?: string };

function ZoneManagement() {
  const [type, setType] = useState("All types");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [detail, setDetail] = useState<Zone | null>(null);
  const [form, setForm] = useState({
    code: "",
    name: "",
    type: "Finished Goods",
    capacity: "",
    warehouse: "WH-CHN-01",
    tempControlled: false,
    active: true,
  });
  const [errors, setErrors] = useState<ZoneErrors>({});

  const rows = zones.filter((z) => type === "All types" || z.type === type);

  function submit() {
    const next: ZoneErrors = {};
    if (!/^Z-[A-Z]{1,2}$/.test(form.code)) next.code = "Zone code pattern is Z-X (e.g. Z-N).";
    if (form.name.trim().length < 3) next.name = "Enter a descriptive zone name.";
    if (!form.capacity || Number(form.capacity) < 50) next.capacity = "Capacity must be at least 50 units.";
    setErrors(next);
    if (Object.keys(next).length) return;
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setOpen(false);
      toast.success("Zone created", {
        description: `${form.code} ${form.name} added to ${form.warehouse}. Configure aisles next.`,
      });
      setForm({ ...form, code: "", name: "", capacity: "" });
    }, 1000);
  }

  const columns: Column<Zone>[] = [
    {
      key: "code",
      header: "Zone",
      cell: (z) => (
        <div className="min-w-0">
          <p className="truncate font-semibold">
            <span className="num text-primary">{z.code}</span> · {z.name}
          </p>
          <p className="truncate text-[11px] text-muted-foreground">{z.warehouse}</p>
        </div>
      ),
    },
    {
      key: "type",
      header: "Zone type",
      cell: (z) => (
        <StatusChip
          className={
            z.type === "Hazardous"
              ? "bg-danger-soft text-danger"
              : z.type === "Cold Storage"
                ? "bg-info-soft text-primary"
                : z.type === "Quarantine" || z.type === "Rejected"
                  ? "bg-warning-soft text-warning"
                  : "bg-secondary-soft text-secondary"
          }
        >
          {z.type}
        </StatusChip>
      ),
    },
    { key: "aisles", header: "Aisles", cell: (z) => <span className="num">{z.aisles}</span> },
    { key: "capacity", header: "Capacity", cell: (z) => <span className="num">{z.capacity.toLocaleString()}</span> },
    {
      key: "occupancy",
      header: "Occupancy",
      cell: (z) => (
        <div className="w-32">
          <Meter value={Math.round((z.occupied / z.capacity) * 100)} showLabel />
        </div>
      ),
    },
    { key: "temp", header: "Temp", cell: (z) => <span className="num">{z.temperature}</span> },
    {
      key: "state",
      header: "State",
      cell: (z) => {
        const st = occupancyState(Math.round((z.occupied / z.capacity) * 100), z.override);
        return <StatusChip className={OCCUPANCY_META[st].chip}>{OCCUPANCY_META[st].label}</StatusChip>;
      },
    },
    {
      key: "status",
      header: "Status",
      cell: (z) => (
        <StatusChip className={z.status === "Active" ? "bg-success-soft text-success" : "bg-neutral-soft text-muted-foreground"}>
          {z.status}
        </StatusChip>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: "Warehouse", to: "/warehouse-navigator/warehouses" }, { label: "Zone Management" }]}
        eyebrow="Screen 05"
        title="Zone Management"
        subtitle="Zones group aisles by storage strategy and compliance class. Zone type drives put away eligibility rules."
        actions={
          <Button size="sm" className="gap-1.5" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> Create zone
          </Button>
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total zones" value={zones.length} icon={Layers} />
        <StatCard label="Cold storage zones" value={zones.filter((z) => z.type === "Cold Storage").length} icon={Snowflake} tone="secondary" />
        <StatCard label="Restricted zones" value={zones.filter((z) => ["Hazardous", "Quarantine", "Rejected"].includes(z.type)).length} icon={Sparkles} tone="warning" />
        <StatCard label="Zones above 90%" value={zones.filter((z) => z.occupied / z.capacity >= 0.9).length} icon={Layers} tone="danger" />
      </div>

      <DataTable
        rows={rows}
        columns={columns}
        searchKeys={(z) => `${z.code} ${z.name} ${z.type} ${z.warehouse} ${z.status}`}
        filter={{ label: "Zone type", options: ["All types", ...zoneTypes], value: type, onChange: setType }}
        onRowClick={setDetail}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create zone</DialogTitle>
            <DialogDescription>Zone type determines hazard, temperature and FIFO/FEFO rules applied at put away.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="text-xs">Zone code</Label>
              <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="Z-N" className="mt-1.5" />
              {errors.code && <p className="mt-1 text-[11px] text-danger">{errors.code}</p>}
            </div>
            <div>
              <Label className="text-xs">Zone name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Returns Consolidation" className="mt-1.5" />
              {errors.name && <p className="mt-1 text-[11px] text-danger">{errors.name}</p>}
            </div>
            <div>
              <Label className="text-xs">Zone type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {zoneTypes.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Capacity (units)</Label>
              <Input
                value={form.capacity}
                onChange={(e) => setForm({ ...form, capacity: e.target.value.replace(/\D/g, "") })}
                placeholder="6400"
                className="mt-1.5"
              />
              {errors.capacity && <p className="mt-1 text-[11px] text-danger">{errors.capacity}</p>}
            </div>
            <div className="sm:col-span-2 flex items-center justify-between rounded-xl bg-muted/60 px-3.5 py-3">
              <div>
                <p className="text-[12px] font-semibold">Temperature controlled</p>
                <p className="text-[11px] text-muted-foreground">Enables sensor binding and excursion alerts</p>
              </div>
              <Switch checked={form.tempControlled} onCheckedChange={(v) => setForm({ ...form, tempControlled: v })} />
            </div>
            <div className="sm:col-span-2 flex items-center justify-between rounded-xl bg-muted/60 px-3.5 py-3">
              <div>
                <p className="text-[12px] font-semibold">Status active</p>
                <p className="text-[11px] text-muted-foreground">Inactive zones are excluded from slotting recommendations</p>
              </div>
              <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={saving}>
              {saving ? "Saving…" : "Create zone"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Sheet open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          {detail && (
            <>
              <SheetHeader>
                <SheetTitle>
                  {detail.code} · {detail.name}
                </SheetTitle>
                <SheetDescription>
                  {detail.warehouse} · {detail.type}
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-5 px-4 pb-8">
                <div className="rounded-2xl bg-muted/60 p-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[11px] tracking-wide text-muted-foreground uppercase">Occupancy</span>
                    <span className="num text-2xl font-bold">{Math.round((detail.occupied / detail.capacity) * 100)}%</span>
                  </div>
                  <Meter value={Math.round((detail.occupied / detail.capacity) * 100)} className="mt-2" />
                </div>
                <KeyValue
                  items={[
                    { label: "Capacity", value: `${detail.capacity.toLocaleString()} units` },
                    { label: "Occupied", value: `${detail.occupied.toLocaleString()} units` },
                    { label: "Available", value: `${(detail.capacity - detail.occupied).toLocaleString()} units` },
                    { label: "Aisles", value: String(detail.aisles) },
                    { label: "Temperature", value: detail.temperature },
                    { label: "Status", value: detail.status },
                  ]}
                />
                <Button size="sm" className="w-full" onClick={() => toast.info("Zone rebalance queued", { description: `${detail.code} scheduled for slotting review.` })}>
                  Queue slotting review
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
