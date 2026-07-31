import {
  CHECKPOINT_NAMES,
  STAGE_SEQUENCE,
  type ActivityEntry,
  type AssemblyCertificate,
  type AssemblyException,
  type AssemblyStage,
  type BomComponent,
  type FinishedGood,
  type QualityCheckpoint,
  type ReworkScrapRecord,
  type StageName,
  type StageStatus,
  type WorkOrder,
} from "./types";

/** Read-only references to other modules (mock only). */
export const OPERATORS = [
  "A. Fernandes",
  "R. Kulkarni",
  "M. Schneider",
  "L. Novak",
  "S. Iyer",
  "T. Bergmann",
] as const;

export const MANAGERS = [
  "D. Whitfield",
  "P. Ranganathan",
  "H. Lindqvist",
  "C. Moreau",
] as const;

export const INSPECTORS = ["Q. Alvarez", "N. Dutta", "E. Wagner"] as const;

export const PRODUCTS = [
  { code: "FG-TRB-1100", name: "Turbine Control Panel TCP-1100" },
  { code: "FG-SWG-4200", name: "Medium Voltage Switchgear MVS-4200" },
  { code: "FG-DRV-0750", name: "Variable Frequency Drive VFD-750" },
  { code: "FG-PDU-2600", name: "Power Distribution Unit PDU-2600" },
  { code: "FG-GEN-9000", name: "Generator Excitation Module GEM-9000" },
] as const;

export const BOM_VERSIONS = ["v1.0", "v1.2", "v2.0", "v2.4", "v3.1"] as const;

export const REASON_CODES = [
  "RC-01 Component Damage",
  "RC-02 Wiring Defect",
  "RC-03 Test Failure",
  "RC-04 Dimensional Mismatch",
  "RC-05 Supplier Defect",
  "RC-06 Operator Error",
] as const;

const COMPONENT_LIBRARY: Omit<BomComponent, "consumedQuantity">[] = [
  {
    componentCode: "CMP-1001",
    componentName: "Control Relay 24V DC",
    requiredQuantity: 12,
    batchNumber: "BATCH-2041",
    componentSerials: ["SN-CR-88120", "SN-CR-88121", "SN-CR-88122"],
  },
  {
    componentCode: "CMP-1042",
    componentName: "Copper Busbar 250A",
    requiredQuantity: 4,
    batchNumber: "BATCH-1177",
    componentSerials: ["SN-BB-40110", "SN-BB-40111"],
  },
  {
    componentCode: "CMP-2210",
    componentName: "Wiring Harness Assembly",
    requiredQuantity: 2,
    batchNumber: "BATCH-3320",
    componentSerials: ["SN-WH-70021", "SN-WH-70022"],
  },
  {
    componentCode: "CMP-3305",
    componentName: "PLC Logic Controller",
    requiredQuantity: 1,
    batchNumber: "BATCH-5501",
    componentSerials: ["SN-PLC-11002"],
  },
  {
    componentCode: "CMP-4407",
    componentName: "Insulation Sleeve Kit",
    requiredQuantity: 20,
    batchNumber: "BATCH-6612",
    componentSerials: ["SN-IS-90233"],
  },
  {
    componentCode: "CMP-5509",
    componentName: "Cooling Fan Module 120mm",
    requiredQuantity: 6,
    batchNumber: "BATCH-7783",
    componentSerials: ["SN-CF-30455", "SN-CF-30456"],
  },
];

function buildBom(seed: number, consumedFactor: number): BomComponent[] {
  return COMPONENT_LIBRARY.slice(0, 4 + (seed % 3)).map((c, i) => ({
    ...c,
    consumedQuantity: Math.max(
      0,
      Math.round(c.requiredQuantity * consumedFactor) + (i === 1 && consumedFactor > 0.9 ? 1 : 0),
    ),
  }));
}

