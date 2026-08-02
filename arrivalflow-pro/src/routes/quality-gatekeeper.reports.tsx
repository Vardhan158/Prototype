import { createFileRoute } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { toast } from "sonner";
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

import { Button } from "@/components/ui/button";
import { PageHeader, SectionCard } from "@/apps/quality-gatekeeper/components/qm/Primitives";
import { topDefects, trend7d, vendorScores } from "@/apps/quality-gatekeeper/lib/qm-data";

export const Route = createFileRoute("/quality-gatekeeper/reports")({
  head: () => ({
    meta: [
      { title: "Quality Reports & Analytics Â· Axiom WMS" },
      {
        name: "description",
        content:
          "Quality KPIs, defect Pareto, vendor scorecards and inspection throughput analytics.",
      },
      { property: "og:title", content: "Quality Reports & Analytics Â· Axiom WMS" },
      {
        property: "og:description",
        content: "Quality KPIs, defect Pareto and vendor performance analytics.",
      },
    ],
  }),
  component: Page,
});

const PIE = [
  "oklch(0.55 0.16 250)",
  "oklch(0.62 0.15 155)",
  "oklch(0.72 0.16 70)",
  "oklch(0.58 0.2 25)",
];
const disposition = [
  { name: "Accepted", value: 812 },
  { name: "Rework", value: 64 },
  { name: "Returned", value: 41 },
  { name: "Scrapped", value: 18 },
];

function Page() {
  return (
    <>
      <PageHeader
        breadcrumb={[
          { label: "Quality", to: "/quality-gatekeeper" },
          { label: "Reports & Analytics" },
        ]}
        eyebrow="Screen 19"
        title="Reports & Analytics"
        description="Quality KPIs, defect Pareto, vendor scorecards and throughput trends"
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success("Report exported to PDF")}
          >
            <Download className="mr-2 h-4 w-4" /> Export report
          </Button>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ["First-pass yield", "94.2%"],
          ["Defect rate", "3.1%"],
          ["Avg inspection time", "42 min"],
          ["Cost of poor quality", "SAR 214k"],
        ].map(([l, v]) => (
          <div key={l} className="surface-card rounded-2xl p-4">
            <p className="text-[11px] text-muted-foreground">{l}</p>
            <p className="num mt-1 text-2xl font-semibold">{v}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <SectionCard
          title="Inspection throughput"
          description="Received vs. inspected vs. rejected"
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend7d}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="day" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="passed"
                  stroke="oklch(0.62 0.15 155)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="hold"
                  stroke="oklch(0.72 0.16 70)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="failed"
                  stroke="oklch(0.58 0.2 25)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Defect Pareto" description="Top defect categories by occurrence">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topDefects} layout="vertical" margin={{ left: 24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis
                  type="category"
                  dataKey="defect"
                  width={120}
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip />
                <Bar dataKey="count" fill="oklch(0.55 0.16 250)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Vendor quality scorecard" description="Acceptance rate by supplier">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vendorScores}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="vendor"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                />
                <YAxis fontSize={11} domain={[80, 100]} tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="score" fill="oklch(0.62 0.15 155)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Disposition mix" description="Outcome distribution year to date">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={disposition}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {disposition.map((_, i) => (
                    <Cell key={i} fill={PIE[i % PIE.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>
    </>
  );
}
