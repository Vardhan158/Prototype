// Mock enterprise data for the Quality Inspection module (QM-WMS)

export type InspectionStatus =
  | "Pending"
  | "Assigned"
  | "Inspection Started"
  | "Sampling"
  | "Under Review"
  | "Passed"
  | "Failed"
  | "Quality Hold"
  | "NCR Created"
  | "RTS"
  | "Released"
  | "Completed";

export type Priority = "Critical" | "High" | "Medium" | "Low";

export interface MaterialLine {
  code: string;
  name: string;
  uom: string;
  batch: string;
  serial: string;
  expected: number;
  received: number;
  accepted: number;
  rejected: number;
  image: string;
}

export interface Inspection {
  id: string;
  grn: string;
  po: string;
  vendor: string;
  vendorCode: string;
  material: string;
  materialCode: string;
  qty: number;
  uom: string;
  warehouse: string;
  dock: string;
  truck: string;
  priority: Priority;
  inspector: string;
  status: InspectionStatus;
  receivedOn: string;
  slaHours: number;
  value: number;
  lines: MaterialLine[];
}

const img = (seed: string) => `https://picsum.photos/seed/${seed}/640/420`;

const line = (
  code: string,
  name: string,
  uom: string,
  batch: string,
  serial: string,
  expected: number,
  received: number,
  accepted: number,
  rejected: number,
): MaterialLine => ({
  code,
  name,
  uom,
  batch,
  serial,
  expected,
  received,
  accepted,
  rejected,
  image: img(code),
});

