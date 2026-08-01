import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  BarChart3,
  CalendarClock,
  FileBarChart,
  FileSpreadsheet,
  FileText,
  Layers,
  Mail,
  PackageX,
  Warehouse,
} from "lucide-react";
import { toast } from "sonner";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { DataTable, type Column } from "@/apps/inventory-flow/components/DataTable";
import { KpiCard } from "@/apps/inventory-flow/components/KpiCard";
import { PageHeader } from "@/apps/inventory-flow/components/PageHeader";
import { SectionCard } from "@/apps/inventory-flow/components/SectionCard";
import { ChartSkeleton } from "@/apps/inventory-flow/components/Skeletons";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  WAREHOUSES,
  agingBuckets,
  byCategory,
  byWarehouse,
  formatCurrency,
  formatNumber,
  inventory,
  kpis,
  monthlyMovement,
  statusSplit,
  transactions,
} from "@/apps/inventory-flow/lib/data";
import { exportRows } from "@/apps/inventory-flow/lib/export";
import { useMockLoading } from "@/apps/inventory-flow/lib/useMockLoading";

export const Route = createFileRoute("/inventory-flow/reports")({
  head: () => ({
    meta: [
      { title: "Inventory Reports & Analytics — VoltCore WMS" },
      {
        name: "description",
        content:
          "Generate stock valuation, movement, aging and warehouse utilisation reports with CSV, Excel and PDF export and scheduled delivery.",
      },
      { property: "og:title", content: "Inventory Reports & Analytics — VoltCore WMS" },
      {
        property: "og:description",
        content: "Standard and ad-hoc inventory reporting with export and scheduling for plant operations.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ReportsPage,
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

const PIE_COLORS = [
  "var(--color-status-available)",
  "var(--color-status-reserved)",
  "var(--color-status-damaged)",
  "var(--color-status-quarantine)",
];

const CATALOG = [
  {
    id: "RPT-01",
    name: "Stock Valuation Report",
    description: "Quantity on hand and holding value by warehouse, category and material.",
    icon: Warehouse,
    rows: () => inventory,
  },
  {
    id: "RPT-02",
    name: "Stock Movement Report",
    description: "Goods receipts, issues, transfers and adjustments over the selected period.",
    icon: BarChart3,
    rows: () => transactions,
  },
  {
    id: "RPT-03",
    name: "Inventory Aging Report",
    description: "Age buckets with quantity and value exposure for slow and dead stock.",
    icon: CalendarClock,
    rows: () => agingBuckets,
  },
  {
    id: "RPT-04",
    name: "Low & Out of Stock Report",
    description: "Materials at or below reorder point requiring replenishment action.",
    icon: PackageX,
    rows: () => inventory.filter((i) => i.status === "Low Stock" || i.status === "Out of Stock"),
  },
  {
    id: "RPT-05",
    name: "Category Distribution Report",
    description: "Stock spread across power equipment, raw materials and spare parts.",
    icon: Layers,
    rows: () => byCategory,
  },
  {
    id: "RPT-06",
    name: "Warehouse Utilisation Report",
    description: "Available, reserved and blocked quantity per plant warehouse.",
    icon: FileBarChart,
    rows: () => byWarehouse,
  },
];

function ReportsPage() {
  const loading = useMockLoading();
  const [warehouse, setWarehouse] = useState("all");
  const [from, setFrom] = useState("2026-07-01");
  const [to, setTo] = useState("2026-07-31");

  const valuationRows = inventory
    .filter((i) => warehouse === "all" || i.warehouse === warehouse)
    .map((i) => ({
      id: i.id,
      materialCode: i.materialCode,
      materialName: i.materialName,
      category: i.category,
      warehouse: i.warehouse,
      quantity: i.available + i.reserved,
      uom: i.uom,
      unitCost: i.unitCost,
      value: (i.available + i.reserved) * i.unitCost,
    }));

  type ValuationRow = (typeof valuationRows)[number];

  const valuationColumns: Column<ValuationRow>[] = [
    { key: "materialCode", header: "Material Code", value: (r) => r.materialCode, className: "num font-medium" },
    { key: "materialName", header: "Material", value: (r) => r.materialName },
    { key: "category", header: "Category", value: (r) => r.category },
    { key: "warehouse", header: "Warehouse", value: (r) => r.warehouse },
    { key: "quantity", header: "Qty", align: "right", value: (r) => r.quantity },
    { key: "uom", header: "UoM", value: (r) => r.uom },
    { key: "unitCost", header: "Unit Cost", align: "right", value: (r) => r.unitCost, render: (r) => formatCurrency(r.unitCost) },
    {
      key: "value",
      header: "Total Value",
      align: "right",
      value: (r) => r.value,
      render: (r) => <span className="num font-semibold">{formatCurrency(r.value)}</span>,
    },
  ];

  const movementColumns: Column<(typeof transactions)[number]>[] = [
    { key: "id", header: "Transaction", value: (r) => r.id, className: "num font-medium" },
    { key: "date", header: "Date", value: (r) => r.date, className: "num" },
    { key: "type", header: "Type", value: (r) => r.type },
    { key: "materialName", header: "Material", value: (r) => r.materialName },
    { key: "warehouse", header: "Warehouse", value: (r) => r.warehouse },
    {
      key: "quantity",
      header: "Qty",
      align: "right",
      value: (r) => r.quantity,
      render: (r) => `${formatNumber(r.quantity)} ${r.uom}`,
    },
    { key: "reference", header: "Reference", value: (r) => r.reference, className: "num" },
    { key: "user", header: "User", value: (r) => r.user },
  ];

  const totalValue = valuationRows.reduce((a, r) => a + r.value, 0);

  return (
    <div className="mx-auto max-w-[1600px]">
      <PageHeader
        title="Reports & Analytics"
        description="Standard inventory reports with CSV, Excel and PDF export · BR-070"
        breadcrumbs={[{ label: "Inventory Management", to: "/" }, { label: "Reports" }]}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => exportRows(valuationRows, "stock-valuation", "csv")}>
              <FileText className="mr-1.5 size-4" /> CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => exportRows(valuationRows, "stock-valuation", "excel")}>
              <FileSpreadsheet className="mr-1.5 size-4" /> Excel
            </Button>
            <Button size="sm" onClick={() => exportRows(valuationRows, "stock-valuation", "pdf")}>
              <FileBarChart className="mr-1.5 size-4" /> PDF
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Reported Value" value={formatCurrency(totalValue)} icon={Warehouse} trend={2.8} loading={loading} />
        <KpiCard label="Records in Scope" value={formatNumber(valuationRows.length)} icon={Layers} tone="reserved" loading={loading} />
        <KpiCard label="Transactions" value={formatNumber(transactions.length)} icon={BarChart3} tone="available" loading={loading} />
        <KpiCard
          label="Exceptions"
          value={formatNumber(kpis.lowStock + kpis.outOfStock)}
          icon={PackageX}
          tone="damaged"
          hint="Low & out of stock"
          loading={loading}
        />
      </div>

      <SectionCard title="Report parameters" description="Scope applied to generated and exported reports" className="mt-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
            <Label htmlFor="from">From date</Label>
            <Input id="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="to">To date</Label>
            <Input id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Delivery</Label>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() =>
                toast.success("Report scheduled", {
                  description: "Weekly delivery configured to the plant operations distribution list.",
                })
              }
            >
              <Mail className="mr-1.5 size-4" /> Schedule email
            </Button>
          </div>
        </div>
      </SectionCard>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <SectionCard title="Movement trend" description="Inbound vs outbound quantity" className="xl:col-span-2">
          {loading ? (
            <ChartSkeleton />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={monthlyMovement}>
                <defs>
                  <linearGradient id="rin" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="rout" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-status-quarantine)" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="var(--color-status-quarantine)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="month" {...axis} />
                <YAxis {...axis} />
                <Tooltip {...tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="inbound" stroke="var(--color-primary)" fill="url(#rin)" strokeWidth={2} />
                <Area
                  type="monotone"
                  dataKey="outbound"
                  stroke="var(--color-status-quarantine)"
                  fill="url(#rout)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </SectionCard>

        <SectionCard title="Stock status split" description="Share of total quantity">
          {loading ? (
            <ChartSkeleton />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={statusSplit} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
                  {statusSplit.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip {...tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </SectionCard>
      </div>

      <SectionCard title="Warehouse utilisation" description="Available, reserved and blocked stock" className="mt-4">
        {loading ? (
          <ChartSkeleton />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={byWarehouse}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="warehouse" {...axis} />
              <YAxis {...axis} />
              <Tooltip {...tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="available" stackId="a" fill="var(--color-status-available)" radius={[0, 0, 0, 0]} />
              <Bar dataKey="reserved" stackId="a" fill="var(--color-status-reserved)" />
              <Bar dataKey="damaged" stackId="a" fill="var(--color-status-damaged)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </SectionCard>

      <SectionCard title="Report catalog" description="Standard reports available for export" className="mt-4">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {CATALOG.map((r) => (
            <div key={r.id} className="rounded-xl border border-border p-4 transition-shadow hover:shadow-[var(--shadow-elevated)]">
              <div className="flex items-start gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                  <r.icon className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="num text-xs text-muted-foreground">{r.id}</p>
                  <p className="truncate text-sm font-semibold">{r.name}</p>
                </div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{r.description}</p>
              <div className="mt-3 flex gap-1.5">
                <Button size="sm" variant="outline" onClick={() => exportRows(r.rows(), r.id.toLowerCase(), "csv")}>
                  CSV
                </Button>
                <Button size="sm" variant="outline" onClick={() => exportRows(r.rows(), r.id.toLowerCase(), "excel")}>
                  Excel
                </Button>
                <Button size="sm" variant="outline" onClick={() => exportRows(r.rows(), r.id.toLowerCase(), "pdf")}>
                  PDF
                </Button>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <Tabs defaultValue="valuation" className="mt-4">
        <TabsList>
          <TabsTrigger value="valuation">Stock Valuation</TabsTrigger>
          <TabsTrigger value="movement">Stock Movement</TabsTrigger>
        </TabsList>
        <TabsContent value="valuation" className="mt-3">
          <SectionCard title="Stock valuation detail" description={`${valuationRows.length} records in scope`} bodyClassName="">
            <DataTable rows={valuationRows} columns={valuationColumns} loading={loading} pageSize={10} />
          </SectionCard>
        </TabsContent>
        <TabsContent value="movement" className="mt-3">
          <SectionCard title="Stock movement detail" description={`${from} to ${to}`} bodyClassName="">
            <DataTable rows={transactions} columns={movementColumns} loading={loading} pageSize={10} />
          </SectionCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
