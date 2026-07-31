import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  ArrowLeftRight,
  ArrowRight,
  Boxes,
  CalendarClock,
  CircleSlash,
  Layers,
  Lock,
  ShieldAlert,
  TrendingDown,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { KpiCard } from "@/apps/inventory-flow/components/KpiCard";
import { PageHeader } from "@/apps/inventory-flow/components/PageHeader";
import { SectionCard } from "@/apps/inventory-flow/components/SectionCard";
import { StatusBadge } from "@/apps/inventory-flow/components/StatusBadge";
import { ChartSkeleton } from "@/apps/inventory-flow/components/Skeletons";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  agingBuckets,
  byCategory,
  byWarehouse,
  cycleCounts,
  formatCurrency,
  formatNumber,
  healthScore,
  inventory,
  kpis,
  monthlyMovement,
  statusSplit,
  transactions,
  adjustments,
} from "@/apps/inventory-flow/lib/data";
import { useMockLoading } from "@/apps/inventory-flow/lib/useMockLoading";

export const Route = createFileRoute("/inventory-flow/")({
  head: () => ({
    meta: [
      { title: "Inventory Dashboard — VoltCore WMS" },
      {
        name: "description",
        content:
          "Executive inventory dashboard with real-time stock visibility, warehouse distribution, aging analysis and stock health for power equipment manufacturing.",
      },
      { property: "og:title", content: "Inventory Dashboard — VoltCore WMS" },
      {
        property: "og:description",
        content: "Real-time inventory KPIs, warehouse distribution and stock health across five warehouses.",
      },
    ],
  }),
  component: Dashboard,
});

const STATUS_COLORS = [
  "var(--color-status-available)",
  "var(--color-status-reserved)",
  "var(--color-status-damaged)",
  "var(--color-status-quarantine)",
];

const CATEGORY_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
  "var(--color-status-quarantine)",
];

const tooltipStyle = {
  contentStyle: {
    background: "var(--color-card)",
    border: "1px solid var(--color-border)",
    borderRadius: "0.5rem",
    fontSize: "12px",
    boxShadow: "var(--shadow-elevated)",
    color: "var(--color-foreground)",
  },
};

const axis = {
  stroke: "var(--color-muted-foreground)",
  fontSize: 11,
  tickLine: false,
  axisLine: false,
};

