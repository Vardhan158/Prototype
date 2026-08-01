import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { RefreshCw, Search } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/apps/gatepass-pro/components/wms/AppShell";
import { EntryCard } from "@/apps/gatepass-pro/components/wms/EntryCard";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useWms } from "@/apps/gatepass-pro/lib/wms/store";
import { cn } from "@/lib/utils";

const FILTERS = ["All", "Waiting Warehouse", "Accepted", "Hold", "Rejected", "Exited"] as const;

export const Route = createFileRoute("/gatepass-pro/entries")({
  head: () => ({
    meta: [
      { title: "Today's Entries — GateFlow WMS" },
      { name: "description", content: "Search and filter today's gate entries by vehicle number, vendor and status." },
      { property: "og:title", content: "Today's Entries — GateFlow WMS" },
      { property: "og:description", content: "Search today's truck arrivals by vehicle, vendor or status." },
    ],
  }),
  component: Entries,
});

function Entries() {
  const { entries } = useWms();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [refreshing, setRefreshing] = useState(false);

  const list = entries.filter((e) => {
    const matchQ =
      !q ||
      e.vehicle.number.toLowerCase().includes(q.toLowerCase()) ||
      e.delivery.vendor.toLowerCase().includes(q.toLowerCase()) ||
      e.delivery.po.includes(q);
    return matchQ && (filter === "All" || e.status === filter);
  });

  return (
    <AppShell
      title="Today's Entries"
      subtitle={`${entries.length} arrivals · Gate 02`}
      back="/gatepass-pro"
      action={
        <button
          aria-label="Pull to refresh"
          onClick={() => {
            setRefreshing(true);
            setTimeout(() => {
              setRefreshing(false);
              toast.success("List refreshed");
            }, 900);
          }}
          className="grid size-10 place-items-center rounded-full active:bg-white/15"
        >
          <RefreshCw className={cn("size-5", refreshing && "animate-spin")} />
        </button>
      }
    >
      <div className="relative mb-3">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search vehicle, vendor or PO"
          className="h-14 rounded-2xl pl-11 text-base"
        />
      </div>

      <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-xs font-semibold",
              filter === f ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground",
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid gap-3">
        {refreshing
          ? [0, 1, 2].map((i) => <Skeleton key={i} className="h-[132px] rounded-2xl" />)
          : list.map((e) => <EntryCard key={e.id} entry={e} />)}
        {!refreshing && list.length === 0 ? (
          <p className="mt-8 text-center text-sm text-muted-foreground">No entries match this search.</p>
        ) : null}
      </div>
    </AppShell>
  );
}