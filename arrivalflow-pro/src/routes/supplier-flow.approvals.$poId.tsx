import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, ShieldCheck, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Field, PageHeader, SectionCard, Timeline } from "@/apps/supplier-flow/components/page-parts";
import { StatusBadge } from "@/apps/supplier-flow/components/status-badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getPO, money, poTotal } from "@/apps/supplier-flow/data/procurement";

export const Route = createFileRoute("/supplier-flow/approvals/$poId")({
  loader: ({ params }) => {
    if (!getPO(params.poId)) throw notFound();
    return null;
  },
  head: ({ params }) => {
    const po = getPO(params.poId);
    if (!po) return { meta: [{ title: "Approval not found | AxisWMS" }, { name: "robots", content: "noindex" }] };
    return {
      meta: [
        { title: `Approval — ${po.id} | AxisWMS` },
        { name: "description", content: `Approval workflow, comments and audit trail for purchase order ${po.id}.` },
        { property: "og:title", content: `Approval — ${po.id} | AxisWMS` },
        { property: "og:description", content: `${po.supplier} · ${po.status} · multi-level approval workflow.` },
      ],
    };
  },
  component: ApprovalDetail,
});

function ApprovalDetail() {
  const { poId } = Route.useParams();
  const po = getPO(poId)!;
  const [approve, setApprove] = useState(false);
  const [reject, setReject] = useState(false);
  const [comment, setComment] = useState("");

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        breadcrumbs={[{ label: "Home", to: "/supplier-flow" }, { label: "Approvals", to: "/supplier-flow/approvals" }, { label: po.id }]}
        title={`Approval — ${po.id}`}
        subtitle={`${po.supplier} · ${money(poTotal(po), po.currency)} · ${po.costCenter}`}
        meta={<><StatusBadge status={po.status} /><StatusBadge status={po.priority} /></>}
        actions={
          po.status === "Pending Approval" ? (
            <>
              <Button onClick={() => setApprove(true)}><CheckCircle2 className="size-4" /> Approve</Button>
              <Button variant="outline" className="text-destructive" onClick={() => setReject(true)}><XCircle className="size-4" /> Reject</Button>
              <Button variant="ghost" onClick={() => toast.info("Escalated to Director — Operations")}>Escalate</Button>
            </>
          ) : (
            <Button variant="outline" asChild><Link to="/supplier-flow/purchase-orders/$poId" params={{ poId: po.id }}>Open purchase order</Link></Button>
          )
        }
      />

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <SectionCard title="Approval workflow">
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
          </SectionCard>

          <SectionCard title="Order summary">
            <dl className="grid gap-4 sm:grid-cols-3">
              <Field label="Supplier" value={po.supplier} />
              <Field label="Warehouse" value={po.warehouse} />
              <Field label="Buyer" value={po.buyer} />
              <Field label="Order value" value={<span className="num">{money(poTotal(po), po.currency)}</span>} />
              <Field label="Budget code" value={po.budgetCode} />
              <Field label="Expected delivery" value={po.expectedDelivery} />
            </dl>
          </SectionCard>

          <SectionCard title="Audit trail"><Timeline events={po.timeline} /></SectionCard>
        </div>

        <div className="space-y-4">
          <SectionCard title="Comments">
            <div className="space-y-3">
              {po.approvals.filter((a) => a.comment).map((a) => (
                <div key={a.level} className="rounded-lg border p-3">
                  <p className="text-xs font-semibold">{a.approver}</p>
                  <p className="mt-1 text-sm">{a.comment}</p>
                  <p className="num mt-1 text-[11px] text-muted-foreground">{a.on}</p>
                </div>
              ))}
              <Textarea rows={3} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Add a comment for the approval chain…" />
              <Button size="sm" variant="outline" onClick={() => { setComment(""); toast.success("Comment posted"); }}>Post comment</Button>
            </div>
          </SectionCard>

          <SectionCard title="Digital signature">
            <p className="flex items-center gap-2 text-sm"><ShieldCheck className="size-4 text-success" /> Enterprise PKI token detected</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Approvals are signed with a tamper-evident hash and retained for seven years in the audit vault.
            </p>
          </SectionCard>
        </div>
      </div>

      <Dialog open={approve} onOpenChange={setApprove}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve {po.id}?</DialogTitle>
            <DialogDescription>Your digital signature will be applied and the workflow advanced to the next level.</DialogDescription>
          </DialogHeader>
          <Textarea rows={3} placeholder="Approval comment" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setApprove(false)}>Cancel</Button>
            <Button onClick={() => { setApprove(false); toast.success("Approved", { description: `${po.id} advanced to Director — Operations.` }); }}>Sign & approve</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={reject} onOpenChange={setReject}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject {po.id}?</DialogTitle>
            <DialogDescription>The order returns to the buyer with your comments.</DialogDescription>
          </DialogHeader>
          <Textarea rows={3} placeholder="Reason for rejection (mandatory)" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setReject(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => { setReject(false); toast.error("Purchase order rejected"); }}>Reject</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