function Dashboard() {
  const loading = useMockLoading();
  const lowStockItems = inventory.filter((i) => i.status === "Low Stock" || i.status === "Out of Stock");
  const upcomingCounts = [...cycleCounts]
    .filter((c) => c.status !== "Completed")
    .slice(0, 5);

  return (
    <div className="mx-auto max-w-[1600px]">
      <PageHeader
        title="Inventory Dashboard"
        description="Real-time stock visibility across all plant warehouses · BR-056"
        breadcrumbs={[{ label: "Inventory Management", to: "/" }, { label: "Dashboard" }]}
        actions={
          <>
            <Button variant="outline" size="sm" asChild>
              <Link to="/inventory-flow/reports">View Reports</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/inventory-flow/explorer">
                Open Explorer <ArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Total Materials"
          value={formatNumber(kpis.totalMaterials)}
          icon={Boxes}
          trend={4.2}
          hint="active SKUs"
          loading={loading}
        />
        <KpiCard
          label="Available Stock"
          value={formatNumber(kpis.available)}
          icon={Layers}
          tone="available"
          trend={2.8}
          hint="units unrestricted"
          loading={loading}
        />
        <KpiCard
          label="Reserved Stock"
          value={formatNumber(kpis.reserved)}
          icon={Lock}
          tone="reserved"
          trend={-1.4}
          hint="allocated to orders"
          loading={loading}
        />
        <KpiCard
          label="Damaged Stock"
          value={formatNumber(kpis.damaged)}
          icon={ShieldAlert}
          tone="damaged"
          trend={-6.1}
          hint="pending disposition"
          loading={loading}
        />
        <KpiCard
          label="Quarantine Stock"
          value={formatNumber(kpis.quarantine)}
          icon={AlertTriangle}
          tone="quarantine"
          hint="awaiting QA release"
          loading={loading}
        />
        <KpiCard
          label="Low Stock Items"
          value={formatNumber(kpis.lowStock)}
          icon={TrendingDown}
          tone="low"
          hint="below reorder point"
          loading={loading}
        />
        <KpiCard
          label="Out of Stock"
          value={formatNumber(kpis.outOfStock)}
          icon={CircleSlash}
          tone="out"
          hint="zero on hand"
          loading={loading}
        />
        <KpiCard
          label="Pending Transfers"
          value={formatNumber(kpis.pendingTransfers)}
          icon={ArrowLeftRight}
          tone="reserved"
          hint="in approval or transit"
          loading={loading}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <SectionCard
          title="Inventory by Warehouse"
          description="Available vs reserved vs blocked quantities"
          className="xl:col-span-2"
        >
          {loading ? (
            <ChartSkeleton />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={byWarehouse} barSize={18}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="warehouse" {...axis} />
                <YAxis {...axis} />
                <Tooltip cursor={{ fill: "var(--color-accent)" }} {...tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="available" stackId="a" fill="var(--color-status-available)" radius={[0, 0, 0, 0]} />
                <Bar dataKey="reserved" stackId="a" fill="var(--color-status-reserved)" />
                <Bar dataKey="damaged" stackId="a" fill="var(--color-status-damaged)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </SectionCard>

        <SectionCard title="Inventory Status" description="Stock split by disposition">
          {loading ? (
            <ChartSkeleton />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={statusSplit}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={62}
                  outerRadius={96}
                  paddingAngle={2}
                  stroke="var(--color-card)"
                >
                  {statusSplit.map((_, i) => (
                    <Cell key={i} fill={STATUS_COLORS[i % STATUS_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip {...tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </SectionCard>

        <SectionCard title="Monthly Stock Movement" description="Inbound, outbound and adjustments" className="xl:col-span-2">
          {loading ? (
            <ChartSkeleton />
          ) : (
            <ResponsiveContainer width="100%" height={270}>
              <AreaChart data={monthlyMovement}>
                <defs>
                  <linearGradient id="gIn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gOut" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-status-quarantine)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="var(--color-status-quarantine)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="month" {...axis} />
                <YAxis {...axis} />
                <Tooltip {...tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area
                  type="monotone"
                  dataKey="inbound"
                  stroke="var(--color-chart-1)"
                  strokeWidth={2}
                  fill="url(#gIn)"
                />
                <Area
                  type="monotone"
                  dataKey="outbound"
                  stroke="var(--color-status-quarantine)"
                  strokeWidth={2}
                  fill="url(#gOut)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </SectionCard>

        <SectionCard title="Inventory by Category" description="On-hand quantity per material group">
          {loading ? (
            <ChartSkeleton />
          ) : (
            <ResponsiveContainer width="100%" height={270}>
              <BarChart data={byCategory} layout="vertical" barSize={14}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
                <XAxis type="number" {...axis} />
                <YAxis type="category" dataKey="category" width={110} {...axis} />
                <Tooltip cursor={{ fill: "var(--color-accent)" }} {...tooltipStyle} />
                <Bar dataKey="quantity" radius={[0, 4, 4, 0]}>
                  {byCategory.map((_, i) => (
                    <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </SectionCard>

        <SectionCard title="Inventory Aging" description="Stock value by age bucket · BR-066" className="xl:col-span-2">
          {loading ? (
            <ChartSkeleton />
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={agingBuckets}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="bucket" {...axis} />
                <YAxis {...axis} />
                <Tooltip {...tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="items" stroke="var(--color-chart-1)" strokeWidth={2} dot={{ r: 3 }} />
                <Line
                  type="monotone"
                  dataKey="quantity"
                  stroke="var(--color-status-quarantine)"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </SectionCard>

        <SectionCard title="Inventory Health Score" description="Composite availability & quality index">
          <div className="flex flex-col items-center py-2">
            <div className="relative grid size-36 place-items-center rounded-full bg-muted">
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `conic-gradient(var(--color-primary) ${healthScore * 3.6}deg, var(--color-muted) 0deg)`,
                }}
              />
              <div className="relative grid size-28 place-items-center rounded-full bg-card">
                <span className="num text-3xl font-semibold">{healthScore}</span>
                <span className="text-[11px] text-muted-foreground">out of 100</span>
              </div>
            </div>
            <div className="mt-5 w-full space-y-3">
              {[
                { label: "Stock availability", value: 88 },
                { label: "Count accuracy", value: 94 },
                { label: "Quality compliance", value: 76 },
              ].map((row) => (
                <div key={row.label}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{row.label}</span>
                    <span className="num font-medium">{row.value}%</span>
                  </div>
                  <Progress value={row.value} className="h-1.5" />
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Total stock value {formatCurrency(kpis.stockValue)}
            </p>
          </div>
        </SectionCard>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <SectionCard
          title="Recent Inventory Transactions"
          description="Latest goods movements"
          bodyClassName="divide-y divide-border"
          actions={
            <Button variant="ghost" size="sm" asChild>
              <Link to="/inventory-flow/reports">All</Link>
            </Button>
          }
        >
          {transactions.slice(0, 6).map((t) => (
            <div key={t.id} className="flex items-start justify-between gap-3 px-4 py-2.5">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{t.materialName}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {t.type} · {t.warehouse} · {t.date}
                </p>
              </div>
              <span className="num shrink-0 text-sm font-medium">
                {t.type === "Goods Receipt" || t.type === "Return" ? "+" : "−"}
                {formatNumber(t.quantity)} {t.uom}
              </span>
            </div>
          ))}
        </SectionCard>

        <SectionCard
          title="Recent Stock Adjustments"
          description="Workflow status · BR-062"
          bodyClassName="divide-y divide-border"
          actions={
            <Button variant="ghost" size="sm" asChild>
              <Link to="/inventory-flow/adjustments">All</Link>
            </Button>
          }
        >
          {adjustments.slice(0, 6).map((a) => (
            <div key={a.id} className="flex items-start justify-between gap-3 px-4 py-2.5">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{a.materialName}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {a.id} · {a.reasonCode}
                </p>
              </div>
              <StatusBadge status={a.status} />
            </div>
          ))}
        </SectionCard>

        <div className="space-y-4">
          <SectionCard
            title="Low Stock Alerts"
            description="BR-065"
            bodyClassName="divide-y divide-border"
            actions={
              <Button variant="ghost" size="sm" asChild>
                <Link to="/inventory-flow/planning">All</Link>
              </Button>
            }
          >
            {lowStockItems.slice(0, 4).map((i) => (
              <div key={i.id} className="flex items-start justify-between gap-3 px-4 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{i.materialName}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {i.materialCode} · ROP {i.reorderPoint} {i.uom}
                  </p>
                </div>
                <StatusBadge status={i.status} />
              </div>
            ))}
          </SectionCard>

          <SectionCard
            title="Upcoming Cycle Counts"
            description="BR-060"
            bodyClassName="divide-y divide-border"
            actions={
              <Button variant="ghost" size="sm" asChild>
                <Link to="/inventory-flow/cycle-count">All</Link>
              </Button>
            }
          >
            {upcomingCounts.map((c) => (
              <div key={c.id} className="flex items-start justify-between gap-3 px-4 py-2.5">
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 truncate text-sm font-medium">
                    <CalendarClock className="size-3.5 shrink-0 text-muted-foreground" />
                    {c.warehouse}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {c.zone} · {c.frequency} · {c.scheduledDate}
                  </p>
                </div>
                <StatusBadge status={c.status} />
              </div>
            ))}
          </SectionCard>
        </div>
      </div>

      <p className="mt-6 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Activity className="size-3.5" /> Live data refreshed every 60 seconds · last sync 31 Jul 2026 10:12 UTC
      </p>
    </div>
  );
}
