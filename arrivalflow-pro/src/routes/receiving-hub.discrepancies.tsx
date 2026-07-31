import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { DataTable, type Column } from "@/apps/receiving-hub/shared/DataTable";
import { PageHeader } from "@/apps/receiving-hub/shared/PageHeader";
import { StatusChip } from "@/apps/receiving-hub/shared/StatusChip";
import { useWms } from "@/apps/receiving-hub/context/WmsContext";
import { fmtDate, qty } from "@/apps/receiving-hub/format";
import type { Discrepancy } from "@/apps/receiving-hub/types";

export const Route = createFileRoute("/receiving-hub/discrepancies")({
  head: () => ({
    meta: [
      { title: "Receiving Discrepancies — NexusWMS" },
      {
        name: "description",
        content:
          "Register of damage, quantity mismatch, wrong item and missing document discrepancies raised at receiving.",
      },
      { property: "og:title", content: "Receiving Discrepancies — NexusWMS" },
      {
        property: "og:description",
        content: "Register of receiving discrepancies with resolution actions.",
      },
    ],
  }),
  component: Discrepancies,
});

function Discrepancies() {
  const { discrepancies, updateDiscrepancy } = useWms();
  const [q, setQ] = useState("");
  const [type, setType] = useState("all");
  const [severity, setSeverity] = useState("all");
  const [status, setStatus] = useState("all");
  const [active, setActive] = useState<Discrepancy | null>(null);

  const rows = useMemo(
    () =>
      discrepancies.filter(
        (d) =>
          `${d.id} ${d.sku} ${d.grnId} ${d.poNumber ?? ""}`.toLowerCase().includes(q.toLowerCase()) &&
          (type === "all" || d.type === type) &&
          (severity === "all" || d.severity === severity) &&
          (status === "all" || d.status === status),
      ),
    [discrepancies, q, type, severity, status],
  );

  const columns: Column<Discrepancy>[] = [
    { key: "id", header: "Discrepancy ID", sortable: true, sortValue: (r) => r.id, render: (r) => <span className="font-medium text-primary">{r.id}</span> },
    { key: "type", header: "Type", sortable: true, sortValue: (r) => r.type, render: (r) => r.type },
    {
      key: "grn",
      header: "GRN",
      render: (r) => (
        <Link to="/receiving-hub/grn/$id" params={{ id: r.grnId }} className="text-primary hover:underline">{r.grnId}</Link>
      ),
    },
    { key: "sku", header: "SKU", render: (r) => <span className="text-muted-foreground">{r.sku}</span> },
    { key: "qty", header: "Qty Affected", align: "right", render: (r) => qty(r.qtyAffected) },
    { key: "sev", header: "Severity", sortable: true, sortValue: (r) => r.severity, render: (r) => <StatusChip status={r.severity} /> },
    { key: "status", header: "Status", sortable: true, sortValue: (r) => r.status, render: (r) => <StatusChip status={r.status} /> },
    { key: "raised", header: "Raised On", sortable: true, sortValue: (r) => r.raisedOn, render: (r) => <span className="text-muted-foreground">{fmtDate(r.raisedOn)}</span> },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (r) => (
        <Button variant="outline" size="sm" className="h-8" onClick={() => setActive(r)}>Review</Button>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        crumbs={[{ label: "Receiving", to: "/receiving-hub/" }, { label: "Discrepancies" }]}
        title="Receiving Discrepancies"
        subtitle="Damage, shortages, wrong items and missing documentation raised during goods receipt"
      />

      <div className="erp-card mb-4 flex flex-wrap items-center gap-2 p-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="h-9 pl-9" placeholder="Search discrepancy, SKU or GRN…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="h-9 w-[190px]"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {["Damage", "Quantity Mismatch", "Wrong Item", "Missing Documents", "Packaging Damage"].map((t) => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={severity} onValueChange={setSeverity}>
          <SelectTrigger className="h-9 w-[150px]"><SelectValue placeholder="Severity" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All severities</SelectItem>
            {["Low", "Medium", "High"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="h-9 w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {["Open", "In Review", "Resolved", "Escalated"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <DataTable rows={rows} columns={columns} rowKey={(r) => r.id} />

      <Sheet open={!!active} onOpenChange={(v) => !v && setActive(null)}>
        <SheetContent className="w-full sm:max-w-md">
          {active && (
            <>
              <SheetHeader>
                <SheetTitle>{active.id}</SheetTitle>
                <SheetDescription>
                  {active.type} raised by {active.raisedBy} on {fmtDate(active.raisedOn)}
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-4 px-4">
                <div className="flex gap-1.5">
                  <StatusChip status={active.severity} />
                  <StatusChip status={active.status} />
                </div>
                {[
                  ["GRN", active.grnId],
                  ["Purchase order", active.poNumber ?? "Non-PO"],
                  ["SKU", active.sku],
                  ["Quantity affected", qty(active.qtyAffected)],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-[13px]">
                    <span className="text-muted-foreground">{k}</span>
                    <span className="font-medium">{v}</span>
                  </div>
                ))}
                <div>
                  <p className="label-xs">Description</p>
                  <p className="mt-1 text-[13px]">{active.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2">
                  {[
                    ["Assign", "In Review"],
                    ["Escalate", "Escalated"],
                    ["Resolve", "Resolved"],
                    ["Reopen", "Open"],
                  ].map(([label, next]) => (
                    <Button
                      key={label}
                      variant={label === "Resolve" ? "default" : "outline"}
                      onClick={() => {
                        updateDiscrepancy(active.id, { status: next as Discrepancy["status"] });
                        setActive({ ...active, status: next as Discrepancy["status"] });
                        toast.success(`${active.id} marked ${next}`);
                      }}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
