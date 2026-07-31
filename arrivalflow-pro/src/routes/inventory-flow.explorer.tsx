import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Columns3, Download, Filter, RotateCcw, Search, Sheet as SheetIcon, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { DataTable, type Column } from "@/apps/inventory-flow/components/DataTable";
import { PageHeader } from "@/apps/inventory-flow/components/PageHeader";
import { SectionCard } from "@/apps/inventory-flow/components/SectionCard";
import { StatusBadge } from "@/apps/inventory-flow/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { CATEGORIES, WAREHOUSES, formatNumber, inventory } from "@/apps/inventory-flow/lib/data";
import type { InventoryItem } from "@/apps/inventory-flow/lib/types";
import { exportRows } from "@/apps/inventory-flow/lib/export";
import { useMockLoading } from "@/apps/inventory-flow/lib/useMockLoading";

export const Route = createFileRoute("/inventory-flow/explorer")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search["q"] === "string" ? (search["q"] as string) : "",
  }),
  head: () => ({
    meta: [
      { title: "Inventory Explorer — VoltCore WMS" },
      {
        name: "description",
        content:
          "Search, filter and export plant-wide inventory by material, warehouse, bin, batch, serial number and stock status.",
      },
      { property: "og:title", content: "Inventory Explorer — VoltCore WMS" },
      {
        property: "og:description",
        content: "Enterprise inventory data table with advanced filters, column controls and bulk actions.",
      },
    ],
  }),
  component: Explorer,
});

const STATUSES = ["Available", "Reserved", "Damaged", "Quarantine", "Low Stock", "Out of Stock"];

