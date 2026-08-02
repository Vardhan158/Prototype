import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Clock,
  PlayCircle,
  CheckCircle2,
  XCircle,
  Lock,
  FileWarning,
  Undo2,
  Timer,
  ArrowRight,
  ScanLine,
  BarChart3,
  ShieldAlert,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  KpiCard,
  PageHeader,
  SectionCard,
} from "@/apps/quality-gatekeeper/components/qm/Primitives";
import { StatusPill } from "@/apps/quality-gatekeeper/components/qm/StatusPill";
import {
  inspections,
  priorityTone,
  recentActivity,
  statusTone,
  topDefects,
  trend7d,
} from "@/apps/quality-gatekeeper/lib/qm-data";

export const Route = createFileRoute("/quality-gatekeeper/")({
  head: () => ({
    meta: [
      { title: "Quality Dashboard Â· Axiom WMS" },
      {
        name: "description",
        content:
          "Live quality KPIs: pending inspections, pass/fail rates, quality holds, NCRs and returns to supplier.",
      },
      { property: "og:title", content: "Quality Dashboard Â· Axiom WMS" },
      {
        property: "og:description",
        content: "Live warehouse quality inspection KPIs and workload.",
      },
    ],
  }),
  component: Dashboard,
});

const donut = [
  { name: "Passed", value: 287, fill: "var(--color-chart-2)" },
  { name: "Failed", value: 38, fill: "var(--color-chart-4)" },
  { name: "On Hold", value: 20, fill: "var(--color-chart-3)" },
];

