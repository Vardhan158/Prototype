import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Search,
  SlidersHorizontal,
  Download,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  PlayCircle,
  Eye,
  MoreHorizontal,
  RefreshCw,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  EmptyState,
  LoadingRows,
  PageHeader,
  SectionCard,
} from "@/apps/quality-gatekeeper/components/qm/Primitives";
import { StatusPill } from "@/apps/quality-gatekeeper/components/qm/StatusPill";
import {
  inspections,
  priorityTone,
  statusTone,
  warehouses,
} from "@/apps/quality-gatekeeper/lib/qm-data";

export const Route = createFileRoute("/quality-gatekeeper/queue/")({
  head: () => ({
    meta: [
      { title: "Inspection Queue Â· Axiom WMS" },
      {
        name: "description",
        content:
          "Prioritised queue of GRN lots awaiting quality inspection with inspector assignment.",
      },
      { property: "og:title", content: "Inspection Queue Â· Axiom WMS" },
      {
        property: "og:description",
        content: "Assign inspectors and start inspections for received warehouse lots.",
      },
    ],
  }),
  component: Queue,
});

const inspectors = ["Imran Qureshi", "Sara Al-Mutairi", "Faisal Bin Omar", "Nadia Farouk"];

function Queue() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [wh, setWh] = useState("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [assignFor, setAssignFor] = useState<string | null>(null);
  const [assignee, setAssignee] = useState(inspectors[0]!);
  const [loading, setLoading] = useState(false);

  const rows = useMemo(
    () =>
      inspections.filter(
        (i) =>
          (status === "all" || i.status === status) &&
          (priority === "all" || i.priority === priority) &&
          (wh === "all" || i.warehouse === wh) &&
          [i.id, i.grn, i.po, i.vendor, i.material, i.materialCode]
            .join(" ")
            .toLowerCase()
            .includes(q.toLowerCase()),
      ),
    [q, status, priority, wh],
  );

  const perPage = 8;
  const pages = Math.max(1, Math.ceil(rows.length / perPage));
  const view = rows.slice((page - 1) * perPage, page * perPage);

  const refresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 900);
  };

  return (
    <>
      <PageHeader
        breadcrumb={[
          { label: "Quality", to: "/quality-gatekeeper" },
          { label: "Inspection Queue" },
        ]}
        eyebrow="Screen 02"
        title="Inspection Queue"
        description={`${rows.length} lots in scope Â· sorted by priority then SLA remaining`}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={refresh}>
              <RefreshCw className="mr-2 h-4 w-4" /> Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.success("Queue exported to XLSX (12 rows)")}
            >
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
            <Button size="sm" disabled={selected.length === 0} onClick={() => setAssignFor("bulk")}>
              <UserPlus className="mr-2 h-4 w-4" /> Assign ({selected.length})
            </Button>
          </>
        }
      />

      <SectionCard padded={false}>
        <div className="flex flex-wrap items-center gap-2 border-b border-border p-3">
          <div className="relative min-w-[200px] flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              placeholder="Search inspection, GRN, PO, vendor or materialâ€¦"
              className="h-9 rounded-xl pl-9"
            />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="h-9 w-[168px] rounded-xl">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {[...new Set(inspections.map((i) => i.status))].map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger className="h-9 w-[150px] rounded-xl">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All priorities</SelectItem>
              {["Critical", "High", "Medium", "Low"].map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={wh} onValueChange={setWh}>
            <SelectTrigger className="hidden h-9 w-[190px] rounded-xl lg:flex">
              <SelectValue placeholder="Warehouse" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All warehouses</SelectItem>
              {warehouses.map((w) => (
                <SelectItem key={w} value={w}>
                  {w}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="h-9 rounded-xl">
            <SlidersHorizontal className="mr-2 h-4 w-4" /> More filters
          </Button>
        </div>

        {loading ? (
          <LoadingRows rows={6} />
        ) : view.length === 0 ? (
          <EmptyState
            title="No inspections match your filters"
            description="Try clearing the search term or widening the status and priority filters. New GRNs appear here once document validation is complete."
            action={
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setQ("");
                  setStatus("all");
                  setPriority("all");
                  setWh("all");
                }}
              >
                Clear all filters
              </Button>
            }
          />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto lg:block">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-10">
                      <Checkbox
                        checked={selected.length === view.length}
                        onCheckedChange={(c) => setSelected(c ? view.map((v) => v.id) : [])}
                      />
                    </TableHead>
                    <TableHead>Inspection ID</TableHead>
                    <TableHead>GRN / PO</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Material</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead>Warehouse</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Inspector</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {view.map((i) => (
                    <TableRow key={i.id} className="hover:bg-accent/30">
                      <TableCell>
                        <Checkbox
                          checked={selected.includes(i.id)}
                          onCheckedChange={(c) =>
                            setSelected((s) => (c ? [...s, i.id] : s.filter((x) => x !== i.id)))
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Link
                          to="/quality-gatekeeper/queue/$id"
                          params={{ id: i.id }}
                          className="num text-xs font-semibold text-primary hover:underline"
                        >
                          {i.id}
                        </Link>
                        <p className="text-[10px] text-muted-foreground">{i.receivedOn}</p>
                      </TableCell>
                      <TableCell className="num text-xs">
                        {i.grn}
                        <p className="text-[10px] text-muted-foreground">{i.po}</p>
                      </TableCell>
                      <TableCell className="max-w-[170px] truncate text-xs">{i.vendor}</TableCell>
                      <TableCell className="max-w-[210px]">
                        <p className="truncate text-xs font-medium">{i.material}</p>
                        <p className="num truncate text-[10px] text-muted-foreground">
                          {i.materialCode}
                        </p>
                      </TableCell>
                      <TableCell className="num text-right text-xs">
                        {i.qty} {i.uom}
                      </TableCell>
                      <TableCell className="max-w-[130px] truncate text-xs">
                        {i.warehouse}
                      </TableCell>
                      <TableCell>
                        <StatusPill tone={priorityTone[i.priority]} dot={false}>
                          {i.priority}
                        </StatusPill>
                      </TableCell>
                      <TableCell className="text-xs">
                        {i.inspector === "Unassigned" ? (
                          <span className="text-muted-foreground italic">Unassigned</span>
                        ) : (
                          i.inspector
                        )}
                      </TableCell>
                      <TableCell>
                        <StatusPill tone={statusTone[i.status]}>{i.status}</StatusPill>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                            <Link
                              to="/quality-gatekeeper/queue/$id"
                              params={{ id: i.id }}
                              aria-label="View details"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                            <Link
                              to="/quality-gatekeeper/inspection/$id"
                              params={{ id: i.id }}
                              aria-label="Start inspection"
                            >
                              <PlayCircle className="h-4 w-4 text-primary" />
                            </Link>
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setAssignFor(i.id)}>
                                Assign inspector
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link to="/quality-gatekeeper/sampling">Define sampling plan</Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link to="/quality-gatekeeper/hold">Place on quality hold</Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link to="/quality-gatekeeper/ncr/new">Raise NCR</Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  toast.success(`${i.id} printed to label station LP-02`)
                                }
                              >
                                Print inspection tag
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Tablet / mobile cards */}
            <ul className="divide-y divide-border lg:hidden">
              {view.map((i) => (
                <li key={i.id} className="p-3">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Link
                          to="/quality-gatekeeper/queue/$id"
                          params={{ id: i.id }}
                          className="num truncate text-xs font-semibold text-primary"
                        >
                          {i.id}
                        </Link>
                        <StatusPill tone={priorityTone[i.priority]} dot={false}>
                          {i.priority}
                        </StatusPill>
                      </div>
                      <p className="mt-1 truncate text-sm font-medium">{i.material}</p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {i.vendor} Â· {i.grn} Â· {i.qty} {i.uom}
                      </p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {i.warehouse} Â· {i.inspector}
                      </p>
                    </div>
                    <StatusPill tone={statusTone[i.status]}>{i.status}</StatusPill>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1" asChild>
                      <Link to="/quality-gatekeeper/queue/$id" params={{ id: i.id }}>
                        Details
                      </Link>
                    </Button>
                    <Button size="sm" className="flex-1" asChild>
                      <Link to="/quality-gatekeeper/inspection/$id" params={{ id: i.id }}>
                        Inspect
                      </Link>
                    </Button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-t border-border px-4 py-3">
              <p className="truncate text-[11px] text-muted-foreground">
                Showing {(page - 1) * perPage + 1}â€“{Math.min(page * perPage, rows.length)} of{" "}
                {rows.length} lots
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: pages }).map((_, idx) => (
                  <Button
                    key={idx}
                    variant={page === idx + 1 ? "default" : "outline"}
                    size="icon"
                    className="num h-8 w-8 text-xs"
                    onClick={() => setPage(idx + 1)}
                  >
                    {idx + 1}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={page === pages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </SectionCard>

      <Dialog open={assignFor !== null} onOpenChange={(o) => !o && setAssignFor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign inspector</DialogTitle>
            <DialogDescription>
              {assignFor === "bulk"
                ? `${selected.length} lots selected. The assignee will be notified on their handheld device.`
                : `Assign ${assignFor} to a qualified inspector. Certification is validated against the material group.`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Inspector</Label>
              <Select value={assignee} onValueChange={setAssignee}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {inspectors.map((n) => (
                    <SelectItem key={n} value={n}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="rounded-xl border border-info/25 bg-info/10 p-3 text-[11px]">
              Current workload: 3 open lots Â· Certification: ISO 9001 Lead Inspector (valid to
              2027-04-30)
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignFor(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                toast.success(`Assigned to ${assignee}`, {
                  description: "Status moved to Assigned Â· notification sent",
                });
                setAssignFor(null);
                setSelected([]);
              }}
            >
              Confirm assignment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
