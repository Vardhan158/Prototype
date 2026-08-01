import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ShieldAlert, Unlock, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { SectionCard, StatCard, StatusBadge, Field } from "@/apps/quality-gatekeeper/components/wms/bits";

export const Route = createFileRoute("/quality-gatekeeper/hold")({
  head: () => ({
    meta: [
      { title: "Quality Hold — AXIOM WMS Quality" },
      { name: "description", content: "Blocked stock in quality hold with reason codes, blocked quantities, inspection notes, release and reject actions." },
      { property: "og:title", content: "Quality Hold — AXIOM WMS Quality" },
      { property: "og:description", content: "Blocked stock, reason codes and release or reject decisions." },
    ],
  }),
  component: HoldPage,
});

const HOLD_ROWS = [
  { grn: "GRN-2026-004869", material: "MAT-10220 CR Steel Coil 1.2mm", vendor: "Tata Steel Processing", qty: 4, uom: "COIL", bin: "QA-HOLD-01", reason: "Edge corrosion beyond acceptance limit", status: "Quality Hold", since: "01 Aug, 00:02", ncr: "NCR-2026-0317" },
  { grn: "GRN-2026-004860", material: "MAT-30110 Hex Bolt M12x60 8.8", vendor: "Guangdong Fasteners", qty: 6000, uom: "EA", bin: "QA-HOLD-02", reason: "Zinc plating defect — AQL failure", status: "NCR Created", since: "30 Jul, 15:00", ncr: "NCR-2026-0318" },
  { grn: "GRN-2026-004845", material: "MAT-91002 Bearing 6205 2RS", vendor: "SKF India", qty: 240, uom: "EA", bin: "QA-HOLD-01", reason: "Missing test certificate", status: "Under Review", since: "29 Jul, 10:40", ncr: "—" },
  { grn: "GRN-2026-004822", material: "MAT-22110 Cu Cable 4C x 6sqmm", vendor: "Wenzhou Cable Industries", qty: 1200, uom: "M", bin: "QA-HOLD-03", reason: "Conductor cross-section below spec", status: "RTS", since: "27 Jul, 18:15", ncr: "NCR-2026-0305" },
];

function HoldPage() {
  const [dialog, setDialog] = useState<{ type: "release" | "reject"; row: (typeof HOLD_ROWS)[number] } | null>(null);
  const [note, setNote] = useState("");

  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <header>
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Quality Inspection</p>
        <h1 className="text-2xl font-bold sm:text-3xl">Quality Hold</h1>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Lots on hold" value={HOLD_ROWS.length} sub="Across 3 hold bins" icon={<ShieldAlert className="h-5 w-5" />} tone="warning" />
        <StatCard label="Blocked quantity" value="7,444" sub="Mixed UoM · ₹ 14.2 L value" icon={<ShieldAlert className="h-5 w-5" />} tone="danger" />
        <StatCard label="Awaiting decision" value={2} sub="SLA breach in 6h for 1 lot" icon={<ShieldAlert className="h-5 w-5" />} tone="primary" />
        <StatCard label="Released this week" value={9} sub="1,820 EA returned to stock" icon={<Unlock className="h-5 w-5" />} tone="success" />
      </div>

      <SectionCard title="Blocked stock register" description="Stock is not available for picking while on quality hold">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>GRN</TableHead>
                <TableHead>Material</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead className="text-right">Blocked qty</TableHead>
                <TableHead>Hold bin</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>NCR</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Decision</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {HOLD_ROWS.map((r) => (
                <TableRow key={r.grn}>
                  <TableCell className="num font-mono text-xs font-semibold text-primary">{r.grn}</TableCell>
                  <TableCell className="max-w-[220px] truncate text-xs">{r.material}</TableCell>
                  <TableCell className="text-xs">{r.vendor}</TableCell>
                  <TableCell className="num text-right text-xs font-semibold">{r.qty.toLocaleString()} {r.uom}</TableCell>
                  <TableCell className="num font-mono text-xs">{r.bin}</TableCell>
                  <TableCell className="max-w-[220px] truncate text-xs text-muted-foreground">{r.reason}</TableCell>
                  <TableCell className="num font-mono text-xs">{r.ncr}</TableCell>
                  <TableCell><StatusBadge status={r.status} /></TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <div className="inline-flex gap-1">
                      <Button size="sm" variant="outline" className="h-8 rounded-lg" onClick={() => setDialog({ type: "release", row: r })}>
                        <Unlock className="h-3.5 w-3.5" /> Release
                      </Button>
                      <Button size="sm" variant="destructive" className="h-8 rounded-lg" onClick={() => setDialog({ type: "reject", row: r })}>
                        <XCircle className="h-3.5 w-3.5" /> Reject
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </SectionCard>

      <AlertDialog open={dialog !== null} onOpenChange={(o) => !o && setDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {dialog?.type === "release" ? "Release blocked stock to available inventory?" : "Reject blocked stock and start return?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {dialog?.row.qty.toLocaleString()} {dialog?.row.uom} of {dialog?.row.material} from {dialog?.row.bin}.
              {dialog?.type === "release" ? " A 343 movement is posted and the warehouse is notified." : " An RTS document is created and procurement is notified."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid gap-3">
            <Field label="Reason code" value={dialog?.row.reason ?? ""} />
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Inspection notes / justification (mandatory)…" className="min-h-24" />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                toast[dialog?.type === "release" ? "success" : "error"](
                  dialog?.type === "release" ? "Stock released from quality hold" : "Stock rejected — RTS-2026-0092 created",
                  { description: `${dialog?.row.grn} · ${dialog?.row.qty.toLocaleString()} ${dialog?.row.uom}` },
                );
                setNote("");
                setDialog(null);
              }}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
