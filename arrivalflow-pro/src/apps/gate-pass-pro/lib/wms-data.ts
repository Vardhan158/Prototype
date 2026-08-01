export type GateStatus =
  | "Draft"
  | "Vehicle Verified"
  | "Driver Verified"
  | "PO Verified"
  | "Appointment Verified"
  | "Pending Approval"
  | "Approved"
  | "On Hold"
  | "Rejected"
  | "Waiting Warehouse"
  | "Warehouse Accepted"
  | "Receiving"
  | "Completed";

export type GateEntry = {
  id: string;
  truck: string;
  vendor: string;
  vendorCode: string;
  po: string;
  poValue: string;
  arrival: string;
  scheduled: string;
  delayMin: number;
  driver: string;
  driverId: string;
  phone: string;
  license: string;
  licenseExpiry: string;
  status: GateStatus;
  gate: string;
  dock: string;
  material: string;
  qty: string;
  weight: string;
  transporter: string;
  vehicleType: string;
  trailer: string;
  container: string;
  waitingMin: number;
  officer: string;
  warehouse: string;
  blacklisted: boolean;
  holdReason?: string;
};

export const gateEntries: GateEntry[] = [
  {
    id: "GE-2026-004821", truck: "MH-12-KL-4471", vendor: "Tata Steel Processing Ltd.", vendorCode: "V-10422",
    po: "PO-4500219847", poValue: "₹ 18,42,000", arrival: "2026-08-01 06:12", scheduled: "2026-08-01 06:00", delayMin: 12,
    driver: "Ramesh Patil", driverId: "DRV-2291", phone: "+91 98220 41192", license: "MH1220190004471", licenseExpiry: "2029-04-18",
    status: "Warehouse Accepted", gate: "Gate 01 - Inbound", dock: "DOCK-04", material: "CRCA Coil 1.2mm", qty: "24 MT",
    weight: "38.42 MT", transporter: "Shree Balaji Roadlines", vehicleType: "Trailer 40ft", trailer: "TRL-8891", container: "MSCU-4471902",
    waitingMin: 22, officer: "S. Kulkarni", warehouse: "WH-01 Bhiwandi", blacklisted: false,
  },
  {
    id: "GE-2026-004822", truck: "GJ-01-DT-9082", vendor: "Reliance Polymers Pvt Ltd", vendorCode: "V-10871",
    po: "PO-4500219902", poValue: "₹ 7,15,400", arrival: "2026-08-01 07:04", scheduled: "2026-08-01 07:00", delayMin: 4,
    driver: "Iqbal Shaikh", driverId: "DRV-1188", phone: "+91 99042 77310", license: "GJ0120170009082", licenseExpiry: "2027-11-02",
    status: "Receiving", gate: "Gate 01 - Inbound", dock: "DOCK-02", material: "HDPE Granules 25kg", qty: "640 Bags",
    weight: "22.10 MT", transporter: "VRL Logistics", vehicleType: "Container 32ft MXL", trailer: "—", container: "TGHU-9910233",
    waitingMin: 14, officer: "S. Kulkarni", warehouse: "WH-01 Bhiwandi", blacklisted: false,
  },
  {
    id: "GE-2026-004823", truck: "KA-05-AC-1123", vendor: "Bosch Automotive Spares", vendorCode: "V-10099",
    po: "PO-4500220014", poValue: "₹ 2,88,900", arrival: "2026-08-01 08:31", scheduled: "2026-08-01 08:00", delayMin: 31,
    driver: "Suresh Gowda", driverId: "DRV-3310", phone: "+91 90084 22114", license: "KA0520210001123", licenseExpiry: "2026-09-12",
    status: "Pending Approval", gate: "Gate 02 - Inbound", dock: "Unassigned", material: "Fuel Injector Assy", qty: "1,200 Nos",
    weight: "6.80 MT", transporter: "Safexpress", vehicleType: "Truck 19ft", trailer: "—", container: "—",
    waitingMin: 41, officer: "A. Fernandes", warehouse: "WH-02 Hosur", blacklisted: false,
    holdReason: "Appointment slot mismatch",
  },
  {
    id: "GE-2026-004824", truck: "DL-01-GB-7745", vendor: "Havells Electricals", vendorCode: "V-11230",
    po: "PO-4500220098", poValue: "₹ 11,04,200", arrival: "2026-08-01 09:02", scheduled: "2026-08-01 09:15", delayMin: 0,
    driver: "Jagdish Yadav", driverId: "DRV-4402", phone: "+91 88002 19934", license: "DL0120180007745", licenseExpiry: "2026-08-20",
    status: "Approved", gate: "Gate 01 - Inbound", dock: "DOCK-07", material: "MCB Distribution Boards", qty: "310 Cartons",
    weight: "9.44 MT", transporter: "Gati KWE", vehicleType: "Truck 22ft", trailer: "—", container: "—",
    waitingMin: 9, officer: "S. Kulkarni", warehouse: "WH-01 Bhiwandi", blacklisted: false,
  },
  {
    id: "GE-2026-004825", truck: "RJ-14-CV-3390", vendor: "Ultratech Cement Depot", vendorCode: "V-10555",
    po: "—", poValue: "—", arrival: "2026-08-01 09:48", scheduled: "—", delayMin: 0,
    driver: "Mohan Lal Meena", driverId: "DRV-2210", phone: "+91 94140 88213", license: "RJ1420150003390", licenseExpiry: "2025-12-30",
    status: "Rejected", gate: "Gate 02 - Inbound", dock: "—", material: "OPC 53 Grade", qty: "—",
    weight: "—", transporter: "Rajdhani Carriers", vehicleType: "Tipper 16 Wheeler", trailer: "—", container: "—",
    waitingMin: 63, officer: "A. Fernandes", warehouse: "WH-02 Hosur", blacklisted: true,
    holdReason: "Expired driving licence + No purchase order reference",
  },
  {
    id: "GE-2026-004826", truck: "TN-38-BQ-5567", vendor: "Ashok Leyland Components", vendorCode: "V-10777",
    po: "PO-4500220133", poValue: "₹ 5,62,700", arrival: "2026-08-01 10:20", scheduled: "2026-08-01 10:30", delayMin: 0,
    driver: "K. Murugan", driverId: "DRV-5521", phone: "+91 93450 11229", license: "TN3820200005567", licenseExpiry: "2030-01-15",
    status: "Waiting Warehouse", gate: "Gate 01 - Inbound", dock: "DOCK-01", material: "Leaf Spring Assy", qty: "480 Nos",
    weight: "17.90 MT", transporter: "TCI Freight", vehicleType: "Trailer 40ft", trailer: "TRL-2201", container: "—",
    waitingMin: 18, officer: "S. Kulkarni", warehouse: "WH-01 Bhiwandi", blacklisted: false,
  },
  {
    id: "GE-2026-004827", truck: "UP-16-FT-2204", vendor: "Dabur Consumer Care", vendorCode: "V-12001",
    po: "PO-4500220150", poValue: "₹ 3,31,000", arrival: "2026-08-01 10:55", scheduled: "2026-08-01 11:00", delayMin: 0,
    driver: "Anil Kumar Singh", driverId: "DRV-6612", phone: "+91 97110 44821", license: "UP1620190002204", licenseExpiry: "2028-06-01",
    status: "Draft", gate: "Gate 03 - Inbound", dock: "—", material: "FMCG Mixed Cartons", qty: "890 Cartons",
    weight: "12.30 MT", transporter: "Delhivery Freight", vehicleType: "Truck 24ft", trailer: "—", container: "—",
    waitingMin: 5, officer: "R. Nair", warehouse: "WH-03 Ghaziabad", blacklisted: false,
  },
  {
    id: "GE-2026-004828", truck: "AP-28-XZ-8890", vendor: "Amara Raja Batteries", vendorCode: "V-10310",
    po: "PO-4500220166", poValue: "₹ 9,90,500", arrival: "2026-08-01 11:26", scheduled: "2026-08-01 11:00", delayMin: 26,
    driver: "V. Srinivas", driverId: "DRV-7712", phone: "+91 90000 33218", license: "AP2820170008890", licenseExpiry: "2027-03-22",
    status: "On Hold", gate: "Gate 02 - Inbound", dock: "—", material: "Lead Acid Battery 150Ah", qty: "260 Nos",
    weight: "14.60 MT", transporter: "Blue Dart Surface", vehicleType: "Truck 22ft", trailer: "—", container: "—",
    waitingMin: 34, officer: "A. Fernandes", warehouse: "WH-02 Hosur", blacklisted: false,
    holdReason: "Hazard label missing on consignment",
  },
  {
    id: "GE-2026-004829", truck: "HR-55-AB-6612", vendor: "Maruti Suzuki Spares Div.", vendorCode: "V-10004",
    po: "PO-4500220171", poValue: "₹ 21,40,000", arrival: "2026-08-01 12:02", scheduled: "2026-08-01 12:00", delayMin: 2,
    driver: "Balwinder Singh", driverId: "DRV-8823", phone: "+91 98180 77412", license: "HR5520160006612", licenseExpiry: "2029-09-09",
    status: "Completed", gate: "Gate 01 - Inbound", dock: "DOCK-05", material: "Body Panel Pressings", qty: "150 Pallets",
    weight: "26.75 MT", transporter: "Rivigo", vehicleType: "Trailer 40ft", trailer: "TRL-5512", container: "—",
    waitingMin: 11, officer: "S. Kulkarni", warehouse: "WH-01 Bhiwandi", blacklisted: false,
  },
  {
    id: "GE-2026-004830", truck: "WB-23-LM-1005", vendor: "ITC Paperboards", vendorCode: "V-11888",
    po: "PO-4500220188", poValue: "₹ 4,72,300", arrival: "2026-08-01 12:40", scheduled: "2026-08-01 12:30", delayMin: 10,
    driver: "Sanjoy Das", driverId: "DRV-9931", phone: "+91 98300 22014", license: "WB2320180001005", licenseExpiry: "2028-02-11",
    status: "Vehicle Verified", gate: "Gate 03 - Inbound", dock: "—", material: "Duplex Board Reels", qty: "42 Reels",
    weight: "19.20 MT", transporter: "Om Logistics", vehicleType: "Truck 32ft", trailer: "—", container: "—",
    waitingMin: 7, officer: "R. Nair", warehouse: "WH-03 Ghaziabad", blacklisted: false,
  },
];

