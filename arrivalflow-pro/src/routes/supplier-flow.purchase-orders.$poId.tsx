import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import {
  Ban,
  CheckCircle2,
  Copy,
  Download,
  FileText,
  Mail,
  Printer,
  Send,
  Truck,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Field, PageHeader, SectionCard, Timeline } from "@/apps/supplier-flow/components/page-parts";
import { StatusBadge } from "@/apps/supplier-flow/components/status-badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  asns,
  getPO,
  lineNet,
  lineTax,
  lineTotal,
  money,
  poNet,
  poTax,
  poTotal,
} from "@/apps/supplier-flow/data/procurement";

export const Route = createFileRoute("/supplier-flow/purchase-orders/$poId")({
  loader: ({ params }) => {
    if (!getPO(params.poId)) throw notFound();
    return null;
  },
  head: ({ params }) => {
    const po = getPO(params.poId);
    if (!po) return { meta: [{ title: "Purchase order not found | AxisWMS" }, { name: "robots", content: "noindex" }] };
    return {
      meta: [
        { title: `${po.id} — Purchase Order | AxisWMS` },
        { name: "description", content: `Purchase order ${po.id} for ${po.supplier}, delivering to ${po.warehouse}.` },
        { property: "og:title", content: `${po.id} — Purchase Order | AxisWMS` },
        { property: "og:description", content: `${po.items.length} line items · ${po.status} · due ${po.expectedDelivery}.` },
      ],
    };
  },
  component: PODetail,
});

