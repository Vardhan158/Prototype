/** Realistic seed data for the Goods Receiving & GRN Management module. */

export type ReceivingStatus =
  | "Waiting"
  | "Dock Assigned"
  | "Receiving Started"
  | "Scanning"
  | "Verification"
  | "Partial Receipt"
  | "Discrepancy"
  | "GRN Generated"
  | "Transferred To Quality"
  | "Completed"
  | "Rejected"
  | "On Hold";

export type Priority = "Critical" | "High" | "Normal" | "Low";

export interface MaterialLine {
  id: string;
  code: string;
  name: string;
  uom: string;
  expected: number;
  received: number;
  accepted: number;
  rejected: number;
  damaged: number;
  batchManaged: boolean;
  serialManaged: boolean;
  unitPrice: number;
  hsn: string;
  storageCondition: string;
}

export interface TimelineEvent {
  at: string;
  label: string;
  actor: string;
  note?: string;
}

export interface Shipment {
  id: string;
  truckNo: string;
  driver: string;
  driverPhone: string;
  transporter: string;
  vendor: string;
  vendorCode: string;
  po: string;
  poValue: number;
  asn: string;
  gateEntry: string;
  dock: string | null;
  arrival: string;
  appointment: string;
  priority: Priority;
  status: ReceivingStatus;
  warehouse: string;
  sealNo: string;
  vehicleWeight: string;
  pallets: number;
  cartons: number;
  boxes: number;
  lines: MaterialLine[];
  timeline: TimelineEvent[];
  grn?: string;
  documents: { name: string; type: string; size: string }[];
}

export const WAREHOUSES = [
  { code: "WH-NCR-01", name: "Bhiwandi Central DC" },
  { code: "WH-CHN-02", name: "Chennai Port Warehouse" },
  { code: "WH-PUN-03", name: "Chakan Industrial Hub" },
];

export const DOCKS = [
  {
    id: "D-01",
    zone: "Inbound North",
    type: "Container",
    capacity: 2,
    occupied: 2,
    status: "Occupied",
    temp: "Ambient",
  },
  {
    id: "D-02",
    zone: "Inbound North",
    type: "Container",
    capacity: 2,
    occupied: 1,
    status: "Partially Free",
    temp: "Ambient",
  },
  {
    id: "D-03",
    zone: "Inbound North",
    type: "Standard",
    capacity: 1,
    occupied: 0,
    status: "Available",
    temp: "Ambient",
  },
  {
    id: "D-04",
    zone: "Inbound East",
    type: "Standard",
    capacity: 1,
    occupied: 1,
    status: "Occupied",
    temp: "Ambient",
  },
  {
    id: "D-05",
    zone: "Inbound East",
    type: "Reefer",
    capacity: 1,
    occupied: 0,
    status: "Available",
    temp: "2-8 Â°C",
  },
  {
    id: "D-06",
    zone: "Inbound East",
    type: "Reefer",
    capacity: 1,
    occupied: 0,
    status: "Maintenance",
    temp: "2-8 Â°C",
  },
  {
    id: "D-07",
    zone: "Inbound South",
    type: "Standard",
    capacity: 2,
    occupied: 1,
    status: "Partially Free",
    temp: "Ambient",
  },
  {
    id: "D-08",
    zone: "Inbound South",
    type: "Hazmat",
    capacity: 1,
    occupied: 0,
    status: "Available",
    temp: "Ventilated",
  },
  {
    id: "D-09",
    zone: "Inbound South",
    type: "Standard",
    capacity: 1,
    occupied: 1,
    status: "Occupied",
    temp: "Ambient",
  },
  {
    id: "D-10",
    zone: "Cross Dock",
    type: "Standard",
    capacity: 2,
    occupied: 0,
    status: "Available",
    temp: "Ambient",
  },
];

const line = (
  id: string,
  code: string,
  name: string,
  uom: string,
  expected: number,
  received: number,
  opts: Partial<MaterialLine> = {},
): MaterialLine => ({
  id,
  code,
  name,
  uom,
  expected,
  received,
  accepted: opts.accepted ?? received,
  rejected: opts.rejected ?? 0,
  damaged: opts.damaged ?? 0,
  batchManaged: opts.batchManaged ?? false,
  serialManaged: opts.serialManaged ?? false,
  unitPrice: opts.unitPrice ?? 1200,
  hsn: opts.hsn ?? "84819090",
  storageCondition: opts.storageCondition ?? "Ambient Â· Dry",
});

