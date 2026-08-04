import { createFileRoute } from "@tanstack/react-router";
import { Warehouse as WarehouseIcon, ChevronRight, Boxes, Layers, Grid3x3 } from "lucide-react";
import { useState } from "react";

import {
  DataTable,
  type Column,
  type TableFilter,
} from "@/apps/master-core/integrated/components/DataTable";
import { PageHeader } from "@/apps/master-core/integrated/components/PageHeader";
import {
  RecordFormSheet,
  type FormStep,
} from "@/apps/master-core/integrated/components/RecordFormSheet";
import { StatusChip } from "@/apps/master-core/integrated/components/StatusChip";
import { useMasterPage } from "@/apps/master-core/integrated/hooks/useMasters";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { warehouseTree, type Warehouse } from "@/apps/master-core/integrated/data/masters";

export const Route = createFileRoute("/master-core/warehouses")({
  head: () => ({
    meta: [
      { title: "Warehouse, Rack, Shelf & Bin Master — Meridia ERP" },
      {
        name: "description",
        content:
          "Hierarchical storage master covering warehouses, racks, shelves and bins with capacity and occupancy mapping.",
      },
      { property: "og:title", content: "Warehouse Master — Meridia ERP" },
      {
        property: "og:description",
        content: "Storage location hierarchy with utilisation and bin-level barcode mapping.",
      },
    ],
  }),
  component: WarehouseMaster,
});

const steps: FormStep[] = [
  {
    title: "Basic Information",
    description: "Define the storage facility",
    fields: [
      { name: "code", label: "Warehouse Code", required: true, placeholder: "WH-07" },
      { name: "name", label: "Warehouse Name", required: true },
      { name: "location", label: "Location", required: true, colSpan: 2 },
      { name: "manager", label: "Manager" },
      { name: "capacity", label: "Capacity (pallets)", type: "number" },
      { name: "status", label: "Status", type: "switch" },
    ],
  },
  {
    title: "Structure",
    description: "Generate the rack, shelf and bin hierarchy",
    fields: [
      { name: "racks", label: "Number of Racks", type: "number" },
      { name: "shelves", label: "Shelves per Rack", type: "number" },
      { name: "bins", label: "Bins per Shelf", type: "number" },
      { name: "binCapacity", label: "Bin Capacity", type: "number" },
    ],
  },
  {
    title: "Documents",
    description: "Layout drawings and safety certificates",
    fields: [{ name: "reference", label: "Layout Reference" }],
  },
];

function occupancyTone(v: number) {
  if (v >= 85) return "text-destructive";
  if (v >= 60) return "text-warning-foreground";
  return "text-success";
}