function Explorer() {
  const navigate = useNavigate();
  const { q } = Route.useSearch();
  const loading = useMockLoading();

  const [query, setQuery] = useState(q ?? "");
  const [warehouse, setWarehouse] = useState("all");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [movement, setMovement] = useState("all");
  const [minQty, setMinQty] = useState("");
  const [hidden, setHidden] = useState<string[]>(["zone", "supplier"]);
  const [selected, setSelected] = useState<string[]>([]);

  const rows = useMemo(() => {
    const term = query.trim().toLowerCase();
    return inventory.filter((i) => {
      const matchesTerm =
        !term ||
        [i.materialCode, i.materialName, i.batchNumber, i.serialNumber, i.storageBin, i.warehouse]
          .join(" ")
          .toLowerCase()
          .includes(term);
      return (
        matchesTerm &&
        (warehouse === "all" || i.warehouse === warehouse) &&
        (category === "all" || i.category === category) &&
        (status === "all" || i.status === status) &&
        (movement === "all" || i.movement === movement) &&
        (!minQty || i.available >= Number(minQty))
      );
    });
  }, [query, warehouse, category, status, movement, minQty]);

  const columns: Column<InventoryItem>[] = [
    {
      key: "materialCode",
      header: "Material Code",
      value: (r) => r.materialCode,
      render: (r) => <span className="num font-medium text-primary">{r.materialCode}</span>,
    },
    {
      key: "materialName",
      header: "Material Name",
      value: (r) => r.materialName,
      render: (r) => <span className="block max-w-[260px] truncate font-medium">{r.materialName}</span>,
    },
    { key: "category", header: "Category", value: (r) => r.category },
    { key: "warehouse", header: "Warehouse", value: (r) => r.warehouse },
    { key: "storageBin", header: "Storage Bin", value: (r) => r.storageBin, className: "num" },
    { key: "zone", header: "Zone", value: (r) => r.zone },
    { key: "batchNumber", header: "Batch Number", value: (r) => r.batchNumber, className: "num" },
    { key: "serialNumber", header: "Serial Number", value: (r) => r.serialNumber, className: "num" },
    { key: "supplier", header: "Supplier", value: (r) => r.supplier },
    { key: "available", header: "Available", align: "right", value: (r) => r.available },
    { key: "reserved", header: "Reserved", align: "right", value: (r) => r.reserved },
    { key: "damaged", header: "Damaged", align: "right", value: (r) => r.damaged },
    {
      key: "status",
      header: "Status",
      value: (r) => r.status,
      render: (r) => <StatusBadge status={r.status} />,
    },
    { key: "expiryDate", header: "Expiry Date", value: (r) => r.expiryDate, className: "num" },
    { key: "lastUpdated", header: "Last Updated", value: (r) => r.lastUpdated, className: "num" },
  ];

  const resetFilters = () => {
    setQuery("");
    setWarehouse("all");
    setCategory("all");
    setStatus("all");
    setMovement("all");
    setMinQty("");
    toast.info("Filters cleared");
  };

  const activeFilters = [warehouse, category, status, movement].filter((v) => v !== "all").length + (minQty ? 1 : 0);

  return (
    <div className="mx-auto max-w-[1600px]">
      <PageHeader
        title="Inventory Explorer"
        description="Plant-wide stock records with batch and serial traceability · BR-057 · BR-058 · BR-059"
        breadcrumbs={[{ label: "Inventory Management", to: "/" }, { label: "Inventory Explorer" }]}
        actions={
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Columns3 className="mr-1.5 size-4" /> Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Visible columns</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {columns.map((c) => (
                  <DropdownMenuCheckboxItem
                    key={c.key}
                    checked={!hidden.includes(c.key)}
                    onCheckedChange={() =>
                      setHidden((h) => (h.includes(c.key) ? h.filter((k) => k !== c.key) : [...h, c.key]))
                    }
                  >
                    {c.header}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="outline" size="sm" onClick={() => exportRows(rows, "inventory-explorer", "csv")}>
              <Download className="mr-1.5 size-4" /> CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => exportRows(rows, "inventory-explorer", "excel")}>
              <SheetIcon className="mr-1.5 size-4" /> Excel
            </Button>
          </>
        }
      />

      <SectionCard bodyClassName="p-0">
        <div className="grid grid-cols-1 gap-3 border-b border-border p-4 lg:grid-cols-[minmax(0,1fr)_auto]">
          <div className="relative min-w-0">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search material code, name, batch, serial or bin…"
              className="h-9 pl-8"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={warehouse} onValueChange={setWarehouse}>
              <SelectTrigger className="h-9 w-[190px]">
                <SelectValue placeholder="Warehouse" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All warehouses</SelectItem>
                {WAREHOUSES.map((w) => (
                  <SelectItem key={w} value={w}>
                    {w}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-9 w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="h-9">
                  <Filter className="mr-1.5 size-4" /> Advanced
                  {activeFilters > 0 && (
                    <span className="num ml-1.5 rounded bg-primary px-1.5 text-[10px] text-primary-foreground">
                      {activeFilters}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-sm">
                <SheetHeader>
                  <SheetTitle>Advanced filters</SheetTitle>
                  <SheetDescription>Refine the inventory result set.</SheetDescription>
                </SheetHeader>
                <div className="space-y-4 px-4 pb-4">
                  <div className="space-y-1.5">
                    <Label>Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All categories</SelectItem>
                        {CATEGORIES.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Movement class</Label>
                    <Select value={movement} onValueChange={setMovement}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All classes</SelectItem>
                        <SelectItem value="Fast Moving">Fast Moving</SelectItem>
                        <SelectItem value="Slow Moving">Slow Moving</SelectItem>
                        <SelectItem value="Dead Stock">Dead Stock</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="minqty">Minimum available quantity</Label>
                    <Input
                      id="minqty"
                      type="number"
                      value={minQty}
                      onChange={(e) => setMinQty(e.target.value)}
                      placeholder="0"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <Checkbox id="expiring" />
                    <Label htmlFor="expiring" className="text-sm font-normal">
                      Expiring within 90 days (BR-063)
                    </Label>
                  </div>
                  <Button variant="outline" className="w-full" onClick={resetFilters}>
                    <RotateCcw className="mr-1.5 size-4" /> Reset all filters
                  </Button>
                </div>
              </SheetContent>
            </Sheet>

            <Button variant="ghost" size="sm" className="h-9" onClick={resetFilters}>
              <X className="mr-1.5 size-4" /> Clear
            </Button>
          </div>
        </div>

        {selected.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 border-b border-border bg-primary/5 px-4 py-2.5">
            <span className="num text-xs font-medium">{selected.length} selected</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => toast.success(`${selected.length} records flagged for cycle count`)}
            >
              Flag for count
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => toast.success(`${selected.length} records moved to quarantine review`)}
            >
              Move to quarantine
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => exportRows(rows.filter((r) => selected.includes(r.id)), "inventory-selection", "csv")}
            >
              Export selection
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setSelected([])}>
              <Trash2 className="mr-1.5 size-4" /> Clear selection
            </Button>
          </div>
        )}

        <DataTable
          rows={rows}
          columns={columns}
          hiddenColumns={hidden}
          loading={loading}
          pageSize={12}
          selectable
          selected={selected}
          onToggle={(id) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))}
          onToggleAll={(ids) =>
            setSelected((s) => (ids.every((i) => s.includes(i)) ? s.filter((i) => !ids.includes(i)) : [...new Set([...s, ...ids])]))
          }
          onRowClick={(row) => navigate({ to: "/inventory/$itemId", params: { itemId: row.id } })}
        />
      </SectionCard>

      <p className="mt-3 text-xs text-muted-foreground">
        {formatNumber(rows.length)} of {formatNumber(inventory.length)} inventory records match the current view.
      </p>
    </div>
  );
}
