import shipmentOverall from "@/apps/quality-gatekeeper/assets/shipment-overall.jpg";
import damageCarton from "@/apps/quality-gatekeeper/assets/damage-carton.jpg";
import labelCloseup from "@/apps/quality-gatekeeper/assets/label-closeup.jpg";
import serialPlate from "@/apps/quality-gatekeeper/assets/serial-plate.jpg";

export const PHOTOS = {
  overall: shipmentOverall,
  damage: damageCarton,
  label: labelCloseup,
  serial: serialPlate,
};

export type InspectionStatus =
  | "Waiting Inspection"
  | "Assigned"
  | "Inspection Started"
  | "Under Review"
  | "Passed"
  | "Failed"
  | "Quality Hold"
  | "NCR Created"
  | "RTS"
  | "Available Inventory";

export type Priority = "Critical" | "High" | "Medium" | "Low";

export interface MaterialLine {
  code: string;
  name: string;
  uom: string;
  expected: number;
  received: number;
  accepted: number;
  rejected: number;
  batch: string;
  serial: string;
  expiry: string;
  barcode: string;
  scanned: boolean;
  image: string;
}

export interface GRN {
  id: string;
  grn: string;
  po: string;
  asn: string;
  vendor: string;
  vendorCode: string;
  vendorRating: number;
  truck: string;
  driver: string;
  dock: string;
  arrival: string;
  material: string;
  qty: number;
  uom: string;
  packages: number;
  priority: Priority;
  status: InspectionStatus;
  inspector: string;
  plant: string;
  storageLocation: string;
  inspectionType: "100% Inspection" | "Random Sampling" | "AQL Sampling";
  lines: MaterialLine[];
  documents: { name: string; type: string; size: string }[];
  timeline: { at: string; label: string; by: string }[];
}

const line = (
  code: string,
  name: string,
  uom: string,
  expected: number,
  received: number,
  accepted: number,
  rejected: number,
  batch: string,
  serial: string,
  expiry: string,
  image: string,
): MaterialLine => ({
  code,
  name,
  uom,
  expected,
  received,
  accepted,
  rejected,
  batch,
  serial,
  expiry,
  barcode: `89${code.replace(/\D/g, "")}0${expected}`,
  scanned: false,
  image,
});