export const statusTone: Record<GateStatus, "neutral" | "info" | "success" | "warning" | "danger" | "teal"> = {
  Draft: "neutral",
  "Vehicle Verified": "info",
  "Driver Verified": "info",
  "PO Verified": "info",
  "Appointment Verified": "info",
  "Pending Approval": "warning",
  Approved: "success",
  "On Hold": "warning",
  Rejected: "danger",
  "Waiting Warehouse": "teal",
  "Warehouse Accepted": "success",
  Receiving: "teal",
  Completed: "neutral",
};

export const kpis = [
  { label: "Today's Entries", value: 47, delta: "+12% vs yesterday", tone: "info" as const, icon: "LogIn" },
  { label: "Today's Exits", value: 39, delta: "+6% vs yesterday", tone: "teal" as const, icon: "LogOut" },
  { label: "Vehicles Waiting", value: 6, delta: "avg 24 min queue", tone: "warning" as const, icon: "Timer" },
  { label: "Pending Approval", value: 3, delta: "1 breaching SLA", tone: "warning" as const, icon: "ShieldQuestion" },
  { label: "Rejected Trucks", value: 2, delta: "4.2% of arrivals", tone: "danger" as const, icon: "Ban" },
  { label: "Inside Vehicles", value: 11, delta: "8 at dock, 3 in yard", tone: "success" as const, icon: "Warehouse" },
];