export const inspections: Inspection[] = [
  {
    id: "QI-2026-004821",
    grn: "GRN-88231",
    po: "PO-4500091233",
    vendor: "Nordwerk Precision GmbH",
    vendorCode: "V-100234",
    material: "Stainless Steel Flange DN80 PN16",
    materialCode: "MAT-SS-FLG-0080",
    qty: 480,
    uom: "EA",
    warehouse: "WH-01 Dammam Central",
    dock: "DOCK-04",
    truck: "TRK-4412 / KSA-8892",
    priority: "Critical",
    inspector: "Imran Qureshi",
    status: "Assigned",
    receivedOn: "2026-08-01 06:42",
    slaHours: 4,
    value: 184320,
    lines: [
      line(
        "MAT-SS-FLG-0080",
        "Stainless Steel Flange DN80 PN16",
        "EA",
        "B-2026-0741",
        "SN-88231-001",
        480,
        480,
        0,
        0,
      ),
      line(
        "MAT-GSK-SPW-080",
        "Spiral Wound Gasket 80mm",
        "EA",
        "B-2026-0742",
        "SN-88231-014",
        480,
        476,
        0,
        0,
      ),
      line(
        "MAT-BLT-M16-90",
        "Stud Bolt M16 x 90 A193 B7",
        "EA",
        "B-2026-0743",
        "SN-88231-051",
        3840,
        3840,
        0,
        0,
      ),
    ],
  },
  {
    id: "QI-2026-004822",
    grn: "GRN-88232",
    po: "PO-4500091240",
    vendor: "Al-Rashid Industrial Supplies",
    vendorCode: "V-100871",
    material: "Hydraulic Hose Assembly 1in",
    materialCode: "MAT-HYD-HOS-100",
    qty: 220,
    uom: "EA",
    warehouse: "WH-01 Dammam Central",
    dock: "DOCK-02",
    truck: "TRK-2210 / KSA-1174",
    priority: "High",
    inspector: "Sara Al-Mutairi",
    status: "Inspection Started",
    receivedOn: "2026-08-01 07:15",
    slaHours: 6,
    value: 96800,
    lines: [
      line(
        "MAT-HYD-HOS-100",
        "Hydraulic Hose Assembly 1in",
        "EA",
        "B-2026-0810",
        "SN-88232-002",
        220,
        220,
        180,
        0,
      ),
      line(
        "MAT-HYD-CPL-100",
        "Quick Coupler 1in BSP",
        "EA",
        "B-2026-0811",
        "SN-88232-090",
        220,
        218,
        200,
        4,
      ),
    ],
  },
  {
    id: "QI-2026-004823",
    grn: "GRN-88233",
    po: "PO-4500091255",
    vendor: "Shenzhen Volt Components Ltd",
    vendorCode: "V-100455",
    material: "PLC I/O Module 16DI",
    materialCode: "MAT-ELE-PLC-16D",
    qty: 60,
    uom: "EA",
    warehouse: "WH-02 Jubail Spares",
    dock: "DOCK-01",
    truck: "TRK-7781 / KSA-3320",
    priority: "High",
    inspector: "Unassigned",
    status: "Pending",
    receivedOn: "2026-08-01 08:05",
    slaHours: 8,
    value: 142000,
    lines: [
      line(
        "MAT-ELE-PLC-16D",
        "PLC I/O Module 16DI",
        "EA",
        "B-2026-0902",
        "SN-88233-011",
        60,
        60,
        0,
        0,
      ),
    ],
  },
  {
    id: "QI-2026-004818",
    grn: "GRN-88220",
    po: "PO-4500091188",
    vendor: "Gulf Polymer Trading Co.",
    vendorCode: "V-100612",
    material: "HDPE Pipe 315mm SDR17",
    materialCode: "MAT-PLP-HDP-315",
    qty: 96,
    uom: "LEN",
    warehouse: "WH-03 Yanbu Bulk",
    dock: "DOCK-07",
    truck: "TRK-9902 / KSA-6641",
    priority: "Medium",
    inspector: "Imran Qureshi",
    status: "Failed",
    receivedOn: "2026-07-31 14:20",
    slaHours: 12,
    value: 78400,
    lines: [
      line(
        "MAT-PLP-HDP-315",
        "HDPE Pipe 315mm SDR17",
        "LEN",
        "B-2026-0655",
        "SN-88220-003",
        96,
        96,
        72,
        24,
      ),
    ],
  },
  {
    id: "QI-2026-004819",
    grn: "GRN-88224",
    po: "PO-4500091201",
    vendor: "Bearings & Drives International",
    vendorCode: "V-100333",
    material: "Spherical Roller Bearing 22320",
    materialCode: "MAT-BRG-SRB-2232",
    qty: 40,
    uom: "EA",
    warehouse: "WH-01 Dammam Central",
    dock: "DOCK-03",
    truck: "TRK-1188 / KSA-7712",
    priority: "Critical",
    inspector: "Sara Al-Mutairi",
    status: "Quality Hold",
    receivedOn: "2026-07-31 16:48",
    slaHours: 6,
    value: 210000,
    lines: [
      line(
        "MAT-BRG-SRB-2232",
        "Spherical Roller Bearing 22320",
        "EA",
        "B-2026-0700",
        "SN-88224-007",
        40,
        40,
        0,
        12,
      ),
    ],
  },
  {
    id: "QI-2026-004815",
    grn: "GRN-88210",
    po: "PO-4500091150",
    vendor: "Nordwerk Precision GmbH",
    vendorCode: "V-100234",
    material: "Butterfly Valve DN200 Lugged",
    materialCode: "MAT-VLV-BFV-200",
    qty: 24,
    uom: "EA",
    warehouse: "WH-01 Dammam Central",
    dock: "DOCK-05",
    truck: "TRK-3320 / KSA-9081",
    priority: "Medium",
    inspector: "Imran Qureshi",
    status: "Released",
    receivedOn: "2026-07-30 09:12",
    slaHours: 8,
    value: 132000,
    lines: [
      line(
        "MAT-VLV-BFV-200",
        "Butterfly Valve DN200 Lugged",
        "EA",
        "B-2026-0590",
        "SN-88210-002",
        24,
        24,
        24,
        0,
      ),
    ],
  },
  {
    id: "QI-2026-004812",
    grn: "GRN-88198",
    po: "PO-4500091120",
    vendor: "Sinar Safety Equipment",
    vendorCode: "V-100988",
    material: "Safety Harness Full Body",
    materialCode: "MAT-PPE-HRN-001",
    qty: 300,
    uom: "EA",
    warehouse: "WH-02 Jubail Spares",
    dock: "DOCK-02",
    truck: "TRK-5540 / KSA-2214",
    priority: "Low",
    inspector: "Faisal Bin Omar",
    status: "Completed",
    receivedOn: "2026-07-29 11:30",
    slaHours: 24,
    value: 54000,
    lines: [
      line(
        "MAT-PPE-HRN-001",
        "Safety Harness Full Body",
        "EA",
        "B-2026-0501",
        "SN-88198-021",
        300,
        300,
        300,
        0,
      ),
    ],
  },
  {
    id: "QI-2026-004824",
    grn: "GRN-88240",
    po: "PO-4500091277",
    vendor: "Al-Rashid Industrial Supplies",
    vendorCode: "V-100871",
    material: "Welding Electrode E7018 4.0mm",
    materialCode: "MAT-CON-WEL-4018",
    qty: 1200,
    uom: "KG",
    warehouse: "WH-03 Yanbu Bulk",
    dock: "DOCK-06",
    truck: "TRK-6612 / KSA-4402",
    priority: "Medium",
    inspector: "Faisal Bin Omar",
    status: "Sampling",
    receivedOn: "2026-08-01 05:55",
    slaHours: 10,
    value: 42000,
    lines: [
      line(
        "MAT-CON-WEL-4018",
        "Welding Electrode E7018 4.0mm",
        "KG",
        "B-2026-0955",
        "SN-88240-001",
        1200,
        1200,
        0,
        0,
      ),
    ],
  },
  {
    id: "QI-2026-004825",
    grn: "GRN-88245",
    po: "PO-4500091290",
    vendor: "Shenzhen Volt Components Ltd",
    vendorCode: "V-100455",
    material: "VFD Drive 22kW 400V",
    materialCode: "MAT-ELE-VFD-022",
    qty: 12,
    uom: "EA",
    warehouse: "WH-02 Jubail Spares",
    dock: "DOCK-01",
    truck: "TRK-8890 / KSA-5510",
    priority: "High",
    inspector: "Unassigned",
    status: "Pending",
    receivedOn: "2026-08-01 09:02",
    slaHours: 8,
    value: 168000,
    lines: [
      line(
        "MAT-ELE-VFD-022",
        "VFD Drive 22kW 400V",
        "EA",
        "B-2026-0977",
        "SN-88245-004",
        12,
        12,
        0,
        0,
      ),
    ],
  },
  {
    id: "QI-2026-004826",
    grn: "GRN-88248",
    po: "PO-4500091301",
    vendor: "Gulf Polymer Trading Co.",
    vendorCode: "V-100612",
    material: "EPDM Rubber Sheet 10mm",
    materialCode: "MAT-RUB-EPD-010",
    qty: 85,
    uom: "M2",
    warehouse: "WH-03 Yanbu Bulk",
    dock: "DOCK-07",
    truck: "TRK-2277 / KSA-8830",
    priority: "Low",
    inspector: "Sara Al-Mutairi",
    status: "Under Review",
    receivedOn: "2026-08-01 04:40",
    slaHours: 12,
    value: 21250,
    lines: [
      line(
        "MAT-RUB-EPD-010",
        "EPDM Rubber Sheet 10mm",
        "M2",
        "B-2026-0980",
        "SN-88248-002",
        85,
        85,
        80,
        5,
      ),
    ],
  },
  {
    id: "QI-2026-004827",
    grn: "GRN-88251",
    po: "PO-4500091315",
    vendor: "Bearings & Drives International",
    vendorCode: "V-100333",
    material: "Gear Motor 5.5kW Helical",
    materialCode: "MAT-MEC-GRM-055",
    qty: 8,
    uom: "EA",
    warehouse: "WH-01 Dammam Central",
    dock: "DOCK-03",
    truck: "TRK-4455 / KSA-1290",
    priority: "Critical",
    inspector: "Imran Qureshi",
    status: "NCR Created",
    receivedOn: "2026-07-31 19:10",
    slaHours: 6,
    value: 96000,
    lines: [
      line(
        "MAT-MEC-GRM-055",
        "Gear Motor 5.5kW Helical",
        "EA",
        "B-2026-0961",
        "SN-88251-001",
        8,
        8,
        5,
        3,
      ),
    ],
  },
  {
    id: "QI-2026-004828",
    grn: "GRN-88255",
    po: "PO-4500091322",
    vendor: "Sinar Safety Equipment",
    vendorCode: "V-100988",
    material: "Fire Extinguisher DCP 9kg",
    materialCode: "MAT-FIR-EXT-009",
    qty: 150,
    uom: "EA",
    warehouse: "WH-02 Jubail Spares",
    dock: "DOCK-02",
    truck: "TRK-3311 / KSA-7761",
    priority: "Medium",
    inspector: "Faisal Bin Omar",
    status: "RTS",
    receivedOn: "2026-07-30 13:25",
    slaHours: 12,
    value: 37500,
    lines: [
      line(
        "MAT-FIR-EXT-009",
        "Fire Extinguisher DCP 9kg",
        "EA",
        "B-2026-0930",
        "SN-88255-011",
        150,
        150,
        120,
        30,
      ),
    ],
  },
];