export const GRNS: GRN[] = [
  {
    id: "grn-1",
    grn: "GRN-2026-004871",
    po: "PO-4500912233",
    asn: "ASN-77120",
    vendor: "Siemens Industrial Supplies GmbH",
    vendorCode: "V-100234",
    vendorRating: 94.2,
    truck: "MH-12-KJ-4471",
    driver: "R. Kulkarni",
    dock: "Dock 04",
    arrival: "01 Aug 2026, 06:12",
    material: "AC Drive Units & Contactors",
    qty: 480,
    uom: "EA",
    packages: 24,
    priority: "Critical",
    status: "Waiting Inspection",
    inspector: "Unassigned",
    plant: "PL-1000 Pune Plant",
    storageLocation: "QA-STG-01",
    inspectionType: "AQL Sampling",
    lines: [
      line("MAT-88120", "AC Drive Unit 7.5kW IP55", "EA", 200, 200, 0, 0, "B-2026-0731", "SN-7712004", "—", PHOTOS.serial),
      line("MAT-88135", "Power Contactor 3RT 40A", "EA", 180, 178, 0, 0, "B-2026-0729", "SN-7712099", "—", PHOTOS.overall),
      line("MAT-88190", "Din Rail Terminal Block 6mm", "EA", 100, 100, 0, 0, "B-2026-0730", "—", "—", PHOTOS.label),
    ],
    documents: [
      { name: "Delivery_Note_77120.pdf", type: "Delivery Note", size: "412 KB" },
      { name: "Packing_List_PO4500912233.pdf", type: "Packing List", size: "228 KB" },
      { name: "Mill_Test_Certificate.pdf", type: "COA / MTC", size: "1.2 MB" },
    ],
    timeline: [
      { at: "01 Aug, 06:12", label: "Truck arrived at Dock 04", by: "Gate Security" },
      { at: "01 Aug, 06:48", label: "Unloading completed — 24 packages", by: "S. Menon (Store Keeper)" },
      { at: "01 Aug, 07:05", label: "GRN created and posted to QA stage", by: "SAP EWM Interface" },
    ],
  },
  {
    id: "grn-2",
    grn: "GRN-2026-004872",
    po: "PO-4500912310",
    asn: "ASN-77135",
    vendor: "Bosch Rexroth Components Ltd",
    vendorCode: "V-100871",
    vendorRating: 88.7,
    truck: "KA-05-AC-9082",
    driver: "T. Fernandes",
    dock: "Dock 02",
    arrival: "01 Aug 2026, 07:40",
    material: "Hydraulic Valves & Seal Kits",
    qty: 1250,
    uom: "EA",
    packages: 42,
    priority: "High",
    status: "Assigned",
    inspector: "A. Sharma",
    plant: "PL-1000 Pune Plant",
    storageLocation: "QA-STG-02",
    inspectionType: "Random Sampling",
    lines: [
      line("MAT-44012", "Directional Valve 4WE6 24V", "EA", 600, 600, 0, 0, "B-2026-0725", "SN-4401277", "—", PHOTOS.overall),
      line("MAT-44088", "Seal Kit NBR 70 Shore", "EA", 650, 648, 0, 0, "B-2026-0726", "—", "12 Dec 2028", PHOTOS.label),
    ],
    documents: [
      { name: "Delivery_Note_77135.pdf", type: "Delivery Note", size: "388 KB" },
      { name: "Certificate_of_Analysis.pdf", type: "COA", size: "744 KB" },
    ],
    timeline: [
      { at: "01 Aug, 07:40", label: "Truck arrived at Dock 02", by: "Gate Security" },
      { at: "01 Aug, 08:15", label: "GRN created — 42 packages", by: "SAP EWM Interface" },
      { at: "01 Aug, 08:22", label: "Inspector A. Sharma assigned", by: "K. Iyer (Quality Manager)" },
    ],
  },
  {
    id: "grn-3",
    grn: "GRN-2026-004869",
    po: "PO-4500911884",
    asn: "ASN-77098",
    vendor: "Tata Steel Processing Pvt Ltd",
    vendorCode: "V-100019",
    vendorRating: 71.4,
    truck: "GJ-01-BX-2210",
    driver: "M. Patel",
    dock: "Dock 07",
    arrival: "31 Jul 2026, 21:05",
    material: "CR Steel Coils 1.2mm",
    qty: 18,
    uom: "COIL",
    packages: 18,
    priority: "High",
    status: "Quality Hold",
    inspector: "N. Verma",
    plant: "PL-1000 Pune Plant",
    storageLocation: "QA-HOLD-01",
    inspectionType: "100% Inspection",
    lines: [
      line("MAT-10220", "CR Steel Coil 1.2mm x 1250mm", "COIL", 18, 18, 14, 4, "HEAT-99213", "—", "—", PHOTOS.damage),
    ],
    documents: [{ name: "Heat_Certificate_99213.pdf", type: "Mill Certificate", size: "980 KB" }],
    timeline: [
      { at: "31 Jul, 21:05", label: "Truck arrived at Dock 07", by: "Gate Security" },
      { at: "31 Jul, 22:10", label: "Inspection started", by: "N. Verma" },
      { at: "31 Jul, 23:36", label: "4 coils rejected — edge corrosion", by: "N. Verma" },
      { at: "01 Aug, 00:02", label: "Moved to Quality Hold QA-HOLD-01", by: "System" },
    ],
  },
  {
    id: "grn-4",
    grn: "GRN-2026-004866",
    po: "PO-4500911702",
    asn: "ASN-77061",
    vendor: "Henkel Adhesives India",
    vendorCode: "V-100442",
    vendorRating: 96.8,
    truck: "MH-14-PL-7781",
    driver: "D. Rane",
    dock: "Dock 01",
    arrival: "31 Jul 2026, 14:20",
    material: "Industrial Adhesive 20L Drums",
    qty: 96,
    uom: "DRUM",
    packages: 96,
    priority: "Medium",
    status: "Available Inventory",
    inspector: "A. Sharma",
    plant: "PL-1000 Pune Plant",
    storageLocation: "WH-A-12-03",
    inspectionType: "AQL Sampling",
    lines: [
      line("MAT-66031", "Loctite 3090 Adhesive 20L", "DRUM", 96, 96, 96, 0, "B-2026-0712", "—", "30 Jun 2027", PHOTOS.overall),
    ],
    documents: [{ name: "MSDS_Loctite3090.pdf", type: "MSDS", size: "512 KB" }],
    timeline: [
      { at: "31 Jul, 14:20", label: "Truck arrived at Dock 01", by: "Gate Security" },
      { at: "31 Jul, 15:02", label: "AQL sample of 20 drums inspected", by: "A. Sharma" },
      { at: "31 Jul, 15:44", label: "Inspection PASSED — 96 accepted", by: "A. Sharma" },
      { at: "31 Jul, 15:50", label: "Stock posted to WH-A-12-03", by: "System" },
    ],
  },
  {
    id: "grn-5",
    grn: "GRN-2026-004873",
    po: "PO-4500912402",
    asn: "ASN-77141",
    vendor: "Schneider Electric Distribution",
    vendorCode: "V-100655",
    vendorRating: 91.1,
    truck: "TN-09-QR-3345",
    driver: "V. Rajan",
    dock: "Dock 05",
    arrival: "01 Aug 2026, 08:55",
    material: "MCCB Breakers 250A",
    qty: 340,
    uom: "EA",
    packages: 17,
    priority: "Medium",
    status: "Inspection Started",
    inspector: "P. Nair",
    plant: "PL-1000 Pune Plant",
    storageLocation: "QA-STG-03",
    inspectionType: "Random Sampling",
    lines: [
      line("MAT-77450", "MCCB 3P 250A 36kA", "EA", 340, 340, 0, 0, "B-2026-0728", "SN-7745011", "—", PHOTOS.serial),
    ],
    documents: [{ name: "Type_Test_Report.pdf", type: "Test Report", size: "1.7 MB" }],
    timeline: [
      { at: "01 Aug, 08:55", label: "Truck arrived at Dock 05", by: "Gate Security" },
      { at: "01 Aug, 09:30", label: "Inspection started", by: "P. Nair" },
    ],
  },
  {
    id: "grn-6",
    grn: "GRN-2026-004860",
    po: "PO-4500911520",
    asn: "ASN-76998",
    vendor: "Guangdong Precision Fasteners Co.",
    vendorCode: "V-101902",
    vendorRating: 63.9,
    truck: "CONT-MSKU-778213",
    driver: "Import Container",
    dock: "Dock 09",
    arrival: "30 Jul 2026, 11:15",
    material: "Hex Bolts M12 Grade 8.8",
    qty: 24000,
    uom: "EA",
    packages: 60,
    priority: "Low",
    status: "RTS",
    inspector: "N. Verma",
    plant: "PL-1000 Pune Plant",
    storageLocation: "QA-HOLD-02",
    inspectionType: "AQL Sampling",
    lines: [
      line("MAT-30110", "Hex Bolt M12x60 Grade 8.8 Zn", "EA", 24000, 24000, 18000, 6000, "B-2026-0701", "—", "—", PHOTOS.damage),
    ],
    documents: [{ name: "Import_Invoice_88231.pdf", type: "Invoice", size: "301 KB" }],
    timeline: [
      { at: "30 Jul, 11:15", label: "Container destuffed at Dock 09", by: "Gate Security" },
      { at: "30 Jul, 13:40", label: "AQL Level II sample failed — plating defects", by: "N. Verma" },
      { at: "30 Jul, 15:00", label: "NCR-2026-0318 created", by: "N. Verma" },
      { at: "31 Jul, 09:20", label: "RTS-2026-0091 approved", by: "K. Iyer (Quality Manager)" },
    ],
  },
  {
    id: "grn-7",
    grn: "GRN-2026-004874",
    po: "PO-4500912455",
    asn: "ASN-77150",
    vendor: "3M Industrial Abrasives",
    vendorCode: "V-100388",
    vendorRating: 97.5,
    truck: "MH-12-ZA-1102",
    driver: "S. Gaikwad",
    dock: "Dock 03",
    arrival: "01 Aug 2026, 09:35",
    material: "Abrasive Discs & Safety PPE",
    qty: 2400,
    uom: "EA",
    packages: 30,
    priority: "Low",
    status: "Waiting Inspection",
    inspector: "Unassigned",
    plant: "PL-1000 Pune Plant",
    storageLocation: "QA-STG-01",
    inspectionType: "Random Sampling",
    lines: [
      line("MAT-52001", "Cubitron II Disc 125mm", "EA", 1800, 1800, 0, 0, "B-2026-0727", "—", "—", PHOTOS.overall),
      line("MAT-52099", "Safety Goggles Clear AS/NZS", "EA", 600, 600, 0, 0, "B-2026-0727", "—", "—", PHOTOS.label),
    ],
    documents: [{ name: "Packing_List_77150.pdf", type: "Packing List", size: "196 KB" }],
    timeline: [
      { at: "01 Aug, 09:35", label: "Truck arrived at Dock 03", by: "Gate Security" },
      { at: "01 Aug, 10:02", label: "GRN created — 30 packages", by: "SAP EWM Interface" },
    ],
  },
];

