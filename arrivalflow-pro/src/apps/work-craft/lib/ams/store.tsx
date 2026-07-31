import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

import {
  INITIAL_ACTIVITY,
  INITIAL_CERTIFICATES,
  INITIAL_EXCEPTIONS,
  INITIAL_FINISHED_GOODS,
  INITIAL_REWORK_SCRAP,
  INITIAL_WORK_ORDERS,
  MANAGERS,
  nextStageOf,
} from "./mock-data";
import {
  STAGE_SEQUENCE,
  type ActivityEntry,
  type AssemblyCertificate,
  type AssemblyConfirmation,
  type AssemblyException,
  type CheckpointName,
  type CheckpointResult,
  type FinishedGood,
  type ReworkScrapRecord,
  type StageName,
  type WorkOrder,
} from "./types";

interface AmsState {
  workOrders: WorkOrder[];
  reworkScrap: ReworkScrapRecord[];
  exceptions: AssemblyException[];
  finishedGoods: FinishedGood[];
  certificates: AssemblyCertificate[];
  activity: ActivityEntry[];
  currentUser: string | null;
  login: (user: string) => void;
  logout: () => void;
  createWorkOrder: (wo: Omit<WorkOrder, "id" | "status" | "currentStage" | "createdDate" | "completionDate" | "stages" | "checkpoints" | "confirmation" | "bom"> & { bomVersion: string }) => void;
  updateWorkOrder: (id: string, patch: Partial<WorkOrder>) => void;
  assignOperator: (id: string, operator: string) => void;
  recordConsumption: (id: string, componentCode: string, consumedQuantity: number) => void;
  startStage: (id: string, stage: StageName) => void;
  completeStage: (id: string, stage: StageName) => void;
  recordCheckpoint: (
    id: string,
    checkpoint: CheckpointName,
    result: CheckpointResult,
    remarks: string,
    inspector: string,
  ) => void;
  confirmAssembly: (id: string, confirmation: AssemblyConfirmation) => void;
  addReworkScrap: (record: Omit<ReworkScrapRecord, "id" | "recordedDate">) => void;
  addException: (record: Omit<AssemblyException, "id" | "raisedDate">) => void;
  updateException: (id: string, patch: Partial<AssemblyException>) => void;
}

const AmsContext = createContext<AmsState | null>(null);

const today = () => new Date().toISOString().slice(0, 10);
const now = () => new Date().toISOString().slice(0, 16);

/** BR-083: a stage may only advance when every mandatory checkpoint has passed. */
export function mandatoryChecksPassed(wo: WorkOrder) {
  return wo.checkpoints.every((c) => c.result === "Pass");
}

export function bomVariance(wo: WorkOrder) {
  return wo.bom.map((c) => ({
    ...c,
    variance: c.consumedQuantity - c.requiredQuantity,
  }));
}

