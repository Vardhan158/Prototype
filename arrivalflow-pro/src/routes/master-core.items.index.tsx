import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Package } from "lucide-react";

import {
  DataTable,
  type Column,
  type TableFilter,
} from "@/apps/master-core/integrated/components/DataTable";
import { PageHeader } from "@/apps/master-core/integrated/components/PageHeader";
import {
  RecordFormSheet,
  type FormStep,
} from "@/apps/master-core/integrated/components/RecordFormSheet";
import { StatusChip } from "@/apps/master-core/integrated/components/StatusChip";
import { useMasterPage } from "@/apps/master-core/integrated/hooks/useMasters";
import { Badge } from "@/components/ui/badge";
import { type Item } from "@/apps/master-core/integrated/data/masters";

export const Route = createFileRoute("/master-core/items/")({
  head: () => ({
    meta: [
      { title: "Item Master — Meridia ERP MDM" },
      {
        name: "description",
        content:
          "Material master for raw materials, components, sub assemblies and finished goods with stock policy and compliance data.",
      },
      { property: "og:title", content: "Item Master — Meridia ERP" },
      {
        property: "og:description",
        content: "Material master records with SKU, HSN, storage conditions and reorder policy.",
      },
    ],
  }),
  component: ItemMaster,
});

const steps: FormStep[] = [
  {
    title: "Basic Information",
    description: "Identification and classification of the material",
    fields: [
      { name: "code", label: "Item Code", required: true, placeholder: "ITM-3013" },
      { name: "name", label: "Item Name", required: true },
      { name: "description", label: "Description", type: "textarea", colSpan: 2 },
      {
        name: "category",
        label: "Category",
        type: "select",
        required: true,
        options: ["Raw Material", "Component", "Sub Assembly", "Finished Goods"],
      },
      { name: "subCategory", label: "Sub Category" },
      { name: "unit", label: "Unit", type: "select", options: ["EA", "KG", "L", "M", "BOX"] },
      { name: "status", label: "Status", type: "switch" },
    ],
  },
  {
    title: "Logistics",
    description: "Physical attributes, identifiers and stock policy",
    fields: [
      { name: "weight", label: "Weight" },
      { name: "dimensions", label: "Dimensions" },
      { name: "manufacturer", label: "Manufacturer" },
      { name: "brand", label: "Brand" },
      { name: "barcode", label: "Barcode" },
      { name: "sku", label: "SKU" },
      { name: "cost", label: "Cost", type: "number" },
      { name: "price", label: "Selling Price", type: "number" },
      { name: "minStock", label: "Minimum Stock", type: "number" },
      { name: "maxStock", label: "Maximum Stock", type: "number" },
      { name: "reorderLevel", label: "Reorder Level", type: "number" },
      { name: "shelfLife", label: "Shelf Life" },
    ],
  },
  {
    title: "Documents",
    description: "Compliance, hazard classification and images",
    fields: [
      {
        name: "hazard",
        label: "Hazard Classification",
        type: "select",
        options: ["None", "Flammable — Class 3", "Corrosive — Class 8", "Toxic — Class 6"],
      },
      { name: "storage", label: "Storage Conditions" },
      { name: "hsnCode", label: "HSN Code" },
    ],
  },
];

function ItemMaster() {
  const navigate = useNavigate();
  const m = useMasterPage<Item>("items", "Item");

  const columns: Column<Item>[] = [
    {
      key: "code",
      header: "Code",
      value: (r) => r.code,
      render: (r) => <span className="num text-xs font-semibold text-primary">{r.code}</span>,
    },
    {
      key: "name",
      header: "Item",
      value: (r) => r.name,
      render: (r) => (
        <div className="min-w-0 max-w-[280px]">
          <p className="truncate font-medium">{r.name}</p>
          <p className="truncate text-xs text-muted-foreground">{r.description}</p>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      value: (r) => r.category,
      render: (r) => <Badge variant="secondary">{r.category}</Badge>,
    },
    { key: "sub", header: "Sub category", value: (r) => r.subCategory, hiddenByDefault: true },
    { key: "unit", header: "Unit", value: (r) => r.unit },
    {
      key: "sku",
      header: "SKU",
      value: (r) => r.sku,
      render: (r) => <span className="num text-xs">{r.sku}</span>,
    },
    {
      key: "cost",
      header: "Cost",
      value: (r) => r.cost,
      render: (r) => <span className="num">{r.cost ? r.cost.toFixed(2) : "—"}</span>,
    },
    {
      key: "price",
      header: "Price",
      value: (r) => r.price,
      render: (r) => <span className="num">{r.price ? r.price.toFixed(2) : "—"}</span>,
    },
    {
      key: "reorder",
      header: "Reorder level",
      value: (r) => r.reorderLevel,
      render: (r) => <span className="num">{r.reorderLevel.toLocaleString()}</span>,
    },
    { key: "hsn", header: "HSN", value: (r) => r.hsnCode, hiddenByDefault: true },
    {
      key: "hazard",
      header: "Hazard",
      value: (r) => r.hazard,
      render: (r) =>
        r.hazard === "None" ? (
          <span className="text-xs text-muted-foreground">None</span>
        ) : (
          <StatusChip value="Expired" className="!bg-destructive/10" />
        ),
      hiddenByDefault: true,
    },
    {
      key: "status",
      header: "Status",
      value: (r) => r.status,
      render: (r) => <StatusChip value={r.status} />,
    },
  ];

  const filters: TableFilter<Item>[] = [
    {
      key: "category",
      label: "Category",
      options: ["Raw Material", "Component", "Sub Assembly", "Finished Goods"],
      match: (r, v) => r.category === v,
    },
    {
      key: "status",
      label: "Status",
      options: ["Active", "Inactive", "Draft"],
      match: (r, v) => r.status === v,
    },
    {
      key: "unit",
      label: "Unit",
      options: [...new Set(m.rows.map((i) => i.unit))],
      match: (r, v) => r.unit === v,
    },
  ];

  return (
    <div className="min-h-full">
      <PageHeader
        crumbs={[{ label: "Master Data Management", to: "/" }, { label: "Item Master" }]}
        icon={<Package className="h-5 w-5" />}
        title="Item Master"
        description="Material definitions driving BOMs, stock policy, procurement and costing."
      />
      <div className="p-4 sm:p-6">
        <DataTable
          rows={m.rows}
          columns={columns}
          filters={filters}
          entity="Items"
          isLoading={m.isLoading}
          onRefresh={m.refetch}
          onDelete={m.remove}
          createLabel="Add Item"
          getId={(r) => r.id}
          getLabel={(r) => r.name}
          searchText={(r) => `${r.code} ${r.name} ${r.sku} ${r.barcode} ${r.category} ${r.brand}`}
          onCreate={m.startCreate}
          onEdit={m.startEdit}
          onView={(r) => navigate({ to: "/master-core/items/$id", params: { id: r.id } })}
        />
      </div>
      <RecordFormSheet
        open={m.open}
        onOpenChange={m.setOpen}
        entity="Item"
        steps={steps}
        mode={m.mode}
        initial={m.initial}
        recordId={m.recordId}
        documentEntity="items"
        onSubmit={m.submit}
      />
    </div>
  );
}
