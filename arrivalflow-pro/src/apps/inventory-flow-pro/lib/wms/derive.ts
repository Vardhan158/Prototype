import type { InventoryItem } from "./data";

function seed(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export function pick<T>(arr: readonly T[], key: string, salt = ""): T {
  return arr[seed(key + salt) % arr.length]!;
}

export function pickNumber(key: string, min: number, max: number) {
  return min + (seed(key) % (max - min + 1));
}

export const HOLD_REASONS = [
  "Dimensional deviation beyond drawing tolerance",
  "Missing material test certificate (EN 10204 3.1)",
  "Surface corrosion observed on inspection sample",
  "Batch potency below specification limit",
  "Supplier deviation notice received",
  "Torque value out of specification on sample lot",
];

export const DAMAGE_REASONS = [
  "Forklift impact during putaway",
  "Crush damage to outer carton in transit",
  "Water ingress from container leak",
  "Pallet collapse in bulk rack",
  "Dropped during handling unit transfer",
];

export const QUARANTINE_REASONS = [
  "Awaiting supplier 8D investigation",
  "Cross-contamination risk in shared container",
  "Country-of-origin documentation mismatch",
  "Temperature excursion during transit",
];

export const RECALL_REASONS = [
  "Supplier field recall — casting porosity",
  "Regulatory recall — non-compliant marking",
  "Batch traceability failure at supplier",
];

export const INSPECTORS = [
  "Fatima Al Zahra",
  "Nikhil Bansal",
  "Greta Hoffmann",
  "Divya Sundaram",
];

export const SEVERITIES = ["Critical", "High", "Medium", "Low"] as const;

export const NCR_PREFIX = "NCR-2026-";

export function holdMeta(item: InventoryItem) {
  return {
    reason: pick(HOLD_REASONS, item.id),
    inspector: pick(INSPECTORS, item.id, "insp"),
    ncr: `${NCR_PREFIX}${1200 + (seed(item.id) % 400)}`,
    daysHeld: pickNumber(item.id + "held", 2, 26),
    lot: `LOT-${9000 + (seed(item.id) % 900)}`,
  };
}

export function damageMeta(item: InventoryItem) {
  return {
    reason: pick(DAMAGE_REASONS, item.id),
    severity: pick(SEVERITIES, item.id, "sev"),
    claim: `CLM-2026-${400 + (seed(item.id) % 200)}`,
    photos: 2 + (seed(item.id) % 3),
    assessor: pick(INSPECTORS, item.id, "asr"),
    lossValue: item.quantity * item.unitValue,
  };
}

export function quarantineMeta(item: InventoryItem) {
  return {
    reason: pick(QUARANTINE_REASONS, item.id),
    area: `Q-CAGE-${(seed(item.id) % 4) + 1}`,
    approver: pick(INSPECTORS, item.id, "apr"),
    daysIsolated: pickNumber(item.id + "iso", 1, 18),
  };
}

export function recallMeta(item: InventoryItem) {
  return {
    reason: pick(RECALL_REASONS, item.id),
    notice: `RCL-2026-${100 + (seed(item.id) % 60)}`,
    scope: pick(["Batch level", "Serial level", "Full PO"], item.id, "scope"),
    dueDays: pickNumber(item.id + "due", 1, 12),
  };
}

export const TRANSITION_REASONS = [
  "Quality usage decision — accepted",
  "Quality usage decision — rejected",
  "Material request allocation",
  "Warehouse task confirmation",
  "Packing completion",
  "Loading confirmation",
  "Goods issue posting",
  "Proof of delivery received",
  "QA release after re-inspection",
  "Damage assessment outcome",
  "Recall directive from supplier",
  "Cycle count correction",
];
