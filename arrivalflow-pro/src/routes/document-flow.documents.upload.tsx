import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import {
  UploadCloud,
  Camera,
  Smartphone,
  FileText,
  X,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  RotateCcw,
  ArrowRight,
} from "lucide-react";
import { AppShell } from "@/apps/document-flow/components/wms/AppShell";
import { SectionCard } from "@/apps/document-flow/components/wms/primitives";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { documentTypes, warehouses, vendors } from "@/apps/document-flow/wms-data";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/document-flow/documents/upload")({
  head: () => ({
    meta: [
      { title: "Upload Document — Axion WMS" },
      { name: "description", content: "Drag & drop, scan or capture warehouse documents for automatic OCR extraction." },
      { property: "og:title", content: "Upload Document — Axion WMS" },
      { property: "og:description", content: "Drag & drop, scan or capture warehouse documents for automatic OCR extraction." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: UploadPage,
});

type Stage = "idle" | "uploading" | "scanning" | "done";

const queued = [
  { name: "INV-26-27-8841.pdf", size: "1.8 MB", pages: 3 },
  { name: "EWB-391004528817.pdf", size: "0.4 MB", pages: 1 },
];

export function UploadPage() {
  const navigate = useNavigate();
  const [over, setOver] = useState(false);
  const [stage, setStage] = useState<Stage>("idle");
  const [pct, setPct] = useState(0);
  const [type, setType] = useState("Invoice");
  const [camera, setCamera] = useState(false);
  const [mobile, setMobile] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = () => {
    setStage("uploading");
    setPct(0);
    timer.current = setInterval(() => {
      setPct((p) => {
        if (p >= 100) {
          clearInterval(timer.current!);
          setStage("scanning");
          setTimeout(() => {
            setStage("done");
            toast.success("2 files uploaded · virus scan clean");
          }, 1400);
          return 100;
        }
        return p + 7;
      });
    }, 110);
  };

  const cancel = () => {
    if (timer.current) clearInterval(timer.current);
    setStage("idle");
    setPct(0);
    toast("Upload cancelled");
  };

  return (
    <AppShell
      title="Upload Document"
      subtitle="PDF · JPEG · PNG · TIFF · Word · Excel — up to 50 MB per file"
      breadcrumb={[
        { label: "Home", to: "/document-flow" },
        { label: "Document Management", to: "/document-flow/documents" },
        { label: "Upload" },
      ]}
      actions={
        <Button variant="outline" className="rounded-xl" asChild>
          <Link to="/document-flow/documents/library">Cancel</Link>
        </Button>
      }
    >
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <SectionCard title="Add files" description="Drag & drop, browse, capture or send from mobile">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setOver(true);
              }}
              onDragLeave={() => setOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setOver(false);
                start();
              }}
              className={cn(
                "relative grid place-items-center rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-300",
                over ? "scale-[1.01] border-primary bg-primary-soft" : "border-border bg-muted/40",
              )}
            >
              <div
                className={cn(
                  "grid size-16 place-items-center rounded-2xl bg-primary text-primary-foreground transition-transform duration-300",
                  over && "-translate-y-2 animate-pulse-ring",
                )}
              >
                <UploadCloud className="size-7" />
              </div>
              <p className="mt-4 text-base font-semibold">
                {over ? "Release to upload" : "Drag & drop documents here"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                or use one of the capture methods below
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                <Button className="rounded-xl" onClick={start}>Browse files</Button>
                <Button variant="outline" className="rounded-xl" onClick={() => setCamera(true)}>
                  <Camera className="mr-2 size-4" /> Camera capture
                </Button>
                <Button variant="outline" className="rounded-xl" onClick={() => setMobile(true)}>
                  <Smartphone className="mr-2 size-4" /> Mobile upload
                </Button>
              </div>
              <div className="mt-6 flex flex-wrap justify-center gap-1.5">
                {["PDF", "JPEG", "PNG", "TIFF", "DOCX", "XLSX"].map((f) => (
                  <span key={f} className="rounded-full border bg-card px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </SectionCard>

          {stage !== "idle" && (
            <SectionCard
              title="Upload progress"
              description={
                stage === "uploading"
                  ? "Transferring to secure document vault"
                  : stage === "scanning"
                    ? "Validating format and running virus scan"
                    : "All files accepted"
              }
              action={
                stage === "uploading" ? (
                  <Button size="sm" variant="ghost" className="rounded-lg text-destructive" onClick={cancel}>
                    <X className="mr-1.5 size-4" /> Cancel
                  </Button>
                ) : stage === "done" ? (
                  <Button size="sm" variant="ghost" className="rounded-lg" onClick={start}>
                    <RotateCcw className="mr-1.5 size-4" /> Re-upload
                  </Button>
                ) : null
              }
            >
              <div className="space-y-4">
                {queued.map((f, i) => (
                  <div key={f.name} className="rounded-2xl border p-4">
                    <div className="flex items-center gap-3">
                      <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-soft">
                        <FileText className="size-5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{f.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {f.size} · {f.pages} page{f.pages > 1 ? "s" : ""} · {type}
                        </p>
                      </div>
                      <span className="text-sm font-semibold tabular-nums">
                        {stage === "uploading" ? `${Math.min(100, pct + i * 3)}%` : "100%"}
                      </span>
                    </div>
                    <Progress value={stage === "uploading" ? Math.min(100, pct + i * 3) : 100} className="mt-3 h-1.5" />
                  </div>
                ))}

                <div className="grid gap-2 sm:grid-cols-3">
                  {[
                    { label: "Format validation", done: pct > 30 },
                    { label: "Virus scan", done: stage === "scanning" || stage === "done" },
                    { label: "Checksum & vault write", done: stage === "done" },
                  ].map((s) => (
                    <div key={s.label} className="flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs">
                      {s.done ? (
                        <CheckCircle2 className="size-4 text-success" />
                      ) : (
                        <Loader2 className="size-4 animate-spin text-muted-foreground" />
                      )}
                      <span className={s.done ? "font-medium" : "text-muted-foreground"}>{s.label}</span>
                    </div>
                  ))}
                </div>

                {stage === "done" && (
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-success/30 bg-success-soft p-4">
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="size-5 text-success" />
                      <div>
                        <p className="text-sm font-semibold text-success">2 files uploaded securely</p>
                        <p className="text-xs text-muted-foreground">No threats detected · ready for OCR extraction</p>
                      </div>
                    </div>
                    <Button
                      className="rounded-xl"
                      onClick={() => navigate({ to: "/document-flow/ocr/$id", params: { id: "DOC-2026-004812" } })}
                    >
                      Start OCR <ArrowRight className="ml-2 size-4" />
                    </Button>
                  </div>
                )}
              </div>
            </SectionCard>
          )}
        </div>

        <SectionCard title="Document details" description="Applied to all files in this batch">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Document type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {documentTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Vendor</Label>
              <Select defaultValue="Bharat Steel Tubes Pvt Ltd">
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {vendors.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Warehouse</Label>
              <Select defaultValue="WH-01 Bhiwandi Central">
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {warehouses.map((w) => <SelectItem key={w} value={w}>{w}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Purchase Order</Label>
                <Input defaultValue="PO-2026-77120" className="rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label>ASN</Label>
                <Input defaultValue="ASN-88431" className="rounded-xl" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Tags</Label>
              <Input defaultValue="GST, Steel, Q3-Inbound" className="rounded-xl" />
            </div>
            <div className="rounded-2xl bg-primary-soft p-3 text-xs text-primary">
              OCR runs automatically after upload using the <strong>wms-invoice-in-v4</strong> model
              for this document type.
            </div>
          </div>
        </SectionCard>
      </div>

      <Dialog open={camera} onOpenChange={setCamera}>
        <DialogContent className="rounded-2xl sm:max-w-lg">
          <DialogHeader><DialogTitle>Camera capture</DialogTitle></DialogHeader>
          <div className="relative aspect-4/3 overflow-hidden rounded-xl bg-slate-900">
            <div className="absolute inset-6 rounded-lg border-2 border-dashed border-white/50" />
            <div className="absolute inset-x-6 h-16 animate-scanline bg-gradient-to-b from-transparent via-white/25 to-transparent" />
            <p className="absolute bottom-3 left-0 right-0 text-center text-xs text-white/80">
              Align the document within the frame · auto-crop enabled
            </p>
          </div>
          <Button
            className="rounded-xl"
            onClick={() => {
              setCamera(false);
              start();
            }}
          >
            <Camera className="mr-2 size-4" /> Capture page
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog open={mobile} onOpenChange={setMobile}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader><DialogTitle>Continue on mobile</DialogTitle></DialogHeader>
          <div className="grid place-items-center py-4">
            <div className="grid size-40 grid-cols-9 grid-rows-9 gap-[2px] rounded-xl bg-white p-2 ring-1 ring-border">
              {Array.from({ length: 81 }).map((_, i) => (
                <span key={i} className={i % 3 === 0 || i % 11 === 0 ? "bg-slate-900" : "bg-white"} />
              ))}
            </div>
            <p className="mt-4 text-center text-xs text-muted-foreground">
              Scan with the Axion WMS mobile app. Session expires in 4:52.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
