import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAms } from "@/lib/ams/store";

export const Route = createFileRoute("/work-orders/$id/consumption")({
  component: ConsumptionPage,
});

function ConsumptionPage() {
  const { id } = Route.useParams();
  const { workOrders, recordConsumption } = useAms();
  const wo = workOrders.find((w) => w.id === id);
  const [draft, setDraft] = useState<Record<string, number>>({});
  if (!wo) return null;

  const overConsumed = wo.bom.filter((c) => c.consumedQuantity > c.requiredQuantity);

  return (
    <div className="space-y-4">
      {overConsumed.length > 0 ? (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/8 p-4">
          <AlertTriangle className="mt-0.5 size-5 text-destructive" />
          <div>
            <p className="text-sm font-medium text-destructive">Variance Warning</p>
            <p className="text-sm text-muted-foreground">
              Consumed quantity exceeds BOM for:{" "}
              {overConsumed.map((c) => c.componentCode).join(", ")}.
            </p>
          </div>
        </div>
      ) : null}

      <div className="surface-card overflow-hidden">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold text-foreground">Component Consumption</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            BR-081 Component Consumption Tracking. Record actual quantity consumed against the
            expected BOM quantity.
          </p>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Component</TableHead>
                <TableHead>Batch Number</TableHead>
                <TableHead className="text-right">Expected Quantity</TableHead>
                <TableHead className="text-right">Actual Quantity</TableHead>
                <TableHead className="text-right">Difference</TableHead>
                <TableHead className="text-right">Record</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {wo.bom.map((c) => {
                const value = draft[c.componentCode] ?? c.consumedQuantity;
                const diff = value - c.requiredQuantity;
                return (
                  <TableRow key={c.componentCode}>
                    <TableCell>
                      <p className="font-medium text-foreground">{c.componentName}</p>
                      <p className="text-xs text-muted-foreground">{c.componentCode}</p>
                    </TableCell>
                    <TableCell>{c.batchNumber}</TableCell>
                    <TableCell className="text-right">{c.requiredQuantity}</TableCell>
                    <TableCell className="text-right">
                      <Input
                        type="number"
                        min={0}
                        className="ml-auto w-24 text-right"
                        value={value}
                        onChange={(e) =>
                          setDraft((d) => ({
                            ...d,
                            [c.componentCode]: Number(e.target.value),
                          }))
                        }
                      />
                    </TableCell>
                    <TableCell
                      className={
                        diff > 0
                          ? "text-right font-medium text-destructive"
                          : "text-right font-medium"
                      }
                    >
                      {diff > 0 ? `+${diff}` : diff}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => recordConsumption(id, c.componentCode, value)}
                      >
                        Save
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
