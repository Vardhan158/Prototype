import { createFileRoute } from "@tanstack/react-router";
import { useMasterList } from "@/apps/master-core/integrated/hooks/useMasters";
import { Truck } from "lucide-react";

import { DetailLayout } from "@/apps/master-core/integrated/components/DetailLayout";
import { Badge } from "@/components/ui/badge";
import { type Supplier } from "@/apps/master-core/integrated/data/masters";

export const Route = createFileRoute("/master-core/suppliers/$id")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Supplier record — Meridia ERP" },
      {
        name: "description",
        content: "Supplier master record detail with full golden-record attributes.",
      },
      { property: "og:title", content: "Supplier record — Meridia ERP" },
      { property: "og:description", content: "Supplier master data detail view." },
    ],
  }),
  component: SupplierDetail,
});

function SupplierDetail() {
  const { id } = Route.useParams();
  const { data, isLoading } = useMasterList("suppliers");
  const s = ((data ?? []) as unknown as Supplier[]).find((r) => r.id === id);

  if (!s) {
    return (
      <div className="p-10 text-sm text-muted-foreground">
        {isLoading ? "Loading record…" : "Record not found."}
      </div>
    );
  }

  return (
    <DetailLayout
      title={s.name}
      code={s.code}
      status={s.status}
      icon={<Truck className="h-5 w-5" />}
      crumbs={[
        { label: "Master Data Management", to: "/" },
        { label: "Supplier Master", to: "/master-core/suppliers" },
        { label: s.code },
      ]}
      metrics={[
        { label: "Open purchase orders", value: "14" },
        { label: "Spend YTD", value: `${s.currency} 1.24M` },
        { label: "On-time delivery", value: "97.2%" },
        { label: "Quality rejections", value: "0.4%" },
      ]}
      groups={[
        {
          title: "General information",
          fields: [
            { label: "Supplier code", value: s.code },
            { label: "Supplier name", value: s.name },
            { label: "Supplier type", value: s.type },
            { label: "Status", value: s.status },
            {
              label: "Approved commodities",
              value: (
                <span className="flex flex-wrap gap-1.5">
                  {s.commodities.map((c: string) => (
                    <Badge key={c} variant="secondary">
                      {c}
                    </Badge>
                  ))}
                </span>
              ),
            },
            { label: "Notes", value: s.notes },
          ],
        },
        {
          title: "Contact & address",
          fields: [
            { label: "Contact person", value: s.contactPerson },
            { label: "Phone", value: s.phone },
            { label: "Email", value: s.email },
            { label: "Website", value: s.website },
            { label: "Address", value: `${s.address}, ${s.city}` },
            { label: "State / Country", value: `${s.state}, ${s.country}` },
            { label: "Postal code", value: s.postalCode },
          ],
        },
        {
          title: "Compliance",
          fields: [
            { label: "GST number", value: s.gstNumber },
            { label: "Tax number", value: s.taxNumber },
            { label: "Certification", value: s.certification },
            { label: "Certification expiry", value: s.certificationExpiry },
          ],
        },
        {
          title: "Commercial & banking",
          fields: [
            { label: "Payment terms", value: s.paymentTerms },
            { label: "Currency", value: s.currency },
            { label: "Bank details", value: s.bank },
            { label: "Created on", value: s.createdAt },
          ],
        },
      ]}
      related={[
        { label: "PO-88213", value: `${s.currency} 142,880`, meta: "Purchase order · Open" },
        { label: "GRN-44120", value: "1,240 units", meta: "Goods receipt · Posted" },
        { label: "QIR-2210", value: "2 findings", meta: "Quality inspection · Closed" },
      ]}
    />
  );
}
