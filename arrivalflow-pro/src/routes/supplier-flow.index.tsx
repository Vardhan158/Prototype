import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Ban,
  CheckCircle2,
  ClipboardCheck,
  IndianRupee,
  PackageCheck,
  ShoppingCart,
  Star,
  Timer,
  Truck,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageHeader, SectionCard, Timeline } from "@/apps/supplier-flow/components/page-parts";
import { StatCard } from "@/apps/supplier-flow/components/stat-card";
import { StatusBadge } from "@/apps/supplier-flow/components/status-badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  analytics,
  asns,
  categorySpend,
  compactMoney,
  deliveryPerformance,
  poTotal,
  purchaseOrders,
  spendTrend,
  suppliers,
} from "@/apps/supplier-flow/data/procurement";

export const Route = createFileRoute("/supplier-flow/")({
  head: () => ({
    meta: [
      { title: "Procurement Command Centre | AxisWMS" },
      {
        name: "description",
        content:
          "Live procurement control tower: supplier health, purchase order pipeline, inbound shipments and approval SLAs.",
      },
      { property: "og:title", content: "Procurement Command Centre | AxisWMS" },
      {
        property: "og:description",
        content: "Live procurement control tower for suppliers, purchase orders, ASNs and approvals.",
      },
    ],
  }),
  component: Dashboard,
});

const chartColors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)", "var(--muted-foreground)"];

