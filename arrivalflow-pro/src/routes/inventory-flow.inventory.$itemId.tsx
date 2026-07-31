import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  Barcode,
  Boxes,
  Building2,
  CalendarClock,
  FileText,
  Layers,
  Lock,
  MapPin,
  Ruler,
  ShieldAlert,
  Truck,
} from "lucide-react";

import { PageHeader } from "@/apps/inventory-flow/components/PageHeader";
import { SectionCard } from "@/apps/inventory-flow/components/SectionCard";
import { StatusBadge } from "@/apps/inventory-flow/components/StatusBadge";
import { DataTable, type Column } from "@/apps/inventory-flow/components/DataTable";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatNumber, getItem, transactions } from "@/apps/inventory-flow/lib/data";
import type { Transaction } from "@/apps/inventory-flow/lib/types";
import { exportRows } from "@/apps/inventory-flow/lib/export";

export const Route = createFileRoute("/inventory-flow/inventory/$itemId")({
  loader: ({ params }) => {
    const item = getItem(params.itemId);
    if (!item) throw notFound();
    return { item };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Material not found — VoltCore WMS" }, { name: "robots", content: "noindex" }],
      };
    }
    const { item } = loaderData;
    const title = `${item.materialName} (${item.materialCode}) — VoltCore WMS`;
    const description = `Stock detail for ${item.materialName} in ${item.warehouse}: availability, reservations, batch and serial traceability.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: InventoryDetail,
});

function Fact({ icon: Icon, label, value }: { icon: typeof Boxes; label: string; value: string }) {
  return (
    <div className="flex min-w-0 items-start gap-2.5">
      <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground">
        <Icon className="size-3.5" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] tracking-wide text-muted-foreground uppercase">{label}</p>
        <p className="truncate text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

function QtyTile({ label, value, uom, tone }: { label: string; value: number; uom: string; tone: string }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <p className="text-[11px] tracking-wide text-muted-foreground uppercase">{label}</p>
      <p className="num mt-1 text-xl font-semibold" style={{ color: `var(--color-status-${tone})` }}>
        {formatNumber(value)}
      </p>
      <p className="text-[11px] text-muted-foreground">{uom}</p>
    </div>
  );
}

function InventoryDetail() {
  const { item } = Route.useLoaderData();
  const itemTxns = transactions.slice(0, 8).map((t) => ({
    ...t,
    materialCode: item.materialCode,
    materialName: item.materialName,
  }));

  const txnColumns: Column<Transaction>[] = [
    { key: "id", header: "Document", value: (r) => r.id, className: "num" },
    { key: "date", header: "Date", value: (r) => r.date, className: "num" },
    { key: "type", header: "Type", value: (r) => r.type },
    { key: "warehouse", header: "Warehouse", value: (r) => r.warehouse },
    { key: "quantity", header: "Quantity", align: "right", value: (r) => r.quantity },
    { key: "reference", header: "Reference", value: (r) => r.reference, className: "num" },
    { key: "user", header: "Posted By", value: (r) => r.user },
  ];

  const total = item.available + item.reserved + item.damaged + item.quarantine;
  const utilisation = Math.min(100, Math.round((item.available / Math.max(1, item.maxQty)) * 100));

  return (
    <div className="mx-auto max-w-[1600px]">
      <PageHeader
        title={item.materialName}
        description={`${item.materialCode} · ${item.category} · ${item.supplier}`}
        breadcrumbs={[
          { label: "Inventory Management", to: "/" },
          { label: "Inventory Explorer", to: "/explorer" },
          { label: item.materialCode },
        ]}
        actions={
          <>
            <Button variant="outline" size="sm" asChild>
              <Link to="/inventory-flow/genealogy">Genealogy</Link>
            </Button>
            <Button variant="outline" size="sm" onClick={() => exportRows([item], item.materialCode, "excel")}>
              Export
            </Button>
            <Button size="sm" asChild>
              <Link to="/inventory-flow/adjustments">Adjust Stock</Link>
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-4">
          <SectionCard title="Material Summary" actions={<StatusBadge status={item.status} />}>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <Fact icon={Building2} label="Warehouse" value={item.warehouse} />
              <Fact icon={MapPin} label="Storage Bin" value={`${item.storageBin} · ${item.zone}`} />
              <Fact icon={Layers} label="Category" value={item.category} />
              <Fact icon={Ruler} label="Unit of Measure" value={item.uom} />
              <Fact icon={Barcode} label="Batch Number" value={item.batchNumber} />
              <Fact icon={Barcode} label="Serial Number" value={item.serialNumber} />
              <Fact icon={CalendarClock} label="Expiry Date" value={item.expiryDate} />
              <Fact icon={Truck} label="Supplier" value={item.supplier} />
            </div>

            <Separator className="my-4" />

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <QtyTile label="Available" value={item.available} uom={item.uom} tone="available" />
              <QtyTile label="Reserved" value={item.reserved} uom={item.uom} tone="reserved" />
              <QtyTile label="Damaged" value={item.damaged} uom={item.uom} tone="damaged" />
              <QtyTile label="Quarantine" value={item.quarantine} uom={item.uom} tone="quarantine" />
            </div>
          </SectionCard>

          <SectionCard bodyClassName="p-0">
            <Tabs defaultValue="overview">
              <div className="overflow-x-auto border-b border-border px-2">
                <TabsList className="h-11 bg-transparent p-0">
                  {["Overview", "Transactions", "Batch History", "Serial Numbers", "Documents", "Genealogy", "Activity Log"].map(
                    (t) => (
                      <TabsTrigger
                        key={t}
                        value={t.toLowerCase().replace(/\s/g, "-")}
                        className="rounded-none border-b-2 border-transparent px-3 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none"
                      >
                        {t}
                      </TabsTrigger>
                    ),
                  )}
                </TabsList>
              </div>

              <TabsContent value="overview" className="m-0 p-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <p className="text-sm font-medium">Stock composition</p>
                    {[
                      { label: "Available", v: item.available, tone: "available" },
                      { label: "Reserved", v: item.reserved, tone: "reserved" },
                      { label: "Damaged", v: item.damaged, tone: "damaged" },
                      { label: "Quarantine", v: item.quarantine, tone: "quarantine" },
                    ].map((row) => (
                      <div key={row.label}>
                        <div className="mb-1 flex justify-between text-xs">
                          <span className="text-muted-foreground">{row.label}</span>
                          <span className="num font-medium">
                            {formatNumber(row.v)} {item.uom}
                          </span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${(row.v / Math.max(1, total)) * 100}%`,
                              background: `var(--color-status-${row.tone})`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <dl className="grid grid-cols-2 gap-y-2 text-sm">
                    <dt className="text-muted-foreground">Reorder point</dt>
                    <dd className="num text-right">{formatNumber(item.reorderPoint)}</dd>
                    <dt className="text-muted-foreground">Safety stock</dt>
                    <dd className="num text-right">{formatNumber(item.safetyStock)}</dd>
                    <dt className="text-muted-foreground">Min / Max</dt>
                    <dd className="num text-right">
                      {formatNumber(item.minQty)} / {formatNumber(item.maxQty)}
                    </dd>
                    <dt className="text-muted-foreground">Economic order qty</dt>
                    <dd className="num text-right">{formatNumber(item.eoq)}</dd>
                    <dt className="text-muted-foreground">Unit cost</dt>
                    <dd className="num text-right">{formatCurrency(item.unitCost)}</dd>
                    <dt className="text-muted-foreground">Inventory value</dt>
                    <dd className="num text-right font-medium">
                      {formatCurrency((item.available + item.reserved) * item.unitCost)}
                    </dd>
                    <dt className="text-muted-foreground">Movement class</dt>
                    <dd className="text-right">
                      <StatusBadge status={item.movement} />
                    </dd>
                  </dl>
                </div>
              </TabsContent>

              <TabsContent value="transactions" className="m-0">
                <DataTable rows={itemTxns} columns={txnColumns} pageSize={8} />
              </TabsContent>

              <TabsContent value="batch-history" className="m-0 divide-y divide-border">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3">
                    <div className="min-w-0">
                      <p className="num text-sm font-medium">
                        {item.batchNumber}-{i + 1}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Produced {item.receivedDate} · Qty {formatNumber(40 + i * 25)} {item.uom} · Shelf life{" "}
                        {item.expiryDate}
                      </p>
                    </div>
                    <StatusBadge status={i === 2 ? "Quarantine" : "Available"} />
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="serial-numbers" className="m-0 grid grid-cols-1 gap-2 p-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="rounded-lg border border-border p-3">
                    <p className="num text-sm font-medium">
                      {item.serialNumber}-{String(i + 1).padStart(2, "0")}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Bin {item.storageBin} · Warranty 24 months
                    </p>
                    <StatusBadge className="mt-2" status={i % 4 === 3 ? "Reserved" : "Available"} />
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="documents" className="m-0 divide-y divide-border">
                {[
                  "Goods Receipt Note GRN-88410.pdf",
                  "Material Test Certificate MTC-2261.pdf",
                  "Supplier Invoice INV-77190.pdf",
                  "QA Inspection Report QAR-4402.pdf",
                ].map((doc) => (
                  <div key={doc} className="flex items-center justify-between gap-3 px-4 py-3">
                    <span className="flex min-w-0 items-center gap-2 text-sm">
                      <FileText className="size-4 shrink-0 text-muted-foreground" />
                      <span className="truncate">{doc}</span>
                    </span>
                    <Button variant="ghost" size="sm">
                      Download
                    </Button>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="genealogy" className="m-0 p-4">
                <p className="text-sm text-muted-foreground">
                  This material participates in a multi-level component structure.
                </p>
                <Button className="mt-3" size="sm" asChild>
                  <Link to="/inventory-flow/genealogy">Open serial genealogy tree</Link>
                </Button>
              </TabsContent>

              <TabsContent value="activity-log" className="m-0 p-4">
                <ol className="relative space-y-4 border-l border-border pl-5">
                  {[
                    { t: "Stock reserved against production order PO-99120", d: item.lastUpdated },
                    { t: "Cycle count completed — no variance", d: item.receivedDate },
                    { t: "Bin relocation to " + item.storageBin, d: item.receivedDate },
                    { t: "Goods receipt posted from " + item.supplier, d: item.receivedDate },
                  ].map((e, i) => (
                    <li key={i}>
                      <span className="absolute -left-[5px] mt-1.5 size-2.5 rounded-full bg-primary" />
                      <p className="text-sm font-medium">{e.t}</p>
                      <p className="num text-xs text-muted-foreground">{e.d}</p>
                    </li>
                  ))}
                </ol>
              </TabsContent>
            </Tabs>
          </SectionCard>
        </div>

        <div className="space-y-4">
          <SectionCard title="Stock Coverage">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Bin utilisation</span>
              <span className="num font-medium">{utilisation}%</span>
            </div>
            <Progress value={utilisation} className="mt-2 h-2" />
            <dl className="mt-4 grid grid-cols-2 gap-y-2 text-sm">
              <dt className="text-muted-foreground">Age</dt>
              <dd className="num text-right">{item.ageDays} days</dd>
              <dt className="text-muted-foreground">Received</dt>
              <dd className="num text-right">{item.receivedDate}</dd>
              <dt className="text-muted-foreground">Last updated</dt>
              <dd className="num text-right">{item.lastUpdated}</dd>
            </dl>
          </SectionCard>

          <SectionCard title="Quick Actions" bodyClassName="p-3 space-y-2">
            {[
              { label: "Create transfer request", icon: Truck, to: "/transfers" as const },
              { label: "Raise stock adjustment", icon: Boxes, to: "/adjustments" as const },
              { label: "Schedule cycle count", icon: CalendarClock, to: "/cycle-count" as const },
              { label: "Report damage / quarantine", icon: ShieldAlert, to: "/quarantine" as const },
              { label: "Configure reorder point", icon: Lock, to: "/planning" as const },
            ].map((a) => (
              <Button key={a.label} variant="outline" className="w-full justify-start" asChild>
                <Link to={a.to}>
                  <a.icon className="mr-2 size-4" /> {a.label}
                </Link>
              </Button>
            ))}
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
