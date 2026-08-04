import { ZONES, zoneById } from "./data";
import type {
  AllocationResult,
  AllocationStep,
  Item,
  ItemCategory,
  StorageLocation,
  ZoneId,
} from "./types";

/** Storage allocation rules: category -> allowed zones (in preference order). */
export const CATEGORY_ZONES: Record<ItemCategory, ZoneId[]> = {
  "Servers (Rack/Blade/Tower)": ["SERVER", "HIGHVALUE"],
  "Network Equipment (Router/Switch)": ["NETWORK"],
  "Storage Devices (HDD/SSD/SAN/NAS)": ["STORAGE"],
  "RAM/CPU/NIC/Fans": ["SPARE"],
  "Cables/Connectors": ["CABLE"],
  "UPS/PDU": ["POWER"],
  "Batteries (Li-ion/Lead Acid)": ["POWER"],
  "Sensitive Electronics": ["CLIMATE"],
  "High-Value Enterprise Equipment": ["HIGHVALUE"],
  "Returned/Defective Items": ["RETURN"],
  "Scrap/Damaged Items": ["SCRAP"],
};

export interface RuleCheck {
  rule: string;
  passed: boolean;
  detail: string;
}

export interface ValidationResult {
  checks: RuleCheck[];
  passed: boolean;
  preferredZone: ZoneId;
  recommendedZone: ZoneId;
}

export function validateStorageRules(item: Item): ValidationResult {
  const allowed = CATEGORY_ZONES[item.category] ?? ["OVERFLOW"];
  const preferred = allowed[0] as ZoneId;
  let recommended: ZoneId = preferred;
  const checks: RuleCheck[] = [];

  checks.push({
    rule: "Category → Zone",
    passed: true,
    detail: `${item.category} is allowed in ${allowed.map((z) => zoneById(z).name).join(", ")}.`,
  });

  const hazardOk = zoneById(preferred).hazardAllowed.includes(item.hazard);
  if (!hazardOk) {
    const alt = ZONES.find((z) => z.hazardAllowed.includes(item.hazard));
    if (alt) recommended = alt.id;
  }
  checks.push({
    rule: "Hazard Class",
    passed: hazardOk,
    detail: hazardOk
      ? `${item.hazard} permitted in ${zoneById(preferred).name}.`
      : `${item.hazard} not permitted in ${zoneById(preferred).name} → recommend ${zoneById(recommended).name}.`,
  });

  const tempOk = item.temp === "Ambient" || zoneById(recommended).tempControlled;
  if (!tempOk) recommended = "CLIMATE";
  checks.push({
    rule: "Temperature Requirement",
    passed: tempOk,
    detail: tempOk
      ? `${item.temp} satisfied by ${zoneById(recommended).name}.`
      : `${item.temp} requires a regulated zone → recommend Climate-Controlled Zone.`,
  });

  const valueOk = item.valueUsd < 10000 || zoneById(recommended).secure;
  if (!valueOk) recommended = "HIGHVALUE";
  checks.push({
    rule: "Value Threshold",
    passed: valueOk,
    detail: valueOk
      ? `Declared value $${item.valueUsd.toLocaleString()} within zone limit.`
      : `Value $${item.valueUsd.toLocaleString()} exceeds $10,000 → recommend High-Value Secure Zone.`,
  });

  const weightOk = item.weightKg < 60 || zoneById(recommended).id === "POWER";
  checks.push({
    rule: "Size / Weight",
    passed: weightOk,
    detail: weightOk
      ? `${item.size} · ${item.weightKg}kg supported by rack rating.`
      : `${item.weightKg}kg exceeds shelf rating → ground-level bay required.`,
  });

  return {
    checks,
    passed: checks.every((c) => c.passed),
    preferredZone: preferred,
    recommendedZone: recommended,
  };
}

