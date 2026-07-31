import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Boxes,
  ClipboardCheck,
  CheckCircle2,
  Flame,
  Gauge,
  Layers,
  Map as MapIcon,
  PackageOpen,
  Plus,
  QrCode,
  Truck,
  Warehouse as WarehouseIcon,
  Activity,
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
import { Meter, PageHeader, Panel, StatCard, StatusChip } from "@/apps/warehouse-navigator/components/ui-kit";
import {
  activities,
  crossDocks,
  putAwayTasks,
  spaceSplit,
  totalCapacity,
  totalOccupied,
  utilization,
  utilizationTrend,
  warehouses,
  zoneUtilizationChart,
  zones,
} from "@/apps/warehouse-navigator/data";

export const Route = createFileRoute("/warehouse-navigator/")({
  head: () => ({
    meta: [
      { title: "Warehouse Dashboard | StoreGrid WMS Storage & Locations" },
      {
        name: "description",
        content:
          "Live warehouse storage control centre: capacity, occupancy, put away queue, cross-dock activity and location optimisation across 6 distribution centres.",
      },
      { property: "og:title", content: "Warehouse Dashboard | StoreGrid WMS" },
      {
        property: "og:description",
        content: "Enterprise storage & location management — capacity, occupancy, put away and cross-dock in one control centre.",
      },
    ],
  }),
  component: Dashboard,
});

const QUICK_ACTIONS = [
  { label: "Create Warehouse", to: "/warehouse-navigator/warehouses", icon: Plus, tone: "bg-primary-soft text-primary" },
  { label: "Warehouse Layout", to: "/warehouse-navigator/layout", icon: MapIcon, tone: "bg-secondary-soft text-secondary" },
  { label: "Storage Map", to: "/warehouse-navigator/visualization", icon: Boxes, tone: "bg-info-soft text-primary" },
  { label: "Pending Put Away", to: "/warehouse-navigator/put-away", icon: ClipboardCheck, tone: "bg-warning-soft text-warning" },
  { label: "Generate QR", to: "/warehouse-navigator/bins", icon: QrCode, tone: "bg-success-soft text-success" },
  { label: "Heat Map", to: "/warehouse-navigator/heat-map", icon: Flame, tone: "bg-danger-soft text-danger" },
];

const activityTone: Record<string, string> = {
  putaway: "bg-success-soft text-success",
  zone: "bg-primary-soft text-primary",
  alert: "bg-warning-soft text-warning",
  crossdock: "bg-secondary-soft text-secondary",
  inventory: "bg-info-soft text-primary",
};

