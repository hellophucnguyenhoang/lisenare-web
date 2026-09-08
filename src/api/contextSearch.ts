import { request } from "./client";

export interface BrickContextSearch {
  brick_id: number;
  native_text: string;
  target_text: string;
}

export interface VideoContextSearchResult {
  ytb_video_id: string;
  start: number;
  duration: number;
  transcript: string;
}

export async function searchContextBricks(
  query: string,
): Promise<BrickContextSearch[]> {
  return request<BrickContextSearch[]>("/context-search/bricks-search", {
    method: "POST",
    body: { query },
  });
}

export async function searchContextVideos(
  query: string,
): Promise<VideoContextSearchResult[]> {
  return request<VideoContextSearchResult[]>("/context-search/videos-search", {
    method: "POST",
    body: { query },
  });
}
