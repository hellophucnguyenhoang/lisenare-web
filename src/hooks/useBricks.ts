import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listBricks,
  createBrick,
  updateBrick,
  deleteBrick,
  checkBrickExists,
  getNextBrick,
  addBrickFrom,
  addBricksFromCollection,
  getBrickDetail,
  type BrickDetail,
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

export function useCheckBrickExists(
  targetText: string,
  enabled = true,
  debounceMs = 400,
) {
  const debouncedText = useDebounce(targetText.trim(), debounceMs);
  const textToCheck = debounceMs === 0 ? targetText.trim() : debouncedText;

  return useQuery({
    queryKey: ["bricks", "exists", textToCheck],
    queryFn: () => checkBrickExists(textToCheck),
    enabled: enabled && textToCheck.length > 0,
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

export function useAddBrickFrom() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      brickId,
      collectionId,
    }: {
      brickId: number;
      collectionId: number;
    }) => addBrickFrom(brickId, collectionId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bricks"] });
      qc.invalidateQueries({ queryKey: ["collections"] });
    },
  });
}

export function useAddBricksFromCollection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      collectionId,
      targetCollectionId,
    }: {
      collectionId: number;
      targetCollectionId: number;
    }) => addBricksFromCollection(collectionId, targetCollectionId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bricks"] });
      qc.invalidateQueries({ queryKey: ["collections"] });
    },
  });
}

export function useBrickDetail(
  brickId: number | null | undefined,
  enabled = true,
) {
  return useQuery<BrickDetail>({
    queryKey: ["bricks", "detail", brickId],
    queryFn: () =>
      brickId
        ? getBrickDetail(brickId)
        : Promise.reject(new Error("No brick ID provided")),
    enabled: Boolean(brickId) && enabled,
    staleTime: 30 * 1000,
  });
}



