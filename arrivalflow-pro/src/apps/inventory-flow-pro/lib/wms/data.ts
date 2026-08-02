import type { InventoryStatus } from "./statuses";

export type LifecycleEvent = {
  id: string;
  status: InventoryStatus;
  title: string;
  user: string;
  role: string;
  timestamp: string;
  location: string;
  remarks: string;
  document?: string;
};

export type InventoryItem = {
  id: string;
  materialCode: string;
  materialName: string;
  category: string;
  serial: string;
  batch: string;
  warehouse: string;
  warehouseCode: string;
  zone: string;
  rack: string;
  shelf: string;
  bin: string;
  status: InventoryStatus;
  quantity: number;
  uom: string;
  unitValue: number;
  owner: string;
  ownerRole: string;
  supplier: string;
  po: string;
  grn: string;
  receivedOn: string;
  expiry: string;
  updatedAt: string;
  ageDays: number;
  temperature: string;
  events: LifecycleEvent[];
};

export const WAREHOUSES = [
  { code: "WH-CHN-01", name: "Chennai Central DC", city: "Chennai, IN", utilization: 87 },
  { code: "WH-PUN-02", name: "Pune Spare Parts Hub", city: "Pune, IN", utilization: 72 },
  { code: "WH-DXB-03", name: "Jebel Ali Cross-Dock", city: "Dubai, AE", utilization: 64 },
  { code: "WH-HAM-04", name: "Hamburg EU Depot", city: "Hamburg, DE", utilization: 91 },
];

const MATERIALS = [
  { code: "MAT-100241", name: "SKF 6205-2RS Deep Groove Bearing", cat: "Bearings", uom: "EA", val: 412 },
  { code: "MAT-100388", name: "Siemens 3RT2026 Power Contactor 25A", cat: "Electrical", uom: "EA", val: 3890 },
  { code: "MAT-100455", name: "Parker HFP Hydraulic Hose 3/8in", cat: "Hydraulics", uom: "M", val: 690 },
  { code: "MAT-100512", name: "Festo DSBC-50 Pneumatic Cylinder", cat: "Pneumatics", uom: "EA", val: 12450 },
  { code: "MAT-100677", name: "ABB ACS580 VFD 7.5kW", cat: "Drives", uom: "EA", val: 68200 },
  { code: "MAT-100731", name: "Loctite 243 Threadlocker 250ml", cat: "Consumables", uom: "BTL", val: 1875 },
  { code: "MAT-100804", name: "Stainless 316L Hex Bolt M12x60", cat: "Fasteners", uom: "BOX", val: 2240 },
  { code: "MAT-100929", name: "Schneider XB4 Emergency Stop Button", cat: "Electrical", uom: "EA", val: 1560 },
  { code: "MAT-101044", name: "Gates 8PK1650 Poly-V Drive Belt", cat: "Power Transmission", uom: "EA", val: 2180 },
  { code: "MAT-101190", name: "Danfoss MBS3000 Pressure Transmitter", cat: "Instrumentation", uom: "EA", val: 18700 },
  { code: "MAT-101276", name: "3M 2091 P100 Filter Cartridge", cat: "Safety", uom: "PK", val: 1340 },
  { code: "MAT-101388", name: "Mobil DTE 25 Hydraulic Oil 20L", cat: "Lubricants", uom: "DRM", val: 9450 },
  { code: "MAT-101465", name: "Omron E3Z-D62 Photoelectric Sensor", cat: "Automation", uom: "EA", val: 4320 },
  { code: "MAT-101533", name: "Grundfos CR3-8 Vertical Pump Seal Kit", cat: "Pumps", uom: "KIT", val: 7650 },
  { code: "MAT-101602", name: "Weidmuller WDU 2.5 Terminal Block", cat: "Electrical", uom: "PK", val: 980 },
  { code: "MAT-101744", name: "Trelleborg NBR O-Ring Set 90 Shore", cat: "Seals", uom: "SET", val: 1120 },
];