export const SHIPMENTS: Shipment[] = [
  {
    id: "SHP-100241",
    truckNo: "MH-04-KL-8821",
    driver: "Ramesh Yadav",
    driverPhone: "+91 98204 41122",
    transporter: "Gati Kintetsu Express",
    vendor: "Bosch Rexroth India Ltd.",
    vendorCode: "V-10042",
    po: "PO-2026-004718",
    poValue: 4820000,
    asn: "ASN-88213",
    gateEntry: "GE-2026-01187",
    dock: "D-01",
    arrival: "2026-08-01 06:42",
    appointment: "2026-08-01 07:00",
    priority: "Critical",
    status: "Receiving Started",
    warehouse: "WH-NCR-01",
    sealNo: "SL-778213",
    vehicleWeight: "18.4 T gross / 9.2 T tare",
    pallets: 12,
    cartons: 96,
    boxes: 384,
    lines: [
      line("L1", "MAT-HYD-4421", "Hydraulic Servo Valve 4WRPEH", "EA", 240, 236, {
        serialManaged: true,
        unitPrice: 8450,
      }),
      line("L2", "MAT-SEA-1180", "Viton O-Ring Seal Kit 180mm", "SET", 600, 600, {
        batchManaged: true,
        unitPrice: 420,
      }),
      line("L3", "MAT-PMP-3390", "Axial Piston Pump A10VSO", "EA", 40, 38, {
        serialManaged: true,
        unitPrice: 62500,
        damaged: 2,
      }),
    ],
    timeline: [
      { at: "06:12", label: "Gate entry recorded", actor: "Security Â· Anil Kumar" },
      { at: "06:42", label: "Truck accepted at yard", actor: "Warehouse Manager Â· Priya Nair" },
      { at: "06:55", label: "Dock D-01 assigned", actor: "System Â· Auto-allocation" },
      { at: "07:08", label: "Receiving started", actor: "Receiving Operator Â· Suresh M." },
    ],
    documents: [
      { name: "Invoice_BR-2026-88213.pdf", type: "Tax Invoice", size: "412 KB" },
      { name: "Packing_List_ASN88213.pdf", type: "Packing List", size: "188 KB" },
      { name: "EWayBill_331002884.pdf", type: "E-Way Bill", size: "96 KB" },
    ],
  },
  {
    id: "SHP-100242",
    truckNo: "TN-38-BQ-4407",
    driver: "Karthik Subramanian",
    driverPhone: "+91 90031 77450",
    transporter: "TCI Freight",
    vendor: "Schneider Electric India Pvt. Ltd.",
    vendorCode: "V-10188",
    po: "PO-2026-004802",
    poValue: 2310000,
    asn: "ASN-88301",
    gateEntry: "GE-2026-01191",
    dock: "D-04",
    arrival: "2026-08-01 07:20",
    appointment: "2026-08-01 07:30",
    priority: "High",
    status: "Scanning",
    warehouse: "WH-CHN-02",
    sealNo: "SL-778344",
    vehicleWeight: "12.1 T gross / 6.8 T tare",
    pallets: 8,
    cartons: 64,
    boxes: 256,
    lines: [
      line("L1", "MAT-CB-2201", "Compact NSX160F MCCB 3P", "EA", 120, 120, {
        serialManaged: true,
        unitPrice: 14200,
      }),
      line("L2", "MAT-CT-7714", "TeSys D Contactor LC1D80", "EA", 300, 288, { unitPrice: 5100 }),
    ],
    timeline: [
      { at: "07:02", label: "Gate entry recorded", actor: "Security Â· Vetri S." },
      { at: "07:20", label: "Truck accepted at yard", actor: "Warehouse Manager Â· Priya Nair" },
      { at: "07:34", label: "Dock D-04 assigned", actor: "Store Keeper Â· Ganesh R." },
      {
        at: "07:51",
        label: "Barcode scanning in progress",
        actor: "Receiving Operator Â· Deepa V.",
      },
    ],
    documents: [
      { name: "Invoice_SE-4471192.pdf", type: "Tax Invoice", size: "356 KB" },
      { name: "ASN_88301.xml", type: "ASN Feed", size: "24 KB" },
    ],
  },
  {
    id: "SHP-100243",
    truckNo: "GJ-01-JT-9932",
    driver: "Imran Shaikh",
    driverPhone: "+91 99251 30887",
    transporter: "VRL Logistics",
    vendor: "Cipla Pharmaceuticals Ltd.",
    vendorCode: "V-10233",
    po: "PO-2026-004833",
    poValue: 1875000,
    asn: "ASN-88344",
    gateEntry: "GE-2026-01196",
    dock: null,
    arrival: "2026-08-01 08:05",
    appointment: "2026-08-01 08:00",
    priority: "Critical",
    status: "Waiting",
    warehouse: "WH-NCR-01",
    sealNo: "SL-778401",
    vehicleWeight: "9.6 T gross / 5.4 T tare",
    pallets: 6,
    cartons: 120,
    boxes: 720,
    lines: [
      line("L1", "MAT-PHR-5510", "Azithromycin 500mg Tablets", "BOX", 900, 0, {
        batchManaged: true,
        unitPrice: 780,
        storageCondition: "2-8 Â°C Cold Chain",
      }),
      line("L2", "MAT-PHR-5512", "Salbutamol Inhaler 100mcg", "BOX", 400, 0, {
        batchManaged: true,
        unitPrice: 1240,
        storageCondition: "2-8 Â°C Cold Chain",
      }),
    ],
    timeline: [
      { at: "07:48", label: "Gate entry recorded", actor: "Security Â· Anil Kumar" },
      { at: "08:05", label: "Waiting for reefer dock", actor: "System Â· Yard Queue" },
    ],
    documents: [{ name: "Invoice_CIP-99120.pdf", type: "Tax Invoice", size: "298 KB" }],
  },
  {
    id: "SHP-100244",
    truckNo: "KA-51-AE-2210",
    driver: "Mahesh Gowda",
    driverPhone: "+91 97400 22119",
    transporter: "Safexpress",
    vendor: "SKF India Ltd.",
    vendorCode: "V-10077",
    po: "PO-2026-004690",
    poValue: 985000,
    asn: "ASN-88190",
    gateEntry: "GE-2026-01180",
    dock: "D-07",
    arrival: "2026-08-01 05:55",
    appointment: "2026-08-01 06:00",
    priority: "Normal",
    status: "Discrepancy",
    warehouse: "WH-PUN-03",
    sealNo: "SL-778190",
    vehicleWeight: "7.2 T gross / 4.1 T tare",
    pallets: 4,
    cartons: 40,
    boxes: 160,
    lines: [
      line("L1", "MAT-BRG-6205", "Deep Groove Ball Bearing 6205-2RS", "EA", 2000, 1840, {
        unitPrice: 310,
        damaged: 40,
        accepted: 1800,
      }),
      line("L2", "MAT-BRG-2210", "Self-Aligning Bearing 2210 ETN9", "EA", 500, 540, {
        unitPrice: 890,
      }),
    ],
    timeline: [
      { at: "05:40", label: "Gate entry recorded", actor: "Security Â· Ravi P." },
      { at: "06:10", label: "Dock D-07 assigned", actor: "System Â· Auto-allocation" },
      { at: "06:25", label: "Receiving started", actor: "Receiving Operator Â· Sandeep K." },
      {
        at: "07:14",
        label: "Short quantity flagged on MAT-BRG-6205",
        actor: "Store Keeper Â· Ganesh R.",
      },
      {
        at: "07:22",
        label: "Excess quantity flagged on MAT-BRG-2210",
        actor: "Store Keeper Â· Ganesh R.",
      },
    ],
    documents: [
      { name: "Invoice_SKF-771290.pdf", type: "Tax Invoice", size: "204 KB" },
      { name: "Damage_Report_88190.pdf", type: "Damage Report", size: "1.2 MB" },
    ],
  },
  {
    id: "SHP-100245",
    truckNo: "DL-1L-AC-7788",
    driver: "Sukhwinder Singh",
    driverPhone: "+91 98111 60034",
    transporter: "Delhivery Freight",
    vendor: "Havells India Ltd.",
    vendorCode: "V-10310",
    po: "PO-2026-004744",
    poValue: 1560000,
    asn: "ASN-88240",
    gateEntry: "GE-2026-01184",
    dock: "D-09",
    arrival: "2026-07-31 16:10",
    appointment: "2026-07-31 16:00",
    priority: "Normal",
    status: "GRN Generated",
    warehouse: "WH-NCR-01",
    sealNo: "SL-778240",
    vehicleWeight: "11.0 T gross / 6.0 T tare",
    pallets: 9,
    cartons: 72,
    boxes: 288,
    grn: "GRN-2026-002187",
    lines: [
      line("L1", "MAT-CBL-1100", "FR-LSH Copper Cable 4 sq.mm", "COIL", 300, 300, {
        batchManaged: true,
        unitPrice: 4300,
      }),
      line("L2", "MAT-SWT-2280", "Modular Switch 16A Crabtree", "EA", 1200, 1200, {
        unitPrice: 210,
      }),
    ],
    timeline: [
      { at: "16:10", label: "Truck accepted at yard", actor: "Warehouse Manager Â· Priya Nair" },
      { at: "16:28", label: "Dock D-09 assigned", actor: "System Â· Auto-allocation" },
      { at: "17:40", label: "Verification completed", actor: "Receiving Operator Â· Suresh M." },
      { at: "18:02", label: "GRN-2026-002187 generated", actor: "Store Keeper Â· Ganesh R." },
    ],
    documents: [{ name: "GRN-2026-002187.pdf", type: "GRN", size: "512 KB" }],
  },
  {
    id: "SHP-100246",
    truckNo: "RJ-14-GH-5521",
    driver: "Naresh Meena",
    driverPhone: "+91 94140 88221",
    transporter: "Blue Dart Aviation",
    vendor: "Siemens Ltd. â€” Industrial Automation",
    vendorCode: "V-10009",
    po: "PO-2026-004601",
    poValue: 7420000,
    asn: "ASN-88104",
    gateEntry: "GE-2026-01172",
    dock: "D-02",
    arrival: "2026-07-31 11:05",
    appointment: "2026-07-31 11:00",
    priority: "High",
    status: "Transferred To Quality",
    warehouse: "WH-PUN-03",
    sealNo: "SL-778104",
    vehicleWeight: "15.8 T gross / 8.1 T tare",
    pallets: 14,
    cartons: 110,
    boxes: 440,
    grn: "GRN-2026-002181",
    lines: [
      line("L1", "MAT-PLC-1500", "SIMATIC S7-1500 CPU 1516-3", "EA", 60, 60, {
        serialManaged: true,
        unitPrice: 118000,
      }),
      line("L2", "MAT-HMI-7700", "SIMATIC HMI TP1200 Comfort", "EA", 45, 45, {
        serialManaged: true,
        unitPrice: 96500,
      }),
    ],
    timeline: [
      { at: "11:05", label: "Truck accepted at yard", actor: "Warehouse Manager Â· Rakesh D." },
      { at: "13:20", label: "GRN-2026-002181 generated", actor: "Store Keeper Â· Meena T." },
      {
        at: "13:45",
        label: "Transferred to Quality Inspection",
        actor: "Inventory Manager Â· Alok J.",
      },
    ],
    documents: [{ name: "GRN-2026-002181.pdf", type: "GRN", size: "488 KB" }],
  },
  {
    id: "SHP-100247",
    truckNo: "UP-16-CT-3390",
    driver: "Vikas Tomar",
    driverPhone: "+91 98737 11220",
    transporter: "Rivigo",
    vendor: "Tata Steel Ltd. â€” Long Products",
    vendorCode: "V-10501",
    po: "PO-2026-004555",
    poValue: 9950000,
    asn: "ASN-88060",
    gateEntry: "GE-2026-01165",
    dock: "D-01",
    arrival: "2026-07-31 09:15",
    appointment: "2026-07-31 09:00",
    priority: "Low",
    status: "Completed",
    warehouse: "WH-NCR-01",
    sealNo: "SL-778060",
    vehicleWeight: "24.0 T gross / 11.4 T tare",
    pallets: 20,
    cartons: 0,
    boxes: 0,
    grn: "GRN-2026-002174",
    lines: [
      line("L1", "MAT-STL-4410", "TMT Rebar Fe550D 16mm", "MT", 60, 60, {
        batchManaged: true,
        unitPrice: 62000,
      }),
    ],
    timeline: [
      { at: "09:15", label: "Truck accepted at yard", actor: "Warehouse Manager Â· Priya Nair" },
      { at: "12:40", label: "GRN-2026-002174 generated", actor: "Store Keeper Â· Ganesh R." },
      {
        at: "14:10",
        label: "Inventory created Â· Zone A-BULK",
        actor: "System Â· Inventory Engine",
      },
    ],
    documents: [{ name: "MTC_TataSteel_88060.pdf", type: "Mill Test Certificate", size: "744 KB" }],
  },
  {
    id: "SHP-100248",
    truckNo: "HR-26-DK-1102",
    driver: "Balwant Rana",
    driverPhone: "+91 98991 44100",
    transporter: "Gati Kintetsu Express",
    vendor: "3M India Ltd.",
    vendorCode: "V-10412",
    po: "PO-2026-004811",
    poValue: 640000,
    asn: "ASN-88312",
    gateEntry: "GE-2026-01193",
    dock: null,
    arrival: "2026-08-01 08:40",
    appointment: "2026-08-01 09:15",
    priority: "Normal",
    status: "Waiting",
    warehouse: "WH-NCR-01",
    sealNo: "SL-778312",
    vehicleWeight: "6.4 T gross / 3.9 T tare",
    pallets: 5,
    cartons: 50,
    boxes: 200,
    lines: [
      line("L1", "MAT-ABR-8890", "Cubitron II Fibre Disc 982C", "BOX", 200, 0, { unitPrice: 3400 }),
      line("L2", "MAT-PPE-2211", "Safety Goggles GoggleGear 500", "EA", 800, 0, { unitPrice: 460 }),
    ],
    timeline: [{ at: "08:40", label: "Gate entry recorded", actor: "Security Â· Anil Kumar" }],
    documents: [{ name: "Invoice_3M-220118.pdf", type: "Tax Invoice", size: "176 KB" }],
  },
  {
    id: "SHP-100249",
    truckNo: "MH-12-PQ-6650",
    driver: "Sagar Pawar",
    driverPhone: "+91 98220 71100",
    transporter: "TCI Freight",
    vendor: "Grundfos Pumps India Pvt. Ltd.",
    vendorCode: "V-10620",
    po: "PO-2026-004777",
    poValue: 1290000,
    asn: "ASN-88277",
    gateEntry: "GE-2026-01189",
    dock: "D-07",
    arrival: "2026-08-01 07:55",
    appointment: "2026-08-01 08:00",
    priority: "High",
    status: "Partial Receipt",
    warehouse: "WH-PUN-03",
    sealNo: "SL-778277",
    vehicleWeight: "10.2 T gross / 5.9 T tare",
    pallets: 7,
    cartons: 28,
    boxes: 112,
    lines: [
      line("L1", "MAT-PMP-9910", "CR 15-3 Vertical Multistage Pump", "EA", 30, 18, {
        serialManaged: true,
        unitPrice: 42000,
      }),
      line("L2", "MAT-MTR-3320", "MGE Motor 5.5kW IE5", "EA", 30, 18, {
        serialManaged: true,
        unitPrice: 31000,
      }),
    ],
    timeline: [
      { at: "07:55", label: "Truck accepted at yard", actor: "Warehouse Manager Â· Rakesh D." },
      {
        at: "08:20",
        label: "Partial receipt initiated â€” 12 units short",
        actor: "Receiving Operator Â· Sandeep K.",
      },
    ],
    documents: [{ name: "Invoice_GFS-551120.pdf", type: "Tax Invoice", size: "232 KB" }],
  },
  {
    id: "SHP-100250",
    truckNo: "AP-39-TR-8080",
    driver: "Prakash Reddy",
    driverPhone: "+91 90000 55412",
    transporter: "VRL Logistics",
    vendor: "Ashok Leyland Spares Div.",
    vendorCode: "V-10744",
    po: "PO-2026-004520",
    poValue: 430000,
    asn: "ASN-88012",
    gateEntry: "GE-2026-01160",
    dock: null,
    arrival: "2026-07-30 15:30",
    appointment: "2026-07-30 15:00",
    priority: "Low",
    status: "Rejected",
    warehouse: "WH-CHN-02",
    sealNo: "SL-778012 (Broken)",
    vehicleWeight: "8.8 T gross / 5.0 T tare",
    pallets: 6,
    cartons: 30,
    boxes: 120,
    lines: [
      line("L1", "MAT-FLT-1120", "Oil Filter Element AL-4471", "EA", 1500, 0, { unitPrice: 340 }),
    ],
    timeline: [
      { at: "15:30", label: "Truck arrived", actor: "Security Â· Vetri S." },
      {
        at: "15:48",
        label: "Seal tampering detected â€” consignment rejected",
        actor: "Quality Inspection Â· Nisha B.",
      },
    ],
    documents: [{ name: "Rejection_Note_88012.pdf", type: "Rejection Note", size: "144 KB" }],
  },
];

