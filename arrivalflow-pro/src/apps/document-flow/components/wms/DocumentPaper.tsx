import { cn } from "@/lib/utils";

/** A realistic rendered warehouse tax invoice used by the viewer & OCR screens. */
export function DocumentPaper({
  highlight,
  scanning = false,
  className,
  page = 1,
}: {
  highlight?: string | null;
  scanning?: boolean;
  className?: string;
  page?: number;
}) {
  const hl = (key: string) =>
    cn(
      "rounded-[4px] px-1 -mx-1 transition-colors duration-300",
      highlight === key && "bg-warning/35 outline outline-2 outline-warning/70",
    );

  return (
    <div
      className={cn(
        "relative mx-auto w-full max-w-[720px] overflow-hidden rounded-lg bg-white text-[11px] leading-relaxed text-slate-800 shadow-[0_10px_40px_-16px_rgba(15,23,42,0.45)]",
        className,
      )}
    >
      {scanning && (
        <>
          <div className="pointer-events-none absolute inset-0 z-20 bg-primary/5" />
          <div className="pointer-events-none absolute inset-x-0 z-20 h-24 animate-scanline bg-gradient-to-b from-transparent via-primary/25 to-transparent" />
        </>
      )}

      <div className="p-7">
        <div className="flex items-start justify-between border-b-2 border-slate-800 pb-3">
          <div>
            <p className="text-[15px] font-bold tracking-tight">BHARAT STEEL TUBES PVT LTD</p>
            <p className="text-[10px] text-slate-500">
              Survey 118/2, Wagle Estate, Thane (W), Maharashtra 400604
            </p>
            <p className="text-[10px] text-slate-500">
              GSTIN: <span className={hl("gstin")}>27AABCB1429P1ZK</span> · CIN: U27109MH1994PTC078441
            </p>
          </div>
          <div className="text-right">
            <p className="text-[13px] font-bold uppercase tracking-widest text-slate-700">Tax Invoice</p>
            <p className="text-[10px] text-slate-500">Original for Recipient</p>
            <p className="mt-1 inline-block rounded border border-slate-300 px-2 py-0.5 text-[9px] font-semibold">
              Page {page} of 3
            </p>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-4">
          <div className="space-y-0.5">
            <Row label="Invoice No." value="INV/26-27/8841" cls={hl("invoiceNo")} bold />
            <Row label="Invoice Date" value="29-07-2026" cls={hl("invoiceDate")} />
            <Row label="Buyer PO" value="PO-2026-77120" cls={hl("po")} />
            <Row label="ASN Ref." value="ASN-88431" cls={hl("asn")} />
            <Row label="Challan No." value="DC-4478" cls={hl("challan")} />
          </div>
          <div className="space-y-0.5">
            <Row label="E-Way Bill" value="3910 0452 8817" cls={hl("eway")} />
            <Row label="Vehicle No." value="MH-04-KL-8823" cls={hl("vehicle")} />
            <Row label="Driver" value="Sandeep Yadav" cls={hl("driver")} />
            <Row label="DL No." value="MH0320180004521" cls={hl("license")} />
            <Row label="Gross Wt." value="18,420 KG" cls={hl("weight")} />
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="rounded border border-slate-200 p-2">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">Bill To</p>
            <p className="font-semibold">Axion Supply Chain Ltd</p>
            <p className="text-[10px] text-slate-500">Corporate Office, BKC, Mumbai 400051</p>
            <p className="text-[10px] text-slate-500">GSTIN: 27AAECA9931Q1Z8</p>
          </div>
          <div className="rounded border border-slate-200 p-2">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">Ship To</p>
            <p className={cn("font-semibold", hl("warehouse"))}>WH-01 Bhiwandi Central</p>
            <p className={cn("text-[10px] text-slate-500", hl("address"))}>
              Plot 14, MIDC Bhiwandi, Thane 421302
            </p>
            <p className={cn("text-[10px] text-slate-500", hl("destination"))}>Dock 7 · Inbound Bay B</p>
          </div>
        </div>

        <table className="mt-3 w-full border-collapse text-[10px]">
          <thead>
            <tr className="bg-slate-100 text-left">
              <th className="border border-slate-200 px-1.5 py-1">#</th>
              <th className="border border-slate-200 px-1.5 py-1">Material Description</th>
              <th className="border border-slate-200 px-1.5 py-1">HSN</th>
              <th className="border border-slate-200 px-1.5 py-1 text-right">Qty</th>
              <th className="border border-slate-200 px-1.5 py-1">UoM</th>
              <th className="border border-slate-200 px-1.5 py-1 text-right">Rate</th>
              <th className="border border-slate-200 px-1.5 py-1 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-slate-200 px-1.5 py-1">1</td>
              <td className={cn("border border-slate-200 px-1.5 py-1", hl("material"))}>
                ERW Steel Tube 48.3mm × 3.2mm × 6M
              </td>
              <td className={cn("border border-slate-200 px-1.5 py-1", hl("hsn"))}>73063090</td>
              <td className={cn("border border-slate-200 px-1.5 py-1 text-right", hl("quantity"))}>1,240</td>
              <td className={cn("border border-slate-200 px-1.5 py-1", hl("unit"))}>NOS</td>
              <td className="border border-slate-200 px-1.5 py-1 text-right">812.40</td>
              <td className="border border-slate-200 px-1.5 py-1 text-right">10,07,376.00</td>
            </tr>
            <tr>
              <td className="border border-slate-200 px-1.5 py-1">2</td>
              <td className="border border-slate-200 px-1.5 py-1">MS Coupling Sleeve 48.3mm (Zinc)</td>
              <td className="border border-slate-200 px-1.5 py-1">73079990</td>
              <td className="border border-slate-200 px-1.5 py-1 text-right">620</td>
              <td className="border border-slate-200 px-1.5 py-1">NOS</td>
              <td className="border border-slate-200 px-1.5 py-1 text-right">112.55</td>
              <td className="border border-slate-200 px-1.5 py-1 text-right">69,781.00</td>
            </tr>
            <tr>
              <td className="border border-slate-200 px-1.5 py-1">3</td>
              <td className="border border-slate-200 px-1.5 py-1">Anti-corrosion Coating Charges</td>
              <td className="border border-slate-200 px-1.5 py-1">998898</td>
              <td className="border border-slate-200 px-1.5 py-1 text-right">1</td>
              <td className="border border-slate-200 px-1.5 py-1">LOT</td>
              <td className="border border-slate-200 px-1.5 py-1 text-right">11,402.32</td>
              <td className="border border-slate-200 px-1.5 py-1 text-right">11,402.32</td>
            </tr>
          </tbody>
        </table>

        <div className="mt-2 flex justify-end">
          <div className="w-64 space-y-0.5">
            <Row label="Taxable Value" value="₹ 10,88,559.32" cls={hl("amount")} />
            <Row label="CGST 9%" value="₹ 97,970.34" />
            <Row label="SGST 9%" value="₹ 97,970.34" cls={hl("gst")} />
            <div className="mt-1 flex justify-between border-t border-slate-800 pt-1 text-[12px] font-bold">
              <span>Invoice Total</span>
              <span className={hl("total")}>₹ 12,84,500.00</span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-end justify-between">
          <div className="space-y-1">
            <div className="flex h-9 w-40 items-end gap-[2px] overflow-hidden">
              {Array.from({ length: 44 }).map((_, i) => (
                <span
                  key={i}
                  className="block bg-slate-900"
                  style={{ width: i % 3 === 0 ? 3 : 1.5, height: "100%" }}
                />
              ))}
            </div>
            <p className="text-[9px] tracking-[0.2em] text-slate-500">*INV26278841*</p>
          </div>
          <div className="grid size-16 grid-cols-7 grid-rows-7 gap-[1px] rounded bg-white p-1 ring-1 ring-slate-200">
            {Array.from({ length: 49 }).map((_, i) => (
              <span key={i} className={i % 3 === 0 || i % 7 === 0 ? "bg-slate-900" : "bg-white"} />
            ))}
          </div>
          <div className="text-center">
            <div className="mx-auto grid size-16 -rotate-12 place-items-center rounded-full border-2 border-teal-600/70 text-[7px] font-bold uppercase leading-tight text-teal-700/80">
              Quality
              <br />
              Passed
              <br />
              QA-118
            </div>
            <p className="mt-1 border-t border-slate-400 pt-0.5 text-[9px] text-slate-500">
              Authorised Signatory
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  cls,
  bold,
}: {
  label: string;
  value: string;
  cls?: string;
  bold?: boolean;
}) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-[10px] text-slate-500">{label}</span>
      <span className={cn("text-[10px]", bold && "font-bold", cls)}>{value}</span>
    </div>
  );
}