function buildStages(completedUpTo: number, operator: string, day: string): AssemblyStage[] {
  return STAGE_SEQUENCE.map((name, i): AssemblyStage => {
    let status: StageStatus = "Not Started";
    if (i < completedUpTo) status = "Completed";
    else if (i === completedUpTo) status = "In Progress";
    return {
      name,
      status,
      startTime: i <= completedUpTo ? `${day}T0${6 + i}:00` : null,
      endTime: i < completedUpTo ? `${day}T0${7 + i}:30` : null,
      operator,
    };
  });
}

function buildCheckpoints(
  results: ("Pending" | "Pass" | "Fail")[],
  day: string,
): QualityCheckpoint[] {
  return CHECKPOINT_NAMES.map((name, i) => ({
    name,
    mandatory: true as const,
    result: results[i] ?? "Pending",
    remarks:
      results[i] === "Fail"
        ? "Reading outside acceptance band. Raised for review."
        : results[i] === "Pass"
          ? "Within specification."
          : "",
    inspector: results[i] === "Pending" ? "" : INSPECTORS[i % INSPECTORS.length]!,
    date: results[i] === "Pending" ? null : `${day}T09:${20 + i}`,
  }));
}

export const INITIAL_WORK_ORDERS: WorkOrder[] = [
  {
    id: "WO-2026-0001",
    workOrderNumber: "WO-2026-0001",
    finishedProduct: PRODUCTS[0].name,
    finishedGoodsSpecification:
      "IEC 61439 compliant control panel, IP54 enclosure, 415V 3-phase, factory tested.",
    bomVersion: "v2.4",
    quantity: 5,
    priority: "High",
    startDate: "2026-07-06",
    expectedCompletionDate: "2026-07-24",
    assignedOperator: "A. Fernandes",
    remarks: "Customer witnessed testing required before dispatch.",
    status: "Completed",
    currentStage: "Final Assembly",
    createdDate: "2026-07-01",
    completionDate: "2026-07-23",
    bom: buildBom(1, 1),
    stages: STAGE_SEQUENCE.map((name, i) => ({
      name,
      status: "Completed" as StageStatus,
      startTime: `2026-07-0${6 + i}T07:00`,
      endTime: `2026-07-0${6 + i}T15:30`,
      operator: "A. Fernandes",
    })),
    checkpoints: buildCheckpoints(["Pass", "Pass", "Pass"], "2026-07-22"),
    confirmation: {
      operator: "A. Fernandes",
      startTime: "2026-07-06T07:00",
      endTime: "2026-07-23T16:00",
      labourHours: 148,
      completionTime: "2026-07-23T16:15",
      remarks: "All stages completed, mandatory checkpoints passed.",
    },
  },
  {
    id: "WO-2026-0002",
    workOrderNumber: "WO-2026-0002",
    finishedProduct: PRODUCTS[1].name,
    finishedGoodsSpecification:
      "12kV metal-clad switchgear, withdrawable VCB, arc-fault tested to IEC 62271-200.",
    bomVersion: "v3.1",
    quantity: 2,
    priority: "Critical",
    startDate: "2026-07-15",
    expectedCompletionDate: "2026-08-05",
    assignedOperator: "R. Kulkarni",
    remarks: "Critical priority — export order.",
    status: "In Progress",
    currentStage: "Testing",
    createdDate: "2026-07-10",
    completionDate: null,
    bom: buildBom(2, 0.7),
    stages: buildStages(3, "R. Kulkarni", "2026-07-15"),
    checkpoints: buildCheckpoints(["Pass", "Pending", "Pending"], "2026-07-28"),
    confirmation: null,
  },
  {
    id: "WO-2026-0003",
    workOrderNumber: "WO-2026-0003",
    finishedProduct: PRODUCTS[2].name,
    finishedGoodsSpecification: "750kW VFD, IP20, harmonic filter integrated, 400V supply.",
    bomVersion: "v1.2",
    quantity: 8,
    priority: "Medium",
    startDate: "2026-07-20",
    expectedCompletionDate: "2026-08-12",
    assignedOperator: "M. Schneider",
    remarks: "",
    status: "In Progress",
    currentStage: "Wiring",
    createdDate: "2026-07-16",
    completionDate: null,
    bom: buildBom(3, 0.45),
    stages: buildStages(1, "M. Schneider", "2026-07-20"),
    checkpoints: buildCheckpoints(["Pending", "Pending", "Pending"], "2026-07-30"),
    confirmation: null,
  },
  {
    id: "WO-2026-0004",
    workOrderNumber: "WO-2026-0004",
    finishedProduct: PRODUCTS[3].name,
    finishedGoodsSpecification: "Rack-mounted PDU, 32 outlets, redundant feed, remote metering.",
    bomVersion: "v2.0",
    quantity: 10,
    priority: "Low",
    startDate: "2026-08-01",
    expectedCompletionDate: "2026-08-22",
    assignedOperator: "L. Novak",
    remarks: "Awaiting material staging confirmation.",
    status: "Pending",
    currentStage: "Sub Assembly",
    createdDate: "2026-07-25",
    completionDate: null,
    bom: buildBom(4, 0),
    stages: STAGE_SEQUENCE.map((name) => ({
      name,
      status: "Not Started" as StageStatus,
      startTime: null,
      endTime: null,
      operator: "L. Novak",
    })),
    checkpoints: buildCheckpoints(["Pending", "Pending", "Pending"], "2026-08-01"),
    confirmation: null,
  },
  {
    id: "WO-2026-0005",
    workOrderNumber: "WO-2026-0005",
    finishedProduct: PRODUCTS[4].name,
    finishedGoodsSpecification: "Brushless excitation module, 9000 series, marine classification.",
    bomVersion: "v1.0",
    quantity: 3,
    priority: "High",
    startDate: "2026-07-08",
    expectedCompletionDate: "2026-07-28",
    assignedOperator: "S. Iyer",
    remarks: "Insulation resistance below limit on unit 2.",
    status: "Failed",
    currentStage: "Testing",
    createdDate: "2026-07-02",
    completionDate: null,
    bom: buildBom(5, 0.95),
    stages: buildStages(3, "S. Iyer", "2026-07-08"),
    checkpoints: buildCheckpoints(["Pass", "Fail", "Pending"], "2026-07-26"),
    confirmation: null,
  },
  {
    id: "WO-2026-0006",
    workOrderNumber: "WO-2026-0006",
    finishedProduct: PRODUCTS[0].name,
    finishedGoodsSpecification: "IEC 61439 control panel, IP54, spare unit build.",
    bomVersion: "v2.4",
    quantity: 4,
    priority: "Medium",
    startDate: "2026-07-12",
    expectedCompletionDate: "2026-08-02",
    assignedOperator: "T. Bergmann",
    remarks: "Rework raised for wiring harness routing.",
    status: "Rework",
    currentStage: "Wiring",
    createdDate: "2026-07-09",
    completionDate: null,
    bom: buildBom(6, 0.6),
    stages: buildStages(1, "T. Bergmann", "2026-07-12"),
    checkpoints: buildCheckpoints(["Fail", "Pending", "Pending"], "2026-07-24"),
    confirmation: null,
  },
];