export const SERIALS = [
  {
    serial: "SN-BR-4421-000118",
    material: "MAT-HYD-4421",
    status: "Verified",
    scannedAt: "07:24",
    by: "Suresh M.",
  },
  {
    serial: "SN-BR-4421-000119",
    material: "MAT-HYD-4421",
    status: "Verified",
    scannedAt: "07:24",
    by: "Suresh M.",
  },
  {
    serial: "SN-BR-4421-000120",
    material: "MAT-HYD-4421",
    status: "Duplicate",
    scannedAt: "07:25",
    by: "Suresh M.",
  },
  {
    serial: "SN-BR-4421-000121",
    material: "MAT-HYD-4421",
    status: "Verified",
    scannedAt: "07:25",
    by: "Suresh M.",
  },
  {
    serial: "SN-BR-3390-000042",
    material: "MAT-PMP-3390",
    status: "Not In ASN",
    scannedAt: "07:31",
    by: "Suresh M.",
  },
  {
    serial: "SN-BR-3390-000043",
    material: "MAT-PMP-3390",
    status: "Verified",
    scannedAt: "07:31",
    by: "Suresh M.",
  },
];

export const BATCHES = [
  {
    batch: "BR-2026-A1180",
    material: "MAT-SEA-1180",
    supplierBatch: "RX-SEAL-88213",
    mfg: "2026-05-12",
    exp: "2029-05-11",
    lot: "LOT-4471",
    qty: 600,
    status: "Valid",
  },
  {
    batch: "CIP-2026-AZ550",
    material: "MAT-PHR-5510",
    supplierBatch: "AZ-5510-2604",
    mfg: "2026-04-02",
    exp: "2026-10-01",
    lot: "LOT-9921",
    qty: 900,
    status: "Near Expiry",
  },
  {
    batch: "HAV-2026-CBL11",
    material: "MAT-CBL-1100",
    supplierBatch: "HV-CU-77120",
    mfg: "2026-06-20",
    exp: "2031-06-19",
    lot: "LOT-1188",
    qty: 300,
    status: "Valid",
  },
];

