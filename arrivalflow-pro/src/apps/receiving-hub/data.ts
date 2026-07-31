import type {
  Discrepancy,
  Grn,
  Item,
  PurchaseOrder,
  Supplier,
  Warehouse,
} from "@/apps/receiving-hub/types";

export const suppliers: Supplier[] = [
  { id: "SUP-1042", name: "Bharat Electronics Ltd", contact: "R. Iyer", email: "orders@bel.co.in", gstin: "29AABCB1234F1Z5", rating: 4.6, onTimePct: 94 },
  { id: "SUP-1088", name: "Siemens Industrial Supplies", contact: "K. Fischer", email: "supply@siemens-in.com", gstin: "27AACCS9876K1Z2", rating: 4.8, onTimePct: 97 },
  { id: "SUP-1153", name: "Godrej Materials Pvt Ltd", contact: "S. Nadkarni", email: "sales@godrejmat.in", gstin: "27AAACG5566P1ZQ", rating: 4.1, onTimePct: 88 },
  { id: "SUP-1201", name: "Tata Steel Processing", contact: "A. Bose", email: "dispatch@tatasteel.com", gstin: "20AAACT2727Q1ZW", rating: 4.4, onTimePct: 91 },
  { id: "SUP-1265", name: "Havells Components", contact: "M. Sharma", email: "b2b@havells.com", gstin: "06AAACH4567L1ZB", rating: 4.3, onTimePct: 90 },
  { id: "SUP-1310", name: "Schneider Automation India", contact: "P. Menon", email: "orders@se-india.com", gstin: "33AAECS1122M1Z8", rating: 4.7, onTimePct: 96 },
  { id: "SUP-1377", name: "Ashok Leyland Spares", contact: "V. Raghavan", email: "spares@ashokley.in", gstin: "33AAACA1234H1ZR", rating: 3.9, onTimePct: 82 },
  { id: "SUP-1402", name: "Finolex Cables Ltd", contact: "D. Kulkarni", email: "trade@finolex.com", gstin: "27AAACF7788N1ZK", rating: 4.2, onTimePct: 89 },
];

