import {
  PackageCheck,
  ScanSearch,
  CircleCheck,
  BookmarkCheck,
  Hand,
  Boxes,
  Truck,
  MapPinCheck,
  ShieldAlert,
  HeartCrack,
  Biohazard,
  Siren,
  Wrench,
  Trash2,
  Undo2,
  CircleX,
  Container,
  type LucideIcon,
} from "lucide-react";

export type InventoryStatus =
  | "RECEIVED"
  | "UNDER_INSPECTION"
  | "AVAILABLE"
  | "RESERVED"
  | "PICKED"
  | "PACKED"
  | "LOADED"
  | "DISPATCHED"
  | "DELIVERED"
  | "REJECTED"
  | "QUALITY_HOLD"
  | "DAMAGED"
  | "QUARANTINE"
  | "RECALL"
  | "REPAIR"
  | "SCRAPPED"
  | "RETURNED";

export type Tone =
  | "info"
  | "warning"
  | "success"
  | "teal"
  | "primary"
  | "violet"
  | "slate"
  | "danger";

export type StatusMeta = {
  key: InventoryStatus;
  label: string;
  short: string;
  tone: Tone;
  icon: LucideIcon;
  phase: "inbound" | "storage" | "outbound" | "exception";
  approvalRequired: boolean;
  allocatable: boolean;
  description: string;
  notify: string[];
};

