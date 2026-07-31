import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/apps/receiving-hub/shared/PageHeader";
import { StatusChip } from "@/apps/receiving-hub/shared/StatusChip";
import { useWms } from "@/apps/receiving-hub/context/WmsContext";
import { supplierById, warehouseById } from "@/apps/receiving-hub/data";
import { fmtDate, fmtDateTime, fmtDuration, qty } from "@/apps/receiving-hub/format";

export const Route = createFileRoute("/receiving-hub/grn/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.id} — Goods Receipt Note | NexusWMS` },
      {
        name: "description",
        content: `Line items, serials, batches, discrepancies and timeline for goods receipt ${params.id}.`,
      },
      { property: "og:title", content: `${params.id} — Goods Receipt Note` },
      {
        property: "og:description",
        content: `Receipt detail for ${params.id}.`,
      },
    ],
  }),
  component: GrnDetail,
});

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="label-xs">{label}</p>
      <p className="mt-0.5 text-[13px] font-medium">{value}</p>
    </div>
  );
}

function GrnDetail() {
  const { id } = Route.useParams();
  const { grns, discrepancies } = useWms();
  const grn = grns.find((g) => g.id === id);
  if (!grn) throw notFound();

  const supplier = supplierById(grn.supplierId);
  const wh = warehouseById(grn.warehouseId);
  const linked = discrepancies.filter((d) => d.grnId === grn.id);
  const stages = [
    { name: "Gate Entry", minutes: grn.stages.gateEntry },
    { name: "GRN", minutes: grn.stages.grn },
    { name: "Inspection", minutes: grn.stages.inspection },
    { name: "Put-away", minutes: grn.stages.putaway },
  ];
  const total = stages.reduce((s, x) => s + x.minutes, 0);

  return (
    <>
      <PageHeader
        crumbs={[
          { label: "Receiving", to: "/receiving-hub/" },
          { label: "Goods Receipts", to: "/receiving-hub/grn" },
          { label: grn.id },
        ]}
        title={grn.id}
        subtitle={`${supplier.name} · ${grn.poNumber ?? "Non-PO receipt"} · ${fmtDate(grn.receiptDate)}`}
        actions={
          <>
            <div className="mr-1 flex gap-1.5">
              <StatusChip status={grn.status} />
              {grn.isPartial && <StatusChip status="Partial" />}
              {grn.nonPoReason && <StatusChip status="Non-PO" tone="info" />}
            </div>
            <Button variant="outline" className="gap-1.5" onClick={() => window.print()}>
              <Printer className="h-4 w-4" />
              Print GRN
            </Button>
          </>
        }
      />

      <Tabs defaultValue="overview">
        <TabsList className="mb-4">
          {["overview", "lines", "tracking", "discrepancies", "timeline", "documents"].map((t) => (
            <TabsTrigger key={t} value={t} className="capitalize">
              {t === "lines" ? "Line Items" : t === "tracking" ? "Serials & Batches" : t}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview">
          <div className="erp-card grid gap-5 p-5 md:grid-cols-4">
            <Field label="Supplier" value={`${supplier.id} · ${supplier.name}`} />
            <Field label="Warehouse" value={`${wh.id} · ${wh.name}`} />
            <Field label="Dock" value={grn.dockId} />
            <Field label="Receiver" value={grn.receiver} />
            <Field label="Vehicle" value={grn.vehicleNo} />
            <Field label="Driver" value={`${grn.driverName} · ${grn.driverPhone}`} />
            <Field label="Transporter" value={grn.transporter} />
            <Field label="Invoice / DC" value={grn.invoiceNo} />
            <Field label="Gate entry" value={grn.gateEntryNo} />
            <Field label="Gate entry time" value={fmtDateTime(grn.gateEntryTime)} />
            {grn.nonPoReason && <Field label="Non-PO reason" value={grn.nonPoReason} />}
            <Field label="Remarks" value={grn.remarks || "—"} />
          </div>
          {grn.approval && (
            <div className="erp-card mt-4 border-success/30 bg-success-subtle p-4 text-[13px]">
              <p className="font-medium text-success">Supervisor approved</p>
              <p className="mt-1 text-muted-foreground">
                {grn.approval.supervisor} · {fmtDateTime(grn.approval.at)} — {grn.approval.note}
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="lines">
          <div className="erp-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-muted">
                  {["SKU", "Description", "UOM", "Ordered", "Received", "Rejected", "Remaining"].map((h, i) => (
                    <th key={h} className={`border-b border-border px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground ${i >= 3 ? "text-right" : "text-left"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {grn.lines.map((l) => (
                  <tr key={l.id} className="border-b border-border last:border-0">
                    <td className="px-5 py-3 font-medium">{l.sku}</td>
                    <td className="px-5 py-3 text-muted-foreground">{l.description}</td>
                    <td className="px-5 py-3 text-muted-foreground">{l.uom}</td>
                    <td className="px-5 py-3 text-right">{qty(l.orderedQty)}</td>
                    <td className="px-5 py-3 text-right">{qty(l.receivedQty)}</td>
                    <td className="px-5 py-3 text-right">{qty(l.rejectedQty)}</td>
                    <td className="px-5 py-3 text-right">
                      {qty(Math.max(0, l.orderedQty - l.previouslyReceived - l.receivedQty))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="tracking">
          <div className="erp-card p-5">
            {grn.serials.length === 0 && grn.batches.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No serial or batch data captured for this receipt.
              </p>
            ) : (
              <div className="space-y-5">
                {grn.serials.map((s) => (
                  <div key={s.lineId}>
                    <p className="label-xs mb-2">{s.lineId} — {s.serials.length} serials</p>
                    <div className="flex flex-wrap gap-1.5">
                      {s.serials.map((x) => (
                        <span key={x} className="rounded-md border border-border bg-surface-muted px-2 py-1 text-xs">{x}</span>
                      ))}
                    </div>
                  </div>
                ))}
                {grn.batches.length > 0 && (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-surface-muted">
                        {["Batch No", "Mfg Date", "Expiry", "Qty"].map((h) => (
                          <th key={h} className="border-b border-border px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {grn.batches.map((b) => (
                        <tr key={b.id} className="border-b border-border last:border-0">
                          <td className="px-3 py-2 font-medium">{b.batchNo}</td>
                          <td className="px-3 py-2 text-muted-foreground">{fmtDate(b.mfgDate)}</td>
                          <td className="px-3 py-2 text-muted-foreground">{fmtDate(b.expiryDate)}</td>
                          <td className="px-3 py-2">{qty(b.qty)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="discrepancies">
          <div className="erp-card p-5">
            {linked.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No discrepancies linked to this receipt.</p>
            ) : (
              <ul className="space-y-3">
                {linked.map((d) => (
                  <li key={d.id} className="flex items-start justify-between gap-3 rounded-lg border border-border p-3">
                    <div>
                      <p className="text-[13px] font-medium text-primary">{d.id} · {d.type}</p>
                      <p className="text-xs text-muted-foreground">{d.sku} — {d.description}</p>
                    </div>
                    <div className="flex gap-1.5">
                      <StatusChip status={d.severity} />
                      <StatusChip status={d.status} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <Button variant="outline" size="sm" className="mt-4" asChild>
              <Link to="/receiving-hub/discrepancies">Open discrepancy register</Link>
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="timeline">
          <div className="erp-card p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-semibold">Dock-to-Stock Timeline</h2>
              <span className="rounded-lg bg-primary-subtle px-2.5 py-1 text-xs font-medium text-primary">
                Total {fmtDuration(total)}
              </span>
            </div>
            <ul className="mt-4 space-y-4">
              {stages.map((s) => (
                <li key={s.name} className="flex items-center gap-3">
                  <span className="w-24 text-[13px] font-medium">{s.name}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <div className="h-full bg-primary" style={{ width: `${total ? (s.minutes / total) * 100 : 0}%` }} />
                  </div>
                  <span className="w-16 text-right text-xs text-muted-foreground">
                    {s.minutes ? fmtDuration(s.minutes) : "Pending"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </TabsContent>

        <TabsContent value="documents">
          <div className="erp-card p-5">
            <ul className="space-y-2 text-[13px]">
              {[`Invoice ${grn.invoiceNo}`, `Gate pass ${grn.gateEntryNo}`, "Packing list", "Test certificate"].map((d) => (
                <li key={d} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                  <span>{d}</span>
                  <Button variant="ghost" size="sm" className="h-7">Download</Button>
                </li>
              ))}
            </ul>
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}
