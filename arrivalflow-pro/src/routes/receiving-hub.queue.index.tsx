import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowUpDown,
  Download,
  Filter,
  MoreHorizontal,
  PlayCircle,
  Search,
  SlidersHorizontal,
  Truck,
  Warehouse,
  X,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  PageHeader,
  PriorityPill,
  StatusPill,
  EmptyState,
} from "@/apps/receiving-hub/components/wms/primitives";
import { AssignDockDialog } from "@/apps/receiving-hub/components/wms/dialogs";
import { useWms } from "@/apps/receiving-hub/lib/wms-store";

export const Route = createFileRoute("/receiving-hub/queue/")({
  head: () => ({
    meta: [
      { title: "Receiving Queue | AXIOM WMS Inbound" },
      {
        name: "description",
        content:
          "Enterprise inbound queue of trucks, vendors, purchase orders, gate entries and dock allocations with live receiving status.",
      },
      { property: "og:title", content: "Receiving Queue | AXIOM WMS Inbound" },
      {
        property: "og:description",
        content: "Filter, sort and action every truck waiting at the yard.",
      },
    ],
  }),
  component: QueuePage,
});

const STATUSES = [
  "All",
  "Waiting",
  "Dock Assigned",
  "Receiving Started",
  "Scanning",
  "Partial Receipt",
  "Discrepancy",
  "GRN Generated",
  "Transferred To Quality",
  "Completed",
  "Rejected",
];

