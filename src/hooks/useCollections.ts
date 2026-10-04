import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listCollections,
  createCollection,
  deleteCollection,
  updateCollection,
  exportCollection,
  importCollection,
  type AddCollectionResult,
  type BrickExport,
} from "@/api/collections";
import { downloadJsonFile } from "@/utils/download";

export function useCollections(enabled = true) {
  return useQuery({
    queryKey: ["collections"],
    queryFn: listCollections,
    enabled,
    staleTime: 60 * 1000,
  });
}

export function useCreateCollection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      name: string;
      description?: string | null;
      tags?: string[];
    }) => createCollection(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["collections"] }),
  });
}

export function useUpdateCollection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      collectionId,
      data,
    }: {
      collectionId: number;
      data: {
        name?: string | null;
        description?: string | null;
        tags?: string[] | null;
      };
    }) => updateCollection(collectionId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["collections"] }),
  });
}

export function useDeleteCollection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (collectionId: number) => deleteCollection(collectionId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["collections"] }),
  });
}

export function useExportCollection() {
  return useMutation({
    mutationFn: async ({
      collectionId,
      collectionName,
    }: {
      collectionId: number;
      collectionName: string;
    }): Promise<{ data: BrickExport[]; filename: string }> => {
      const data = await exportCollection(collectionId);
      const safeName = collectionName
        .trim()
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");
      const filename = `${safeName || "collection"}-export.json`;
      downloadJsonFile(data, filename);
      return { data, filename };
    },
  });
}

export function useImportCollection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      collectionId,
      file,
    }: {
      collectionId: number;
      file: File | Blob;
    }): Promise<AddCollectionResult> => importCollection(collectionId, file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["collections"] });
      qc.invalidateQueries({ queryKey: ["bricks"] });
    },
  });
}

export function useImportToNewCollection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      collectionName,
      file,
    }: {
      collectionName: string;
      file: File | Blob;
    }) => {
      const newCol = await createCollection({ name: collectionName });
      const result = await importCollection(newCol.id, file);
      return { collection: newCol, result };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["collections"] });
      qc.invalidateQueries({ queryKey: ["bricks"] });
    },
  });
}

