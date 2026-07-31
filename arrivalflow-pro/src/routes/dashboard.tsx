import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Truck,
  Clock3,
  Warehouse,
  ListOrdered,
  PackageCheck,
  Plus,
  BarChart3,
  ArrowUpRight,
  CircleDot,
  LayoutDashboard,
  Database,
  Waves,
  Factory,
  Boxes,
  LockKeyhole,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell, StatusBadge } from "@/components/wms/app-shell";
import { SectionCard, StatCard, Timeline } from "@/components/wms/primitives";
import { Button } from "@/components/ui/button";
import { arrivals, activity, arrivalTrend, docks } from "@/lib/wms-data";
import { Progress } from "@/components/ui/progress";
import { useAuth, type ModuleKey } from "@/lib/auth";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Warehouse Dashboard · NexusWMS Pune DC" },
      { name: "description", content: "Live view of today's truck arrivals, dock occupancy, vehicle queue and receiving progress at Pune Distribution Centre." },
      { property: "og:title", content: "Warehouse Dashboard · NexusWMS Pune DC" },
      { property: "og:description", content: "Live truck arrivals, dock occupancy and receiving progress for warehouse managers." },
    ],
  }),
  component: Dashboard,
});

const quickActions = [
  { label: "New Arrival", to: "/notifications", icon: Plus },
  { label: "Vehicle Queue", to: "/vehicle-queue", icon: ListOrdered },
  { label: "Receiving", to: "/receiving", icon: PackageCheck },
  { label: "Reports", to: "/reports", icon: BarChart3 },
];

const modules: Array<{ key: ModuleKey; title: string; description: string; href: "/master-core" | "/wave-flow" | "/work-craft" | "/inventory-flow" | "/warehouse-flow" | "/receiving-hub"; icon: typeof Database }> = [
  { key: "master", title: "Master Core", description: "Suppliers, customers, items, warehouses and enterprise records.", href: "/master-core", icon: Database },
  { key: "wave", title: "Wave Flow", description: "Outbound allocation, wave planning, picking, packing and dispatch.", href: "/wave-flow", icon: Waves },
  { key: "workcraft", title: "Work Craft Flow", description: "Assembly work orders, BOM consumption, quality and completion.", href: "/work-craft", icon: Factory },
  { key: "inventory", title: "Inventory Flow", description: "Stock visibility, inventory explorer, cycle counts and adjustments.", href: "/inventory-flow", icon: Boxes },
  { key: "warehouse", title: "Warehouse Flow", description: "Material requests, approvals, reservations, issues and returns.", href: "/warehouse-flow", icon: PackageCheck },
  { key: "receiving", title: "Receiving Hub", description: "Purchase orders, GRNs, quality inspection, discrepancies and put-away.", href: "/receiving-hub", icon: Truck },
];

