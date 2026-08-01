import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Undo2, Truck, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { RTS_LIST, PHOTOS } from "@/apps/quality-gatekeeper/lib/wms-data";
import { Field, SectionCard, StatCard, StatusBadge } from "@/apps/quality-gatekeeper/components/wms/bits";
import { PhotoGallery } from "@/apps/quality-gatekeeper/components/wms/PhotoGallery";

export const Route = createFileRoute("/quality-gatekeeper/rts")({
  head: () => ({
    meta: [
      { title: "Return To Supplier — AXIOM WMS Quality" },
      { name: "description", content: "Return-to-supplier documents with rejected items, reasons, photo evidence, approvals and transport details." },
      { property: "og:title", content: "Return To Supplier — AXIOM WMS Quality" },
      { property: "og:description", content: "RTS documents, approvals and transport tracking for rejected material." },
    ],
  }),
  component: RtsPage,
});

function RtsPage() {
  const [approve, setApprove] = useState<string | null>(null);
  const [selected, setSelected] = useState(RTS_LIST[0]!);

  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <header>
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Quality Inspection</p>
        <h1 className="text-2xl font-bold sm:text-3xl">Return To Supplier</h1>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Open returns" value={3} sub="₹ 13.5 L return value" icon={<Undo2 className="h-5 w-5" />} tone="danger" />
        <StatCard label="Pending approval" value={1} sub="Quality Manager sign-off" icon={<CheckCircle2 className="h-5 w-5" />} tone="warning" />
        <StatCard label="Awaiting pickup" value={1} sub="Blue Dart · MH-04-TT-8891" icon={<Truck className="h-5 w-5" />} tone="primary" />
        <StatCard label="Dispatched MTD" value={7} sub="Avg turnaround 4.1 days" icon={<Truck className="h-5 w-5" />} tone="success" />
      </div>

      <SectionCard title="RTS documents" description="Click a row to view return note, evidence and transport details">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>RTS</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>GRN / NCR</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Value</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {RTS_LIST.map((r) => (
                <TableRow key={r.id} className="cursor-pointer" onClick={() => setSelected(r)}>
                  <TableCell className="num font-mono text-xs font-semibold text-primary">{r.id}</TableCell>
                  <TableCell className="max-w-[200px] truncate text-xs">{r.vendor}</TableCell>
                  <TableCell className="num font-mono text-[11px]">{r.grn}<br />{r.ncr}</TableCell>
                  <TableCell className="num text-right text-xs font-semibold">{r.qty.toLocaleString()} {r.uom}</TableCell>
                  <TableCell className="num text-right text-xs">{r.value}</TableCell>
                  <TableCell className="max-w-[220px] truncate text-xs text-muted-foreground">{r.reason}</TableCell>
                  <TableCell><StatusBadge status={r.status} /></TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <Button size="sm" variant={r.status === "Pending Approval" ? "default" : "outline"} className="h-8 rounded-lg" onClick={() => setApprove(r.id)}>
                      {r.status === "Pending Approval" ? "Approve" : "Track"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </SectionCard>

      <div className="grid gap-5 xl:grid-cols-3">
        <SectionCard className="xl:col-span-2" title={`Return note ${selected.note}`} description={`${selected.id} · ${selected.vendor}`}>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
            <Field label="Vendor" value={selected.vendor} />
            <Field label="Reference GRN" value={selected.grn} mono />
            <Field label="NCR" value={selected.ncr} mono />
            <Field label="Return quantity" value={`${selected.qty.toLocaleString()} ${selected.uom}`} />
            <Field label="Transporter" value={selected.transporter} />
            <Field label="Vehicle" value={selected.vehicle} mono />
            <Field label="Approved by" value={selected.approvedBy} />
            <Field label="Status" value={<StatusBadge status={selected.status} />} />
          </div>
          <div className="mt-5 rounded-xl bg-muted/60 p-4 text-xs text-muted-foreground">
            <strong className="text-foreground">Reason for return:</strong> {selected.reason}. Debit note to be raised against the vendor invoice; replacement lot expected within contractual lead time.
          </div>
        </SectionCard>

        <SectionCard title="Evidence" description="Attached from inspection and NCR">
          <PhotoGallery
            className="grid-cols-2 lg:grid-cols-2"
            photos={[
              { src: PHOTOS.damage, label: "Rejected material", meta: selected.ncr },
              { src: PHOTOS.label, label: "Lot label", meta: selected.grn },
            ]}
          />
        </SectionCard>
      </div>

      <AlertDialog open={approve !== null} onOpenChange={(o) => !o && setApprove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve return to supplier {approve}?</AlertDialogTitle>
            <AlertDialogDescription>
              A 122 return delivery is posted in EWM, the debit note is triggered and procurement plus the vendor portal are notified.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { toast.success(`${approve} approved`, { description: "Procurement notified · pickup scheduled" }); setApprove(null); }}>
              Approve return
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
