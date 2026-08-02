// Realistic mock master data for the Outbound Fulfillment & Wave Management module.

export type OrderStatus =
  | "Created"
  | "Inventory Reserved"
  | "Ready"
  | "Wave Assigned"
  | "Picking"
  | "Picked"
  | "Packing"
  | "Packed"
  | "Quality Verified"
  | "Staged"
  | "Loaded"
  | "Dispatched"
  | "Delivered"
  | "Cancelled"
  | "Exception";

export type Priority = "Critical" | "High" | "Medium" | "Low";

export interface OrderLine {
  lineNo: number;
  material: string;
  description: string;
  batch: string;
  serial?: string | undefined;
  uom: string;
  qtyOrdered: number;
  qtyPicked: number;
  bin: string;
  zone: string;
  weightKg: number;
}

export interface OutboundOrder {
  id: string;
  salesOrder: string;
  customer: string;
  customerCode: string;
  warehouse: string;
  priority: Priority;
  status: OrderStatus;
  createdAt: string;
  deliveryDate: string;
  dispatchWindow: string;
  carrier: string;
  incoterm: string;
  shippingAddress: string;
  contact: string;
  wave?: string;
  lines: OrderLine[];
  documents: { name: string; type: string; size: string; date: string }[];
  timeline: { label: string; at: string; by: string; done: boolean }[];
}

export interface Wave {
  id: string;
  warehouse: string;
  strategy:
    "Auto â€” Zone Batch" | "Auto â€” Carrier Cutoff" | "Manual" | "Auto â€” Priority Sweep";
  orders: string[];
  totalItems: number;
  totalLines: number;
  priority: Priority;
  dispatchWindow: string;
  assignedPickers: string[];
  status: "Draft" | "Pending Approval" | "Approved" | "Released" | "In Progress" | "Completed";
  progress: number;
  estimatedCompletion: string;
  createdBy: string;
  createdAt: string;
  travelMeters: number;
  optimizedMeters: number;
}

export interface PickTask {
  id: string;
  wave: string;
  order: string;
  picker: string;
  status: "Queued" | "Assigned" | "In Progress" | "Paused" | "Completed" | "Exception";
  zone: string;
  aisle: string;
  rack: string;
  shelf: string;
  bin: string;
  material: string;
  description: string;
  batch: string;
  serial: string;
  qty: number;
  picked: number;
  uom: string;
  barcode: string;
  startedAt?: string | undefined;
  etaMin: number;
}

export const warehouses = [
  { code: "DC-01", name: "Rotterdam Distribution Centre" },
  { code: "DC-04", name: "Memphis National Hub" },
  { code: "DC-07", name: "Singapore Jurong Node" },
];

export const roles = [
  "Warehouse Manager",
  "Outbound Supervisor",
  "Store Keeper",
  "Picker",
  "Packer",
  "Dispatch Coordinator",
  "Logistics Manager",
];

const addr = {
  nl: "Kruisweg 812, 2132 CA Hoofddorp, Netherlands",
  us: "1400 Getwell Rd, Memphis, TN 38111, USA",
  sg: "18 Pioneer Crescent, 628555, Singapore",
  de: "Am Handelspark 4, 41460 Neuss, Germany",
  es: "Zona Industrial Norte 22, 08820 Barcelona, Spain",
};

function line(
  lineNo: number,
  material: string,
  description: string,
  qty: number,
  picked: number,
  bin: string,
  zone: string,
  weightKg: number,
  uom = "EA",
): OrderLine {
  return {
    lineNo,
    material,
    description,
    batch: `B${2026000 + lineNo * 7}`,
    serial: lineNo % 3 === 0 ? `SN-${9000 + lineNo * 13}` : undefined,
    uom,
    qtyOrdered: qty,
    qtyPicked: picked,
    bin,
    zone,
    weightKg,
  };
}

const baseTimeline = (upto: number) =>
  [
    "Order Created",
    "Inventory Reserved",
    "Order Ready",
    "Wave Created",
    "Wave Approved",
    "Wave Released",
    "Picking",
    "Picked",
    "Packing",
    "Packed",
    "Quality Verified",
    "Staged",
    "Loaded",
    "Dispatched",
    "Delivered",
  ].map((label, i) => ({
    label,
    at: i <= upto ? `18 Mar Â· ${String(6 + i).padStart(2, "0")}:${(i * 7) % 60 || "05"}` : "â€”",
    by:
      i <= upto ? (["A. Vermeer", "S. Okafor", "M. Duarte", "L. Chen"][i % 4] ?? "System") : "â€”",
    done: i <= upto,
  }));

