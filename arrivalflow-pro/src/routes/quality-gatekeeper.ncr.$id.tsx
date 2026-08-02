import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Download, Undo2, Wrench, Trash2, CheckCircle2, Paperclip } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PageHeader, SectionCard } from "@/apps/quality-gatekeeper/components/qm/Primitives";
import { StatusPill } from "@/apps/quality-gatekeeper/components/qm/StatusPill";
import { getNcr, photoEvidence } from "@/apps/quality-gatekeeper/lib/qm-data";

export const Route = createFileRoute("/quality-gatekeeper/ncr/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.id} Â· NCR Detail` },
      {
        name: "description",
        content: `Root cause, corrective action and disposition workflow for non-conformance report ${params.id}.`,
      },
      { property: "og:title", content: `${params.id} Â· NCR Detail` },
      {
        property: "og:description",
        content: "Non-conformance investigation, CAPA and disposition.",
      },
    ],
  }),
  component: NcrDetail,
});

function NcrDetail() {
  const { id } = Route.useParams();
  const ncr = getNcr(id);
  const navigate = useNavigate();
  const [dispo, setDispo] = useState<null | "rts" | "rework" | "scrap">(null);
  const [approve, setApprove] = useState(false);

  return (
    <>
      <PageHeader
        breadcrumb={[
          { label: "Quality", to: "/quality-gatekeeper" },
          { label: "NCR", to: "/quality-gatekeeper/ncr" },
          { label: ncr.id },
        ]}
        eyebrow="Screen 10 Â· Detail"
        title={ncr.id}
        description={`${ncr.material} Â· ${ncr.vendor} Â· raised ${ncr.raisedOn} by ${ncr.raisedBy}`}
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.success("NCR exported as PDF")}
            >
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
            <Button size="sm" onClick={() => setApprove(true)}>
              <CheckCircle2 className="mr-2 h-4 w-4" /> Approve disposition
            </Button>
          </>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <StatusPill tone={ncr.severity === "Critical" ? "danger" : "warning"} dot={false}>
          {ncr.severity} severity
        </StatusPill>
        <StatusPill tone={ncr.status === "Closed" ? "success" : "info"}>{ncr.status}</StatusPill>
        <StatusPill tone="brand" dot={false}>
          {ncr.qty} units affected
        </StatusPill>
        <StatusPill tone="neutral" dot={false}>
          Dept: {ncr.department}
        </StatusPill>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Tabs defaultValue="investigation">
          <TabsList className="w-full justify-start overflow-x-auto rounded-xl">
            <TabsTrigger value="investigation">Investigation</TabsTrigger>
            <TabsTrigger value="capa">CAPA</TabsTrigger>
            <TabsTrigger value="evidence">Evidence</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="investigation" className="mt-3 space-y-3">
            <SectionCard title="Defect description">
              <p className="text-xs leading-relaxed">{ncr.description}</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <Info l="Defect category" v={ncr.category} />
                <Info l="Linked inspection" v={ncr.inspection} />
                <Info l="Responsible department" v={ncr.department} />
                <Info l="Detected at" v="Incoming inspection Â· QA-BAY-2" />
              </div>
            </SectionCard>
            <SectionCard title="Root cause analysis" description="5-Why / Ishikawa">
              <p className="text-xs leading-relaxed">{ncr.rootCause}</p>
              <div className="mt-3">
                <Label className="text-xs">Add investigation note</Label>
                <Textarea
                  className="mt-1.5"
                  rows={3}
                  placeholder="Document findings, measurements and interviewsâ€¦"
                />
                <Button
                  size="sm"
                  className="mt-2"
                  onClick={() => toast.success("Investigation note added")}
                >
                  Add note
                </Button>
              </div>
            </SectionCard>
          </TabsContent>

          <TabsContent value="capa" className="mt-3 space-y-3">
            <SectionCard title="Corrective action">
              <p className="text-xs leading-relaxed">{ncr.corrective}</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <Info l="Owner" v="Supplier Quality" />
                <Info l="Due" v="2026-08-06" />
                <Info l="Status" v="In progress" />
              </div>
            </SectionCard>
            <SectionCard title="Preventive action">
              <p className="text-xs leading-relaxed">{ncr.preventive}</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <Info l="Owner" v="Procurement" />
                <Info l="Due" v="2026-08-20" />
                <Info l="Effectiveness check" v="Next 3 shipments" />
              </div>
            </SectionCard>
          </TabsContent>

          <TabsContent value="evidence" className="mt-3">
            <SectionCard title="Attachments & photo evidence">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {photoEvidence.slice(0, 4).map((p) => (
                  <figure key={p.id} className="overflow-hidden rounded-xl border border-border">
                    <img
                      src={p.src}
                      alt={p.label}
                      loading="lazy"
                      className="h-28 w-full object-cover"
                    />
                    <figcaption className="truncate p-2 text-[10px] text-muted-foreground">
                      {p.label}
                    </figcaption>
                  </figure>
                ))}
              </div>
              <ul className="mt-3 space-y-2">
                {[
                  "Dimensional report DR-88251.pdf",
                  "Vendor 8D response (draft).docx",
                  "Photo pack NCR-318.zip",
                ].map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs"
                  >
                    <Paperclip className="h-3.5 w-3.5 text-muted-foreground" /> {f}
                  </li>
                ))}
              </ul>
            </SectionCard>
          </TabsContent>

          <TabsContent value="history" className="mt-3">
            <SectionCard title="NCR history">
              <ol className="relative space-y-3 pl-5 text-xs">
                <span className="absolute top-1 bottom-1 left-[7px] w-px bg-border" />
                {[
                  ["2026-07-31 20:05", "NCR raised by Imran Qureshi"],
                  ["2026-07-31 20:12", "Quality hold QH-2026-00086 created"],
                  ["2026-08-01 07:58", "Disposition proposed: Return To Supplier"],
                  ["2026-08-01 08:10", "Vendor notified via supplier portal"],
                ].map(([t, l]) => (
                  <li key={l} className="relative">
                    <span className="absolute top-1 -left-5 h-3 w-3 rounded-full border-2 border-primary bg-background" />
                    <p className="font-medium">{l}</p>
                    <p className="num text-[11px] text-muted-foreground">{t}</p>
                  </li>
                ))}
              </ol>
            </SectionCard>
          </TabsContent>
        </Tabs>

        <div className="space-y-3">
          <SectionCard
            title="Disposition"
            description="Select the outcome for the affected quantity"
          >
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setDispo("rts")}
              >
                <Undo2 className="mr-2 h-4 w-4 text-destructive" /> Return to supplier
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setDispo("rework")}
              >
                <Wrench className="mr-2 h-4 w-4 text-warning-foreground" /> Send to rework
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setDispo("scrap")}
              >
                <Trash2 className="mr-2 h-4 w-4 text-destructive" /> Scrap
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => toast.success("Use-as-is concession requested")}
              >
                <CheckCircle2 className="mr-2 h-4 w-4 text-success" /> Use as is (concession)
              </Button>
            </div>
            <p className="mt-3 text-[11px] text-muted-foreground">
              Current proposal: <strong>{ncr.disposition}</strong>. Quality Manager approval is
              required before execution.
            </p>
          </SectionCard>

          <SectionCard title="Cost of poor quality">
            <div className="space-y-2 text-xs">
              <Info l="Material value" v="SAR 36,000" inline />
              <Info l="Rework estimate" v="SAR 4,200" inline />
              <Info l="Freight (return)" v="SAR 1,850" inline />
              <Info l="Production delay" v="2 days" inline />
            </div>
          </SectionCard>
        </div>
      </div>

      <Dialog open={dispo !== null} onOpenChange={(o) => !o && setDispo(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dispo === "rts"
                ? "Create Return To Supplier"
                : dispo === "rework"
                  ? "Create rework order"
                  : "Create scrap request"}
            </DialogTitle>
            <DialogDescription>
              {ncr.qty} units of {ncr.material} will be routed accordingly and the vendor scorecard
              updated.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-xl border border-border bg-background/60 p-3 text-[11px]">
            Approval routing: Quality Manager â†’ Procurement Manager (for credit note).
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDispo(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                const target = dispo;
                setDispo(null);
                toast.success("Disposition created");
                navigate({
                  to:
                    target === "rts"
                      ? "/quality-gatekeeper/rts"
                      : target === "rework"
                        ? "/quality-gatekeeper/rework"
                        : "/quality-gatekeeper/scrap",
                });
              }}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={approve} onOpenChange={setApprove}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve NCR disposition</DialogTitle>
            <DialogDescription>
              You are approving <strong>{ncr.disposition}</strong> for {ncr.id}. This is recorded
              against your digital signature.
            </DialogDescription>
          </DialogHeader>
          <Textarea rows={3} placeholder="Approval comments (optional)" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setApprove(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setApprove(false);
                toast.success("Disposition approved", {
                  description: "Vendor and Procurement notified",
                });
              }}
            >
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Info({ l, v, inline }: { l: string; v: string; inline?: boolean }) {
  if (inline)
    return (
      <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-1.5 last:border-0">
        <span className="truncate text-muted-foreground">{l}</span>
        <span className="num font-medium">{v}</span>
      </div>
    );
  return (
    <div className="rounded-xl border border-border bg-background/60 p-3">
      <p className="text-[11px] text-muted-foreground">{l}</p>
      <p className="mt-0.5 truncate text-xs font-medium">{v}</p>
    </div>
  );
}
