import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Boxes, MapPin, PackageCheck, Timer } from "lucide-react";
import { toast } from "sonner";
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
import { supplierById } from "@/apps/receiving-hub/data";
import { fmtDate, qty } from "@/apps/receiving-hub/format";

export const Route = createFileRoute("/receiving-hub/put-away")({
  head: () => ({
    meta: [
      { title: "Put-away Tasks — NexusWMS" },
      {
        name: "description",
        content:
          "Assign storage bins and confirm put-away of inspected goods to complete the dock-to-stock cycle.",
      },
      { property: "og:title", content: "Put-away Tasks — NexusWMS" },
      {
        property: "og:description",
        content: "Assign bins and confirm put-away of inspected goods.",
      },
    ],
  }),
  component: PutAway,
});

const BINS = ["A-01-02-1", "A-03-04-2", "B-02-01-3", "B-05-02-1", "C-01-03-2", "C-04-01-1"];

function PutAway() {
  const { grns } = useWms();
  const [done, setDone] = useState<Record<string, string>>({});

  const tasks = useMemo(
    () =>
      grns
        .filter((g) => g.status === "Completed" || g.status === "Pending Inspection")
        .flatMap((g) =>
          g.lines.map((l) => ({
            key: `${g.id}-${l.id}`,
            grnId: g.id,
            supplier: supplierById(g.supplierId).name,
            date: g.receiptDate,
            warehouseId: g.warehouseId,
            sku: l.sku,
            description: l.description,
            qty: l.receivedQty - l.rejectedQty,
            uom: l.uom,
          })),
        )
        .slice(0, 18),
    [grns],
  );

  const pending = tasks.filter((t) => !done[t.key]);

  return (
    <>
      <PageHeader
        crumbs={[{ label: "Quality & Flow", to: "/receiving-hub/" }, { label: "Put-away" }]}
        title="Put-away Tasks"
        subtitle="Assign storage bins and confirm put-away to close the dock-to-stock cycle"
      />

      <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard icon={Boxes} label="Open put-away tasks" value={String(pending.length)} caption="Across all zones" />
        <KpiCard icon={PackageCheck} label="Confirmed today" value={String(Object.keys(done).length)} tone="success" caption="Bins updated in real time" />
        <KpiCard icon={Timer} label="Avg put-away time" value="52m" delta="4.8%" deltaGood tone="info" caption="vs last week" />
        <KpiCard icon={MapPin} label="Bin utilisation" value="78%" caption="Zone A nearing capacity" tone="warning" />
      </div>

      <section className="erp-card overflow-hidden">
        <header className="border-b border-border px-5 py-3.5">
          <h2 className="text-[15px] font-semibold">Task list</h2>
        </header>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface-muted">
              {["GRN", "SKU", "Description", "Qty", "Warehouse", "Received", "Bin", "Status"].map((h, i) => (
                <th key={h} className={`border-b border-border px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground ${i === 3 ? "text-right" : "text-left"}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tasks.map((t) => (
              <tr key={t.key} className="border-b border-border last:border-0">
                <td className="px-4 py-2.5">
                  <Link to="/receiving-hub/grn/$id" params={{ id: t.grnId }} className="font-medium text-primary hover:underline">{t.grnId}</Link>
                </td>
                <td className="px-4 py-2.5 font-medium">{t.sku}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{t.description}</td>
                <td className="px-4 py-2.5 text-right">{qty(t.qty)} {t.uom}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{t.warehouseId}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{fmtDate(t.date)}</td>
                <td className="px-4 py-2.5">
                  {done[t.key] ? (
                    <span className="font-medium">{done[t.key]}</span>
                  ) : (
                    <Select
                      onValueChange={(bin) => {
                        setDone((p) => ({ ...p, [t.key]: bin }));
                        toast.success(`${t.sku} put away to ${bin}`);
                      }}
                    >
                      <SelectTrigger className="h-8 w-[150px]"><SelectValue placeholder="Assign bin" /></SelectTrigger>
                      <SelectContent>
                        {BINS.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                </td>
                <td className="px-4 py-2.5">
                  {done[t.key] ? <StatusChip status="Completed" /> : <StatusChip status="Open" />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {tasks.length === 0 && (
          <p className="px-5 py-10 text-center text-sm text-muted-foreground">No put-away tasks pending.</p>
        )}
      </section>

      <div className="mt-4 flex justify-end">
        <Button variant="outline" asChild>
          <Link to="/receiving-hub/kpi/dock-to-stock">View dock-to-stock analytics</Link>
        </Button>
      </div>
    </>
  );
}