export const orders: OutboundOrder[] = [
  {
    id: "OB-2026-104871",
    salesOrder: "SO-88213",
    customer: "Continental Retail Group",
    customerCode: "CUST-10233",
    warehouse: "DC-01",
    priority: "Critical",
    status: "Picking",
    createdAt: "18 Mar 2026 Â· 06:12",
    deliveryDate: "20 Mar 2026",
    dispatchWindow: "18 Mar Â· 16:00â€“18:00",
    carrier: "DHL Freight",
    incoterm: "DAP",
    shippingAddress: addr.nl,
    contact: "Marloes de Vries Â· +31 20 555 8841",
    wave: "WV-2026-0442",
    lines: [
      line(
        1,
        "MAT-449021",
        "Industrial Bearing Assembly 60mm",
        240,
        180,
        "A-04-12-B3",
        "Zone A",
        1.4,
      ),
      line(2, "MAT-118734", "Hydraulic Seal Kit HK-200", 120, 120, "A-06-03-C1", "Zone A", 0.6),
      line(3, "MAT-771205", "Steel Chain Link 12mm (10m)", 60, 20, "C-02-08-A2", "Zone C", 8.2),
      line(4, "MAT-330918", "Conveyor Roller 800mm", 45, 0, "D-01-05-B1", "Zone D", 5.5),
    ],
    documents: [
      {
        name: "Sales_Order_SO-88213.pdf",
        type: "Sales Order",
        size: "184 KB",
        date: "18 Mar 2026",
      },
      {
        name: "Packing_Instructions_CRG.pdf",
        type: "Instruction",
        size: "96 KB",
        date: "18 Mar 2026",
      },
      { name: "Customs_Declaration_EU.pdf", type: "Customs", size: "212 KB", date: "18 Mar 2026" },
    ],
    timeline: baseTimeline(6),
  },
  {
    id: "OB-2026-104872",
    salesOrder: "SO-88219",
    customer: "Nordwind Industrie AG",
    customerCode: "CUST-10981",
    warehouse: "DC-01",
    priority: "High",
    status: "Packed",
    createdAt: "18 Mar 2026 Â· 06:30",
    deliveryDate: "19 Mar 2026",
    dispatchWindow: "18 Mar Â· 14:00â€“15:30",
    carrier: "Kuehne+Nagel",
    incoterm: "FCA",
    shippingAddress: addr.de,
    contact: "Jonas Behrend Â· +49 2131 449 202",
    wave: "WV-2026-0442",
    lines: [
      line(1, "MAT-556010", "Pneumatic Valve Block V4", 80, 80, "B-03-02-A4", "Zone B", 2.1),
      line(2, "MAT-556011", "Valve Repair Kit V4", 80, 80, "B-03-02-A5", "Zone B", 0.3),
    ],
    documents: [
      {
        name: "Sales_Order_SO-88219.pdf",
        type: "Sales Order",
        size: "162 KB",
        date: "18 Mar 2026",
      },
      {
        name: "Delivery_Note_DN-40122.pdf",
        type: "Delivery Note",
        size: "88 KB",
        date: "18 Mar 2026",
      },
    ],
    timeline: baseTimeline(9),
  },
  {
    id: "OB-2026-104873",
    salesOrder: "SO-88230",
    customer: "Pacifica Marine Supplies",
    customerCode: "CUST-11402",
    warehouse: "DC-07",
    priority: "Medium",
    status: "Ready",
    createdAt: "18 Mar 2026 Â· 07:02",
    deliveryDate: "22 Mar 2026",
    dispatchWindow: "19 Mar Â· 09:00â€“11:00",
    carrier: "Maersk Logistics",
    incoterm: "CIF",
    shippingAddress: addr.sg,
    contact: "Wei Lin Tan Â· +65 6555 2210",
    lines: [
      line(1, "MAT-901233", "Marine Grade Rope 24mm (50m)", 30, 0, "E-05-01-A1", "Zone E", 14.0),
      line(2, "MAT-901288", "Stainless Shackle 16mm", 400, 0, "E-05-04-C2", "Zone E", 0.4),
      line(3, "MAT-771205", "Steel Chain Link 12mm (10m)", 75, 0, "C-02-08-A2", "Zone C", 8.2),
    ],
    documents: [
      {
        name: "Sales_Order_SO-88230.pdf",
        type: "Sales Order",
        size: "155 KB",
        date: "18 Mar 2026",
      },
    ],
    timeline: baseTimeline(2),
  },
  {
    id: "OB-2026-104874",
    salesOrder: "SO-88241",
    customer: "Atlas Automotive Parts",
    customerCode: "CUST-10088",
    warehouse: "DC-04",
    priority: "High",
    status: "Dispatched",
    createdAt: "17 Mar 2026 Â· 15:48",
    deliveryDate: "19 Mar 2026",
    dispatchWindow: "18 Mar Â· 08:00â€“09:00",
    carrier: "FedEx Freight",
    incoterm: "EXW",
    shippingAddress: addr.us,
    contact: "Derrick Hall Â· +1 901 555 0132",
    wave: "WV-2026-0439",
    lines: [
      line(1, "MAT-220145", "Brake Rotor 320mm", 160, 160, "A-01-02-B2", "Zone A", 6.8),
      line(2, "MAT-220188", "Brake Pad Set Ceramic", 320, 320, "A-01-03-B1", "Zone A", 1.2),
    ],
    documents: [
      { name: "Bill_Of_Lading_BOL-77120.pdf", type: "BOL", size: "203 KB", date: "18 Mar 2026" },
      { name: "Proof_Of_Dispatch.pdf", type: "POD", size: "140 KB", date: "18 Mar 2026" },
    ],
    timeline: baseTimeline(13),
  },
  {
    id: "OB-2026-104875",
    salesOrder: "SO-88250",
    customer: "Iberia Construcciones SL",
    customerCode: "CUST-12277",
    warehouse: "DC-01",
    priority: "Low",
    status: "Created",
    createdAt: "18 Mar 2026 Â· 08:41",
    deliveryDate: "25 Mar 2026",
    dispatchWindow: "21 Mar Â· 13:00â€“16:00",
    carrier: "DSV Road",
    incoterm: "DAP",
    shippingAddress: addr.es,
    contact: "Nuria Sanz Â· +34 93 555 7712",
    lines: [
      line(1, "MAT-660412", "Scaffold Coupler Forged", 900, 0, "F-02-06-A3", "Zone F", 0.9),
      line(2, "MAT-660430", "Base Jack 600mm", 220, 0, "F-02-07-A1", "Zone F", 3.4),
    ],
    documents: [
      {
        name: "Sales_Order_SO-88250.pdf",
        type: "Sales Order",
        size: "149 KB",
        date: "18 Mar 2026",
      },
    ],
    timeline: baseTimeline(0),
  },
  {
    id: "OB-2026-104876",
    salesOrder: "SO-88255",
    customer: "Continental Retail Group",
    customerCode: "CUST-10233",
    warehouse: "DC-01",
    priority: "Critical",
    status: "Exception",
    createdAt: "18 Mar 2026 Â· 09:05",
    deliveryDate: "19 Mar 2026",
    dispatchWindow: "18 Mar Â· 17:00â€“18:30",
    carrier: "DHL Freight",
    incoterm: "DAP",
    shippingAddress: addr.nl,
    contact: "Marloes de Vries Â· +31 20 555 8841",
    wave: "WV-2026-0443",
    lines: [
      line(
        1,
        "MAT-449021",
        "Industrial Bearing Assembly 60mm",
        500,
        310,
        "A-04-12-B3",
        "Zone A",
        1.4,
      ),
    ],
    documents: [
      {
        name: "Shortage_Report_SR-2210.pdf",
        type: "Exception",
        size: "72 KB",
        date: "18 Mar 2026",
      },
    ],
    timeline: baseTimeline(6),
  },
  {
    id: "OB-2026-104877",
    salesOrder: "SO-88261",
    customer: "Helvetia Medical Devices",
    customerCode: "CUST-13001",
    warehouse: "DC-01",
    priority: "High",
    status: "Staged",
    createdAt: "18 Mar 2026 Â· 05:22",
    deliveryDate: "18 Mar 2026",
    dispatchWindow: "18 Mar Â· 12:00â€“13:00",
    carrier: "Swiss Post Logistics",
    incoterm: "DDP",
    shippingAddress: "Industriestrasse 9, 8604 Volketswil, Switzerland",
    contact: "Anja Furrer Â· +41 44 555 1188",
    wave: "WV-2026-0441",
    lines: [
      line(1, "MAT-505221", "Sterile Tubing Set 3m", 600, 600, "B-07-01-A1", "Zone B", 0.2),
      line(2, "MAT-505240", "Infusion Pump Cassette", 300, 300, "B-07-02-A2", "Zone B", 0.4),
    ],
    documents: [
      { name: "GDP_Compliance_Cert.pdf", type: "Compliance", size: "118 KB", date: "18 Mar 2026" },
    ],
    timeline: baseTimeline(11),
  },
  {
    id: "OB-2026-104878",
    salesOrder: "SO-88264",
    customer: "Great Lakes Agri Co-op",
    customerCode: "CUST-10744",
    warehouse: "DC-04",
    priority: "Medium",
    status: "Loaded",
    createdAt: "18 Mar 2026 Â· 04:58",
    deliveryDate: "20 Mar 2026",
    dispatchWindow: "18 Mar Â· 11:00â€“12:00",
    carrier: "Schneider National",
    incoterm: "FOB",
    shippingAddress: "2201 Harvest Ln, Toledo, OH 43604, USA",
    contact: "Ray Kowalski Â· +1 419 555 3390",
    wave: "WV-2026-0440",
    lines: [
      line(1, "MAT-880123", "Fertiliser Spreader Disc", 120, 120, "G-01-01-A1", "Zone G", 4.1),
      line(2, "MAT-880190", "PTO Drive Shaft 1200mm", 40, 40, "G-01-04-B2", "Zone G", 11.5),
    ],
    documents: [
      {
        name: "Loading_Manifest_LM-3391.pdf",
        type: "Manifest",
        size: "97 KB",
        date: "18 Mar 2026",
      },
    ],
    timeline: baseTimeline(12),
  },
];

