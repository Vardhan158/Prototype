import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CalendarPlus, CheckCircle2, ClipboardList, Download, Search, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { DataTable, type Column } from "@/apps/inventory-flow/components/DataTable";
import { KpiCard } from "@/apps/inventory-flow/components/KpiCard";
import { PageHeader } from "@/apps/inventory-flow/components/PageHeader";
import { SectionCard } from "@/apps/inventory-flow/components/SectionCard";
import { StatusBadge } from "@/apps/inventory-flow/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { WAREHOUSES, ZONES, auditLines, cycleCounts, formatNumber } from "@/apps/inventory-flow/lib/data";
import type { AuditLine, CycleCount } from "@/apps/inventory-flow/lib/types";
import { exportRows } from "@/apps/inventory-flow/lib/export";
import { useMockLoading } from "@/apps/inventory-flow/lib/useMockLoading";

export const Route = createFileRoute("/inventory-flow/cycle-count")({
  head: () => ({
    meta: [
      { title: "Cycle Count & Audit — VoltCore WMS" },
      {
        name: "description",
        content:
          "Schedule cycle counts by warehouse zone, record physical inventory audits and review variance approvals.",
      },
      { property: "og:title", content: "Cycle Count & Audit — VoltCore WMS" },
      {
        property: "og:description",
        content: "Cycle count scheduling, physical audit capture and variance reporting for plant warehouses.",
      },
    ],
  }),
  component: CycleCountPage,
});

const axis = { stroke: "var(--color-muted-foreground)", fontSize: 11, tickLine: false, axisLine: false };
const tooltipStyle = {
  contentStyle: {
    background: "var(--color-card)",
    border: "1px solid var(--color-border)",
    borderRadius: "0.5rem",
    fontSize: "12px",
    color: "var(--color-foreground)",
  },
};

