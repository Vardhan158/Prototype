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
import { currency } from "@/apps/receiving-hub/lib/wms-data";

export const Route = createFileRoute("/receiving-hub/grn/")({
  head: () => ({
    meta: [
      { title: "Goods Receipt Notes | AXIOM WMS Inbound" },
      {
        name: "description",
        content:
          "Search, review and post goods receipt notes with vendor, purchase order, quantity, value and inspection status.",
      },
      { property: "og:title", content: "Goods Receipt Notes | AXIOM WMS Inbound" },
      {
        property: "og:description",
        content:
          "Search, review and post goods receipt notes with vendor, purchase order, quantity, value and inspection status.",
      },
    ],
  }),
  component: GrnPage,
});

function GrnPage() {
  const { state } = useWms();
  return (
    <div className="mx-auto max-w-[1600px]">
      <PageHeader
        title="Goods Receipt Notes"
        subtitle={`${state.grns.length} GRNs posted this period`}
        crumbs={[{ label: "Inbound", to: "/receiving-hub" }, { label: "GRN" }]}
      />
      <Card className="elevated-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-surface-2/70 hover:bg-surface-2/70">
              <TableHead>GRN</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>PO</TableHead>
              <TableHead>Warehouse</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead className="text-right">Value</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {state.grns.map((g) => (
              <TableRow key={g.grn}>
                <TableCell>
                  <Link
                    to="/receiving-hub/grn/$id"
                    params={{ id: g.grn }}
                    className="num text-xs font-semibold text-primary hover:underline"
                  >
                    {g.grn}
                  </Link>
                </TableCell>
                <TableCell className="text-sm">{g.vendor}</TableCell>
                <TableCell className="num text-xs">{g.po}</TableCell>
                <TableCell className="num text-xs">{g.warehouse}</TableCell>
                <TableCell className="num text-xs">{g.date}</TableCell>
                <TableCell className="num text-right text-xs">
                  {g.qty.toLocaleString("en-IN")}
                </TableCell>
                <TableCell className="num text-right text-xs">{currency(g.value)}</TableCell>
                <TableCell>
                  <Tone
                    tone={
                      g.status === "Posted"
                        ? "success"
                        : g.status === "In Inspection"
                          ? "info"
                          : "warning"
                    }
                  >
                    {g.status}
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