export const GRNS = [
  {
    grn: "GRN-2026-002187",
    shipment: "SHP-100245",
    vendor: "Havells India Ltd.",
    po: "PO-2026-004744",
    warehouse: "WH-NCR-01",
    date: "2026-07-31",
    lines: 2,
    qty: 1500,
    value: 1560000,
    status: "Pending Inspection",
  },
  {
    grn: "GRN-2026-002181",
    shipment: "SHP-100246",
    vendor: "Siemens Ltd.",
    po: "PO-2026-004601",
    warehouse: "WH-PUN-03",
    date: "2026-07-31",
    lines: 2,
    qty: 105,
    value: 7420000,
    status: "In Inspection",
  },
  {
    grn: "GRN-2026-002174",
    shipment: "SHP-100247",
    vendor: "Tata Steel Ltd.",
    po: "PO-2026-004555",
    warehouse: "WH-NCR-01",
    date: "2026-07-31",
    lines: 1,
    qty: 60,
    value: 9950000,
    status: "Posted",
  },
  {
    grn: "GRN-2026-002168",
    shipment: "SHP-100238",
    vendor: "ABB India Ltd.",
    po: "PO-2026-004498",
    warehouse: "WH-CHN-02",
    date: "2026-07-30",
    lines: 4,
    qty: 820,
    value: 3120000,
    status: "Posted",
  },
  {
    grn: "GRN-2026-002160",
    shipment: "SHP-100231",
    vendor: "Pidilite Industries Ltd.",
    po: "PO-2026-004410",
    warehouse: "WH-NCR-01",
    date: "2026-07-29",
    lines: 3,
    qty: 2400,
    value: 890000,
    status: "Posted",
  },
];

