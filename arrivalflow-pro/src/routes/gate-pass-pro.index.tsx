import { createFileRoute, Link } from "@tanstack/react-router";
import {
  LogIn, LogOut, Timer, ShieldQuestion, Ban, Warehouse, Plus, FileBarChart,
  ArrowRight, Activity, CircleDot,
} from "lucide-react";
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { AppShell } from "@/apps/gate-pass-pro/components/wms/AppShell";
import { StatusChip } from "@/apps/gate-pass-pro/components/wms/StatusChip";
import { activities, gateEntries, hourlyTraffic, kpis, notifications } from "@/apps/gate-pass-pro/lib/wms-data";

export const Route = createFileRoute("/gate-pass-pro/")({
  head: () => ({
    meta: [
      { title: "Gate Control Dashboard — NexusWMS" },
      { name: "description", content: "Live gate KPIs, truck queue, arrivals timeline and pending approvals for warehouse security operations." },
      { property: "og:title", content: "Gate Control Dashboard — NexusWMS" },
      { property: "og:description", content: "Live gate KPIs, truck queue and arrival activity in one control tower." },
    ],
  }),
  component: Dashboard,
});

const icons = { LogIn, LogOut, Timer, ShieldQuestion, Ban, Warehouse };
const kpiTone: Record<string, string> = {
  info: "bg-primary/10 text-primary",
  teal: "bg-secondary/15 text-secondary",
  warning: "bg-warning/15 text-warning",
  danger: "bg-destructive/10 text-destructive",
  success: "bg-success/12 text-success",
};

export function Dashboard() {
  const queue = gateEntries.filter((e) =>
    ["Draft", "Pending Approval", "On Hold", "Waiting Warehouse", "Vehicle Verified"].includes(e.status),
  );

  return (
    <AppShell
      title="Gate Control Tower"
      subtitle="Saturday, 01 August 2026 · Shift A · Bhiwandi DC · Gates 01–03"
      actions={
        <>
          <Button variant="outline" asChild>
            <Link to="/gate-pass-pro/reports"><FileBarChart className="mr-2 h-4 w-4" />Reports</Link>
          </Button>
          <Button asChild>
            <Link to="/gate-pass-pro/gate-entry/new"><Plus className="mr-2 h-4 w-4" />New Gate Entry</Link>
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        {kpis.map((k) => {
          const Icon = icons[k.icon as keyof typeof icons];
          return (
            <div key={k.label} className="surface-card p-4">
              <div className="flex items-start justify-between">
                <span className={`grid h-9 w-9 place-items-center rounded-lg ${kpiTone[k.tone]}`}>
                  <Icon className="h-4 w-4" />
                </span>
                <p className="text-2xl font-semibold tabular-nums">{k.value}</p>
              </div>
              <p className="mt-3 text-sm font-medium">{k.label}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">{k.delta}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="surface-card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold">Gate traffic — entries vs exits</h2>
              <p className="text-[11px] text-muted-foreground">Two-hourly buckets · all inbound gates</p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/gate-pass-pro/reports">Full report <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
            </Button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyTraffic}>
                <defs>
                  <linearGradient id="gEntries" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gExits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-2)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--color-chart-2)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="hour" tickLine={false} axisLine={false} fontSize={11} />
                <YAxis tickLine={false} axisLine={false} fontSize={11} width={28} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--color-border)",
                    background: "var(--color-card)",
                    fontSize: 12,
                  }}
                />
                <Area type="monotone" dataKey="entries" stroke="var(--color-chart-1)" fill="url(#gEntries)" strokeWidth={2} />
                <Area type="monotone" dataKey="exits" stroke="var(--color-chart-2)" fill="url(#gExits)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="surface-card p-5">
          <h2 className="text-sm font-semibold">Quick actions</h2>
          <p className="text-[11px] text-muted-foreground">Most used by security officers</p>
          <div className="mt-4 grid gap-2">
            {[
              { to: "/gate-pass-pro/gate-entry/new", label: "New Gate Entry", desc: "Start 7-step verification", icon: Plus },
              { to: "/gate-pass-pro/pending-approval", label: "Pending Approval", desc: "3 trucks awaiting supervisor", icon: ShieldQuestion },
              { to: "/gate-pass-pro/vehicle-exit", label: "Vehicle Exit", desc: "Scan gate pass & release", icon: LogOut },
              { to: "/gate-pass-pro/reports", label: "Reports", desc: "Gate performance & vendors", icon: FileBarChart },
            ].map((a) => (
              <Link
                key={a.to}
                to={a.to}
                className="flex items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:border-primary/40 hover:bg-accent/60"
              >
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
                  <a.icon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium">{a.label}</span>
                  <span className="block truncate text-[11px] text-muted-foreground">{a.desc}</span>
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="surface-card p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <Activity className="h-4 w-4 text-primary" /> Live activity timeline
          </h2>
          <ol className="mt-4 space-y-4">
            {activities.map((a, i) => (
              <li key={i} className="relative pl-6">
                <span className="absolute left-0 top-1.5 h-2 w-2 rounded-full bg-primary" />
                {i < activities.length - 1 && <span className="absolute left-[3px] top-4 h-full w-px bg-border" />}
                <p className="text-xs font-medium">{a.text}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{a.time} · {a.user}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className="surface-card p-5 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <CircleDot className="h-4 w-4 text-warning" /> Live gate queue
            </h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/gate-pass-pro/queue">Kanban view <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
            </Button>
          </div>
          <div className="divide-y divide-border">
            {queue.map((e) => (
              <Link
                key={e.id}
                to="/gate-pass-pro/gate-entry/$id"
                params={{ id: e.id }}
                className="flex flex-wrap items-center gap-3 py-3 hover:bg-accent/40"
              >
                <span className="w-32 font-mono text-xs font-semibold">{e.truck}</span>
                <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">{e.vendor}</span>
                <span className="text-[11px] text-muted-foreground">{e.waitingMin} min wait</span>
                <StatusChip status={e.status} />
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 surface-card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Latest notifications</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/gate-pass-pro/notifications">Notification centre <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
          </Button>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {notifications.slice(0, 3).map((n) => (
            <Link key={n.id} to="/gate-pass-pro/notifications" className="rounded-xl border border-border p-3 hover:bg-accent/50">
              <StatusChip status={n.type} />
              <p className="mt-2 text-xs font-medium">{n.title}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">{n.body}</p>
              <p className="mt-2 text-[10px] text-muted-foreground">{n.time}</p>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
