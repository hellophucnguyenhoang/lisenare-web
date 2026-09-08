import { useQuery } from "@tanstack/react-query";
import {
  searchContextBricks,
  searchContextVideos,
  type BrickContextSearch,
  type VideoContextSearchResult,
} from "@/api/contextSearch";

export function useSearchContextBricks(query: string) {
  const trimmed = query.trim();
  return useQuery<BrickContextSearch[]>({
    queryKey: ["context-search", "bricks", trimmed],
    queryFn: () => searchContextBricks(trimmed),
    enabled: trimmed.length > 0,
    staleTime: 60 * 1000,
  });
}

export function useSearchContextVideos(query: string) {
  const trimmed = query.trim();
  return useQuery<VideoContextSearchResult[]>({
    queryKey: ["context-search", "videos", trimmed],
    queryFn: () => searchContextVideos(trimmed),
    enabled: trimmed.length > 0,
    staleTime: 60 * 1000,
  });
}
