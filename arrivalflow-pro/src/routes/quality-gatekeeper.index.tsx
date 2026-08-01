import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ClipboardList,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  FileWarning,
  PackageX,
  Target,
  Timer,
  Play,
  FilePlus2,
  BarChart3,
  ArrowRight,
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
import { StatCard, SectionCard, StatusBadge, PriorityPill, Timeline } from "@/apps/quality-gatekeeper/components/wms/bits";
import { ACTIVITY, DEFECTS, PASS_TREND, VENDOR_RATING } from "@/apps/quality-gatekeeper/lib/wms-data";
import { useWms } from "@/apps/quality-gatekeeper/lib/wms-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/quality-gatekeeper/")({
  head: () => ({
    meta: [
      { title: "Quality Dashboard — AXIOM WMS Quality Inspection" },
      { name: "description", content: "Live quality KPIs: pending inspections, pass and fail rates, quality holds, open NCRs and inspector performance." },
      { property: "og:title", content: "Quality Dashboard — AXIOM WMS" },
      { property: "og:description", content: "Live warehouse quality inspection KPIs, NCR status and inspector performance." },
    ],
  }),
  component: Dashboard,
});

const DEFECT_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)", "var(--muted-foreground)"];

function Dashboard() {
  const { grns, warehouse } = useWms();
  const navigate = useNavigate();

  const pending = grns.filter((g) => ["Waiting Inspection", "Assigned", "Inspection Started", "Under Review"].includes(g.status));
  const hold = grns.filter((g) => g.status === "Quality Hold");
  const passed = grns.filter((g) => ["Passed", "Available Inventory"].includes(g.status));
  const failed = grns.filter((g) => ["Failed", "NCR Created", "RTS"].includes(g.status));

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:flex-wrap sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{warehouse} · Shift A</p>
          <h1 className="truncate text-2xl font-bold sm:text-3xl">Quality Dashboard</h1>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button className="rounded-xl" onClick={() => navigate({ to: "/quality-gatekeeper/queue" })}>
            <Play className="h-4 w-4" /> Start Inspection
          </Button>
          <Button variant="outline" className="rounded-xl" onClick={() => navigate({ to: "/quality-gatekeeper/ncr" })}>
            <FilePlus2 className="h-4 w-4" /> Create NCR
          </Button>
          <Button variant="outline" className="rounded-xl" onClick={() => navigate({ to: "/quality-gatekeeper/reports" })}>
            <BarChart3 className="h-4 w-4" /> Reports
          </Button>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Pending Inspection" value={pending.length} sub={`${pending.filter((p) => p.priority === "Critical").length} critical priority`} icon={<ClipboardList className="h-5 w-5" />} tone="primary" onClick={() => navigate({ to: "/quality-gatekeeper/queue" })} />
        <StatCard label="Passed Today" value={38} sub="of 42 completed inspections" icon={<CheckCircle2 className="h-5 w-5" />} tone="success" onClick={() => navigate({ to: "/quality-gatekeeper/history" })} />
        <StatCard label="Failed Today" value={4} sub="2 escalated to NCR" icon={<XCircle className="h-5 w-5" />} tone="danger" onClick={() => navigate({ to: "/quality-gatekeeper/history" })} />
        <StatCard label="Quality Hold" value={hold.length + 3} sub="1,264 EA blocked stock" icon={<ShieldAlert className="h-5 w-5" />} tone="warning" onClick={() => navigate({ to: "/quality-gatekeeper/hold" })} />
        <StatCard label="NCR Open" value={3} sub="1 critical · SLA 48h" icon={<FileWarning className="h-5 w-5" />} tone="danger" onClick={() => navigate({ to: "/quality-gatekeeper/ncr" })} />
        <StatCard label="Rejected Items" value="6,904" sub="₹ 13.4 L rejection value (MTD)" icon={<PackageX className="h-5 w-5" />} tone="warning" onClick={() => navigate({ to: "/quality-gatekeeper/rts" })} />
        <StatCard label="Inspection Accuracy" value="98.2%" sub="+0.6% vs last week" icon={<Target className="h-5 w-5" />} tone="success" onClick={() => navigate({ to: "/quality-gatekeeper/reports" })} />
        <StatCard label="Avg Inspection Time" value="46 min" sub="Target 60 min · within SLA" icon={<Timer className="h-5 w-5" />} tone="primary" onClick={() => navigate({ to: "/quality-gatekeeper/reports" })} />
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <SectionCard
          className="xl:col-span-2"
          title="Pass / Fail trend — last 7 days"
          description="Inspection outcomes across all receiving docks"
          action={<span className="rounded-lg bg-success-soft px-2.5 py-1 text-xs font-semibold text-success">Pass rate 92.1%</span>}
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={PASS_TREND} margin={{ left: -18, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="passFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--success)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--success)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="failFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--destructive)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="var(--destructive)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
                <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", fontSize: 12 }} />
                <Area type="monotone" dataKey="pass" name="Pass %" stroke="var(--success)" fill="url(#passFill)" strokeWidth={2.5} />
                <Area type="monotone" dataKey="fail" name="Fail %" stroke="var(--destructive)" fill="url(#failFill)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Top defect categories" description="Rolling 30 days · 100 recorded defects">
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={DEFECTS} dataKey="value" nameKey="name" innerRadius={52} outerRadius={80} paddingAngle={3}>
                  {DEFECTS.map((_, i) => (
                    <Cell key={i} fill={DEFECT_COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-3 space-y-1.5">
            {DEFECTS.map((d, i) => (
              <li key={d.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ background: DEFECT_COLORS[i] }} />
                  {d.name}
                </span>
                <span className="num font-semibold">{d.value}%</span>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <SectionCard
          className="xl:col-span-2"
          title="Priority inspection queue"
          description="GRNs awaiting quality disposition"
          action={
            <Button asChild variant="ghost" size="sm" className="gap-1">
              <Link to="/quality-gatekeeper/queue">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          }
        >
          <ul className="space-y-3">
            {grns.slice(0, 5).map((g) => (
              <li key={g.id}>
                <Link
                  to="/quality-gatekeeper/inspection/$grn"
                  params={{ grn: g.id }}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-border bg-card p-3.5 transition-colors hover:border-primary/40 hover:bg-accent/50"
                >
                  <div className="min-w-0">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="num truncate font-mono text-sm font-semibold">{g.grn}</span>
                      <PriorityPill priority={g.priority} />
                    </div>
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {g.vendor} · {g.material} · {g.qty.toLocaleString()} {g.uom} · {g.dock}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <StatusBadge status={g.status} />
                    <ArrowRight className="hidden h-4 w-4 text-muted-foreground sm:block" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard title="Recent activity" description="Live quality event feed">
          <Timeline items={ACTIVITY.map((a) => ({ at: a.at, label: a.text, by: "Quality Module" }))} />
        </SectionCard>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <SectionCard className="xl:col-span-2" title="Vendor quality rating" description="Score = 100 − (defect PPM weight + NCR weight)">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={VENDOR_RATING} margin={{ left: -18, right: 8, top: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="vendor" tickLine={false} axisLine={false} fontSize={11} stroke="var(--muted-foreground)" interval={0} angle={-16} textAnchor="end" height={54} />
                <YAxis domain={[50, 100]} tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
                <Tooltip cursor={{ fill: "var(--accent)" }} contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", fontSize: 12 }} />
                <Bar dataKey="rating" name="Quality score" radius={[6, 6, 0, 0]}>
                  {VENDOR_RATING.map((v, i) => (
                    <Cell key={i} fill={v.rating >= 90 ? "var(--success)" : v.rating >= 75 ? "var(--warning)" : "var(--destructive)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Inspector workload" description="Open assignments this shift">
          <ul className="space-y-4">
            {[
              { name: "A. Sharma", load: 72, open: 6, avg: "41 min" },
              { name: "N. Verma", load: 88, open: 8, avg: "58 min" },
              { name: "P. Nair", load: 45, open: 4, avg: "37 min" },
              { name: "R. D'Souza", load: 26, open: 2, avg: "44 min" },
            ].map((i) => (
              <li key={i.name}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{i.name}</span>
                  <span className={cn("num text-xs font-semibold", i.load > 80 ? "text-destructive" : "text-muted-foreground")}>{i.load}%</span>
                </div>
                <Progress value={i.load} className="mt-2 h-1.5" />
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {i.open} open GRNs · avg {i.avg}
                </p>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>
    </div>
  );
}
