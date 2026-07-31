import type {
  Adjustment,
  AuditLine,
  CycleCount,
  GenealogyNode,
  InventoryItem,
  InventoryStatus,
  QuarantineRecord,
  Transaction,
  Transfer,
} from "./types";

/* ------------------------------------------------------------------ */
/* Deterministic pseudo-random generator so SSR + client output match   */
/* ------------------------------------------------------------------ */
let seed = 20260731;
function rnd() {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
}
const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(rnd() * arr.length)] as T;
const int = (min: number, max: number) => Math.floor(rnd() * (max - min + 1)) + min;

export const WAREHOUSES = [
  "Central Warehouse",
  "Raw Material Store",
  "Assembly Warehouse",
  "Finished Goods Warehouse",
  "Spare Parts Warehouse",
] as const;

export const ZONES = ["Zone A", "Zone B", "Zone C", "Zone D", "Bulk Yard"] as const;

export const CATEGORIES = [
  "Power Equipment",
  "Raw Materials",
  "Electrical Components",
  "Mechanical Assemblies",
  "Consumables",
  "Spare Parts",
] as const;

export const SUPPLIERS = [
  "Siemens Energy AG",
  "Bharat Heavy Electricals",
  "ABB Power Grids",
  "Schneider Electric",
  "Hitachi Energy",
  "Crompton Greaves",
  "Nordic Copper Works",
] as const;

const MATERIALS: { name: string; category: string; uom: string; cost: number }[] = [
  { name: "Distribution Transformer 500 kVA", category: "Power Equipment", uom: "EA", cost: 482000 },
  { name: "Power Transformer 1000 kVA", category: "Power Equipment", uom: "EA", cost: 915000 },
  { name: "Online UPS Unit 20 kVA", category: "Power Equipment", uom: "EA", cost: 186000 },
  { name: "Control Panel LV 415V", category: "Mechanical Assemblies", uom: "EA", cost: 74500 },
  { name: "Copper Coil Winding Grade", category: "Raw Materials", uom: "KG", cost: 890 },
  { name: "CRGO Steel Frame Lamination", category: "Raw Materials", uom: "KG", cost: 320 },
  { name: "Aluminium Busbar 100x10mm", category: "Raw Materials", uom: "MTR", cost: 1450 },
  { name: "XLPE Power Cable 240 sq.mm", category: "Electrical Components", uom: "MTR", cost: 2380 },
  { name: "Vacuum Circuit Breaker 11kV", category: "Electrical Components", uom: "EA", cost: 132000 },
  { name: "Switchgear Panel Module", category: "Mechanical Assemblies", uom: "EA", cost: 268000 },
  { name: "VRLA Battery Bank 12V 200Ah", category: "Spare Parts", uom: "EA", cost: 24500 },
  { name: "Radiator Cooling Fan 24in", category: "Spare Parts", uom: "EA", cost: 8600 },
  { name: "Industrial Temperature Sensor", category: "Electrical Components", uom: "EA", cost: 4200 },
  { name: "Bushing Insulator 33kV", category: "Spare Parts", uom: "EA", cost: 15800 },
  { name: "Transformer Oil Grade II", category: "Consumables", uom: "LTR", cost: 210 },
  { name: "Silica Gel Breather Unit", category: "Consumables", uom: "EA", cost: 3400 },
  { name: "PCB Relay Control Card", category: "Electrical Components", uom: "EA", cost: 19800 },
  { name: "LED Display Panel HMI 7in", category: "Electrical Components", uom: "EA", cost: 27500 },
];

const USERS = [
  "R. Krishnan",
  "M. Fernandes",
  "A. Deshmukh",
  "S. Iyer",
  "P. Nakamura",
  "L. Whitfield",
  "D. Oyelaran",
];

const pad = (n: number, l = 4) => String(n).padStart(l, "0");
const dateStr = (offsetDays: number) => {
  const d = new Date(Date.UTC(2026, 6, 31));
  d.setUTCDate(d.getUTCDate() + offsetDays);
  return d.toISOString().slice(0, 10);
};

function computeStatus(
  available: number,
  reserved: number,
  damaged: number,
  quarantine: number,
  reorderPoint: number,
): InventoryStatus {
  if (available === 0 && reserved === 0) return "Out of Stock";
  if (quarantine > 0 && quarantine >= available) return "Quarantine";
  if (damaged > 0 && damaged >= available) return "Damaged";
  if (available <= reorderPoint) return "Low Stock";
  if (reserved > available) return "Reserved";
  return "Available";
}