const usable = (l: StorageLocation, qty: number) =>
  l.status !== "Maintenance" && l.status !== "Blocked" && l.capacity - l.used >= qty;

/**
 * Capacity overflow decision tree.
 * 1 preferred location → 2 next rack in zone → 3 compatible zone → 4 overflow → 5 escalate.
 */
export function allocate(
  item: Item,
  locations: StorageLocation[],
  zoneOrder: ZoneId[],
): AllocationResult {
  const steps: AllocationStep[] = [];
  const qty = item.qty;
  const primary = zoneOrder[0] as ZoneId;
  const inZone = (z: ZoneId) => locations.filter((l) => l.zone === z);

  const preferredZoneLocations = inZone(primary);
  const firstRack = preferredZoneLocations[0]?.rack;
  const preferred = preferredZoneLocations.filter((l) => l.rack === firstRack);
  const hit1 = preferred.find((l) => usable(l, qty));
  steps.push({
    step: 1,
    label: `Preferred location · ${zoneById(primary).name} ${firstRack ?? "-"}`,
    detail: hit1
      ? `${hit1.code} has ${hit1.capacity - hit1.used} free slots — assigning.`
      : `All slots in ${firstRack ?? "rack"} are full or blocked.`,
    outcome: hit1 ? "pass" : "fail",
  });
  if (hit1)
    return { steps, locationId: hit1.id, locationCode: hit1.code, overflow: false, failed: false };

  const hit2 = preferredZoneLocations.find((l) => l.rack !== firstRack && usable(l, qty));
  steps.push({
    step: 2,
    label: `Next rack in ${zoneById(primary).name}`,
    detail: hit2
      ? `${hit2.code} has ${hit2.capacity - hit2.used} free slots — assigning.`
      : `Every rack in ${zoneById(primary).name} is saturated.`,
    outcome: hit2 ? "pass" : "fail",
  });
  if (hit2)
    return { steps, locationId: hit2.id, locationCode: hit2.code, overflow: false, failed: false };

  const alternates = zoneOrder.slice(1);
  const hit3 = alternates.flatMap((z) => inZone(z)).find((l) => usable(l, qty));
  steps.push({
    step: 3,
    label: "Compatible alternate zone",
    detail: hit3
      ? `${hit3.code} in ${zoneById(hit3.zone).name} accepted the item.`
      : alternates.length
        ? `${alternates.map((z) => zoneById(z).name).join(", ")} full or incompatible.`
        : "No compatible alternate zone defined for this category.",
    outcome: hit3 ? "pass" : "fail",
  });
  if (hit3)
    return { steps, locationId: hit3.id, locationCode: hit3.code, overflow: false, failed: false };

  const hit4 = inZone("OVERFLOW").find((l) => usable(l, qty));
  steps.push({
    step: 4,
    label: "Overflow / temporary area",
    detail: hit4
      ? `${hit4.code} accepted the item — flagged as Overflow.`
      : "Overflow area is also at capacity.",
    outcome: hit4 ? "escalate" : "fail",
  });
  if (hit4)
    return { steps, locationId: hit4.id, locationCode: hit4.code, overflow: true, failed: false };

  steps.push({
    step: 5,
    label: "Escalate to Warehouse Manager",
    detail:
      "Suggested actions: Create New Rack · Create New Zone · Transfer Inventory · Expand Warehouse.",
    outcome: "fail",
  });
  return { steps, overflow: false, failed: true };
}

export const STAGES: { id: Item["stage"]; label: string }[] = [
  { id: "receiving", label: "Document Management & OCR" },
  { id: "inspection", label: "Quality Inspection" },
  { id: "qr", label: "QR / Barcode Generation" },
  { id: "rules", label: "Storage Rule Validation" },
  { id: "capacity", label: "Capacity Check" },
  { id: "task", label: "Put-Away Task Created" },
];

export const stageIndex = (s: Item["stage"]) => STAGES.findIndex((x) => x.id === s);