export const activities = [
  { time: "12:41", user: "S. Kulkarni", text: "Gate pass GP-004830 printed for WB-23-LM-1005", tone: "info" },
  { time: "12:28", user: "System", text: "Warehouse WH-01 accepted truck TN-38-BQ-5567 at DOCK-01", tone: "success" },
  { time: "12:05", user: "M. Deshpande", text: "Approved GE-2026-004829 · Maruti Suzuki Spares Div.", tone: "success" },
  { time: "11:32", user: "A. Fernandes", text: "Placed AP-28-XZ-8890 on hold — hazard label missing", tone: "warning" },
  { time: "10:58", user: "System", text: "OCR captured number plate UP-16-FT-2204 (confidence 97.4%)", tone: "info" },
  { time: "09:52", user: "A. Fernandes", text: "Rejected RJ-14-CV-3390 — expired licence, driver blacklisted", tone: "danger" },
  { time: "09:10", user: "R. Nair", text: "Appointment APT-77120 verified for Havells Electricals", tone: "info" },
];

export const notifications = [
  { id: "N-9001", type: "Truck Arrived", title: "Truck MH-12-KL-4471 arrived at Gate 01", body: "Tata Steel Processing Ltd. · PO-4500219847", time: "2 min ago", read: false, tone: "info" },
  { id: "N-9002", type: "Gate Entry Approved", title: "GE-2026-004824 approved", body: "Havells Electricals · Dock DOCK-07 assigned", time: "18 min ago", read: false, tone: "success" },
  { id: "N-9003", type: "Truck On Hold", title: "AP-28-XZ-8890 placed on hold", body: "Hazard label missing on consignment", time: "34 min ago", read: false, tone: "warning" },
  { id: "N-9004", type: "Truck Rejected", title: "RJ-14-CV-3390 rejected at Gate 02", body: "Expired driving licence · driver blacklisted", time: "1 hr ago", read: true, tone: "danger" },
  { id: "N-9005", type: "Warehouse Accepted", title: "WH-01 accepted TN-38-BQ-5567", body: "Store keeper: P. Bhosale · DOCK-01", time: "1 hr ago", read: true, tone: "success" },
  { id: "N-9006", type: "Receiving Started", title: "GRN drafted for GJ-01-DT-9082", body: "Reliance Polymers · 640 bags expected", time: "2 hr ago", read: true, tone: "info" },
  { id: "N-9007", type: "Gate Entry Created", title: "GE-2026-004830 created", body: "ITC Paperboards · Gate 03", time: "3 hr ago", read: true, tone: "info" },
];

