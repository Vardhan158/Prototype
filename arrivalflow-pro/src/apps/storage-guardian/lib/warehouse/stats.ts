import { ZONES, zoneById } from "./data";
import type { Item, StorageLocation, ZoneId } from "./types";

export interface ZoneStat {
  zone: ZoneId;
  name: string;
  capacity: number;
  used: number;
  available: number;
  utilisation: number;
  locations: number;
  full: number;
}

export function zoneStats(locations: StorageLocation[]): ZoneStat[] {
  return ZONES.map((z) => {
    const rows = locations.filter((l) => l.zone === z.id);
    const capacity = rows.reduce((s, l) => s + l.capacity, 0);
    const used = rows.reduce((s, l) => s + l.used, 0);
    return {
      zone: z.id,
      name: z.name,
      capacity,
      used,
      available: capacity - used,
      utilisation: capacity ? Math.round((used / capacity) * 100) : 0,
      locations: rows.length,
      full: rows.filter((l) => l.status === "Full").length,
    };
  });
}

export function rackStats(locations: StorageLocation[]) {
  const map = new Map<string, { key: string; zone: ZoneId; rack: string; capacity: number; used: number; blocked: number }>();
  for (const l of locations) {
    const key = `${l.zone}-${l.rack}`;
    const entry = map.get(key) ?? { key, zone: l.zone, rack: l.rack, capacity: 0, used: 0, blocked: 0 };
    entry.capacity += l.capacity;
    entry.used += l.used;
    if (l.status === "Blocked" || l.status === "Maintenance") entry.blocked += 1;
    map.set(key, entry);
  }
  return [...map.values()].map((r) => ({
    ...r,
    zoneName: zoneById(r.zone).name,
    available: r.capacity - r.used,
    utilisation: r.capacity ? Math.round((r.used / r.capacity) * 100) : 0,
    status: r.capacity - r.used === 0 ? "Full" : r.blocked ? "Maintenance" : "Available",
  }));
}

export const statusTone = (status: string) =>
  status === "Full"
    ? "text-destructive"
    : status === "Maintenance" || status === "Blocked"
      ? "text-warning"
      : "text-success";

export const utilTone = (u: number) =>
  u >= 95 ? "bg-destructive" : u >= 80 ? "bg-warning" : "bg-primary";

export const itemStatusTone = (s: Item["status"]) =>
  s === "Stored"
    ? "border-success/40 bg-success/10 text-success"
    : s === "Overflow"
      ? "border-warning/40 bg-warning/10 text-warning"
      : s === "Quarantine" || s === "Rejected"
        ? "border-destructive/40 bg-destructive/10 text-destructive"
        : "border-primary/40 bg-primary/10 text-primary";
