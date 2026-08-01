import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, FileText, Repeat2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEED_INVENTORY } from "@/apps/inventory-flow-pro/lib/wms/data";
import { useWms } from "@/apps/inventory-flow-pro/lib/wms/store";
import { STATUS_META, TRANSITIONS } from "@/apps/inventory-flow-pro/lib/wms/statuses";
import {
  Barcode,
  KeyValueGrid,
  LifecycleTimeline,
  PageHeader,
  QrBlock,
  SectionCard,
  StatusChip,
  inr,
  itemValue,
  locationPath,
} from "@/apps/inventory-flow-pro/components/wms/primitives";
import { TransitionDialog } from "@/apps/inventory-flow-pro/components/wms/transition-dialog";

export const Route = createFileRoute("/inventory-flow-pro/inventory/$id")({
  loader: ({ params }) => {
    const seed = SEED_INVENTORY.find((i) => i.id === params.id);
    if (!seed) throw notFound();
    return { id: seed.id, material: seed.materialName };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.id} · ${loaderData.material} | AXIOM WMS` },
          {
            name: "description",
            content: `Full inventory record for ${loaderData.id}: location, batch, serial, supplier documents and lifecycle timeline.`,
          },
          { property: "og:title", content: `${loaderData.id} | AXIOM WMS` },
          { property: "og:description", content: `Lifecycle record for ${loaderData.material}.` },
        ]
      : [{ title: "Record unavailable | AXIOM WMS" }, { name: "robots", content: "noindex" }],
  }),
  component: InventoryDetailScreen,
});

function InventoryDetailScreen() {
  const { id } = Route.useParams();
  const { getItem } = useWms();
  const item = getItem(id) ?? SEED_INVENTORY.find((i) => i.id === id)!;
  const [dialog, setDialog] = useState(false);

  return (
    <>
      <PageHeader
        eyebrow="Screen 4 · Inventory record"
        title={`${item.materialCode} — ${item.materialName}`}
        description={`Record ${item.id} · ${item.quantity} ${item.uom} · ${inr(itemValue(item))} · ${item.warehouse}`}
        actions={
          <>
            <Button variant="outline" size="sm" asChild>
              <Link to="/inventory-flow-pro/inventory">
                <ArrowLeft className="size-4" /> Inventory list
              </Link>
            </Button>
            <Button size="sm" onClick={() => setDialog(true)}>
              <Repeat2 className="size-4" /> Change status
            </Button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <SectionCard title="Material information" subtitle={item.category}>
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <StatusChip status={item.status} size="md" />
              <Badge variant="outline" className="text-[11px]">
                {item.temperature}
              </Badge>
              <Badge variant="outline" className="text-[11px]">
                Age {item.ageDays} days
              </Badge>
            </div>
            <KeyValueGrid
              rows={[
                { label: "Material code", value: item.materialCode },
                { label: "Serial number", value: item.serial },
                { label: "Batch", value: item.batch },
                { label: "Quantity", value: `${item.quantity} ${item.uom}` },
                { label: "Unit value", value: inr(item.unitValue) },
                { label: "Stock value", value: inr(itemValue(item)) },
                { label: "Owner", value: `${item.owner} · ${item.ownerRole}` },
                { label: "Supplier", value: item.supplier },
                { label: "Purchase order", value: item.po },
                { label: "GRN", value: item.grn },
                { label: "Received on", value: new Date(item.receivedOn).toLocaleDateString("en-GB") },
                { label: "Shelf life until", value: new Date(item.expiry).toLocaleDateString("en-GB") },
              ]}
            />
          </SectionCard>

          <SectionCard title="Lifecycle timeline" subtitle="Screen 5 · full audit trail">
            <LifecycleTimeline events={item.events} />
          </SectionCard>
        </div>

        <div className="space-y-4">
          <SectionCard title="Current location" subtitle="Warehouse hierarchy">
            <ol className="space-y-2 text-xs">
              {[
                ["Warehouse", `${item.warehouse} (${item.warehouseCode})`],
                ["Zone", item.zone],
                ["Rack", item.rack],
                ["Shelf", item.shelf],
                ["Bin", item.bin],
              ].map(([k, v]) => (
                <li key={k} className="flex items-center justify-between rounded-lg border border-border bg-muted/40 px-3 py-2">
                  <span className="text-muted-foreground">{k}</span>
                  <span className="num font-medium">{v}</span>
                </li>
              ))}
            </ol>
            <p className="num mt-3 text-[11px] text-muted-foreground">{locationPath(item)}</p>
          </SectionCard>

          <SectionCard title="Identification" subtitle="Barcode & traceability QR">
            <Barcode value={item.serial} />
            <div className="mt-4 flex items-center gap-3">
              <QrBlock value={`${item.id}|${item.batch}`} size={88} />
              <p className="text-[11px] text-muted-foreground">
                Scan to open this record on RF and mobile devices. Encodes record, batch and serial.
              </p>
            </div>
          </SectionCard>

          <SectionCard title="Linked documents">
            <ul className="space-y-2 text-xs">
              {[item.po, item.grn, `INSP-${item.batch}`, `SOP-WM-114`].map((doc) => (
                <li key={doc} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2">
                  <FileText className="size-3.5 text-primary" />
                  <span className="num">{doc}</span>
                </li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard title="Allowed next statuses" subtitle={STATUS_META[item.status].description}>
            <div className="flex flex-wrap gap-1.5">
              {TRANSITIONS[item.status].map((s) => (
                <StatusChip key={s} status={s} />
              ))}
              {TRANSITIONS[item.status].length === 0 && (
                <p className="text-xs text-muted-foreground">Terminal status — lifecycle closed.</p>
              )}
            </div>
          </SectionCard>
        </div>
      </div>

      <TransitionDialog item={item} open={dialog} onOpenChange={setDialog} />
    </>
  );
}
