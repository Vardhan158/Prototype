import { createFileRoute } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { FileSpreadsheet, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader, SectionCard, StatusBadge } from "@/apps/warehouse-flow/components/ui-kit";
import { KpiCard } from "@/apps/warehouse-flow/components/kpi-card";
import {
  consumptionTrend,
  inr,
  inventoryAlerts,
  inventoryTransactions,
  requestsVsIssues,
  returnTrend,
  statusSplit,
  topConsumed,
  warehousePerformance,
} from "@/apps/warehouse-flow/data";

export const Route = createFileRoute("/warehouse-flow/reports")({
  head: () => ({
    meta: [
      { title: "Reports & Analytics — WMS Console" },
      {
        name: "description",
        content:
          "Interactive reports for requests, issues, returns, consumption, warehouse performance, transactions and low stock.",
      },
      { property: "og:title", content: "Reports & Analytics — WMS Console" },
      {
        property: "og:description",
        content: "Interactive warehouse reports across requests, issues, returns and stock.",
      },
    ],
  }),
  component: ReportsPage,
});

const axis = {
  stroke: "var(--color-muted-foreground)",
  fontSize: 12,
  tickLine: false,
  axisLine: false,
};

const tooltipStyle = {
  background: "var(--color-popover)",
  border: "1px solid var(--color-border)",
  borderRadius: "0.6rem",
  fontSize: 12,
  color: "var(--color-popover-foreground)",
};

