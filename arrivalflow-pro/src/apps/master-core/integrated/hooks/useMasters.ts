import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import {
  attachDocumentsToRecord,
  counts,
  createRecord,
  deleteRecords,
  listAudit,
  listRecords,
  updateRecord,
  type MasterRecord,
  type MasterTable,
} from "@/apps/master-core/integrated/lib/masters.api";

export function useMasterList(table: MasterTable) {
  return useQuery({
    queryKey: ["master", table],
    queryFn: () => listRecords(table),
    staleTime: 10_000,
  });
}

export function useSaveRecord(table: MasterTable, entity: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id?: string | undefined; values: Record<string, string> }) =>
      input.id ? updateRecord(table, input.id, input.values) : createRecord(table, input.values),
    onSuccess: (row, input) => {
      qc.invalidateQueries({ queryKey: ["master", table] });
      qc.invalidateQueries({ queryKey: ["master-counts"] });
      qc.invalidateQueries({ queryKey: ["audit"] });
      toast.success(input.id ? `${entity} updated` : `${entity} created`, {
        description: `${String(row.code)} saved to the master data database.`,
      });
    },
    onError: (e: Error) => toast.error("Could not save record", { description: e.message }),
  });
}

export function useDeleteRecords(table: MasterTable, entity: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => deleteRecords(table, ids),
    onSuccess: (_d, ids) => {
      qc.invalidateQueries({ queryKey: ["master", table] });
      qc.invalidateQueries({ queryKey: ["master-counts"] });
      qc.invalidateQueries({ queryKey: ["audit"] });
      toast.success(
        ids.length > 1 ? `${ids.length} ${entity} records deleted` : `${entity} record deleted`,
      );
    },
    onError: (e: Error) => toast.error("Could not delete record", { description: e.message }),
  });
}

export function useMasterCounts() {
  return useQuery({ queryKey: ["master-counts"], queryFn: counts, staleTime: 10_000 });
}

export function useAudit(entity?: string, recordId?: string) {
  return useQuery({
    queryKey: ["audit", entity ?? "all", recordId ?? "all"],
    queryFn: () => listAudit(entity, recordId),
    staleTime: 10_000,
  });
}

export type { MasterRecord, MasterTable };

/** Converts a database row into the string map the multi-step form works with. */
export function toFormValues(record: Record<string, unknown> | null): Record<string, string> {
  if (!record) return {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(record)) {
    if (v === null || v === undefined) continue;
    if (k === "status") out[k] = v === "Active" ? "true" : "false";
    else if (Array.isArray(v)) out[k] = v.join("; ");
    else if (typeof v === "boolean") out[k] = String(v);
    else out[k] = String(v);
  }
  return out;
}

/** Everything a master list page needs: live rows, create/edit sheet state, save + delete. */
export function useMasterPage<T>(table: MasterTable, entity: string) {
  const { data, isLoading, refetch } = useMasterList(table);
  const save = useSaveRecord(table, entity);
  const del = useDeleteRecords(table, entity);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<MasterRecord | null>(null);

  const rows = (data ?? []) as unknown as T[];

  return {
    rows,
    isLoading,
    refetch: () => refetch(),
    open,
    setOpen,
    mode: (editing ? "edit" : "create") as "edit" | "create",
    initial: toFormValues(editing),
    recordId: editing?.id ?? null,
    startCreate: () => {
      setEditing(null);
      setOpen(true);
    },
    startEdit: (row: T) => {
      setEditing(row as unknown as MasterRecord);
      setOpen(true);
    },
    remove: (ids: string[]) => del.mutateAsync(ids),
    submit: async (values: Record<string, string>, documentIds: string[]) => {
      const row = await save.mutateAsync({ id: editing?.id, values });
      if (documentIds.length) {
        await attachDocumentsToRecord(documentIds, row.id, String(row.code));
      }
      setEditing(null);
    },
  };
}
