import { useEffect, useState } from "react";
import { Camera, Check, Loader2, ScanLine, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type Mode = "camera" | "ocr" | "qr" | "barcode";

const COPY: Record<Mode, { title: string; hint: string; cta: string }> = {
  camera: { title: "Camera", hint: "Frame the subject inside the guides", cta: "Capture" },
  ocr: { title: "OCR Scanner", hint: "Hold steady over the text to auto-read", cta: "Scan & Read" },
  qr: { title: "QR Scanner", hint: "Align the QR code inside the frame", cta: "Scan QR" },
  barcode: { title: "Barcode Scanner", hint: "Center the barcode in the red line", cta: "Scan Barcode" },
};

export function ScanSheet({
  open,
  mode,
  label,
  onClose,
  onResult,
}: {
  open: boolean;
  mode: Mode;
  label: string;
  onClose: () => void;
  onResult: () => void;
}) {
  const [phase, setPhase] = useState<"idle" | "working" | "done">("idle");

  useEffect(() => {
    if (open) setPhase("idle");
  }, [open]);

  useEffect(() => {
    if (phase !== "working") return;
    const t = setTimeout(() => setPhase("done"), 1100);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== "done") return;
    const t = setTimeout(() => {
      onResult();
      onClose();
    }, 550);
    return () => clearTimeout(t);
  }, [phase, onResult, onClose]);

  if (!open) return null;

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-[oklch(0.16_0.02_265)] text-white">
      <div className="flex items-center justify-between px-4 py-3">
        <div>
          <p className="text-sm font-semibold">{COPY[mode].title}</p>
          <p className="text-xs text-white/60">{label}</p>
        </div>
        <button onClick={onClose} aria-label="Close scanner" className="grid size-10 place-items-center rounded-full bg-white/10">
          <X className="size-5" />
        </button>
      </div>

      <div className="relative mx-4 flex-1 overflow-hidden rounded-3xl bg-[linear-gradient(160deg,oklch(0.32_0.03_250),oklch(0.22_0.02_265))]">
        <div className="absolute inset-8 rounded-2xl border-2 border-dashed border-white/40" />
        <div className="absolute inset-x-10 h-0.5 animate-scanline bg-[oklch(0.72_0.19_145)] shadow-[0_0_18px_oklch(0.72_0.19_145)]" />
        <div className="absolute inset-x-0 bottom-6 text-center text-xs text-white/70">
          {phase === "working" ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="size-4 animate-spin" /> Processing…
            </span>
          ) : phase === "done" ? (
            <span className="inline-flex items-center gap-2 text-[oklch(0.8_0.19_145)]">
              <Check className="size-4" /> Captured · auto-filling form
            </span>
          ) : (
            COPY[mode].hint
          )}
        </div>
      </div>

      <div className="px-6 py-6">
        <Button
          size="lg"
          disabled={phase !== "idle"}
          onClick={() => setPhase("working")}
          className="h-16 w-full rounded-2xl text-base font-semibold"
        >
          {mode === "camera" ? <Camera className="size-6" /> : <ScanLine className="size-6" />}
          {COPY[mode].cta}
        </Button>
      </div>
    </div>
  );
}