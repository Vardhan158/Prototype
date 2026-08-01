import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CheckCircle2, ClipboardCheck, Download, Filter, Plus, RefreshCw, Search, ShoppingCart, Timer, X } from "lucide-react";
import { toast } from "sonner";
import { EmptyState, PageHeader, SectionCard, TableSkeleton } from "@/apps/supplier-flow/components/page-parts";
import { StatCard } from "@/apps/supplier-flow/components/stat-card";
import { StatusBadge } from "@/apps/supplier-flow/components/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { compactMoney, poTotal, purchaseOrders, suppliers } from "@/apps/supplier-flow/data/procurement";

export const Route = createFileRoute("/supplier-flow/purchase-orders/")({
  head: () => ({
    meta: [
      { title: "Purchase Orders | AxisWMS Procurement" },
      { name: "description", content: "Track, approve and govern the complete purchase order pipeline across plants and categories." },
      { property: "og:title", content: "Purchase Orders | AxisWMS Procurement" },
      { property: "og:description", content: "Purchase order pipeline with budget, tax and approval controls." },
    ],
  }),
  component: POList,
});

const tabs = ["All", "Draft", "Pending Approval", "Approved", "Sent to Supplier", "Partially Received", "Closed", "Cancelled"];

function POList() {
  const [tab, setTab] = useState("All");
  const [q, setQ] = useState("");
  const [supplier, setSupplier] = useState("all");
  const [priority, setPriority] = useState("all");
  const [warehouse, setWarehouse] = useState("all");
  const [loading, setLoading] = useState(false);

  const warehouses = Array.from(new Set(purchaseOrders.map((p) => p.warehouse)));

  const rows = useMemo(
    () =>
      purchaseOrders.filter((p) => {
        if (tab !== "All" && p.status !== tab) return false;
        if (supplier !== "all" && p.supplierId !== supplier) return false;
        if (priority !== "all" && p.priority !== priority) return false;
        if (warehouse !== "all" && p.warehouse !== warehouse) return false;
        const t = q.trim().toLowerCase();
        if (t && !`${p.id} ${p.supplier} ${p.buyer} ${p.costCenter}`.toLowerCase().includes(t)) return false;
        return true;
      }),
    [tab, q, supplier, priority, warehouse],
  );

  const totalValue = rows.reduce((s, p) => s + (p.currency === "INR" ? poTotal(p) : poTotal(p) * (p.currency === "EUR" ? 92 : 84)), 0);

  return (
    <div className="mx-auto max-w-[1600px]">
      <PageHeader
        breadcrumbs={[{ label: "Home", to: "/supplier-flow" }, { label: "Procurement" }, { label: "Purchase Orders" }]}
        title="Purchase Orders"
        subtitle="End-to-end order lifecycle from requisition conversion to closure"
        actions={
          <>
            <Button variant="outline" onClick={() => toast.success("Export ready", { description: "purchase-orders-01Aug2026.xlsx downloaded." })}>
              <Download className="size-4" /> Export
            </Button>
            <Button asChild>
              <Link to="/supplier-flow/purchase-orders/new"><Plus className="size-4" /> Create purchase order</Link>
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard label="Total orders" value={purchaseOrders.length} icon={ShoppingCart} sub="Rolling 120 days" />
        <StatCard label="Pending approval" value={purchaseOrders.filter((p) => p.status === "Pending Approval").length} icon={ClipboardCheck} accent="warning" sub="1 SLA at risk" to="/supplier-flow/approvals" />
        <StatCard label="Approved" value={purchaseOrders.filter((p) => ["Approved", "Sent to Supplier", "Partially Received"].includes(p.status)).length} icon={CheckCircle2} accent="success" sub="Ready for despatch" />
        <StatCard label="Order value (filtered)" value={compactMoney(totalValue)} icon={Timer} accent="teal" sub="INR equivalent" />
        <StatCard label="Avg approval cycle" value="1.8 d" icon={Timer} accent="primary" sub="Target 2.0 days" />
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="flex-wrap">
              {tabs.map((t) => (
                <TabsTrigger key={t} value={t} className="text-xs">
                  {t}
                  <span className="num ml-1.5 text-[10px] text-muted-foreground">
                    {t === "All" ? purchaseOrders.length : purchaseOrders.filter((p) => p.status === t).length}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <Button variant="outline" size="sm" className="ml-auto" onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 900); }}>
            <RefreshCw className="size-4" /> Refresh
          </Button>
        </div>

        <SectionCard bodyClassName="p-3">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            <div className="relative lg:col-span-2">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search PO number, supplier, buyer, cost centre…" className="pl-9" />
            </div>
            <Select value={supplier} onValueChange={setSupplier}>
              <SelectTrigger><SelectValue placeholder="Supplier" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All suppliers</SelectItem>
                {suppliers.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={warehouse} onValueChange={setWarehouse}>
              <SelectTrigger><SelectValue placeholder="Warehouse" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All warehouses</SelectItem>
                {warehouses.map((w) => <SelectItem key={w} value={w}>{w}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger><SelectValue placeholder="Priority" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All priorities</SelectItem>
                {["Critical", "High", "Medium", "Low"].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-muted-foreground"><Filter className="mr-1 inline size-3.5" />{rows.length} of {purchaseOrders.length} orders</span>
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => { setQ(""); setSupplier("all"); setPriority("all"); setWarehouse("all"); setTab("All"); }}>
              <X className="size-3.5" /> Clear all
            </Button>
          </div>
        </SectionCard>

        <SectionCard bodyClassName="p-0">
          {loading ? (
            <TableSkeleton rows={6} cols={7} />
          ) : rows.length === 0 ? (
            <EmptyState icon={ShoppingCart} title="No purchase orders found" description="Adjust the filters above or raise a new order against an approved supplier." action={<Button asChild><Link to="/supplier-flow/purchase-orders/new">Create purchase order</Link></Button>} />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>PO number</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead className="hidden lg:table-cell">Warehouse</TableHead>
                    <TableHead className="hidden xl:table-cell">Buyer</TableHead>
                    <TableHead className="hidden md:table-cell">Delivery</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                    <TableHead className="hidden sm:table-cell">Priority</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((p) => (
                    <TableRow key={p.id} className="group">
                      <TableCell>
                        <Link to="/supplier-flow/purchase-orders/$poId" params={{ poId: p.id }} className="block min-w-36">
                          <p className="num text-sm font-semibold group-hover:text-primary">{p.id}</p>
                          <p className="num text-xs text-muted-foreground">{p.createdOn} · {p.items.length} lines</p>
                        </Link>
                      </TableCell>
                      <TableCell className="text-sm">{p.supplier}</TableCell>
                      <TableCell className="hidden lg:table-cell text-sm">{p.warehouse.split(" · ")[0]}</TableCell>
                      <TableCell className="hidden xl:table-cell text-sm">{p.buyer}</TableCell>
                      <TableCell className="num hidden md:table-cell text-sm">{p.expectedDelivery}</TableCell>
                      <TableCell className="num text-right text-sm font-semibold">{compactMoney(poTotal(p), p.currency)}</TableCell>
                      <TableCell className="hidden sm:table-cell"><StatusBadge status={p.priority} /></TableCell>
                      <TableCell><StatusBadge status={p.status} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
