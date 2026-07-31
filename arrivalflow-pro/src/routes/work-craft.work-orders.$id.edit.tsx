import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { WorkOrderForm } from "@work/components/ams/WorkOrderForm";
import { useAms } from "@work/lib/ams/store";

export const Route = createFileRoute("/work-craft/work-orders/$id/edit")({
  component: EditWorkOrder,
});

function EditWorkOrder() {
  const { id } = Route.useParams();
  const { workOrders, updateWorkOrder } = useAms();
  const navigate = useNavigate();
  const wo = workOrders.find((w) => w.id === id);
  if (!wo) return null;

  return (
    <WorkOrderForm
      lockNumber
      submitLabel="Save"
      initialValues={{
        workOrderNumber: wo.workOrderNumber,
        finishedProduct: wo.finishedProduct,
        finishedGoodsSpecification: wo.finishedGoodsSpecification,
        bomVersion: wo.bomVersion,
        quantity: wo.quantity,
        priority: wo.priority,
        startDate: wo.startDate,
        expectedCompletionDate: wo.expectedCompletionDate,
        assignedOperator: wo.assignedOperator,
        remarks: wo.remarks,
      }}
      onCancel={() => navigate({ to: "/work-craft/work-orders/$id", params: { id } })}
      onSubmit={(values) => {
        updateWorkOrder(id, values);
        navigate({ to: "/work-craft/work-orders/$id", params: { id } });
      }}
    />
  );
}
