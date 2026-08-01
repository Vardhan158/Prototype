/**
 * Mock enterprise procurement dataset.
 * Realistic Indian + global manufacturing supply base.
 */

export type SupplierStatus = "Active" | "Pending Verification" | "Pending Approval" | "Inactive" | "Blocked" | "Archived";
export type POStatus = "Draft" | "Submitted" | "Pending Approval" | "Approved" | "Sent to Supplier" | "Acknowledged" | "Partially Received" | "Closed" | "Rejected" | "Cancelled";
export type ASNStatus = "Draft" | "Submitted" | "In Transit" | "Delayed" | "Arrived" | "Gate Entry Pending" | "Received";
export type RiskLevel = "Low" | "Medium" | "High";

export interface Contact {
  name: string;
  designation: string;
  email: string;
  phone: string;
  primary: boolean;
}

export interface SupplierDoc {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedOn: string;
  expiresOn?: string;
  status: "Verified" | "Pending" | "Expired";
}

export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  actor: string;
  timestamp: string;
  state: "done" | "current" | "pending" | "error";
}

export interface Supplier {
  id: string;
  code: string;
  name: string;
  companyName: string;
  gst: string;
  pan: string;
  msme: string;
  vendorType: "Manufacturer" | "Distributor" | "Service Provider" | "Importer" | "OEM";
  category: string;
  industry: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  email: string;
  website: string;
  phone: string;
  contacts: Contact[];
  paymentTerms: string;
  creditLimit: number;
  currency: string;
  bank: { bankName: string; accountName: string; accountNumber: string; ifsc: string; branch: string; swift: string };
  taxInfo: { tdsSection: string; tdsRate: string; gstRegime: string; msmeRegNo: string };
  status: SupplierStatus;
  rating: number;
  onTimeDelivery: number;
  qualityScore: number;
  defectRate: number;
  leadTimeDays: number;
  spendYtd: number;
  openPOs: number;
  risk: RiskLevel;
  riskScores: { financial: number; compliance: number; operational: number; geographic: number };
  onboardedOn: string;
  documents: SupplierDoc[];
  certifications: { name: string; body: string; validTill: string; status: "Valid" | "Expiring" | "Expired" }[];
  contracts: { id: string; title: string; value: number; start: string; end: string; status: "Active" | "Expiring" | "Expired" }[];
  audits: { id: string; date: string; type: string; auditor: string; score: number; findings: number; result: "Passed" | "Passed with observations" | "Failed" }[];
  timeline: TimelineEvent[];
}

export interface POItem {
  id: string;
  material: string;
  description: string;
  hsn: string;
  uom: string;
  qty: number;
  received?: number;
  unitPrice: number;
  discountPct: number;
  taxPct: number;
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  supplier: string;
  warehouse: string;
  buyer: string;
  currency: string;
  createdOn: string;
  expectedDelivery: string;
  status: POStatus;
  priority: "Low" | "Medium" | "High" | "Critical";
  paymentTerms: string;
  incoterm: string;
  costCenter: string;
  budgetCode: string;
  budgetAvailable: number;
  remarks: string;
  items: POItem[];
  approvals: { level: string; role: string; approver: string; status: "Approved" | "Pending" | "Rejected" | "Not started"; on?: string; comment?: string }[];
  revisions: { rev: string; date: string; by: string; change: string }[];
  attachments: { name: string; type: string; size: string }[];
  timeline: TimelineEvent[];
}

export interface ASN {
  id: string;
  poId: string;
  supplierId: string;
  supplier: string;
  shipmentNo: string;
  transporter: string;
  vehicleNo: string;
  containerNo: string;
  driverName: string;
  driverPhone: string;
  driverLicense: string;
  invoiceNo: string;
  ewayBill: string;
  packingList: string;
  deliveryChallan: string;
  dispatchedOn: string;
  expectedArrival: string;
  warehouse: string;
  gate: string;
  status: ASNStatus;
  weightKg: number;
  volumeCbm: number;
  packages: number;
  progressPct: number;
  currentLocation: string;
  materials: { material: string; description: string; qty: number; uom: string; batch: string }[];
  documents: { name: string; type: string; size: string; status: "Verified" | "Pending" }[];
  timeline: TimelineEvent[];
}

const inr = "INR";

function tl(items: [string, string, string, string, TimelineEvent["state"]][]): TimelineEvent[] {
  return items.map(([title, description, actor, timestamp, state], i) => ({
    id: `t${i}`,
    title,
    description,
    actor,
    timestamp,
    state,
  }));
}

