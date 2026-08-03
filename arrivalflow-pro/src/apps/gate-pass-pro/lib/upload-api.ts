export type UploadedImage = { url: string; publicId: string; width: number; height: number; bytes: number };
const API_URL = (import.meta.env["VITE_API_URL"] ?? "http://localhost:5000/api/v1").replace(/\/$/, "");

export function uploadVehicleImage(file: File | Blob, onProgress: (percent: number) => void): Promise<UploadedImage> {
  return new Promise((resolve, reject) => {
    const body = new FormData();
    body.append("image", file, file instanceof File ? file.name : `vehicle-${Date.now()}.jpg`);
    const request = new XMLHttpRequest();
    request.open("POST", `${API_URL}/uploads/vehicle-image`);
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
    };
    request.onerror = () => reject(new Error("Image upload failed. Check the backend connection."));
    request.onload = () => {
      try {
        const payload = JSON.parse(request.responseText) as { success: boolean; data?: UploadedImage; message?: string };
        if (request.status < 200 || request.status >= 300 || !payload.data) return reject(new Error(payload.message ?? "Image upload failed"));
        onProgress(100); resolve(payload.data);
      } catch { reject(new Error("Invalid upload response")); }
    };
    request.send(body);
  });
}
