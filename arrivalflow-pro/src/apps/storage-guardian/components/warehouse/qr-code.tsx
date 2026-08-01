import { useEffect, useRef } from "react";
import QRCode from "qrcode";

export function QrCode({ value, size = 128 }: { value: string; size?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!ref.current || !value) return;
    QRCode.toCanvas(ref.current, value, {
      width: size,
      margin: 1,
      color: { dark: "#0d1117", light: "#ffffff" },
    }).catch(() => undefined);
  }, [value, size]);

  return (
    <div className="inline-flex flex-col items-center gap-1.5 rounded-md bg-white p-2">
      <canvas ref={ref} width={size} height={size} />
      <span className="font-mono text-[10px] font-semibold text-black">{value}</span>
    </div>
  );
}