const SUPPLIERS = [
  "Hindustan Industrial Supplies Pvt Ltd",
  "Bosch Rexroth South Asia",
  "Emirates Technical Trading LLC",
  "Nordwest Industrie Handel GmbH",
  "Kirloskar Components Ltd",
];

const PEOPLE = [
  { name: "Ramesh Iyer", role: "Store Keeper" },
  { name: "Anita Deshmukh", role: "Inventory Manager" },
  { name: "Karan Malhotra", role: "Warehouse Manager" },
  { name: "Fatima Al Zahra", role: "Quality Inspection" },
  { name: "Sunil Prakash", role: "Assembly Manager" },
  { name: "Lena Brandt", role: "Procurement" },
];

const ZONES = ["INBOUND", "BULK-A", "BULK-B", "PICK-FACE", "QA-LAB", "QUARANTINE", "OUTBOUND"];

const STATUS_MIX: InventoryStatus[] = [
  "RECEIVED", "RECEIVED", "UNDER_INSPECTION", "UNDER_INSPECTION",
  "AVAILABLE", "AVAILABLE", "AVAILABLE", "AVAILABLE", "AVAILABLE", "AVAILABLE",
  "RESERVED", "RESERVED", "RESERVED", "RESERVED",
  "PICKED", "PICKED", "PICKED",
  "PACKED", "PACKED", "LOADED",
  "DISPATCHED", "DISPATCHED", "DELIVERED", "DELIVERED", "DELIVERED",
  "QUALITY_HOLD", "QUALITY_HOLD", "QUALITY_HOLD",
  "DAMAGED", "DAMAGED", "QUARANTINE", "QUARANTINE",
  "RECALL", "REJECTED", "REPAIR", "SCRAPPED", "RETURNED",
];

const PHASE_ORDER: InventoryStatus[] = [
  "RECEIVED", "UNDER_INSPECTION", "AVAILABLE", "RESERVED",
  "PICKED", "PACKED", "LOADED", "DISPATCHED", "DELIVERED",
];

const EVENT_COPY: Partial<Record<InventoryStatus, { title: string; remarks: string; loc: string }>> = {
  RECEIVED: { title: "Goods receipt posted", remarks: "GRN posted against PO. Pallet staged at inbound door D-04.", loc: "INBOUND / DOCK-04" },
  UNDER_INSPECTION: { title: "Inspection lot created", remarks: "Sampling plan AQL 1.0 applied. 8 of 8 characteristics recorded.", loc: "QA-LAB / BENCH-02" },
  AVAILABLE: { title: "Usage decision — accepted", remarks: "Stock transferred to unrestricted use and put away to pick face.", loc: "PICK-FACE / R12-S03" },
  RESERVED: { title: "Hard allocation created", remarks: "Reserved against material request for production line assembly.", loc: "PICK-FACE / R12-S03" },
  PICKED: { title: "Warehouse task confirmed", remarks: "RF-scanned pick confirmed, moved to outbound staging lane.", loc: "OUTBOUND / STAGE-A" },
  PACKED: { title: "Handling unit packed", remarks: "HU created with shipping label and tamper seal applied.", loc: "OUTBOUND / PACK-03" },
  LOADED: { title: "Loaded to vehicle", remarks: "HU scanned onto vehicle manifest at dispatch door.", loc: "OUTBOUND / DOOR-11" },
  DISPATCHED: { title: "Goods issue posted", remarks: "Shipment departed the yard. Carrier tracking reference issued.", loc: "YARD / GATE-02" },
  DELIVERED: { title: "Proof of delivery captured", remarks: "Consignee signature captured on driver device. Lifecycle closed.", loc: "CUSTOMER SITE" },
  QUALITY_HOLD: { title: "Stock blocked by QA", remarks: "Dimensional deviation beyond tolerance. NCR raised for disposition.", loc: "QA-LAB / HOLD-CAGE" },
  DAMAGED: { title: "Damage recorded", remarks: "Crush damage on outer carton found during putaway. Photos attached.", loc: "INBOUND / DAMAGE-BAY" },
  QUARANTINE: { title: "Moved to quarantine", remarks: "Supplier deviation notice received. Isolated pending investigation.", loc: "QUARANTINE / Q-CAGE-01" },
  RECALL: { title: "Recall issued", remarks: "Supplier field recall for affected batch range. Movement hard-blocked.", loc: "QUARANTINE / RECALL-PEN" },
  REJECTED: { title: "Usage decision — rejected", remarks: "Failed hardness test. Routed to NCR board for final decision.", loc: "QA-LAB / BENCH-01" },
  REPAIR: { title: "Sent to rework cell", remarks: "Rework order raised. Re-inspection required before release.", loc: "REPAIR CELL / WS-02" },
  SCRAPPED: { title: "Scrap document posted", remarks: "Written off at book value. Scrap bin SC-07 sealed.", loc: "SCRAP YARD" },
  RETURNED: { title: "Return delivery created", remarks: "Return to supplier raised against PO. Debit note pending.", loc: "OUTBOUND / RTS-LANE" },
};

