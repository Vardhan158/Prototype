import { createFileRoute, Link } from "@tanstack/react-router";
import {
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
import { Activity, AlertTriangle, Download, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PageHeader, SectionCard, StatusBadge } from "@/apps/warehouse-flow/components/ui-kit";
import { KpiCard } from "@/apps/warehouse-flow/components/kpi-card";
import {
  consumptionTrend,
  inventoryAlerts,
  kpis,
  recentActivities,
  requestsVsIssues,
  returnTrend,
  statusSplit,
} from "@/apps/warehouse-flow/data";

export const Route = createFileRoute("/warehouse-flow/")({
  head: () => ({
    meta: [
      { title: "Warehouse Dashboard — WMS Material Management" },
      {
        name: "description",
        content:
          "Live KPIs for open material requests, approvals, reservations, issues, returns and warehouse performance.",
      },
      { property: "og:title", content: "Warehouse Dashboard — WMS Material Management" },
      {
        property: "og:description",
        content: "Live KPIs for material requests, issues, returns and warehouse performance.",
      },
    ],
  }),
  component: Dashboard,
});

const axis = {
  stroke: "var(--color-muted-foreground)",
  fontSize: 12,
  tickLine: false,
  axisLine: false,
};

const tooltipStyle = {
  background: "var(--color-popover)",
  border: "1px solid var(--color-border)",
  borderRadius: "0.6rem",
  fontSize: 12,
  color: "var(--color-popover-foreground)",
};

function Dashboard() {
  return (
    <>
      <PageHeader
        title="Warehouse Operations Dashboard"
        description="Real-time view of material demand, fulfilment and reverse logistics across all warehouses."
        breadcrumbs={[{ label: "Home", to: "/warehouse-flow/" }, { label: "Dashboard" }]}
        actions={
          <>
            <Button variant="outline">
              <Download className="size-4" /> Export
            </Button>
            <Link to="/warehouse-flow/requests/new">
              <Button>
                <Plus className="size-4" /> New Request
              </Button>
            </Link>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        <SectionCard
          title="Requests vs Issues"
          description="Monthly demand against fulfilled goods issues"
          className="xl:col-span-2"
        >
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={requestsVsIssues} barGap={6}>
                <CartesianGrid vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="month" {...axis} />
                <YAxis {...axis} width={40} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--color-muted)" }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="requests" name="Requests" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="issues" name="Issues" fill="var(--color-chart-2)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Request Status" description="Current distribution">
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusSplit}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={58}
                  outerRadius={92}
                  paddingAngle={2}
                  stroke="var(--color-card)"
                  strokeWidth={2}
                >
                  {statusSplit.map((s) => (
                    <Cell key={s.name} fill={s.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <SectionCard title="Material Consumption" description="Issued value per month (INR)">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={consumptionTrend}>
                <CartesianGrid vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="month" {...axis} />
                <YAxis
                  {...axis}
                  width={52}
                  tickFormatter={(v: number) => `${(v / 100000).toFixed(1)}L`}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(v: number) => `₹${(v / 100000).toFixed(2)} L`}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  name="Consumption"
                  stroke="var(--color-chart-1)"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Return Trends" description="Returns by reason category">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={returnTrend} stackOffset="sign">
                <CartesianGrid vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="month" {...axis} />
                <YAxis {...axis} width={36} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--color-muted)" }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="surplus" name="Surplus" stackId="a" fill="var(--color-chart-1)" />
                <Bar dataKey="damaged" name="Damaged" stackId="a" fill="var(--color-chart-5)" />
                <Bar dataKey="quality" name="Quality" stackId="a" fill="var(--color-chart-3)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <SectionCard
          title="Recent Activities"
          description="Latest actions across the module"
          bodyClassName="p-0"
        >
          <ul className="divide-y divide-border">
            {recentActivities.map((a, i) => (
              <li key={i} className="flex items-start gap-3 px-5 py-3.5">
                <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
                  <Activity className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm">
                    <span className="font-semibold">{a.user}</span>{" "}
                    <span className="text-muted-foreground">{a.action}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">{a.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard
          title="Inventory Alerts"
          description="Items at or below reorder point"
          bodyClassName="p-0"
          actions={
            <Link to="/warehouse-flow/reports">
              <Button variant="ghost" size="sm">
                View report
              </Button>
            </Link>
          }
        >
          <ul className="divide-y divide-border">
            {inventoryAlerts.map((a) => (
              <li key={a.code} className="px-5 py-3.5">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{a.name}</p>
                    <p className="num text-xs text-muted-foreground">
                      {a.code} · {a.warehouse}
                    </p>
                  </div>
                  <StatusBadge
                    status={a.severity === "critical" ? "Critical" : "Medium"}
                    dot={false}
                  />
                </div>
                <div className="mt-2 flex items-center gap-3">
                  <Progress value={(a.onHand / a.reorder) * 100} className="h-1.5" />
                  <span className="num shrink-0 text-xs text-muted-foreground">
                    {a.onHand}/{a.reorder}
                  </span>
                </div>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-2 border-t border-border bg-warning/10 px-5 py-3 text-xs text-warning-foreground">
            <AlertTriangle className="size-4 shrink-0" />
            14 items are below reorder point across 4 warehouses.
          </div>
        </SectionCard>
      </div>
    </>
  );
}