export const INVENTORY = [
  {
    id: "INV-88231",
    material: "MAT-CBL-1100",
    name: "FR-LSH Copper Cable 4 sq.mm",
    grn: "GRN-2026-002187",
    qty: 300,
    uom: "COIL",
    zone: "Zone B â€” Reels",
    location: "B-04-12",
    status: "Pending Put Away",
  },
  {
    id: "INV-88232",
    material: "MAT-SWT-2280",
    name: "Modular Switch 16A Crabtree",
    grn: "GRN-2026-002187",
    qty: 1200,
    uom: "EA",
    zone: "Zone C â€” Small Parts",
    location: "C-11-03",
    status: "Pending Put Away",
  },
  {
    id: "INV-88220",
    material: "MAT-STL-4410",
    name: "TMT Rebar Fe550D 16mm",
    grn: "GRN-2026-002174",
    qty: 60,
    uom: "MT",
    zone: "Zone A â€” Bulk Yard",
    location: "A-BULK-02",
    status: "Put Away Complete",
  },
  {
    id: "INV-88214",
    material: "MAT-PLC-1500",
    name: "SIMATIC S7-1500 CPU 1516-3",
    grn: "GRN-2026-002181",
    qty: 60,
    uom: "EA",
    zone: "QA Hold",
    location: "QA-STAGE-01",
    status: "Quality Hold",
  },
];

