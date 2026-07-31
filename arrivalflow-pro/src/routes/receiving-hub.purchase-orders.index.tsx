import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Filter, MoreHorizontal, Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { poValue, supplierById, warehouses } from "@/apps/receiving-hub/data";
import { fmtDate, inr } from "@/apps/receiving-hub/format";
import type { PurchaseOrder } from "@/apps/receiving-hub/types";

export const Route = createFileRoute("/receiving-hub/purchase-orders/")({
  head: () => ({
    meta: [
      { title: "Purchase Orders — NexusWMS Receiving" },
      {
        name: "description",
        content:
          "Search, filter and receive against open purchase orders across all warehouses.",
      },
      { property: "og:title", content: "Purchase Orders — NexusWMS Receiving" },
      {
        property: "og:description",
        content: "Search, filter and receive against open purchase orders.",
      },
    ],
  }),
  component: PurchaseOrderList,
});

const STATUSES = ["Open", "Partially Received", "Fully Received", "Overdue", "Closed"];

function PurchaseOrderList() {
  const { pos } = useWms();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [warehouse, setWarehouse] = useState("all");
  const [selected, setSelected] = useState<string[]>([]);

  const rows = useMemo(
    () =>
      pos.filter((p) => {
        const s = supplierById(p.supplierId).name.toLowerCase();
        const hit =
          !q ||
          p.poNumber.toLowerCase().includes(q.toLowerCase()) ||
          s.includes(q.toLowerCase()) ||
          p.buyer.toLowerCase().includes(q.toLowerCase());
        return (
          hit &&
          (status === "all" || p.status === status) &&
          (warehouse === "all" || p.warehouseId === warehouse)
        );
      }),
    [pos, q, status, warehouse],
  );

  const clear = () => {
    setQ("");
    setStatus("all");
    setWarehouse("all");
  };
  const dirty = q !== "" || status !== "all" || warehouse !== "all";

  const columns: Column<PurchaseOrder>[] = [
    {
      key: "sel",
      header: "",
      width: "44px",
      render: (r) => (
        <Checkbox
          checked={selected.includes(r.poNumber)}
          onCheckedChange={(v) =>
            setSelected((s) =>
              v ? [...s, r.poNumber] : s.filter((x) => x !== r.poNumber),
            )
          }
        />
      ),
    },
    {
      key: "po",
      header: "PO Number",
      sortable: true,
      sortValue: (r) => r.poNumber,
      render: (r) => (
        <Link
          to="/receiving-hub/purchase-orders/$poNumber"
          params={{ poNumber: r.poNumber }}
          className="font-medium text-primary hover:underline"
        >
          {r.poNumber}
        </Link>
      ),
    },
    {
      key: "supplier",
      header: "Supplier",
      sortable: true,
      sortValue: (r) => supplierById(r.supplierId).name,
      render: (r) => (
        <div className="leading-tight">
          <p className="font-medium">{supplierById(r.supplierId).name}</p>
          <p className="text-xs text-muted-foreground">{r.supplierId}</p>
        </div>
      ),
    },
    {
      key: "orderDate",
      header: "Order Date",
      sortable: true,
      sortValue: (r) => r.orderDate,
      render: (r) => <span className="text-muted-foreground">{fmtDate(r.orderDate)}</span>,
    },
    {
      key: "expected",
      header: "Expected",
      sortable: true,
      sortValue: (r) => r.expectedDate,
      render: (r) => <span className="text-muted-foreground">{fmtDate(r.expectedDate)}</span>,
    },
    {
      key: "wh",
      header: "Warehouse",
      render: (r) => <span className="text-muted-foreground">{r.warehouseId}</span>,
    },
    { key: "lines", header: "Lines", align: "right", render: (r) => r.lines.length },
    {
      key: "value",
      header: "Value",
      align: "right",
      sortable: true,
      sortValue: (r) => poValue(r),
      render: (r) => <span className="font-medium">{inr(poValue(r))}</span>,
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      sortValue: (r) => r.status,
      render: (r) => <StatusChip status={r.status} />,
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (r) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            size="sm"
            className="h-8"
            disabled={r.status === "Closed" || r.status === "Fully Received"}
            asChild={r.status !== "Closed" && r.status !== "Fully Received"}
          >
            {r.status === "Closed" || r.status === "Fully Received" ? (
              <span>Receive</span>
            ) : (
              <Link to="/receiving-hub/grn/new" search={{ po: r.poNumber }}>
                Receive
              </Link>
            )}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to="/receiving-hub/purchase-orders/$poNumber" params={{ poNumber: r.poNumber }}>
                  View details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.print()}>Print PO</DropdownMenuItem>
              <DropdownMenuItem>Close PO</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        crumbs={[{ label: "Receiving", to: "/receiving-hub/" }, { label: "Purchase Orders" }]}
        title="Purchase Orders"
        subtitle="Open and in-progress purchase orders available for goods receipt"
        actions={
          <>
            <Button variant="outline">Export</Button>
            <Button asChild>
              <Link to="/receiving-hub/grn/new">New goods receipt</Link>
            </Button>
          </>
        }
      />

      <div className="erp-card mb-4 flex flex-wrap items-center gap-2 p-3">
        <div className="relative min-w-[240px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="h-9 pl-9"
            placeholder="Search PO number, supplier or buyer…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="h-9 w-[180px]">
            <Filter className="mr-1 h-3.5 w-3.5 text-muted-foreground" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={warehouse} onValueChange={setWarehouse}>
          <SelectTrigger className="h-9 w-[190px]">
            <SelectValue placeholder="Warehouse" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All warehouses</SelectItem>
            {warehouses.map((w) => (
              <SelectItem key={w.id} value={w.id}>
                {w.id} · {w.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" className="h-9 gap-1.5">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          More filters
        </Button>
        {dirty && (
          <Button variant="ghost" className="h-9 gap-1.5" onClick={clear}>
            <X className="h-3.5 w-3.5" />
            Clear
          </Button>
        )}
      </div>

      <p className="mb-3 text-xs text-muted-foreground">
        {rows.length} purchase order{rows.length === 1 ? "" : "s"} found
        {selected.length > 0 && ` · ${selected.length} selected`}
      </p>

      <DataTable rows={rows} columns={columns} rowKey={(r) => r.poNumber} />
    </>
  );
}
