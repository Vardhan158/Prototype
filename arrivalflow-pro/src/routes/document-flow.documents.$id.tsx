import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  Download,
  Share2,
  Archive,
  ScanText,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Columns2,
  StickyNote,
  History,
  ShieldAlert,
  Link2,
  Trash2,
  RotateCcw,
  Mail,
  Copy,
  CheckCircle2,
  GitCompare,
  FileText,
} from "lucide-react";
import { AppShell } from "@/apps/document-flow/components/wms/AppShell";
import { SectionCard, StatusChip, ConfidenceMeter } from "@/apps/document-flow/components/wms/primitives";
import { DocumentPaper } from "@/apps/document-flow/components/wms/DocumentPaper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { auditTrail, documents, versions } from "@/apps/document-flow/wms-data";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/document-flow/documents/$id")({
  validateSearch: (s: Record<string, unknown>) => ({
    tab: typeof s["tab"] === "string" ? (s["tab"] as string) : "preview",
  }),
  head: ({ params }) => ({
    meta: [
      { title: `${params.id} — Document Details | Axion WMS` },
      { name: "description", content: `Metadata, OCR status, versions, audit trail and linked records for document ${params.id}.` },
      { property: "og:title", content: `${params.id} — Document Details | Axion WMS` },
      { property: "og:description", content: `Metadata, OCR status, versions, audit trail and linked records for document ${params.id}.` },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DocumentDetails,
});

function DocumentDetails() {
  const { id } = Route.useParams();
  const { tab } = Route.useSearch();
  const navigate = useNavigate();
  const doc = documents.find((d) => d.id === id) ?? documents[0]!;

  const [zoom, setZoom] = useState(100);
  const [rotate, setRotate] = useState(0);
  const [page, setPage] = useState(1);
  const [split, setSplit] = useState(false);
  const [notes, setNotes] = useState(false);
  const [share, setShare] = useState(false);
  const [archive, setArchive] = useState(false);
  const [compare, setCompare] = useState(false);
  const [archived, setArchived] = useState(false);
  const [reason, setReason] = useState("Retention policy – closed GRN cycle");

  return (
    <AppShell
      title={doc.type + " · " + doc.id}
      subtitle={doc.name}
      breadcrumb={[
        { label: "Home", to: "/document-flow" },
        { label: "Document Management", to: "/document-flow/documents" },
        { label: "Library", to: "/document-flow/documents/library" },
        { label: doc.id },
      ]}
      actions={
        <>
          <Button variant="outline" className="rounded-xl" onClick={() => toast.success(`Downloading ${doc.id}.pdf`)}>
            <Download className="mr-2 size-4" /> Download
          </Button>
          <Button variant="outline" className="rounded-xl" onClick={() => setShare(true)}>
            <Share2 className="mr-2 size-4" /> Share
          </Button>
          <Button variant="outline" className="rounded-xl" onClick={() => setArchive(true)}>
            <Archive className="mr-2 size-4" /> Archive
          </Button>
          <Button className="rounded-xl" asChild>
            <Link to="/document-flow/ocr/$id" params={{ id: doc.id }}>
              <ScanText className="mr-2 size-4" /> Open OCR
            </Link>
          </Button>
        </>
      }
    >
      {archived && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-warning/40 bg-warning-soft px-4 py-3">
          <Archive className="size-5 text-warning" />
          <p className="text-sm font-medium">
            This document is archived. Reason: {reason}
          </p>
          <Button size="sm" variant="outline" className="ml-auto rounded-lg" onClick={() => { setArchived(false); toast.success("Document restored to active library"); }}>
            <RotateCcw className="mr-1.5 size-4" /> Restore
          </Button>
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <StatusChip status={archived ? "Archived" : doc.status} />
        <ConfidenceMeter value={doc.confidence} />
        <span className="text-xs text-muted-foreground">
          {doc.pages} pages · {doc.sizeMb} MB · uploaded {doc.uploadedAt} by {doc.uploadedBy}
        </span>
        <div className="ml-auto flex flex-wrap gap-1.5">
          {doc.tags.map((t) => (
            <span key={t} className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium text-secondary-foreground">
              #{t}
            </span>
          ))}
        </div>
      </div>

      <Tabs value={tab} onValueChange={(v) => navigate({ to: "/document-flow/documents/$id", params: { id }, search: { tab: v } })}>
        <TabsList className="rounded-xl">
          <TabsTrigger value="preview" className="rounded-lg">Preview</TabsTrigger>
          <TabsTrigger value="details" className="rounded-lg">Details</TabsTrigger>
          <TabsTrigger value="linked" className="rounded-lg">Linked records</TabsTrigger>
          <TabsTrigger value="versions" className="rounded-lg">Version history</TabsTrigger>
          <TabsTrigger value="audit" className="rounded-lg">Audit trail</TabsTrigger>
        </TabsList>

        <TabsContent value="preview" className="mt-4">
          <div className="surface-card overflow-hidden">
            <div className="flex flex-wrap items-center gap-1.5 border-b px-4 py-2.5">
              <Button variant="ghost" size="icon" onClick={() => setZoom((z) => Math.max(50, z - 10))}><ZoomOut className="size-4" /></Button>
              <span className="w-12 text-center text-xs font-semibold tabular-nums">{zoom}%</span>
              <Button variant="ghost" size="icon" onClick={() => setZoom((z) => Math.min(200, z + 10))}><ZoomIn className="size-4" /></Button>
              <span className="mx-1 h-5 w-px bg-border" />
              <Button variant="ghost" size="icon" onClick={() => setRotate((r) => r + 90)}><RotateCw className="size-4" /></Button>
              <Button variant="ghost" size="icon" onClick={() => toast("Fullscreen viewer opened")}><Maximize2 className="size-4" /></Button>
              <Button variant={split ? "secondary" : "ghost"} size="icon" onClick={() => setSplit((s) => !s)}><Columns2 className="size-4" /></Button>
              <Button variant={notes ? "secondary" : "ghost"} size="icon" onClick={() => setNotes((n) => !n)}><StickyNote className="size-4" /></Button>
              <span className="ml-auto text-xs text-muted-foreground">Page {page} of {doc.pages}</span>
              <Button variant="outline" size="sm" className="rounded-lg" onClick={() => toast.success("Page exported as PNG")}>Export page</Button>
            </div>

            <div className="flex">
              <div className="hidden w-32 shrink-0 space-y-3 border-r bg-muted/40 p-3 md:block">
                {Array.from({ length: doc.pages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={cn(
                      "w-full overflow-hidden rounded-lg border-2 bg-white p-1 transition-all",
                      page === i + 1 ? "border-primary shadow-md" : "border-transparent opacity-70 hover:opacity-100",
                    )}
                  >
                    <div className="space-y-1 p-1" style={{ aspectRatio: "1/1.414" }}>
                      {[100, 80, 92, 60, 88, 70, 95, 50].map((w, k) => (
                        <div key={k} className="h-1 rounded-full bg-slate-300" style={{ width: `${w}%` }} />
                      ))}
                    </div>
                    <p className="pb-1 text-center text-[10px] text-muted-foreground">Page {i + 1}</p>
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-auto bg-muted/60 p-6">
                <div className={cn("flex gap-6", split ? "flex-row" : "flex-col items-center")}>
                  <div style={{ transform: `scale(${zoom / 100}) rotate(${rotate}deg)`, transformOrigin: "top center", transition: "transform .3s" }}>
                    <DocumentPaper page={page} />
                  </div>
                  {split && (
                    <div style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top center" }}>
                      <DocumentPaper page={Math.min(doc.pages, page + 1)} />
                    </div>
                  )}
                </div>
              </div>

              {notes && (
                <div className="w-72 shrink-0 space-y-3 border-l p-4">
                  <p className="text-sm font-semibold">Annotations</p>
                  {[
                    { user: "A. Kulkarni", text: "Verify coating charges against PO line 3.", page: 1 },
                    { user: "N. Fernandes", text: "Mill test cert attached separately — QA-118 stamp valid.", page: 2 },
                  ].map((n) => (
                    <div key={n.text} className="rounded-xl border bg-warning-soft/60 p-3">
                      <p className="text-xs font-semibold">{n.user} · p.{n.page}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{n.text}</p>
                    </div>
                  ))}
                  <Textarea placeholder="Add an annotation…" className="rounded-xl" />
                  <Button size="sm" className="w-full rounded-lg" onClick={() => toast.success("Annotation added to page " + page)}>
                    Add note
                  </Button>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="details" className="mt-4 grid gap-6 xl:grid-cols-3">
          <SectionCard title="Metadata" className="xl:col-span-2">
            <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                ["Document ID", doc.id],
                ["Type", doc.type],
                ["Format", doc.format],
                ["Vendor", doc.vendor],
                ["Vendor code", doc.vendorCode],
                ["Warehouse", doc.warehouse],
                ["Purchase Order", doc.po],
                ["ASN", doc.asn],
                ["GRN", doc.grn],
                ["Vehicle", doc.vehicle],
                ["Driver", doc.driver],
                ["Amount", doc.amount],
                ["Uploaded by", doc.uploadedBy],
                ["Uploaded at", doc.uploadedAt],
                ["Retention", "7 years (statutory)"],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">{k}</dt>
                  <dd className="mt-0.5 text-sm font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </SectionCard>

          <div className="space-y-6">
            <SectionCard title="Approval history">
              <ol className="relative space-y-4 border-l pl-5">
                {[
                  { t: "Submitted for review", u: "R. Deshmukh", d: "31 Jul, 09:52", tone: "bg-primary" },
                  { t: "Procurement verified", u: "S. Iyer", d: "31 Jul, 10:05", tone: "bg-teal" },
                  { t: "Awaiting manager approval", u: "A. Kulkarni", d: "Pending", tone: "bg-warning" },
                ].map((s) => (
                  <li key={s.t}>
                    <span className={cn("absolute -left-[7px] size-3 rounded-full ring-4 ring-card", s.tone)} />
                    <p className="text-sm font-medium">{s.t}</p>
                    <p className="text-[11px] text-muted-foreground">{s.u} · {s.d}</p>
                  </li>
                ))}
              </ol>
            </SectionCard>

            <SectionCard title="Related documents">
              <div className="space-y-2">
                {documents.slice(1, 5).map((r) => (
                  <Link
                    key={r.id}
                    to="/document-flow/documents/$id"
                    params={{ id: r.id }}
                    className="flex items-center gap-3 rounded-xl border p-3 text-sm transition-colors hover:border-primary/40 hover:bg-accent/40"
                  >
                    <FileText className="size-4 shrink-0 text-primary" />
                    <span className="min-w-0 flex-1 truncate">{r.type} · {r.id}</span>
                    <StatusChip status={r.status} />
                  </Link>
                ))}
              </div>
            </SectionCard>
          </div>
        </TabsContent>

        <TabsContent value="linked" className="mt-4">
          <SectionCard
            title="Linked records"
            description="Business objects connected to this document"
            action={
              <Button size="sm" className="rounded-lg" asChild>
                <Link to="/document-flow/ocr/$id" params={{ id: doc.id }} search={{ step: "link" }}>
                  <Link2 className="mr-1.5 size-4" /> Manage links
                </Link>
              </Button>
            }
          >
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {[
                ["Purchase Order", doc.po, "₹ 12,84,500 · Open"],
                ["ASN", doc.asn, "In Gate · Dock 7"],
                ["GRN", doc.grn, "Received 31 Jul 2026"],
                ["Vendor", doc.vendorCode, doc.vendor],
                ["Warehouse", "WH-01", doc.warehouse],
                ["Vehicle", doc.vehicle, "Shree Transport Carriers"],
                ["Driver", "DRV-4471", doc.driver],
                ["Project", "PRJ-EXP-26", "Bhiwandi Expansion Phase II"],
              ].map(([k, v, s]) => (
                <div key={k} className="rounded-2xl border p-4">
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{k}</p>
                  <p className="mt-1 text-sm font-semibold">{v}</p>
                  <p className="text-xs text-muted-foreground">{s}</p>
                </div>
              ))}
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="versions" className="mt-4">
          <SectionCard
            title="Version history"
            description="Every re-upload is retained and immutable"
            action={
              <Button size="sm" variant="outline" className="rounded-lg" onClick={() => setCompare(true)}>
                <GitCompare className="mr-1.5 size-4" /> Compare versions
              </Button>
            }
          >
            <div className="space-y-3">
              {versions.map((v) => (
                <div key={v.v} className={cn("flex flex-wrap items-center gap-4 rounded-2xl border p-4", v.current && "border-primary/40 bg-primary-soft/50")}>
                  <div className="grid size-11 place-items-center rounded-xl bg-card text-sm font-bold ring-1 ring-border">{v.v}</div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">
                      {v.label} {v.current && <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-[10px] text-primary-foreground">Current</span>}
                    </p>
                    <p className="text-xs text-muted-foreground">{v.user} · {v.time} · {v.size}</p>
                  </div>
                  <ConfidenceMeter value={v.confidence} />
                  <div className="flex gap-1.5">
                    <Button size="sm" variant="outline" className="rounded-lg" onClick={() => toast.success(`Downloading ${doc.id} ${v.v}`)}>
                      <Download className="size-4" />
                    </Button>
                    {!v.current && (
                      <Button size="sm" variant="outline" className="rounded-lg" onClick={() => toast.success(`${v.v} restored as current version`)}>
                        <RotateCcw className="mr-1.5 size-4" /> Restore
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="audit" className="mt-4">
          <SectionCard title="Audit trail" description="Tamper-evident log · retained 7 years">
            <ol className="relative space-y-6 border-l pl-6">
              {auditTrail.map((a) => (
                <li key={a.time}>
                  <span className="absolute -left-[9px] grid size-4 place-items-center rounded-full bg-card ring-2 ring-primary">
                    <span className="size-1.5 rounded-full bg-primary" />
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold">{a.action}</p>
                    <span className="text-[11px] text-muted-foreground">{a.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{a.user} · IP {a.ip}</p>
                  <p className="mt-1 rounded-xl bg-muted px-3 py-2 text-xs">{a.changes}</p>
                </li>
              ))}
            </ol>
          </SectionCard>
        </TabsContent>
      </Tabs>

      {/* Share */}
      <Dialog open={share} onOpenChange={setShare}>
        <DialogContent className="rounded-2xl sm:max-w-lg">
          <DialogHeader><DialogTitle>Share document</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Internal users</Label>
              <Input placeholder="Search employees…" defaultValue="A. Kulkarni, S. Iyer" className="rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Department</Label>
                <Select defaultValue="Procurement">
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Procurement", "Quality", "Finance", "Security", "Asset Management"].map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Permission</Label>
                <Select defaultValue="Read">
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Read", "Edit", "Approve"].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>External email</Label>
              <Input placeholder="vendor@bharatsteel.in" className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label>Secure download link (expires in 7 days)</Label>
              <div className="flex gap-2">
                <Input readOnly value={`https://wms.axionscl.com/d/${doc.id}?t=9f3a1c`} className="rounded-xl" />
                <Button variant="outline" className="rounded-xl" onClick={() => toast.success("Link copied to clipboard")}>
                  <Copy className="size-4" />
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-xl" onClick={() => setShare(false)}>Cancel</Button>
            <Button className="rounded-xl" onClick={() => { setShare(false); toast.success("Document shared with 2 users and 1 department"); }}>
              <Mail className="mr-2 size-4" /> Share
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Archive */}
      <Dialog open={archive} onOpenChange={setArchive}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader><DialogTitle>Archive this document?</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-3 rounded-xl border border-warning/40 bg-warning-soft p-3">
              <ShieldAlert className="size-5 shrink-0 text-warning" />
              <p className="text-xs">
                Archived documents stay searchable and auditable but are removed from active
                workflows. Linked GRN and PO records keep their references.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label>Reason for archiving</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[
                    "Retention policy – closed GRN cycle",
                    "Duplicate document",
                    "Superseded by revised invoice",
                    "Vendor contract terminated",
                  ].map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Textarea placeholder="Additional notes for the audit trail…" className="rounded-xl" />
          </div>
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button variant="outline" className="rounded-xl" onClick={() => setArchive(false)}>Cancel</Button>
            <Button
              variant="destructive"
              className="rounded-xl"
              onClick={() => { setArchive(false); toast.error("Permanent delete requires Compliance Officer approval"); }}
            >
              <Trash2 className="mr-2 size-4" /> Permanent delete
            </Button>
            <Button className="rounded-xl" onClick={() => { setArchive(false); setArchived(true); toast.success("Document archived"); }}>
              <Archive className="mr-2 size-4" /> Archive
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Compare versions */}
      <Dialog open={compare} onOpenChange={setCompare}>
        <DialogContent className="max-w-4xl rounded-2xl">
          <DialogHeader><DialogTitle>Compare v2 with v3</DialogTitle></DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { v: "v2", conf: 81.2, diffs: ["Driver License read as MH032O18OOO4521", "Page 2 stamp unreadable", "Taxable value blank"] },
              { v: "v3", conf: 96.4, diffs: ["Driver License MH0320180004521 ✓", "QA-118 stamp detected ✓", "Taxable value ₹ 10,88,559.32 ✓"] },
            ].map((c, i) => (
              <div key={c.v} className="rounded-2xl border p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">{c.v}</p>
                  <ConfidenceMeter value={c.conf} />
                </div>
                <ul className="mt-3 space-y-2">
                  {c.diffs.map((d) => (
                    <li key={d} className={cn("rounded-lg px-3 py-2 text-xs", i === 0 ? "bg-destructive-soft text-destructive" : "bg-success-soft text-success")}>
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button className="rounded-xl" onClick={() => { setCompare(false); toast.success("v3 confirmed as active version"); }}>
              <CheckCircle2 className="mr-2 size-4" /> Keep v3
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
