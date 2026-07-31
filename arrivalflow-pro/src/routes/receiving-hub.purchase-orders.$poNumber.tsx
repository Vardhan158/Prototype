import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/apps/receiving-hub/shared/PageHeader";
import { StatusChip } from "@/apps/receiving-hub/shared/StatusChip";
import { useWms } from "@/apps/receiving-hub/context/WmsContext";
import { poValue, supplierById, warehouseById } from "@/apps/receiving-hub/data";
import { fmtDate, inr, qty } from "@/apps/receiving-hub/format";

export const Route = createFileRoute("/receiving-hub/purchase-orders/$poNumber")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.poNumber} — Purchase Order | NexusWMS` },
      {
        name: "description",
        content: `Line items, receipt history and receiving actions for purchase order ${params.poNumber}.`,
      },
      { property: "og:title", content: `${params.poNumber} — Purchase Order` },
      {
        property: "og:description",
        content: `Line items and receipt history for ${params.poNumber}.`,
      },
    ],
  }),
  component: PoDetail,
});

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="label-xs">{label}</p>
      <p className="mt-0.5 text-[13px] font-medium">{value}</p>
    </div>
  );
}

function PoDetail() {
  const { poNumber } = Route.useParams();
  const { pos, grns } = useWms();
  const po = pos.find((p) => p.poNumber === poNumber);
  if (!po) throw notFound();

  const supplier = supplierById(po.supplierId);
  const wh = warehouseById(po.warehouseId);
  const history = grns.filter((g) => g.poNumber === po.poNumber);
  const receivable = po.status !== "Closed" && po.status !== "Fully Received";

  return (
    <>
      <PageHeader
        crumbs={[
          { label: "Receiving", to: "/receiving-hub/" },
          { label: "Purchase Orders", to: "/receiving-hub/purchase-orders" },
          { label: po.poNumber },
        ]}
        title={po.poNumber}
        subtitle={`${supplier.name} · raised by ${po.buyer}`}
        actions={
          <>
            <Button variant="outline" className="gap-1.5" onClick={() => window.print()}>
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button disabled={!receivable} asChild={receivable}>
              {receivable ? (
                <Link to="/receiving-hub/grn/new" search={{ po: po.poNumber }}>
                  Receive goods
                </Link>
              ) : (
                <span>Receive goods</span>
              )}
            </Button>
          </>
        }
      />

      <div className="erp-card mb-6 grid gap-6 p-5 md:grid-cols-3">
        <div className="space-y-3">
          <p className="text-[13px] font-semibold">Supplier</p>
          <Field label="Name" value={supplier.name} />
          <Field label="Supplier code" value={supplier.id} />
          <Field label="Contact" value={`${supplier.contact} · ${supplier.email}`} />
          <Field label="GSTIN" value={supplier.gstin} />
        </div>
        <div className="space-y-3">
          <p className="text-[13px] font-semibold">Order</p>
          <Field label="Order date" value={fmtDate(po.orderDate)} />
          <Field label="Expected date" value={fmtDate(po.expectedDate)} />
          <Field label="Warehouse" value={`${wh.id} · ${wh.name}`} />
          <div>
            <p className="label-xs">Status</p>
            <div className="mt-1 flex gap-1.5">
              <StatusChip status={po.status} />
              <StatusChip status={po.priority} />
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <p className="text-[13px] font-semibold">Totals</p>
          <Field label="Lines" value={String(po.lines.length)} />
          <Field label="Order value" value={inr(poValue(po))} />
          <Field
            label="Received value"
            value={inr(po.lines.reduce((s, l) => s + l.receivedQty * l.unitPrice, 0))}
          />
          <Field label="On-time performance" value={`${supplier.onTimePct}%`} />
        </div>
      </div>

      <section className="erp-card mb-6 overflow-hidden">
        <header className="border-b border-border px-5 py-3.5">
          <h2 className="text-[15px] font-semibold">Line Items</h2>
        </header>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead>
              <tr className="bg-surface-muted">
                {["SKU", "Description", "UOM", "Ordered", "Received", "Remaining", "Unit Price", "Line Value"].map((h, i) => (
                  <th
                    key={h}
                    className={`border-b border-border px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground ${i >= 3 ? "text-right" : "text-left"}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {po.lines.map((l) => {
                const remaining = Math.max(0, l.orderedQty - l.receivedQty);
                return (
                  <tr key={l.id} className="border-b border-border last:border-0 hover:bg-surface-muted">
                    <td className="px-5 py-3 font-medium">{l.sku}</td>
                    <td className="px-5 py-3 text-muted-foreground">{l.description}</td>
                    <td className="px-5 py-3 text-muted-foreground">{l.uom}</td>
                    <td className="px-5 py-3 text-right">{qty(l.orderedQty)}</td>
                    <td className="px-5 py-3 text-right">{qty(l.receivedQty)}</td>
                    <td className="px-5 py-3 text-right">
                      <span className={remaining > 0 ? "font-medium text-warning" : "text-success"}>
                        {qty(remaining)}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right text-muted-foreground">{inr(l.unitPrice)}</td>
                    <td className="px-5 py-3 text-right font-medium">{inr(l.unitPrice * l.orderedQty)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="erp-card overflow-hidden">
        <header className="border-b border-border px-5 py-3.5">
          <h2 className="text-[15px] font-semibold">Receipt History</h2>
        </header>
        {history.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-muted-foreground">
            No goods receipts recorded against this purchase order yet.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-muted">
                {["GRN", "Receipt Date", "Dock", "Receiver", "Status"].map((h) => (
                  <th key={h} className="border-b border-border px-5 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {history.map((g) => (
                <tr key={g.id} className="border-b border-border last:border-0 hover:bg-surface-muted">
                  <td className="px-5 py-3">
                    <Link to="/receiving-hub/grn/$id" params={{ id: g.id }} className="font-medium text-primary hover:underline">
                      {g.id}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{fmtDate(g.receiptDate)}</td>
                  <td className="px-5 py-3 text-muted-foreground">{g.dockId}</td>
                  <td className="px-5 py-3 text-muted-foreground">{g.receiver}</td>
                  <td className="px-5 py-3">
                    <div className="flex gap-1.5">
                      <StatusChip status={g.status} />
                      {g.isPartial && <StatusChip status="Partial" />}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </>
  );
}
