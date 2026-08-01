export type DocStatus =
  | "Uploaded"
  | "Processing"
  | "OCR Completed"
  | "Pending Review"
  | "Approved"
  | "Rejected"
  | "Linked"
  | "Archived"
  | "OCR Failed";

export type WmsDocument = {
  id: string;
  name: string;
  type: string;
  vendor: string;
  vendorCode: string;
  po: string;
  asn: string;
  grn: string;
  warehouse: string;
  status: DocStatus;
  confidence: number;
  pages: number;
  sizeMb: number;
  uploadedBy: string;
  uploadedAt: string;
  format: "PDF" | "JPEG" | "PNG" | "TIFF" | "XLSX" | "DOCX";
  amount: string;
  vehicle: string;
  driver: string;
  tags: string[];
};

export const documents: WmsDocument[] = [
  {
    id: "DOC-2026-004812",
    name: "Tax Invoice – Bharat Steel Tubes – INV/26-27/8841.pdf",
    type: "Invoice",
    vendor: "Bharat Steel Tubes Pvt Ltd",
    vendorCode: "VEN-10428",
    po: "PO-2026-77120",
    asn: "ASN-88431",
    grn: "GRN-2026-31188",
    warehouse: "WH-01 Bhiwandi Central",
    status: "Pending Review",
    confidence: 96.4,
    pages: 3,
    sizeMb: 1.8,
    uploadedBy: "R. Deshmukh",
    uploadedAt: "2026-07-31 09:42",
    format: "PDF",
    amount: "₹ 12,84,500.00",
    vehicle: "MH-04-KL-8823",
    driver: "Sandeep Yadav",
    tags: ["GST", "Steel", "Q3-Inbound"],
  },
  {
    id: "DOC-2026-004811",
    name: "E-Way Bill – 391004528817.pdf",
    type: "E-Way Bill",
    vendor: "Bharat Steel Tubes Pvt Ltd",
    vendorCode: "VEN-10428",
    po: "PO-2026-77120",
    asn: "ASN-88431",
    grn: "GRN-2026-31188",
    warehouse: "WH-01 Bhiwandi Central",
    status: "Approved",
    confidence: 99.1,
    pages: 1,
    sizeMb: 0.4,
    uploadedBy: "R. Deshmukh",
    uploadedAt: "2026-07-31 09:41",
    format: "PDF",
    amount: "₹ 12,84,500.00",
    vehicle: "MH-04-KL-8823",
    driver: "Sandeep Yadav",
    tags: ["Transport", "Compliance"],
  },
  {
    id: "DOC-2026-004809",
    name: "Delivery Challan – DC-4471 – Sundaram Fasteners.jpg",
    type: "Delivery Challan",
    vendor: "Sundaram Fasteners Ltd",
    vendorCode: "VEN-10093",
    po: "PO-2026-77104",
    asn: "ASN-88407",
    grn: "—",
    warehouse: "WH-03 Chakan Plant Store",
    status: "OCR Failed",
    confidence: 41.2,
    pages: 2,
    sizeMb: 3.2,
    uploadedBy: "A. Kulkarni",
    uploadedAt: "2026-07-31 08:57",
    format: "JPEG",
    amount: "₹ 3,47,900.00",
    vehicle: "MH-14-GR-2210",
    driver: "Imran Shaikh",
    tags: ["Rework", "Low-Resolution"],
  },
  {
    id: "DOC-2026-004805",
    name: "Purchase Order – PO-2026-77133 – Godrej Material Handling.pdf",
    type: "Purchase Order",
    vendor: "Godrej Material Handling",
    vendorCode: "VEN-11872",
    po: "PO-2026-77133",
    asn: "—",
    grn: "—",
    warehouse: "WH-02 Luhari Hub",
    status: "Linked",
    confidence: 98.7,
    pages: 4,
    sizeMb: 2.1,
    uploadedBy: "S. Iyer",
    uploadedAt: "2026-07-31 08:12",
    format: "PDF",
    amount: "₹ 41,20,000.00",
    vehicle: "—",
    driver: "—",
    tags: ["Capex", "Forklift"],
  },
  {
    id: "DOC-2026-004798",
    name: "Quality Certificate – Heat No. 5521-A – Jindal.pdf",
    type: "Quality Certificate",
    vendor: "Jindal Stainless Ltd",
    vendorCode: "VEN-10731",
    po: "PO-2026-77098",
    asn: "ASN-88390",
    grn: "GRN-2026-31174",
    warehouse: "WH-01 Bhiwandi Central",
    status: "Approved",
    confidence: 94.8,
    pages: 2,
    sizeMb: 1.1,
    uploadedBy: "N. Fernandes",
    uploadedAt: "2026-07-30 18:34",
    format: "PDF",
    amount: "—",
    vehicle: "MH-46-AT-1109",
    driver: "Rakesh Pawar",
    tags: ["QA", "Mill Test"],
  },
  {
    id: "DOC-2026-004791",
    name: "Vehicle RC – MH-04-KL-8823.png",
    type: "Vehicle RC",
    vendor: "Shree Transport Carriers",
    vendorCode: "VEN-12210",
    po: "—",
    asn: "ASN-88431",
    grn: "—",
    warehouse: "Gate 2 – Bhiwandi",
    status: "OCR Completed",
    confidence: 91.3,
    pages: 1,
    sizeMb: 0.9,
    uploadedBy: "Security Desk 2",
    uploadedAt: "2026-07-30 17:20",
    format: "PNG",
    amount: "—",
    vehicle: "MH-04-KL-8823",
    driver: "Sandeep Yadav",
    tags: ["Gate Entry"],
  },
  {
    id: "DOC-2026-004786",
    name: "Driver License – DL MH0320180004521.jpg",
    type: "Driver License",
    vendor: "Shree Transport Carriers",
    vendorCode: "VEN-12210",
    po: "—",
    asn: "ASN-88431",
    grn: "—",
    warehouse: "Gate 2 – Bhiwandi",
    status: "Processing",
    confidence: 0,
    pages: 1,
    sizeMb: 0.6,
    uploadedBy: "Security Desk 2",
    uploadedAt: "2026-07-30 17:18",
    format: "JPEG",
    amount: "—",
    vehicle: "MH-04-KL-8823",
    driver: "Sandeep Yadav",
    tags: ["Gate Entry", "KYC"],
  },
  {
    id: "DOC-2026-004774",
    name: "Packing List – PL-7781 – Schneider Electric.xlsx",
    type: "Packing List",
    vendor: "Schneider Electric India",
    vendorCode: "VEN-10554",
    po: "PO-2026-77081",
    asn: "ASN-88362",
    grn: "GRN-2026-31160",
    warehouse: "WH-02 Luhari Hub",
    status: "Uploaded",
    confidence: 0,
    pages: 6,
    sizeMb: 0.3,
    uploadedBy: "P. Rathore",
    uploadedAt: "2026-07-30 15:02",
    format: "XLSX",
    amount: "₹ 8,92,340.00",
    vehicle: "HR-55-BC-4417",
    driver: "Manjeet Singh",
    tags: ["Electrical"],
  },
  {
    id: "DOC-2026-004769",
    name: "Asset Warranty – Reach Truck RT-220 – Toyota.pdf",
    type: "Asset Warranty",
    vendor: "Toyota Material Handling",
    vendorCode: "VEN-11903",
    po: "PO-2026-76988",
    asn: "—",
    grn: "GRN-2026-31108",
    warehouse: "WH-03 Chakan Plant Store",
    status: "Archived",
    confidence: 97.2,
    pages: 8,
    sizeMb: 4.4,
    uploadedBy: "M. Bhagat",
    uploadedAt: "2026-07-29 11:47",
    format: "PDF",
    amount: "₹ 22,50,000.00",
    vehicle: "—",
    driver: "—",
    tags: ["Asset", "Warranty", "AMC"],
  },
  {
    id: "DOC-2026-004761",
    name: "GRN – GRN-2026-31174 – Jindal Stainless.pdf",
    type: "GRN",
    vendor: "Jindal Stainless Ltd",
    vendorCode: "VEN-10731",
    po: "PO-2026-77098",
    asn: "ASN-88390",
    grn: "GRN-2026-31174",
    warehouse: "WH-01 Bhiwandi Central",
    status: "Rejected",
    confidence: 78.5,
    pages: 2,
    sizeMb: 1.3,
    uploadedBy: "R. Deshmukh",
    uploadedAt: "2026-07-29 10:05",
    format: "PDF",
    amount: "₹ 18,04,220.00",
    vehicle: "MH-46-AT-1109",
    driver: "Rakesh Pawar",
    tags: ["Qty Mismatch"],
  },
  {
    id: "DOC-2026-004750",
    name: "Insurance Policy – Fleet 2026-27 – ICICI Lombard.pdf",
    type: "Insurance",
    vendor: "ICICI Lombard GIC",
    vendorCode: "VEN-13001",
    po: "—",
    asn: "—",
    grn: "—",
    warehouse: "Corporate – Mumbai",
    status: "Approved",
    confidence: 99.4,
    pages: 12,
    sizeMb: 5.7,
    uploadedBy: "S. Iyer",
    uploadedAt: "2026-07-28 16:31",
    format: "PDF",
    amount: "₹ 9,80,000.00",
    vehicle: "Fleet (18 vehicles)",
    driver: "—",
    tags: ["Compliance", "Fleet"],
  },
  {
    id: "DOC-2026-004742",
    name: "Inspection Report – IR-2026-0912 – Bearings Lot 44.tiff",
    type: "Inspection Report",
    vendor: "SKF India Ltd",
    vendorCode: "VEN-10218",
    po: "PO-2026-77042",
    asn: "ASN-88311",
    grn: "GRN-2026-31122",
    warehouse: "WH-03 Chakan Plant Store",
    status: "Pending Review",
    confidence: 88.9,
    pages: 5,
    sizeMb: 7.8,
    uploadedBy: "N. Fernandes",
    uploadedAt: "2026-07-28 12:14",
    format: "TIFF",
    amount: "—",
    vehicle: "MH-12-QP-7788",
    driver: "Vikas Jadhav",
    tags: ["QA", "Sampling"],
  },
];

