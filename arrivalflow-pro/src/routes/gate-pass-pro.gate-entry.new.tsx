import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import * as React from "react";
import {
  Camera,
  CheckCircle2,
  Building2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  Contact,
  Eye,
  FileCheck2,
  FileText,
  HardHat,
  Loader2,
  MapPin,
  PackageSearch,
  Phone,
  ScanLine,
  Send,
  ShieldAlert,
  ShieldCheck,
  TriangleAlert,
  Truck,
  Trash2,
  Upload,
  UploadCloud,
  User,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/apps/gate-pass-pro/components/wms/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { createGateEntry, type NewGateEntryInput } from "@/apps/gate-pass-pro/lib/gate-entry-api";
import { useAuth } from "@/lib/auth";
import { uploadVehicleImage } from "@/apps/gate-pass-pro/lib/upload-api";
import { verifyDriverLicence, type DriverRecord } from "@/apps/gate-pass-pro/lib/driver-api";
import { canvasToJpeg, extractWithGemini, type DrivingLicenceOcr, type VehiclePlateOcr } from "@/apps/gate-pass-pro/lib/ocr-api";

export const Route = createFileRoute("/gate-pass-pro/gate-entry/new")({
  component: NewGateEntry,
});

const steps = ["Vehicle", "Driver", "PO", "Documents", "Safety", "Review"];

function NewGateEntry() {
  const router = useRouter();
  const [step, setStep] = React.useState(0);
  const [driverVerified, setDriverVerified] = React.useState(false);
  const [poVerified, setPoVerified] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [draft, setDraft] = React.useState<NewGateEntryInput>({ gate: "Gate 01", priority: "normal" });
  const { user } = useAuth();
  const updateDraft = (patch: Partial<NewGateEntryInput>) => setDraft((current) => ({ ...current, ...patch }));

  const submitGateEntry = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const created = await createGateEntry({ ...draft, ...(user?.name ? { officer: user.name } : {}) });
      toast.success("Gate entry created", { description: `${created.id} was saved and broadcast in real time.` });
      await router.navigate({ to: "/dashboard" });
    } catch (error) {
      toast.error("Gate entry could not be created", { description: (error as Error).message });
      setSubmitting(false);
    }
  };

  const goNext = () => {
    if (step === steps.length - 1) {
      void submitGateEntry();
      return;
    }
    setStep((s) => Math.min(s + 1, steps.length - 1));
  };
  const goPrev = () => setStep((s) => Math.max(s - 1, 0));

  return (
    <AppShell
      title="New Gate Entry"
      subtitle="Create a new gate entry record for an arriving truck"
      back={
        <Button variant="ghost" size="icon" asChild>
          <Link to="/gate-pass-pro/gate-entry">
            <X />
          </Link>
        </Button>
      }
    >
      <div className="mx-auto max-w-4xl">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-medium">
            Step {step + 1} of {steps.length}: {steps[step]}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goPrev}
              disabled={step === 0}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Previous
            </Button>
            <Button size="sm" onClick={goNext} disabled={submitting}>
              {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating…</> : step === steps.length - 1 ? <><Send className="mr-2 h-4 w-4" />Create Gate Entry</> : <>Next<ChevronRight className="ml-1 h-4 w-4" /></>}
            </Button>
          </div>
        </div>
        <Progress value={((step + 1) / steps.length) * 100} className="mb-8" />

        {step === 0 && <VehicleVerification onDraftChange={updateDraft} />}
        {step === 1 && <DriverVerification onVerifiedChange={setDriverVerified} onDraftChange={updateDraft} />}
        {step === 2 && <PurchaseOrderVerification onVerifiedChange={setPoVerified} onDraftChange={updateDraft} />}
        {step === 3 && <DocumentsVerification />}
        {step === 4 && <SafetyInspection />}
        {step === 5 && <ReviewGateEntry driverVerified={driverVerified} poVerified={poVerified} submitting={submitting} onSubmit={() => void submitGateEntry()} onDraftChange={updateDraft} />}
        {/* Other steps would be rendered here based on the 'step' state */}
        {step > 5 && (
          <div className="flex h-96 items-center justify-center rounded-lg border border-dashed bg-background text-muted-foreground">
            <p>
              {steps[step]} component would be here.
            </p>
          </div>
        )}
      </div>
    </AppShell>
  );
}

