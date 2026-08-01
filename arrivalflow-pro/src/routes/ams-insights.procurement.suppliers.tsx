import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/apps/ams-insights/layout/DashboardLayout";
import { PageHeader } from "@/apps/ams-insights/common/PageHeader";
import { StatusBadge } from "@/apps/ams-insights/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { suppliers } from "@/apps/ams-insights/mock/suppliers";

const description = "Supplier master data and purchase order governance for the AMS platform.";

export const Route = createFileRoute("/ams-insights/procurement/suppliers")({
  head: () => ({
    meta: [
      { title: "Supplier Master | Asset Management System" },
      { name: "description", content: description },
      { property: "og:title", content: "Supplier Master | AMS" },
      { property: "og:description", content: description },
    ],
  }),
  component: SuppliersPage,
});

function SuppliersPage() {
  return (
    <DashboardLayout title="Supplier & Purchase Order Management">
      <PageHeader
        title="Supplier Master"
        description={description}
        actions={
          <Button className="h-9 rounded-lg">
            <Plus className="size-4" />
            Add Supplier
          </Button>
        }
      />
      <section className="rounded-xl border border-border bg-card shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3 font-medium">Supplier ID</th>
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Code</th>
                <th className="px-5 py-3 font-medium">Country</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 text-right font-medium">Open POs</th>
                <th className="px-5 py-3 text-right font-medium">Spend (₹ Cr)</th>
                <th className="px-5 py-3 text-right font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((s) => (
                <tr
                  key={s.id}
                  className="border-b border-border last:border-0 transition-colors hover:bg-muted/50"
                >
                  <td className="px-5 py-3.5 font-medium text-primary">{s.id}</td>
                  <td className="px-5 py-3.5 font-medium">{s.name}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{s.code}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{s.country}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{s.category}</td>
                  <td className="px-5 py-3.5 text-right tabular-nums">{s.openPOs}</td>
                  <td className="px-5 py-3.5 text-right tabular-nums">{s.spendCr.toFixed(1)}</td>
                  <td className="px-5 py-3.5 text-right">
                    <StatusBadge status={s.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </DashboardLayout>
  );
}
