import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";

import { AppShell } from "@/components/ams/AppShell";
import { StatusBadge } from "@/components/ams/StatusBadge";
import { useAms } from "@/lib/ams/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/work-orders/$id")({
  head: () => ({
    meta: [
      { title: "Work Order Details — AMS Assembly Management" },
      {
        name: "description",
        content:
          "Assembly work order details: BOM association, component consumption, stage tracking, quality checkpoints and assembly confirmation.",
      },
      { property: "og:title", content: "Work Order Details — AMS Assembly Management" },
      {
        property: "og:description",
        content: "Full assembly execution view for a single work order.",
      },
    ],
  }),
  component: WorkOrderLayout,
});

const TABS = [
  { to: "/work-orders/$id", label: "Details" },
  { to: "/work-orders/$id/bom", label: "BOM Details" },
  { to: "/work-orders/$id/consumption", label: "Component Consumption" },
  { to: "/work-orders/$id/stages", label: "Assembly Progress" },
  { to: "/work-orders/$id/quality", label: "Quality Checkpoints" },
  { to: "/work-orders/$id/confirmation", label: "Assembly Confirmation" },
] as const;

function WorkOrderLayout() {
  const { id } = Route.useParams();
  const { workOrders } = useAms();
  const wo = workOrders.find((w) => w.id === id);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  if (!wo) {
    return (
      <AppShell title="Work Order not found">
        <div className="surface-card p-8 text-sm text-muted-foreground">
          No work order exists with ID {id}.
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title={wo.workOrderNumber}
      description={`${wo.finishedProduct} · BOM ${wo.bomVersion} · Qty ${wo.quantity}`}
      actions={
        <div className="flex items-center gap-2">
          <StatusBadge value={wo.priority} />
          <StatusBadge value={wo.status} />
        </div>
      }
    >
      <div className="no-print surface-card mb-4 flex gap-1 overflow-x-auto p-1.5">
        {TABS.map((t) => {
          const href = t.to.replace("$id", id);
          const active = pathname === href;
          return (
            <Link
              key={t.label}
              to={t.to}
              params={{ id }}
              className={cn(
                "whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              {t.label}
            </Link>
          );
        })}
      </div>
      <Outlet />
    </AppShell>
  );
}
