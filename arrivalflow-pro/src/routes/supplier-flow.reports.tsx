import { createFileRoute } from "@tanstack/react-router";
import { Download, FileBarChart } from "lucide-react";
import { toast } from "sonner";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHeader, SectionCard } from "@/apps/supplier-flow/components/page-parts";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { categorySpend, spendTrend, suppliers, compactMoney } from "@/apps/supplier-flow/data/procurement";

export const Route = createFileRoute("/supplier-flow/reports")({
  head: () => ({
    meta: [
      { title: "Procurement Reports | AxisWMS" },
      { name: "description", content: "Spend analytics, supplier registers, approval cycle and inbound performance reports." },
      { property: "og:title", content: "Procurement Reports | AxisWMS" },
      { property: "og:description", content: "Standard and scheduled procurement reports for finance and operations." },
    ],
  }),
  component: Reports,
});

const reports = [
  { name: "Purchase spend by category", owner: "Finance", freq: "Monthly", last: "01 Aug 2026" },
  { name: "Supplier master register", owner: "Procurement Ops", freq: "Weekly", last: "28 Jul 2026" },
  { name: "Approval cycle time analysis", owner: "Procurement Ops", freq: "Monthly", last: "01 Aug 2026" },
  { name: "Inbound delivery performance", owner: "Warehouse", freq: "Weekly", last: "31 Jul 2026" },
  { name: "MSME payment compliance (45-day)", owner: "Finance", freq: "Monthly", last: "01 Aug 2026" },
  { name: "Blocked & high-risk vendor exposure", owner: "Risk", freq: "Quarterly", last: "01 Jul 2026" },
];

function Reports() {
  return (
    <div className="mx-auto max-w-[1600px]">
      <PageHeader
        breadcrumbs={[{ label: "Home", to: "/supplier-flow" }, { label: "Insights" }, { label: "Reports" }]}
        title="Procurement reports"
        subtitle="Standard, scheduled and ad-hoc analytics across spend, suppliers and inbound logistics"
        actions={<Button variant="outline" onClick={() => toast.success("Report pack exported")}><Download className="size-4" /> Export pack</Button>}
      />

      <div className="grid gap-4 xl:grid-cols-3">
        <SectionCard className="xl:col-span-2" title="Spend trend" description="Committed spend in ₹ crore">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={spendTrend} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="rep" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
                <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
                <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid var(--border)", background: "var(--popover)", fontSize: 12 }} />
                <Area type="monotone" dataKey="spend" name="Spend (₹ Cr)" stroke="var(--chart-2)" strokeWidth={2} fill="url(#rep)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Category spend register" bodyClassName="p-0">
          <div className="divide-y">
            {categorySpend.map((c) => (
              <div key={c.name} className="flex items-center justify-between px-4 py-3 text-sm">
                <span className="truncate">{c.name}</span>
                <span className="num font-medium">₹{c.value} Cr</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <SectionCard className="mt-4" title="Standard reports" description="Scheduled distributions to finance, operations and risk" bodyClassName="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Report</TableHead><TableHead className="hidden sm:table-cell">Owner</TableHead>
              <TableHead className="hidden md:table-cell">Frequency</TableHead><TableHead className="hidden md:table-cell">Last run</TableHead><TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.map((r) => (
              <TableRow key={r.name}>
                <TableCell className="text-sm font-medium"><FileBarChart className="mr-2 inline size-4 text-muted-foreground" />{r.name}</TableCell>
                <TableCell className="hidden sm:table-cell text-sm">{r.owner}</TableCell>
                <TableCell className="hidden md:table-cell text-sm">{r.freq}</TableCell>
                <TableCell className="num hidden md:table-cell text-sm">{r.last}</TableCell>
                <TableCell className="text-right"><Button size="sm" variant="ghost" onClick={() => toast.success(`${r.name} generated`)}>Run</Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </SectionCard>

      <SectionCard className="mt-4" title="Top suppliers by spend" bodyClassName="p-0">
        <Table>
          <TableHeader><TableRow className="bg-muted/50"><TableHead>Supplier</TableHead><TableHead className="hidden sm:table-cell">Category</TableHead><TableHead className="text-right">Spend YTD</TableHead><TableHead className="hidden sm:table-cell text-right">Rating</TableHead></TableRow></TableHeader>
          <TableBody>
            {[...suppliers].sort((a, b) => b.spendYtd - a.spendYtd).slice(0, 6).map((s) => (
              <TableRow key={s.id}>
                <TableCell className="text-sm font-medium">{s.name}</TableCell>
                <TableCell className="hidden sm:table-cell text-sm">{s.category}</TableCell>
                <TableCell className="num text-right text-sm font-medium">{compactMoney(s.spendYtd)}</TableCell>
                <TableCell className="num hidden sm:table-cell text-right text-sm">{s.rating.toFixed(1)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </SectionCard>
    </div>
  );
}
