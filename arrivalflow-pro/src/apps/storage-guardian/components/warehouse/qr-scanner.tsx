import { useEffect, useId, useRef, useState } from "react";
import { Camera, CameraOff } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Camera QR scanner (html5-qrcode) loaded lazily so it never runs during SSR. */
export function QrScanner({ onScan }: { onScan: (text: string) => void }) {
  const [active, setActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reactId = useId().replace(/[^a-zA-Z0-9]/g, "");
  const containerId = useRef(`qr-reader-${reactId}`);
  const scannerRef = useRef<{ stop: () => Promise<void>; clear: () => void } | null>(null);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;

    (async () => {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        if (cancelled) return;
        const scanner = new Html5Qrcode(containerId.current);
        scannerRef.current = scanner as unknown as { stop: () => Promise<void>; clear: () => void };
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 220, height: 220 } },
          (decoded) => onScan(decoded),
          () => undefined,
        );
      } catch {
        if (!cancelled) {
          setError("Camera unavailable in this environment — type the code manually below.");
          setActive(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      const s = scannerRef.current;
      scannerRef.current = null;
      s?.stop()
        .then(() => s.clear())
        .catch(() => undefined);
    };
  }, [active, onScan]);

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant={active ? "secondary" : "outline"}
        size="sm"
        onClick={() => setActive((v) => !v)}
      >
        {active ? <CameraOff className="size-4" /> : <Camera className="size-4" />}
        {active ? "Stop camera" : "Scan with camera"}
      </Button>
      <div
        id={containerId.current}
        className={active ? "overflow-hidden rounded-md border border-border" : "hidden"}
      />
      {error && <p className="text-xs text-warning">{error}</p>}
    </div>
  );
}
