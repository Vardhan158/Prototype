import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Ban, Download, Recycle, ShieldAlert, Wrench } from "lucide-react";
import { toast } from "sonner";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { DataTable, type Column } from "@/apps/inventory-flow/components/DataTable";
import { KpiCard } from "@/apps/inventory-flow/components/KpiCard";
import { PageHeader } from "@/apps/inventory-flow/components/PageHeader";
import { SectionCard } from "@/apps/inventory-flow/components/SectionCard";
import { StatusBadge } from "@/apps/inventory-flow/components/StatusBadge";
import { ChartSkeleton } from "@/apps/inventory-flow/components/Skeletons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency, formatNumber, inventory, quarantineRecords } from "@/apps/inventory-flow/lib/data";
import type { QuarantineRecord } from "@/apps/inventory-flow/lib/types";
import { exportRows } from "@/apps/inventory-flow/lib/export";
import { useMockLoading } from "@/apps/inventory-flow/lib/useMockLoading";

export const Route = createFileRoute("/inventory-flow/quarantine")({
  head: () => ({
    meta: [
      { title: "Damaged & Quarantine Stock — VoltCore WMS" },
      {
        name: "description",
        content:
          "Manage damaged, blocked and quarantined power equipment with inspection notes, disposition workflow and scrap approvals.",
      },
      { property: "og:title", content: "Damaged & Quarantine Stock — VoltCore WMS" },
      {
        property: "og:description",
        content: "Quality hold, inspection and disposition workflow for damaged and quarantined inventory.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: QuarantinePage,
});

const tooltipStyle = {
  contentStyle: {
    background: "var(--color-card)",
    border: "1px solid var(--color-border)",
    borderRadius: "0.5rem",
    fontSize: "12px",
    color: "var(--color-foreground)",
  },
};

const STATUS_COLORS: Record<string, string> = {
  Damaged: "var(--color-status-damaged)",
  Quarantine: "var(--color-status-quarantine)",
  Blocked: "var(--color-status-out)",
  Rejected: "var(--color-status-low)",
};

const TABS = ["all", "Damaged", "Quarantine", "Blocked", "Rejected"] as const;

function QuarantinePage() {
  const loading = useMockLoading();
  const [tab, setTab] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [disposition, setDisposition] = useState<QuarantineRecord | null>(null);

  const rows = useMemo(
    () =>
      quarantineRecords.filter(
        (r) =>
          (tab === "all" || r.status === tab) &&
          [r.id, r.materialName, r.reason, r.inspector, r.warehouse]
            .join(" ")
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [tab, query],
  );

  const costOf = (r: QuarantineRecord) =>
    r.quantity * (inventory.find((i) => i.materialCode === r.materialCode)?.unitCost ?? 0);

  const columns: Column<QuarantineRecord>[] = [
    { key: "id", header: "Record ID", value: (r) => r.id, className: "num font-medium" },
    { key: "materialName", header: "Material", value: (r) => r.materialName },
    { key: "materialCode", header: "Code", value: (r) => r.materialCode, className: "num" },
    { key: "warehouse", header: "Warehouse", value: (r) => r.warehouse },
    {
      key: "quantity",
      header: "Qty",
      align: "right",
      value: (r) => r.quantity,
      render: (r) => `${formatNumber(r.quantity)} ${r.uom}`,
    },
    {
      key: "impact",
      header: "Value Impact",
      align: "right",
      value: (r) => costOf(r),
      render: (r) => <span className="num text-status-damaged">{formatCurrency(costOf(r))}</span>,
    },
    { key: "reason", header: "Reason", value: (r) => r.reason },
    { key: "inspector", header: "Inspector", value: (r) => r.inspector },
    { key: "date", header: "Logged", value: (r) => r.date, className: "num" },
    { key: "status", header: "Status", value: (r) => r.status, render: (r) => <StatusBadge status={r.status} /> },
    {
      key: "actions",
      header: "",
      render: (r) => (
        <Button
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            setDisposition(r);
          }}
        >
          Disposition
        </Button>
      ),
    },
  ];

  const split = ["Damaged", "Quarantine", "Blocked", "Rejected"].map((s) => ({
    name: s,
    value: quarantineRecords.filter((r) => r.status === s).reduce((a, r) => a + r.quantity, 0),
  }));

  const reasonSplit = Array.from(new Set(quarantineRecords.map((r) => r.reason))).map((reason) => ({
    reason,
    qty: quarantineRecords.filter((r) => r.reason === reason).reduce((a, r) => a + r.quantity, 0),
  }));

  const totalValue = quarantineRecords.reduce((a, r) => a + costOf(r), 0);

  return (
    <div className="mx-auto max-w-[1600px]">
      <PageHeader
        title="Damaged & Quarantine Stock"
        description="Quality hold, inspection findings and disposition workflow · BR-068"
        breadcrumbs={[{ label: "Inventory Management", to: "/" }, { label: "Damaged & Quarantine" }]}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => exportRows(rows, "quarantine-register", "excel")}>
              <Download className="mr-1.5 size-4" /> Export Register
            </Button>
            <Button
              size="sm"
              onClick={() =>
                toast.success("Scrap batch raised", { description: "Rejected items routed to scrap approval." })
              }
            >
              <Recycle className="mr-1.5 size-4" /> Raise Scrap Batch
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Damaged Units"
          value={formatNumber(quarantineRecords.filter((r) => r.status === "Damaged").reduce((a, r) => a + r.quantity, 0))}
          icon={AlertTriangle}
          tone="damaged"
          loading={loading}
        />
        <KpiCard
          label="In Quarantine"
          value={formatNumber(
            quarantineRecords.filter((r) => r.status === "Quarantine").reduce((a, r) => a + r.quantity, 0),
          )}
          icon={ShieldAlert}
          tone="quarantine"
          loading={loading}
        />
        <KpiCard
          label="Blocked Records"
          value={formatNumber(quarantineRecords.filter((r) => r.status === "Blocked").length)}
          icon={Ban}
          tone="out"
          loading={loading}
        />
        <KpiCard
          label="Value at Risk"
          value={formatCurrency(totalValue)}
          icon={Wrench}
          tone="low"
          trend={-2.6}
          loading={loading}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <SectionCard title="Hold status split" description="Quantity by hold category">
          {loading ? (
            <ChartSkeleton />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={split} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
                  {split.map((s) => (
                    <Cell key={s.name} fill={STATUS_COLORS[s.name]} />
                  ))}
                </Pie>
                <Tooltip {...tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </SectionCard>

        <SectionCard title="Root cause analysis" description="Quantity held per rejection reason" className="xl:col-span-2">
          {loading ? (
            <ChartSkeleton />
          ) : (
            <ul className="space-y-3">
              {reasonSplit
                .sort((a, b) => b.qty - a.qty)
                .map((r) => {
                  const max = Math.max(...reasonSplit.map((x) => x.qty), 1);
                  return (
                    <li key={r.reason}>
                      <div className="flex items-center justify-between text-xs">
                        <span className="truncate font-medium">{r.reason}</span>
                        <span className="num text-muted-foreground">{formatNumber(r.qty)}</span>
                      </div>
                      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${(r.qty / max) * 100}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
            </ul>
          )}
        </SectionCard>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="mt-4">
        <div className="grid gap-3 sm:flex sm:items-center sm:justify-between">
          <TabsList>
            {TABS.map((t) => (
              <TabsTrigger key={t} value={t}>
                {t === "all" ? "All" : t}
              </TabsTrigger>
            ))}
          </TabsList>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search records…"
            className="sm:max-w-[260px]"
          />
        </div>

        <TabsContent value={tab} className="mt-3">
          <SectionCard
            title="Quality hold register"
            description="BR-068 · Damaged, quarantined and blocked stock with inspection findings"
            bodyClassName=""
          >
            <DataTable rows={rows} columns={columns} loading={loading} pageSize={10} />
          </SectionCard>
        </TabsContent>
      </Tabs>

      <Dialog open={!!disposition} onOpenChange={(o) => !o && setDisposition(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Record disposition</DialogTitle>
            <DialogDescription>
              {disposition?.materialName} · {disposition?.id}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
              {disposition?.inspectionNotes}
            </div>
            <div className="space-y-1.5">
              <Label>Disposition decision</Label>
              <Select defaultValue="Rework">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Release to Stock", "Rework", "Return to Vendor", "Scrap Write-Off"].map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="notes">Inspector remarks</Label>
              <Textarea id="notes" rows={3} placeholder="Findings, test references, corrective action…" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDisposition(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setDisposition(null);
                toast.success("Disposition recorded", { description: "Stock status updated and audit trail written." });
              }}
            >
              Confirm disposition
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
