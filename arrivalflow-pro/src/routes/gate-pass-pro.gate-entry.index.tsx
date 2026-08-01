import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Search, Plus, Download, SlidersHorizontal, Eye, Printer, XCircle, Inbox, Loader2, RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, SheetFooter,
} from "@/components/ui/sheet";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { AppShell } from "@/apps/gate-pass-pro/components/wms/AppShell";
import { StatusChip } from "@/apps/gate-pass-pro/components/wms/StatusChip";
import { gateEntries } from "@/apps/gate-pass-pro/lib/wms-data";

export const Route = createFileRoute("/gate-pass-pro/gate-entry/")({
  head: () => ({
    meta: [
      { title: "Gate Entry Register — NexusWMS" },
      { name: "description", content: "Searchable register of all truck gate entries with vendor, PO, driver, status and export." },
      { property: "og:title", content: "Gate Entry Register — NexusWMS" },
      { property: "og:description", content: "Every inbound truck gate entry with filters, search and export." },
    ],
  }),
  component: GateEntryList,
});

const statuses = ["All statuses", "Draft", "Pending Approval", "Approved", "On Hold", "Rejected", "Waiting Warehouse", "Warehouse Accepted", "Receiving", "Completed", "Vehicle Verified"];

function GateEntryList() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("All statuses");
  const [gate, setGate] = useState("All gates");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const perPage = 6;

  const filtered = useMemo(
    () =>
      gateEntries.filter((e) => {
        const text = `${e.id} ${e.truck} ${e.vendor} ${e.po} ${e.driver}`.toLowerCase();
        return (
          text.includes(q.toLowerCase()) &&
          (status === "All statuses" || e.status === status) &&
          (gate === "All gates" || e.gate.startsWith(gate))
        );
      }),
    [q, status, gate],
  );

  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const rows = filtered.slice((page - 1) * perPage, page * perPage);

  const refresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 900);
  };

  return (
    <AppShell
      title="Gate Entry Register"
      subtitle={`${gateEntries.length} entries today · auto-synced with SAP EWM inbound deliveries`}
      actions={
        <>
          <Button variant="outline" onClick={refresh}>
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Export</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {["Excel (.xlsx)", "CSV", "PDF register", "Send to email"].map((f) => (
                <DropdownMenuItem key={f} onClick={() => toast.success(`Export queued · ${f}`)}>{f}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button asChild><Link to="/gate-pass-pro/gate-entry/new"><Plus className="mr-2 h-4 w-4" />New Gate Entry</Link></Button>
        </>
      }
    >
      <div className="surface-card">
        <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
          <div className="relative min-w-56 flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(1); }}
              placeholder="Search gate entry, truck, vendor, PO or driver…"
              className="pl-9"
            />
          </div>
          <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
            <SelectTrigger className="w-52"><SelectValue /></SelectTrigger>
            <SelectContent>
              {statuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={gate} onValueChange={(v) => { setGate(v); setPage(1); }}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              {["All gates", "Gate 01", "Gate 02", "Gate 03"].map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
            </SelectContent>
          </Select>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline"><SlidersHorizontal className="mr-2 h-4 w-4" />Advanced filters</Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md">
              <SheetHeader>
                <SheetTitle>Advanced filters</SheetTitle>
                <SheetDescription>Refine the gate entry register across vendors, docks and time windows.</SheetDescription>
              </SheetHeader>
              <div className="space-y-5 px-4">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Arrival window</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Input type="date" defaultValue="2026-08-01" />
                    <Input type="date" defaultValue="2026-08-01" />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Warehouse</p>
                  {["WH-01 Bhiwandi", "WH-02 Hosur", "WH-03 Ghaziabad"].map((w) => (
                    <label key={w} className="flex items-center gap-2 text-sm"><Checkbox defaultChecked /> {w}</label>
                  ))}
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Exceptions only</p>
                  {["Blacklisted driver", "Expired documents", "Slot missed", "Safety exception"].map((w) => (
                    <label key={w} className="flex items-center gap-2 text-sm"><Checkbox /> {w}</label>
                  ))}
                </div>
              </div>
              <SheetFooter>
                <Button onClick={() => toast.success("Filters applied to register")}>Apply filters</Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>

        {loading ? (
          <div className="space-y-3 p-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />
            ))}
            <p className="flex items-center justify-center gap-2 pt-2 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Syncing gate entries from EWM…
            </p>
          </div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-muted text-muted-foreground">
              <Inbox className="h-6 w-6" />
            </span>
            <p className="mt-4 text-sm font-semibold">No gate entries match your filters</p>
            <p className="mt-1 max-w-sm text-xs text-muted-foreground">
              Try clearing the status or gate filter, or create a new gate entry for a truck waiting outside.
            </p>
            <div className="mt-5 flex gap-2">
              <Button variant="outline" onClick={() => { setQ(""); setStatus("All statuses"); setGate("All gates"); }}>
                <XCircle className="mr-2 h-4 w-4" /> Clear filters
              </Button>
              <Button asChild><Link to="/gate-pass-pro/gate-entry/new">New gate entry</Link></Button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-5xl text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                  <th className="w-10 px-4 py-3"><Checkbox /></th>
                  <th className="px-4 py-3">Gate entry</th>
                  <th className="px-4 py-3">Truck no.</th>
                  <th className="px-4 py-3">Vendor</th>
                  <th className="px-4 py-3">PO number</th>
                  <th className="px-4 py-3">Arrival</th>
                  <th className="px-4 py-3">Driver</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((e) => (
                  <tr key={e.id} className="group transition-colors hover:bg-accent/40">
                    <td className="px-4 py-3"><Checkbox /></td>
                    <td className="px-4 py-3">
                      <Link to="/gate-pass-pro/gate-entry/$id" params={{ id: e.id }} className="font-mono text-xs font-semibold text-primary hover:underline">
                        {e.id}
                      </Link>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">{e.gate}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-semibold">{e.truck}</span>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">{e.vehicleType}</p>
                    </td>
                    <td className="max-w-52 px-4 py-3">
                      <p className="truncate text-xs font-medium">{e.vendor}</p>
                      <p className="text-[11px] text-muted-foreground">{e.vendorCode}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-mono text-xs">{e.po}</p>
                      <p className="text-[11px] text-muted-foreground">{e.poValue}</p>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {e.arrival.slice(11)}
                      {e.delayMin > 0 && (
                        <Badge className="ml-2 bg-warning/15 text-[10px] text-warning">+{e.delayMin}m</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Link to="/gate-pass-pro/drivers/$id" params={{ id: e.driverId }} className="text-xs font-medium hover:text-primary hover:underline">
                        {e.driver}
                      </Link>
                      <p className="text-[11px] text-muted-foreground">{e.driverId}</p>
                    </td>
                    <td className="px-4 py-3"><StatusChip status={e.status} /></td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1 opacity-70 transition-opacity group-hover:opacity-100">
                        <Button variant="ghost" size="icon" asChild aria-label="View">
                          <Link to="/gate-pass-pro/gate-entry/$id" params={{ id: e.id }}><Eye className="h-4 w-4" /></Link>
                        </Button>
                        <Button variant="ghost" size="icon" aria-label="Print gate pass" onClick={() => toast.success(`Gate pass sent to Gate 01 printer · ${e.id}`)}>
                          <Printer className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && rows.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border p-4 text-xs text-muted-foreground">
            <p>Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} of {filtered.length} entries</p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
              {Array.from({ length: pages }).map((_, i) => (
                <Button key={i} size="sm" variant={page === i + 1 ? "default" : "outline"} onClick={() => setPage(i + 1)}>
                  {i + 1}
                </Button>
              ))}
              <Button variant="outline" size="sm" disabled={page === pages} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
