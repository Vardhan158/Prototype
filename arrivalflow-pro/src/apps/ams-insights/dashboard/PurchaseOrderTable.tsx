import { useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import { Eye, MoreHorizontal, Pencil } from "lucide-react";
import { FilterBar } from "@/apps/ams-insights/common/FilterBar";
import { Pagination } from "@/apps/ams-insights/common/Pagination";
import { StatusBadge } from "@/apps/ams-insights/common/StatusBadge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { purchaseOrders } from "@/apps/ams-insights/mock/purchaseOrders";

const PAGE_SIZE = 5;

export function PurchaseOrderTable() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All Statuses");
  const [range, setRange] = useState<DateRange | undefined>(undefined);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return purchaseOrders.filter((po) => {
      const matchQ =
        !q || po.poNumber.toLowerCase().includes(q) || po.supplier.toLowerCase().includes(q);
      const matchS = status === "All Statuses" || po.status === status;
      return matchQ && matchS;
    });
  }, [search, status]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const rows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  return (
    <section className="rounded-xl border border-border bg-card shadow-card">
      <div className="flex flex-col gap-3 border-b border-border p-5 xl:flex-row xl:items-center xl:justify-between">
        <h3 className="text-base font-semibold tracking-tight">Purchase Order Overview</h3>
        <FilterBar
          search={search}
          onSearchChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          status={status}
          onStatusChange={(v) => {
            setStatus(v);
            setPage(1);
          }}
          range={range}
          onRangeChange={setRange}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-5 py-3 font-medium">PO Number</th>
              <th className="px-5 py-3 font-medium">Supplier</th>
              <th className="px-5 py-3 font-medium">Order Date</th>
              <th className="px-5 py-3 font-medium">Expected Delivery</th>
              <th className="px-5 py-3 font-medium">Currency</th>
              <th className="px-5 py-3 text-right font-medium">Total Amount</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((po) => (
              <tr
                key={po.id}
                className="border-b border-border last:border-0 transition-colors hover:bg-muted/50"
              >
                <td className="px-5 py-3.5 font-medium text-primary">{po.poNumber}</td>
                <td className="px-5 py-3.5">{po.supplier}</td>
                <td className="px-5 py-3.5 text-muted-foreground">{po.orderDate}</td>
                <td className="px-5 py-3.5 text-muted-foreground">{po.expectedDelivery}</td>
                <td className="px-5 py-3.5 text-muted-foreground">{po.currency}</td>
                <td className="px-5 py-3.5 text-right font-medium tabular-nums">
                  {po.totalAmount}
                </td>
                <td className="px-5 py-3.5">
                  <StatusBadge status={po.status} />
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      aria-label="View"
                      className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
                    >
                      <Eye className="size-4" />
                    </button>
                    <button
                      aria-label="Edit"
                      className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
                    >
                      <Pencil className="size-4" />
                    </button>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        aria-label="More"
                        className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        <MoreHorizontal className="size-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Duplicate PO</DropdownMenuItem>
                        <DropdownMenuItem>Send to Supplier</DropdownMenuItem>
                        <DropdownMenuItem>Download PDF</DropdownMenuItem>
                        <DropdownMenuItem>Cancel PO</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className="px-5 py-10 text-center text-muted-foreground">
                  No purchase orders match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        page={current}
        pageCount={pageCount}
        total={filtered.length}
        onPageChange={setPage}
      />
    </section>
  );
}
