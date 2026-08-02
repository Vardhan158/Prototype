import { Download, FileText, Printer, X, ZoomIn } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

/** PDF / attachment viewer used across receiving, GRN and reports. */
export function DocumentViewerDialog({
  name,
  onClose,
}: {
  name: string | null;
  onClose: () => void;
}) {
  if (!name) return null;
  return (
    <Dialog open={!!name} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sm">
            <FileText className="h-4 w-4 text-primary" /> {name}
          </DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-2 border-y border-border bg-surface-2/60 px-3 py-2 text-xs text-muted-foreground">
          <span className="num">Page 1 of 3</span>
          <span>Â·</span>
          <span>Rendered by WMS document service</span>
          <div className="ml-auto flex gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              onClick={() => toast.message("Zoomed to 140%")}
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              onClick={() => toast.success("Sent to printer HP-DOCK-02")}
            >
              <Printer className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              onClick={() => toast.success(`${name} downloaded`)}
            >
              <Download className="h-3.5 w-3.5" />
            </Button>
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onClose}>
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
        <div className="max-h-[60vh] overflow-y-auto rounded-xl border border-border bg-surface p-6 text-[0.72rem] leading-relaxed">
          <div className="flex items-start justify-between border-b border-border pb-3">
            <div>
              <p className="text-sm font-semibold">BOSCH REXROTH INDIA LTD.</p>
              <p className="text-muted-foreground">
                Plot 14, MIDC Chakan, Pune 410501 Â· GSTIN 27AAACB1234M1ZP
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold uppercase tracking-wide">Tax Invoice</p>
              <p className="num">BR-2026-88213</p>
              <p className="num text-muted-foreground">Dated 30 Jul 2026</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 border-b border-border py-3">
            <div>
              <p className="font-semibold">Bill to</p>
              <p className="text-muted-foreground">
                Axiom Industrial Distribution Pvt. Ltd.
                <br />
                Bhiwandi Central DC, Thane 421302
              </p>
            </div>
            <div>
              <p className="font-semibold">Ship to</p>
              <p className="text-muted-foreground">
                WH-NCR-01 Â· Dock D-01
                <br />
                Inbound North Zone
              </p>
            </div>
          </div>
          <table className="mt-3 w-full">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="py-1.5">Material</th>
                <th>Description</th>
                <th className="text-right">Qty</th>
                <th className="text-right">Rate</th>
                <th className="text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="num">
              <tr className="border-b border-border/60">
                <td className="py-1.5">MAT-HYD-4421</td>
                <td>Hydraulic Servo Valve 4WRPEH</td>
                <td className="text-right">240</td>
                <td className="text-right">8,450</td>
                <td className="text-right">20,28,000</td>
              </tr>
              <tr className="border-b border-border/60">
                <td className="py-1.5">MAT-SEA-1180</td>
                <td>Viton O-Ring Seal Kit 180mm</td>
                <td className="text-right">600</td>
                <td className="text-right">420</td>
                <td className="text-right">2,52,000</td>
              </tr>
              <tr>
                <td className="py-1.5">MAT-PMP-3390</td>
                <td>Axial Piston Pump A10VSO</td>
                <td className="text-right">40</td>
                <td className="text-right">62,500</td>
                <td className="text-right">25,00,000</td>
              </tr>
            </tbody>
          </table>
          <div className="mt-4 ml-auto w-56 space-y-1 num">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Taxable value</span>
              <span>47,80,000</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">IGST @ 18%</span>
              <span>8,60,400</span>
            </div>
            <div className="flex justify-between border-t border-border pt-1 font-semibold">
              <span>Invoice total</span>
              <span>56,40,400</span>
            </div>
          </div>
          <p className="mt-6 text-muted-foreground">
            Certified that the particulars given above are true and correct. Goods once dispatched
            are covered under marine cargo policy MC-77120.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
