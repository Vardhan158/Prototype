import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { PageHeader } from "@/apps/storage-guardian/components/warehouse/app-shell";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useWarehouse } from "@/apps/storage-guardian/lib/warehouse/store";
import { ZONES, zoneById } from "@/apps/storage-guardian/lib/warehouse/data";
import { statusTone, utilTone, zoneStats } from "@/apps/storage-guardian/lib/warehouse/stats";

export const Route = createFileRoute("/storage-guardian/locations")({
  head: () => ({
    meta: [
      { title: "Location Browser — NODE·WMS" },
      {
        name: "description",
        content:
          "Searchable directory of every zone, rack, shelf and bin location code with live capacity and status.",
      },
      { property: "og:title", content: "Location Browser — NODE·WMS" },
      {
        property: "og:description",
        content: "Search every warehouse location code with live capacity and status.",
      },
    ],
  }),
  component: LocationsPage,
});

function LocationsPage() {
  const { locations } = useWarehouse();
  const [q, setQ] = useState("");
  const [zone, setZone] = useState("all");
  const [status, setStatus] = useState("all");

  const zones = zoneStats(locations);
  const rows = useMemo(
    () =>
      locations.filter(
        (l) =>
          (zone === "all" || l.zone === zone) &&
          (status === "all" || l.status === status) &&
          l.code.toLowerCase().includes(q.trim().toLowerCase()),
      ),
    [locations, q, zone, status],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Location Browser"
        subtitle="Hierarchical Zone → Rack → Shelf/Bin codes, e.g. SERVER-R1-S1, SPARE-R1-S1-B1, POWER-G1."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {zones.slice(0, 8).map((z) => (
          <div key={z.zone} className="panel p-4">
            <p className="text-sm font-medium">{z.name}</p>
            <p className="mt-1 font-mono text-[11px] text-muted-foreground">
              {zoneById(z.zone).prefix}-* · {z.locations} locations
            </p>
            <Progress value={z.utilisation} className="mt-3 h-1.5" indicatorClassName={utilTone(z.utilisation)} />
            <p className="mt-1.5 text-xs text-muted-foreground">
              {z.used}/{z.capacity} slots · {z.utilisation}%
            </p>
          </div>
        ))}
      </div>

      <div className="panel overflow-hidden">
        <div className="flex flex-wrap gap-3 border-b border-border p-4">
          <div className="relative min-w-56 flex-1">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search location code…" className="pl-8 font-mono text-xs" />
          </div>
          <Select value={zone} onValueChange={setZone}>
            <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All zones</SelectItem>
              {ZONES.map((z) => <SelectItem key={z.id} value={z.id}>{z.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              {["all", "Available", "Full", "Maintenance", "Blocked"].map((s) => (
                <SelectItem key={s} value={s}>{s === "all" ? "All statuses" : s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="max-h-[600px] overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-surface">
              <TableRow>
                <TableHead>Location code</TableHead>
                <TableHead>Zone</TableHead>
                <TableHead>Rack</TableHead>
                <TableHead>Shelf / Bin</TableHead>
                <TableHead className="text-right">Capacity</TableHead>
                <TableHead className="text-right">Used</TableHead>
                <TableHead className="text-right">Available</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="font-mono text-xs">{l.code}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{zoneById(l.zone).name}</TableCell>
                  <TableCell className="font-mono text-xs">{l.rack}</TableCell>
                  <TableCell className="font-mono text-xs">{[l.shelf, l.bin].filter(Boolean).join(" / ") || "—"}</TableCell>
                  <TableCell className="text-right font-mono text-xs">{l.capacity}</TableCell>
                  <TableCell className="text-right font-mono text-xs">{l.used}</TableCell>
                  <TableCell className="text-right font-mono text-xs">{l.capacity - l.used}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusTone(l.status)}>{l.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-8 text-center text-sm text-muted-foreground">
                    No locations match the current filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
