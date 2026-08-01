import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  CheckCircle2,
  ClipboardCheck,
  FileWarning,
  ScanLine,
  ShieldAlert,
  Trash2,
  Upload,
  XCircle,
  PenLine,
  Boxes,
  Loader2,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { EmptyState, Field, SectionCard, StatusBadge, Timeline } from "@/apps/quality-gatekeeper/components/wms/bits";
import { PhotoGallery } from "@/apps/quality-gatekeeper/components/wms/PhotoGallery";
import { CHECKLIST_CATEGORIES, PHOTOS } from "@/apps/quality-gatekeeper/lib/wms-data";
import { actions, useGrn } from "@/apps/quality-gatekeeper/lib/wms-store";

export const Route = createFileRoute("/quality-gatekeeper/inspect/$grn")({
  head: () => ({
    meta: [
      { title: "Inspection Workbench — AXIOM WMS Quality" },
      { name: "description", content: "Guided quality inspection: checklist, sampling plan, product verification, photo evidence, damage reporting and approval." },
      { property: "og:title", content: "Inspection Workbench — AXIOM WMS Quality" },
      { property: "og:description", content: "Checklist, sampling, verification, evidence and approval in one guided workbench." },
    ],
  }),
  component: Workbench,
});

type Verdict = "pass" | "fail" | "na";
const STEPS = [
  { key: "checklist", label: "Checklist", icon: ClipboardCheck },
  { key: "sampling", label: "Sampling", icon: Boxes },
  { key: "verification", label: "Verification", icon: ScanLine },
  { key: "photos", label: "Photo Evidence", icon: Camera },
  { key: "damage", label: "Damage Report", icon: ShieldAlert },
  { key: "approval", label: "Approval", icon: PenLine },
  { key: "summary", label: "Summary", icon: CheckCircle2 },
] as const;

const DAMAGE_TYPES = ["Transit Damage", "Packing Damage", "Water Damage", "Broken", "Missing Parts", "Wrong Item", "Quantity Damage"];

