import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  listBricks,
  createBrick,
  updateBrick,
  deleteBrick,
  checkBrickExists,
  getNextBrick,
  addBrickFrom,
  addBricksFromIsland,
  getBrickDetail,
  getRecommendedBricks,
  createBrickInteraction,
  reportBrick,
  forgetBrick,
  getListeningBricks,
  type BrickListeningParams,
  type BrickListeningPage,
  type BrickListeningData,
  type BrickDetail,
  type BrickListParams,
  type NextBrickParams,
  type BrickInteractionCreate,
} from "@/api/bricks";
export type { BrickListeningData, BrickListeningPage, BrickListeningParams };
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
      islandId,
    }: {
      brickId: number;
      islandId: number;
    }) => addBrickFrom(brickId, islandId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bricks"] });
      qc.invalidateQueries({ queryKey: ["islands"] });
    },
  });
}

export function useAddBricksFromIsland() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      islandId,
      targetIslandId,
    }: {
      islandId: number;
      targetIslandId: number;
    }) => addBricksFromIsland(islandId, targetIslandId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bricks"] });
      qc.invalidateQueries({ queryKey: ["islands"] });
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

export function useRecommendedBricks(
  sessionId: string | null | undefined,
  pageSize = 5,
  enabled = true,
) {
  return useQuery<{ items: import("@/types").Brick[]; total: number }>({
    queryKey: ["bricks", "recommended", sessionId, pageSize],
    queryFn: () =>
      sessionId
        ? getRecommendedBricks(sessionId, pageSize)
        : Promise.resolve({ items: [], total: 0 }),
    enabled: Boolean(sessionId) && enabled,
    staleTime: 60 * 1000,
  });
}

export function useCreateBrickInteraction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: BrickInteractionCreate) =>
      createBrickInteraction(payload),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({
        queryKey: ["bricks", "recommended", variables.session_id],
      });
    },
  });
}

export function useReportBrick() {
  return useMutation({
    mutationFn: ({ brickId, reason }: { brickId: number; reason?: string }) =>
      reportBrick(brickId, reason),
  });
}

export function useForgetBrick() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (brickId: number) => forgetBrick(brickId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bricks"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
      qc.invalidateQueries({ queryKey: ["search"] });
    },
  });
}

export function useInfiniteListeningBricks(
  params?: Omit<BrickListeningParams, "offset">,
  enabled = true,
) {
  const limit = params?.limit ?? 10;
  return useInfiniteQuery({
    queryKey: ["bricks", "listening", "infinite", params],
    queryFn: ({ pageParam = 0 }) =>
      getListeningBricks({ ...params, offset: pageParam, limit }),
    initialPageParam: 0,
    enabled,
    staleTime: params?.shuffle_page ? 0 : 60 * 1000,
    getNextPageParam: (lastPage, allPages) => {
      const totalFetched = allPages.reduce((sum, p) => sum + p.items.length, 0);
      if (totalFetched >= lastPage.total) return undefined;
      return totalFetched;
    },
  });
}

export function useListeningBricks(
  params?: BrickListeningParams,
  enabled = true,
) {
  return useQuery({
    queryKey: ["bricks", "listening", params],
    queryFn: () => getListeningBricks(params),
    enabled,
    staleTime: 60 * 1000,
  });
}
