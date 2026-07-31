import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  CheckCircle2,
  Clock,
  FileWarning,
  Microscope,
  PackageSearch,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { KpiCard } from "@/apps/receiving-hub/shared/KpiCard";
import { PageHeader } from "@/apps/receiving-hub/shared/PageHeader";
import { StatusChip } from "@/apps/receiving-hub/shared/StatusChip";
import { useWms } from "@/apps/receiving-hub/context/WmsContext";
import { supplierById, warehouseById } from "@/apps/receiving-hub/data";
import { fmtDate, fmtDuration } from "@/apps/receiving-hub/format";

export const Route = createFileRoute("/receiving-hub/")({
  head: () => ({
    meta: [
      { title: "Receiving Dashboard — NexusWMS" },
      {
        name: "description",
        content:
          "Live receiving KPIs, expected inbound shipments, dock utilisation and open discrepancies.",
      },
      { property: "og:title", content: "Receiving Dashboard — NexusWMS" },
      {
        property: "og:description",
        content:
          "Live receiving KPIs, expected inbound shipments, dock utilisation and open discrepancies.",
      },
    ],
  }),
  component: Dashboard,
});

const ACTIVITY = [
  { text: "GRN-2026-0348 completed for Finolex Cables Ltd", time: "12 min ago", dot: "bg-success" },
  { text: "DSC-2026-0023 raised — quantity mismatch on PO-2026-00431", time: "48 min ago", dot: "bg-danger" },
  { text: "Gate entry GE-2026-1195 recorded at Dock A2", time: "1 h ago", dot: "bg-info" },
  { text: "GRN-2026-0346 sent to quality inspection", time: "2 h ago", dot: "bg-warning" },
  { text: "Non-PO receipt GRN-2026-0340 awaiting approval", time: "4 h ago", dot: "bg-warning" },
] as const;

const STAGE_AVG = [
  { name: "Gate Entry", minutes: 36, color: "bg-info" },
  { name: "GRN", minutes: 62, color: "bg-primary" },
  { name: "Inspection", minutes: 79, color: "bg-warning" },
  { name: "Put-away", minutes: 60, color: "bg-success" },
];

