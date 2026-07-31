import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Check, CircleDot, CornerUpLeft, MessageSquare, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PageHeader, PriorityBadge, SectionCard, StatusBadge } from "@/apps/warehouse-flow/components/ui-kit";
import { cn } from "@/lib/utils";
import {
  approvalComments,
  approvalSteps,
  inr,
  lineTotal,
  materialRequests,
  requestTotal,
} from "@/apps/warehouse-flow/data";

export const Route = createFileRoute("/warehouse-flow/approvals")({
  head: () => ({
    meta: [
      { title: "Approval Workflow — WMS Console" },
      {
        name: "description",
        content:
          "Review pending material requests, follow the approval timeline, comment and approve, reject or send back.",
      },
      { property: "og:title", content: "Approval Workflow — WMS Console" },
      {
        property: "og:description",
        content: "Review, comment and act on pending material request approvals.",
      },
    ],
  }),
  component: ApprovalsPage,
});

function ApprovalsPage() {
  const queue = materialRequests.filter((r) => r.status === "Pending Approval");
  const [activeNo, setActiveNo] = useState(queue[0]?.requestNo ?? "");
  const active = queue.find((r) => r.requestNo === activeNo) ?? queue[0];
  const [comment, setComment] = useState("");
  const [confirm, setConfirm] = useState<"approve" | "reject" | "sendback" | null>(null);

  const comments = active ? (approvalComments[active.requestNo] ?? []) : [];
  const steps = active ? (approvalSteps[active.requestNo] ?? []) : [];

  return (
    <>
      <PageHeader
        title="Approval Workflow"
        description="Review, comment and approve or reject pending material requests."
        breadcrumbs={[{ label: "Home", to: "/warehouse-flow/" }, { label: "Approval Workflow" }]}
      />

      <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
        <SectionCard
          title="Pending Queue"
          description={`${queue.length} requests awaiting action`}
          bodyClassName="p-0"
        >
          <ul className="divide-y divide-border">
            {queue.map((r) => (
              <li key={r.requestNo}>
                <button
                  onClick={() => setActiveNo(r.requestNo)}
                  className={cn(
                    "w-full px-5 py-4 text-left transition-colors",
                    r.requestNo === active?.requestNo
                      ? "bg-primary/8 shadow-[inset_3px_0_0_0_var(--color-primary)]"
                      : "hover:bg-muted/60",
                  )}
                >
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                    <span className="num truncate text-sm font-semibold text-primary">
                      {r.requestNo}
                    </span>
                    <PriorityBadge priority={r.priority} />
                  </div>
                  <p className="mt-1 truncate text-sm">{r.notes}</p>
                  <p className="num mt-1 text-xs text-muted-foreground">
                    {r.requestedBy} · {r.requiredDate}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        </SectionCard>

        {active && (
          <div className="space-y-4">
            <SectionCard bodyClassName="p-5">
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="num font-semibold text-primary">{active.requestNo}</span>
                    <StatusBadge status={active.status} />
                    <PriorityBadge priority={active.priority} />
                  </div>
                  <h2 className="mt-2 text-xl font-bold">{active.notes}</h2>
                  <p className="num mt-1 text-sm text-muted-foreground">
                    {active.requestedBy} · {active.department} · {active.warehouse} · Due{" "}
                    {active.requiredDate} · {inr(requestTotal(active))}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => setConfirm("sendback")}>
                    <CornerUpLeft className="size-4" /> Send Back
                  </Button>
                  <Button variant="outline" onClick={() => setConfirm("reject")}>
                    <X className="size-4" /> Reject
                  </Button>
                  <Button onClick={() => setConfirm("approve")}>
                    <Check className="size-4" /> Approve
                  </Button>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Approval Timeline">
              <ol className="grid gap-3 md:grid-cols-4">
                {steps.map((s) => (
                  <li
                    key={s.label}
                    className={cn(
                      "rounded-xl border p-4",
                      s.state === "done"
                        ? "border-success/30 bg-success/8"
                        : s.state === "current"
                          ? "border-primary/40 bg-primary/8"
                          : "border-border",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {s.state === "done" ? (
                        <Check className="size-4 text-success" />
                      ) : (
                        <CircleDot
                          className={cn(
                            "size-4",
                            s.state === "current" ? "text-primary" : "text-muted-foreground",
                          )}
                        />
                      )}
                      <span className="truncate text-sm font-semibold">{s.label}</span>
                    </div>
                    <p className="mt-1.5 text-sm">{s.actor}</p>
                    <p className="num text-xs text-muted-foreground">{s.at ?? "Pending"}</p>
                  </li>
                ))}
              </ol>
            </SectionCard>

            <SectionCard title="Requested Items" bodyClassName="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/60">
                      <TableHead>Material</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {active.items.map((l) => (
                      <TableRow key={l.id}>
                        <TableCell className="text-sm font-medium">{l.name}</TableCell>
                        <TableCell className="num text-xs text-muted-foreground">{l.code}</TableCell>
                        <TableCell className="num text-xs text-muted-foreground">
                          {l.warehouse}/{l.rack}/{l.bin}
                        </TableCell>
                        <TableCell className="num text-right text-sm font-semibold">
                          {l.requested} {l.unit}
                        </TableCell>
                        <TableCell className="num text-right text-sm">{inr(lineTotal(l))}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </SectionCard>

            <SectionCard title="Approver Comments">
              <ul className="space-y-4">
                {comments.map((c, i) => (
                  <li key={i} className="flex gap-3">
                    <Avatar className="size-8 shrink-0">
                      <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                        {c.user
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1 rounded-lg border border-border px-4 py-3">
                      <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
                        <span className="truncate text-sm font-semibold">{c.user}</span>
                        <span className="num text-xs text-muted-foreground">{c.at}</span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{c.text}</p>
                    </div>
                  </li>
                ))}
                {comments.length === 0 && (
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MessageSquare className="size-4" /> No comments yet.
                  </li>
                )}
              </ul>
              <div className="mt-4 space-y-2">
                <Textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment for the requester or next approver..."
                />
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    disabled={!comment.trim()}
                    onClick={() => {
                      toast.success("Comment posted");
                      setComment("");
                    }}
                  >
                    <Send className="size-4" /> Post Comment
                  </Button>
                </div>
              </div>
            </SectionCard>
          </div>
        )}
      </div>

      <AlertDialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirm === "approve"
                ? "Approve request?"
                : confirm === "reject"
                  ? "Reject request?"
                  : "Send back to requester?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {active?.requestNo} will move to the next workflow stage and all watchers will be
              notified.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const label =
                  confirm === "approve" ? "approved" : confirm === "reject" ? "rejected" : "sent back";
                if (confirm === "reject") toast.error(`${active?.requestNo} ${label}`);
                else toast.success(`${active?.requestNo} ${label}`);
                setConfirm(null);
              }}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