export const suppliers: Supplier[] = [
  {
    id: "SUP-100241",
    code: "SUP-100241",
    name: "Bharat Precision Components",
    companyName: "Bharat Precision Components Pvt. Ltd.",
    gst: "27AAFCB9312K1ZQ",
    pan: "AAFCB9312K",
    msme: "UDYAM-MH-19-0042318",
    vendorType: "Manufacturer",
    category: "Machined Components",
    industry: "Automotive Manufacturing",
    address: "Plot 42, MIDC Industrial Area, Phase II",
    city: "Pune",
    state: "Maharashtra",
    country: "India",
    pincode: "411019",
    email: "procurement@bharatprecision.co.in",
    website: "www.bharatprecision.co.in",
    phone: "+91 20 4128 7700",
    contacts: [
      { name: "Rajesh Malhotra", designation: "Key Account Manager", email: "rajesh.m@bharatprecision.co.in", phone: "+91 98220 41128", primary: true },
      { name: "Sneha Kulkarni", designation: "Logistics Coordinator", email: "sneha.k@bharatprecision.co.in", phone: "+91 98230 77412", primary: false },
    ],
    paymentTerms: "Net 45 Days",
    creditLimit: 12500000,
    currency: inr,
    bank: { bankName: "HDFC Bank", accountName: "Bharat Precision Components Pvt Ltd", accountNumber: "50200041872193", ifsc: "HDFC0000512", branch: "Chakan, Pune", swift: "HDFCINBBXXX" },
    taxInfo: { tdsSection: "194Q", tdsRate: "0.10%", gstRegime: "Regular", msmeRegNo: "UDYAM-MH-19-0042318" },
    status: "Active",
    rating: 4.6,
    onTimeDelivery: 96.4,
    qualityScore: 98.1,
    defectRate: 0.42,
    leadTimeDays: 12,
    spendYtd: 48720000,
    openPOs: 7,
    risk: "Low",
    riskScores: { financial: 88, compliance: 94, operational: 91, geographic: 86 },
    onboardedOn: "12 Mar 2021",
    documents: [
      { id: "D1", name: "GST Registration Certificate.pdf", type: "Statutory", size: "412 KB", uploadedOn: "12 Mar 2021", status: "Verified" },
      { id: "D2", name: "PAN Card.pdf", type: "Statutory", size: "180 KB", uploadedOn: "12 Mar 2021", status: "Verified" },
      { id: "D3", name: "MSME Udyam Certificate.pdf", type: "Statutory", size: "265 KB", uploadedOn: "04 Jan 2024", status: "Verified" },
      { id: "D4", name: "Cancelled Cheque - HDFC.jpg", type: "Banking", size: "96 KB", uploadedOn: "12 Mar 2021", status: "Verified" },
      { id: "D5", name: "ISO 9001-2015 Certificate.pdf", type: "Quality", size: "620 KB", uploadedOn: "18 Feb 2024", expiresOn: "17 Feb 2027", status: "Verified" },
      { id: "D6", name: "Vendor Code of Conduct - Signed.pdf", type: "Compliance", size: "1.2 MB", uploadedOn: "20 Mar 2021", status: "Verified" },
    ],
    certifications: [
      { name: "ISO 9001:2015", body: "TÜV SÜD South Asia", validTill: "17 Feb 2027", status: "Valid" },
      { name: "IATF 16949:2016", body: "Bureau Veritas", validTill: "30 Sep 2026", status: "Valid" },
      { name: "ISO 14001:2015", body: "TÜV SÜD South Asia", validTill: "22 Nov 2026", status: "Valid" },
    ],
    contracts: [
      { id: "CTR-2024-0182", title: "Annual Rate Contract — Machined Housings", value: 62000000, start: "01 Apr 2026", end: "31 Mar 2027", status: "Active" },
      { id: "CTR-2023-0119", title: "Tooling Development Agreement", value: 8400000, start: "15 Jun 2025", end: "14 Sep 2026", status: "Expiring" },
    ],
    audits: [
      { id: "AUD-2026-014", date: "18 Feb 2026", type: "Process Capability Audit", auditor: "Anil Deshpande, SQA", score: 92, findings: 2, result: "Passed with observations" },
      { id: "AUD-2025-088", date: "09 Aug 2025", type: "Annual Vendor Audit", auditor: "Meera Iyer, SQA", score: 95, findings: 1, result: "Passed" },
      { id: "AUD-2025-021", date: "27 Jan 2025", type: "Compliance & ESG Audit", auditor: "KPMG Advisory", score: 89, findings: 3, result: "Passed with observations" },
    ],
    timeline: tl([
      ["Supplier record created", "Onboarding request raised from Pune plant sourcing team", "Kavita Rao", "12 Mar 2021 · 10:22", "done"],
      ["Documents verified", "GST, PAN, MSME and banking documents validated against government portals", "Compliance Bot", "13 Mar 2021 · 16:40", "done"],
      ["Supplier approved", "Approved by Category Head, vendor moved to Active", "Suresh Nambiar", "16 Mar 2021 · 09:05", "done"],
      ["Rate contract renewed", "CTR-2024-0182 renewed for FY 2026-27 at 2.4% negotiated reduction", "Ananya Gupta", "28 Mar 2026 · 14:18", "done"],
      ["Quality audit completed", "Process capability audit scored 92/100 with 2 minor observations", "Anil Deshpande", "18 Feb 2026 · 11:30", "done"],
    ]),
  },
  {
    id: "SUP-100388",
    code: "SUP-100388",
    name: "Nordwind Hydraulik GmbH",
    companyName: "Nordwind Hydraulik GmbH",
    gst: "—",
    pan: "—",
    msme: "Not Applicable",
    vendorType: "OEM",
    category: "Hydraulic Systems",
    industry: "Industrial Equipment",
    address: "Industriestraße 118, Gewerbepark Nord",
    city: "Hamburg",
    state: "Hamburg",
    country: "Germany",
    pincode: "22525",
    email: "export@nordwind-hydraulik.de",
    website: "www.nordwind-hydraulik.de",
    phone: "+49 40 8871 2200",
    contacts: [
      { name: "Klaus Behrend", designation: "Export Sales Director", email: "k.behrend@nordwind-hydraulik.de", phone: "+49 171 4482 991", primary: true },
      { name: "Antje Vogel", designation: "Shipping Desk", email: "a.vogel@nordwind-hydraulik.de", phone: "+49 40 8871 2244", primary: false },
    ],
    paymentTerms: "LC at Sight",
    creditLimit: 45000000,
    currency: "EUR",
    bank: { bankName: "Commerzbank AG", accountName: "Nordwind Hydraulik GmbH", accountNumber: "DE89 2004 0000 0312 4455 00", ifsc: "—", branch: "Hamburg Hauptfiliale", swift: "COBADEFFXXX" },
    taxInfo: { tdsSection: "195 (Non-resident)", tdsRate: "10.40%", gstRegime: "Import — IGST on Bill of Entry", msmeRegNo: "—" },
    status: "Active",
    rating: 4.3,
    onTimeDelivery: 89.7,
    qualityScore: 97.4,
    defectRate: 0.61,
    leadTimeDays: 46,
    spendYtd: 91340000,
    openPOs: 4,
    risk: "Medium",
    riskScores: { financial: 92, compliance: 90, operational: 78, geographic: 71 },
    onboardedOn: "04 Sep 2019",
    documents: [
      { id: "D1", name: "Certificate of Incorporation (HRB).pdf", type: "Statutory", size: "540 KB", uploadedOn: "04 Sep 2019", status: "Verified" },
      { id: "D2", name: "Form 10F — Tax Residency.pdf", type: "Tax", size: "310 KB", uploadedOn: "11 Apr 2026", expiresOn: "31 Mar 2027", status: "Verified" },
      { id: "D3", name: "No Permanent Establishment Declaration.pdf", type: "Tax", size: "220 KB", uploadedOn: "11 Apr 2026", status: "Pending" },
      { id: "D4", name: "ISO 9001 Zertifikat.pdf", type: "Quality", size: "708 KB", uploadedOn: "02 Jan 2025", expiresOn: "01 Jan 2028", status: "Verified" },
    ],
    certifications: [
      { name: "ISO 9001:2015", body: "DEKRA Certification", validTill: "01 Jan 2028", status: "Valid" },
      { name: "CE Machinery Directive", body: "TÜV Nord", validTill: "14 Jul 2026", status: "Expiring" },
    ],
    contracts: [
      { id: "CTR-2025-0244", title: "Hydraulic Power Pack Supply Framework", value: 210000000, start: "01 Jul 2025", end: "30 Jun 2028", status: "Active" },
    ],
    audits: [
      { id: "AUD-2025-102", date: "22 Oct 2025", type: "Remote Desktop Audit", auditor: "SGS Germany", score: 88, findings: 4, result: "Passed with observations" },
    ],
    timeline: tl([
      ["Supplier record created", "Global sourcing onboarding for hydraulic power packs", "Vikram Sethi", "04 Sep 2019 · 12:10", "done"],
      ["Supplier approved", "Approved by Global Category Council", "Global Sourcing Board", "19 Sep 2019 · 15:45", "done"],
      ["Form 10F renewed", "Tax residency certificate refreshed for FY 2026-27", "Finance Shared Services", "11 Apr 2026 · 09:33", "done"],
      ["Delay flagged", "Shipment SHP-778210 delayed 6 days at Hamburg port", "Logistics Control Tower", "22 Jul 2026 · 08:12", "error"],
    ]),
  },
  {
    id: "SUP-100455",
    code: "SUP-100455",
    name: "Shakti Steel & Alloys",
    companyName: "Shakti Steel & Alloys Limited",
    gst: "24AABCS4471M1Z8",
    pan: "AABCS4471M",
    msme: "Not Applicable",
    vendorType: "Manufacturer",
    category: "Raw Material — Steel",
    industry: "Metals & Mining",
    address: "Survey 118/2, Kandla SEZ Road",
    city: "Gandhidham",
    state: "Gujarat",
    country: "India",
    pincode: "370201",
    email: "sales@shaktisteel.in",
    website: "www.shaktisteel.in",
    phone: "+91 2836 227 400",
    contacts: [
      { name: "Hiren Patel", designation: "Regional Sales Head", email: "hiren.patel@shaktisteel.in", phone: "+91 99789 22140", primary: true },
    ],
    paymentTerms: "Net 30 Days",
    creditLimit: 30000000,
    currency: inr,
    bank: { bankName: "ICICI Bank", accountName: "Shakti Steel & Alloys Ltd", accountNumber: "004205001982", ifsc: "ICIC0000042", branch: "Gandhidham", swift: "ICICINBBCTS" },
    taxInfo: { tdsSection: "194Q", tdsRate: "0.10%", gstRegime: "Regular", msmeRegNo: "—" },
    status: "Active",
    rating: 3.9,
    onTimeDelivery: 84.2,
    qualityScore: 93.6,
    defectRate: 1.84,
    leadTimeDays: 18,
    spendYtd: 128600000,
    openPOs: 11,
    risk: "Medium",
    riskScores: { financial: 74, compliance: 86, operational: 69, geographic: 82 },
    onboardedOn: "22 Jun 2018",
    documents: [
      { id: "D1", name: "GST Registration Certificate.pdf", type: "Statutory", size: "398 KB", uploadedOn: "22 Jun 2018", status: "Verified" },
      { id: "D2", name: "Mill Test Certificate Template.pdf", type: "Quality", size: "155 KB", uploadedOn: "07 Feb 2024", status: "Verified" },
      { id: "D3", name: "Factory Licence.pdf", type: "Statutory", size: "480 KB", uploadedOn: "14 May 2023", expiresOn: "31 Mar 2026", status: "Expired" },
    ],
    certifications: [
      { name: "ISO 9001:2015", body: "Intertek", validTill: "08 Dec 2026", status: "Valid" },
      { name: "BIS IS 2062 Licence", body: "Bureau of Indian Standards", validTill: "31 Aug 2026", status: "Expiring" },
    ],
    contracts: [
      { id: "CTR-2026-0031", title: "HR Coil Quarterly Rate Contract Q2 FY27", value: 96000000, start: "01 Jul 2026", end: "30 Sep 2026", status: "Active" },
    ],
    audits: [
      { id: "AUD-2026-041", date: "05 May 2026", type: "Quality System Audit", auditor: "Meera Iyer, SQA", score: 78, findings: 6, result: "Passed with observations" },
    ],
    timeline: tl([
      ["Supplier record created", "Strategic raw material supplier onboarded", "Procurement Ops", "22 Jun 2018 · 11:00", "done"],
      ["Corrective action raised", "CAPA-2026-017 issued for dimensional variance on HR coils", "Meera Iyer", "08 May 2026 · 10:20", "error"],
      ["Factory licence expired", "Statutory document expired — renewal reminder sent to supplier", "Compliance Bot", "01 Apr 2026 · 06:00", "error"],
    ]),
  },
  {
    id: "SUP-100512",
    code: "SUP-100512",
    name: "Orion Packaging Solutions",
    companyName: "Orion Packaging Solutions LLP",
    gst: "29AAGFO2218H1ZD",
    pan: "AAGFO2218H",
    msme: "UDYAM-KA-03-0091274",
    vendorType: "Distributor",
    category: "Packaging & Consumables",
    industry: "Packaging",
    address: "No. 18, Peenya Industrial Area, 4th Phase",
    city: "Bengaluru",
    state: "Karnataka",
    country: "India",
    pincode: "560058",
    email: "orders@orionpack.in",
    website: "www.orionpack.in",
    phone: "+91 80 2839 6612",
    contacts: [
      { name: "Deepa Shenoy", designation: "Business Development Manager", email: "deepa@orionpack.in", phone: "+91 98455 12207", primary: true },
    ],
    paymentTerms: "Net 15 Days",
    creditLimit: 4500000,
    currency: inr,
    bank: { bankName: "Axis Bank", accountName: "Orion Packaging Solutions LLP", accountNumber: "918020071224561", ifsc: "UTIB0000102", branch: "Peenya", swift: "AXISINBB102" },
    taxInfo: { tdsSection: "194C", tdsRate: "2.00%", gstRegime: "Regular", msmeRegNo: "UDYAM-KA-03-0091274" },
    status: "Pending Approval",
    rating: 4.1,
    onTimeDelivery: 91.3,
    qualityScore: 95.2,
    defectRate: 0.88,
    leadTimeDays: 6,
    spendYtd: 6240000,
    openPOs: 2,
    risk: "Low",
    riskScores: { financial: 81, compliance: 88, operational: 90, geographic: 92 },
    onboardedOn: "19 Jun 2026",
    documents: [
      { id: "D1", name: "GST Registration Certificate.pdf", type: "Statutory", size: "402 KB", uploadedOn: "19 Jun 2026", status: "Verified" },
      { id: "D2", name: "LLP Agreement.pdf", type: "Statutory", size: "1.1 MB", uploadedOn: "19 Jun 2026", status: "Pending" },
      { id: "D3", name: "Cancelled Cheque - Axis.jpg", type: "Banking", size: "88 KB", uploadedOn: "19 Jun 2026", status: "Verified" },
    ],
    certifications: [{ name: "FSC Chain of Custody", body: "SCS Global Services", validTill: "12 Mar 2027", status: "Valid" }],
    contracts: [],
    audits: [],
    timeline: tl([
      ["Supplier record created", "Registration submitted through supplier self-service portal", "Deepa Shenoy", "19 Jun 2026 · 15:04", "done"],
      ["Documents verified", "GST and banking verified; LLP agreement pending legal review", "Compliance Bot", "21 Jun 2026 · 09:11", "done"],
      ["Awaiting approval", "Pending sign-off from Category Head — Indirect Procurement", "Suresh Nambiar", "Pending", "current"],
      ["Supplier activation", "Vendor code release and ERP replication", "System", "Pending", "pending"],
    ]),
  },
  {
    id: "SUP-100579",
    code: "SUP-100579",
    name: "Sinotech Electricals Co.",
    companyName: "Sinotech Electricals Co., Ltd.",
    gst: "—",
    pan: "—",
    msme: "Not Applicable",
    vendorType: "Importer",
    category: "Electrical & Control Panels",
    industry: "Electronics",
    address: "Building 7, Songshan Lake Hi-Tech Zone",
    city: "Dongguan",
    state: "Guangdong",
    country: "China",
    pincode: "523808",
    email: "intl.sales@sinotech-elec.cn",
    website: "www.sinotech-elec.cn",
    phone: "+86 769 8288 4410",
    contacts: [{ name: "Li Wei", designation: "International Sales Manager", email: "liwei@sinotech-elec.cn", phone: "+86 138 2811 4477", primary: true }],
    paymentTerms: "30% Advance / 70% against BL",
    creditLimit: 18000000,
    currency: "USD",
    bank: { bankName: "Bank of China", accountName: "Sinotech Electricals Co Ltd", accountNumber: "6212 2602 0009 1128", ifsc: "—", branch: "Dongguan Branch", swift: "BKCHCNBJ400" },
    taxInfo: { tdsSection: "195 (Non-resident)", tdsRate: "10.40%", gstRegime: "Import — IGST on Bill of Entry", msmeRegNo: "—" },
    status: "Blocked",
    rating: 2.7,
    onTimeDelivery: 68.5,
    qualityScore: 84.1,
    defectRate: 4.62,
    leadTimeDays: 52,
    spendYtd: 21870000,
    openPOs: 0,
    risk: "High",
    riskScores: { financial: 62, compliance: 48, operational: 55, geographic: 60 },
    onboardedOn: "08 Nov 2022",
    documents: [
      { id: "D1", name: "Business Licence (Translated).pdf", type: "Statutory", size: "660 KB", uploadedOn: "08 Nov 2022", status: "Verified" },
      { id: "D2", name: "Quality Deviation Report — Batch SE-2291.pdf", type: "Quality", size: "2.4 MB", uploadedOn: "14 May 2026", status: "Verified" },
    ],
    certifications: [{ name: "CE Low Voltage Directive", body: "SGS China", validTill: "02 Feb 2026", status: "Expired" }],
    contracts: [],
    audits: [{ id: "AUD-2026-033", date: "20 Apr 2026", type: "For-cause Quality Audit", auditor: "SGS China", score: 54, findings: 11, result: "Failed" }],
    timeline: tl([
      ["Supplier record created", "Onboarded for control panel components", "Global Sourcing", "08 Nov 2022 · 13:20", "done"],
      ["Quality escalation", "4.6% defect rate breached contractual threshold of 2%", "Quality Assurance", "14 May 2026 · 17:02", "error"],
      ["Supplier blocked", "Blocked for new POs pending corrective action closure", "Suresh Nambiar", "21 May 2026 · 10:45", "error"],
    ]),
  },
  {
    id: "SUP-100603",
    code: "SUP-100603",
    name: "Vertex Industrial Bearings",
    companyName: "Vertex Industrial Bearings Pvt. Ltd.",
    gst: "33AACCV7712P1ZW",
    pan: "AACCV7712P",
    msme: "UDYAM-TN-02-0033891",
    vendorType: "Distributor",
    category: "Bearings & Power Transmission",
    industry: "Industrial Distribution",
    address: "22 Ambattur Industrial Estate, North Phase",
    city: "Chennai",
    state: "Tamil Nadu",
    country: "India",
    pincode: "600058",
    email: "sales@vertexbearings.in",
    website: "www.vertexbearings.in",
    phone: "+91 44 4212 8890",
    contacts: [{ name: "Karthik Subramanian", designation: "Sales Manager", email: "karthik.s@vertexbearings.in", phone: "+91 94440 88213", primary: true }],
    paymentTerms: "Net 30 Days",
    creditLimit: 7500000,
    currency: inr,
    bank: { bankName: "State Bank of India", accountName: "Vertex Industrial Bearings Pvt Ltd", accountNumber: "38812004471", ifsc: "SBIN0001234", branch: "Ambattur", swift: "SBININBB248" },
    taxInfo: { tdsSection: "194Q", tdsRate: "0.10%", gstRegime: "Regular", msmeRegNo: "UDYAM-TN-02-0033891" },
    status: "Active",
    rating: 4.4,
    onTimeDelivery: 94.1,
    qualityScore: 96.8,
    defectRate: 0.55,
    leadTimeDays: 9,
    spendYtd: 18450000,
    openPOs: 5,
    risk: "Low",
    riskScores: { financial: 85, compliance: 91, operational: 88, geographic: 90 },
    onboardedOn: "15 Jan 2020",
    documents: [
      { id: "D1", name: "GST Registration Certificate.pdf", type: "Statutory", size: "388 KB", uploadedOn: "15 Jan 2020", status: "Verified" },
      { id: "D2", name: "SKF Authorised Distributor Letter.pdf", type: "Commercial", size: "240 KB", uploadedOn: "03 Apr 2026", expiresOn: "31 Mar 2027", status: "Verified" },
    ],
    certifications: [{ name: "ISO 9001:2015", body: "Intertek", validTill: "19 May 2027", status: "Valid" }],
    contracts: [{ id: "CTR-2026-0058", title: "Bearings & Seals Rate Contract FY27", value: 24000000, start: "01 Apr 2026", end: "31 Mar 2027", status: "Active" }],
    audits: [{ id: "AUD-2025-071", date: "11 Jul 2025", type: "Annual Vendor Audit", auditor: "Anil Deshpande, SQA", score: 91, findings: 2, result: "Passed" }],
    timeline: tl([
      ["Supplier record created", "Authorised distributor onboarded for MRO spares", "Procurement Ops", "15 Jan 2020 · 09:40", "done"],
      ["Rate contract signed", "CTR-2026-0058 executed for FY 2026-27", "Ananya Gupta", "29 Mar 2026 · 16:12", "done"],
    ]),
  },
  {
    id: "SUP-100644",
    code: "SUP-100644",
    name: "Aurora Chemicals & Lubricants",
    companyName: "Aurora Chemicals & Lubricants Pvt. Ltd.",
    gst: "36AAECA9928R1ZN",
    pan: "AAECA9928R",
    msme: "Not Applicable",
    vendorType: "Manufacturer",
    category: "Chemicals & Lubricants",
    industry: "Speciality Chemicals",
    address: "Plot 9, Jeedimetla Industrial Estate",
    city: "Hyderabad",
    state: "Telangana",
    country: "India",
    pincode: "500055",
    email: "commercial@aurorachem.in",
    website: "www.aurorachem.in",
    phone: "+91 40 2309 1180",
    contacts: [{ name: "Farhan Ali", designation: "Commercial Head", email: "farhan.ali@aurorachem.in", phone: "+91 90000 33218", primary: true }],
    paymentTerms: "Net 60 Days",
    creditLimit: 9000000,
    currency: inr,
    bank: { bankName: "Kotak Mahindra Bank", accountName: "Aurora Chemicals & Lubricants Pvt Ltd", accountNumber: "4711220098", ifsc: "KKBK0007412", branch: "Jeedimetla", swift: "KKBKINBBCPC" },
    taxInfo: { tdsSection: "194Q", tdsRate: "0.10%", gstRegime: "Regular", msmeRegNo: "—" },
    status: "Inactive",
    rating: 3.4,
    onTimeDelivery: 79.8,
    qualityScore: 90.3,
    defectRate: 2.31,
    leadTimeDays: 21,
    spendYtd: 3120000,
    openPOs: 0,
    risk: "Medium",
    riskScores: { financial: 70, compliance: 79, operational: 66, geographic: 88 },
    onboardedOn: "07 Feb 2022",
    documents: [{ id: "D1", name: "GST Registration Certificate.pdf", type: "Statutory", size: "395 KB", uploadedOn: "07 Feb 2022", status: "Verified" }],
    certifications: [{ name: "ISO 14001:2015", body: "DNV", validTill: "30 Jun 2026", status: "Expiring" }],
    contracts: [],
    audits: [],
    timeline: tl([
      ["Supplier record created", "Onboarded for coolant and lubricant supply", "Procurement Ops", "07 Feb 2022 · 14:15", "done"],
      ["Marked inactive", "No purchasing activity for 12 months — auto-deactivated", "System", "01 Jun 2026 · 02:00", "done"],
    ]),
  },
  {
    id: "SUP-100702",
    code: "SUP-100702",
    name: "Meridian Logistics & Freight",
    companyName: "Meridian Logistics & Freight Services Pvt. Ltd.",
    gst: "07AAJCM3391L1ZK",
    pan: "AAJCM3391L",
    msme: "UDYAM-DL-05-0018842",
    vendorType: "Service Provider",
    category: "Logistics & Freight",
    industry: "Transportation",
    address: "Warehouse Block C, Patparganj Industrial Area",
    city: "New Delhi",
    state: "Delhi",
    country: "India",
    pincode: "110092",
    email: "ops@meridianfreight.in",
    website: "www.meridianfreight.in",
    phone: "+91 11 4356 7720",
    contacts: [{ name: "Gurpreet Singh", designation: "Operations Director", email: "gurpreet@meridianfreight.in", phone: "+91 98110 44872", primary: true }],
    paymentTerms: "Net 30 Days",
    creditLimit: 6000000,
    currency: inr,
    bank: { bankName: "Punjab National Bank", accountName: "Meridian Logistics & Freight Services", accountNumber: "0221002100447712", ifsc: "PUNB0022100", branch: "Patparganj", swift: "PUNBINBBISB" },
    taxInfo: { tdsSection: "194C", tdsRate: "2.00%", gstRegime: "Regular", msmeRegNo: "UDYAM-DL-05-0018842" },
    status: "Pending Verification",
    rating: 4.0,
    onTimeDelivery: 92.6,
    qualityScore: 94.0,
    defectRate: 0.9,
    leadTimeDays: 3,
    spendYtd: 0,
    openPOs: 0,
    risk: "Low",
    riskScores: { financial: 78, compliance: 72, operational: 86, geographic: 91 },
    onboardedOn: "24 Jul 2026",
    documents: [
      { id: "D1", name: "GST Registration Certificate.pdf", type: "Statutory", size: "410 KB", uploadedOn: "24 Jul 2026", status: "Pending" },
      { id: "D2", name: "Transport Licence.pdf", type: "Statutory", size: "512 KB", uploadedOn: "24 Jul 2026", status: "Pending" },
    ],
    certifications: [],
    contracts: [],
    audits: [],
    timeline: tl([
      ["Supplier record created", "Freight partner registration submitted", "Gurpreet Singh", "24 Jul 2026 · 11:48", "done"],
      ["Document verification", "Statutory documents under review by compliance desk", "Compliance Desk", "In progress", "current"],
      ["Supplier approval", "Awaiting Category Head sign-off", "Pending", "Pending", "pending"],
    ]),
  },
];