export const INSPECTIONS = [
  {
    id: "QI-4471",
    grn: "GRN-2026-002187",
    material: "MAT-CBL-1100",
    inspector: "Nisha Bhatt",
    priority: "High",
    due: "2026-08-01 14:00",
    status: "Assigned",
    sample: "AQL 2.5 Â· 32 units",
  },
  {
    id: "QI-4468",
    grn: "GRN-2026-002181",
    material: "MAT-PLC-1500",
    inspector: "Ajay Menon",
    priority: "Critical",
    due: "2026-08-01 11:00",
    status: "In Progress",
    sample: "100% functional test",
  },
  {
    id: "QI-4460",
    grn: "GRN-2026-002174",
    material: "MAT-STL-4410",
    inspector: "Nisha Bhatt",
    priority: "Normal",
    due: "2026-07-31 18:00",
    status: "Passed",
    sample: "MTC verification",
  },
];

export const AUDIT_LOGS = [
  {
    ts: "2026-08-01 08:12:44",
    user: "Suresh M. (Receiving Operator)",
    action: "SERIAL_SCAN_REJECTED",
    entity: "SHP-100241 / SN-BR-3390-000042",
    ip: "10.24.8.112",
    device: "Zebra TC58 Â· Android 13",
    change: "Serial not present in ASN-88213",
  },
  {
    ts: "2026-08-01 08:04:10",
    user: "Ganesh R. (Store Keeper)",
    action: "DISCREPANCY_RAISED",
    entity: "SHP-100244 / MAT-BRG-6205",
    ip: "10.24.8.61",
    device: "Chrome 141 Â· Windows 11",
    change: "Short qty 160 EA, damaged 40 EA",
  },
  {
    ts: "2026-08-01 07:51:02",
    user: "Deepa V. (Receiving Operator)",
    action: "BARCODE_BATCH_SCAN",
    entity: "SHP-100242",
    ip: "10.31.2.44",
    device: "Honeywell CT47 Â· Android 14",
    change: "288 of 300 units scanned",
  },
  {
    ts: "2026-08-01 07:08:19",
    user: "Suresh M. (Receiving Operator)",
    action: "RECEIVING_STARTED",
    entity: "SHP-100241",
    ip: "10.24.8.112",
    device: "Zebra TC58 Â· Android 13",
    change: "Status: Dock Assigned â†’ Receiving Started",
  },
  {
    ts: "2026-08-01 06:55:37",
    user: "System (Auto-allocation)",
    action: "DOCK_ASSIGNED",
    entity: "SHP-100241 â†’ D-01",
    ip: "10.0.0.4",
    device: "WMS Scheduler",
    change: "Dock D-01 reserved for 120 min",
  },
  {
    ts: "2026-07-31 18:02:55",
    user: "Ganesh R. (Store Keeper)",
    action: "GRN_GENERATED",
    entity: "GRN-2026-002187",
    ip: "10.24.8.61",
    device: "Chrome 141 Â· Windows 11",
    change: "1,500 units posted against PO-2026-004744",
  },
];

