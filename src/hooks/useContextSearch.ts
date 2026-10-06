import { useQuery } from "@tanstack/react-query";
import {
  searchContextBricks,
  type BrickContextSearch,
  type ContextSearchParams,
} from "@/api/contextSearch";

export function useSearchContextBricks(
  params: string | ContextSearchParams,
  enabled = true,
) {
  const normalizedParams: ContextSearchParams =
    typeof params === "string" ? { query: params } : params;
  const trimmed = normalizedParams.query.trim();

  return useQuery<BrickContextSearch[]>({
    queryKey: [
      "context-search",
      "bricks",
      {
        ...normalizedParams,
        query: trimmed,
      },
    ],
    queryFn: () =>
      searchContextBricks({
        ...normalizedParams,
        query: trimmed,
      }),
    enabled: enabled && trimmed.length > 0,
    staleTime: 60 * 1000,
  });
}
