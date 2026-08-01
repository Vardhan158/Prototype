import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Download, Gauge, PackageX, Repeat, Target, TrendingDown } from "lucide-react";
import { toast } from "sonner";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { DataTable, type Column } from "@/apps/inventory-flow/components/DataTable";
import { KpiCard } from "@/apps/inventory-flow/components/KpiCard";
import { PageHeader } from "@/apps/inventory-flow/components/PageHeader";
import { SectionCard } from "@/apps/inventory-flow/components/SectionCard";
import { StatusBadge } from "@/apps/inventory-flow/components/StatusBadge";
import { ChartSkeleton } from "@/apps/inventory-flow/components/Skeletons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { WAREHOUSES, agingBuckets, formatCurrency, formatNumber, inventory } from "@/apps/inventory-flow/lib/data";
import type { InventoryItem } from "@/apps/inventory-flow/lib/types";
import { exportRows } from "@/apps/inventory-flow/lib/export";
import { useMockLoading } from "@/apps/inventory-flow/lib/useMockLoading";

export const Route = createFileRoute("/inventory-flow/planning")({
  head: () => ({
    meta: [
      { title: "Inventory Planning & Aging — VoltCore WMS" },
      {
        name: "description",
        content:
          "Configure reorder points, safety stock and EOQ, and analyse stock aging, dead stock and slow-moving power equipment.",
      },
      { property: "og:title", content: "Inventory Planning & Aging — VoltCore WMS" },
      {
        property: "og:description",
        content: "Reorder point planning, EOQ configuration and inventory aging analysis for plant warehouses.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PlanningPage,
});

const axis = { stroke: "var(--color-muted-foreground)", fontSize: 11, tickLine: false, axisLine: false };
const tooltipStyle = {
  contentStyle: {
    background: "var(--color-card)",
    border: "1px solid var(--color-border)",
    borderRadius: "0.5rem",
    fontSize: "12px",
    color: "var(--color-foreground)",
  },
};

function PlanningPage() {
  const loading = useMockLoading();
  const [warehouse, setWarehouse] = useState("all");
  const [movement, setMovement] = useState("all");
  const [editing, setEditing] = useState<InventoryItem | null>(null);

  const rows = useMemo(
    () =>
      inventory.filter(
        (i) =>
          (warehouse === "all" || i.warehouse === warehouse) && (movement === "all" || i.movement === movement),
      ),
    [warehouse, movement],
  );

  const replenishment = rows
    .filter((i) => i.available <= i.reorderPoint)
    .map((i) => ({ ...i, suggestedQty: Math.max(i.eoq, i.maxQty - i.available) }));

  type PlanRow = InventoryItem & { suggestedQty?: number };

  const planningColumns: Column<PlanRow>[] = [
    { key: "materialCode", header: "Material Code", value: (r) => r.materialCode, className: "num font-medium" },
    { key: "materialName", header: "Material", value: (r) => r.materialName },
    { key: "warehouse", header: "Warehouse", value: (r) => r.warehouse },
    { key: "available", header: "On Hand", align: "right", value: (r) => r.available },
    { key: "minQty", header: "Min", align: "right", value: (r) => r.minQty },
    { key: "maxQty", header: "Max", align: "right", value: (r) => r.maxQty },
    { key: "safetyStock", header: "Safety Stock", align: "right", value: (r) => r.safetyStock },
    { key: "reorderPoint", header: "Reorder Point", align: "right", value: (r) => r.reorderPoint },
    { key: "eoq", header: "EOQ", align: "right", value: (r) => r.eoq },
    { key: "movement", header: "Movement", value: (r) => r.movement, render: (r) => <StatusBadge status={r.movement} /> },
    {
      key: "actions",
      header: "",
      render: (r) => (
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setEditing(r);
          }}
        >
          Configure
        </Button>
      ),
    },
  ];

  const replenishColumns: Column<PlanRow>[] = [
    { key: "materialCode", header: "Material Code", value: (r) => r.materialCode, className: "num font-medium" },
    { key: "materialName", header: "Material", value: (r) => r.materialName },
    { key: "warehouse", header: "Warehouse", value: (r) => r.warehouse },
    { key: "supplier", header: "Supplier", value: (r) => r.supplier },
    { key: "available", header: "On Hand", align: "right", value: (r) => r.available },
    { key: "reorderPoint", header: "Reorder Point", align: "right", value: (r) => r.reorderPoint },
    {
      key: "suggestedQty",
      header: "Suggested Order",
      align: "right",
      value: (r) => r.suggestedQty ?? 0,
      render: (r) => <span className="num font-semibold text-primary">{formatNumber(r.suggestedQty ?? 0)}</span>,
    },
    { key: "status", header: "Status", value: (r) => r.status, render: (r) => <StatusBadge status={r.status} /> },
  ];

  const agingColumns: Column<InventoryItem>[] = [
    { key: "materialCode", header: "Material Code", value: (r) => r.materialCode, className: "num font-medium" },
    { key: "materialName", header: "Material", value: (r) => r.materialName },
    { key: "warehouse", header: "Warehouse", value: (r) => r.warehouse },
    { key: "receivedDate", header: "Received", value: (r) => r.receivedDate, className: "num" },
    { key: "ageDays", header: "Age (Days)", align: "right", value: (r) => r.ageDays },
    { key: "available", header: "Qty", align: "right", value: (r) => r.available },
    {
      key: "value",
      header: "Value",
      align: "right",
      value: (r) => r.available * r.unitCost,
      render: (r) => formatCurrency(r.available * r.unitCost),
    },
    { key: "movement", header: "Classification", value: (r) => r.movement, render: (r) => <StatusBadge status={r.movement} /> },
  ];

  const deadStock = rows.filter((i) => i.movement === "Dead Stock");
  const slowMoving = rows.filter((i) => i.movement === "Slow Moving");
  const deadValue = deadStock.reduce((s, i) => s + i.available * i.unitCost, 0);

  const turnoverTrend = [
    { month: "Feb", turnover: 3.4, target: 4 },
    { month: "Mar", turnover: 3.8, target: 4 },
    { month: "Apr", turnover: 3.1, target: 4 },
    { month: "May", turnover: 4.2, target: 4 },
    { month: "Jun", turnover: 4.6, target: 4 },
    { month: "Jul", turnover: 4.9, target: 4 },
  ];

  const agingColors = [
    "var(--color-status-available)",
    "var(--color-status-reserved)",
    "var(--color-status-low)",
    "var(--color-status-damaged)",
  ];

  return (
    <div className="mx-auto max-w-[1600px]">
      <PageHeader
        title="Inventory Planning & Aging"
        description="Reorder points, safety stock, EOQ and aging analysis · BR-064 · BR-065 · BR-066"
        breadcrumbs={[{ label: "Inventory Management", to: "/" }, { label: "Inventory Planning" }]}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => exportRows(rows, "planning-parameters", "csv")}>
              <Download className="mr-1.5 size-4" /> Export CSV
            </Button>
            <Button
              size="sm"
              onClick={() =>
                toast.success("Replenishment plan generated", {
                  description: `${replenishment.length} purchase suggestions raised for review.`,
                })
              }
            >
              <Repeat className="mr-1.5 size-4" /> Generate Plan
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Items Below Reorder"
          value={formatNumber(replenishment.length)}
          icon={Target}
          tone="low"
          hint="Requires replenishment"
          loading={loading}
        />
        <KpiCard
          label="Dead Stock Value"
          value={formatCurrency(deadValue)}
          icon={PackageX}
          tone="damaged"
          trend={-3.4}
          loading={loading}
        />
        <KpiCard
          label="Slow Moving Items"
          value={formatNumber(slowMoving.length)}
          icon={TrendingDown}
          tone="quarantine"
          hint="75–150 days on hand"
          loading={loading}
        />
        <KpiCard
          label="Inventory Turnover"
          value="4.9x"
          icon={Gauge}
          tone="available"
          trend={6.5}
          hint="Target 4.0x"
          loading={loading}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <SectionCard title="Stock aging distribution" description="Quantity on hand per aging bucket" className="xl:col-span-2">
          {loading ? (
            <ChartSkeleton />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={agingBuckets}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="bucket" {...axis} />
                <YAxis {...axis} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="quantity" radius={[6, 6, 0, 0]}>
                  {agingBuckets.map((_, i) => (
                    <Cell key={i} fill={agingColors[i % agingColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </SectionCard>

        <SectionCard title="Turnover ratio trend" description="Actual vs target turns">
          {loading ? (
            <ChartSkeleton />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={turnoverTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="month" {...axis} />
                <YAxis {...axis} />
                <Tooltip {...tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="turnover" stroke="var(--color-primary)" strokeWidth={2} dot={false} />
                <Line
                  type="monotone"
                  dataKey="target"
                  stroke="var(--color-status-quarantine)"
                  strokeDasharray="4 4"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </SectionCard>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-[repeat(2,minmax(0,220px))]">
        <div className="space-y-1.5">
          <Label>Warehouse</Label>
          <Select value={warehouse} onValueChange={setWarehouse}>
            <SelectTrigger>
              <SelectValue />
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
      </div>

      <Tabs defaultValue="parameters" className="mt-4">
        <TabsList>
          <TabsTrigger value="parameters">Planning Parameters</TabsTrigger>
          <TabsTrigger value="replenishment">Replenishment ({replenishment.length})</TabsTrigger>
          <TabsTrigger value="aging">Aging & Dead Stock</TabsTrigger>
        </TabsList>

        <TabsContent value="parameters" className="mt-3">
          <SectionCard
            title="Min / max, safety stock and EOQ"
            description="BR-064 · Planning parameters maintained per material and warehouse"
            bodyClassName=""
          >
            <DataTable rows={rows} columns={planningColumns} loading={loading} pageSize={10} />
          </SectionCard>
        </TabsContent>

        <TabsContent value="replenishment" className="mt-3">
          <SectionCard
            title="Replenishment suggestions"
            description="BR-065 · Materials at or below reorder point with suggested order quantity"
            bodyClassName=""
          >
            <DataTable rows={replenishment} columns={replenishColumns} loading={loading} pageSize={10} />
          </SectionCard>
        </TabsContent>

        <TabsContent value="aging" className="mt-3">
          <SectionCard
            title="Aging, slow moving and dead stock"
            description="BR-066 · Age-based classification with holding value"
            bodyClassName=""
          >
            <DataTable
              rows={[...rows].sort((a, b) => b.ageDays - a.ageDays)}
              columns={agingColumns}
              loading={loading}
              pageSize={10}
            />
          </SectionCard>
        </TabsContent>
      </Tabs>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configure planning parameters</DialogTitle>
            <DialogDescription>{editing?.materialName}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="min">Minimum quantity</Label>
              <Input id="min" type="number" defaultValue={editing?.minQty} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="max">Maximum quantity</Label>
              <Input id="max" type="number" defaultValue={editing?.maxQty} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="safety">Safety stock</Label>
              <Input id="safety" type="number" defaultValue={editing?.safetyStock} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rop">Reorder point</Label>
              <Input id="rop" type="number" defaultValue={editing?.reorderPoint} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="eoq">Economic order quantity</Label>
              <Input id="eoq" type="number" defaultValue={editing?.eoq} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setEditing(null);
                toast.success("Planning parameters updated", { description: "Changes queued for MRP run." });
              }}
            >
              Save parameters
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
