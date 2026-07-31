export type TrackingType = "none" | "batch" | "serial";

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  email: string;
  gstin: string;
  rating: number;
  onTimePct: number;
}

export interface Item {
  sku: string;
  description: string;
  uom: "EA" | "BOX" | "KG" | "M";
  unitPrice: number;
  hsn: string;
  trackingType: TrackingType;
  shelfLifeDays?: number;
}

export interface Dock {
  id: string;
  name: string;
  utilization: number;
  status: "Free" | "Occupied" | "Maintenance";
}

export interface Warehouse {
  id: string;
  name: string;
  city: string;
  docks: Dock[];
  zones: string[];
}

export type PoStatus =
  | "Open"
  | "Partially Received"
  | "Fully Received"
  | "Closed"
  | "Overdue";

export interface PoLine {
  id: string;
  sku: string;
  description: string;
  uom: Item["uom"];
  orderedQty: number;
  receivedQty: number;
  unitPrice: number;
  trackingType: TrackingType;
}

export interface PurchaseOrder {
  poNumber: string;
  supplierId: string;
  orderDate: string;
  expectedDate: string;
  warehouseId: string;
  buyer: string;
  status: PoStatus;
  priority: "Low" | "Normal" | "High";
  lines: PoLine[];
}

export type GrnStatus =
  | "Draft"
  | "Pending Inspection"
  | "Pending Approval"
  | "Completed";

export interface SerialCapture {
  lineId: string;
  serials: string[];
}

export interface BatchRow {
  id: string;
  lineId: string;
  batchNo: string;
  mfgDate: string;
  expiryDate: string;
  qty: number;
}

export interface GrnLine {
  id: string;
  sku: string;
  description: string;
  uom: Item["uom"];
  orderedQty: number;
  previouslyReceived: number;
  receivedQty: number;
  rejectedQty: number;
  trackingType: TrackingType;
}

export interface StageTimes {
  gateEntry: number;
  grn: number;
  inspection: number;
  putaway: number;
}

export interface Grn {
  id: string;
  poNumber: string | null;
  supplierId: string;
  warehouseId: string;
  dockId: string;
  vehicleNo: string;
  driverName: string;
  driverPhone: string;
  transporter: string;
  gateEntryNo: string;
  gateEntryTime: string;
  receiver: string;
  invoiceNo: string;
  remarks: string;
  receiptDate: string;
  status: GrnStatus;
  isPartial: boolean;
  lines: GrnLine[];
  serials: SerialCapture[];
  batches: BatchRow[];
  discrepancyIds: string[];
  approval?: { supervisor: string; code: string; note: string; at: string };
  stages: StageTimes;
  nonPoReason?: string;
}

export type DiscrepancyType =
  | "Damage"
  | "Quantity Mismatch"
  | "Wrong Item"
  | "Missing Documents"
  | "Packaging Damage";

export interface Discrepancy {
  id: string;
  grnId: string;
  poNumber: string | null;
  type: DiscrepancyType;
  sku: string;
  qtyAffected: number;
  severity: "Low" | "Medium" | "High";
  description: string;
  status: "Open" | "In Review" | "Resolved" | "Escalated";
  raisedBy: string;
  raisedOn: string;
}
