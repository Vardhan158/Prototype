import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Download, Eye, MoreHorizontal, Pencil, Plus, Trash2, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable, type Column } from "@/apps/warehouse-navigator/components/data-table";
import { Meter, PageHeader, StatusChip } from "@/apps/warehouse-navigator/components/ui-kit";
import { warehouses, type Warehouse } from "@/apps/warehouse-navigator/data";

export const Route = createFileRoute("/warehouse-navigator/warehouses/")({
  head: () => ({
    meta: [
      { title: "Warehouse List | StoreGrid WMS Storage & Locations" },
      {
        name: "description",
        content:
          "Enterprise warehouse master data table — codes, capacity, occupied and available units, managers and operational status across the network.",
      },
      { property: "og:title", content: "Warehouse List | StoreGrid WMS" },
      { property: "og:description", content: "Warehouse master data with capacity, occupancy, manager and status." },
    ],
  }),
  component: WarehouseList,
});

function WarehouseList() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("All statuses");
  const [createOpen, setCreateOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Warehouse | null>(null);
  const [form, setForm] = useState({ code: "", name: "", city: "", manager: "", capacity: "", type: "Ambient / Pallet Racking" });
  type FormErrors = { code?: string; name?: string; manager?: string; capacity?: string };
  const [errors, setErrors] = useState<FormErrors>({});

  const rows = warehouses.filter((w) => status === "All statuses" || w.status === status);

  function submit() {
    const next: FormErrors = {};
    if (!/^WH-[A-Z]{3}-\d{2}$/.test(form.code)) next.code = "Use the pattern WH-XXX-00 (e.g. WH-BLR-07).";
    if (form.name.trim().length < 4) next.name = "Warehouse name must be at least 4 characters.";
    if (!form.manager.trim()) next.manager = "Assign a responsible warehouse manager.";
    if (!form.capacity || Number(form.capacity) < 100) next.capacity = "Capacity must be 100 units or more.";
    setErrors(next);
    if (Object.keys(next).length) return;
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setCreateOpen(false);
      setForm({ code: "", name: "", city: "", manager: "", capacity: "", type: "Ambient / Pallet Racking" });
      toast.success("Warehouse created", { description: `${form.code} is now available for zone configuration.` });
    }, 1100);
  }

  const columns: Column<Warehouse>[] = [
    {
      key: "name",
      header: "Warehouse",
      cell: (w) => (
        <div className="min-w-0">
          <p className="truncate font-semibold">{w.name}</p>
          <p className="truncate text-[11px] text-muted-foreground">{w.city}</p>
        </div>
      ),
    },
    { key: "code", header: "Code", cell: (w) => <span className="num font-medium text-primary">{w.code}</span> },
    { key: "capacity", header: "Capacity", cell: (w) => <span className="num">{w.capacity.toLocaleString()}</span> },
    {
      key: "occupied",
      header: "Occupied",
      cell: (w) => (
        <div className="w-32">
          <Meter value={Math.round((w.occupied / w.capacity) * 100)} showLabel />
          <p className="num mt-1 text-[10px] text-muted-foreground">{w.occupied.toLocaleString()} units</p>
        </div>
      ),
    },
    {
      key: "available",
      header: "Available",
      cell: (w) => <span className="num text-success">{(w.capacity - w.occupied).toLocaleString()}</span>,
    },
    { key: "manager", header: "Manager", cell: (w) => w.manager },
    {
      key: "status",
      header: "Status",
      cell: (w) => (
        <StatusChip
          className={
            w.status === "Operational"
              ? "bg-success-soft text-success"
              : w.status === "Maintenance"
                ? "bg-warning-soft text-warning"
                : "bg-primary-soft text-primary"
          }
        >
          {w.status}
        </StatusChip>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      cell: (w) => (
        <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate({ to: "/warehouse-navigator/warehouses/$code", params: { code: w.code } })}>
                <Eye className="mr-2 h-4 w-4" /> View details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.info("Edit mode", { description: `${w.code} opened for editing.` })}>
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem className="text-danger" onClick={() => setDeleteTarget(w)}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: "Warehouse" }, { label: "Warehouse List" }]}
        eyebrow="Screen 03"
        title="Warehouse List"
        subtitle="Master data for every distribution centre in the network, with live capacity roll-up from the storage hierarchy."
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Upload className="h-4 w-4" /> Import
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Download className="h-4 w-4" /> Export
            </Button>
            <Button size="sm" className="gap-1.5" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" /> Create warehouse
            </Button>
          </>
        }
      />

      <DataTable
        rows={rows}
        columns={columns}
        searchKeys={(w) => `${w.name} ${w.code} ${w.city} ${w.manager} ${w.status}`}
        filter={{
          label: "Status",
          options: ["All statuses", "Operational", "Maintenance", "Commissioning"],
          value: status,
          onChange: setStatus,
        }}
        onRowClick={(w) => navigate({ to: "/warehouse-navigator/warehouses/$code", params: { code: w.code } })}
      />

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create warehouse</DialogTitle>
            <DialogDescription>
              Define the facility header record. Zones, aisles, racks, shelves and bins are configured afterwards.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="text-xs">Warehouse code</Label>
              <Input
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="WH-BLR-07"
                className="mt-1.5"
              />
              {errors.code && <p className="mt-1 text-[11px] text-danger">{errors.code}</p>}
            </div>
            <div>
              <Label className="text-xs">Warehouse name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Bengaluru Regional DC"
                className="mt-1.5"
              />
              {errors.name && <p className="mt-1 text-[11px] text-danger">{errors.name}</p>}
            </div>
            <div>
              <Label className="text-xs">City / region</Label>
              <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Bengaluru, Karnataka" className="mt-1.5" />
            </div>
            <div>
              <Label className="text-xs">Warehouse manager</Label>
              <Input value={form.manager} onChange={(e) => setForm({ ...form, manager: e.target.value })} placeholder="Kavya Iyer" className="mt-1.5" />
              {errors.manager && <p className="mt-1 text-[11px] text-danger">{errors.manager}</p>}
            </div>
            <div>
              <Label className="text-xs">Storage type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Ambient / Pallet Racking", "Multi-tier Shelving", "Cold Chain", "Bonded / VNA Racking", "Cross-Dock / Flow-through", "Hazardous / Bunded Cells"].map(
                    (t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Capacity (units)</Label>
              <Input
                value={form.capacity}
                onChange={(e) => setForm({ ...form, capacity: e.target.value.replace(/\D/g, "") })}
                placeholder="24000"
                className="mt-1.5"
              />
              {errors.capacity && <p className="mt-1 text-[11px] text-danger">{errors.capacity}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={saving}>
              {saving ? "Creating…" : "Create warehouse"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteTarget?.code}?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.name} still holds {deleteTarget?.occupied.toLocaleString()} units across{" "}
              {deleteTarget?.zones} zones. Deletion is blocked until stock is transferred and all put away tasks are closed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-danger text-danger-foreground hover:bg-danger/90"
              onClick={() =>
                toast.error("Deletion blocked", {
                  description: "Transfer remaining stock before deleting this warehouse.",
                })
              }
            >
              Attempt delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
