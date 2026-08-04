import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CloudUpload, FileText, Loader2, Paperclip, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  deleteDocument,
  documentUrl,
  listDocuments,
  uploadDocument,
  type DocumentRow,
} from "@/apps/master-core/integrated/lib/masters.api";

function prettySize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function DocumentUploader({
  entity,
  recordId,
  recordCode,
  onUploaded,
}: {
  entity: string;
  recordId?: string | null;
  recordCode?: string | null;
  onUploaded?: (doc: DocumentRow) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [pending, setPending] = useState<DocumentRow[]>([]);

  const { data: saved = [] } = useQuery({
    queryKey: ["documents", entity, recordId ?? "new"],
    queryFn: () => listDocuments(entity, recordId),
    enabled: !!recordId,
  });

  const docs = recordId ? saved : pending;

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    try {
      for (const file of Array.from(files)) {
        const doc = await uploadDocument({
          entity,
          recordId: recordId ?? null,
          recordCode: recordCode ?? null,
          file,
        });
        if (recordId) {
          qc.invalidateQueries({ queryKey: ["documents", entity, recordId] });
        } else {
          setPending((p) => [doc, ...p]);
        }
        onUploaded?.(doc);
        toast.success(`${file.name} uploaded`);
      }
    } catch (e) {
      toast.error("Upload failed", { description: (e as Error).message });
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const open = async (doc: DocumentRow) => {
    try {
      window.open(await documentUrl(doc.filePath), "_blank", "noopener");
    } catch (e) {
      toast.error("Could not open document", { description: (e as Error).message });
    }
  };

  const remove = async (doc: DocumentRow) => {
    try {
      await deleteDocument(doc);
      setPending((p) => p.filter((d) => d.id !== doc.id));
      qc.invalidateQueries({ queryKey: ["documents", entity, recordId ?? "new"] });
      toast.success("Document removed");
    } catch (e) {
      toast.error("Could not remove document", { description: (e as Error).message });
    }
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void handleFiles(e.dataTransfer.files);
        }}
        className={`grid place-items-center rounded-xl border border-dashed px-6 py-10 text-center transition-colors ${
          dragging ? "border-primary bg-primary-soft" : "border-primary/30 bg-primary-soft/50"
        }`}
      >
        {busy ? (
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        ) : (
          <CloudUpload className="h-8 w-8 text-primary" />
        )}
        <p className="mt-3 text-sm font-medium">Drop files or browse</p>
        <p className="mt-1 text-xs text-muted-foreground">
          PDF, DOCX, XLSX or images up to 25 MB each
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => void handleFiles(e.target.files)}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-4"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          <Paperclip className="h-4 w-4" /> Attach documents
        </Button>
      </div>

      {docs.length > 0 && (
        <ul className="space-y-2">
          {docs.map((d) => (
            <li
              key={d.id}
              className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2"
            >
              <FileText className="h-4 w-4 shrink-0 text-primary" />
              <button
                type="button"
                onClick={() => void open(d)}
                className="min-w-0 flex-1 truncate text-left text-sm font-medium hover:underline"
              >
                {d.fileName}
              </button>
              <span className="num shrink-0 text-xs text-muted-foreground">
                {prettySize(d.fileSize)}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => void remove(d)}
              >
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
