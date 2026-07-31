import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Microscope, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { KpiCard } from "@/apps/receiving-hub/shared/KpiCard";
import { PageHeader } from "@/apps/receiving-hub/shared/PageHeader";
import { StatusChip } from "@/apps/receiving-hub/shared/StatusChip";
import { useWms } from "@/apps/receiving-hub/context/WmsContext";
import { supplierById } from "@/apps/receiving-hub/data";
import { fmtDate, qty } from "@/apps/receiving-hub/format";

export const Route = createFileRoute("/receiving-hub/quality-inspection")({
  head: () => ({
    meta: [
      { title: "Quality Inspection Queue — NexusWMS" },
      {
        name: "description",
        content:
          "Inspect received lots, record accepted and rejected quantities and release stock for put-away.",
      },
      { property: "og:title", content: "Quality Inspection Queue — NexusWMS" },
      {
        property: "og:description",
        content: "Inspect received lots and release stock for put-away.",
      },
    ],
  }),
  component: QualityInspection,
});

function QualityInspection() {
  const { grns } = useWms();
  const queue = useMemo(
    () => grns.filter((g) => g.status === "Pending Inspection" || g.status === "Pending Approval"),
    [grns],
  );
  const [selectedId, setSelectedId] = useState<string | null>(queue[0]?.id ?? null);
  const selected = queue.find((g) => g.id === selectedId) ?? queue[0] ?? null;
  const [rejects, setRejects] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState("");

  const decide = (accepted: boolean) => {
    if (!selected) return;
    toast[accepted ? "success" : "error"](
      accepted
        ? `${selected.id} inspection passed — released for put-away`
        : `${selected.id} rejected — supplier debit note initiated`,
    );
    setNotes("");
    setRejects({});
  };

  const totalLines = queue.reduce((s, g) => s + g.lines.length, 0);

  return (
    <>
      <PageHeader
        crumbs={[{ label: "Quality", to: "/receiving-hub/" }, { label: "Quality Inspection" }]}
        title="Quality Inspection Queue"
        subtitle="Sampling and disposition of received lots before put-away"
      />

      <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard icon={Microscope} label="Lots awaiting inspection" value={String(queue.length)} caption="Across all warehouses" />
        <KpiCard icon={CheckCircle2} label="Lines to inspect" value={String(totalLines)} tone="info" caption="Sampling plan: AQL 1.0" />
        <KpiCard icon={CheckCircle2} label="First-pass yield" value="96.4%" delta="1.2 pts" deltaGood tone="success" caption="Last 30 days" />
        <KpiCard icon={XCircle} label="Rejections this week" value="14" caption="3 supplier debit notes raised" tone="warning" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="erp-card overflow-hidden">
          <header className="border-b border-border px-5 py-3.5">
            <h2 className="text-[15px] font-semibold">Inspection queue</h2>
          </header>
          <ul className="max-h-[540px] divide-y divide-border overflow-auto">
            {queue.map((g) => (
              <li key={g.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(g.id)}
                  className={`w-full px-5 py-3 text-left transition hover:bg-surface-muted ${selected?.id === g.id ? "bg-primary-subtle" : ""}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[13px] font-medium text-primary">{g.id}</span>
                    <StatusChip status={g.status} />
                  </div>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {supplierById(g.supplierId).name} · {g.lines.length} lines · {fmtDate(g.receiptDate)}
                  </p>
                </button>
              </li>
            ))}
            {queue.length === 0 && (
              <li className="px-5 py-10 text-center text-sm text-muted-foreground">Inspection queue is clear.</li>
            )}
          </ul>
        </section>

        <section className="erp-card p-5 lg:col-span-2">
          {selected ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-[15px] font-semibold">{selected.id}</h2>
                  <p className="text-xs text-muted-foreground">
                    {supplierById(selected.supplierId).name} · Dock {selected.dockId} · {selected.warehouseId}
                  </p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/receiving-hub/grn/$id" params={{ id: selected.id }}>Open receipt</Link>
                </Button>
              </div>

              <table className="mt-4 w-full text-sm">
                <thead>
                  <tr className="bg-surface-muted">
                    {["SKU", "Description", "Received", "Reject Qty", "Accepted"].map((h, i) => (
                      <th key={h} className={`border-b border-border px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground ${i >= 2 ? "text-right" : "text-left"}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {selected.lines.map((l) => {
                    const rej = rejects[l.id] ?? 0;
                    return (
                      <tr key={l.id} className="border-b border-border last:border-0">
                        <td className="px-3 py-2.5 font-medium">{l.sku}</td>
                        <td className="px-3 py-2.5 text-muted-foreground">{l.description}</td>
                        <td className="px-3 py-2.5 text-right">{qty(l.receivedQty)}</td>
                        <td className="px-3 py-2.5 text-right">
                          <Input
                            type="number"
                            min={0}
                            max={l.receivedQty}
                            className="ml-auto h-8 w-24 text-right"
                            value={rej}
                            onChange={(e) =>
                              setRejects((p) => ({
                                ...p,
                                [l.id]: Math.min(l.receivedQty, Math.max(0, Number(e.target.value) || 0)),
                              }))
                            }
                          />
                        </td>
                        <td className="px-3 py-2.5 text-right font-medium">{qty(l.receivedQty - rej)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className="mt-4">
                <Label className="label-xs">Inspection notes</Label>
                <Textarea className="mt-1.5" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Sampling method, observed defects, disposition rationale…" />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button className="gap-1.5" onClick={() => decide(true)}>
                  <CheckCircle2 className="h-4 w-4" />
                  Accept & release for put-away
                </Button>
                <Button variant="outline" className="gap-1.5" onClick={() => decide(false)}>
                  <XCircle className="h-4 w-4 text-danger" />
                  Reject lot
                </Button>
              </div>
            </>
          ) : (
            <p className="py-16 text-center text-sm text-muted-foreground">Nothing awaiting inspection.</p>
          )}
        </section>
      </div>
    </>
  );
}