export const getInspection = (id: string) =>
  inspections.find((i) => i.id === id) ?? inspections[0]!;

export const statusTone: Record<
  InspectionStatus,
  "neutral" | "info" | "success" | "warning" | "danger"
> = {
  Pending: "neutral",
  Assigned: "info",
  "Inspection Started": "info",
  Sampling: "info",
  "Under Review": "warning",
  Passed: "success",
  Failed: "danger",
  "Quality Hold": "warning",
  "NCR Created": "danger",
  RTS: "danger",
  Released: "success",
  Completed: "success",
};

export const priorityTone: Record<Priority, "neutral" | "info" | "success" | "warning" | "danger"> =
  {
    Critical: "danger",
    High: "warning",
    Medium: "info",
    Low: "neutral",
  };

export interface ChecklistItem {
  id: string;
  group: string;
  label: string;
  spec: string;
  result: "PASS" | "FAIL" | "NA" | null;
}

export const checklistTemplate: ChecklistItem[] = [
  {
    id: "C01",
    group: "Packaging & Identification",
    label: "Packaging integrity",
    spec: "No crush, tear or moisture",
    result: "PASS",
  },
  {
    id: "C02",
    group: "Packaging & Identification",
    label: "Label legibility",
    spec: "Vendor label + MAT code visible",
    result: "PASS",
  },
  {
    id: "C03",
    group: "Packaging & Identification",
    label: "Barcode / QR readable",
    spec: "GS1-128 scan success",
    result: "PASS",
  },
  {
    id: "C04",
    group: "Quantity & Dimensions",
    label: "Quantity verification",
    spec: "Received = GRN quantity",
    result: "PASS",
  },
  {
    id: "C05",
    group: "Quantity & Dimensions",
    label: "Dimensional check",
    spec: "OD 200 Â±0.5 mm",
    result: null,
  },
  {
    id: "C06",
    group: "Quantity & Dimensions",
    label: "Weight check",
    spec: "12.4 Â±0.2 kg per unit",
    result: null,
  },
  {
    id: "C07",
    group: "Visual & Surface",
    label: "Visual condition",
    spec: "No dents, cracks, deformation",
    result: null,
  },
  {
    id: "C08",
    group: "Visual & Surface",
    label: "Surface finish",
    spec: "Ra â‰¤ 3.2 Âµm, no pitting",
    result: null,
  },
  {
    id: "C09",
    group: "Visual & Surface",
    label: "Colour / coating",
    spec: "RAL 5010, DFT â‰¥ 80 Âµm",
    result: null,
  },
  {
    id: "C10",
    group: "Traceability",
    label: "Serial number match",
    spec: "Serial = ASN manifest",
    result: null,
  },
  {
    id: "C11",
    group: "Traceability",
    label: "Batch / heat number",
    spec: "Heat no. on MTC 3.1",
    result: null,
  },
  {
    id: "C12",
    group: "Safety & Compliance",
    label: "Safety marking (CE/SASO)",
    spec: "Marking present & valid",
    result: null,
  },
  {
    id: "C13",
    group: "Safety & Compliance",
    label: "MTC / COC documents",
    spec: "EN 10204 3.1 attached",
    result: null,
  },
  {
    id: "C14",
    group: "Functional",
    label: "Functional / pressure test",
    spec: "Hydro 24 bar, 10 min, no leak",
    result: null,
  },
];