export const CHECKLIST_CATEGORIES: { category: string; items: string[] }[] = [
  { category: "Packaging", items: ["Outer carton integrity", "Pallet & shrink wrap condition", "Corner protection present"] },
  { category: "Visual Damage", items: ["Dents / scratches on units", "Corrosion or rust", "Water ingress marks"] },
  { category: "Quantity", items: ["Package count vs packing list", "Unit count per carton", "Short / excess quantity"] },
  { category: "Label Verification", items: ["Material code matches PO", "Vendor label legible", "Handling symbols present"] },
  { category: "Serial Number", items: ["Serial plate readable", "Serial recorded in system"] },
  { category: "Batch Number", items: ["Batch printed on carton", "Batch matches COA"] },
  { category: "Expiry Date", items: ["Shelf life > 80% remaining", "Expiry legible on label"] },
  { category: "Dimensions", items: ["Length / width within tolerance", "Thickness gauge check"] },
  { category: "Weight", items: ["Gross weight vs delivery note", "Net weight per unit"] },
  { category: "Safety", items: ["MSDS available", "Hazard labels applied", "No leakage detected"] },
  { category: "Compliance", items: ["CE / BIS marking present", "Test certificate attached", "RoHS declaration"] },
];

export const NCRS = [
  {
    id: "NCR-2026-0318",
    grn: "GRN-2026-004860",
    vendor: "Guangdong Precision Fasteners Co.",
    category: "Surface Finish Defect",
    severity: "Critical" as const,
    qty: 6000,
    dept: "Procurement",
    status: "RTS Approved",
    raised: "30 Jul 2026",
    owner: "N. Verma",
    rootCause: "Inadequate zinc plating bath control at supplier",
  },
  {
    id: "NCR-2026-0317",
    grn: "GRN-2026-004869",
    vendor: "Tata Steel Processing Pvt Ltd",
    category: "Material Damage",
    severity: "Major" as const,
    qty: 4,
    dept: "Logistics",
    status: "Under Review",
    raised: "31 Jul 2026",
    owner: "N. Verma",
    rootCause: "Coil edges unprotected during transit",
  },
  {
    id: "NCR-2026-0315",
    grn: "GRN-2026-004851",
    vendor: "Bosch Rexroth Components Ltd",
    category: "Documentation Missing",
    severity: "Minor" as const,
    qty: 120,
    dept: "Supplier Quality",
    status: "Closed",
    raised: "28 Jul 2026",
    owner: "A. Sharma",
    rootCause: "COA not attached to shipment",
  },
  {
    id: "NCR-2026-0312",
    grn: "GRN-2026-004840",
    vendor: "Guangdong Precision Fasteners Co.",
    category: "Dimensional Non-Conformance",
    severity: "Major" as const,
    qty: 900,
    dept: "Supplier Quality",
    status: "Rework",
    raised: "26 Jul 2026",
    owner: "P. Nair",
    rootCause: "Thread pitch outside tolerance",
  },
];

