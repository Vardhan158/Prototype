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

  const handlePrint = () => {
    if (!ref.current) return;
    const dataUrl = ref.current.toDataURL();
    const printWindow = window.open("", "_blank", "width=600,height=700");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>QR Label</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 24px; display: flex; justify-content: center; align-items: center; }
            .card { border: 1px solid #d1d5db; border-radius: 12px; padding: 24px; text-align: center; width: 320px; }
            img { width: 220px; height: 220px; }
            .value { margin-top: 12px; font-size: 11px; word-break: break-all; color: #111827; }
          </style>
        </head>
        <body>
          <div class="card">
            <img id="qr-image" src="${dataUrl}" alt="QR code" />
            <div class="value">${value}</div>
          </div>
          <script>
            const img = document.getElementById('qr-image');
            function printAfterLoad() {
              window.focus();
              window.print();
            }
            img.onload = printAfterLoad;
            img.onerror = printAfterLoad;
            window.onafterprint = () => window.close();
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
  };

  return (
    <div className="inline-flex flex-col items-center gap-1.5 rounded-md bg-white p-2">
      <canvas ref={ref} width={size} height={size} />
      <span className="font-mono text-[10px] font-semibold text-black">{value}</span>
      <button
        type="button"
        onClick={handlePrint}
        className="rounded border border-blue-600 px-2 py-1 text-[10px] font-medium text-blue-600 hover:bg-blue-50"
      >
        Print QR
      </button>
    </div>
  );
}
