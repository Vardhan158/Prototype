import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { FileWarning, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { NCRS } from "@/apps/quality-gatekeeper/lib/wms-data";
import { PriorityPill, SectionCard, StatCard, StatusBadge } from "@/apps/quality-gatekeeper/components/wms/bits";

export const Route = createFileRoute("/quality-gatekeeper/ncr")({
  head: () => ({
    meta: [
      { title: "NCR Register — AXIOM WMS Quality" },
      { name: "description", content: "Non-conformance reports with defect category, root cause, severity, corrective and preventive actions." },
      { property: "og:title", content: "NCR Register — AXIOM WMS Quality" },
      { property: "og:description", content: "Raise and track non-conformance reports with 8D style corrective actions." },
    ],
  }),
  component: NcrPage,
});

function NcrPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <div className="min-w-0">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Quality Inspection</p>
          <h1 className="truncate text-2xl font-bold sm:text-3xl">NCR Register</h1>
        </div>
        <Button className="shrink-0 rounded-xl" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> New NCR
        </Button>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Open NCRs" value={3} sub="1 critical · SLA 48h" icon={<FileWarning className="h-5 w-5" />} tone="danger" />
        <StatCard label="Closed MTD" value={24} sub="Avg closure 6.2 days" icon={<FileWarning className="h-5 w-5" />} tone="success" />
        <StatCard label="Rework in progress" value={1} sub="900 EA at supplier" icon={<FileWarning className="h-5 w-5" />} tone="warning" />
        <StatCard label="Cost of poor quality" value="₹ 13.4 L" sub="Month to date" icon={<FileWarning className="h-5 w-5" />} tone="primary" />
      </div>

      <SectionCard title="Non-conformance reports" description="Raised against goods receipts and supplier lots">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>NCR</TableHead>
                <TableHead>GRN</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Defect category</TableHead>
                <TableHead>Root cause</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {NCRS.map((n) => (
                <TableRow key={n.id}>
                  <TableCell className="num font-mono text-xs font-semibold text-primary">{n.id}</TableCell>
                  <TableCell className="num font-mono text-xs">{n.grn}</TableCell>
                  <TableCell className="max-w-[190px] truncate text-xs">{n.vendor}</TableCell>
                  <TableCell className="text-xs">{n.category}</TableCell>
                  <TableCell className="max-w-[220px] truncate text-xs text-muted-foreground">{n.rootCause}</TableCell>
                  <TableCell><PriorityPill priority={n.severity} /></TableCell>
                  <TableCell className="num text-right text-xs font-semibold">{n.qty.toLocaleString()}</TableCell>
                  <TableCell className="text-xs">{n.dept}</TableCell>
                  <TableCell className="text-xs">{n.owner}</TableCell>
                  <TableCell><StatusBadge status={n.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </SectionCard>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[88vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Non-Conformance Report</DialogTitle>
            <DialogDescription>NCR-2026-0320 will be routed to supplier quality for 8D response.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="text-xs">NCR number</Label>
              <Input readOnly value="NCR-2026-0320" className="num mt-1.5 font-mono" />
            </div>
            <div>
              <Label className="text-xs">Reference GRN</Label>
              <Select defaultValue="GRN-2026-004872">
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="GRN-2026-004871">GRN-2026-004871</SelectItem>
                  <SelectItem value="GRN-2026-004872">GRN-2026-004872</SelectItem>
                  <SelectItem value="GRN-2026-004873">GRN-2026-004873</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Defect category</Label>
              <Select defaultValue="Material Damage">
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Material Damage", "Dimensional Non-Conformance", "Surface Finish Defect", "Documentation Missing", "Wrong Item Supplied"].map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Severity</Label>
              <Select defaultValue="Major">
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Minor">Minor</SelectItem>
                  <SelectItem value="Major">Major</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs">Description</Label>
              <Textarea className="mt-1.5 min-h-20" defaultValue="Seal kits received with hardened NBR rings; shore hardness measured 82 against specification 70 ± 5." />
            </div>
            <div>
              <Label className="text-xs">Root cause</Label>
              <Textarea className="mt-1.5 min-h-20" defaultValue="Supplier used substitute compound batch without change notification." />
            </div>
            <div>
              <Label className="text-xs">Immediate action</Label>
              <Textarea className="mt-1.5 min-h-20" defaultValue="Quarantine 648 EA in QA-HOLD-02 and stop line issue." />
            </div>
            <div>
              <Label className="text-xs">Corrective action</Label>
              <Textarea className="mt-1.5 min-h-20" defaultValue="Replacement lot with COA to be shipped within 5 working days." />
            </div>
            <div>
              <Label className="text-xs">Preventive action</Label>
              <Textarea className="mt-1.5 min-h-20" defaultValue="Add hardness test to incoming inspection plan QP-4408 for all elastomer parts." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => {
                setOpen(false);
                toast.error("NCR-2026-0320 submitted", { description: "Supplier quality and procurement notified." });
              }}
            >
              Submit NCR
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
