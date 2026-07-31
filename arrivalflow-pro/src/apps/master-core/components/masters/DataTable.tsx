import { useMemo, useState, type ReactNode } from "react";
import {
  ArrowDownUp,
  ArrowDown,
  ArrowUp,
  Columns3,
  Download,
  Eye,
  FileUp,
  Filter,
  MoreHorizontal,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Power,
  Inbox,
  X,
} from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@master/components/ui/alert-dialog";
import { Badge } from "@master/components/ui/badge";
import { Button } from "@master/components/ui/button";
import { Checkbox } from "@master/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@master/components/ui/dropdown-menu";
import { Input } from "@master/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@master/components/ui/select";
import { Skeleton } from "@master/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@master/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@master/components/ui/tooltip";
import { cn } from "@master/lib/utils";

export type Column<T> = {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
  value?: (row: T) => string | number;
  className?: string;
  hiddenByDefault?: boolean;
  width?: string;
};

export type TableFilter<T> = {
  key: string;
  label: string;
  options: string[];
  match: (row: T, value: string) => boolean;
};

type Props<T> = {
  rows: T[];
  columns: Column<T>[];
  getId: (row: T) => string;
  getLabel: (row: T) => string;
  searchText: (row: T) => string;
  filters?: TableFilter<T>[];
  onView?: (row: T) => void;
  onEdit?: (row: T) => void;
  onCreate?: () => void;
  createLabel?: string;
  entity: string;
};

const PAGE_SIZES = [10, 25, 50];

