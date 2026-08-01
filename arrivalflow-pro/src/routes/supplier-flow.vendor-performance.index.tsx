import { createFileRoute, Link } from "@tanstack/react-router";
import { Gauge, Star, Timer, TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHeader, SectionCard } from "@/apps/supplier-flow/components/page-parts";
import { StatCard } from "@/apps/supplier-flow/components/stat-card";
import { StatusBadge } from "@/apps/supplier-flow/components/status-badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { analytics, compactMoney, deliveryPerformance, suppliers } from "@/apps/supplier-flow/data/procurement";

export const Route = createFileRoute("/supplier-flow/vendor-performance/")({
  head: () => ({
    meta: [
      { title: "Vendor Performance | AxisWMS Procurement" },
      { name: "description", content: "Vendor scorecards, delivery and quality performance, ranking and corrective actions." },
      { property: "og:title", content: "Vendor Performance | AxisWMS Procurement" },
      { property: "og:description", content: "Ranked vendor scorecards across delivery, quality, cost and lead time." },
    ],
  }),
  component: VendorPerformance,
});

function VendorPerformance() {
  const ranked = [...suppliers].sort((a, b) => b.rating - a.rating);
  const chartData = ranked.slice(0, 6).map((s) => ({
    name: s.name.split(" ")[0],
    otd: s.onTimeDelivery,
    quality: s.qualityScore,
    defect: s.defectRate * 10,
  }));

  return (
    <div className="mx-auto max-w-[1600px]">
      <PageHeader
        breadcrumbs={[{ label: "Home", to: "/supplier-flow" }, { label: "Procurement" }, { label: "Vendor Performance" }]}
        title="Vendor performance"
        subtitle="Scorecards, ranking and corrective actions across the active supply base"
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Avg vendor rating" value={`${analytics.avgVendorRating} / 5`} icon={Star} accent="success" sub="Weighted by spend" />
        <StatCard label="On-time delivery" value="92.0%" icon={TrendingUp} accent="teal" delta="+1.4 pts" />
        <StatCard label="Avg lead time" value={`${analytics.avgDeliveryDays} d`} icon={Timer} accent="warning" sub="Target 15 days" />
        <StatCard label="Open corrective actions" value={2} icon={Gauge} accent="danger" sub="CAPA-2026-017, -019" />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <SectionCard className="xl:col-span-2" title="Delivery vs quality by vendor" description="On-time delivery %, quality acceptance % and defect index">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
                <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
                <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid var(--border)", background: "var(--popover)", fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="otd" name="On-time %" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="quality" name="Quality %" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="defect" name="Defect index" fill="var(--chart-5)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Monthly punctuality trend">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deliveryPerformance} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
                <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
                <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid var(--border)", background: "var(--popover)", fontSize: 12 }} />
                <Bar dataKey="onTime" name="On time %" fill="var(--chart-4)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      <SectionCard className="mt-4" title="Vendor ranking & scorecard" bodyClassName="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-12">Rank</TableHead><TableHead>Vendor</TableHead>
                <TableHead className="hidden md:table-cell">Category</TableHead>
                <TableHead className="text-right">Spend YTD</TableHead>
                <TableHead className="hidden sm:table-cell text-right">OTD %</TableHead>
                <TableHead className="hidden lg:table-cell text-right">Quality %</TableHead>
                <TableHead className="hidden lg:table-cell text-right">Defect %</TableHead>
                <TableHead className="w-32">Score</TableHead><TableHead>Risk</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ranked.map((s, i) => (
                <TableRow key={s.id} className="group">
                  <TableCell className="num text-sm text-muted-foreground">{i + 1}</TableCell>
                  <TableCell>
                    <Link to="/supplier-flow/vendor-performance/$supplierId" params={{ supplierId: s.id }} className="block min-w-48">
                      <p className="text-sm font-semibold group-hover:text-primary">{s.name}</p>
                      <p className="num text-xs text-muted-foreground">{s.code} · ★ {s.rating.toFixed(1)}</p>
                    </Link>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm">{s.category}</TableCell>
                  <TableCell className="num text-right text-sm font-medium">{compactMoney(s.spendYtd)}</TableCell>
                  <TableCell className="num hidden sm:table-cell text-right text-sm">{s.onTimeDelivery}%</TableCell>
                  <TableCell className="num hidden lg:table-cell text-right text-sm">{s.qualityScore}%</TableCell>
                  <TableCell className="num hidden lg:table-cell text-right text-sm">{s.defectRate}%</TableCell>
                  <TableCell><Progress value={s.rating * 20} className="h-1.5" /></TableCell>
                  <TableCell><StatusBadge status={s.risk} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </SectionCard>
    </div>
  );
}