export const statusStyles: Record<DocStatus, string> = {
  Uploaded: "bg-muted text-muted-foreground border-border",
  Processing: "bg-primary-soft text-primary border-primary/25",
  "OCR Completed": "bg-teal-soft text-teal border-teal/30",
  "Pending Review": "bg-warning-soft text-warning-foreground border-warning/40",
  Approved: "bg-success-soft text-success border-success/30",
  Rejected: "bg-destructive-soft text-destructive border-destructive/30",
  Linked: "bg-primary-soft text-primary border-primary/25",
  Archived: "bg-secondary text-secondary-foreground border-border",
  "OCR Failed": "bg-destructive-soft text-destructive border-destructive/30",
};

export const documentTypes = [
  "Purchase Order",
  "Invoice",
  "ASN",
  "Delivery Challan",
  "Packing List",
  "Quality Certificate",
  "Inspection Report",
  "Asset Invoice",
  "Asset Warranty",
  "Vehicle RC",
  "Insurance",
  "Driver License",
  "Visitor Pass",
  "Gate Pass",
  "GRN",
  "E-Way Bill",
];

export const warehouses = [
  "WH-01 Bhiwandi Central",
  "WH-02 Luhari Hub",
  "WH-03 Chakan Plant Store",
  "WH-04 Hosur Spares",
  "Corporate – Mumbai",
];

