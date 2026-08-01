import { createFileRoute } from "@tanstack/react-router";
import { Download, Target, Timer, TrendingUp, TrendingDown } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { DEFECTS, NCR_TREND, PASS_TREND, VENDOR_RATING } from "@/apps/quality-gatekeeper/lib/wms-data";
import { SectionCard, StatCard } from "@/apps/quality-gatekeeper/components/wms/bits";

export const Route = createFileRoute("/quality-gatekeeper/reports")({
  head: () => ({
    meta: [
      { title: "Quality Reports — AXIOM WMS Quality" },
      { name: "description", content: "Inspection performance, vendor quality rating, top defects, NCR trends, pass and fail rates and cycle time analytics." },
      { property: "og:title", content: "Quality Reports — AXIOM WMS Quality" },
      { property: "og:description", content: "Vendor ratings, defect Pareto, NCR trends and inspection performance analytics." },
    ],
  }),
  component: ReportsPage,
});

function ReportsPage() {
  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <div className="min-w-0">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Analytics</p>
          <h1 className="truncate text-2xl font-bold sm:text-3xl">Quality Reports</h1>
        </div>
        <Button variant="outline" className="shrink-0 rounded-xl" onClick={() => toast.success("Report exported", { description: "quality_report_Aug2026.xlsx · 284 KB" })}>
          <Download className="h-4 w-4" /> Export
        </Button>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Pass rate" value="92.1%" sub="Target ≥ 90%" icon={<TrendingUp className="h-5 w-5" />} tone="success" />
        <StatCard label="Fail rate" value="7.9%" sub="−1.2% vs last month" icon={<TrendingDown className="h-5 w-5" />} tone="danger" />
        <StatCard label="Avg inspection time" value="46 min" sub="Best: P. Nair 37 min" icon={<Timer className="h-5 w-5" />} tone="primary" />
        <StatCard label="Inspection accuracy" value="98.2%" sub="Audit re-check sample" icon={<Target className="h-5 w-5" />} tone="success" />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <SectionCard title="Inspection performance" description="Volume and outcome by day">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={PASS_TREND} margin={{ left: -18, right: 8, top: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
                <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
                <Tooltip cursor={{ fill: "var(--accent)" }} contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="inspections" name="Inspections" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="fail" name="Failures %" fill="var(--chart-4)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="NCR trend" description="Opened vs closed by month">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={NCR_TREND} margin={{ left: -18, right: 8, top: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
                <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="opened" name="Opened" stroke="var(--destructive)" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="closed" name="Closed" stroke="var(--success)" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <SectionCard title="Top defects — Pareto" description="Share of all recorded defects">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DEFECTS} layout="vertical" margin={{ left: 40, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
                <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} fontSize={11} width={110} stroke="var(--muted-foreground)" />
                <Tooltip cursor={{ fill: "var(--accent)" }} contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", fontSize: 12 }} />
                <Bar dataKey="value" name="Share %" radius={[0, 6, 6, 0]}>
                  {DEFECTS.map((_, i) => (
                    <Cell key={i} fill={i < 2 ? "var(--destructive)" : i < 4 ? "var(--warning)" : "var(--chart-1)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Vendor quality scorecard" description="Rating, open NCRs and OTIF">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Vendor</TableHead>
                  <TableHead className="text-right">Quality score</TableHead>
                  <TableHead className="text-right">NCRs (90d)</TableHead>
                  <TableHead className="text-right">OTIF %</TableHead>
                  <TableHead>Grade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {VENDOR_RATING.map((v) => (
                  <TableRow key={v.vendor}>
                    <TableCell className="text-xs font-medium">{v.vendor}</TableCell>
                    <TableCell className="num text-right text-xs font-semibold">{v.rating}</TableCell>
                    <TableCell className="num text-right text-xs">{v.ncr}</TableCell>
                    <TableCell className="num text-right text-xs">{v.otif}</TableCell>
                    <TableCell className="text-xs font-bold">
                      <span className={v.rating >= 90 ? "text-success" : v.rating >= 75 ? "text-warning-foreground" : "text-destructive"}>
                        {v.rating >= 90 ? "A — Approved" : v.rating >= 75 ? "B — Watchlist" : "C — Escalated"}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Rejected materials — month to date" description="Value impact by material">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Material</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead className="text-right">Rejected qty</TableHead>
                <TableHead className="text-right">Value</TableHead>
                <TableHead>Primary defect</TableHead>
                <TableHead>Disposition</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { m: "MAT-30110 Hex Bolt M12x60 8.8", v: "Guangdong Fasteners", q: "6,000 EA", val: "₹ 8,42,000", d: "Surface finish", disp: "Return to supplier" },
                { m: "MAT-10220 CR Steel Coil 1.2mm", v: "Tata Steel Processing", q: "4 COIL", val: "₹ 3,10,500", d: "Transit damage", disp: "Pending approval" },
                { m: "MAT-22110 Cu Cable 4C x 6sqmm", v: "Wenzhou Cable Industries", q: "1,200 M", val: "₹ 1,96,400", d: "Dimensional", disp: "Dispatched" },
                { m: "MAT-44088 Seal Kit NBR 70", v: "Bosch Rexroth", q: "648 EA", val: "₹ 74,300", d: "Material property", disp: "Rework at supplier" },
              ].map((r) => (
                <TableRow key={r.m}>
                  <TableCell className="text-xs">{r.m}</TableCell>
                  <TableCell className="text-xs">{r.v}</TableCell>
                  <TableCell className="num text-right text-xs font-semibold">{r.q}</TableCell>
                  <TableCell className="num text-right text-xs">{r.val}</TableCell>
                  <TableCell className="text-xs">{r.d}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{r.disp}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </SectionCard>
    </div>
  );
}