export const items: Item[] = [
  { sku: "ELC-CN-0910", description: "Power Contactor 3P 25A 240V", uom: "EA", unitPrice: 1840, hsn: "8536", trackingType: "serial" },
  { sku: "ELC-RL-0421", description: "Control Relay 4PDT 24VDC", uom: "EA", unitPrice: 640, hsn: "8536", trackingType: "serial" },
  { sku: "MEC-BR-2204", description: "Deep Groove Ball Bearing 6204-2RS", uom: "BOX", unitPrice: 2350, hsn: "8482", trackingType: "batch", shelfLifeDays: 1460 },
  { sku: "MEC-BR-2208", description: "Tapered Roller Bearing 30208", uom: "BOX", unitPrice: 3120, hsn: "8482", trackingType: "batch", shelfLifeDays: 1460 },
  { sku: "CBL-PW-1650", description: "PVC Power Cable 4C x 16 sqmm", uom: "M", unitPrice: 512, hsn: "8544", trackingType: "batch", shelfLifeDays: 2190 },
  { sku: "CBL-CT-0250", description: "Control Cable 12C x 2.5 sqmm", uom: "M", unitPrice: 268, hsn: "8544", trackingType: "batch", shelfLifeDays: 2190 },
  { sku: "PCB-AS-3301", description: "PCB Assembly - Drive Controller Rev C", uom: "EA", unitPrice: 12450, hsn: "8537", trackingType: "serial" },
  { sku: "PCB-AS-3312", description: "PCB Assembly - I/O Expansion Module", uom: "EA", unitPrice: 8900, hsn: "8537", trackingType: "serial" },
  { sku: "HYD-VL-7710", description: "Hydraulic Directional Valve 4/3 NG6", uom: "EA", unitPrice: 15600, hsn: "8481", trackingType: "serial" },
  { sku: "HYD-HS-4420", description: "Hydraulic Hose R2AT 1/2in x 2m", uom: "EA", unitPrice: 1180, hsn: "4009", trackingType: "batch", shelfLifeDays: 1095 },
  { sku: "SAF-HL-0101", description: "Industrial Safety Helmet - Class E", uom: "BOX", unitPrice: 4200, hsn: "6506", trackingType: "none" },
  { sku: "SAF-GL-0208", description: "Cut Resistant Gloves Level 5 (Pair)", uom: "BOX", unitPrice: 2650, hsn: "6116", trackingType: "none" },
  { sku: "STL-SH-9001", description: "CR Steel Sheet 1.6mm 1250x2500", uom: "KG", unitPrice: 78, hsn: "7209", trackingType: "batch", shelfLifeDays: 3650 },
  { sku: "STL-RD-9040", description: "MS Round Bar 40mm", uom: "KG", unitPrice: 64, hsn: "7214", trackingType: "batch", shelfLifeDays: 3650 },
  { sku: "MTR-AC-5507", description: "AC Induction Motor 5.5kW B3", uom: "EA", unitPrice: 32800, hsn: "8501", trackingType: "serial" },
  { sku: "MTR-SV-1102", description: "Servo Motor 1.1kW with Encoder", uom: "EA", unitPrice: 48900, hsn: "8501", trackingType: "serial" },
  { sku: "SNS-PX-0330", description: "Inductive Proximity Sensor M18 PNP", uom: "EA", unitPrice: 1290, hsn: "8536", trackingType: "serial" },
  { sku: "SNS-TP-0455", description: "PT100 Temperature Probe 150mm", uom: "EA", unitPrice: 2140, hsn: "9025", trackingType: "serial" },
  { sku: "FST-BT-1020", description: "Hex Bolt M10x50 8.8 Zinc (100pc)", uom: "BOX", unitPrice: 890, hsn: "7318", trackingType: "none" },
  { sku: "FST-NT-1015", description: "Hex Nut M10 8.8 Zinc (200pc)", uom: "BOX", unitPrice: 460, hsn: "7318", trackingType: "none" },
  { sku: "PKG-CT-0602", description: "Corrugated Carton 600x400x400", uom: "BOX", unitPrice: 96, hsn: "4819", trackingType: "none" },
  { sku: "LUB-GR-0500", description: "Lithium Complex Grease EP2 500g", uom: "BOX", unitPrice: 1560, hsn: "2710", trackingType: "batch", shelfLifeDays: 730 },
  { sku: "ELC-BR-6300", description: "MCB 63A Triple Pole C-Curve", uom: "EA", unitPrice: 3450, hsn: "8536", trackingType: "serial" },
  { sku: "ELC-PS-2401", description: "DIN Rail SMPS 24VDC 10A", uom: "EA", unitPrice: 5680, hsn: "8504", trackingType: "serial" },
];

export const itemBySku = (sku: string) => items.find((i) => i.sku === sku)!;