function Dashboard() {
  const { pos, grns, discrepancies, activeWarehouse } = useWms();
  const wh = warehouseById(activeWarehouse);

  const expected = pos
    .filter((p) => p.status === "Open" || p.status === "Overdue" || p.status === "Partially Received")
    .slice(0, 6);
  const pendingInspection = grns.filter((g) => g.status === "Pending Inspection").length;
  const completed = grns.filter((g) => g.status === "Completed").length;
  const openDsc = discrepancies.filter((d) => d.status !== "Resolved");
  const totalCycle = STAGE_AVG.reduce((s, x) => s + x.minutes, 0);

  return (
    <>
      <PageHeader
        crumbs={[{ label: "Receiving" }, { label: "Dashboard" }]}
        title="Receiving Dashboard"
        subtitle={`${wh.id} · ${wh.name} — operational snapshot for ${fmtDate("2026-07-31")}`}
        actions={
          <>
            <Button variant="outline" asChild>
              <Link to="/receiving-hub/purchase-orders">Browse purchase orders</Link>
            </Button>
            <Button asChild>
              <Link to="/receiving-hub/grn/new">New goods receipt</Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Pending Receipts" value="18" delta="12%" deltaGood caption="vs. 16 last week" icon={PackageSearch} tone="primary" />
        <KpiCard label="Completed GRNs (MTD)" value="142" delta="8%" deltaGood caption={`${completed} completed in this session`} icon={CheckCircle2} tone="success" />
        <KpiCard label="Pending Inspection" value={String(pendingInspection || 7)} delta="3%" caption="Target: under 5 open lots" icon={Microscope} tone="warning" />
        <KpiCard label="Avg Dock-to-Stock" value={fmtDuration(totalCycle)} delta="9%" caption="Target 4h 30m — trending down" icon={Clock} tone="info" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2 space-y-6">
          <section className="erp-card overflow-hidden">
            <header className="flex items-center justify-between border-b border-border px-5 py-3.5">
              <div>
                <h2 className="text-[15px] font-semibold">Today's Expected Receipts</h2>
                <p className="text-xs text-muted-foreground">Inbound shipments scheduled against open purchase orders</p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to="/receiving-hub/purchase-orders">View all</Link>
              </Button>
            </header>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead>
                  <tr className="bg-surface-muted">
                    {["PO Number", "Supplier", "Expected", "Dock", "Status", ""].map((h) => (
                      <th key={h} className="border-b border-border px-5 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {expected.map((po, i) => (
                    <tr key={po.poNumber} className="border-b border-border last:border-0 hover:bg-surface-muted">
                      <td className="px-5 py-3">
                        <Link to="/receiving-hub/purchase-orders/$poNumber" params={{ poNumber: po.poNumber }} className="font-medium text-primary hover:underline">
                          {po.poNumber}
                        </Link>
                      </td>
                      <td className="px-5 py-3">{supplierById(po.supplierId).name}</td>
                      <td className="px-5 py-3 text-muted-foreground">{fmtDate(po.expectedDate)}</td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {warehouseById(po.warehouseId).docks[i % 3]?.name ?? "—"}
                      </td>
                      <td className="px-5 py-3"><StatusChip status={po.status} /></td>
                      <td className="px-5 py-3 text-right">
                        <Button size="sm" className="h-8" asChild>
                          <Link to="/receiving-hub/grn/new" search={{ po: po.poNumber }}>Receive</Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="erp-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[15px] font-semibold">Dock-to-Stock Stage Averages</h2>
                <p className="text-xs text-muted-foreground">Average minutes per stage across the last 30 receipts</p>
              </div>
              <span className="rounded-lg bg-primary-subtle px-2.5 py-1 text-xs font-medium text-primary">
                Total {fmtDuration(totalCycle)}
              </span>
            </div>
            <div className="mt-4 flex h-3 overflow-hidden rounded-full">
              {STAGE_AVG.map((s) => (
                <div key={s.name} className={s.color} style={{ width: `${(s.minutes / totalCycle) * 100}%` }} />
              ))}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {STAGE_AVG.map((s) => (
                <div key={s.name} className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${s.color}`} />
                  <span className="text-xs text-muted-foreground">{s.name}</span>
                  <span className="text-xs font-medium">{fmtDuration(s.minutes)}</span>
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" className="mt-4" asChild>
              <Link to="/receiving-hub/kpi/dock-to-stock">Open KPI analysis</Link>
            </Button>
          </section>
        </div>

        <div className="space-y-6">
          <section className="erp-card p-5">
            <h2 className="text-[15px] font-semibold">Dock Utilization</h2>
            <p className="text-xs text-muted-foreground">{wh.name}</p>
            <ul className="mt-4 space-y-3">
              {wh.docks.map((d) => (
                <li key={d.id}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium">{d.name}</span>
                    <StatusChip status={d.status} />
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className={d.utilization > 80 ? "h-full bg-danger" : d.utilization > 50 ? "h-full bg-warning" : "h-full bg-primary"}
                      style={{ width: `${d.utilization}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="erp-card p-5">
            <h2 className="flex items-center gap-2 text-[15px] font-semibold">
              <Activity className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
              Recent Activity
            </h2>
            <ul className="mt-4 space-y-3.5">
              {ACTIVITY.map((a) => (
                <li key={a.text} className="flex gap-3">
                  <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${a.dot}`} />
                  <div>
                    <p className="text-[13px] leading-snug">{a.text}</p>
                    <p className="text-[11px] text-muted-foreground">{a.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="erp-card p-5">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-[15px] font-semibold">
                <FileWarning className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
                Open Discrepancies
              </h2>
              <span className="rounded-full bg-danger-subtle px-2 py-0.5 text-xs font-semibold text-danger">
                {openDsc.length}
              </span>
            </div>
            <ul className="mt-4 space-y-3">
              {openDsc.slice(0, 4).map((d) => (
                <li key={d.id} className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[13px] font-medium">{d.id}</p>
                    <p className="text-[11px] text-muted-foreground">{d.type} · {d.sku}</p>
                  </div>
                  <StatusChip status={d.severity} />
                </li>
              ))}
            </ul>
            <Button variant="outline" size="sm" className="mt-4 w-full" asChild>
              <Link to="/receiving-hub/discrepancies">Manage discrepancies</Link>
            </Button>
          </section>
        </div>
      </div>
    </>
  );
}
