import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ClipboardCheck,
  FlaskConical,
  PackageSearch,
  ScanLine,
  Camera,
  ShieldAlert,
  ListChecks,
  Stamp,
  PackageCheck,
  Check,
  X,
  Minus,
  ChevronLeft,
  ChevronRight,
  Upload,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  PenLine,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { PageHeader, SectionCard } from "@/apps/quality-gatekeeper/components/qm/Primitives";
import { StatusPill } from "@/apps/quality-gatekeeper/components/qm/StatusPill";
import {
  checklistTemplate,
  damageTypes,
  getInspection,
  photoEvidence,
} from "@/apps/quality-gatekeeper/lib/qm-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/quality-gatekeeper/inspection/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.id} Â· Inspection Execution` },
      {
        name: "description",
        content: `Guided inspection workflow: checklist, sampling, verification, evidence and disposition for ${params.id}.`,
      },
      { property: "og:title", content: `${params.id} Â· Inspection Execution` },
      {
        property: "og:description",
        content: "Step-by-step warehouse quality inspection execution workflow.",
      },
    ],
  }),
  component: InspectionWizard,
});

const steps = [
  { key: "checklist", label: "Checklist", icon: ClipboardCheck, screen: "04" },
  { key: "sampling", label: "Sampling Plan", icon: FlaskConical, screen: "05" },
  { key: "verify", label: "Material Verification", icon: PackageSearch, screen: "06" },
  { key: "scan", label: "Barcode & QR", icon: ScanLine, screen: "07" },
  { key: "photos", label: "Photo Evidence", icon: Camera, screen: "08" },
  { key: "damage", label: "Damage Reporting", icon: ShieldAlert, screen: "09" },
  { key: "summary", label: "Summary", icon: ListChecks, screen: "15" },
  { key: "approval", label: "Approval", icon: Stamp, screen: "16" },
  { key: "release", label: "Inventory Release", icon: PackageCheck, screen: "17" },
] as const;

type StepKey = (typeof steps)[number]["key"];

