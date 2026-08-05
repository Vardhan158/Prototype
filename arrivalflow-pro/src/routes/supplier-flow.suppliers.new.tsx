import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Building2, Check, CreditCard, FileCheck2, Landmark, Save, Upload, UserRound } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, SectionCard } from "@/apps/supplier-flow/components/page-parts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/supplier-flow/suppliers/new")({
  head: () => ({
    meta: [
      { title: "Create Supplier | AxisWMS Procurement" },
      { name: "description", content: "Guided supplier onboarding with statutory, banking, commercial and compliance validation." },
      { property: "og:title", content: "Create Supplier | AxisWMS Procurement" },
      { property: "og:description", content: "Guided five-step supplier onboarding wizard with built-in validation." },
    ],
  }),
  component: CreateSupplier,
});

const steps = [
  { id: 0, label: "Company profile", icon: Building2 },
  { id: 1, label: "Address & contacts", icon: UserRound },
  { id: 2, label: "Commercial terms", icon: CreditCard },
  { id: 3, label: "Banking & tax", icon: Landmark },
  { id: 4, label: "Documents & review", icon: FileCheck2 },
];

function CreateSupplier() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    name: "",
    company: "",
    vendorType: "",
    category: "",
    industry: "",
    gst: "",
    msme: "",
    address: "",
    city: "",
    state: "",
    country: "India",
    pincode: "",
    contactName: "",
    contactDesignation: "",
    email: "",
    phone: "",
    website: "",
    paymentTerms: "",
    creditLimit: "",
    currency: "INR",
    incoterm: "",
    bankName: "",
    accountName: "",
    accountNumber: "",
    ifsc: "",
    branch: "",
    swift: "",
    tdsSection: "",
    remarks: "",
  });
  const [touched, setTouched] = useState(false);

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const gstValid = form.gst === "" || /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][0-9A-Z]{3}$/.test(form.gst.toUpperCase());
  const emailValid = form.email === "" || /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(form.email);

  const stepErrors: Record<number, string[]> = {
    0: [
      !form.name && "Supplier name is required",
      !form.vendorType && "Vendor type is required",
      !form.category && "Category is required",
      !gstValid && "GSTIN format is invalid (e.g. 27AAFCB9312K1ZQ)",
    ].filter(Boolean) as string[],
    1: [
      !form.address && "Registered address is required",
      !form.city && "City is required",
      !form.contactName && "Primary contact name is required",
      !emailValid && "Enter a valid email address",
      !form.email && "Email is required",
    ].filter(Boolean) as string[],
    2: [!form.paymentTerms && "Payment terms are required"].filter(Boolean) as string[],
    3: [
      !form.bankName && "Bank name is required",
      !form.accountNumber && "Account number is required",
      form.country === "India" && !form.ifsc && "IFSC is required for Indian suppliers",
    ].filter(Boolean) as string[],
    4: [],
  };

  const errors = stepErrors[step] ?? [];

  const next = () => {
    setTouched(true);
    if (errors.length) {
      toast.error("Please fix the highlighted fields", { description: `${errors.length} validation issue(s) on this step.` });
      return;
    }
    setTouched(false);
    setStep((s) => Math.min(4, s + 1));
  };

  if (success) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center py-16 text-center">
        <span className="flex size-16 items-center justify-center rounded-2xl bg-success-soft text-success">
          <Check className="size-8" />
        </span>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight">Supplier submitted for verification</h1>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Supplier <span className="num font-medium text-foreground">SUP-100738</span> — {form.name || "New Supplier"} has been
          created and routed to the compliance desk. You will be notified once verification and Category Head approval are complete.
        </p>
        <div className="card-elevate mt-6 w-full rounded-xl p-4 text-left">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">What happens next</p>
          <ol className="mt-3 space-y-2 text-sm">
            <li className="flex gap-2"><span className="text-success">✓</span> Record created in supplier master (Draft)</li>
            <li className="flex gap-2"><span className="text-primary">→</span> Compliance desk verifies GSTIN and banking within 24 hrs</li>
            <li className="flex gap-2"><span className="text-muted-foreground">•</span> Category Head approval</li>
            <li className="flex gap-2"><span className="text-muted-foreground">•</span> Vendor code released and replicated to ERP</li>
          </ol>
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button variant="outline" onClick={() => { setSuccess(false); setStep(0); }}>Create another</Button>
          <Button onClick={() => navigate({ to: "/supplier-flow/suppliers" })}>Go to supplier master</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        breadcrumbs={[{ label: "Home", to: "/supplier-flow" }, { label: "Supplier Master", to: "/supplier-flow/suppliers" }, { label: "Create supplier" }]}
        title="Create supplier"
        subtitle="Five-step onboarding with statutory validation and compliance routing"
        actions={
          <>
            <Button variant="outline" onClick={() => toast.success("Draft saved", { description: "Resume anytime from Supplier Master → Drafts." })}>
              <Save className="size-4" /> Save draft
            </Button>
            <Button variant="ghost" asChild><Link to="/supplier-flow/suppliers">Cancel</Link></Button>
          </>
        }
      />

      <ol className="card-elevate mb-4 flex overflow-x-auto rounded-xl p-2">
        {steps.map((s, i) => (
          <li key={s.id} className="flex min-w-max flex-1 items-center gap-2 px-2 py-1.5">
            <button
              onClick={() => setStep(s.id)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors",
                step === s.id ? "bg-primary-soft text-primary" : "hover:bg-accent",
              )}
            >
              <span
                className={cn(
                  "num flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                  step > s.id ? "bg-success text-background" : step === s.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                )}
              >
                {step > s.id ? <Check className="size-3.5" /> : i + 1}
              </span>
              <span className="text-xs font-medium">{s.label}</span>
            </button>
            {i < steps.length - 1 && <span className="hidden h-px flex-1 bg-border sm:block" />}
          </li>
        ))}
      </ol>

      {touched && errors.length > 0 && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>{errors.length} validation error(s)</AlertTitle>
          <AlertDescription>
            <ul className="list-disc pl-4">{errors.map((e) => <li key={e}>{e}</li>)}</ul>
          </AlertDescription>
        </Alert>
      )}

      <SectionCard title={steps[step]!.label}>
        {step === 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Fld label="Supplier name *" value={form.name} onChange={(v) => set("name", v)} placeholder="Bharat Precision Components" invalid={touched && !form.name} />
            <Fld label="Registered company name" value={form.company} onChange={(v) => set("company", v)} placeholder="Bharat Precision Components Pvt. Ltd." />
            <Sel label="Vendor type *" value={form.vendorType} onChange={(v) => set("vendorType", v)} options={["Manufacturer", "Distributor", "Service Provider", "Importer", "OEM"]} invalid={touched && !form.vendorType} />
            <Sel label="Category *" value={form.category} onChange={(v) => set("category", v)} options={["Machined Components", "Raw Material — Steel", "Hydraulic Systems", "Electrical & Control Panels", "Bearings & Power Transmission", "Packaging & Consumables", "Logistics & Freight"]} invalid={touched && !form.category} />
            <Sel label="Industry" value={form.industry} onChange={(v) => set("industry", v)} options={["Automotive Manufacturing", "Metals & Mining", "Industrial Equipment", "Electronics", "Packaging", "Transportation"]} />
            <Fld label="GSTIN" value={form.gst} onChange={(v) => set("gst", v.toUpperCase())} placeholder="27AAFCB9312K1ZQ" invalid={!gstValid} hint={!gstValid ? "15-character GSTIN required" : "Validated against GSTN portal on submit"} />
            <Fld label="MSME / Udyam registration" value={form.msme} onChange={(v) => set("msme", v)} placeholder="UDYAM-MH-19-0042318" hint="Leave blank if not applicable" />
          </div>
        )}

        {step === 1 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label className="text-xs">Registered address *</Label>
              <Textarea className="mt-1.5" rows={2} value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="Plot 42, MIDC Industrial Area, Phase II" />
            </div>
            <Sel label="Country" value={form.country} onChange={(v) => set("country", v)} options={["India", "Germany", "China", "United States", "Japan"]} />
            <Sel label="State / Province" value={form.state} onChange={(v) => set("state", v)} options={["Maharashtra", "Gujarat", "Karnataka", "Tamil Nadu", "Telangana", "Delhi", "Hamburg", "Guangdong"]} />
            <Fld label="City *" value={form.city} onChange={(v) => set("city", v)} placeholder="Pune" invalid={touched && !form.city} />
            <Fld label="Pincode / ZIP" value={form.pincode} onChange={(v) => set("pincode", v)} placeholder="411019" />
            <Fld label="Primary contact name *" value={form.contactName} onChange={(v) => set("contactName", v)} placeholder="Rajesh Malhotra" invalid={touched && !form.contactName} />
            <Fld label="Designation" value={form.contactDesignation} onChange={(v) => set("contactDesignation", v)} placeholder="Key Account Manager" />
            <Fld label="Email *" value={form.email} onChange={(v) => set("email", v)} placeholder="procurement@supplier.co.in" invalid={touched && (!form.email || !emailValid)} />
            <Fld label="Phone" value={form.phone} onChange={(v) => set("phone", v)} placeholder="+91 20 4128 7700" />
            <Fld label="Website" value={form.website} onChange={(v) => set("website", v)} placeholder="www.supplier.co.in" />
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Sel label="Payment terms *" value={form.paymentTerms} onChange={(v) => set("paymentTerms", v)} options={["Advance", "Net 15 Days", "Net 30 Days", "Net 45 Days", "Net 60 Days", "LC at Sight", "30% Advance / 70% against BL"]} invalid={touched && !form.paymentTerms} />
            <Sel label="Currency" value={form.currency} onChange={(v) => set("currency", v)} options={["INR", "USD", "EUR", "JPY"]} />
            <Fld label="Credit limit" value={form.creditLimit} onChange={(v) => set("creditLimit", v)} placeholder="12500000" hint="Exposure ceiling across all open orders" />
            <Sel label="Default incoterm" value={form.incoterm} onChange={(v) => set("incoterm", v)} options={["FOR Destination", "Ex-Works", "FOB", "CIF", "DAP", "DDP"]} />
            <div className="sm:col-span-2 space-y-2 rounded-lg border p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Commercial flags</p>
              {["Eligible for auto-PO release", "Requires quality inspection at gate", "Rate contract vendor", "ESG assessment mandatory"].map((f) => (
                <label key={f} className="flex items-center gap-2 text-sm">
                  <Checkbox defaultChecked={f === "Requires quality inspection at gate"} /> {f}
                </label>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Fld label="Bank name *" value={form.bankName} onChange={(v) => set("bankName", v)} placeholder="HDFC Bank" invalid={touched && !form.bankName} />
            <Fld label="Account holder name" value={form.accountName} onChange={(v) => set("accountName", v)} placeholder="Bharat Precision Components Pvt Ltd" />
            <Fld label="Account number *" value={form.accountNumber} onChange={(v) => set("accountNumber", v)} placeholder="50200041872193" invalid={touched && !form.accountNumber} />
            <Fld label="IFSC" value={form.ifsc} onChange={(v) => set("ifsc", v.toUpperCase())} placeholder="HDFC0000512" invalid={touched && form.country === "India" && !form.ifsc} />
            <Fld label="Branch" value={form.branch} onChange={(v) => set("branch", v)} placeholder="Chakan, Pune" />
            <Fld label="SWIFT / BIC" value={form.swift} onChange={(v) => set("swift", v.toUpperCase())} placeholder="HDFCINBBXXX" />
            <Sel label="TDS section" value={form.tdsSection} onChange={(v) => set("tdsSection", v)} options={["194Q — Purchase of goods (0.10%)", "194C — Contractors (2%)", "194J — Professional (10%)", "195 — Non-resident (10.40%)"]} />
            <div className="sm:col-span-2">
              <Alert>
                <AlertTitle>Penny-drop verification</AlertTitle>
                <AlertDescription>
                  A ₹1 test credit will be sent to validate the account. Banking details stay locked until verification succeeds.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              {["GST Registration Certificate", "Cancelled Cheque", "MSME / Udyam Certificate", "ISO 9001 Certificate", "Signed Vendor Code of Conduct"].map((d) => (
                <div key={d} className="flex items-center gap-3 rounded-lg border border-dashed p-3">
                  <Upload className="size-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{d}</p>
                    <p className="text-xs text-muted-foreground">PDF or JPG · max 10 MB</p>
                  </div>
                  <Button size="sm" variant="ghost" className="ml-auto" onClick={() => toast.success(`${d} uploaded`)}>Upload</Button>
                </div>
              ))}
            </div>
            <div>
              <Label className="text-xs">Remarks for approver</Label>
              <Textarea className="mt-1.5" rows={3} value={form.remarks} onChange={(e) => set("remarks", e.target.value)} placeholder="Strategic second source for machined housings; sample approval completed on 22 Jul 2026." />
            </div>
            <div className="rounded-lg border bg-muted/40 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Review summary</p>
              <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
                <div><dt className="text-xs text-muted-foreground">Supplier</dt><dd className="font-medium">{form.name || "—"}</dd></div>
                <div><dt className="text-xs text-muted-foreground">Type / Category</dt><dd className="font-medium">{form.vendorType || "—"} · {form.category || "—"}</dd></div>
                <div><dt className="text-xs text-muted-foreground">Location</dt><dd className="font-medium">{form.city || "—"}, {form.country}</dd></div>
                <div><dt className="text-xs text-muted-foreground">GSTIN</dt><dd className="num font-medium">{form.gst || "—"}</dd></div>
                <div><dt className="text-xs text-muted-foreground">Payment terms</dt><dd className="font-medium">{form.paymentTerms || "—"}</dd></div>
                <div><dt className="text-xs text-muted-foreground">Bank</dt><dd className="font-medium">{form.bankName || "—"}</dd></div>
              </dl>
            </div>
          </div>
        )}

        <div className="mt-6 flex items-center justify-between border-t pt-4">
          <Button variant="outline" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
            <ArrowLeft className="size-4" /> Back
          </Button>
          <p className="text-xs text-muted-foreground">Step {step + 1} of 5</p>
          {step < 4 ? (
            <Button onClick={next}>Continue <ArrowRight className="size-4" /></Button>
          ) : (
            <Button onClick={() => setSubmitOpen(true)}>Submit for verification</Button>
          )}
        </div>
      </SectionCard>

      <Dialog open={submitOpen} onOpenChange={setSubmitOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit supplier for verification?</DialogTitle>
            <DialogDescription>
              The record will be locked for editing while the compliance desk validates statutory and banking details.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSubmitOpen(false)}>Keep editing</Button>
            <Button onClick={() => { setSubmitOpen(false); setSuccess(true); toast.success("Supplier submitted", { description: "SUP-100738 routed to compliance desk." }); }}>
              Confirm & submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Fld({ label, value, onChange, placeholder, hint, invalid }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; hint?: string; invalid?: boolean }) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <Input
        className={cn("mt-1.5", invalid && "border-destructive focus-visible:ring-destructive/30")}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
      {hint && <p className={cn("mt-1 text-[11px]", invalid ? "text-destructive" : "text-muted-foreground")}>{hint}</p>}
    </div>
  );
}

function Sel({ label, value, onChange, options, invalid }: { label: string; value: string; onChange: (v: string) => void; options: string[]; invalid?: boolean }) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={cn("mt-1.5 w-full", invalid && "border-destructive")}>
          <SelectValue placeholder="Select…" />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}