export const warehouses: Warehouse[] = [
  {
    id: "WH-01",
    name: "Mumbai Central DC",
    city: "Bhiwandi, MH",
    zones: ["Bulk-A", "Bulk-B", "Rack-C", "Quarantine"],
    docks: [
      { id: "DOCK-A1", name: "Dock A1", utilization: 82, status: "Occupied" },
      { id: "DOCK-A2", name: "Dock A2", utilization: 45, status: "Occupied" },
      { id: "DOCK-A3", name: "Dock A3", utilization: 0, status: "Free" },
      { id: "DOCK-A4", name: "Dock A4", utilization: 67, status: "Occupied" },
      { id: "DOCK-A5", name: "Dock A5", utilization: 0, status: "Maintenance" },
    ],
  },
  {
    id: "WH-02",
    name: "Pune Industrial Hub",
    city: "Chakan, MH",
    zones: ["Rack-1", "Rack-2", "Cold-1"],
    docks: [
      { id: "DOCK-B1", name: "Dock B1", utilization: 55, status: "Occupied" },
      { id: "DOCK-B2", name: "Dock B2", utilization: 20, status: "Occupied" },
      { id: "DOCK-B3", name: "Dock B3", utilization: 0, status: "Free" },
      { id: "DOCK-B4", name: "Dock B4", utilization: 91, status: "Occupied" },
    ],
  },
  {
    id: "WH-03",
    name: "Chennai South Depot",
    city: "Sriperumbudur, TN",
    zones: ["Zone-N", "Zone-S", "Hazmat"],
    docks: [
      { id: "DOCK-C1", name: "Dock C1", utilization: 33, status: "Occupied" },
      { id: "DOCK-C2", name: "Dock C2", utilization: 0, status: "Free" },
      { id: "DOCK-C3", name: "Dock C3", utilization: 74, status: "Occupied" },
      { id: "DOCK-C4", name: "Dock C4", utilization: 12, status: "Occupied" },
      { id: "DOCK-C5", name: "Dock C5", utilization: 0, status: "Free" },
      { id: "DOCK-C6", name: "Dock C6", utilization: 58, status: "Occupied" },
    ],
  },
];

const line = (
  poNumber: string,
  idx: number,
  sku: string,
  orderedQty: number,
  receivedQty = 0,
) => {
  const it = itemBySku(sku);
  return {
    id: `${poNumber}-L${idx}`,
    sku,
    description: it.description,
    uom: it.uom,
    orderedQty,
    receivedQty,
    unitPrice: it.unitPrice,
    trackingType: it.trackingType,
  };
};

