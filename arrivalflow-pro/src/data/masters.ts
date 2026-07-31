// Realistic sample master data for the MDM module (frontend only).

export type Status = "Active" | "Inactive" | "Draft";

export type Supplier = {
  id: string;
  code: string;
  name: string;
  type: string;
  contactPerson: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  gstNumber: string;
  taxNumber: string;
  certification: "Certified" | "Pending" | "Expired";
  certificationExpiry: string;
  commodities: string[];
  paymentTerms: string;
  currency: string;
  bank: string;
  status: Status;
  notes: string;
  createdAt: string;
};

export type Customer = {
  id: string;
  code: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  billingAddress: string;
  shippingAddress: string;
  deliveryLocations: number;
  shipmentPreference: string;
  paymentTerms: string;
  currency: string;
  taxNumber: string;
  country: string;
  priority: "High" | "Medium" | "Low";
  category: string;
  status: Status;
  notes: string;
  createdAt: string;
};

export type Item = {
  id: string;
  code: string;
  name: string;
  description: string;
  category: "Raw Material" | "Component" | "Sub Assembly" | "Finished Goods";
  subCategory: string;
  unit: string;
  weight: string;
  dimensions: string;
  manufacturer: string;
  brand: string;
  barcode: string;
  sku: string;
  cost: number;
  price: number;
  minStock: number;
  maxStock: number;
  reorderLevel: number;
  shelfLife: string;
  hazard: string;
  storage: string;
  hsnCode: string;
  status: Status;
  createdAt: string;
};

export type Warehouse = {
  id: string;
  code: string;
  name: string;
  location: string;
  manager: string;
  capacity: number;
  utilization: number;
  status: Status;
  createdAt: string;
};

export type Employee = {
  id: string;
  code: string;
  name: string;
  department: string;
  designation: string;
  role: string;
  email: string;
  phone: string;
  joiningDate: string;
  manager: string;
  shift: "Shift A (06:00-14:00)" | "Shift B (14:00-22:00)" | "Shift C (22:00-06:00)";
  warehouse: string;
  status: Status;
  createdAt: string;
};

export type Vehicle = {
  id: string;
  code: string;
  vehicleNumber: string;
  type: string;
  capacity: string;
  weight: string;
  volume: string;
  driver: string;
  insuranceExpiry: string;
  fitnessExpiry: string;
  gps: "Enabled" | "Disabled";
  carrier: string;
  status: Status;
  createdAt: string;
};

export type Carrier = {
  id: string;
  code: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  refrigerated: boolean;
  hazardTransport: boolean;
  licenseNumber: string;
  status: Status;
  createdAt: string;
};

export type Country = {
  id: string;
  code: string;
  name: string;
  flag: string;
  currency: string;
  symbol: string;
  exchangeRate: number;
  taxRule: string;
  importDuty: string;
  timeZone: string;
  language: string;
  status: Status;
  createdAt: string;
};

