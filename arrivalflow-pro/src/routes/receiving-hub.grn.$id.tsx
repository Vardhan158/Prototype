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
import { useState } from "react";
import { Download, FileText, Mail, Printer } from "lucide-react";
import { toast } from "sonner";
import { currency } from "@/apps/receiving-hub/lib/wms-data";
import {
  QualityTransferDialog,
  InventoryDialog,
} from "@/apps/receiving-hub/components/wms/dialogs";

export const Route = createFileRoute("/receiving-hub/grn/$id")({
  head: () => ({
    meta: [
      { title: "GRN Document | AXIOM WMS Inbound" },
      {
        name: "description",
        content:
          "Printable goods receipt note with vendor, purchase order, material lines, attachments, print, PDF download and email actions.",
      },
      { property: "og:title", content: "GRN Document | AXIOM WMS Inbound" },
      {
        property: "og:description",
        content:
          "Printable goods receipt note with vendor, purchase order, material lines, attachments, print, PDF download and email actions.",
      },
    ],
  }),
  component: GrnDetail,
});

function GrnDetail() {
  const { id } = Route.useParams();
  const { state } = useWms();
  const [qa, setQa] = useState<string | null>(null);
  const [inv, setInv] = useState<string | null>(null);
  const grn = state.grns.find((g) => g.grn === id);
  const shipment = state.shipments.find((s) => s.grn === id);
  if (!grn)
    return (
      <Card className="elevated-card mx-auto max-w-xl">
        <EmptyState
          icon={FileText}
          title="GRN not found"
          body={`No goods receipt note matches ${id}.`}
          action={
            <Button asChild>
              <Link to="/receiving-hub/grn">Back to GRN list</Link>
            </Button>
          }
        />
      </Card>
    );
  return (
    <div className="mx-auto max-w-[1200px]">
      <PageHeader
        title={grn.grn}
        subtitle={`${grn.vendor} Â· ${grn.po} Â· ${grn.date}`}
        crumbs={[
          { label: "Inbound", to: "/receiving-hub" },
          { label: "GRN", to: "/receiving-hub/grn" },
          { label: grn.grn },
        ]}
        actions={
          <>
            <Button variant="outline" onClick={() => toast.success("Sent to printer HP-DOCK-02")}>
              <Printer className="mr-2 h-4 w-4" /> Print
            </Button>
            <Button variant="outline" onClick={() => toast.success(`${grn.grn}.pdf downloaded`)}>
              <Download className="mr-2 h-4 w-4" /> PDF
            </Button>
            <Button
              variant="outline"
              onClick={() => toast.success("GRN emailed to vendor and procurement")}
            >
              <Mail className="mr-2 h-4 w-4" /> Email
            </Button>
            {shipment && <Button onClick={() => setQa(shipment.id)}>Move to quality</Button>}
            {shipment && (
              <Button variant="secondary" onClick={() => setInv(shipment.id)}>
                Create inventory
              </Button>
            )}
          </>
        }
      />
      <Card className="elevated-card">
        <CardHeader>
          <CardTitle className="text-base">Goods receipt note</CardTitle>
          <CardDescription>
            Posted against {grn.po} Â· {grn.warehouse}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-4">
            <Field label="GRN number" value={grn.grn} mono />
            <Field label="Vendor" value={grn.vendor} />
            <Field label="Warehouse" value={grn.warehouse} mono />
            <Field label="Posting date" value={grn.date} mono />
            <Field label="Lines" value={grn.lines} mono />
            <Field label="Total quantity" value={grn.qty.toLocaleString("en-IN")} mono />
            <Field label="Receipt value" value={currency(grn.value)} mono />
            <Field
              label="Status"
              value={
                <Tone tone={grn.status === "Posted" ? "success" : "warning"}>{grn.status}</Tone>
              }
            />
          </div>
          {shipment && (
            <Table>
              <TableHeader>
                <TableRow className="bg-surface-2/70 hover:bg-surface-2/70">
                  <TableHead>Material</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Accepted</TableHead>
                  <TableHead className="text-right">Rejected</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shipment.lines.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="num text-xs">{l.code}</TableCell>
                    <TableCell className="text-sm">{l.name}</TableCell>
                    <TableCell className="num text-right text-xs">{l.accepted}</TableCell>
                    <TableCell className="num text-right text-xs">
                      {l.rejected + l.damaged}
                    </TableCell>
                    <TableCell className="num text-right text-xs">
                      {currency(l.accepted * l.unitPrice)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      <QualityTransferDialog shipmentId={qa} onClose={() => setQa(null)} />
      <InventoryDialog shipmentId={inv} onClose={() => setInv(null)} />
    </div>
  );
}
