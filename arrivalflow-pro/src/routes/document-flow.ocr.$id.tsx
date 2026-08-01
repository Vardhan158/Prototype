import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ScanText,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Sparkles,
  Link2,
  TriangleAlert,
  Keyboard,
  ArrowRight,
  ArrowLeft,
  FileWarning,
  Upload,
  LayoutDashboard,
  Eye,
  MessageSquare,
} from "lucide-react";
import { AppShell } from "@/apps/document-flow/components/wms/AppShell";
import { ConfidenceMeter, SectionCard } from "@/apps/document-flow/components/wms/primitives";
import { DocumentPaper } from "@/apps/document-flow/components/wms/DocumentPaper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { documents, linkTargets, ocrFields, ocrStages, type OcrField } from "@/apps/document-flow/wms-data";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/document-flow/ocr/$id")({
  validateSearch: (s: Record<string, unknown>) => ({
    step: typeof s["step"] === "string" ? (s["step"] as string) : "",
  }),
  head: ({ params }) => ({
    meta: [
      { title: `OCR Extraction ${params.id} — Axion WMS` },
      { name: "description", content: `Live OCR extraction, field review, approval and record linking for document ${params.id}.` },
      { property: "og:title", content: `OCR Extraction ${params.id} — Axion WMS` },
      { property: "og:description", content: `Live OCR extraction, field review, approval and record linking for document ${params.id}.` },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OcrWorkflow,
});

type Step = "processing" | "results" | "link" | "success" | "failed";

function OcrWorkflow() {
  const { id } = Route.useParams();
  const { step: initialStep } = Route.useSearch();
  const navigate = useNavigate();
  const doc = documents.find((d) => d.id === id) ?? documents[0]!;
  const isFailure = doc.status === "OCR Failed";

  const [step, setStep] = useState<Step>(
    isFailure ? "failed" : initialStep === "link" ? "link" : initialStep === "results" ? "results" : "processing",
  );
  const [stageIdx, setStageIdx] = useState(0);
  const [pct, setPct] = useState(0);
  const [fields, setFields] = useState<OcrField[]>(ocrFields);
  const [active, setActive] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [approve, setApprove] = useState(false);
  const [reject, setReject] = useState(false);
  const [links, setLinks] = useState<string[]>(["PO-2026-77120", "ASN-88431", "GRN-2026-31188"]);

  useEffect(() => {
    if (step !== "processing") return undefined;
    const t = setInterval(() => {
      setPct((p) => {
        const next = p + 2;
        setStageIdx(Math.min(ocrStages.length - 1, Math.floor((next / 100) * ocrStages.length)));
        if (next >= 100) {
          clearInterval(t);
          setTimeout(() => {
            setStep("results");
            toast.success("OCR completed", { description: "23 fields extracted · 96.4% average confidence" });
          }, 500);
          return 100;
        }
        return next;
      });
    }, 90);
    return () => clearInterval(t);
  }, [step]);

  const avg = useMemo(
    () => fields.reduce((s, f) => s + f.confidence, 0) / fields.length,
    [fields],
  );
  const lowConfidence = fields.filter((f) => f.confidence < 80);

  const update = (key: string, value: string) =>
    setFields((fs) => fs.map((f) => (f.key === key ? { ...f, value, confidence: 100 } : f)));

  const shell = (children: React.ReactNode, actions?: React.ReactNode) => (
    <AppShell
      title={`OCR Extraction · ${doc.id}`}
      subtitle={doc.name}
      breadcrumb={[
        { label: "Home", to: "/document-flow" },
        { label: "OCR Processing", to: "/document-flow/ocr" },
        { label: doc.id },
      ]}
      {...(actions ? { actions } : {})}
    >
      {children}
    </AppShell>
  );

  /* ---------------- PROCESSING ---------------- */
  if (step === "processing") {
    return shell(
      <div className="grid gap-6 xl:grid-cols-5">
        <SectionCard title="Live extraction" description="Do not close this window" className="xl:col-span-3">
          <div className="grid place-items-center">
            <DocumentPaper scanning className="max-w-[420px]" />
          </div>
          <div className="mt-6">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{ocrStages[stageIdx]}</span>
              <span className="font-semibold tabular-nums">{pct}%</span>
            </div>
            <Progress value={pct} className="mt-2 h-2" />
          </div>
        </SectionCard>

        <SectionCard title="Pipeline" description="wms-invoice-in-v4 · en+hi" className="xl:col-span-2">
          <ol className="space-y-3">
            {ocrStages.map((s, i) => (
              <li key={s} className="flex items-center gap-3">
                <span
                  className={cn(
                    "grid size-7 shrink-0 place-items-center rounded-full text-[11px] font-semibold",
                    i < stageIdx ? "bg-success-soft text-success" : i === stageIdx ? "bg-primary text-primary-foreground animate-pulse-ring" : "bg-muted text-muted-foreground",
                  )}
                >
                  {i < stageIdx ? <CheckCircle2 className="size-4" /> : i + 1}
                </span>
                <span className={cn("text-sm", i <= stageIdx ? "font-medium" : "text-muted-foreground")}>{s}</span>
              </li>
            ))}
          </ol>
          <div className="mt-5 rounded-2xl bg-primary-soft p-4 text-xs text-primary">
            <ScanText className="mb-2 size-5" />
            Barcode <strong>*INV26278841*</strong> and QR payload decoded. Signature block and
            QA-118 stamp detected on page 3.
          </div>
          <Button variant="outline" className="mt-4 w-full rounded-xl" onClick={() => navigate({ to: "/document-flow/ocr" })}>
            Run in background
          </Button>
        </SectionCard>
      </div>,
    );
  }

  /* ---------------- FAILED ---------------- */
  if (step === "failed") {
    return shell(
      <div className="grid gap-6 xl:grid-cols-3">
        <SectionCard title="OCR failed" description="Extraction could not complete" className="xl:col-span-2">
          <div className="flex gap-4 rounded-2xl border border-destructive/30 bg-destructive-soft p-5">
            <FileWarning className="size-8 shrink-0 text-destructive" />
            <div>
              <p className="text-sm font-semibold text-destructive">
                3 blocking issues found in {doc.id}
              </p>
              <ul className="mt-3 space-y-2 text-sm">
                {[
                  ["Low resolution", "Scanned at 142 DPI — minimum required is 300 DPI"],
                  ["Missing pages", "Page 2 of 2 referenced in the header but not present"],
                  ["Unreadable region", "Handwritten quantity column too faint for the model"],
                ].map(([t, d]) => (
                  <li key={t} className="rounded-xl bg-card p-3">
                    <p className="font-medium">{t}</p>
                    <p className="text-xs text-muted-foreground">{d}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button className="rounded-xl" onClick={() => { setStep("processing"); setPct(0); setStageIdx(0); toast("Retrying extraction with enhanced pre-processing"); }}>
              <RefreshCw className="mr-2 size-4" /> Retry OCR
            </Button>
            <Button variant="outline" className="rounded-xl" onClick={() => { setStep("results"); toast("Manual entry mode — all fields editable"); }}>
              <Keyboard className="mr-2 size-4" /> Manual entry
            </Button>
            <Button variant="outline" className="rounded-xl" asChild>
              <Link to="/document-flow/documents/upload">
                <Upload className="mr-2 size-4" /> Re-upload scan
              </Link>
            </Button>
          </div>
        </SectionCard>

        <SectionCard title="Capture guidance" description="Reduce failures at source">
          <ul className="space-y-3 text-sm text-muted-foreground">
            {[
              "Scan at 300 DPI or higher in greyscale",
              "Flatten the document — avoid folds across table rows",
              "Include all pages referenced in the header",
              "Avoid direct flash on glossy invoice paper",
              "Use the mobile app's auto-crop instead of the gallery",
            ].map((t) => (
              <li key={t} className="flex gap-2">
                <TriangleAlert className="mt-0.5 size-4 shrink-0 text-warning" /> {t}
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>,
    );
  }

  /* ---------------- LINK ---------------- */
  if (step === "link") {
    return shell(
      <div className="grid gap-6 xl:grid-cols-3">
        <SectionCard title="Link document to records" description="Select the business objects this document belongs to" className="xl:col-span-2">
          <div className="space-y-5">
            {Object.entries(linkTargets).map(([group, items]) => (
              <div key={group}>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{group}</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {items.map((it) => {
                    const on = links.includes(it.id);
                    return (
                      <label
                        key={it.id}
                        className={cn(
                          "flex cursor-pointer items-start gap-3 rounded-2xl border p-3 text-left transition-all",
                          on ? "border-primary bg-primary-soft" : "hover:border-primary/40 hover:bg-accent/40",
                        )}
                      >
                        <Checkbox
                          checked={on}
                          onCheckedChange={() =>
                            setLinks((l) => (on ? l.filter((x) => x !== it.id) : [...l, it.id]))
                          }
                          className="mt-0.5"
                        />
                        <span className="min-w-0">
                          <span className="block text-sm font-medium">{it.id}</span>
                          <span className="block truncate text-xs text-muted-foreground">{it.detail}</span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Link summary" description={`${links.length} records selected`}>
          <div className="space-y-2">
            {links.map((l) => (
              <div key={l} className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm">
                <Link2 className="size-4 text-primary" /> {l}
              </div>
            ))}
            {links.length === 0 && (
              <p className="rounded-xl bg-muted p-4 text-xs text-muted-foreground">
                No records selected yet. A document must be linked to at least one PO, GRN or asset
                before approval is final.
              </p>
            )}
          </div>
          <div className="mt-5 space-y-2">
            <Button className="w-full rounded-xl" disabled={links.length === 0} onClick={() => { setStep("success"); toast.success(`Linked to ${links.length} records`); }}>
              Confirm links <ArrowRight className="ml-2 size-4" />
            </Button>
            <Button variant="outline" className="w-full rounded-xl" onClick={() => setStep("results")}>
              <ArrowLeft className="mr-2 size-4" /> Back to results
            </Button>
          </div>
        </SectionCard>
      </div>,
    );
  }

  /* ---------------- SUCCESS ---------------- */
  if (step === "success") {
    return shell(
      <div className="mx-auto max-w-xl">
        <div className="surface-card p-10 text-center animate-fade-up">
          <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-success-soft text-success animate-pulse-ring">
            <CheckCircle2 className="size-8" />
          </div>
          <h2 className="mt-5 text-xl font-semibold tracking-tight">Document processed successfully</h2>
          <p className="mt-1 text-sm text-muted-foreground">{doc.name}</p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              ["Uploaded", "1.8 MB · 3 pages"],
              ["OCR completed", `${avg.toFixed(1)}% confidence`],
              ["Linked", `${links.length} records`],
            ].map(([k, v]) => (
              <div key={k} className="rounded-2xl border p-4">
                <CheckCircle2 className="mx-auto size-5 text-success" />
                <p className="mt-2 text-sm font-medium">{k}</p>
                <p className="text-xs text-muted-foreground">{v}</p>
              </div>
            ))}
          </div>

          <div className="mt-7 flex flex-wrap justify-center gap-2">
            <Button className="rounded-xl" asChild>
              <Link to="/document-flow/documents/$id" params={{ id: doc.id }} search={{ tab: "preview" }}>
                <Eye className="mr-2 size-4" /> View document
              </Link>
            </Button>
            <Button variant="outline" className="rounded-xl" asChild>
              <Link to="/document-flow/documents/upload">
                <Upload className="mr-2 size-4" /> Upload another
              </Link>
            </Button>
            <Button variant="ghost" className="rounded-xl" asChild>
              <Link to="/document-flow">
                <LayoutDashboard className="mr-2 size-4" /> Go to dashboard
              </Link>
            </Button>
          </div>
        </div>
      </div>,
    );
  }

  /* ---------------- RESULTS / REVIEW ---------------- */
  const groups = ["Header", "Party", "Logistics", "Commercial"] as const;

  return shell(
    <div className="grid gap-6 xl:grid-cols-2">
      <SectionCard
        title="Original document"
        description="Hover a field to highlight its source region"
        action={
          <Button size="sm" variant="outline" className="rounded-lg" asChild>
            <Link to="/document-flow/documents/$id" params={{ id: doc.id }} search={{ tab: "preview" }}>Open viewer</Link>
          </Button>
        }
      >
        <div className="max-h-[720px] overflow-auto rounded-xl bg-muted/60 p-4">
          <DocumentPaper highlight={active} />
        </div>
      </SectionCard>

      <div className="space-y-4">
        <div className="surface-card flex flex-wrap items-center gap-4 p-4">
          <div>
            <p className="text-xs text-muted-foreground">Average confidence</p>
            <p className="text-2xl font-semibold tabular-nums">{avg.toFixed(1)}%</p>
          </div>
          <div className="h-10 w-px bg-border" />
          <div>
            <p className="text-xs text-muted-foreground">Fields extracted</p>
            <p className="text-2xl font-semibold tabular-nums">{fields.length}</p>
          </div>
          <div className="h-10 w-px bg-border" />
          <div>
            <p className="text-xs text-muted-foreground">Needs review</p>
            <p className="text-2xl font-semibold tabular-nums text-warning">{lowConfidence.length}</p>
          </div>
          <Button size="sm" variant="outline" className="ml-auto rounded-lg" onClick={() => { setStep("processing"); setPct(0); setStageIdx(0); }}>
            <RefreshCw className="mr-1.5 size-4" /> Reprocess
          </Button>
        </div>

        {lowConfidence.length > 0 && (
          <div className="rounded-2xl border border-warning/40 bg-warning-soft p-4">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <TriangleAlert className="size-4 text-warning" /> {lowConfidence.length} fields below the 80% threshold
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Correct them below — edited fields are marked verified and locked to 100%.
            </p>
          </div>
        )}

        <SectionCard title="Extracted fields" description="Editable · changes are audit logged">
          <div className="max-h-[560px] space-y-5 overflow-y-auto pr-1">
            {groups.map((g) => (
              <div key={g}>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{g}</p>
                <div className="space-y-3">
                  {fields.filter((f) => f.group === g).map((f) => (
                    <div
                      key={f.key}
                      onMouseEnter={() => setActive(f.key)}
                      onMouseLeave={() => setActive(null)}
                      className={cn(
                        "rounded-2xl border p-3 transition-colors",
                        f.confidence < 80 ? "border-destructive/40 bg-destructive-soft/40" : "hover:border-primary/40",
                      )}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <Label className="text-xs">{f.label}</Label>
                        <ConfidenceMeter value={f.confidence} />
                      </div>
                      <Input
                        value={f.value}
                        onChange={(e) => update(f.key, e.target.value)}
                        className="mt-2 h-9 rounded-xl text-sm"
                      />
                      {f.suggestion && (
                        <p className="mt-2 flex items-start gap-1.5 rounded-lg bg-primary-soft px-2.5 py-1.5 text-[11px] text-primary">
                          <Sparkles className="mt-0.5 size-3.5 shrink-0" /> AI suggestion: {f.suggestion}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Reviewer comments">
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="e.g. Rounding difference of ₹0.32 accepted against PO-2026-77120 line 1."
            className="rounded-xl"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <Button className="rounded-xl" onClick={() => setApprove(true)}>
              <CheckCircle2 className="mr-2 size-4" /> Approve extraction
            </Button>
            <Button variant="outline" className="rounded-xl text-destructive" onClick={() => setReject(true)}>
              <XCircle className="mr-2 size-4" /> Reject
            </Button>
            <Button variant="outline" className="rounded-xl" onClick={() => setStep("link")}>
              <Link2 className="mr-2 size-4" /> Link records
            </Button>
            <Button
              variant="ghost"
              className="rounded-xl"
              onClick={() => toast("Comment saved to the document thread")}
            >
              <MessageSquare className="mr-2 size-4" /> Save comment
            </Button>
          </div>
        </SectionCard>
      </div>

      <Dialog open={approve} onOpenChange={setApprove}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader><DialogTitle>Approve extracted data?</DialogTitle></DialogHeader>
          <div className="space-y-3 text-sm">
            <p className="text-muted-foreground">
              {fields.length} fields will be written to {doc.po} and the GRN posting queue.
            </p>
            <div className="rounded-xl border p-3 text-xs">
              <div className="flex justify-between"><span className="text-muted-foreground">Average confidence</span><span className="font-semibold">{avg.toFixed(1)}%</span></div>
              <div className="mt-1 flex justify-between"><span className="text-muted-foreground">Manually corrected</span><span className="font-semibold">{fields.filter((f) => f.confidence === 100).length} fields</span></div>
              <div className="mt-1 flex justify-between"><span className="text-muted-foreground">Approver</span><span className="font-semibold">R. Deshmukh (EMP-2041)</span></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-xl" onClick={() => setApprove(false)}>Cancel</Button>
            <Button className="rounded-xl" onClick={() => { setApprove(false); setStep("link"); toast.success("Extraction approved — now link the document"); }}>
              Confirm approval
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={reject} onOpenChange={setReject}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader><DialogTitle>Reject this extraction</DialogTitle></DialogHeader>
          <Textarea placeholder="Reason for rejection (sent to the uploader)…" className="rounded-xl" defaultValue="Quantity column does not match ASN-88431. Please re-scan page 2." />
          <DialogFooter>
            <Button variant="outline" className="rounded-xl" onClick={() => setReject(false)}>Cancel</Button>
            <Button variant="destructive" className="rounded-xl" onClick={() => { setReject(false); toast.error("Extraction rejected — uploader notified"); navigate({ to: "/document-flow/ocr" }); }}>
              Reject extraction
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>,
    <Button variant="outline" className="rounded-xl" asChild>
      <Link to="/document-flow/documents/$id" params={{ id: doc.id }} search={{ tab: "details" }}>Document details</Link>
    </Button>,
  );
}