export const suppliers: Supplier[] = [
  ["SUP-1001","Nordwerk Präzision GmbH","Manufacturer","Anke Brandt","+49 211 884 2210","a.brandt@nordwerk.de","nordwerk.de","Industriestrasse 44","Düsseldorf","NRW","Germany","40468","—","DE811907980","Certified","2027-03-18","Precision Castings;Bearings","Net 45","EUR","Commerzbank ••4471","Active"],
  ["SUP-1002","Sanko Polymer Industries","Manufacturer","Hiroshi Tanaka","+81 6 6210 3388","tanaka@sankopolymer.jp","sankopolymer.jp","2-14 Nishi-Honmachi","Osaka","Osaka","Japan","550-0005","—","JP4120001059874","Certified","2026-11-02","Engineering Plastics;Seals","Net 30","JPY","MUFG ••8820","Active"],
  ["SUP-1003","Vertex Steel & Alloys Pvt Ltd","Distributor","Rakesh Menon","+91 22 4988 1120","rakesh@vertexsteel.in","vertexsteel.in","Plot 21, MIDC Taloja","Navi Mumbai","Maharashtra","India","410208","27AABCV1234K1ZQ","AABCV1234K","Pending","2026-09-30","Alloy Steel;Fasteners","Net 60","INR","HDFC ••1092","Active"],
  ["SUP-1004","Atlas Bearing Works","Manufacturer","Grace Whitfield","+1 216 555 0142","g.whitfield@atlasbw.com","atlasbw.com","1400 Foundry Rd","Cleveland","Ohio","United States","44115","—","US-38-1927734","Certified","2028-01-12","Bearings;Shafts","Net 30","USD","PNC ••2245","Active"],
  ["SUP-1005","Lumière Électronique SAS","Manufacturer","Camille Robert","+33 4 72 11 90 44","c.robert@lumiere-e.fr","lumiere-e.fr","18 Rue de la Villette","Lyon","Auvergne","France","69003","—","FR40123456824","Expired","2026-04-01","PCB Assemblies;Sensors","Net 45","EUR","BNP ••7731","Inactive"],
  ["SUP-1006","Han River Logistics Supply","Service Provider","Ji-Woo Park","+82 2 6203 7788","jw.park@hanriver.kr","hanriver.kr","31 Teheran-ro","Seoul","Seoul","South Korea","06142","—","KR2148812345","Certified","2027-07-22","Packaging;Pallets","Net 15","KRW","KB ••3390","Active"],
  ["SUP-1007","Cobalt Chemicals Ltd","Manufacturer","Owen Fairbanks","+44 161 496 2200","owen.f@cobaltchem.co.uk","cobaltchem.co.uk","Trafford Park Way","Manchester","England","United Kingdom","M17 1AB","—","GB884472901","Certified","2027-02-05","Industrial Solvents;Coatings","Net 30","GBP","Barclays ••5567","Active"],
  ["SUP-1008","Pampas Rubber Co.","Manufacturer","Lucía Ferreyra","+54 11 4302 8890","lucia@pampasrubber.ar","pampasrubber.ar","Av. Amancio Alcorta 2300","Buenos Aires","CABA","Argentina","C1283","—","AR30712345678","Pending","2026-12-14","Rubber Gaskets;Hoses","Net 60","USD","Galicia ••9911","Draft"],
  ["SUP-1009","Maple Ridge Tooling Inc.","Manufacturer","Daniel Rousseau","+1 514 555 0188","d.rousseau@mapleridge.ca","mapleridge.ca","880 Boul. Industriel","Montréal","Quebec","Canada","H1J 2K5","—","CA-8829-4471","Certified","2027-10-09","Cutting Tools;Jigs","Net 45","CAD","RBC ••4402","Active"],
  ["SUP-1010","Sahara Packaging FZE","Distributor","Yusuf Al-Amin","+971 4 883 2210","yusuf@saharapack.ae","saharapack.ae","Jebel Ali Free Zone S3","Dubai","Dubai","UAE","17000","—","AE100234567800003","Certified","2028-05-30","Corrugated Boxes;Stretch Film","Net 30","AED","Emirates NBD ••6612","Active"],
  ["SUP-1011","Baltic Wire Systems","Manufacturer","Marta Kowalska","+48 58 771 4400","m.kowalska@balticwire.pl","balticwire.pl","ul. Portowa 12","Gdańsk","Pomerania","Poland","80-601","—","PL5842748899","Certified","2027-01-27","Wire Harness;Cables","Net 45","EUR","PKO ••2213","Active"],
  ["SUP-1012","Cape Metalcraft (Pty) Ltd","Manufacturer","Thabo Nkosi","+27 21 447 9902","thabo@capemetal.co.za","capemetal.co.za","5 Voortrekker Rd","Cape Town","Western Cape","South Africa","7460","—","ZA4120199887","Pending","2026-08-19","Sheet Metal;Brackets","Net 30","ZAR","Standard ••7788","Inactive"],
].map(
  (r, i) =>
    ({
      id: `sup-${i + 1}`,
      code: r[0], name: r[1], type: r[2], contactPerson: r[3], phone: r[4], email: r[5],
      website: r[6], address: r[7], city: r[8], state: r[9], country: r[10], postalCode: r[11],
      gstNumber: r[12], taxNumber: r[13], certification: r[14] as Supplier["certification"],
      certificationExpiry: r[15], commodities: (r[16] as string).split(";"), paymentTerms: r[17],
      currency: r[18], bank: r[19], status: r[20] as Status,
      notes: "Strategic supplier reviewed in the last quarterly vendor council.",
      createdAt: `2025-${String((i % 12) + 1).padStart(2, "0")}-${String((i % 27) + 1).padStart(2, "0")}`,
    }) as Supplier,
);