export const vendors = [
  "Bharat Steel Tubes Pvt Ltd",
  "Sundaram Fasteners Ltd",
  "Jindal Stainless Ltd",
  "Godrej Material Handling",
  "Schneider Electric India",
  "SKF India Ltd",
  "Toyota Material Handling",
  "ICICI Lombard GIC",
  "Shree Transport Carriers",
];

export type OcrField = {
  key: string;
  label: string;
  value: string;
  confidence: number;
  group: "Header" | "Party" | "Logistics" | "Commercial";
  suggestion?: string;
};

export const ocrFields: OcrField[] = [
  { key: "invoiceNo", label: "Invoice Number", value: "INV/26-27/8841", confidence: 99.2, group: "Header" },
  { key: "invoiceDate", label: "Invoice Date", value: "29-07-2026", confidence: 98.4, group: "Header" },
  { key: "po", label: "PO Number", value: "PO-2026-77120", confidence: 97.8, group: "Header" },
  { key: "asn", label: "ASN Number", value: "ASN-88431", confidence: 93.1, group: "Header" },
  { key: "challan", label: "Delivery Challan", value: "DC-4478", confidence: 88.6, group: "Header" },
  { key: "eway", label: "E-Way Bill", value: "3910 0452 8817", confidence: 96.5, group: "Header" },
  { key: "vendor", label: "Vendor", value: "Bharat Steel Tubes Pvt Ltd", confidence: 99.0, group: "Party" },
  { key: "vendorCode", label: "Vendor Code", value: "VEN-10428", confidence: 95.2, group: "Party" },
  { key: "gstin", label: "Vendor GSTIN", value: "27AABCB1429P1ZK", confidence: 97.1, group: "Party" },
  {
    key: "address",
    label: "Delivery Address",
    value: "Plot 14, MIDC Bhiwandi, Thane 421302, Maharashtra",
    confidence: 91.7,
    group: "Party",
  },
  { key: "warehouse", label: "Warehouse", value: "WH-01 Bhiwandi Central", confidence: 94.4, group: "Party" },
  { key: "vehicle", label: "Vehicle Number", value: "MH-04-KL-8823", confidence: 92.8, group: "Logistics" },
  { key: "driver", label: "Driver Name", value: "Sandeep Yadav", confidence: 84.3, group: "Logistics" },
  {
    key: "license",
    label: "Driver License",
    value: "MH0320180004521",
    confidence: 61.4,
    group: "Logistics",
    suggestion: "MH03 2018 0004521 – matched against Gate Entry GE-77201",
  },
  { key: "weight", label: "Gross Weight", value: "18,420 KG", confidence: 89.9, group: "Logistics" },
  { key: "destination", label: "Destination", value: "Bhiwandi Central – Dock 7", confidence: 93.6, group: "Logistics" },
  { key: "material", label: "Material Names", value: "ERW Steel Tube 48.3mm × 3.2mm", confidence: 90.2, group: "Commercial" },
  { key: "hsn", label: "HSN Code", value: "73063090", confidence: 98.1, group: "Commercial" },
  { key: "quantity", label: "Quantity", value: "1,240", confidence: 96.9, group: "Commercial" },
  { key: "unit", label: "Unit", value: "NOS", confidence: 99.5, group: "Commercial" },
  {
    key: "amount",
    label: "Taxable Amount",
    value: "₹ 10,88,559.32",
    confidence: 72.6,
    group: "Commercial",
    suggestion: "PO line total is ₹ 10,88,559.00 — 0.32 paise rounding difference",
  },
  { key: "gst", label: "GST (18%)", value: "₹ 1,95,940.68", confidence: 95.8, group: "Commercial" },
  { key: "total", label: "Invoice Total", value: "₹ 12,84,500.00", confidence: 99.3, group: "Commercial" },
];

