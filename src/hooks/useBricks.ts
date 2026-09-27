import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listBricks,
  createBrick,
  updateBrick,
  deleteBrick,
  checkBrickExists,
  getNextBrick,
  type BrickListParams,
  type NextBrickParams,
} from "@/api/bricks";
import { getForcedAlignment, type WordSegmentSecond } from "@/api/evaluation";
import { useDebounce } from "./useDebounce";

export function useForcedAlignment(
  brickId: number | null | undefined,
  enabled = true,
) {
  return useQuery<WordSegmentSecond[]>({
    queryKey: ["audio", "forced-alignment", brickId],
    queryFn: () =>
      brickId ? getForcedAlignment(brickId) : Promise.resolve([]),
    enabled: Boolean(brickId) && enabled,
    staleTime: 5 * 60 * 1000,
  });
}

export function useBricks(params?: BrickListParams, enabled = true) {
  return useQuery({
    queryKey: ["bricks", params],
    queryFn: () => listBricks(params),
    enabled,
    staleTime: 60 * 1000,
  });
}

export function useInfiniteBricks(
  params?: Omit<BrickListParams, "page">,
  enabled = true,
) {
  return useInfiniteQuery({
    queryKey: ["bricks", "infinite", params],
    queryFn: ({ pageParam }) => listBricks({ ...params, page: pageParam }),
    initialPageParam: 1,
    enabled,
    staleTime: 60 * 1000,
    getNextPageParam: (lastPage, allPages) => {
      const totalFetched = allPages.reduce((sum, p) => sum + p.items.length, 0);
      if (totalFetched >= lastPage.total) return undefined;
      return allPages.length + 1;
    },
  });
}

export function useNextBrick(
  params?: NextBrickParams | number[],
  enabled = true,
) {
  return useQuery({
    queryKey: ["bricks", "next", params],
    queryFn: () => getNextBrick(params),
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
