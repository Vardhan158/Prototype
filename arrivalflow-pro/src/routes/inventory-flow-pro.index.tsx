import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Boxes,
  CircleCheck,
  BookmarkCheck,
  Hand,
  Package,
  Truck,
  MapPinCheck,
  ShieldAlert,
  HeartCrack,
  Biohazard,
  Siren,
  Search,
  LayoutGrid,
  FileBarChart,
  Bell,
  ArrowRight,
  Activity,
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWms } from "@/apps/inventory-flow-pro/lib/wms/store";
import { ACTIVITY_FEED, STATUS_TREND, WAREHOUSES } from "@/apps/inventory-flow-pro/lib/wms/data";
import { STATUS_META, type InventoryStatus } from "@/apps/inventory-flow-pro/lib/wms/statuses";
import {
  MiniBar,
  PageHeader,
  SectionCard,
  StatTile,
  StatusChip,
  ToneChip,
  inr,
  itemValue,
  useSimulatedLoad,
} from "@/apps/inventory-flow-pro/components/wms/primitives";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/inventory-flow-pro/")({
  head: () => ({
    meta: [
      { title: "Inventory Lifecycle Dashboard | AXIOM WMS" },
      {
        name: "description",
        content:
          "Real-time warehouse inventory lifecycle control: stock by status, blocked inventory, reservations, picking, dispatch and audit-ready traceability.",
      },
      { property: "og:title", content: "Inventory Lifecycle Dashboard | AXIOM WMS" },
      {
        property: "og:description",
        content:
          "Track every unit from goods receipt to delivery with status-based movement rules and full traceability.",
      },
    ],
  }),
  component: DashboardScreen,
});

const FUNNEL: InventoryStatus[] = [
  "RECEIVED",
  "UNDER_INSPECTION",
  "AVAILABLE",
  "RESERVED",
  "PICKED",
  "PACKED",
  "LOADED",
  "DISPATCHED",
  "DELIVERED",
];