function VehicleVerification({ onDraftChange }: { onDraftChange: (patch: Partial<NewGateEntryInput>) => void }) {
  const [vehicleNumber, setVehicleNumber] = React.useState("");
  const [isCameraOpen, setCameraOpen] = React.useState(false);
  const [isOcrRunning, setOcrRunning] = React.useState(false);
  const [truckPhoto, setTruckPhoto] = React.useState<string | null>(null);
  const [photoCameraOpen, setPhotoCameraOpen] = React.useState(false);
  const [cameraStarting, setCameraStarting] = React.useState(false);
  const [uploadingPhoto, setUploadingPhoto] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const photoVideoRef = React.useRef<HTMLVideoElement>(null);
  const photoStreamRef = React.useRef<MediaStream | null>(null);
  const plateVideoRef = React.useRef<HTMLVideoElement>(null);
  const plateStreamRef = React.useRef<MediaStream | null>(null);
  const [ocrProgress, setOcrProgress] = React.useState(0);

  const stopPlateCamera = React.useCallback(() => {
    plateStreamRef.current?.getTracks().forEach((track) => track.stop());
    plateStreamRef.current = null;
    if (plateVideoRef.current) plateVideoRef.current.srcObject = null;
  }, []);

  const cameraErrorMessage = (error: unknown) => {
    const name = error instanceof DOMException ? error.name : "CameraError";
    if (name === "NotAllowedError" || name === "SecurityError")
      return "Camera permission is blocked. Allow camera access in the browser site settings, then retry.";
    if (name === "NotFoundError" || name === "DevicesNotFoundError")
      return "No camera was detected on this device.";
    if (name === "NotReadableError" || name === "TrackStartError")
      return "The camera is being used by another application. Close it there and retry.";
    if (name === "OverconstrainedError")
      return "The requested camera mode is unavailable on this device.";
    return error instanceof Error ? error.message : "The browser could not start the camera.";
  };

  const requestCamera = async () => {
    try {
      return await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
    } catch (firstError) {
      if (firstError instanceof DOMException && ["NotAllowedError", "SecurityError", "NotFoundError"].includes(firstError.name)) throw firstError;
      return navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    }
  };

  const openPlateCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      toast.error("Camera is unavailable. Enter the vehicle number manually.");
      return;
    }
    stopPhotoCamera();
    stopPlateCamera();
    setCameraOpen(true);
    try {
      const stream = await requestCamera();
      plateStreamRef.current = stream;
      await new Promise((resolve) => window.setTimeout(resolve, 0));
      if (plateVideoRef.current) {
        plateVideoRef.current.srcObject = stream;
        await plateVideoRef.current.play();
      }
    } catch (error) {
      setCameraOpen(false);
      toast.error("Unable to open camera", { description: cameraErrorMessage(error) });
    }
  };

  const handleCapture = async () => {
    const video = plateVideoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) {
      toast.error("Camera is not ready yet.");
      return;
    }
    setOcrRunning(true);
    setOcrProgress(0);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height);
      setOcrProgress(35);
      const result = await extractWithGemini<VehiclePlateOcr>(await canvasToJpeg(canvas), "vehicle_plate");
      setOcrProgress(100);
      const plate = result.registrationNumber?.toUpperCase().replace(/[^A-Z0-9]/g, "");
      if (!plate) throw new Error("No registration number was detected. Move closer and improve lighting.");
      setVehicleNumber(plate);
      onDraftChange({ truck: plate });
      stopPlateCamera();
      setOcrRunning(false);
      setCameraOpen(false);
      toast.success("Number plate captured via OCR.", {
        description: `Vehicle Number: ${plate}`,
      });
    } catch (error) {
      setOcrRunning(false);
      toast.error("Number plate could not be read", { description: (error as Error).message });
    }
  };

  const stopPhotoCamera = React.useCallback(() => {
    photoStreamRef.current?.getTracks().forEach((track) => track.stop());
    photoStreamRef.current = null;
    if (photoVideoRef.current) photoVideoRef.current.srcObject = null;
  }, []);

  React.useEffect(() => () => { stopPhotoCamera(); stopPlateCamera(); }, [stopPhotoCamera, stopPlateCamera]);

  const handlePhotoCapture = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      toast.error("Camera is not available in this browser.", { description: "Use Upload to choose a photo instead." });
      fileInputRef.current?.click();
      return;
    }
    stopPlateCamera();
    stopPhotoCamera();
    setPhotoCameraOpen(true);
    setCameraStarting(true);
    try {
      const stream = await requestCamera();
      photoStreamRef.current = stream;
      if (photoVideoRef.current) {
        photoVideoRef.current.srcObject = stream;
        await photoVideoRef.current.play();
      }
    } catch (error) {
      setPhotoCameraOpen(false);
      toast.error("Unable to open camera", { description: `${cameraErrorMessage(error)} You can use Upload instead.` });
    } finally {
      setCameraStarting(false);
    }
  };

  const storePhoto = async (file: File | Blob) => {
    setUploadingPhoto(true);
    setUploadProgress(0);
    try {
      const uploaded = await uploadVehicleImage(file, setUploadProgress);
      setTruckPhoto(uploaded.url);
      onDraftChange({ vehicleImageUrl: uploaded.url, vehicleImagePublicId: uploaded.publicId });
      toast.success("Truck photo stored in Cloudinary.");
    } catch (error) {
      toast.error("Photo upload failed", { description: (error as Error).message });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const takeTruckPhoto = () => {
    const video = photoVideoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) {
      toast.error("Camera is not ready yet.");
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) return toast.error("Could not capture the camera frame.");
      stopPhotoCamera();
      setPhotoCameraOpen(false);
      void storePhoto(blob);
    }, "image/jpeg", 0.85);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      void storePhoto(file);
      event.target.value = "";
    }
  };

  return (
    <div className="space-y-6">
      {/* Hidden file input for upload */}
      <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" capture="environment" className="hidden" />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="surface-card relative flex aspect-[4/3] items-center justify-center overflow-hidden">
          {truckPhoto ? (
            <img src={truckPhoto} alt="Truck" className="h-full w-full object-cover" />
          ) : (
            <div className="text-center text-muted-foreground">
              <Truck className="mx-auto h-12 w-12" />
              <p className="mt-2 text-sm">Truck Photo</p>
            </div>
          )}
          <div className="absolute bottom-2 right-2 flex gap-2">
             <Button size="sm" onClick={handlePhotoCapture} disabled={uploadingPhoto}>
                <Camera className="mr-2 h-4 w-4" />
                Capture
             </Button>
             <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploadingPhoto}>
                <Upload className="mr-2 h-4 w-4" />
                Upload
             </Button>
          </div>
        </div>
        <div className="surface-card flex aspect-[4/3] flex-col items-center justify-center text-center">
          <ScanLine className="h-12 w-12 text-muted-foreground" />
          <p className="mt-4 font-semibold">Number Plate OCR</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Use camera to automatically detect and fill the vehicle number.
          </p>
          <Button className="mt-4" onClick={() => void openPlateCamera()}>
            <Camera className="mr-2 h-4 w-4" />
            Scan Number Plate
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="vehicle-number">Vehicle Number</Label>
          <Input
            id="vehicle-number"
            placeholder="e.g., MH 12 AB 3456"
            value={vehicleNumber}
            onChange={(e) => { setVehicleNumber(e.target.value); onDraftChange({ truck: e.target.value }); }}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="vehicle-type">Vehicle Type</Label>
          <Select>
            <SelectTrigger id="vehicle-type">
              <SelectValue placeholder="Select vehicle type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="20ft-container">20ft Container Truck</SelectItem>
              <SelectItem value="40ft-container">40ft Container Truck</SelectItem>
              <SelectItem value="flatbed">Flatbed Truck</SelectItem>
              <SelectItem value="tanker">Tanker</SelectItem>
              <SelectItem value="box-truck">Box Truck</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="transport-company">Transport Company</Label>
          <Input id="transport-company" placeholder="e.g., Safexpress" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="trailer-number">Trailer Number (Optional)</Label>
          <Input id="trailer-number" placeholder="e.g., TRL-987" />
        </div>
      </div>

      <Dialog open={isCameraOpen} onOpenChange={(open) => { setCameraOpen(open); if (!open) stopPlateCamera(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Scan Number Plate</DialogTitle>
            <DialogDescription>
              Position the vehicle's number plate within the frame.
            </DialogDescription>
          </DialogHeader>
          <div className="relative my-4 flex aspect-video items-center justify-center rounded-lg bg-slate-900 text-slate-400">
            <video ref={plateVideoRef} autoPlay playsInline muted className="absolute inset-0 h-full w-full object-cover" />
            {isOcrRunning && (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
                <p className="text-sm text-white">Running OCR… {ocrProgress}%</p>
              </div>
            )}
            <div className="pointer-events-none absolute inset-4 rounded-lg border-2 border-dashed border-white/50" />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => { stopPlateCamera(); setCameraOpen(false); }}>
              Cancel
            </Button>
            <Button onClick={handleCapture} disabled={isOcrRunning}>
              {isOcrRunning ? "Scanning..." : "Capture"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={photoCameraOpen} onOpenChange={(open) => { setPhotoCameraOpen(open); if (!open) stopPhotoCamera(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Capture truck photo</DialogTitle>
            <DialogDescription>Position the truck inside the camera frame, then capture the image.</DialogDescription>
          </DialogHeader>
          <div className="relative my-4 aspect-video overflow-hidden rounded-lg bg-slate-950">
            <video ref={photoVideoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
            {cameraStarting && <div className="absolute inset-0 grid place-items-center bg-slate-950/80"><Loader2 className="h-8 w-8 animate-spin text-white" /></div>}
          </div>
          {uploadingPhoto && (
            <div className="absolute inset-x-2 top-2 rounded-lg bg-background/95 p-3 shadow-md backdrop-blur">
              <div className="flex items-center justify-between text-xs"><span className="flex items-center gap-2"><UploadCloud className="h-4 w-4 text-primary" />Uploading to Cloudinary</span><span>{uploadProgress}%</span></div>
              <Progress value={uploadProgress} className="mt-2 h-1.5" />
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => { stopPhotoCamera(); setPhotoCameraOpen(false); }}>Cancel</Button>
            <Button onClick={takeTruckPhoto} disabled={cameraStarting}><Camera className="mr-2 h-4 w-4" />Capture photo</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ReviewGateEntry({ driverVerified, poVerified, submitting, onSubmit, onDraftChange }: { driverVerified: boolean; poVerified: boolean; submitting: boolean; onSubmit: () => void; onDraftChange: (patch: Partial<NewGateEntryInput>) => void }) {
  const [gate, setGate] = React.useState("gate-01");
  const [lane, setLane] = React.useState("inbound-a");
  const [purpose, setPurpose] = React.useState("material-delivery");
  const [priority, setPriority] = React.useState("normal");
  const [remarks, setRemarks] = React.useState("");
  const [notifyDriver, setNotifyDriver] = React.useState(true);
  const [notifyWarehouse, setNotifyWarehouse] = React.useState(true);
  const [notifyProcurement, setNotifyProcurement] = React.useState(false);

  const sections = [
    { label: "Vehicle", description: "Vehicle information and photo", status: "Optional details accepted", verified: false },
    { label: "Driver", description: "Identity, licence and blacklist", status: driverVerified ? "Verified" : "Not verified (optional)", verified: driverVerified },
    { label: "Purchase order", description: "Supplier, ASN and quantities", status: poVerified ? "Verified" : "Not verified (optional)", verified: poVerified },
    { label: "Documents", description: "Invoice, challan, e-way bill and insurance", status: "Optional documents accepted", verified: false },
    { label: "Safety", description: "Vehicle, PPE and site-safety inspection", status: "Optional inspection accepted", verified: false },
  ];

  const notificationToggle = (label: string, description: string, checked: boolean, onChange: (value: boolean) => void) => (
    <button type="button" onClick={() => onChange(!checked)} className="flex w-full items-center gap-3 rounded-lg border p-3 text-left hover:bg-muted/30">
      <span className={`grid h-5 w-5 shrink-0 place-items-center rounded border ${checked ? "border-primary bg-primary text-primary-foreground" : "border-input"}`}>{checked && <CheckCircle2 className="h-3.5 w-3.5" />}</span>
      <span><span className="block text-sm font-medium">{label}</span><span className="block text-xs text-muted-foreground">{description}</span></span>
    </button>
  );

  return (
    <div className="space-y-6">
      <div className="surface-card overflow-hidden">
        <div className="border-b px-5 py-4"><div className="flex items-center gap-3"><ClipboardList className="h-6 w-6 text-primary" /><div><h2 className="font-semibold">Gate entry summary</h2><p className="text-xs text-muted-foreground">Review the workflow before creating the record. Every section remains optional.</p></div></div></div>
        <div className="grid gap-3 p-5 md:grid-cols-2">
          {sections.map((section, index) => <button type="button" key={section.label} onClick={() => toast.info(`${section.label} step`, { description: "Use Previous to return and edit this optional section." })} className="flex items-center gap-3 rounded-xl border p-4 text-left transition hover:border-primary/40 hover:bg-muted/20">
            <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-semibold ${section.verified ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground"}`}>{section.verified ? <CheckCircle2 className="h-5 w-5" /> : index + 1}</span>
            <span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{section.label}</span><span className="block truncate text-xs text-muted-foreground">{section.description}</span></span>
            <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${section.verified ? "bg-emerald-500/10 text-emerald-700" : "bg-muted text-muted-foreground"}`}>{section.status}</span>
          </button>)}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="surface-card space-y-4 p-5">
          <div className="flex items-center gap-3"><MapPin className="h-5 w-5 text-primary" /><div><h3 className="font-semibold">Gate routing</h3><p className="text-xs text-muted-foreground">Optional operational instructions.</p></div></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5"><Label>Entry gate</Label><Select value={gate} onValueChange={setGate}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="gate-01">Gate 01 · Main inbound</SelectItem><SelectItem value="gate-02">Gate 02 · Heavy vehicle</SelectItem><SelectItem value="gate-03">Gate 03 · Express</SelectItem></SelectContent></Select></div>
            <div className="space-y-1.5"><Label>Traffic lane</Label><Select value={lane} onValueChange={setLane}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="inbound-a">Inbound Lane A</SelectItem><SelectItem value="inbound-b">Inbound Lane B</SelectItem><SelectItem value="holding">Holding bay</SelectItem></SelectContent></Select></div>
            <div className="space-y-1.5"><Label>Visit purpose</Label><Select value={purpose} onValueChange={setPurpose}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="material-delivery">Material delivery</SelectItem><SelectItem value="pickup">Material pickup</SelectItem><SelectItem value="service">Service / maintenance</SelectItem><SelectItem value="other">Other visit</SelectItem></SelectContent></Select></div>
            <div className="space-y-1.5"><Label>Priority</Label><Select value={priority} onValueChange={setPriority}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="normal">Normal</SelectItem><SelectItem value="urgent">Urgent</SelectItem><SelectItem value="scheduled">Scheduled slot</SelectItem><SelectItem value="hold">Place on hold</SelectItem></SelectContent></Select></div>
          </div>
          <div><Label htmlFor="review-remarks">Final security remarks</Label><textarea id="review-remarks" value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={5} placeholder="Optional handoff notes, restrictions or supervisor instructions" className="mt-1.5 flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm outline-none placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring" /></div>
        </div>

        <div className="surface-card p-5">
          <div className="flex items-center gap-3"><Send className="h-5 w-5 text-primary" /><div><h3 className="font-semibold">Notifications</h3><p className="text-xs text-muted-foreground">Choose who receives the new gate-entry alert.</p></div></div>
          <div className="mt-4 space-y-3">{notificationToggle("Notify driver", "Send gate, lane and queue instructions by SMS", notifyDriver, setNotifyDriver)}{notificationToggle("Notify warehouse team", "Add the arrival to the inbound operating queue", notifyWarehouse, setNotifyWarehouse)}{notificationToggle("Notify procurement", "Send PO and supplier arrival information", notifyProcurement, setNotifyProcurement)}</div>
          <div className="mt-5 rounded-xl bg-muted/40 p-4 text-xs text-muted-foreground"><p className="font-semibold text-foreground">What happens next</p><p className="mt-1 leading-relaxed">A new gate-entry number is generated, the truck is placed in {lane.replace("-", " ")}, and selected notifications are queued. Optional or unverified information can be completed later from the gate-entry record.</p></div>
        </div>
      </div>

      <div className="surface-card flex flex-col gap-4 border-primary/30 bg-primary/5 p-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold">Ready to create this gate entry</p><p className="text-xs text-muted-foreground">No fields or verification steps are mandatory. You can update the record after creation.</p></div><Button type="button" size="lg" onClick={onSubmit} disabled={submitting}>{submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}{submitting ? "Creating gate entry…" : "Create Gate Entry"}</Button></div>
    </div>
  );
}

type SafetyState = "pass" | "fail" | "unchecked";
type SafetyCheck = { id: string; label: string; description: string; critical: boolean };

const safetyChecks: SafetyCheck[] = [
  { id: "ppe", label: "Driver PPE", description: "Safety helmet, high-visibility vest and safety shoes available", critical: true },
  { id: "leak", label: "No oil or fuel leakage", description: "Vehicle underside and engine bay show no active leakage", critical: true },
  { id: "extinguisher", label: "Fire extinguisher", description: "Present, sealed, accessible and within service date", critical: true },
  { id: "wheel", label: "Tyres and wheel condition", description: "No visible cuts, exposed cord, loose nuts or unsafe wear", critical: false },
  { id: "lights", label: "Lights and reverse alarm", description: "Headlights, indicators, brake lights and reverse alarm operational", critical: false },
  { id: "load", label: "Load and seal secure", description: "Cargo restrained and container seal appears intact", critical: true },
  { id: "speed", label: "Site rules acknowledged", description: "Driver informed of 10 km/h limit, route and no-smoking rules", critical: false },
  { id: "first-aid", label: "First-aid kit", description: "Kit is present, accessible and stocked", critical: false },
];

function SafetyInspection() {
  const [checks, setChecks] = React.useState<Record<string, SafetyState>>(() => Object.fromEntries(safetyChecks.map((item) => [item.id, "unchecked"])));
  const [remarks, setRemarks] = React.useState("");
  const [hazard, setHazard] = React.useState("");
  const [photo, setPhoto] = React.useState<string | null>(null);
  const [reviewed, setReviewed] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const setCheck = (id: string, state: SafetyState) => {
    setChecks((current) => ({ ...current, [id]: state }));
    setReviewed(false);
  };
  const passed = safetyChecks.filter((item) => checks[item.id] === "pass").length;
  const failed = safetyChecks.filter((item) => checks[item.id] === "fail");
  const unchecked = safetyChecks.length - passed - failed.length;
  const criticalFailures = failed.filter((item) => item.critical);
  const risk = criticalFailures.length ? "High" : failed.length ? "Medium" : unchecked === safetyChecks.length ? "Not assessed" : "Low";

  const reviewSafety = () => {
    setReviewed(true);
    if (criticalFailures.length) toast.error("Critical safety exception found", { description: `${criticalFailures.map((item) => item.label).join(", ")}. Entry may still continue for supervisor review.` });
    else if (failed.length) toast.warning("Safety exceptions recorded", { description: "The entry can continue and the exceptions will appear in Review." });
    else if (unchecked) toast.info("Partial safety inspection saved", { description: `${unchecked} optional check(s) were left unassessed.` });
    else toast.success("Safety inspection passed", { description: "All checks were marked compliant." });
  };

  const handlePhoto = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Choose an image file."); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error("Photo is too large", { description: "Maximum size is 10 MB." }); return; }
    const reader = new FileReader();
    reader.onload = () => { setPhoto(String(reader.result)); setReviewed(false); toast.success("Safety photo added"); };
    reader.readAsDataURL(file);
    event.currentTarget.value = "";
  };

  return (
    <div className="space-y-6">
      <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhoto} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="surface-card p-4"><ClipboardCheck className="h-5 w-5 text-primary" /><p className="mt-3 text-2xl font-bold">{passed}</p><p className="text-xs text-muted-foreground">Checks passed</p></div>
        <div className="surface-card p-4"><TriangleAlert className="h-5 w-5 text-destructive" /><p className="mt-3 text-2xl font-bold">{failed.length}</p><p className="text-xs text-muted-foreground">Exceptions</p></div>
        <div className="surface-card p-4"><HardHat className="h-5 w-5 text-amber-600" /><p className="mt-3 text-2xl font-bold">{unchecked}</p><p className="text-xs text-muted-foreground">Not assessed</p></div>
        <div className={`surface-card p-4 ${risk === "High" ? "border-destructive/50" : risk === "Medium" ? "border-amber-500/50" : ""}`}><ShieldCheck className="h-5 w-5 text-primary" /><p className={`mt-3 text-xl font-bold ${risk === "High" ? "text-destructive" : risk === "Medium" ? "text-amber-600" : ""}`}>{risk}</p><p className="text-xs text-muted-foreground">Current risk</p></div>
      </div>

      <div className="surface-card overflow-hidden">
        <div className="border-b px-5 py-4"><h2 className="font-semibold">Vehicle and driver safety checklist</h2><p className="text-xs text-muted-foreground">Every check is optional. Mark Pass, Exception, or leave it unassessed.</p></div>
        <div className="divide-y">
          {safetyChecks.map((item) => <div key={item.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1"><div className="flex items-center gap-2"><p className="text-sm font-semibold">{item.label}</p>{item.critical && <span className="rounded bg-destructive/10 px-1.5 py-0.5 text-[10px] font-semibold text-destructive">CRITICAL</span>}</div><p className="mt-1 text-xs text-muted-foreground">{item.description}</p></div>
            <div className="flex rounded-lg border p-1">
              <button type="button" onClick={() => setCheck(item.id, checks[item.id] === "pass" ? "unchecked" : "pass")} className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${checks[item.id] === "pass" ? "bg-emerald-600 text-white" : "hover:bg-muted"}`}>Pass</button>
              <button type="button" onClick={() => setCheck(item.id, checks[item.id] === "fail" ? "unchecked" : "fail")} className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${checks[item.id] === "fail" ? "bg-destructive text-destructive-foreground" : "hover:bg-muted"}`}>Exception</button>
            </div>
          </div>)}
        </div>
        <div className="flex flex-wrap gap-2 border-t bg-muted/20 px-5 py-3"><Button type="button" variant="outline" size="sm" onClick={() => { setChecks(Object.fromEntries(safetyChecks.map((item) => [item.id, "pass"]))); setReviewed(false); }}>Mark all passed</Button><Button type="button" variant="ghost" size="sm" onClick={() => { setChecks(Object.fromEntries(safetyChecks.map((item) => [item.id, "unchecked"]))); setReviewed(false); }}>Clear checks</Button></div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="surface-card p-5"><h3 className="font-semibold">Safety evidence</h3><p className="text-xs text-muted-foreground">Optionally capture the vehicle, PPE, seal, or a reported hazard.</p>{photo ? <div className="relative mt-4 overflow-hidden rounded-xl"><img src={photo} alt="Safety inspection evidence" className="h-56 w-full object-cover" /><Button type="button" variant="destructive" size="sm" className="absolute right-2 top-2" onClick={() => { setPhoto(null); setReviewed(false); }}><Trash2 className="mr-1 h-4 w-4" />Remove</Button></div> : <button type="button" onClick={() => fileInputRef.current?.click()} className="mt-4 grid min-h-56 w-full place-items-center rounded-xl border-2 border-dashed bg-muted/20 text-sm text-muted-foreground hover:border-primary/50"><span><Camera className="mx-auto mb-2 h-9 w-9" />Capture or upload safety photo</span></button>}</div>
        <div className="surface-card space-y-4 p-5"><div><Label htmlFor="safety-hazard">Hazard or exception</Label><Input id="safety-hazard" value={hazard} onChange={(e) => { setHazard(e.target.value); setReviewed(false); }} placeholder="Optional short description" /></div><div><Label htmlFor="safety-remarks">Security remarks</Label><textarea id="safety-remarks" value={remarks} onChange={(e) => { setRemarks(e.target.value); setReviewed(false); }} placeholder="Optional inspection notes, corrective action or supervisor instruction" rows={7} className="mt-1.5 flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm outline-none placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring" /></div></div>
      </div>

      <div className={`surface-card flex flex-wrap items-center justify-between gap-4 p-5 ${reviewed ? criticalFailures.length ? "border-destructive/40 bg-destructive/5" : "border-emerald-500/40 bg-emerald-500/5" : ""}`}><div className="flex items-center gap-3">{reviewed && !criticalFailures.length ? <CheckCircle2 className="h-8 w-8 text-emerald-600" /> : criticalFailures.length ? <ShieldAlert className="h-8 w-8 text-destructive" /> : <ClipboardCheck className="h-8 w-8 text-primary" />}<div><p className="font-semibold">{reviewed ? criticalFailures.length ? "Safety exception saved for supervisor review" : "Safety review saved" : "Optional safety review"}</p><p className="text-xs text-muted-foreground">Safety findings never block the Next button in this prototype.</p></div></div><Button type="button" variant={criticalFailures.length ? "destructive" : "outline"} onClick={reviewSafety}><ClipboardCheck className="mr-2 h-4 w-4" />Review safety</Button></div>
    </div>
  );
}

type GateDocumentType = "invoice" | "delivery-challan" | "eway-bill" | "insurance";
type GateDocument = {
  type: GateDocumentType;
  name: string;
  size: number;
  url: string;
  number: string;
  expiry: string;
  confidence: number;
  status: "processing" | "ready" | "invalid";
};

const documentRequirements: Array<{ type: GateDocumentType; label: string; required: boolean; needsExpiry: boolean }> = [
  { type: "invoice", label: "Tax invoice", required: false, needsExpiry: false },
  { type: "delivery-challan", label: "Delivery challan", required: false, needsExpiry: false },
  { type: "eway-bill", label: "E-way bill", required: false, needsExpiry: true },
  { type: "insurance", label: "Vehicle insurance", required: false, needsExpiry: true },
];

function DocumentsVerification() {
  const [documents, setDocuments] = React.useState<Partial<Record<GateDocumentType, GateDocument>>>({});
  const [activeType, setActiveType] = React.useState<GateDocumentType>("invoice");
  const [dragging, setDragging] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const invalidate = () => {};
  const updateDocument = (type: GateDocumentType, patch: Partial<GateDocument>) => {
    setDocuments((current) => {
      const existing = current[type];
      return existing ? { ...current, [type]: { ...existing, ...patch } } : current;
    });
    invalidate();
  };

  const acceptFile = (file: File, type = activeType) => {
    const allowed = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      toast.error("Unsupported document", { description: "Upload a PDF, JPG, PNG or WebP file." });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File is too large", { description: "Maximum document size is 10 MB." });
      return;
    }
    const url = URL.createObjectURL(file);
    const seed = Math.floor(100000 + Math.random() * 899999);
    const generatedNumber = type === "invoice" ? `INV-2026-${seed}` : type === "delivery-challan" ? `DC-${seed}` : type === "eway-bill" ? `EWB-${seed}` : `INS-${seed}`;
    const doc: GateDocument = { type, name: file.name, size: file.size, url, number: "", expiry: "", confidence: 0, status: "processing" };
    setDocuments((current) => ({ ...current, [type]: doc }));
    invalidate();
    toast.info("Document uploaded", { description: "Extracting metadata with OCR…" });
    window.setTimeout(() => {
      setDocuments((current) => {
        const existing = current[type];
        if (!existing || existing.url !== url) return current;
        return { ...current, [type]: { ...existing, number: generatedNumber, confidence: 94 + Math.floor(Math.random() * 5), status: "ready" } };
      });
      toast.success("Document processed", { description: `${generatedNumber} extracted successfully.` });
    }, 750);
  };

  const removeDocument = (type: GateDocumentType) => {
    const doc = documents[type];
    if (doc?.url.startsWith("blob:")) URL.revokeObjectURL(doc.url);
    setDocuments((current) => {
      const next = { ...current };
      delete next[type];
      return next;
    });
    invalidate();
    toast.info("Document removed");
  };

  const addPrototypeDocument = (type: GateDocumentType) => {
    const requirement = documentRequirements.find((item) => item.type === type)!;
    const numbers: Record<GateDocumentType, string> = { invoice: "INV-2026-884217", "delivery-challan": "DC-774201", "eway-bill": "EWB-181009442771", insurance: "INS-MH12-440821" };
    setDocuments((current) => ({ ...current, [type]: { type, name: `${requirement.label.toLowerCase().replaceAll(" ", "-")}.pdf`, size: 248000, url: "", number: numbers[type], expiry: requirement.needsExpiry ? "2027-08-03" : "", confidence: 98, status: "ready" } }));
    invalidate();
    toast.success(`${requirement.label} added`);
  };

  const verifyDocuments = () => {
    const processing = Object.values(documents).some((doc) => doc?.status === "processing");
    if (processing) {
      toast.error("OCR is still processing a document.");
      return;
    }
    const invalid = documentRequirements.find((requirement) => {
      const doc = documents[requirement.type];
      if (!doc) return false;
      return requirement.needsExpiry && Boolean(doc.expiry) && new Date(`${doc.expiry}T23:59:59`).getTime() < Date.now();
    });
    if (invalid) {
      toast.error(`${invalid.label} details are invalid`, { description: "The entered expiry date has passed." });
      return;
    }
    toast.success("Documents checked", { description: Object.keys(documents).length ? "All uploaded document details are valid." : "No documents were added; you can continue." });
  };

  const uploadedCount = Object.values(documents).filter((doc) => doc?.status === "ready").length;

  return (
    <div className="space-y-6">
      <input ref={fileInputRef} type="file" accept=".pdf,image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) acceptFile(file); e.currentTarget.value = ""; }} />
      <div className="grid gap-4 md:grid-cols-4">
        {documentRequirements.map((requirement) => {
          const doc = documents[requirement.type];
          return <button type="button" key={requirement.type} onClick={() => setActiveType(requirement.type)} className={`surface-card p-4 text-left transition ${activeType === requirement.type ? "border-primary ring-2 ring-primary/15" : "hover:border-primary/40"}`}>
            <div className="flex items-start justify-between gap-2"><FileText className={`h-5 w-5 ${doc?.status === "ready" ? "text-emerald-600" : "text-muted-foreground"}`} />{doc?.status === "ready" ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <span className="text-[10px] text-muted-foreground">OPTIONAL</span>}</div>
            <p className="mt-3 text-sm font-semibold">{requirement.label}</p><p className="mt-1 truncate text-xs text-muted-foreground">{doc ? doc.name : "Not uploaded"}</p>
          </button>;
        })}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_1.25fr]">
        <div className="surface-card p-5">
          <h2 className="font-semibold">Upload {documentRequirements.find((item) => item.type === activeType)?.label}</h2>
          <div onDragEnter={(e) => { e.preventDefault(); setDragging(true); }} onDragOver={(e) => e.preventDefault()} onDragLeave={() => setDragging(false)} onDrop={(e) => { e.preventDefault(); setDragging(false); const file = e.dataTransfer.files[0]; if (file) acceptFile(file); }} className={`mt-4 flex min-h-52 flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition ${dragging ? "border-primary bg-primary/5" : "border-border bg-muted/20"}`}>
            <UploadCloud className="h-10 w-10 text-muted-foreground" /><p className="mt-3 text-sm font-semibold">Drop a document here</p><p className="mt-1 text-xs text-muted-foreground">PDF, JPG, PNG or WebP · maximum 10 MB</p>
            <Button type="button" variant="outline" className="mt-4" onClick={() => fileInputRef.current?.click()}><Upload className="mr-2 h-4 w-4" />Choose file</Button>
            <Button type="button" variant="ghost" size="sm" className="mt-2" onClick={() => addPrototypeDocument(activeType)}>Use prototype document</Button>
          </div>
        </div>

        <div className="surface-card p-5">
          <div className="flex items-center justify-between"><div><h2 className="font-semibold">Document details</h2><p className="text-xs text-muted-foreground">Review OCR data when documents are provided.</p></div><span className="text-xs font-medium text-muted-foreground">{uploadedCount}/{documentRequirements.length} uploaded</span></div>
          <div className="mt-4 space-y-3">
            {documentRequirements.map((requirement) => {
              const doc = documents[requirement.type];
              if (!doc) return null;
              return <div key={requirement.type} className="rounded-lg border p-4">
                <div className="flex flex-wrap items-start justify-between gap-2"><div><p className="text-sm font-semibold">{requirement.label}</p><p className="max-w-64 truncate text-xs text-muted-foreground">{doc.name} · {(doc.size / 1024).toFixed(0)} KB</p></div><div className="flex items-center gap-1">{doc.url && <Button type="button" variant="ghost" size="icon" title="Preview" onClick={() => window.open(doc.url, "_blank", "noopener,noreferrer")}><Eye className="h-4 w-4" /></Button>}<Button type="button" variant="ghost" size="icon" title="Remove" onClick={() => removeDocument(requirement.type)}><Trash2 className="h-4 w-4 text-destructive" /></Button></div></div>
                {doc.status === "processing" ? <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Extracting document metadata…</div> : <div className="mt-3 grid gap-3 sm:grid-cols-2"><div><Label className="text-xs">Document number</Label><Input className="mt-1 font-mono" value={doc.number} onChange={(e) => updateDocument(requirement.type, { number: e.target.value.toUpperCase() })} /></div>{requirement.needsExpiry && <div><Label className="text-xs">Valid until</Label><Input className="mt-1" type="date" value={doc.expiry} onChange={(e) => updateDocument(requirement.type, { expiry: e.target.value })} /></div>}<p className="self-end text-xs text-emerald-600">OCR confidence {doc.confidence}%</p></div>}
              </div>;
            })}
            {!Object.keys(documents).length && <div className="grid min-h-52 place-items-center rounded-lg border border-dashed text-center text-sm text-muted-foreground"><div><FileText className="mx-auto mb-2 h-8 w-8" /><p>Uploaded documents appear here.</p></div></div>}
          </div>
        </div>
      </div>

      <div className="surface-card flex flex-wrap items-center justify-between gap-4 p-5"><div className="flex items-center gap-3"><FileCheck2 className="h-8 w-8 text-primary" /><div><p className="font-semibold">Optional document check</p><p className="text-xs text-muted-foreground">Uploaded document numbers and expiry dates can be checked before continuing.</p></div></div><Button type="button" variant="outline" onClick={verifyDocuments}><ShieldCheck className="mr-2 h-4 w-4" />Check uploaded documents</Button></div>
    </div>
  );
}

type PurchaseOrderRecord = {
  po: string;
  asn: string;
  supplier: string;
  supplierCode: string;
  deliveryDate: string;
  warehouse: string;
  status: "Open" | "Partially received" | "Closed" | "Blocked";
  items: Array<{ code: string; description: string; ordered: number; received: number; expected: number; unit: string }>;
};

const purchaseOrders: PurchaseOrderRecord[] = [
  {
    po: "PO-4500088721", asn: "ASN-2026-002214", supplier: "Tata Steel Processing", supplierCode: "SUP-10042",
    deliveryDate: "2026-08-03", warehouse: "Pune Distribution Centre", status: "Open",
    items: [
      { code: "RM-ST-1042", description: "CRCA Steel Coil 1.2 mm", ordered: 24, received: 8, expected: 12, unit: "MT" },
      { code: "PK-WR-2201", description: "Steel strapping roll", ordered: 40, received: 0, expected: 40, unit: "EA" },
    ],
  },
  {
    po: "PO-4500088714", asn: "ASN-2026-002198", supplier: "Havells Electricals", supplierCode: "SUP-10018",
    deliveryDate: "2026-08-03", warehouse: "Pune Distribution Centre", status: "Partially received",
    items: [{ code: "EL-CB-4408", description: "Industrial power cable 4C", ordered: 1200, received: 600, expected: 600, unit: "M" }],
  },
  {
    po: "PO-4500088650", asn: "ASN-2026-002103", supplier: "Legacy Industrial Supply", supplierCode: "SUP-10991",
    deliveryDate: "2026-07-28", warehouse: "Pune Distribution Centre", status: "Blocked",
    items: [{ code: "SP-BR-1008", description: "Industrial bearing set", ordered: 50, received: 0, expected: 50, unit: "EA" }],
  },
];

function PurchaseOrderVerification({ onVerifiedChange, onDraftChange }: { onVerifiedChange: (verified: boolean) => void; onDraftChange: (patch: Partial<NewGateEntryInput>) => void }) {
  const [query, setQuery] = React.useState("");
  const [searching, setSearching] = React.useState(false);
  const [record, setRecord] = React.useState<PurchaseOrderRecord | null>(null);
  const [verified, setVerified] = React.useState(false);
  const [declaredQuantities, setDeclaredQuantities] = React.useState<Record<string, string>>({});

  const invalidate = () => {
    setVerified(false);
    onVerifiedChange(false);
  };

  const loadRecord = (po: PurchaseOrderRecord) => {
    setRecord(po);
    setQuery(po.po);
    onDraftChange({ po: po.po, vendor: po.supplier });
    setDeclaredQuantities(Object.fromEntries(po.items.map((item) => [item.code, String(item.expected)])));
    invalidate();
  };

  const lookup = () => {
    if (!query.trim()) {
      toast.error("Enter a PO or ASN number.");
      return;
    }
    setSearching(true);
    window.setTimeout(() => {
      const value = query.trim().toLowerCase();
      const match = purchaseOrders.find((po) => po.po.toLowerCase() === value || po.asn.toLowerCase() === value);
      setSearching(false);
      if (!match) {
        setRecord(null);
        invalidate();
        toast.error("Purchase order not found", { description: "Check the PO/ASN number or contact Procurement." });
        return;
      }
      loadRecord(match);
      toast.success("Purchase order found", { description: `${match.supplier} · ${match.items.length} material line(s)` });
    }, 650);
  };

  const verifyPo = () => {
    if (!record) return;
    if (record.status === "Blocked" || record.status === "Closed") {
      invalidate();
      toast.error("Purchase order cannot be accepted", { description: `PO status is ${record.status}.` });
      return;
    }
    const invalidQuantity = record.items.some((item) => {
      const declared = Number(declaredQuantities[item.code]);
      const remaining = item.ordered - item.received;
      return !Number.isFinite(declared) || declared <= 0 || declared > remaining;
    });
    if (invalidQuantity) {
      invalidate();
      toast.error("Quantity mismatch", { description: "Declared quantities must be positive and cannot exceed the open PO quantity." });
      return;
    }
    setVerified(true);
    onVerifiedChange(true);
    toast.success("Purchase order verified", { description: "Supplier, ASN and material quantities are valid." });
  };

  return (
    <div className="space-y-6">
      <div className="surface-card p-5">
        <div className="flex items-start gap-3"><PackageSearch className="mt-0.5 h-6 w-6 text-primary" /><div><h2 className="font-semibold">Purchase order lookup</h2><p className="text-xs text-muted-foreground">Search the procurement system using a PO or advance shipment notice.</p></div></div>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Input value={query} onChange={(e) => { setQuery(e.target.value.toUpperCase()); setRecord(null); invalidate(); }} onKeyDown={(e) => { if (e.key === "Enter") lookup(); }} placeholder="PO-4500088721 or ASN-2026-002214" className="font-mono" />
          <Button type="button" onClick={lookup} disabled={searching} className="sm:w-36">
            {searching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PackageSearch className="mr-2 h-4 w-4" />}{searching ? "Searching…" : "Find order"}
          </Button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="text-xs text-muted-foreground">Try prototype data:</span>
          {purchaseOrders.slice(0, 2).map((po) => <button type="button" key={po.po} onClick={() => loadRecord(po)} className="rounded-md bg-muted px-2 py-1 font-mono text-xs hover:bg-accent">{po.po}</button>)}
        </div>
      </div>

      {record && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="surface-card p-4"><Building2 className="h-5 w-5 text-primary" /><p className="mt-3 text-xs text-muted-foreground">Supplier</p><p className="mt-1 font-semibold">{record.supplier}</p><p className="font-mono text-xs text-muted-foreground">{record.supplierCode}</p></div>
            <div className="surface-card p-4"><FileCheck2 className="h-5 w-5 text-primary" /><p className="mt-3 text-xs text-muted-foreground">Purchase order</p><p className="mt-1 font-mono font-semibold">{record.po}</p><p className="font-mono text-xs text-muted-foreground">{record.asn}</p></div>
            <div className="surface-card p-4"><CalendarDays className="h-5 w-5 text-primary" /><p className="mt-3 text-xs text-muted-foreground">Expected delivery</p><p className="mt-1 font-semibold">{record.deliveryDate}</p><p className="text-xs text-muted-foreground">{record.warehouse}</p></div>
            <div className="surface-card p-4"><ShieldCheck className="h-5 w-5 text-primary" /><p className="mt-3 text-xs text-muted-foreground">PO status</p><p className={`mt-1 font-semibold ${record.status === "Blocked" ? "text-destructive" : "text-emerald-600"}`}>{record.status}</p><p className="text-xs text-muted-foreground">Procurement status</p></div>
          </div>

          <div className="surface-card overflow-hidden">
            <div className="border-b px-5 py-4"><h3 className="font-semibold">Expected materials</h3><p className="text-xs text-muted-foreground">Confirm the quantity physically declared at the gate.</p></div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="bg-muted/50 text-xs text-muted-foreground"><tr><th className="px-5 py-3">Material</th><th className="px-4 py-3">Ordered</th><th className="px-4 py-3">Received</th><th className="px-4 py-3">Open</th><th className="px-4 py-3">Declared now</th></tr></thead>
                <tbody>{record.items.map((item) => <tr key={item.code} className="border-t"><td className="px-5 py-4"><p className="font-medium">{item.description}</p><p className="font-mono text-xs text-muted-foreground">{item.code}</p></td><td className="px-4 py-4">{item.ordered} {item.unit}</td><td className="px-4 py-4">{item.received} {item.unit}</td><td className="px-4 py-4 font-medium">{item.ordered - item.received} {item.unit}</td><td className="px-4 py-3"><div className="flex items-center gap-2"><Input className="w-24" type="number" min="0" max={item.ordered - item.received} value={declaredQuantities[item.code] ?? ""} onChange={(e) => { setDeclaredQuantities((current) => ({ ...current, [item.code]: e.target.value })); invalidate(); }} /><span className="text-xs text-muted-foreground">{item.unit}</span></div></td></tr>)}</tbody>
              </table>
            </div>
          </div>

          <div className={`surface-card flex flex-wrap items-center justify-between gap-4 p-5 ${verified ? "border-emerald-500/40 bg-emerald-500/5" : ""}`}>
            <div className="flex items-center gap-3">{verified ? <CheckCircle2 className="h-8 w-8 text-emerald-600" /> : <FileCheck2 className="h-8 w-8 text-muted-foreground" />}<div><p className="font-semibold">{verified ? "PO cleared for gate entry" : "Ready for verification"}</p><p className="text-xs text-muted-foreground">Supplier, order status, ASN and open quantities will be checked.</p></div></div>
            <Button type="button" onClick={verifyPo} disabled={verified || record.status === "Blocked"}><ShieldCheck className="mr-2 h-4 w-4" />{verified ? "Verified" : "Verify purchase order"}</Button>
          </div>
        </>
      )}
    </div>
  );
}

function DriverVerification({ onVerifiedChange, onDraftChange }: { onVerifiedChange: (verified: boolean) => void; onDraftChange: (patch: Partial<NewGateEntryInput>) => void }) {
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [licence, setLicence] = React.useState("");
  const [expiry, setExpiry] = React.useState("");
  const [transporter, setTransporter] = React.useState("");
  const [photo, setPhoto] = React.useState<string | null>(null);
  const [checking, setChecking] = React.useState(false);
  const [scanning, setScanning] = React.useState(false);
  const [result, setResult] = React.useState<DriverRecord | null>(null);
  const [licenceCameraOpen, setLicenceCameraOpen] = React.useState(false);
  const [licenceOcrProgress, setLicenceOcrProgress] = React.useState(0);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const licenceVideoRef = React.useRef<HTMLVideoElement>(null);
  const licenceStreamRef = React.useRef<MediaStream | null>(null);
  const licenceFileInputRef = React.useRef<HTMLInputElement>(null);

  const invalidate = () => {
    setResult(null);
    onVerifiedChange(false);
  };

  const fillRecord = (record: DriverRecord) => {
    setName(record.name);
    onDraftChange({ driver: record.name });
    setPhone(record.phone);
    setLicence(record.licence);
    setExpiry(record.expiry);
    setTransporter(record.transporter);
    setResult(null);
    onVerifiedChange(false);
  };

  const stopLicenceCamera = React.useCallback(() => {
    licenceStreamRef.current?.getTracks().forEach((track) => track.stop());
    licenceStreamRef.current = null;
    if (licenceVideoRef.current) licenceVideoRef.current.srcObject = null;
  }, []);

  React.useEffect(() => stopLicenceCamera, [stopLicenceCamera]);

  const scanLicence = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      toast.error("Camera is unavailable. Enter the licence number manually.");
      return;
    }
    setLicenceCameraOpen(true);
    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 } }, audio: false });
      } catch (error) {
        if (error instanceof DOMException && ["NotAllowedError", "SecurityError"].includes(error.name)) throw error;
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }
      licenceStreamRef.current = stream;
      await new Promise((resolve) => window.setTimeout(resolve, 0));
      if (licenceVideoRef.current) {
        licenceVideoRef.current.srcObject = stream;
        await licenceVideoRef.current.play();
      }
    } catch (error) {
      setLicenceCameraOpen(false);
      toast.error("Unable to open licence scanner", { description: error instanceof DOMException && error.name === "NotAllowedError" ? "Allow camera access in browser settings and retry." : (error as Error).message });
    }
  };

  const processLicenceImage = async (image: File | HTMLCanvasElement) => {
    setScanning(true);
    setLicenceOcrProgress(0);
    try {
      setLicenceOcrProgress(35);
      const source = image instanceof File ? image : await canvasToJpeg(image);
      const ocr = await extractWithGemini<DrivingLicenceOcr>(source, "driving_licence");
      setLicenceOcrProgress(100);
      const detectedLicence = ocr.licenceNumber?.toUpperCase().replace(/[^A-Z0-9]/g, "");
      if (!detectedLicence) throw new Error("Licence number was not detected. Move closer and improve lighting.");
      setLicence(detectedLicence);
      if (ocr.name) setName(ocr.name);
      if (ocr.phone) setPhone(ocr.phone);
      if (ocr.expiryDate) setExpiry(ocr.expiryDate);
      const response = await verifyDriverLicence(detectedLicence);
      if (!response.found || !response.driver) {
        onDraftChange({ driver: ocr.name || "" });
        onVerifiedChange(false);
        setResult(null);
        stopLicenceCamera();
        setLicenceCameraOpen(false);
        toast.warning("Licence auto-filled · manual verification required", {
          description: "This driver is not yet registered in the master database.",
        });
        return;
      }
      fillRecord(response.driver);
      setResult(response.driver);
      onVerifiedChange(response.verified);
      stopLicenceCamera();
      setLicenceCameraOpen(false);
      if (response.verified) toast.success("Licence scanned and driver auto-filled", { description: response.reason });
      else toast.error("Driver auto-filled but verification failed", { description: response.reason });
    } catch (error) {
      toast.error("Licence scan failed", { description: (error as Error).message });
    } finally {
      setScanning(false);
    }
  };

  const captureLicence = async () => {
    const video = licenceVideoRef.current;
    if (!video?.videoWidth || !video.videoHeight) return toast.error("Camera is not ready yet.");
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth; canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height);
    await processLicenceImage(canvas);
  };

  const handleLicenceUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Upload a valid licence image.");
      return;
    }
    void processLicenceImage(file);
  };

  const verify = async () => {
    if (!licence.trim()) {
      toast.error("Enter a driving licence number.");
      return;
    }

    setChecking(true);
    try {
      const response = await verifyDriverLicence(licence);
      if (!response.found || !response.driver) {
        setResult(null);
        onVerifiedChange(false);
        onDraftChange({ driver: name.trim() });
        toast.warning("New driver · manual approval required", {
          description: "The scanned details are retained. A supervisor must approve this driver before entry.",
        });
        return;
      }
      fillRecord(response.driver);
      setResult(response.driver);
      onDraftChange({ driver: response.driver.name });
      onVerifiedChange(response.verified);
      if (response.verified) toast.success("Driver verified", { description: response.reason });
      else toast.error("Driver verification failed", { description: response.reason });
    } catch (error) {
      setResult(null);
      onVerifiedChange(false);
      toast.error("Driver verification failed", { description: (error as Error).message });
    } finally {
      setChecking(false);
    }
  };

  const handlePhoto = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Choose an image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPhoto(String(reader.result));
    reader.readAsDataURL(file);
  };

  const expired = Boolean(result && new Date(`${result.expiry}T23:59:59`).getTime() < Date.now());
  const passed = Boolean(result && !result.blacklisted && !expired);

  return (
    <div className="space-y-6">
      <input ref={fileInputRef} type="file" accept="image/*" capture="user" className="hidden" onChange={handlePhoto} />
      <input ref={licenceFileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLicenceUpload} />
      <div className="grid gap-5 lg:grid-cols-[240px_1fr]">
        <div className="surface-card flex min-h-64 flex-col items-center justify-center overflow-hidden p-4 text-center">
          {photo ? <img src={photo} alt="Driver" className="h-44 w-full rounded-lg object-cover" /> : <div className="grid h-44 w-full place-items-center rounded-lg bg-muted"><User className="h-16 w-16 text-muted-foreground" /></div>}
          <Button type="button" variant="outline" className="mt-3 w-full" onClick={() => fileInputRef.current?.click()}>
            <Camera className="mr-2 h-4 w-4" /> {photo ? "Retake photo" : "Capture / upload photo"}
          </Button>
        </div>

        <div className="surface-card space-y-4 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><h2 className="font-semibold">Driver identity</h2><p className="text-xs text-muted-foreground">Enter manually or scan the driving licence.</p></div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={() => void scanLicence()} disabled={scanning}>
                {scanning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ScanLine className="mr-2 h-4 w-4" />}
                {scanning ? "Reading licence…" : "Scan licence"}
              </Button>
              <Button type="button" variant="outline" onClick={() => licenceFileInputRef.current?.click()} disabled={scanning}>
                <Upload className="mr-2 h-4 w-4" />Upload licence
              </Button>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5"><Label htmlFor="driver-name">Full name</Label><Input id="driver-name" value={name} onChange={(e) => { setName(e.target.value); onDraftChange({ driver: e.target.value }); invalidate(); }} placeholder="Ramesh Patil" autoComplete="name" /></div>
            <div className="space-y-1.5"><Label htmlFor="driver-phone">Mobile number</Label><Input id="driver-phone" value={phone} onChange={(e) => { setPhone(e.target.value); invalidate(); }} placeholder="+91 98220 41192" inputMode="tel" autoComplete="tel" /></div>
            <div className="space-y-1.5"><Label htmlFor="driver-licence">Driving licence</Label><Input id="driver-licence" value={licence} onChange={(e) => { setLicence(e.target.value.toUpperCase()); invalidate(); }} placeholder="MH1220190004471" className="uppercase" /></div>
            <div className="space-y-1.5"><Label htmlFor="licence-expiry">Licence expiry</Label><Input id="licence-expiry" type="date" value={expiry} onChange={(e) => { setExpiry(e.target.value); invalidate(); }} /></div>
            <div className="space-y-1.5 sm:col-span-2"><Label htmlFor="driver-transporter">Transport company</Label><Input id="driver-transporter" value={transporter} onChange={(e) => { setTransporter(e.target.value); invalidate(); }} placeholder="Shree Balaji Roadlines" /></div>
          </div>
        </div>
      </div>

      <div className="surface-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {passed ? <ShieldCheck className="h-9 w-9 text-emerald-600" /> : result ? <ShieldAlert className="h-9 w-9 text-destructive" /> : <Contact className="h-9 w-9 text-muted-foreground" />}
            <div><p className="font-semibold">Compliance verification</p><p className="text-xs text-muted-foreground">Checks licence validity and the security blacklist.</p></div>
          </div>
          <Button type="button" onClick={verify} disabled={checking}>
            {checking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
            {checking ? "Checking…" : result ? "Verify again" : "Verify driver"}
          </Button>
        </div>
        {result && (
          <div className={`mt-4 grid gap-3 rounded-lg border p-4 text-sm sm:grid-cols-3 ${passed ? "border-emerald-500/30 bg-emerald-500/5" : "border-destructive/30 bg-destructive/5"}`}>
            <div><p className="text-xs text-muted-foreground">Licence</p><p className="font-medium">{expired ? "Expired" : "Valid until"} {result.expiry}</p></div>
            <div><p className="text-xs text-muted-foreground">Blacklist</p><p className="font-medium">{result.blacklisted ? "Match found — blocked" : "No match found"}</p></div>
            <div><p className="text-xs text-muted-foreground">Previous visits</p><p className="font-medium">{result.visits} recorded</p></div>
            <div className="flex items-center gap-2 font-medium sm:col-span-3">{passed ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <ShieldAlert className="h-4 w-4 text-destructive" />}{passed ? "Driver cleared for gate entry" : "Driver cannot proceed"}</div>
          </div>
        )}
        {phone && <Button type="button" variant="ghost" size="sm" className="mt-3" onClick={() => toast.info("Calling driver", { description: phone })}><Phone className="mr-2 h-4 w-4" />Call driver</Button>}
      </div>

      <Dialog open={licenceCameraOpen} onOpenChange={(open) => { setLicenceCameraOpen(open); if (!open) stopLicenceCamera(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Scan driving licence</DialogTitle>
            <DialogDescription>Keep the licence flat and place the licence number clearly inside the frame.</DialogDescription>
          </DialogHeader>
          <div className="relative my-4 aspect-video overflow-hidden rounded-lg bg-slate-950">
            <video ref={licenceVideoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
            <div className="pointer-events-none absolute inset-x-6 top-1/2 h-16 -translate-y-1/2 rounded border-2 border-dashed border-white/80" />
            {scanning && <div className="absolute inset-0 grid place-items-center bg-slate-950/75 text-white"><div className="text-center"><Loader2 className="mx-auto h-8 w-8 animate-spin" /><p className="mt-2 text-sm">Reading licence… {licenceOcrProgress}%</p></div></div>}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => { stopLicenceCamera(); setLicenceCameraOpen(false); }}>Cancel</Button>
            <Button onClick={() => void captureLicence()} disabled={scanning}><ScanLine className="mr-2 h-4 w-4" />Capture &amp; auto-fill</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
