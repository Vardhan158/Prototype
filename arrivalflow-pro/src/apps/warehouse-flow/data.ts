// Realistic mock warehouse data for the Material Request, Issue & Returns module.
// Shapes mirror expected backend DTOs so wiring real APIs needs no UI changes.

export type Priority = "Low" | "Medium" | "High" | "Critical";
export type RequestStatus =
  | "Draft"
  | "Pending Approval"
  | "Approved"
  | "Rejected"
  | "Reserved"
  | "Picking"
  | "Issued"
  | "Closed";

export interface MaterialLine {
  id: string;
  code: string;
  name: string;
  warehouse: string;
  zone: string;
  rack: string;
  shelf: string;
  bin: string;
  available: number;
  requested: number;
  unit: string;
  rate: number;
}

export interface MaterialRequest {
  id: string;
  requestNo: string;
  workOrder: string;
  department: string;
  requestedBy: string;
  priority: Priority;
  requiredDate: string;
  createdDate: string;
  status: RequestStatus;
  warehouse: string;
  costCenter: string;
  notes: string;
  items: MaterialLine[];
}

export const warehouses = [
  { code: "WH-01", name: "North Distribution Center" },
  { code: "WH-02", name: "Central Plant Store" },
  { code: "WH-03", name: "R&D Bonded Store" },
  { code: "WH-04", name: "Cross-dock Hub" },
];

export const departments = [
  "Production",
  "Maintenance",
  "Quality Assurance",
  "R&D",
  "Logistics",
  "Facilities",
];

export const users = [
  { name: "Anjali Sharma", role: "Warehouse Executive / Department Manager", initials: "AS" },
  { name: "Rohit Menon", role: "Ops Manager", initials: "RM" },
  { name: "Priya Nair", role: "Production Planner", initials: "PN" },
  { name: "Vikram Desai", role: "Store Keeper", initials: "VD" },
  { name: "Lena Fernandes", role: "Finance Controller", initials: "LF" },
  { name: "Karan Gupta", role: "QA Inspector", initials: "KG" },
];

export const materialCatalog = [
  { code: "MAT-10045", name: "Steel Bearing 25mm", unit: "PCS", rate: 480 },
  { code: "MAT-10623", name: "Bolt M12x40 Zinc", unit: "PCS", rate: 12 },
  { code: "MAT-10082", name: "Hydraulic Hose 2m", unit: "PCS", rate: 1850 },
  { code: "MAT-10412", name: "Rubber Gasket Ring 60mm", unit: "PCS", rate: 96 },
  { code: "MAT-10214", name: "Copper Wire Coil 4mm", unit: "MTR", rate: 210 },
  { code: "MAT-10877", name: "Industrial Lubricant SAE-40", unit: "LTR", rate: 640 },
  { code: "MAT-10310", name: "Safety Gloves Nitrile", unit: "PAIR", rate: 145 },
  { code: "MAT-10555", name: "Weld Rod E7018 3.2mm", unit: "KG", rate: 320 },
  { code: "MAT-10901", name: "Proximity Sensor NPN", unit: "PCS", rate: 2450 },
  { code: "MAT-10730", name: "Conveyor Belt Section 1.5m", unit: "PCS", rate: 7800 },
];

export const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export const inr = (v: number) => inrFormatter.format(v);

function line(
  idx: number,
  code: string,
  qty: number,
  wh: string,
  loc: [string, string, string, string],
  available: number,
): MaterialLine {
  const m = materialCatalog.find((x) => x.code === code)!;
  return {
    id: `L-${idx}`,
    code: m.code,
    name: m.name,
    warehouse: wh,
    zone: loc[0],
    rack: loc[1],
    shelf: loc[2],
    bin: loc[3],
    available,
    requested: qty,
    unit: m.unit,
    rate: m.rate,
  };
}