export const ACTIVITY = [
  { at: "10:42", text: "GRN-2026-004874 arrived from 3M Industrial Abrasives — 30 packages", tone: "info" as const },
  { at: "09:30", text: "P. Nair started inspection on GRN-2026-004873", tone: "info" as const },
  { at: "09:20", text: "RTS-2026-0091 approved by K. Iyer — 6,000 EA to be returned", tone: "danger" as const },
  { at: "08:22", text: "A. Sharma assigned to GRN-2026-004872 by Quality Manager", tone: "info" as const },
  { at: "00:02", text: "GRN-2026-004869 moved to Quality Hold — 4 coils blocked", tone: "warn" as const },
  { at: "Yesterday", text: "GRN-2026-004866 passed inspection — 96 drums posted to WH-A-12-03", tone: "success" as const },
];

export const RTS_LIST = [
  {
    id: "RTS-2026-0091",
    vendor: "Guangdong Precision Fasteners Co.",
    grn: "GRN-2026-004860",
    ncr: "NCR-2026-0318",
    qty: 6000,
    uom: "EA",
    value: "₹ 8,42,000",
    reason: "Plating defect — AQL Level II failure",
    status: "Awaiting Pickup",
    transporter: "Blue Dart Logistics",
    vehicle: "MH-04-TT-8891",
    note: "RN-88213",
    approvedBy: "K. Iyer",
  },
  {
    id: "RTS-2026-0088",
    vendor: "Tata Steel Processing Pvt Ltd",
    grn: "GRN-2026-004869",
    ncr: "NCR-2026-0317",
    qty: 4,
    uom: "COIL",
    value: "₹ 3,10,500",
    reason: "Edge corrosion on 4 coils",
    status: "Pending Approval",
    transporter: "TCI Freight",
    vehicle: "GJ-01-BX-2210",
    note: "RN-88190",
    approvedBy: "—",
  },
  {
    id: "RTS-2026-0084",
    vendor: "Wenzhou Cable Industries",
    grn: "GRN-2026-004822",
    ncr: "NCR-2026-0305",
    qty: 1200,
    uom: "M",
    value: "₹ 1,96,400",
    reason: "Conductor cross-section below spec",
    status: "Dispatched",
    transporter: "Safexpress",
    vehicle: "DL-01-LM-7712",
    note: "RN-88044",
    approvedBy: "K. Iyer",
  },
];