export const customers: Customer[] = [
  ["CUS-2001","Helios Automotive Group","Marta Ríos","+34 93 220 4411","m.rios@heliosauto.es","Carrer de Tarragona 84, Barcelona","Pol. Ind. Zona Franca, Barcelona","Sea Freight","Net 45","EUR","ESB12345678","Spain","High","OEM","Active"],
  ["CUS-2002","Northline Appliances Inc.","Kyle Brennan","+1 312 555 0107","kbrennan@northline.com","220 W Monroe St, Chicago","4400 Distribution Dr, Joliet","LTL Road","Net 30","USD","US-27-4488192","United States","High","Retail Chain","Active"],
  ["CUS-2003","Kanto Mobility Systems","Aiko Nakamura","+81 3 5422 7788","aiko@kantomobility.jp","1-8 Shibaura, Tokyo","Kawasaki Logistics Park","Air Freight","Net 30","JPY","JP7010001098765","Japan","Medium","OEM","Active"],
  ["CUS-2004","Bharat Engineering Works","Sunil Deshpande","+91 20 6677 8890","sunil@bharatew.in","Sr. No 45, Hinjawadi, Pune","Chakan MIDC Phase II","Road Container","Net 60","INR","27AAECB9988L1Z2","India","High","Tier-1 Supplier","Active"],
  ["CUS-2005","Meridian Healthcare Supplies","Elena Kovač","+386 1 428 9911","elena@meridianhc.si","Dunajska cesta 160, Ljubljana","Logistični Center Brnik","Temperature Controlled","Net 30","EUR","SI44556677","Slovenia","Medium","Distributor","Active"],
  ["CUS-2006","Cascade Outdoor Retail","Hannah Whitmore","+1 503 555 0139","hannah@cascadeoutdoor.com","900 SW 5th Ave, Portland","Troutdale DC 3","Parcel","Net 15","USD","US-91-2277341","United States","Low","Retail Chain","Inactive"],
  ["CUS-2007","Emirates Facility Solutions","Nadia Haddad","+971 2 665 3300","nadia@emfacility.ae","Corniche Rd, Abu Dhabi","Mussafah Industrial M-14","Road Container","Net 45","AED","AE100999888700003","UAE","Medium","Institutional","Active"],
  ["CUS-2008","Southern Cross Mining Ltd","Peter Callaghan","+61 8 9322 4411","peter@scmining.com.au","110 St Georges Tce, Perth","Kwinana Bulk Terminal","Bulk Sea Freight","Net 60","AUD","AU 43 118 992 004","Australia","High","Industrial","Active"],
  ["CUS-2009","Nordic Marine Services","Ingrid Halvorsen","+47 55 21 88 40","ingrid@nordicmarine.no","Bryggen 12, Bergen","Ågotnes Supply Base","Sea Freight","Net 30","NOK","NO998877665MVA","Norway","Medium","Industrial","Draft"],
  ["CUS-2010","Andes Agro Cooperativa","Rodrigo Salas","+56 2 2887 4400","rsalas@andesagro.cl","Av. Apoquindo 4500, Santiago","Rancagua Acopio Norte","Temperature Controlled","Net 45","USD","CL76.221.884-9","Chile","Low","Cooperative","Active"],
].map(
  (r, i) =>
    ({
      id: `cus-${i + 1}`,
      code: r[0], name: r[1], contactPerson: r[2], phone: r[3], email: r[4],
      billingAddress: r[5], shippingAddress: r[6], deliveryLocations: (i % 5) + 1,
      shipmentPreference: r[7], paymentTerms: r[8], currency: r[9], taxNumber: r[10],
      country: r[11], priority: r[12] as Customer["priority"], category: r[13],
      status: r[14] as Status,
      notes: "Contract renewal handled by the regional key-account team.",
      createdAt: `2025-${String((i % 12) + 1).padStart(2, "0")}-${String((i % 26) + 2).padStart(2, "0")}`,
    }) as Customer,
);