export const materialRequests: MaterialRequest[] = [
  {
    id: "1",
    requestNo: "MR-2026-00841",
    workOrder: "WO-88231",
    department: "Production",
    requestedBy: "Priya Nair",
    priority: "High",
    requiredDate: "2026-08-06",
    createdDate: "2026-07-28",
    status: "Pending Approval",
    warehouse: "WH-02",
    costCenter: "CC-4020",
    notes: "Weekly consumables for Assembly Line A. Required before shift start.",
    items: [
      line(1, "MAT-10045", 80, "WH-02", ["Z-A", "R-12", "S-3", "B-014"], 320),
      line(2, "MAT-10623", 500, "WH-02", ["Z-A", "R-12", "S-1", "B-002"], 4800),
    ],
  },
  {
    id: "2",
    requestNo: "MR-2026-00842",
    workOrder: "WO-88240",
    department: "Maintenance",
    requestedBy: "Anjali Sharma",
    priority: "Medium",
    requiredDate: "2026-08-04",
    createdDate: "2026-07-27",
    status: "Approved",
    warehouse: "WH-01",
    costCenter: "CC-2210",
    notes: "Maintenance kit for hydraulic press #3.",
    items: [
      line(3, "MAT-10082", 6, "WH-01", ["Z-B", "R-04", "S-2", "B-101"], 24),
      line(4, "MAT-10412", 40, "WH-01", ["Z-B", "R-04", "S-4", "B-118"], 260),
    ],
  },
  {
    id: "3",
    requestNo: "MR-2026-00843",
    workOrder: "WO-88255",
    department: "R&D",
    requestedBy: "Vikram Desai",
    priority: "Low",
    requiredDate: "2026-08-02",
    createdDate: "2026-07-26",
    status: "Issued",
    warehouse: "WH-03",
    costCenter: "CC-7710",
    notes: "Prototype batch X-14 material draw.",
    items: [
      line(5, "MAT-10214", 120, "WH-03", ["Z-C", "R-08", "S-1", "B-220"], 640),
      line(6, "MAT-10901", 4, "WH-03", ["Z-C", "R-09", "S-2", "B-231"], 18),
    ],
  },
  {
    id: "4",
    requestNo: "MR-2026-00844",
    workOrder: "WO-88261",
    department: "Logistics",
    requestedBy: "Anjali Sharma",
    priority: "High",
    requiredDate: "2026-08-03",
    createdDate: "2026-07-26",
    status: "Picking",
    warehouse: "WH-04",
    costCenter: "CC-3105",
    notes: "Cross-dock overflow pallet handling material.",
    items: [
      line(7, "MAT-10730", 3, "WH-04", ["Z-D", "R-01", "S-1", "B-305"], 9),
      line(8, "MAT-10310", 60, "WH-04", ["Z-D", "R-02", "S-3", "B-312"], 400),
    ],
  },
  {
    id: "5",
    requestNo: "MR-2026-00845",
    workOrder: "WO-88270",
    department: "Production",
    requestedBy: "Priya Nair",
    priority: "Medium",
    requiredDate: "2026-08-09",
    createdDate: "2026-07-29",
    status: "Draft",
    warehouse: "WH-02",
    costCenter: "CC-4020",
    notes: "Line B retooling consumables.",
    items: [line(9, "MAT-10555", 150, "WH-02", ["Z-A", "R-15", "S-2", "B-045"], 900)],
  },
  {
    id: "6",
    requestNo: "MR-2026-00846",
    workOrder: "WO-88274",
    department: "Maintenance",
    requestedBy: "Vikram Desai",
    priority: "Critical",
    requiredDate: "2026-08-01",
    createdDate: "2026-07-29",
    status: "Pending Approval",
    warehouse: "WH-01",
    costCenter: "CC-2210",
    notes: "Emergency spare for CNC-7 breakdown. Line stopped.",
    items: [line(10, "MAT-10901", 2, "WH-01", ["Z-B", "R-06", "S-1", "B-140"], 5)],
  },
  {
    id: "7",
    requestNo: "MR-2026-00847",
    workOrder: "WO-88279",
    department: "Facilities",
    requestedBy: "Anjali Sharma",
    priority: "Low",
    requiredDate: "2026-07-31",
    createdDate: "2026-07-25",
    status: "Rejected",
    warehouse: "WH-03",
    costCenter: "CC-9001",
    notes: "Sanitation cycle materials — rejected, budget exhausted.",
    items: [line(11, "MAT-10877", 40, "WH-03", ["Z-C", "R-03", "S-2", "B-210"], 180)],
  },
  {
    id: "8",
    requestNo: "MR-2026-00848",
    workOrder: "WO-88283",
    department: "Quality Assurance",
    requestedBy: "Karan Gupta",
    priority: "Medium",
    requiredDate: "2026-08-07",
    createdDate: "2026-07-30",
    status: "Reserved",
    warehouse: "WH-02",
    costCenter: "CC-5500",
    notes: "Inspection jig consumables for audit week.",
    items: [
      line(12, "MAT-10310", 100, "WH-02", ["Z-A", "R-18", "S-1", "B-061"], 520),
      line(13, "MAT-10412", 25, "WH-02", ["Z-A", "R-18", "S-2", "B-064"], 140),
    ],
  },
  {
    id: "9",
    requestNo: "MR-2026-00849",
    workOrder: "WO-88290",
    department: "Production",
    requestedBy: "Priya Nair",
    priority: "High",
    requiredDate: "2026-08-05",
    createdDate: "2026-07-30",
    status: "Approved",
    warehouse: "WH-02",
    costCenter: "CC-4020",
    notes: "Shift-3 line changeover kit.",
    items: [line(14, "MAT-10045", 45, "WH-02", ["Z-A", "R-12", "S-3", "B-014"], 320)],
  },
  {
    id: "10",
    requestNo: "MR-2026-00850",
    workOrder: "WO-88294",
    department: "Logistics",
    requestedBy: "Vikram Desai",
    priority: "Low",
    requiredDate: "2026-08-12",
    createdDate: "2026-07-31",
    status: "Closed",
    warehouse: "WH-04",
    costCenter: "CC-3105",
    notes: "Dock safety refresh — completed.",
    items: [line(15, "MAT-10310", 80, "WH-04", ["Z-D", "R-02", "S-3", "B-312"], 400)],
  },
];

