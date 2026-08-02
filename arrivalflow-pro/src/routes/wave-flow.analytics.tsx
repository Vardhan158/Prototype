import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  KpiCard,
  PageHeader,
  ProgressBar,
  SectionCard,
  StatusBadge,
  Metric,
  Timeline,
} from "@/apps/wave-flow/components/wms/ui";
import { Button } from "@/components/ui/button";
import { ChartNoAxesCombined, Users, Truck, Flame } from "lucide-react";
import {
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
import { dispatchMix, heatMap, hourlyThroughput, pickers } from "@/apps/wave-flow/lib/wms-data";

export const Route = createFileRoute("/wave-flow/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics â€” NexusWMS" },
      {
        name: "description",
        content:
          "Wave, picker, packing, warehouse and dispatch analytics with truck utilisation and pick-density heat maps.",
      },
      { property: "og:title", content: "Analytics â€” NexusWMS" },
      {
        property: "og:description",
        content:
          "Wave, picker, packing, warehouse and dispatch analytics with truck utilisation and pick-density heat maps.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Analytics"
        description="Operational intelligence across the outbound network"
        breadcrumb={["Insights", "Analytics"]}
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Warehouse performance"
          value="94.6"
          sub="Composite index"
          tone="success"
          delta="+2.1"
          icon={<ChartNoAxesCombined className="size-4" />}
        />
        <KpiCard
          label="Picker productivity"
          value="132 lph"
          sub="Network average"
          tone="primary"
          delta="+6%"
          icon={<Users className="size-4" />}
        />
        <KpiCard
          label="Truck utilisation"
          value="78%"
          sub="Weight and cube blended"
          tone="secondary"
          delta="+4%"
          icon={<Truck className="size-4" />}
        />
        <KpiCard
          label="Hot zones"
          value={3}
          sub="Zone A, B, E congestion"
          tone="warning"
          icon={<Flame className="size-4" />}
        />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard
          className="lg:col-span-2"
          title="Throughput by hour"
          description="Picked, packed and dispatched units"
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyThroughput} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="hour"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  stroke="var(--muted-foreground)"
                />
                <YAxis
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  stroke="var(--muted-foreground)"
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--border)",
                    background: "var(--surface)",
                    fontSize: 12,
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="picked" stackId="a" fill="var(--chart-1)" radius={[0, 0, 0, 0]} />
                <Bar dataKey="packed" stackId="a" fill="var(--chart-2)" />
                <Bar dataKey="dispatched" stackId="a" fill="var(--chart-3)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
        <SectionCard title="Carrier mix" description="Share of dispatched shipments">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dispatchMix}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                >
                  {dispatchMix.map((_, i) => (
                    <Cell key={i} fill={`var(--chart-${(i % 5) + 1})`} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--border)",
                    background: "var(--surface)",
                    fontSize: 12,
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>
      <SectionCard
        title="Pick density heat map"
        description="Pick events per aisle over the last 24 hours"
      >
        <div className="space-y-1.5 overflow-x-auto">
          {heatMap.map((row) => (
            <div key={row.zone} className="flex items-center gap-1.5">
              <span className="w-16 shrink-0 text-xs text-muted-foreground">Zone {row.zone}</span>
              {row.aisles.map((a) => (
                <div
                  key={a.aisle}
                  title={`${a.aisle} Â· ${a.density} picks`}
                  className="h-7 min-w-7 flex-1 rounded-md"
                  style={{
                    background: `color-mix(in oklab, var(--chart-1) ${a.density}%, var(--muted))`,
                  }}
                />
              ))}
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <span>Low</span>
          <div
            className="h-2 w-40 rounded-full"
            style={{ background: "linear-gradient(90deg, var(--muted), var(--chart-1))" }}
          />
          <span>High</span>
        </div>
      </SectionCard>
      <SectionCard title="Picker performance" bodyClassName="p-0">
        <ul className="divide-y divide-border">
          {pickers.map((p) => (
            <li
              key={p.name}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{p.name}</p>
                <p className="num text-xs text-muted-foreground">
                  {p.zone} Â· {p.lph} lines/hr Â· {p.accuracy}% accuracy
                </p>
                <div className="mt-1.5 max-w-md">
                  <ProgressBar
                    value={(p.lph / 160) * 100}
                    tone={p.lph > 130 ? "success" : "warning"}
                  />
                </div>
              </div>
              <StatusBadge status={p.status} />
            </li>
          ))}
        </ul>
      </SectionCard>
    </div>
  );
}
