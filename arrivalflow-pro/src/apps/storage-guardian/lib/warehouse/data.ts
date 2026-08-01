import type {
  AuditEntry,
  HazardClass,
  Item,
  ItemCategory,
  PutAwayTask,
  StorageLocation,
  WarehouseAlert,
  Zone,
  ZoneId,
} from "./types";

export const ZONES: Zone[] = [
  {
    id: "SERVER",
    name: "Server Zone",
    prefix: "SERVER",
    tempControlled: false,
    secure: false,
    hazardAllowed: ["None", "ESD Sensitive"],
    description: "Rack, blade and tower servers on heavy-duty racking.",
  },
  {
    id: "NETWORK",
    name: "Network Zone",
    prefix: "NETWORK",
    tempControlled: false,
    secure: false,
    hazardAllowed: ["None", "ESD Sensitive"],
    description: "Routers, switches, firewalls and transceivers.",
  },
  {
    id: "STORAGE",
    name: "Storage Zone",
    prefix: "STORAGE",
    tempControlled: false,
    secure: false,
    hazardAllowed: ["None", "ESD Sensitive"],
    description: "HDD / SSD / SAN / NAS arrays and disk shelves.",
  },
  {
    id: "SPARE",
    name: "Spare Parts Zone",
    prefix: "SPARE",
    tempControlled: false,
    secure: false,
    hazardAllowed: ["None", "ESD Sensitive"],
    description: "Bin storage for RAM, CPU, NIC and fan modules.",
  },
  {
    id: "CABLE",
    name: "Cable & Accessories Zone",
    prefix: "CABLE",
    tempControlled: false,
    secure: false,
    hazardAllowed: ["None"],
    description: "Bin storage for cables, connectors and small accessories.",
  },
  {
    id: "POWER",
    name: "Power Equipment Zone (Ground)",
    prefix: "POWER",
    tempControlled: false,
    secure: false,
    hazardAllowed: ["None", "Li-ion Battery", "Lead Acid"],
    description: "Ground level UPS/PDU bays and the segregated battery area.",
  },
  {
    id: "HIGHVALUE",
    name: "High-Value Secure Zone",
    prefix: "HIVAL",
    tempControlled: true,
    secure: true,
    hazardAllowed: ["None", "ESD Sensitive"],
    description: "Caged, access-controlled area for enterprise-grade assets.",
  },
  {
    id: "CLIMATE",
    name: "Climate-Controlled Zone",
    prefix: "CLIMA",
    tempControlled: true,
    secure: false,
    hazardAllowed: ["None", "ESD Sensitive"],
    description: "Humidity and temperature regulated shelving.",
  },
  {
    id: "RETURN",
    name: "Return / Repair Zone",
    prefix: "RETURN",
    tempControlled: false,
    secure: false,
    hazardAllowed: ["None", "ESD Sensitive", "Li-ion Battery", "Lead Acid"],
    description: "Quarantine for failed inspections and RMA processing.",
  },
  {
    id: "SCRAP",
    name: "Scrap / E-Waste Zone",
    prefix: "SCRAP",
    tempControlled: false,
    secure: false,
    hazardAllowed: ["None", "ESD Sensitive", "Li-ion Battery", "Lead Acid", "Flammable"],
    description: "Certified disposal staging for damaged equipment.",
  },
  {
    id: "OVERFLOW",
    name: "Overflow / Temporary Area",
    prefix: "OVFLW",
    tempControlled: false,
    secure: false,
    hazardAllowed: ["None", "ESD Sensitive", "Li-ion Battery", "Lead Acid"],
    description: "Temporary buffer used when a primary zone is saturated.",
  },
];

export const zoneById = (id: ZoneId) => ZONES.find((z) => z.id === id)!;

/** Deterministic pseudo-random so SSR and client render identically. */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}

interface ZoneLayout {
  zone: ZoneId;
  racks: number;
  shelves: number;
  bins: number;
  capacity: number;
  fill: [number, number];
}

