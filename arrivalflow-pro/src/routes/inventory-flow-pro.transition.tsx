import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useWms } from "@/apps/inventory-flow-pro/lib/wms/store";
import { STATUS_RULES, TRANSITIONS } from "@/apps/inventory-flow-pro/lib/wms/statuses";
import { PageHeader, SectionCard, StatusChip, LifecycleTimeline } from "@/apps/inventory-flow-pro/components/wms/primitives";
import { TransitionDialog } from "@/apps/inventory-flow-pro/components/wms/transition-dialog";

export const Route = createFileRoute("/inventory-flow-pro/transition")({
  head: () => ({
    meta: [
      { title: "Status Transition | AXIOM WMS" },
      { name: "description", content: "Post validated inventory status transitions with reason codes, approval control and digital signature." },
      { property: "og:title", content: "Status Transition | AXIOM WMS" },
      { property: "og:description", content: "Rule-validated status changes with e-signature." },
    ],
  }),
  component: TransitionScreen,
});

function TransitionScreen() {
  const { items } = useWms();
  const [id, setId] = useState(items[0]?.id ?? "");
  const [open, setOpen] = useState(false);
  const item = items.find((i) => i.id === id) ?? items[0] ?? null;

  return (
    <>
      <PageHeader
        eyebrow="Screen 6 · Lifecycle control"
        title="Status Transition"
        description="Select a record, review the allowed next statuses from the rule matrix, capture a reason code and approve with a digital signature."
        actions={
          <Select value={item?.id ?? ""} onValueChange={setId}>
            <SelectTrigger className="h-9 w-[300px]">
              <SelectValue placeholder="Select record" />
            </SelectTrigger>
            <SelectContent>
              {items.slice(0, 40).map((i) => (
                <SelectItem key={i.id} value={i.id}>
                  {i.id} · {i.materialCode}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      {item && (
        <div className="grid gap-4 lg:grid-cols-3">
          <SectionCard className="lg:col-span-2" title="Transition workbench" subtitle={`${item.materialCode} — ${item.materialName}`}>
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <p className="text-[11px] uppercase text-muted-foreground">Current status</p>
                <StatusChip status={item.status} size="md" />
              </div>
              <span className="text-muted-foreground">→</span>
              <div className="flex flex-wrap gap-1.5">
                {TRANSITIONS[item.status].map((s) => (
                  <StatusChip key={s} status={s} />
                ))}
                {TRANSITIONS[item.status].length === 0 && (
                  <span className="text-xs text-muted-foreground">Terminal status</span>
                )}
              </div>
            </div>
            <Button className="mt-4" onClick={() => setOpen(true)}>
              Open transition dialog
            </Button>
            <div className="mt-5">
              <p className="mb-2 text-xs font-semibold">Recent events on this record</p>
              <LifecycleTimeline events={item.events.slice(-4)} compact />
            </div>
          </SectionCard>

          <SectionCard title="Validation rules applied" subtitle="Enforced by the lifecycle engine">
            <ul className="space-y-2 text-xs">
              {STATUS_RULES.map((r) => (
                <li key={r.rule} className="rounded-lg border border-border bg-muted/40 px-3 py-2">
                  <p className="font-medium">{r.rule}</p>
                  <p className="num text-[11px] text-muted-foreground">{r.enforced}</p>
                </li>
              ))}
            </ul>
          </SectionCard>
        </div>
      )}

      <TransitionDialog item={item} open={open} onOpenChange={setOpen} />
    </>
  );
}
