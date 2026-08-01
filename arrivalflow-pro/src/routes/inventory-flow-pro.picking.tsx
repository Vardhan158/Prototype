import { createFileRoute } from "@tanstack/react-router";
import { ScanBarcode } from "lucide-react";
import { PICK_LISTS } from "@/apps/inventory-flow-pro/lib/wms/data";
import { Badge } from "@/components/ui/badge";
import { MiniBar, PageHeader, SectionCard, SeverityChip, StatTile, ToneChip } from "@/apps/inventory-flow-pro/components/wms/primitives";

export const Route = createFileRoute("/inventory-flow-pro/picking")({
  head: () => ({
    meta: [
      { title: "Picking Status | AXIOM WMS" },
      { name: "description", content: "Pick list progress by operator, route and zone with RF barcode scanning and exception handling." },
      { property: "og:title", content: "Picking Status | AXIOM WMS" },
      { property: "og:description", content: "Only RESERVED stock can be picked — enforced on every confirmation." },
    ],
  }),
  component: PickingScreen,
});

function PickingScreen() {
  const totalLines = PICK_LISTS.reduce((s, p) => s + p.totalLines, 0);
  const picked = PICK_LISTS.reduce((s, p) => s + p.pickedLines, 0);

  return (
    <>
      <PageHeader
        eyebrow="Screen 8 · Outbound execution"
        title="Picking Status"
        description="Live wave and pick list execution. Every confirmation validates that the stock is RESERVED and not blocked by a quality, damage or recall status."
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Open pick lists" value={PICK_LISTS.filter((p) => p.status !== "Completed").length} tone="primary" />
        <StatTile label="Lines picked" value={picked} unit={`/ ${totalLines}`} tone="success" />
        <StatTile label="Remaining lines" value={totalLines - picked} tone="warning" />
        <StatTile label="Exceptions" value={PICK_LISTS.filter((p) => p.status === "Exception").length} tone="danger" />
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {PICK_LISTS.map((p) => (
          <SectionCard key={p.id} title={`${p.id} · ${p.wave}`} subtitle={`${p.route} · ${p.zone}`}>
            <div className="flex flex-wrap items-center gap-2">
              <SeverityChip severity={p.priority} />
              <ToneChip tone={p.status === "Completed" ? "success" : p.status === "Exception" ? "danger" : p.status === "Queued" ? "slate" : "primary"}>
                {p.status}
              </ToneChip>
              <Badge variant="outline" className="gap-1.5 text-[11px]">
                <ScanBarcode className="size-3" /> {p.device}
              </Badge>
            </div>
            <div className="mt-3 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Operator {p.operator} · started {p.startedAt}</span>
                <span className="num font-medium">{p.pickedLines}/{p.totalLines} lines</span>
              </div>
              <MiniBar value={(p.pickedLines / p.totalLines) * 100} tone={p.status === "Exception" ? "danger" : "primary"} />
              <p className="text-[11px] text-muted-foreground">
                {p.totalLines - p.pickedLines} lines remaining · scan bin then serial to confirm each pick
              </p>
            </div>
          </SectionCard>
        ))}
      </div>
    </>
  );
}