export const items: Item[] = [
  ["ITM-3001","Cold Rolled Steel Coil 1.2mm","CRCA coil, 1250mm width, commercial quality","Raw Material","Steel","KG","4850 kg","1250 × 1200 × 1200 mm","Vertex Steel","Vertex","8901234500017","SKU-CRC-1200","62.40","—","20000","90000","35000","—","None","Dry, covered bay","7209"],
  ["ITM-3002","Deep Groove Ball Bearing 6205","Sealed radial bearing, C3 clearance","Component","Bearings","EA","0.13 kg","52 × 52 × 15 mm","Atlas Bearing Works","Atlas","8901234500024","SKU-BRG-6205","3.85","7.20","1200","9000","2500","—","None","Ambient, oil-free","8482"],
  ["ITM-3003","Wire Harness Assembly WH-220","Main cabin harness, 22 circuits","Sub Assembly","Electrical","EA","1.90 kg","900 × 400 × 120 mm","Baltic Wire Systems","BalticWire","8901234500031","SKU-WH-220","41.10","78.00","150","1400","400","—","None","ESD protected","8544"],
  ["ITM-3004","Industrial Gearbox GX-40 Finished","Assembled and tested helical gearbox","Finished Goods","Drives","EA","62 kg","640 × 420 × 380 mm","Internal","Meridia","8901234500048","SKU-GX-40","880.00","1490.00","20","320","60","—","None","Palletized, dry","8483"],
  ["ITM-3005","Epoxy Primer EP-500 (20L)","Two-component anti-corrosive primer","Raw Material","Chemicals","L","22 kg","300 × 300 × 400 mm","Cobalt Chemicals","Cobalt","8901234500055","SKU-EP-500","118.00","—","80","900","220","24 months","Flammable — Class 3","Ventilated, ≤ 30°C","3208"],
  ["ITM-3006","Nitrile Gasket Ring 120mm","Oil-resistant NBR gasket","Component","Sealing","EA","0.04 kg","120 × 120 × 4 mm","Pampas Rubber","Pampas","8901234500062","SKU-GSK-120","0.92","2.10","5000","40000","12000","36 months","None","Ambient, no UV","4016"],
  ["ITM-3007","PCB Control Board CB-9","4-layer motor control board","Sub Assembly","Electronics","EA","0.22 kg","180 × 120 × 18 mm","Lumière Électronique","Lumière","8901234500079","SKU-CB-9","96.50","178.00","100","1200","300","—","None","ESD, 40-60% RH","8534"],
  ["ITM-3008","Aluminium Extrusion 40×40 T-Slot","6063-T5 anodised profile, 6m bar","Raw Material","Aluminium","M","1.6 kg/m","6000 × 40 × 40 mm","Cape Metalcraft","CapeMetal","8901234500086","SKU-EXT-4040","8.40","—","300","5000","1000","—","None","Racked horizontally","7604"],
  ["ITM-3009","Hydraulic Power Pack HP-12 Finished","12L reservoir, 3kW motor, tested","Finished Goods","Hydraulics","EA","94 kg","800 × 500 × 620 mm","Internal","Meridia","8901234500093","SKU-HP-12","1240.00","2050.00","10","150","30","—","None","Dry, drip tray","8412"],
  ["ITM-3010","Stainless Fastener Kit M8","A2-70 bolts, nuts, washers (100 sets)","Component","Fasteners","BOX","3.2 kg","300 × 200 × 120 mm","Vertex Steel","Vertex","8901234500109","SKU-FST-M8","24.60","44.00","400","6000","1200","—","None","Ambient","7318"],
  ["ITM-3011","Cryo Transport Pouch CT-2","Insulated pouch for cold chain shipping","Finished Goods","Packaging","EA","0.6 kg","400 × 300 × 200 mm","Sahara Packaging","Sahara","8901234500116","SKU-CT-2","6.80","14.50","500","8000","1500","60 months","None","≤ 25°C, dry","3923"],
  ["ITM-3012","Engineering Plastic Granule PA66","Glass-filled polyamide, natural","Raw Material","Polymers","KG","25 kg/bag","600 × 400 × 200 mm","Sanko Polymer","Sanko","8901234500123","SKU-PA66-GF","4.35","—","2000","30000","7000","18 months","None","Dry, ≤ 35°C","3908"],
].map(
  (r, i) =>
    ({
      id: `itm-${i + 1}`,
      code: r[0], name: r[1], description: r[2], category: r[3] as Item["category"],
      subCategory: r[4], unit: r[5], weight: r[6], dimensions: r[7], manufacturer: r[8],
      brand: r[9], barcode: r[10], sku: r[11],
      cost: Number((r[12] as string).replace("—", "0")),
      price: Number((r[13] as string).replace("—", "0")),
      minStock: Number(r[14]), maxStock: Number(r[15]), reorderLevel: Number(r[16]),
      shelfLife: r[17], hazard: r[18], storage: r[19], hsnCode: r[20],
      status: i === 5 ? "Inactive" : i === 10 ? "Draft" : "Active",
      createdAt: `2025-${String((i % 12) + 1).padStart(2, "0")}-${String((i % 25) + 3).padStart(2, "0")}`,
    }) as Item,
);

