import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Zap,
  Plus,
  GripVertical,
  CheckCheck,
  Rocket,
  Route as RouteIcon,
  History,
} from "lucide-react";
import { toast } from "sonner";
import {
  KpiCard,
  PageHeader,
  ProgressBar,
  SectionCard,
  StatusBadge,
  EmptyState,
} from "@/apps/wave-flow/components/wms/ui";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { orders, waves } from "@/apps/wave-flow/lib/wms-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/wave-flow/waves/")({
  head: () => ({
    meta: [
      { title: "Wave Management â€” NexusWMS" },
      {
        name: "description",
        content:
          "Plan, optimise, approve and release picking waves automatically or manually with drag-and-drop order grouping.",
      },
      { property: "og:title", content: "Wave Management â€” NexusWMS" },
      {
        property: "og:description",
        content: "Auto wave planning, optimisation and release control.",
      },
    ],
  }),
  component: WavesPage,
});

const columns = [
  { key: "Draft", label: "Draft" },
  { key: "Pending Approval", label: "Pending approval" },
  { key: "Released", label: "Released" },
  { key: "In Progress", label: "In progress" },
  { key: "Completed", label: "Completed" },
] as const;

function WavesPage() {
  const [autoOpen, setAutoOpen] = useState(false);
  const [planning, setPlanning] = useState(false);
  const [pool, setPool] = useState(
    orders.filter((o) => !o.wave && o.status !== "Cancelled").map((o) => o.id),
  );
  const [basket, setBasket] = useState<string[]>([]);
  const [dragging, setDragging] = useState<string | null>(null);

  const moveToBasket = (id: string) => {
    setPool((p) => p.filter((x) => x !== id));
    setBasket((b) => (b.includes(id) ? b : [...b, id]));
  };
  const moveToPool = (id: string) => {
    setBasket((b) => b.filter((x) => x !== id));
    setPool((p) => (p.includes(id) ? p : [...p, id]));
  };

  const runAutoPlan = () => {
    setPlanning(true);
    setTimeout(() => {
      setPlanning(false);
      setAutoOpen(false);
      toast.success("Auto wave planning complete", {
        description: "3 candidate waves generated Â· 42% travel-distance reduction",
      });
    }, 1400);
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Wave Management"
        description="Group ready orders into optimised picking waves and release them to the floor"
        breadcrumb={["Outbound", "Waves"]}
        actions={
          <>
            <Button variant="outline" onClick={() => toast.info("Wave history opened")}>
              <History className="size-4" /> Wave history
            </Button>
            <Button variant="outline" onClick={() => setAutoOpen(true)}>
              <Zap className="size-4" /> Auto wave planning
            </Button>
            <Button onClick={() => toast.success("Draft wave WV-2026-0446 created")}>
              <Plus className="size-4" /> Create wave
            </Button>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Open waves"
          value={4}
          sub="1 draft Â· 1 pending approval"
          icon={<RouteIcon className="size-4" />}
        />
        <KpiCard
          label="Wave fill rate"
          value="91%"
          sub="Target 88% Â· rolling 7 days"
          delta="+3%"
          tone="success"
          icon={<CheckCheck className="size-4" />}
        />
        <KpiCard
          label="Travel saved today"
          value="4.2 km"
          sub="Route optimisation engine"
          tone="secondary"
          icon={<Zap className="size-4" />}
        />
        <KpiCard
          label="Avg wave cycle"
          value="1h 46m"
          sub="Release â†’ picked"
          delta="-11m"
          tone="primary"
          icon={<Rocket className="size-4" />}
        />
      </div>

      <Tabs defaultValue="board">
        <TabsList>
          <TabsTrigger value="board">Wave board</TabsTrigger>
          <TabsTrigger value="list">Wave list</TabsTrigger>
          <TabsTrigger value="planner">Manual planner</TabsTrigger>
        </TabsList>

        <TabsContent value="board" className="mt-3">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {columns.map((col) => {
              const items = waves.filter((w) => w.status === col.key);
              return (
                <div key={col.key} className="surface-card flex flex-col p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-semibold tracking-wide uppercase">{col.label}</p>
                    <span className="num rounded-full bg-muted px-1.5 text-[11px] text-muted-foreground">
                      {items.length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {items.length === 0 && (
                      <p className="rounded-lg border border-dashed border-border px-3 py-6 text-center text-xs text-muted-foreground">
                        No waves
                      </p>
                    )}
                    {items.map((w) => (
                      <Link
                        key={w.id}
                        to="/wave-flow/waves/$waveId"
                        params={{ waveId: w.id }}
                        className="glass-panel block rounded-xl p-3 transition-colors hover:bg-accent"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="num text-sm font-medium">{w.id}</span>
                          <StatusBadge status={w.priority} />
                        </div>
                        <p className="mt-1 truncate text-xs text-muted-foreground">{w.strategy}</p>
                        <p className="num mt-1 text-xs text-muted-foreground">
                          {w.orders.length} orders Â· {w.totalItems} units
                        </p>
                        <div className="mt-2">
                          <ProgressBar
                            value={w.progress}
                            tone={w.progress === 100 ? "success" : "primary"}
                          />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="list" className="mt-3">
          <SectionCard bodyClassName="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-sm">
                <thead className="bg-surface-muted text-xs text-muted-foreground">
                  <tr>
                    {[
                      "Wave",
                      "WH",
                      "Strategy",
                      "Orders",
                      "Items",
                      "Priority",
                      "Dispatch window",
                      "Pickers",
                      "ETC",
                      "Status",
                      "",
                    ].map((h) => (
                      <th key={h} className="px-4 py-2.5 text-left font-medium whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {waves.map((w) => (
                    <tr key={w.id} className="hover:bg-muted/50">
                      <td className="num px-4 py-3 font-medium">
                        <Link
                          to="/wave-flow/waves/$waveId"
                          params={{ waveId: w.id }}
                          className="hover:text-primary"
                        >
                          {w.id}
                        </Link>
                      </td>
                      <td className="num px-4 py-3">{w.warehouse}</td>
                      <td className="px-4 py-3 text-muted-foreground">{w.strategy}</td>
                      <td className="num px-4 py-3">{w.orders.length}</td>
                      <td className="num px-4 py-3">{w.totalItems}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={w.priority} />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                        {w.dispatchWindow}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {w.assignedPickers.length ? w.assignedPickers.join(", ") : "Unassigned"}
                      </td>
                      <td className="num px-4 py-3 whitespace-nowrap text-muted-foreground">
                        {w.estimatedCompletion}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={w.status} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          to="/wave-flow/waves/$waveId"
                          params={{ waveId: w.id }}
                          className="text-xs font-medium text-primary"
                        >
                          Workflow
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="planner" className="mt-3">
          <div className="grid gap-4 lg:grid-cols-2">
            <SectionCard
              title="Unwaved ready orders"
              description="Drag an order card into the wave basket"
              bodyClassName="p-3"
            >
              <div
                className="space-y-2"
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => dragging && moveToPool(dragging)}
              >
                {pool.length === 0 && (
                  <EmptyState
                    icon={<CheckCheck className="size-6" />}
                    title="All ready orders are waved"
                    description="Every eligible order has been grouped into a wave. New orders appear here once inventory is reserved."
                  />
                )}
                {pool.map((id) => {
                  const o = orders.find((x) => x.id === id);
                  if (!o) return null;
                  return (
                    <div
                      key={id}
                      draggable
                      onDragStart={() => setDragging(id)}
                      onDragEnd={() => setDragging(null)}
                      onDoubleClick={() => moveToBasket(id)}
                      className={cn(
                        "glass-panel flex cursor-grab items-center gap-3 rounded-xl p-3 active:cursor-grabbing",
                        dragging === id && "opacity-50",
                      )}
                    >
                      <GripVertical className="size-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-0 flex-1">
                        <p className="num truncate text-sm font-medium">{o.id}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {o.customer} Â· {o.lines.length} lines Â· {o.dispatchWindow}
                        </p>
                      </div>
                      <StatusBadge status={o.priority} />
                      <Button variant="ghost" size="sm" onClick={() => moveToBasket(id)}>
                        Add
                      </Button>
                    </div>
                  );
                })}
              </div>
            </SectionCard>

            <SectionCard
              title="Wave basket â€” WV-2026-0446 (Draft)"
              description="Drop orders here to build the wave"
              actions={
                <Button
                  size="sm"
                  disabled={basket.length === 0}
                  onClick={() =>
                    toast.success(`Wave WV-2026-0446 submitted for approval`, {
                      description: `${basket.length} orders Â· route optimised`,
                    })
                  }
                >
                  Submit for approval
                </Button>
              }
              bodyClassName="p-3"
            >
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => dragging && moveToBasket(dragging)}
                className="min-h-[280px] space-y-2 rounded-xl border-2 border-dashed border-border p-3"
              >
                {basket.length === 0 ? (
                  <EmptyState
                    icon={<Plus className="size-6" />}
                    title="Empty wave basket"
                    description="Drag orders from the left, or double-click a card to add it. The optimiser recalculates the pick path on every change."
                  />
                ) : (
                  basket.map((id) => {
                    const o = orders.find((x) => x.id === id);
                    if (!o) return null;
                    return (
                      <div key={id} className="glass-panel flex items-center gap-3 rounded-xl p-3">
                        <div className="min-w-0 flex-1">
                          <p className="num truncate text-sm font-medium">{o.id}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {o.customer} Â· {o.lines.reduce((s, l) => s + l.qtyOrdered, 0)} units
                          </p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => moveToPool(id)}>
                          Remove
                        </Button>
                      </div>
                    );
                  })
                )}
              </div>
              {basket.length > 0 && (
                <div className="mt-3 grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-xl bg-muted p-2.5">
                    <p className="num text-lg font-semibold">{basket.length}</p>
                    <p className="text-xs text-muted-foreground">Orders</p>
                  </div>
                  <div className="rounded-xl bg-muted p-2.5">
                    <p className="num text-lg font-semibold">
                      {basket
                        .map((id) => orders.find((o) => o.id === id))
                        .reduce((s, o) => s + (o ? o.lines.length : 0), 0)}
                    </p>
                    <p className="text-xs text-muted-foreground">Lines</p>
                  </div>
                  <div className="rounded-xl bg-muted p-2.5">
                    <p className="num text-lg font-semibold text-success-foreground">-38%</p>
                    <p className="text-xs text-muted-foreground">Travel</p>
                  </div>
                </div>
              )}
            </SectionCard>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={autoOpen} onOpenChange={setAutoOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Auto wave planning</DialogTitle>
            <DialogDescription>
              The engine groups ready orders by carrier cutoff, zone density and priority, then
              optimises the pick path.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label>Strategy</Label>
              <Select defaultValue="zone">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="zone">Zone batch consolidation</SelectItem>
                  <SelectItem value="carrier">Carrier cutoff</SelectItem>
                  <SelectItem value="priority">Priority sweep</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label>Max orders per wave</Label>
                <Input defaultValue="12" />
              </div>
              <div className="grid gap-1.5">
                <Label>Max lines per picker</Label>
                <Input defaultValue="45" />
              </div>
              <div className="grid gap-1.5">
                <Label>Cutoff window</Label>
                <Input defaultValue="18 Mar Â· 14:00â€“18:00" />
              </div>
              <div className="grid gap-1.5">
                <Label>Warehouse</Label>
                <Select defaultValue="DC-01">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DC-01">DC-01 Rotterdam</SelectItem>
                    <SelectItem value="DC-04">DC-04 Memphis</SelectItem>
                    <SelectItem value="DC-07">DC-07 Singapore</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {planning && (
              <div className="space-y-2 rounded-xl bg-muted p-3">
                <p className="text-xs font-medium">Evaluating 24 ready ordersâ€¦</p>
                <ProgressBar value={72} />
                <p className="text-xs text-muted-foreground">
                  Optimising pick path across zones A, B, C, D
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAutoOpen(false)}>
              Cancel
            </Button>
            <Button onClick={runAutoPlan} disabled={planning}>
              {planning ? "Planningâ€¦" : "Run planning"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
