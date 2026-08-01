import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Timer, ArrowRight, Truck, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AppShell } from "@/apps/gate-pass-pro/components/wms/AppShell";
import { StatusChip } from "@/apps/gate-pass-pro/components/wms/StatusChip";
import { gateEntries, queueColumns } from "@/apps/gate-pass-pro/lib/wms-data";

export const Route = createFileRoute("/gate-pass-pro/queue")({
  head: () => ({
    meta: [
      { title: "Vehicle Queue Board — NexusWMS" },
      { name: "description", content: "Kanban yard board tracking trucks from waiting to dock assigned, receiving and completed." },
      { property: "og:title", content: "Vehicle Queue Board — NexusWMS" },
      { property: "og:description", content: "Live yard kanban for inbound truck flow." },
    ],
  }),
  component: QueueBoard,
});

const toneBar: Record<string, string> = {
  warning: "bg-warning",
  info: "bg-primary",
  teal: "bg-secondary",
  success: "bg-success",
  neutral: "bg-muted-foreground",
};

function QueueBoard() {
  const [board] = useState(queueColumns);

  return (
    <AppShell
      title="Vehicle Queue Board"
      subtitle="Live yard flow across Gate 01–03 · auto-refresh every 30 seconds"
      actions={
        <Button variant="outline" onClick={() => toast.success("Board refreshed · 13:12:04")}>
          <RefreshCw className="mr-2 h-4 w-4" />Refresh
        </Button>
      }
    >
      <div className="grid gap-4 lg:grid-cols-5">
        {board.map((col) => {
          const cards = col.ids.map((id) => gateEntries.find((e) => e.id === id)).filter(Boolean);
          return (
            <div key={col.key} className="surface-card flex flex-col p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide">{col.title}</p>
                <Badge className="bg-muted text-[10px] text-muted-foreground">{cards.length}</Badge>
              </div>
              <span className={`mt-2 h-1 w-full rounded-full ${toneBar[col.tone]}`} />
              <div className="mt-4 flex-1 space-y-3">
                {cards.length === 0 && (
                  <div className="rounded-xl border border-dashed border-border p-6 text-center text-[11px] text-muted-foreground">
                    No vehicles in this stage
                  </div>
                )}
                {cards.map((e) => (
                  <Link
                    key={e!.id}
                    to="/gate-pass-pro/gate-entry/$id"
                    params={{ id: e!.id }}
                    className="block rounded-xl border border-border p-3 transition-shadow hover:shadow-card"
                  >
                    <div className="flex items-center gap-2">
                      <Truck className="h-3.5 w-3.5 text-primary" />
                      <span className="font-mono text-xs font-semibold">{e!.truck}</span>
                    </div>
                    <p className="mt-1 truncate text-[11px] text-muted-foreground">{e!.vendor}</p>
                    <p className="mt-1 font-mono text-[10px] text-muted-foreground">{e!.id}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <StatusChip status={e!.status} />
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Timer className="h-3 w-3" />{e!.waitingMin}m
                      </span>
                    </div>
                    <p className="mt-2 text-[10px] text-muted-foreground">{e!.dock} · {e!.gate}</p>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 surface-card flex flex-wrap items-center justify-between gap-3 p-5">
        <div>
          <p className="text-sm font-semibold">Completed trucks flow into Goods Receiving &amp; GRN Management</p>
          <p className="text-[11px] text-muted-foreground">Module 03 picks up the accepted consignment for putaway.</p>
        </div>
        <Button asChild><Link to="/gate-pass-pro/receiving">Open Module 03 <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
      </div>
    </AppShell>
  );
}
