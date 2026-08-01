import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Search, Filter, Play, UserPlus, Eye, Inbox, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { EmptyState, PriorityPill, SectionCard, StatusBadge } from "@/apps/quality-gatekeeper/components/wms/bits";
import { INSPECTORS } from "@/apps/quality-gatekeeper/lib/wms-data";
import { actions, useWms } from "@/apps/quality-gatekeeper/lib/wms-store";

export const Route = createFileRoute("/quality-gatekeeper/queue")({
  head: () => ({
    meta: [
      { title: "Inspection Queue — AXIOM WMS Quality" },
      { name: "description", content: "Prioritised queue of received GRNs awaiting quality inspection, with inspector assignment and dock details." },
      { property: "og:title", content: "Inspection Queue — AXIOM WMS Quality" },
      { property: "og:description", content: "Prioritised GRN inspection queue with inspector assignment." },
    ],
  }),
  component: QueuePage,
});

const TABS = ["All", "Waiting Inspection", "Assigned", "Inspection Started", "Quality Hold", "Completed"] as const;

function QueuePage() {
  const { grns } = useWms();
  const navigate = useNavigate();
  const [tab, setTab] = useState<string>("All");
  const [q, setQ] = useState("");
  const [priority, setPriority] = useState("all");
  const [loading, setLoading] = useState(false);
  const [assignFor, setAssignFor] = useState<string | null>(null);
  const [inspector, setInspector] = useState(INSPECTORS[0]!);

  const rows = useMemo(
    () =>
      grns.filter((g) => {
        const matchTab =
          tab === "All" ||
          (tab === "Completed" ? ["Passed", "Available Inventory", "RTS", "NCR Created"].includes(g.status) : g.status === tab);
        const matchQ =
          !q ||
          [g.grn, g.po, g.vendor, g.material, g.truck, g.inspector].join(" ").toLowerCase().includes(q.toLowerCase());
        const matchP = priority === "all" || g.priority === priority;
        return matchTab && matchQ && matchP;
      }),
    [grns, tab, q, priority],
  );

  const refresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Queue synchronised with EWM", { description: "Last sync 01 Aug 2026, 10:48 · 7 GRNs" });
    }, 900);
  };

  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:flex-wrap sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Quality Inspection</p>
          <h1 className="truncate text-2xl font-bold sm:text-3xl">Inspection Queue</h1>
        </div>
        <Button variant="outline" className="rounded-xl" onClick={refresh}>
          <RefreshCw className="h-4 w-4" /> Sync EWM
        </Button>
      </header>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex h-auto flex-wrap justify-start gap-1 rounded-xl bg-muted/70 p-1">
          {TABS.map((t) => (
            <TabsTrigger key={t} value={t} className="rounded-lg text-xs">
              {t}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <SectionCard
        title={`${rows.length} GRN${rows.length === 1 ? "" : "s"} in view`}
        description="Every row is clickable — opens full inspection details"
        action={
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search GRN / PO / vendor" className="h-9 w-56 rounded-lg pl-9" />
            </div>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger className="h-9 w-36 rounded-lg">
                <Filter className="h-3.5 w-3.5" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All priority</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      >
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <EmptyState
            icon={<Inbox className="h-6 w-6" />}
            title="No GRNs match this filter"
            description="Adjust the status tab, priority filter or search term. New receipts appear here automatically once the GRN is posted."
            action={
              <Button variant="outline" size="sm" onClick={() => { setTab("All"); setQ(""); setPriority("all"); }}>
                Reset filters
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="whitespace-nowrap">GRN Number</TableHead>
                  <TableHead className="whitespace-nowrap">Vendor</TableHead>
                  <TableHead className="whitespace-nowrap">PO Number</TableHead>
                  <TableHead className="whitespace-nowrap">Truck</TableHead>
                  <TableHead className="whitespace-nowrap">Material</TableHead>
                  <TableHead className="whitespace-nowrap text-right">Quantity</TableHead>
                  <TableHead className="whitespace-nowrap">Priority</TableHead>
                  <TableHead className="whitespace-nowrap">Arrival</TableHead>
                  <TableHead className="whitespace-nowrap">Status</TableHead>
                  <TableHead className="whitespace-nowrap">Inspector</TableHead>
                  <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((g) => (
                  <TableRow key={g.id} className="cursor-pointer" onClick={() => navigate({ to: "/quality-gatekeeper/inspection/$grn", params: { grn: g.id } })}>
                    <TableCell className="num font-mono text-xs font-semibold text-primary">{g.grn}</TableCell>
                    <TableCell className="max-w-[190px] truncate text-xs">{g.vendor}</TableCell>
                    <TableCell className="num font-mono text-xs">{g.po}</TableCell>
                    <TableCell className="num font-mono text-xs">{g.truck}</TableCell>
                    <TableCell className="max-w-[180px] truncate text-xs">{g.material}</TableCell>
                    <TableCell className="num text-right text-xs font-semibold">
                      {g.qty.toLocaleString()} {g.uom}
                    </TableCell>
                    <TableCell>
                      <PriorityPill priority={g.priority} />
                    </TableCell>
                    <TableCell className="text-xs whitespace-nowrap text-muted-foreground">{g.arrival}</TableCell>
                    <TableCell>
                      <StatusBadge status={g.status} />
                    </TableCell>
                    <TableCell className="text-xs">{g.inspector}</TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()} className="text-right whitespace-nowrap">
                      <div className="inline-flex gap-1">
                        <Button
                          size="sm"
                          className="h-8 rounded-lg"
                          onClick={() => {
                            actions.start(g.id);
                            toast.success(`Inspection started for ${g.grn}`);
                            navigate({ to: "/quality-gatekeeper/inspect/$grn", params: { grn: g.id } });
                          }}
                        >
                          <Play className="h-3.5 w-3.5" /> Start
                        </Button>
                        <Button size="sm" variant="outline" className="h-8 rounded-lg" onClick={() => setAssignFor(g.id)}>
                          <UserPlus className="h-3.5 w-3.5" /> Assign
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 rounded-lg" onClick={() => navigate({ to: "/quality-gatekeeper/inspection/$grn", params: { grn: g.id } })}>
                          <Eye className="h-3.5 w-3.5" /> View
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </SectionCard>

      <Dialog open={assignFor !== null} onOpenChange={(o) => !o && setAssignFor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign inspector</DialogTitle>
            <DialogDescription>
              Assignment notifies the inspector on mobile and locks the GRN to their queue.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase">Quality inspector</label>
            <Select value={inspector} onValueChange={setInspector}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INSPECTORS.map((i) => (
                  <SelectItem key={i} value={i}>
                    {i}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignFor(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (assignFor) actions.assign(assignFor, inspector);
                setAssignFor(null);
                toast.success(`${inspector} assigned`, { description: "Push notification sent to inspector device." });
              }}
            >
              Confirm assignment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
