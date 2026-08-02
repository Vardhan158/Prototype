import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  PageHeader,
  StatusPill,
  Tone,
  Field,
  EmptyState,
} from "@/apps/receiving-hub/components/wms/primitives";
import { useWms } from "@/apps/receiving-hub/lib/wms-store";

export const Route = createFileRoute("/receiving-hub/inventory")({
  head: () => ({
    meta: [
      { title: "Inventory Creation | AXIOM WMS Inbound" },
      {
        name: "description",
        content:
          "Inventory generated from posted GRNs with zone, temporary location and put-away status.",
      },
      { property: "og:title", content: "Inventory Creation | AXIOM WMS Inbound" },
      {
        property: "og:description",
        content:
          "Inventory generated from posted GRNs with zone, temporary location and put-away status.",
      },
    ],
  }),
  component: InventoryPage,
});

function InventoryPage() {
  const { state } = useWms();
  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        title="Inventory"
        subtitle={`${state.inventory.length} stock records created from inbound receipts`}
        crumbs={[{ label: "Inbound", to: "/receiving-hub" }, { label: "Inventory" }]}
      />
      <Card className="elevated-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-surface-2/70 hover:bg-surface-2/70">
              <TableHead>Record</TableHead>
              <TableHead>Material</TableHead>
              <TableHead>GRN</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead>Zone</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {state.inventory.map((i) => (
              <TableRow key={i.id}>
                <TableCell className="num text-xs font-semibold">{i.id}</TableCell>
                <TableCell>
                  <p className="num text-xs">{i.material}</p>
                  <p className="text-xs text-muted-foreground">{i.name}</p>
                </TableCell>
                <TableCell className="num text-xs">{i.grn}</TableCell>
                <TableCell className="num text-right text-xs">
                  {i.qty.toLocaleString("en-IN")} {i.uom}
                </TableCell>
                <TableCell className="text-xs">{i.zone}</TableCell>
                <TableCell className="num text-xs">{i.location}</TableCell>
                <TableCell>
                  <Tone
                    tone={
                      i.status === "Put Away Complete"
                        ? "success"
                        : i.status === "Quality Hold"
                          ? "warning"
                          : "info"
                    }
                  >
                    {i.status}
                  </Tone>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
