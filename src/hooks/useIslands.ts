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
import { RequestError } from "@/api/client";
import { downloadJsonFile } from "@/utils/download";
import { toast } from "sonner";

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
      include_memory = true,
      include_review_history = true,
    }: {
      islandId: number;
      islandName: string;
      include_memory?: boolean;
      include_review_history?: boolean;
    }): Promise<{ data: BrickExport[]; filename: string }> => {
      const data = await exportIsland(islandId, {
        include_memory,
        include_review_history,
      });
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
    mutationFn: async ({
      islandId,
      islandName,
      file,
    }: {
      islandId: number;
      islandName?: string;
      file: File | Blob;
    }): Promise<{ result: AddIslandResult; islandName?: string; islandId: number }> => {
      const result = await importIsland(islandId, file);
      return { result, islandName, islandId };
    },
    onSuccess: ({ result, islandName }) => {
      qc.invalidateQueries({ queryKey: ["islands"] });
      qc.invalidateQueries({ queryKey: ["bricks"] });
      const name = islandName ? `"${islandName}"` : "island";
      toast.success(
        `Imported to ${name}: ${result.added} added, ${result.skipped} skipped.`,
      );
    },
    onError: (err: unknown) => {
      console.error("Failed to import island:", err);
      if (err instanceof RequestError && err.status === 524) {
        qc.invalidateQueries({ queryKey: ["islands"] });
        qc.invalidateQueries({ queryKey: ["bricks"] });
        toast.info(
          "Import is still processing on the server. Your bricks will appear shortly.",
        );
      } else {
        toast.error("Failed to import island. Please check the file.");
      }
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
    }): Promise<{ island: { id: number; name: string }; result: AddIslandResult }> => {
      const newCol = await createIsland({ name: islandName });
      const result = await importIsland(newCol.id, file);
      return { island: newCol, result };
    },
    onSuccess: ({ island, result }) => {
      qc.invalidateQueries({ queryKey: ["islands"] });
      qc.invalidateQueries({ queryKey: ["bricks"] });
      toast.success(
        `Imported to "${island.name}": ${result.added} added, ${result.skipped} skipped.`,
      );
    },
    onError: (err: unknown) => {
      console.error("Failed to import island:", err);
      if (err instanceof RequestError && err.status === 524) {
        qc.invalidateQueries({ queryKey: ["islands"] });
        qc.invalidateQueries({ queryKey: ["bricks"] });
        toast.info(
          "Import is still processing on the server. Your new island will appear shortly.",
        );
      } else {
        toast.error("Failed to import island. Please check the file.");
      }
    },
  });
}
