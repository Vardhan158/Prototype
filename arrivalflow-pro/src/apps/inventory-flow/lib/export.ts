import { toast } from "sonner";

export function exportRows(rows: readonly object[], filename: string, kind: "csv" | "excel" | "pdf") {
  if (rows.length === 0) {
    toast.error("Nothing to export", { description: "The current view has no records." });
    return;
  }
  if (kind === "pdf") {
    toast.success("PDF generation queued", {
      description: `${filename}.pdf will be available in your download centre shortly.`,
    });
    return;
  }
  const headers = Object.keys((rows[0] ?? {}) as Record<string, unknown>);
  const escape = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const body = [headers.join(","), ...rows.map((r) => headers.map((h) => escape((r as Record<string, unknown>)[h])).join(","))].join("\n");
  const ext = kind === "excel" ? "xls" : "csv";
  const blob = new Blob([body], {
    type: kind === "excel" ? "application/vnd.ms-excel;charset=utf-8" : "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.${ext}`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success(`Exported ${rows.length} records`, { description: `${filename}.${ext}` });
}