export const purchaseOrders: PurchaseOrder[] = [
  {
    id: "PO-2026-004871",
    supplierId: "SUP-100241",
    supplier: "Bharat Precision Components",
    warehouse: "WH-PUN-01 · Chakan Central Warehouse",
    buyer: "Ananya Gupta",
    currency: inr,
    createdOn: "18 Jul 2026",
    expectedDelivery: "12 Aug 2026",
    status: "Pending Approval",
    priority: "High",
    paymentTerms: "Net 45 Days",
    incoterm: "FOR Destination",
    costCenter: "CC-MFG-2200",
    budgetCode: "CAPEX-FY27-MACH",
    budgetAvailable: 18400000,
    remarks: "Expedite for Line 3 ramp-up. Batch traceability certificates mandatory with each despatch.",
    items: [
      { id: "1", material: "MAT-88214", description: "Machined Gearbox Housing — GH-450 Alloy", hsn: "84839000", uom: "NOS", qty: 1200, unitPrice: 4850, discountPct: 3, taxPct: 18 },
      { id: "2", material: "MAT-88231", description: "Precision Shaft Assembly 42CrMo4", hsn: "84831099", uom: "NOS", qty: 800, unitPrice: 2760, discountPct: 2, taxPct: 18 },
      { id: "3", material: "MAT-88407", description: "End Cover Plate — Machined & Anodised", hsn: "76169990", uom: "NOS", qty: 2400, unitPrice: 615, discountPct: 0, taxPct: 18 },
    ],
    approvals: [
      { level: "Level 1", role: "Purchase Manager", approver: "Rohit Bansal", status: "Approved", on: "18 Jul 2026 · 17:22", comment: "Rates aligned to rate contract CTR-2024-0182." },
      { level: "Level 2", role: "Finance Controller", approver: "Priya Venkatesh", status: "Pending" },
      { level: "Level 3", role: "Director — Operations", approver: "Suresh Nambiar", status: "Not started" },
    ],
    revisions: [
      { rev: "Rev 0", date: "18 Jul 2026", by: "Ananya Gupta", change: "Purchase order created from PR-2026-01187" },
      { rev: "Rev 1", date: "19 Jul 2026", by: "Ananya Gupta", change: "Line 3 quantity revised 2,000 → 2,400 NOS; delivery date shifted by 3 days" },
    ],
    attachments: [
      { name: "Quotation QT-BPC-4471.pdf", type: "Quotation", size: "486 KB" },
      { name: "Technical Drawing GH-450 Rev C.pdf", type: "Drawing", size: "2.8 MB" },
      { name: "Rate Contract CTR-2024-0182.pdf", type: "Contract", size: "1.4 MB" },
    ],
    timeline: tl([
      ["PO drafted", "Created from approved purchase requisition PR-2026-01187", "Ananya Gupta", "18 Jul 2026 · 10:14", "done"],
      ["Budget validated", "₹1.02 Cr committed against CAPEX-FY27-MACH — 82% budget remaining", "Budget Engine", "18 Jul 2026 · 10:16", "done"],
      ["Submitted for approval", "Routed via approval matrix AM-CAPEX-3L", "Ananya Gupta", "18 Jul 2026 · 10:31", "done"],
      ["Level 1 approved", "Approved by Purchase Manager", "Rohit Bansal", "18 Jul 2026 · 17:22", "done"],
      ["Finance approval", "Pending with Finance Controller — SLA breach in 6 hours", "Priya Venkatesh", "In progress", "current"],
      ["Director approval", "Required as value exceeds ₹75 L threshold", "Suresh Nambiar", "Pending", "pending"],
      ["Send to supplier", "PO despatch over supplier portal + email", "System", "Pending", "pending"],
    ]),
  },
  {
    id: "PO-2026-004822",
    supplierId: "SUP-100388",
    supplier: "Nordwind Hydraulik GmbH",
    warehouse: "WH-MUM-02 · JNPT Bonded Warehouse",
    buyer: "Vikram Sethi",
    currency: "EUR",
    createdOn: "02 Jun 2026",
    expectedDelivery: "05 Aug 2026",
    status: "Sent to Supplier",
    priority: "Critical",
    paymentTerms: "LC at Sight",
    incoterm: "CIF Nhava Sheva",
    costCenter: "CC-CAPEX-4100",
    budgetCode: "CAPEX-FY27-HYD",
    budgetAvailable: 62000000,
    remarks: "LC No. 0114ILC2600392 opened through HDFC Bank. Original documents to be couriered within 5 days of BL date.",
    items: [
      { id: "1", material: "MAT-91108", description: "Hydraulic Power Pack 75 kW — NW-HPP750", hsn: "84122100", uom: "NOS", qty: 6, unitPrice: 28400, discountPct: 5, taxPct: 18 },
      { id: "2", material: "MAT-91142", description: "Proportional Valve Block DN25", hsn: "84812000", uom: "NOS", qty: 24, unitPrice: 1840, discountPct: 0, taxPct: 18 },
    ],
    approvals: [
      { level: "Level 1", role: "Purchase Manager", approver: "Rohit Bansal", status: "Approved", on: "03 Jun 2026 · 11:02" },
      { level: "Level 2", role: "Finance Controller", approver: "Priya Venkatesh", status: "Approved", on: "04 Jun 2026 · 09:40", comment: "LC facility available. Forward cover booked at 91.20 INR/EUR." },
      { level: "Level 3", role: "Director — Operations", approver: "Suresh Nambiar", status: "Approved", on: "05 Jun 2026 · 15:18" },
    ],
    revisions: [{ rev: "Rev 0", date: "02 Jun 2026", by: "Vikram Sethi", change: "Purchase order created" }],
    attachments: [
      { name: "Proforma Invoice NW-2026-1188.pdf", type: "Invoice", size: "320 KB" },
      { name: "Letter of Credit 0114ILC2600392.pdf", type: "Banking", size: "890 KB" },
    ],
    timeline: tl([
      ["PO drafted", "Capex procurement for Press Shop hydraulics", "Vikram Sethi", "02 Jun 2026 · 09:05", "done"],
      ["Approved", "3-level approval completed in 3 days", "Approval Engine", "05 Jun 2026 · 15:18", "done"],
      ["Sent to supplier", "Transmitted via supplier portal and email to k.behrend@nordwind-hydraulik.de", "System", "05 Jun 2026 · 15:40", "done"],
      ["Supplier acknowledged", "Order confirmation OC-NW-4471 received", "Klaus Behrend", "08 Jun 2026 · 12:22", "done"],
      ["ASN awaited", "Shipment dispatch scheduled from Hamburg", "Nordwind Hydraulik", "In progress", "current"],
    ]),
  },
  {
    id: "PO-2026-004910",
    supplierId: "SUP-100455",
    supplier: "Shakti Steel & Alloys",
    warehouse: "WH-AHM-03 · Sanand Raw Material Yard",
    buyer: "Ananya Gupta",
    currency: inr,
    createdOn: "24 Jul 2026",
    expectedDelivery: "02 Aug 2026",
    status: "Approved",
    priority: "High",
    paymentTerms: "Net 30 Days",
    incoterm: "FOR Destination",
    costCenter: "CC-MFG-1100",
    budgetCode: "OPEX-FY27-RM",
    budgetAvailable: 54200000,
    remarks: "Mill test certificates required per heat number. Reject material without MTC at gate.",
    items: [
      { id: "1", material: "MAT-10021", description: "HR Coil IS 2062 E250 BR — 3.0 mm × 1250 mm", hsn: "72085190", uom: "MT", qty: 180, unitPrice: 58400, discountPct: 1.5, taxPct: 18 },
      { id: "2", material: "MAT-10044", description: "CR Sheet IS 513 CR2 — 1.2 mm × 1250 mm", hsn: "72091790", uom: "MT", qty: 60, unitPrice: 64200, discountPct: 1, taxPct: 18 },
    ],
    approvals: [
      { level: "Level 1", role: "Purchase Manager", approver: "Rohit Bansal", status: "Approved", on: "24 Jul 2026 · 14:10" },
      { level: "Level 2", role: "Finance Controller", approver: "Priya Venkatesh", status: "Approved", on: "25 Jul 2026 · 10:05" },
    ],
    revisions: [{ rev: "Rev 0", date: "24 Jul 2026", by: "Ananya Gupta", change: "Purchase order created against quarterly rate contract" }],
    attachments: [{ name: "Rate Contract CTR-2026-0031.pdf", type: "Contract", size: "980 KB" }],
    timeline: tl([
      ["PO drafted", "Monthly steel call-off against Q2 rate contract", "Ananya Gupta", "24 Jul 2026 · 09:20", "done"],
      ["Budget validated", "₹1.53 Cr committed against OPEX-FY27-RM", "Budget Engine", "24 Jul 2026 · 09:22", "done"],
      ["Approved", "2-level approval completed", "Approval Engine", "25 Jul 2026 · 10:05", "done"],
      ["Awaiting despatch to supplier", "Scheduled transmission at next portal sync", "System", "In progress", "current"],
    ]),
  },
  {
    id: "PO-2026-004756",
    supplierId: "SUP-100603",
    supplier: "Vertex Industrial Bearings",
    warehouse: "WH-CHN-04 · Oragadam Spares Store",
    buyer: "Nikhil Menon",
    currency: inr,
    createdOn: "11 Jul 2026",
    expectedDelivery: "28 Jul 2026",
    status: "Partially Received",
    priority: "Medium",
    paymentTerms: "Net 30 Days",
    incoterm: "FOR Destination",
    costCenter: "CC-MRO-3300",
    budgetCode: "OPEX-FY27-MRO",
    budgetAvailable: 8900000,
    remarks: "MRO replenishment for Q2 preventive maintenance plan.",
    items: [
      { id: "1", material: "MAT-55012", description: "Deep Groove Ball Bearing 6208-2RS (SKF)", hsn: "84821011", uom: "NOS", qty: 400, received: 400, unitPrice: 780, discountPct: 8, taxPct: 18 },
      { id: "2", material: "MAT-55088", description: "Spherical Roller Bearing 22215 E (SKF)", hsn: "84822000", uom: "NOS", qty: 60, received: 20, unitPrice: 6250, discountPct: 6, taxPct: 18 },
      { id: "3", material: "MAT-55131", description: "Oil Seal TC 45×62×8 NBR", hsn: "40169390", uom: "NOS", qty: 500, received: 500, unitPrice: 92, discountPct: 0, taxPct: 18 },
    ],
    approvals: [
      { level: "Level 1", role: "Purchase Manager", approver: "Rohit Bansal", status: "Approved", on: "11 Jul 2026 · 16:44" },
    ],
    revisions: [{ rev: "Rev 0", date: "11 Jul 2026", by: "Nikhil Menon", change: "Purchase order created" }],
    attachments: [{ name: "Quotation VTX-2026-0912.pdf", type: "Quotation", size: "265 KB" }],
    timeline: tl([
      ["PO drafted", "MRO replenishment call-off", "Nikhil Menon", "11 Jul 2026 · 15:02", "done"],
      ["Approved", "Single-level approval — value below ₹10 L", "Rohit Bansal", "11 Jul 2026 · 16:44", "done"],
      ["Sent to supplier", "Acknowledged same day", "System", "11 Jul 2026 · 16:50", "done"],
      ["Partial receipt", "GRN-2026-08841 posted for 2 of 3 lines", "Warehouse Chennai", "24 Jul 2026 · 11:15", "done"],
      ["Balance delivery", "40 NOS of 22215 E pending — supplier committed 30 Jul", "Vertex Industrial Bearings", "In progress", "current"],
    ]),
  },
  {
    id: "PO-2026-004933",
    supplierId: "SUP-100512",
    supplier: "Orion Packaging Solutions",
    warehouse: "WH-BLR-05 · Peenya Consumables Store",
    buyer: "Nikhil Menon",
    currency: inr,
    createdOn: "28 Jul 2026",
    expectedDelivery: "06 Aug 2026",
    status: "Draft",
    priority: "Low",
    paymentTerms: "Net 15 Days",
    incoterm: "FOR Destination",
    costCenter: "CC-PACK-5100",
    budgetCode: "OPEX-FY27-PACK",
    budgetAvailable: 2100000,
    remarks: "Awaiting supplier activation before submission.",
    items: [
      { id: "1", material: "MAT-70012", description: "5-Ply Corrugated Carton 600×400×400 mm", hsn: "48191010", uom: "NOS", qty: 8000, unitPrice: 62, discountPct: 4, taxPct: 12 },
      { id: "2", material: "MAT-70044", description: "Stretch Wrap Film 500 mm × 23 micron", hsn: "39204900", uom: "ROLL", qty: 320, unitPrice: 480, discountPct: 0, taxPct: 18 },
    ],
    approvals: [
      { level: "Level 1", role: "Purchase Manager", approver: "Rohit Bansal", status: "Not started" },
    ],
    revisions: [{ rev: "Rev 0", date: "28 Jul 2026", by: "Nikhil Menon", change: "Draft created" }],
    attachments: [],
    timeline: tl([
      ["PO drafted", "Packaging consumables replenishment", "Nikhil Menon", "28 Jul 2026 · 12:40", "done"],
      ["Blocked", "Supplier SUP-100512 is pending approval — submission disabled", "Validation Engine", "28 Jul 2026 · 12:41", "error"],
    ]),
  },
  {
    id: "PO-2026-004688",
    supplierId: "SUP-100579",
    supplier: "Sinotech Electricals Co.",
    warehouse: "WH-MUM-02 · JNPT Bonded Warehouse",
    buyer: "Vikram Sethi",
    currency: "USD",
    createdOn: "12 May 2026",
    expectedDelivery: "30 Jun 2026",
    status: "Cancelled",
    priority: "Medium",
    paymentTerms: "30% Advance / 70% against BL",
    incoterm: "FOB Shenzhen",
    costCenter: "CC-ELEC-4400",
    budgetCode: "OPEX-FY27-ELEC",
    budgetAvailable: 12000000,
    remarks: "Cancelled following supplier block due to quality escalation. Advance recovered on 26 May 2026.",
    items: [{ id: "1", material: "MAT-62210", description: "Control Panel Assembly IP65 — 800×600×250", hsn: "85371000", uom: "NOS", qty: 40, unitPrice: 620, discountPct: 0, taxPct: 18 }],
    approvals: [
      { level: "Level 1", role: "Purchase Manager", approver: "Rohit Bansal", status: "Approved", on: "12 May 2026 · 13:20" },
      { level: "Level 2", role: "Finance Controller", approver: "Priya Venkatesh", status: "Approved", on: "13 May 2026 · 10:11" },
    ],
    revisions: [
      { rev: "Rev 0", date: "12 May 2026", by: "Vikram Sethi", change: "Purchase order created" },
      { rev: "Rev 1", date: "21 May 2026", by: "Vikram Sethi", change: "Order cancelled — supplier blocked" },
    ],
    attachments: [{ name: "Cancellation Note CN-2026-0044.pdf", type: "Note", size: "180 KB" }],
    timeline: tl([
      ["PO approved", "Approved and sent to supplier", "Approval Engine", "13 May 2026 · 10:11", "done"],
      ["Quality escalation", "Defect rate breach on prior batch SE-2291", "Quality Assurance", "14 May 2026 · 17:02", "error"],
      ["PO cancelled", "Cancelled with supplier consent; advance recovered", "Vikram Sethi", "21 May 2026 · 11:30", "error"],
    ]),
  },
  {
    id: "PO-2026-004601",
    supplierId: "SUP-100241",
    supplier: "Bharat Precision Components",
    warehouse: "WH-PUN-01 · Chakan Central Warehouse",
    buyer: "Ananya Gupta",
    currency: inr,
    createdOn: "14 Apr 2026",
    expectedDelivery: "10 May 2026",
    status: "Closed",
    priority: "Medium",
    paymentTerms: "Net 45 Days",
    incoterm: "FOR Destination",
    costCenter: "CC-MFG-2200",
    budgetCode: "OPEX-FY27-COMP",
    budgetAvailable: 22000000,
    remarks: "Fully received and invoiced. 3-way match completed.",
    items: [{ id: "1", material: "MAT-88214", description: "Machined Gearbox Housing — GH-450 Alloy", hsn: "84839000", uom: "NOS", qty: 900, received: 900, unitPrice: 4790, discountPct: 3, taxPct: 18 }],
    approvals: [
      { level: "Level 1", role: "Purchase Manager", approver: "Rohit Bansal", status: "Approved", on: "14 Apr 2026 · 12:00" },
      { level: "Level 2", role: "Finance Controller", approver: "Priya Venkatesh", status: "Approved", on: "15 Apr 2026 · 09:15" },
    ],
    revisions: [{ rev: "Rev 0", date: "14 Apr 2026", by: "Ananya Gupta", change: "Purchase order created" }],
    attachments: [{ name: "Supplier Invoice BPC-INV-9921.pdf", type: "Invoice", size: "410 KB" }],
    timeline: tl([
      ["Approved", "Approved in 1 day", "Approval Engine", "15 Apr 2026 · 09:15", "done"],
      ["Goods received", "GRN-2026-07714 posted — 900 NOS accepted, 0 rejected", "Warehouse Pune", "08 May 2026 · 14:05", "done"],
      ["Invoice matched", "3-way match successful, payment scheduled 22 Jun 2026", "Accounts Payable", "12 May 2026 · 16:20", "done"],
      ["PO closed", "Order closed after full receipt and settlement", "System", "23 Jun 2026 · 02:00", "done"],
    ]),
  },
];