export interface Ncr {
  id: string;
  inspection: string;
  vendor: string;
  material: string;
  category: string;
  severity: "Minor" | "Major" | "Critical";
  qty: number;
  raisedBy: string;
  raisedOn: string;
  department: string;
  status: "Open" | "Under Investigation" | "CAPA Pending" | "Closed";
  disposition: "Return To Supplier" | "Rework" | "Scrap" | "Use As Is" | "Pending";
  rootCause: string;
  description: string;
  corrective: string;
  preventive: string;
}

export const ncrs: Ncr[] = [
  {
    id: "NCR-2026-00318",
    inspection: "QI-2026-004827",
    vendor: "Bearings & Drives International",
    material: "Gear Motor 5.5kW Helical",
    category: "Dimensional Non-Conformance",
    severity: "Critical",
    qty: 3,
    raisedBy: "Imran Qureshi",
    raisedOn: "2026-07-31 20:05",
    department: "Supplier Quality",
    status: "Under Investigation",
    disposition: "Return To Supplier",
    rootCause:
      "Shaft keyway machined 2.1 mm oversize â€” vendor CNC offset drift, no in-process SPC.",
    description:
      "3 of 8 gear motors received with output shaft keyway exceeding drawing tolerance (12 +0.043/0 mm). Coupling cannot be mounted without shim.",
    corrective:
      "Quarantine 3 units in QA-HOLD-A1, raise debit note, ship back under RTS-2026-00142.",
    preventive:
      "Vendor to submit SPC charts for keyway operation for next 3 shipments; add first-article inspection.",
  },
  {
    id: "NCR-2026-00317",
    inspection: "QI-2026-004818",
    vendor: "Gulf Polymer Trading Co.",
    material: "HDPE Pipe 315mm SDR17",
    category: "Transit Damage",
    severity: "Major",
    qty: 24,
    raisedBy: "Imran Qureshi",
    raisedOn: "2026-07-31 15:40",
    department: "Logistics",
    status: "CAPA Pending",
    disposition: "Scrap",
    rootCause:
      "Inadequate load restraint â€” pipes shifted during transit causing ovality and surface gouging.",
    description:
      "24 lengths show ovality >5% and deep longitudinal scoring beyond 10% wall thickness.",
    corrective:
      "Scrap 24 lengths, claim against carrier insurance, re-order shortfall on PO-4500091188.",
    preventive: "Mandate cradle-type dunnage and photo proof of load restraint before dispatch.",
  },
  {
    id: "NCR-2026-00316",
    inspection: "QI-2026-004819",
    vendor: "Bearings & Drives International",
    material: "Spherical Roller Bearing 22320",
    category: "Counterfeit / Marking Suspicion",
    severity: "Critical",
    qty: 12,
    raisedBy: "Sara Al-Mutairi",
    raisedOn: "2026-07-31 17:20",
    department: "Supplier Quality",
    status: "Open",
    disposition: "Pending",
    rootCause: "Under investigation â€” laser etch font differs from OEM reference sample.",
    description:
      "12 bearings show inconsistent laser marking and missing holographic authenticity label.",
    corrective: "Full lot placed on Quality Hold QH-2026-00087 pending OEM verification.",
    preventive:
      "Restrict sourcing to OEM-authorised distributors; add authenticity verification to checklist.",
  },
  {
    id: "NCR-2026-00312",
    inspection: "QI-2026-004828",
    vendor: "Sinar Safety Equipment",
    material: "Fire Extinguisher DCP 9kg",
    category: "Documentation Non-Conformance",
    severity: "Major",
    qty: 30,
    raisedBy: "Faisal Bin Omar",
    raisedOn: "2026-07-30 14:10",
    department: "HSE",
    status: "Closed",
    disposition: "Return To Supplier",
    rootCause: "SASO certificates expired for 30 units manufactured after certificate lapse date.",
    description: "30 extinguishers supplied without valid SASO conformity certificate.",
    corrective: "Returned under RTS-2026-00139, replacement lot received and cleared.",
    preventive: "Certificate validity check added to GRN document validation gate.",
  },
];

