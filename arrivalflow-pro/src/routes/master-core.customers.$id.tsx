import { createFileRoute } from "@tanstack/react-router";
import { useMasterList } from "@/apps/master-core/integrated/hooks/useMasters";
import { Users } from "lucide-react";

import { DetailLayout } from "@/apps/master-core/integrated/components/DetailLayout";
import { type Customer } from "@/apps/master-core/integrated/data/masters";

export const Route = createFileRoute("/master-core/customers/$id")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Customer record — Meridia ERP" },
      {
        name: "description",
        content: "Customer master record detail with full golden-record attributes.",
      },
      { property: "og:title", content: "Customer record — Meridia ERP" },
      { property: "og:description", content: "Customer master data detail view." },
    ],
  }),
  component: CustomerDetail,
});

function CustomerDetail() {
  const { id } = Route.useParams();
  const { data, isLoading } = useMasterList("customers");
  const c = ((data ?? []) as unknown as Customer[]).find((r) => r.id === id);

  if (!c) {
    return (
      <div className="p-10 text-sm text-muted-foreground">
        {isLoading ? "Loading record…" : "Record not found."}
      </div>
    );
  }

  return (
    <DetailLayout
      title={c.name}
      code={c.code}
      status={c.status}
      icon={<Users className="h-5 w-5" />}
      crumbs={[
        { label: "Master Data Management", to: "/" },
        { label: "Customer Master", to: "/master-core/customers" },
        { label: c.code },
      ]}
      metrics={[
        { label: "Open sales orders", value: "22" },
        { label: "Revenue YTD", value: `${c.currency} 3.86M` },
        { label: "Delivery locations", value: String(c.deliveryLocations) },
        { label: "Credit exposure", value: `${c.currency} 214K` },
      ]}
      groups={[
        {
          title: "General information",
          fields: [
            { label: "Customer code", value: c.code },
            { label: "Customer name", value: c.name },
            { label: "Category", value: c.category },
            { label: "Priority", value: c.priority },
            { label: "Status", value: c.status },
            { label: "Notes", value: c.notes },
          ],
        },
        {
          title: "Contact",
          fields: [
            { label: "Contact person", value: c.contactPerson },
            { label: "Phone", value: c.phone },
            { label: "Email", value: c.email },
            { label: "Country", value: c.country },
          ],
        },
        {
          title: "Logistics",
          fields: [
            { label: "Billing address", value: c.billingAddress },
            { label: "Shipping address", value: c.shippingAddress },
            { label: "Delivery locations", value: String(c.deliveryLocations) },
            { label: "Shipment preference", value: c.shipmentPreference },
          ],
        },
        {
          title: "Commercial",
          fields: [
            { label: "Payment terms", value: c.paymentTerms },
            { label: "Currency", value: c.currency },
            { label: "Tax number", value: c.taxNumber },
            { label: "Created on", value: c.createdAt },
          ],
        },
      ]}
      related={[
        { label: "SO-77120", value: `${c.currency} 88,400`, meta: "Sales order · In production" },
        { label: "DN-31882", value: "18 pallets", meta: "Delivery note · Dispatched" },
        { label: "INV-55031", value: `${c.currency} 61,220`, meta: "Invoice · Overdue 4 days" },
      ]}
    />
  );
}
