import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/apps/ams-insights/layout/DashboardLayout";
import { KpiCard } from "@/apps/ams-insights/dashboard/KpiCard";
import { PurchaseOrderTable } from "@/apps/ams-insights/dashboard/PurchaseOrderTable";
import { DonutChartCard } from "@/apps/ams-insights/dashboard/DonutChartCard";
import { SupplierPerformanceTable } from "@/apps/ams-insights/dashboard/SupplierPerformanceTable";
import { RecentASNTable } from "@/apps/ams-insights/dashboard/RecentASNTable";
import { QuickActionsCard } from "@/apps/ams-insights/dashboard/QuickActionsCard";
import { dashboardStats } from "@/apps/ams-insights/mock/dashboardStats";

const title = "Supplier & Purchase Order Management";
const description =
  "Track purchase orders, supplier performance and inbound shipments in the AMS procurement dashboard.";

export const Route = createFileRoute("/ams-insights/")({
  head: () => ({
    meta: [
      { title: "Procurement Dashboard | Asset Management System" },
      { name: "description", content: description },
      { property: "og:title", content: "Procurement Dashboard | AMS" },
      { property: "og:description", content: description },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <DashboardLayout title={title}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {dashboardStats.map((stat) => (
          <KpiCard key={stat.id} stat={stat} />
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-10">
        <div className="xl:col-span-7">
          <PurchaseOrderTable />
        </div>
        <div className="xl:col-span-3">
          <DonutChartCard />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <SupplierPerformanceTable />
        <RecentASNTable />
        <QuickActionsCard />
      </div>
    </DashboardLayout>
  );
}
