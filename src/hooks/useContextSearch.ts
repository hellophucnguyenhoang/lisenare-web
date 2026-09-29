import { useQuery } from "@tanstack/react-query";
import {
  searchContextBricks,
  type BrickContextSearch,
} from "@/api/contextSearch";

export function useSearchContextBricks(query: string, enabled = true) {
  const trimmed = query.trim();
  return useQuery<BrickContextSearch[]>({
    queryKey: ["context-search", "bricks", trimmed],
    queryFn: () => searchContextBricks(trimmed),
    enabled: enabled && trimmed.length > 0,
    staleTime: 60 * 1000,
  });
}