export const appointments = [
  { id: "APT-77118", vendor: "Tata Steel Processing Ltd.", truck: "MH-12-KL-4471", slot: "06:00 – 06:45", actual: "06:12", delay: 12, dock: "DOCK-04", status: "Verified" },
  { id: "APT-77119", vendor: "Reliance Polymers Pvt Ltd", truck: "GJ-01-DT-9082", slot: "07:00 – 07:45", actual: "07:04", delay: 4, dock: "DOCK-02", status: "Verified" },
  { id: "APT-77120", vendor: "Havells Electricals", truck: "DL-01-GB-7745", slot: "09:15 – 10:00", actual: "09:02", delay: 0, dock: "DOCK-07", status: "Early Arrival" },
  { id: "APT-77121", vendor: "Bosch Automotive Spares", truck: "KA-05-AC-1123", slot: "08:00 – 08:30", actual: "08:31", delay: 31, dock: "Unassigned", status: "Slot Missed" },
  { id: "APT-77122", vendor: "Amara Raja Batteries", truck: "AP-28-XZ-8890", slot: "11:00 – 11:30", actual: "11:26", delay: 26, dock: "Unassigned", status: "Delayed" },
  { id: "APT-77123", vendor: "Dabur Consumer Care", truck: "UP-16-FT-2204", slot: "11:00 – 11:45", actual: "10:55", delay: 0, dock: "DOCK-09", status: "Verified" },
  { id: "APT-77124", vendor: "Godrej Interio", truck: "MH-04-EF-2287", slot: "14:00 – 14:45", actual: "—", delay: 0, dock: "DOCK-06", status: "Scheduled" },
  { id: "APT-77125", vendor: "Asian Paints Depot", truck: "GJ-05-HH-9911", slot: "15:30 – 16:15", actual: "—", delay: 0, dock: "DOCK-03", status: "Scheduled" },
];