export const NOTIFICATIONS = [
  {
    id: "N1",
    type: "Discrepancy Found",
    title: "Short quantity on SHP-100244",
    body: "160 EA short + 40 EA damaged on MAT-BRG-6205. Approval required.",
    at: "8 min ago",
    severity: "destructive",
    read: false,
  },
  {
    id: "N2",
    type: "Receiving Started",
    title: "Receiving started for SHP-100241",
    body: "Bosch Rexroth Â· Dock D-01 Â· Operator Suresh M.",
    at: "34 min ago",
    severity: "info",
    read: false,
  },
  {
    id: "N3",
    type: "Partial Receipt",
    title: "Partial receipt on SHP-100249",
    body: "18 of 30 pumps received. Balance rescheduled to 04 Aug.",
    at: "52 min ago",
    severity: "warning",
    read: false,
  },
  {
    id: "N4",
    type: "GRN Generated",
    title: "GRN-2026-002187 created",
    body: "Havells India Â· 1,500 units Â· â‚¹15.6L posted.",
    at: "Yesterday 18:02",
    severity: "success",
    read: true,
  },
  {
    id: "N5",
    type: "Quality Inspection Assigned",
    title: "QI-4471 assigned to Nisha Bhatt",
    body: "AQL 2.5 sampling on 32 units. Due today 14:00.",
    at: "Yesterday 18:05",
    severity: "info",
    read: true,
  },
  {
    id: "N6",
    type: "Inventory Created",
    title: "Inventory created for GRN-2026-002174",
    body: "60 MT staged at A-BULK-02, pending put away.",
    at: "Yesterday 14:10",
    severity: "success",
    read: true,
  },
];