function Dashboard() {
  const queue = inspections.filter((i) =>
    ["Pending", "Assigned", "Inspection Started", "Sampling"].includes(i.status),
  );

  return (
    <>
      <PageHeader
        eyebrow="Module 05 Â· Quality Inspection"
        title="Quality Dashboard"
        description="Friday, 01 August 2026 Â· Shift A Â· WH-01 Dammam Central"
        actions={
          <>
            <Button variant="outline" size="sm" asChild>
              <Link to="/quality-gatekeeper/reports">
                <BarChart3 className="mr-2 h-4 w-4" /> Reports
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/quality-gatekeeper/hold">
                <Lock className="mr-2 h-4 w-4" /> Quality Hold
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/quality-gatekeeper/queue">
                <PlayCircle className="mr-2 h-4 w-4" /> Start Inspection
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
        <KpiCard
          label="Pending Inspection"
          value={12}
          sub="3 breaching SLA in <2h"
          icon={Clock}
          tone="warning"
          to="/quality-gatekeeper/queue"
        />
        <KpiCard
          label="In Progress"
          value={5}
          sub="4 inspectors on shift"
          icon={PlayCircle}
          tone="info"
          to="/quality-gatekeeper/queue"
        />
        <KpiCard
          label="Passed Today"
          value={29}
          sub="+6 vs. yesterday"
          icon={CheckCircle2}
          tone="success"
          to="/quality-gatekeeper/history"
        />
        <KpiCard
          label="Failed Today"
          value={4}
          sub="12.1% reject rate"
          icon={XCircle}
          tone="danger"
          to="/quality-gatekeeper/history"
        />
        <KpiCard
          label="Quality Hold"
          value={3}
          sub="48 units blocked"
          icon={Lock}
          tone="warning"
          to="/quality-gatekeeper/hold"
        />
        <KpiCard
          label="Open NCR"
          value={4}
          sub="2 critical severity"
          icon={FileWarning}
          tone="danger"
          to="/quality-gatekeeper/ncr"
        />
        <KpiCard
          label="RTS In Flight"
          value={3}
          sub="SAR 106,500 credit"
          icon={Undo2}
          tone="brand"
          to="/quality-gatekeeper/rts"
        />
        <KpiCard
          label="Avg Inspection Time"
          value="43m"
          sub="Target â‰¤ 45m"
          icon={Timer}
          tone="success"
          to="/quality-gatekeeper/reports"
        />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <SectionCard
          className="xl:col-span-2"
          title="Inspection throughput â€” last 7 days"
          description="Passed vs. failed vs. held lots"
          actions={<StatusPill tone="success">Pass rate 87.4%</StatusPill>}
        >
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend7d} margin={{ left: -18, right: 6, top: 8 }}>
                <defs>
                  <linearGradient id="gPass" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-2)" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="var(--color-chart-2)" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="gFail" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-4)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--color-chart-4)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-border)"
                  vertical={false}
                />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  stroke="var(--color-muted-foreground)"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  stroke="var(--color-muted-foreground)"
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    fontSize: 12,
                    border: "1px solid var(--color-border)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="passed"
                  stroke="var(--color-chart-2)"
                  fill="url(#gPass)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="failed"
                  stroke="var(--color-chart-4)"
                  fill="url(#gFail)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="hold"
                  stroke="var(--color-chart-3)"
                  fill="transparent"
                  strokeWidth={2}
                  strokeDasharray="4 3"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Disposition mix" description="Month to date Â· 345 lots">
          <div className="h-[190px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donut}
                  dataKey="value"
                  innerRadius={54}
                  outerRadius={78}
                  paddingAngle={3}
                  stroke="none"
                >
                  {donut.map((d) => (
                    <Cell key={d.name} fill={d.fill} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5">
            {donut.map((d) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: d.fill }} /> {d.name}
                </span>
                <span className="num font-semibold">{d.value}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <SectionCard
          className="xl:col-span-2"
          title="Priority workload"
          description="Lots awaiting or under inspection"
          actions={
            <Button variant="ghost" size="sm" asChild>
              <Link to="/quality-gatekeeper/queue">
                View queue <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          }
          padded={false}
        >
          <ul className="divide-y divide-border">
            {queue.slice(0, 5).map((i) => (
              <li key={i.id}>
                <Link
                  to="/quality-gatekeeper/queue/$id"
                  params={{ id: i.id }}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 transition-colors hover:bg-accent/40"
                >
                  <div className="min-w-0">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="num truncate text-xs font-semibold text-primary">
                        {i.id}
                      </span>
                      <StatusPill tone={priorityTone[i.priority]} dot={false}>
                        {i.priority}
                      </StatusPill>
                    </div>
                    <p className="mt-0.5 truncate text-sm font-medium">{i.material}</p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {i.vendor} Â· {i.grn} Â· {i.qty} {i.uom} Â· {i.dock}
                    </p>
                  </div>
                  <StatusPill tone={statusTone[i.status]}>{i.status}</StatusPill>
                </Link>
              </li>
            ))}
          </ul>
        </SectionCard>

        <div className="space-y-4">
          <SectionCard title="Quick actions">
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="h-auto flex-col gap-1.5 rounded-xl py-3" asChild>
                <Link to="/quality-gatekeeper/queue">
                  <PlayCircle className="h-4 w-4 text-primary" />
                  <span className="text-[11px]">Start inspection</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto flex-col gap-1.5 rounded-xl py-3" asChild>
                <Link to="/quality-gatekeeper/scan">
                  <ScanLine className="h-4 w-4 text-primary" />
                  <span className="text-[11px]">Scan barcode</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto flex-col gap-1.5 rounded-xl py-3" asChild>
                <Link to="/quality-gatekeeper/ncr">
                  <FileWarning className="h-4 w-4 text-destructive" />
                  <span className="text-[11px]">Raise NCR</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto flex-col gap-1.5 rounded-xl py-3" asChild>
                <Link to="/quality-gatekeeper/reports">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  <span className="text-[11px]">Quality reports</span>
                </Link>
              </Button>
            </div>
            <div className="mt-4 rounded-xl border border-warning/30 bg-warning/10 p-3">
              <p className="flex items-center gap-2 text-xs font-semibold">
                <ShieldAlert className="h-4 w-4" /> SLA risk
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                QI-2026-004821 must be cleared within 1h 12m to meet the 4h critical SLA.
              </p>
              <Progress value={72} className="mt-2 h-1.5" />
            </div>
          </SectionCard>

          <SectionCard title="Top defects (MTD)">
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topDefects} layout="vertical" margin={{ left: 8, right: 12 }}>
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="defect"
                    width={118}
                    tickLine={false}
                    axisLine={false}
                    fontSize={10}
                  />
                  <Tooltip
                    cursor={{ fill: "var(--color-muted)" }}
                    contentStyle={{ borderRadius: 12, fontSize: 12 }}
                  />
                  <Bar
                    dataKey="count"
                    fill="var(--color-chart-1)"
                    radius={[0, 6, 6, 0]}
                    barSize={12}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>
        </div>
      </div>

      <SectionCard
        className="mt-4"
        title="Recent activity"
        description="Audit-linked events across the quality module"
        padded={false}
      >
        <ul className="divide-y divide-border">
          {recentActivity.map((a, idx) => (
            <li key={idx} className="flex items-start gap-3 px-4 py-2.5">
              <span className="num w-16 shrink-0 pt-0.5 text-[11px] text-muted-foreground">
                {a.time}
              </span>
              <StatusPill tone={a.tone} className="mt-0.5 h-4 w-4 p-0" children="" />
              <p className="min-w-0 flex-1 text-xs">{a.text}</p>
            </li>
          ))}
        </ul>
      </SectionCard>
    </>
  );
}