function CycleCountPage() {
  const loading = useMockLoading();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const counts = useMemo(
    () =>
      cycleCounts.filter((c) =>
        [c.id, c.warehouse, c.zone, c.assignedUser].join(" ").toLowerCase().includes(query.toLowerCase()),
      ),
    [query],
  );

  const withVariance = auditLines.map((a) => ({
    ...a,
    variance: a.physicalQty - a.systemQty,
    variancePct: Number((((a.physicalQty - a.systemQty) / Math.max(1, a.systemQty)) * 100).toFixed(1)),
  }));

  const countColumns: Column<CycleCount>[] = [
    { key: "id", header: "Count ID", value: (r) => r.id, className: "num font-medium" },
    { key: "warehouse", header: "Warehouse", value: (r) => r.warehouse },
    { key: "zone", header: "Zone", value: (r) => r.zone },
    { key: "frequency", header: "Frequency", value: (r) => r.frequency },
    { key: "assignedUser", header: "Assigned User", value: (r) => r.assignedUser },
    { key: "scheduledDate", header: "Scheduled", value: (r) => r.scheduledDate, className: "num" },
    { key: "itemsPlanned", header: "Items", align: "right", value: (r) => r.itemsPlanned },
    { key: "status", header: "Status", value: (r) => r.status, render: (r) => <StatusBadge status={r.status} /> },
  ];

  type AuditRow = AuditLine & { variance: number; variancePct: number };
  const auditColumns: Column<AuditRow>[] = [
    { key: "id", header: "Audit ID", value: (r) => r.id, className: "num font-medium" },
    { key: "materialName", header: "Material", value: (r) => r.materialName },
    { key: "warehouse", header: "Warehouse", value: (r) => r.warehouse },
    { key: "bin", header: "Bin", value: (r) => r.bin, className: "num" },
    { key: "systemQty", header: "System Qty", align: "right", value: (r) => r.systemQty },
    { key: "physicalQty", header: "Physical Qty", align: "right", value: (r) => r.physicalQty },
    {
      key: "variance",
      header: "Variance",
      align: "right",
      value: (r) => r.variance,
      render: (r) => (
        <span
          className="num font-medium"
          style={{
            color:
              r.variance === 0
                ? "var(--color-status-available)"
                : r.variance > 0
                  ? "var(--color-status-reserved)"
                  : "var(--color-status-damaged)",
          }}
        >
          {r.variance > 0 ? "+" : ""}
          {r.variance}
        </span>
      ),
    },
    { key: "variancePct", header: "Variance %", align: "right", value: (r) => r.variancePct, render: (r) => `${r.variancePct}%` },
    { key: "countedBy", header: "Counted By", value: (r) => r.countedBy },
    {
      key: "approvalStatus",
      header: "Approval",
      value: (r) => r.approvalStatus,
      render: (r) => <StatusBadge status={r.approvalStatus} />,
    },
  ];

  const varianceByWarehouse = WAREHOUSES.map((w) => ({
    warehouse: w.replace(" Warehouse", "").replace(" Store", ""),
    variance: withVariance.filter((a) => a.warehouse === w).reduce((s, a) => s + Math.abs(a.variance), 0),
  }));

  const accuracy = Math.round(
    (withVariance.filter((a) => a.variance === 0).length / Math.max(1, withVariance.length)) * 100,
  );

  return (
    <div className="mx-auto max-w-[1600px]">
      <PageHeader
        title="Cycle Count & Audit"
        description="Count scheduling, physical audit capture and variance approval · BR-060 · BR-061"
        breadcrumbs={[{ label: "Inventory Management", to: "/" }, { label: "Cycle Count & Audit" }]}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => exportRows(withVariance, "variance-report", "excel")}>
              <Download className="mr-1.5 size-4" /> Variance Report
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <CalendarPlus className="mr-1.5 size-4" /> Schedule Count
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Schedule cycle count</DialogTitle>
                  <DialogDescription>Create a recurring count task for a warehouse zone.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Warehouse</Label>
                    <Select defaultValue={WAREHOUSES[0]}>
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
                  <div className="space-y-1.5">
                    <Label>Zone</Label>
                    <Select defaultValue={ZONES[0]}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ZONES.map((z) => (
                          <SelectItem key={z} value={z}>
                            {z}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Frequency</Label>
                    <Select defaultValue="Monthly">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["Daily", "Weekly", "Monthly", "Quarterly"].map((f) => (
                          <SelectItem key={f} value={f}>
                            {f}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="sched">Start date</Label>
                    <Input id="sched" type="date" defaultValue="2026-08-05" />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      setOpen(false);
                      toast.success("Cycle count scheduled", { description: "Task assigned and notification sent." });
                    }}
                  >
                    Schedule
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Scheduled Counts" value={formatNumber(cycleCounts.length)} icon={ClipboardList} loading={loading} />
        <KpiCard
          label="Overdue Counts"
          value={formatNumber(cycleCounts.filter((c) => c.status === "Overdue").length)}
          icon={TriangleAlert}
          tone="damaged"
          loading={loading}
        />
        <KpiCard
          label="Count Accuracy"
          value={`${accuracy}%`}
          icon={CheckCircle2}
          tone="available"
          trend={1.9}
          loading={loading}
        />
        <KpiCard
          label="Pending Approvals"
          value={formatNumber(withVariance.filter((a) => a.approvalStatus === "Pending").length)}
          icon={ClipboardList}
          tone="quarantine"
          loading={loading}
        />
      </div>

      <Tabs defaultValue="schedule" className="mt-4">
        <TabsList>
          <TabsTrigger value="schedule">Scheduled Counts</TabsTrigger>
          <TabsTrigger value="audit">Physical Audit</TabsTrigger>
          <TabsTrigger value="dashboard">Audit Dashboard</TabsTrigger>
        </TabsList>

        <TabsContent value="schedule" className="mt-3">
          <SectionCard bodyClassName="p-0">
            <div className="border-b border-border p-4">
              <div className="relative max-w-sm">
                <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search counts by ID, warehouse or user…"
                  className="h-9 pl-8"
                />
              </div>
            </div>
            <DataTable rows={counts} columns={countColumns} loading={loading} pageSize={10} />
          </SectionCard>
        </TabsContent>

        <TabsContent value="audit" className="mt-3">
          <SectionCard
            title="Physical Inventory Audit"
            description="System vs physical quantity with variance approval · BR-061"
            bodyClassName="p-0"
            actions={
              <Button size="sm" variant="outline" onClick={() => toast.success("Variance batch submitted for approval")}>
                Submit for approval
              </Button>
            }
          >
            <DataTable rows={withVariance} columns={auditColumns} loading={loading} pageSize={10} />
          </SectionCard>
        </TabsContent>

        <TabsContent value="dashboard" className="mt-3">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <SectionCard title="Absolute Variance by Warehouse">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={varianceByWarehouse} barSize={22}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="warehouse" {...axis} />
                  <YAxis {...axis} />
                  <Tooltip cursor={{ fill: "var(--color-accent)" }} {...tooltipStyle} />
                  <Bar dataKey="variance" fill="var(--color-status-quarantine)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </SectionCard>
            <SectionCard title="Approval Summary" bodyClassName="divide-y divide-border">
              {["Approved", "Pending", "Rejected"].map((s) => {
                const n = withVariance.filter((a) => a.approvalStatus === s).length;
                return (
                  <div key={s} className="flex items-center justify-between gap-3 px-4 py-3">
                    <StatusBadge status={s} />
                    <span className="num text-sm font-medium">{n} audit lines</span>
                  </div>
                );
              })}
              <div className="px-4 py-3 text-xs text-muted-foreground">
                Variance tolerance policy: ±2% auto-approved, above threshold requires supervisor sign-off.
              </div>
            </SectionCard>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
