import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Search, Filter, Download, X, PackageSearch } from "lucide-react";
import { toast } from "sonner";
import {
  PageHeader,
  SectionCard,
  StatusBadge,
  EmptyState,
  TableSkeleton,
} from "@/apps/wave-flow/components/wms/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { orders, warehouses } from "@/apps/wave-flow/lib/wms-data";

export const Route = createFileRoute("/wave-flow/orders/")({
  head: () => ({
    meta: [
      { title: "Outbound Orders â€” NexusWMS" },
      {
        name: "description",
        content:
          "Create, filter and manage outbound orders with customer, material, batch, serial and dispatch-window detail.",
      },
      { property: "og:title", content: "Outbound Orders â€” NexusWMS" },
      {
        property: "og:description",
        content: "Full outbound order list with lifecycle status and documents.",
      },
    ],
  }),
  component: OrdersPage,
});

const tabs = ["All", "Pending", "Ready", "In Fulfillment", "Dispatched", "Exception"] as const;

function OrdersPage() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("All");
  const [q, setQ] = useState("");
  const [priority, setPriority] = useState("all");
  const [loading, setLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const rows = useMemo(() => {
    return orders.filter((o) => {
      const matchQ =
        !q ||
        [o.id, o.customer, o.salesOrder, o.carrier]
          .join(" ")
          .toLowerCase()
          .includes(q.toLowerCase());
      const matchP = priority === "all" || o.priority === priority;
      const matchTab =
        tab === "All" ||
        (tab === "Pending" && ["Created", "Inventory Reserved"].includes(o.status)) ||
        (tab === "Ready" && o.status === "Ready") ||
        (tab === "In Fulfillment" &&
          [
            "Wave Assigned",
            "Picking",
            "Picked",
            "Packing",
            "Packed",
            "Quality Verified",
            "Staged",
            "Loaded",
          ].includes(o.status)) ||
        (tab === "Dispatched" && ["Dispatched", "Delivered"].includes(o.status)) ||
        (tab === "Exception" && o.status === "Exception");
      return matchQ && matchP && matchTab;
    });
  }, [q, priority, tab]);

  const simulateLoad = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 900);
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Outbound Orders"
        description="24 open orders across 3 warehouses Â· 3 breaching SLA today"
        breadcrumb={["Outbound", "Orders"]}
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => toast.success("Export queued â€” CSV will arrive by email")}
            >
              <Download className="size-4" /> Export
            </Button>
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="size-4" /> Create order
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create outbound order</DialogTitle>
                  <DialogDescription>
                    Inventory is validated against available-to-promise stock on save.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-1.5">
                    <Label>Sales order</Label>
                    <Input placeholder="SO-88271" defaultValue="SO-88271" />
                  </div>
                  <div className="grid gap-1.5">
                    <Label>Customer</Label>
                    <Select defaultValue="crg">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="crg">Continental Retail Group</SelectItem>
                        <SelectItem value="nia">Nordwind Industrie AG</SelectItem>
                        <SelectItem value="pms">Pacifica Marine Supplies</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-1.5">
                    <Label>Warehouse</Label>
                    <Select defaultValue="DC-01">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {warehouses.map((w) => (
                          <SelectItem key={w.code} value={w.code}>
                            {w.code} â€” {w.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-1.5">
                    <Label>Priority</Label>
                    <Select defaultValue="High">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["Critical", "High", "Medium", "Low"].map((p) => (
                          <SelectItem key={p} value={p}>
                            {p}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-1.5">
                    <Label>Delivery date</Label>
                    <Input type="date" defaultValue="2026-03-22" />
                  </div>
                  <div className="grid gap-1.5">
                    <Label>Dispatch window</Label>
                    <Input defaultValue="21 Mar Â· 13:00â€“16:00" />
                  </div>
                  <div className="grid gap-1.5 sm:col-span-2">
                    <Label>Shipping address</Label>
                    <Textarea
                      defaultValue="Kruisweg 812, 2132 CA Hoofddorp, Netherlands"
                      rows={2}
                    />
                  </div>
                  <div className="grid gap-1.5 sm:col-span-2">
                    <Label>Material line</Label>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      <Input placeholder="Material" defaultValue="MAT-449021" />
                      <Input placeholder="Batch" defaultValue="B2026007" />
                      <Input placeholder="Serial" defaultValue="â€”" />
                      <Input placeholder="Qty" defaultValue="120" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Available-to-promise: 1,240 EA at A-04-12-B3 Â· reservation will be created.
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      setCreateOpen(false);
                      toast.success("Order OB-2026-104879 created", {
                        description: "Inventory reserved Â· ready for wave planning",
                      });
                    }}
                  >
                    Validate & create
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        }
      />

      <SectionCard bodyClassName="p-0">
        <div className="flex flex-col gap-3 border-b border-border p-3 lg:flex-row lg:items-center lg:justify-between">
          <Tabs value={tab} onValueChange={(v) => setTab(v as (typeof tabs)[number])}>
            <TabsList className="flex-wrap">
              {tabs.map((t) => (
                <TabsTrigger key={t} value={t} className="text-xs">
                  {t}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-0 flex-1 sm:w-64 sm:flex-none">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  simulateLoad();
                }}
                placeholder="Search order, customer, carrier"
                className="pl-9"
              />
              {q && (
                <button
                  className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground"
                  onClick={() => setQ("")}
                  aria-label="Clear search"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger className="w-36">
                <Filter className="size-3.5" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All priorities</SelectItem>
                {["Critical", "High", "Medium", "Low"].map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="p-4">
            <TableSkeleton rows={6} cols={7} />
          </div>
        ) : rows.length === 0 ? (
          <EmptyState
            icon={<PackageSearch className="size-6" />}
            title="No orders match your filters"
            description="Try clearing the search term or switching to the All tab to see the full outbound backlog."
            action={
              <Button
                variant="outline"
                onClick={() => {
                  setQ("");
                  setPriority("all");
                  setTab("All");
                }}
              >
                Reset filters
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-sm">
              <thead className="bg-surface-muted text-xs text-muted-foreground">
                <tr>
                  {[
                    "Order",
                    "Sales order",
                    "Customer",
                    "WH",
                    "Priority",
                    "Lines",
                    "Dispatch window",
                    "Wave",
                    "Status",
                    "",
                  ].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left font-medium whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((o) => (
                  <tr key={o.id} className="hover:bg-muted/50">
                    <td className="num px-4 py-3 font-medium whitespace-nowrap">
                      <Link
                        to="/wave-flow/orders/$orderId"
                        params={{ orderId: o.id }}
                        className="hover:text-primary"
                      >
                        {o.id}
                      </Link>
                    </td>
                    <td className="num px-4 py-3 text-muted-foreground">{o.salesOrder}</td>
                    <td className="px-4 py-3">{o.customer}</td>
                    <td className="num px-4 py-3">{o.warehouse}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={o.priority} />
                    </td>
                    <td className="num px-4 py-3">{o.lines.length}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                      {o.dispatchWindow}
                    </td>
                    <td className="num px-4 py-3 text-muted-foreground">{o.wave ?? "â€”"}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <Link
                        to="/wave-flow/orders/$orderId"
                        params={{ orderId: o.id }}
                        className="text-xs font-medium text-primary"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="flex items-center justify-between border-t border-border px-4 py-3 text-xs text-muted-foreground">
          <span>
            Showing {rows.length} of {orders.length} loaded orders (24 total open)
          </span>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm" onClick={simulateLoad}>
              Next
            </Button>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
