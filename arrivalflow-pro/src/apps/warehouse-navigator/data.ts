// Realistic WMS master data for the Storage & Location Management module.
// Deterministic pseudo-random generation keeps SSR and client renders identical.

export type OccupancyState = "available" | "nearly-full" | "full" | "reserved" | "maintenance";

export const OCCUPANCY_META: Record<
  OccupancyState,
  { label: string; dot: string; chip: string; fill: string; text: string }
> = {
  available: {
    label: "Available",
    dot: "bg-success",
    chip: "bg-success-soft text-success",
    fill: "bg-success/75 hover:bg-success",
    text: "text-success",
  },
  "nearly-full": {
    label: "Nearly Full",
    dot: "bg-warning",
    chip: "bg-warning-soft text-warning",
    fill: "bg-warning/75 hover:bg-warning",
    text: "text-warning",
  },
  full: {
    label: "Full",
    dot: "bg-danger",
    chip: "bg-danger-soft text-danger",
    fill: "bg-danger/75 hover:bg-danger",
    text: "text-danger",
  },
  reserved: {
    label: "Reserved",
    dot: "bg-primary",
    chip: "bg-primary-soft text-primary",
    fill: "bg-primary/75 hover:bg-primary",
    text: "text-primary",
  },
  maintenance: {
    label: "Maintenance",
    dot: "bg-neutral",
    chip: "bg-neutral-soft text-muted-foreground",
    fill: "bg-neutral/50 hover:bg-neutral/70",
    text: "text-muted-foreground",
  },
};

export function occupancyState(pct: number, override?: OccupancyState): OccupancyState {
  if (override) return override;
  if (pct >= 95) return "full";
  if (pct >= 75) return "nearly-full";
  return "available";
}

function hash(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}
export function rand(seed: string, min: number, max: number) {
  return min + (hash(seed) % (max - min + 1));
}

export type Warehouse = {
  id: string;
  code: string;
  name: string;
  city: string;
  address: string;
  manager: string;
  storageType: string;
  capacity: number;
  occupied: number;
  temperature: string;
  humidity: string;
  status: "Operational" | "Maintenance" | "Commissioning";
  docks: number;
  zones: number;
};

export const warehouses: Warehouse[] = [
  {
    id: "wh-1",
    code: "WH-CHN-01",
    name: "Chennai Central DC",
    city: "Chennai, Tamil Nadu",
    address: "Plot 42, Oragadam Industrial Corridor, Chennai 602105",
    manager: "Rajesh Kumar",
    storageType: "Ambient / Pallet Racking",
    capacity: 48000,
    occupied: 37440,
    temperature: "24.6 °C",
    humidity: "48 %RH",
    status: "Operational",
    docks: 14,
    zones: 6,
  },
  {
    id: "wh-2",
    code: "WH-PNQ-02",
    name: "Pune Fulfilment Hub",
    city: "Pune, Maharashtra",
    address: "Building C, Chakan MIDC Phase II, Pune 410501",
    manager: "Anita Deshpande",
    storageType: "Multi-tier Shelving",
    capacity: 32000,
    occupied: 19840,
    temperature: "23.1 °C",
    humidity: "52 %RH",
    status: "Operational",
    docks: 9,
    zones: 5,
  },
  {
    id: "wh-3",
    code: "WH-DXB-03",
    name: "Jebel Ali Cold Store",
    city: "Dubai, UAE",
    address: "Warehouse 17, Jebel Ali Free Zone South, Dubai",
    manager: "Omar Al Farsi",
    storageType: "Cold Chain (-18 °C to +4 °C)",
    capacity: 18000,
    occupied: 17100,
    temperature: "-18.4 °C",
    humidity: "86 %RH",
    status: "Operational",
    docks: 6,
    zones: 4,
  },
  {
    id: "wh-4",
    code: "WH-HAM-04",
    name: "Hamburg Bonded Store",
    city: "Hamburg, Germany",
    address: "Am Ballinkai 3, Freihafen, 21129 Hamburg",
    manager: "Lena Brandt",
    storageType: "Bonded / VNA Racking",
    capacity: 26000,
    occupied: 12480,
    temperature: "19.8 °C",
    humidity: "44 %RH",
    status: "Operational",
    docks: 8,
    zones: 5,
  },
  {
    id: "wh-5",
    code: "WH-NJ-05",
    name: "Newark Cross-Dock",
    city: "Newark, NJ, USA",
    address: "800 Doremus Ave, Port Newark, NJ 07114",
    manager: "Michael Torres",
    storageType: "Cross-Dock / Flow-through",
    capacity: 14000,
    occupied: 4620,
    temperature: "21.3 °C",
    humidity: "41 %RH",
    status: "Operational",
    docks: 18,
    zones: 3,
  },
  {
    id: "wh-6",
    code: "WH-SIN-06",
    name: "Singapore Hazmat Facility",
    city: "Tuas, Singapore",
    address: "12 Tuas Ave 8, Singapore 639221",
    manager: "Wei Ling Tan",
    storageType: "Hazardous / Bunded Cells",
    capacity: 9000,
    occupied: 3150,
    temperature: "25.9 °C",
    humidity: "63 %RH",
    status: "Maintenance",
    docks: 4,
    zones: 3,
  },
];