function ReportsPage() {
  return (
    <>
      <PageHeader
        title="Reports & Analytics"
        description="Deep-dive insights into requests, issues, returns and warehouse performance."
        breadcrumbs={[{ label: "Home", to: "/warehouse-flow/" }, { label: "Reports" }]}
        actions={
          <>
            <Select defaultValue="30">
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last quarter</SelectItem>
                <SelectItem value="365">Last 12 months</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => toast.success("CSV export queued")}>
              <FileSpreadsheet className="size-4" /> CSV
            </Button>
            <Button variant="outline" onClick={() => toast.success("PDF report generating")}>
              <FileText className="size-4" /> PDF
            </Button>
          </>
        }
      />

      <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Issue Efficiency" value="94.2%" delta="+2.1pp" trend="up" hint="vs 92.1% last month" icon="Gauge" />
        <KpiCard label="Avg. Approval Time" value="3h 42m" delta="-18m" trend="down" hint="target 4h" icon="Timer" />
        <KpiCard label="Pick Accuracy" value="99.6%" delta="+0.4pp" trend="up" hint="zero errors this week" icon="Target" />
        <KpiCard label="Return Rate" value="1.8%" delta="-0.3pp" trend="down" hint="of issued items" icon="Undo2" />
      </div>

      <Tabs defaultValue="requests">
        <TabsList className="flex-wrap">
          <TabsTrigger value="requests">Requests & Issues</TabsTrigger>
          <TabsTrigger value="returns">Returns</TabsTrigger>
          <TabsTrigger value="consumption">Consumption</TabsTrigger>
          <TabsTrigger value="warehouse">Warehouse</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="stock">Low Stock</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="mt-4 grid gap-4 xl:grid-cols-3">
          <SectionCard title="Requests vs Issues" className="xl:col-span-2">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={requestsVsIssues} barGap={6}>
                  <CartesianGrid vertical={false} stroke="var(--color-border)" />
                  <XAxis dataKey="month" {...axis} />
                  <YAxis {...axis} width={40} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--color-muted)" }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="requests" name="Requests" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="issues" name="Issues" fill="var(--color-chart-2)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>
          <SectionCard title="Status Split">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusSplit} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                    {statusSplit.map((s) => (
                      <Cell key={s.name} fill={s.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="returns" className="mt-4">
          <SectionCard title="Material Returns by Reason">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={returnTrend}>
                  <CartesianGrid vertical={false} stroke="var(--color-border)" />
                  <XAxis dataKey="month" {...axis} />
                  <YAxis {...axis} width={40} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--color-muted)" }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="surplus" name="Surplus" stackId="a" fill="var(--color-chart-1)" />
                  <Bar dataKey="damaged" name="Damaged" stackId="a" fill="var(--color-chart-5)" />
                  <Bar dataKey="quality" name="Quality failure" stackId="a" fill="var(--color-chart-3)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="consumption" className="mt-4 grid gap-4 xl:grid-cols-2">
          <SectionCard title="Consumption Value Trend" description="Issued value per month (INR)">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={consumptionTrend}>
                  <CartesianGrid vertical={false} stroke="var(--color-border)" />
                  <XAxis dataKey="month" {...axis} />
                  <YAxis {...axis} width={52} tickFormatter={(v: number) => `${(v / 100000).toFixed(1)}L`} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `₹${(v / 100000).toFixed(2)} L`} />
                  <Line type="monotone" dataKey="value" name="Consumption" stroke="var(--color-chart-1)" strokeWidth={2.5} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>
          <SectionCard title="Top Consumed Materials" bodyClassName="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/60">
                  <TableHead>Material</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topConsumed.map((t) => (
                  <TableRow key={t.code}>
                    <TableCell>
                      <p className="text-sm font-medium">{t.name}</p>
                      <p className="num text-xs text-muted-foreground">{t.code}</p>
                    </TableCell>
                    <TableCell className="num text-right text-sm">{t.qty.toLocaleString("en-IN")}</TableCell>
                    <TableCell className="num text-right text-sm font-semibold">{inr(t.value)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </SectionCard>
        </TabsContent>

        <TabsContent value="warehouse" className="mt-4">
          <SectionCard title="Warehouse Performance" bodyClassName="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/60">
                  <TableHead>Warehouse</TableHead>
                  <TableHead className="w-56">Fulfilment SLA</TableHead>
                  <TableHead className="text-right">Picks</TableHead>
                  <TableHead className="text-right">Accuracy</TableHead>
                  <TableHead className="text-right">Avg. cycle</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {warehousePerformance.map((w) => (
                  <TableRow key={w.warehouse}>
                    <TableCell className="num text-sm font-semibold">{w.warehouse}</TableCell>
                    <TableCell>
                      <Progress value={w.fulfilment} className="h-1.5" />
                      <span className="num mt-1 block text-[11px] text-muted-foreground">{w.fulfilment}%</span>
                    </TableCell>
                    <TableCell className="num text-right text-sm">{w.picks}</TableCell>
                    <TableCell className="num text-right text-sm">{w.accuracy}%</TableCell>
                    <TableCell className="num text-right text-sm">{w.cycleHrs} h</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </SectionCard>
        </TabsContent>

        <TabsContent value="transactions" className="mt-4">
          <SectionCard title="Inventory Transactions" bodyClassName="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/60">
                    <TableHead>Txn</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Material</TableHead>
                    <TableHead>Warehouse</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventoryTransactions.map((t) => (
                    <TableRow key={t.txn}>
                      <TableCell className="num text-sm font-semibold text-primary">{t.txn}</TableCell>
                      <TableCell className="text-sm">{t.type}</TableCell>
                      <TableCell className="num text-sm">{t.code}</TableCell>
                      <TableCell className="num text-sm">{t.warehouse}</TableCell>
                      <TableCell
                        className={`num text-right text-sm font-semibold ${t.qty > 0 ? "text-success" : "text-destructive"}`}
                      >
                        {t.qty > 0 ? `+${t.qty}` : t.qty}
                      </TableCell>
                      <TableCell className="num text-sm">{t.ref}</TableCell>
                      <TableCell className="num text-xs text-muted-foreground">{t.at}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="stock" className="mt-4">
          <SectionCard title="Low Stock Report" description="Materials at or below reorder point" bodyClassName="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/60">
                  <TableHead>Material</TableHead>
                  <TableHead>Warehouse</TableHead>
                  <TableHead className="text-right">On hand</TableHead>
                  <TableHead className="text-right">Reorder point</TableHead>
                  <TableHead>Severity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventoryAlerts.map((a) => (
                  <TableRow key={a.code}>
                    <TableCell>
                      <p className="text-sm font-medium">{a.name}</p>
                      <p className="num text-xs text-muted-foreground">{a.code}</p>
                    </TableCell>
                    <TableCell className="num text-sm">{a.warehouse}</TableCell>
                    <TableCell className="num text-right text-sm font-semibold">{a.onHand}</TableCell>
                    <TableCell className="num text-right text-sm">{a.reorder}</TableCell>
                    <TableCell>
                      <StatusBadge status={a.severity === "critical" ? "Critical" : "Medium"} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </SectionCard>
        </TabsContent>
      </Tabs>
    </>
  );
}
