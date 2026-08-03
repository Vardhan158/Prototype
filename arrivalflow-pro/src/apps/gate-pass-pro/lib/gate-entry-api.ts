export type NewGateEntryInput = {
  truck?: string; vendor?: string; po?: string; driver?: string;
  gate?: string; priority?: string; remarks?: string; officer?: string;
  vehicleImageUrl?: string; vehicleImagePublicId?: string;
};
type CreatedGateEntry = { id: string; status: string; createdAt: string };
const API_URL = (import.meta.env["VITE_API_URL"] ?? "http://localhost:5000/api/v1").replace(/\/$/, "");

export async function createGateEntry(input: NewGateEntryInput): Promise<CreatedGateEntry> {
  const response = await fetch(`${API_URL}/gate-entries`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(input),
  });
  const payload = (await response.json()) as { success: boolean; data?: CreatedGateEntry; message?: string };
  if (!response.ok || !payload.data) throw new Error(payload.message ?? "Gate entry could not be created");
  return payload.data;
}