export const totalCapacity = warehouses.reduce((s, w) => s + w.capacity, 0);
export const totalOccupied = warehouses.reduce((s, w) => s + w.occupied, 0);
export const utilization = Math.round((totalOccupied / totalCapacity) * 100);

export type ZoneType =
  | "Raw Material"
  | "Finished Goods"
  | "Semi Finished"
  | "Rejected"
  | "Quarantine"
  | "Hazardous"
  | "Cold Storage";

export const zoneTypes: ZoneType[] = [
  "Raw Material",
  "Finished Goods",
  "Semi Finished",
  "Rejected",
  "Quarantine",
  "Hazardous",
  "Cold Storage",
];

export type Zone = {
  id: string;
  code: string;
  name: string;
  warehouse: string;
  type: ZoneType;
  aisles: number;
  capacity: number;
  occupied: number;
  temperature: string;
  status: "Active" | "Blocked" | "Maintenance";
  override?: OccupancyState;
};

export const zones: Zone[] = [
  { id: "z1", code: "Z-A", name: "Inbound Staging", warehouse: "WH-CHN-01", type: "Raw Material", aisles: 6, capacity: 9200, occupied: 6440, temperature: "24.2 °C", status: "Active" },
  { id: "z2", code: "Z-B", name: "Bulk Pallet Storage", warehouse: "WH-CHN-01", type: "Finished Goods", aisles: 10, capacity: 15800, occupied: 15010, temperature: "24.8 °C", status: "Active" },
  { id: "z3", code: "Z-C", name: "Fast Pick Forward", warehouse: "WH-CHN-01", type: "Finished Goods", aisles: 8, capacity: 8600, occupied: 7052, temperature: "23.9 °C", status: "Active" },
  { id: "z4", code: "Z-D", name: "Sub-Assembly WIP", warehouse: "WH-CHN-01", type: "Semi Finished", aisles: 5, capacity: 6100, occupied: 3355, temperature: "24.4 °C", status: "Active" },
  { id: "z5", code: "Z-E", name: "QA Quarantine", warehouse: "WH-CHN-01", type: "Quarantine", aisles: 3, capacity: 4300, occupied: 2107, temperature: "23.5 °C", status: "Active", override: "reserved" },
  { id: "z6", code: "Z-F", name: "Rework & Rejects", warehouse: "WH-CHN-01", type: "Rejected", aisles: 2, capacity: 4000, occupied: 1200, temperature: "24.0 °C", status: "Maintenance", override: "maintenance" },
  { id: "z7", code: "Z-G", name: "Ambient Shelving", warehouse: "WH-PNQ-02", type: "Finished Goods", aisles: 9, capacity: 11400, occupied: 7524, temperature: "23.0 °C", status: "Active" },
  { id: "z8", code: "Z-H", name: "Component Store", warehouse: "WH-PNQ-02", type: "Raw Material", aisles: 7, capacity: 8800, occupied: 6160, temperature: "23.2 °C", status: "Active" },
  { id: "z9", code: "Z-J", name: "Deep Freeze Cell", warehouse: "WH-DXB-03", type: "Cold Storage", aisles: 4, capacity: 7200, occupied: 6984, temperature: "-18.6 °C", status: "Active" },
  { id: "z10", code: "Z-K", name: "Chilled Cell", warehouse: "WH-DXB-03", type: "Cold Storage", aisles: 4, capacity: 5400, occupied: 5130, temperature: "3.8 °C", status: "Active" },
  { id: "z11", code: "Z-L", name: "Bunded Hazmat Cells", warehouse: "WH-SIN-06", type: "Hazardous", aisles: 3, capacity: 3600, occupied: 1260, temperature: "25.4 °C", status: "Active" },
  { id: "z12", code: "Z-M", name: "Bonded Transit", warehouse: "WH-HAM-04", type: "Finished Goods", aisles: 8, capacity: 10200, occupied: 4896, temperature: "19.6 °C", status: "Active" },
];

