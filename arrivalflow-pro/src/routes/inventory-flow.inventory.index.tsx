import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, PackageSearch } from "lucide-react";

import { PageHeader } from "@/apps/inventory-flow/components/PageHeader";
import { SectionCard } from "@/apps/inventory-flow/components/SectionCard";
import { StatusBadge } from "@/apps/inventory-flow/components/StatusBadge";
import { formatNumber, inventory } from "@/apps/inventory-flow/lib/data";

export const Route = createFileRoute("/inventory-flow/inventory/")({
  head: () => ({
    meta: [
      { title: "Inventory Details — VoltCore WMS" },
      {
        name: "description",
        content:
          "Select a material to open its full inventory detail record with transactions, batch history, serial numbers and genealogy.",
      },
      { property: "og:title", content: "Inventory Details — VoltCore WMS" },
      {
        property: "og:description",
        content: "Drill into material-level stock records across the plant warehouse network.",
      },
    ],
  }),
  component: InventoryIndex,
});

function InventoryIndex() {
  return (
    <div className="mx-auto max-w-[1600px]">
      <PageHeader
        title="Inventory Details"
        description="Pick a material record to inspect stock, traceability and documents · BR-058"
        breadcrumbs={[{ label: "Inventory Management", to: "/" }, { label: "Inventory Details" }]}
      />

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {inventory.slice(0, 12).map((item) => (
          <Link
            key={item.id}
            to="/inventory-flow/inventory/$itemId"
            params={{ itemId: item.id }}
            className="card-surface group block p-4 transition-shadow hover:shadow-[var(--shadow-elevated)]"
          >
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
              <div className="min-w-0">
                <p className="num text-xs font-medium text-primary">{item.materialCode}</p>
                <p className="mt-0.5 truncate text-sm font-semibold">{item.materialName}</p>
              </div>
              <StatusBadge status={item.status} />
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-y-1.5 text-xs">
              <dt className="text-muted-foreground">Warehouse</dt>
              <dd className="truncate text-right">{item.warehouse}</dd>
              <dt className="text-muted-foreground">Storage bin</dt>
              <dd className="num text-right">{item.storageBin}</dd>
              <dt className="text-muted-foreground">Available</dt>
              <dd className="num text-right font-medium">
                {formatNumber(item.available)} {item.uom}
              </dd>
              <dt className="text-muted-foreground">Reserved</dt>
              <dd className="num text-right">{formatNumber(item.reserved)}</dd>
            </dl>
            <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary">
              Open detail <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>

      <SectionCard className="mt-4">
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <PackageSearch className="size-4" />
          Looking for something specific? Use the{" "}
          <Link to="/inventory-flow/explorer" className="font-medium text-primary hover:underline">
            Inventory Explorer
          </Link>{" "}
          to search all {inventory.length} records.
        </div>
      </SectionCard>
    </div>
  );
}