export const getNcr = (id: string) => ncrs.find((n) => n.id === id) ?? ncrs[0]!;

export interface Hold {
  id: string;
  inspection: string;
  material: string;
  vendor: string;
  reason: string;
  qty: number;
  uom: string;
  location: string;
  inspector: string;
  since: string;
  ageDays: number;
  status: "Active" | "Released" | "Rejected";
}

export const holds: Hold[] = [
  {
    id: "QH-2026-00087",
    inspection: "QI-2026-004819",
    material: "Spherical Roller Bearing 22320",
    vendor: "Bearings & Drives International",
    reason: "Counterfeit marking suspicion â€” OEM verification pending",
    qty: 40,
    uom: "EA",
    location: "QA-HOLD-A1",
    inspector: "Sara Al-Mutairi",
    since: "2026-07-31 17:35",
    ageDays: 1,
    status: "Active",
  },
  {
    id: "QH-2026-00086",
    inspection: "QI-2026-004827",
    material: "Gear Motor 5.5kW Helical",
    vendor: "Bearings & Drives International",
    reason: "Dimensional NC â€” keyway oversize (NCR-2026-00318)",
    qty: 3,
    uom: "EA",
    location: "QA-HOLD-A2",
    inspector: "Imran Qureshi",
    since: "2026-07-31 20:12",
    ageDays: 1,
    status: "Active",
  },
  {
    id: "QH-2026-00084",
    inspection: "QI-2026-004826",
    material: "EPDM Rubber Sheet 10mm",
    vendor: "Gulf Polymer Trading Co.",
    reason: "Shore-A hardness deviation, lab retest requested",
    qty: 5,
    uom: "M2",
    location: "QA-HOLD-B3",
    inspector: "Sara Al-Mutairi",
    since: "2026-08-01 05:10",
    ageDays: 0,
    status: "Active",
  },
  {
    id: "QH-2026-00080",
    inspection: "QI-2026-004815",
    material: "Butterfly Valve DN200 Lugged",
    vendor: "Nordwerk Precision GmbH",
    reason: "Missing MTC 3.1 â€” document received",
    qty: 24,
    uom: "EA",
    location: "QA-HOLD-A1",
    inspector: "Imran Qureshi",
    since: "2026-07-30 10:05",
    ageDays: 2,
    status: "Released",
  },
];