export const waves: Wave[] = [
  {
    id: "WV-2026-0442",
    warehouse: "DC-01",
    strategy: "Auto â€” Zone Batch",
    orders: ["OB-2026-104871", "OB-2026-104872"],
    totalItems: 625,
    totalLines: 6,
    priority: "Critical",
    dispatchWindow: "18 Mar Â· 14:00â€“18:00",
    assignedPickers: ["A. Vermeer", "S. Okafor"],
    status: "In Progress",
    progress: 68,
    estimatedCompletion: "18 Mar Â· 13:40",
    createdBy: "Outbound Supervisor Â· M. Duarte",
    createdAt: "18 Mar 2026 Â· 07:15",
    travelMeters: 2840,
    optimizedMeters: 1610,
  },
  {
    id: "WV-2026-0443",
    warehouse: "DC-01",
    strategy: "Auto â€” Carrier Cutoff",
    orders: ["OB-2026-104876"],
    totalItems: 500,
    totalLines: 1,
    priority: "Critical",
    dispatchWindow: "18 Mar Â· 17:00â€“18:30",
    assignedPickers: ["L. Chen"],
    status: "Released",
    progress: 62,
    estimatedCompletion: "18 Mar Â· 16:05",
    createdBy: "Auto Wave Engine",
    createdAt: "18 Mar 2026 Â· 09:20",
    travelMeters: 980,
    optimizedMeters: 690,
  },
  {
    id: "WV-2026-0444",
    warehouse: "DC-07",
    strategy: "Manual",
    orders: ["OB-2026-104873"],
    totalItems: 505,
    totalLines: 3,
    priority: "Medium",
    dispatchWindow: "19 Mar Â· 09:00â€“11:00",
    assignedPickers: [],
    status: "Pending Approval",
    progress: 0,
    estimatedCompletion: "19 Mar Â· 10:15",
    createdBy: "Store Keeper Â· W. Tan",
    createdAt: "18 Mar 2026 Â· 10:02",
    travelMeters: 1440,
    optimizedMeters: 1120,
  },
  {
    id: "WV-2026-0441",
    warehouse: "DC-01",
    strategy: "Auto â€” Priority Sweep",
    orders: ["OB-2026-104877"],
    totalItems: 900,
    totalLines: 2,
    priority: "High",
    dispatchWindow: "18 Mar Â· 12:00â€“13:00",
    assignedPickers: ["N. Petrova"],
    status: "Completed",
    progress: 100,
    estimatedCompletion: "18 Mar Â· 09:55",
    createdBy: "Auto Wave Engine",
    createdAt: "18 Mar 2026 Â· 05:40",
    travelMeters: 1210,
    optimizedMeters: 840,
  },
  {
    id: "WV-2026-0440",
    warehouse: "DC-04",
    strategy: "Auto â€” Zone Batch",
    orders: ["OB-2026-104878"],
    totalItems: 160,
    totalLines: 2,
    priority: "Medium",
    dispatchWindow: "18 Mar Â· 11:00â€“12:00",
    assignedPickers: ["R. Alvarez"],
    status: "Completed",
    progress: 100,
    estimatedCompletion: "18 Mar Â· 08:30",
    createdBy: "Auto Wave Engine",
    createdAt: "18 Mar 2026 Â· 04:10",
    travelMeters: 760,
    optimizedMeters: 520,
  },
  {
    id: "WV-2026-0445",
    warehouse: "DC-01",
    strategy: "Manual",
    orders: [],
    totalItems: 0,
    totalLines: 0,
    priority: "Low",
    dispatchWindow: "21 Mar Â· 13:00â€“16:00",
    assignedPickers: [],
    status: "Draft",
    progress: 0,
    estimatedCompletion: "â€”",
    createdBy: "Outbound Supervisor Â· M. Duarte",
    createdAt: "18 Mar 2026 Â· 10:44",
    travelMeters: 0,
    optimizedMeters: 0,
  },
];