function Workbench() {
  const { grn: id } = useParams({ from: "/quality-gatekeeper/inspect/$grn" });
  const grn = useGrn(id);
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [verdicts, setVerdicts] = useState<Record<string, Verdict>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [sampleSize, setSampleSize] = useState(32);
  const [sampleAccepted, setSampleAccepted] = useState(30);
  const [scanInput, setScanInput] = useState("");
  const [photos, setPhotos] = useState([
    { src: PHOTOS.overall, label: "Overall shipment", meta: "Auto-captured · Dock camera", comment: "Pallet intact, shrink wrap sealed." },
    { src: PHOTOS.label, label: "Carton label", meta: "Label verification", comment: "Material code matches PO line 10." },
  ]);
  const [damageType, setDamageType] = useState(DAMAGE_TYPES[0]!);
  const [severity, setSeverity] = useState("Major");
  const [damageQty, setDamageQty] = useState(4);
  const [remarks, setRemarks] = useState("");
  const [result, setResult] = useState<"PASS" | "FAIL" | "PARTIAL PASS">("PASS");
  const [signed, setSigned] = useState(false);
  const [ncrOpen, setNcrOpen] = useState(false);
  const [confirmApprove, setConfirmApprove] = useState(false);
  const [posting, setPosting] = useState(false);
  const [ncrId, setNcrId] = useState<string | null>(null);

  const allItems = useMemo(() => CHECKLIST_CATEGORIES.flatMap((c) => c.items.map((i) => `${c.category}::${i}`)), []);
  const answered = allItems.filter((k) => verdicts[k]).length;
  const failedItems = allItems.filter((k) => verdicts[k] === "fail");
  const checklistProgress = Math.round((answered / allItems.length) * 100);

  if (!grn) {
    return (
      <EmptyState
        icon={<ClipboardCheck className="h-6 w-6" />}
        title="Inspection not available"
        description="This GRN is no longer in your inspection queue. It may have been reassigned or already dispositioned."
        action={
          <Button asChild variant="outline" size="sm">
            <Link to="/quality-gatekeeper/queue">Back to queue</Link>
          </Button>
        }
      />
    );
  }

  const totals = grn.lines.reduce(
    (acc, l) => ({
      expected: acc.expected + l.expected,
      received: acc.received + l.received,
      accepted: acc.accepted + (l.accepted || 0),
      rejected: acc.rejected + (l.rejected || 0),
    }),
    { expected: 0, received: 0, accepted: 0, rejected: 0 },
  );
  const acceptedQty = totals.accepted || Math.max(totals.received - damageQty, 0);
  const rejectedQty = totals.rejected || (result === "PASS" ? 0 : damageQty);
  const passPct = totals.received ? Math.round((acceptedQty / totals.received) * 1000) / 10 : 0;

  const current = STEPS[step]!;

  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <Button asChild variant="ghost" size="sm" className="-ml-2 gap-1.5">
        <Link to="/quality-gatekeeper/inspection/$grn" params={{ grn: grn.id }}>
          <ArrowLeft className="h-4 w-4" /> Inspection details
        </Link>
      </Button>

      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:flex-wrap sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Inspection Workbench</p>
          <h1 className="num truncate font-mono text-2xl font-bold sm:text-3xl">{grn.grn}</h1>
          <p className="mt-1 truncate text-sm text-muted-foreground">
            {grn.vendor} · {grn.material}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <StatusBadge status={grn.status} />
          <span className="rounded-lg bg-info-soft px-2.5 py-1 text-xs font-semibold text-primary">Inspector: {grn.inspector}</span>
        </div>
      </header>

      {/* Stepper */}
      <nav className="glass-panel flex gap-1 overflow-x-auto rounded-2xl p-2">
        {STEPS.map((s, i) => (
          <button
            key={s.key}
            onClick={() => setStep(i)}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-colors",
              i === step ? "bg-primary text-primary-foreground" : i < step ? "bg-success-soft text-success" : "text-muted-foreground hover:bg-accent",
            )}
          >
            <s.icon className="h-4 w-4" />
            <span className="whitespace-nowrap">
              {i + 1}. {s.label}
            </span>
          </button>
        ))}
      </nav>

      {/* STEP 1 — CHECKLIST */}
      {current.key === "checklist" && (
        <SectionCard
          title="Inspection checklist"
          description={`${answered} of ${allItems.length} checkpoints answered · ${failedItems.length} failure(s)`}
          action={
            <div className="flex items-center gap-3">
              <Progress value={checklistProgress} className="h-1.5 w-32" />
              <span className="num text-xs font-semibold">{checklistProgress}%</span>
            </div>
          }
        >
          <div className="grid gap-4 lg:grid-cols-2">
            {CHECKLIST_CATEGORIES.map((cat) => (
              <div key={cat.category} className="rounded-xl border border-border">
                <p className="border-b border-border bg-muted/50 px-4 py-2.5 text-xs font-bold tracking-wide uppercase">{cat.category}</p>
                <ul className="divide-y divide-border">
                  {cat.items.map((item) => {
                    const key = `${cat.category}::${item}`;
                    const v = verdicts[key];
                    return (
                      <li key={key} className="px-4 py-3">
                        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                          <p className="min-w-0 truncate text-sm">{item}</p>
                          <div className="flex shrink-0 gap-1">
                            {(["pass", "fail", "na"] as Verdict[]).map((opt) => (
                              <button
                                key={opt}
                                onClick={() => setVerdicts((p) => ({ ...p, [key]: opt }))}
                                className={cn(
                                  "rounded-lg border px-2.5 py-1 text-[11px] font-semibold uppercase transition-colors",
                                  v === opt && opt === "pass" && "border-success bg-success text-success-foreground",
                                  v === opt && opt === "fail" && "border-destructive bg-destructive text-destructive-foreground",
                                  v === opt && opt === "na" && "border-muted-foreground bg-muted-foreground text-background",
                                  v !== opt && "border-border text-muted-foreground hover:bg-accent",
                                )}
                              >
                                {opt === "na" ? "N/A" : opt}
                              </button>
                            ))}
                          </div>
                        </div>
                        {v === "fail" && (
                          <Textarea
                            value={comments[key] ?? ""}
                            onChange={(e) => setComments((p) => ({ ...p, [key]: e.target.value }))}
                            placeholder="Describe the non-conformance (mandatory for FAIL)…"
                            className="mt-2 min-h-16 text-xs"
                          />
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* STEP 2 — SAMPLING */}
      {current.key === "sampling" && (
        <div className="grid gap-5 lg:grid-cols-3">
          <SectionCard className="lg:col-span-2" title="Sampling plan" description="ISO 2859-1 General Inspection Level II">
            <div className="grid gap-3 sm:grid-cols-3">
              {(["100% Inspection", "Random Sampling", "AQL Sampling"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    actions.setInspectionType(grn.id, t);
                    setSampleSize(t === "100% Inspection" ? grn.qty : t === "Random Sampling" ? 20 : 32);
                  }}
                  className={cn(
                    "rounded-xl border p-4 text-left transition-colors",
                    grn.inspectionType === t ? "border-primary bg-info-soft" : "border-border hover:bg-accent",
                  )}
                >
                  <p className="text-sm font-semibold">{t}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t === "100% Inspection" ? "Every unit inspected — used for critical or high-value materials." : t === "Random Sampling" ? "Fixed random subset, no statistical acceptance number." : "AQL 1.0 normal severity with accept/reject numbers."}
                  </p>
                </button>
              ))}
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-4">
              <div>
                <Label className="text-xs">Lot size</Label>
                <Input readOnly value={grn.qty} className="num mt-1.5" />
              </div>
              <div>
                <Label className="text-xs">Sample size</Label>
                <Input type="number" value={sampleSize} onChange={(e) => setSampleSize(Number(e.target.value))} className="num mt-1.5" />
              </div>
              <div>
                <Label className="text-xs">Accepted</Label>
                <Input type="number" value={sampleAccepted} onChange={(e) => setSampleAccepted(Number(e.target.value))} className="num mt-1.5" />
              </div>
              <div>
                <Label className="text-xs">Rejected</Label>
                <Input readOnly value={Math.max(sampleSize - sampleAccepted, 0)} className="num mt-1.5" />
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Acceptance decision" description="AQL 1.0 · Ac 1 / Re 2">
            <div
              className={cn(
                "rounded-2xl border p-5 text-center",
                sampleSize - sampleAccepted <= 1 ? "border-success/30 bg-success-soft" : "border-destructive/30 bg-destructive-soft",
              )}
            >
              <p className="text-xs font-semibold tracking-wide uppercase">Lot verdict</p>
              <p className={cn("mt-2 text-3xl font-extrabold", sampleSize - sampleAccepted <= 1 ? "text-success" : "text-destructive")}>
                {sampleSize - sampleAccepted <= 1 ? "ACCEPT" : "REJECT"}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                {Math.max(sampleSize - sampleAccepted, 0)} defective in sample of {sampleSize}
              </p>
            </div>
            <div className="mt-4 space-y-3">
              <Field label="Defect rate" value={`${((Math.max(sampleSize - sampleAccepted, 0) / Math.max(sampleSize, 1)) * 100).toFixed(2)} %`} />
              <Field label="Inspection level" value="General Level II · Normal" />
              <Field label="Switching rule" value="Normal → Tightened after 2 rejected lots" />
            </div>
          </SectionCard>
        </div>
      )}

      {/* STEP 3 — PRODUCT VERIFICATION */}
      {current.key === "verification" && (
        <SectionCard
          title="Product verification"
          description="Scan each material barcode to validate against the purchase order"
          action={
            <div className="flex items-center gap-2">
              <div className="relative">
                <ScanLine className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-primary" />
                <Input
                  value={scanInput}
                  onChange={(e) => setScanInput(e.target.value)}
                  placeholder="Scan or type barcode…"
                  className="num h-9 w-56 pl-9 font-mono text-xs"
                />
              </div>
              <Button
                size="sm"
                onClick={() => {
                  const line = grn.lines.find((l) => l.barcode === scanInput.trim() || l.code === scanInput.trim());
                  if (line) {
                    actions.updateLine(grn.id, line.code, { scanned: true });
                    toast.success(`Barcode validated — ${line.code}`, { description: line.name });
                  } else {
                    toast.error("Barcode not found on this GRN", { description: "Material does not belong to PO " + grn.po });
                  }
                  setScanInput("");
                }}
              >
                Validate
              </Button>
            </div>
          }
        >
          <div className="space-y-3">
            {grn.lines.map((l) => (
              <div key={l.code} className="grid gap-4 rounded-xl border border-border p-4 lg:grid-cols-[120px_minmax(0,1fr)]">
                <img src={l.image} alt={l.name} loading="lazy" width={960} height={640} className="h-24 w-full rounded-lg object-cover lg:h-full" />
                <div className="min-w-0 space-y-3">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                    <div className="min-w-0">
                      <p className="num font-mono text-sm font-bold text-primary">{l.code}</p>
                      <p className="truncate text-sm">{l.name}</p>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-semibold",
                        l.scanned ? "bg-success-soft text-success" : "bg-muted text-muted-foreground",
                      )}
                    >
                      {l.scanned ? "Barcode verified" : "Not scanned"}
                    </span>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
                    <Field label="Expected" value={`${l.expected} ${l.uom}`} mono />
                    <Field label="Received" value={`${l.received} ${l.uom}`} mono />
                    <div>
                      <Label className="text-[11px] tracking-wide text-muted-foreground uppercase">Accepted</Label>
                      <Input
                        type="number"
                        value={l.accepted}
                        onChange={(e) => actions.updateLine(grn.id, l.code, { accepted: Number(e.target.value) })}
                        className="num mt-1 h-9"
                      />
                    </div>
                    <div>
                      <Label className="text-[11px] tracking-wide text-muted-foreground uppercase">Rejected</Label>
                      <Input
                        type="number"
                        value={l.rejected}
                        onChange={(e) => actions.updateLine(grn.id, l.code, { rejected: Number(e.target.value) })}
                        className="num mt-1 h-9"
                      />
                    </div>
                    <Field label="Batch" value={l.batch} mono />
                    <Field label="Serial" value={l.serial} mono />
                  </div>
                  <p className="num font-mono text-[11px] text-muted-foreground">Barcode: {l.barcode}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* STEP 4 — PHOTO EVIDENCE */}
      {current.key === "photos" && (
        <SectionCard
          title="Photo evidence"
          description="Minimum 4 evidence photos required for dispositions with rejections"
          action={
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => {
                  const pool = [
                    { src: PHOTOS.damage, label: "Damaged item", meta: "Captured now · Inspector camera", comment: "Crushed corner with water staining." },
                    { src: PHOTOS.serial, label: "Serial plate", meta: "Captured now · Inspector camera", comment: "Serial legible and matches packing list." },
                    { src: PHOTOS.overall, label: "Packaging", meta: "Captured now · Inspector camera", comment: "Pallet stacking within height limit." },
                  ];
                  setPhotos((p) => [...p, pool[p.length % pool.length]!]);
                  toast.success("Photo captured", { description: "Uploaded to evidence vault · 2.4 MB" });
                }}
              >
                <Camera className="h-4 w-4" /> Capture
              </Button>
              <Button size="sm" variant="outline" onClick={() => toast.info("File picker", { description: "Select JPG/PNG up to 10 MB" })}>
                <Upload className="h-4 w-4" /> Upload
              </Button>
            </div>
          }
        >
          <div className="mb-4 grid gap-2 sm:grid-cols-5">
            {["Overall Shipment", "Damaged Item", "Packaging", "Label", "Serial Plate"].map((t) => (
              <div key={t} className="rounded-xl border border-dashed border-border px-3 py-2.5 text-center text-[11px] font-medium text-muted-foreground">
                {t}
              </div>
            ))}
          </div>
          <PhotoGallery photos={photos} />
          <p className="mt-4 text-xs text-muted-foreground">
            Click any photo to open the gallery — zoom, add markup annotations and comments. All evidence is timestamped and audit-locked.
          </p>
        </SectionCard>
      )}

      {/* STEP 5 — DAMAGE REPORTING */}
      {current.key === "damage" && (
        <div className="grid gap-5 lg:grid-cols-3">
          <SectionCard className="lg:col-span-2" title="Damage reporting" description="Recorded against GRN and vendor scorecard">
            <div className="space-y-5">
              <div>
                <Label className="text-xs">Damage type</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {DAMAGE_TYPES.map((t) => (
                    <button
                      key={t}
                      onClick={() => setDamageType(t)}
                      className={cn(
                        "rounded-xl border px-3 py-2 text-xs font-medium transition-colors",
                        damageType === t ? "border-primary bg-info-soft text-primary" : "border-border hover:bg-accent",
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <Label className="text-xs">Severity</Label>
                  <Select value={severity} onValueChange={setSeverity}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Minor">Minor — cosmetic, usable</SelectItem>
                      <SelectItem value="Major">Major — function affected</SelectItem>
                      <SelectItem value="Critical">Critical — safety / unusable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Damaged quantity</Label>
                  <Input type="number" value={damageQty} onChange={(e) => setDamageQty(Number(e.target.value))} className="num mt-1.5" />
                </div>
                <div>
                  <Label className="text-xs">Affected material</Label>
                  <Select defaultValue={grn.lines[0]!.code}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {grn.lines.map((l) => (
                        <SelectItem key={l.code} value={l.code}>
                          {l.code} — {l.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-xs">Remarks</Label>
                <Textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. Two cartons on the bottom tier crushed; water ingress observed on pallet base. Driver acknowledged on delivery note."
                  className="mt-1.5 min-h-28"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => toast.success("Damage photo attached")}>
                  <Camera className="h-4 w-4" /> Attach photo
                </Button>
                <Button variant="outline" size="sm" onClick={() => toast.success("Video evidence attached", { description: "damage_clip_004871.mp4 · 18s" })}>
                  <Video className="h-4 w-4" /> Attach video
                </Button>
                <Button variant="ghost" size="sm" onClick={() => { setRemarks(""); setDamageQty(0); }}>
                  <Trash2 className="h-4 w-4" /> Clear
                </Button>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Damage evidence" description="Linked to NCR when raised">
            <PhotoGallery
              className="grid-cols-2 lg:grid-cols-2"
              photos={[
                { src: PHOTOS.damage, label: "Crushed carton", meta: `${damageType} · ${severity}`, comment: remarks || "Awaiting inspector remarks." },
                { src: PHOTOS.overall, label: "Pallet context", meta: "Wide shot for claim" },
              ]}
            />
            <div className="mt-4 rounded-xl bg-warning-soft p-3 text-xs text-warning-foreground">
              Damage of severity <strong>{severity}</strong> automatically proposes an NCR and blocks {damageQty} {grn.uom} in quality hold.
            </div>
          </SectionCard>
        </div>
      )}

      {/* STEP 6 — APPROVAL */}
      {current.key === "approval" && (
        <div className="grid gap-5 lg:grid-cols-3">
          <SectionCard className="lg:col-span-2" title="Inspector approval" description="Digital sign-off is legally binding and audit-logged">
            <div className="grid gap-3 sm:grid-cols-3">
              {(["PASS", "FAIL", "PARTIAL PASS"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setResult(r)}
                  className={cn(
                    "rounded-2xl border-2 p-5 text-center transition-colors",
                    result === r && r === "PASS" && "border-success bg-success-soft",
                    result === r && r === "FAIL" && "border-destructive bg-destructive-soft",
                    result === r && r === "PARTIAL PASS" && "border-warning bg-warning-soft",
                    result !== r && "border-border hover:bg-accent",
                  )}
                >
                  <p className="text-lg font-extrabold">{r}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {r === "PASS" ? "Release full quantity" : r === "FAIL" ? "Block lot & raise NCR" : "Split accept / reject"}
                  </p>
                </button>
              ))}
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="text-xs">Inspector</Label>
                <Input readOnly value={grn.inspector} className="mt-1.5" />
              </div>
              <div>
                <Label className="text-xs">Date & time</Label>
                <Input readOnly value="01 Aug 2026, 10:52 IST" className="mt-1.5" />
              </div>
            </div>

            <div className="mt-5">
              <Label className="text-xs">Digital signature</Label>
              <button
                onClick={() => setSigned(true)}
                className={cn(
                  "mt-1.5 grid h-32 w-full place-items-center rounded-xl border-2 border-dashed transition-colors",
                  signed ? "border-success bg-success-soft" : "border-border hover:bg-accent",
                )}
              >
                {signed ? (
                  <span className="text-center">
                    <span className="block font-[cursive] text-3xl text-success">{grn.inspector}</span>
                    <span className="mt-1 block text-[11px] text-muted-foreground">Signed 01 Aug 2026, 10:52 · Cert #QA-8841</span>
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">Tap to sign — draw or apply certified e-signature</span>
                )}
              </button>
            </div>

            <label className="mt-4 flex items-start gap-2.5 text-xs text-muted-foreground">
              <Checkbox className="mt-0.5" defaultChecked />
              I confirm the inspection was performed per SOP-QA-014 and the evidence recorded is accurate.
            </label>

            <div className="mt-5 flex flex-wrap gap-2">
              <Button
                className="rounded-xl"
                disabled={!signed}
                onClick={() => {
                  if (result === "FAIL") {
                    setNcrOpen(true);
                  } else {
                    setConfirmApprove(true);
                  }
                }}
              >
                <CheckCircle2 className="h-4 w-4" /> Approve inspection
              </Button>
              <Button
                variant="destructive"
                className="rounded-xl"
                disabled={!signed}
                onClick={() => {
                  setResult("FAIL");
                  setNcrOpen(true);
                }}
              >
                <XCircle className="h-4 w-4" /> Reject lot
              </Button>
              {!signed && <p className="self-center text-xs text-destructive">Digital signature is required before approval.</p>}
            </div>
          </SectionCard>

          <SectionCard title="Disposition preview" description="What happens after approval">
            <ul className="space-y-3 text-xs">
              {[
                { t: "PASS", d: "Accepted quantity posted from QA staging to unrestricted stock; warehouse notified." },
                { t: "PARTIAL PASS", d: "Accepted split to available stock, rejected split to QA-HOLD with NCR proposal." },
                { t: "FAIL", d: "Full lot blocked in QA-HOLD, NCR raised, procurement and vendor notified." },
              ].map((x) => (
                <li key={x.t} className={cn("rounded-xl border p-3", result === x.t ? "border-primary bg-info-soft" : "border-border")}>
                  <p className="text-sm font-semibold">{x.t}</p>
                  <p className="mt-1 text-muted-foreground">{x.d}</p>
                </li>
              ))}
            </ul>
          </SectionCard>
        </div>
      )}

      {/* STEP 7 — SUMMARY */}
      {current.key === "summary" && (
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryTile label="Inspection result" value={result} tone={result === "PASS" ? "success" : result === "FAIL" ? "danger" : "warning"} />
            <SummaryTile label="Pass %" value={`${passPct}%`} tone="success" />
            <SummaryTile label="Rejected %" value={`${(100 - passPct).toFixed(1)}%`} tone="danger" />
            <SummaryTile label="Inspection time" value="46 min" tone="primary" />
          </div>

          <div className="grid gap-5 xl:grid-cols-3">
            <SectionCard className="xl:col-span-2" title="Quantity disposition" description="Posted to EWM on approval">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Material</TableHead>
                      <TableHead className="text-right">Received</TableHead>
                      <TableHead className="text-right">Accepted</TableHead>
                      <TableHead className="text-right">Rejected</TableHead>
                      <TableHead>Destination bin</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {grn.lines.map((l) => (
                      <TableRow key={l.code}>
                        <TableCell className="text-xs">
                          <span className="num font-mono font-semibold text-primary">{l.code}</span> — {l.name}
                        </TableCell>
                        <TableCell className="num text-right text-xs">{l.received.toLocaleString()}</TableCell>
                        <TableCell className="num text-right text-xs font-semibold text-success">{(l.accepted || l.received).toLocaleString()}</TableCell>
                        <TableCell className="num text-right text-xs font-semibold text-destructive">{l.rejected.toLocaleString()}</TableCell>
                        <TableCell className="num font-mono text-xs">{l.rejected > 0 ? "QA-HOLD-01" : "WH-A-12-03"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  className="rounded-xl"
                  onClick={() => setConfirmApprove(true)}
                >
                  <Boxes className="h-4 w-4" /> Move to inventory
                </Button>
                <Button variant="destructive" className="rounded-xl" onClick={() => setNcrOpen(true)}>
                  <FileWarning className="h-4 w-4" /> Generate NCR
                </Button>
              </div>
            </SectionCard>

            <SectionCard title="Inspection timeline" description="Immutable audit trail">
              <Timeline items={grn.timeline} />
            </SectionCard>
          </div>

          <SectionCard title="Evidence pack" description={`${photos.length} photos attached to ${grn.grn}`}>
            <PhotoGallery photos={photos} />
          </SectionCard>
        </div>
      )}

      {/* Wizard nav */}
      <div className="glass-panel sticky bottom-4 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl p-3">
        <Button variant="outline" className="rounded-xl" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <p className="min-w-0 truncate text-center text-xs text-muted-foreground">
          Step {step + 1} of {STEPS.length} · {current.label}
        </p>
        <Button className="rounded-xl" disabled={step === STEPS.length - 1} onClick={() => setStep((s) => s + 1)}>
          Next <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      {/* NCR dialog */}
      <Dialog open={ncrOpen} onOpenChange={setNcrOpen}>
        <DialogContent className="max-h-[88vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileWarning className="h-5 w-5 text-destructive" /> Create Non-Conformance Report
            </DialogTitle>
            <DialogDescription>
              NCR is raised against {grn.vendor} for {grn.grn}. Procurement and supplier quality are notified on submit.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="text-xs">NCR number</Label>
              <Input readOnly value="NCR-2026-0319" className="num mt-1.5 font-mono" />
            </div>
            <div>
              <Label className="text-xs">Defect category</Label>
              <Select defaultValue={damageType}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DAMAGE_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Severity</Label>
              <Select value={severity} onValueChange={setSeverity}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Minor">Minor</SelectItem>
                  <SelectItem value="Major">Major</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Responsible department</Label>
              <Select defaultValue="Supplier Quality">
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Supplier Quality">Supplier Quality</SelectItem>
                  <SelectItem value="Procurement">Procurement</SelectItem>
                  <SelectItem value="Logistics">Logistics</SelectItem>
                  <SelectItem value="Warehouse">Warehouse</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs">Root cause</Label>
              <Input defaultValue="Inadequate transit protection on bottom-tier cartons" className="mt-1.5" />
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs">Description of non-conformance</Label>
              <Textarea
                defaultValue={`${damageQty} ${grn.uom} of ${grn.lines[0]!.name} found with ${damageType.toLowerCase()} during ${grn.inspectionType.toLowerCase()} at ${grn.dock}.`}
                className="mt-1.5 min-h-20"
              />
            </div>
            <div>
              <Label className="text-xs">Immediate action</Label>
              <Textarea defaultValue="Block affected quantity in QA-HOLD-01 and segregate pallet." className="mt-1.5 min-h-20" />
            </div>
            <div>
              <Label className="text-xs">Corrective action</Label>
              <Textarea defaultValue="Vendor to replace damaged units within 7 days; 8D report requested." className="mt-1.5 min-h-20" />
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs">Preventive action</Label>
              <Textarea defaultValue="Revise packaging specification PKG-STD-22 and add edge protection clause to supplier agreement." className="mt-1.5 min-h-20" />
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs">Attachments</Label>
              <div className="mt-1.5 flex flex-wrap gap-2">
                {["damage_carton_01.jpg", "pallet_context.jpg", "delivery_note.pdf"].map((f) => (
                  <span key={f} className="num rounded-lg bg-muted px-2.5 py-1 font-mono text-[11px]">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setNcrOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setNcrId("NCR-2026-0319");
                actions.setStatus(grn.id, "NCR Created", "NCR-2026-0319 raised — lot blocked in QA-HOLD-01");
                setNcrOpen(false);
                toast.error("NCR-2026-0319 created", { description: "Procurement and vendor notified · Lot moved to Quality Hold" });
                setStep(STEPS.length - 1);
              }}
            >
              Submit NCR & block lot
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve confirm */}
      <AlertDialog open={confirmApprove} onOpenChange={setConfirmApprove}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Post {acceptedQty.toLocaleString()} {grn.uom} to unrestricted stock?</AlertDialogTitle>
            <AlertDialogDescription>
              This posts a 321 movement in EWM from {grn.storageLocation} to WH-A-12-03, releases the GRN and notifies the warehouse team. The action is
              recorded in the audit log and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setPosting(true);
                setTimeout(() => {
                  setPosting(false);
                  actions.setStatus(grn.id, "Available Inventory", `Inspection ${result} — ${acceptedQty} ${grn.uom} posted to WH-A-12-03`);
                  toast.success("Stock released to available inventory", {
                    description: `${acceptedQty.toLocaleString()} ${grn.uom} posted · Warehouse notified`,
                  });
                  setStep(STEPS.length - 1);
                }, 1100);
              }}
            >
              Confirm & post
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {posting && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-background/70 backdrop-blur-sm">
          <div className="surface-card flex items-center gap-3 rounded-2xl px-6 py-4">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <p className="text-sm font-medium">Posting goods movement to EWM…</p>
          </div>
        </div>
      )}

      {ncrId && rejectedQty > 0 && (
        <div className="glass-panel grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 rounded-2xl border-destructive/30 p-4">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-destructive-soft text-destructive">
            <ShieldAlert className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{ncrId} raised · {rejectedQty.toLocaleString()} {grn.uom} blocked</p>
            <p className="truncate text-xs text-muted-foreground">Choose a disposition: Return to supplier, rework or scrap.</p>
          </div>
          <Button variant="destructive" className="shrink-0 rounded-xl" onClick={() => navigate({ to: "/quality-gatekeeper/rts" })}>
            Initiate RTS
          </Button>
        </div>
      )}
    </div>
  );
}

function SummaryTile({ label, value, tone }: { label: string; value: string; tone: "success" | "danger" | "warning" | "primary" }) {
  const tones = {
    success: "bg-success-soft text-success",
    danger: "bg-destructive-soft text-destructive",
    warning: "bg-warning-soft text-warning-foreground",
    primary: "bg-info-soft text-primary",
  };
  return (
    <div className="surface-card rounded-2xl p-4">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</p>
      <p className={cn("num mt-2 inline-block rounded-lg px-2.5 py-1 text-xl font-extrabold", tones[tone])}>{value}</p>
    </div>
  );
}