export const INITIAL_REWORK_SCRAP: ReworkScrapRecord[] = [
  {
    id: "RS-1001",
    workOrderId: "WO-2026-0006",
    type: "Rework",
    reasonCode: "RC-02 Wiring Defect",
    description: "Harness routed outside cable tray, re-terminated and re-tested.",
    costImpact: 1850,
    operator: "T. Bergmann",
    approvalStatus: "Approved",
    recordedDate: "2026-07-18",
  },
  {
    id: "RS-1002",
    workOrderId: "WO-2026-0005",
    type: "Scrap",
    reasonCode: "RC-05 Supplier Defect",
    description: "Insulation sleeve kit failed incoming dielectric check.",
    costImpact: 640,
    operator: "S. Iyer",
    approvalStatus: "Pending Approval",
    recordedDate: "2026-07-26",
  },
  {
    id: "RS-1003",
    workOrderId: "WO-2026-0002",
    type: "Rework",
    reasonCode: "RC-04 Dimensional Mismatch",
    description: "Busbar drilling offset by 3mm, re-machined.",
    costImpact: 2400,
    operator: "R. Kulkarni",
    approvalStatus: "Approved",
    recordedDate: "2026-07-22",
  },
];

export const INITIAL_EXCEPTIONS: AssemblyException[] = [
  {
    id: "EX-2001",
    workOrderId: "WO-2026-0005",
    type: "Failed Test",
    severity: "Critical",
    status: "In Review",
    assignedManager: "D. Whitfield",
    resolution: "Megger re-test scheduled after drying cycle.",
    raisedDate: "2026-07-26",
  },
  {
    id: "EX-2002",
    workOrderId: "WO-2026-0003",
    type: "Low Stock",
    severity: "Medium",
    status: "Open",
    assignedManager: "P. Ranganathan",
    resolution: "",
    raisedDate: "2026-07-27",
  },
  {
    id: "EX-2003",
    workOrderId: "WO-2026-0006",
    type: "Damaged Component",
    severity: "High",
    status: "Resolved",
    assignedManager: "H. Lindqvist",
    resolution: "Damaged relay replaced from batch BATCH-2041.",
    raisedDate: "2026-07-17",
  },
];

