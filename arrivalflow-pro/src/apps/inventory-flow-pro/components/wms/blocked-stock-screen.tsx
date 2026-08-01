import { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Search, ShieldCheck, Undo2, Trash2, Wrench, Camera, FileText } from "lucide-react";
import type { InventoryStatus } from "@/apps/inventory-flow-pro/lib/wms/statuses";
import { useWms } from "@/apps/inventory-flow-pro/lib/wms/store";
import { damageMeta, holdMeta, quarantineMeta, recallMeta } from "@/apps/inventory-flow-pro/lib/wms/derive";
import {
  EmptyState,
  PageHeader,
  SectionCard,
  SeverityChip,
  StatTile,
  StatusChip,
  TableSkeleton,
  ToneChip,
  inr,
  itemValue,
  locationPath,
  useSimulatedLoad,
} from "./primitives";
import { TransitionDialog } from "./transition-dialog";
import { InventoryDrawer } from "./inventory-drawer";
import type { InventoryItem } from "@/apps/inventory-flow-pro/lib/wms/data";

type Variant = "QUALITY_HOLD" | "DAMAGED" | "QUARANTINE" | "RECALL";

const CONFIG: Record<
  Variant,
  {
    eyebrow: string;
    title: string;
    description: string;
    columns: string[];
    actions: { label: string; to: InventoryStatus; icon: React.ComponentType<{ className?: string }> }[];
  }
> = {
  QUALITY_HOLD: {
    eyebrow: "Screen 11 · Exception control",
    title: "Quality Hold",
    description:
      "Blocked stock awaiting QA disposition. Held inventory is non-allocatable and cannot be picked or issued until released.",
    columns: ["NCR / Inspection lot", "Hold reason", "Inspector", "Days held"],
    actions: [
      { label: "Release to available", to: "AVAILABLE", icon: CheckCircle2 },
      { label: "Return to supplier", to: "RETURNED", icon: Undo2 },
      { label: "Send to repair", to: "REPAIR", icon: Wrench },
    ],
  },
  DAMAGED: {
    eyebrow: "Screen 12 · Exception control",
    title: "Damaged Inventory",
    description:
      "Damage register with severity assessment, photographic evidence and insurance claim tracking. Damaged stock cannot be picked.",
    columns: ["Claim", "Damage reason", "Severity", "Evidence"],
    actions: [
      { label: "Send to repair", to: "REPAIR", icon: Wrench },
      { label: "Scrap", to: "SCRAPPED", icon: Trash2 },
      { label: "Return to supplier", to: "RETURNED", icon: Undo2 },
    ],
  },
  QUARANTINE: {
    eyebrow: "Screen 13 · Exception control",
    title: "Quarantine Inventory",
    description:
      "Isolated stock physically segregated in quarantine cages. No movement is permitted until a release approval is signed.",
    columns: ["Isolation area", "Quarantine reason", "Release approver", "Days isolated"],
    actions: [
      { label: "Approve release", to: "AVAILABLE", icon: ShieldCheck },
      { label: "Scrap", to: "SCRAPPED", icon: Trash2 },
      { label: "Return to supplier", to: "RETURNED", icon: Undo2 },
    ],
  },
  RECALL: {
    eyebrow: "Screen 14 · Exception control",
    title: "Recall Inventory",
    description:
      "Supplier and regulatory recalls. Affected batches and serials are automatically hard-blocked across every warehouse.",
    columns: ["Recall notice", "Recall reason", "Scope", "Action due"],
    actions: [
      { label: "Return to supplier", to: "RETURNED", icon: Undo2 },
      { label: "Scrap", to: "SCRAPPED", icon: Trash2 },
      { label: "Move to quarantine", to: "QUARANTINE", icon: ShieldCheck },
    ],
  },
};

function extraCells(variant: Variant, item: InventoryItem) {
  if (variant === "QUALITY_HOLD") {
    const m = holdMeta(item);
    return [
      <span key="a" className="num text-xs">
        {m.ncr}
        <span className="block text-[11px] text-muted-foreground">{m.lot}</span>
      </span>,
      <span key="b" className="text-xs">
        {m.reason}
      </span>,
      <span key="c" className="text-xs">
        {m.inspector}
      </span>,
      <ToneChip key="d" tone={m.daysHeld > 14 ? "danger" : "warning"}>
        {m.daysHeld} days
      </ToneChip>,
    ];
  }
  if (variant === "DAMAGED") {
    const m = damageMeta(item);
    return [
      <span key="a" className="num text-xs">
        {m.claim}
        <span className="block text-[11px] text-muted-foreground">{inr(m.lossValue)} exposure</span>
      </span>,
      <span key="b" className="text-xs">
        {m.reason}
      </span>,
      <SeverityChip key="c" severity={m.severity} />,
      <span key="d" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        <Camera className="size-3.5" /> {m.photos} photos
        <FileText className="ml-1 size-3.5" /> report
      </span>,
    ];
  }
  if (variant === "QUARANTINE") {
    const m = quarantineMeta(item);
    return [
      <Badge key="a" variant="outline" className="num text-[11px]">
        {m.area}
      </Badge>,
      <span key="b" className="text-xs">
        {m.reason}
      </span>,
      <span key="c" className="text-xs">
        {m.approver}
      </span>,
      <ToneChip key="d" tone={m.daysIsolated > 10 ? "danger" : "warning"}>
        {m.daysIsolated} days
      </ToneChip>,
    ];
  }
  const m = recallMeta(item);
  return [
    <span key="a" className="num text-xs">
      {m.notice}
    </span>,
    <span key="b" className="text-xs">
      {m.reason}
    </span>,
    <Badge key="c" variant="outline" className="text-[11px]">
      {m.scope}
    </Badge>,
    <ToneChip key="d" tone={m.dueDays < 5 ? "danger" : "warning"}>
      in {m.dueDays} days
    </ToneChip>,
  ];
}

