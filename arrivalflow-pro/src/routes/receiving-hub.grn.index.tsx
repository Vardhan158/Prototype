import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable, type Column } from "@/apps/receiving-hub/shared/DataTable";
import { PageHeader } from "@/apps/receiving-hub/shared/PageHeader";
import { StatusChip } from "@/apps/receiving-hub/shared/StatusChip";
import { useWms } from "@/apps/receiving-hub/context/WmsContext";
import { supplierById } from "@/apps/receiving-hub/data";
import { fmtDate, fmtDuration } from "@/apps/receiving-hub/format";
import type { Grn } from "@/apps/receiving-hub/types";

export const Route = createFileRoute("/receiving-hub/grn/")({
  head: () => ({
    meta: [
      { title: "Goods Receipts — NexusWMS" },
      {
        name: "description",
        content:
          "All goods receipt notes with status, dock assignment and dock-to-stock cycle time.",
      },
      { property: "og:title", content: "Goods Receipts — NexusWMS" },
      {
        property: "og:description",
        content: "All goods receipt notes with status and cycle time.",
      },
    ],
  }),
  component: GrnList,
});

const STATUSES = ["Draft", "Pending Inspection", "Pending Approval", "Completed"];

function GrnList() {
  const { grns } = useWms();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");

  const rows = useMemo(
    () =>
      grns.filter((g) => {
        const hay = `${g.id} ${g.poNumber ?? ""} ${supplierById(g.supplierId).name}`.toLowerCase();
        return (
          hay.includes(q.toLowerCase()) && (status === "all" || g.status === status)
        );
      }),
    [grns, q, status],
  );

  const cycle = (g: Grn) =>
    g.stages.gateEntry + g.stages.grn + g.stages.inspection + g.stages.putaway;

  const columns: Column<Grn>[] = [
    {
      key: "id",
      header: "GRN No",
      sortable: true,
      sortValue: (r) => r.id,
      render: (r) => (
        <Link to="/receiving-hub/grn/$id" params={{ id: r.id }} className="font-medium text-primary hover:underline">
          {r.id}
        </Link>
      ),
    },
    {
      key: "po",
      header: "PO No",
      render: (r) =>
        r.poNumber ? (
          <Link to="/receiving-hub/purchase-orders/$poNumber" params={{ poNumber: r.poNumber }} className="text-primary hover:underline">
            {r.poNumber}
          </Link>
        ) : (
          <StatusChip status="Non-PO" tone="info" />
        ),
    },
    { key: "sup", header: "Supplier", sortable: true, sortValue: (r) => supplierById(r.supplierId).name, render: (r) => supplierById(r.supplierId).name },
    { key: "date", header: "Receipt Date", sortable: true, sortValue: (r) => r.receiptDate, render: (r) => <span className="text-muted-foreground">{fmtDate(r.receiptDate)}</span> },
    { key: "wh", header: "Warehouse", render: (r) => <span className="text-muted-foreground">{r.warehouseId}</span> },
    { key: "dock", header: "Dock", render: (r) => <span className="text-muted-foreground">{r.dockId}</span> },
    { key: "lines", header: "Lines", align: "right", render: (r) => r.lines.length },
    {
      key: "cycle",
      header: "Dock-to-Stock",
      align: "right",
      sortable: true,
      sortValue: (r) => cycle(r),
      render: (r) =>
        r.status === "Completed" ? fmtDuration(cycle(r)) : <span className="text-muted-foreground">In progress</span>,
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      sortValue: (r) => r.status,
      render: (r) => (
        <div className="flex flex-wrap gap-1.5">
          <StatusChip status={r.status} />
          {r.isPartial && <StatusChip status="Partial" />}
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (r) => (
        <Button variant="outline" size="sm" className="h-8" asChild>
          <Link to="/receiving-hub/grn/$id" params={{ id: r.id }}>Open</Link>
        </Button>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        crumbs={[{ label: "Receiving", to: "/receiving-hub/" }, { label: "Goods Receipts" }]}
        title="Goods Receipts"
        subtitle="Goods receipt notes posted across all warehouses"
        actions={
          <Button asChild>
            <Link to="/receiving-hub/grn/new">New goods receipt</Link>
          </Button>
        }
      />

      <div className="erp-card mb-4 flex flex-wrap items-center gap-2 p-3">
        <div className="relative min-w-[240px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="h-9 pl-9" placeholder="Search GRN, PO or supplier…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="h-9 w-[200px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <DataTable rows={rows} columns={columns} rowKey={(r) => r.id} />
    </>
  );
}
