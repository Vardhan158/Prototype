import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { GripVertical, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useWms } from "@/apps/inventory-flow-pro/lib/wms/store";
import { STATUS_META, statusTone, type InventoryStatus } from "@/apps/inventory-flow-pro/lib/wms/statuses";
import type { InventoryItem } from "@/apps/inventory-flow-pro/lib/wms/data";
import { PageHeader, StatusChip, inr, itemValue } from "@/apps/inventory-flow-pro/components/wms/primitives";
import { InventoryDrawer } from "@/apps/inventory-flow-pro/components/wms/inventory-drawer";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/inventory-flow-pro/status-board")({
  head: () => ({
    meta: [
      { title: "Inventory Status Board | AXIOM WMS" },
      {
        name: "description",
        content:
          "Kanban status board for warehouse inventory with drag-and-drop status transitions validated against lifecycle rules.",
      },
      { property: "og:title", content: "Inventory Status Board | AXIOM WMS" },
      {
        property: "og:description",
        content: "Move stock between lifecycle stages with rule-validated drag and drop.",
      },
    ],
  }),
  component: StatusBoardScreen,
});

const COLUMNS: InventoryStatus[] = [
  "RECEIVED",
  "UNDER_INSPECTION",
  "AVAILABLE",
  "RESERVED",
  "PICKED",
  "PACKED",
  "LOADED",
  "DISPATCHED",
  "DELIVERED",
  "REJECTED",
  "QUALITY_HOLD",
  "DAMAGED",
  "QUARANTINE",
  "RECALL",
];

function StatusBoardScreen() {
  const { items, transition, validate } = useWms();
  const [dragging, setDragging] = useState<InventoryItem | null>(null);
  const [hover, setHover] = useState<InventoryStatus | null>(null);
  const [active, setActive] = useState<InventoryItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const drop = (status: InventoryStatus) => {
    if (!dragging) return;
    transition(dragging.id, status, { reason: "Drag & drop on status board" });
    setDragging(null);
    setHover(null);
  };

  return (
    <>
      <PageHeader
        eyebrow="Screen 2 · Kanban control"
        title="Inventory Status Board"
        description="Drag a handling unit into another lifecycle column. Every drop is validated against the status rule matrix before it is posted."
        actions={
          <Badge variant="outline" className="gap-1.5 text-[11px]">
            <Info className="size-3" /> {items.length} cards in scope
          </Badge>
        }
      />

      <div className="flex gap-3 overflow-x-auto pb-4">
        {COLUMNS.map((status) => {
          const cards = items.filter((i) => i.status === status);
          const tone = statusTone(status);
          const valid = dragging ? validate(dragging.id, status).ok : true;
          const isHover = hover === status;
          return (
            <div
              key={status}
              onDragOver={(e) => {
                e.preventDefault();
                setHover(status);
              }}
              onDragLeave={() => setHover(null)}
              onDrop={() => drop(status)}
              className={cn(
                "flex w-[268px] shrink-0 flex-col rounded-2xl border bg-card/60 transition-all",
                isHover && dragging
                  ? valid
                    ? "border-success ring-2 ring-success/30"
                    : "border-destructive ring-2 ring-destructive/30"
                  : "border-border",
              )}
            >
              <div className="flex items-center justify-between gap-2 border-b border-border/70 px-3 py-2.5">
                <StatusChip status={status} size="md" />
                <span className="num text-xs font-semibold text-muted-foreground">
                  {cards.length}
                </span>
              </div>
              <div className={cn("h-0.5 w-full", tone.bar)} />
              <div className="flex-1 space-y-2 p-2.5">
                {cards.map((item) => (
                  <button
                    key={item.id}
                    draggable
                    onDragStart={() => setDragging(item)}
                    onDragEnd={() => setDragging(null)}
                    onClick={() => {
                      setActive(item);
                      setDrawerOpen(true);
                    }}
                    className="w-full cursor-grab rounded-xl border border-border bg-card p-2.5 text-left shadow-card transition-all hover:-translate-y-0.5 hover:border-primary/40 active:cursor-grabbing"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[11px] font-semibold">{item.materialCode}</p>
                      <GripVertical className="size-3.5 shrink-0 text-muted-foreground" />
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">
                      {item.materialName}
                    </p>
                    <div className="num mt-2 space-y-0.5 text-[10px] text-muted-foreground">
                      <p>{item.serial}</p>
                      <p>{item.batch}</p>
                      <p>
                        {item.warehouseCode} · {item.zone}/{item.rack}-{item.shelf}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[10px]">
                      <span className="font-medium">
                        {item.quantity} {item.uom} · {inr(itemValue(item))}
                      </span>
                      <Badge variant="outline" className="text-[9px]">
                        {item.ageDays}d
                      </Badge>
                    </div>
                  </button>
                ))}
                {cards.length === 0 && (
                  <p className="py-6 text-center text-[11px] text-muted-foreground">
                    No stock in {STATUS_META[status].label.toLowerCase()}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {dragging && (
        <div className="fixed bottom-5 left-1/2 z-40 -translate-x-1/2 rounded-full border border-border glass-panel px-4 py-2 text-xs">
          Dragging <span className="num font-semibold">{dragging.id}</span> from{" "}
          {STATUS_META[dragging.status].label} — drop on an allowed column
          <Button variant="ghost" size="sm" className="ml-2 h-6" onClick={() => setDragging(null)}>
            Cancel
          </Button>
        </div>
      )}

      <InventoryDrawer item={active} open={drawerOpen} onOpenChange={setDrawerOpen} />
    </>
  );
}