export const lineTotal = (l: MaterialLine) => l.requested * l.rate;
export const requestTotal = (r: MaterialRequest) =>
  r.items.reduce((s, l) => s + lineTotal(l), 0);

/* ---------- Dashboard ---------- */

export const kpis = [
  { label: "Open Requests", value: "128", delta: "+12", trend: "up", hint: "vs last week", icon: "FileText" },
  { label: "Pending Approvals", value: "17", delta: "-4", trend: "down", hint: "avg 3h 42m", icon: "ClipboardCheck" },
  { label: "Reserved Materials", value: "342", delta: "+28", trend: "up", hint: "across 4 warehouses", icon: "Layers" },
  { label: "Issued Today", value: "56", delta: "+9", trend: "up", hint: "₹8.4L value", icon: "PackageCheck" },
  { label: "Returned Materials", value: "23", delta: "-2", trend: "down", hint: "1.8% of issued", icon: "Undo2" },
  { label: "Inspection Pending", value: "8", delta: "+3", trend: "up", hint: "2 overdue", icon: "SearchCheck" },
  { label: "Low Stock Items", value: "14", delta: "+5", trend: "up", hint: "below reorder point", icon: "TriangleAlert" },
  { label: "Warehouse Performance", value: "94.2%", delta: "+2.1pp", trend: "up", hint: "fulfilment SLA", icon: "Gauge" },
];

export const requestsVsIssues = [
  { month: "Feb", requests: 142, issues: 128 },
  { month: "Mar", requests: 165, issues: 152 },
  { month: "Apr", requests: 198, issues: 181 },
  { month: "May", requests: 210, issues: 196 },
  { month: "Jun", requests: 178, issues: 164 },
  { month: "Jul", requests: 224, issues: 189 },
];

export const consumptionTrend = [
  { month: "Feb", value: 1840000 },
  { month: "Mar", value: 2120000 },
  { month: "Apr", value: 2480000 },
  { month: "May", value: 2310000 },
  { month: "Jun", value: 2650000 },
  { month: "Jul", value: 2940000 },
];

export const returnTrend = [
  { month: "Feb", surplus: 12, damaged: 6, quality: 4 },
  { month: "Mar", surplus: 15, damaged: 5, quality: 7 },
  { month: "Apr", surplus: 11, damaged: 9, quality: 3 },
  { month: "May", surplus: 18, damaged: 4, quality: 6 },
  { month: "Jun", surplus: 14, damaged: 7, quality: 5 },
  { month: "Jul", surplus: 21, damaged: 6, quality: 8 },
];

export const statusSplit = [
  { name: "Pending Approval", value: 17, color: "var(--color-chart-3)" },
  { name: "Approved", value: 32, color: "var(--color-chart-1)" },
  { name: "Picking", value: 21, color: "var(--color-chart-2)" },
  { name: "Issued", value: 44, color: "var(--color-chart-4)" },
  { name: "Rejected", value: 6, color: "var(--color-chart-5)" },
];