export interface Rts {
  id: string;
  ncr: string;
  vendor: string;
  material: string;
  qty: number;
  reason: string;
  approvedBy: string;
  carrier: string;
  awb: string;
  dispatch: string;
  creditNote: string;
  status: "Awaiting Approval" | "Approved" | "In Transit" | "Delivered" | "Closed";
}

export const rtsList: Rts[] = [
  {
    id: "RTS-2026-00142",
    ncr: "NCR-2026-00318",
    vendor: "Bearings & Drives International",
    material: "Gear Motor 5.5kW Helical",
    qty: 3,
    reason: "Keyway dimensional non-conformance",
    approvedBy: "Pending â€” Quality Manager",
    carrier: "Aramex Freight",
    awb: "â€”",
    dispatch: "2026-08-04",
    creditNote: "SAR 36,000 (draft)",
    status: "Awaiting Approval",
  },
  {
    id: "RTS-2026-00141",
    ncr: "NCR-2026-00316",
    vendor: "Bearings & Drives International",
    material: "Spherical Roller Bearing 22320",
    qty: 12,
    reason: "Suspected counterfeit marking",
    approvedBy: "Layla Hassan (QM)",
    carrier: "DHL Industrial",
    awb: "AWB-4471-8823",
    dispatch: "2026-08-02",
    creditNote: "SAR 63,000",
    status: "Approved",
  },
  {
    id: "RTS-2026-00139",
    ncr: "NCR-2026-00312",
    vendor: "Sinar Safety Equipment",
    material: "Fire Extinguisher DCP 9kg",
    qty: 30,
    reason: "Expired SASO certification",
    approvedBy: "Layla Hassan (QM)",
    carrier: "Naqel Express",
    awb: "AWB-2210-9931",
    dispatch: "2026-07-31",
    creditNote: "SAR 7,500",
    status: "Delivered",
  },
];

export interface Rework {
  id: string;
  ncr: string;
  material: string;
  qty: number;
  team: string;
  reason: string;
  due: string;
  progress: number;
  status: "Planned" | "In Progress" | "Completed" | "Re-Inspection";
}

export const reworks: Rework[] = [
  {
    id: "RWK-2026-00061",
    ncr: "NCR-2026-00318",
    material: "Gear Motor 5.5kW Helical",
    qty: 2,
    team: "Mechanical Workshop A",
    reason: "Keyway re-machining to drawing tolerance",
    due: "2026-08-05",
    progress: 45,
    status: "In Progress",
  },
  {
    id: "RWK-2026-00060",
    ncr: "NCR-2026-00317",
    material: "HDPE Pipe 315mm SDR17",
    qty: 6,
    team: "Fabrication Bay 2",
    reason: "End re-cut and re-bevel",
    due: "2026-08-03",
    progress: 100,
    status: "Re-Inspection",
  },
  {
    id: "RWK-2026-00058",
    ncr: "NCR-2026-00312",
    material: "Hydraulic Hose Assembly 1in",
    qty: 4,
    team: "Hydraulics Cell",
    reason: "Re-crimp coupling and pressure re-test",
    due: "2026-07-31",
    progress: 100,
    status: "Completed",
  },
];

export interface Scrap {
  id: string;
  ncr: string;
  material: string;
  qty: number;
  uom: string;
  reason: string;
  cost: number;
  approver: string;
  status: "Pending Approval" | "Approved" | "Disposed";
}

export const scraps: Scrap[] = [
  {
    id: "SCR-2026-00044",
    ncr: "NCR-2026-00317",
    material: "HDPE Pipe 315mm SDR17",
    qty: 18,
    uom: "LEN",
    reason: "Ovality >5%, unrepairable transit damage",
    cost: 14700,
    approver: "Layla Hassan (QM)",
    status: "Pending Approval",
  },
  {
    id: "SCR-2026-00043",
    ncr: "NCR-2026-00305",
    material: "Gasket Sheet CNAF 3mm",
    qty: 22,
    uom: "M2",
    reason: "Water damage, delamination",
    cost: 3300,
    approver: "Layla Hassan (QM)",
    status: "Approved",
  },
  {
    id: "SCR-2026-00041",
    ncr: "NCR-2026-00298",
    material: "Cable Gland M25 Brass",
    qty: 140,
    uom: "EA",
    reason: "Thread damage, wrong material grade",
    cost: 2100,
    approver: "Omar Siddiqui (WM)",
    status: "Disposed",
  },
];

export interface AuditEntry {
  id: string;
  user: string;
  role: string;
  action: string;
  object: string;
  timestamp: string;
  device: string;
  ip: string;
  changes: string;
}