function Dashboard() {
  const topSuppliers = [...suppliers].sort((a, b) => b.spendYtd - a.spendYtd).slice(0, 5);
  const recentPOs = purchaseOrders.slice(0, 5);
  const inbound = asns.filter((a) => ["In Transit", "Arrived", "Delayed"].includes(a.status));
  const feed = [...suppliers[0]!.timeline].slice(-3).concat(purchaseOrders[0]!.timeline.slice(-3));

  return (
    <div className="mx-auto max-w-[1600px]">
      <PageHeader
        breadcrumbs={[{ label: "Home" }, { label: "Procurement Command Centre" }]}
        title="Procurement Command Centre"
        subtitle="Financial year 2026-27 · Q2 · All plants · Updated 01 Aug 2026, 15:01 IST"
        actions={
          <>
            <Button variant="outline" asChild>
              <Link to="/supplier-flow/reports">View reports</Link>
            </Button>
            <Button asChild>
              <Link to="/supplier-flow/purchase-orders/new">
                <ShoppingCart className="size-4" /> Create purchase order
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Total suppliers" value={analytics.totalSuppliers} sub={`${analytics.activeSuppliers} active`} icon={Users} to="/supplier-flow/suppliers" delta="+2 this quarter" />
        <StatCard label="Purchase spend YTD" value={compactMoney(analytics.purchaseSpend)} sub="Across 6 categories" icon={IndianRupee} accent="teal" delta="+7.2% vs LY" to="/supplier-flow/reports" />
        <StatCard label="Open purchase orders" value={analytics.totalPOs} sub={`${analytics.pendingApproval} pending approval`} icon={ShoppingCart} accent="primary" to="/supplier-flow/purchase-orders" />
        <StatCard label="Pending approvals" value={analytics.pendingApproval} sub="1 breaching SLA in 6 hrs" icon={ClipboardCheck} accent="warning" to="/supplier-flow/approvals" />
        <StatCard label="Inbound shipments" value={analytics.upcomingDeliveries} sub="1 delayed at Nhava Sheva" icon={Truck} accent="teal" to="/supplier-flow/asn" />
        <StatCard label="Avg vendor rating" value={`${analytics.avgVendorRating} / 5`} sub="Weighted by spend" icon={Star} accent="success" to="/supplier-flow/vendor-performance" />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
        <StatCard label="Active suppliers" value={analytics.activeSuppliers} icon={CheckCircle2} accent="success" to="/supplier-flow/suppliers" />
        <StatCard label="Blocked suppliers" value={analytics.blockedSuppliers} icon={Ban} accent="danger" to="/supplier-flow/suppliers" />
        <StatCard label="Approved today" value={analytics.approvedToday} icon={CheckCircle2} accent="success" to="/supplier-flow/approvals" />
        <StatCard label="Rejected (30d)" value={analytics.rejected} icon={AlertTriangle} accent="danger" to="/supplier-flow/approvals" />
        <StatCard label="Total ASN" value={analytics.totalASN} icon={PackageCheck} accent="teal" to="/supplier-flow/asn" />
        <StatCard label="Avg delivery time" value={`${analytics.avgDeliveryDays} d`} icon={Timer} accent="warning" to="/supplier-flow/vendor-performance" />
        <StatCard label="On-time delivery" value="92.0%" icon={Activity} accent="success" delta="+1.4 pts" to="/supplier-flow/vendor-performance" />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <SectionCard
          className="xl:col-span-2"
          title="Purchase spend & order volume"
          description="Monthly committed spend in ₹ crore against purchase order count"
          actions={<Button variant="ghost" size="sm" asChild><Link to="/supplier-flow/reports">Details <ArrowRight className="size-3.5" /></Link></Button>}
        >
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={spendTrend} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="spendFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
                <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{ borderRadius: 10, border: "1px solid var(--border)", background: "var(--popover)", fontSize: 12 }}
                  formatter={(v: number, n: string) => (n === "spend" ? [`₹${v} Cr`, "Spend"] : [v, "Orders"])}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="spend" name="Spend (₹ Cr)" stroke="var(--chart-1)" strokeWidth={2} fill="url(#spendFill)" />
                <Line type="monotone" dataKey="orders" name="Orders" stroke="var(--chart-2)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Category spend split" description="YTD committed value by procurement category">
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categorySpend} dataKey="value" nameKey="name" innerRadius={52} outerRadius={80} paddingAngle={2}>
                  {categorySpend.map((_, i) => (
                    <Cell key={i} fill={chartColors[i % chartColors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: 10, border: "1px solid var(--border)", background: "var(--popover)", fontSize: 12 }}
                  formatter={(v: number) => [`₹${v} Cr`, "Spend"]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-2 space-y-1.5">
            {categorySpend.map((c, i) => (
              <li key={c.name} className="flex items-center gap-2 text-xs">
                <span className="size-2.5 rounded-sm" style={{ background: chartColors[i % chartColors.length] }} />
                <span className="truncate">{c.name}</span>
                <span className="num ml-auto font-medium">₹{c.value} Cr</span>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <SectionCard
          className="xl:col-span-2"
          title="Recent purchase orders"
          actions={<Button variant="ghost" size="sm" asChild><Link to="/supplier-flow/purchase-orders">All orders <ArrowRight className="size-3.5" /></Link></Button>}
          bodyClassName="p-0"
        >
          <div className="divide-y">
            {recentPOs.map((po) => (
              <Link
                key={po.id}
                to="/supplier-flow/purchase-orders/$poId"
                params={{ poId: po.id }}
                className="flex flex-wrap items-center gap-3 px-4 py-3 transition-colors hover:bg-accent/60"
              >
                <div className="min-w-0 flex-1">
                  <p className="num truncate text-sm font-semibold">{po.id}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {po.supplier} · {po.warehouse.split(" · ")[0]} · Due {po.expectedDelivery}
                  </p>
                </div>
                <p className="num w-28 text-right text-sm font-semibold">{compactMoney(poTotal(po), po.currency)}</p>
                <StatusBadge status={po.status} />
              </Link>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Inbound shipments"
          description="Live ASN tracking feeding Warehouse Gate Entry"
          actions={<Button variant="ghost" size="sm" asChild><Link to="/supplier-flow/asn">All ASNs</Link></Button>}
          bodyClassName="p-0"
        >
          <div className="divide-y">
            {inbound.map((a) => (
              <Link key={a.id} to="/supplier-flow/asn/$asnId" params={{ asnId: a.id }} className="block px-4 py-3 hover:bg-accent/60">
                <div className="flex items-center justify-between gap-2">
                  <p className="num text-sm font-semibold">{a.id}</p>
                  <StatusBadge status={a.status} />
                </div>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {a.supplier} · {a.vehicleNo}
                </p>
                <Progress value={a.progressPct} className="mt-2 h-1.5" />
                <p className="mt-1 truncate text-[11px] text-muted-foreground">ETA {a.expectedArrival}</p>
              </Link>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <SectionCard title="On-time delivery performance" description="Percentage split of inbound receipts by punctuality" className="xl:col-span-2">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deliveryPerformance} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
                <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
                <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid var(--border)", background: "var(--popover)", fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="onTime" name="On time %" stackId="a" fill="var(--chart-4)" radius={[0, 0, 0, 0]} />
                <Bar dataKey="late" name="Late %" stackId="a" fill="var(--chart-5)" />
                <Bar dataKey="early" name="Early %" stackId="a" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Top suppliers by spend" bodyClassName="p-0">
          <div className="divide-y">
            {topSuppliers.map((s, i) => (
              <Link key={s.id} to="/supplier-flow/suppliers/$supplierId" params={{ supplierId: s.id }} className="flex items-center gap-3 px-4 py-3 hover:bg-accent/60">
                <span className="num flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-semibold">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{s.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {s.category} · {s.city}
                  </p>
                </div>
                <div className="text-right">
                  <p className="num text-sm font-semibold">{compactMoney(s.spendYtd)}</p>
                  <p className="num text-[11px] text-muted-foreground">★ {s.rating.toFixed(1)}</p>
                </div>
              </Link>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <SectionCard title="Activity feed" description="Latest procurement events across the organisation" className="xl:col-span-2">
          <Timeline events={feed} />
        </SectionCard>
        <SectionCard title="Next module handoff" description="Warehouse Gate Entry & Arrival Management">
          <div className="rounded-lg border border-dashed p-4">
            <p className="text-sm font-medium">2 shipments queued for gate entry</p>
            <p className="mt-1 text-xs text-muted-foreground">
              ASN-2026-002240 has arrived at Gate 1 (Sanand) and ASN-2026-002251 is 84 km away. Security and warehouse
              teams have been notified with token and dock allocation pending.
            </p>
            <ul className="mt-3 space-y-2">
              {asns
                .filter((a) => ["Arrived", "In Transit"].includes(a.status))
                .map((a) => (
                  <li key={a.id} className="flex items-center justify-between rounded-md bg-muted/60 px-3 py-2 text-xs">
                    <span className="num font-medium">{a.id}</span>
                    <span className="truncate text-muted-foreground">{a.gate}</span>
                  </li>
                ))}
            </ul>
            <Button className="mt-4 w-full" variant="outline" asChild>
              <Link to="/supplier-flow/asn">Open shipment queue <ArrowRight className="size-4" /></Link>
            </Button>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