export type Aisle = {
  id: string;
  code: string;
  zone: string;
  warehouse: string;
  racks: number;
  capacity: number;
  occupied: number;
  equipment: string;
  status: "Active" | "Blocked";
};

export const aisles: Aisle[] = [
  { id: "a1", code: "A-01", zone: "Z-B", warehouse: "WH-CHN-01", racks: 12, capacity: 1580, occupied: 1501, equipment: "Reach Truck", status: "Active" },
  { id: "a2", code: "A-02", zone: "Z-B", warehouse: "WH-CHN-01", racks: 12, capacity: 1580, occupied: 1264, equipment: "Reach Truck", status: "Active" },
  { id: "a3", code: "A-03", zone: "Z-B", warehouse: "WH-CHN-01", racks: 10, capacity: 1320, occupied: 660, equipment: "Counterbalance", status: "Active" },
  { id: "a4", code: "A-04", zone: "Z-C", warehouse: "WH-CHN-01", racks: 14, capacity: 1075, occupied: 1010, equipment: "Order Picker", status: "Active" },
  { id: "a5", code: "A-05", zone: "Z-C", warehouse: "WH-CHN-01", racks: 14, capacity: 1075, occupied: 806, equipment: "Order Picker", status: "Active" },
  { id: "a6", code: "A-06", zone: "Z-A", warehouse: "WH-CHN-01", racks: 8, capacity: 1533, occupied: 1073, equipment: "Pallet Jack", status: "Active" },
  { id: "a7", code: "A-07", zone: "Z-D", warehouse: "WH-CHN-01", racks: 9, capacity: 1220, occupied: 671, equipment: "Reach Truck", status: "Active" },
  { id: "a8", code: "A-08", zone: "Z-E", warehouse: "WH-CHN-01", racks: 6, capacity: 1433, occupied: 702, equipment: "Pallet Jack", status: "Blocked" },
  { id: "a9", code: "A-09", zone: "Z-G", warehouse: "WH-PNQ-02", racks: 11, capacity: 1266, occupied: 836, equipment: "Order Picker", status: "Active" },
  { id: "a10", code: "A-10", zone: "Z-J", warehouse: "WH-DXB-03", racks: 8, capacity: 1800, occupied: 1746, equipment: "Cold-rated Reach", status: "Active" },
];

export type Rack = {
  id: string;
  code: string;
  aisle: string;
  zone: string;
  warehouse: string;
  height: string;
  width: string;
  levels: number;
  maxWeight: number;
  currentLoad: number;
  barcode: string;
  status: "Active" | "Blocked" | "Maintenance";
};

export const racks: Rack[] = [
  { id: "r1", code: "R-A01-01", aisle: "A-01", zone: "Z-B", warehouse: "WH-CHN-01", height: "7.2 m", width: "2.7 m", levels: 5, maxWeight: 4800, currentLoad: 4560, barcode: "RK4800100101", status: "Active" },
  { id: "r2", code: "R-A01-02", aisle: "A-01", zone: "Z-B", warehouse: "WH-CHN-01", height: "7.2 m", width: "2.7 m", levels: 5, maxWeight: 4800, currentLoad: 3120, barcode: "RK4800100102", status: "Active" },
  { id: "r3", code: "R-A01-03", aisle: "A-01", zone: "Z-B", warehouse: "WH-CHN-01", height: "7.2 m", width: "2.7 m", levels: 5, maxWeight: 4800, currentLoad: 1440, barcode: "RK4800100103", status: "Active" },
  { id: "r4", code: "R-A02-01", aisle: "A-02", zone: "Z-B", warehouse: "WH-CHN-01", height: "6.4 m", width: "2.4 m", levels: 4, maxWeight: 4000, currentLoad: 3880, barcode: "RK4000200101", status: "Active" },
  { id: "r5", code: "R-A02-02", aisle: "A-02", zone: "Z-B", warehouse: "WH-CHN-01", height: "6.4 m", width: "2.4 m", levels: 4, maxWeight: 4000, currentLoad: 0, barcode: "RK4000200102", status: "Maintenance" },
  { id: "r6", code: "R-A04-01", aisle: "A-04", zone: "Z-C", warehouse: "WH-CHN-01", height: "3.6 m", width: "1.8 m", levels: 6, maxWeight: 1800, currentLoad: 1512, barcode: "RK1800400101", status: "Active" },
  { id: "r7", code: "R-A04-02", aisle: "A-04", zone: "Z-C", warehouse: "WH-CHN-01", height: "3.6 m", width: "1.8 m", levels: 6, maxWeight: 1800, currentLoad: 990, barcode: "RK1800400102", status: "Active" },
  { id: "r8", code: "R-A06-01", aisle: "A-06", zone: "Z-A", warehouse: "WH-CHN-01", height: "5.0 m", width: "2.7 m", levels: 4, maxWeight: 3600, currentLoad: 1800, barcode: "RK3600600101", status: "Active" },
  { id: "r9", code: "R-A10-01", aisle: "A-10", zone: "Z-J", warehouse: "WH-DXB-03", height: "8.4 m", width: "2.7 m", levels: 6, maxWeight: 5200, currentLoad: 5044, barcode: "RK5200A01001", status: "Active" },
  { id: "r10", code: "R-A09-01", aisle: "A-09", zone: "Z-G", warehouse: "WH-PNQ-02", height: "4.2 m", width: "2.1 m", levels: 5, maxWeight: 2400, currentLoad: 1320, barcode: "RK2400900101", status: "Active" },
];

