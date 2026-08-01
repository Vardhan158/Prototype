export type ASNStatus = "In Transit" | "Arrived" | "Pending" | "Dispatched";

export interface ASN {
  id: string;
  asnNumber: string;
  poNumber: string;
  supplier: string;
  eta: string;
  status: ASNStatus;
}

export const asnList: ASN[] = [
  { id: "1", asnNumber: "ASN-26-004512", poNumber: "PO-26-000567", supplier: "Siemens Ltd.", eta: "28 Jul 2026", status: "In Transit" },
  { id: "2", asnNumber: "ASN-26-004511", poNumber: "PO-26-000566", supplier: "ABB India Ltd.", eta: "27 Jul 2026", status: "Arrived" },
  { id: "3", asnNumber: "ASN-26-004510", poNumber: "PO-26-000565", supplier: "Schneider Electric", eta: "26 Jul 2026", status: "Pending" },
  { id: "4", asnNumber: "ASN-26-004509", poNumber: "PO-26-000564", supplier: "L&T Electricals", eta: "25 Jul 2026", status: "Dispatched" },
  { id: "5", asnNumber: "ASN-26-004508", poNumber: "PO-26-000563", supplier: "CG Power Systems", eta: "23 Jul 2026", status: "In Transit" },
  { id: "6", asnNumber: "ASN-26-004507", poNumber: "PO-26-000562", supplier: "Havells India", eta: "21 Jul 2026", status: "Arrived" },
];
