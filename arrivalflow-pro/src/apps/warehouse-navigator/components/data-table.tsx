import { Filter, Inbox, Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { EmptyState, LoadingRows } from "./ui-kit";

export type Column<T> = {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  className?: string | undefined;
};

export function DataTable<T extends { id: string }>({
  rows,
  columns,
  searchKeys,
  filter,
  onRowClick,
  actions,
  loading = false,
  emptyTitle = "No locations match your filters",
  emptyDescription = "Adjust the search term or clear filters to see storage records again.",
  pageSize = 8,
}: {
  rows: T[];
  columns: Column<T>[];
  searchKeys: (row: T) => string;
  filter?: { label: string; options: string[]; value: string; onChange: (v: string) => void } | undefined;
  onRowClick?: ((row: T) => void) | undefined;
  actions?: ReactNode | undefined;
  loading?: boolean | undefined;
  emptyTitle?: string | undefined;
  emptyDescription?: string | undefined;
  pageSize?: number | undefined;
}) {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);

  const filtered = useMemo(
    () => rows.filter((r) => searchKeys(r).toLowerCase().includes(q.toLowerCase())),
    [rows, q, searchKeys],
  );
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, pages - 1);
  const visible = filtered.slice(current * pageSize, current * pageSize + pageSize);

  return (
    <div className="glass-panel overflow-hidden">
      <div className="grid gap-2 border-b border-border p-3 sm:flex sm:items-center sm:justify-between sm:p-4">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          <div className="relative min-w-[180px] flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(0);
              }}
              placeholder="Search…"
              className="h-9 rounded-xl pl-9 text-sm"
            />
          </div>
          {filter && (
            <Select value={filter.value} onValueChange={filter.onChange}>
              <SelectTrigger className="h-9 w-[168px] rounded-xl text-sm">
                <Filter className="mr-1 h-3.5 w-3.5" />
                <SelectValue placeholder={filter.label} />
              </SelectTrigger>
              <SelectContent>
                {filter.options.map((o) => (
                  <SelectItem key={o} value={o}>
                    {o}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button variant="outline" size="sm" className="h-9 gap-1.5 rounded-xl">
            <SlidersHorizontal className="h-3.5 w-3.5" /> Columns
          </Button>
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>

      {loading ? (
        <div className="p-4">
          <LoadingRows rows={6} cols={columns.length} />
        </div>
      ) : visible.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} icon={Inbox} />
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                {columns.map((c) => (
                  <TableHead
                    key={c.key}
                    className={cn("text-[11px] font-semibold tracking-wide whitespace-nowrap uppercase", c.className)}
                  >
                    {c.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((row, i) => (
                <TableRow
                  key={row.id}
                  onClick={() => onRowClick?.(row)}
                  style={{ animationDelay: `${i * 22}ms` }}
                  className={cn("animate-rise", onRowClick && "cursor-pointer")}
                >
                  {columns.map((c) => (
                    <TableCell key={c.key} className={cn("py-3 text-[13px]", c.className)}>
                      {c.cell(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-t border-border px-4 py-3">
        <p className="truncate text-[11px] text-muted-foreground">
          Showing {visible.length} of {filtered.length} records
        </p>
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="sm" className="h-8 text-xs" disabled={current === 0} onClick={() => setPage(current - 1)}>
            Previous
          </Button>
          <span className="num px-1 text-[11px] font-semibold">
            {current + 1} / {pages}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            disabled={current >= pages - 1}
            onClick={() => setPage(current + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