function pad(n: number, len = 3) {
  return String(n).padStart(len, "0");
}

function iso(daysAgo: number, hour: number, minute: number) {
  const base = Date.UTC(2026, 6, 28, 0, 0, 0);
  const d = new Date(base - daysAgo * 86400000);
  d.setUTCHours(hour, minute, 0, 0);
  return d.toISOString();
}

function pathTo(status: InventoryStatus): InventoryStatus[] {
  const idx = PHASE_ORDER.indexOf(status);
  if (idx >= 0) return PHASE_ORDER.slice(0, idx + 1);
  switch (status) {
    case "QUALITY_HOLD":
    case "REJECTED":
      return ["RECEIVED", "UNDER_INSPECTION", status];
    case "REPAIR":
      return ["RECEIVED", "UNDER_INSPECTION", "REJECTED", "REPAIR"];
    case "SCRAPPED":
      return ["RECEIVED", "UNDER_INSPECTION", "QUALITY_HOLD", "SCRAPPED"];
    case "RETURNED":
      return ["RECEIVED", "UNDER_INSPECTION", "QUALITY_HOLD", "RETURNED"];
    case "DAMAGED":
      return ["RECEIVED", "DAMAGED"];
    case "QUARANTINE":
      return ["RECEIVED", "UNDER_INSPECTION", "QUARANTINE"];
    case "RECALL":
      return ["RECEIVED", "UNDER_INSPECTION", "AVAILABLE", "RECALL"];
    default:
      return ["RECEIVED"];
  }
}