export const HISTORY = [
  { grn: "GRN-2026-004866", vendor: "Henkel Adhesives India", date: "31 Jul 2026, 15:44", inspector: "A. Sharma", result: "PASS", accepted: 96, rejected: 0, ncr: "—", duration: "42 min" },
  { grn: "GRN-2026-004869", vendor: "Tata Steel Processing", date: "31 Jul 2026, 23:36", inspector: "N. Verma", result: "PARTIAL", accepted: 14, rejected: 4, ncr: "NCR-2026-0317", duration: "86 min" },
  { grn: "GRN-2026-004860", vendor: "Guangdong Precision Fasteners", date: "30 Jul 2026, 13:40", inspector: "N. Verma", result: "FAIL", accepted: 18000, rejected: 6000, ncr: "NCR-2026-0318", duration: "145 min" },
  { grn: "GRN-2026-004851", vendor: "Bosch Rexroth Components", date: "28 Jul 2026, 11:12", inspector: "A. Sharma", result: "PASS", accepted: 1200, rejected: 0, ncr: "NCR-2026-0315", duration: "38 min" },
  { grn: "GRN-2026-004840", vendor: "Guangdong Precision Fasteners", date: "26 Jul 2026, 16:20", inspector: "P. Nair", result: "PARTIAL", accepted: 8100, rejected: 900, ncr: "NCR-2026-0312", duration: "112 min" },
  { grn: "GRN-2026-004831", vendor: "Siemens Industrial Supplies", date: "24 Jul 2026, 09:05", inspector: "A. Sharma", result: "PASS", accepted: 320, rejected: 0, ncr: "—", duration: "51 min" },
];

