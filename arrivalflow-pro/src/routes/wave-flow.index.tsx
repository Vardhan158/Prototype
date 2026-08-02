import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Package,
  CheckCircle2,
  Waves as WavesIcon,
  Users,
  Boxes,
  Truck,
  Clock,
  AlertTriangle,
  Plus,
  Zap,
  ScanBarcode,
  FileText,
  ArrowRight,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import {
  KpiCard,
  PageHeader,
  SectionCard,
  StatusBadge,
  ProgressBar,
} from "@/apps/wave-flow/components/wms/ui";
import { Button } from "@/components/ui/button";
import { activities, docks, hourlyThroughput, orders, waves } from "@/apps/wave-flow/lib/wms-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/wave-flow/")({
  head: () => ({
    meta: [
      { title: "Outbound Control Tower â€” NexusWMS" },
      {
        name: "description",
        content:
          "Live outbound fulfillment control tower: pending orders, wave status, picker activity, packing, dispatch queue and late orders.",
      },
      { property: "og:title", content: "Outbound Control Tower â€” NexusWMS" },
      {
        property: "og:description",
        content: "Real-time KPIs across waves, picking, packing, loading and dispatch.",
      },
    ],
  }),
  component: Dashboard,
});

const toneDot: Record<string, string> = {
  info: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
};

