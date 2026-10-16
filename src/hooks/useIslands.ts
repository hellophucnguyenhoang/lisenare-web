import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listIslands,
  createIsland,
  deleteIsland,
  updateIsland,
  exportIsland,
  importIsland,
  type AddIslandResult,
  type BrickExport,
} from "@/api/islands";
import { downloadJsonFile } from "@/utils/download";

export function useIslands(enabled = true) {
  return useQuery({
    queryKey: ["islands"],
    queryFn: listIslands,
    enabled,
    staleTime: 60 * 1000,
  });
}

export function useCreateIsland() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      name: string;
      description?: string | null;
      tags?: string[];
    }) => createIsland(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["islands"] }),
  });
}

export function useUpdateIsland() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      islandId,
      data,
    }: {
      islandId: number;
      data: {
        name?: string | null;
        description?: string | null;
        tags?: string[] | null;
      };
    }) => updateIsland(islandId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["islands"] }),
  });
}

export function useDeleteIsland() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (islandId: number) => deleteIsland(islandId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["islands"] }),
  });
}

export function useExportIsland() {
  return useMutation({
    mutationFn: async ({
      islandId,
      islandName,
    }: {
      islandId: number;
      islandName: string;
    }): Promise<{ data: BrickExport[]; filename: string }> => {
      const data = await exportIsland(islandId);
      const safeName = islandName
        .trim()
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");
      const filename = `${safeName || "island"}-export.json`;
      downloadJsonFile(data, filename);
      return { data, filename };
    },
  });
}

export function useImportIsland() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      islandId,
      file,
    }: {
      islandId: number;
      file: File | Blob;
    }): Promise<AddIslandResult> => importIsland(islandId, file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["islands"] });
      qc.invalidateQueries({ queryKey: ["bricks"] });
    },
  });
}

export function useImportToNewIsland() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      islandName,
      file,
    }: {
      islandName: string;
      file: File | Blob;
    }) => {
      const newCol = await createIsland({ name: islandName });
      const result = await importIsland(newCol.id, file);
      return { island: newCol, result };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["islands"] });
      qc.invalidateQueries({ queryKey: ["bricks"] });
    },
  });
}