const LAYOUT: ZoneLayout[] = [
  { zone: "SERVER", racks: 6, shelves: 4, bins: 0, capacity: 42, fill: [0.5, 0.98] },
  { zone: "NETWORK", racks: 4, shelves: 4, bins: 0, capacity: 30, fill: [0.3, 0.9] },
  { zone: "STORAGE", racks: 3, shelves: 4, bins: 0, capacity: 36, fill: [0.4, 0.95] },
  { zone: "SPARE", racks: 3, shelves: 3, bins: 4, capacity: 60, fill: [0.2, 0.85] },
  { zone: "CABLE", racks: 2, shelves: 3, bins: 4, capacity: 80, fill: [0.2, 0.8] },
  { zone: "POWER", racks: 3, shelves: 0, bins: 0, capacity: 20, fill: [0.4, 1] },
  { zone: "HIGHVALUE", racks: 2, shelves: 3, bins: 0, capacity: 18, fill: [0.3, 0.9] },
  { zone: "CLIMATE", racks: 2, shelves: 4, bins: 0, capacity: 24, fill: [0.3, 0.85] },
  { zone: "RETURN", racks: 2, shelves: 2, bins: 0, capacity: 40, fill: [0.1, 0.5] },
  { zone: "SCRAP", racks: 1, shelves: 2, bins: 0, capacity: 50, fill: [0.1, 0.6] },
  { zone: "OVERFLOW", racks: 2, shelves: 2, bins: 0, capacity: 60, fill: [0.4, 0.9] },
];

export function buildLocations(): StorageLocation[] {
  const rand = seeded(20260731);
  const out: StorageLocation[] = [];

  for (const layout of LAYOUT) {
    const zone = zoneById(layout.zone);
    for (let r = 1; r <= layout.racks; r++) {
      const isGround = layout.zone === "POWER";
      const rackCode = isGround ? `G${r}` : `R${r}`;
      const shelfCount = layout.shelves || 1;

      for (let s = 1; s <= shelfCount; s++) {
        const binCount = layout.bins || 1;
        for (let b = 1; b <= binCount; b++) {
          let code = `${zone.prefix}-${rackCode}`;
          if (layout.shelves) code += `-S${s}`;
          if (layout.bins) code += `-B${b}`;

          const capacity = layout.capacity;
          const ratio = layout.fill[0] + rand() * (layout.fill[1] - layout.fill[0]);
          let used = Math.min(capacity, Math.round(capacity * ratio));
          let status: StorageLocation["status"] = used >= capacity ? "Full" : "Available";
          const roll = rand();
          if (roll > 0.97) {
            status = "Maintenance";
            used = 0;
          } else if (roll > 0.955) {
            status = "Blocked";
          }

          out.push({
            id: code,
            code,
            zone: layout.zone,
            rack: rackCode,
            shelf: layout.shelves ? `S${s}` : undefined,
            bin: layout.bins ? `B${b}` : undefined,
            capacity,
            used,
            status,
          });
        }
      }
    }
  }
  return out;
}

export const CATEGORIES: ItemCategory[] = [
  "Servers (Rack/Blade/Tower)",
  "Network Equipment (Router/Switch)",
  "Storage Devices (HDD/SSD/SAN/NAS)",
  "RAM/CPU/NIC/Fans",
  "Cables/Connectors",
  "UPS/PDU",
  "Batteries (Li-ion/Lead Acid)",
  "Sensitive Electronics",
  "High-Value Enterprise Equipment",
  "Returned/Defective Items",
  "Scrap/Damaged Items",
];

export const HAZARDS: HazardClass[] = [
  "None",
  "Li-ion Battery",
  "Lead Acid",
  "ESD Sensitive",
  "Flammable",
];

export const STAFF = ["A. Rahman", "L. Whitfield", "M. Osei", "K. Tanaka", "D. Silva"];

export const SUPPLIERS = ["Dell EMC", "Cisco Systems", "Vertiv", "Supermicro", "Schneider APC"];

export const CURRENT_USER = "S. Marino (Warehouse Manager)";

const T = (mins: number) => new Date(Date.UTC(2026, 6, 31, 9, 0) - mins * 60000).toISOString();

