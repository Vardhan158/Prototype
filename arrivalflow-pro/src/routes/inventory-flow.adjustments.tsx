import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Clock, Download, FilePlus2, Search, XCircle } from "lucide-react";
import { toast } from "sonner";

import { DataTable, type Column } from "@/apps/inventory-flow/components/DataTable";
import { KpiCard } from "@/apps/inventory-flow/components/KpiCard";
import { PageHeader } from "@/apps/inventory-flow/components/PageHeader";
import { SectionCard } from "@/apps/inventory-flow/components/SectionCard";
import { StatusBadge } from "@/apps/inventory-flow/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { WAREHOUSES, adjustments, formatNumber, inventory } from "@/apps/inventory-flow/lib/data";
import type { Adjustment } from "@/apps/inventory-flow/lib/types";
import { exportRows } from "@/apps/inventory-flow/lib/export";
import { useMockLoading } from "@/apps/inventory-flow/lib/useMockLoading";

export const Route = createFileRoute("/inventory-flow/adjustments")({
  head: () => ({
    meta: [
      { title: "Stock Adjustments — VoltCore WMS" },
      {
        name: "description",
        content:
          "Raise inventory adjustments with reason codes and route them through draft, submitted, approved and completed workflow states.",
      },
      { property: "og:title", content: "Stock Adjustments — VoltCore WMS" },
      {
        property: "og:description",
        content: "Inventory adjustment workflow with supervisor approval and full adjustment history.",
      },
    ],
  }),
  component: AdjustmentsPage,
});

const REASONS = [
  "Physical Count Variance",
  "Damage in Handling",
  "Scrap Write-Off",
  "System Correction",
  "Vendor Short Supply",
  "Quality Rejection",
];

const WORKFLOW = ["Draft", "Submitted", "Approved", "Rejected", "Completed"] as const;