export const pickTasks: PickTask[] = [
  {
    id: "PT-77201",
    wave: "WV-2026-0442",
    order: "OB-2026-104871",
    picker: "A. Vermeer",
    status: "In Progress",
    zone: "Zone A",
    aisle: "A-04",
    rack: "12",
    shelf: "B",
    bin: "A-04-12-B3",
    material: "MAT-449021",
    description: "Industrial Bearing Assembly 60mm",
    batch: "B2026007",
    serial: "SN-9013",
    qty: 240,
    picked: 180,
    uom: "EA",
    barcode: "8712345678904",
    startedAt: "11:02",
    etaMin: 6,
  },
  {
    id: "PT-77202",
    wave: "WV-2026-0442",
    order: "OB-2026-104871",
    picker: "A. Vermeer",
    status: "Queued",
    zone: "Zone C",
    aisle: "C-02",
    rack: "08",
    shelf: "A",
    bin: "C-02-08-A2",
    material: "MAT-771205",
    description: "Steel Chain Link 12mm (10m)",
    batch: "B2026021",
    serial: "â€”",
    qty: 60,
    picked: 20,
    uom: "EA",
    barcode: "8712345671122",
    etaMin: 11,
  },
  {
    id: "PT-77203",
    wave: "WV-2026-0442",
    order: "OB-2026-104872",
    picker: "S. Okafor",
    status: "Completed",
    zone: "Zone B",
    aisle: "B-03",
    rack: "02",
    shelf: "A",
    bin: "B-03-02-A4",
    material: "MAT-556010",
    description: "Pneumatic Valve Block V4",
    batch: "B2026014",
    serial: "SN-9039",
    qty: 80,
    picked: 80,
    uom: "EA",
    barcode: "8712345660017",
    startedAt: "09:41",
    etaMin: 0,
  },
  {
    id: "PT-77204",
    wave: "WV-2026-0443",
    order: "OB-2026-104876",
    picker: "L. Chen",
    status: "Exception",
    zone: "Zone A",
    aisle: "A-04",
    rack: "12",
    shelf: "B",
    bin: "A-04-12-B3",
    material: "MAT-449021",
    description: "Industrial Bearing Assembly 60mm",
    batch: "B2026007",
    serial: "â€”",
    qty: 500,
    picked: 310,
    uom: "EA",
    barcode: "8712345678904",
    startedAt: "10:14",
    etaMin: 0,
  },
  {
    id: "PT-77205",
    wave: "WV-2026-0443",
    order: "OB-2026-104876",
    picker: "Unassigned",
    status: "Queued",
    zone: "Zone D",
    aisle: "D-01",
    rack: "05",
    shelf: "B",
    bin: "D-01-05-B1",
    material: "MAT-330918",
    description: "Conveyor Roller 800mm",
    batch: "B2026028",
    serial: "â€”",
    qty: 45,
    picked: 0,
    uom: "EA",
    barcode: "8712345690043",
    etaMin: 14,
  },
  {
    id: "PT-77206",
    wave: "WV-2026-0442",
    order: "OB-2026-104871",
    picker: "S. Okafor",
    status: "Paused",
    zone: "Zone A",
    aisle: "A-06",
    rack: "03",
    shelf: "C",
    bin: "A-06-03-C1",
    material: "MAT-118734",
    description: "Hydraulic Seal Kit HK-200",
    batch: "B2026042",
    serial: "â€”",
    qty: 120,
    picked: 96,
    uom: "EA",
    barcode: "8712345612009",
    startedAt: "10:52",
    etaMin: 4,
  },
];