export type Shelf = {
  id: string;
  code: string;
  rack: string;
  level: number;
  bins: number;
  capacity: number;
  occupied: number;
  weightLimit: number;
  currentWeight: number;
  barcode: string;
  status: "Active" | "Reserved" | "Blocked";
};

export const shelves: Shelf[] = [
  { id: "s1", code: "S-A01-01-L1", rack: "R-A01-01", level: 1, bins: 8, capacity: 960, occupied: 912, weightLimit: 1200, currentWeight: 1104, barcode: "SH01010100L1", status: "Active" },
  { id: "s2", code: "S-A01-01-L2", rack: "R-A01-01", level: 2, bins: 8, capacity: 960, occupied: 768, weightLimit: 1200, currentWeight: 936, barcode: "SH01010100L2", status: "Active" },
  { id: "s3", code: "S-A01-01-L3", rack: "R-A01-01", level: 3, bins: 8, capacity: 960, occupied: 480, weightLimit: 1000, currentWeight: 520, barcode: "SH01010100L3", status: "Active" },
  { id: "s4", code: "S-A01-01-L4", rack: "R-A01-01", level: 4, bins: 8, capacity: 960, occupied: 192, weightLimit: 900, currentWeight: 214, barcode: "SH01010100L4", status: "Reserved" },
  { id: "s5", code: "S-A01-01-L5", rack: "R-A01-01", level: 5, bins: 8, capacity: 960, occupied: 0, weightLimit: 700, currentWeight: 0, barcode: "SH01010100L5", status: "Active" },
  { id: "s6", code: "S-A01-02-L1", rack: "R-A01-02", level: 1, bins: 8, capacity: 960, occupied: 883, weightLimit: 1200, currentWeight: 1058, barcode: "SH01010200L1", status: "Active" },
  { id: "s7", code: "S-A04-01-L1", rack: "R-A04-01", level: 1, bins: 12, capacity: 420, occupied: 399, weightLimit: 300, currentWeight: 276, barcode: "SH04010100L1", status: "Active" },
  { id: "s8", code: "S-A04-01-L2", rack: "R-A04-01", level: 2, bins: 12, capacity: 420, occupied: 315, weightLimit: 300, currentWeight: 219, barcode: "SH04010100L2", status: "Active" },
  { id: "s9", code: "S-A10-01-L1", rack: "R-A10-01", level: 1, bins: 10, capacity: 1050, occupied: 1029, weightLimit: 1400, currentWeight: 1358, barcode: "SHA0100100L1", status: "Active" },
  { id: "s10", code: "S-A02-01-L3", rack: "R-A02-01", level: 3, bins: 8, capacity: 800, occupied: 0, weightLimit: 900, currentWeight: 0, barcode: "SH02010100L3", status: "Blocked" },
];

export type Bin = {
  id: string;
  code: string;
  shelf: string;
  rack: string;
  zone: string;
  warehouse: string;
  barcode: string;
  qr: string;
  sku: string | null;
  item: string | null;
  batch: string | null;
  expiry: string | null;
  quantity: number;
  reserved: number;
  damaged: number;
  capacity: number;
  temperature: string;
  status: OccupancyState;
};

type BinSeed = {
  code: string;
  sku: string | null;
  item: string | null;
  quantity: number;
  reserved: number;
  damaged: number;
  capacity: number;
  temperature: string;
  status: OccupancyState;
  batch: string | null;
  expiry: string | null;
};

