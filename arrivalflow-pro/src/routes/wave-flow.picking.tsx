import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ScanBarcode, Play, Pause, SkipForward, TriangleAlert, MapPin, Check } from "lucide-react";
import { toast } from "sonner";
import {
  KpiCard,
  Metric,
  PageHeader,
  ProgressBar,
  SectionCard,
  StatusBadge,
} from "@/apps/wave-flow/components/wms/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { pickers, pickTasks } from "@/apps/wave-flow/lib/wms-data";

export const Route = createFileRoute("/wave-flow/picking")({
  head: () => ({
    meta: [
      { title: "Picking Management â€” NexusWMS" },
      {
        name: "description",
        content:
          "Pick queue, RF barcode scanning workflow, location navigation and picker productivity in real time.",
      },
      { property: "og:title", content: "Picking Management â€” NexusWMS" },
      {
        property: "og:description",
        content: "Pick tasks, scanning validation and exception handling.",
      },
    ],
  }),
  component: PickingPage,
});

function PickingPage() {
  const [active, setActive] = useState(pickTasks[0]!);
  const [scan, setScan] = useState("");
  const [confirmed, setConfirmed] = useState(active.picked);

  const validate = () => {
    if (scan.trim() === active.barcode) {
      setConfirmed((c) => Math.min(active.qty, c + 20));
      toast.success("Barcode validated", { description: `${active.material} Â· ${active.bin}` });
      setScan("");
    } else {
      toast.error("Barcode mismatch", {
        description: `Expected ${active.barcode} at ${active.bin}`,
      });
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Picking Management"
        description="18 open pick tasks Â· 14 pickers active Â· 132 lines/hour"
        breadcrumb={["Outbound", "Picking"]}
        actions={
          <Button onClick={() => toast.success("Tasks rebalanced across 4 zones")}>
            <ScanBarcode className="size-4" /> Rebalance queue
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Queued tasks"
          value={7}
          sub="Zones A, C, D"
          icon={<ScanBarcode className="size-4" />}
        />
        <KpiCard
          label="In progress"
          value={5}
          sub="avg 11 min/task"
          tone="warning"
          icon={<Play className="size-4" />}
        />
        <KpiCard
          label="Completed today"
          value={214}
          sub="99.2% accuracy"
          tone="success"
          delta="+8%"
          icon={<Check className="size-4" />}
        />
        <KpiCard
          label="Exceptions"
          value={1}
          sub="Inventory shortage"
          tone="danger"
          icon={<TriangleAlert className="size-4" />}
        />
      </div>

      <Tabs defaultValue="queue">
        <TabsList>
          <TabsTrigger value="queue">Pick queue</TabsTrigger>
          <TabsTrigger value="rf">RF picking screen</TabsTrigger>
          <TabsTrigger value="pickers">Pickers</TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="mt-3">
          <SectionCard bodyClassName="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-sm">
                <thead className="bg-surface-muted text-xs text-muted-foreground">
                  <tr>
                    {[
                      "Task",
                      "Wave",
                      "Order",
                      "Material",
                      "Bin",
                      "Zone",
                      "Qty",
                      "Picker",
                      "ETA",
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
                  {pickTasks.map((t) => (
                    <tr key={t.id} className="hover:bg-muted/50">
                      <td className="num px-4 py-3 font-medium">{t.id}</td>
                      <td className="num px-4 py-3 text-muted-foreground">{t.wave}</td>
                      <td className="num px-4 py-3 text-muted-foreground">{t.order}</td>
                      <td className="num px-4 py-3">{t.material}</td>
                      <td className="num px-4 py-3">{t.bin}</td>
                      <td className="px-4 py-3 text-muted-foreground">{t.zone}</td>
                      <td className="num px-4 py-3">
                        {t.picked}/{t.qty}
                      </td>
                      <td className="px-4 py-3">{t.picker}</td>
                      <td className="num px-4 py-3 text-muted-foreground">
                        {t.etaMin ? `${t.etaMin} min` : "â€”"}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={t.status} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setActive(t);
                            setConfirmed(t.picked);
                          }}
                        >
                          Open
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="rf" className="mt-3">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
            <SectionCard
              title={`RF device Â· ${active.id}`}
              description="Handheld picking screen (mobile layout)"
            >
              <div className="mx-auto w-full max-w-sm space-y-3">
                <div className="rounded-2xl bg-primary p-4 text-primary-foreground">
                  <p className="text-xs opacity-80">GO TO LOCATION</p>
                  <p className="num text-2xl font-semibold">{active.bin}</p>
                  <p className="mt-1 text-xs opacity-90">
                    {active.zone} Â· Aisle {active.aisle} Â· Rack {active.rack} Â· Shelf{" "}
                    {active.shelf}
                  </p>
                </div>
                <div className="surface-card p-4">
                  <p className="num text-sm font-semibold">{active.material}</p>
                  <p className="text-xs text-muted-foreground">{active.description}</p>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-lg bg-muted p-2">
                      <p className="num text-lg font-semibold">{active.qty}</p>
                      <p className="text-[11px] text-muted-foreground">Required</p>
                    </div>
                    <div className="rounded-lg bg-muted p-2">
                      <p className="num text-lg font-semibold text-success-foreground">
                        {confirmed}
                      </p>
                      <p className="text-[11px] text-muted-foreground">Picked</p>
                    </div>
                    <div className="rounded-lg bg-muted p-2">
                      <p className="num text-lg font-semibold">{active.uom}</p>
                      <p className="text-[11px] text-muted-foreground">UoM</p>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <span>Batch: {active.batch}</span>
                    <span>Serial: {active.serial}</span>
                  </div>
                  <div className="mt-3">
                    <ProgressBar
                      value={(confirmed / active.qty) * 100}
                      tone={confirmed >= active.qty ? "success" : "warning"}
                    />
                  </div>
                </div>
                <div className="surface-card space-y-2 p-4">
                  <p className="text-xs font-medium">Scan item barcode</p>
                  <div className="flex gap-2">
                    <Input
                      value={scan}
                      onChange={(e) => setScan(e.target.value)}
                      placeholder={active.barcode}
                      className="num"
                    />
                    <Button onClick={validate}>
                      <ScanBarcode className="size-4" /> Scan
                    </Button>
                  </div>
                  <p className="text-[11px] text-muted-foreground">Expected: {active.barcode}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={() => toast.success(`${active.id} confirmed`)}>
                    <Check className="size-4" /> Confirm
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => toast.info(`${active.id} skipped â€” requeued`)}
                  >
                    <SkipForward className="size-4" /> Skip
                  </Button>
                  <Button variant="outline" onClick={() => toast.warning(`${active.id} paused`)}>
                    <Pause className="size-4" /> Pause
                  </Button>
                  <Button
                    variant="outline"
                    className="text-danger"
                    onClick={() => toast.error("Exception EXC-5522 raised")}
                  >
                    <TriangleAlert className="size-4" /> Report issue
                  </Button>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Pick route" description="Optimised serpentine path through zones">
              <div className="grid grid-cols-10 gap-1">
                {Array.from({ length: 60 }).map((_, i) => {
                  const onPath = [3, 4, 5, 15, 25, 24, 23, 33, 43, 42, 41, 51].includes(i);
                  const stop = [3, 25, 41].includes(i);
                  return (
                    <div
                      key={i}
                      className={`aspect-square rounded-md border text-[9px] ${
                        stop
                          ? "border-primary bg-primary text-primary-foreground"
                          : onPath
                            ? "border-primary/30 bg-primary-soft"
                            : "border-border bg-muted"
                      } grid place-items-center`}
                    >
                      {stop ? <MapPin className="size-3" /> : ""}
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <Metric label="Stops" value="12" />
                <Metric label="Distance" value="1,610 m" />
                <Metric label="Est. duration" value="34 min" />
              </div>
            </SectionCard>
          </div>
        </TabsContent>

        <TabsContent value="pickers" className="mt-3">
          <SectionCard bodyClassName="p-0">
            <ul className="divide-y divide-border">
              {pickers.map((p) => (
                <li
                  key={p.name}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-secondary-soft text-xs font-semibold text-secondary-foreground">
                      {p.name
                        .split(" ")
                        .map((x) => x[0])
                        .join("")}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{p.name}</p>
                      <p className="num truncate text-xs text-muted-foreground">
                        {p.zone} Â· {p.tasks} tasks Â· {p.lph} lines/hr Â· {p.accuracy}% accuracy
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={p.status} />
                </li>
              ))}
            </ul>
          </SectionCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
