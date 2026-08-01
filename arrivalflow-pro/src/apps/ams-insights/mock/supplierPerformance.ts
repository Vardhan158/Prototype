export interface SupplierPerformance {
  supplier: string;
  onTime: number;
  quality: number;
  rating: string;
}

export const supplierPerformance: SupplierPerformance[] = [
  { supplier: "Siemens", onTime: 96, quality: 98, rating: "A" },
  { supplier: "ABB", onTime: 94, quality: 97, rating: "A" },
  { supplier: "Schneider", onTime: 92, quality: 96, rating: "A-" },
  { supplier: "L&T", onTime: 90, quality: 94, rating: "B+" },
  { supplier: "CG Power", onTime: 88, quality: 93, rating: "B+" },
];
