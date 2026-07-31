import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Check, CircleDot, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader, SectionCard, StatusBadge } from "@/apps/warehouse-flow/components/ui-kit";
import { cn } from "@/lib/utils";
import { inr, issues } from "@/apps/warehouse-flow/data";

export const Route = createFileRoute("/warehouse-flow/issue")({
  head: () => ({
    meta: [
      { title: "Material Issue — WMS Console" },
      {
        name: "description",
        content:
          "Confirm goods issue against approved requests with batch, serial, issued quantity and receiver acknowledgement.",
      },
      { property: "og:title", content: "Material Issue — WMS Console" },
      {
        property: "og:description",
        content: "Confirm goods issue with batch, serial and receiver acknowledgement.",
      },
    ],
  }),
  component: IssuePage,
});

function IssuePage() {
  const [activeNo, setActiveNo] = useState(issues[0]!.issueNo);
  const active = issues.find((i) => i.issueNo === activeNo)!;
  const [confirmed, setConfirmed] = useState<string[]>([]);

  const totalUnits = active.lines.reduce((s, l) => s + l.issued, 0);
  const totalValue = active.lines.reduce((s, l) => s + l.issued * l.rate, 0);

  return (
    <>
      <PageHeader
        title="Material Issue Confirmation"
        description="Verify picked items and issue materials to the requester."
        breadcrumbs={[{ label: "Home", to: "/warehouse-flow/" }, { label: "Material Issue" }]}
        actions={
          <>
            <Button variant="outline" onClick={() => toast.success("Goods issue slip sent to printer")}>
              <Printer className="size-4" /> Print Slip
            </Button>
            <Button onClick={() => toast.success(`${active.issueNo} posted to ERP`)}>
              <Check className="size-4" /> Confirm Issue
            </Button>
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
        <SectionCard title="Ready for Issue" description="Approved and picked requests" bodyClassName="p-0">
          <ul className="divide-y divide-border">
            {issues.map((i) => (
              <li key={i.issueNo}>
                <button
                  onClick={() => setActiveNo(i.issueNo)}
                  className={cn(
                    "w-full px-5 py-4 text-left transition-colors",
                    i.issueNo === activeNo
                      ? "bg-primary/8 shadow-[inset_3px_0_0_0_var(--color-primary)]"
                      : "hover:bg-muted/60",
                  )}
                >
                  <p className="num text-sm font-semibold text-primary">{i.issueNo}</p>
                  <p className="num mt-0.5 text-xs text-muted-foreground">
                    {i.request} · {i.workOrder} · {i.warehouse}
                  </p>
                  <div className="mt-2">
                    <StatusBadge status={i.status} />
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </SectionCard>

        <div className="space-y-4">
          <SectionCard bodyClassName="p-5">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                  Goods Issue Document
                </p>
                <h2 className="num mt-1 text-2xl font-bold">{active.issueNo}</h2>
                <p className="num mt-1 text-sm text-muted-foreground">
                  Against {active.request} · {active.workOrder} · Warehouse {active.warehouse}
                </p>
              </div>
              <dl className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm sm:grid-cols-3">
                {[
                  ["Issued By", active.issuedBy],
                  ["Received By", active.receivedBy],
                  ["Issue Date", active.issueDate],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">{k}</dt>
                    <dd className="num font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </SectionCard>

          <SectionCard title="Issue Lines" bodyClassName="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/60">
                    <TableHead className="w-12">Confirm</TableHead>
                    <TableHead>Material</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>Serial</TableHead>
                    <TableHead className="text-right">Requested</TableHead>
                    <TableHead className="text-right">Picked</TableHead>
                    <TableHead className="text-right">Issued</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {active.lines.map((l) => (
                    <TableRow key={l.code}>
                      <TableCell>
                        <Checkbox
                          checked={confirmed.includes(l.code)}
                          onCheckedChange={(c) =>
                            setConfirmed((s) =>
                              c ? [...s, l.code] : s.filter((x) => x !== l.code),
                            )
                          }
                          aria-label={`Confirm ${l.code}`}
                        />
                      </TableCell>
                      <TableCell>
                        <p className="text-sm font-medium">{l.name}</p>
                        <p className="num text-xs text-muted-foreground">{l.code}</p>
                      </TableCell>
                      <TableCell className="num text-xs">{l.batch}</TableCell>
                      <TableCell className="num text-xs">{l.serial}</TableCell>
                      <TableCell className="num text-right text-sm">{l.requested}</TableCell>
                      <TableCell className="num text-right text-sm">{l.picked}</TableCell>
                      <TableCell className="text-right">
                        <Input
                          defaultValue={l.issued}
                          className="num ml-auto h-9 w-20 text-right"
                          aria-label={`Issued quantity for ${l.code}`}
                        />
                      </TableCell>
                      <TableCell className="num text-right text-sm font-semibold">
                        {inr(l.issued * l.rate)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="grid gap-4 border-t border-border p-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Reference / GRN</Label>
                <Input placeholder="Optional reference" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Remarks</Label>
                <Textarea rows={2} placeholder="Optional remarks for this issue" />
              </div>
            </div>
          </SectionCard>

          <div className="grid gap-4 lg:grid-cols-2">
            <SectionCard title="Issue Timeline">
              <ol className="relative space-y-5 border-l border-border pl-5">
                {active.timeline.map((t) => (
                  <li key={t.label} className="relative">
                    <span
                      className={cn(
                        "absolute -left-[27px] grid size-5 place-items-center rounded-full border-2 border-card",
                        t.state === "done"
                          ? "bg-success text-success-foreground"
                          : t.state === "current"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground",
                      )}
                    >
                      {t.state === "done" ? (
                        <Check className="size-3" />
                      ) : (
                        <CircleDot className="size-3" />
                      )}
                    </span>
                    <p className="text-sm font-semibold">{t.label}</p>
                    <p className="num text-xs text-muted-foreground">{t.at}</p>
                  </li>
                ))}
              </ol>
            </SectionCard>

            <SectionCard title="Issue Summary">
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Lines confirmed</dt>
                  <dd className="num font-semibold">
                    {confirmed.length} / {active.lines.length}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Total units</dt>
                  <dd className="num font-semibold">{totalUnits}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Cost impact</dt>
                  <dd className="num font-semibold">{inr(totalValue)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Status</dt>
                  <dd><StatusBadge status={active.status} /></dd>
                </div>
              </dl>
              <div className="mt-5 rounded-xl border border-dashed border-border p-6 text-center">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Receiver signature
                </p>
                <p className="mt-6 text-sm text-muted-foreground">Tap to sign</p>
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </>
  );
}
