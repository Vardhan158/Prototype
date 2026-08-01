import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import * as React from "react";
import {
  Camera,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ScanLine,
  Truck,
  Upload,
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

export const Route = createFileRoute("/gate-pass-pro/gate-entry/new")({
  component: NewGateEntry,
});

const steps = ["Vehicle", "Driver", "PO", "Documents", "Safety", "Review"];

function NewGateEntry() {
  const router = useRouter();
  const [step, setStep] = React.useState(0);

  const goNext = () => setStep((s) => Math.min(s + 1, steps.length - 1));
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
            <Button size="sm" onClick={goNext}>
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
        <Progress value={((step + 1) / steps.length) * 100} className="mb-8" />

        {step === 0 && <VehicleVerification />}
        {/* Other steps would be rendered here based on the 'step' state */}
        {step > 0 && (
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

function VehicleVerification() {
  const [vehicleNumber, setVehicleNumber] = React.useState("");
  const [isCameraOpen, setCameraOpen] = React.useState(false);
  const [isOcrRunning, setOcrRunning] = React.useState(false);
  const [truckPhoto, setTruckPhoto] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleCapture = () => {
    setOcrRunning(true);
    setTimeout(() => {
      const randomPlate = `MH ${Math.floor(Math.random() * 99)} ${String.fromCharCode(
        65 + Math.floor(Math.random() * 26),
      )}${String.fromCharCode(
        65 + Math.floor(Math.random() * 26),
      )} ${Math.floor(1000 + Math.random() * 9000)}`;
      setVehicleNumber(randomPlate);
      setOcrRunning(false);
      setCameraOpen(false);
      toast.success("Number plate captured via OCR.", {
        description: `Vehicle Number: ${randomPlate}`,
      });
    }, 1500);
  };

  const handlePhotoCapture = () => {
    // In a real app, this would use the camera.
    // Here we'll just use a placeholder image.
    setTruckPhoto("https://via.placeholder.com/400x300.png/09f/fff?text=Truck+Photo");
    toast.info("Truck photo captured.");
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTruckPhoto(reader.result as string);
        toast.info("Truck photo uploaded.");
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hidden file input for upload */}
      <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" className="hidden" />

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
             <Button size="sm" onClick={handlePhotoCapture}>
                <Camera className="mr-2 h-4 w-4" />
                Capture
             </Button>
             <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}>
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
          <Button className="mt-4" onClick={() => setCameraOpen(true)}>
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
            onChange={(e) => setVehicleNumber(e.target.value)}
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

      <Dialog open={isCameraOpen} onOpenChange={setCameraOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Scan Number Plate</DialogTitle>
            <DialogDescription>
              Position the vehicle's number plate within the frame.
            </DialogDescription>
          </DialogHeader>
          <div className="relative my-4 flex aspect-video items-center justify-center rounded-lg bg-slate-900 text-slate-400">
            {isOcrRunning ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
                <p className="text-sm">Running OCR...</p>
              </div>
            ) : (
              <p>Camera feed would appear here</p>
            )}
            <div className="pointer-events-none absolute inset-4 rounded-lg border-2 border-dashed border-white/50" />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setCameraOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCapture} disabled={isOcrRunning}>
              {isOcrRunning ? "Scanning..." : "Capture"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}