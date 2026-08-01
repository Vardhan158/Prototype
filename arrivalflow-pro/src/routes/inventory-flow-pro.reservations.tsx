import { createFileRoute } from "@tanstack/react-router";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { RESERVATIONS } from "@/apps/inventory-flow-pro/lib/wms/data";
import { PageHeader, SectionCard, SeverityChip, StatTile, ToneChip } from "@/apps/inventory-flow-pro/components/wms/primitives";

export const Route = createFileRoute("/inventory-flow-pro/reservations")({
  head: () => ({
    meta: [
      { title: "Reservation Management | AXIOM WMS" },
      { name: "description", content: "Reservation queue with reserved versus available quantity, priority, expiry risk and release control." },
      { property: "og:title", content: "Reservation Management | AXIOM WMS" },
      { property: "og:description", content: "Manage hard allocations and release expiring reservations." },
    ],
  }),
  component: ReservationScreen,
});

function ReservationScreen() {
  const active = RESERVATIONS.filter((r) => r.status === "Active").length;
  const expiring = RESERVATIONS.filter((r) => r.status === "Expiring").length;
  const expired = RESERVATIONS.filter((r) => r.status === "Expired").length;
  const qty = RESERVATIONS.reduce((s, r) => s + r.reservedQty, 0);

  return (
    <>
      <PageHeader
        eyebrow="Screen 7 · Allocation control"
        title="Reservation Management"
        description="Only AVAILABLE stock can be reserved. Reservations auto-release at expiry unless extended by the inventory manager."
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Active reservations" value={active} tone="teal" />
        <StatTile label="Expiring within 24h" value={expiring} tone="warning" />
        <StatTile label="Expired — pending release" value={expired} tone="danger" />
        <StatTile label="Total reserved quantity" value={qty} unit="units" tone="primary" />
      </div>

      <SectionCard title="Reservation queue" subtitle={`${RESERVATIONS.length} reservations`} padded={false}>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reservation</TableHead>
                <TableHead>Material</TableHead>
                <TableHead>Requested by</TableHead>
                <TableHead className="text-right">Reserved</TableHead>
                <TableHead className="text-right">Available</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {RESERVATIONS.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="num text-xs font-semibold">
                    {r.id}
                    <span className="block text-[11px] font-normal text-muted-foreground">{r.request}</span>
                  </TableCell>
                  <TableCell className="max-w-[220px] truncate text-xs">{r.material}</TableCell>
                  <TableCell className="text-xs">
                    {r.requestedBy}
                    <span className="block text-[11px] text-muted-foreground">{r.department}</span>
                  </TableCell>
                  <TableCell className="num text-right text-xs font-medium">{r.reservedQty}</TableCell>
                  <TableCell className="num text-right text-xs">{r.availableQty}</TableCell>
                  <TableCell><SeverityChip severity={r.priority} /></TableCell>
                  <TableCell className="num text-[11px] text-muted-foreground">
                    {new Date(r.expiry).toLocaleString("en-GB")}
                  </TableCell>
                  <TableCell>
                    <ToneChip tone={r.status === "Active" ? "success" : r.status === "Expiring" ? "warning" : "danger"}>
                      {r.status}
                    </ToneChip>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2 text-[11px]"
                      onClick={() =>
                        toast.success(`${r.id} released`, {
                          description: `${r.reservedQty} units returned to unrestricted stock. ${r.requestedBy} notified.`,
                        })
                      }
                    >
                      Release
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </SectionCard>
    </>
  );
}
