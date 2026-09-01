import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listCollections,
  createCollection,
  deleteCollection,
  renameCollection,
} from "@/api/collections";

export function useCollections() {
  return useQuery({
    queryKey: ["collections"],
    queryFn: listCollections,
  });
}

export function useCreateCollection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createCollection,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["collections"] }),
  });
}

export function useDeleteCollection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteCollection,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["collections"] }),
  });
}

export function useRenameCollection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      collectionId,
      newName,
    }: {
      collectionId: number;
      newName: string;
    }) => renameCollection(collectionId, newName),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["collections"] }),
  });
}