export const ocrStages = [
  "Uploading to secure OCR queue",
  "Scanning pages (3 of 3)",
  "Detecting text regions",
  "Extracting tables",
  "Reading barcode",
  "Reading QR code",
  "Detecting signatures",
  "Detecting stamps & seals",
  "Cross-matching with PO-2026-77120",
];

export const recentActivity = [
  { user: "R. Deshmukh", role: "Store Keeper", action: "uploaded Tax Invoice INV/26-27/8841", time: "4 min ago", tone: "primary" },
  { user: "OCR Engine v4.2", role: "System", action: "completed extraction with 96.4% confidence", time: "3 min ago", tone: "teal" },
  { user: "S. Iyer", role: "Procurement", action: "approved PO-2026-77133 document set", time: "27 min ago", tone: "success" },
  { user: "A. Kulkarni", role: "Warehouse Manager", action: "flagged DC-4471 — page 2 unreadable", time: "1 hr ago", tone: "danger" },
  { user: "Security Desk 2", role: "Security", action: "captured Vehicle RC for MH-04-KL-8823", time: "2 hrs ago", tone: "primary" },
  { user: "N. Fernandes", role: "Quality Inspector", action: "linked Mill Test Cert to GRN-2026-31174", time: "3 hrs ago", tone: "teal" },
  { user: "M. Bhagat", role: "Asset Manager", action: "archived Reach Truck RT-220 warranty", time: "Yesterday", tone: "muted" },
];