export function DashboardScreen() {
  const { items, countByStatus, warehouse } = useWms();
  const loading = useSimulatedLoad(500);

  const totalValue = items.reduce((s, i) => s + itemValue(i), 0);
  const blocked = items.filter((i) =>
    ["QUALITY_HOLD", "DAMAGED", "QUARANTINE", "RECALL", "REJECTED"].includes(i.status),
  );
  const blockedValue = blocked.reduce((s, i) => s + itemValue(i), 0);
  const maxFunnel = Math.max(...FUNNEL.map((s) => countByStatus[s]), 1);
  const scope = WAREHOUSES.find((w) => w.code === warehouse);

  const tiles: { status: InventoryStatus; icon: React.ComponentType<{ className?: string }>; to: string }[] = [
    { status: "AVAILABLE", icon: CircleCheck, to: "/inventory-flow-pro/inventory" },
    { status: "RESERVED", icon: BookmarkCheck, to: "/inventory-flow-pro/reservations" },
    { status: "PICKED", icon: Hand, to: "/inventory-flow-pro/picking" },
    { status: "PACKED", icon: Package, to: "/inventory-flow-pro/packing" },
    { status: "DISPATCHED", icon: Truck, to: "/inventory-flow-pro/dispatch" },
    { status: "DELIVERED", icon: MapPinCheck, to: "/inventory-flow-pro/dispatch" },
    { status: "QUALITY_HOLD", icon: ShieldAlert, to: "/inventory-flow-pro/quality-hold" },
    { status: "DAMAGED", icon: HeartCrack, to: "/inventory-flow-pro/damaged" },
    { status: "QUARANTINE", icon: Biohazard, to: "/inventory-flow-pro/quarantine" },
    { status: "RECALL", icon: Siren, to: "/inventory-flow-pro/recall" },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Screen 1 · Inventory status & lifecycle"
        title="Inventory Lifecycle Dashboard"
        description={`Live lifecycle position for ${items.length} tracked line items ${
          scope ? `at ${scope.name}` : "across 4 warehouses"
        }. Status-based rules govern every movement.`}
        actions={
          <>
            <Button variant="outline" size="sm" asChild>
              <Link to="/inventory-flow-pro/inventory">
                <Search className="size-4" /> Search inventory
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/inventory-flow-pro/status-board">
                <LayoutGrid className="size-4" /> Status board
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/inventory-flow-pro/reports">
                <FileBarChart className="size-4" /> Reports
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/inventory-flow-pro/alerts">
                <Bell className="size-4" /> Alerts
              </Link>
            </Button>
          </>
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Total tracked inventory"
          value={items.length}
          unit="lines"
          hint={`${inr(totalValue)} stock value`}
          delta={4.2}
          tone="primary"
          icon={Boxes}
        />
        <StatTile
          label="Unrestricted available"
          value={countByStatus.AVAILABLE}
          unit="lines"
          hint="Allocatable for ATP"
          delta={2.8}
          tone="success"
          icon={CircleCheck}
          to="/inventory-flow-pro/inventory"
        />
        <StatTile
          label="Blocked inventory"
          value={blocked.length}
          unit="lines"
          hint={`${inr(blockedValue)} exposure`}
          delta={-1.6}
          tone="danger"
          icon={ShieldAlert}
          to="/inventory-flow-pro/quality-hold"
        />
        <StatTile
          label="Outbound in flight"
          value={countByStatus.PICKED + countByStatus.PACKED + countByStatus.LOADED + countByStatus.DISPATCHED}
          unit="lines"
          hint="Picked → dispatched"
          delta={6.1}
          tone="teal"
          icon={Truck}
          to="/inventory-flow-pro/dispatch"
        />
      </div>

      <div className="mb-4 grid gap-3 grid-cols-2 lg:grid-cols-5">
        {tiles.map((t) => (
          <Link key={t.status} to={t.to} className="block">
            <div className="glass-panel group flex items-center justify-between gap-2 rounded-xl p-3 transition-all hover:-translate-y-0.5 hover:shadow-elevated">
              <div className="min-w-0">
                <p className="num text-xl font-semibold">{countByStatus[t.status]}</p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {STATUS_META[t.status].label}
                </p>
              </div>
              <StatusChip status={t.status} withIcon />
            </div>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard
          className="lg:col-span-2"
          title="Lifecycle throughput trend"
          subtitle="Line items by lifecycle stage, last 7 weeks"
          actions={
            <Badge variant="outline" className="text-[10px]">
              Live · refreshed 30s ago
            </Badge>
          }
        >
          {loading ? (
            <Skeleton className="h-[260px] w-full" />
          ) : (
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={STATUS_TREND} margin={{ left: -18, right: 8, top: 8 }}>
                  <defs>
                    {[
                      ["gAvail", "var(--success)"],
                      ["gRes", "var(--teal)"],
                      ["gDisp", "var(--primary)"],
                    ].map(([id, color]) => (
                      <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                        <stop offset="100%" stopColor={color} stopOpacity={0.02} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="week" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                  <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                  <Tooltip
                    contentStyle={{
                      background: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="available"
                    stroke="var(--success)"
                    fill="url(#gAvail)"
                    strokeWidth={2}
                    name="Available"
                  />
                  <Area
                    type="monotone"
                    dataKey="reserved"
                    stroke="var(--teal)"
                    fill="url(#gRes)"
                    strokeWidth={2}
                    name="Reserved"
                  />
                  <Area
                    type="monotone"
                    dataKey="dispatched"
                    stroke="var(--primary)"
                    fill="url(#gDisp)"
                    strokeWidth={2}
                    name="Dispatched"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </SectionCard>

        <SectionCard title="Lifecycle funnel" subtitle="Received → delivered conversion">
          <div className="space-y-3">
            {FUNNEL.map((s) => (
              <div key={s}>
                <div className="mb-1 flex items-center justify-between gap-2">
                  <StatusChip status={s} withIcon={false} />
                  <span className="num text-xs font-semibold">{countByStatus[s]}</span>
                </div>
                <MiniBar
                  value={(countByStatus[s] / maxFunnel) * 100}
                  tone={STATUS_META[s].tone}
                />
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <SectionCard
          className="lg:col-span-2"
          title="Recent lifecycle activity"
          subtitle="Audit trail of the last status changes across the module"
          actions={
            <Button variant="ghost" size="sm" asChild>
              <Link to="/inventory-flow-pro/movement-history">
                Full history <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          }
        >
          <ul className="space-y-3">
            {ACTIVITY_FEED.map((a) => (
              <li key={a.id} className="flex items-start gap-3">
                <span className="mt-1 grid size-7 shrink-0 place-items-center rounded-full border border-border bg-muted/60">
                  <Activity className="size-3.5 text-muted-foreground" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm">
                    <span className="font-medium">{a.user}</span>{" "}
                    <span className="text-muted-foreground">{a.action}</span>{" "}
                    <span className="num font-medium text-primary">{a.target}</span>
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {a.role} · {a.time}
                  </p>
                </div>
                <ToneChip tone={a.tone}>{a.time}</ToneChip>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard title="Warehouse utilisation" subtitle="Bin occupancy by site">
          <div className="space-y-4">
            {WAREHOUSES.map((w) => (
              <div key={w.code}>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium">{w.name}</span>
                  <span className="num text-muted-foreground">{w.utilization}%</span>
                </div>
                <p className="mb-1.5 text-[11px] text-muted-foreground">
                  {w.code} · {w.city}
                </p>
                <MiniBar
                  value={w.utilization}
                  tone={w.utilization > 88 ? "danger" : w.utilization > 75 ? "warning" : "success"}
                />
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </>
  );
}