export const pickers = [
  { name: "A. Vermeer", zone: "Zone A", tasks: 6, lph: 142, accuracy: 99.6, status: "Picking" },
  { name: "S. Okafor", zone: "Zone B", tasks: 5, lph: 128, accuracy: 99.1, status: "Picking" },
  { name: "L. Chen", zone: "Zone A/C", tasks: 4, lph: 118, accuracy: 98.4, status: "Exception" },
  { name: "N. Petrova", zone: "Zone B", tasks: 7, lph: 155, accuracy: 99.8, status: "Idle" },
  { name: "R. Alvarez", zone: "Zone G", tasks: 3, lph: 109, accuracy: 97.9, status: "Break" },
  { name: "T. Nakamura", zone: "Zone E", tasks: 5, lph: 133, accuracy: 99.3, status: "Picking" },
];

export const packStations = [
  {
    id: "PACK-01",
    packer: "J. Mbeki",
    order: "OB-2026-104872",
    cartons: 4,
    weightKg: 128.4,
    dims: "120 Ã— 80 Ã— 96 cm",
    status: "Packing",
    progress: 75,
    checklist: [
      { label: "All picked lines scanned into carton", done: true },
      { label: "Void fill applied", done: true },
      { label: "Carton weight captured", done: true },
      { label: "Shipping label applied", done: false },
    ],
  },
  {
    id: "PACK-02",
    packer: "K. Larsen",
    order: "OB-2026-104877",
    cartons: 9,
    weightKg: 214.0,
    dims: "120 Ã— 100 Ã— 120 cm",
    status: "Awaiting QC",
    progress: 100,
    checklist: [
      { label: "All picked lines scanned into carton", done: true },
      { label: "Cold-chain indicator attached", done: true },
      { label: "Carton weight captured", done: true },
      { label: "Shipping label applied", done: true },
    ],
  },
  {
    id: "PACK-03",
    packer: "Unassigned",
    order: "â€”",
    cartons: 0,
    weightKg: 0,
    dims: "â€”",
    status: "Idle",
    progress: 0,
    checklist: [],
  },
];

