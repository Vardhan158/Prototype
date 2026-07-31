import { createFileRoute, notFound } from "@tanstack/react-router";
import { Package } from "lucide-react";

import { DetailLayout } from "@master/components/masters/DetailLayout";
import { items } from "@master/data/masters";

export const Route = createFileRoute("/master-core/items/$id")({
  loader: ({ params }) => {
    const item = items.find((i) => i.id === params.id);
    if (!item) throw notFound();
    return { item };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Item not found" }, { name: "robots", content: "noindex" }] };
    }
    const title = `${loaderData.item.name} — Item Master`;
    return {
      meta: [
        { title },
        { name: "description", content: loaderData.item.description },
        { property: "og:title", content: title },
        { property: "og:description", content: loaderData.item.description },
      ],
    };
  },
  component: ItemDetail,
});

function ItemDetail() {
  const { item: i } = Route.useLoaderData();

  return (
    <DetailLayout
      title={i.name}
      code={i.code}
      status={i.status}
      icon={<Package className="h-5 w-5" />}
      crumbs={[
        { label: "Master Data Management", to: "/master-core/" },
        { label: "Item Master", to: "/master-core/items" },
        { label: i.code },
      ]}
      metrics={[
        { label: "On hand", value: "12,480" },
        { label: "Reserved", value: "3,120" },
        { label: "Reorder level", value: i.reorderLevel.toLocaleString() },
        { label: "Avg. unit cost", value: i.cost ? i.cost.toFixed(2) : "—" },
      ]}
      groups={[
        {
          title: "Identification",
          fields: [
            { label: "Item code", value: i.code },
            { label: "Item name", value: i.name },
            { label: "Description", value: i.description },
            { label: "Category", value: i.category },
            { label: "Sub category", value: i.subCategory },
            { label: "Unit of measure", value: i.unit },
          ],
        },
        {
          title: "Physical & identifiers",
          fields: [
            { label: "Weight", value: i.weight },
            { label: "Dimensions", value: i.dimensions },
            { label: "Manufacturer", value: i.manufacturer },
            { label: "Brand", value: i.brand },
            { label: "Barcode", value: i.barcode },
            { label: "SKU", value: i.sku },
          ],
        },
        {
          title: "Stock policy & pricing",
          fields: [
            { label: "Cost", value: i.cost ? i.cost.toFixed(2) : "—" },
            { label: "Selling price", value: i.price ? i.price.toFixed(2) : "—" },
            { label: "Minimum stock", value: i.minStock.toLocaleString() },
            { label: "Maximum stock", value: i.maxStock.toLocaleString() },
            { label: "Reorder level", value: i.reorderLevel.toLocaleString() },
            { label: "Shelf life", value: i.shelfLife },
          ],
        },
        {
          title: "Compliance & storage",
          fields: [
            { label: "Hazard classification", value: i.hazard },
            { label: "Storage conditions", value: i.storage },
            { label: "HSN code", value: i.hsnCode },
            { label: "Created on", value: i.createdAt },
          ],
        },
      ]}
      related={[
        { label: "BOM-2201", value: "8 components", meta: "Bill of material · Released" },
        { label: "PO-88110", value: "4,000 units", meta: "Purchase order · Partially received" },
        { label: "WO-51203", value: "620 units", meta: "Work order · In progress" },
      ]}
    />
  );
}