export const recentActivities = [
  { user: "Priya Nair", action: "created request MR-2026-00841", time: "12 min ago", type: "create" },
  { user: "Rohit Menon", action: "approved MR-2026-00842", time: "48 min ago", type: "approve" },
  { user: "Vikram Desai", action: "issued GI-2026-00842 (2 lines)", time: "1 h ago", type: "issue" },
  { user: "Karan Gupta", action: "flagged MRTN-00123 as Scrap", time: "2 h ago", type: "inspect" },
  { user: "System", action: "generated pick list PL-2026-0442", time: "3 h ago", type: "system" },
  { user: "Anjali Sharma", action: "reserved 342 units in WH-02", time: "4 h ago", type: "reserve" },
];

export const inventoryAlerts = [
  { code: "MAT-10901", name: "Proximity Sensor NPN", onHand: 5, reorder: 25, warehouse: "WH-01", severity: "critical" },
  { code: "MAT-10082", name: "Hydraulic Hose 2m", onHand: 24, reorder: 40, warehouse: "WH-01", severity: "warning" },
  { code: "MAT-10730", name: "Conveyor Belt Section 1.5m", onHand: 9, reorder: 12, warehouse: "WH-04", severity: "warning" },
  { code: "MAT-10555", name: "Weld Rod E7018 3.2mm", onHand: 900, reorder: 1200, warehouse: "WH-02", severity: "warning" },
];

/* ---------- Approvals ---------- */

export interface ApprovalStep {
  label: string;
  actor: string;
  at?: string;
  state: "done" | "current" | "pending" | "rejected";
}

export const approvalSteps: Record<string, ApprovalStep[]> = {
  "MR-2026-00841": [
    { label: "Submitted", actor: "Priya Nair", at: "2026-07-28 08:14", state: "done" },
    { label: "Ops Manager", actor: "Rohit Menon", state: "current" },
    { label: "Finance", actor: "Lena Fernandes", state: "pending" },
    { label: "Ready to Issue", actor: "System", state: "pending" },
  ],
  "MR-2026-00846": [
    { label: "Submitted", actor: "Vikram Desai", at: "2026-07-29 21:02", state: "done" },
    { label: "Ops Manager", actor: "Rohit Menon", state: "current" },
    { label: "Finance", actor: "Lena Fernandes", state: "pending" },
    { label: "Ready to Issue", actor: "System", state: "pending" },
  ],
};

export const approvalComments: Record<string, { user: string; at: string; text: string }[]> = {
  "MR-2026-00841": [
    { user: "Priya Nair", at: "2026-07-28 08:20", text: "Line A cannot run beyond Thursday without these consumables." },
    { user: "Rohit Menon", at: "2026-07-28 10:05", text: "Checking budget headroom with finance before approving." },
  ],
  "MR-2026-00846": [
    { user: "Vikram Desai", at: "2026-07-29 21:05", text: "CNC-7 down. Sensor failure confirmed by maintenance." },
  ],
};

/* ---------- Reservation ---------- */

export const reservations = [
  { id: "RSV-2026-0311", request: "MR-2026-00848", code: "MAT-10310", name: "Safety Gloves Nitrile", warehouse: "WH-02", zone: "Z-A", rack: "R-18", shelf: "S-1", bin: "B-061", available: 520, reserved: 100, status: "Reserved" },
  { id: "RSV-2026-0312", request: "MR-2026-00848", code: "MAT-10412", name: "Rubber Gasket Ring 60mm", warehouse: "WH-02", zone: "Z-A", rack: "R-18", shelf: "S-2", bin: "B-064", available: 140, reserved: 25, status: "Reserved" },
  { id: "RSV-2026-0313", request: "MR-2026-00842", code: "MAT-10082", name: "Hydraulic Hose 2m", warehouse: "WH-01", zone: "Z-B", rack: "R-04", shelf: "S-2", bin: "B-101", available: 24, reserved: 6, status: "Allocated" },
  { id: "RSV-2026-0314", request: "MR-2026-00849", code: "MAT-10045", name: "Steel Bearing 25mm", warehouse: "WH-02", zone: "Z-A", rack: "R-12", shelf: "S-3", bin: "B-014", available: 320, reserved: 45, status: "Partially Reserved" },
  { id: "RSV-2026-0315", request: "MR-2026-00844", code: "MAT-10730", name: "Conveyor Belt Section 1.5m", warehouse: "WH-04", zone: "Z-D", rack: "R-01", shelf: "S-1", bin: "B-305", available: 9, reserved: 3, status: "Shortage" },
];

