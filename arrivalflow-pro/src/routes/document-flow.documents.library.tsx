import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Search,
  SlidersHorizontal,
  Download,
  Eye,
  Pencil,
  ScanText,
  History,
  Upload,
  X,
  FileSearch,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { AppShell } from "@/apps/document-flow/components/wms/AppShell";
import { SectionCard, StatusChip, ConfidenceMeter } from "@/apps/document-flow/components/wms/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { documents, documentTypes, vendors, warehouses } from "@/apps/document-flow/wms-data";
import { toast } from "sonner";

export const Route = createFileRoute("/document-flow/documents/library")({
  head: () => ({
    meta: [
      { title: "Document Library — Axion WMS" },
      { name: "description", content: "Search and filter every warehouse document by type, vendor, PO, ASN, status and date." },
      { property: "og:title", content: "Document Library — Axion WMS" },
      { property: "og:description", content: "Search and filter every warehouse document by type, vendor, PO, ASN, status and date." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LibraryPage,
});

const statuses = [
  "Uploaded",
  "Processing",
  "OCR Completed",
  "Pending Review",
  "Approved",
  "Rejected",
  "Linked",
  "Archived",
  "OCR Failed",
];

function LibraryPage() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [type, setType] = useState("all");
  const [vendor, setVendor] = useState("all");
  const [status, setStatus] = useState("all");
  const [warehouse, setWarehouse] = useState("all");
  const [from, setFrom] = useState("2026-07-01");
  const [to, setTo] = useState("2026-07-31");
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  const filtered = useMemo(
    () =>
      documents.filter((d) => {
        const hay = `${d.id} ${d.name} ${d.vendor} ${d.po} ${d.asn} ${d.grn} ${d.vehicle} ${d.driver}`.toLowerCase();
        return (
          hay.includes(q.toLowerCase()) &&
          (type === "all" || d.type === type) &&
          (vendor === "all" || d.vendor === vendor) &&
          (status === "all" || d.status === status) &&
          (warehouse === "all" || d.warehouse === warehouse)
        );
      }),
    [q, type, vendor, status, warehouse],
  );

  const perPage = 8;
  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const current = filtered.slice((page - 1) * perPage, page * perPage);

  const activeFilters = [
    type !== "all" && { k: "Type", v: type, clear: () => setType("all") },
    vendor !== "all" && { k: "Vendor", v: vendor, clear: () => setVendor("all") },
    status !== "all" && { k: "Status", v: status, clear: () => setStatus("all") },
    warehouse !== "all" && { k: "Warehouse", v: warehouse, clear: () => setWarehouse("all") },
  ].filter(Boolean) as { k: string; v: string; clear: () => void }[];

  const runSearch = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 700);
  };

  return (
    <AppShell
      title="Document Library"
      subtitle={`${documents.length} documents indexed · full-text OCR search enabled`}
      breadcrumb={[
        { label: "Home", to: "/document-flow" },
        { label: "Document Management", to: "/document-flow/documents" },
        { label: "Library" },
      ]}
      actions={
        <>
          <Button variant="outline" className="rounded-xl" onClick={() => toast.success("Export queued — CSV will be emailed to you")}>
            <Download className="mr-2 size-4" /> Export
          </Button>
          <Button className="rounded-xl" asChild>
            <Link to="/document-flow/documents/upload">
              <Upload className="mr-2 size-4" /> Upload
            </Link>
          </Button>
        </>
      }
    >
      <div className="surface-card p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-64 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              placeholder="Search by document ID, PO, ASN, GRN, vendor, vehicle or extracted text…"
              className="h-11 rounded-xl pl-9"
            />
          </div>

          <Select value={type} onValueChange={(v) => { setType(v); setPage(1); }}>
            <SelectTrigger className="h-11 w-48 rounded-xl">
              <SelectValue placeholder="Document Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All document types</SelectItem>
              {documentTypes.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
            <SelectTrigger className="h-11 w-44 rounded-xl">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {statuses.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="h-11 rounded-xl">
                <SlidersHorizontal className="mr-2 size-4" /> Advanced Filters
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full overflow-y-auto sm:max-w-md">
              <SheetHeader>
                <SheetTitle>Advanced filters</SheetTitle>
              </SheetHeader>
              <div className="space-y-5 px-4 pb-8">
                <div className="space-y-1.5">
                  <Label>Vendor</Label>
                  <Select value={vendor} onValueChange={setVendor}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All vendors</SelectItem>
                      {vendors.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Warehouse</Label>
                  <Select value={warehouse} onValueChange={setWarehouse}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All warehouses</SelectItem>
                      {warehouses.map((w) => <SelectItem key={w} value={w}>{w}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Purchase Order</Label>
                    <Input placeholder="PO-2026-…" className="rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>ASN</Label>
                    <Input placeholder="ASN-…" className="rounded-xl" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>From date</Label>
                    <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>To date</Label>
                    <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="rounded-xl" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>OCR confidence</Label>
                  {["Above 95% (auto-approve eligible)", "80–95% (review)", "Below 80% (manual)"].map((c) => (
                    <label key={c} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Checkbox /> {c}
                    </label>
                  ))}
                </div>
                <Button className="w-full rounded-xl" onClick={runSearch}>Apply filters</Button>
              </div>
            </SheetContent>
          </Sheet>

          <Button className="h-11 rounded-xl" onClick={runSearch}>
            {loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Search className="mr-2 size-4" />}
            Search
          </Button>
        </div>

        {activeFilters.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">Active filters:</span>
            {activeFilters.map((f) => (
              <button
                key={f.k}
                onClick={f.clear}
                className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-2.5 py-1 text-[11px] font-medium text-primary"
              >
                {f.k}: {f.v} <X className="size-3" />
              </button>
            ))}
          </div>
        )}
      </div>

      {selected.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-primary/30 bg-primary-soft px-4 py-3">
          <span className="text-sm font-medium text-primary">{selected.length} selected</span>
          <Button size="sm" variant="outline" className="rounded-lg" onClick={() => toast.success(`${selected.length} documents queued for OCR`)}>
            <ScanText className="mr-1.5 size-4" /> Run OCR
          </Button>
          <Button size="sm" variant="outline" className="rounded-lg" onClick={() => toast.success("Download started")}>
            <Download className="mr-1.5 size-4" /> Download
          </Button>
          <Button size="sm" variant="ghost" className="rounded-lg" onClick={() => setSelected([])}>Clear</Button>
        </div>
      )}

      <SectionCard title="All documents" description={`${filtered.length} results · page ${page} of ${pages}`} className="mt-4">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="size-10 rounded-xl" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-28 rounded-full" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-muted">
              <FileSearch className="size-6 text-muted-foreground" />
            </div>
            <p className="mt-4 text-sm font-semibold">No documents match your filters</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Try widening the date range or clearing the vendor filter.
            </p>
            <Button
              className="mt-4 rounded-xl"
              variant="outline"
              onClick={() => {
                setQ(""); setType("all"); setVendor("all"); setStatus("all"); setWarehouse("all");
              }}
            >
              Reset all filters
            </Button>
          </div>
        ) : (
          <div className="-mx-5 overflow-x-auto">
            <table className="w-full min-w-[1080px] text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-3">
                    <Checkbox
                      checked={selected.length === current.length && current.length > 0}
                      onCheckedChange={(c) => setSelected(c ? current.map((d) => d.id) : [])}
                    />
                  </th>
                  <th className="py-3 pr-4 font-medium">Document</th>
                  <th className="py-3 pr-4 font-medium">Type</th>
                  <th className="py-3 pr-4 font-medium">Vendor</th>
                  <th className="py-3 pr-4 font-medium">PO / ASN</th>
                  <th className="py-3 pr-4 font-medium">Status</th>
                  <th className="py-3 pr-4 font-medium">Confidence</th>
                  <th className="py-3 pr-4 font-medium">Uploaded</th>
                  <th className="py-3 pr-5 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {current.map((d) => (
                  <tr
                    key={d.id}
                    className="cursor-pointer border-b transition-colors last:border-0 hover:bg-accent/40"
                    onClick={() => navigate({ to: "/document-flow/documents/$id", params: { id: d.id } })}
                  >
                    <td className="px-5 py-3" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selected.includes(d.id)}
                        onCheckedChange={(c) =>
                          setSelected((s) => (c ? [...s, d.id] : s.filter((x) => x !== d.id)))
                        }
                      />
                    </td>
                    <td className="max-w-72 py-3 pr-4">
                      <p className="truncate font-medium">{d.name}</p>
                      <p className="text-xs text-muted-foreground">{d.id} · {d.pages}p · {d.sizeMb} MB</p>
                    </td>
                    <td className="py-3 pr-4 text-xs">{d.type}</td>
                    <td className="max-w-44 truncate py-3 pr-4 text-xs">{d.vendor}</td>
                    <td className="py-3 pr-4 text-xs">
                      <p>{d.po}</p>
                      <p className="text-muted-foreground">{d.asn}</p>
                    </td>
                    <td className="py-3 pr-4"><StatusChip status={d.status} /></td>
                    <td className="py-3 pr-4"><ConfidenceMeter value={d.confidence} /></td>
                    <td className="py-3 pr-4 text-xs text-muted-foreground">
                      <p>{d.uploadedAt}</p>
                      <p>{d.uploadedBy}</p>
                    </td>
                    <td className="py-3 pr-5 text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="rounded-lg">Actions</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl">
                          <DropdownMenuItem onClick={() => navigate({ to: "/document-flow/documents/$id", params: { id: d.id } })}>
                            <Eye className="mr-2 size-4" /> View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast.success(`Downloading ${d.id}`)}>
                            <Download className="mr-2 size-4" /> Download
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate({ to: "/document-flow/ocr/$id", params: { id: d.id } })}>
                            <Pencil className="mr-2 size-4" /> Edit metadata
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate({ to: "/document-flow/ocr/$id", params: { id: d.id } })}>
                            <ScanText className="mr-2 size-4" /> Run OCR
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              navigate({ to: "/document-flow/documents/$id", params: { id: d.id }, search: { tab: "versions" } })
                            }
                          >
                            <History className="mr-2 size-4" /> History
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
            <p className="text-xs text-muted-foreground">
              Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" className="rounded-lg" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                <ChevronLeft className="size-4" />
              </Button>
              {Array.from({ length: pages }).map((_, i) => (
                <Button
                  key={i}
                  size="sm"
                  variant={page === i + 1 ? "default" : "outline"}
                  className="rounded-lg"
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </Button>
              ))}
              <Button variant="outline" size="sm" className="rounded-lg" disabled={page === pages} onClick={() => setPage((p) => p + 1)}>
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </SectionCard>
    </AppShell>
  );
}
