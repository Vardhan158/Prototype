import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { AppShell } from "@/components/ams/AppShell";
import { EMPTY_WORK_ORDER, WorkOrderForm } from "@/components/ams/WorkOrderForm";
import { useAms } from "@/lib/ams/store";

export const Route = createFileRoute("/work-orders/new")({
  head: () => ({
    meta: [
      { title: "Create Assembly Work Order — AMS" },
      {
        name: "description",
        content:
          "Create an assembly work order with finished product, specification, BOM version, quantity, priority, dates and assigned operator.",
      },
      { property: "og:title", content: "Create Assembly Work Order — AMS" },
      {
        property: "og:description",
        content: "Assembly work order creation form for the AMS Assembly Management module.",
      },
    ],
  }),
  component: CreateWorkOrderPage,
});

function CreateWorkOrderPage() {
  const { createWorkOrder, workOrders } = useAms();
  const navigate = useNavigate();

  return (
    <AppShell
      title="Create Work Order"
      description="BR-079 Assembly Work Order Creation."
    >
      <WorkOrderForm
        initialValues={{
          ...EMPTY_WORK_ORDER,
          workOrderNumber: `WO-2026-${String(workOrders.length + 1).padStart(4, "0")}`,
        }}
        submitLabel="Save"
        onCancel={() => navigate({ to: "/work-orders" })}
        onSubmit={(values) => {
          createWorkOrder(values);
          navigate({ to: "/work-orders" });
        }}
      />
    </AppShell>
  );
}
