import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AlertTriangle, Boxes, PackageCheck, Percent, Truck } from "lucide-react";
import { PageHeader } from "@/apps/storage-guardian/components/warehouse/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useWarehouse } from "@/apps/storage-guardian/lib/warehouse/store";
import { rackStats, statusTone, utilTone, zoneStats } from "@/apps/storage-guardian/lib/warehouse/stats";
import { STAGES, stageIndex } from "@/apps/storage-guardian/lib/warehouse/rules";

export const Route = createFileRoute("/storage-guardian/")({
  head: () => ({
    meta: [
      { title: "Capacity Dashboard — NODE·WMS" },
      {
        name: "description",
        content:
          "Live zone, rack and bin capacity for the data center equipment warehouse with utilisation charts and exception alerts.",
      },
      { property: "og:title", content: "Capacity Dashboard — NODE·WMS" },
      {
        property: "og:description",
        content: "Live zone, rack and bin capacity for a data center equipment warehouse.",
      },
    ],
  }),
  component: Dashboard,
});

function Kpi({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Boxes;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="panel p-4">
      <div className="flex items-center gap-2">
        <Icon className="size-4 text-primary" />
        <span className="label-caps">{label}</span>
      </div>
      <p className="mt-2 font-display text-3xl font-bold">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

function Dashboard() {
  const { locations, items, alerts, tasks } = useWarehouse();
  const zones = zoneStats(locations);
  const racks = rackStats(locations);

  const capacity = zones.reduce((s, z) => s + z.capacity, 0);
  const used = zones.reduce((s, z) => s + z.used, 0);
  const util = Math.round((used / capacity) * 100);
  const openAlerts = alerts.filter((a) => !a.resolved);
  const inPipeline = items.filter((i) => i.stage !== "completed");

  const chartData = zones
    .filter((z) => z.capacity > 0)
    .map((z) => ({ name: z.name.replace(/ Zone.*/, ""), utilisation: z.utilisation }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Capacity Control Room"
        subtitle="Real-time storage utilisation across every zone, rack, shelf and bin in DC-EU-WEST-01."
        action={
          <Button asChild>
            <Link to="/storage-guardian/receiving">
              <Truck className="size-4" /> New receiving
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi icon={Boxes} label="Total slots" value={capacity.toLocaleString()} hint={`${locations.length} location codes`} />
        <Kpi icon={Percent} label="Utilisation" value={`${util}%`} hint={`${(capacity - used).toLocaleString()} slots available`} />
        <Kpi icon={PackageCheck} label="Open put-away" value={String(tasks.filter((t) => t.status !== "Done").length)} hint={`${inPipeline.length} items in pipeline`} />
        <Kpi icon={AlertTriangle} label="Open exceptions" value={String(openAlerts.length)} hint="Requires manager review" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <section className="panel p-5">
          <h2 className="text-lg font-semibold">Zone utilisation</h2>
          <p className="mb-4 text-xs text-muted-foreground">Percentage of slots consumed per storage zone.</p>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ left: -20, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} interval={0} angle={-25} textAnchor="end" height={70} />
                <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} unit="%" />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  cursor={{ fill: "var(--muted)", opacity: 0.3 }}
                />
                <Bar dataKey="utilisation" radius={[4, 4, 0, 0]}>
                  {chartData.map((d) => (
                    <Cell
                      key={d.name}
                      fill={d.utilisation >= 95 ? "var(--destructive)" : d.utilisation >= 80 ? "var(--warning)" : "var(--primary)"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="panel p-5">
          <h2 className="text-lg font-semibold">Pipeline stages</h2>
          <p className="mb-4 text-xs text-muted-foreground">Items currently sitting at each of the 11 workflow stages.</p>
          <ol className="space-y-1.5">
            {STAGES.map((stage, idx) => {
              const count = items.filter((i) => stageIndex(i.stage) === idx).length;
              return (
                <li key={stage.id} className="flex items-center gap-3 rounded-md px-2 py-1.5 text-sm odd:bg-muted/40">
                  <span className="w-5 font-mono text-xs text-muted-foreground">{idx + 1}</span>
                  <span className="flex-1">{stage.label}</span>
                  <Badge variant={count ? "default" : "secondary"}>{count}</Badge>
                </li>
              );
            })}
          </ol>
        </section>
      </div>

      <section className="panel overflow-hidden">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border p-5">
          <div>
            <h2 className="text-lg font-semibold">Capacity by rack</h2>
            <p className="text-xs text-muted-foreground">Location | Capacity | Used | Available | Status</p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/storage-guardian/locations">Open location browser</Link>
          </Button>
        </div>
        <div className="max-h-[520px] overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-surface">
              <TableRow>
                <TableHead>Location</TableHead>
                <TableHead>Zone</TableHead>
                <TableHead className="text-right">Capacity</TableHead>
                <TableHead className="text-right">Used</TableHead>
                <TableHead className="text-right">Available</TableHead>
                <TableHead className="w-40">Utilisation</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {racks.map((r) => (
                <TableRow key={r.key}>
                  <TableCell className="font-mono text-xs">{r.key.replace(/^([A-Z]+)-/, "$1-")}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{r.zoneName}</TableCell>
                  <TableCell className="text-right font-mono text-xs">{r.capacity}</TableCell>
                  <TableCell className="text-right font-mono text-xs">{r.used}</TableCell>
                  <TableCell className="text-right font-mono text-xs">{r.available}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={r.utilisation} className="h-1.5" indicatorClassName={utilTone(r.utilisation)} />
                      <span className="w-9 text-right font-mono text-[11px] text-muted-foreground">{r.utilisation}%</span>
                    </div>
                  </TableCell>
                  <TableCell className={`text-sm font-medium ${statusTone(r.status)}`}>{r.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}
