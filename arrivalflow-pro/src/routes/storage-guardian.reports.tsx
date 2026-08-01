import { createFileRoute } from "@tanstack/react-router";
import {
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { PageHeader } from "@/apps/storage-guardian/components/warehouse/app-shell";
import { useWarehouse } from "@/apps/storage-guardian/lib/warehouse/store";
import { zoneStats } from "@/apps/storage-guardian/lib/warehouse/stats";

export const Route = createFileRoute("/storage-guardian/reports")({
  head: () => ({
    meta: [
      { title: "Reports — NODE·WMS" },
      {
        name: "description",
        content:
          "Warehouse analytics: zone utilisation, overflow frequency and exception frequency by type over the last operating week.",
      },
      { property: "og:title", content: "Reports — NODE·WMS" },
      {
        property: "og:description",
        content: "Utilisation, overflow frequency and exception analytics for the storage operation.",
      },
    ],
  }),
  component: ReportsPage,
});

const OVERFLOW_TREND = [
  { day: "Mon", overflow: 2, escalations: 0 },
  { day: "Tue", overflow: 4, escalations: 1 },
  { day: "Wed", overflow: 3, escalations: 0 },
  { day: "Thu", overflow: 7, escalations: 2 },
  { day: "Fri", overflow: 5, escalations: 1 },
  { day: "Sat", overflow: 1, escalations: 0 },
  { day: "Sun", overflow: 2, escalations: 1 },
];

const PIE_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

const tooltipStyle = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  fontSize: 12,
};

function ReportsPage() {
  const { locations, alerts, items } = useWarehouse();
  const zones = zoneStats(locations).filter((z) => z.capacity > 0);

  const exceptionCounts = Object.entries(
    alerts.reduce<Record<string, number>>((acc, a) => {
      acc[a.type] = (acc[a.type] ?? 0) + 1;
      return acc;
    }, {}),
  ).map(([name, value]) => ({ name, value }));

  const stored = items.filter((i) => i.status === "Stored").length;
  const overflowItems = items.filter((i) => i.status === "Overflow").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        subtitle="Utilisation, overflow frequency and exception frequency across the storage operation."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Avg. utilisation", value: `${Math.round(zones.reduce((s, z) => s + z.utilisation, 0) / zones.length)}%` },
          { label: "Items stored", value: String(stored) },
          { label: "Items in overflow", value: String(overflowItems) },
        ].map((k) => (
          <div key={k.label} className="panel p-4">
            <p className="label-caps">{k.label}</p>
            <p className="mt-1 font-display text-3xl font-bold">{k.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="panel p-5">
          <h2 className="text-lg font-semibold">Utilisation by zone</h2>
          <div className="mt-4 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={zones.map((z) => ({ zone: z.name.replace(/ Zone.*/, ""), utilisation: z.utilisation }))}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="zone" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
                <Radar dataKey="utilisation" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.35} />
                <Tooltip contentStyle={tooltipStyle} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="panel p-5">
          <h2 className="text-lg font-semibold">Overflow frequency</h2>
          <div className="mt-4 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={OVERFLOW_TREND} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="overflow" stroke="var(--chart-2)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="escalations" stroke="var(--chart-4)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="panel p-5 xl:col-span-2">
          <h2 className="text-lg font-semibold">Exception frequency by type</h2>
          <div className="mt-4 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={exceptionCounts} dataKey="value" nameKey="name" innerRadius={70} outerRadius={110} paddingAngle={2}>
                  {exceptionCounts.map((e, i) => (
                    <Cell key={e.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </div>
  );
}