export const inventory: InventoryItem[] = Array.from({ length: 96 }, (_, i) => {
  const m = MATERIALS[i % MATERIALS.length]!;
  const warehouse = pick(WAREHOUSES);
  const minQty = int(10, 60);
  const maxQty = minQty * int(6, 12);
  const safetyStock = Math.round(minQty * 1.4);
  const reorderPoint = Math.round(minQty * 2.2);
  const roll = rnd();
  const available = roll < 0.07 ? 0 : roll < 0.2 ? int(1, reorderPoint) : int(reorderPoint + 5, maxQty);
  const reserved = int(0, Math.max(1, Math.round(available * 0.35)));
  const damaged = rnd() < 0.22 ? int(1, 14) : 0;
  const quarantine = rnd() < 0.16 ? int(1, 20) : 0;
  const ageDays = int(2, 220);
  const movement = ageDays > 150 ? "Dead Stock" : ageDays > 75 ? "Slow Moving" : "Fast Moving";
  return {
    id: `INV-${pad(i + 1)}`,
    materialCode: `MAT-${pad(1000 + i * 7, 5)}`,
    materialName: m.name,
    category: m.category,
    warehouse,
    storageBin: `${pick(ZONES).split(" ")[1] ?? "A"}-${pad(int(1, 40), 2)}-${pad(int(1, 9), 2)}`,
    zone: pick(ZONES),
    batchNumber: `BATCH-26${pad(int(100, 999), 3)}`,
    serialNumber: `SN-${pad(int(100000, 999999), 6)}`,
    uom: m.uom,
    available,
    reserved,
    damaged,
    quarantine,
    unitCost: m.cost,
    status: computeStatus(available, reserved, damaged, quarantine, reorderPoint),
    expiryDate: m.category === "Consumables" || m.name.includes("Battery") ? dateStr(int(-40, 500)) : "—",
    lastUpdated: dateStr(-int(0, 20)),
    receivedDate: dateStr(-ageDays),
    ageDays,
    minQty,
    maxQty,
    safetyStock,
    reorderPoint,
    eoq: Math.round(Math.sqrt((2 * maxQty * 350) / Math.max(1, m.cost * 0.02))) + minQty,
    movement,
    supplier: pick(SUPPLIERS),
  };
});

export const transactions: Transaction[] = Array.from({ length: 40 }, (_, i) => {
  const item = inventory[int(0, inventory.length - 1)]!;
  return {
    id: `TRX-${pad(50000 + i * 3, 6)}`,
    date: dateStr(-int(0, 30)),
    type: pick(["Goods Receipt", "Goods Issue", "Transfer", "Adjustment", "Return", "Scrap"] as const),
    materialCode: item.materialCode,
    materialName: item.materialName,
    warehouse: item.warehouse,
    quantity: int(1, 250),
    uom: item.uom,
    reference: `DOC-${pad(int(1000, 9999))}`,
    user: pick(USERS),
  };
}).sort((a, b) => (a.date < b.date ? 1 : -1));

export const cycleCounts: CycleCount[] = Array.from({ length: 14 }, (_, i) => ({
  id: `CC-${pad(2600 + i)}`,
  warehouse: pick(WAREHOUSES),
  zone: pick(ZONES),
  frequency: pick(["Daily", "Weekly", "Monthly", "Quarterly"] as const),
  assignedUser: pick(USERS),
  scheduledDate: dateStr(int(-12, 25)),
  status: pick(["Scheduled", "In Progress", "Completed", "Overdue"] as const),
  itemsPlanned: int(15, 240),
}));

export const auditLines: AuditLine[] = Array.from({ length: 22 }, (_, i) => {
  const item = inventory[int(0, inventory.length - 1)]!;
  const systemQty = int(20, 400);
  const drift = rnd() < 0.55 ? int(-18, 18) : 0;
  return {
    id: `AUD-${pad(9100 + i)}`,
    countId: cycleCounts[i % cycleCounts.length]!.id,
    materialCode: item.materialCode,
    materialName: item.materialName,
    warehouse: item.warehouse,
    bin: item.storageBin,
    systemQty,
    physicalQty: Math.max(0, systemQty + drift),
    uom: item.uom,
    countedBy: pick(USERS),
    approvalStatus: pick(["Pending", "Approved", "Rejected"] as const),
    date: dateStr(-int(0, 18)),
  };
});