function buildItem(i: number): InventoryItem {
  const mat = MATERIALS[i % MATERIALS.length]!;
  const status = STATUS_MIX[i % STATUS_MIX.length]!;
  const wh = WAREHOUSES[i % WAREHOUSES.length]!;
  const owner = PEOPLE[i % PEOPLE.length]!;
  const supplier = SUPPLIERS[i % SUPPLIERS.length]!;
  const age = 2 + ((i * 7) % 96);
  const chain = pathTo(status);
  const quantity = [4, 12, 25, 60, 8, 150, 36, 2][i % 8]!;

  const events: LifecycleEvent[] = chain.map((st, idx) => {
    const copy = EVENT_COPY[st] ?? EVENT_COPY.RECEIVED!;
    const actor = PEOPLE[(i + idx) % PEOPLE.length]!;
    return {
      id: `EVT-${pad(i, 3)}-${idx}`,
      status: st,
      title: copy.title,
      user: actor.name,
      role: actor.role,
      timestamp: iso(age - idx * Math.max(1, Math.floor(age / (chain.length + 1))), 7 + idx * 2, (i * 13 + idx * 7) % 60),
      location: `${wh.code} · ${copy.loc}`,
      remarks: copy.remarks,
      ...(idx === 0 ? { document: `GRN-2026-${pad(4100 + i, 4)}` } : {}),
    };
  });

  const zone =
    status === "RECEIVED" ? "INBOUND"
    : status === "UNDER_INSPECTION" || status === "QUALITY_HOLD" ? "QA-LAB"
    : status === "QUARANTINE" || status === "RECALL" ? "QUARANTINE"
    : (["PICKED", "PACKED", "LOADED", "DISPATCHED", "DELIVERED"] as string[]).includes(status) ? "OUTBOUND"
    : ZONES[i % ZONES.length]!;


  return {
    id: `INV-${pad(90000 + i * 37, 5)}`,
    materialCode: mat.code,
    materialName: mat.name,
    category: mat.cat,
    serial: `SN-${wh.code.slice(3, 6)}-${pad(48210 + i * 91, 5)}`,
    batch: `B2026-${pad(310 + (i % 24), 3)}`,
    warehouse: wh.name,
    warehouseCode: wh.code,
    zone,
    rack: `R${pad(4 + (i % 18), 2)}`,
    shelf: `S${pad(1 + (i % 6), 2)}`,
    bin: `BIN-${pad(100 + i * 3, 3)}`,
    status,
    quantity,
    uom: mat.uom,
    unitValue: mat.val,
    owner: owner.name,
    ownerRole: owner.role,
    supplier,
    po: `PO-2026-${pad(7700 + i * 3, 4)}`,
    grn: `GRN-2026-${pad(4100 + i, 4)}`,
    receivedOn: iso(age, 8, 15),
    expiry: iso(-(180 + (i % 200)), 23, 59),
    updatedAt: events[events.length - 1]!.timestamp,
    ageDays: age,
    temperature: i % 5 === 0 ? "2-8 °C controlled" : "Ambient",
    events,
  };
}

export const SEED_INVENTORY: InventoryItem[] = Array.from({ length: 74 }, (_, i) => buildItem(i));

export type Reservation = {
  id: string;
  request: string;
  itemId: string;
  material: string;
  requestedBy: string;
  department: string;
  reservedQty: number;
  availableQty: number;
  priority: "Critical" | "High" | "Medium" | "Low";
  expiry: string;
  status: "Active" | "Expiring" | "Expired" | "Released";
};

export const RESERVATIONS: Reservation[] = [
  { id: "RSV-40218", request: "MR-2026-1180", itemId: "INV-90370", material: "ABB ACS580 VFD 7.5kW", requestedBy: "Sunil Prakash", department: "Assembly Line 3", reservedQty: 6, availableQty: 14, priority: "Critical", expiry: "2026-08-02T18:00:00Z", status: "Expiring" },
  { id: "RSV-40219", request: "MR-2026-1181", itemId: "INV-90407", material: "Festo DSBC-50 Pneumatic Cylinder", requestedBy: "Karan Malhotra", department: "Maintenance", reservedQty: 12, availableQty: 40, priority: "High", expiry: "2026-08-09T18:00:00Z", status: "Active" },
  { id: "RSV-40220", request: "MR-2026-1184", itemId: "INV-90444", material: "SKF 6205-2RS Deep Groove Bearing", requestedBy: "Anita Deshmukh", department: "Spares Counter", reservedQty: 60, availableQty: 210, priority: "Medium", expiry: "2026-08-14T18:00:00Z", status: "Active" },
  { id: "RSV-40221", request: "MR-2026-1190", itemId: "INV-90481", material: "Danfoss MBS3000 Pressure Transmitter", requestedBy: "Sunil Prakash", department: "Instrumentation", reservedQty: 4, availableQty: 9, priority: "Critical", expiry: "2026-07-30T18:00:00Z", status: "Expiring" },
  { id: "RSV-40222", request: "MR-2026-1193", itemId: "INV-90518", material: "Gates 8PK1650 Poly-V Drive Belt", requestedBy: "Ramesh Iyer", department: "Assembly Line 1", reservedQty: 8, availableQty: 22, priority: "Low", expiry: "2026-07-26T18:00:00Z", status: "Expired" },
  { id: "RSV-40223", request: "MR-2026-1197", itemId: "INV-90555", material: "Mobil DTE 25 Hydraulic Oil 20L", requestedBy: "Lena Brandt", department: "Hamburg Ops", reservedQty: 3, availableQty: 11, priority: "High", expiry: "2026-08-05T18:00:00Z", status: "Active" },
];

