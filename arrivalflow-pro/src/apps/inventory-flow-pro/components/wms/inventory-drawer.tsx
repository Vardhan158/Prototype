import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, ExternalLink, MapPin, Repeat2, Boxes } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { InventoryItem } from "@/apps/inventory-flow-pro/lib/wms/data";
import { STATUS_META, TRANSITIONS } from "@/apps/inventory-flow-pro/lib/wms/statuses";
import {
  Barcode,
  InfoRow,
  LifecycleTimeline,
  QrBlock,
  StatusChip,
  inr,
  itemValue,
  locationPath,
} from "./primitives";
import { TransitionDialog } from "./transition-dialog";

export function InventoryDrawer({
  item,
  open,
  onOpenChange,
}: {
  item: InventoryItem | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [transitionOpen, setTransitionOpen] = useState(false);
  if (!item) return null;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-lg">
          <SheetHeader className="border-b border-border px-5 pb-4">
            <SheetTitle className="flex items-center gap-2 text-base">
              <Boxes className="size-4 text-primary" /> {item.id}
            </SheetTitle>
            <SheetDescription>
              {item.materialCode} · {item.materialName}
            </SheetDescription>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <StatusChip status={item.status} size="md" />
              <span className="text-xs text-muted-foreground">
                {item.quantity} {item.uom} · {inr(itemValue(item))}
              </span>
            </div>
          </SheetHeader>

          <ScrollArea className="h-[calc(100vh-13.5rem)]">
            <Tabs defaultValue="overview" className="px-5 py-4">
              <TabsList className="w-full">
                <TabsTrigger value="overview" className="flex-1">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="timeline" className="flex-1">
                  Timeline
                </TabsTrigger>
                <TabsTrigger value="labels" className="flex-1">
                  Labels
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-4 space-y-1">
                <InfoRow label="Serial number" value={item.serial} />
                <InfoRow label="Batch" value={item.batch} />
                <InfoRow
                  label="Storage location"
                  value={
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="size-3 text-primary" /> {locationPath(item)}
                    </span>
                  }
                />
                <InfoRow label="Warehouse" value={item.warehouse} />
                <InfoRow label="Owner" value={`${item.owner} · ${item.ownerRole}`} />
                <InfoRow label="Supplier" value={item.supplier} />
                <InfoRow label="Purchase order" value={item.po} />
                <InfoRow label="GRN" value={item.grn} />
                <InfoRow label="Storage condition" value={item.temperature} />
                <InfoRow label="Stock age" value={`${item.ageDays} days`} />
                <InfoRow
                  label="Last updated"
                  value={new Date(item.updatedAt).toLocaleString("en-GB")}
                />
                <div className="rounded-xl border border-border bg-muted/40 p-3 text-[11px] text-muted-foreground">
                  {STATUS_META[item.status].description}
                </div>
                <div className="pt-1">
                  <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Next allowed statuses
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {TRANSITIONS[item.status].map((s) => (
                      <StatusChip key={s} status={s} />
                    ))}
                    {TRANSITIONS[item.status].length === 0 && (
                      <span className="text-xs text-muted-foreground">Terminal status</span>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="timeline" className="mt-4">
                <LifecycleTimeline events={item.events} />
              </TabsContent>

              <TabsContent value="labels" className="mt-4 space-y-5">
                <div className="rounded-xl border border-border bg-card p-4">
                  <p className="mb-2 text-xs font-semibold">Handling unit barcode (GS1-128)</p>
                  <Barcode value={item.serial} />
                </div>
                <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
                  <QrBlock value={`${item.id}|${item.batch}|${item.serial}`} />
                  <div className="text-xs">
                    <p className="font-semibold">Traceability QR</p>
                    <p className="mt-1 text-muted-foreground">
                      Encodes record ID, batch and serial for RF and mobile scanning.
                    </p>
                    <p className="num mt-2 text-[11px] text-muted-foreground">
                      {item.id} | {item.batch}
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </ScrollArea>

          <div className="flex items-center gap-2 border-t border-border bg-card/60 p-4">
            <Button className="flex-1" onClick={() => setTransitionOpen(true)}>
              <Repeat2 className="size-4" /> Change status
            </Button>
            <Button variant="outline" asChild>
              <Link to="/inventory-flow-pro/inventory/$id" params={{ id: item.id }} onClick={() => onOpenChange(false)}>
                Full record <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link to="/inventory-flow-pro/movement-history">
                <ExternalLink className="size-4" />
              </Link>
            </Button>
          </div>
        </SheetContent>
      </Sheet>
      <TransitionDialog item={item} open={transitionOpen} onOpenChange={setTransitionOpen} />
    </>
  );
}
