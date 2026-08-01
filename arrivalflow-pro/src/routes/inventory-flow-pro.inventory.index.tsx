import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Download, Filter, Repeat2, Search, SlidersHorizontal } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useWms } from "@/apps/inventory-flow-pro/lib/wms/store";
import { ALL_STATUSES, STATUS_META } from "@/apps/inventory-flow-pro/lib/wms/statuses";
import { WAREHOUSES, type InventoryItem } from "@/apps/inventory-flow-pro/lib/wms/data";
import {
  EmptyState,
  PageHeader,
  SectionCard,
  StatusChip,
  TableSkeleton,
  inr,
  itemValue,
  useSimulatedLoad,
} from "@/apps/inventory-flow-pro/components/wms/primitives";
import { InventoryDrawer } from "@/apps/inventory-flow-pro/components/wms/inventory-drawer";
import { TransitionDialog } from "@/apps/inventory-flow-pro/components/wms/transition-dialog";

export const Route = createFileRoute("/inventory-flow-pro/inventory/")({
  head: () => ({
    meta: [
      { title: "Inventory List | AXIOM WMS" },
      {
        name: "description",
        content:
          "Enterprise inventory data table with material, serial, batch, warehouse hierarchy, status and owner filters.",
      },
      { property: "og:title", content: "Inventory List | AXIOM WMS" },
      { property: "og:description", content: "Filter and act on every tracked inventory line item." },
    ],
  }),
  component: InventoryListScreen,
});

function InventoryListScreen() {
  const { items } = useWms();
  const loading = useSimulatedLoad();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("ALL");
  const [wh, setWh] = useState("ALL");
  const [zone, setZone] = useState("ALL");
  const [active, setActive] = useState<InventoryItem | null>(null);
  const [drawer, setDrawer] = useState(false);
  const [dialog, setDialog] = useState(false);

  const zones = useMemo(() => Array.from(new Set(items.map((i) => i.zone))).sort(), [items]);

  const rows = useMemo(
    () =>
      items.filter((i) => {
        if (status !== "ALL" && i.status !== status) return false;
        if (wh !== "ALL" && i.warehouseCode !== wh) return false;
        if (zone !== "ALL" && i.zone !== zone) return false;
        if (!q.trim()) return true;
        const s = q.toLowerCase();
        return [i.id, i.materialCode, i.materialName, i.serial, i.batch, i.owner, i.grn, i.po].some(
          (v) => v.toLowerCase().includes(s),
        );
      }),
    [items, status, wh, zone, q],
  );

  return (
    <>
      <PageHeader
        eyebrow="Screen 3 · Master data table"
        title="Inventory List"
        description="Every tracked line item with full warehouse hierarchy, ownership and lifecycle status. Click a row for the side panel, or open the full record."
        actions={
          <>
            <Button variant="outline" size="sm">
              <SlidersHorizontal className="size-4" /> Manage columns
            </Button>
            <Button variant="outline" size="sm">
              <Download className="size-4" /> Export XLSX
            </Button>
          </>
        }
      />

      <SectionCard
        title={`${rows.length} of ${items.length} line items`}
        subtitle="Filters apply to the current warehouse scope"
        padded={false}
        actions={
          <Badge variant="outline" className="gap-1.5 text-[11px]">
            <Filter className="size-3" /> {[status, wh, zone].filter((v) => v !== "ALL").length} active filters
          </Badge>
        }
      >
        <div className="flex flex-wrap items-center gap-2 border-b border-border/70 p-3">
          <div className="relative min-w-[240px] flex-1">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search material, serial, batch, GRN, PO, owner…"
              className="h-9 pl-8"
            />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="h-9 w-[190px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              {ALL_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUS_META[s].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={wh} onValueChange={setWh}>
            <SelectTrigger className="h-9 w-[180px]">
              <SelectValue placeholder="Warehouse" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All warehouses</SelectItem>
              {WAREHOUSES.map((w) => (
                <SelectItem key={w.code} value={w.code}>
                  {w.code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={zone} onValueChange={setZone}>
            <SelectTrigger className="h-9 w-[150px]">
              <SelectValue placeholder="Zone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All zones</SelectItem>
              {zones.map((z) => (
                <SelectItem key={z} value={z}>
                  {z}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <TableSkeleton rows={8} cols={8} />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No inventory matches these filters"
            description="Adjust the search term, status or warehouse scope to widen the result set."
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setQ("");
                  setStatus("ALL");
                  setWh("ALL");
                  setZone("ALL");
                }}
              >
                Reset filters
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Material</TableHead>
                  <TableHead>Serial / Batch</TableHead>
                  <TableHead>Warehouse hierarchy</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((i) => (
                  <TableRow
                    key={i.id}
                    className="cursor-pointer"
                    onClick={() => {
                      setActive(i);
                      setDrawer(true);
                    }}
                  >
                    <TableCell>
                      <p className="text-xs font-semibold">{i.materialCode}</p>
                      <p className="max-w-[230px] truncate text-[11px] text-muted-foreground">
                        {i.materialName}
                      </p>
                    </TableCell>
                    <TableCell className="num text-[11px]">
                      {i.serial}
                      <span className="block text-muted-foreground">{i.batch}</span>
                    </TableCell>
                    <TableCell className="num text-[11px] text-muted-foreground">
                      {i.warehouseCode} · {i.zone}
                      <span className="block">
                        {i.rack} / {i.shelf} / {i.bin}
                      </span>
                    </TableCell>
                    <TableCell>
                      <StatusChip status={i.status} />
                    </TableCell>
                    <TableCell className="num text-right text-xs font-medium">
                      {i.quantity} {i.uom}
                    </TableCell>
                    <TableCell className="num text-right text-xs">{inr(itemValue(i))}</TableCell>
                    <TableCell className="text-[11px]">
                      {i.owner}
                      <span className="block text-muted-foreground">{i.ownerRole}</span>
                    </TableCell>
                    <TableCell className="num text-[11px] text-muted-foreground">
                      {new Date(i.updatedAt).toLocaleDateString("en-GB")}
                      <span className="block">
                        {new Date(i.updatedAt).toLocaleTimeString("en-GB", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 px-2 text-[11px]"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActive(i);
                            setDialog(true);
                          }}
                        >
                          <Repeat2 className="size-3" /> Status
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 px-2 text-[11px]" asChild>
                          <Link
                            to="/inventory-flow-pro/inventory/$id"
                            params={{ id: i.id }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            Open
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </SectionCard>

      <InventoryDrawer item={active} open={drawer} onOpenChange={setDrawer} />
      <TransitionDialog item={active} open={dialog} onOpenChange={setDialog} />
    </>
  );
}