export type PickList = {
  id: string;
  wave: string;
  operator: string;
  route: string;
  zone: string;
  totalLines: number;
  pickedLines: number;
  device: string;
  startedAt: string;
  priority: "Critical" | "High" | "Medium";
  status: "In Progress" | "Queued" | "Completed" | "Exception";
};

export const PICK_LISTS: PickList[] = [
  { id: "PCK-88410", wave: "WAVE-2026-221", operator: "Ramesh Iyer", route: "Serpentine A → C", zone: "PICK-FACE", totalLines: 24, pickedLines: 18, device: "RF-Zebra TC52 #14", startedAt: "07:42", priority: "Critical", status: "In Progress" },
  { id: "PCK-88411", wave: "WAVE-2026-221", operator: "Deepak Nair", route: "Zone B loop", zone: "BULK-B", totalLines: 16, pickedLines: 16, device: "RF-Zebra TC52 #09", startedAt: "07:05", priority: "High", status: "Completed" },
  { id: "PCK-88412", wave: "WAVE-2026-222", operator: "Sana Qureshi", route: "Cluster pick 4-cart", zone: "PICK-FACE", totalLines: 32, pickedLines: 9, device: "Voice HU-6100", startedAt: "08:20", priority: "High", status: "In Progress" },
  { id: "PCK-88413", wave: "WAVE-2026-222", operator: "Marc Weber", route: "Bulk letdown", zone: "BULK-A", totalLines: 12, pickedLines: 4, device: "RF-Zebra TC52 #22", startedAt: "08:35", priority: "Medium", status: "Exception" },
  { id: "PCK-88414", wave: "WAVE-2026-223", operator: "Unassigned", route: "Pending wave release", zone: "PICK-FACE", totalLines: 20, pickedLines: 0, device: "—", startedAt: "—", priority: "Medium", status: "Queued" },
];

export type PackJob = {
  id: string;
  station: string;
  packer: string;
  order: string;
  packages: number;
  weight: string;
  dims: string;
  seal: string;
  label: string;
  progress: number;
  status: "Packing" | "Sealed" | "Awaiting Label" | "Completed";
};

export const PACK_JOBS: PackJob[] = [
  { id: "HU-556201", station: "PACK-01", packer: "Priya Menon", order: "SO-2026-3341", packages: 3, weight: "42.6 kg", dims: "120 × 80 × 96 cm", seal: "SEAL-991204", label: "GS1-128 printed", progress: 100, status: "Completed" },
  { id: "HU-556202", station: "PACK-02", packer: "Arjun Rao", order: "SO-2026-3344", packages: 2, weight: "18.2 kg", dims: "60 × 40 × 42 cm", seal: "SEAL-991205", label: "GS1-128 printed", progress: 82, status: "Sealed" },
  { id: "HU-556203", station: "PACK-03", packer: "Ramesh Iyer", order: "SO-2026-3349", packages: 5, weight: "96.4 kg", dims: "120 × 100 × 120 cm", seal: "Pending", label: "Awaiting print", progress: 55, status: "Packing" },
  { id: "HU-556204", station: "PACK-01", packer: "Priya Menon", order: "SO-2026-3352", packages: 1, weight: "7.8 kg", dims: "40 × 30 × 25 cm", seal: "SEAL-991207", label: "Reprint required", progress: 70, status: "Awaiting Label" },
];

export type DispatchOrder = {
  id: string;
  order: string;
  vehicle: string;
  container: string;
  driver: string;
  destination: string;
  carrier: string;
  tracking: string;
  hus: number;
  etaHours: number;
  progress: number;
  status: "Loading" | "Dispatched" | "In Transit" | "Delivered" | "Delayed";
};

