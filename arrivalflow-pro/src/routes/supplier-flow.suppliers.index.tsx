import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Ban,
  CheckCircle2,
  Download,
  Filter,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Star,
  Upload,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { EmptyState, PageHeader, SectionCard, TableSkeleton } from "@/apps/supplier-flow/components/page-parts";
import { StatCard } from "@/apps/supplier-flow/components/stat-card";
import { StatusBadge } from "@/apps/supplier-flow/components/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { analytics, compactMoney, suppliers, type SupplierStatus } from "@/apps/supplier-flow/data/procurement";

export const Route = createFileRoute("/supplier-flow/suppliers/")({
  head: () => ({
    meta: [
      { title: "Supplier Master | AxisWMS Procurement" },
      { name: "description", content: "Search, filter, onboard and govern the complete supplier master data set." },
      { property: "og:title", content: "Supplier Master | AxisWMS Procurement" },
      { property: "og:description", content: "Supplier master governance with risk, compliance and performance signals." },
    ],
  }),
  component: SupplierList,
});

const statusTabs: ("All" | SupplierStatus)[] = ["All", "Active", "Pending Approval", "Pending Verification", "Inactive", "Blocked"];

function SupplierList() {
  const [tab, setTab] = useState<string>("All");
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");
  const [country, setCountry] = useState("all");
  const [risk, setRisk] = useState("all");
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(true);

  const categories = Array.from(new Set(suppliers.map((s) => s.category)));
  const countries = Array.from(new Set(suppliers.map((s) => s.country)));

  const rows = useMemo(
    () =>
      suppliers.filter((s) => {
        if (tab !== "All" && s.status !== tab) return false;
        if (category !== "all" && s.category !== category) return false;
        if (country !== "all" && s.country !== country) return false;
        if (risk !== "all" && s.risk !== risk) return false;
        const t = q.trim().toLowerCase();
        if (t && !`${s.name} ${s.code} ${s.gst} ${s.city} ${s.category}`.toLowerCase().includes(t)) return false;
        return true;
      }),
    [tab, q, category, country, risk],
  );

  const refresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 900);
  };

  const clearFilters = () => {
    setQ("");
    setCategory("all");
    setCountry("all");
    setRisk("all");
    setTab("All");
  };

  const allChecked = rows.length > 0 && selected.length === rows.length;

  return (
    <div className="mx-auto max-w-[1600px]">
      <PageHeader
        breadcrumbs={[{ label: "Home", to: "/supplier-flow" }, { label: "Procurement" }, { label: "Supplier Master" }]}
        title="Supplier Master"
        subtitle="Single source of truth for vendor onboarding, compliance, risk and commercial terms"
        actions={
          <>
            <Button variant="outline" onClick={() => setImportOpen(true)}>
              <Upload className="size-4" /> Import
            </Button>
            <Button variant="outline" onClick={() => setExportOpen(true)}>
              <Download className="size-4" /> Export
            </Button>
            <Button asChild>
              <Link to="/supplier-flow/suppliers/new">
                <Plus className="size-4" /> Create supplier
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard label="Total suppliers" value={analytics.totalSuppliers} icon={Users} sub="Across 4 countries" />
        <StatCard label="Active" value={analytics.activeSuppliers} icon={CheckCircle2} accent="success" sub="Eligible for new POs" />
        <StatCard label="Pending" value={analytics.pendingSuppliers} icon={RefreshCw} accent="warning" sub="Verification & approval" />
        <StatCard label="Blocked" value={analytics.blockedSuppliers} icon={Ban} accent="danger" sub="CAPA in progress" />
        <StatCard label="Avg rating" value={`${analytics.avgVendorRating} / 5`} icon={Star} accent="teal" sub="Weighted scorecard" />
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Tabs value={tab} onValueChange={setTab} className="min-w-0">
            <TabsList className="flex-wrap">
              {statusTabs.map((s) => (
                <TabsTrigger key={s} value={s} className="text-xs">
                  {s}
                  <span className="num ml-1.5 text-[10px] text-muted-foreground">
                    {s === "All" ? suppliers.length : suppliers.filter((x) => x.status === s).length}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowFilters((v) => !v)}>
              <SlidersHorizontal className="size-4" /> {showFilters ? "Hide" : "Show"} filters
            </Button>
            <Button variant="outline" size="sm" onClick={refresh}>
              <RefreshCw className="size-4" /> Refresh
            </Button>
          </div>
        </div>

        {showFilters && (
          <SectionCard bodyClassName="p-3">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
              <div className="relative lg:col-span-2">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search name, code, GSTIN, city…"
                  className="pl-9"
                />
              </div>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger><SelectValue placeholder="Country" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All countries</SelectItem>
                  {countries.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={risk} onValueChange={setRisk}>
                <SelectTrigger><SelectValue placeholder="Risk" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All risk levels</SelectItem>
                  <SelectItem value="Low">Low risk</SelectItem>
                  <SelectItem value="Medium">Medium risk</SelectItem>
                  <SelectItem value="High">High risk</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground">
                <Filter className="mr-1 inline size-3.5" />
                {rows.length} of {suppliers.length} records
              </span>
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 text-xs">
                <X className="size-3.5" /> Clear all
              </Button>
            </div>
          </SectionCard>
        )}

        {selected.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-primary/30 bg-primary-soft px-3 py-2">
            <p className="text-sm font-medium text-primary">{selected.length} selected</p>
            <div className="ml-auto flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => toast.success(`${selected.length} suppliers approved`)}>
                Approve
              </Button>
              <Button size="sm" variant="outline" onClick={() => toast.warning(`${selected.length} suppliers blocked`)}>
                Block
              </Button>
              <Button size="sm" variant="outline" onClick={() => toast.info("Export queued — you will receive an email")}>
                Export selection
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setSelected([])}>Clear</Button>
            </div>
          </div>
        )}

        <SectionCard bodyClassName="p-0">
          {loading ? (
            <TableSkeleton rows={6} cols={7} />
          ) : rows.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No suppliers match these filters"
              description="Try widening the status, category or risk filters, or create a new supplier record."
              action={
                <div className="flex gap-2">
                  <Button variant="outline" onClick={clearFilters}>Clear filters</Button>
                  <Button asChild><Link to="/supplier-flow/suppliers/new">Create supplier</Link></Button>
                </div>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-10">
                      <Checkbox
                        checked={allChecked}
                        onCheckedChange={(v) => setSelected(v ? rows.map((r) => r.id) : [])}
                        aria-label="Select all"
                      />
                    </TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead className="hidden md:table-cell">Category</TableHead>
                    <TableHead className="hidden lg:table-cell">Location</TableHead>
                    <TableHead className="hidden xl:table-cell">GSTIN / Tax ID</TableHead>
                    <TableHead className="text-right">Spend YTD</TableHead>
                    <TableHead className="hidden sm:table-cell text-right">OTD %</TableHead>
                    <TableHead className="hidden lg:table-cell">Risk</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((s) => (
                    <TableRow key={s.id} className="group">
                      <TableCell>
                        <Checkbox
                          checked={selected.includes(s.id)}
                          onCheckedChange={(v) =>
                            setSelected((prev) => (v ? [...prev, s.id] : prev.filter((x) => x !== s.id)))
                          }
                          aria-label={`Select ${s.name}`}
                        />
                      </TableCell>
                      <TableCell>
                        <Link to="/supplier-flow/suppliers/$supplierId" params={{ supplierId: s.id }} className="block min-w-52">
                          <p className="text-sm font-semibold group-hover:text-primary">{s.name}</p>
                          <p className="num text-xs text-muted-foreground">{s.code} · {s.vendorType}</p>
                        </Link>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm">{s.category}</TableCell>
                      <TableCell className="hidden lg:table-cell text-sm">{s.city}, {s.country}</TableCell>
                      <TableCell className="num hidden xl:table-cell text-xs">{s.gst}</TableCell>
                      <TableCell className="num text-right text-sm font-medium">{compactMoney(s.spendYtd)}</TableCell>
                      <TableCell className="num hidden sm:table-cell text-right text-sm">{s.onTimeDelivery}%</TableCell>
                      <TableCell className="hidden lg:table-cell"><StatusBadge status={s.risk} /></TableCell>
                      <TableCell><StatusBadge status={s.status} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          {!loading && rows.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-2 border-t px-4 py-3">
              <p className="text-xs text-muted-foreground">
                Showing 1–{rows.length} of {rows.length} suppliers
              </p>
              <Pagination className="mx-0 w-auto">
                <PaginationContent>
                  <PaginationItem><PaginationPrevious href="#" /></PaginationItem>
                  <PaginationItem><PaginationLink href="#" isActive>1</PaginationLink></PaginationItem>
                  <PaginationItem><PaginationLink href="#">2</PaginationLink></PaginationItem>
                  <PaginationItem><PaginationNext href="#" /></PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </SectionCard>
      </div>

      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import suppliers</DialogTitle>
            <DialogDescription>Upload an XLSX or CSV file using the AxisWMS supplier master template v4.2.</DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border border-dashed p-8 text-center">
            <Upload className="mx-auto size-7 text-muted-foreground" />
            <p className="mt-2 text-sm font-medium">Drop file here or browse</p>
            <p className="text-xs text-muted-foreground">Maximum 5,000 rows · 20 MB</p>
          </div>
          <ul className="space-y-1 text-xs text-muted-foreground">
            <li>• Mandatory columns: Supplier Name, Vendor Type, Category, Country, GSTIN/Tax ID, Payment Terms</li>
            <li>• Duplicate GSTIN rows are rejected and reported in the validation log</li>
            <li>• Imported records land in “Pending Verification” status</li>
          </ul>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportOpen(false)}>Cancel</Button>
            <Button onClick={() => { setImportOpen(false); toast.success("Import job queued", { description: "Validation report will be emailed in ~3 minutes." }); }}>
              Start import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={exportOpen} onOpenChange={setExportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export supplier master</DialogTitle>
            <DialogDescription>Choose the format and scope for your export.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Select defaultValue="xlsx">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="xlsx">Excel workbook (.xlsx)</SelectItem>
                <SelectItem value="csv">CSV (.csv)</SelectItem>
                <SelectItem value="pdf">PDF register (.pdf)</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="filtered">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="filtered">Current filtered view ({rows.length} records)</SelectItem>
                <SelectItem value="all">Entire supplier master ({suppliers.length} records)</SelectItem>
                <SelectItem value="selected">Selected rows ({selected.length})</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExportOpen(false)}>Cancel</Button>
            <Button onClick={() => { setExportOpen(false); toast.success("Export ready", { description: "supplier-master-01Aug2026.xlsx downloaded." }); }}>
              <Download className="size-4" /> Export
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
