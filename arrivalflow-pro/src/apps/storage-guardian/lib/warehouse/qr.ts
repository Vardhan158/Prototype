export function buildProductQrValue(item: {
  id: string;
  name: string;
  po: string;
  asn: string;
  qty: number;
  category: string;
  hazard?: string;
  temp?: string;
  size?: string;
  weightKg?: number;
  valueUsd?: number;
  supplier?: string;
  status?: string;
  code?: string;
  locationId?: string;
}) {
  const parts = [
    `ITEM:${item.id}`,
    `NAME:${item.name}`,
    `PO:${item.po}`,
    `ASN:${item.asn}`,
    `QTY:${item.qty}`,
    `CATEGORY:${item.category}`,
    `HAZARD:${item.hazard ?? "None"}`,
    `TEMP:${item.temp ?? "Ambient"}`,
    `SIZE:${item.size ?? "Medium"}`,
    `WEIGHT:${item.weightKg ?? 0}`,
    `VALUE:${item.valueUsd ?? 0}`,
    `SUPPLIER:${item.supplier ?? "Unknown"}`,
    `STATUS:${item.status ?? "In Pipeline"}`,
  ];

  if (item.code) parts.push(`CODE:${item.code}`);
  if (item.locationId) {
    const rack = item.locationId.split("-")[1] ?? item.locationId;
    parts.push(`LOCATION:${item.locationId}`, `RACK:${rack}`);
  }
  return parts.join(" | ");
}

export function buildLocationQrValue(locationCode: string) {
  return `LOCATION:${locationCode}`;
}