function QueuePage() {
  const { state, dispatch } = useWms();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("All");
  const [priority, setPriority] = useState("All");
  const [wh, setWh] = useState("All");
  const [sortAsc, setSortAsc] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [dockFor, setDockFor] = useState<string | null>(null);

  const rows = useMemo(() => {
    const filtered = state.shipments.filter((s) => {
      const hay =
        `${s.truckNo} ${s.vendor} ${s.po} ${s.gateEntry} ${s.asn} ${s.driver}`.toLowerCase();
      return (
        hay.includes(q.toLowerCase()) &&
        (status === "All" || s.status === status) &&
        (priority === "All" || s.priority === priority) &&
        (wh === "All" || s.warehouse === wh)
      );
    });
    return [...filtered].sort((a, b) =>
      sortAsc ? a.arrival.localeCompare(b.arrival) : b.arrival.localeCompare(a.arrival),
    );
  }, [state.shipments, q, status, priority, wh, sortAsc]);

  const refresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 900);
  };

  const allChecked = rows.length > 0 && selected.length === rows.length;

  return (
    <div className="mx-auto max-w-[1600px]">
      <PageHeader
        title="Receiving Queue"
        subtitle={`${rows.length} inbound shipments in scope Â· yard capacity 24 vehicles`}
        crumbs={[{ label: "Inbound", to: "/receiving-hub" }, { label: "Receiving Queue" }]}
        actions={
          <>
            <Button variant="outline" onClick={refresh}>
              <SlidersHorizontal className="mr-2 h-4 w-4" /> Refresh
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                toast.success("Export queued", {
                  description: "queue_2026-08-01.xlsx will be emailed to you.",
                })
              }
            >
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
            <Button asChild>
              <Link to="/receiving-hub/docks">
                <Warehouse className="mr-2 h-4 w-4" /> Assign docks
              </Link>
            </Button>
          </>
        }
      />

      <Tabs value={status} onValueChange={setStatus} className="mb-4">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 bg-surface-2 p-1">
          {STATUSES.slice(0, 7).map((s) => (
            <TabsTrigger key={s} value={s} className="text-xs">
              {s}
              <span className="num ml-1.5 text-[0.65rem] text-muted-foreground">
                {s === "All"
                  ? state.shipments.length
                  : state.shipments.filter((x) => x.status === s).length}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Card className="elevated-card overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-border p-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search truck, vendor, PO, ASN, gate entry, driverâ€¦"
              className="pl-9"
            />
            {q && (
              <button
                onClick={() => setQ("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger className="w-[150px]">
                <Filter className="mr-1 h-3.5 w-3.5" />
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                {["All", "Critical", "High", "Normal", "Low"].map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={wh} onValueChange={setWh}>
              <SelectTrigger className="w-[170px]">
                <SelectValue placeholder="Warehouse" />
              </SelectTrigger>
              <SelectContent>
                {["All", "WH-NCR-01", "WH-CHN-02", "WH-PUN-03"].map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={() => setSortAsc((v) => !v)}>
              <ArrowUpDown className="mr-1.5 h-3.5 w-3.5" /> Arrival {sortAsc ? "â†‘" : "â†“"}
            </Button>
          </div>
        </div>

        {selected.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 border-b border-border bg-primary-soft/60 px-4 py-2.5">
            <span className="num text-xs font-semibold text-primary">
              {selected.length} selected
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                toast.success(`${selected.length} shipments dispatched to dock planner`)
              }
            >
              Bulk assign dock
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                toast.message("Priority escalated", {
                  description: "Yard marshals notified on channel INB-A.",
                })
              }
            >
              Escalate priority
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setSelected([])}>
              Clear
            </Button>
          </div>
        )}

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-surface-2/70 hover:bg-surface-2/70">
                <TableHead className="w-10">
                  <Checkbox
                    checked={allChecked}
                    onCheckedChange={(v) => setSelected(v ? rows.map((r) => r.id) : [])}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead>Truck / Driver</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Purchase Order</TableHead>
                <TableHead>Gate Entry</TableHead>
                <TableHead>Dock</TableHead>
                <TableHead>Arrival</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Warehouse</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 11 }).map((__, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              {!loading &&
                rows.map((s) => (
                  <TableRow
                    key={s.id}
                    className="cursor-pointer"
                    onClick={() =>
                      navigate({ to: "/receiving-hub/queue/$id", params: { id: s.id } })
                    }
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selected.includes(s.id)}
                        onCheckedChange={(v) =>
                          setSelected((prev) =>
                            v ? [...prev, s.id] : prev.filter((x) => x !== s.id),
                          )
                        }
                        aria-label={`Select ${s.truckNo}`}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="grid h-8 w-8 place-items-center rounded-lg bg-surface-2 text-muted-foreground">
                          <Truck className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="num text-sm font-semibold">{s.truckNo}</p>
                          <p className="text-xs text-muted-foreground">{s.driver}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="max-w-[220px] truncate text-sm">{s.vendor}</p>
                      <p className="num text-xs text-muted-foreground">{s.vendorCode}</p>
                    </TableCell>
                    <TableCell>
                      <p className="num text-sm">{s.po}</p>
                      <p className="num text-xs text-muted-foreground">{s.asn}</p>
                    </TableCell>
                    <TableCell className="num text-xs">{s.gateEntry}</TableCell>
                    <TableCell>
                      {s.dock ? (
                        <span className="num rounded-md border border-border bg-surface-2 px-2 py-1 text-xs font-semibold">
                          {s.dock}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell className="num text-xs">{s.arrival}</TableCell>
                    <TableCell>
                      <PriorityPill priority={s.priority} />
                    </TableCell>
                    <TableCell>
                      <StatusPill status={s.status} />
                    </TableCell>
                    <TableCell className="num text-xs">{s.warehouse}</TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" aria-label="Row actions">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52">
                          <DropdownMenuLabel className="num text-xs">{s.id}</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link to="/receiving-hub/queue/$id" params={{ id: s.id }}>
                              Open receiving details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setDockFor(s.id)}>
                            Assign dock
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              dispatch({ type: "status", id: s.id, status: "Receiving Started" });
                              navigate({
                                to: "/receiving-hub/receiving/$id",
                                params: { id: s.id },
                              });
                            }}
                          >
                            <PlayCircle className="mr-2 h-4 w-4" /> Start receiving
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              dispatch({
                                type: "status",
                                id: s.id,
                                status: "On Hold",
                                note: "Placed on hold from queue",
                              });
                              toast.warning(`${s.truckNo} placed on hold`);
                            }}
                          >
                            Hold shipment
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              dispatch({
                                type: "status",
                                id: s.id,
                                status: "Rejected",
                                note: "Rejected at yard",
                              });
                              toast.error(`${s.truckNo} rejected`, {
                                description: "Vendor and procurement notified.",
                              });
                            }}
                          >
                            Reject consignment
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>

        {!loading && rows.length === 0 && (
          <CardContent className="p-0">
            <EmptyState
              icon={Truck}
              title="No shipments match these filters"
              body="Try clearing the search text or widening the status, priority and warehouse filters to see queued trucks."
              action={
                <Button
                  variant="outline"
                  onClick={() => {
                    setQ("");
                    setStatus("All");
                    setPriority("All");
                    setWh("All");
                  }}
                >
                  Reset filters
                </Button>
              }
            />
          </CardContent>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3 text-xs text-muted-foreground">
          <span className="num">
            Showing {rows.length} of {state.shipments.length} shipments
          </span>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm" className="num">
              1
            </Button>
            <Button variant="ghost" size="sm" className="num">
              2
            </Button>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
        </div>
      </Card>

      <AssignDockDialog shipmentId={dockFor} onClose={() => setDockFor(null)} />
    </div>
  );
}