export const asns: ASN[] = [
  {
    id: "ASN-2026-002214",
    poId: "PO-2026-004822",
    supplierId: "SUP-100388",
    supplier: "Nordwind Hydraulik GmbH",
    shipmentNo: "SHP-778210",
    transporter: "Hapag-Lloyd / Meridian Logistics (last mile)",
    vehicleNo: "MH-04-GT-7712",
    containerNo: "HLXU 4482913 (40' HC)",
    driverName: "Ramesh Yadav",
    driverPhone: "+91 98204 11783",
    driverLicense: "MH0320190044821",
    invoiceNo: "NW-INV-2026-1188",
    ewayBill: "281004471982",
    packingList: "NW-PL-2026-1188",
    deliveryChallan: "DC-NW-4471",
    dispatchedOn: "18 Jul 2026",
    expectedArrival: "03 Aug 2026 · 09:30",
    warehouse: "WH-MUM-02 · JNPT Bonded Warehouse",
    gate: "Gate 2 — Heavy Vehicle",
    status: "Delayed",
    weightKg: 18450,
    volumeCbm: 62.4,
    packages: 14,
    progressPct: 78,
    currentLocation: "Nhava Sheva Port — Customs clearance in progress",
    materials: [
      { material: "MAT-91108", description: "Hydraulic Power Pack 75 kW — NW-HPP750", qty: 6, uom: "NOS", batch: "NW-B-2026-0441" },
      { material: "MAT-91142", description: "Proportional Valve Block DN25", qty: 24, uom: "NOS", batch: "NW-B-2026-0442" },
    ],
    documents: [
      { name: "Commercial Invoice NW-INV-2026-1188.pdf", type: "Invoice", size: "412 KB", status: "Verified" },
      { name: "Packing List NW-PL-2026-1188.pdf", type: "Packing List", size: "298 KB", status: "Verified" },
      { name: "Bill of Lading HLCUHAM2206841.pdf", type: "Transport", size: "620 KB", status: "Verified" },
      { name: "Certificate of Origin EUR.1.pdf", type: "Customs", size: "340 KB", status: "Pending" },
    ],
    timeline: tl([
      ["ASN created", "Created by supplier against PO-2026-004822", "Antje Vogel", "16 Jul 2026 · 14:20", "done"],
      ["Documents uploaded", "Invoice, packing list and BL attached", "Antje Vogel", "17 Jul 2026 · 10:05", "done"],
      ["ASN submitted", "Warehouse and security notified at JNPT", "Supplier Portal", "17 Jul 2026 · 10:12", "done"],
      ["Vessel departed", "MV Hamburg Express sailed from Hamburg", "Carrier Feed", "18 Jul 2026 · 21:40", "done"],
      ["Delay reported", "Berth congestion at Nhava Sheva — ETA revised by 2 days", "Logistics Control Tower", "31 Jul 2026 · 07:15", "error"],
      ["Gate entry", "Awaiting truck arrival at Gate 2", "Warehouse Gate Entry", "Pending", "pending"],
    ]),
  },
  {
    id: "ASN-2026-002251",
    poId: "PO-2026-004910",
    supplierId: "SUP-100455",
    supplier: "Shakti Steel & Alloys",
    shipmentNo: "SHP-778442",
    transporter: "Meridian Logistics & Freight",
    vehicleNo: "GJ-12-BT-4419",
    containerNo: "—",
    driverName: "Bhavesh Chauhan",
    driverPhone: "+91 99042 77120",
    driverLicense: "GJ1220170099213",
    invoiceNo: "SSA-INV-2026-4471",
    ewayBill: "291004488210",
    packingList: "SSA-PL-4471",
    deliveryChallan: "DC-SSA-8821",
    dispatchedOn: "30 Jul 2026",
    expectedArrival: "01 Aug 2026 · 06:00",
    warehouse: "WH-AHM-03 · Sanand Raw Material Yard",
    gate: "Gate 1 — Raw Material",
    status: "In Transit",
    weightKg: 24000,
    volumeCbm: 38.1,
    packages: 12,
    progressPct: 64,
    currentLocation: "NH-47 near Bagodara, Gujarat — 84 km from destination",
    materials: [
      { material: "MAT-10021", description: "HR Coil IS 2062 E250 BR — 3.0 mm × 1250 mm", qty: 24, uom: "MT", batch: "HEAT-SSA-92214" },
    ],
    documents: [
      { name: "Tax Invoice SSA-INV-2026-4471.pdf", type: "Invoice", size: "356 KB", status: "Verified" },
      { name: "E-Way Bill 291004488210.pdf", type: "Statutory", size: "180 KB", status: "Verified" },
      { name: "Mill Test Certificate HEAT-92214.pdf", type: "Quality", size: "1.1 MB", status: "Verified" },
      { name: "Delivery Challan DC-SSA-8821.pdf", type: "Transport", size: "210 KB", status: "Verified" },
    ],
    timeline: tl([
      ["ASN created", "Created against PO-2026-004910 for first call-off", "Hiren Patel", "29 Jul 2026 · 16:40", "done"],
      ["ASN submitted", "Warehouse Sanand and gate security notified", "Supplier Portal", "29 Jul 2026 · 17:02", "done"],
      ["Dispatched", "Vehicle GJ-12-BT-4419 left Gandhidham plant", "Meridian Logistics", "30 Jul 2026 · 22:10", "done"],
      ["In transit", "GPS ping received near Bagodara", "Carrier Feed", "01 Aug 2026 · 03:22", "current"],
      ["Gate entry", "Slot booked at Gate 1 for 06:00–07:00", "Warehouse Gate Entry", "Pending", "pending"],
    ]),
  },
  {
    id: "ASN-2026-002198",
    poId: "PO-2026-004756",
    supplierId: "SUP-100603",
    supplier: "Vertex Industrial Bearings",
    shipmentNo: "SHP-778104",
    transporter: "TCI Freight",
    vehicleNo: "TN-22-CV-9081",
    containerNo: "—",
    driverName: "Selvam Murugan",
    driverPhone: "+91 94445 20018",
    driverLicense: "TN2220160041127",
    invoiceNo: "VTX-INV-2026-2210",
    ewayBill: "331004411827",
    packingList: "VTX-PL-2210",
    deliveryChallan: "DC-VTX-2210",
    dispatchedOn: "22 Jul 2026",
    expectedArrival: "24 Jul 2026 · 10:00",
    warehouse: "WH-CHN-04 · Oragadam Spares Store",
    gate: "Gate 3 — Spares",
    status: "Received",
    weightKg: 1240,
    volumeCbm: 4.8,
    packages: 22,
    progressPct: 100,
    currentLocation: "Delivered — GRN-2026-08841 posted",
    materials: [
      { material: "MAT-55012", description: "Deep Groove Ball Bearing 6208-2RS (SKF)", qty: 400, uom: "NOS", batch: "SKF-B-4471" },
      { material: "MAT-55131", description: "Oil Seal TC 45×62×8 NBR", qty: 500, uom: "NOS", batch: "VTX-S-2210" },
    ],
    documents: [
      { name: "Tax Invoice VTX-INV-2026-2210.pdf", type: "Invoice", size: "290 KB", status: "Verified" },
      { name: "E-Way Bill 331004411827.pdf", type: "Statutory", size: "165 KB", status: "Verified" },
    ],
    timeline: tl([
      ["ASN created", "Created against PO-2026-004756", "Karthik Subramanian", "21 Jul 2026 · 11:20", "done"],
      ["ASN submitted", "Notification sent to Oragadam store", "Supplier Portal", "21 Jul 2026 · 11:35", "done"],
      ["Gate entry completed", "Gate pass GP-2026-11284 issued at 09:42", "Security — Gate 3", "24 Jul 2026 · 09:42", "done"],
      ["Unloaded & inspected", "Quality inspection passed — 0 rejections", "Warehouse Chennai", "24 Jul 2026 · 10:50", "done"],
      ["GRN posted", "GRN-2026-08841 posted for 2 lines", "Warehouse Chennai", "24 Jul 2026 · 11:15", "done"],
    ]),
  },
  {
    id: "ASN-2026-002263",
    poId: "PO-2026-004871",
    supplierId: "SUP-100241",
    supplier: "Bharat Precision Components",
    shipmentNo: "SHP-778501",
    transporter: "Safexpress",
    vehicleNo: "MH-14-KT-2290",
    containerNo: "—",
    driverName: "Sanjay Pawar",
    driverPhone: "+91 98811 20034",
    driverLicense: "MH1420150077412",
    invoiceNo: "BPC-INV-2026-10024",
    ewayBill: "271004492211",
    packingList: "BPC-PL-10024",
    deliveryChallan: "DC-BPC-10024",
    dispatchedOn: "—",
    expectedArrival: "12 Aug 2026 · 08:00",
    warehouse: "WH-PUN-01 · Chakan Central Warehouse",
    gate: "Gate 1 — Inbound",
    status: "Draft",
    weightKg: 9800,
    volumeCbm: 27.6,
    packages: 48,
    progressPct: 10,
    currentLocation: "Not dispatched — awaiting PO approval",
    materials: [
      { material: "MAT-88214", description: "Machined Gearbox Housing — GH-450 Alloy", qty: 600, uom: "NOS", batch: "BPC-B-8821" },
    ],
    documents: [{ name: "Draft Packing List BPC-PL-10024.pdf", type: "Packing List", size: "142 KB", status: "Pending" }],
    timeline: tl([
      ["ASN drafted", "Supplier pre-created ASN for first partial despatch", "Sneha Kulkarni", "29 Jul 2026 · 09:15", "done"],
      ["Blocked", "Parent PO-2026-004871 is still pending Finance approval", "Validation Engine", "29 Jul 2026 · 09:16", "error"],
    ]),
  },
  {
    id: "ASN-2026-002240",
    poId: "PO-2026-004910",
    supplierId: "SUP-100455",
    supplier: "Shakti Steel & Alloys",
    shipmentNo: "SHP-778390",
    transporter: "Meridian Logistics & Freight",
    vehicleNo: "GJ-12-BT-5510",
    containerNo: "—",
    driverName: "Imran Shaikh",
    driverPhone: "+91 99251 44120",
    driverLicense: "GJ1220180022114",
    invoiceNo: "SSA-INV-2026-4462",
    ewayBill: "291004480117",
    packingList: "SSA-PL-4462",
    deliveryChallan: "DC-SSA-8810",
    dispatchedOn: "28 Jul 2026",
    expectedArrival: "31 Jul 2026 · 14:00",
    warehouse: "WH-AHM-03 · Sanand Raw Material Yard",
    gate: "Gate 1 — Raw Material",
    status: "Arrived",
    weightKg: 22000,
    volumeCbm: 35.0,
    packages: 11,
    progressPct: 92,
    currentLocation: "At Gate 1 — awaiting security verification",
    materials: [{ material: "MAT-10044", description: "CR Sheet IS 513 CR2 — 1.2 mm × 1250 mm", qty: 22, uom: "MT", batch: "HEAT-SSA-92180" }],
    documents: [
      { name: "Tax Invoice SSA-INV-2026-4462.pdf", type: "Invoice", size: "348 KB", status: "Verified" },
      { name: "Mill Test Certificate HEAT-92180.pdf", type: "Quality", size: "1.0 MB", status: "Verified" },
    ],
    timeline: tl([
      ["ASN submitted", "Warehouse and security notified", "Supplier Portal", "27 Jul 2026 · 18:30", "done"],
      ["Dispatched", "Vehicle left Gandhidham", "Meridian Logistics", "28 Jul 2026 · 20:00", "done"],
      ["Arrived at gate", "Truck reported at Gate 1, token TKN-4471 issued", "Security — Gate 1", "31 Jul 2026 · 13:42", "current"],
      ["Gate entry & weighbridge", "Handover to Warehouse Gate Entry module", "Gate Entry Module", "Pending", "pending"],
    ]),
  },
];

