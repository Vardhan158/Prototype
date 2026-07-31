import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Printer, Route as RouteIcon, ScanBarcode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader, SectionCard, StatusBadge } from "@/apps/warehouse-flow/components/ui-kit";
import { pickLists } from "@/apps/warehouse-flow/data";

export const Route = createFileRoute("/warehouse-flow/pick-lists")({
  head: () => ({
    meta: [
      { title: "Pick Lists — WMS Console" },
      {
        name: "description",
        content:
          "Optimised picking sequences by warehouse, rack and bin with picker assignment and live pick status.",
      },
      { property: "og:title", content: "Pick Lists — WMS Console" },
      {
        property: "og:description",
        content: "Optimised warehouse picking sequences with picker assignment and status.",
      },
    ],
  }),
  component: PickListPage,
});

function PickListPage() {
  const groups = Array.from(new Set(pickLists.map((p) => p.list)));

  return (
    <>
      <PageHeader
        title="Pick Lists"
        description="Optimised picking sequences generated from reserved material requests."
        breadcrumbs={[{ label: "Home", to: "/warehouse-flow/" }, { label: "Pick Lists" }]}
        actions={
          <>
            <Button variant="outline" onClick={() => toast.success("Pick lists sent to printer")}>
              <Printer className="size-4" /> Print Lists
            </Button>
            <Link to="/warehouse-flow/picking">
              <Button>
                <ScanBarcode className="size-4" /> Start Picking
              </Button>
            </Link>
          </>
        }
      />

      <div className="space-y-4">
        {groups.map((g) => {
          const rows = pickLists.filter((p) => p.list === g);
          const done = rows.filter((r) => r.status === "Picked").length;
          return (
            <SectionCard
              key={g}
              title={g}
              description={`${rows.length} lines · ${rows[0]?.warehouse} · picker ${rows[0]?.picker}`}
              bodyClassName="p-0"
              actions={
                <Badge variant="outline" className="num">
                  {done}/{rows.length} picked
                </Badge>
              }
            >
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/60">
                      <TableHead className="w-14">Seq</TableHead>
                      <TableHead>Pick ID</TableHead>
                      <TableHead>Warehouse</TableHead>
                      <TableHead>Rack / Bin</TableHead>
                      <TableHead>Material</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead>Picker</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((p) => (
                      <TableRow key={p.pickId}>
                        <TableCell>
                          <span className="num grid size-7 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                            {p.seq}
                          </span>
                        </TableCell>
                        <TableCell className="num text-sm font-semibold">{p.pickId}</TableCell>
                        <TableCell className="num text-sm">{p.warehouse}</TableCell>
                        <TableCell className="num text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <RouteIcon className="size-3.5" />
                            {p.zone} · {p.rack} · {p.bin}
                          </span>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm font-medium">{p.material}</p>
                          <p className="num text-xs text-muted-foreground">{p.code}</p>
                        </TableCell>
                        <TableCell className="num text-right text-sm font-semibold">{p.qty}</TableCell>
                        <TableCell className="text-sm">{p.picker}</TableCell>
                        <TableCell><StatusBadge status={p.status} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </SectionCard>
          );
        })}
      </div>
    </>
  );
}