const binSeed: BinSeed[] = [
  { code: "B-A01-01-L1-01", sku: "SKU-88214", item: "Bosch GSB 600 Impact Drill", quantity: 118, reserved: 12, damaged: 2, capacity: 120, temperature: "24.3 °C", status: "full", batch: "BATCH-2408A", expiry: "2027-04-30" },
  { code: "B-A01-01-L1-02", sku: "SKU-88301", item: "Makita 18V Battery Pack 5Ah", quantity: 96, reserved: 8, damaged: 0, capacity: 120, temperature: "24.1 °C", status: "nearly-full", batch: "BATCH-2409C", expiry: "2026-11-15" },
  { code: "B-A01-01-L1-03", sku: "SKU-71120", item: "Hilti Anchor Bolts M12 (Box 100)", quantity: 44, reserved: 0, damaged: 1, capacity: 120, temperature: "24.4 °C", status: "available", batch: "BATCH-2407F", expiry: "2028-01-20" },
  { code: "B-A01-01-L1-04", sku: null, item: null, quantity: 0, reserved: 0, damaged: 0, capacity: 120, temperature: "24.2 °C", status: "available", batch: null, expiry: null },
  { code: "B-A01-01-L1-05", sku: "SKU-65540", item: "3M Abrasive Discs 125mm", quantity: 108, reserved: 24, damaged: 0, capacity: 120, temperature: "24.0 °C", status: "nearly-full", batch: "BATCH-2410B", expiry: "2027-09-02" },
  { code: "B-A01-01-L1-06", sku: "SKU-90422", item: "Siemens Contactor 3RT2", quantity: 60, reserved: 60, damaged: 0, capacity: 120, temperature: "24.5 °C", status: "reserved", batch: "BATCH-2411A", expiry: "2029-03-12" },
  { code: "B-A01-01-L1-07", sku: null, item: null, quantity: 0, reserved: 0, damaged: 0, capacity: 120, temperature: "24.6 °C", status: "maintenance", batch: null, expiry: null },
  { code: "B-A01-01-L1-08", sku: "SKU-33108", item: "Schneider MCB 32A 3P", quantity: 120, reserved: 0, damaged: 4, capacity: 120, temperature: "24.2 °C", status: "full", batch: "BATCH-2406D", expiry: "2030-06-30" },
];

export const bins: Bin[] = binSeed.map((row, i) => ({
  id: `b${i + 1}`,
  shelf: "S-A01-01-L1",
  rack: "R-A01-01",
  zone: "Z-B",
  warehouse: "WH-CHN-01",
  barcode: `BN${String(1001 + i)}${String(88 + i)}`,
  qr: `QR|WH-CHN-01|Z-B|A-01|R-A01-01|${row.code}`,
  ...row,
}));


export type PutAwayStatus = "Waiting" | "Assigned" | "Travelling" | "Scanning" | "Confirmed" | "Completed";

export const putAwayStatusMeta: Record<PutAwayStatus, string> = {
  Waiting: "bg-neutral-soft text-muted-foreground",
  Assigned: "bg-primary-soft text-primary",
  Travelling: "bg-secondary-soft text-secondary",
  Scanning: "bg-warning-soft text-warning",
  Confirmed: "bg-success-soft text-success",
  Completed: "bg-success-soft text-success",
};

export type PutAwayTask = {
  id: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  grn: string;
  truck: string;
  sku: string;
  product: string;
  quantity: number;
  uom: string;
  weight: string;
  warehouse: string;
  zone: string;
  aisle: string;
  rack: string;
  shelf: string;
  bin: string;
  operator: string;
  status: PutAwayStatus;
  createdAt: string;
  slaMinutes: number;
  reason: string;
};

