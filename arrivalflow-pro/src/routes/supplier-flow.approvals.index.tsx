import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, ClipboardCheck, Clock, XCircle } from "lucide-react";
import { EmptyState, PageHeader, SectionCard } from "@/apps/supplier-flow/components/page-parts";
import { StatCard } from "@/apps/supplier-flow/components/stat-card";
import { StatusBadge } from "@/apps/supplier-flow/components/status-badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { approvalMatrix, compactMoney, poTotal, purchaseOrders } from "@/apps/supplier-flow/data/procurement";

export const Route = createFileRoute("/supplier-flow/approvals/")({
  head: () => ({
    meta: [
      { title: "Purchase Order Approvals | AxisWMS Procurement" },
      { name: "description", content: "Multi-level purchase order approvals with SLA tracking, escalation and audit trail." },
      { property: "og:title", content: "Purchase Order Approvals | AxisWMS Procurement" },
      { property: "og:description", content: "Approval cockpit with matrix, escalation and digital signature." },
    ],
  }),
  component: Approvals,
});

function Approvals() {
  const [tab, setTab] = useState("Pending");
  const pending = purchaseOrders.filter((p) => p.status === "Pending Approval");
  const approved = purchaseOrders.filter((p) => ["Approved", "Sent to Supplier", "Partially Received", "Closed"].includes(p.status));
  const rejected = purchaseOrders.filter((p) => ["Rejected", "Cancelled"].includes(p.status));
  const rows = tab === "Pending" ? pending : tab === "Approved" ? approved : rejected;

  return (
    <div className="mx-auto max-w-[1600px]">
      <PageHeader
        breadcrumbs={[{ label: "Home", to: "/supplier-flow" }, { label: "Procurement" }, { label: "Approvals" }]}
        title="Approval cockpit"
        subtitle="Draft → Submitted → Manager → Finance → Director → Approved → Supplier notified"
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Awaiting my action" value={pending.length} icon={ClipboardCheck} accent="warning" sub="1 breaching SLA in 6 hrs" />
        <StatCard label="Approved (30 days)" value={approved.length} icon={CheckCircle2} accent="success" sub="Avg cycle 1.8 days" />
        <StatCard label="Rejected / cancelled" value={rejected.length} icon={XCircle} accent="danger" sub="Supplier block driven" />
        <StatCard label="Escalations open" value={1} icon={Clock} accent="primary" sub="Director — Operations" />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <div className="space-y-3 xl:col-span-2">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              {["Pending", "Approved", "Rejected"].map((t) => <TabsTrigger key={t} value={t} className="text-xs">{t}</TabsTrigger>)}
            </TabsList>
          </Tabs>
          <SectionCard bodyClassName="p-0">
            {rows.length === 0 ? (
              <EmptyState icon={ClipboardCheck} title="Nothing here" description="There are no purchase orders in this approval bucket." />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>PO number</TableHead><TableHead>Supplier</TableHead>
                      <TableHead className="hidden md:table-cell">Current level</TableHead>
                      <TableHead className="text-right">Value</TableHead><TableHead>Status</TableHead><TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((p) => {
                      const current = p.approvals.find((a) => a.status === "Pending") ?? p.approvals[p.approvals.length - 1];
                      return (
                        <TableRow key={p.id}>
                          <TableCell><Link to="/supplier-flow/approvals/$poId" params={{ poId: p.id }} className="num text-sm font-semibold hover:text-primary">{p.id}</Link><p className="num text-xs text-muted-foreground">{p.createdOn}</p></TableCell>
                          <TableCell className="text-sm">{p.supplier}</TableCell>
                          <TableCell className="hidden md:table-cell text-sm">{current?.role ?? "—"}<span className="block text-xs text-muted-foreground">{current?.approver}</span></TableCell>
                          <TableCell className="num text-right text-sm font-semibold">{compactMoney(poTotal(p), p.currency)}</TableCell>
                          <TableCell><StatusBadge status={p.status} /></TableCell>
                          <TableCell className="text-right"><Button size="sm" variant="outline" asChild><Link to="/supplier-flow/approvals/$poId" params={{ poId: p.id }}>Review</Link></Button></TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </SectionCard>
        </div>

        <SectionCard title="Approval matrix" description="Delegation of authority — FY 2026-27" bodyClassName="p-0">
          <div className="divide-y">
            {approvalMatrix.map((m) => (
              <div key={m.band} className="px-4 py-3">
                <p className="num text-sm font-semibold">{m.band}</p>
                <p className="mt-1 text-xs text-muted-foreground">L1 {m.l1} · L2 {m.l2} · L3 {m.l3}</p>
                <p className="mt-1 text-xs font-medium text-primary">SLA {m.sla}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
