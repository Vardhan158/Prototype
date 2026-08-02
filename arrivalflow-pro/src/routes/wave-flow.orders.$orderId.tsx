import { createFileRoute, Link, notFound, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  Ban,
  FileText,
  Paperclip,
  Pencil,
  Printer,
  Truck,
  User,
  MapPin,
  CalendarClock,
} from "lucide-react";
import { toast } from "sonner";
import {
  Metric,
  PageHeader,
  SectionCard,
  StatusBadge,
  Timeline,
  ProgressBar,
} from "@/apps/wave-flow/components/wms/ui";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getOrder } from "@/apps/wave-flow/lib/wms-data";

export const Route = createFileRoute("/wave-flow/orders/$orderId")({
  head: ({ params }) => ({
    meta: [
      { title: `Order ${params.orderId} â€” NexusWMS` },
      {
        name: "description",
        content: `Outbound order ${params.orderId}: customer, material lines, batch and serial detail, fulfillment timeline and documents.`,
      },
      { property: "og:title", content: `Order ${params.orderId} â€” NexusWMS` },
      {
        property: "og:description",
        content: "Complete outbound order detail and fulfillment timeline.",
      },
    ],
  }),
  loader: ({ params }) => {
    if (!getOrder(params.orderId)) throw notFound();
    return null;
  },
  component: OrderDetail,
});

