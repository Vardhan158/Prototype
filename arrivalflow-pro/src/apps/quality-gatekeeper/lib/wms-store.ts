import { useSyncExternalStore } from "react";
import { GRNS, type GRN, type InspectionStatus } from "./wms-data";

type State = {
  grns: GRN[];
  warehouse: string;
  language: string;
  role: string;
};

let state: State = {
  grns: GRNS.map((g) => ({ ...g, lines: g.lines.map((l) => ({ ...l })) })),
  warehouse: "PL-1000 · Pune Plant",
  language: "English (EN)",
  role: "Quality Inspector",
};

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export function useWms() {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => state,
  );
}

function setState(next: Partial<State>) {
  state = { ...state, ...next };
  emit();
}

function updateGrn(id: string, patch: (g: GRN) => GRN) {
  setState({ grns: state.grns.map((g) => (g.id === id ? patch(g) : g)) });
}

export const actions = {
  setWarehouse: (warehouse: string) => setState({ warehouse }),
  setLanguage: (language: string) => setState({ language }),
  setRole: (role: string) => setState({ role }),
  assign: (id: string, inspector: string) =>
    updateGrn(id, (g) => ({
      ...g,
      inspector,
      status: "Assigned",
      timeline: [...g.timeline, { at: nowLabel(), label: `Inspector ${inspector} assigned`, by: "K. Iyer (Quality Manager)" }],
    })),
  start: (id: string) =>
    updateGrn(id, (g) => ({
      ...g,
      status: "Inspection Started",
      inspector: g.inspector === "Unassigned" ? "A. Sharma" : g.inspector,
      timeline: [...g.timeline, { at: nowLabel(), label: "Inspection started", by: g.inspector === "Unassigned" ? "A. Sharma" : g.inspector }],
    })),
  setStatus: (id: string, status: InspectionStatus, note: string) =>
    updateGrn(id, (g) => ({
      ...g,
      status,
      timeline: [...g.timeline, { at: nowLabel(), label: note, by: g.inspector }],
    })),
  setInspectionType: (id: string, inspectionType: GRN["inspectionType"]) =>
    updateGrn(id, (g) => ({ ...g, inspectionType })),
  updateLine: (id: string, code: string, patch: Partial<GRN["lines"][number]>) =>
    updateGrn(id, (g) => ({
      ...g,
      lines: g.lines.map((l) => (l.code === code ? { ...l, ...patch } : l)),
    })),
};

export function nowLabel() {
  return new Date().toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function useGrn(idOrNumber: string) {
  const { grns } = useWms();
  return grns.find((g) => g.id === idOrNumber || g.grn === idOrNumber);
}
