import { createFileRoute } from "@tanstack/react-router";

import { StatusBadge } from "@/components/ams/StatusBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { bomVariance, useAms } from "@/lib/ams/store";

export const Route = createFileRoute("/work-orders/$id/bom")({
  component: BomDetails,
});

function BomDetails() {
  const { id } = Route.useParams();
  const { workOrders } = useAms();
  const wo = workOrders.find((w) => w.id === id);
  if (!wo) return null;
  const rows = bomVariance(wo);

  return (
    <div className="surface-card overflow-hidden">
      <div className="border-b border-border px-5 py-4">
        <h2 className="text-sm font-semibold text-foreground">
          Bill of Materials — {wo.bomVersion}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          BR-080 Bill of Materials Association. Components are read-only references from the
          material master.
        </p>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Component Name</TableHead>
              <TableHead>Component Code</TableHead>
              <TableHead className="text-right">Required Quantity</TableHead>
              <TableHead className="text-right">Consumed Quantity</TableHead>
              <TableHead className="text-right">Variance</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((c) => {
              const status =
                c.variance > 0
                  ? "Over Consumed"
                  : c.consumedQuantity === 0
                    ? "Not Started"
                    : c.variance < 0
                      ? "In Progress"
                      : "Completed";
              return (
                <TableRow key={c.componentCode}>
                  <TableCell className="font-medium">{c.componentName}</TableCell>
                  <TableCell>{c.componentCode}</TableCell>
                  <TableCell className="text-right">{c.requiredQuantity}</TableCell>
                  <TableCell className="text-right">{c.consumedQuantity}</TableCell>
                  <TableCell
                    className={
                      c.variance > 0
                        ? "text-right font-medium text-destructive"
                        : "text-right font-medium"
                    }
                  >
                    {c.variance > 0 ? `+${c.variance}` : c.variance}
                  </TableCell>
                  <TableCell>
                    <StatusBadge value={status === "Over Consumed" ? "Failed" : status} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