export const warehouses: Warehouse[] = [
  ["WH-01","Central Distribution Centre","Rotterdam, Netherlands","Bram de Vries","48000","82","Active"],
  ["WH-02","Pune Plant Store","Pune, India","Sunita Kulkarni","26000","64","Active"],
  ["WH-03","Cleveland Spare Parts Hub","Cleveland, USA","Marcus Elliot","18500","91","Active"],
  ["WH-04","Osaka Component Warehouse","Osaka, Japan","Kenji Sato","21000","57","Active"],
  ["WH-05","Jebel Ali Transit Store","Dubai, UAE","Farah Siddiqui","32000","38","Active"],
  ["WH-06","Gdańsk Cold Storage","Gdańsk, Poland","Piotr Zieliński","9500","73","Inactive"],
].map(
  (r, i) =>
    ({
      id: `wh-${i + 1}`,
      code: r[0], name: r[1], location: r[2], manager: r[3],
      capacity: Number(r[4]), utilization: Number(r[5]), status: r[6] as Status,
      createdAt: `2024-0${(i % 9) + 1}-1${i % 9}`,
    }) as Warehouse,
);

export type BinNode = { code: string; capacity: number; occupancy: number; barcode: string };
export type ShelfNode = { code: string; bins: BinNode[] };
export type RackNode = { code: string; shelves: ShelfNode[] };
export type WarehouseTree = { code: string; name: string; racks: RackNode[] };

export const warehouseTree: WarehouseTree[] = warehouses.slice(0, 4).map((w, wi) => ({
  code: w.code,
  name: w.name,
  racks: Array.from({ length: 3 }, (_, ri) => ({
    code: `${w.code}-R${String(ri + 1).padStart(2, "0")}`,
    shelves: Array.from({ length: 2 }, (_, si) => ({
      code: `${w.code}-R${String(ri + 1).padStart(2, "0")}-S${si + 1}`,
      bins: Array.from({ length: 4 }, (_, bi) => ({
        code: `${w.code}-R${String(ri + 1).padStart(2, "0")}-S${si + 1}-B${bi + 1}`,
        capacity: 120,
        occupancy: ((wi * 7 + ri * 13 + si * 23 + bi * 31) % 100) + 1,
        barcode: `89${wi}${ri}${si}${bi}4471${bi}`,
      })),
    })),
  })),
}));