export const DISPATCH_ORDERS: DispatchOrder[] = [
  { id: "DSP-77210", order: "SO-2026-3341", vehicle: "TN-38-AC-7741", container: "MSKU-4471902", driver: "Vikram Singh", destination: "Coimbatore Plant 2", carrier: "Blue Dart Surface", tracking: "BD-88213409771", hus: 6, etaHours: 5, progress: 68, status: "In Transit" },
  { id: "DSP-77211", order: "SO-2026-3344", vehicle: "MH-12-QR-3390", container: "—", driver: "Sadiq Khan", destination: "Pune Line 4", carrier: "Safexpress", tracking: "SFX-6620119", hus: 2, etaHours: 2, progress: 90, status: "In Transit" },
  { id: "DSP-77212", order: "SO-2026-3349", vehicle: "Dock 11 assigned", container: "TGHU-7712043", driver: "Awaiting", destination: "Jebel Ali FZ", carrier: "DP World Feeder", tracking: "Pending", hus: 5, etaHours: 0, progress: 24, status: "Loading" },
  { id: "DSP-77213", order: "SO-2026-3330", vehicle: "HH-KL-2211", container: "HLXU-9903118", driver: "Jonas Meyer", destination: "Bremen Assembly", carrier: "DB Schenker", tracking: "DBS-4471209", hus: 9, etaHours: 14, progress: 46, status: "Delayed" },
  { id: "DSP-77214", order: "SO-2026-3318", vehicle: "TN-01-BZ-1180", container: "—", driver: "Mohan Das", destination: "Chennai Service Centre", carrier: "Own Fleet", tracking: "OWN-220119", hus: 4, etaHours: 0, progress: 100, status: "Delivered" },
];

export type AlertItem = {
  id: string;
  type: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  title: string;
  detail: string;
  raised: string;
  owner: string;
  count: number;
};

export const ALERTS: AlertItem[] = [
  { id: "ALT-9001", type: "Recall", severity: "Critical", title: "Supplier recall on batch B2026-318", detail: "Bosch Rexroth field recall covers 3 batches across Chennai and Pune. All movements hard-blocked.", raised: "12 min ago", owner: "Fatima Al Zahra", count: 7 },
  { id: "ALT-9002", type: "Quality Hold", severity: "High", title: "Items stuck in quality hold > 14 days", detail: "9 handling units awaiting NCR disposition beyond SLA. Blocked value ₹18.4L.", raised: "1 hr ago", owner: "Fatima Al Zahra", count: 9 },
  { id: "ALT-9003", type: "Reservation", severity: "High", title: "Reservations expiring within 24 hours", detail: "2 critical reservations for Assembly Line 3 will auto-release tonight at 18:00.", raised: "2 hrs ago", owner: "Anita Deshmukh", count: 2 },
  { id: "ALT-9004", type: "Low Stock", severity: "Medium", title: "Below reorder point in pick face", detail: "5 fast-moving SKUs dropped under safety stock at WH-CHN-01.", raised: "3 hrs ago", owner: "Lena Brandt", count: 5 },
  { id: "ALT-9005", type: "Picking", severity: "Medium", title: "Pending picking beyond wave cut-off", detail: "Wave WAVE-2026-222 has 23 open lines with 40 minutes to cut-off.", raised: "35 min ago", owner: "Karan Malhotra", count: 23 },
  { id: "ALT-9006", type: "Dispatch", severity: "High", title: "Dispatch delayed at Hamburg depot", detail: "DSP-77213 held at gate, customs paperwork pending for 4 hours.", raised: "4 hrs ago", owner: "Lena Brandt", count: 1 },
  { id: "ALT-9007", type: "Aging", severity: "Low", title: "Slow-moving inventory > 90 days", detail: "11 line items with no movement in the last quarter across bulk zones.", raised: "Yesterday", owner: "Anita Deshmukh", count: 11 },
];

