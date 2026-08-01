export type EntryStatus =
  | "New"
  | "Vehicle Verified"
  | "Driver Verified"
  | "PO Verified"
  | "Approved"
  | "Hold"
  | "Rejected"
  | "Waiting Warehouse"
  | "Accepted"
  | "Exited";

export interface Vehicle {
  number: string;
  type: string;
  transporter: string;
  truckPhoto: boolean;
  platePhoto: boolean;
}

export interface Driver {
  name: string;
  phone: string;
  license: string;
  licenseExpiry: string;
  govId: string;
  photo: boolean;
}

export interface Delivery {
  po: string;
  vendor: string;
  category: string;
  expected: string;
  dock: string;
  pallets: number;
}

export interface GateEntry {
  id: string;
  gateNo: string;
  status: EntryStatus;
  vehicle: Vehicle;
  driver: Driver;
  delivery: Delivery;
  arrival: string;
  exitTime?: string | undefined;
  holdReason?: string | undefined;
  voiceNote?: number | undefined;
  warehouse: string;
  gate: string;
  timeline: { label: string; time: string; done: boolean }[];
}

export interface AppNotification {
  id: string;
  kind: "accepted" | "rejected" | "hold" | "message";
  title: string;
  body: string;
  time: string;
  read: boolean;
}