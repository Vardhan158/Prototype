import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Truck } from "lucide-react";
import { useState } from "react";

import { DataTable, type Column, type TableFilter } from "@/components/masters/DataTable";
import { PageHeader } from "@/components/masters/PageHeader";
import { RecordFormSheet, type FormStep } from "@/components/masters/RecordFormSheet";
import { StatusChip } from "@/components/masters/StatusChip";
import { suppliers, type Supplier } from "@/data/masters";

export const Route = createFileRoute("/suppliers/")({
  head: () => ({
    meta: [
      { title: "Supplier Master — Meridia ERP MDM" },
      {
        name: "description",
        content:
          "Maintain approved suppliers with certification status, commodities, payment terms and banking data.",
      },
      { property: "og:title", content: "Supplier Master — Meridia ERP" },
      {
        property: "og:description",
        content: "Enterprise supplier master data with certification and compliance tracking.",
      },
    ],
  }),
  component: SupplierMaster,
});

const steps: FormStep[] = [
  {
    title: "Basic Information",
    description: "Identify the supplier and its classification",
    fields: [
      { name: "code", label: "Supplier Code", required: true, placeholder: "SUP-1013" },
      { name: "name", label: "Supplier Name", required: true },
      {
        name: "type",
        label: "Supplier Type",
        type: "select",
        required: true,
        options: ["Manufacturer", "Distributor", "Service Provider", "Trader"],
      },
      {
        name: "currency",
        label: "Currency",
        type: "select",
        options: ["EUR", "USD", "INR", "JPY", "GBP", "AED"],
      },
      {
        name: "paymentTerms",
        label: "Payment Terms",
        type: "select",
        options: ["Net 15", "Net 30", "Net 45", "Net 60", "Advance"],
      },
      { name: "status", label: "Status", type: "switch" },
      { name: "notes", label: "Notes", type: "textarea", colSpan: 2 },
    ],
  },
  {
    title: "Contact",
    description: "Primary contact and registered address",
    fields: [
      { name: "contactPerson", label: "Contact Person", required: true },
      { name: "phone", label: "Phone", type: "tel", required: true },
      { name: "email", label: "Email", type: "email", required: true },
      { name: "website", label: "Website" },
      { name: "address", label: "Address", colSpan: 2 },
      { name: "city", label: "City" },
      { name: "state", label: "State / Province" },
      { name: "country", label: "Country", type: "select", options: ["Germany", "India", "United States", "Japan", "UAE", "United Kingdom"] },
      { name: "postalCode", label: "Postal Code" },
    ],
  },
  {
    title: "Documents",
    description: "Tax registration and certification evidence",
    fields: [
      { name: "gstNumber", label: "GST Number" },
      { name: "taxNumber", label: "Tax Number" },
      {
        name: "certification",
        label: "Certification Status",
        type: "select",
        options: ["Certified", "Pending", "Expired"],
      },
      { name: "certificationExpiry", label: "Certification Expiry", type: "date" },
      { name: "bank", label: "Bank Details", colSpan: 2 },
    ],
  },
];

function SupplierMaster() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const columns: Column<Supplier>[] = [
    {
      key: "code",
      header: "Code",
      value: (r) => r.code,
      render: (r) => <span className="num text-xs font-semibold text-primary">{r.code}</span>,
    },
    {
      key: "name",
      header: "Supplier",
      value: (r) => r.name,
      render: (r) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{r.name}</p>
          <p className="truncate text-xs text-muted-foreground">{r.type}</p>
        </div>
      ),
    },
    {
      key: "contact",
      header: "Contact",
      value: (r) => r.contactPerson,
      render: (r) => (
        <div className="min-w-0">
          <p className="truncate text-sm">{r.contactPerson}</p>
          <p className="truncate text-xs text-muted-foreground">{r.email}</p>
        </div>
      ),
    },
    { key: "phone", header: "Phone", value: (r) => r.phone, hiddenByDefault: true },
    { key: "city", header: "City", value: (r) => r.city, hiddenByDefault: true },
    { key: "country", header: "Country", value: (r) => r.country },
    {
      key: "certification",
      header: "Certification",
      value: (r) => r.certification,
      render: (r) => (
        <div className="flex flex-col gap-1">
          <StatusChip value={r.certification} />
          <span className="num text-[11px] text-muted-foreground">
            exp. {r.certificationExpiry}
          </span>
        </div>
      ),
    },
    { key: "terms", header: "Terms", value: (r) => r.paymentTerms },
    { key: "currency", header: "Currency", value: (r) => r.currency },
    {
      key: "status",
      header: "Status",
      value: (r) => r.status,
      render: (r) => <StatusChip value={r.status} />,
    },
  ];

  const filters: TableFilter<Supplier>[] = [
    {
      key: "status",
      label: "Status",
      options: ["Active", "Inactive", "Draft"],
      match: (r, v) => r.status === v,
    },
    {
      key: "country",
      label: "Country",
      options: [...new Set(suppliers.map((s) => s.country))],
      match: (r, v) => r.country === v,
    },
    {
      key: "certification",
      label: "Certification",
      options: ["Certified", "Pending", "Expired"],
      match: (r, v) => r.certification === v,
    },
  ];

  return (
    <div className="min-h-full">
      <PageHeader
        crumbs={[
          { label: "Master Data Management", to: "/" },
          { label: "Supplier Master" },
        ]}
        icon={<Truck className="h-5 w-5" />}
        title="Supplier Master"
        description="Approved vendor records shared with Procurement, Quality and Finance."
      />
      <div className="p-4 sm:p-6">
        <DataTable
          rows={suppliers}
          columns={columns}
          filters={filters}
          entity="Suppliers"
          createLabel="Add Supplier"
          getId={(r) => r.id}
          getLabel={(r) => r.name}
          searchText={(r) => `${r.code} ${r.name} ${r.contactPerson} ${r.email} ${r.city} ${r.country}`}
          onCreate={() => setOpen(true)}
          onEdit={() => setOpen(true)}
          onView={(r) => navigate({ to: "/suppliers/$id", params: { id: r.id } })}
        />
      </div>
      <RecordFormSheet open={open} onOpenChange={setOpen} entity="Supplier" steps={steps} />
    </div>
  );
}