export const purchaseOrders: PurchaseOrder[] = [
  {
    poNumber: "PO-2026-00412", supplierId: "SUP-1042", orderDate: "2026-07-08", expectedDate: "2026-07-31",
    warehouseId: "WH-01", buyer: "N. Deshpande", status: "Open", priority: "High",
    lines: [line("PO-2026-00412", 1, "ELC-CN-0910", 120), line("PO-2026-00412", 2, "ELC-RL-0421", 200), line("PO-2026-00412", 3, "ELC-BR-6300", 60)],
  },
  {
    poNumber: "PO-2026-00418", supplierId: "SUP-1088", orderDate: "2026-07-10", expectedDate: "2026-07-31",
    warehouseId: "WH-01", buyer: "N. Deshpande", status: "Partially Received", priority: "Normal",
    lines: [line("PO-2026-00418", 1, "PCB-AS-3301", 40, 25), line("PO-2026-00418", 2, "PCB-AS-3312", 60, 60), line("PO-2026-00418", 3, "ELC-PS-2401", 30, 10)],
  },
  {
    poNumber: "PO-2026-00423", supplierId: "SUP-1153", orderDate: "2026-07-11", expectedDate: "2026-08-03",
    warehouseId: "WH-02", buyer: "R. Kapoor", status: "Open", priority: "Normal",
    lines: [line("PO-2026-00423", 1, "SAF-HL-0101", 40), line("PO-2026-00423", 2, "SAF-GL-0208", 80), line("PO-2026-00423", 3, "PKG-CT-0602", 500)],
  },
  {
    poNumber: "PO-2026-00431", supplierId: "SUP-1201", orderDate: "2026-07-02", expectedDate: "2026-07-24",
    warehouseId: "WH-01", buyer: "S. Fernandes", status: "Overdue", priority: "High",
    lines: [line("PO-2026-00431", 1, "STL-SH-9001", 4800), line("PO-2026-00431", 2, "STL-RD-9040", 2600)],
  },
  {
    poNumber: "PO-2026-00437", supplierId: "SUP-1265", orderDate: "2026-07-14", expectedDate: "2026-07-31",
    warehouseId: "WH-01", buyer: "R. Kapoor", status: "Open", priority: "Normal",
    lines: [line("PO-2026-00437", 1, "ELC-BR-6300", 90), line("PO-2026-00437", 2, "ELC-PS-2401", 45), line("PO-2026-00437", 3, "SNS-PX-0330", 150), line("PO-2026-00437", 4, "SNS-TP-0455", 70)],
  },
  {
    poNumber: "PO-2026-00444", supplierId: "SUP-1310", orderDate: "2026-07-15", expectedDate: "2026-08-06",
    warehouseId: "WH-03", buyer: "A. Menon", status: "Open", priority: "High",
    lines: [line("PO-2026-00444", 1, "MTR-SV-1102", 18), line("PO-2026-00444", 2, "MTR-AC-5507", 12), line("PO-2026-00444", 3, "HYD-VL-7710", 22)],
  },
  {
    poNumber: "PO-2026-00450", supplierId: "SUP-1377", orderDate: "2026-06-28", expectedDate: "2026-07-20",
    warehouseId: "WH-02", buyer: "S. Fernandes", status: "Partially Received", priority: "Low",
    lines: [line("PO-2026-00450", 1, "MEC-BR-2204", 60, 30), line("PO-2026-00450", 2, "MEC-BR-2208", 40, 40), line("PO-2026-00450", 3, "LUB-GR-0500", 120, 60)],
  },
  {
    poNumber: "PO-2026-00456", supplierId: "SUP-1402", orderDate: "2026-07-17", expectedDate: "2026-07-31",
    warehouseId: "WH-01", buyer: "N. Deshpande", status: "Open", priority: "Normal",
    lines: [line("PO-2026-00456", 1, "CBL-PW-1650", 1200), line("PO-2026-00456", 2, "CBL-CT-0250", 800)],
  },
  {
    poNumber: "PO-2026-00461", supplierId: "SUP-1042", orderDate: "2026-06-20", expectedDate: "2026-07-12",
    warehouseId: "WH-01", buyer: "R. Kapoor", status: "Fully Received", priority: "Normal",
    lines: [line("PO-2026-00461", 1, "ELC-CN-0910", 80, 80), line("PO-2026-00461", 2, "ELC-RL-0421", 150, 150)],
  },
  {
    poNumber: "PO-2026-00466", supplierId: "SUP-1088", orderDate: "2026-07-18", expectedDate: "2026-08-10",
    warehouseId: "WH-03", buyer: "A. Menon", status: "Open", priority: "Normal",
    lines: [line("PO-2026-00466", 1, "SNS-PX-0330", 220), line("PO-2026-00466", 2, "SNS-TP-0455", 110), line("PO-2026-00466", 3, "ELC-PS-2401", 55), line("PO-2026-00466", 4, "ELC-RL-0421", 300)],
  },
  {
    poNumber: "PO-2026-00470", supplierId: "SUP-1153", orderDate: "2026-07-19", expectedDate: "2026-07-30",
    warehouseId: "WH-02", buyer: "S. Fernandes", status: "Open", priority: "High",
    lines: [line("PO-2026-00470", 1, "FST-BT-1020", 240), line("PO-2026-00470", 2, "FST-NT-1015", 320), line("PO-2026-00470", 3, "PKG-CT-0602", 900)],
  },
  {
    poNumber: "PO-2026-00474", supplierId: "SUP-1201", orderDate: "2026-07-21", expectedDate: "2026-08-14",
    warehouseId: "WH-01", buyer: "N. Deshpande", status: "Open", priority: "Normal",
    lines: [line("PO-2026-00474", 1, "STL-SH-9001", 6200), line("PO-2026-00474", 2, "STL-RD-9040", 3400), line("PO-2026-00474", 3, "MEC-BR-2204", 45)],
  },
  {
    poNumber: "PO-2026-00479", supplierId: "SUP-1310", orderDate: "2026-07-22", expectedDate: "2026-08-04",
    warehouseId: "WH-01", buyer: "A. Menon", status: "Open", priority: "Normal",
    lines: [line("PO-2026-00479", 1, "HYD-VL-7710", 16), line("PO-2026-00479", 2, "HYD-HS-4420", 90), line("PO-2026-00479", 3, "LUB-GR-0500", 140)],
  },
  {
    poNumber: "PO-2026-00483", supplierId: "SUP-1402", orderDate: "2026-05-30", expectedDate: "2026-06-25",
    warehouseId: "WH-03", buyer: "R. Kapoor", status: "Closed", priority: "Low",
    lines: [line("PO-2026-00483", 1, "CBL-CT-0250", 400, 400)],
  },
];

