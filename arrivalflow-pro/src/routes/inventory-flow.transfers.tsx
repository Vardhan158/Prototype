import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeftRight, CheckCircle2, Clock, Download, Plus, Truck } from "lucide-react";
import { toast } from "sonner";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

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
  DialogTrigger,
} from "@/components/ui/dialog";
import { WAREHOUSES, formatNumber, inventory, transfers } from "@/apps/inventory-flow/lib/data";
import type { Transfer } from "@/apps/inventory-flow/lib/types";
import { exportRows } from "@/apps/inventory-flow/lib/export";
import { useMockLoading } from "@/apps/inventory-flow/lib/useMockLoading";

export const Route = createFileRoute("/inventory-flow/transfers")({
  head: () => ({
    meta: [
      { title: "Warehouse Transfers — VoltCore WMS" },
      {
        name: "description",
        content:
          "Raise inter-warehouse stock transfer requests, track approvals, in-transit shipments and goods receipt confirmation.",
      },
      { property: "og:title", content: "Warehouse Transfers — VoltCore WMS" },
      {
        property: "og:description",
        content: "Inter-warehouse transfer requests, approval workflow and in-transit tracking.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TransfersPage,
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

const STATUSES = ["Pending", "Approved", "In Transit", "Received", "Cancelled"] as const;

function TransfersPage() {
  const loading = useMockLoading();
  const [status, setStatus] = useState("all");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [source, setSource] = useState<string>(WAREHOUSES[0]);
  const [destination, setDestination] = useState<string>(WAREHOUSES[1]);

  const rows = useMemo(
    () =>
      transfers.filter(
        (t) =>
          (status === "all" || t.status === status) &&
          [t.id, t.materialName, t.source, t.destination, t.requestedBy]
            .join(" ")
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [status, query],
  );

  const columns: Column<Transfer>[] = [
    { key: "id", header: "Transfer ID", value: (r) => r.id, className: "num font-medium" },
    { key: "materialName", header: "Material", value: (r) => r.materialName },
    { key: "materialCode", header: "Code", value: (r) => r.materialCode, className: "num" },
    {
      key: "route",
      header: "Route",
      render: (r) => (
        <span className="inline-flex items-center gap-1.5 text-xs">
          <span className="truncate">{r.source.replace(" Warehouse", "")}</span>
          <ArrowLeftRight className="size-3 shrink-0 text-muted-foreground" />
          <span className="truncate">{r.destination.replace(" Warehouse", "")}</span>
        </span>
      ),
      value: (r) => `${r.source} ${r.destination}`,
    },
    {
      key: "quantity",
      header: "Qty",
      align: "right",
      value: (r) => r.quantity,
      render: (r) => `${formatNumber(r.quantity)} ${r.uom}`,
    },
    { key: "requestedBy", header: "Requested By", value: (r) => r.requestedBy },
    { key: "approvedBy", header: "Approver", value: (r) => r.approvedBy },
    { key: "requestedDate", header: "Requested", value: (r) => r.requestedDate, className: "num" },
    { key: "eta", header: "ETA", value: (r) => r.eta, className: "num" },
    { key: "priority", header: "Priority", value: (r) => r.priority, render: (r) => <StatusBadge status={r.priority} /> },
    { key: "status", header: "Status", value: (r) => r.status, render: (r) => <StatusBadge status={r.status} /> },
    {
      key: "actions",
      header: "",
      render: (r) =>
        r.status === "Pending" ? (
          <div className="flex gap-1.5">
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                toast.success(`${r.id} approved`, { description: "Stock reserved at source warehouse." });
              }}
            >
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                toast.error(`${r.id} rejected`, { description: "Requester has been notified." });
              }}
            >
              Reject
            </Button>
          </div>
        ) : r.status === "In Transit" ? (
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              toast.success(`${r.id} received`, { description: "Goods receipt posted at destination." });
            }}
          >
            Confirm Receipt
          </Button>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
    },
  ];

  const byRoute = WAREHOUSES.map((w) => ({
    warehouse: w.replace(" Warehouse", "").replace(" Store", ""),
    outbound: transfers.filter((t) => t.source === w).reduce((s, t) => s + t.quantity, 0),
    inbound: transfers.filter((t) => t.destination === w).reduce((s, t) => s + t.quantity, 0),
  }));

  const inTransit = transfers.filter((t) => t.status === "In Transit");
  const pending = transfers.filter((t) => t.status === "Pending");
  const received = transfers.filter((t) => t.status === "Received");

  return (
    <div className="mx-auto max-w-[1600px]">
      <PageHeader
        title="Warehouse Transfers"
        description="Inter-warehouse stock movement requests, approvals and in-transit tracking · BR-067"
        breadcrumbs={[{ label: "Inventory Management", to: "/" }, { label: "Warehouse Transfers" }]}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => exportRows(rows, "warehouse-transfers", "excel")}>
              <Download className="mr-1.5 size-4" /> Export
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-1.5 size-4" /> New Transfer
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-xl">
                <DialogHeader>
                  <DialogTitle>Create transfer request</DialogTitle>
                  <DialogDescription>Move stock between plant warehouses with approval routing.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Source warehouse</Label>
                    <Select value={source} onValueChange={setSource}>
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
                    <Label>Destination warehouse</Label>
                    <Select value={destination} onValueChange={setDestination}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {WAREHOUSES.map((w) => (
                          <SelectItem key={w} value={w} disabled={w === source}>
                            {w}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label>Material</Label>
                    <Select defaultValue={inventory[0]!.materialCode}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {inventory.slice(0, 18).map((i) => (
                          <SelectItem key={i.id} value={i.materialCode}>
                            {i.materialCode} · {i.materialName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="qty">Quantity</Label>
                    <Input id="qty" type="number" defaultValue={25} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Priority</Label>
                    <Select defaultValue="Normal">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["Low", "Normal", "High"].map((p) => (
                          <SelectItem key={p} value={p}>
                            {p}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="reason">Justification</Label>
                    <Textarea id="reason" rows={3} placeholder="Reason for transfer, project reference…" />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      setOpen(false);
                      toast.success("Transfer request submitted", {
                        description: `${source} → ${destination} routed for approval.`,
                      });
                    }}
                  >
                    Submit request
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total Transfers" value={formatNumber(transfers.length)} icon={ArrowLeftRight} loading={loading} />
        <KpiCard
          label="Pending Approval"
          value={formatNumber(pending.length)}
          icon={Clock}
          tone="quarantine"
          loading={loading}
        />
        <KpiCard label="In Transit" value={formatNumber(inTransit.length)} icon={Truck} tone="reserved" loading={loading} />
        <KpiCard
          label="Completed"
          value={formatNumber(received.length)}
          icon={CheckCircle2}
          tone="available"
          trend={4.1}
          loading={loading}
        />
      </div>

      <SectionCard
        title="Inbound vs outbound volume"
        description="Transfer quantity by warehouse"
        className="mt-4"
      >
        {loading ? (
          <ChartSkeleton />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={byRoute}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="warehouse" {...axis} />
              <YAxis {...axis} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="inbound" fill="var(--color-status-available)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="outbound" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </SectionCard>

      <Tabs value={status} onValueChange={setStatus} className="mt-4">
        <div className="grid gap-3 sm:flex sm:items-center sm:justify-between">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            {STATUSES.map((s) => (
              <TabsTrigger key={s} value={s}>
                {s}
              </TabsTrigger>
            ))}
          </TabsList>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search transfers…"
            className="sm:max-w-[260px]"
          />
        </div>

        <TabsContent value={status} className="mt-3">
          <SectionCard
            title="Transfer requests"
            description="BR-067 · Source, destination, approval status and expected arrival"
            bodyClassName=""
          >
            <DataTable rows={rows} columns={columns} loading={loading} pageSize={10} />
          </SectionCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
