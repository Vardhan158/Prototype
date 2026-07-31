export type InventoryStatus =
  | "Available"
  | "Reserved"
  | "Damaged"
  | "Quarantine"
  | "Low Stock"
  | "Out of Stock"
  | "Blocked"
  | "Rejected";

export interface InventoryItem {
  id: string;
  materialCode: string;
  materialName: string;
  category: string;
  warehouse: string;
  storageBin: string;
  zone: string;
  batchNumber: string;
  serialNumber: string;
  uom: string;
  available: number;
  reserved: number;
  damaged: number;
  quarantine: number;
  unitCost: number;
  status: InventoryStatus;
  expiryDate: string;
  lastUpdated: string;
  receivedDate: string;
  ageDays: number;
  minQty: number;
  maxQty: number;
  safetyStock: number;
  reorderPoint: number;
  eoq: number;
  movement: "Fast Moving" | "Slow Moving" | "Dead Stock";
  supplier: string;
}

export interface Transaction {
  id: string;
  date: string;
  type: "Goods Receipt" | "Goods Issue" | "Transfer" | "Adjustment" | "Return" | "Scrap";
  materialCode: string;
  materialName: string;
  warehouse: string;
  quantity: number;
  uom: string;
  reference: string;
  user: string;
}

export interface CycleCount {
  id: string;
  warehouse: string;
  zone: string;
  frequency: "Daily" | "Weekly" | "Monthly" | "Quarterly";
  assignedUser: string;
  scheduledDate: string;
  status: "Scheduled" | "In Progress" | "Completed" | "Overdue";
  itemsPlanned: number;
}

export interface AuditLine {
  id: string;
  countId: string;
  materialCode: string;
  materialName: string;
  warehouse: string;
  bin: string;
  systemQty: number;
  physicalQty: number;
  uom: string;
  countedBy: string;
  approvalStatus: "Pending" | "Approved" | "Rejected";
  date: string;
}

export interface Adjustment {
  id: string;
  materialCode: string;
  materialName: string;
  warehouse: string;
  currentQty: number;
  adjustedQty: number;
  reasonCode: string;
  remarks: string;
  requestedBy: string;
  approver: string;
  status: "Draft" | "Submitted" | "Approved" | "Rejected" | "Completed";
  date: string;
}

export interface Transfer {
  id: string;
  source: string;
  destination: string;
  materialCode: string;
  materialName: string;
  quantity: number;
  uom: string;
  requestedBy: string;
  approvedBy: string;
  status: "Pending" | "Approved" | "In Transit" | "Received" | "Cancelled";
  requestedDate: string;
  eta: string;
  priority: "Low" | "Normal" | "High";
}

export interface QuarantineRecord {
  id: string;
  materialCode: string;
  materialName: string;
  warehouse: string;
  quantity: number;
  uom: string;
  reason: string;
  inspectionNotes: string;
  status: "Damaged" | "Quarantine" | "Blocked" | "Rejected" | "Available" | "Reserved";
  inspector: string;
  date: string;
}

export interface GenealogyNode {
  id: string;
  name: string;
  serialNumber: string;
  batchNumber: string;
  supplier: string;
  manufacturingDate: string;
  warranty: string;
  materialCode: string;
  status: InventoryStatus;
  children?: GenealogyNode[];
}