export const employees: Employee[] = [
  ["EMP-4001","Bram de Vries","Warehouse Operations","Site Manager","Administrator","bram.devries@meridia.com","+31 10 883 2200","2018-04-16","Regional Director","Shift A (06:00-14:00)","WH-01 Rotterdam"],
  ["EMP-4002","Sunita Kulkarni","Warehouse Operations","Store Manager","Manager","sunita.k@meridia.com","+91 20 6677 1120","2019-08-01","Bram de Vries","Shift A (06:00-14:00)","WH-02 Pune"],
  ["EMP-4003","Marcus Elliot","Logistics","Hub Supervisor","Manager","marcus.e@meridia.com","+1 216 555 0190","2020-02-10","Bram de Vries","Shift B (14:00-22:00)","WH-03 Cleveland"],
  ["EMP-4004","Kenji Sato","Inventory","Inventory Controller","Editor","kenji.sato@meridia.com","+81 6 6210 9911","2021-06-22","Sunita Kulkarni","Shift A (06:00-14:00)","WH-04 Osaka"],
  ["EMP-4005","Farah Siddiqui","Procurement","Category Buyer","Editor","farah.s@meridia.com","+971 4 883 4412","2022-01-09","Regional Director","Shift A (06:00-14:00)","WH-05 Jebel Ali"],
  ["EMP-4006","Piotr Zieliński","Quality","QA Inspector","Viewer","piotr.z@meridia.com","+48 58 771 8890","2022-11-14","Marcus Elliot","Shift C (22:00-06:00)","WH-06 Gdańsk"],
  ["EMP-4007","Amara Okafor","Master Data","Data Steward","Administrator","amara.o@meridia.com","+44 161 496 7712","2023-03-27","Regional Director","Shift B (14:00-22:00)","Head Office"],
  ["EMP-4008","Diego Fernández","Manufacturing","Line Supervisor","Manager","diego.f@meridia.com","+34 93 220 5510","2021-09-06","Sunita Kulkarni","Shift B (14:00-22:00)","WH-02 Pune"],
  ["EMP-4009","Chloé Martin","Finance","AP Analyst","Viewer","chloe.m@meridia.com","+33 4 72 11 4402","2024-05-20","Regional Director","Shift A (06:00-14:00)","Head Office"],
  ["EMP-4010","Ravi Prasad","Logistics","Fleet Coordinator","Editor","ravi.p@meridia.com","+91 22 4988 3312","2023-07-11","Marcus Elliot","Shift C (22:00-06:00)","WH-02 Pune"],
].map(
  (r, i) =>
    ({
      id: `emp-${i + 1}`,
      code: r[0], name: r[1], department: r[2], designation: r[3], role: r[4],
      email: r[5], phone: r[6], joiningDate: r[7], manager: r[8],
      shift: r[9] as Employee["shift"], warehouse: r[10],
      status: i === 5 ? "Inactive" : "Active",
      createdAt: r[7],
    }) as Employee,
);

export const vehicles: Vehicle[] = [
  ["VEH-5001","NL-88-XKD","40ft Container Truck","24 t","24000 kg","76 m³","Jeroen Bakker","2027-01-31","2026-10-15","Enabled","Han River Logistics"],
  ["VEH-5002","MH-12-QT-4471","Refrigerated Van","6 t","6000 kg","22 m³","Anil Kadam","2026-12-04","2027-03-20","Enabled","Vertex Transport"],
  ["VEH-5003","OH-7742-TRK","Flatbed Trailer","18 t","18000 kg","—","Wesley Turner","2027-06-18","2026-11-28","Enabled","Maple Ridge Freight"],
  ["VEH-5004","JP-330-8821","Box Truck","4 t","4000 kg","18 m³","Takumi Mori","2026-09-09","2026-09-30","Disabled","Kanto Haulage"],
  ["VEH-5005","DXB-4-11208","Hazmat Tanker","28 t","28000 kg","30 m³","Omar Rashid","2027-02-22","2027-01-05","Enabled","Sahara Transit"],
  ["VEH-5006","PL-GD-9921","Curtain Side Trailer","20 t","20000 kg","88 m³","Krzysztof Nowak","2026-08-14","2026-08-30","Enabled","Baltic Freight"],
].map(
  (r, i) =>
    ({
      id: `veh-${i + 1}`,
      code: r[0], vehicleNumber: r[1], type: r[2], capacity: r[3], weight: r[4], volume: r[5],
      driver: r[6], insuranceExpiry: r[7], fitnessExpiry: r[8], gps: r[9] as Vehicle["gps"],
      carrier: r[10], status: i === 3 ? "Inactive" : "Active",
      createdAt: `2024-1${i % 3}-0${(i % 8) + 1}`,
    }) as Vehicle,
);