export const auditTrail: AuditEntry[] = [
  {
    id: "A-90231",
    user: "Imran Qureshi",
    role: "Quality Inspector",
    action: "Inspection Started",
    object: "QI-2026-004821",
    timestamp: "2026-08-01 08:12:04",
    device: "Zebra TC58 (Android 14)",
    ip: "10.42.18.77",
    changes: "status: Assigned â†’ Inspection Started",
  },
  {
    id: "A-90230",
    user: "Layla Hassan",
    role: "Quality Manager",
    action: "NCR Approved",
    object: "NCR-2026-00318",
    timestamp: "2026-08-01 07:58:41",
    device: "Chrome 141 / Windows 11",
    ip: "10.42.9.14",
    changes: "disposition: Pending â†’ Return To Supplier",
  },
  {
    id: "A-90229",
    user: "Sara Al-Mutairi",
    role: "Quality Inspector",
    action: "Quality Hold Created",
    object: "QH-2026-00084",
    timestamp: "2026-08-01 05:10:22",
    device: "iPad Pro 12.9 / Safari",
    ip: "10.42.18.31",
    changes: "qty blocked: 5 M2 @ QA-HOLD-B3",
  },
  {
    id: "A-90228",
    user: "SYS.INTEGRATION",
    role: "System",
    action: "Inventory Posting",
    object: "QI-2026-004815",
    timestamp: "2026-07-31 22:04:10",
    device: "SAP IDoc WMMBID02",
    ip: "10.10.2.5",
    changes: "24 EA moved QA-STAGE â†’ A-12-04-B",
  },
  {
    id: "A-90227",
    user: "Omar Siddiqui",
    role: "Warehouse Manager",
    action: "Putaway Confirmed",
    object: "TO-771204",
    timestamp: "2026-07-31 21:47:55",
    device: "Honeywell CK65",
    ip: "10.42.20.9",
    changes: "bin: A-12-04-B, LPN: LPN-004421",
  },
  {
    id: "A-90226",
    user: "Imran Qureshi",
    role: "Quality Inspector",
    action: "Photo Evidence Uploaded",
    object: "QI-2026-004818",
    timestamp: "2026-07-31 15:22:09",
    device: "Zebra TC58 (Android 14)",
    ip: "10.42.18.77",
    changes: "6 files, 14.2 MB, geotagged DOCK-07",
  },
  {
    id: "A-90225",
    user: "Nordwerk Precision GmbH",
    role: "Vendor Portal",
    action: "Document Uploaded",
    object: "PO-4500091150",
    timestamp: "2026-07-30 09:40:12",
    device: "Chrome 140 / macOS",
    ip: "84.19.220.14",
    changes: "MTC EN 10204 3.1 (PDF, 2.1 MB)",
  },
];

export interface NotificationItem {
  id: string;
  type:
    | "Inspection Assigned"
    | "Inspection Completed"
    | "NCR Created"
    | "Quality Hold"
    | "RTS Created"
    | "Inventory Released";
  title: string;
  body: string;
  time: string;
  unread: boolean;
}

export const notifications: NotificationItem[] = [
  {
    id: "N-1",
    type: "Inspection Assigned",
    title: "QI-2026-004821 assigned to you",
    body: "Critical priority Â· SLA 4h Â· Nordwerk Precision GmbH Â· 480 EA",
    time: "12 min ago",
    unread: true,
  },
  {
    id: "N-2",
    type: "NCR Created",
    title: "NCR-2026-00318 raised",
    body: "Gear Motor 5.5kW â€” keyway oversize, 3 EA quarantined",
    time: "48 min ago",
    unread: true,
  },
  {
    id: "N-3",
    type: "Quality Hold",
    title: "QH-2026-00084 created",
    body: "EPDM Rubber Sheet 10mm â€” 5 M2 blocked at QA-HOLD-B3",
    time: "3 h ago",
    unread: true,
  },
  {
    id: "N-4",
    type: "RTS Created",
    title: "RTS-2026-00142 awaiting approval",
    body: "3 EA to Bearings & Drives International â€” SAR 36,000 credit",
    time: "5 h ago",
    unread: false,
  },
  {
    id: "N-5",
    type: "Inventory Released",
    title: "QI-2026-004815 released to inventory",
    body: "24 EA moved to A-12-04-B, WH-01 Dammam Central",
    time: "Yesterday",
    unread: false,
  },
  {
    id: "N-6",
    type: "Inspection Completed",
    title: "QI-2026-004812 completed",
    body: "300 EA passed â€” Sinar Safety Equipment",
    time: "2 days ago",
    unread: false,
  },
];

export const damageTypes = [
  "Broken / Cracked",
  "Scratched / Scored",
  "Missing Parts",
  "Wrong Material",
  "Water Damage",
  "Packaging Damage",
  "Transit Damage",
  "Corrosion / Rust",
];

