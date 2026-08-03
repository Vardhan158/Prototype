export type DriverRecord = {
  id: string; name: string; phone: string; licence: string; expiry: string;
  transporter: string; blacklisted: boolean; visits: number;
};
export type DriverVerificationResult = { found: boolean; verified: boolean; reason: string; driver?: DriverRecord };
const API_URL = (import.meta.env["VITE_API_URL"] ?? "http://localhost:5000/api/v1").replace(/\/$/, "");

export async function verifyDriverLicence(licence: string): Promise<DriverVerificationResult> {
  const response = await fetch(`${API_URL}/drivers/verify?licence=${encodeURIComponent(licence)}`);
  const payload = (await response.json()) as { success: boolean; data?: DriverVerificationResult; message?: string };
  if (!response.ok || !payload.data) throw new Error(payload.message ?? "Driver verification failed");
  return payload.data;
}