export const putAwayTasks: PutAwayTask[] = [
  { id: "PA-100482", priority: "Critical", grn: "GRN-2026-04417", truck: "TN-38-BX-7741", sku: "SKU-88214", product: "Bosch GSB 600 Impact Drill", quantity: 240, uom: "EA", weight: "412 kg", warehouse: "WH-CHN-01", zone: "Z-C", aisle: "A-04", rack: "R-A04-01", shelf: "S-A04-01-L2", bin: "B-A04-01-L2-03", operator: "Suresh Babu", status: "Travelling", createdAt: "08:14", slaMinutes: 18, reason: "Fast Moving" },
  { id: "PA-100483", priority: "High", grn: "GRN-2026-04417", truck: "TN-38-BX-7741", sku: "SKU-71120", product: "Hilti Anchor Bolts M12 (Box 100)", quantity: 84, uom: "BOX", weight: "268 kg", warehouse: "WH-CHN-01", zone: "Z-B", aisle: "A-01", rack: "R-A01-01", shelf: "S-A01-01-L3", bin: "B-A01-01-L3-02", operator: "Suresh Babu", status: "Assigned", createdAt: "08:16", slaMinutes: 26, reason: "Weight Capacity" },
  { id: "PA-100484", priority: "Medium", grn: "GRN-2026-04421", truck: "MH-12-KL-2290", sku: "SKU-65540", product: "3M Abrasive Discs 125mm", quantity: 600, uom: "EA", weight: "96 kg", warehouse: "WH-PNQ-02", zone: "Z-G", aisle: "A-09", rack: "R-A09-01", shelf: "S-A09-01-L2", bin: "B-A09-01-L2-05", operator: "Pooja Rane", status: "Scanning", createdAt: "08:22", slaMinutes: 34, reason: "Nearest Empty" },
  { id: "PA-100485", priority: "Critical", grn: "GRN-2026-04425", truck: "DXB-4471", sku: "SKU-51002", product: "Frozen Seafood Cartons 12kg", quantity: 180, uom: "CTN", weight: "2160 kg", warehouse: "WH-DXB-03", zone: "Z-J", aisle: "A-10", rack: "R-A10-01", shelf: "S-A10-01-L1", bin: "B-A10-01-L1-04", operator: "Yusuf Karim", status: "Waiting", createdAt: "08:28", slaMinutes: 9, reason: "Temperature" },
  { id: "PA-100486", priority: "High", grn: "GRN-2026-04426", truck: "MH-12-KL-2290", sku: "SKU-90422", product: "Siemens Contactor 3RT2", quantity: 320, uom: "EA", weight: "184 kg", warehouse: "WH-PNQ-02", zone: "Z-H", aisle: "A-09", rack: "R-A09-01", shelf: "S-A09-01-L1", bin: "B-A09-01-L1-02", operator: "Unassigned", status: "Waiting", createdAt: "08:31", slaMinutes: 41, reason: "FIFO" },
  { id: "PA-100487", priority: "Low", grn: "GRN-2026-04430", truck: "HH-WZ-118", sku: "SKU-33108", product: "Schneider MCB 32A 3P", quantity: 900, uom: "EA", weight: "270 kg", warehouse: "WH-HAM-04", zone: "Z-M", aisle: "A-12", rack: "R-A12-02", shelf: "S-A12-02-L3", bin: "B-A12-02-L3-06", operator: "Jonas Weber", status: "Confirmed", createdAt: "07:52", slaMinutes: 62, reason: "FEFO" },
  { id: "PA-100488", priority: "Medium", grn: "GRN-2026-04431", truck: "SG-TU-9902", sku: "SKU-77410", product: "Isopropyl Alcohol 20L Drum", quantity: 48, uom: "DRM", weight: "790 kg", warehouse: "WH-SIN-06", zone: "Z-L", aisle: "A-14", rack: "R-A14-01", shelf: "S-A14-01-L1", bin: "B-A14-01-L1-01", operator: "Nurul Aisyah", status: "Assigned", createdAt: "08:35", slaMinutes: 47, reason: "Hazard Rules" },
  { id: "PA-100489", priority: "High", grn: "GRN-2026-04412", truck: "TN-38-BX-7741", sku: "SKU-88301", product: "Makita 18V Battery Pack 5Ah", quantity: 150, uom: "EA", weight: "112 kg", warehouse: "WH-CHN-01", zone: "Z-C", aisle: "A-05", rack: "R-A05-02", shelf: "S-A05-02-L2", bin: "B-A05-02-L2-07", operator: "Divya Menon", status: "Completed", createdAt: "07:31", slaMinutes: 0, reason: "Fast Moving" },
];

export const recommendationReasons = [
  { code: "Nearest Empty", detail: "Bin is 14 m from dock D-04, shortest travel path for this pallet." },
  { code: "FIFO", detail: "Zone rotation policy keeps batch 2408A ahead of newer receipts." },
  { code: "FEFO", detail: "Expiry 2027-04-30 sequenced ahead of stock expiring later." },
  { code: "Weight Capacity", detail: "Shelf load after put away: 1,104 / 1,200 kg (92% within limit)." },
  { code: "Hazard Rules", detail: "No incompatible class 3 flammables within 6 m radius." },
  { code: "Temperature", detail: "Bin sensor holds 24.3 °C, inside SKU band of 15–30 °C." },
  { code: "Fast Moving", detail: "SKU-88214 velocity rank #4 — forward pick face recommended." },
];

export type Activity = {
  id: string;
  actor: string;
  action: string;
  target: string;
  time: string;
  kind: "putaway" | "zone" | "alert" | "crossdock" | "inventory";
};