export const photoEvidence = [
  {
    id: "P1",
    label: "Overall material",
    cat: "Overall",
    src: img("qm-overall"),
    tag: "DOCK-04 Â· 08:14",
  },
  {
    id: "P2",
    label: "Packaging condition",
    cat: "Packaging",
    src: img("qm-pack"),
    tag: "DOCK-04 Â· 08:15",
  },
  {
    id: "P3",
    label: "Damage close-up â€” keyway",
    cat: "Damage",
    src: img("qm-damage"),
    tag: "QA-BAY-2 Â· 08:22",
  },
  {
    id: "P4",
    label: "Vendor label",
    cat: "Labels",
    src: img("qm-label"),
    tag: "QA-BAY-2 Â· 08:24",
  },
  {
    id: "P5",
    label: "Serial plate",
    cat: "Serial Plate",
    src: img("qm-serial"),
    tag: "QA-BAY-2 Â· 08:25",
  },
  {
    id: "P6",
    label: "Batch marking",
    cat: "Labels",
    src: img("qm-batch"),
    tag: "QA-BAY-2 Â· 08:26",
  },
];

export const inspectorPerformance = [
  { name: "Imran Qureshi", inspections: 128, avgMin: 42, passRate: 91, ncr: 9 },
  { name: "Sara Al-Mutairi", inspections: 116, avgMin: 38, passRate: 94, ncr: 6 },
  { name: "Faisal Bin Omar", inspections: 97, avgMin: 51, passRate: 88, ncr: 11 },
  { name: "Nadia Farouk", inspections: 74, avgMin: 45, passRate: 93, ncr: 4 },
];

export const vendorScores = [
  { vendor: "Nordwerk Precision GmbH", score: 96, lots: 84, rejects: 3, otd: 98, ncr: 2 },
  { vendor: "Al-Rashid Industrial Supplies", score: 88, lots: 132, rejects: 12, otd: 91, ncr: 6 },
  { vendor: "Shenzhen Volt Components Ltd", score: 79, lots: 66, rejects: 14, otd: 84, ncr: 9 },
  { vendor: "Gulf Polymer Trading Co.", score: 72, lots: 58, rejects: 18, otd: 77, ncr: 11 },
  { vendor: "Bearings & Drives International", score: 68, lots: 41, rejects: 16, otd: 81, ncr: 13 },
  { vendor: "Sinar Safety Equipment", score: 90, lots: 73, rejects: 5, otd: 95, ncr: 3 },
];

export const topDefects = [
  { defect: "Transit damage", count: 42 },
  { defect: "Dimensional deviation", count: 31 },
  { defect: "Documentation missing", count: 27 },
  { defect: "Surface / coating defect", count: 22 },
  { defect: "Wrong material / part", count: 15 },
  { defect: "Packaging damage", count: 12 },
];

export const trend7d = [
  { day: "Jul 26", passed: 38, failed: 4, hold: 2 },
  { day: "Jul 27", passed: 42, failed: 6, hold: 3 },
  { day: "Jul 28", passed: 35, failed: 3, hold: 1 },
  { day: "Jul 29", passed: 48, failed: 7, hold: 4 },
  { day: "Jul 30", passed: 51, failed: 5, hold: 2 },
  { day: "Jul 31", passed: 44, failed: 9, hold: 5 },
  { day: "Aug 01", passed: 29, failed: 4, hold: 3 },
];

export const recentActivity = [
  { time: "08:12", text: "Imran Qureshi started inspection QI-2026-004821", tone: "info" as const },
  {
    time: "07:58",
    text: "Layla Hassan approved NCR-2026-00318 disposition: RTS",
    tone: "danger" as const,
  },
  {
    time: "07:20",
    text: "QI-2026-004822 sampling plan set to AQL 1.0 Level II",
    tone: "info" as const,
  },
  {
    time: "05:10",
    text: "Quality Hold QH-2026-00084 created (5 M2 EPDM)",
    tone: "warning" as const,
  },
  {
    time: "Yesterday",
    text: "QI-2026-004815 released â€” 24 EA to bin A-12-04-B",
    tone: "success" as const,
  },
  {
    time: "Yesterday",
    text: "RTS-2026-00141 dispatched via DHL AWB-4471-8823",
    tone: "danger" as const,
  },
];

export const roles = [
  "Quality Inspector",
  "Quality Manager",
  "Warehouse Manager",
  "Store Keeper",
  "Procurement Manager",
  "Vendor",
  "Administrator",
];

export const warehouses = ["WH-01 Dammam Central", "WH-02 Jubail Spares", "WH-03 Yanbu Bulk"];