export const docks = [
  {
    id: "DOCK-01",
    status: "Loading",
    truck: "TRK-4471",
    order: "OB-2026-104878",
    eta: "11:40",
    utilization: 82,
  },
  {
    id: "DOCK-02",
    status: "Staged",
    truck: "TRK-4482",
    order: "OB-2026-104877",
    eta: "12:05",
    utilization: 64,
  },
  { id: "DOCK-03", status: "Free", truck: "â€”", order: "â€”", eta: "â€”", utilization: 0 },
  {
    id: "DOCK-04",
    status: "Waiting Truck",
    truck: "TRK-4490",
    order: "OB-2026-104872",
    eta: "14:10",
    utilization: 30,
  },
  {
    id: "DOCK-05",
    status: "Loading",
    truck: "TRK-4468",
    order: "OB-2026-104871",
    eta: "16:20",
    utilization: 47,
  },
  { id: "DOCK-06", status: "Maintenance", truck: "â€”", order: "â€”", eta: "â€”", utilization: 0 },
];

export const trucks = [
  {
    id: "TRK-4471",
    plate: "BX-482-KL",
    carrier: "Schneider National",
    driver: "Ray Kowalski",
    licence: "OH-77120394",
    trailer: "53ft Dry Van",
    capacityKg: 19500,
    loadedKg: 15980,
    seal: "SL-778102",
    dock: "DOCK-01",
    status: "Loading",
    progress: 82,
  },
  {
    id: "TRK-4482",
    plate: "ZH-99-204",
    carrier: "Swiss Post Logistics",
    driver: "Anja Furrer",
    licence: "CH-44810023",
    trailer: "Temperature Controlled",
    capacityKg: 12000,
    loadedKg: 7420,
    seal: "SL-778119",
    dock: "DOCK-02",
    status: "Staged",
    progress: 62,
  },
  {
    id: "TRK-4468",
    plate: "NL-42-BDX",
    carrier: "DHL Freight",
    driver: "Pieter Janssen",
    licence: "NL-99120044",
    trailer: "Curtainsider 13.6m",
    capacityKg: 24000,
    loadedKg: 11280,
    seal: "SL-778124",
    dock: "DOCK-05",
    status: "Loading",
    progress: 47,
  },
];

