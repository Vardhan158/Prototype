import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useWms } from "@/apps/inventory-flow-pro/lib/wms/store";
import { LifecycleTimeline, PageHeader, SectionCard, StatusChip, inr, itemValue, locationPath } from "@/apps/inventory-flow-pro/components/wms/primitives";

export const Route = createFileRoute("/inventory-flow-pro/timeline")({
  head: () => ({
    meta: [
      { title: "Inventory Timeline | AXIOM WMS" },
      { name: "description", content: "Visual lifecycle timeline for any inventory record with user, date, time, location and remarks per event." },
      { property: "og:title", content: "Inventory Timeline | AXIOM WMS" },
      { property: "og:description", content: "Received through delivered, event by event." },
    ],
  }),
  component: TimelineScreen,
});

function TimelineScreen() {
  const { items } = useWms();
  const [id, setId] = useState(items[0]?.id ?? "");
  const item = items.find((i) => i.id === id) ?? items[0];

  return (
    <>
      <PageHeader
        eyebrow="Screen 5 · Traceability"
        title="Inventory Timeline"
        description="Complete event history for a single handling unit. Every transition records the actor, timestamp, storage location and remarks."
        actions={
          <Select value={item?.id ?? ""} onValueChange={setId}>
            <SelectTrigger className="h-9 w-[300px]">
              <SelectValue placeholder="Select inventory record" />
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
          <SectionCard className="lg:col-span-2" title="Lifecycle events" subtitle={`${item.events.length} events recorded`}>
            <LifecycleTimeline events={item.events} />
          </SectionCard>
          <SectionCard title="Record summary" subtitle={item.materialName}>
            <div className="space-y-2 text-xs">
              <StatusChip status={item.status} size="md" />
              <p className="num text-muted-foreground">{item.id}</p>
              <p>{item.quantity} {item.uom} · {inr(itemValue(item))}</p>
              <p className="num text-muted-foreground">{locationPath(item)}</p>
              <p className="text-muted-foreground">Serial {item.serial} · Batch {item.batch}</p>
              <p className="text-muted-foreground">Supplier {item.supplier}</p>
              <p className="text-muted-foreground">{item.po} · {item.grn}</p>
            </div>
          </SectionCard>
        </div>
      )}
    </>
  );
}
