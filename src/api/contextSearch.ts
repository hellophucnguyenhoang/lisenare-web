import { request } from "./client";

export interface BrickContextSearch {
  brick_id: number;
  native_text: string;
  target_text: string;
  is_own: boolean;
}

export async function searchContextBricks(
  query: string,
): Promise<BrickContextSearch[]> {
  return request<BrickContextSearch[]>("/context-search/bricks-search", {
    method: "POST",
    body: { query },
  });
}