function InspectionWizard() {
  const { id } = Route.useParams();
  const insp = getInspection(id);
  const navigate = useNavigate();

  const [step, setStep] = useState<StepKey>("checklist");
  const [checks, setChecks] = useState(checklistTemplate);
  const [samplingType, setSamplingType] = useState("aql");
  const [scanValue, setScanValue] = useState("");
  const [scans, setScans] = useState([
    {
      code: "8901234567890",
      type: "GS1-128",
      result: "Match",
      detail: "MAT-SS-FLG-0080 Â· B-2026-0741",
    },
    { code: "SN-88231-014", type: "Serial", result: "Match", detail: "Manifest line 2 of 480" },
    {
      code: "QR-88231-PLT3",
      type: "QR",
      result: "Mismatch",
      detail: "Pallet 3 not on ASN manifest",
    },
  ]);
  const [scanning, setScanning] = useState(false);
  const [photos, setPhotos] = useState(photoEvidence);
  const [viewer, setViewer] = useState<(typeof photoEvidence)[number] | null>(null);
  const [damage, setDamage] = useState({
    type: damageTypes[2]!,
    severity: "Major",
    qty: "3",
    remarks: "",
  });
  const [damageDrawer, setDamageDrawer] = useState(false);
  const [signed, setSigned] = useState(false);
  const [decision, setDecision] = useState<"PASS" | "FAIL" | "PARTIAL">("PARTIAL");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [released, setReleased] = useState(false);

  const idx = steps.findIndex((s) => s.key === step);
  const answered = checks.filter((c) => c.result).length;
  const failed = checks.filter((c) => c.result === "FAIL").length;
  const progress = Math.round(((idx + 1) / steps.length) * 100);

  const setResult = (cid: string, result: "PASS" | "FAIL" | "NA") =>
    setChecks((cs) => cs.map((c) => (c.id === cid ? { ...c, result } : c)));

  const go = (dir: 1 | -1) => {
    const next = steps[Math.min(steps.length - 1, Math.max(0, idx + dir))];
    if (next) setStep(next.key);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const groups = [...new Set(checks.map((c) => c.group))];

  return (
    <>
      <PageHeader
        breadcrumb={[
          { label: "Quality", to: "/quality-gatekeeper" },
          { label: "Inspection Queue", to: "/quality-gatekeeper/queue" },
          { label: insp.id, to: "/quality-gatekeeper/queue/$id" },
          { label: "Execution" },
        ]}
        eyebrow={`Screen ${steps[idx]?.screen} Â· Step ${idx + 1} of ${steps.length}`}
        title={steps[idx]?.label ?? "Inspection"}
        description={`${insp.id} Â· ${insp.material} Â· ${insp.qty} ${insp.uom} Â· ${insp.vendor}`}
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                toast("Draft saved", { description: "Resume any time from the queue" })
              }
            >
              Save draft
            </Button>
            <Button variant="outline" size="sm" className="text-destructive" asChild>
              <Link to="/quality-gatekeeper/queue">Abort</Link>
            </Button>
          </>
        }
      />

      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>Inspection progress</span>
          <span className="num">{progress}%</span>
        </div>
        <Progress value={progress} className="h-1.5" />
        <div className="mt-3 -mx-1 flex gap-1.5 overflow-x-auto pb-1">
          {steps.map((s, i) => (
            <button
              key={s.key}
              onClick={() => setStep(s.key)}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-xl border px-3 py-1.5 text-[11px] font-medium transition-colors",
                i === idx
                  ? "border-primary bg-primary text-primary-foreground"
                  : i < idx
                    ? "border-success/30 bg-success/10 text-success"
                    : "border-border bg-card text-muted-foreground hover:bg-accent/40",
              )}
            >
              <s.icon className="h-3.5 w-3.5" />
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* STEP: CHECKLIST */}
      {step === "checklist" && (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
          <div className="space-y-3">
            {groups.map((g) => (
              <SectionCard key={g} title={g} padded={false}>
                <ul className="divide-y divide-border">
                  {checks
                    .filter((c) => c.group === g)
                    .map((c) => (
                      <li
                        key={c.id}
                        className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-xs font-medium">
                            <span className="num mr-2 text-muted-foreground">{c.id}</span>
                            {c.label}
                          </p>
                          <p className="truncate text-[11px] text-muted-foreground">
                            Spec: {c.spec}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          {(["PASS", "FAIL", "NA"] as const).map((r) => (
                            <button
                              key={r}
                              onClick={() => setResult(c.id, r)}
                              className={cn(
                                "grid h-8 w-8 place-items-center rounded-lg border transition-colors",
                                c.result === r
                                  ? r === "PASS"
                                    ? "border-success bg-success text-success-foreground"
                                    : r === "FAIL"
                                      ? "border-destructive bg-destructive text-destructive-foreground"
                                      : "border-muted-foreground/40 bg-muted text-muted-foreground"
                                  : "border-border bg-background text-muted-foreground hover:bg-accent/50",
                              )}
                              aria-label={`${c.label} ${r}`}
                            >
                              {r === "PASS" ? (
                                <Check className="h-4 w-4" />
                              ) : r === "FAIL" ? (
                                <X className="h-4 w-4" />
                              ) : (
                                <Minus className="h-4 w-4" />
                              )}
                            </button>
                          ))}
                        </div>
                      </li>
                    ))}
                </ul>
              </SectionCard>
            ))}
          </div>
          <div className="space-y-3">
            <SectionCard title="Checklist status">
              <div className="space-y-2 text-xs">
                <Row l="Template" v="QM-TPL-FLANGE-A2" />
                <Row l="Items answered" v={`${answered} / ${checks.length}`} />
                <Row l="Failures" v={String(failed)} tone={failed ? "danger" : "success"} />
                <Row l="Inspector" v={insp.inspector} />
              </div>
              {answered < checks.length && (
                <div className="mt-3 flex gap-2 rounded-xl border border-warning/30 bg-warning/10 p-3 text-[11px]">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>
                    All checklist items must be answered before the inspection can be submitted for
                    approval.
                  </span>
                </div>
              )}
              <Button
                className="mt-3 w-full"
                size="sm"
                onClick={() =>
                  setChecks((cs) => cs.map((c) => ({ ...c, result: c.result ?? "PASS" })))
                }
              >
                Mark remaining as PASS
              </Button>
            </SectionCard>
            <SectionCard title="Reference specification">
              <p className="text-[11px] text-muted-foreground">
                Drawing DRW-88231-R3 Â· Standard ASME B16.5 Â· Acceptance per ITP-QM-2026-014.
                Deviations require Quality Manager concession approval.
              </p>
            </SectionCard>
          </div>
        </div>
      )}

      {/* STEP: SAMPLING */}
      {step === "sampling" && (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
          <SectionCard
            title="Sampling plan"
            description="ISO 2859-1 / ANSI Z1.4 inspection by attributes"
          >
            <RadioGroup
              value={samplingType}
              onValueChange={setSamplingType}
              className="grid gap-3 sm:grid-cols-3"
            >
              {[
                {
                  v: "100",
                  t: "100% Inspection",
                  d: "Every unit inspected â€” critical / safety items",
                },
                { v: "random", t: "Random Sampling", d: "Fixed percentage drawn at random" },
                { v: "aql", t: "AQL Sampling", d: "Statistical acceptance sampling" },
              ].map((o) => (
                <label
                  key={o.v}
                  className={cn(
                    "cursor-pointer rounded-xl border p-3 transition-colors",
                    samplingType === o.v
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-accent/40",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value={o.v} />
                    <span className="text-xs font-semibold">{o.t}</span>
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">{o.d}</p>
                </label>
              ))}
            </RadioGroup>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <Field label="Inspection level">
                <Select defaultValue="II">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="I">General Level I</SelectItem>
                    <SelectItem value="II">General Level II</SelectItem>
                    <SelectItem value="III">General Level III</SelectItem>
                    <SelectItem value="S3">Special S-3</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="AQL (major)">
                <Select defaultValue="1.0">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["0.065", "0.25", "0.65", "1.0", "1.5", "2.5", "4.0"].map((a) => (
                      <SelectItem key={a} value={a}>
                        {a}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Severity">
                <Select defaultValue="normal">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reduced">Reduced</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="tightened">Tightened</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat l="Lot size" v={`${insp.qty}`} />
              <Stat l="Sample size (code H)" v="50" tone="brand" />
              <Stat l="Accept (Ac)" v="1" tone="success" />
              <Stat l="Reject (Re)" v="2" tone="danger" />
            </div>

            <div className="mt-4 rounded-xl border border-border bg-background/60 p-3">
              <p className="text-xs font-semibold">Sampling rule applied</p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Lot size 480 â†’ sample size code letter H â†’ 50 units. Accept on â‰¤1 major
                defect, reject on â‰¥2. Any critical defect results in immediate lot rejection
                regardless of AQL outcome.
              </p>
            </div>
          </SectionCard>

          <SectionCard title="Sample draw log">
            <ul className="space-y-2 text-[11px]">
              {[
                "Pallet 1 Â· units 003, 018, 044",
                "Pallet 2 Â· units 112, 137, 160",
                "Pallet 3 Â· units 221, 244, 260",
                "Pallet 4 Â· units 318, 351, 402",
              ].map((s) => (
                <li
                  key={s}
                  className="flex items-center gap-2 rounded-lg border border-border bg-background/60 px-3 py-2"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-success" />
                  <span className="min-w-0 truncate">{s}</span>
                </li>
              ))}
            </ul>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 w-full"
              onClick={() => toast.success("Random draw regenerated (seed 7741)")}
            >
              Regenerate random draw
            </Button>
          </SectionCard>
        </div>
      )}

      {/* STEP: MATERIAL VERIFICATION */}
      {step === "verify" && (
        <SectionCard
          title="Material verification"
          description="Confirm accepted and rejected quantities per line"
          padded={false}
        >
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Material</TableHead>
                  <TableHead>Batch / Serial</TableHead>
                  <TableHead className="text-right">Expected</TableHead>
                  <TableHead className="text-right">Received</TableHead>
                  <TableHead className="w-28 text-right">Accepted</TableHead>
                  <TableHead className="w-28 text-right">Rejected</TableHead>
                  <TableHead>Result</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {insp.lines.map((l) => (
                  <TableRow key={l.code}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={l.image}
                          alt={l.name}
                          loading="lazy"
                          className="h-11 w-14 shrink-0 rounded-lg object-cover"
                        />
                        <div className="min-w-0">
                          <p className="truncate text-xs font-medium">{l.name}</p>
                          <p className="num text-[10px] text-muted-foreground">{l.code}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="num text-[11px]">
                      {l.batch}
                      <p className="text-muted-foreground">{l.serial}</p>
                    </TableCell>
                    <TableCell className="num text-right text-xs">{l.expected}</TableCell>
                    <TableCell className="num text-right text-xs">{l.received}</TableCell>
                    <TableCell>
                      <Input
                        defaultValue={l.accepted || l.received}
                        className="num h-8 text-right text-xs"
                      />
                    </TableCell>
                    <TableCell>
                      <Input defaultValue={l.rejected} className="num h-8 text-right text-xs" />
                    </TableCell>
                    <TableCell>
                      <StatusPill tone={l.rejected > 0 ? "danger" : "success"}>
                        {l.rejected > 0 ? "Partial" : "Accepted"}
                      </StatusPill>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="border-t border-border p-4 text-[11px] text-muted-foreground">
            Accepted + Rejected must equal Received for every line. Variances post a short-shipment
            notice to Procurement.
          </div>
        </SectionCard>
      )}

      {/* STEP: SCAN */}
      {step === "scan" && (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <SectionCard
            title="Scanner"
            description="Barcode Â· QR Â· Serial Â· Batch â€” auto validation against ASN manifest"
          >
            <div className="relative grid h-[280px] place-items-center overflow-hidden rounded-2xl border border-border bg-foreground/90">
              <div className="absolute inset-x-10 inset-y-14 rounded-xl border-2 border-dashed border-primary-foreground/40" />
              <div
                className={cn(
                  "absolute inset-x-10 h-0.5 bg-primary",
                  scanning ? "animate-pulse" : "",
                )}
                style={{ top: "50%" }}
              />
              <div className="relative text-center text-primary-foreground">
                <ScanLine className="mx-auto h-9 w-9 opacity-80" />
                <p className="mt-2 text-xs opacity-80">
                  {scanning ? "Decoding symbologyâ€¦" : "Align the code within the frame"}
                </p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Input
                value={scanValue}
                onChange={(e) => setScanValue(e.target.value)}
                placeholder="Or key in code manuallyâ€¦"
                className="num h-9 min-w-[200px] flex-1 rounded-xl"
              />
              <Button
                className="h-9"
                onClick={() => {
                  setScanning(true);
                  setTimeout(() => {
                    setScanning(false);
                    const code = scanValue || "8901234599213";
                    const ok = code.length % 2 === 1;
                    setScans((s) => [
                      {
                        code,
                        type: "GS1-128",
                        result: ok ? "Match" : "Mismatch",
                        detail: ok
                          ? "Validated against ASN manifest"
                          : "Code not found on manifest",
                      },
                      ...s,
                    ]);
                    setScanValue("");
                    ok
                      ? toast.success("Scan validated")
                      : toast.error("Scan mismatch â€” code not on manifest");
                  }, 1200);
                }}
              >
                {scanning ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ScanLine className="mr-2 h-4 w-4" />
                )}
                Scan
              </Button>
            </div>
          </SectionCard>

          <SectionCard
            title="Scan log"
            description={`${scans.length} codes captured`}
            padded={false}
          >
            <ul className="divide-y divide-border">
              {scans.map((s, i) => (
                <li
                  key={i}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="num truncate text-xs font-medium">{s.code}</p>
                    <p className="truncate text-[10px] text-muted-foreground">
                      {s.type} Â· {s.detail}
                    </p>
                  </div>
                  <StatusPill tone={s.result === "Match" ? "success" : "danger"}>
                    {s.result}
                  </StatusPill>
                </li>
              ))}
            </ul>
          </SectionCard>
        </div>
      )}

      {/* STEP: PHOTOS */}
      {step === "photos" && (
        <SectionCard
          title="Photo evidence"
          description="Geotagged, timestamped and hash-sealed for audit"
          actions={
            <Button
              size="sm"
              variant="outline"
              onClick={() => toast.success("2 files uploaded and hashed (SHA-256)")}
            >
              <Upload className="mr-2 h-4 w-4" /> Upload
            </Button>
          }
        >
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {photos.map((p) => (
              <figure
                key={p.id}
                className="group overflow-hidden rounded-xl border border-border bg-background"
              >
                <button onClick={() => setViewer(p)} className="block w-full">
                  <img
                    src={p.src}
                    alt={p.label}
                    loading="lazy"
                    className="h-32 w-full object-cover transition-transform group-hover:scale-105"
                  />
                </button>
                <figcaption className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 p-2">
                  <div className="min-w-0">
                    <p className="truncate text-[11px] font-medium">{p.label}</p>
                    <p className="truncate text-[10px] text-muted-foreground">{p.tag}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground"
                    onClick={() => setPhotos((ps) => ps.filter((x) => x.id !== p.id))}
                    aria-label="Remove photo"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </figcaption>
              </figure>
            ))}
            <button
              onClick={() => toast("Camera opened on handheld device")}
              className="grid h-full min-h-[168px] place-items-center rounded-xl border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <span className="text-center">
                <Camera className="mx-auto h-6 w-6" />
                <span className="mt-1 block text-[11px]">Capture photo</span>
              </span>
            </button>
          </div>
        </SectionCard>
      )}

      {/* STEP: DAMAGE */}
      {step === "damage" && (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
          <SectionCard title="Damage reporting" description="Record every observed non-conformance">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Damage type">
                <Select
                  value={damage.type}
                  onValueChange={(v) => setDamage((d) => ({ ...d, type: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {damageTypes.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Affected quantity">
                <Input
                  className="num"
                  value={damage.qty}
                  onChange={(e) => setDamage((d) => ({ ...d, qty: e.target.value }))}
                />
              </Field>
            </div>

            <div className="mt-3">
              <Label className="text-xs">Severity</Label>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {(["Minor", "Major", "Critical"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setDamage((d) => ({ ...d, severity: s }))}
                    className={cn(
                      "rounded-xl border px-3 py-2 text-xs font-medium transition-colors",
                      damage.severity === s
                        ? s === "Critical"
                          ? "border-destructive bg-destructive/10 text-destructive"
                          : s === "Major"
                            ? "border-warning bg-warning/15 text-warning-foreground"
                            : "border-info bg-info/10 text-info"
                        : "border-border hover:bg-accent/40",
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-3">
              <Label className="text-xs">Remarks</Label>
              <Textarea
                className="mt-1.5"
                rows={3}
                placeholder="Describe the damage, location on the unit and probable causeâ€¦"
                value={damage.remarks}
                onChange={(e) => setDamage((d) => ({ ...d, remarks: e.target.value }))}
              />
              {damage.remarks.length > 0 && damage.remarks.length < 15 && (
                <p className="mt-1 text-[11px] text-destructive">
                  Provide at least 15 characters for traceability.
                </p>
              )}
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2">
              {photos.slice(2, 5).map((p) => (
                <button
                  key={p.id}
                  onClick={() => setViewer(p)}
                  className="overflow-hidden rounded-lg border border-border"
                >
                  <img
                    src={p.src}
                    alt={p.label}
                    loading="lazy"
                    className="h-20 w-full object-cover"
                  />
                </button>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => setDamageDrawer(true)}>
                View damage log (3)
              </Button>
              <Button
                size="sm"
                disabled={damage.remarks.length < 15}
                onClick={() => toast.success("Damage record DMG-2026-00219 saved")}
              >
                Save damage record
              </Button>
              <Button size="sm" variant="destructive" asChild>
                <Link to="/quality-gatekeeper/ncr/new">Escalate to NCR</Link>
              </Button>
            </div>
          </SectionCard>

          <SectionCard title="Impact assessment">
            <div className="space-y-2 text-xs">
              <Row l="Affected units" v={`${damage.qty} of ${insp.qty}`} />
              <Row
                l="Defect rate"
                v={`${((Number(damage.qty) / insp.qty) * 100).toFixed(2)}%`}
                tone="warning"
              />
              <Row l="AQL outcome" v="Reject (Re = 2)" tone="danger" />
              <Row l="Est. financial impact" v="SAR 36,000" />
              <Row l="Vendor scorecard" v="âˆ’4 pts" tone="danger" />
            </div>
            <div className="mt-3 rounded-xl border border-destructive/25 bg-destructive/10 p-3 text-[11px]">
              Critical or major damage automatically blocks inventory release until an NCR
              disposition is approved.
            </div>
          </SectionCard>
        </div>
      )}

      {/* STEP: SUMMARY */}
      {step === "summary" && (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              <Stat l="Passed" v="45" tone="success" />
              <Stat l="Rejected" v="3" tone="danger" />
              <Stat l="On hold" v="2" tone="warning" />
              <Stat l="Damage records" v="3" />
              <Stat l="NCR raised" v="1" tone="danger" />
              <Stat l="Photos" v={String(photos.length)} />
            </div>
            <SectionCard title="Checklist outcome" padded={false}>
              <ul className="divide-y divide-border">
                {checks.slice(0, 8).map((c) => (
                  <li
                    key={c.id}
                    className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-2.5"
                  >
                    <p className="min-w-0 truncate text-xs">
                      <span className="num mr-2 text-muted-foreground">{c.id}</span>
                      {c.label}
                    </p>
                    <StatusPill
                      tone={
                        c.result === "PASS" ? "success" : c.result === "FAIL" ? "danger" : "neutral"
                      }
                    >
                      {c.result ?? "Pending"}
                    </StatusPill>
                  </li>
                ))}
              </ul>
            </SectionCard>
          </div>
          <SectionCard title="Execution timeline">
            <ol className="relative space-y-3 pl-5 text-xs">
              <span className="absolute top-1 bottom-1 left-[7px] w-px bg-border" />
              {[
                ["08:12", "Inspection started"],
                ["08:19", "Sampling plan confirmed â€” AQL 1.0 / Level II"],
                ["08:34", "Quantity verification completed"],
                ["08:41", "3 scan mismatches resolved"],
                ["08:52", "6 evidence photos captured"],
                ["09:04", "Damage record raised â€” Major"],
              ].map(([t, l]) => (
                <li key={l} className="relative">
                  <span className="absolute top-1 -left-5 h-3 w-3 rounded-full border-2 border-primary bg-background" />
                  <p className="font-medium">{l}</p>
                  <p className="num text-[11px] text-muted-foreground">{t}</p>
                </li>
              ))}
            </ol>
          </SectionCard>
        </div>
      )}

      {/* STEP: APPROVAL */}
      {step === "approval" && (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
          <SectionCard
            title="Inspection decision"
            description="Final disposition requires inspector signature and manager approval"
          >
            <div className="grid gap-3 sm:grid-cols-3">
              {(
                [
                  {
                    v: "PASS",
                    t: "PASS",
                    d: "Full lot conforms â€” release to inventory",
                    tone: "success",
                  },
                  {
                    v: "PARTIAL",
                    t: "PARTIAL PASS",
                    d: "Release good units, quarantine the rest",
                    tone: "warning",
                  },
                  { v: "FAIL", t: "FAIL", d: "Reject lot and raise NCR", tone: "danger" },
                ] as const
              ).map((o) => (
                <button
                  key={o.v}
                  onClick={() => setDecision(o.v)}
                  className={cn(
                    "rounded-xl border p-4 text-left transition-colors",
                    decision === o.v
                      ? o.tone === "success"
                        ? "border-success bg-success/10"
                        : o.tone === "warning"
                          ? "border-warning bg-warning/10"
                          : "border-destructive bg-destructive/10"
                      : "border-border hover:bg-accent/40",
                  )}
                >
                  <p className="text-sm font-semibold">{o.t}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">{o.d}</p>
                </button>
              ))}
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <Label className="text-xs">Inspector signature</Label>
                <button
                  onClick={() => setSigned(true)}
                  className={cn(
                    "mt-1.5 grid h-24 w-full place-items-center rounded-xl border-2 border-dashed transition-colors",
                    signed ? "border-success bg-success/5" : "border-border hover:border-primary",
                  )}
                >
                  {signed ? (
                    <span className="text-center">
                      <PenLine className="mx-auto h-5 w-5 text-success" />
                      <span className="mt-1 block text-xs font-medium">
                        Imran Qureshi Â· 01 Aug 2026 09:11
                      </span>
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">Tap to sign</span>
                  )}
                </button>
              </div>
              <div>
                <Label className="text-xs">Manager approval</Label>
                <div className="mt-1.5 rounded-xl border border-border p-3 text-xs">
                  <p className="font-medium">Layla Hassan Â· Quality Manager</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Approval requested at 09:12 â€” awaiting response
                  </p>
                  <StatusPill tone="warning" className="mt-2">
                    Pending approval
                  </StatusPill>
                </div>
              </div>
            </div>

            <div className="mt-3">
              <Label className="text-xs">Comments</Label>
              <Textarea
                className="mt-1.5"
                rows={3}
                placeholder="Concession justification, deviations, agreements with vendorâ€¦"
              />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => go(-1)}>
                Back to summary
              </Button>
              <Button disabled={!signed} onClick={() => setConfirmOpen(true)}>
                Submit decision
              </Button>
              {!signed && (
                <p className="w-full text-[11px] text-destructive">
                  Inspector signature is mandatory.
                </p>
              )}
            </div>
          </SectionCard>

          <SectionCard title="Decision impact">
            <div className="space-y-2 text-xs">
              <Row
                l="Release to inventory"
                v={decision === "FAIL" ? "0" : "45 EA"}
                tone={decision === "FAIL" ? "danger" : "success"}
              />
              <Row l="Quarantine" v={decision === "PASS" ? "0" : "3 EA"} tone="warning" />
              <Row l="NCR" v={decision === "PASS" ? "Not required" : "NCR-2026-00319"} />
              <Row l="Vendor notification" v="Auto-send on submit" />
            </div>
          </SectionCard>
        </div>
      )}

      {/* STEP: RELEASE */}
      {step === "release" && (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
          <SectionCard
            title="Inventory release"
            description="Post accepted quantity to unrestricted-use stock"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Approved quantity">
                <Input className="num" defaultValue="45" />
              </Field>
              <Field label="Warehouse">
                <Select defaultValue={insp.warehouse}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={insp.warehouse}>{insp.warehouse}</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Storage zone">
                <Select defaultValue="A">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">Zone A Â· Fast-moving racking</SelectItem>
                    <SelectItem value="B">Zone B Â· Bulk floor</SelectItem>
                    <SelectItem value="C">Zone C Â· Hazardous</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Temporary location">
                <Input defaultValue="QA-STAGE-04" />
              </Field>
              <Field label="Target bin">
                <Input defaultValue="A-12-04-B" />
              </Field>
              <Field label="Inventory status">
                <Select defaultValue="unrestricted">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unrestricted">Unrestricted use</SelectItem>
                    <SelectItem value="blocked">Blocked</SelectItem>
                    <SelectItem value="qi">Quality inspection stock</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <label className="mt-3 flex items-start gap-2 text-[11px]">
              <Checkbox defaultChecked className="mt-0.5" />
              <span>
                Create warehouse task and print putaway label (LPN-004422) at station LP-02.
              </span>
            </label>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => go(-1)}>
                Back
              </Button>
              <Button
                onClick={() => {
                  setSubmitting(true);
                  setTimeout(() => {
                    setSubmitting(false);
                    setReleased(true);
                  }, 1400);
                }}
              >
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Release & move to
                storage
              </Button>
            </div>
          </SectionCard>

          <SectionCard title="Posting preview">
            <div className="space-y-2 text-xs">
              <Row l="Movement type" v="321 Â· QI â†’ Unrestricted" />
              <Row l="Material document" v="4900012877 (draft)" />
              <Row l="LPN" v="LPN-004422" />
              <Row l="Target bin" v="A-12-04-B" />
              <Row l="Handover" v="Module 06 Â· Storage" tone="brand" />
            </div>
          </SectionCard>
        </div>
      )}

      {/* Wizard footer */}
      <div className="mt-5 flex items-center justify-between gap-3">
        <Button variant="outline" disabled={idx === 0} onClick={() => go(-1)}>
          <ChevronLeft className="mr-1.5 h-4 w-4" /> Previous
        </Button>
        <p className="hidden text-[11px] text-muted-foreground sm:block">
          Step {idx + 1} of {steps.length} Â· autosaved 09:14
        </p>
        <Button disabled={idx === steps.length - 1} onClick={() => go(1)}>
          Next <ChevronRight className="ml-1.5 h-4 w-4" />
        </Button>
      </div>

      {/* Photo viewer */}
      <Dialog open={viewer !== null} onOpenChange={(o) => !o && setViewer(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{viewer?.label}</DialogTitle>
            <DialogDescription>
              {viewer?.cat} Â· {viewer?.tag} Â· SHA-256 verified Â· GPS 26.4207, 50.0888
            </DialogDescription>
          </DialogHeader>
          {viewer && <img src={viewer.src} alt={viewer.label} className="w-full rounded-xl" />}
          <DialogFooter>
            <Button variant="outline" onClick={() => toast("Annotation tool opened")}>
              Annotate
            </Button>
            <Button onClick={() => setViewer(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Damage drawer */}
      <Sheet open={damageDrawer} onOpenChange={setDamageDrawer}>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Damage log</SheetTitle>
            <SheetDescription>All damage records captured against {insp.id}</SheetDescription>
          </SheetHeader>
          <ul className="space-y-3 p-4">
            {[
              { id: "DMG-2026-00217", t: "Packaging Damage", s: "Minor", q: 6 },
              { id: "DMG-2026-00218", t: "Scratched / Scored", s: "Major", q: 2 },
              { id: "DMG-2026-00219", t: "Missing Parts", s: "Major", q: 3 },
            ].map((d) => (
              <li key={d.id} className="rounded-xl border border-border p-3">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                  <p className="num truncate text-xs font-semibold">{d.id}</p>
                  <StatusPill tone={d.s === "Major" ? "warning" : "info"}>{d.s}</StatusPill>
                </div>
                <p className="mt-1 text-xs">{d.t}</p>
                <p className="text-[11px] text-muted-foreground">
                  {d.q} units affected Â· photo evidence attached
                </p>
              </li>
            ))}
          </ul>
        </SheetContent>
      </Sheet>

      {/* Confirm decision */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm inspection decision</DialogTitle>
            <DialogDescription>
              Decision <strong>{decision}</strong> will be posted to the quality record and routed
              for manager approval. This entry is immutable once submitted.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-xl border border-border bg-background/60 p-3 text-[11px]">
            45 EA released Â· 3 EA quarantined Â· NCR-2026-00319 will be created Â· vendor notified.
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setConfirmOpen(false);
                toast.success("Decision submitted", {
                  description: "Routed to Layla Hassan for approval",
                });
                setStep("release");
              }}
            >
              Confirm & submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success screen */}
      <Dialog open={released} onOpenChange={setReleased}>
        <DialogContent className="max-w-lg">
          <div className="py-4 text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-success/10 text-success">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h2 className="mt-4 text-lg font-semibold">Inventory released successfully</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              45 EA posted to unrestricted-use stock Â· Material document 4900012877 Â· Bin
              A-12-04-B
            </p>
            <div className="mt-4 grid grid-cols-3 gap-2 text-left">
              <Stat l="Released" v="45 EA" tone="success" />
              <Stat l="Quarantined" v="3 EA" tone="warning" />
              <Stat l="Cycle time" v="62 min" />
            </div>
            <div className="mt-5 rounded-xl border border-primary/25 bg-primary/5 p-3 text-left">
              <p className="text-xs font-semibold">Module 05 completed</p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                The lot now continues automatically into Module 06 â€” Warehouse Storage & Location
                Management for putaway and bin assignment.
              </p>
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => navigate({ to: "/quality-gatekeeper/history" })}
              >
                View inspection history
              </Button>
              <Button onClick={() => navigate({ to: "/quality-gatekeeper/storage" })}>
                Continue to Module 06
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}

function Row({
  l,
  v,
  tone,
}: {
  l: string;
  v: string;
  tone?: "success" | "danger" | "warning" | "brand";
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-1.5 last:border-0">
      <span className="min-w-0 truncate text-muted-foreground">{l}</span>
      {tone ? (
        <StatusPill tone={tone} dot={false}>
          {v}
        </StatusPill>
      ) : (
        <span className="num font-medium">{v}</span>
      )}
    </div>
  );
}

function Stat({
  l,
  v,
  tone,
}: {
  l: string;
  v: string;
  tone?: "success" | "danger" | "warning" | "brand";
}) {
  const cls = {
    success: "text-success",
    danger: "text-destructive",
    warning: "text-warning-foreground",
    brand: "text-primary",
  }[tone ?? "brand"];
  return (
    <div className="rounded-xl border border-border bg-background/60 p-3">
      <p className="truncate text-[11px] text-muted-foreground">{l}</p>
      <p className={cn("num mt-0.5 text-lg font-semibold", tone && cls)}>{v}</p>
    </div>
  );
}
