import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Activity,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock,
  FileText,
  PackageX,
  PlayCircle,
  ShieldCheck,
  Timer,
  Truck,
  Warehouse,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  PageHeader,
  StatusPill,
  PriorityPill,
} from "@/apps/receiving-hub/components/wms/primitives";
import { useWms } from "@/apps/receiving-hub/lib/wms-store";
import {
  ACTIVITY,
  DOCKS,
  HOURLY_RECEIPTS,
  compactCurrency,
} from "@/apps/receiving-hub/lib/wms-data";

export const Route = createFileRoute("/receiving-hub/")({
  head: () => ({
    meta: [
      { title: "Receiving Dashboard | AXIOM WMS Inbound" },
      {
        name: "description",
        content:
          "Live inbound control tower: today's receipts, dock occupancy, pending inspections, discrepancies and average receiving time.",
      },
      { property: "og:title", content: "Receiving Dashboard | AXIOM WMS Inbound" },
      {
        property: "og:description",
        content: "Monitor trucks, docks, GRNs and receiving KPIs in real time.",
      },
    ],
  }),
  component: Dashboard,
});

const tones = {
  info: "bg-info-soft text-info",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning-foreground",
  destructive: "bg-destructive-soft text-destructive",
  accent: "bg-primary-soft text-primary",
  muted: "bg-muted text-muted-foreground",
} as Record<string, string>;

