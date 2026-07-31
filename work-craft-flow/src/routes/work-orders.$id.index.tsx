import { createFileRoute, Link } from "@tanstack/react-router";

import { StatusBadge } from "@/components/ams/StatusBadge";
import { Button } from "@/components/ui/button";
import { useAms } from "@/lib/ams/store";

export const Route = createFileRoute("/work-orders/$id/")({
  component: WorkOrderDetails,
});

function Field({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

function WorkOrderDetails() {
  const { id } = Route.useParams();
  const { workOrders, exceptions, reworkScrap, finishedGoods, certificates } = useAms();
  const wo = workOrders.find((w) => w.id === id);
  if (!wo) return null;

  const woExceptions = exceptions.filter((e) => e.workOrderId === id);
  const woRework = reworkScrap.filter((r) => r.workOrderId === id);
  const woGoods = finishedGoods.filter((f) => f.workOrderId === id);
  const woCerts = certificates.filter((c) => c.workOrderId === id);

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="surface-card p-6 lg:col-span-2">
        <h2 className="text-sm font-semibold text-foreground">Work Order Information</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <Field label="Work Order Number" value={wo.workOrderNumber} />
          <Field label="Finished Product" value={wo.finishedProduct} />
          <Field label="BOM Version" value={wo.bomVersion} />
          <Field label="Quantity" value={wo.quantity} />
          <Field label="Priority" value={wo.priority} />
          <Field label="Assigned Operator" value={wo.assignedOperator} />
          <Field label="Start Date" value={wo.startDate} />
          <Field label="Expected Completion Date" value={wo.expectedCompletionDate} />
          <Field label="Created Date" value={wo.createdDate} />
          <Field label="Completion Date" value={wo.completionDate ?? "—"} />
          <Field label="Current Stage" value={wo.currentStage} />
          <Field label="Status" value={wo.status} />
          <div className="sm:col-span-2">
            <Field
              label="Finished Goods Specification"
              value={wo.finishedGoodsSpecification}
            />
          </div>
          <div className="sm:col-span-2">
            <Field label="Remarks" value={wo.remarks || "—"} />
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link to="/work-orders/$id/edit" params={{ id }}>
            <Button variant="outline">Edit</Button>
          </Link>
          <Link to="/work-orders">
            <Button variant="outline">Back to Work Orders</Button>
          </Link>
        </div>
      </div>

      <div className="space-y-4">
        <div className="surface-card p-5">
          <h2 className="text-sm font-semibold text-foreground">Assembly Exceptions</h2>
          <ul className="mt-3 space-y-3">
            {woExceptions.length === 0 ? (
              <li className="text-sm text-muted-foreground">No exceptions raised.</li>
            ) : (
              woExceptions.map((e) => (
                <li key={e.id} className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">{e.type}</p>
                    <p className="text-xs text-muted-foreground">{e.assignedManager}</p>
                  </div>
                  <StatusBadge value={e.status} />
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="surface-card p-5">
          <h2 className="text-sm font-semibold text-foreground">Rework & Scrap</h2>
          <ul className="mt-3 space-y-3">
            {woRework.length === 0 ? (
              <li className="text-sm text-muted-foreground">No rework or scrap recorded.</li>
            ) : (
              woRework.map((r) => (
                <li key={r.id} className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {r.type} · {r.reasonCode}
                    </p>
                    <p className="text-xs text-muted-foreground">Cost impact {r.costImpact}</p>
                  </div>
                  <StatusBadge value={r.approvalStatus} />
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="surface-card p-5">
          <h2 className="text-sm font-semibold text-foreground">Finished Goods</h2>
          <ul className="mt-3 space-y-2">
            {woGoods.length === 0 ? (
              <li className="text-sm text-muted-foreground">No serial generated yet.</li>
            ) : (
              woGoods.map((f) => (
                <li key={f.serialNumber} className="flex items-center justify-between gap-2">
                  <span className="text-sm text-foreground">{f.serialNumber}</span>
                  <StatusBadge value={f.status} />
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="surface-card p-5">
          <h2 className="text-sm font-semibold text-foreground">Assembly Certificate</h2>
          {woCerts.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">No certificate generated yet.</p>
          ) : (
            woCerts.map((c) => (
              <div key={c.certificateNumber} className="mt-3 flex items-center justify-between">
                <span className="text-sm text-foreground">{c.certificateNumber}</span>
                <Link to="/certificates/$number" params={{ number: c.certificateNumber }}>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