export const STATUS_META: Record<InventoryStatus, StatusMeta> = {
  RECEIVED: {
    key: "RECEIVED",
    label: "Received",
    short: "RCV",
    tone: "info",
    icon: PackageCheck,
    phase: "inbound",
    approvalRequired: false,
    allocatable: false,
    description: "GRN posted, stock created in receiving zone. Awaiting quality inspection.",
    notify: ["Quality Inspector", "Store Keeper"],
  },
  UNDER_INSPECTION: {
    key: "UNDER_INSPECTION",
    label: "Under Inspection",
    short: "INSP",
    tone: "warning",
    icon: ScanSearch,
    phase: "inbound",
    approvalRequired: false,
    allocatable: false,
    description: "Quality inspection lot open. Stock is non-allocatable until disposition.",
    notify: ["Quality Inspector"],
  },
  AVAILABLE: {
    key: "AVAILABLE",
    label: "Available",
    short: "AVL",
    tone: "success",
    icon: CircleCheck,
    phase: "storage",
    approvalRequired: false,
    allocatable: true,
    description: "Unrestricted stock in storage bin. Available for ATP and reservations.",
    notify: ["Inventory Manager", "Procurement"],
  },
  RESERVED: {
    key: "RESERVED",
    label: "Reserved",
    short: "RSV",
    tone: "teal",
    icon: BookmarkCheck,
    phase: "storage",
    approvalRequired: false,
    allocatable: false,
    description: "Hard-allocated to a material request or sales order. Blocked for other demand.",
    notify: ["Warehouse Manager", "Assembly Manager"],
  },
  PICKED: {
    key: "PICKED",
    label: "Picked",
    short: "PCK",
    tone: "primary",
    icon: Hand,
    phase: "outbound",
    approvalRequired: false,
    allocatable: false,
    description: "Confirmed on warehouse task, moved to outbound staging.",
    notify: ["Warehouse Manager"],
  },
  PACKED: {
    key: "PACKED",
    label: "Packed",
    short: "PKD",
    tone: "violet",
    icon: Boxes,
    phase: "outbound",
    approvalRequired: false,
    allocatable: false,
    description: "Handling unit created at packing station with label and seal.",
    notify: ["Warehouse Manager"],
  },
  LOADED: {
    key: "LOADED",
    label: "Loaded",
    short: "LDD",
    tone: "violet",
    icon: Container,
    phase: "outbound",
    approvalRequired: false,
    allocatable: false,
    description: "Handling unit loaded onto vehicle at the dispatch door.",
    notify: ["Warehouse Manager"],
  },
  DISPATCHED: {
    key: "DISPATCHED",
    label: "Dispatched",
    short: "DSP",
    tone: "primary",
    icon: Truck,
    phase: "outbound",
    approvalRequired: true,
    allocatable: false,
    description: "Goods issue posted, shipment left the yard with tracking reference.",
    notify: ["Warehouse Manager", "Procurement"],
  },
  DELIVERED: {
    key: "DELIVERED",
    label: "Delivered",
    short: "DLV",
    tone: "success",
    icon: MapPinCheck,
    phase: "outbound",
    approvalRequired: false,
    allocatable: false,
    description: "Proof of delivery captured. Lifecycle closed.",
    notify: ["Warehouse Manager"],
  },
  REJECTED: {
    key: "REJECTED",
    label: "Rejected",
    short: "REJ",
    tone: "danger",
    icon: CircleX,
    phase: "exception",
    approvalRequired: true,
    allocatable: false,
    description: "Inspection disposition failed. Awaiting NCR decision.",
    notify: ["Quality Inspector", "Procurement"],
  },
  QUALITY_HOLD: {
    key: "QUALITY_HOLD",
    label: "Quality Hold",
    short: "QHD",
    tone: "warning",
    icon: ShieldAlert,
    phase: "exception",
    approvalRequired: true,
    allocatable: false,
    description: "Blocked stock. Cannot be allocated, picked or issued until released by QA.",
    notify: ["Quality Inspector", "Inventory Manager"],
  },
  DAMAGED: {
    key: "DAMAGED",
    label: "Damaged",
    short: "DMG",
    tone: "danger",
    icon: HeartCrack,
    phase: "exception",
    approvalRequired: true,
    allocatable: false,
    description: "Physical damage recorded with evidence. Repair, scrap or insurance claim.",
    notify: ["Warehouse Manager", "Procurement"],
  },
  QUARANTINE: {
    key: "QUARANTINE",
    label: "Quarantine",
    short: "QRN",
    tone: "warning",
    icon: Biohazard,
    phase: "exception",
    approvalRequired: true,
    allocatable: false,
    description: "Isolated in quarantine area. No movement permitted until release approval.",
    notify: ["Quality Inspector", "Warehouse Manager"],
  },
  RECALL: {
    key: "RECALL",
    label: "Recall",
    short: "RCL",
    tone: "danger",
    icon: Siren,
    phase: "exception",
    approvalRequired: true,
    allocatable: false,
    description: "Supplier or regulatory recall. Automatically blocked across all warehouses.",
    notify: ["Warehouse Manager", "Quality Inspector", "Procurement"],
  },
  REPAIR: {
    key: "REPAIR",
    label: "Repair",
    short: "RPR",
    tone: "info",
    icon: Wrench,
    phase: "exception",
    approvalRequired: false,
    allocatable: false,
    description: "In rework at the repair cell. Returns to available after re-inspection.",
    notify: ["Assembly Manager"],
  },
  SCRAPPED: {
    key: "SCRAPPED",
    label: "Scrapped",
    short: "SCR",
    tone: "slate",
    icon: Trash2,
    phase: "exception",
    approvalRequired: true,
    allocatable: false,
    description: "Written off with scrap document. Financially devalued.",
    notify: ["Inventory Manager"],
  },
  RETURNED: {
    key: "RETURNED",
    label: "Returned to Supplier",
    short: "RTS",
    tone: "slate",
    icon: Undo2,
    phase: "exception",
    approvalRequired: true,
    allocatable: false,
    description: "Return delivery raised against the purchase order.",
    notify: ["Procurement"],
  },
};

export const ALL_STATUSES = Object.keys(STATUS_META) as InventoryStatus[];

