import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Truck,
  Users,
  Package,
  Warehouse as WarehouseIcon,
  IdCard,
  Globe2,
  Boxes,
  Plus,
  ArrowUpRight,
  TrendingUp,
  LayoutDashboard,
  CircleDot,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useMasterCounts } from "@/apps/master-core/integrated/hooks/useMasters";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/apps/master-core/integrated/components/PageHeader";
import {
  itemsByCategory,
  recentActivity,
  suppliersByCountry,
  warehouses,
} from "@/apps/master-core/integrated/data/masters";

export const Route = createFileRoute("/master-core/")({
  head: () => ({
    meta: [
      { title: "MDM Dashboard — Meridia ERP Master Data" },
      {
        name: "description",
        content:
          "Governance dashboard for supplier, customer, item, warehouse, employee and fleet master data across the enterprise.",
      },
      { property: "og:title", content: "MDM Dashboard — Meridia ERP" },
      {
        property: "og:description",
        content: "Enterprise master data governance overview with KPIs, charts and activity.",
      },
    ],
  }),
  component: Dashboard,
});

const statDefs = [
  { label: "Total Suppliers", key: "suppliers", icon: Truck, to: "/master-core/suppliers" },
  { label: "Total Customers", key: "customers", icon: Users, to: "/master-core/customers" },
  { label: "Total Items", key: "items", icon: Package, to: "/master-core/items" },
  { label: "Warehouses", key: "warehouses", icon: WarehouseIcon, to: "/master-core/warehouses" },
  { label: "Employees", key: "employees", icon: IdCard, to: "/master-core/employees" },
  { label: "Vehicles", key: "vehicles", icon: Boxes, to: "/master-core/vehicles" },
  { label: "Countries", key: "countries", icon: Globe2, to: "/master-core/geography" },
] as const;

const chartColors = [
  "var(--color-primary)",
  "var(--color-chart-2, oklch(0.72 0.11 250))",
  "var(--color-chart-3, oklch(0.78 0.09 220))",
  "var(--color-chart-4, oklch(0.66 0.12 265))",
];

const quickActions = [
  { label: "New Supplier", to: "/master-core/suppliers", icon: Truck },
  { label: "New Customer", to: "/master-core/customers", icon: Users },
  { label: "New Item", to: "/master-core/items", icon: Package },
  { label: "New Warehouse", to: "/master-core/warehouses", icon: WarehouseIcon },
  { label: "New Employee", to: "/master-core/employees", icon: IdCard },
] as const;

function Dashboard() {
  const { data: liveCounts } = useMasterCounts();
  const stats = statDefs.map((d) => ({ ...d, value: liveCounts?.[d.key] ?? 0 }));

  return (
    <div className="min-h-full">
      <PageHeader
        crumbs={[{ label: "Master Data Management", to: "/" }, { label: "Dashboard" }]}
        icon={<LayoutDashboard className="h-5 w-5" />}
        title="Master Data Dashboard"
        description="Single source of truth for reference data used across Warehouse, Inventory, Procurement, Manufacturing, Logistics and Finance."
        actions={
          <>
            <Button variant="outline" size="sm">
              <TrendingUp className="h-4 w-4" /> Data quality report
            </Button>
            <Button size="sm" asChild className="shadow-[var(--shadow-primary)]">
              <Link to="/master-core/suppliers">
                <Plus className="h-4 w-4" /> New master record
              </Link>
            </Button>
          </>
        }
      />

      <div className="space-y-5 p-4 sm:p-6">
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          {stats.map((s) => (
            <Link
              key={s.label}
              to={s.to}
              className="surface-panel group p-4 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[var(--shadow-elevated)]"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
                  <s.icon className="h-4 w-4" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <p className="num mt-3 text-2xl font-semibold">{s.value.toLocaleString()}</p>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">{s.label}</p>
              <p className="mt-2 text-[11px] font-medium text-success">Live from database</p>
            </Link>
          ))}
        </section>

        <section className="grid gap-4 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader className="border-b border-border pb-3">
              <CardTitle className="text-sm font-semibold">Items by category</CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              <div className="h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={itemsByCategory} margin={{ left: -18, right: 8 }}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="var(--color-border)"
                    />
                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                    />
                    <RTooltip
                      cursor={{ fill: "var(--color-primary-soft)" }}
                      contentStyle={{
                        borderRadius: 10,
                        border: "1px solid var(--color-border)",
                        fontSize: 12,
                      }}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={64}>
                      {itemsByCategory.map((_, i) => (
                        <Cell key={i} fill={chartColors[i % chartColors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b border-border pb-3">
              <CardTitle className="text-sm font-semibold">Suppliers by country</CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              <div className="h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={suppliersByCountry}
                    layout="vertical"
                    margin={{ left: 8, right: 16 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      horizontal={false}
                      stroke="var(--color-border)"
                    />
                    <XAxis type="number" hide />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={72}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                    />
                    <RTooltip
                      cursor={{ fill: "var(--color-primary-soft)" }}
                      contentStyle={{
                        borderRadius: 10,
                        border: "1px solid var(--color-border)",
                        fontSize: 12,
                      }}
                    />
                    <Bar
                      dataKey="value"
                      radius={[0, 6, 6, 0]}
                      fill="var(--color-chart-1)"
                      maxBarSize={18}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 xl:grid-cols-3">
          <Card>
            <CardHeader className="border-b border-border pb-3">
              <CardTitle className="text-sm font-semibold">Quick actions</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 pt-4">
              {quickActions.map((a) => (
                <Link
                  key={a.label}
                  to={a.to}
                  className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5 transition-colors hover:border-primary/40 hover:bg-primary-soft"
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-primary-soft text-primary">
                    <a.icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{a.label}</span>
                  <Plus className="h-4 w-4 text-muted-foreground" />
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b border-border pb-3">
              <CardTitle className="text-sm font-semibold">Warehouse utilisation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-5">
              {warehouses.slice(0, 5).map((w) => (
                <div key={w.id}>
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <span className="min-w-0 truncate text-xs font-medium">{w.name}</span>
                    <span className="num shrink-0 text-xs text-muted-foreground">
                      {w.utilization}%
                    </span>
                  </div>
                  <Progress value={w.utilization} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b border-border pb-3">
              <CardTitle className="text-sm font-semibold">Recent activity</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ul className="divide-y divide-border">
                {recentActivity.slice(0, 5).map((a) => (
                  <li key={a.target + a.time} className="px-5 py-3">
                    <p className="text-sm">
                      <span className="font-medium">{a.actor}</span>{" "}
                      <span className="text-muted-foreground">{a.action}</span>{" "}
                      <span className="font-medium">{a.target}</span>
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge variant="secondary" className="text-[10px]">
                        {a.type}
                      </Badge>
                      <span className="text-[11px] text-muted-foreground">{a.time}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>

        <Card>
          <CardHeader className="border-b border-border pb-3">
            <CardTitle className="text-sm font-semibold">Recent updates timeline</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ol className="relative space-y-6 border-l border-border pl-6">
              {recentActivity.map((a) => (
                <li key={`t-${a.target}-${a.time}`} className="relative">
                  <span className="absolute -left-[31px] top-1 grid h-4 w-4 place-items-center rounded-full border-2 border-background bg-primary text-primary-foreground">
                    <CircleDot className="h-2.5 w-2.5" />
                  </span>
                  <p className="text-sm font-medium">
                    {a.actor} {a.action} {a.target}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {a.type} master · {a.time}
                  </p>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
