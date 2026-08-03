export type SearchResult = {
  id: string; title: string; subtitle: string; status: string; type: string; url: string;
};

const API_URL = (import.meta.env["VITE_API_URL"] ?? "http://localhost:5000/api/v1").replace(/\/$/, "");

export async function searchGateRecords(query: string, signal?: AbortSignal): Promise<SearchResult[]> {
  const response = await fetch(`${API_URL}/search?q=${encodeURIComponent(query)}`, {
    headers: { Accept: "application/json" },
    ...(signal ? { signal } : {}),
  });
  if (!response.ok) throw new Error(`Search API failed with status ${response.status}`);
  const payload = (await response.json()) as { success: boolean; data?: SearchResult[]; message?: string };
  if (!payload.success) throw new Error(payload.message ?? "Search failed");
  return payload.data ?? [];
}
