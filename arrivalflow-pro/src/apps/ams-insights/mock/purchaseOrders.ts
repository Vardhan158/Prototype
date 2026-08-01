export type POStatus =
  | "Open"
  | "Approved"
  | "Sent"
  | "Partially Received"
  | "Received"
  | "Cancelled";

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplier: string;
  orderDate: string;
  expectedDelivery: string;
  currency: string;
  totalAmount: string;
  status: POStatus;
}

export const purchaseOrders: PurchaseOrder[] = [
  { id: "1", poNumber: "PO-26-000567", supplier: "Siemens Ltd.", orderDate: "15 Jul 2026", expectedDelivery: "30 Jul 2026", currency: "INR", totalAmount: "₹25,45,320", status: "Open" },
  { id: "2", poNumber: "PO-26-000566", supplier: "ABB India Ltd.", orderDate: "14 Jul 2026", expectedDelivery: "29 Jul 2026", currency: "INR", totalAmount: "₹18,90,000", status: "Partially Received" },
  { id: "3", poNumber: "PO-26-000565", supplier: "Schneider Electric", orderDate: "12 Jul 2026", expectedDelivery: "27 Jul 2026", currency: "EUR", totalAmount: "€2,14,500", status: "Sent" },
  { id: "4", poNumber: "PO-26-000564", supplier: "L&T Electricals", orderDate: "11 Jul 2026", expectedDelivery: "26 Jul 2026", currency: "INR", totalAmount: "₹9,72,150", status: "Open" },
  { id: "5", poNumber: "PO-26-000563", supplier: "CG Power Systems", orderDate: "09 Jul 2026", expectedDelivery: "24 Jul 2026", currency: "INR", totalAmount: "₹31,08,700", status: "Approved" },
  { id: "6", poNumber: "PO-26-000562", supplier: "Havells India", orderDate: "08 Jul 2026", expectedDelivery: "22 Jul 2026", currency: "INR", totalAmount: "₹6,45,900", status: "Received" },
  { id: "7", poNumber: "PO-26-000561", supplier: "Bosch Rexroth", orderDate: "06 Jul 2026", expectedDelivery: "21 Jul 2026", currency: "USD", totalAmount: "$1,45,300", status: "Sent" },
  { id: "8", poNumber: "PO-26-000560", supplier: "Mitsubishi Electric", orderDate: "04 Jul 2026", expectedDelivery: "19 Jul 2026", currency: "JPY", totalAmount: "¥88,20,000", status: "Cancelled" },
  { id: "9", poNumber: "PO-26-000559", supplier: "Siemens Ltd.", orderDate: "02 Jul 2026", expectedDelivery: "18 Jul 2026", currency: "INR", totalAmount: "₹14,20,640", status: "Approved" },
  { id: "10", poNumber: "PO-26-000558", supplier: "ABB India Ltd.", orderDate: "01 Jul 2026", expectedDelivery: "16 Jul 2026", currency: "INR", totalAmount: "₹22,75,000", status: "Partially Received" },
  { id: "11", poNumber: "PO-26-000557", supplier: "Schneider Electric", orderDate: "28 Jun 2026", expectedDelivery: "14 Jul 2026", currency: "INR", totalAmount: "₹7,15,480", status: "Received" },
  { id: "12", poNumber: "PO-26-000556", supplier: "L&T Electricals", orderDate: "26 Jun 2026", expectedDelivery: "12 Jul 2026", currency: "INR", totalAmount: "₹11,60,000", status: "Open" },
];

export const poStatusDistribution = [
  { name: "Open", value: 356, color: "var(--color-chart-1)" },
  { name: "Approved", value: 214, color: "var(--color-chart-2)" },
  { name: "Sent", value: 168, color: "var(--color-chart-3)" },
  { name: "Partially Received", value: 128, color: "var(--color-chart-4)" },
  { name: "Received", value: 336, color: "var(--color-chart-5)" },
  { name: "Cancelled", value: 46, color: "var(--color-chart-6)" },
];