export function AmsProvider({ children }: { children: ReactNode }) {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(INITIAL_WORK_ORDERS);
  const [reworkScrap, setReworkScrap] = useState<ReworkScrapRecord[]>(INITIAL_REWORK_SCRAP);
  const [exceptions, setExceptions] = useState<AssemblyException[]>(INITIAL_EXCEPTIONS);
  const [finishedGoods, setFinishedGoods] = useState<FinishedGood[]>(INITIAL_FINISHED_GOODS);
  const [certificates, setCertificates] = useState<AssemblyCertificate[]>(INITIAL_CERTIFICATES);
  const [activity, setActivity] = useState<ActivityEntry[]>(INITIAL_ACTIVITY);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  const log = useCallback((workOrderId: string, message: string) => {
    setActivity((prev) => [
      { id: `AC-${Date.now()}`, timestamp: now(), workOrderId, message },
      ...prev,
    ]);
  }, []);

  const patchWo = useCallback((id: string, updater: (wo: WorkOrder) => WorkOrder) => {
    setWorkOrders((prev) => prev.map((wo) => (wo.id === id ? updater(wo) : wo)));
  }, []);

  const value = useMemo<AmsState>(() => {
    return {
      workOrders,
      reworkScrap,
      exceptions,
      finishedGoods,
      certificates,
      activity,
      currentUser,
      login: (user) => setCurrentUser(user),
      logout: () => setCurrentUser(null),

      createWorkOrder: (input) => {
        const template = INITIAL_WORK_ORDERS[0]!;
        const id = input.workOrderNumber;
        const wo: WorkOrder = {
          ...input,
          id,
          status: "Pending",
          currentStage: "Sub Assembly",
          createdDate: today(),
          completionDate: null,
          bom: template.bom.map((c) => ({ ...c, consumedQuantity: 0 })),
          stages: STAGE_SEQUENCE.map((name) => ({
            name,
            status: "Not Started" as const,
            startTime: null,
            endTime: null,
            operator: input.assignedOperator,
          })),
          checkpoints: template.checkpoints.map((c) => ({
            ...c,
            result: "Pending" as const,
            remarks: "",
            inspector: "",
            date: null,
          })),
          confirmation: null,
        };
        setWorkOrders((prev) => [wo, ...prev]);
        log(id, `Work order ${id} created for ${input.finishedProduct}.`);
      },

      updateWorkOrder: (id, patch) => {
        patchWo(id, (wo) => ({ ...wo, ...patch }));
        log(id, `Work order ${id} updated.`);
      },

      assignOperator: (id, operator) => {
        patchWo(id, (wo) => ({
          ...wo,
          assignedOperator: operator,
          stages: wo.stages.map((s) => (s.status === "Completed" ? s : { ...s, operator })),
        }));
        log(id, `Operator ${operator} assigned to ${id}.`);
      },

      recordConsumption: (id, componentCode, consumedQuantity) => {
        patchWo(id, (wo) => ({
          ...wo,
          bom: wo.bom.map((c) =>
            c.componentCode === componentCode ? { ...c, consumedQuantity } : c,
          ),
        }));
        const wo = workOrders.find((w) => w.id === id);
        const comp = wo?.bom.find((c) => c.componentCode === componentCode);
        if (comp && consumedQuantity > comp.requiredQuantity) {
          setExceptions((prev) => [
            {
              id: `EX-${Date.now()}`,
              workOrderId: id,
              type: "Incorrect Component",
              severity: "High",
              status: "Open",
              assignedManager: MANAGERS[0]!,
              resolution: "",
              raisedDate: today(),
            },
            ...prev,
          ]);
        }
        log(id, `Consumption updated for ${componentCode}: ${consumedQuantity}.`);
      },

      startStage: (id, stage) => {
        patchWo(id, (wo) => ({
          ...wo,
          status: wo.status === "Pending" ? "In Progress" : wo.status,
          currentStage: stage,
          stages: wo.stages.map((s) =>
            s.name === stage ? { ...s, status: "In Progress", startTime: now() } : s,
          ),
        }));
        log(id, `Stage ${stage} started.`);
      },

      completeStage: (id, stage) => {
        patchWo(id, (wo) => {
          const next = nextStageOf(stage);
          return {
            ...wo,
            currentStage: next ?? stage,
            stages: wo.stages.map((s) =>
              s.name === stage ? { ...s, status: "Completed", endTime: now() } : s,
            ),
          };
        });
        log(id, `Stage ${stage} completed.`);
      },

      recordCheckpoint: (id, checkpoint, result, remarks, inspector) => {
        patchWo(id, (wo) => ({
          ...wo,
          status: result === "Fail" ? "Failed" : wo.status,
          checkpoints: wo.checkpoints.map((c) =>
            c.name === checkpoint ? { ...c, result, remarks, inspector, date: now() } : c,
          ),
        }));
        if (result === "Fail") {
          setExceptions((prev) => [
            {
              id: `EX-${Date.now()}`,
              workOrderId: id,
              type: "Failed Test",
              severity: "Critical",
              status: "Open",
              assignedManager: MANAGERS[0]!,
              resolution: "",
              raisedDate: today(),
            },
            ...prev,
          ]);
        }
        log(id, `${checkpoint} recorded as ${result}.`);
      },

      confirmAssembly: (id, confirmation) => {
        const wo = workOrders.find((w) => w.id === id);
        if (!wo) return;
        const serialNumber = `FG-${id}-${String(finishedGoods.length + 1).padStart(3, "0")}`;
        patchWo(id, (w) => ({
          ...w,
          status: "Completed",
          completionDate: today(),
          confirmation,
          stages: w.stages.map((s) => ({
            ...s,
            status: "Completed",
            startTime: s.startTime ?? confirmation.startTime,
            endTime: s.endTime ?? confirmation.endTime,
          })),
        }));
        setFinishedGoods((prev) => [
          {
            serialNumber,
            workOrderId: id,
            product: wo.finishedProduct,
            consumedComponentSerials: wo.bom.flatMap((c) => c.componentSerials),
            batchNumbers: wo.bom.map((c) => c.batchNumber),
            completionDate: today(),
            status: "Generated",
          },
          ...prev,
        ]);
        setCertificates((prev) => [
          {
            certificateNumber: `ACC-${id}`,
            workOrderId: id,
            product: wo.finishedProduct,
            operator: confirmation.operator,
            manager: MANAGERS[0]!,
            serialNumber,
            completionDate: today(),
            approval: "Pending Approval",
            testsPerformed: wo.checkpoints.map((c) => ({
              name: c.name,
              result: c.result,
              inspector: c.inspector,
            })),
            componentsUsed: wo.bom.map((c) => ({
              componentCode: c.componentCode,
              componentName: c.componentName,
              quantity: c.consumedQuantity,
            })),
          },
          ...prev,
        ]);
        log(id, `Assembly confirmed. Serial ${serialNumber} generated.`);
      },

      addReworkScrap: (record) => {
        const id = `RS-${Date.now()}`;
        setReworkScrap((prev) => [{ ...record, id, recordedDate: today() }, ...prev]);
        if (record.type === "Rework") {
          patchWo(record.workOrderId, (wo) => ({ ...wo, status: "Rework" }));
        }
        log(record.workOrderId, `${record.type} recorded (${record.reasonCode}).`);
      },

      addException: (record) => {
        const id = `EX-${Date.now()}`;
        setExceptions((prev) => [{ ...record, id, raisedDate: today() }, ...prev]);
        log(record.workOrderId, `${record.type} exception raised.`);
      },

      updateException: (id, patch) => {
        setExceptions((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
      },
    };
  }, [
    workOrders,
    reworkScrap,
    exceptions,
    finishedGoods,
    certificates,
    activity,
    currentUser,
    log,
    patchWo,
  ]);

  return <AmsContext.Provider value={value}>{children}</AmsContext.Provider>;
}

export function useAms() {
  const ctx = useContext(AmsContext);
  if (!ctx) throw new Error("useAms must be used within AmsProvider");
  return ctx;
}

export function useWorkOrder(id: string) {
  const { workOrders } = useAms();
  return workOrders.find((wo) => wo.id === id) ?? null;
}
