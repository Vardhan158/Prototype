export type ZoneId =
  | "SERVER"
  | "NETWORK"
  | "STORAGE"
  | "SPARE"
  | "CABLE"
  | "POWER"
  | "HIGHVALUE"
  | "CLIMATE"
  | "RETURN"
  | "SCRAP"
  | "OVERFLOW";

export interface Zone {
  id: ZoneId;
  name: string;
  prefix: string;
  tempControlled: boolean;
  secure: boolean;
  hazardAllowed: HazardClass[];
  description: string;
}

export type HazardClass = "None" | "Li-ion Battery" | "Lead Acid" | "ESD Sensitive" | "Flammable";

export type TempRequirement = "Ambient" | "Climate Controlled" | "Cold";

export type LocationStatus = "Available" | "Full" | "Maintenance" | "Blocked";

export interface StorageLocation {
  id: string;
  code: string;
  zone: ZoneId;
  rack: string;
  shelf?: string | undefined;
  bin?: string | undefined;
  capacity: number;
  used: number;
  status: LocationStatus;
}

export type ItemCategory =
  | "Servers (Rack/Blade/Tower)"
  | "Network Equipment (Router/Switch)"
  | "Storage Devices (HDD/SSD/SAN/NAS)"
  | "RAM/CPU/NIC/Fans"
  | "Cables/Connectors"
  | "UPS/PDU"
  | "Batteries (Li-ion/Lead Acid)"
  | "Sensitive Electronics"
  | "High-Value Enterprise Equipment"
  | "Returned/Defective Items"
  | "Scrap/Damaged Items";

export type StageId =
  "receiving" | "inspection" | "qr" | "rules" | "capacity" | "task" | "completed";

export type ItemStatus = "In Pipeline" | "Stored" | "Overflow" | "Quarantine" | "Rejected";

export interface Item {
  id: string;
  name: string;
  category: ItemCategory;
  code: string;
  hazard: HazardClass;
  temp: TempRequirement;
  size: "Small" | "Medium" | "Large";
  weightKg: number;
  valueUsd: number;
  qty: number;
  po: string;
  asn: string;
  supplier: string;
  stage: StageId;
  status: ItemStatus;
  locationId?: string | undefined;
  inspection?: { result: "Pass" | "Fail"; notes: string } | undefined;
  variance?: number | undefined;
  createdAt: string;
}

export interface PutAwayTask {
  id: string;
  itemId: string;
  locationCode: string;
  assignee: string;
  priority: "High" | "Normal";
  status: "Pending" | "In Progress" | "Done";
  createdAt: string;
}

export type AlertSeverity = "critical" | "warning" | "info";

export interface WarehouseAlert {
  id: string;
  severity: AlertSeverity;
  type: string;
  message: string;
  suggestion: string;
  itemId?: string | undefined;
  resolved: boolean;
  createdAt: string;
}

export interface AuditEntry {
  id: string;
  actor: string;
  action: string;
  entity: string;
  before: string;
  after: string;
  createdAt: string;
}

export interface AllocationStep {
  step: number;
  label: string;
  detail: string;
  outcome: "pass" | "fail" | "escalate";
}

export interface AllocationResult {
  steps: AllocationStep[];
  locationId?: string | undefined;
  locationCode?: string | undefined;
  overflow: boolean;
  failed: boolean;
}
