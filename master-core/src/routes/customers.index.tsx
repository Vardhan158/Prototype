import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Users } from "lucide-react";
import { useState } from "react";

import { DataTable, type Column, type TableFilter } from "@/components/masters/DataTable";
import { PageHeader } from "@/components/masters/PageHeader";
import { RecordFormSheet, type FormStep } from "@/components/masters/RecordFormSheet";
import { StatusChip } from "@/components/masters/StatusChip";
import { customers, type Customer } from "@/data/masters";

export const Route = createFileRoute("/customers/")({
  head: () => ({
    meta: [
      { title: "Customer Master — Meridia ERP MDM" },
      {
        name: "description",
        content:
          "Customer golden records with billing and shipping addresses, delivery locations, priority and payment terms.",
      },
      { property: "og:title", content: "Customer Master — Meridia ERP" },
      {
        property: "og:description",
        content: "Enterprise customer master data for order management and logistics.",
      },
    ],
  }),
  component: CustomerMaster,
});

const steps: FormStep[] = [
  {
    title: "Basic Information",
    description: "Customer identity and commercial classification",
    fields: [
      { name: "code", label: "Customer Code", required: true, placeholder: "CUS-2011" },
      { name: "name", label: "Customer Name", required: true },
      {
        name: "category",
        label: "Customer Category",
        type: "select",
        options: ["OEM", "Retail Chain", "Distributor", "Institutional", "Cooperative"],
      },
      { name: "priority", label: "Priority", type: "select", options: ["High", "Medium", "Low"] },
      {
        name: "paymentTerms",
        label: "Payment Terms",
        type: "select",
        options: ["Net 15", "Net 30", "Net 45", "Net 60"],
      },
      { name: "currency", label: "Currency", type: "select", options: ["EUR", "USD", "INR", "AUD"] },
      { name: "status", label: "Status", type: "switch" },
      { name: "notes", label: "Notes", type: "textarea", colSpan: 2 },
    ],
  },
  {
    title: "Contact",
    description: "Contacts, billing and shipping destinations",
    fields: [
      { name: "contactPerson", label: "Contact Person", required: true },
      { name: "phone", label: "Phone", type: "tel", required: true },
      { name: "email", label: "Email", type: "email", required: true },
      { name: "country", label: "Country", type: "select", options: ["Spain", "United States", "Japan", "India", "Australia", "Norway"] },
      { name: "billingAddress", label: "Billing Address", colSpan: 2 },
      { name: "shippingAddress", label: "Shipping Address", colSpan: 2 },
      {
        name: "shipmentPreference",
        label: "Shipment Preference",
        type: "select",
        options: ["Sea Freight", "Air Freight", "LTL Road", "Road Container", "Parcel", "Temperature Controlled"],
      },
      { name: "deliveryLocations", label: "Delivery Locations", type: "number" },
    ],
  },
  {
    title: "Documents",
    description: "Tax registration and contractual documents",
    fields: [{ name: "taxNumber", label: "Tax Number" }],
  },
];

function CustomerMaster() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const columns: Column<Customer>[] = [
    {
      key: "code",
      header: "Code",
      value: (r) => r.code,
      render: (r) => <span className="num text-xs font-semibold text-primary">{r.code}</span>,
    },
    {
      key: "name",
      header: "Customer",
      value: (r) => r.name,
      render: (r) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{r.name}</p>
          <p className="truncate text-xs text-muted-foreground">{r.category}</p>
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
    { key: "country", header: "Country", value: (r) => r.country },
    { key: "shipment", header: "Shipment", value: (r) => r.shipmentPreference },
    {
      key: "locations",
      header: "Delivery sites",
      value: (r) => r.deliveryLocations,
      render: (r) => <span className="num">{r.deliveryLocations}</span>,
    },
    { key: "terms", header: "Terms", value: (r) => r.paymentTerms },
    {
      key: "priority",
      header: "Priority",
      value: (r) => r.priority,
      render: (r) => <StatusChip value={r.priority} />,
    },
    {
      key: "status",
      header: "Status",
      value: (r) => r.status,
      render: (r) => <StatusChip value={r.status} />,
    },
  ];

  const filters: TableFilter<Customer>[] = [
    { key: "status", label: "Status", options: ["Active", "Inactive", "Draft"], match: (r, v) => r.status === v },
    { key: "priority", label: "Priority", options: ["High", "Medium", "Low"], match: (r, v) => r.priority === v },
    {
      key: "country",
      label: "Country",
      options: [...new Set(customers.map((c) => c.country))],
      match: (r, v) => r.country === v,
    },
  ];

  return (
    <div className="min-h-full">
      <PageHeader
        crumbs={[{ label: "Master Data Management", to: "/" }, { label: "Customer Master" }]}
        icon={<Users className="h-5 w-5" />}
        title="Customer Master"
        description="Sold-to and ship-to parties consumed by Sales, Distribution and Finance."
      />
      <div className="p-4 sm:p-6">
        <DataTable
          rows={customers}
          columns={columns}
          filters={filters}
          entity="Customers"
          createLabel="Add Customer"
          getId={(r) => r.id}
          getLabel={(r) => r.name}
          searchText={(r) => `${r.code} ${r.name} ${r.contactPerson} ${r.email} ${r.country}`}
          onCreate={() => setOpen(true)}
          onEdit={() => setOpen(true)}
          onView={(r) => navigate({ to: "/customers/$id", params: { id: r.id } })}
        />
      </div>
      <RecordFormSheet open={open} onOpenChange={setOpen} entity="Customer" steps={steps} />
    </div>
  );
}
