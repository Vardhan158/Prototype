import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, Check, PackageX, ScanBarcode, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { PageHeader, SectionCard, StatusBadge } from "@/apps/warehouse-flow/components/ui-kit";
import { cn } from "@/lib/utils";
import { pickLists } from "@/apps/warehouse-flow/data";

export const Route = createFileRoute("/warehouse-flow/picking")({
  head: () => ({
    meta: [
      { title: "Warehouse Picking — WMS Console" },
      {
        name: "description",
        content:
          "Barcode-driven picking terminal with live progress, partial picks, missing item and wrong item handling.",
      },
      { property: "og:title", content: "Warehouse Picking — WMS Console" },
      {
        property: "og:description",
        content: "Barcode picking terminal with partial, missing and incorrect item handling.",
      },
    ],
  }),
  component: PickingPage,
});

type LineState = { picked: number; state: string };

function PickingPage() {
  const lines = pickLists.filter((p) => p.list === "PL-2026-0442" || p.list === "PL-2026-0443");
  const [scan, setScan] = useState("");
  const [idx, setIdx] = useState(0);
  const [states, setStates] = useState<Record<string, LineState>>(() =>
    Object.fromEntries(lines.map((l) => [l.pickId, { picked: 0, state: "Pending" }])),
  );

  const active = lines[idx];
  const totalQty = lines.reduce((s, l) => s + l.qty, 0);
  const pickedQty = Object.values(states).reduce((s, v) => s + v.picked, 0);
  const progress = Math.round((pickedQty / totalQty) * 100);

  const setLine = (id: string, patch: Partial<LineState>) =>
    setStates((s) => ({ ...s, [id]: { ...s[id]!, ...patch } }));

  const confirmScan = () => {
    if (!active) return;
    if (!scan.trim()) {
      toast.error("Scan or enter a barcode first");
      return;
    }
    if (scan.trim().toUpperCase() !== active.code) {
      setLine(active.pickId, { state: "Wrong Item" });
      toast.error(`Incorrect item — expected ${active.code}`);
      return;
    }
    setLine(active.pickId, { picked: active.qty, state: "Picked" });
    toast.success(`${active.code} picked · ${active.qty} units`);
    setScan("");
    setIdx((i) => Math.min(i + 1, lines.length - 1));
  };

  return (
    <>
      <PageHeader
        title="Warehouse Picking"
        description="Scan-driven picking terminal for active pick lists."
        breadcrumbs={[{ label: "Home", to: "/warehouse-flow/" }, { label: "Warehouse Picking" }]}
        actions={
          <Button onClick={() => toast.success("Picking session completed and handed to issue desk")}>
            <Check className="size-4" /> Complete Session
          </Button>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          <SectionCard title="Scan Terminal" description="Scan the bin label, then the material barcode">
            <div className="rounded-xl border border-dashed border-primary/40 bg-primary/5 p-6 text-center">
              <ScanBarcode className="mx-auto size-10 text-primary" />
              <p className="mt-3 text-sm text-muted-foreground">Ready to scan</p>
              {active && (
                <p className="num mt-1 text-lg font-bold">
                  {active.zone} · {active.rack} · {active.bin}
                </p>
              )}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Barcode / Material Code</Label>
                <Input
                  autoFocus
                  value={scan}
                  onChange={(e) => setScan(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && confirmScan()}
                  placeholder="e.g. MAT-10045"
                  className="num h-11"
                />
              </div>
              <Button className="h-11" onClick={confirmScan}>
                Confirm Pick
              </Button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (!active) return;
                  setLine(active.pickId, { picked: Math.floor(active.qty / 2), state: "Partial" });
                  toast.warning(`Partial pick recorded for ${active.code}`);
                }}
              >
                <SkipForward className="size-4" /> Partial Pick
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (!active) return;
                  setLine(active.pickId, { state: "Missing" });
                  toast.error(`${active.code} reported missing from ${active.bin}`);
                }}
              >
                <PackageX className="size-4" /> Item Missing
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (!active) return;
                  setLine(active.pickId, { state: "Wrong Item" });
                  toast.error("Incorrect item flagged for supervisor review");
                }}
              >
                <AlertTriangle className="size-4" /> Wrong Item
              </Button>
            </div>
          </SectionCard>

          <SectionCard title="Pick Sequence" bodyClassName="p-0">
            <ul className="divide-y divide-border">
              {lines.map((l, i) => {
                const st = states[l.pickId]!;
                return (
                  <li
                    key={l.pickId}
                    className={cn(
                      "grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-5 py-3.5",
                      i === idx && "bg-primary/6",
                    )}
                  >
                    <button
                      onClick={() => setIdx(i)}
                      className="num grid size-8 place-items-center rounded-full bg-muted text-xs font-semibold"
                    >
                      {i + 1}
                    </button>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{l.material}</p>
                      <p className="num text-xs text-muted-foreground">
                        {l.code} · {l.warehouse}/{l.rack}/{l.bin} · qty {l.qty}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="num text-xs text-muted-foreground">
                        {st.picked}/{l.qty}
                      </span>
                      <StatusBadge status={st.state === "Partial" ? "In Progress" : st.state === "Missing" || st.state === "Wrong Item" ? "Short" : st.state} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </SectionCard>
        </div>

        <div className="space-y-4">
          <SectionCard title="Picking Progress">
            <div className="text-center">
              <p className="num text-4xl font-bold">{progress}%</p>
              <p className="text-xs text-muted-foreground">
                {pickedQty} of {totalQty} units picked
              </p>
            </div>
            <Progress value={progress} className="mt-4 h-2" />
            <dl className="mt-5 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Lines completed</dt>
                <dd className="num font-semibold">
                  {Object.values(states).filter((s) => s.state === "Picked").length}/{lines.length}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Exceptions</dt>
                <dd className="num font-semibold">
                  {Object.values(states).filter((s) => ["Missing", "Wrong Item"].includes(s.state)).length}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Picker</dt>
                <dd className="font-semibold">Vikram Desai</dd>
              </div>
            </dl>
          </SectionCard>

          <SectionCard title="Exception Handling">
            <ul className="space-y-3 text-sm">
              {[
                ["Partial pick", "Records picked quantity and keeps the balance open on the request."],
                ["Missing item", "Raises a cycle-count task for the bin and notifies the supervisor."],
                ["Wrong item", "Blocks the line and routes it for supervisor verification."],
              ].map(([t, d]) => (
                <li key={t} className="rounded-lg border border-border p-3">
                  <Badge variant="outline" className="mb-1.5">{t}</Badge>
                  <p className="text-xs text-muted-foreground">{d}</p>
                </li>
              ))}
            </ul>
          </SectionCard>
        </div>
      </div>
    </>
  );
}