/** Lifecycle rule matrix — the single source of truth for allowed transitions. */
export const TRANSITIONS: Record<InventoryStatus, InventoryStatus[]> = {
  RECEIVED: ["UNDER_INSPECTION", "QUARANTINE", "DAMAGED"],
  UNDER_INSPECTION: ["AVAILABLE", "QUALITY_HOLD", "REJECTED", "DAMAGED"],
  AVAILABLE: ["RESERVED", "QUALITY_HOLD", "QUARANTINE", "DAMAGED", "RECALL"],
  RESERVED: ["PICKED", "AVAILABLE", "QUALITY_HOLD", "RECALL"],
  PICKED: ["PACKED", "RESERVED", "DAMAGED"],
  PACKED: ["LOADED", "PICKED"],
  LOADED: ["DISPATCHED", "PACKED"],
  DISPATCHED: ["DELIVERED", "RETURNED"],
  DELIVERED: ["RETURNED", "RECALL"],
  REJECTED: ["RETURNED", "SCRAPPED", "REPAIR"],
  QUALITY_HOLD: ["AVAILABLE", "RETURNED", "REPAIR", "SCRAPPED", "QUARANTINE"],
  DAMAGED: ["REPAIR", "SCRAPPED", "RETURNED"],
  QUARANTINE: ["AVAILABLE", "SCRAPPED", "RETURNED", "QUALITY_HOLD"],
  RECALL: ["RETURNED", "SCRAPPED", "QUARANTINE"],
  REPAIR: ["UNDER_INSPECTION", "SCRAPPED"],
  SCRAPPED: [],
  RETURNED: [],
};

export const STATUS_RULES: { rule: string; enforced: string }[] = [
  { rule: "Only AVAILABLE inventory can be reserved", enforced: "AVAILABLE → RESERVED" },
  { rule: "Only RESERVED inventory can be picked", enforced: "RESERVED → PICKED" },
  { rule: "Only PICKED inventory can be packed", enforced: "PICKED → PACKED" },
  { rule: "Only PACKED inventory can be loaded", enforced: "PACKED → LOADED" },
  { rule: "Only LOADED inventory can be dispatched", enforced: "LOADED → DISPATCHED" },
  { rule: "QUALITY HOLD stock cannot be allocated", enforced: "Allocation blocked" },
  { rule: "DAMAGED stock cannot be picked", enforced: "Pick blocked" },
  { rule: "QUARANTINE stock cannot move until released", enforced: "Movement blocked" },
  { rule: "RECALL stock is automatically blocked everywhere", enforced: "Hard block" },
];

export const TONE_CLASS: Record<Tone, { chip: string; dot: string; text: string; bar: string }> = {
  info: {
    chip: "bg-info/10 text-info border-info/25",
    dot: "bg-info",
    text: "text-info",
    bar: "bg-info",
  },
  warning: {
    chip: "bg-warning/12 text-warning border-warning/30",
    dot: "bg-warning",
    text: "text-warning",
    bar: "bg-warning",
  },
  success: {
    chip: "bg-success/12 text-success border-success/30",
    dot: "bg-success",
    text: "text-success",
    bar: "bg-success",
  },
  teal: {
    chip: "bg-teal/12 text-teal border-teal/30",
    dot: "bg-teal",
    text: "text-teal",
    bar: "bg-teal",
  },
  primary: {
    chip: "bg-primary/10 text-primary border-primary/25",
    dot: "bg-primary",
    text: "text-primary",
    bar: "bg-primary",
  },
  violet: {
    chip: "bg-violet/12 text-violet border-violet/28",
    dot: "bg-violet",
    text: "text-violet",
    bar: "bg-violet",
  },
  slate: {
    chip: "bg-slate/12 text-slate border-slate/28",
    dot: "bg-slate",
    text: "text-slate",
    bar: "bg-slate",
  },
  danger: {
    chip: "bg-destructive/10 text-destructive border-destructive/25",
    dot: "bg-destructive",
    text: "text-destructive",
    bar: "bg-destructive",
  },
};

export const TONE_HEX: Record<Tone, string> = {
  info: "var(--info)",
  warning: "var(--warning)",
  success: "var(--success)",
  teal: "var(--teal)",
  primary: "var(--primary)",
  violet: "var(--violet)",
  slate: "var(--slate)",
  danger: "var(--destructive)",
};

export function statusTone(status: InventoryStatus) {
  return TONE_CLASS[STATUS_META[status].tone];
}

export function statusColor(status: InventoryStatus) {
  return TONE_HEX[STATUS_META[status].tone];
}

export function canTransition(from: InventoryStatus, to: InventoryStatus) {
  return TRANSITIONS[from].includes(to);
}