export const INITIAL_FINISHED_GOODS: FinishedGood[] = [
  {
    serialNumber: "FG-WO-2026-0001-001",
    workOrderId: "WO-2026-0001",
    product: PRODUCTS[0].name,
    consumedComponentSerials: ["SN-CR-88120", "SN-BB-40110", "SN-WH-70021", "SN-PLC-11002"],
    batchNumbers: ["BATCH-2041", "BATCH-1177", "BATCH-3320", "BATCH-5501"],
    completionDate: "2026-07-23",
    status: "Released",
  },
];

export const INITIAL_CERTIFICATES: AssemblyCertificate[] = [
  {
    certificateNumber: "ACC-WO-2026-0001",
    workOrderId: "WO-2026-0001",
    product: PRODUCTS[0].name,
    operator: "A. Fernandes",
    manager: "D. Whitfield",
    serialNumber: "FG-WO-2026-0001-001",
    completionDate: "2026-07-23",
    approval: "Approved",
    testsPerformed: CHECKPOINT_NAMES.map((name, i) => ({
      name,
      result: "Pass" as const,
      inspector: INSPECTORS[i % INSPECTORS.length]!,
    })),
    componentsUsed: buildBom(1, 1).map((c) => ({
      componentCode: c.componentCode,
      componentName: c.componentName,
      quantity: c.consumedQuantity,
    })),
  },
];

export const INITIAL_ACTIVITY: ActivityEntry[] = [
  {
    id: "AC-1",
    timestamp: "2026-07-27T09:14",
    workOrderId: "WO-2026-0003",
    message: "Low Stock exception raised for WO-2026-0003.",
  },
  {
    id: "AC-2",
    timestamp: "2026-07-26T15:02",
    workOrderId: "WO-2026-0005",
    message: "Insulation Resistance Test recorded as Fail.",
  },
  {
    id: "AC-3",
    timestamp: "2026-07-23T16:15",
    workOrderId: "WO-2026-0001",
    message: "Assembly confirmed and completion certificate generated.",
  },
  {
    id: "AC-4",
    timestamp: "2026-07-22T11:40",
    workOrderId: "WO-2026-0002",
    message: "Stage Integration completed by R. Kulkarni.",
  },
  {
    id: "AC-5",
    timestamp: "2026-07-18T08:25",
    workOrderId: "WO-2026-0006",
    message: "Rework RS-1001 approved with cost impact 1,850.",
  },
];

export const nextStageOf = (stage: StageName): StageName | null => {
  const i = STAGE_SEQUENCE.indexOf(stage);
  return i >= 0 && i < STAGE_SEQUENCE.length - 1 ? STAGE_SEQUENCE[i + 1]! : null;
};