/* ---------- Pick lists ---------- */

export const pickLists = [
  { pickId: "PL-2026-0442-01", list: "PL-2026-0442", seq: 1, warehouse: "WH-02", zone: "Z-A", rack: "R-12", bin: "B-014", code: "MAT-10045", material: "Steel Bearing 25mm", qty: 80, picker: "Vikram Desai", status: "Picked" },
  { pickId: "PL-2026-0442-02", list: "PL-2026-0442", seq: 2, warehouse: "WH-02", zone: "Z-A", rack: "R-12", bin: "B-002", code: "MAT-10623", material: "Bolt M12x40 Zinc", qty: 500, picker: "Vikram Desai", status: "In Progress" },
  { pickId: "PL-2026-0443-01", list: "PL-2026-0443", seq: 1, warehouse: "WH-01", zone: "Z-B", rack: "R-04", bin: "B-101", code: "MAT-10082", material: "Hydraulic Hose 2m", qty: 6, picker: "Anjali Sharma", status: "Pending" },
  { pickId: "PL-2026-0443-02", list: "PL-2026-0443", seq: 2, warehouse: "WH-01", zone: "Z-B", rack: "R-04", bin: "B-118", code: "MAT-10412", material: "Rubber Gasket Ring 60mm", qty: 40, picker: "Anjali Sharma", status: "Pending" },
  { pickId: "PL-2026-0444-01", list: "PL-2026-0444", seq: 1, warehouse: "WH-04", zone: "Z-D", rack: "R-01", bin: "B-305", code: "MAT-10730", material: "Conveyor Belt Section 1.5m", qty: 3, picker: "Karan Gupta", status: "Short" },
  { pickId: "PL-2026-0444-02", list: "PL-2026-0444", seq: 2, warehouse: "WH-04", zone: "Z-D", rack: "R-02", bin: "B-312", code: "MAT-10310", material: "Safety Gloves Nitrile", qty: 60, picker: "Karan Gupta", status: "Pending" },
];

/* ---------- Issues ---------- */

export const issues = [
  {
    issueNo: "GI-2026-00842",
    request: "MR-2026-00842",
    workOrder: "WO-88240",
    warehouse: "WH-01",
    issuedBy: "Vikram Desai",
    receivedBy: "Anjali Sharma",
    issueDate: "2026-07-30",
    status: "Ready to Issue",
    lines: [
      { code: "MAT-10082", name: "Hydraulic Hose 2m", requested: 6, picked: 6, issued: 6, unit: "PCS", batch: "BT-2026-0713", serial: "SN-HH-004512", rate: 1850 },
      { code: "MAT-10412", name: "Rubber Gasket Ring 60mm", requested: 40, picked: 40, issued: 40, unit: "PCS", batch: "BT-2026-0688", serial: "—", rate: 96 },
    ],
    timeline: [
      { label: "Request Approved", at: "2026-07-28 11:20", state: "done" },
      { label: "Inventory Reserved", at: "2026-07-29 09:02", state: "done" },
      { label: "Picking Completed", at: "2026-07-30 07:45", state: "done" },
      { label: "Issue Confirmation", at: "Awaiting signature", state: "current" },
      { label: "Posted to ERP", at: "Pending", state: "pending" },
    ],
  },
  {
    issueNo: "GI-2026-00843",
    request: "MR-2026-00843",
    workOrder: "WO-88255",
    warehouse: "WH-03",
    issuedBy: "Karan Gupta",
    receivedBy: "Vikram Desai",
    issueDate: "2026-07-29",
    status: "Issued",
    lines: [
      { code: "MAT-10214", name: "Copper Wire Coil 4mm", requested: 120, picked: 120, issued: 120, unit: "MTR", batch: "BT-2026-0602", serial: "—", rate: 210 },
      { code: "MAT-10901", name: "Proximity Sensor NPN", requested: 4, picked: 4, issued: 4, unit: "PCS", batch: "BT-2026-0610", serial: "SN-PS-11238", rate: 2450 },
    ],
    timeline: [
      { label: "Request Approved", at: "2026-07-26 14:10", state: "done" },
      { label: "Inventory Reserved", at: "2026-07-27 08:30", state: "done" },
      { label: "Picking Completed", at: "2026-07-28 16:20", state: "done" },
      { label: "Issue Confirmed", at: "2026-07-29 10:05", state: "done" },
      { label: "Posted to ERP", at: "2026-07-29 10:07", state: "done" },
    ],
  },
];

