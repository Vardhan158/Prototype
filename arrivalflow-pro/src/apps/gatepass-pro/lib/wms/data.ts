import type { AppNotification, GateEntry } from "./types";

export const VEHICLE_TYPES = [
  "32 ft Multi-Axle Container",
  "22 ft Truck (9 MT)",
  "17 ft Tata 407",
  "Reefer Container 20 ft",
  "Trailer 40 ft Flatbed",
  "Tempo Traveller / LCV",
];

export const TRANSPORTERS = [
  "Blue Dart Logistics Pvt Ltd",
  "VRL Roadlines",
  "TCI Freight",
  "Gati-KWE Express",
  "Safexpress Supply Chain",
  "Delhivery Heavy Freight",
];

export const MATERIAL_CATEGORIES = [
  "Raw Material - Polymer Granules",
  "Packaging - Corrugated Boxes",
  "FMCG - Beverages",
  "Electronics - Components",
  "Cold Chain - Dairy",
  "Spare Parts - Automotive",
];

export const HOLD_REASONS = [
  "Driver license expired",
  "PO quantity mismatch",
  "No dock availability",
  "Missing e-way bill",
  "Seal tampered",
  "Vendor not in approved list",
];

export const PO_DB: Record<
  string,
  { vendor: string; category: string; expected: string; dock: string; pallets: number }
> = {
  "4500128743": {
    vendor: "Aditya Polymers Ltd",
    category: "Raw Material - Polymer Granules",
    expected: "Today, 09:30",
    dock: "Dock 04",
    pallets: 18,
  },
  "4500128744": {
    vendor: "Shakti Packaging Industries",
    category: "Packaging - Corrugated Boxes",
    expected: "Today, 11:00",
    dock: "Dock 07",
    pallets: 26,
  },
  "4500128790": {
    vendor: "Nova Beverages Pvt Ltd",
    category: "FMCG - Beverages",
    expected: "Today, 13:45",
    dock: "Dock 02",
    pallets: 32,
  },
  "4500129011": {
    vendor: "Kirti Cold Chain Solutions",
    category: "Cold Chain - Dairy",
    expected: "Today, 15:20",
    dock: "Dock 09 (Reefer)",
    pallets: 12,
  },
};

export const PO_LIST = Object.keys(PO_DB);

export const OCR_PLATES = [
  "MH 12 QR 8841",
  "KA 05 MJ 3092",
  "GJ 01 KT 7745",
  "TN 22 BC 1180",
  "HR 55 AX 9032",
];

export const OCR_LICENSES = [
  {
    name: "Ramesh Kumar Yadav",
    phone: "+91 98213 44520",
    license: "MH1420190004512",
    licenseExpiry: "14 Mar 2029",
    govId: "XXXX XXXX 4471 (Aadhaar)",
  },
  {
    name: "Suresh Balaji Patil",
    phone: "+91 90045 77812",
    license: "KA0520170112238",
    licenseExpiry: "02 Sep 2027",
    govId: "XXXX XXXX 8820 (Aadhaar)",
  },
  {
    name: "Mohammed Irfan Shaikh",
    phone: "+91 88790 21134",
    license: "GJ0120210047719",
    licenseExpiry: "28 Jan 2026",
    govId: "XXXX XXXX 1092 (Aadhaar)",
  },
];

export const WAREHOUSES = ["WH-01 Bhiwandi DC", "WH-02 Chakan Plant", "WH-03 Hosur Hub"];

export function newTimeline(status: string, arrival: string) {
  return [
    { label: "Gate entry created", time: arrival, done: true },
    { label: "Security approved", time: arrival, done: status !== "Hold" && status !== "Rejected" },
    {
      label: "Waiting warehouse acceptance",
      time: status === "Waiting Warehouse" ? "In progress" : arrival,
      done: status === "Accepted" || status === "Exited",
    },
    {
      label: "Warehouse accepted / docked",
      time: status === "Accepted" || status === "Exited" ? arrival : "Pending",
      done: status === "Accepted" || status === "Exited",
    },
  ];
}

