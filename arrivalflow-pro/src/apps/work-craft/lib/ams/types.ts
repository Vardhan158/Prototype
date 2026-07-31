export type Priority = "Low" | "Medium" | "High" | "Critical";

export type WorkOrderStatus =
  | "Pending"
  | "In Progress"
  | "Completed"
  | "Failed"
  | "Rework";

export const STAGE_SEQUENCE = [
  "Sub Assembly",
  "Wiring",
  "Integration",
  "Testing",
  "Final Assembly",
] as const;

export type StageName = (typeof STAGE_SEQUENCE)[number];

export type StageStatus = "Not Started" | "In Progress" | "Completed";

export interface AssemblyStage {
  name: StageName;
  status: StageStatus;
  startTime: string | null;
  endTime: string | null;
  operator: string;
}

export const CHECKPOINT_NAMES = [
  "Electrical Continuity Test",
  "Insulation Resistance Test",
  "Load Test",
] as const;

export type CheckpointName = (typeof CHECKPOINT_NAMES)[number];

export type CheckpointResult = "Pending" | "Pass" | "Fail";

export interface QualityCheckpoint {
  name: CheckpointName;
  mandatory: true;
  result: CheckpointResult;
  remarks: string;
  inspector: string;
  date: string | null;
}

export interface BomComponent {
  componentCode: string;
  componentName: string;
  requiredQuantity: number;
  consumedQuantity: number;
  batchNumber: string;
  componentSerials: string[];
}

export type ReworkScrapType = "Rework" | "Scrap";
export type ApprovalStatus = "Pending Approval" | "Approved" | "Rejected";

export interface ReworkScrapRecord {
  id: string;
  workOrderId: string;
  type: ReworkScrapType;
  reasonCode: string;
  description: string;
  costImpact: number;
  operator: string;
  approvalStatus: ApprovalStatus;
  recordedDate: string;
}

export const EXCEPTION_TYPES = [
  "Missing Component",
  "Failed Test",
  "Damaged Component",
  "Incorrect Component",
  "Low Stock",
] as const;

export type ExceptionType = (typeof EXCEPTION_TYPES)[number];
export type ExceptionSeverity = "Low" | "Medium" | "High" | "Critical";
export type ExceptionStatus = "Open" | "In Review" | "Resolved";

export interface AssemblyException {
  id: string;
  workOrderId: string;
  type: ExceptionType;
  severity: ExceptionSeverity;
  status: ExceptionStatus;
  assignedManager: string;
  resolution: string;
  raisedDate: string;
}

export interface AssemblyConfirmation {
  operator: string;
  startTime: string;
  endTime: string;
  labourHours: number;
  completionTime: string;
  remarks: string;
}

export interface FinishedGood {
  serialNumber: string;
  workOrderId: string;
  product: string;
  consumedComponentSerials: string[];
  batchNumbers: string[];
  completionDate: string;
  status: "Generated" | "Released";
}

export interface AssemblyCertificate {
  certificateNumber: string;
  workOrderId: string;
  product: string;
  operator: string;
  manager: string;
  serialNumber: string;
  completionDate: string;
  approval: "Approved" | "Pending Approval";
  testsPerformed: { name: string; result: CheckpointResult; inspector: string }[];
  componentsUsed: { componentCode: string; componentName: string; quantity: number }[];
}

export interface WorkOrder {
  id: string;
  workOrderNumber: string;
  finishedProduct: string;
  finishedGoodsSpecification: string;
  bomVersion: string;
  quantity: number;
  priority: Priority;
  startDate: string;
  expectedCompletionDate: string;
  assignedOperator: string;
  remarks: string;
  status: WorkOrderStatus;
  currentStage: StageName;
  createdDate: string;
  completionDate: string | null;
  bom: BomComponent[];
  stages: AssemblyStage[];
  checkpoints: QualityCheckpoint[];
  confirmation: AssemblyConfirmation | null;
}

export interface ActivityEntry {
  id: string;
  timestamp: string;
  workOrderId: string;
  message: string;
}
