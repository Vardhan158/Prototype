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
import { FileBarChart, Download, Clock, CheckCircle2 } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cycleTimeTrend, waveEfficiency } from "@/apps/wave-flow/lib/wms-data";

export const Route = createFileRoute("/wave-flow/reports")({
  head: () => ({
    meta: [
      { title: "Reports â€” NexusWMS" },
      {
        name: "description",
        content:
          "Outbound performance, wave efficiency, picking and packing productivity, loading time, dispatch performance and cycle time reports.",
      },
      { property: "og:title", content: "Reports â€” NexusWMS" },
      {
        property: "og:description",
        content:
          "Outbound performance, wave efficiency, picking and packing productivity, loading time, dispatch performance and cycle time reports.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Reports"
        description="Standard outbound report pack Â· period 12â€“18 March 2026"
        breadcrumb={["Insights", "Reports"]}
        actions={
          <Button onClick={() => toast.success("Report pack exported to PDF")}>
            <Download className="size-4" /> Export pack
          </Button>
        }
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Order cycle time"
          value="6.1 h"
          sub="Order â†’ dispatch"
          tone="success"
          delta="-0.8h"
          icon={<Clock className="size-4" />}
        />
        <KpiCard
          label="On-time dispatch"
          value="96.2%"
          sub="Target 95%"
          tone="success"
          delta="+1.4%"
          icon={<CheckCircle2 className="size-4" />}
        />
        <KpiCard
          label="Late orders"
          value={3}
          sub="0.9% of volume"
          tone="danger"
          icon={<Clock className="size-4" />}
        />
        <KpiCard
          label="Reports scheduled"
          value={7}
          sub="Daily & weekly"
          tone="primary"
          icon={<FileBarChart className="size-4" />}
        />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Wave efficiency" description="Planned vs actual attainment per wave">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={waveEfficiency} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="wave"
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
                <Bar dataKey="planned" fill="var(--chart-2)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="actual" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
        <SectionCard
          title="Order cycle time trend"
          description="Hours from order receipt to dispatch"
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cycleTimeTrend} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="day"
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
                <Line
                  type="monotone"
                  dataKey="hours"
                  stroke="var(--chart-1)"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>
      <SectionCard title="Standard reports" bodyClassName="p-0">
        <ul className="divide-y divide-border">
          {[
            [
              "Outbound performance",
              "Volume, fill rate and SLA attainment by warehouse",
              "Daily 06:00",
            ],
            [
              "Wave efficiency",
              "Planned vs actual wave completion and travel savings",
              "Per wave close",
            ],
            ["Picking productivity", "Lines/hour, accuracy and travel per picker", "Daily 14:00"],
            ["Packing productivity", "Cartons/hour and rework rate per station", "Daily 14:00"],
            [
              "Truck loading time",
              "Dock occupancy and load duration distribution",
              "Weekly Mon 07:00",
            ],
            [
              "Dispatch performance",
              "On-time dispatch, gate time and seal compliance",
              "Daily 18:00",
            ],
            ["Late orders", "SLA breaches with root cause classification", "Hourly"],
            ["Order cycle time", "Stage-by-stage duration breakdown", "Weekly Mon 07:00"],
          ].map(([t, d, s]) => (
            <li
              key={t}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{t}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {d} Â· schedule: {s}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button variant="ghost" size="sm" onClick={() => toast.success(`${t} generated`)}>
                  Run
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toast.success(`${t} exported (XLSX)`)}
                >
                  Export
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </SectionCard>
    </div>
  );
}
