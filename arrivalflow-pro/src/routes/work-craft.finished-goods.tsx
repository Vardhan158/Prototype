import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import { AppShell } from "@work/components/ams/AppShell";
import { StatusBadge } from "@work/components/ams/StatusBadge";
import { Input } from "@work/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@work/components/ui/table";
import { useAms } from "@work/lib/ams/store";

export const Route = createFileRoute("/work-craft/finished-goods")({
  head: () => ({
    meta: [
      { title: "Finished Goods Serial Registry — AMS" },
      {
        name: "description",
        content:
          "Finished goods serial numbers generated on assembly completion, with full component serial and batch traceability.",
      },
      { property: "og:title", content: "Finished Goods Serial Registry — AMS" },
      {
        property: "og:description",
        content: "BR-086 finished goods serial generation and traceability.",
      },
    ],
  }),
  component: FinishedGoodsPage,
});

function FinishedGoodsPage() {
  const { finishedGoods } = useAms();
  const [query, setQuery] = useState("");

  const rows = finishedGoods.filter((f) =>
    `${f.serialNumber} ${f.workOrderId} ${f.product}`.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <AppShell
      title="Finished Goods"
      description="BR-086 Finished Goods Serial Generation and traceability."
      actions={
        <Input
          className="w-64"
          placeholder="Search serial, work order, product"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      }
    >
      <div className="surface-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Serial Number</TableHead>
                <TableHead>Work Order</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Component Serials</TableHead>
                <TableHead>Batch Numbers</TableHead>
                <TableHead>Completion Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                    No finished goods match your search.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((f) => (
                  <TableRow key={f.serialNumber}>
                    <TableCell className="font-medium">{f.serialNumber}</TableCell>
                    <TableCell>
                      <Link
                        to="/work-craft/work-orders/$id"
                        params={{ id: f.workOrderId }}
                        className="text-primary hover:underline"
                      >
                        {f.workOrderId}
                      </Link>
                    </TableCell>
                    <TableCell>{f.product}</TableCell>
                    <TableCell className="max-w-xs text-xs text-muted-foreground">
                      {f.consumedComponentSerials.join(", ") || "—"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {f.batchNumbers.join(", ")}
                    </TableCell>
                    <TableCell>{f.completionDate}</TableCell>
                    <TableCell>
                      <StatusBadge value={f.status} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AppShell>
  );
}
