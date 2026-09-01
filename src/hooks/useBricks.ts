import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listBricks,
  createBrick,
  updateBrick,
  deleteBrick,
  type BrickListParams,
} from "@/api/bricks";

export function useBricks(params?: BrickListParams) {
  return useQuery({
    queryKey: ["bricks", params],
    queryFn: () => listBricks(params),
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
    mutationFn: ({ brickId, formData }: { brickId: number; formData: FormData }) =>
      updateBrick(brickId, formData),
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
