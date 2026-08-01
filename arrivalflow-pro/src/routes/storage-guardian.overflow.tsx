import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowDown, CircleCheck, CircleX, PlayCircle, TriangleAlert } from "lucide-react";
import { PageHeader } from "@/apps/storage-guardian/components/warehouse/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useWarehouse } from "@/apps/storage-guardian/lib/warehouse/store";
import { CATEGORIES, zoneById } from "@/apps/storage-guardian/lib/warehouse/data";
import { CATEGORY_ZONES, allocate, validateStorageRules } from "@/apps/storage-guardian/lib/warehouse/rules";
import type { AllocationResult, Item, ItemCategory } from "@/apps/storage-guardian/lib/warehouse/types";

export const Route = createFileRoute("/storage-guardian/overflow")({
  head: () => ({
    meta: [
      { title: "Overflow Simulator — NODE·WMS" },
      {
        name: "description",
        content:
          "Dry-run the capacity overflow decision tree: preferred location, next rack, alternate zone, overflow area, manager escalation.",
      },
      { property: "og:title", content: "Overflow Simulator — NODE·WMS" },
      {
        property: "og:description",
        content: "Visualise the five-step capacity overflow decision tree before committing stock.",
      },
    ],
  }),
  component: OverflowPage,
});

function OverflowPage() {
  const { locations } = useWarehouse();
  const [category, setCategory] = useState<ItemCategory>(CATEGORIES[0] as ItemCategory);
  const [qty, setQty] = useState("8");
  const [result, setResult] = useState<AllocationResult | null>(null);

  const run = () => {
    const item: Item = {
      id: "SIM",
      name: "Simulated intake",
      category,
      code: "SIM",
      hazard: "None",
      temp: "Ambient",
      size: "Medium",
      weightKg: 10,
      valueUsd: 1000,
      qty: Number(qty) || 1,
      po: "PO-SIM",
      asn: "ASN-SIM",
      supplier: "Simulator",
      stage: "capacity",
      status: "In Pipeline",
      createdAt: "",
    };
    const v = validateStorageRules(item);
    const order = [v.recommendedZone, ...(CATEGORY_ZONES[category] ?? []).filter((z) => z !== v.recommendedZone)];
    setResult(allocate(item, locations, order));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Capacity Overflow Simulator"
        subtitle="Dry-run the allocation decision tree against live capacity — nothing is committed to inventory."
      />

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <div className="panel h-fit space-y-4 p-5">
          <div className="space-y-1.5">
            <Label>Item category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as ItemCategory)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <p className="text-[11px] text-muted-foreground">
              Allowed: {(CATEGORY_ZONES[category] ?? []).map((z) => zoneById(z).name).join(", ")}
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="qty">Units to place</Label>
            <Input id="qty" type="number" value={qty} onChange={(e) => setQty(e.target.value)} />
          </div>
          <Button className="w-full" onClick={run}>
            <PlayCircle className="size-4" /> Run decision tree
          </Button>
        </div>

        <div className="panel p-5">
          <h2 className="text-lg font-semibold">Decision tree</h2>
          {!result && (
            <p className="mt-2 text-sm text-muted-foreground">
              Run the simulator to trace each escalation step from preferred location to manager escalation.
            </p>
          )}
          {result && (
            <>
              <ol className="mt-4 space-y-2">
                {result.steps.map((s, i) => (
                  <li key={s.step}>
                    <div
                      className={`rounded-md border p-3 ${
                        s.outcome === "pass"
                          ? "border-success/40 bg-success/10"
                          : s.outcome === "escalate"
                            ? "border-warning/40 bg-warning/10"
                            : "border-border bg-muted/30"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {s.outcome === "pass" ? (
                          <CircleCheck className="size-4 text-success" />
                        ) : s.outcome === "escalate" ? (
                          <TriangleAlert className="size-4 text-warning" />
                        ) : (
                          <CircleX className="size-4 text-muted-foreground" />
                        )}
                        <span className="text-sm font-medium">
                          Step {s.step} — {s.label}
                        </span>
                      </div>
                      <p className="mt-1 pl-6 text-xs text-muted-foreground">{s.detail}</p>
                    </div>
                    {i < result.steps.length - 1 && (
                      <ArrowDown className="mx-auto my-1 size-4 text-muted-foreground" />
                    )}
                  </li>
                ))}
              </ol>

              <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
                <span className="label-caps">Outcome</span>
                {result.failed ? (
                  <Badge variant="destructive">Escalated — no capacity anywhere</Badge>
                ) : (
                  <Badge variant="outline" className={result.overflow ? "border-warning/40 text-warning" : "border-success/40 text-success"}>
                    {result.overflow ? "Overflow storage" : "Assigned"} @ {result.locationCode}
                  </Badge>
                )}
              </div>

              {result.failed && (
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {["Create New Rack", "Create New Zone", "Transfer Inventory", "Expand Warehouse"].map((a) => (
                    <li key={a} className="rounded-md border border-border bg-muted/30 px-3 py-2 text-xs">{a}</li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