export const notifications = [
  { id: "N1", type: "success", title: "Purchase order approved", body: "PO-2026-004910 approved by Finance Controller.", time: "12 min ago", link: "/supplier-flow/purchase-orders/PO-2026-004910" },
  { id: "N2", type: "warning", title: "Shipment delayed", body: "ASN-2026-002214 delayed by 2 days at Nhava Sheva.", time: "1 hr ago", link: "/supplier-flow/asn/ASN-2026-002214" },
  { id: "N3", type: "info", title: "ASN submitted", body: "Shakti Steel submitted ASN-2026-002251 against PO-2026-004910.", time: "3 hrs ago", link: "/supplier-flow/asn/ASN-2026-002251" },
  { id: "N4", type: "danger", title: "Supplier blocked", body: "Sinotech Electricals blocked pending CAPA closure.", time: "Yesterday", link: "/supplier-flow/suppliers/SUP-100579" },
  { id: "N5", type: "info", title: "Vendor rating updated", body: "Bharat Precision Components rating revised to 4.6.", time: "Yesterday", link: "/supplier-flow/vendor-performance/SUP-100241" },
  { id: "N6", type: "warning", title: "Approval SLA at risk", body: "PO-2026-004871 pending with Finance for 18 hours.", time: "2 days ago", link: "/supplier-flow/approvals/PO-2026-004871" },
];