const grnLine = (
  grnId: string,
  idx: number,
  sku: string,
  orderedQty: number,
  receivedQty: number,
  previouslyReceived = 0,
) => {
  const it = itemBySku(sku);
  return {
    id: `${grnId}-L${idx}`,
    sku,
    description: it.description,
    uom: it.uom,
    orderedQty,
    previouslyReceived,
    receivedQty,
    rejectedQty: 0,
    trackingType: it.trackingType,
  };
};

export const seedGrns: Grn[] = [
  {
    id: "GRN-2026-0331", poNumber: "PO-2026-00418", supplierId: "SUP-1088", warehouseId: "WH-01", dockId: "DOCK-A1",
    vehicleNo: "MH-04-KJ-8821", driverName: "Ramesh Pawar", driverPhone: "+91 98204 11223", transporter: "Safexpress",
    gateEntryNo: "GE-2026-1180", gateEntryTime: "2026-07-28T07:40:00", receiver: "A. Mehta", invoiceNo: "INV/SIE/4471",
    remarks: "Partial consignment, balance in transit.", receiptDate: "2026-07-28", status: "Completed", isPartial: true,
    lines: [grnLine("GRN-2026-0331", 1, "PCB-AS-3301", 40, 25), grnLine("GRN-2026-0331", 2, "PCB-AS-3312", 60, 60)],
    serials: [], batches: [], discrepancyIds: [], stages: { gateEntry: 32, grn: 54, inspection: 88, putaway: 61 },
  },
  {
    id: "GRN-2026-0334", poNumber: "PO-2026-00450", supplierId: "SUP-1377", warehouseId: "WH-02", dockId: "DOCK-B2",
    vehicleNo: "TN-22-BC-4410", driverName: "Suresh Kumar", driverPhone: "+91 90031 55210", transporter: "TCI Freight",
    gateEntryNo: "GE-2026-1184", gateEntryTime: "2026-07-28T09:05:00", receiver: "P. Bhatt", invoiceNo: "INV/ALS/9902",
    remarks: "", receiptDate: "2026-07-28", status: "Pending Inspection", isPartial: true,
    lines: [grnLine("GRN-2026-0334", 1, "MEC-BR-2204", 60, 30), grnLine("GRN-2026-0334", 2, "MEC-BR-2208", 40, 40)],
    serials: [], batches: [], discrepancyIds: ["DSC-2026-0021"], stages: { gateEntry: 41, grn: 66, inspection: 0, putaway: 0 },
  },
  {
    id: "GRN-2026-0336", poNumber: "PO-2026-00461", supplierId: "SUP-1042", warehouseId: "WH-01", dockId: "DOCK-A2",
    vehicleNo: "MH-01-AC-7712", driverName: "Imran Shaikh", driverPhone: "+91 99871 33440", transporter: "Blue Dart Surface",
    gateEntryNo: "GE-2026-1171", gateEntryTime: "2026-07-26T06:20:00", receiver: "A. Mehta", invoiceNo: "INV/BEL/2210",
    remarks: "Clean receipt.", receiptDate: "2026-07-26", status: "Completed", isPartial: false,
    lines: [grnLine("GRN-2026-0336", 1, "ELC-CN-0910", 80, 80), grnLine("GRN-2026-0336", 2, "ELC-RL-0421", 150, 150)],
    serials: [], batches: [], discrepancyIds: [], stages: { gateEntry: 24, grn: 43, inspection: 62, putaway: 48 },
  },
  {
    id: "GRN-2026-0338", poNumber: "PO-2026-00483", supplierId: "SUP-1402", warehouseId: "WH-03", dockId: "DOCK-C3",
    vehicleNo: "TN-09-FG-1102", driverName: "Karthik R", driverPhone: "+91 98404 78120", transporter: "Gati KWE",
    gateEntryNo: "GE-2026-1160", gateEntryTime: "2026-07-24T11:10:00", receiver: "L. Ganesan", invoiceNo: "INV/FIN/7781",
    remarks: "", receiptDate: "2026-07-24", status: "Completed", isPartial: false,
    lines: [grnLine("GRN-2026-0338", 1, "CBL-CT-0250", 400, 400)],
    serials: [], batches: [], discrepancyIds: [], stages: { gateEntry: 38, grn: 71, inspection: 95, putaway: 77 },
  },
  {
    id: "GRN-2026-0340", poNumber: null, supplierId: "SUP-1265", warehouseId: "WH-01", dockId: "DOCK-A4",
    vehicleNo: "MH-43-XY-2201", driverName: "Deepak Yadav", driverPhone: "+91 98330 21114", transporter: "Own Fleet",
    gateEntryNo: "GE-2026-1188", gateEntryTime: "2026-07-29T08:15:00", receiver: "A. Mehta", invoiceNo: "DC/HAV/551",
    remarks: "Emergency line-down replacement.", receiptDate: "2026-07-29", status: "Pending Approval", isPartial: false,
    lines: [grnLine("GRN-2026-0340", 1, "ELC-BR-6300", 12, 12)],
    serials: [], batches: [], discrepancyIds: [], stages: { gateEntry: 29, grn: 51, inspection: 0, putaway: 0 },
    nonPoReason: "Emergency Purchase",
  },
  {
    id: "GRN-2026-0342", poNumber: "PO-2026-00431", supplierId: "SUP-1201", warehouseId: "WH-01", dockId: "DOCK-A1",
    vehicleNo: "MH-46-PL-9903", driverName: "Sanjay Patil", driverPhone: "+91 90045 66710", transporter: "VRL Logistics",
    gateEntryNo: "GE-2026-1190", gateEntryTime: "2026-07-30T05:50:00", receiver: "P. Bhatt", invoiceNo: "INV/TSP/3312",
    remarks: "Weighbridge variance noted.", receiptDate: "2026-07-30", status: "Pending Inspection", isPartial: true,
    lines: [grnLine("GRN-2026-0342", 1, "STL-SH-9001", 4800, 2400)],
    serials: [], batches: [], discrepancyIds: ["DSC-2026-0023"], stages: { gateEntry: 47, grn: 82, inspection: 0, putaway: 0 },
  },
  {
    id: "GRN-2026-0344", poNumber: "PO-2026-00423", supplierId: "SUP-1153", warehouseId: "WH-02", dockId: "DOCK-B1",
    vehicleNo: "MH-12-QW-5540", driverName: "Ganesh More", driverPhone: "+91 99226 71120", transporter: "Delhivery Freight",
    gateEntryNo: "GE-2026-1176", gateEntryTime: "2026-07-27T10:30:00", receiver: "P. Bhatt", invoiceNo: "INV/GDJ/1180",
    remarks: "", receiptDate: "2026-07-27", status: "Draft", isPartial: false,
    lines: [grnLine("GRN-2026-0344", 1, "SAF-HL-0101", 40, 40), grnLine("GRN-2026-0344", 2, "SAF-GL-0208", 80, 80)],
    serials: [], batches: [], discrepancyIds: [], stages: { gateEntry: 35, grn: 0, inspection: 0, putaway: 0 },
  },
  {
    id: "GRN-2026-0346", poNumber: "PO-2026-00444", supplierId: "SUP-1310", warehouseId: "WH-03", dockId: "DOCK-C1",
    vehicleNo: "TN-11-ZK-6620", driverName: "Vignesh S", driverPhone: "+91 89390 44120", transporter: "Safexpress",
    gateEntryNo: "GE-2026-1193", gateEntryTime: "2026-07-30T13:00:00", receiver: "L. Ganesan", invoiceNo: "INV/SEI/8890",
    remarks: "High-value serialised goods.", receiptDate: "2026-07-30", status: "Pending Inspection", isPartial: true,
    lines: [grnLine("GRN-2026-0346", 1, "MTR-SV-1102", 18, 6), grnLine("GRN-2026-0346", 2, "HYD-VL-7710", 22, 22)],
    serials: [], batches: [], discrepancyIds: [], stages: { gateEntry: 52, grn: 90, inspection: 0, putaway: 0 },
  },
  {
    id: "GRN-2026-0348", poNumber: "PO-2026-00456", supplierId: "SUP-1402", warehouseId: "WH-01", dockId: "DOCK-A2",
    vehicleNo: "MH-04-RT-1180", driverName: "Anil Jadhav", driverPhone: "+91 98195 30021", transporter: "TCI Freight",
    gateEntryNo: "GE-2026-1195", gateEntryTime: "2026-07-31T06:45:00", receiver: "A. Mehta", invoiceNo: "INV/FIN/8123",
    remarks: "", receiptDate: "2026-07-31", status: "Completed", isPartial: true,
    lines: [grnLine("GRN-2026-0348", 1, "CBL-PW-1650", 1200, 600)],
    serials: [], batches: [], discrepancyIds: [], stages: { gateEntry: 27, grn: 49, inspection: 70, putaway: 55 },
  },
];