export const shipments = [
  {
    id: "SHP-2026-33120",
    order: "OB-2026-104874",
    tracking: "FDX-7712004488",
    carrier: "FedEx Freight",
    driver: "Marcus Bell",
    vehicle: "TN-8842-FD",
    dispatchedAt: "18 Mar Â· 08:52",
    eta: "19 Mar Â· 14:00",
    status: "In Transit",
    progressPct: 58,
    lastScan: "Nashville TN Hub Â· 18 Mar 21:14",
    milestones: [
      { label: "Dispatched from DC-04", at: "18 Mar 08:52", done: true },
      { label: "Departed origin hub", at: "18 Mar 12:30", done: true },
      { label: "Nashville TN Hub", at: "18 Mar 21:14", done: true },
      { label: "Out for delivery", at: "19 Mar 08:00", done: false },
      { label: "Delivered", at: "19 Mar 14:00", done: false },
    ],
  },
  {
    id: "SHP-2026-33121",
    order: "OB-2026-104878",
    tracking: "SCH-9920114",
    carrier: "Schneider National",
    driver: "Ray Kowalski",
    vehicle: "BX-482-KL",
    dispatchedAt: "â€”",
    eta: "20 Mar Â· 10:00",
    status: "Loading",
    progressPct: 20,
    lastScan: "Dock 01 Â· loading in progress",
    milestones: [
      { label: "Staged at DOCK-01", at: "18 Mar 10:20", done: true },
      { label: "Loading started", at: "18 Mar 10:55", done: true },
      { label: "Dispatch verification", at: "â€”", done: false },
      { label: "Dispatched", at: "â€”", done: false },
      { label: "Delivered", at: "â€”", done: false },
    ],
  },
  {
    id: "SHP-2026-33115",
    order: "OB-2026-104870",
    tracking: "DHL-4410287731",
    carrier: "DHL Freight",
    driver: "Pieter Janssen",
    vehicle: "NL-42-BDX",
    dispatchedAt: "17 Mar Â· 17:20",
    eta: "18 Mar Â· 09:00",
    status: "Delivered",
    progressPct: 100,
    lastScan: "Delivered Â· signed by M. de Vries",
    milestones: [
      { label: "Dispatched from DC-01", at: "17 Mar 17:20", done: true },
      { label: "Hub Utrecht", at: "17 Mar 21:05", done: true },
      { label: "Out for delivery", at: "18 Mar 06:40", done: true },
      { label: "Delivered", at: "18 Mar 08:52", done: true },
    ],
  },
];

export const exceptions = [
  {
    id: "EXC-5521",
    type: "Inventory Shortage",
    severity: "Critical",
    order: "OB-2026-104876",
    wave: "WV-2026-0443",
    raisedBy: "L. Chen (Picker)",
    at: "18 Mar Â· 10:41",
    bin: "A-04-12-B3",
    detail: "Only 310 of 500 EA available at bin. Cycle count requested.",
    status: "Open",
  },
  {
    id: "EXC-5520",
    type: "Damaged Product",
    severity: "High",
    order: "OB-2026-104871",
    wave: "WV-2026-0442",
    raisedBy: "S. Okafor (Picker)",
    at: "18 Mar Â· 09:58",
    bin: "C-02-08-A2",
    detail: "3 chain links show corrosion. Quarantined to QA-HOLD-02.",
    status: "In Review",
  },
  {
    id: "EXC-5518",
    type: "Wrong Item Scanned",
    severity: "Medium",
    order: "OB-2026-104872",
    wave: "WV-2026-0442",
    raisedBy: "Scanner RF-114",
    at: "18 Mar Â· 09:12",
    bin: "B-03-02-A5",
    detail: "Barcode mismatch on MAT-556011. Corrected after re-scan.",
    status: "Resolved",
  },
  {
    id: "EXC-5514",
    type: "Loading Exception",
    severity: "Medium",
    order: "OB-2026-104878",
    wave: "WV-2026-0440",
    raisedBy: "Dispatch Coordinator Â· G. Ruiz",
    at: "18 Mar Â· 11:03",
    bin: "DOCK-01",
    detail: "Pallet 4 exceeds axle weight limit â€” reload sequence adjusted.",
    status: "In Review",
  },
  {
    id: "EXC-5509",
    type: "Missing Item",
    severity: "Low",
    order: "OB-2026-104877",
    wave: "WV-2026-0441",
    raisedBy: "K. Larsen (Packer)",
    at: "18 Mar Â· 08:26",
    bin: "PACK-02",
    detail: "1 carton short at pack station; located in staging lane S-03.",
    status: "Resolved",
  },
];