export const documents = [
  { name: "Purchase Order", file: "PO-4500219847.pdf", size: "312 KB", ocr: "Verified", required: true },
  { name: "Tax Invoice", file: "INV-TSPL-88213.pdf", size: "204 KB", ocr: "Verified", required: true },
  { name: "Packing List", file: "PL-TSPL-88213.pdf", size: "118 KB", ocr: "Verified", required: true },
  { name: "Delivery Challan", file: "DC-99120.pdf", size: "96 KB", ocr: "Processing", required: true },
  { name: "E-Way Bill", file: "EWB-771029384410.pdf", size: "88 KB", ocr: "Verified", required: true },
  { name: "Vehicle RC", file: "RC-MH12KL4471.jpg", size: "1.2 MB", ocr: "Verified", required: true },
  { name: "Insurance Certificate", file: "INS-MH12KL4471.pdf", size: "410 KB", ocr: "Expiring in 22 days", required: true },
  { name: "Driving Licence", file: "DL-MH1220190004471.jpg", size: "980 KB", ocr: "Verified", required: true },
];

export const safetyItems = [
  "Driver wearing safety helmet",
  "Reflective jacket worn",
  "Safety shoes worn",
  "No oil / fuel leakage from vehicle",
  "Fire extinguisher available & charged",
  "Wheel chock available",
  "Consignment seal intact",
  "Hazard label displayed (if applicable)",
];

export const auditTrail = [
  { time: "2026-08-01 06:12:44", user: "S. Kulkarni (Security Officer)", action: "Gate entry created", ip: "10.24.8.51", device: "Gate Kiosk 01 / Chrome 138", remarks: "Truck arrived at inbound gate" },
  { time: "2026-08-01 06:14:02", user: "S. Kulkarni (Security Officer)", action: "Vehicle verified — OCR plate match 98.2%", ip: "10.24.8.51", device: "Gate Kiosk 01 / Chrome 138", remarks: "Trailer TRL-8891 attached" },
  { time: "2026-08-01 06:16:38", user: "S. Kulkarni (Security Officer)", action: "Driver verified — licence valid till 2029-04-18", ip: "10.24.8.51", device: "Handheld Zebra TC52", remarks: "Blacklist check passed" },
  { time: "2026-08-01 06:18:10", user: "System (SAP EWM Interface)", action: "PO-4500219847 fetched & validated", ip: "10.24.2.9", device: "Integration Service", remarks: "Open quantity 24 MT confirmed" },
  { time: "2026-08-01 06:21:55", user: "S. Kulkarni (Security Officer)", action: "Safety checklist submitted — 8/8 compliant", ip: "10.24.8.51", device: "Gate Kiosk 01 / Chrome 138", remarks: "No exceptions raised" },
  { time: "2026-08-01 06:26:31", user: "M. Deshpande (Security Supervisor)", action: "Gate entry approved", ip: "10.24.9.14", device: "Windows 11 / Edge 138", remarks: "Dock DOCK-04 allocated" },
  { time: "2026-08-01 06:27:03", user: "System", action: "Gate pass GP-004821 generated with QR", ip: "10.24.2.9", device: "Print Service", remarks: "Printed at Gate 01 printer" },
  { time: "2026-08-01 06:34:19", user: "P. Bhosale (Store Keeper)", action: "Warehouse accepted truck", ip: "10.24.11.77", device: "Handheld Zebra TC52", remarks: "Unloading crew assigned" },
];

