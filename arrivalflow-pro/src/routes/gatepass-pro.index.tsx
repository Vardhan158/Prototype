import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight,
  Bell,
  CalendarClock,
  CircleUser,
  ClipboardCheck,
  LogOut,
  Plus,
  RefreshCw,
  Truck,
  Wifi,
  WifiOff,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/apps/gatepass-pro/components/wms/AppShell";
import { StatusChip } from "@/apps/gatepass-pro/components/wms/StatusChip";
import { Skeleton } from "@/components/ui/skeleton";
import { useWms } from "@/apps/gatepass-pro/lib/wms/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/gatepass-pro/")({
  head: () => ({
    meta: [
      { title: "Gate Dashboard — GateFlow WMS" },
      { name: "description", content: "Live gate dashboard: today's trucks, vehicles inside, pending approvals and recent gate activity." },
      { property: "og:title", content: "Gate Dashboard — GateFlow WMS" },
      { property: "og:description", content: "Track today's trucks, vehicles inside the yard and pending approvals at a glance." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { entries, officer, online, setOnline, notifications } = useWms();
  const navigate = useNavigate();
  const [refreshing, setRefreshing] = useState(false);

  const inside = entries.filter((e) => ["Approved", "Waiting Warehouse", "Accepted"].includes(e.status));
  const pending = entries.filter((e) => ["Hold", "Waiting Warehouse"].includes(e.status));
  const rejected = entries.filter((e) => e.status === "Rejected");
  const unread = notifications.filter((n) => !n.read).length;

  const refresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      toast.success("Synced with SAP EWM", { description: `${entries.length} entries up to date` });
    }, 1000);
  };

  const stats = [
    { label: "Today's Trucks", value: entries.length, tone: "text-primary" },
    { label: "Inside Vehicles", value: inside.length, tone: "text-secondary" },
    { label: "Pending Trucks", value: pending.length, tone: "text-warning" },
    { label: "Rejected", value: rejected.length, tone: "text-destructive" },
  ];

  const tiles = [
    { to: "/gatepass-pro/gate-entry/vehicle", label: "New Gate Entry", desc: "Scan truck & driver", icon: Plus, primary: true },
    { to: "/gatepass-pro/approvals", label: "Pending Approval", desc: `${pending.length} awaiting action`, icon: ClipboardCheck, primary: false },
    { to: "/gatepass-pro/entries", label: "Today's Entries", desc: `${entries.length} records`, icon: CalendarClock, primary: false },
    { to: "/gatepass-pro/exit", label: "Vehicle Exit", desc: "Verify & release", icon: LogOut, primary: false },
    { to: "/gatepass-pro/notifications", label: "Notifications", desc: `${unread} unread`, icon: Bell, primary: false },
    { to: "/gatepass-pro/profile", label: "Profile", desc: officer.empId, icon: CircleUser, primary: false },
  ] as const;

  return (
    <AppShell
      title={`Hi, ${officer.name.split(" ")[0]}`}
      subtitle={`${officer.gate} · ${officer.shift}`}
      action={
        <div className="flex items-center gap-1">
          <button
            aria-label="Toggle connectivity"
            onClick={() => setOnline(!online)}
            className="grid size-10 place-items-center rounded-full active:bg-white/15"
          >
            {online ? <Wifi className="size-5" /> : <WifiOff className="size-5" />}
          </button>
          <button
            aria-label="Refresh"
            onClick={refresh}
            className="grid size-10 place-items-center rounded-full active:bg-white/15"
          >
            <RefreshCw className={cn("size-5", refreshing && "animate-spin")} />
          </button>
        </div>
      }
    >
      <section className="mb-5 grid grid-cols-2 gap-3">
        {stats.map((s) =>
          refreshing ? (
            <Skeleton key={s.label} className="h-[86px] rounded-2xl" />
          ) : (
            <div key={s.label} className="card-elevated p-4">
              <p className={cn("text-3xl font-extrabold tabular-nums", s.tone)}>{s.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
            </div>
          ),
        )}
      </section>

      <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Gate Operations</h2>
      <section className="mb-6 grid gap-3">
        {tiles.map((t) => (
          <Link
            key={t.to}
            to={t.to}
            className={cn(
              "card-elevated flex items-center gap-4 p-4 transition-transform active:scale-[0.985]",
              t.primary && "bg-primary text-primary-foreground",
            )}
          >
            <span
              className={cn(
                "grid size-12 shrink-0 place-items-center rounded-2xl",
                t.primary ? "bg-white/20" : "bg-accent text-accent-foreground",
              )}
            >
              <t.icon className="size-6" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-base font-semibold">{t.label}</span>
              <span className={cn("block text-xs", t.primary ? "text-primary-foreground/75" : "text-muted-foreground")}>
                {t.desc}
              </span>
            </span>
            <ArrowRight className="size-5 opacity-60" />
          </Link>
        ))}
      </section>

      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-muted-foreground">Recent Activities</h2>
        <Link to="/gatepass-pro/entries" className="text-xs font-semibold text-primary">
          View all
        </Link>
      </div>
      <section className="grid gap-2.5">
        {entries.slice(0, 4).map((e) => (
          <Link
            key={e.id}
            to="/gatepass-pro/entry/$id"
            params={{ id: e.id }}
            className="card-elevated flex items-center gap-3 p-3.5"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-surface-2">
              {e.status === "Rejected" ? (
                <XCircle className="size-5 text-destructive" />
              ) : (
                <Truck className="size-5 text-primary" />
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold">{e.vehicle.number}</span>
              <span className="block truncate text-xs text-muted-foreground">
                {e.delivery.vendor} · {e.arrival}
              </span>
            </span>
            <StatusChip status={e.status} />
          </Link>
        ))}
      </section>

      <button
        onClick={() => navigate({ to: "/gatepass-pro/gate-entry/vehicle" })}
        className="fixed bottom-24 right-1/2 z-30 flex h-16 items-center gap-2 rounded-2xl bg-secondary px-5 text-base font-bold text-secondary-foreground shadow-[var(--shadow-card)] active:scale-95 md:absolute md:bottom-24 md:right-5 md:translate-x-0"
        style={{ transform: "translateX(50%)" }}
      >
        <Plus className="size-6" /> New Entry
      </button>
    </AppShell>
  );
}