function PODetail() {
  const { poId } = Route.useParams();
  const po = getPO(poId)!;
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cloneOpen, setCloneOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [printOpen, setPrintOpen] = useState(false);
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);

  const linked = asns.filter((a) => a.poId === po.id);
  const budgetUsedPct = Math.min(100, (poTotal(po) / (po.budgetAvailable + poTotal(po))) * 100);
  const receivedPct =
    (po.items.reduce((s, i) => s + (i.received ?? 0), 0) / po.items.reduce((s, i) => s + i.qty, 0)) * 100;

  return (
    <div className="mx-auto max-w-[1600px]">
      <PageHeader
        breadcrumbs={[{ label: "Home", to: "/supplier-flow" }, { label: "Purchase Orders", to: "/supplier-flow/purchase-orders" }, { label: po.id }]}
        title={po.id}
        subtitle={`${po.supplier} · ${po.warehouse} · Buyer ${po.buyer}`}
        meta={
          <>
            <StatusBadge status={po.status} />
            <StatusBadge status={po.priority} />
            <span className="num rounded-full border bg-muted px-2.5 py-0.5 text-xs font-medium">{po.currency}</span>
            <span className="num rounded-full border bg-muted px-2.5 py-0.5 text-xs font-medium">
              {money(poTotal(po), po.currency)}
            </span>
          </>
        }
        actions={
          <>
            {po.status === "Pending Approval" && (
              <>
                <Button onClick={() => setApproveOpen(true)}><CheckCircle2 className="size-4" /> Approve</Button>
                <Button variant="outline" className="text-destructive" onClick={() => setRejectOpen(true)}><XCircle className="size-4" /> Reject</Button>
              </>
            )}
            {po.status === "Approved" && (
              <Button onClick={() => toast.success("PO despatched to supplier", { description: "Portal notification and email sent." })}>
                <Send className="size-4" /> Send to supplier
              </Button>
            )}
            <Button variant="outline" onClick={() => setPrintOpen(true)}><Printer className="size-4" /> Print</Button>
            <Button variant="outline" onClick={() => toast.success("PDF generated", { description: `${po.id}.pdf downloaded.` })}><Download className="size-4" /> PDF</Button>
            <Button variant="outline" onClick={() => setEmailOpen(true)}><Mail className="size-4" /> Email</Button>
            <Button variant="outline" onClick={() => setCloneOpen(true)}><Copy className="size-4" /> Clone</Button>
            {!["Cancelled", "Closed"].includes(po.status) && (
              <Button variant="ghost" className="text-destructive" onClick={() => setCancelOpen(true)}><Ban className="size-4" /> Cancel</Button>
            )}
          </>
        }
      />

      {po.status === "Draft" && (
        <div className="mb-4 rounded-xl border border-warning/40 bg-warning-soft p-4 text-sm">
          <p className="font-semibold text-warning-foreground">Submission blocked by validation</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Supplier {po.supplier} is not yet approved in the supplier master. Complete supplier approval before submitting this order.
          </p>
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-4">
        <div className="space-y-4 xl:col-span-3">
          <SectionCard title="Order header">
            <dl className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
              <Field label="PO number" value={<span className="num">{po.id}</span>} />
              <Field label="Supplier" value={<Link className="text-primary hover:underline" to="/supplier-flow/suppliers/$supplierId" params={{ supplierId: po.supplierId }}>{po.supplier}</Link>} />
              <Field label="Warehouse" value={po.warehouse} />
              <Field label="Buyer" value={po.buyer} />
              <Field label="Created on" value={po.createdOn} />
              <Field label="Expected delivery" value={po.expectedDelivery} />
              <Field label="Payment terms" value={po.paymentTerms} />
              <Field label="Incoterm" value={po.incoterm} />
              <Field label="Cost centre" value={po.costCenter} />
              <Field label="Budget code" value={po.budgetCode} />
              <Field label="Currency" value={po.currency} />
              <Field label="Priority" value={<StatusBadge status={po.priority} />} />
            </dl>
            {po.remarks && (
              <div className="mt-4 rounded-lg bg-muted/50 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Remarks</p>
                <p className="mt-1 text-sm">{po.remarks}</p>
              </div>
            )}
          </SectionCard>

          <Tabs defaultValue="items">
            <TabsList className="flex-wrap">
              {["items", "approvals", "shipments", "revisions", "attachments", "terms", "timeline"].map((t) => (
                <TabsTrigger key={t} value={t} className="text-xs capitalize">{t}</TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="items" className="mt-4">
              <SectionCard title="Line items" description="Rates net of discount; GST applied per HSN classification" bodyClassName="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-10">#</TableHead>
                        <TableHead>Material</TableHead>
                        <TableHead className="hidden md:table-cell">HSN</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="hidden sm:table-cell">UOM</TableHead>
                        <TableHead className="text-right">Unit price</TableHead>
                        <TableHead className="hidden lg:table-cell text-right">Disc %</TableHead>
                        <TableHead className="hidden lg:table-cell text-right">Tax</TableHead>
                        <TableHead className="text-right">Line total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {po.items.map((i, idx) => (
                        <TableRow key={i.id}>
                          <TableCell className="num text-xs text-muted-foreground">{idx + 1}</TableCell>
                          <TableCell>
                            <p className="text-sm font-medium">{i.description}</p>
                            <p className="num text-xs text-muted-foreground">
                              {i.material}
                              {i.received !== undefined && ` · received ${i.received}/${i.qty}`}
                            </p>
                          </TableCell>
                          <TableCell className="num hidden md:table-cell text-sm">{i.hsn}</TableCell>
                          <TableCell className="num text-right text-sm">{i.qty.toLocaleString("en-IN")}</TableCell>
                          <TableCell className="hidden sm:table-cell text-sm">{i.uom}</TableCell>
                          <TableCell className="num text-right text-sm">{money(i.unitPrice, po.currency)}</TableCell>
                          <TableCell className="num hidden lg:table-cell text-right text-sm">{i.discountPct}%</TableCell>
                          <TableCell className="num hidden lg:table-cell text-right text-sm">{money(lineTax(i), po.currency)} <span className="text-xs text-muted-foreground">({i.taxPct}%)</span></TableCell>
                          <TableCell className="num text-right text-sm font-semibold">{money(lineTotal(i), po.currency)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="flex justify-end border-t bg-muted/30 px-4 py-3">
                  <dl className="w-full max-w-xs space-y-1.5 text-sm">
                    <div className="flex justify-between"><dt className="text-muted-foreground">Gross value</dt><dd className="num">{money(po.items.reduce((s, i) => s + i.qty * i.unitPrice, 0), po.currency)}</dd></div>
                    <div className="flex justify-between"><dt className="text-muted-foreground">Discount</dt><dd className="num text-destructive">− {money(po.items.reduce((s, i) => s + i.qty * i.unitPrice - lineNet(i), 0), po.currency)}</dd></div>
                    <div className="flex justify-between"><dt className="text-muted-foreground">Net value</dt><dd className="num">{money(poNet(po), po.currency)}</dd></div>
                    <div className="flex justify-between"><dt className="text-muted-foreground">GST / IGST</dt><dd className="num">{money(poTax(po), po.currency)}</dd></div>
                    <div className="flex justify-between border-t pt-1.5 text-base font-semibold"><dt>Order total</dt><dd className="num">{money(poTotal(po), po.currency)}</dd></div>
                  </dl>
                </div>
              </SectionCard>
            </TabsContent>

            <TabsContent value="approvals" className="mt-4">
              <SectionCard title="Approval workflow" description="Routed via approval matrix based on order value band">
                <ol className="space-y-3">
                  {po.approvals.map((a, i) => (
                    <li key={a.level} className="flex flex-wrap items-center gap-3 rounded-lg border p-3">
                      <span className="num flex size-8 items-center justify-center rounded-full bg-muted text-xs font-semibold">L{i + 1}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{a.role} — {a.approver}</p>
                        <p className="text-xs text-muted-foreground">{a.on ?? (a.status === "Pending" ? "Awaiting action · SLA 48 hrs" : "Not yet triggered")}</p>
                        {a.comment && <p className="mt-1 rounded bg-muted/60 px-2 py-1 text-xs">{a.comment}</p>}
                      </div>
                      <StatusBadge status={a.status} />
                    </li>
                  ))}
                </ol>
                {po.status === "Pending Approval" && (
                  <div className="mt-4 flex flex-wrap gap-2 border-t pt-4">
                    <Button onClick={() => setApproveOpen(true)}><CheckCircle2 className="size-4" /> Approve as Finance Controller</Button>
                    <Button variant="outline" className="text-destructive" onClick={() => setRejectOpen(true)}>Reject</Button>
                    <Button variant="ghost" onClick={() => toast.info("Escalated to Director — Operations")}>Escalate</Button>
                  </div>
                )}
              </SectionCard>
            </TabsContent>

            <TabsContent value="shipments" className="mt-4">
              <SectionCard title="Linked shipments" bodyClassName="p-0">
                {linked.length === 0 ? (
                  <div className="px-4 py-10 text-center text-sm text-muted-foreground">No ASN has been raised against this order yet.</div>
                ) : (
                  <div className="divide-y">
                    {linked.map((a) => (
                      <Link key={a.id} to="/supplier-flow/asn/$asnId" params={{ asnId: a.id }} className="flex items-center gap-3 px-4 py-3 hover:bg-accent/60">
                        <Truck className="size-4 text-muted-foreground" />
                        <div className="min-w-0 flex-1">
                          <p className="num text-sm font-semibold">{a.id}</p>
                          <p className="truncate text-xs text-muted-foreground">{a.vehicleNo} · ETA {a.expectedArrival}</p>
                        </div>
                        <StatusBadge status={a.status} />
                      </Link>
                    ))}
                  </div>
                )}
              </SectionCard>
            </TabsContent>

            <TabsContent value="revisions" className="mt-4">
              <SectionCard title="Revision history" bodyClassName="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Revision</TableHead>
                      <TableHead className="hidden sm:table-cell">Date</TableHead>
                      <TableHead className="hidden sm:table-cell">Changed by</TableHead>
                      <TableHead>Change</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {po.revisions.map((r) => (
                      <TableRow key={r.rev}>
                        <TableCell className="num text-sm font-medium">{r.rev}</TableCell>
                        <TableCell className="num hidden sm:table-cell text-sm">{r.date}</TableCell>
                        <TableCell className="hidden sm:table-cell text-sm">{r.by}</TableCell>
                        <TableCell className="text-sm">{r.change}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </SectionCard>
            </TabsContent>

            <TabsContent value="attachments" className="mt-4">
              <SectionCard title="Attachments" bodyClassName="p-0">
                {po.attachments.length === 0 ? (
                  <div className="px-4 py-10 text-center text-sm text-muted-foreground">No attachments on this order.</div>
                ) : (
                  <div className="divide-y">
                    {po.attachments.map((a) => (
                      <div key={a.name} className="flex items-center gap-3 px-4 py-3">
                        <FileText className="size-4 text-muted-foreground" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{a.name}</p>
                          <p className="text-xs text-muted-foreground">{a.type} · {a.size}</p>
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => toast.success("Download started")}><Download className="size-4" /></Button>
                      </div>
                    ))}
                  </div>
                )}
              </SectionCard>
            </TabsContent>

            <TabsContent value="terms" className="mt-4">
              <SectionCard title="Terms & conditions">
                <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
                  <li>Delivery must strictly comply with the schedule; liquidated damages of 0.5% per week apply up to 5% of order value.</li>
                  <li>Material shall conform to drawings and specifications referenced in the attachments; rejected material is to be lifted within 7 days at supplier cost.</li>
                  <li>Advance shipment notice with invoice, packing list, e-way bill and test certificates is mandatory before despatch.</li>
                  <li>Payment as per agreed terms, calculated from the date of goods receipt note and successful three-way match.</li>
                  <li>Supplier shall maintain valid statutory registrations and provide MSME declarations where applicable.</li>
                  <li>Buyer reserves the right to inspect at supplier premises with 48 hours notice.</li>
                  <li>Jurisdiction: courts of Pune, Maharashtra. Force majeure per ICC 2020 clause.</li>
                </ol>
              </SectionCard>
            </TabsContent>

            <TabsContent value="timeline" className="mt-4">
              <SectionCard title="Order timeline"><Timeline events={po.timeline} /></SectionCard>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-4">
          <SectionCard title="Budget validation">
            <p className="text-xs text-muted-foreground">Budget code {po.budgetCode}</p>
            <Progress value={budgetUsedPct} className="mt-3 h-2" />
            <dl className="mt-3 space-y-1.5 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">This order</dt><dd className="num">{money(poTotal(po), po.currency)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Available after commit</dt><dd className="num">{money(po.budgetAvailable)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Consumption</dt><dd className="num">{budgetUsedPct.toFixed(1)}%</dd></div>
            </dl>
            <p className="mt-3 rounded-md bg-success-soft px-3 py-2 text-xs text-success-foreground">
              Budget check passed — funds committed at submission.
            </p>
          </SectionCard>

          {!Number.isNaN(receivedPct) && receivedPct > 0 && (
            <SectionCard title="Receipt progress">
              <Progress value={receivedPct} className="h-2" />
              <p className="num mt-2 text-sm font-medium">{receivedPct.toFixed(0)}% received</p>
              <p className="mt-1 text-xs text-muted-foreground">GRN documents are posted by the receiving warehouse after gate entry and quality inspection.</p>
            </SectionCard>
          )}

          <SectionCard title="Tax summary">
            <dl className="space-y-1.5 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Taxable value</dt><dd className="num">{money(poNet(po), po.currency)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">CGST 9%</dt><dd className="num">{money(poTax(po) / 2, po.currency)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">SGST 9%</dt><dd className="num">{money(poTax(po) / 2, po.currency)}</dd></div>
              <div className="flex justify-between border-t pt-1.5 font-semibold"><dt>Total tax</dt><dd className="num">{money(poTax(po), po.currency)}</dd></div>
            </dl>
          </SectionCard>

          <SectionCard title="Quick actions">
            <div className="grid gap-2">
              <Button variant="outline" size="sm" asChild><Link to="/supplier-flow/asn/new">Create ASN</Link></Button>
              <Button variant="outline" size="sm" asChild><Link to="/supplier-flow/approvals/$poId" params={{ poId: po.id }}>Open approval workflow</Link></Button>
              <Button variant="outline" size="sm" onClick={() => toast.success("Reminder sent to supplier")}>Send delivery reminder</Button>
              <Button variant="outline" size="sm" onClick={() => toast.success("Order closed", { description: "Remaining quantity short-closed." })}>Close order</Button>
            </div>
          </SectionCard>
        </div>
      </div>

      <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve {po.id}?</DialogTitle>
            <DialogDescription>Approving commits {money(poTotal(po), po.currency)} against {po.budgetCode} and advances the workflow.</DialogDescription>
          </DialogHeader>
          <Textarea rows={3} placeholder="Approval comment (visible in audit trail)" />
          <div className="rounded-md border p-3 text-xs text-muted-foreground">
            Digital signature: <span className="font-medium text-foreground">Priya Venkatesh · Finance Controller</span> · signed with enterprise PKI token
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveOpen(false)}>Cancel</Button>
            <Button onClick={() => { setApproveOpen(false); toast.success("Purchase order approved", { description: `${po.id} routed to Director — Operations.` }); }}>Sign & approve</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject {po.id}?</DialogTitle>
            <DialogDescription>The order returns to the buyer as a draft with your comments.</DialogDescription>
          </DialogHeader>
          <Textarea rows={3} placeholder="Reason for rejection (mandatory)" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => { setRejectOpen(false); toast.error("Purchase order rejected", { description: "Buyer Ananya Gupta has been notified." }); }}>Reject order</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel {po.id}?</DialogTitle>
            <DialogDescription>Committed budget will be released. This action is recorded in the audit trail.</DialogDescription>
          </DialogHeader>
          <Textarea rows={3} placeholder="Cancellation reason" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelOpen(false)}>Keep order</Button>
            <Button variant="destructive" onClick={() => { setCancelOpen(false); toast.warning("Purchase order cancelled"); }}>Cancel order</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={cloneOpen} onOpenChange={setCloneOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clone purchase order</DialogTitle>
            <DialogDescription>A new draft will be created with the same supplier, lines and terms.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCloneOpen(false)}>Cancel</Button>
            <Button onClick={() => { setCloneOpen(false); toast.success("Draft PO-2026-004941 created"); }}>Clone order</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={emailOpen} onOpenChange={setEmailOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Email purchase order to supplier</DialogTitle>
            <DialogDescription>The PDF and terms will be attached automatically.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 text-sm">
            <p><span className="text-muted-foreground">To:</span> procurement@{po.supplier.toLowerCase().replace(/[^a-z]/g, "").slice(0, 12)}.com</p>
            <p><span className="text-muted-foreground">Subject:</span> {po.id} — Purchase Order from Axis Industries</p>
            <Textarea rows={4} defaultValue={`Dear Partner,\n\nPlease find attached purchase order ${po.id} dated ${po.createdOn} with a delivery commitment of ${po.expectedDelivery}. Kindly acknowledge within 48 hours through the supplier portal.\n\nRegards,\n${po.buyer}`} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailOpen(false)}>Cancel</Button>
            <Button onClick={() => { setEmailOpen(false); toast.success("Email sent to supplier"); }}><Mail className="size-4" /> Send email</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Sheet open={printOpen} onOpenChange={setPrintOpen}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>Print preview — {po.id}</SheetTitle>
            <SheetDescription>A4 portrait · Axis Industries standard PO template v6</SheetDescription>
          </SheetHeader>
          <div className="m-4 rounded-lg border bg-card p-6 text-sm">
            <div className="flex items-start justify-between border-b pb-4">
              <div>
                <p className="text-base font-bold">AXIS INDUSTRIES LIMITED</p>
                <p className="text-xs text-muted-foreground">Gat No. 220, Chakan MIDC, Pune 410501 · GSTIN 27AAACA1234F1ZV</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">PURCHASE ORDER</p>
                <p className="num text-xs">{po.id} · {po.createdOn}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 border-b py-4 text-xs">
              <div>
                <p className="font-semibold">Supplier</p>
                <p>{po.supplier}</p>
              </div>
              <div>
                <p className="font-semibold">Deliver to</p>
                <p>{po.warehouse}</p>
              </div>
            </div>
            <table className="mt-4 w-full text-xs">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-1">#</th><th>Description</th><th className="text-right">Qty</th><th className="text-right">Rate</th><th className="text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {po.items.map((i, idx) => (
                  <tr key={i.id} className="border-b">
                    <td className="py-1">{idx + 1}</td>
                    <td>{i.description}</td>
                    <td className="num text-right">{i.qty}</td>
                    <td className="num text-right">{money(i.unitPrice, po.currency)}</td>
                    <td className="num text-right">{money(lineNet(i), po.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="num mt-3 text-right font-semibold">Total incl. tax: {money(poTotal(po), po.currency)}</p>
            <p className="mt-6 text-xs text-muted-foreground">Digitally approved — signature on file. This is a computer-generated document.</p>
          </div>
          <div className="flex gap-2 px-4 pb-4">
            <Button variant="outline" className="flex-1" onClick={() => setPrintOpen(false)}>Close</Button>
            <Button className="flex-1" onClick={() => toast.success("Sent to printer HP-PUN-FIN-02")}><Printer className="size-4" /> Print</Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