export const ACTIVITY = [
  {
    at: "08:12",
    actor: "Suresh M.",
    text: "Rejected serial SN-BR-3390-000042 â€” not in ASN",
    tone: "destructive",
  },
  {
    at: "08:04",
    actor: "Ganesh R.",
    text: "Raised discrepancy on SHP-100244 (SKF India)",
    tone: "warning",
  },
  {
    at: "07:51",
    actor: "Deepa V.",
    text: "Scanned 288 units on SHP-100242 (Schneider)",
    tone: "info",
  },
  { at: "07:34", actor: "Ganesh R.", text: "Assigned dock D-04 to TN-38-BQ-4407", tone: "info" },
  {
    at: "07:08",
    actor: "Suresh M.",
    text: "Started receiving for SHP-100241 (Bosch Rexroth)",
    tone: "success",
  },
  {
    at: "06:55",
    actor: "System",
    text: "Auto-allocated dock D-01 for MH-04-KL-8821",
    tone: "muted",
  },
];

export const HOURLY_RECEIPTS = [
  { hour: "06:00", receipts: 3, units: 420 },
  { hour: "08:00", receipts: 7, units: 1180 },
  { hour: "10:00", receipts: 11, units: 2040 },
  { hour: "12:00", receipts: 6, units: 890 },
  { hour: "14:00", receipts: 9, units: 1620 },
  { hour: "16:00", receipts: 12, units: 2310 },
  { hour: "18:00", receipts: 5, units: 760 },
];

export const VENDOR_PERFORMANCE = [
  { vendor: "Bosch Rexroth", otif: 96, variance: 1.2, receipts: 42 },
  { vendor: "Schneider", otif: 92, variance: 2.4, receipts: 38 },
  { vendor: "Siemens", otif: 98, variance: 0.6, receipts: 27 },
  { vendor: "SKF India", otif: 81, variance: 6.8, receipts: 31 },
  { vendor: "Havells", otif: 94, variance: 1.9, receipts: 24 },
];

export const STATUS_TONE: Record<string, string> = {
  Waiting: "muted",
  "Dock Assigned": "info",
  "Receiving Started": "info",
  Scanning: "info",
  Verification: "warning",
  "Partial Receipt": "warning",
  Discrepancy: "destructive",
  "GRN Generated": "success",
  "Transferred To Quality": "accent",
  Completed: "success",
  Rejected: "destructive",
  "On Hold": "warning",
};

export const currency = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

export const compactCurrency = (n: number) =>
  n >= 10000000 ? `â‚¹${(n / 10000000).toFixed(2)} Cr` : `â‚¹${(n / 100000).toFixed(1)} L`;
