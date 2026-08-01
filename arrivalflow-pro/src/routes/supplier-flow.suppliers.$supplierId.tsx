import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import {
  Archive,
  Ban,
  Building2,
  CheckCircle2,
  Download,
  FileText,
  Mail,
  MapPin,
  Pencil,
  Phone,
  ShieldAlert,
  ShoppingCart,
  Star,
  Globe,
} from "lucide-react";
import { toast } from "sonner";
import { Radar, RadarChart, PolarAngleAxis, PolarGrid, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts";
import { EmptyState, Field, PageHeader, SectionCard, Timeline } from "@/apps/supplier-flow/components/page-parts";
import { StatusBadge } from "@/apps/supplier-flow/components/status-badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { asns, compactMoney, getSupplier, money, poTotal, purchaseOrders } from "@/apps/supplier-flow/data/procurement";

export const Route = createFileRoute("/supplier-flow/suppliers/$supplierId")({
  loader: ({ params }) => {
    if (!getSupplier(params.supplierId)) throw notFound();
    return null;
  },
  head: ({ params }) => {
    const s = getSupplier(params.supplierId);
    if (!s) return { meta: [{ title: "Supplier not found | AxisWMS" }, { name: "robots", content: "noindex" }] };
    return {
      meta: [
        { title: `${s.name} — Supplier Profile | AxisWMS` },
        { name: "description", content: `${s.name} (${s.code}) supplier profile: compliance, contracts, risk, audits and performance.` },
        { property: "og:title", content: `${s.name} — Supplier Profile | AxisWMS` },
        { property: "og:description", content: `${s.category} supplier in ${s.city}, ${s.country}. Rating ${s.rating}/5.` },
      ],
    };
  },
  component: SupplierDetail,
});

function SupplierDetail() {
  const { supplierId } = Route.useParams();
  const s = getSupplier(supplierId)!;
  const [approveOpen, setApproveOpen] = useState(false);
  const [blockOpen, setBlockOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [docOpen, setDocOpen] = useState<string | null>(null);
  const [comment, setComment] = useState("");

  const supplierPOs = purchaseOrders.filter((p) => p.supplierId === s.id);
  const supplierASNs = asns.filter((a) => a.supplierId === s.id);
  const radar = [
    { axis: "Financial", value: s.riskScores.financial },
    { axis: "Compliance", value: s.riskScores.compliance },
    { axis: "Operational", value: s.riskScores.operational },
    { axis: "Geographic", value: s.riskScores.geographic },
  ];

  return (
    <div className="mx-auto max-w-[1600px]">
      <PageHeader
        breadcrumbs={[{ label: "Home", to: "/supplier-flow" }, { label: "Supplier Master", to: "/supplier-flow/suppliers" }, { label: s.code }]}
        title={s.name}
        subtitle={`${s.companyName} · ${s.vendorType} · Onboarded ${s.onboardedOn}`}
        meta={
          <>
            <StatusBadge status={s.status} />
            <StatusBadge status={s.risk} />
            <span className="num inline-flex items-center gap-1 rounded-full border bg-muted px-2.5 py-0.5 text-xs font-medium">
              <Star className="size-3 text-warning" /> {s.rating.toFixed(1)} / 5
            </span>
            <span className="num rounded-full border bg-muted px-2.5 py-0.5 text-xs font-medium">{s.code}</span>
          </>
        }
        actions={
          <>
            {s.status === "Pending Approval" && (
              <Button onClick={() => setApproveOpen(true)}>
                <CheckCircle2 className="size-4" /> Approve supplier
              </Button>
            )}
            <Button variant="outline" asChild>
              <Link to="/supplier-flow/purchase-orders/new">
                <ShoppingCart className="size-4" /> Create PO
              </Link>
            </Button>
            <Button variant="outline" onClick={() => toast.info("Edit mode enabled", { description: "Changes require re-approval by the category head." })}>
              <Pencil className="size-4" /> Edit
            </Button>
            {s.status !== "Blocked" && (
              <Button variant="outline" className="text-destructive" onClick={() => setBlockOpen(true)}>
                <Ban className="size-4" /> Block
              </Button>
            )}
            <Button variant="ghost" onClick={() => setArchiveOpen(true)}>
              <Archive className="size-4" /> Archive
            </Button>
          </>
        }
      />

      {s.status === "Blocked" && (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-destructive/30 bg-danger-soft p-4">
          <ShieldAlert className="mt-0.5 size-5 shrink-0 text-destructive" />
          <div>
            <p className="text-sm font-semibold text-destructive">Supplier is blocked for new purchase orders</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Blocked on 21 May 2026 by Suresh Nambiar — defect rate of {s.defectRate}% breached the contractual 2% threshold.
              CAPA-2026-019 must be closed and a re-qualification audit passed before unblocking.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
        {[
          { l: "Spend YTD", v: compactMoney(s.spendYtd) },
          { l: "Open POs", v: s.openPOs },
          { l: "On-time delivery", v: `${s.onTimeDelivery}%` },
          { l: "Quality score", v: `${s.qualityScore}%` },
          { l: "Defect rate", v: `${s.defectRate}%` },
          { l: "Avg lead time", v: `${s.leadTimeDays} days` },
        ].map((k) => (
          <div key={k.l} className="card-elevate rounded-xl p-3.5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{k.l}</p>
            <p className="num mt-1.5 text-lg font-semibold">{k.v}</p>
          </div>
        ))}
      </div>

      <Tabs defaultValue="overview" className="mt-4">
        <TabsList className="flex w-full flex-wrap justify-start">
          {["overview", "contacts", "bank", "documents", "certifications", "contracts", "risk", "audits", "orders", "performance", "timeline"].map((t) => (
            <TabsTrigger key={t} value={t} className="text-xs capitalize">
              {t === "bank" ? "Bank & tax" : t === "orders" ? "Orders & ASN" : t}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="mt-4 grid gap-4 xl:grid-cols-3">
          <SectionCard title="Company information" className="xl:col-span-2">
            <dl className="grid gap-4 sm:grid-cols-3">
              <Field label="Supplier code" value={<span className="num">{s.code}</span>} />
              <Field label="Company name" value={s.companyName} />
              <Field label="Vendor type" value={s.vendorType} />
              <Field label="Category" value={s.category} />
              <Field label="Industry" value={s.industry} />
              <Field label="GSTIN" value={<span className="num">{s.gst}</span>} />
              <Field label="PAN" value={<span className="num">{s.pan}</span>} />
              <Field label="MSME / Udyam" value={<span className="num">{s.msme}</span>} />
              <Field label="Currency" value={s.currency} />
              <Field label="Payment terms" value={s.paymentTerms} />
              <Field label="Credit limit" value={money(s.creditLimit, s.currency)} />
              <Field label="Status" value={<StatusBadge status={s.status} />} />
            </dl>
          </SectionCard>

          <SectionCard title="Registered address & reach">
            <div className="space-y-3 text-sm">
              <p className="flex gap-2"><MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" /><span>{s.address}<br />{s.city}, {s.state} {s.pincode}<br />{s.country}</span></p>
              <p className="flex items-center gap-2"><Mail className="size-4 text-muted-foreground" /> {s.email}</p>
              <p className="flex items-center gap-2"><Phone className="size-4 text-muted-foreground" /> {s.phone}</p>
              <p className="flex items-center gap-2"><Globe className="size-4 text-muted-foreground" /> {s.website}</p>
              <p className="flex items-center gap-2"><Building2 className="size-4 text-muted-foreground" /> Plant codes: PUN-01, AHM-03</p>
            </div>
            <div className="mt-4 rounded-lg bg-muted/60 p-3">
              <p className="text-xs font-medium">Credit utilisation</p>
              <Progress value={Math.min(100, (s.spendYtd / s.creditLimit) * 100)} className="mt-2 h-2" />
              <p className="num mt-1.5 text-xs text-muted-foreground">
                {money(s.spendYtd, s.currency)} of {money(s.creditLimit, s.currency)} exposure
              </p>
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="contacts" className="mt-4">
          <SectionCard title="Supplier contacts" description="Primary and escalation contacts synced with the supplier portal">
            <div className="grid gap-3 md:grid-cols-2">
              {s.contacts.map((c) => (
                <div key={c.email} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">{c.name}</p>
                    {c.primary && <StatusBadge status="Primary" tone="info" dot={false} />}
                  </div>
                  <p className="text-xs text-muted-foreground">{c.designation}</p>
                  <p className="mt-2 text-sm">{c.email}</p>
                  <p className="num text-sm">{c.phone}</p>
                </div>
              ))}
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="bank" className="mt-4 grid gap-4 lg:grid-cols-2">
          <SectionCard title="Bank details" description="Penny-drop verified on onboarding">
            <dl className="grid gap-4 sm:grid-cols-2">
              <Field label="Bank name" value={s.bank.bankName} />
              <Field label="Account holder" value={s.bank.accountName} />
              <Field label="Account number" value={<span className="num">{s.bank.accountNumber}</span>} />
              <Field label="IFSC" value={<span className="num">{s.bank.ifsc}</span>} />
              <Field label="Branch" value={s.bank.branch} />
              <Field label="SWIFT / BIC" value={<span className="num">{s.bank.swift}</span>} />
            </dl>
          </SectionCard>
          <SectionCard title="Tax information">
            <dl className="grid gap-4 sm:grid-cols-2">
              <Field label="TDS section" value={s.taxInfo.tdsSection} />
              <Field label="TDS rate" value={s.taxInfo.tdsRate} />
              <Field label="GST regime" value={s.taxInfo.gstRegime} />
              <Field label="MSME registration" value={<span className="num">{s.taxInfo.msmeRegNo}</span>} />
            </dl>
          </SectionCard>
        </TabsContent>

        <TabsContent value="documents" className="mt-4">
          <SectionCard title="Document vault" description="Statutory, banking, quality and compliance attachments" bodyClassName="p-0">
            {s.documents.length === 0 ? (
              <EmptyState icon={FileText} title="No documents uploaded" description="Upload statutory documents to progress verification." />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Document</TableHead>
                      <TableHead className="hidden sm:table-cell">Type</TableHead>
                      <TableHead className="hidden md:table-cell">Uploaded</TableHead>
                      <TableHead className="hidden md:table-cell">Expires</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {s.documents.map((d) => (
                      <TableRow key={d.id}>
                        <TableCell className="text-sm font-medium">{d.name}<span className="block text-xs text-muted-foreground">{d.size}</span></TableCell>
                        <TableCell className="hidden sm:table-cell text-sm">{d.type}</TableCell>
                        <TableCell className="hidden md:table-cell text-sm">{d.uploadedOn}</TableCell>
                        <TableCell className="hidden md:table-cell text-sm">{d.expiresOn ?? "—"}</TableCell>
                        <TableCell><StatusBadge status={d.status} /></TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="ghost" onClick={() => setDocOpen(d.name)}>Preview</Button>
                          <Button size="sm" variant="ghost" onClick={() => toast.success(`${d.name} downloaded`)}><Download className="size-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </SectionCard>
        </TabsContent>

        <TabsContent value="certifications" className="mt-4">
          <SectionCard title="Certifications" description="Quality, environmental and product compliance certificates">
            {s.certifications.length === 0 ? (
              <EmptyState icon={FileText} title="No certifications on record" description="Request certificates from the supplier through the portal." />
            ) : (
              <div className="grid gap-3 md:grid-cols-3">
                {s.certifications.map((c) => (
                  <div key={c.name} className="rounded-lg border p-4">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold">{c.name}</p>
                      <StatusBadge status={c.status} />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{c.body}</p>
                    <p className="num mt-2 text-xs">Valid till {c.validTill}</p>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </TabsContent>

        <TabsContent value="contracts" className="mt-4">
          <SectionCard title="Contracts & agreements" bodyClassName="p-0">
            {s.contracts.length === 0 ? (
              <EmptyState icon={FileText} title="No active contracts" description="This supplier transacts on spot purchase orders only." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Contract</TableHead>
                    <TableHead className="hidden sm:table-cell">Period</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {s.contracts.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell><p className="text-sm font-medium">{c.title}</p><p className="num text-xs text-muted-foreground">{c.id}</p></TableCell>
                      <TableCell className="hidden sm:table-cell num text-sm">{c.start} – {c.end}</TableCell>
                      <TableCell className="num text-right text-sm font-medium">{compactMoney(c.value)}</TableCell>
                      <TableCell><StatusBadge status={c.status} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </SectionCard>
        </TabsContent>

        <TabsContent value="risk" className="mt-4 grid gap-4 lg:grid-cols-2">
          <SectionCard title="Risk assessment" description="Composite score refreshed monthly from finance, compliance and delivery signals">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radar} outerRadius="72%">
                  <PolarGrid stroke="var(--border)" />
                  <PolarAngleAxis dataKey="axis" fontSize={12} stroke="var(--muted-foreground)" />
                  <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid var(--border)", background: "var(--popover)", fontSize: 12 }} />
                  <Radar dataKey="value" name="Score" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.25} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>
          <SectionCard title="Risk factors">
            <div className="space-y-4">
              {radar.map((r) => (
                <div key={r.axis}>
                  <div className="flex items-center justify-between text-sm">
                    <span>{r.axis} health</span>
                    <span className="num font-medium">{r.value}/100</span>
                  </div>
                  <Progress value={r.value} className="mt-1.5 h-2" />
                </div>
              ))}
              <div className="rounded-lg border bg-muted/40 p-3 text-xs text-muted-foreground">
                Overall risk classification: <span className="font-semibold text-foreground">{s.risk}</span>. Next review scheduled 30 Sep 2026.
              </div>
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="audits" className="mt-4">
          <SectionCard title="Audit history" bodyClassName="p-0">
            {s.audits.length === 0 ? (
              <EmptyState icon={FileText} title="No audits recorded" description="Schedule the first vendor audit from the quality module." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Audit</TableHead>
                    <TableHead className="hidden sm:table-cell">Auditor</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                    <TableHead className="hidden sm:table-cell text-right">Findings</TableHead>
                    <TableHead>Result</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {s.audits.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell><p className="text-sm font-medium">{a.type}</p><p className="num text-xs text-muted-foreground">{a.id} · {a.date}</p></TableCell>
                      <TableCell className="hidden sm:table-cell text-sm">{a.auditor}</TableCell>
                      <TableCell className="num text-right text-sm font-medium">{a.score}/100</TableCell>
                      <TableCell className="num hidden sm:table-cell text-right text-sm">{a.findings}</TableCell>
                      <TableCell><StatusBadge status={a.result} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </SectionCard>
        </TabsContent>

        <TabsContent value="orders" className="mt-4 grid gap-4 xl:grid-cols-2">
          <SectionCard title="Purchase orders" bodyClassName="p-0">
            {supplierPOs.length === 0 ? (
              <EmptyState icon={ShoppingCart} title="No purchase orders" description="No orders have been raised on this supplier yet." />
            ) : (
              <div className="divide-y">
                {supplierPOs.map((p) => (
                  <Link key={p.id} to="/supplier-flow/purchase-orders/$poId" params={{ poId: p.id }} className="flex items-center gap-3 px-4 py-3 hover:bg-accent/60">
                    <div className="min-w-0 flex-1">
                      <p className="num text-sm font-semibold">{p.id}</p>
                      <p className="truncate text-xs text-muted-foreground">{p.warehouse} · Due {p.expectedDelivery}</p>
                    </div>
                    <span className="num text-sm font-medium">{compactMoney(poTotal(p), p.currency)}</span>
                    <StatusBadge status={p.status} />
                  </Link>
                ))}
              </div>
            )}
          </SectionCard>
          <SectionCard title="Shipments (ASN)" bodyClassName="p-0">
            {supplierASNs.length === 0 ? (
              <EmptyState icon={FileText} title="No shipments" description="Advance shipment notices will appear here once created." />
            ) : (
              <div className="divide-y">
                {supplierASNs.map((a) => (
                  <Link key={a.id} to="/supplier-flow/asn/$asnId" params={{ asnId: a.id }} className="flex items-center gap-3 px-4 py-3 hover:bg-accent/60">
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

        <TabsContent value="performance" className="mt-4">
          <SectionCard title="Performance snapshot" actions={<Button variant="outline" size="sm" asChild><Link to="/supplier-flow/vendor-performance/$supplierId" params={{ supplierId: s.id }}>Full scorecard</Link></Button>}>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { l: "On-time delivery", v: s.onTimeDelivery, t: "%" },
                { l: "Quality acceptance", v: s.qualityScore, t: "%" },
                { l: "Defect rate", v: s.defectRate, t: "%" },
                { l: "Lead time adherence", v: 100 - s.defectRate * 4, t: "%" },
              ].map((m) => (
                <div key={m.l} className="rounded-lg border p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">{m.l}</p>
                  <p className="num mt-1 text-xl font-semibold">{m.v.toFixed(1)}{m.t}</p>
                  <Progress value={Math.min(100, m.v)} className="mt-2 h-1.5" />
                </div>
              ))}
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="timeline" className="mt-4">
          <SectionCard title="Supplier timeline" description="Full lifecycle audit trail">
            <Timeline events={s.timeline} />
          </SectionCard>
        </TabsContent>
      </Tabs>

      <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve {s.name}?</DialogTitle>
            <DialogDescription>The supplier will be activated and a vendor code released to the ERP.</DialogDescription>
          </DialogHeader>
          <Textarea placeholder="Approval comment (optional)" value={comment} onChange={(e) => setComment(e.target.value)} rows={3} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveOpen(false)}>Cancel</Button>
            <Button onClick={() => { setApproveOpen(false); toast.success("Supplier approved", { description: `${s.name} is now active for purchasing.` }); }}>
              <CheckCircle2 className="size-4" /> Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={blockOpen} onOpenChange={setBlockOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Block {s.name}?</DialogTitle>
            <DialogDescription>New purchase orders will be prevented. Open orders remain unaffected.</DialogDescription>
          </DialogHeader>
          <Textarea placeholder="Reason for blocking (mandatory)" rows={3} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setBlockOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => { setBlockOpen(false); toast.warning("Supplier blocked", { description: "Category head and finance have been notified." }); }}>
              <Ban className="size-4" /> Block supplier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={archiveOpen} onOpenChange={setArchiveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Archive supplier record?</DialogTitle>
            <DialogDescription>
              Archiving removes the supplier from active lists while retaining seven years of transactional history for audit.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setArchiveOpen(false)}>Cancel</Button>
            <Button onClick={() => { setArchiveOpen(false); toast.success("Supplier archived"); }}>Archive</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Sheet open={!!docOpen} onOpenChange={(v) => !v && setDocOpen(null)}>
        <SheetContent className="w-full sm:max-w-xl">
          <SheetHeader>
            <SheetTitle className="truncate">{docOpen}</SheetTitle>
            <SheetDescription>Document preview · verified by compliance desk</SheetDescription>
          </SheetHeader>
          <div className="m-4 flex-1 rounded-lg border bg-muted/40 p-6">
            <div className="mx-auto max-w-sm space-y-3 rounded-md bg-card p-6 shadow-sm">
              <div className="h-3 w-1/2 rounded bg-muted" />
              <div className="h-2 w-full rounded bg-muted" />
              <div className="h-2 w-5/6 rounded bg-muted" />
              <div className="h-24 w-full rounded bg-muted/70" />
              <div className="h-2 w-2/3 rounded bg-muted" />
              <p className="pt-2 text-center text-xs text-muted-foreground">Page 1 of 2 · {s.code}</p>
            </div>
          </div>
          <div className="flex gap-2 px-4 pb-4">
            <Button variant="outline" className="flex-1" onClick={() => toast.success("Download started")}>
              <Download className="size-4" /> Download
            </Button>
            <Button className="flex-1" onClick={() => { setDocOpen(null); toast.success("Document marked verified"); }}>
              Mark verified
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