export const adjustments: Adjustment[] = Array.from({ length: 18 }, (_, i) => {
  const item = inventory[int(0, inventory.length - 1)]!;
  const currentQty = int(20, 500);
  return {
    id: `ADJ-${pad(7300 + i)}`,
    materialCode: item.materialCode,
    materialName: item.materialName,
    warehouse: item.warehouse,
    currentQty,
    adjustedQty: Math.max(0, currentQty + int(-40, 40)),
    reasonCode: pick([
      "Physical Count Variance",
      "Damage in Handling",
      "Scrap Write-Off",
      "System Correction",
      "Vendor Short Supply",
      "Quality Rejection",
    ]),
    remarks: pick([
      "Verified against bin-level recount.",
      "Reported by shop-floor supervisor.",
      "Documented with QA inspection report.",
      "Corrected after GRN posting error.",
    ]),
    requestedBy: pick(USERS),
    approver: pick(USERS),
    status: pick(["Draft", "Submitted", "Approved", "Rejected", "Completed"] as const),
    date: dateStr(-int(0, 45)),
  };
});

export const transfers: Transfer[] = Array.from({ length: 20 }, (_, i) => {
  const item = inventory[int(0, inventory.length - 1)]!;
  const source = pick(WAREHOUSES);
  let destination = pick(WAREHOUSES);
  if (destination === source) destination = WAREHOUSES[(WAREHOUSES.indexOf(source) + 1) % WAREHOUSES.length]!;
  return {
    id: `TR-${pad(4400 + i)}`,
    source,
    destination,
    materialCode: item.materialCode,
    materialName: item.materialName,
    quantity: int(5, 300),
    uom: item.uom,
    requestedBy: pick(USERS),
    approvedBy: pick(USERS),
    status: pick(["Pending", "Approved", "In Transit", "Received", "Cancelled"] as const),
    requestedDate: dateStr(-int(0, 30)),
    eta: dateStr(int(1, 20)),
    priority: pick(["Low", "Normal", "High"] as const),
  };
});

export const quarantineRecords: QuarantineRecord[] = Array.from({ length: 18 }, (_, i) => {
  const item = inventory[int(0, inventory.length - 1)]!;
  return {
    id: `QC-${pad(3300 + i)}`,
    materialCode: item.materialCode,
    materialName: item.materialName,
    warehouse: item.warehouse,
    quantity: int(1, 60),
    uom: item.uom,
    reason: pick([
      "Transit Damage",
      "Insulation Failure",
      "Dimensional Deviation",
      "Oil Leakage Detected",
      "Awaiting QA Clearance",
      "Vendor Certification Missing",
    ]),
    inspectionNotes: pick([
      "Visual inspection shows dented enclosure; electrical test pending.",
      "Winding resistance out of tolerance by 4.2%.",
      "Held pending third-party test certificate.",
      "Minor surface corrosion, repairable in-house.",
    ]),
    status: pick(["Damaged", "Quarantine", "Blocked", "Rejected"] as const),
    inspector: pick(USERS),
    date: dateStr(-int(0, 40)),
  };
});

export const genealogy: GenealogyNode = {
  id: "G-ROOT",
  name: "Power Transformer 1000 kVA",
  materialCode: "MAT-01007",
  serialNumber: "SN-771204",
  batchNumber: "BATCH-26412",
  supplier: "In-House Assembly Line 2",
  manufacturingDate: "2026-04-18",
  warranty: "60 months",
  status: "Available",
  children: [
    {
      id: "G-1",
      name: "Copper Coil Winding Assembly",
      materialCode: "MAT-01035",
      serialNumber: "SN-118902",
      batchNumber: "BATCH-26188",
      supplier: "Nordic Copper Works",
      manufacturingDate: "2026-02-02",
      warranty: "24 months",
      status: "Available",
      children: [
        {
          id: "G-1-1",
          name: "Copper Conductor Strip",
          materialCode: "MAT-01042",
          serialNumber: "SN-118955",
          batchNumber: "BATCH-26190",
          supplier: "Nordic Copper Works",
          manufacturingDate: "2026-01-20",
          warranty: "12 months",
          status: "Available",
        },
        {
          id: "G-1-2",
          name: "Insulation Paper Wrap",
          materialCode: "MAT-01049",
          serialNumber: "SN-118961",
          batchNumber: "BATCH-26193",
          supplier: "Schneider Electric",
          manufacturingDate: "2026-01-28",
          warranty: "12 months",
          status: "Reserved",
        },
      ],
    },
    {
      id: "G-2",
      name: "Radiator Cooling Fan 24in",
      materialCode: "MAT-01077",
      serialNumber: "SN-330147",
      batchNumber: "BATCH-26255",
      supplier: "Crompton Greaves",
      manufacturingDate: "2026-03-06",
      warranty: "18 months",
      status: "Available",
    },
    {
      id: "G-3",
      name: "PCB Relay Control Card",
      materialCode: "MAT-01112",
      serialNumber: "SN-540932",
      batchNumber: "BATCH-26301",
      supplier: "ABB Power Grids",
      manufacturingDate: "2026-03-22",
      warranty: "36 months",
      status: "Quarantine",
      children: [
        {
          id: "G-3-1",
          name: "Industrial Temperature Sensor",
          materialCode: "MAT-01091",
          serialNumber: "SN-540980",
          batchNumber: "BATCH-26305",
          supplier: "Hitachi Energy",
          manufacturingDate: "2026-03-11",
          warranty: "24 months",
          status: "Available",
        },
      ],
    },
    {
      id: "G-4",
      name: "VRLA Battery Bank 12V 200Ah",
      materialCode: "MAT-01070",
      serialNumber: "SN-612388",
      batchNumber: "BATCH-26277",
      supplier: "Bharat Heavy Electricals",
      manufacturingDate: "2026-02-25",
      warranty: "30 months",
      status: "Low Stock",
    },
    {
      id: "G-5",
      name: "LED Display Panel HMI 7in",
      materialCode: "MAT-01119",
      serialNumber: "SN-701455",
      batchNumber: "BATCH-26330",
      supplier: "Siemens Energy AG",
      manufacturingDate: "2026-04-02",
      warranty: "24 months",
      status: "Available",
    },
  ],
};