export const auditTrail = [
  {
    action: "Document uploaded",
    user: "R. Deshmukh (EMP-2041)",
    time: "31 Jul 2026, 09:42:11 IST",
    ip: "10.42.18.221",
    changes: "3 pages · 1.8 MB · SHA-256 verified · virus scan clean",
  },
  {
    action: "OCR extraction started",
    user: "OCR Engine v4.2",
    time: "31 Jul 2026, 09:42:19 IST",
    ip: "10.0.4.11",
    changes: "Model: wms-invoice-in-v4 · Language: en+hi",
  },
  {
    action: "OCR extraction completed",
    user: "OCR Engine v4.2",
    time: "31 Jul 2026, 09:43:02 IST",
    ip: "10.0.4.11",
    changes: "23 fields extracted · avg confidence 96.4% · 2 low-confidence flags",
  },
  {
    action: "Field edited",
    user: "R. Deshmukh (EMP-2041)",
    time: "31 Jul 2026, 09:51:40 IST",
    ip: "10.42.18.221",
    changes: 'Driver License: "MH032O18OOO4521" → "MH0320180004521"',
  },
  {
    action: "Linked to Purchase Order",
    user: "S. Iyer (EMP-1188)",
    time: "31 Jul 2026, 10:04:55 IST",
    ip: "10.42.9.14",
    changes: "PO-2026-77120 · ASN-88431 · GRN-2026-31188",
  },
  {
    action: "Sent for approval",
    user: "S. Iyer (EMP-1188)",
    time: "31 Jul 2026, 10:05:02 IST",
    ip: "10.42.9.14",
    changes: "Approver: A. Kulkarni (Warehouse Manager)",
  },
];

export const versions = [
  {
    v: "v3",
    label: "Re-scanned at 600 DPI",
    user: "R. Deshmukh",
    time: "31 Jul 2026, 09:42",
    size: "1.8 MB",
    confidence: 96.4,
    current: true,
  },
  { v: "v2", label: "Page 2 replaced (smudged stamp)", user: "R. Deshmukh", time: "30 Jul 2026, 18:20", size: "1.6 MB", confidence: 81.2, current: false },
  { v: "v1", label: "Original mobile capture", user: "Gate Kiosk 2", time: "30 Jul 2026, 17:04", size: "2.9 MB", confidence: 64.8, current: false },
];

