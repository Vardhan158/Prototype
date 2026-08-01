import { Link } from "@tanstack/react-router";
import { Building2, Clock, Package, Truck } from "lucide-react";
import { StatusChip } from "./StatusChip";
import type { GateEntry } from "@/apps/gatepass-pro/lib/wms/types";

export function EntryCard({ entry }: { entry: GateEntry }) {
  return (
    <Link
      to="/gatepass-pro/entry/$id"
      params={{ id: entry.id }}
      className="card-elevated block p-4 transition-transform active:scale-[0.985]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-base font-semibold tracking-tight">
            <Truck className="size-4 text-primary" />
            {entry.vehicle.number}
          </p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{entry.gateNo}</p>
        </div>
        <StatusChip status={entry.status} />
      </div>
      <div className="mt-3 grid gap-1.5 text-xs text-muted-foreground">
        <span className="flex items-center gap-2 truncate">
          <Building2 className="size-3.5" /> {entry.delivery.vendor}
        </span>
        <span className="flex items-center gap-2 truncate">
          <Package className="size-3.5" /> PO {entry.delivery.po} · {entry.delivery.dock}
        </span>
        <span className="flex items-center gap-2">
          <Clock className="size-3.5" /> Arrived {entry.arrival}
          {entry.exitTime ? ` · Exited ${entry.exitTime}` : ""}
        </span>
      </div>
    </Link>
  );
}