export const SEED_ITEMS: Item[] = [
  {
    id: "ITM-1001",
    name: "PowerEdge R760 Rack Server",
    category: "Servers (Rack/Blade/Tower)",
    code: "DC-SRV-1001",
    hazard: "ESD Sensitive",
    temp: "Ambient",
    size: "Large",
    weightKg: 32,
    valueUsd: 14200,
    qty: 4,
    po: "PO-88412",
    asn: "ASN-55120",
    supplier: "Dell EMC",
    stage: "completed",
    status: "Stored",
    locationId: "SERVER-R1-S1",
    inspection: { result: "Pass", notes: "Seals intact, no transit damage." },
    createdAt: T(600),
  },
  {
    id: "ITM-1002",
    name: "Catalyst 9300 48-Port Switch",
    category: "Network Equipment (Router/Switch)",
    code: "DC-NET-1002",
    hazard: "ESD Sensitive",
    temp: "Ambient",
    size: "Medium",
    weightKg: 8,
    valueUsd: 6100,
    qty: 6,
    po: "PO-88420",
    asn: "ASN-55133",
    supplier: "Cisco Systems",
    stage: "completed",
    status: "Stored",
    locationId: "NETWORK-R1-S1",
    inspection: { result: "Pass", notes: "Verified against ASN." },
    createdAt: T(520),
  },
  {
    id: "ITM-1003",
    name: "Liebert GXT5 6kVA UPS",
    category: "UPS/PDU",
    code: "DC-PWR-1003",
    hazard: "Lead Acid",
    temp: "Ambient",
    size: "Large",
    weightKg: 78,
    valueUsd: 4300,
    qty: 2,
    po: "PO-88431",
    asn: "ASN-55140",
    supplier: "Vertiv",
    stage: "capacity",
    status: "In Pipeline",
    inspection: { result: "Pass", notes: "Battery terminals sealed." },
    createdAt: T(180),
  },
  {
    id: "ITM-1004",
    name: "DDR5 64GB ECC RDIMM",
    category: "RAM/CPU/NIC/Fans",
    code: "DC-SPR-1004",
    hazard: "ESD Sensitive",
    temp: "Climate Controlled",
    size: "Small",
    weightKg: 0.2,
    valueUsd: 420,
    qty: 48,
    po: "PO-88444",
    asn: "ASN-55151",
    supplier: "Supermicro",
    stage: "inspection",
    status: "In Pipeline",
    createdAt: T(90),
  },
  {
    id: "ITM-1005",
    name: "Defective NVMe Shelf (RMA)",
    category: "Returned/Defective Items",
    code: "DC-RTN-1005",
    hazard: "ESD Sensitive",
    temp: "Ambient",
    size: "Medium",
    weightKg: 12,
    valueUsd: 900,
    qty: 1,
    po: "PO-88399",
    asn: "ASN-55102",
    supplier: "Dell EMC",
    stage: "completed",
    status: "Quarantine",
    locationId: "RETURN-R1-S1",
    inspection: { result: "Fail", notes: "Backplane cracked in transit." },
    createdAt: T(400),
  },
];

export const SEED_TASKS: PutAwayTask[] = [
  {
    id: "TSK-2001",
    itemId: "ITM-1003",
    locationCode: "POWER-G1",
    assignee: "A. Rahman",
    priority: "High",
    status: "Pending",
    createdAt: T(120),
  },
  {
    id: "TSK-2002",
    itemId: "ITM-1004",
    locationCode: "SPARE-R1-S1-B1",
    assignee: "M. Osei",
    priority: "Normal",
    status: "Pending",
    createdAt: T(60),
  },
];

export const SEED_ALERTS: WarehouseAlert[] = [
  {
    id: "ALR-3001",
    severity: "critical",
    type: "Zone Full",
    message: "Server Zone utilisation is above 90% — racks R1 to R3 are saturated.",
    suggestion: "Create new rack SERVER-R7 or transfer aged inventory to overflow.",
    resolved: false,
    createdAt: T(45),
  },
  {
    id: "ALR-3002",
    severity: "warning",
    type: "ASN/PO Mismatch",
    message: "ASN-55151 declared 50 units, 48 units received against PO-88444.",
    suggestion: "Record variance of -2 and route the shipment to the inspection zone.",
    itemId: "ITM-1004",
    resolved: false,
    createdAt: T(88),
  },
  {
    id: "ALR-3003",
    severity: "info",
    type: "Quality Failed",
    message: "ITM-1005 failed inspection and was moved to the Return/Repair Zone.",
    suggestion: "Raise supplier RMA claim with Dell EMC.",
    itemId: "ITM-1005",
    resolved: true,
    createdAt: T(390),
  },
];

export const SEED_AUDIT: AuditEntry[] = [
  {
    id: "AUD-4001",
    actor: CURRENT_USER,
    action: "Storage Completed",
    entity: "ITM-1001",
    before: "Put-Away Confirmed",
    after: "Stored @ SERVER-R1-S1",
    createdAt: T(560),
  },
  {
    id: "AUD-4002",
    actor: "L. Whitfield",
    action: "Scan & Confirm Put-Away",
    entity: "ITM-1002",
    before: "Task TSK-1998 Pending",
    after: "Confirmed @ NETWORK-R1-S1",
    createdAt: T(500),
  },
  {
    id: "AUD-4003",
    actor: "K. Tanaka",
    action: "Quality Inspection",
    entity: "ITM-1005",
    before: "Awaiting inspection",
    after: "Failed — routed to RETURN-R1-S1",
    createdAt: T(392),
  },
  {
    id: "AUD-4004",
    actor: "M. Osei",
    action: "Document Management & OCR",
    entity: "ITM-1004",
    before: "ASN-55151 expected 50",
    after: "Received 48 (variance -2)",
    createdAt: T(89),
  },
];