function OrderDetail() {
  const { orderId } = useParams({ from: "/wave-flow/orders/$orderId" });
  const order = getOrder(orderId);
  if (!order) return null;

  const totalQty = order.lines.reduce((s, l) => s + l.qtyOrdered, 0);
  const pickedQty = order.lines.reduce((s, l) => s + l.qtyPicked, 0);
  const weight = order.lines.reduce((s, l) => s + l.qtyOrdered * l.weightKg, 0);
  const pct = Math.round((pickedQty / totalQty) * 100);

  return (
    <div className="space-y-4">
      <Link
        to="/wave-flow/orders"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="size-4" /> Back to orders
      </Link>

      <PageHeader
        title={order.id}
        description={`${order.customer} Â· ${order.salesOrder} Â· ${order.warehouse}`}
        breadcrumb={["Outbound", "Orders", order.id]}
        actions={
          <>
            <StatusBadge status={order.priority} />
            <StatusBadge status={order.status} />
            <Button
              variant="outline"
              onClick={() => toast.success("Delivery note sent to printer LP-04")}
            >
              <Printer className="size-4" /> Print
            </Button>
            <Button
              variant="outline"
              onClick={() => toast.info("Edit mode enabled for open lines")}
            >
              <Pencil className="size-4" /> Edit
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="text-danger">
                  <Ban className="size-4" /> Cancel order
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel {order.id}?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This releases {totalQty.toLocaleString()} reserved units back to available stock
                    and removes the order from wave {order.wave ?? "planning"}. Pick tasks already
                    in progress will be voided.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep order</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => toast.error(`${order.id} cancelled Â· inventory released`)}
                  >
                    Confirm cancellation
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          <SectionCard title="Order summary">
            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
              <Metric label="Sales order" value={order.salesOrder} />
              <Metric label="Customer code" value={order.customerCode} />
              <Metric label="Warehouse" value={order.warehouse} />
              <Metric label="Carrier" value={order.carrier} />
              <Metric label="Incoterm" value={order.incoterm} />
              <Metric label="Created" value={order.createdAt} />
              <Metric label="Delivery date" value={order.deliveryDate} />
              <Metric label="Dispatch window" value={order.dispatchWindow} />
              <Metric label="Total lines" value={order.lines.length} />
              <Metric label="Total units" value={totalQty.toLocaleString()} />
              <Metric label="Gross weight" value={`${weight.toFixed(1)} kg`} />
              <Metric label="Wave" value={order.wave ?? "Not assigned"} />
            </div>
            <div className="mt-4">
              <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
                <span>Fulfillment progress</span>
                <span className="num">
                  {pickedQty.toLocaleString()} / {totalQty.toLocaleString()} units Â· {pct}%
                </span>
              </div>
              <ProgressBar value={pct} tone={pct === 100 ? "success" : "primary"} />
            </div>
          </SectionCard>

          <Tabs defaultValue="lines">
            <TabsList>
              <TabsTrigger value="lines">Material lines</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="attachments">Attachments</TabsTrigger>
            </TabsList>
            <TabsContent value="lines" className="mt-3">
              <SectionCard bodyClassName="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px] text-sm">
                    <thead className="bg-surface-muted text-xs text-muted-foreground">
                      <tr>
                        {[
                          "#",
                          "Material",
                          "Description",
                          "Batch",
                          "Serial",
                          "Bin",
                          "Zone",
                          "Ordered",
                          "Picked",
                          "UoM",
                        ].map((h) => (
                          <th
                            key={h}
                            className="px-4 py-2.5 text-left font-medium whitespace-nowrap"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {order.lines.map((l) => (
                        <tr key={l.lineNo} className="hover:bg-muted/50">
                          <td className="num px-4 py-3 text-muted-foreground">{l.lineNo}</td>
                          <td className="num px-4 py-3 font-medium">{l.material}</td>
                          <td className="px-4 py-3">{l.description}</td>
                          <td className="num px-4 py-3 text-muted-foreground">{l.batch}</td>
                          <td className="num px-4 py-3 text-muted-foreground">
                            {l.serial ?? "â€”"}
                          </td>
                          <td className="num px-4 py-3">{l.bin}</td>
                          <td className="px-4 py-3 text-muted-foreground">{l.zone}</td>
                          <td className="num px-4 py-3">{l.qtyOrdered}</td>
                          <td className="num px-4 py-3">
                            <span
                              className={
                                l.qtyPicked === l.qtyOrdered ? "text-success-foreground" : ""
                              }
                            >
                              {l.qtyPicked}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{l.uom}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </SectionCard>
            </TabsContent>
            <TabsContent value="documents" className="mt-3">
              <SectionCard bodyClassName="p-0">
                <ul className="divide-y divide-border">
                  {order.documents.map((d) => (
                    <li key={d.name} className="flex items-center gap-3 px-4 py-3">
                      <FileText className="size-4 shrink-0 text-primary" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{d.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {d.type} Â· {d.size} Â· {d.date}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toast.success(`${d.name} downloaded`)}
                      >
                        Download
                      </Button>
                    </li>
                  ))}
                </ul>
              </SectionCard>
            </TabsContent>
            <TabsContent value="attachments" className="mt-3">
              <SectionCard>
                <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-10 text-center">
                  <Paperclip className="size-5 text-muted-foreground" />
                  <p className="text-sm font-medium">Drop customer artwork, MSDS or photos here</p>
                  <p className="text-xs text-muted-foreground">
                    PDF, PNG, JPG up to 25 MB Â· 2 files attached
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toast.success("2 attachments uploaded")}
                  >
                    Browse files
                  </Button>
                </div>
              </SectionCard>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-4">
          <SectionCard title="Ship-to & contact">
            <div className="space-y-3 text-sm">
              <p className="flex gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>{order.shippingAddress}</span>
              </p>
              <p className="flex gap-2">
                <User className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>{order.contact}</span>
              </p>
              <p className="flex gap-2">
                <Truck className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>
                  {order.carrier} Â· {order.incoterm}
                </span>
              </p>
              <p className="flex gap-2">
                <CalendarClock className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>
                  Deliver by {order.deliveryDate} Â· dispatch {order.dispatchWindow}
                </span>
              </p>
            </div>
          </SectionCard>

          <SectionCard title="Order timeline" description="End-to-end fulfillment status flow">
            <Timeline steps={order.timeline} />
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
