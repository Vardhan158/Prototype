import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ArrowUpDown,
  Check,
  Download,
  FileText,
  MoreHorizontal,
  Pencil,
  Plus,
  Printer,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  EmptyState,
  PageHeader,
  PriorityBadge,
  SectionCard,
  StatusBadge,
} from "@/apps/warehouse-flow/components/ui-kit";
import {
  inr,
  lineTotal,
  materialRequests,
  requestTotal,
  warehouses,
  type MaterialRequest,
} from "@/apps/warehouse-flow/data";

export const Route = createFileRoute("/warehouse-flow/requests/")({
  head: () => ({
    meta: [
      { title: "Material Requests — WMS Console" },
      {
        name: "description",
        content:
          "Search, filter and manage every material request across warehouses with approvals, exports and detail views.",
      },
      { property: "og:title", content: "Material Requests — WMS Console" },
      {
        property: "og:description",
        content: "Track and manage material requests across all warehouses.",
      },
    ],
  }),
  component: RequestsPage,
});

const PAGE_SIZE = 6;

function RequestsPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [warehouse, setWarehouse] = useState("all");
  const [priority, setPriority] = useState("all");
  const [sortKey, setSortKey] = useState<"requestNo" | "requiredDate" | "priority">("requiredDate");
  const [asc, setAsc] = useState(true);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [detail, setDetail] = useState<MaterialRequest | null>(null);
  const [pendingDelete, setPendingDelete] = useState<MaterialRequest | null>(null);
  const [loading] = useState(false);

  const order = { Critical: 0, High: 1, Medium: 2, Low: 3 } as const;

  const filtered = useMemo(() => {
    const rows = materialRequests.filter((r) => {
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        [r.requestNo, r.workOrder, r.requestedBy, r.department]
          .join(" ")
          .toLowerCase()
          .includes(q);
      return (
        matchesQuery &&
        (status === "all" || r.status === status) &&
        (warehouse === "all" || r.warehouse === warehouse) &&
        (priority === "all" || r.priority === priority)
      );
    });
    return [...rows].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "priority") cmp = order[a.priority] - order[b.priority];
      else cmp = String(a[sortKey]).localeCompare(String(b[sortKey]));
      return asc ? cmp : -cmp;
    });
  }, [query, status, warehouse, priority, sortKey, asc]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const rows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const toggleSort = (key: typeof sortKey) => {
    if (key === sortKey) setAsc((v) => !v);
    else {
      setSortKey(key);
      setAsc(true);
    }
  };

  const SortHead = ({ label, k }: { label: string; k: typeof sortKey }) => (
    <button
      onClick={() => toggleSort(k)}
      className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
    >
      {label}
      <ArrowUpDown className="size-3" />
    </button>
  );

  return (
    <>
      <PageHeader
        title="Material Requests"
        description="Track, filter and manage every request raised across your warehouses."
        breadcrumbs={[{ label: "Home", to: "/warehouse-flow/" }, { label: "Material Requests" }]}
        actions={
          <>
            <Button variant="outline" onClick={() => toast.success("Export queued as XLSX")}>
              <Download className="size-4" /> Export
            </Button>
            <Button variant="outline" onClick={() => toast("Print preview generated")}>
              <Printer className="size-4" /> Print
            </Button>
            <Link to="/warehouse-flow/requests/new">
              <Button>
                <Plus className="size-4" /> Create Request
              </Button>
            </Link>
          </>
        }
      />

      <SectionCard className="mb-4" bodyClassName="p-4">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search by request no, work order, requester..."
              className="pl-9"
            />
          </div>
          <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
            <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {["Draft", "Pending Approval", "Approved", "Reserved", "Picking", "Issued", "Rejected", "Closed"].map(
                (s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ),
              )}
            </SelectContent>
          </Select>
          <Select value={warehouse} onValueChange={(v) => { setWarehouse(v); setPage(1); }}>
            <SelectTrigger><SelectValue placeholder="Warehouse" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All warehouses</SelectItem>
              {warehouses.map((w) => (
                <SelectItem key={w.code} value={w.code}>{w.code} — {w.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={priority} onValueChange={(v) => { setPriority(v); setPage(1); }}>
            <SelectTrigger><SelectValue placeholder="Priority" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All priorities</SelectItem>
              {["Critical", "High", "Medium", "Low"].map((p) => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selected.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-primary/25 bg-primary/8 px-3 py-2 text-sm">
            <span className="font-medium">{selected.length} selected</span>
            <div className="ml-auto flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => toast.success(`${selected.length} request(s) approved`)}>
                <Check className="size-4" /> Approve
              </Button>
              <Button size="sm" variant="outline" onClick={() => toast.error(`${selected.length} request(s) rejected`)}>
                <X className="size-4" /> Reject
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setSelected([])}>Clear</Button>
            </div>
          </div>
        )}
      </SectionCard>

      <SectionCard bodyClassName="p-0">
        {loading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No material requests found"
            description="Adjust your filters or create a new material request to get started."
            action={
              <Link to="/warehouse-flow/requests/new">
                <Button><Plus className="size-4" /> Create Request</Button>
              </Link>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/60">
                  <TableHead className="w-10">
                    <Checkbox
                      checked={rows.every((r) => selected.includes(r.id))}
                      onCheckedChange={(c) =>
                        setSelected(c ? rows.map((r) => r.id) : [])
                      }
                      aria-label="Select all"
                    />
                  </TableHead>
                  <TableHead><SortHead label="Request No" k="requestNo" /></TableHead>
                  <TableHead>Work Order</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Requested By</TableHead>
                  <TableHead><SortHead label="Priority" k="priority" /></TableHead>
                  <TableHead><SortHead label="Required Date" k="requiredDate" /></TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id} className="cursor-pointer" onClick={() => setDetail(r)}>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selected.includes(r.id)}
                        onCheckedChange={(c) =>
                          setSelected((s) => (c ? [...s, r.id] : s.filter((x) => x !== r.id)))
                        }
                        aria-label={`Select ${r.requestNo}`}
                      />
                    </TableCell>
                    <TableCell className="num font-semibold text-primary">{r.requestNo}</TableCell>
                    <TableCell className="num text-sm">{r.workOrder}</TableCell>
                    <TableCell className="text-sm">{r.department}</TableCell>
                    <TableCell className="text-sm">{r.requestedBy}</TableCell>
                    <TableCell><PriorityBadge priority={r.priority} /></TableCell>
                    <TableCell className="num text-sm">{r.requiredDate}</TableCell>
                    <TableCell><StatusBadge status={r.status} /></TableCell>
                    <TableCell className="num text-right text-sm font-semibold">
                      {inr(requestTotal(r))}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" aria-label="Row actions">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setDetail(r)}>
                            <FileText className="size-4" /> View details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast("Opening editor…")}>
                            <Pencil className="size-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast.success(`${r.requestNo} approved`)}>
                            <Check className="size-4" /> Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast.error(`${r.requestNo} rejected`)}>
                            <X className="size-4" /> Reject
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast("Print slip generated")}>
                            <Printer className="size-4" /> Print
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setPendingDelete(r)}>
                            <Trash2 className="size-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <div className="grid gap-3 border-t border-border px-5 py-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
          <p className="text-xs text-muted-foreground">
            Showing {rows.length} of {filtered.length} requests
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={current === 1}
              onClick={() => setPage(current - 1)}
            >
              Previous
            </Button>
            <span className="num text-xs text-muted-foreground">
              Page {current} / {pageCount}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={current === pageCount}
              onClick={() => setPage(current + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </SectionCard>

      <Sheet open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
          {detail && (
            <>
              <SheetHeader>
                <SheetTitle className="num text-primary">{detail.requestNo}</SheetTitle>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={detail.status} />
                  <PriorityBadge priority={detail.priority} />
                </div>
              </SheetHeader>
              <div className="space-y-6 px-4 pb-8">
                <dl className="grid grid-cols-2 gap-4 text-sm">
                  {[
                    ["Work Order", detail.workOrder],
                    ["Department", detail.department],
                    ["Requested By", detail.requestedBy],
                    ["Warehouse", detail.warehouse],
                    ["Created", detail.createdDate],
                    ["Required By", detail.requiredDate],
                    ["Cost Center", detail.costCenter],
                    ["Total Value", inr(requestTotal(detail))],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{k}</dt>
                      <dd className="num mt-0.5 font-medium">{v}</dd>
                    </div>
                  ))}
                </dl>

                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Notes</p>
                  <p className="mt-1 text-sm">{detail.notes}</p>
                </div>

                <div className="surface-card overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/60">
                        <TableHead>Material</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead className="text-right">Avail.</TableHead>
                        <TableHead className="text-right">Req.</TableHead>
                        <TableHead className="text-right">Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {detail.items.map((l) => (
                        <TableRow key={l.id}>
                          <TableCell>
                            <p className="text-sm font-medium">{l.name}</p>
                            <p className="num text-xs text-muted-foreground">{l.code}</p>
                          </TableCell>
                          <TableCell className="num text-xs text-muted-foreground">
                            {l.warehouse} · {l.zone} · {l.rack} · {l.shelf} · {l.bin}
                          </TableCell>
                          <TableCell className="num text-right text-sm">{l.available}</TableCell>
                          <TableCell className="num text-right text-sm font-semibold">
                            {l.requested} {l.unit}
                          </TableCell>
                          <TableCell className="num text-right text-sm">{inr(lineTotal(l))}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => toast.success(`${detail.requestNo} approved`)}>
                    <Check className="size-4" /> Approve
                  </Button>
                  <Button variant="outline" onClick={() => toast.error(`${detail.requestNo} rejected`)}>
                    <X className="size-4" /> Reject
                  </Button>
                  <Button variant="outline" onClick={() => toast("Print slip generated")}>
                    <Printer className="size-4" /> Print
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!pendingDelete} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {pendingDelete?.requestNo}?</AlertDialogTitle>
            <AlertDialogDescription>
              This request and its reserved quantities will be released. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                toast.success(`${pendingDelete?.requestNo} deleted`);
                setPendingDelete(null);
              }}
            >
              Delete request
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