export const uploadTrend = [
  { day: "Mon", uploads: 182, ocr: 168 },
  { day: "Tue", uploads: 214, ocr: 203 },
  { day: "Wed", uploads: 198, ocr: 191 },
  { day: "Thu", uploads: 267, ocr: 249 },
  { day: "Fri", uploads: 311, ocr: 298 },
  { day: "Sat", uploads: 143, ocr: 139 },
  { day: "Sun", uploads: 78, ocr: 76 },
];

export const categoryMix = [
  { name: "Invoice", value: 3120, color: "var(--color-chart-1)" },
  { name: "Delivery Challan", value: 2410, color: "var(--color-chart-2)" },
  { name: "E-Way Bill", value: 1880, color: "var(--color-chart-3)" },
  { name: "Quality Cert", value: 940, color: "var(--color-chart-4)" },
  { name: "Asset & Vehicle", value: 610, color: "var(--color-chart-5)" },
];

export const accuracyTrend = [
  { week: "W22", accuracy: 91.2 },
  { week: "W23", accuracy: 92.8 },
  { week: "W24", accuracy: 93.4 },
  { week: "W25", accuracy: 94.9 },
  { week: "W26", accuracy: 95.6 },
  { week: "W27", accuracy: 96.1 },
  { week: "W28", accuracy: 97.3 },
];

export const linkTargets = {
  "Purchase Order": [
    { id: "PO-2026-77120", detail: "Bharat Steel Tubes · ₹ 12,84,500 · Open" },
    { id: "PO-2026-77133", detail: "Godrej Material Handling · ₹ 41,20,000 · Open" },
    { id: "PO-2026-77098", detail: "Jindal Stainless · ₹ 18,04,220 · Closed" },
  ],
  GRN: [
    { id: "GRN-2026-31188", detail: "Dock 7 · Received 31 Jul 2026" },
    { id: "GRN-2026-31174", detail: "Dock 3 · Received 29 Jul 2026" },
  ],
  ASN: [
    { id: "ASN-88431", detail: "ETA 31 Jul 2026 08:30 · In Gate" },
    { id: "ASN-88407", detail: "ETA 30 Jul 2026 19:00 · Closed" },
  ],
  Vendor: [
    { id: "VEN-10428", detail: "Bharat Steel Tubes Pvt Ltd · Rating A" },
    { id: "VEN-12210", detail: "Shree Transport Carriers · Rating B+" },
  ],
  Warehouse: [
    { id: "WH-01", detail: "Bhiwandi Central · 42,000 sq ft" },
    { id: "WH-02", detail: "Luhari Hub · 68,000 sq ft" },
  ],
  Asset: [
    { id: "AST-RT-220", detail: "Toyota Reach Truck · WH-03" },
    { id: "AST-DK-007", detail: "Dock Leveller 7 · WH-01" },
  ],
  Vehicle: [
    { id: "MH-04-KL-8823", detail: "Tata LPT 3118 · Shree Transport" },
    { id: "MH-46-AT-1109", detail: "Ashok Leyland 2820 · Jindal Fleet" },
  ],
  Driver: [
    { id: "DRV-4471", detail: "Sandeep Yadav · DL MH0320180004521" },
    { id: "DRV-3390", detail: "Rakesh Pawar · DL MH1220160009912" },
  ],
  Project: [
    { id: "PRJ-EXP-26", detail: "Bhiwandi Expansion Phase II" },
    { id: "PRJ-AUTO-26", detail: "Warehouse Automation Rollout" },
  ],
};

export const notifications = [
  { title: "OCR completed", body: "INV/26-27/8841 extracted at 96.4% confidence", time: "3 min", tone: "success" as const },
  { title: "Review required", body: "2 low-confidence fields on DOC-2026-004812", time: "8 min", tone: "warning" as const },
  { title: "OCR failed", body: "DC-4471 page 2 unreadable — retry or manual entry", time: "1 hr", tone: "danger" as const },
  { title: "Approval requested", body: "S. Iyer sent GRN-2026-31188 for your approval", time: "2 hr", tone: "primary" as const },
];