export const activities: Activity[] = [
  { id: "ac1", actor: "Suresh Babu", action: "Confirmed put away of 240 EA", target: "B-A04-01-L2-03", time: "2 min ago", kind: "putaway" },
  { id: "ac2", actor: "System", action: "Zone Z-B crossed 95% occupancy threshold", target: "WH-CHN-01 / Z-B", time: "9 min ago", kind: "alert" },
  { id: "ac3", actor: "Anita Deshpande", action: "Created zone", target: "Z-H Component Store", time: "26 min ago", kind: "zone" },
  { id: "ac4", actor: "Michael Torres", action: "Cross-dock transfer released to dock D-11", target: "SHP-77120", time: "41 min ago", kind: "crossdock" },
  { id: "ac5", actor: "Divya Menon", action: "Inventory updated after put away", target: "SKU-88301 · +150 EA", time: "58 min ago", kind: "inventory" },
  { id: "ac6", actor: "System", action: "Rack blocked for maintenance inspection", target: "R-A02-02", time: "1 hr ago", kind: "alert" },
  { id: "ac7", actor: "Omar Al Farsi", action: "Temperature excursion cleared", target: "Z-J Deep Freeze Cell", time: "2 hr ago", kind: "alert" },
];

export type CrossDock = {
  id: string;
  inbound: string;
  inboundTruck: string;
  outbound: string;
  outboundTruck: string;
  dock: string;
  destination: string;
  pallets: number;
  status: "Arrived" | "Unloading" | "Staged" | "Loading" | "Dispatched";
  eta: string;
  progress: number;
};

export const crossDocks: CrossDock[] = [
  { id: "XD-5510", inbound: "GRN-2026-04417", inboundTruck: "TN-38-BX-7741", outbound: "SHP-77120", outboundTruck: "TN-09-CE-3318", dock: "D-04 → D-11", destination: "Bengaluru RDC", pallets: 18, status: "Loading", eta: "11:40", progress: 78 },
  { id: "XD-5511", inbound: "GRN-2026-04421", inboundTruck: "MH-12-KL-2290", outbound: "SHP-77124", outboundTruck: "MH-14-AA-9021", dock: "D-02 → D-07", destination: "Nashik Depot", pallets: 12, status: "Staged", eta: "12:15", progress: 54 },
  { id: "XD-5512", inbound: "GRN-2026-04425", inboundTruck: "DXB-4471", outbound: "SHP-77131", outboundTruck: "DXB-8802", dock: "D-01 → D-03", destination: "Abu Dhabi Retail", pallets: 24, status: "Unloading", eta: "13:05", progress: 31 },
  { id: "XD-5513", inbound: "GRN-2026-04430", inboundTruck: "HH-WZ-118", outbound: "SHP-77140", outboundTruck: "HH-KL-556", dock: "D-06 → D-09", destination: "Rotterdam Port", pallets: 30, status: "Dispatched", eta: "09:20", progress: 100 },
  { id: "XD-5514", inbound: "GRN-2026-04433", inboundTruck: "NJ-TR-4410", outbound: "SHP-77145", outboundTruck: "NJ-TR-6612", dock: "D-08 → D-14", destination: "Philadelphia Store 12", pallets: 9, status: "Arrived", eta: "14:30", progress: 8 },
];

export const utilizationTrend = [
  { day: "Mon", utilization: 71, putAway: 182, target: 78 },
  { day: "Tue", utilization: 74, putAway: 210, target: 78 },
  { day: "Wed", utilization: 76, putAway: 198, target: 78 },
  { day: "Thu", utilization: 79, putAway: 241, target: 78 },
  { day: "Fri", utilization: 81, putAway: 265, target: 78 },
  { day: "Sat", utilization: 77, putAway: 154, target: 78 },
  { day: "Sun", utilization: 73, putAway: 96, target: 78 },
];

export const zoneUtilizationChart = zones
  .filter((z) => z.warehouse === "WH-CHN-01")
  .map((z) => ({ name: z.code, utilization: Math.round((z.occupied / z.capacity) * 100), free: 100 - Math.round((z.occupied / z.capacity) * 100) }));

export const spaceSplit = [
  { name: "Occupied", value: totalOccupied, color: "var(--color-primary)" },
  { name: "Reserved", value: 11400, color: "var(--color-secondary)" },
  { name: "Available", value: totalCapacity - totalOccupied - 11400, color: "var(--color-success)" },
];

