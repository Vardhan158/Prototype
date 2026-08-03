import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Download, FileBarChart, Printer } from "lucide-react";
import { toast } from "sonner";
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AppShell } from "@/apps/gate-pass-pro/components/wms/AppShell";
import { StatusChip } from "@/apps/gate-pass-pro/components/wms/StatusChip";
import { getGateReport, useRealtimeGateReport } from "@/apps/gate-pass-pro/lib/report-api";

export const Route = createFileRoute("/gate-pass-pro/reports")({
  loader: () => getGateReport("Today"),
  head: () => ({
    meta: [
      { title: "Gate Reports & Analytics — NexusWMS" },
      { name: "description", content: "Truck entry and exit reports, vendor performance, waiting time, rejected vehicles and gate productivity analytics." },
      { property: "og:title", content: "Gate Reports & Analytics — NexusWMS" },
      { property: "og:description", content: "Operational analytics for gate and yard performance." },
    ],
  }),
  component: Reports,
});

const pieColors = ["var(--color-chart-3)", "var(--color-chart-1)", "var(--color-chart-4)", "var(--color-chart-5)"];

const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid var(--color-border)",
  background: "var(--color-card)",
  fontSize: 12,
};

function Reports() {
  const [range, setRange] = useState("Today");
  const { report, connected } = useRealtimeGateReport(range, Route.useLoaderData());
  const { metrics, hourlyTraffic, vendorRows: reportRows, waitingTrend, exceptions, statusDistribution: pieData, officerPerformance } = report;

  return (
    <AppShell
      title="Reports &amp; Analytics"
      subtitle={`Gate performance, vendor compliance and yard productivity · ${connected ? "Live" : "Reconnecting"}`}
      actions={
        <>
          <Select value={range} onValueChange={setRange}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              {["Today", "Last 7 days", "This month", "This quarter"].map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => toast.success("Report PDF queued for download")}>
            <Printer className="mr-2 h-4 w-4" />Print
          </Button>
          <Button onClick={() => toast.success("Export scheduled · emailed to warehouse manager")}>
            <Download className="mr-2 h-4 w-4" />Export
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="surface-card p-4">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{metric.label}</p>
            <p className="mt-1 text-2xl font-semibold">{metric.value}</p>
            <p className="text-[11px] text-muted-foreground">{metric.hint}</p>
          </div>
        ))}
      </div>

      <Tabs defaultValue="entry" className="mt-4">
        <TabsList className="flex-wrap">
          <TabsTrigger value="entry">Daily entry</TabsTrigger>
          <TabsTrigger value="exit">Daily exit</TabsTrigger>
          <TabsTrigger value="vendor">Vendor</TabsTrigger>
          <TabsTrigger value="waiting">Waiting time</TabsTrigger>
          <TabsTrigger value="rejected">Rejected trucks</TabsTrigger>
          <TabsTrigger value="gate">Gate performance</TabsTrigger>
        </TabsList>

        <TabsContent value="entry" className="pt-4">
          <div className="surface-card p-5">
            <h2 className="text-sm font-semibold">Truck entry report · {range}</h2>
            <div className="mt-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyTraffic}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="hour" tickLine={false} axisLine={false} fontSize={11} />
                  <YAxis tickLine={false} axisLine={false} fontSize={11} width={28} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="entries" fill="var(--color-chart-1)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="exit" className="pt-4">
          <div className="surface-card p-5">
            <h2 className="text-sm font-semibold">Truck exit report · {range}</h2>
            <div className="mt-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyTraffic}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="hour" tickLine={false} axisLine={false} fontSize={11} />
                  <YAxis tickLine={false} axisLine={false} fontSize={11} width={28} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="exits" fill="var(--color-chart-2)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="vendor" className="pt-4">
          <div className="surface-card overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/50 text-left text-[11px] uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Vendor</th><th className="px-4 py-3">Trips</th>
                  <th className="px-4 py-3">On-time %</th><th className="px-4 py-3">Avg. wait</th>
                  <th className="px-4 py-3">Rejected</th><th className="px-4 py-3">Tonnage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {reportRows.map((r) => (
                  <tr key={r.vendor} className="hover:bg-accent/40">
                    <td className="px-4 py-3 text-xs font-medium">{r.vendor}</td>
                    <td className="px-4 py-3 text-xs">{r.trips}</td>
                    <td className="px-4 py-3 text-xs">{r.onTime}</td>
                    <td className="px-4 py-3 text-xs">{r.avgWait}</td>
                    <td className="px-4 py-3 text-xs">{r.rejected}</td>
                    <td className="px-4 py-3 text-xs">{r.tonnage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="waiting" className="pt-4">
          <div className="surface-card p-5">
            <h2 className="text-sm font-semibold">Average waiting time per day (minutes)</h2>
            <div className="mt-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={waitingTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={11} />
                  <YAxis tickLine={false} axisLine={false} fontSize={11} width={28} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line type="monotone" dataKey="minutes" stroke="var(--color-chart-4)" strokeWidth={2.5} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="rejected" className="pt-4">
          <div className="surface-card divide-y divide-border">
            {exceptions.map((e) => (
              <div key={e.id} className="flex flex-wrap items-center gap-3 p-4">
                <span className="w-32 font-mono text-xs font-semibold">{e.truck}</span>
                <span className="min-w-0 flex-1 text-xs text-muted-foreground">{e.vendor} · {e.holdReason}</span>
                <span className="text-[11px] text-muted-foreground">{new Date(e.arrival).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                <StatusChip status={e.status} />
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="gate" className="pt-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="surface-card p-5">
              <h2 className="text-sm font-semibold">Truck status distribution</h2>
              <div className="mt-4 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={3}>
                      {pieData.map((_, i) => <Cell key={i} fill={pieColors[i]} />)}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="surface-card p-5">
              <h2 className="text-sm font-semibold">Security officer performance</h2>
              <div className="mt-4 divide-y divide-border">
                {officerPerformance.map((r) => (
                  <div key={r.officer} className="flex flex-wrap items-center gap-3 py-3 text-xs">
                    <span className="w-28 font-medium">{r.officer}</span>
                    <span className="text-muted-foreground">{r.gate}</span>
                    <span className="ml-auto">{r.entries} entries</span>
                    <span className="text-muted-foreground">avg {r.avgMinutes} min/entry</span>
                    <span className="text-muted-foreground">{r.exceptions} exceptions</span>
                  </div>
                ))}
              </div>
              <p className="mt-4 flex items-center gap-2 text-[11px] text-muted-foreground">
                <FileBarChart className="h-3.5 w-3.5" /> Subscribe to a daily 18:00 summary email.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
