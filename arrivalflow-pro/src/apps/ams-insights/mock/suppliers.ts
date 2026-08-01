export interface Supplier {
  id: string;
  name: string;
  code: string;
  country: string;
  category: string;
  status: "Active" | "On Hold" | "Blocked";
  openPOs: number;
  spendCr: number;
}

export const suppliers: Supplier[] = [
  { id: "SUP-1001", name: "Siemens Ltd.", code: "SIE-IN", country: "Germany", category: "Electrical Equipment", status: "Active", openPOs: 24, spendCr: 42.6 },
  { id: "SUP-1002", name: "ABB India Ltd.", code: "ABB-IN", country: "Switzerland", category: "Automation", status: "Active", openPOs: 18, spendCr: 31.2 },
  { id: "SUP-1003", name: "Schneider Electric", code: "SCH-FR", country: "France", category: "Power Systems", status: "Active", openPOs: 15, spendCr: 27.9 },
  { id: "SUP-1004", name: "L&T Electricals", code: "LNT-IN", country: "India", category: "Switchgear", status: "Active", openPOs: 12, spendCr: 19.4 },
  { id: "SUP-1005", name: "CG Power Systems", code: "CGP-IN", country: "India", category: "Transformers", status: "On Hold", openPOs: 7, spendCr: 11.8 },
  { id: "SUP-1006", name: "Havells India", code: "HAV-IN", country: "India", category: "Cables & Wires", status: "Active", openPOs: 9, spendCr: 8.3 },
  { id: "SUP-1007", name: "Bosch Rexroth", code: "BOS-DE", country: "Germany", category: "Hydraulics", status: "Active", openPOs: 6, spendCr: 14.1 },
  { id: "SUP-1008", name: "Mitsubishi Electric", code: "MIT-JP", country: "Japan", category: "Drives", status: "Blocked", openPOs: 0, spendCr: 4.5 },
];