export const spendTrend = [
  { month: "Feb", spend: 82.4, orders: 118, onTime: 88 },
  { month: "Mar", spend: 96.1, orders: 134, onTime: 90 },
  { month: "Apr", spend: 88.7, orders: 121, onTime: 87 },
  { month: "May", spend: 104.3, orders: 148, onTime: 91 },
  { month: "Jun", spend: 118.9, orders: 162, onTime: 93 },
  { month: "Jul", spend: 127.5, orders: 171, onTime: 92 },
];

export const categorySpend = [
  { name: "Raw Material — Steel", value: 128.6 },
  { name: "Hydraulic Systems", value: 91.3 },
  { name: "Machined Components", value: 48.7 },
  { name: "Electrical & Panels", value: 21.9 },
  { name: "Bearings & PT", value: 18.5 },
  { name: "Packaging", value: 6.2 },
];

export const deliveryPerformance = [
  { month: "Feb", onTime: 86, late: 11, early: 3 },
  { month: "Mar", onTime: 89, late: 8, early: 3 },
  { month: "Apr", onTime: 84, late: 13, early: 3 },
  { month: "May", onTime: 91, late: 7, early: 2 },
  { month: "Jun", onTime: 93, late: 5, early: 2 },
  { month: "Jul", onTime: 92, late: 6, early: 2 },
];

