import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, Gauge, Rocket, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { KpiCard } from "@/apps/receiving-hub/shared/KpiCard";
import { PageHeader } from "@/apps/receiving-hub/shared/PageHeader";
import { StatusChip } from "@/apps/receiving-hub/shared/StatusChip";
import { useWms } from "@/apps/receiving-hub/context/WmsContext";
import { supplierById, warehouses } from "@/apps/receiving-hub/data";
import { fmtDate, fmtDuration } from "@/apps/receiving-hub/format";

export const Route = createFileRoute("/receiving-hub/kpi/dock-to-stock")({
  head: () => ({
    meta: [
      { title: "Dock-to-Stock Analytics — NexusWMS" },
      {
        name: "description",
        content:
          "Receiving cycle time analytics by stage, supplier and warehouse with SLA breach tracking.",
      },
      { property: "og:title", content: "Dock-to-Stock Analytics — NexusWMS" },
      {
        property: "og:description",
        content: "Receiving cycle time analytics by stage, supplier and warehouse.",
      },
    ],
  }),
  component: DockToStock,
});

const SLA_MINUTES = 240;

function DockToStock() {
  const { grns } = useWms();
  const [warehouse, setWarehouse] = useState("all");

  const completed = useMemo(
    () =>
      grns.filter(
        (g) => g.status === "Completed" && (warehouse === "all" || g.warehouseId === warehouse),
      ),
    [grns, warehouse],
  );

  const cycle = (g: (typeof completed)[number]) =>
    g.stages.gateEntry + g.stages.grn + g.stages.inspection + g.stages.putaway;

  const times = completed.map(cycle).sort((a, b) => a - b);
  const avg = times.length ? times.reduce((s, t) => s + t, 0) / times.length : 0;
  const best = times[0] ?? 0;
  const worst = times[times.length - 1] ?? 0;
  const breaches = times.filter((t) => t > SLA_MINUTES).length;
  const compliance = times.length ? ((times.length - breaches) / times.length) * 100 : 0;

  const stageAvg = ["gateEntry", "grn", "inspection", "putaway"].map((key) => {
    const label = { gateEntry: "Gate Entry", grn: "GRN Posting", inspection: "Quality Inspection", putaway: "Put-away" }[key]!;
    const value = completed.length
      ? completed.reduce((s, g) => s + g.stages[key as keyof typeof g.stages], 0) / completed.length
      : 0;
    return { label, value };
  });
  const stageMax = Math.max(...stageAvg.map((s) => s.value), 1);

  const bySupplier = useMemo(() => {
    const map = new Map<string, { total: number; n: number }>();
    completed.forEach((g) => {
      const cur = map.get(g.supplierId) ?? { total: 0, n: 0 };
      map.set(g.supplierId, { total: cur.total + cycle(g), n: cur.n + 1 });
    });
    return [...map.entries()]
      .map(([id, v]) => ({ id, avg: v.total / v.n, n: v.n }))
      .sort((a, b) => a.avg - b.avg);
  }, [completed]);

  return (
    <>
      <PageHeader
        crumbs={[{ label: "Analytics", to: "/receiving-hub/" }, { label: "Dock-to-Stock" }]}
        title="Dock-to-Stock Cycle Time"
        subtitle={`Target SLA ${fmtDuration(SLA_MINUTES)} from gate entry to put-away confirmation`}
        actions={
          <>
            <Select value={warehouse} onValueChange={setWarehouse}>
              <SelectTrigger className="h-9 w-[200px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All warehouses</SelectItem>
                {warehouses.map((w) => <SelectItem key={w.id} value={w.id}>{w.id} · {w.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => window.print()}>Export</Button>
          </>
        }
      />

      <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard icon={Timer} label="Average cycle time" value={fmtDuration(Math.round(avg))} delta="6.4%" deltaGood caption="vs last week" />
        <KpiCard icon={Gauge} label="SLA compliance" value={`${compliance.toFixed(1)}%`} delta="2.1 pts" deltaGood caption="vs last week" tone="success" />
        <KpiCard icon={Rocket} label="Fastest receipt" value={fmtDuration(best)} caption={`${completed.length} receipts analysed`} tone="info" />
        <KpiCard icon={AlertTriangle} label="SLA breaches" value={String(breaches)} caption={`Slowest ${fmtDuration(worst)}`} tone="warning" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="erp-card p-5 lg:col-span-2">
          <h2 className="text-[15px] font-semibold">Average time by stage</h2>
          <ul className="mt-4 space-y-4">
            {stageAvg.map((s) => (
              <li key={s.label} className="flex items-center gap-3">
                <span className="w-36 text-[13px] font-medium">{s.label}</span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${(s.value / stageMax) * 100}%` }} />
                </div>
                <span className="w-16 text-right text-xs text-muted-foreground">{fmtDuration(Math.round(s.value))}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="erp-card p-5">
          <h2 className="text-[15px] font-semibold">Supplier performance</h2>
          <ul className="mt-4 space-y-3">
            {bySupplier.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-2 text-[13px]">
                <div className="min-w-0">
                  <p className="truncate font-medium">{supplierById(s.id).name}</p>
                  <p className="text-xs text-muted-foreground">{s.n} receipts</p>
                </div>
                <StatusChip
                  status={fmtDuration(Math.round(s.avg))}
                  tone={s.avg > SLA_MINUTES ? "danger" : "success"}
                />
              </li>
            ))}
            {bySupplier.length === 0 && (
              <li className="py-6 text-center text-sm text-muted-foreground">No completed receipts.</li>
            )}
          </ul>
        </section>
      </div>

      <section className="erp-card mt-4 overflow-hidden">
        <header className="border-b border-border px-5 py-3.5">
          <h2 className="text-[15px] font-semibold">Receipt-level cycle times</h2>
        </header>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface-muted">
              {["GRN No", "Supplier", "Date", "Gate Entry", "GRN Posting", "Inspection", "Put-away", "Total", "SLA"].map((h, i) => (
                <th key={h} className={`border-b border-border px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground ${i >= 3 ? "text-right" : "text-left"}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {completed.map((g) => {
              const total = cycle(g);
              return (
                <tr key={g.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-2.5">
                    <Link to="/receiving-hub/grn/$id" params={{ id: g.id }} className="font-medium text-primary hover:underline">{g.id}</Link>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">{supplierById(g.supplierId).name}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{fmtDate(g.receiptDate)}</td>
                  <td className="px-4 py-2.5 text-right">{fmtDuration(g.stages.gateEntry)}</td>
                  <td className="px-4 py-2.5 text-right">{fmtDuration(g.stages.grn)}</td>
                  <td className="px-4 py-2.5 text-right">{fmtDuration(g.stages.inspection)}</td>
                  <td className="px-4 py-2.5 text-right">{fmtDuration(g.stages.putaway)}</td>
                  <td className="px-4 py-2.5 text-right font-medium">{fmtDuration(total)}</td>
                  <td className="px-4 py-2.5 text-right">
                    <StatusChip status={total > SLA_MINUTES ? "Breached" : "Within SLA"} tone={total > SLA_MINUTES ? "danger" : "success"} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </>
  );
}
