import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Download, Printer, Save } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, SectionCard } from "@/apps/supplier-flow/components/page-parts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { suppliers } from "@/apps/supplier-flow/data/procurement";

export const Route = createFileRoute("/supplier-flow/purchase-orders/new")({
  head: () => ({
    meta: [
      { title: "Create Purchase Order | AxisWMS Procurement" },
      {
        name: "description",
        content: "Raise a purchase order with vendor selection and approval routing.",
      },
      { property: "og:title", content: "Create Purchase Order | AxisWMS Procurement" },
      {
        property: "og:description",
        content: "Two-step purchase order creation with vendor selection and review.",
      },
    ],
  }),
  component: CreatePO,
});

const steps = ["Vendor & header", "Review & submit"];
const PO_NUMBER = "PO-2026-004942";

const buyerCompany = {
  name: "AxisWMS Industries Private Limited",
  address: "Plot No. 18, Chakan Industrial Area, Phase II, Pune, Maharashtra 410501, India",
  gstin: "27AABCA1234F1Z5",
  cin: "U29100MH2014PTC254821",
  email: "procurement@axiswms.com",
  phone: "+91 20 6812 4400",
};

function escapeHtml(value: string | number | undefined) {
  return String(value ?? "—")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function CreatePO() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [supplierId, setSupplierId] = useState("");
  const [warehouse, setWarehouse] = useState("");
  const [delivery, setDelivery] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [remarks, setRemarks] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [done, setDone] = useState(false);
  const [touched, setTouched] = useState(false);

  const supplier = suppliers.find((s) => s.id === supplierId);
  const blocked = supplier && supplier.status !== "Active";
  const errors =
    step === 0
      ? [
          !supplierId && "Select a supplier",
          !warehouse && "Select a receiving warehouse",
          !delivery && "Enter expected delivery date",
          blocked && `${supplier?.name} is not approved for purchasing`,
        ].filter(Boolean)
      : [];

  const purchaseOrderHtml = () => {
    const supplierAddress = supplier
      ? `${supplier.address}, ${supplier.city}, ${supplier.state} ${supplier.pincode}, ${supplier.country}`
      : "—";
    const primaryContact = supplier?.contacts.find((contact) => contact.primary) ?? supplier?.contacts[0];
    const issuedOn = new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date());
    const approvalStatus = done
      ? "Submitted for approval. This document becomes commercially binding only after approval and authorized release to the supplier. Level 1 approval: Rohit Bansal (SLA 48 hours)."
      : "Draft for review. This document is not commercially binding until it is submitted, approved and released to the supplier by an authorized signatory.";

    return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>${PO_NUMBER} | Purchase Order</title>
<style>
  *{box-sizing:border-box}body{margin:0;background:#eef2f7;color:#172033;font:13px Arial,sans-serif}.page{width:210mm;min-height:297mm;margin:16px auto;background:#fff;padding:18mm;box-shadow:0 8px 30px #1720331f}.top{display:flex;justify-content:space-between;gap:24px;border-bottom:3px solid #1d4ed8;padding-bottom:18px}.brand h1{margin:0;color:#173b7a;font-size:25px}.brand p,.muted{color:#667085}.title{text-align:right}.title h2{margin:0;font-size:27px;letter-spacing:1px}.title strong{display:block;margin-top:7px;color:#1d4ed8;font-size:15px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-top:20px}.box{border:1px solid #d8dee9;border-radius:8px;padding:14px}.box h3{margin:0 0 10px;color:#173b7a;font-size:11px;letter-spacing:1px;text-transform:uppercase}.box p{margin:4px 0;line-height:1.45}.meta{width:100%;margin:20px 0;border-collapse:collapse}.meta td{border:1px solid #d8dee9;padding:10px}.meta small{display:block;color:#667085;margin-bottom:4px}.section{margin-top:22px}.section h3{border-bottom:1px solid #d8dee9;padding-bottom:7px;color:#173b7a;font-size:13px;text-transform:uppercase;letter-spacing:.7px}.terms{width:100%;border-collapse:collapse}.terms th,.terms td{border:1px solid #d8dee9;padding:10px;text-align:left}.terms th{width:28%;background:#f6f8fb;color:#475467}.notice{margin-top:22px;border-left:4px solid #1d4ed8;background:#eff6ff;padding:12px 14px;line-height:1.5}.signatures{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;margin-top:55px}.signature{border-top:1px solid #98a2b3;padding-top:8px;text-align:center;color:#475467}.footer{margin-top:35px;border-top:1px solid #d8dee9;padding-top:10px;text-align:center;color:#667085;font-size:11px}@media print{body{background:#fff}.page{margin:0;box-shadow:none;width:auto;min-height:auto;padding:14mm}@page{size:A4;margin:0}}
</style></head><body><main class="page">
  <header class="top"><div class="brand"><h1>${escapeHtml(buyerCompany.name)}</h1><p>${escapeHtml(buyerCompany.address)}</p><p>GSTIN: ${escapeHtml(buyerCompany.gstin)} &nbsp; | &nbsp; CIN: ${escapeHtml(buyerCompany.cin)}</p></div><div class="title"><h2>PURCHASE ORDER</h2><strong>${PO_NUMBER}</strong><p class="muted">Issued ${escapeHtml(issuedOn)}</p></div></header>
  <section class="grid"><div class="box"><h3>Buyer / Bill To</h3><p><strong>${escapeHtml(buyerCompany.name)}</strong></p><p>${escapeHtml(buyerCompany.address)}</p><p>${escapeHtml(buyerCompany.email)} · ${escapeHtml(buyerCompany.phone)}</p><p>GSTIN: ${escapeHtml(buyerCompany.gstin)}</p></div><div class="box"><h3>Supplier / Vendor</h3><p><strong>${escapeHtml(supplier?.companyName ?? supplier?.name)}</strong></p><p>${escapeHtml(supplierAddress)}</p><p>Vendor code: ${escapeHtml(supplier?.code)} · GSTIN/Tax ID: ${escapeHtml(supplier?.gst)}</p><p>${escapeHtml(supplier?.email)} · ${escapeHtml(supplier?.phone)}</p>${primaryContact ? `<p>Contact: ${escapeHtml(primaryContact.name)} (${escapeHtml(primaryContact.designation)})</p>` : ""}</div></section>
  <table class="meta"><tr><td><small>Receiving location</small><strong>${escapeHtml(warehouse)}</strong></td><td><small>Expected delivery</small><strong>${escapeHtml(delivery)}</strong></td><td><small>Priority</small><strong>${escapeHtml(priority)}</strong></td></tr></table>
  <section class="section"><h3>Commercial & Company Details</h3><table class="terms"><tr><th>Supplier category</th><td>${escapeHtml(supplier?.category)} · ${escapeHtml(supplier?.vendorType)}</td></tr><tr><th>Industry</th><td>${escapeHtml(supplier?.industry)}</td></tr><tr><th>Payment terms</th><td>${escapeHtml(supplier?.paymentTerms)}</td></tr><tr><th>Transaction currency</th><td>${escapeHtml(supplier?.currency)}</td></tr><tr><th>Standard lead time</th><td>${escapeHtml(supplier?.leadTimeDays)} days</td></tr><tr><th>MSME / registration</th><td>${escapeHtml(supplier?.msme)}</td></tr><tr><th>Supplier status</th><td>${escapeHtml(supplier?.status)}</td></tr></table></section>
  <section class="section"><h3>Delivery Instructions & Remarks</h3><p>${escapeHtml(remarks || "Deliver against the approved schedule. Quote the purchase-order number on all invoices, packing lists and correspondence.")}</p></section>
  <div class="notice"><strong>Approval status:</strong> ${escapeHtml(approvalStatus)}</div>
  <section class="signatures"><div class="signature">Prepared by<br><strong>Procurement Team</strong></div><div class="signature">Reviewed by<br><strong>Category Head</strong></div><div class="signature">Authorized Signatory<br><strong>AxisWMS Industries</strong></div></section>
  <footer class="footer">System-generated purchase order · ${PO_NUMBER} · ${escapeHtml(buyerCompany.email)}</footer>
</main></body></html>`;
  };

  const printPurchaseOrder = () => {
    const printFrame = document.createElement("iframe");
    printFrame.title = "Print purchase order";
    printFrame.style.position = "fixed";
    printFrame.style.right = "0";
    printFrame.style.bottom = "0";
    printFrame.style.width = "0";
    printFrame.style.height = "0";
    printFrame.style.border = "0";
    printFrame.style.visibility = "hidden";
    document.body.appendChild(printFrame);

    const frameWindow = printFrame.contentWindow;
    const frameDocument = printFrame.contentDocument;
    if (!frameWindow || !frameDocument) {
      printFrame.remove();
      toast.error("Unable to open the print dialog.");
      return;
    }

    frameDocument.open();
    frameDocument.write(purchaseOrderHtml());
    frameDocument.close();

    const cleanup = () => window.setTimeout(() => printFrame.remove(), 500);
    frameWindow.addEventListener("afterprint", cleanup, { once: true });
    window.setTimeout(() => {
      frameWindow.focus();
      frameWindow.print();
      window.setTimeout(() => {
        if (printFrame.isConnected) printFrame.remove();
      }, 60_000);
    }, 250);
  };

  const downloadPurchaseOrder = async () => {
    if (!supplier) {
      toast.error("Select a supplier before downloading the purchase order.");
      return;
    }

    const { jsPDF } = await import("jspdf");
    const pdf = new jsPDF({ unit: "mm", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 16;
    const contentWidth = pageWidth - margin * 2;
    let y = 18;

    const ensureSpace = (height: number) => {
      if (y + height <= 280) return;
      pdf.addPage();
      y = 18;
    };
    const sectionTitle = (title: string) => {
      ensureSpace(14);
      pdf.setFillColor(239, 246, 255);
      pdf.rect(margin, y, contentWidth, 9, "F");
      pdf.setTextColor(23, 59, 122);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      pdf.text(title.toUpperCase(), margin + 3, y + 6);
      pdf.setTextColor(23, 32, 51);
      y += 13;
    };
    const detailRow = (label: string, value: string | number | undefined) => {
      const text = String(value || "—");
      const lines = pdf.splitTextToSize(text, contentWidth - 50) as string[];
      const height = Math.max(8, lines.length * 5 + 3);
      ensureSpace(height);
      pdf.setDrawColor(216, 222, 233);
      pdf.rect(margin, y, contentWidth, height);
      pdf.setFillColor(246, 248, 251);
      pdf.rect(margin, y, 46, height, "F");
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9);
      pdf.text(label, margin + 3, y + 5.5);
      pdf.setFont("helvetica", "normal");
      pdf.text(lines, margin + 50, y + 5.5);
      y += height;
    };

    pdf.setFillColor(23, 59, 122);
    pdf.rect(0, 0, pageWidth, 8, "F");
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(23, 59, 122);
    pdf.setFontSize(18);
    pdf.text(buyerCompany.name, margin, y);
    pdf.setTextColor(29, 78, 216);
    pdf.setFontSize(19);
    pdf.text("PURCHASE ORDER", pageWidth - margin, y, { align: "right" });
    y += 7;
    pdf.setTextColor(71, 84, 103);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    const companyLines = pdf.splitTextToSize(buyerCompany.address, 112) as string[];
    pdf.text(companyLines, margin, y);
    pdf.setFont("helvetica", "bold");
    pdf.text(PO_NUMBER, pageWidth - margin, y, { align: "right" });
    y += companyLines.length * 4.5;
    pdf.setFont("helvetica", "normal");
    pdf.text(`GSTIN: ${buyerCompany.gstin}  |  CIN: ${buyerCompany.cin}`, margin, y);
    pdf.text(`Issued: ${new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date())}`, pageWidth - margin, y, { align: "right" });
    y += 8;

    sectionTitle("Buyer / Bill To");
    detailRow("Company", buyerCompany.name);
    detailRow("Registered address", buyerCompany.address);
    detailRow("Corporate details", `GSTIN ${buyerCompany.gstin} | CIN ${buyerCompany.cin}`);
    detailRow("Contact", `${buyerCompany.email} | ${buyerCompany.phone}`);

    sectionTitle("Supplier / Vendor");
    const supplierAddress = `${supplier.address}, ${supplier.city}, ${supplier.state} ${supplier.pincode}, ${supplier.country}`;
    const primaryContact = supplier.contacts.find((contact) => contact.primary) ?? supplier.contacts[0];
    detailRow("Legal name", supplier.companyName ?? supplier.name);
    detailRow("Vendor details", `${supplier.code} | ${supplier.vendorType} | ${supplier.status}`);
    detailRow("Registered address", supplierAddress);
    detailRow("GSTIN / Tax ID", supplier.gst);
    detailRow("Contact", `${supplier.email} | ${supplier.phone}${primaryContact ? ` | ${primaryContact.name}, ${primaryContact.designation}` : ""}`);

    sectionTitle("Order & Commercial Details");
    detailRow("PO number", PO_NUMBER);
    detailRow("Receiving location", warehouse);
    detailRow("Expected delivery", delivery);
    detailRow("Priority", priority);
    detailRow("Category / Industry", `${supplier.category} | ${supplier.industry}`);
    detailRow("Payment terms", supplier.paymentTerms);
    detailRow("Currency", supplier.currency);
    detailRow("Standard lead time", `${supplier.leadTimeDays} days`);
    detailRow("MSME / Registration", supplier.msme);

    sectionTitle("Delivery Instructions & Remarks");
    detailRow("Instructions", remarks || "Deliver against the approved schedule. Quote the purchase-order number on all invoices, packing lists and correspondence.");

    sectionTitle("Approval");
    detailRow("Status", done ? "Submitted for approval — Level 1: Rohit Bansal (SLA 48 hours)" : "Draft for review — pending submission and authorized approval");
    y += 18;
    pdf.setDrawColor(152, 162, 179);
    const signatureWidth = (contentWidth - 16) / 3;
    ["Prepared by\nProcurement Team", "Reviewed by\nCategory Head", "Authorized Signatory\nAxisWMS Industries"].forEach((label, index) => {
      const x = margin + index * (signatureWidth + 8);
      pdf.line(x, y, x + signatureWidth, y);
      pdf.setFontSize(8);
      pdf.setTextColor(71, 84, 103);
      pdf.text(label.split("\n"), x + signatureWidth / 2, y + 5, { align: "center" });
    });

    const pages = pdf.getNumberOfPages();
    for (let page = 1; page <= pages; page += 1) {
      pdf.setPage(page);
      pdf.setFontSize(8);
      pdf.setTextColor(102, 112, 133);
      pdf.text(`System-generated purchase order · ${PO_NUMBER}`, margin, 291);
      pdf.text(`Page ${page} of ${pages}`, pageWidth - margin, 291, { align: "right" });
    }

    pdf.save(`${PO_NUMBER}.pdf`);
    toast.success("Purchase order downloaded", { description: `${PO_NUMBER}.pdf` });
  };

  const next = () => {
    setTouched(true);
    if (errors.length) {
      toast.error("Fix validation errors to continue");
      return;
    }
    setTouched(false);
    setStep((s) => Math.min(1, s + 1));
  };

  if (done) {
    return (
      <div className="mx-auto flex max-w-4xl flex-col items-center py-12 text-center">
        <span className="flex size-16 items-center justify-center rounded-2xl bg-success-soft text-success">
          <Check className="size-8" />
        </span>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight">Purchase order submitted</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          <span className="num font-medium text-foreground">{PO_NUMBER}</span> has been routed to
          the approval matrix. Level 1 approval sits with Rohit Bansal (SLA 48 hrs).
        </p>
        <div className="card-elevate mt-7 w-full rounded-xl p-5 text-left">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b pb-4">
            <div>
              <p className="text-lg font-semibold">{buyerCompany.name}</p>
              <p className="mt-1 max-w-xl text-xs text-muted-foreground">{buyerCompany.address}</p>
              <p className="mt-1 text-xs text-muted-foreground">GSTIN {buyerCompany.gstin} · CIN {buyerCompany.cin}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">Purchase Order</p>
              <p className="num mt-1 text-lg font-semibold">{PO_NUMBER}</p>
            </div>
          </div>
          <div className="grid gap-4 py-4 text-sm sm:grid-cols-2">
            <div><p className="text-xs uppercase tracking-wide text-muted-foreground">Supplier</p><p className="mt-1 font-semibold">{supplier?.companyName ?? supplier?.name}</p><p className="mt-1 text-xs text-muted-foreground">{supplier?.address}, {supplier?.city}, {supplier?.state} {supplier?.pincode}</p><p className="mt-1 text-xs text-muted-foreground">Vendor {supplier?.code} · GSTIN/Tax ID {supplier?.gst}</p></div>
            <div><p className="text-xs uppercase tracking-wide text-muted-foreground">Delivery</p><p className="mt-1 font-semibold">{warehouse}</p><p className="mt-1 text-xs text-muted-foreground">Expected {delivery} · {priority} priority</p><p className="mt-1 text-xs text-muted-foreground">{supplier?.paymentTerms} · {supplier?.currency}</p></div>
          </div>
          {remarks && <div className="border-t pt-3"><p className="text-xs uppercase tracking-wide text-muted-foreground">Instructions</p><p className="mt-1 text-sm">{remarks}</p></div>}
        </div>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Button variant="outline" onClick={printPurchaseOrder}>
            <Printer className="size-4" /> Print
          </Button>
          <Button variant="outline" onClick={downloadPurchaseOrder}>
            <Download className="size-4" /> Download
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setDone(false);
              setStep(0);
            }}
          >
            Create another
          </Button>
          <Button onClick={() => navigate({ to: "/supplier-flow/purchase-orders" })}>
            View all orders
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        breadcrumbs={[
          { label: "Home", to: "/supplier-flow" },
          { label: "Purchase Orders", to: "/supplier-flow/purchase-orders" },
          { label: "Create" },
        ]}
        title="Create purchase order"
        subtitle="Vendor selection and approval routing"
        actions={
          <>
            <Button variant="outline" onClick={() => toast.success("Draft saved")}>
              <Save className="size-4" /> Save draft
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/supplier-flow/purchase-orders">Cancel</Link>
            </Button>
          </>
        }
      />

      <ol className="card-elevate mb-4 flex overflow-x-auto rounded-xl p-2">
        {steps.map((s, i) => (
          <li key={s} className="flex min-w-max flex-1 items-center gap-2 px-2 py-1.5">
            <button
              onClick={() => setStep(i)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-2 py-1.5",
                step === i ? "bg-primary-soft text-primary" : "hover:bg-accent",
              )}
            >
              <span
                className={cn(
                  "num flex size-6 items-center justify-center rounded-full text-xs font-semibold",
                  step > i
                    ? "bg-success text-background"
                    : step === i
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                )}
              >
                {step > i ? <Check className="size-3.5" /> : i + 1}
              </span>
              <span className="text-xs font-medium">{s}</span>
            </button>
            {i < steps.length - 1 && <span className="hidden h-px flex-1 bg-border sm:block" />}
          </li>
        ))}
      </ol>

      {touched && errors.length > 0 && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Validation failed</AlertTitle>
          <AlertDescription>
            <ul className="list-disc pl-4">
              {errors.map((e) => (
                <li key={String(e)}>{e}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <SectionCard title={steps[step]}>
        {step === 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="text-xs">Supplier *</Label>
              <Select value={supplierId} onValueChange={setSupplierId}>
                <SelectTrigger className="mt-1.5 w-full">
                  <SelectValue placeholder="Select supplier…" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} — {s.status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {blocked && (
                <p className="mt-1 text-[11px] text-destructive">
                  Supplier status is “{supplier?.status}” — purchasing is disabled.
                </p>
              )}
            </div>
            <div>
              <Label className="text-xs">Receiving warehouse *</Label>
              <Select value={warehouse} onValueChange={setWarehouse}>
                <SelectTrigger className="mt-1.5 w-full">
                  <SelectValue placeholder="Select warehouse…" />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "WH-PUN-01 · Chakan Central Warehouse",
                    "WH-MUM-02 · JNPT Bonded Warehouse",
                    "WH-AHM-03 · Sanand Raw Material Yard",
                    "WH-CHN-04 · Oragadam Spares Store",
                    "WH-BLR-05 · Peenya Consumables Store",
                  ].map((w) => (
                    <SelectItem key={w} value={w}>
                      {w}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Expected delivery *</Label>
              <Input
                type="date"
                className="mt-1.5"
                value={delivery}
                onChange={(e) => setDelivery(e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs">Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="mt-1.5 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Low", "Medium", "High", "Critical"].map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs">Remarks</Label>
              <Textarea
                className="mt-1.5"
                rows={2}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Special instructions for the supplier"
              />
            </div>
            {supplier && (
              <div className="sm:col-span-2 grid gap-3 rounded-lg border bg-muted/40 p-3 text-sm sm:grid-cols-4">
                <div>
                  <p className="text-xs text-muted-foreground">Payment terms</p>
                  <p className="font-medium">{supplier.paymentTerms}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Currency</p>
                  <p className="font-medium">{supplier.currency}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Lead time</p>
                  <p className="num font-medium">{supplier.leadTimeDays} days</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Rating</p>
                  <p className="num font-medium">{supplier.rating}/5</p>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <dl className="grid gap-4 sm:grid-cols-4">
              <div>
                <dt className="text-xs text-muted-foreground">Supplier</dt>
                <dd className="text-sm font-medium">{supplier?.name ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Warehouse</dt>
                <dd className="text-sm font-medium">{warehouse || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Delivery</dt>
                <dd className="num text-sm font-medium">{delivery || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Priority</dt>
                <dd className="text-sm font-medium">{priority}</dd>
              </div>
            </dl>

            {remarks && (
              <div>
                <p className="text-xs text-muted-foreground">Remarks</p>
                <p className="mt-1 text-sm">{remarks}</p>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 flex items-center justify-between border-t pt-4">
          <Button variant="outline" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
            <ArrowLeft className="size-4" /> Back
          </Button>
          <p className="text-xs text-muted-foreground">Step {step + 1} of 2</p>
          {step < 1 ? (
            <Button onClick={next}>
              Continue <ArrowRight className="size-4" />
            </Button>
          ) : (
            <div className="flex flex-wrap items-center justify-end gap-2">
              <Button variant="outline" onClick={printPurchaseOrder}>
                <Printer className="size-4" /> Print
              </Button>
              <Button variant="outline" onClick={downloadPurchaseOrder}>
                <Download className="size-4" /> Download
              </Button>
              <Button onClick={() => setConfirm(true)}>Submit for approval</Button>
            </div>
          )}
        </div>
      </SectionCard>

      <Dialog open={confirm} onOpenChange={setConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit purchase order?</DialogTitle>
            <DialogDescription>This purchase order will be routed for approval.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirm(false)}>
              Keep editing
            </Button>
            <Button
              onClick={() => {
                setConfirm(false);
                setDone(true);
                toast.success("Purchase order submitted");
              }}
            >
              Confirm & submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