export const activities = [
  {
    at: "11:12",
    text: "Wave WV-2026-0443 released â€” 1 order, 500 units",
    actor: "Auto Wave Engine",
    tone: "info",
  },
  {
    at: "11:03",
    text: "Loading exception raised on DOCK-01 (axle weight)",
    actor: "G. Ruiz",
    tone: "warning",
  },
  {
    at: "10:58",
    text: "Pick task PT-77203 completed in 00:14:22",
    actor: "S. Okafor",
    tone: "success",
  },
  {
    at: "10:41",
    text: "Inventory shortage on MAT-449021 at A-04-12-B3",
    actor: "L. Chen",
    tone: "danger",
  },
  { at: "10:20", text: "OB-2026-104877 staged at DOCK-02", actor: "System", tone: "info" },
  {
    at: "09:55",
    text: "Wave WV-2026-0441 completed â€” 100% pick accuracy",
    actor: "N. Petrova",
    tone: "success",
  },
  { at: "09:31", text: "Truck TRK-4482 arrived and checked in", actor: "Gatehouse", tone: "info" },
  {
    at: "08:52",
    text: "Shipment SHP-2026-33120 dispatched to Atlas Automotive",
    actor: "M. Duarte",
    tone: "success",
  },
];

export const notifications = [
  {
    title: "Wave Released",
    body: "WV-2026-0443 released with 1 order",
    at: "2m ago",
    tone: "info",
  },
  {
    title: "Exception Raised",
    body: "Inventory shortage â€” MAT-449021",
    at: "31m ago",
    tone: "danger",
  },
  { title: "Truck Assigned", body: "TRK-4468 assigned to DOCK-05", at: "48m ago", tone: "info" },
  {
    title: "Packing Completed",
    body: "OB-2026-104877 packed â€” 9 cartons",
    at: "1h ago",
    tone: "success",
  },
  {
    title: "Shipment Dispatched",
    body: "SHP-2026-33120 en route to Memphis",
    at: "2h ago",
    tone: "success",
  },
];

export const hourlyThroughput = [
  { hour: "06:00", picked: 210, packed: 140, dispatched: 40 },
  { hour: "07:00", picked: 340, packed: 250, dispatched: 90 },
  { hour: "08:00", picked: 480, packed: 360, dispatched: 180 },
  { hour: "09:00", picked: 520, packed: 430, dispatched: 240 },
  { hour: "10:00", picked: 610, packed: 470, dispatched: 300 },
  { hour: "11:00", picked: 580, packed: 510, dispatched: 340 },
  { hour: "12:00", picked: 430, packed: 400, dispatched: 260 },
  { hour: "13:00", picked: 500, packed: 420, dispatched: 310 },
];

export const waveEfficiency = [
  { wave: "0438", planned: 95, actual: 88 },
  { wave: "0439", planned: 95, actual: 92 },
  { wave: "0440", planned: 95, actual: 97 },
  { wave: "0441", planned: 95, actual: 99 },
  { wave: "0442", planned: 95, actual: 91 },
  { wave: "0443", planned: 95, actual: 84 },
];

export const cycleTimeTrend = [
  { day: "Mon", hours: 7.8 },
  { day: "Tue", hours: 7.1 },
  { day: "Wed", hours: 6.4 },
  { day: "Thu", hours: 6.9 },
  { day: "Fri", hours: 5.8 },
  { day: "Sat", hours: 5.2 },
  { day: "Sun", hours: 6.1 },
];

export const dispatchMix = [
  { name: "DHL Freight", value: 34 },
  { name: "Kuehne+Nagel", value: 22 },
  { name: "FedEx Freight", value: 18 },
  { name: "Schneider", value: 15 },
  { name: "Others", value: 11 },
];

// Heat map: pick density per aisle/zone
export const heatMap = ["A", "B", "C", "D", "E", "F", "G"].map((zone, zi) => ({
  zone,
  aisles: Array.from({ length: 10 }, (_, i) => ({
    aisle: `${zone}-${String(i + 1).padStart(2, "0")}`,
    density: Math.round(((Math.sin(zi * 1.7 + i * 0.9) + 1) / 2) * 88) + 8,
  })),
}));

export function getOrder(id: string) {
  return orders.find((o) => o.id === id);
}
export function getWave(id: string) {
  return waves.find((w) => w.id === id);
}