export const carriers: Carrier[] = [
  ["CAR-6001","Han River Logistics","Ji-Woo Park","+82 2 6203 7788","ops@hanriver.kr","false","false","KR-TRN-88210"],
  ["CAR-6002","Vertex Transport","Rakesh Menon","+91 22 4988 1120","fleet@vertexsteel.in","true","false","IN-MH-4471209"],
  ["CAR-6003","Maple Ridge Freight","Daniel Rousseau","+1 514 555 0188","dispatch@mapleridge.ca","false","true","CA-QC-772134"],
  ["CAR-6004","Sahara Transit","Yusuf Al-Amin","+971 4 883 2210","transit@saharapack.ae","true","true","AE-DXB-990183"],
  ["CAR-6005","Baltic Freight","Marta Kowalska","+48 58 771 4400","freight@balticwire.pl","false","false","PL-PM-338291"],
].map(
  (r, i) =>
    ({
      id: `car-${i + 1}`,
      code: r[0], name: r[1], contactPerson: r[2], phone: r[3], email: r[4],
      refrigerated: r[5] === "true", hazardTransport: r[6] === "true", licenseNumber: r[7],
      status: "Active" as Status,
      createdAt: `2024-0${i + 2}-1${i}`,
    }) as Carrier,
);

export const countries: Country[] = [
  ["CN-DE","Germany","🇩🇪","EUR","€","1.00","VAT 19%","0% (EU)","CET (UTC+1)","German"],
  ["CN-IN","India","🇮🇳","INR","₹","90.12","GST 18%","7.5%","IST (UTC+5:30)","English / Hindi"],
  ["CN-US","United States","🇺🇸","USD","$","1.08","Sales Tax (state)","2.5%","EST (UTC-5)","English"],
  ["CN-JP","Japan","🇯🇵","JPY","¥","168.40","Consumption 10%","0-3%","JST (UTC+9)","Japanese"],
  ["CN-AE","UAE","🇦🇪","AED","د.إ","3.97","VAT 5%","5%","GST (UTC+4)","Arabic / English"],
  ["CN-GB","United Kingdom","🇬🇧","GBP","£","0.85","VAT 20%","2%","GMT (UTC+0)","English"],
  ["CN-PL","Poland","🇵🇱","EUR","€","1.00","VAT 23%","0% (EU)","CET (UTC+1)","Polish"],
  ["CN-ZA","South Africa","🇿🇦","ZAR","R","19.88","VAT 15%","10%","SAST (UTC+2)","English"],
  ["CN-AU","Australia","🇦🇺","AUD","A$","1.64","GST 10%","5%","AEST (UTC+10)","English"],
  ["CN-BR","Brazil","🇧🇷","BRL","R$","5.92","ICMS (state)","14%","BRT (UTC-3)","Portuguese"],
].map(
  (r, i) =>
    ({
      id: `cn-${i + 1}`,
      code: r[0], name: r[1], flag: r[2], currency: r[3], symbol: r[4],
      exchangeRate: Number(r[5]), taxRule: r[6], importDuty: r[7], timeZone: r[8], language: r[9],
      status: i === 9 ? "Inactive" : "Active",
      createdAt: `2023-0${(i % 9) + 1}-1${i % 9}`,
    }) as Country,
);

export const recentActivity = [
  { actor: "Amara Okafor", action: "created supplier", target: "Nordwerk Präzision GmbH", type: "Supplier", time: "8 minutes ago" },
  { actor: "Farah Siddiqui", action: "updated payment terms for", target: "Sahara Packaging FZE", type: "Supplier", time: "42 minutes ago" },
  { actor: "Kenji Sato", action: "activated item", target: "PCB Control Board CB-9", type: "Item", time: "2 hours ago" },
  { actor: "Bram de Vries", action: "added bin range to", target: "WH-01 Rack R03", type: "Warehouse", time: "5 hours ago" },
  { actor: "Ravi Prasad", action: "registered vehicle", target: "DXB-4-11208", type: "Vehicle", time: "Yesterday, 17:22" },
  { actor: "Chloé Martin", action: "revised exchange rate for", target: "BRL — Brazilian Real", type: "Country", time: "Yesterday, 09:05" },
  { actor: "Marcus Elliot", action: "deactivated customer", target: "Cascade Outdoor Retail", type: "Customer", time: "2 days ago" },
];

export const itemsByCategory = [
  { name: "Raw Material", value: 428 },
  { name: "Component", value: 962 },
  { name: "Sub Assembly", value: 311 },
  { name: "Finished Goods", value: 186 },
];

export const suppliersByCountry = [
  { name: "India", value: 74 },
  { name: "Germany", value: 58 },
  { name: "USA", value: 46 },
  { name: "Japan", value: 33 },
  { name: "Poland", value: 21 },
  { name: "UAE", value: 17 },
];