export const seedDiscrepancies: Discrepancy[] = [
  { id: "DSC-2026-0018", grnId: "GRN-2026-0336", poNumber: "PO-2026-00461", type: "Packaging Damage", sku: "ELC-CN-0910", qtyAffected: 3, severity: "Low", description: "Outer carton crushed, contents intact.", status: "Resolved", raisedBy: "A. Mehta", raisedOn: "2026-07-26" },
  { id: "DSC-2026-0019", grnId: "GRN-2026-0338", poNumber: "PO-2026-00483", type: "Missing Documents", sku: "CBL-CT-0250", qtyAffected: 0, severity: "Medium", description: "Test certificate not enclosed with consignment.", status: "In Review", raisedBy: "L. Ganesan", raisedOn: "2026-07-24" },
  { id: "DSC-2026-0021", grnId: "GRN-2026-0334", poNumber: "PO-2026-00450", type: "Damage", sku: "MEC-BR-2204", qtyAffected: 4, severity: "High", description: "Corrosion observed on 4 bearing units.", status: "Open", raisedBy: "P. Bhatt", raisedOn: "2026-07-28" },
  { id: "DSC-2026-0022", grnId: "GRN-2026-0344", poNumber: "PO-2026-00423", type: "Wrong Item", sku: "SAF-GL-0208", qtyAffected: 6, severity: "Medium", description: "Level 3 gloves supplied instead of Level 5.", status: "Escalated", raisedBy: "P. Bhatt", raisedOn: "2026-07-27" },
  { id: "DSC-2026-0023", grnId: "GRN-2026-0342", poNumber: "PO-2026-00431", type: "Quantity Mismatch", sku: "STL-SH-9001", qtyAffected: 120, severity: "High", description: "Weighbridge shows 120 kg short against DC.", status: "Open", raisedBy: "P. Bhatt", raisedOn: "2026-07-30" },
  { id: "DSC-2026-0024", grnId: "GRN-2026-0346", poNumber: "PO-2026-00444", type: "Damage", sku: "HYD-VL-7710", qtyAffected: 1, severity: "Medium", description: "Valve body dented during unloading.", status: "In Review", raisedBy: "L. Ganesan", raisedOn: "2026-07-30" },
];

export const supplierById = (id: string) => suppliers.find((s) => s.id === id)!;
export const warehouseById = (id: string) => warehouses.find((w) => w.id === id)!;
export const poByNumber = (n: string) => purchaseOrders.find((p) => p.poNumber === n);
export const poValue = (po: PurchaseOrder) =>
  po.lines.reduce((s, l) => s + l.orderedQty * l.unitPrice, 0);