export const approvalMatrix = [
  { band: "Up to ₹10,00,000", l1: "Purchase Manager", l2: "—", l3: "—", sla: "24 hrs" },
  { band: "₹10,00,001 – ₹75,00,000", l1: "Purchase Manager", l2: "Finance Controller", l3: "—", sla: "48 hrs" },
  { band: "₹75,00,001 – ₹5,00,00,000", l1: "Purchase Manager", l2: "Finance Controller", l3: "Director — Operations", sla: "72 hrs" },
  { band: "Above ₹5,00,00,000", l1: "Purchase Manager", l2: "Finance Controller", l3: "CFO + Board Sub-committee", sla: "5 working days" },
];

// ---------- helpers ----------

export function lineNet(item: POItem) {
  const gross = item.qty * item.unitPrice;
  return gross - (gross * item.discountPct) / 100;
}
export function lineTax(item: POItem) {
  return (lineNet(item) * item.taxPct) / 100;
}
export function lineTotal(item: POItem) {
  return lineNet(item) + lineTax(item);
}
export function poNet(po: PurchaseOrder) {
  return po.items.reduce((s, i) => s + lineNet(i), 0);
}
export function poTax(po: PurchaseOrder) {
  return po.items.reduce((s, i) => s + lineTax(i), 0);
}
export function poTotal(po: PurchaseOrder) {
  return poNet(po) + poTax(po);
}