function Dashboard() {
  const navigate = useNavigate();
  const pending = orders.filter((o) => ["Created", "Inventory Reserved"].includes(o.status)).length;
  const ready = orders.filter((o) => o.status === "Ready").length;
  const activeWaves = waves.filter((w) => ["Released", "In Progress"].includes(w.status)).length;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Outbound Control Tower"
        description="Wednesday, 18 March 2026 Â· DC-01 Rotterdam Â· Shift A (06:00â€“14:00)"
        breadcrumb={["Outbound", "Dashboard"]}
        actions={
          <>
            <Button variant="outline" onClick={() => navigate({ to: "/wave-flow/reports" })}>
              <FileText className="size-4" /> Shift report
            </Button>
            <Button onClick={() => navigate({ to: "/wave-flow/orders" })}>
              <Plus className="size-4" /> Create outbound order
            </Button>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
        <KpiCard
          label="Pending Orders"
          value={pending + 16}
          sub="Awaiting inventory allocation"
          delta="+4 vs yesterday"
          icon={<Package className="size-4" />}
          tone="primary"
          onClick={() => navigate({ to: "/wave-flow/orders" })}
        />
        <KpiCard
          label="Ready Orders"
          value={ready + 11}
          sub="Eligible for wave planning"
          delta="+9%"
          icon={<CheckCircle2 className="size-4" />}
          tone="secondary"
          onClick={() => navigate({ to: "/wave-flow/orders" })}
        />
        <KpiCard
          label="Active Waves"
          value={activeWaves}
          sub="2 released Â· 1 in progress"
          icon={<WavesIcon className="size-4" />}
          tone="primary"
          onClick={() => navigate({ to: "/wave-flow/waves" })}
        />
        <KpiCard
          label="Active Pickers"
          value={14}
          sub="of 18 on shift Â· 132 lines/hr avg"
          delta="+6%"
          icon={<Users className="size-4" />}
          tone="success"
          onClick={() => navigate({ to: "/wave-flow/picking" })}
        />
        <KpiCard
          label="Packing Queue"
          value={37}
          sub="3 stations Â· 12 cartons open"
          icon={<Boxes className="size-4" />}
          tone="warning"
          onClick={() => navigate({ to: "/wave-flow/packing" })}
        />
        <KpiCard
          label="Dispatch Queue"
          value={9}
          sub="4 staged Â· 3 loading Â· 2 verified"
          icon={<Truck className="size-4" />}
          tone="primary"
          onClick={() => navigate({ to: "/wave-flow/dispatch" })}
        />
        <KpiCard
          label="Truck Loading"
          value="62%"
          sub="3 docks active Â· avg 41 min/truck"
          icon={<Truck className="size-4" />}
          tone="secondary"
          onClick={() => navigate({ to: "/wave-flow/loading" })}
        />
        <KpiCard
          label="Today's Dispatches"
          value={28}
          sub="Target 34 Â· 82% attainment"
          delta="+12%"
          icon={<CheckCircle2 className="size-4" />}
          tone="success"
          onClick={() => navigate({ to: "/wave-flow/tracking" })}
        />
        <KpiCard
          label="Late Orders"
          value={3}
          sub="1 critical Â· SLA breach risk"
          delta="-2 vs yesterday"
          icon={<Clock className="size-4" />}
          tone="danger"
          onClick={() => navigate({ to: "/wave-flow/orders" })}
        />
        <KpiCard
          label="Open Exceptions"
          value={2}
          sub="1 shortage Â· 1 damage"
          icon={<AlertTriangle className="size-4" />}
          tone="danger"
          onClick={() => navigate({ to: "/wave-flow/exceptions" })}
        />
      </div>

      <SectionCard title="Quick actions" description="Most used supervisor operations">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Run auto wave planning", icon: Zap, to: "/wave-flow/waves" as const },
            { label: "Release pending wave", icon: WavesIcon, to: "/wave-flow/waves" as const },
            { label: "Open pick queue", icon: ScanBarcode, to: "/wave-flow/picking" as const },
            { label: "Verify dispatch", icon: Truck, to: "/wave-flow/dispatch" as const },
          ].map((a) => (
            <Link
              key={a.label}
              to={a.to}
              className="glass-panel flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors hover:bg-accent"
            >
              <a.icon className="size-4 text-primary" />
              <span className="truncate">{a.label}</span>
              <ArrowRight className="ml-auto size-4 text-muted-foreground" />
            </Link>
          ))}
        </div>
      </SectionCard>

      <div className="grid gap-4 xl:grid-cols-3">
        <SectionCard
          className="xl:col-span-2"
          title="Fulfillment throughput"
          description="Units picked, packed and dispatched per hour"
          actions={<StatusBadge status="In Progress" />}
        >
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyThroughput} margin={{ left: -18, right: 8, top: 8 }}>
                <defs>
                  {["picked", "packed", "dispatched"].map((k, i) => (
                    <linearGradient key={k} id={`g-${k}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={`var(--chart-${i + 1})`} stopOpacity={0.35} />
                      <stop offset="100%" stopColor={`var(--chart-${i + 1})`} stopOpacity={0.02} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="hour"
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  stroke="var(--muted-foreground)"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
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
                <Area
                  type="monotone"
                  dataKey="picked"
                  stroke="var(--chart-1)"
                  fill="url(#g-picked)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="packed"
                  stroke="var(--chart-2)"
                  fill="url(#g-packed)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="dispatched"
                  stroke="var(--chart-3)"
                  fill="url(#g-dispatched)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard
          title="Recent activity"
          description="Live operational feed"
          bodyClassName="p-0"
          actions={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toast.success("Activity feed refreshed")}
            >
              Refresh
            </Button>
          }
        >
          <ul className="max-h-72 divide-y divide-border overflow-y-auto">
            {activities.map((a) => (
              <li key={a.at + a.text} className="flex gap-3 px-4 py-3">
                <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", toneDot[a.tone])} />
                <div className="min-w-0">
                  <p className="text-sm">{a.text}</p>
                  <p className="num text-xs text-muted-foreground">
                    {a.at} Â· {a.actor}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <SectionCard className="xl:col-span-2" title="Wave status board" bodyClassName="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-surface-muted text-xs text-muted-foreground">
                <tr>
                  {["Wave", "Strategy", "Orders", "Items", "Progress", "Status", ""].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {waves.slice(0, 5).map((w) => (
                  <tr key={w.id} className="hover:bg-muted/50">
                    <td className="num px-4 py-3 font-medium">{w.id}</td>
                    <td className="px-4 py-3 text-muted-foreground">{w.strategy}</td>
                    <td className="num px-4 py-3">{w.orders.length}</td>
                    <td className="num px-4 py-3">{w.totalItems}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <ProgressBar
                          value={w.progress}
                          tone={w.progress === 100 ? "success" : "primary"}
                        />
                        <span className="num w-9 text-xs text-muted-foreground">{w.progress}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={w.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to="/wave-flow/waves/$waveId"
                        params={{ waveId: w.id }}
                        className="text-xs font-medium text-primary"
                      >
                        Open
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard title="Dock & loading status" description="Live dock occupancy">
          <ul className="space-y-2.5">
            {docks.map((d) => (
              <li key={d.id} className="glass-panel rounded-xl p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="num text-sm font-medium">{d.id}</span>
                  <StatusBadge status={d.status} />
                </div>
                <p className="mt-1 truncate text-xs text-muted-foreground">
                  {d.truck !== "â€”"
                    ? `${d.truck} Â· ${d.order} Â· ETA ${d.eta}`
                    : "No truck assigned"}
                </p>
                <div className="mt-2">
                  <ProgressBar
                    value={d.utilization}
                    tone={d.utilization > 75 ? "success" : "warning"}
                  />
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>
    </div>
  );
}