/* ---------- Returns ---------- */

export const returnReasons = [
  "Surplus Material",
  "Wrong Material",
  "Damaged Material",
  "Quality Failure",
  "Excess Material",
  "Cancelled Work Order",
];

export const materialConditions = ["Good", "Damaged", "Needs Inspection", "Scrap"];

export const returns = [
  { returnNo: "MRTN-2026-00121", request: "MR-2026-00842", issue: "GI-2026-00842", code: "MAT-10082", material: "Hydraulic Hose 2m", qty: 2, unit: "PCS", warehouse: "WH-01", bin: "RB-01", reason: "Wrong Material", condition: "Good", by: "Anjali Sharma", date: "2026-07-29", status: "Received", remarks: "Hose length mismatch with press fitting." },
  { returnNo: "MRTN-2026-00122", request: "MR-2026-00843", issue: "GI-2026-00843", code: "MAT-10214", material: "Copper Wire Coil 4mm", qty: 40, unit: "MTR", warehouse: "WH-03", bin: "RB-04", reason: "Surplus Material", condition: "Good", by: "Vikram Desai", date: "2026-07-28", status: "Inspecting", remarks: "Prototype run consumed less than planned." },
  { returnNo: "MRTN-2026-00123", request: "MR-2026-00841", issue: "GI-2026-00841", code: "MAT-10045", material: "Steel Bearing 25mm", qty: 5, unit: "PCS", warehouse: "WH-02", bin: "RB-02", reason: "Damaged Material", condition: "Scrap", by: "Priya Nair", date: "2026-07-27", status: "Scrapped", remarks: "Corrosion found on outer race." },
  { returnNo: "MRTN-2026-00124", request: "MR-2026-00848", issue: "GI-2026-00848", code: "MAT-10412", material: "Rubber Gasket Ring 60mm", qty: 12, unit: "PCS", warehouse: "WH-02", bin: "RB-03", reason: "Quality Failure", condition: "Needs Inspection", by: "Karan Gupta", date: "2026-07-30", status: "Inspecting", remarks: "Hardness out of tolerance on sample check." },
  { returnNo: "MRTN-2026-00125", request: "MR-2026-00844", issue: "GI-2026-00844", code: "MAT-10310", material: "Safety Gloves Nitrile", qty: 20, unit: "PAIR", warehouse: "WH-04", bin: "RB-05", reason: "Cancelled Work Order", condition: "Good", by: "Anjali Sharma", date: "2026-07-31", status: "Received", remarks: "WO-88261 cancelled by planning." },
];

/* ---------- Notifications ---------- */

export const notifications = [
  { id: "N-1", type: "Request Created", title: "MR-2026-00850 created by Vikram Desai", detail: "Logistics · WH-04 · Low priority", time: "8 min ago", read: false },
  { id: "N-2", type: "Approval Pending", title: "MR-2026-00846 awaiting your approval", detail: "Critical · CNC-7 breakdown spare", time: "35 min ago", read: false },
  { id: "N-3", type: "Request Approved", title: "MR-2026-00849 approved by Rohit Menon", detail: "Production · ₹21,600", time: "1 h ago", read: false },
  { id: "N-4", type: "Inventory Reserved", title: "125 units reserved for MR-2026-00848", detail: "WH-02 · Zone Z-A", time: "2 h ago", read: true },
  { id: "N-5", type: "Pick List Generated", title: "PL-2026-0444 generated", detail: "Cross-dock Hub · 2 lines · Karan Gupta", time: "3 h ago", read: true },
  { id: "N-6", type: "Material Issued", title: "GI-2026-00843 issued to Vikram Desai", detail: "WH-03 · 2 lines · ₹34,400", time: "5 h ago", read: true },
  { id: "N-7", type: "Material Returned", title: "MRTN-2026-00125 logged", detail: "Cancelled work order · 20 PAIR", time: "6 h ago", read: true },
  { id: "N-8", type: "Inspection Pending", title: "MRTN-2026-00124 needs QA inspection", detail: "Quality failure · WH-02", time: "8 h ago", read: true },
  { id: "N-9", type: "Inventory Updated", title: "Stock adjusted for MAT-10214", detail: "+40 MTR returned to WH-03", time: "10 h ago", read: true },
  { id: "N-10", type: "Low Stock Alert", title: "MAT-10901 below reorder point", detail: "On hand 5 · reorder 25 · WH-01", time: "12 h ago", read: true },
];