export const operatorPerformance = [
  { operator: "Suresh Babu", tasks: 64, avgMinutes: 4.2, accuracy: 99.4, shift: "A" },
  { operator: "Divya Menon", tasks: 58, avgMinutes: 4.6, accuracy: 98.9, shift: "A" },
  { operator: "Pooja Rane", tasks: 51, avgMinutes: 5.1, accuracy: 99.1, shift: "B" },
  { operator: "Yusuf Karim", tasks: 47, avgMinutes: 6.4, accuracy: 97.8, shift: "B" },
  { operator: "Jonas Weber", tasks: 44, avgMinutes: 5.8, accuracy: 98.2, shift: "C" },
  { operator: "Nurul Aisyah", tasks: 39, avgMinutes: 7.2, accuracy: 99.6, shift: "C" },
];

export const movementRanking = {
  fast: [
    { sku: "SKU-88214", item: "Bosch GSB 600 Impact Drill", picks: 412, location: "Z-C / R-A04-01" },
    { sku: "SKU-65540", item: "3M Abrasive Discs 125mm", picks: 388, location: "Z-C / R-A04-02" },
    { sku: "SKU-33108", item: "Schneider MCB 32A 3P", picks: 341, location: "Z-B / R-A01-01" },
    { sku: "SKU-88301", item: "Makita 18V Battery Pack 5Ah", picks: 305, location: "Z-C / R-A05-02" },
  ],
  slow: [
    { sku: "SKU-20114", item: "Legacy PLC Module S7-300", picks: 4, location: "Z-D / R-A07-03", ageDays: 214 },
    { sku: "SKU-44902", item: "Hydraulic Seal Kit HK-90", picks: 7, location: "Z-B / R-A03-06", ageDays: 168 },
    { sku: "SKU-19833", item: "Obsolete Ballast 400W", picks: 2, location: "Z-F / R-A08-01", ageDays: 301 },
    { sku: "SKU-60771", item: "Spare Conveyor Belt 12m", picks: 9, location: "Z-A / R-A06-01", ageDays: 122 },
  ],
};

export const emptyLocations = [
  { code: "B-A01-01-L1-04", zone: "Z-B", rack: "R-A01-01", capacity: 120, emptySince: "6 days" },
  { code: "B-A01-01-L5-01", zone: "Z-B", rack: "R-A01-01", capacity: 120, emptySince: "14 days" },
  { code: "B-A03-02-L2-08", zone: "Z-B", rack: "R-A03-02", capacity: 96, emptySince: "3 days" },
  { code: "B-A07-01-L4-02", zone: "Z-D", rack: "R-A07-01", capacity: 140, emptySince: "21 days" },
  { code: "B-A06-01-L3-05", zone: "Z-A", rack: "R-A06-01", capacity: 180, emptySince: "2 days" },
];

export const putAwayCycle = [
  { stage: "Waiting", minutes: 3.1 },
  { stage: "Assigned", minutes: 1.4 },
  { stage: "Travelling", minutes: 4.8 },
  { stage: "Scanning", minutes: 1.1 },
  { stage: "Confirmed", minutes: 0.6 },
];

// Deterministic bin grid used by the layout / heat map / visualization screens.
export function buildBinGrid(zoneCode: string, rows = 6, cols = 14) {
  const cells: Array<{ id: string; state: OccupancyState; pct: number; row: number; col: number }> = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const seed = `${zoneCode}-${r}-${c}`;
      const roll = rand(seed, 0, 99);
      let state: OccupancyState;
      if (roll > 96) state = "maintenance";
      else if (roll > 88) state = "reserved";
      else if (roll > 66) state = "full";
      else if (roll > 40) state = "nearly-full";
      else state = "available";
      const pct =
        state === "full"
          ? rand(seed + "p", 95, 100)
          : state === "nearly-full"
            ? rand(seed + "p", 75, 94)
            : state === "reserved"
              ? rand(seed + "p", 40, 80)
              : state === "maintenance"
                ? 0
                : rand(seed + "p", 5, 70);
      cells.push({
        id: `${zoneCode}-${String.fromCharCode(65 + r)}${String(c + 1).padStart(2, "0")}`,
        state,
        pct,
        row: r,
        col: c,
      });
    }
  }
  return cells;
}

export const notifications = [
  { id: "n1", title: "Zone Z-B at 95% capacity", detail: "Overflow routing enabled to Z-C", time: "9 min", tone: "warning" as const },
  { id: "n2", title: "Cold chain excursion resolved", detail: "Z-J returned to -18.6 °C", time: "2 hr", tone: "success" as const },
  { id: "n3", title: "Rack R-A02-02 blocked", detail: "Scheduled beam inspection", time: "1 hr", tone: "danger" as const },
  { id: "n4", title: "4 put away tasks breaching SLA", detail: "Reassign operators in queue", time: "12 min", tone: "warning" as const },
];
