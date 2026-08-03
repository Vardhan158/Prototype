export type VehiclePlateOcr = { registrationNumber: string; confidence?: number };
export type DrivingLicenceOcr = { licenceNumber: string; name?: string; phone?: string; dateOfBirth?: string; expiryDate?: string; address?: string; confidence?: number };
const API_URL = (import.meta.env["VITE_API_URL"] ?? "http://localhost:5000/api/v1").replace(/\/$/, "");

export async function extractWithGemini<T>(image: File | Blob, type: "vehicle_plate" | "driving_licence" | "document"): Promise<T> {
  const body = new FormData();
  body.append("image", image, image instanceof File ? image.name : `ocr-${Date.now()}.jpg`);
  body.append("type", type);
  const response = await fetch(`${API_URL}/ocr/extract`, { method: "POST", body });
  const payload = (await response.json()) as { success: boolean; data?: T; message?: string };
  if (!response.ok || !payload.data) throw new Error(payload.message ?? "Gemini OCR failed");
  return payload.data;
}

export function canvasToJpeg(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Could not encode captured image")), "image/jpeg", 0.9));
}
