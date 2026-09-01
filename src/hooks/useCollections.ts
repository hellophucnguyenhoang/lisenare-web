import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listCollections,
  createCollection,
  deleteCollection,
  updateCollection,
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