function WarehouseMaster() {
  const m = useMasterPage<Warehouse>("warehouses", "Warehouse");
  const [expanded, setExpanded] = useState<string[]>([warehouseTree[0]?.code ?? ""]);

  const toggle = (code: string) =>
    setExpanded((s) => (s.includes(code) ? s.filter((c) => c !== code) : [...s, code]));

  const columns: Column<Warehouse>[] = [
    {
      key: "code",
      header: "Code",
      value: (r) => r.code,
      render: (r) => <span className="num text-xs font-semibold text-primary">{r.code}</span>,
    },
    {
      key: "name",
      header: "Warehouse",
      value: (r) => r.name,
      render: (r) => <span className="font-medium">{r.name}</span>,
    },
    { key: "location", header: "Location", value: (r) => r.location },
    { key: "manager", header: "Manager", value: (r) => r.manager },
    {
      key: "capacity",
      header: "Capacity",
      value: (r) => r.capacity,
      render: (r) => <span className="num">{r.capacity.toLocaleString()} m³</span>,
    },
    {
      key: "utilization",
      header: "Utilisation",
      value: (r) => r.utilization,
      render: (r) => (
        <div className="w-32">
          <div className="mb-1 flex justify-between text-[11px]">
            <span className={cn("num font-medium", occupancyTone(r.utilization))}>
              {r.utilization}%
            </span>
          </div>
          <Progress value={r.utilization} className="h-1.5" />
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      value: (r) => r.status,
      render: (r) => <StatusChip value={r.status} />,
    },
  ];

  const filters: TableFilter<Warehouse>[] = [
    {
      key: "status",
      label: "Status",
      options: ["Active", "Inactive"],
      match: (r, v) => r.status === v,
    },
  ];

  return (
    <div className="min-h-full">
      <PageHeader
        crumbs={[{ label: "Master Data Management", to: "/" }, { label: "Warehouse Master" }]}
        icon={<WarehouseIcon className="h-5 w-5" />}
        title="Warehouse / Rack / Shelf / Bin Master"
        description="Storage hierarchy and location mapping used by putaway, picking and cycle counting."
      />
      <div className="p-4 sm:p-6">
        <Tabs defaultValue="list">
          <TabsList>
            <TabsTrigger value="list">Warehouses</TabsTrigger>
            <TabsTrigger value="tree">Location hierarchy</TabsTrigger>
            <TabsTrigger value="map">Storage map</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="mt-4">
            <DataTable
              rows={m.rows}
              columns={columns}
              filters={filters}
              entity="Warehouses"
              isLoading={m.isLoading}
              onRefresh={m.refetch}
              onDelete={m.remove}
              createLabel="Add Warehouse"
              getId={(r) => r.id}
              getLabel={(r) => r.name}
              searchText={(r) => `${r.code} ${r.name} ${r.location} ${r.manager}`}
              onCreate={m.startCreate}
              onEdit={m.startEdit}
            />
          </TabsContent>

          <TabsContent value="tree" className="mt-4">
            <Card>
              <CardHeader className="border-b border-border pb-3">
                <CardTitle className="text-sm font-semibold">
                  Warehouse → Rack → Shelf → Bin
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="space-y-2">
                  {warehouseTree.map((w) => (
                    <li key={w.code} className="rounded-lg border border-border">
                      <button
                        onClick={() => toggle(w.code)}
                        className="flex w-full items-center gap-2 px-4 py-3 text-left transition-colors hover:bg-surface"
                      >
                        <ChevronRight
                          className={cn(
                            "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                            expanded.includes(w.code) && "rotate-90",
                          )}
                        />
                        <WarehouseIcon className="h-4 w-4 shrink-0 text-primary" />
                        <span className="min-w-0 truncate text-sm font-medium">
                          {w.name} <span className="num text-muted-foreground">({w.code})</span>
                        </span>
                        <Badge variant="secondary" className="ml-auto shrink-0">
                          {w.racks.length} racks
                        </Badge>
                      </button>

                      {expanded.includes(w.code) && (
                        <div className="space-y-2 border-t border-border bg-surface/60 px-4 py-3">
                          {w.racks.map((rack) => (
                            <details key={rack.code} className="rounded-md bg-background p-3">
                              <summary className="flex cursor-pointer items-center gap-2 text-sm">
                                <Layers className="h-4 w-4 text-primary" />
                                <span className="num font-medium">{rack.code}</span>
                                <span className="ml-auto text-xs text-muted-foreground">
                                  {rack.shelves.length} shelves
                                </span>
                              </summary>
                              <div className="mt-3 space-y-3 pl-6">
                                {rack.shelves.map((shelf) => (
                                  <div key={shelf.code}>
                                    <p className="num flex items-center gap-2 text-xs font-medium text-muted-foreground">
                                      <Grid3x3 className="h-3.5 w-3.5" /> {shelf.code}
                                    </p>
                                    <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                                      {shelf.bins.map((bin) => (
                                        <div
                                          key={bin.code}
                                          className="rounded-md border border-border p-2.5 transition-colors hover:border-primary/40"
                                        >
                                          <p className="num truncate text-[11px] font-medium">
                                            {bin.code}
                                          </p>
                                          <p className="num mt-1 text-[10px] text-muted-foreground">
                                            {bin.occupancy}/{bin.capacity} · {bin.barcode}
                                          </p>
                                          <Progress
                                            value={(bin.occupancy / bin.capacity) * 100}
                                            className="mt-1.5 h-1"
                                          />
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </details>
                          ))}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="map" className="mt-4">
            <Card>
              <CardHeader className="border-b border-border pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  <Boxes className="h-4 w-4 text-primary" /> Bin occupancy heat map ·{" "}
                  {warehouseTree[0]?.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-5">
                <div className="space-y-4">
                  {warehouseTree[0]?.racks.map((rack) => (
                    <div key={rack.code}>
                      <p className="num mb-2 text-xs font-medium text-muted-foreground">
                        {rack.code}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {rack.shelves.flatMap((s) =>
                          s.bins.map((b) => {
                            const pct = (b.occupancy / b.capacity) * 100;
                            return (
                              <div
                                key={b.code}
                                title={`${b.code} — ${Math.round(pct)}% occupied`}
                                className={cn(
                                  "h-9 w-9 rounded-md border transition-transform hover:scale-110",
                                  pct >= 70
                                    ? "border-primary/40 bg-primary"
                                    : pct >= 40
                                      ? "border-primary/30 bg-primary/50"
                                      : "border-border bg-primary-soft",
                                )}
                              />
                            );
                          }),
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded bg-primary-soft" /> Low
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded bg-primary/50" /> Medium
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded bg-primary" /> High
                  </span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <RecordFormSheet
        open={m.open}
        onOpenChange={m.setOpen}
        entity="Warehouse"
        steps={steps}
        mode={m.mode}
        initial={m.initial}
        recordId={m.recordId}
        documentEntity="warehouses"
        onSubmit={m.submit}
      />
    </div>
  );
}