function AdjustmentsPage() {
  const loading = useMockLoading();
  const [query, setQuery] = useState("");
  const [materialId, setMaterialId] = useState(inventory[0]?.id ?? "");
  const [adjustedQty, setAdjustedQty] = useState("");
  const [reason, setReason] = useState(REASONS[0]!);
  const [remarks, setRemarks] = useState("");
  const [needsApproval, setNeedsApproval] = useState(true);
  const [records, setRecords] = useState<Adjustment[]>(adjustments);

  const material = inventory.find((i) => i.id === materialId);

  const rows = useMemo(
    () =>
      records.filter((a) =>
        [a.id, a.materialName, a.materialCode, a.warehouse, a.reasonCode, a.status]
          .join(" ")
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [records, query],
  );

  const columns: Column<Adjustment>[] = [
    { key: "id", header: "Adjustment ID", value: (r) => r.id, className: "num font-medium" },
    { key: "materialCode", header: "Material Code", value: (r) => r.materialCode, className: "num" },
    { key: "materialName", header: "Material", value: (r) => r.materialName },
    { key: "warehouse", header: "Warehouse", value: (r) => r.warehouse },
    { key: "currentQty", header: "Current", align: "right", value: (r) => r.currentQty },
    { key: "adjustedQty", header: "Adjusted", align: "right", value: (r) => r.adjustedQty },
    {
      key: "delta",
      header: "Delta",
      align: "right",
      value: (r) => r.adjustedQty - r.currentQty,
      render: (r) => {
        const d = r.adjustedQty - r.currentQty;
        return (
          <span
            className="num font-medium"
            style={{ color: d >= 0 ? "var(--color-status-available)" : "var(--color-status-damaged)" }}
          >
            {d > 0 ? "+" : ""}
            {d}
          </span>
        );
      },
    },
    { key: "reasonCode", header: "Reason Code", value: (r) => r.reasonCode },
    { key: "requestedBy", header: "Requested By", value: (r) => r.requestedBy },
    { key: "approver", header: "Approver", value: (r) => r.approver },
    { key: "status", header: "Status", value: (r) => r.status, render: (r) => <StatusBadge status={r.status} /> },
    { key: "date", header: "Date", value: (r) => r.date, className: "num" },
  ];

  const submit = () => {
    if (!material || !adjustedQty) {
      toast.error("Incomplete form", { description: "Select a material and enter the adjusted quantity." });
      return;
    }
    const next: Adjustment = {
      id: `ADJ-${7300 + records.length + 1}`,
      materialCode: material.materialCode,
      materialName: material.materialName,
      warehouse: material.warehouse,
      currentQty: material.available,
      adjustedQty: Number(adjustedQty),
      reasonCode: reason,
      remarks,
      requestedBy: "R. Krishnan",
      approver: needsApproval ? "M. Fernandes" : "—",
      status: needsApproval ? "Submitted" : "Completed",
      date: "2026-07-31",
    };
    setRecords((r) => [next, ...r]);
    setAdjustedQty("");
    setRemarks("");
    toast.success(`Adjustment ${next.id} created`, {
      description: needsApproval ? "Routed to supervisor for approval." : "Posted directly to inventory.",
    });
  };

  return (
    <div className="mx-auto max-w-[1600px]">
      <PageHeader
        title="Stock Adjustments"
        description="Quantity corrections with reason codes and supervisor approval · BR-062"
        breadcrumbs={[{ label: "Inventory Management", to: "/" }, { label: "Stock Adjustments" }]}
        actions={
          <Button variant="outline" size="sm" onClick={() => exportRows(rows, "stock-adjustments", "csv")}>
            <Download className="mr-1.5 size-4" /> Export
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Draft"
          value={formatNumber(records.filter((r) => r.status === "Draft").length)}
          icon={FilePlus2}
          tone="out"
          loading={loading}
        />
        <KpiCard
          label="Awaiting Approval"
          value={formatNumber(records.filter((r) => r.status === "Submitted").length)}
          icon={Clock}
          tone="quarantine"
          loading={loading}
        />
        <KpiCard
          label="Approved"
          value={formatNumber(records.filter((r) => r.status === "Approved").length)}
          icon={CheckCircle2}
          tone="available"
          loading={loading}
        />
        <KpiCard
          label="Rejected"
          value={formatNumber(records.filter((r) => r.status === "Rejected").length)}
          icon={XCircle}
          tone="damaged"
          loading={loading}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[380px_minmax(0,1fr)]">
        <SectionCard title="New Adjustment" description="All fields are validated before submission">
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Material</Label>
              <Select value={materialId} onValueChange={setMaterialId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {inventory.slice(0, 30).map((i) => (
                    <SelectItem key={i.id} value={i.id}>
                      {i.materialCode} · {i.materialName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Warehouse</Label>
              <Select value={material?.warehouse ?? WAREHOUSES[0]} disabled>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WAREHOUSES.map((w) => (
                    <SelectItem key={w} value={w}>
                      {w}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Current quantity</Label>
                <Input readOnly value={material?.available ?? 0} className="num bg-muted" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="adj">Adjusted quantity</Label>
                <Input
                  id="adj"
                  type="number"
                  value={adjustedQty}
                  onChange={(e) => setAdjustedQty(e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Reason code</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REASONS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="remarks">Remarks</Label>
              <Textarea
                id="remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Describe the reason for this correction…"
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
              <div>
                <p className="text-sm font-medium">Supervisor approval</p>
                <p className="text-xs text-muted-foreground">Required above 5% deviation</p>
              </div>
              <Switch checked={needsApproval} onCheckedChange={setNeedsApproval} />
            </div>

            <div className="flex gap-2 pt-1">
              <Button variant="outline" className="flex-1" onClick={() => toast.info("Saved as draft")}>
                Save draft
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button className="flex-1">Submit</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Submit stock adjustment?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This posts a quantity correction against {material?.materialCode}. The movement is auditable and
                      cannot be deleted once approved.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={submit}>Confirm submission</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </SectionCard>

        <div className="space-y-4">
          <SectionCard title="Approval Workflow" description="Adjustment lifecycle states">
            <div className="flex flex-wrap items-center gap-2">
              {WORKFLOW.map((step, i) => (
                <div key={step} className="flex items-center gap-2">
                  <div className="rounded-lg border border-border px-3 py-2 text-center">
                    <p className="text-xs font-medium">{step}</p>
                    <p className="num text-[11px] text-muted-foreground">
                      {records.filter((r) => r.status === step).length} items
                    </p>
                  </div>
                  {i < WORKFLOW.length - 1 && <span className="text-muted-foreground">→</span>}
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Adjustment History" bodyClassName="p-0">
            <div className="border-b border-border p-4">
              <div className="relative max-w-sm">
                <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search adjustments…"
                  className="h-9 pl-8"
                />
              </div>
            </div>
            <DataTable rows={rows} columns={columns} loading={loading} pageSize={8} />
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