function entry(
  id: string,
  gateNo: string,
  status: GateEntry["status"],
  plate: string,
  vtype: string,
  transporter: string,
  driverIdx: number,
  po: string,
  arrival: string,
  extra: Partial<GateEntry> = {},
): GateEntry {
  const d = OCR_LICENSES[driverIdx % OCR_LICENSES.length]!;
  const p = PO_DB[po]!;
  return {
    id,
    gateNo,
    status,
    arrival,
    warehouse: WAREHOUSES[0]!,
    gate: "Gate 02 - Inbound",
    vehicle: {
      number: plate,
      type: vtype,
      transporter,
      truckPhoto: true,
      platePhoto: true,
    },
    driver: { ...d, photo: true },
    delivery: { po, ...p },
    timeline: newTimeline(status, arrival),
    ...extra,
  };
}

export const SEED_ENTRIES: GateEntry[] = [
  entry("GE-1", "GE-2608-0148", "Waiting Warehouse", "MH 12 QR 8841", VEHICLE_TYPES[0]!, TRANSPORTERS[1]!, 0, "4500128743", "08:42"),
  entry("GE-2", "GE-2608-0147", "Accepted", "KA 05 MJ 3092", VEHICLE_TYPES[1]!, TRANSPORTERS[2]!, 1, "4500128744", "08:05"),
  entry("GE-3", "GE-2608-0146", "Hold", "GJ 01 KT 7745", VEHICLE_TYPES[3]!, TRANSPORTERS[4]!, 2, "4500129011", "07:51", {
    holdReason: "Driver license expired",
  }),
  entry("GE-4", "GE-2608-0145", "Approved", "TN 22 BC 1180", VEHICLE_TYPES[4]!, TRANSPORTERS[0]!, 0, "4500128790", "07:20"),
  entry("GE-5", "GE-2608-0144", "Rejected", "HR 55 AX 9032", VEHICLE_TYPES[2]!, TRANSPORTERS[5]!, 1, "4500128743", "06:58", {
    holdReason: "Seal tampered",
  }),
  entry("GE-6", "GE-2608-0143", "Accepted", "MH 43 AT 2201", VEHICLE_TYPES[1]!, TRANSPORTERS[3]!, 2, "4500128744", "06:30"),
  entry("GE-7", "GE-2608-0142", "Hold", "RJ 14 GK 5567", VEHICLE_TYPES[0]!, TRANSPORTERS[1]!, 0, "4500128790", "06:12", {
    holdReason: "No dock availability",
  }),
  entry("GE-8", "GE-2608-0141", "Exited", "AP 09 CD 4410", VEHICLE_TYPES[2]!, TRANSPORTERS[2]!, 1, "4500129011", "05:40", {
    exitTime: "07:35",
  }),
];

export const SEED_NOTIFICATIONS: AppNotification[] = [
  {
    id: "n1",
    kind: "accepted",
    title: "Warehouse accepted KA 05 MJ 3092",
    body: "Dock 07 assigned. Unloading team notified.",
    time: "2 min ago",
    read: false,
  },
  {
    id: "n2",
    kind: "hold",
    title: "GJ 01 KT 7745 put on hold",
    body: "Driver license expired - supervisor approval required.",
    time: "18 min ago",
    read: false,
  },
  {
    id: "n3",
    kind: "rejected",
    title: "HR 55 AX 9032 rejected",
    body: "Seal tampered. Vehicle turned away from Gate 02.",
    time: "1 hr ago",
    read: true,
  },
  {
    id: "n4",
    kind: "message",
    title: "Shift note from Warehouse Manager",
    body: "Reefer dock 09 under maintenance until 14:00. Route cold chain to dock 10.",
    time: "2 hr ago",
    read: true,
  },
];