const symbols: Record<string, string> = { INR: "₹", EUR: "€", USD: "$" };

export function money(value: number, currency = "INR") {
  const sym = symbols[currency] ?? "";
  return `${sym}${value.toLocaleString(currency === "INR" ? "en-IN" : "en-US", { maximumFractionDigits: 2 })}`;
}

export function compactMoney(value: number, currency = "INR") {
  const sym = symbols[currency] ?? "";
  if (currency === "INR") {
    if (value >= 10000000) return `${sym}${(value / 10000000).toFixed(2)} Cr`;
    if (value >= 100000) return `${sym}${(value / 100000).toFixed(2)} L`;
  } else if (value >= 1000000) return `${sym}${(value / 1000000).toFixed(2)}M`;
  return money(value, currency);
}

export const getSupplier = (id: string) => suppliers.find((s) => s.id === id);
export const getPO = (id: string) => purchaseOrders.find((p) => p.id === id);
export const getASN = (id: string) => asns.find((a) => a.id === id);

export const pendingApprovalPOs = purchaseOrders.filter((p) => p.status === "Pending Approval" || p.status === "Submitted");

export const analytics = {
  totalSuppliers: suppliers.length,
  activeSuppliers: suppliers.filter((s) => s.status === "Active").length,
  blockedSuppliers: suppliers.filter((s) => s.status === "Blocked").length,
  pendingSuppliers: suppliers.filter((s) => s.status.startsWith("Pending")).length,
  totalPOs: purchaseOrders.length,
  pendingApproval: pendingApprovalPOs.length,
  approvedToday: 1,
  rejected: 0,
  totalASN: asns.length,
  upcomingDeliveries: asns.filter((a) => ["In Transit", "Arrived", "Delayed"].includes(a.status)).length,
  avgVendorRating: (suppliers.reduce((s, x) => s + x.rating, 0) / suppliers.length).toFixed(2),
  purchaseSpend: 315400000,
  avgDeliveryDays: 16.4,
};
