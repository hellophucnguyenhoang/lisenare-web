import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listBricks,
  createBrick,
  updateBrick,
  deleteBrick,
  checkBrickExists,
  getNextBrick,
  type BrickListParams,
} from "@/api/bricks";
import { useDebounce } from "./useDebounce";

export function useBricks(params?: BrickListParams) {
  return useQuery({
    queryKey: ["bricks", params],
    queryFn: () => listBricks(params),
  });
}

export function useNextBrick(collectionIds?: number[], enabled = true) {
  return useQuery({
    queryKey: ["bricks", "next", collectionIds],
    queryFn: () => getNextBrick(collectionIds),
    enabled,
    staleTime: 0,
  });
}

export function useCheckBrickExists(targetText: string, enabled = true) {
  const debouncedText = useDebounce(targetText.trim(), 400);

  return useQuery({
    queryKey: ["bricks", "exists", debouncedText],
    queryFn: () => checkBrickExists(debouncedText),
    enabled: enabled && debouncedText.length > 0,
    staleTime: 30_000,
  });
}

export function useCreateBrick() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createBrick,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bricks"] }),
  });
}

export function useUpdateBrick() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      brickId,
      formData,
    }: {
      brickId: number;
      formData: FormData;
    }) => updateBrick(brickId, formData),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bricks"] }),
  });
}

export function useDeleteBrick() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteBrick,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bricks"] }),
  });
}