export function BlockedStockScreen({ variant }: { variant: Variant }) {
  const cfg = CONFIG[variant];
  const { items } = useWms();
  const loading = useSimulatedLoad();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<InventoryItem | null>(null);
  const [preset, setPreset] = useState<InventoryStatus | undefined>(undefined);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const rows = useMemo(() => {
    const base = items.filter((i) => i.status === variant);
    if (!query.trim()) return base;
    const q = query.toLowerCase();
    return base.filter((i) =>
      [i.id, i.materialCode, i.materialName, i.serial, i.batch, i.warehouseCode].some((v) =>
        v.toLowerCase().includes(q),
      ),
    );
  }, [items, variant, query]);

  const blockedValue = rows.reduce((sum, i) => sum + itemValue(i), 0);
  const affectedBatches = new Set(rows.map((i) => i.batch)).size;
  const sites = new Set(rows.map((i) => i.warehouseCode)).size;

  const openAction = (item: InventoryItem, to: InventoryStatus) => {
    setActive(item);
    setPreset(to);
    setDialogOpen(true);
  };

  const PrimaryIcon = cfg.actions[0]!.icon;

  return (

    <>
      <PageHeader
        eyebrow={cfg.eyebrow}
        title={cfg.title}
        description={cfg.description}
        actions={
          <>
            <Button variant="outline" size="sm">
              <FileText className="size-4" /> Export register
            </Button>
            <Button size="sm" onClick={() => rows[0] && openAction(rows[0], cfg.actions[0]!.to)}>
              <PrimaryIcon className="size-4" /> {cfg.actions[0]!.label}
            </Button>

          </>
        }
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Blocked line items" value={rows.length} tone="danger" />
        <StatTile label="Blocked value" value={inr(blockedValue)} tone="warning" />
        <StatTile label="Affected batches" value={affectedBatches} tone="info" />
        <StatTile label="Warehouses impacted" value={sites} tone="teal" />
      </div>

      <SectionCard
        title={`${cfg.title} register`}
        subtitle={`${rows.length} records · movement rules enforced by the lifecycle engine`}
        padded={false}
        actions={
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search material, serial, batch…"
              className="h-8 w-56 pl-8 text-xs"
            />
          </div>
        }
      >
        {loading ? (
          <TableSkeleton rows={5} cols={7} />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title={`No stock in ${cfg.title.toLowerCase()}`}
            description="Nothing is currently blocked under this exception category for the selected warehouse scope."
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[210px]">Material</TableHead>
                  <TableHead>Serial / Batch</TableHead>
                  <TableHead>Location</TableHead>
                  {cfg.columns.map((c) => (
                    <TableHead key={c}>{c}</TableHead>
                  ))}
                  <TableHead className="text-right">Disposition</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((item) => (
                  <TableRow
                    key={item.id}
                    className="cursor-pointer"
                    onClick={() => {
                      setActive(item);
                      setDrawerOpen(true);
                    }}
                  >
                    <TableCell>
                      <p className="text-xs font-semibold">{item.materialCode}</p>
                      <p className="max-w-[220px] truncate text-[11px] text-muted-foreground">
                        {item.materialName}
                      </p>
                      <div className="mt-1">
                        <StatusChip status={item.status} />
                      </div>
                    </TableCell>
                    <TableCell className="num text-xs">
                      {item.serial}
                      <span className="block text-[11px] text-muted-foreground">{item.batch}</span>
                    </TableCell>
                    <TableCell className="num text-[11px] text-muted-foreground">
                      {locationPath(item)}
                      <span className="mt-0.5 block text-xs font-medium text-foreground">
                        {item.quantity} {item.uom}
                      </span>
                    </TableCell>
                    {extraCells(variant, item).map((cell, i) => (
                      <TableCell key={i}>{cell}</TableCell>
                    ))}
                    <TableCell className="text-right">
                      <div className="flex flex-wrap justify-end gap-1.5">
                        {cfg.actions.map((a) => (
                          <Button
                            key={a.to}
                            size="sm"
                            variant={a.to === "AVAILABLE" ? "default" : "outline"}
                            className="h-7 px-2 text-[11px]"
                            onClick={(e) => {
                              e.stopPropagation();
                              openAction(item, a.to);
                            }}
                          >
                            <a.icon className="size-3" /> {a.label}
                          </Button>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </SectionCard>

      <TransitionDialog
        item={active}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        {...(preset ? { presetNext: preset } : {})}
      />
      <InventoryDrawer item={active} open={drawerOpen} onOpenChange={setDrawerOpen} />
    </>
  );
}