function Dashboard() {
  const pending = putAwayTasks.filter((t) => t.status !== "Completed" && t.status !== "Confirmed").length;
  const completed = putAwayTasks.filter((t) => t.status === "Completed" || t.status === "Confirmed").length;
  const available = totalCapacity - totalOccupied;

  return (
    <>
      <PageHeader
        eyebrow="Storage & Location Management"
        title="Warehouse Control Centre"
        subtitle="Network-wide storage hierarchy, occupancy telemetry and put away execution — refreshed every 30 seconds from the WCS event stream."
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-1.5" asChild>
              <Link to="/warehouse-navigator/reports">
                <Gauge className="h-4 w-4" /> Reports
              </Link>
            </Button>
            <Button size="sm" className="gap-1.5" asChild>
              <Link to="/warehouse-navigator/recommendation">
                <PackageOpen className="h-4 w-4" /> Run slotting engine
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Warehouses" value={warehouses.length} icon={WarehouseIcon} delta={0} footer="5 operational · 1 in maintenance" to="/warehouse-navigator/warehouses" />
        <StatCard label="Total Zones" value={zones.length} icon={Layers} tone="secondary" delta={9} footer="42 aisles · 318 racks" to="/warehouse-navigator/zones" />
        <StatCard label="Available Capacity" value={available.toLocaleString()} unit="units" icon={PackageOpen} tone="success" delta={-4} footer={`of ${totalCapacity.toLocaleString()} total`} to="/warehouse-navigator/capacity" />
        <StatCard label="Occupied Capacity" value={totalOccupied.toLocaleString()} unit="units" icon={Boxes} tone="primary" delta={6} footer="11,400 units reserved" to="/warehouse-navigator/capacity" />
        <StatCard label="Pending Put Away" value={pending} icon={ClipboardCheck} tone="warning" delta={12} footer="4 tasks breaching SLA" to="/warehouse-navigator/put-away" />
        <StatCard label="Put Away Completed" value={completed} icon={CheckCircle2} tone="success" delta={18} footer="Today · avg 4.9 min / task" to="/warehouse-navigator/reports" />
        <StatCard label="Cross Dock Shipments" value={crossDocks.length} icon={Truck} tone="secondary" delta={3} footer="93 pallets flow-through" to="/warehouse-navigator/cross-dock" />
        <StatCard label="Warehouse Utilisation" value={`${utilization}%`} icon={Gauge} tone={utilization > 78 ? "danger" : "primary"} delta={2} footer="Target band 72–78%" to="/warehouse-navigator/capacity" />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Panel
          className="xl:col-span-2"
          title="Network utilisation & put away throughput"
          description="Rolling 7 days · all warehouses"
          action={<StatusChip className="bg-success-soft text-success">Live</StatusChip>}
        >
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={utilizationTrend} margin={{ left: -18, right: 6, top: 6 }}>
                <defs>
                  <linearGradient id="gU" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="gP" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-secondary)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="var(--color-secondary)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
                <YAxis tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--color-border)",
                    background: "var(--color-surface)",
                    fontSize: 12,
                  }}
                />
                <Area type="monotone" dataKey="utilization" name="Utilisation %" stroke="var(--color-primary)" strokeWidth={2.5} fill="url(#gU)" />
                <Area type="monotone" dataKey="putAway" name="Put away tasks" stroke="var(--color-secondary)" strokeWidth={2.5} fill="url(#gP)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Space allocation" description="Occupied vs reserved vs free">
          <div className="h-[190px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={spaceSplit} dataKey="value" nameKey="name" innerRadius={52} outerRadius={78} paddingAngle={3} strokeWidth={0}>
                  {spaceSplit.map((s) => (
                    <Cell key={s.name} fill={s.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--color-border)",
                    background: "var(--color-surface)",
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">
            {spaceSplit.map((s) => (
              <div key={s.name} className="flex items-center justify-between gap-2 text-[12px]">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ background: s.color }} />
                  {s.name}
                </span>
                <span className="num font-semibold">{s.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Panel title="Quick actions" description="Most used storage operations">
          <div className="grid grid-cols-2 gap-2.5">
            {QUICK_ACTIONS.map((a) => (
              <Link
                key={a.label}
                to={a.to}
                className="group rounded-2xl border border-border bg-surface/70 p-3 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:elev-2"
              >
                <span className={`grid h-9 w-9 place-items-center rounded-xl ${a.tone}`}>
                  <a.icon className="h-4.5 w-4.5" />
                </span>
                <span className="mt-2.5 block text-[12px] font-semibold">{a.label}</span>
                <span className="mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground">
                  Open <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </Panel>

        <Panel title="Zone utilisation" description="WH-CHN-01 Chennai Central DC">
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={zoneUtilizationChart} margin={{ left: -22, right: 6, top: 6 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
                <YAxis tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--color-border)",
                    background: "var(--color-surface)",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="utilization" name="Utilisation %" radius={[6, 6, 0, 0]}>
                  {zoneUtilizationChart.map((z) => (
                    <Cell
                      key={z.name}
                      fill={z.utilization >= 95 ? "var(--color-danger)" : z.utilization >= 75 ? "var(--color-warning)" : "var(--color-success)"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel
          title="Recent activities"
          description="Storage & location audit trail"
          action={
            <Button variant="ghost" size="sm" className="h-7 text-[11px]" asChild>
              <Link to="/warehouse-navigator/reports">View all</Link>
            </Button>
          }
          bodyClassName="p-0"
        >
          <div className="max-h-[280px] divide-y divide-border overflow-y-auto">
            {activities.map((a) => (
              <div key={a.id} className="flex gap-3 px-4 py-3">
                <span className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg ${activityTone[a.kind]}`}>
                  <Activity className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0">
                  <p className="text-[12px] leading-snug">
                    <span className="font-semibold">{a.actor}</span> {a.action}
                  </p>
                  <p className="mt-0.5 truncate text-[11px] font-medium text-primary">{a.target}</p>
                  <p className="text-[10px] text-muted-foreground">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {warehouses.slice(0, 6).map((w) => {
          const pct = Math.round((w.occupied / w.capacity) * 100);
          return (
            <Link key={w.id} to="/warehouse-navigator/warehouses/$code" params={{ code: w.code }} className="glass-panel block p-4 transition-all hover:-translate-y-0.5 hover:elev-3">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-bold">{w.name}</p>
                  <p className="truncate text-[11px] text-muted-foreground">{w.code} · {w.city}</p>
                </div>
                <StatusChip className={w.status === "Operational" ? "bg-success-soft text-success" : "bg-warning-soft text-warning"}>
                  {w.status}
                </StatusChip>
              </div>
              <div className="mt-3">
                <Meter value={pct} showLabel />
                <p className="num mt-1.5 text-[11px] text-muted-foreground">
                  {w.occupied.toLocaleString()} / {w.capacity.toLocaleString()} units · {w.docks} docks
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}
