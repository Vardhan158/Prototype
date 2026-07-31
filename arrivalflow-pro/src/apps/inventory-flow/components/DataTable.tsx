import { useMemo, useState } from "react";
import { ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { EmptyState } from "./EmptyState";
import { TableSkeleton } from "./Skeletons";

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  value?: (row: T) => string | number;
  align?: "left" | "right";
  className?: string;
}

export function DataTable<T extends { id: string }>({
  rows,
  columns,
  hiddenColumns = [],
  onRowClick,
  pageSize = 10,
  loading,
  selectable,
  selected,
  onToggle,
  onToggleAll,
}: {
  rows: T[];
  columns: Column<T>[];
  hiddenColumns?: string[];
  onRowClick?: (row: T) => void;
  pageSize?: number;
  loading?: boolean;
  selectable?: boolean;
  selected?: string[];
  onToggle?: (id: string) => void;
  onToggleAll?: (ids: string[]) => void;
}) {
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" } | null>(null);
  const [page, setPage] = useState(0);

  const visible = columns.filter((c) => !hiddenColumns.includes(c.key));

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.key === sort.key);
    if (!col?.value) return rows;
    const getter = col.value;
    return [...rows].sort((a, b) => {
      const av = getter(a);
      const bv = getter(b);
      if (typeof av === "number" && typeof bv === "number") return sort.dir === "asc" ? av - bv : bv - av;
      return sort.dir === "asc"
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
  }, [rows, sort, columns]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const current = Math.min(page, pageCount - 1);
  const pageRows = sorted.slice(current * pageSize, current * pageSize + pageSize);
  const pageIds = pageRows.map((r) => r.id);
  const allSelected = pageIds.length > 0 && pageIds.every((id) => selected?.includes(id));

  if (loading) return <TableSkeleton cols={visible.length} />;

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              {selectable && (
                <th className="w-10 px-3 py-2.5">
                  <input
                    type="checkbox"
                    aria-label="Select all rows on page"
                    className="size-3.5 accent-[var(--color-primary)]"
                    checked={allSelected}
                    onChange={() => onToggleAll?.(pageIds)}
                  />
                </th>
              )}
              {visible.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-3 py-2.5 text-xs font-semibold tracking-wide whitespace-nowrap text-muted-foreground uppercase",
                    col.align === "right" ? "text-right" : "text-left",
                  )}
                >
                  {col.value ? (
                    <button
                      type="button"
                      onClick={() =>
                        setSort((s) =>
                          s?.key === col.key
                            ? { key: col.key, dir: s.dir === "asc" ? "desc" : "asc" }
                            : { key: col.key, dir: "asc" },
                        )
                      }
                      className={cn(
                        "inline-flex items-center gap-1 transition-colors hover:text-foreground",
                        sort?.key === col.key && "text-primary",
                      )}
                    >
                      {col.header}
                      <ArrowUpDown className="size-3 opacity-60" />
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {pageRows.map((row) => (
              <tr
                key={row.id}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  "transition-colors",
                  onRowClick && "cursor-pointer hover:bg-accent/60",
                  selected?.includes(row.id) && "bg-primary/5",
                )}
              >
                {selectable && (
                  <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      aria-label={`Select ${row.id}`}
                      className="size-3.5 accent-[var(--color-primary)]"
                      checked={selected?.includes(row.id) ?? false}
                      onChange={() => onToggle?.(row.id)}
                    />
                  </td>
                )}
                {visible.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      "px-3 py-2.5 whitespace-nowrap",
                      col.align === "right" && "num text-right",
                      col.className,
                    )}
                  >
                    {col.render ? col.render(row) : (col.value?.(row) ?? "—")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pageRows.length === 0 && <EmptyState />}

      {sorted.length > 0 && (
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-t border-border px-4 py-3">
          <p className="min-w-0 truncate text-xs text-muted-foreground">
            Showing {current * pageSize + 1}–{Math.min(sorted.length, (current + 1) * pageSize)} of{" "}
            {sorted.length} records
          </p>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={current === 0}
              onClick={() => setPage(current - 1)}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="num text-xs text-muted-foreground">
              {current + 1} / {pageCount}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={current >= pageCount - 1}
              onClick={() => setPage(current + 1)}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