/* ---------------------------- derived data ---------------------------- */

export const kpis = (() => {
  const sum = (f: (i: InventoryItem) => number) => inventory.reduce((a, i) => a + f(i), 0);
  return {
    totalMaterials: inventory.length,
    available: sum((i) => i.available),
    reserved: sum((i) => i.reserved),
    damaged: sum((i) => i.damaged),
    quarantine: sum((i) => i.quarantine),
    lowStock: inventory.filter((i) => i.status === "Low Stock").length,
    outOfStock: inventory.filter((i) => i.status === "Out of Stock").length,
    pendingTransfers: transfers.filter((t) => t.status === "Pending" || t.status === "In Transit").length,
    stockValue: sum((i) => (i.available + i.reserved) * i.unitCost),
  };
})();

export const byWarehouse = WAREHOUSES.map((w) => {
  const rows = inventory.filter((i) => i.warehouse === w);
  return {
    warehouse: w.replace(" Warehouse", "").replace(" Store", ""),
    available: rows.reduce((a, i) => a + i.available, 0),
    reserved: rows.reduce((a, i) => a + i.reserved, 0),
    damaged: rows.reduce((a, i) => a + i.damaged + i.quarantine, 0),
  };
});

export const byCategory = CATEGORIES.map((c) => ({
  category: c,
  quantity: inventory.filter((i) => i.category === c).reduce((a, i) => a + i.available + i.reserved, 0),
}));

export const statusSplit = [
  { name: "Available", value: kpis.available },
  { name: "Reserved", value: kpis.reserved },
  { name: "Damaged", value: kpis.damaged },
  { name: "Quarantine", value: kpis.quarantine },
];

export const monthlyMovement = [
  { month: "Feb", inbound: 4820, outbound: 3610, adjustments: 180 },
  { month: "Mar", inbound: 5240, outbound: 4180, adjustments: 240 },
  { month: "Apr", inbound: 4390, outbound: 4720, adjustments: 130 },
  { month: "May", inbound: 6120, outbound: 5310, adjustments: 310 },
  { month: "Jun", inbound: 5680, outbound: 6020, adjustments: 205 },
  { month: "Jul", inbound: 6740, outbound: 5890, adjustments: 275 },
];

export const agingBuckets = (() => {
  const buckets = [
    { bucket: "0-30 Days", min: 0, max: 30 },
    { bucket: "31-60 Days", min: 31, max: 60 },
    { bucket: "61-90 Days", min: 61, max: 90 },
    { bucket: "90+ Days", min: 91, max: 9999 },
  ];
  return buckets.map((b) => {
    const rows = inventory.filter((i) => i.ageDays >= b.min && i.ageDays <= b.max);
    return {
      bucket: b.bucket,
      items: rows.length,
      quantity: rows.reduce((a, i) => a + i.available, 0),
      value: Math.round(rows.reduce((a, i) => a + i.available * i.unitCost, 0)),
    };
  });
})();

export const healthScore = Math.round(
  Math.max(
    0,
    Math.min(
      100,
      100 -
        (kpis.lowStock * 1.6 + kpis.outOfStock * 3.2) -
        (kpis.damaged / Math.max(1, kpis.available)) * 100 * 3,
    ),
  ),
);

export const formatNumber = (n: number) => new Intl.NumberFormat("en-US").format(Math.round(n));
export const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

export const getItem = (id: string) => inventory.find((i) => i.id === id);