function Dashboard() {
  const { user, canAccess } = useAuth();
  const occupied = docks.filter((d) => d.status === "Occupied" || d.status === "Reserved").length;

  return (
    <AppShell
      title={`Good morning, ${user?.name.split(" ")[0] ?? "Operator"}`}
      subtitle={`${user?.role ?? "Operator"} · Pune Distribution Centre · Shift A (06:00 – 14:00)`}
      actions={
        <>
          <Button variant="outline" className="rounded-xl" asChild>
            <Link to="/vehicle-queue">
              <ListOrdered className="size-4" /> Vehicle queue
            </Link>
          </Button>
          <Button className="rounded-xl shadow-glow" asChild>
            <Link to="/notifications">
              <Truck className="size-4" /> Incoming arrivals
            </Link>
          </Button>
        </>
      }
    >
      <SectionCard title="Nexus modules" description="Your role-based application access" icon={LayoutDashboard}>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {modules.map((module) => {
            const allowed = canAccess(module.key);
            return allowed ? (
              <Link key={module.key} to={module.href} className="group rounded-2xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-soft">
                <span className="grid size-10 place-items-center rounded-xl bg-primary-soft text-primary"><module.icon className="size-5" /></span>
                <h3 className="mt-4 font-semibold">{module.title}</h3>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">{module.description}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-primary">Open dashboard <ArrowUpRight className="size-3.5" /></span>
              </Link>
            ) : (
              <div key={module.key} className="rounded-2xl border border-dashed border-border bg-muted/30 p-5 opacity-70">
                <span className="grid size-10 place-items-center rounded-xl bg-muted text-muted-foreground"><LockKeyhole className="size-5" /></span>
                <h3 className="mt-4 font-semibold">{module.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">Not available for {user?.role}.</p>
              </div>
            );
          })}
        </div>
      </SectionCard>

      <div className="mt-4" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Today's arrivals" value="18" delta="+4 vs yesterday" icon={Truck} tone="primary" to="/vehicle-queue" />
        <StatCard label="Pending arrivals" value="2" delta="Oldest waiting 18 min" icon={Clock3} tone="warning" to="/notifications" />
        <StatCard label="Dock occupancy" value={`${occupied}/8`} delta="3 docks free now" icon={Warehouse} tone="teal" to="/dock-assignment" />
        <StatCard label="Vehicles waiting" value="3" delta="Avg wait 21 min" icon={ListOrdered} tone="danger" to="/vehicle-queue" />
        <StatCard label="Receiving in progress" value="1" delta="D-01 · 62% complete" icon={PackageCheck} tone="success" to="/receiving" />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <SectionCard
          title="Arrival vs receiving throughput"
          description="Vehicles processed per hour — Shift A"
          icon={BarChart3}
          className="xl:col-span-2"
          actions={<span className="rounded-full bg-success-soft px-2.5 py-1 text-[11px] font-semibold text-success">Live</span>}
        >
          <div className="h-[248px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={arrivalTrend} margin={{ left: -22, right: 6, top: 6 }}>
                <defs>
                  <linearGradient id="gA" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gB" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-2)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--color-chart-2)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="hour" tickLine={false} axisLine={false} fontSize={11} stroke="var(--color-muted-foreground)" />
                <YAxis tickLine={false} axisLine={false} fontSize={11} stroke="var(--color-muted-foreground)" />
                <RTooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--color-border)",
                    background: "var(--color-card)",
                    fontSize: 12,
                  }}
                />
                <Area type="monotone" dataKey="arrivals" stroke="var(--color-chart-1)" strokeWidth={2.5} fill="url(#gA)" />
                <Area type="monotone" dataKey="received" stroke="var(--color-chart-2)" strokeWidth={2.5} fill="url(#gB)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Quick actions" description="Frequent warehouse manager tasks" icon={Plus}>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((a) => (
              <Link
                key={a.label}
                to={a.to}
                className="group flex flex-col gap-3 rounded-2xl border border-border/70 bg-muted/40 p-4 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary-soft hover:shadow-soft"
              >
                <span className="grid size-9 place-items-center rounded-xl bg-card text-primary shadow-soft">
                  <a.icon className="size-[18px]" />
                </span>
                <span className="text-sm font-medium">{a.label}</span>
              </Link>
            ))}
          </div>
          <div className="mt-4 rounded-2xl border border-border/70 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Shift receiving target</span>
              <span className="font-semibold tabular-nums">14 / 22</span>
            </div>
            <Progress value={64} className="mt-3 h-2" />
            <p className="mt-2 text-xs text-muted-foreground">64% of planned inbound completed by 09:45.</p>
          </div>
        </SectionCard>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <SectionCard
          title="Live vehicle queue"
          description="Trucks currently inside or awaiting the facility"
          icon={Truck}
          className="xl:col-span-2"
          actions={
            <Button variant="ghost" size="sm" className="rounded-lg" asChild>
              <Link to="/vehicle-queue">
                View all <ArrowUpRight className="size-3.5" />
              </Link>
            </Button>
          }
        >
          <div className="-mx-5 overflow-x-auto px-5">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                  <th className="pb-3 font-medium">Truck</th>
                  <th className="pb-3 font-medium">Vendor</th>
                  <th className="pb-3 font-medium">PO</th>
                  <th className="pb-3 font-medium">Arrival</th>
                  <th className="pb-3 font-medium">Dock</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {arrivals.map((a) => (
                  <tr key={a.id} className="group border-b border-border/60 last:border-0">
                    <td className="py-3">
                      <Link to="/gate-entry" className="font-mono text-[13px] font-semibold text-primary hover:underline">
                        {a.truckNo}
                      </Link>
                      <p className="text-[11px] text-muted-foreground">{a.gateEntryNo}</p>
                    </td>
                    <td className="py-3">
                      <p className="max-w-[190px] truncate">{a.vendor}</p>
                      <p className="text-[11px] text-muted-foreground">{a.transporter}</p>
                    </td>
                    <td className="py-3 font-mono text-xs">{a.po}</td>
                    <td className="py-3 tabular-nums">{a.arrivalTime}</td>
                    <td className="py-3 font-medium">{a.dock ?? "—"}</td>
                    <td className="py-3">
                      <StatusBadge status={a.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard title="Recent activity" description="Gate, dock and receiving events" icon={CircleDot}>
          <Timeline items={activity} />
        </SectionCard>
      </div>
    </AppShell>
  );
}