export const STATUS_TREND = [
  { week: "W22", available: 1180, reserved: 320, picked: 210, blocked: 96, dispatched: 260 },
  { week: "W23", available: 1245, reserved: 348, picked: 232, blocked: 88, dispatched: 288 },
  { week: "W24", available: 1198, reserved: 372, picked: 254, blocked: 112, dispatched: 301 },
  { week: "W25", available: 1310, reserved: 405, picked: 268, blocked: 104, dispatched: 322 },
  { week: "W26", available: 1402, reserved: 428, picked: 291, blocked: 121, dispatched: 344 },
  { week: "W27", available: 1366, reserved: 461, picked: 305, blocked: 98, dispatched: 366 },
  { week: "W28", available: 1448, reserved: 486, picked: 318, blocked: 92, dispatched: 389 },
];

export const AGING_BUCKETS = [
  { bucket: "0-15 d", lines: 412, value: 92.4 },
  { bucket: "16-30 d", lines: 286, value: 71.2 },
  { bucket: "31-60 d", lines: 198, value: 54.8 },
  { bucket: "61-90 d", lines: 96, value: 28.6 },
  { bucket: "90+ d", lines: 47, value: 19.3 },
];

export const HEATMAP_ZONES = ZONES;

export const ACTIVITY_FEED = [
  { id: "ACT-1", user: "Fatima Al Zahra", role: "Quality Inspection", action: "released 4 HUs from quality hold", target: "INV-90222", time: "3 min ago", tone: "success" as const },
  { id: "ACT-2", user: "Karan Malhotra", role: "Warehouse Manager", action: "posted goods issue for shipment", target: "DSP-77211", time: "11 min ago", tone: "primary" as const },
  { id: "ACT-3", user: "System", role: "Lifecycle Engine", action: "auto-blocked recall batch", target: "B2026-318", time: "18 min ago", tone: "danger" as const },
  { id: "ACT-4", user: "Ramesh Iyer", role: "Store Keeper", action: "confirmed 18 pick lines on wave", target: "WAVE-2026-221", time: "26 min ago", tone: "info" as const },
  { id: "ACT-5", user: "Anita Deshmukh", role: "Inventory Manager", action: "extended reservation expiry by 48h", target: "RSV-40219", time: "42 min ago", tone: "teal" as const },
  { id: "ACT-6", user: "Sunil Prakash", role: "Assembly Manager", action: "raised material request", target: "MR-2026-1197", time: "1 hr ago", tone: "violet" as const },
];

export const REPORTS = [
  { id: "RPT-01", name: "Inventory Status Summary", desc: "Stock by status, warehouse and owner with blocked vs unrestricted split.", rows: 1482, freq: "Daily 06:00", format: "XLSX · PDF", owner: "Inventory Manager" },
  { id: "RPT-02", name: "Inventory Aging", desc: "Aging buckets with valuation exposure and slow-mover flags.", rows: 1039, freq: "Weekly Mon", format: "XLSX", owner: "Inventory Manager" },
  { id: "RPT-03", name: "Blocked Inventory", desc: "Quality hold, quarantine, damaged and recall stock with hold duration.", rows: 148, freq: "Daily 07:00", format: "PDF", owner: "Quality Inspection" },
  { id: "RPT-04", name: "Reservation Report", desc: "Open reservations, coverage, expiry risk and auto-release forecast.", rows: 286, freq: "Twice daily", format: "XLSX · CSV", owner: "Warehouse Manager" },
  { id: "RPT-05", name: "Dispatch Report", desc: "Shipments, carriers, on-time performance and POD status.", rows: 512, freq: "Daily 20:00", format: "PDF · CSV", owner: "Warehouse Manager" },
  { id: "RPT-06", name: "Status Transition Report", desc: "Full transition audit trail with actor, reason code and approvals.", rows: 6841, freq: "On demand", format: "CSV", owner: "Warehouse Manager" },
  { id: "RPT-07", name: "Warehouse Performance", desc: "Throughput, dock-to-stock, pick accuracy and utilisation by site.", rows: 96, freq: "Monthly", format: "PDF", owner: "Warehouse Manager" },
];

export const ROLES = PEOPLE;
export const SUPPLIER_LIST = SUPPLIERS;