export const AUDIT_LOG = [
  { at: "01 Aug 2026, 09:20", user: "K. Iyer", role: "Quality Manager", action: "Approved RTS-2026-0091", ip: "10.42.8.11" },
  { at: "01 Aug 2026, 08:22", user: "K. Iyer", role: "Quality Manager", action: "Assigned inspector A. Sharma to GRN-2026-004872", ip: "10.42.8.11" },
  { at: "01 Aug 2026, 00:02", user: "SYSTEM", role: "EWM Interface", action: "Posted 4 COIL to QA-HOLD-01", ip: "—" },
  { at: "31 Jul 2026, 23:36", user: "N. Verma", role: "Quality Inspector", action: "Recorded 4 rejections on GRN-2026-004869", ip: "10.42.9.87" },
  { at: "31 Jul 2026, 15:50", user: "SYSTEM", role: "EWM Interface", action: "Posted 96 DRUM to WH-A-12-03", ip: "—" },
];

export const PASS_TREND = [
  { day: "Mon", pass: 92, fail: 8, inspections: 38 },
  { day: "Tue", pass: 88, fail: 12, inspections: 44 },
  { day: "Wed", pass: 94, fail: 6, inspections: 41 },
  { day: "Thu", pass: 90, fail: 10, inspections: 47 },
  { day: "Fri", pass: 96, fail: 4, inspections: 52 },
  { day: "Sat", pass: 91, fail: 9, inspections: 33 },
  { day: "Sun", pass: 93, fail: 7, inspections: 21 },
];

export const DEFECTS = [
  { name: "Transit Damage", value: 34 },
  { name: "Packing Damage", value: 22 },
  { name: "Surface Finish", value: 18 },
  { name: "Dimensional", value: 14 },
  { name: "Missing Parts", value: 8 },
  { name: "Wrong Item", value: 4 },
];

export const VENDOR_RATING = [
  { vendor: "3M Industrial", rating: 97.5, ncr: 1, otif: 99 },
  { vendor: "Henkel India", rating: 96.8, ncr: 0, otif: 98 },
  { vendor: "Siemens GmbH", rating: 94.2, ncr: 2, otif: 95 },
  { vendor: "Schneider Electric", rating: 91.1, ncr: 3, otif: 93 },
  { vendor: "Bosch Rexroth", rating: 88.7, ncr: 4, otif: 90 },
  { vendor: "Tata Steel", rating: 71.4, ncr: 9, otif: 82 },
  { vendor: "Guangdong Fasteners", rating: 63.9, ncr: 14, otif: 74 },
];

export const NCR_TREND = [
  { month: "Mar", opened: 18, closed: 14 },
  { month: "Apr", opened: 22, closed: 19 },
  { month: "May", opened: 16, closed: 20 },
  { month: "Jun", opened: 25, closed: 21 },
  { month: "Jul", opened: 19, closed: 24 },
  { month: "Aug", opened: 4, closed: 3 },
];

export const INSPECTORS = ["A. Sharma", "N. Verma", "P. Nair", "R. D'Souza", "L. Fernandes"];