export function DataTable<T>({
  rows,
  columns,
  getId,
  getLabel,
  searchText,
  filters = [],
  onView,
  onEdit,
  onCreate,
  createLabel = "Add New",
  entity,
}: Props<T>) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selected, setSelected] = useState<string[]>([]);
  const [hidden, setHidden] = useState<string[]>(
    columns.filter((c) => c.hiddenByDefault).map((c) => c.key),
  );
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState<{ ids: string[]; label: string } | null>(null);
  const [removed, setRemoved] = useState<string[]>([]);
  const [inactive, setInactive] = useState<string[]>([]);

  const visibleColumns = columns.filter((c) => !hidden.includes(c.key));

  const filtered = useMemo(() => {
    let out = rows.filter((r) => !removed.includes(getId(r)));
    const q = query.trim().toLowerCase();
    if (q) out = out.filter((r) => searchText(r).toLowerCase().includes(q));
    for (const f of filters) {
      const v = filterValues[f.key];
      if (v && v !== "__all") out = out.filter((r) => f.match(r, v));
    }
    if (sortKey) {
      const col = columns.find((c) => c.key === sortKey);
      if (col) {
        out = [...out].sort((a, b) => {
          const av = col.value ? col.value(a) : "";
          const bv = col.value ? col.value(b) : "";
          const res =
            typeof av === "number" && typeof bv === "number"
              ? av - bv
              : String(av).localeCompare(String(bv));
          return sortDir === "asc" ? res : -res;
        });
      }
    }
    return out;
  }, [rows, query, filters, filterValues, sortKey, sortDir, columns, removed, getId, searchText]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, totalPages);
  const paged = filtered.slice((current - 1) * pageSize, current * pageSize);
  const activeFilterCount = Object.values(filterValues).filter((v) => v && v !== "__all").length;

  const toggleSort = (key: string) => {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const refresh = () => {
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      toast.success(`${entity} list refreshed`, { description: "Synchronised with ERP core." });
    }, 800);
  };

  const exportCsv = (ids?: string[]) => {
    const scope = ids?.length ? filtered.filter((r) => ids.includes(getId(r))) : filtered;
    toast.success(`Exported ${scope.length} ${entity.toLowerCase()} record(s)`, {
      description: "CSV generated and queued for download.",
    });
  };

  const confirmDelete = () => {
    if (!deleting) return;
    setRemoved((r) => [...r, ...deleting.ids]);
    setSelected([]);
    toast.success(
      deleting.ids.length > 1
        ? `${deleting.ids.length} records deleted`
        : `${deleting.label} deleted`,
      { description: "Record moved to the recycle bin for 30 days." },
    );
    setDeleting(null);
  };

  const allOnPageSelected = paged.length > 0 && paged.every((r) => selected.includes(getId(r)));

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="surface-panel p-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-2">
            <div className="relative min-w-0 flex-1 sm:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                placeholder={`Search ${entity.toLowerCase()}…`}
                className="pl-9"
              />
            </div>

            {filters.map((f) => (
              <Select
                key={f.key}
                value={filterValues[f.key] ?? "__all"}
                onValueChange={(v) => {
                  setFilterValues((s) => ({ ...s, [f.key]: v }));
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-9 w-[150px]">
                  <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                  <SelectValue placeholder={f.label} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all">All {f.label}</SelectItem>
                  {f.options.map((o) => (
                    <SelectItem key={o} value={o}>
                      {o}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ))}

            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilterValues({})}
                className="text-muted-foreground"
              >
                <X className="h-3.5 w-3.5" /> Clear ({activeFilterCount})
              </Button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Columns3 className="h-4 w-4" /> Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Visible columns</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {columns.map((c) => (
                  <DropdownMenuCheckboxItem
                    key={c.key}
                    checked={!hidden.includes(c.key)}
                    onCheckedChange={(v) =>
                      setHidden((h) => (v ? h.filter((k) => k !== c.key) : [...h, c.key]))
                    }
                  >
                    {c.header}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toast.info("Import wizard", { description: "Upload an XLSX or CSV template to stage records." })}
                >
                  <FileUp className="h-4 w-4" /> Import
                </Button>
              </TooltipTrigger>
              <TooltipContent>Bulk import from template</TooltipContent>
            </Tooltip>

            <Button variant="outline" size="sm" onClick={() => exportCsv()}>
              <Download className="h-4 w-4" /> Export
            </Button>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" className="h-9 w-9" onClick={refresh}>
                  <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Refresh</TooltipContent>
            </Tooltip>

            {onCreate && (
              <Button size="sm" onClick={onCreate} className="shadow-[var(--shadow-primary)]">
                <Plus className="h-4 w-4" /> {createLabel}
              </Button>
            )}
          </div>
        </div>

        {selected.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-primary/25 bg-primary-soft px-3 py-2">
            <Badge className="bg-primary text-primary-foreground">{selected.length} selected</Badge>
            <Button variant="outline" size="sm" onClick={() => exportCsv(selected)}>
              <Download className="h-3.5 w-3.5" /> Bulk export
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setInactive((s) => [...new Set([...s, ...selected])]);
                toast.success(`${selected.length} record(s) deactivated`);
                setSelected([]);
              }}
            >
              <Power className="h-3.5 w-3.5" /> Deactivate
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleting({ ids: selected, label: `${selected.length} records` })}
            >
              <Trash2 className="h-3.5 w-3.5" /> Bulk delete
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto text-muted-foreground"
              onClick={() => setSelected([])}
            >
              Clear selection
            </Button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="surface-panel overflow-hidden">
        <div className="max-h-[62vh] overflow-auto scroll-slim">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-surface/95 backdrop-blur">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-10">
                  <Checkbox
                    checked={allOnPageSelected}
                    onCheckedChange={(v) =>
                      setSelected((s) =>
                        v
                          ? [...new Set([...s, ...paged.map(getId)])]
                          : s.filter((id) => !paged.map(getId).includes(id)),
                      )
                    }
                    aria-label="Select all rows on page"
                  />
                </TableHead>
                {visibleColumns.map((c) => (
                  <TableHead key={c.key} className={cn("whitespace-nowrap", c.className)}>
                    <button
                      onClick={() => c.value && toggleSort(c.key)}
                      className={cn(
                        "inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors",
                        c.value && "hover:text-primary",
                      )}
                    >
                      {c.header}
                      {c.value &&
                        (sortKey === c.key ? (
                          sortDir === "asc" ? (
                            <ArrowUp className="h-3 w-3" />
                          ) : (
                            <ArrowDown className="h-3 w-3" />
                          )
                        ) : (
                          <ArrowDownUp className="h-3 w-3 opacity-40" />
                        ))}
                    </button>
                  </TableHead>
                ))}
                <TableHead className="w-12 text-right" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading &&
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={`sk-${i}`}>
                    <TableCell>
                      <Skeleton className="h-4 w-4" />
                    </TableCell>
                    {visibleColumns.map((c) => (
                      <TableCell key={c.key}>
                        <Skeleton className="h-4 w-[80%]" />
                      </TableCell>
                    ))}
                    <TableCell />
                  </TableRow>
                ))}

              {!loading && paged.length === 0 && (
                <TableRow>
                  <TableCell colSpan={visibleColumns.length + 2} className="py-16">
                    <div className="mx-auto max-w-sm text-center">
                      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary-soft text-primary">
                        <Inbox className="h-7 w-7" />
                      </div>
                      <p className="mt-4 text-base font-semibold">No {entity.toLowerCase()} found</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Adjust your search or filters, or create the first record to populate this
                        master.
                      </p>
                      <div className="mt-4 flex justify-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setQuery("");
                            setFilterValues({});
                          }}
                        >
                          Reset filters
                        </Button>
                        {onCreate && (
                          <Button size="sm" onClick={onCreate}>
                            <Plus className="h-4 w-4" /> {createLabel}
                          </Button>
                        )}
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}

              {!loading &&
                paged.map((row) => {
                  const id = getId(row);
                  return (
                    <TableRow
                      key={id}
                      data-state={selected.includes(id) ? "selected" : undefined}
                      className={cn(
                        "group cursor-pointer transition-colors hover:bg-surface",
                        inactive.includes(id) && "opacity-60",
                      )}
                      onClick={() => onView?.(row)}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selected.includes(id)}
                          onCheckedChange={(v) =>
                            setSelected((s) => (v ? [...s, id] : s.filter((x) => x !== id)))
                          }
                          aria-label={`Select ${getLabel(row)}`}
                        />
                      </TableCell>
                      {visibleColumns.map((c) => (
                        <TableCell key={c.key} className={cn("py-2.5", c.className)}>
                          {c.render ? c.render(row) : String(c.value?.(row) ?? "—")}
                        </TableCell>
                      ))}
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem onClick={() => onView?.(row)}>
                              <Eye className="h-4 w-4" /> View details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEdit?.(row)}>
                              <Pencil className="h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setInactive((s) =>
                                  s.includes(id) ? s.filter((x) => x !== id) : [...s, id],
                                );
                                toast.success(
                                  inactive.includes(id)
                                    ? `${getLabel(row)} activated`
                                    : `${getLabel(row)} deactivated`,
                                );
                              }}
                            >
                              <Power className="h-4 w-4" />
                              {inactive.includes(id) ? "Activate" : "Deactivate"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => setDeleting({ ids: [id], label: getLabel(row) })}
                            >
                              <Trash2 className="h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="grid gap-3 border-t border-border px-4 py-3 sm:flex sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            Showing{" "}
            <span className="num font-medium text-foreground">
              {filtered.length === 0 ? 0 : (current - 1) * pageSize + 1}–
              {Math.min(current * pageSize, filtered.length)}
            </span>{" "}
            of <span className="num font-medium text-foreground">{filtered.length}</span> records
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={String(pageSize)}
              onValueChange={(v) => {
                setPageSize(Number(v));
                setPage(1);
              }}
            >
              <SelectTrigger className="h-8 w-[110px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZES.map((s) => (
                  <SelectItem key={s} value={String(s)}>
                    {s} / page
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              disabled={current === 1}
              onClick={() => setPage(current - 1)}
            >
              Previous
            </Button>
            <span className="num px-1 text-xs text-muted-foreground">
              Page {current} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={current === totalPages}
              onClick={() => setPage(current + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleting?.label}?</AlertDialogTitle>
            <AlertDialogDescription>
              This master record may be referenced by open transactions. Deleting it will remove it
              from selection lists across Procurement, Inventory and Logistics.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete record
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