/* ---------- Audit ---------- */

export const auditLogs = [
  { id: "A-1", user: "Rohit Menon", module: "Approval Workflow", action: "Approve Request", entity: "MR-2026-00842", at: "2026-07-30 11:20:44", prev: "Pending Approval", next: "Approved" },
  { id: "A-2", user: "Vikram Desai", module: "Material Issue", action: "Confirm Issue", entity: "GI-2026-00843", at: "2026-07-29 10:05:11", prev: "Ready to Issue", next: "Issued" },
  { id: "A-3", user: "Priya Nair", module: "Material Requests", action: "Update Quantity", entity: "MR-2026-00841 / MAT-10623", at: "2026-07-28 09:12:03", prev: "400 PCS", next: "500 PCS" },
  { id: "A-4", user: "Karan Gupta", module: "Return Inspection", action: "Scrap Material", entity: "MRTN-2026-00123", at: "2026-07-27 16:41:58", prev: "Inspecting", next: "Scrapped" },
  { id: "A-5", user: "System", module: "Inventory Reservation", action: "Auto Reserve", entity: "MR-2026-00848", at: "2026-07-27 08:30:02", prev: "0 units", next: "125 units" },
  { id: "A-6", user: "Anjali Sharma", module: "Settings", action: "Change Approval Limit", entity: "Ops Manager", at: "2026-07-26 13:22:19", prev: "₹2,00,000", next: "₹5,00,000" },
  { id: "A-7", user: "Lena Fernandes", module: "Approval Workflow", action: "Reject Request", entity: "MR-2026-00847", at: "2026-07-25 15:03:47", prev: "Pending Approval", next: "Rejected" },
  { id: "A-8", user: "Vikram Desai", module: "Warehouse Picking", action: "Report Short Pick", entity: "PL-2026-0444-01", at: "2026-07-25 09:55:30", prev: "3 PCS", next: "1 PCS" },
];

/* ---------- Reports ---------- */

export const warehousePerformance = [
  { warehouse: "WH-01", fulfilment: 96, picks: 412, accuracy: 99.4, cycleHrs: 3.1 },
  { warehouse: "WH-02", fulfilment: 94, picks: 688, accuracy: 99.7, cycleHrs: 2.6 },
  { warehouse: "WH-03", fulfilment: 91, picks: 190, accuracy: 98.9, cycleHrs: 4.2 },
  { warehouse: "WH-04", fulfilment: 89, picks: 265, accuracy: 98.2, cycleHrs: 4.8 },
];

export const topConsumed = [
  { code: "MAT-10623", name: "Bolt M12x40 Zinc", qty: 12400, value: 148800 },
  { code: "MAT-10045", name: "Steel Bearing 25mm", qty: 1860, value: 892800 },
  { code: "MAT-10310", name: "Safety Gloves Nitrile", qty: 3200, value: 464000 },
  { code: "MAT-10214", name: "Copper Wire Coil 4mm", qty: 2450, value: 514500 },
  { code: "MAT-10877", name: "Industrial Lubricant SAE-40", qty: 640, value: 409600 },
];

export const inventoryTransactions = [
  { txn: "TXN-99120", type: "Issue", code: "MAT-10082", warehouse: "WH-01", qty: -6, at: "2026-07-30 10:05", ref: "GI-2026-00842" },
  { txn: "TXN-99121", type: "Return", code: "MAT-10214", warehouse: "WH-03", qty: +40, at: "2026-07-29 14:22", ref: "MRTN-2026-00122" },
  { txn: "TXN-99122", type: "Reservation", code: "MAT-10310", warehouse: "WH-02", qty: -100, at: "2026-07-29 08:30", ref: "RSV-2026-0311" },
  { txn: "TXN-99123", type: "Receipt", code: "MAT-10901", warehouse: "WH-01", qty: +25, at: "2026-07-28 17:40", ref: "GRN-55210" },
  { txn: "TXN-99124", type: "Scrap", code: "MAT-10045", warehouse: "WH-02", qty: -5, at: "2026-07-27 16:42", ref: "MRTN-2026-00123" },
];