export const reportRows = [
  { vendor: "Tata Steel Processing Ltd.", trips: 42, onTime: "92%", avgWait: "18 min", rejected: 1, tonnage: "1,412 MT" },
  { vendor: "Reliance Polymers Pvt Ltd", trips: 38, onTime: "88%", avgWait: "21 min", rejected: 0, tonnage: "788 MT" },
  { vendor: "Maruti Suzuki Spares Div.", trips: 31, onTime: "95%", avgWait: "12 min", rejected: 0, tonnage: "612 MT" },
  { vendor: "Havells Electricals", trips: 27, onTime: "81%", avgWait: "29 min", rejected: 2, tonnage: "244 MT" },
  { vendor: "Amara Raja Batteries", trips: 22, onTime: "74%", avgWait: "34 min", rejected: 3, tonnage: "318 MT" },
  { vendor: "ITC Paperboards", trips: 19, onTime: "90%", avgWait: "16 min", rejected: 0, tonnage: "402 MT" },
];

export const hourlyTraffic = [
  { hour: "06:00", entries: 4, exits: 1 },
  { hour: "08:00", entries: 9, exits: 5 },
  { hour: "10:00", entries: 12, exits: 8 },
  { hour: "12:00", entries: 8, exits: 10 },
  { hour: "14:00", entries: 6, exits: 7 },
  { hour: "16:00", entries: 5, exits: 6 },
  { hour: "18:00", entries: 3, exits: 2 },
];

export const waitingTrend = [
  { day: "Mon", minutes: 26 },
  { day: "Tue", minutes: 22 },
  { day: "Wed", minutes: 31 },
  { day: "Thu", minutes: 19 },
  { day: "Fri", minutes: 24 },
  { day: "Sat", minutes: 17 },
];

export const vehicleHistory = [
  { date: "2026-07-24", entry: "GE-2026-004612", po: "PO-4500218991", material: "CRCA Coil 1.0mm", wait: "16 min", status: "Completed" },
  { date: "2026-07-11", entry: "GE-2026-004388", po: "PO-4500218440", material: "HR Coil 3.0mm", wait: "24 min", status: "Completed" },
  { date: "2026-06-29", entry: "GE-2026-004102", po: "PO-4500217902", material: "CRCA Coil 1.2mm", wait: "12 min", status: "Completed" },
  { date: "2026-06-14", entry: "GE-2026-003844", po: "—", material: "—", wait: "48 min", status: "Rejected" },
];

export const driverVisits = [
  { date: "2026-08-01", gate: "Gate 01", truck: "MH-12-KL-4471", entry: "GE-2026-004821", status: "Warehouse Accepted" },
  { date: "2026-07-24", gate: "Gate 01", truck: "MH-12-KL-4471", entry: "GE-2026-004612", status: "Completed" },
  { date: "2026-07-11", gate: "Gate 02", truck: "MH-12-KL-4471", entry: "GE-2026-004388", status: "Completed" },
  { date: "2026-06-29", gate: "Gate 01", truck: "MH-14-QR-2210", entry: "GE-2026-004102", status: "Completed" },
];

export const holdReasons = [
  "Missing purchase order reference",
  "Expired driving licence",
  "No appointment / slot missed",
  "Vehicle damage observed",
  "Wrong vendor at gate",
  "Safety checklist exception",
  "Document mismatch (E-Way Bill)",
];

export const roles = [
  "Security Officer",
  "Security Supervisor",
  "Warehouse Manager",
  "Store Keeper",
  "Procurement Manager",
  "Asset Manager",
  "Administrator",
];

export const queueColumns: { key: string; title: string; tone: string; ids: string[] }[] = [
  { key: "waiting", title: "Waiting", tone: "warning", ids: ["GE-2026-004827", "GE-2026-004830"] },
  { key: "approved", title: "Approved", tone: "info", ids: ["GE-2026-004824"] },
  { key: "dock", title: "Dock Assigned", tone: "teal", ids: ["GE-2026-004826"] },
  { key: "receiving", title: "Receiving", tone: "success", ids: ["GE-2026-004822", "GE-2026-004821"] },
  { key: "completed", title: "Completed", tone: "neutral", ids: ["GE-2026-004829"] },
];

export function getEntry(id: string) {
  return gateEntries.find((e) => e.id === id);
}