function KpiCard({
  label,
  value,
  hint,
  delta,
  icon: Icon,
  tone,
  to,
}: {
  label: string;
  value: string;
  hint: string;
  delta?: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: string;
  to: string;
}) {
  return (
    <Link to={to} className="group">
      <Card className="elevated-card h-full transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-[var(--shadow-float)]">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className={`grid h-10 w-10 place-items-center rounded-xl ${tones[tone]}`}>
              <Icon className="h-5 w-5" />
            </div>
            {delta && <span className="num text-xs font-semibold text-success">{delta}</span>}
          </div>
          <p className="num mt-4 text-2xl font-semibold">{value}</p>
          <p className="mt-1 text-sm font-medium">{label}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

function Dashboard() {
  const { state } = useWms();
  const navigate = useNavigate();
  const s = state.shipments;
  const waiting = s.filter((x) => x.status === "Waiting").length;
  const inProgress = s.filter((x) =>
    ["Receiving Started", "Scanning", "Verification", "Partial Receipt"].includes(x.status),
  ).length;
  const grnCount = state.grns.length;
  const pendingInspection = state.inspections.filter((i) => i.status !== "Passed").length;
  const rejected = s.filter((x) => x.status === "Rejected").length;
  const occupied = DOCKS.reduce((a, d) => a + d.occupied, 0);
  const capacity = DOCKS.reduce((a, d) => a + d.capacity, 0);
  const totalValue = state.grns.reduce((a, g) => a + g.value, 0);
  const nextUp = s
    .filter((x) => x.status === "Waiting" || x.status === "Dock Assigned")
    .slice(0, 4);

  return (
    <div className="mx-auto max-w-[1600px]">
      <PageHeader
        title="Receiving Control Tower"
        subtitle="Bhiwandi Central DC Â· Shift A (06:00 â€“ 14:00) Â· 3 receiving crews on floor"
        crumbs={[{ label: "Inbound" }, { label: "Receiving Dashboard" }]}
        actions={
          <>
            <Button variant="outline" onClick={() => navigate({ to: "/receiving-hub/docks" })}>
              <Warehouse className="mr-2 h-4 w-4" /> Dock Queue
            </Button>
            <Button variant="outline" onClick={() => navigate({ to: "/receiving-hub/reports" })}>
              <BarChart3 className="mr-2 h-4 w-4" /> Reports
            </Button>
            <Button variant="outline" onClick={() => navigate({ to: "/receiving-hub/grn" })}>
              <FileText className="mr-2 h-4 w-4" /> Create GRN
            </Button>
            <Button onClick={() => navigate({ to: "/receiving-hub/queue" })}>
              <PlayCircle className="mr-2 h-4 w-4" /> Start Receiving
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Today's Receipts"
          value="53"
          hint="18 trucks Â· 9,240 units"
          delta="+12.4%"
          icon={Truck}
          tone="info"
          to="/receiving-hub/queue"
        />
        <KpiCard
          label="Pending Receiving"
          value={String(waiting)}
          hint="Awaiting dock allocation"
          icon={Clock}
          tone="warning"
          to="/receiving-hub/queue"
        />
        <KpiCard
          label="Receiving In Progress"
          value={String(inProgress)}
          hint="Active on docks now"
          icon={Activity}
          tone="accent"
          to="/receiving-hub/queue"
        />
        <KpiCard
          label="Completed GRN"
          value={String(grnCount)}
          hint={`${compactCurrency(totalValue)} posted value`}
          delta="+4"
          icon={FileText}
          tone="success"
          to="/receiving-hub/grn"
        />
        <KpiCard
          label="Pending Inspection"
          value={String(pendingInspection)}
          hint="Quality queue Â· 2 critical"
          icon={ShieldCheck}
          tone="info"
          to="/receiving-hub/quality"
        />
        <KpiCard
          label="Rejected Receipts"
          value={String(rejected)}
          hint="Seal tampering Â· 1 vendor claim"
          icon={PackageX}
          tone="destructive"
          to="/receiving-hub/history"
        />
        <KpiCard
          label="Dock Occupancy"
          value={`${Math.round((occupied / capacity) * 100)}%`}
          hint={`${occupied} of ${capacity} bays engaged`}
          icon={Warehouse}
          tone="accent"
          to="/receiving-hub/docks"
        />
        <KpiCard
          label="Avg Receiving Time"
          value="42m"
          hint="Target 45m Â· SLA met"
          delta="-6m"
          icon={Timer}
          tone="success"
          to="/receiving-hub/reports"
        />
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-3">
        <Card className="elevated-card xl:col-span-2">
          <CardHeader className="flex-row items-start justify-between gap-4">
            <div>
              <CardTitle className="text-base">Inbound throughput â€” today</CardTitle>
              <CardDescription>Receipts closed and units posted per 2-hour window</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link to="/receiving-hub/reports">
                Full report <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="h-[260px] pl-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={HOURLY_RECEIPTS} margin={{ left: 8, right: 12, top: 8 }}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--color-border)" vertical={false} />
                <XAxis
                  dataKey="hour"
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
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="units"
                  stroke="var(--color-chart-1)"
                  strokeWidth={2}
                  fill="url(#g1)"
                  name="Units received"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="elevated-card">
          <CardHeader>
            <CardTitle className="text-base">Dock occupancy</CardTitle>
            <CardDescription>Live bay utilisation across inbound zones</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {["Inbound North", "Inbound East", "Inbound South", "Cross Dock"].map((zone) => {
              const bays = DOCKS.filter((d) => d.zone === zone);
              const cap = bays.reduce((a, b) => a + b.capacity, 0);
              const occ = bays.reduce((a, b) => a + b.occupied, 0);
              return (
                <div key={zone}>
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="font-medium">{zone}</span>
                    <span className="num text-muted-foreground">
                      {occ}/{cap} bays
                    </span>
                  </div>
                  <Progress value={(occ / cap) * 100} className="h-2" />
                </div>
              );
            })}
            <Separator />
            <Button asChild variant="outline" className="w-full">
              <Link to="/receiving-hub/docks">Open dock map</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-3">
        <Card className="elevated-card xl:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Next in yard queue</CardTitle>
              <CardDescription>Trucks awaiting dock allocation or receiving start</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link to="/receiving-hub/queue">
                View queue <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {nextUp.map((sh) => (
              <Link
                key={sh.id}
                to="/receiving-hub/queue/$id"
                params={{ id: sh.id }}
                className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-surface-2/60 p-3 transition hover:border-ring hover:bg-surface"
              >
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
                  <Truck className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="num text-sm font-semibold">{sh.truckNo}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {sh.vendor} Â· {sh.po}
                  </p>
                </div>
                <PriorityPill priority={sh.priority} />
                <StatusPill status={sh.status} />
                <span className="num text-xs text-muted-foreground">{sh.arrival.slice(-5)}</span>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card className="elevated-card">
          <CardHeader>
            <CardTitle className="text-base">Recent activity</CardTitle>
            <CardDescription>Floor events across all inbound docks</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="relative space-y-4 border-l border-border pl-5">
              {ACTIVITY.map((a, i) => (
                <li key={i} className="relative">
                  <span
                    className={`absolute -left-[1.55rem] top-1 h-2.5 w-2.5 rounded-full ${tones[a.tone]?.split(" ")[0]} ring-2 ring-card`}
                  />
                  <p className="text-sm leading-snug">{a.text}</p>
                  <p className="num mt-0.5 text-[0.7rem] text-muted-foreground">
                    {a.at} Â· {a.actor}
                  </p>
                </li>
              ))}
            </ol>
            <Button asChild variant="ghost" size="sm" className="mt-4 w-full">
              <Link to="/receiving-hub/audit">
                Open audit log <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="elevated-card mt-5 overflow-hidden">
        <div className="brand-gradient flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
          <div className="text-primary-foreground">
            <p className="text-xs font-medium uppercase tracking-[0.16em] opacity-80">
              Module 03 Â· Goods Receiving &amp; GRN
            </p>
            <h2 className="mt-1 text-xl font-semibold">Close the loop from dock to inventory</h2>
            <p className="mt-1 max-w-xl text-sm opacity-90">
              Every completed receipt hands off automatically to Module 04 â€” Document Management
              &amp; OCR Processing.
            </p>
          </div>
          <Button asChild variant="secondary" size="lg">
            <Link to="/receiving-hub/module-complete">
              <CheckCircle2 className="mr-2 h-4 w-4" /> Module handoff
            </Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}
