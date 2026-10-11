import { request } from "./client";

export interface BrickContextSearch {
  brick_id: number;
  native_text: string;
  target_text: string;
  is_own: boolean;
}

export interface ContextSearchParams {
  query: string;
  kind?: "word" | "sentence" | null;
  limit?: number;
  offset?: number;
  page?: number;
}

export async function searchContextBricks(
  params: string | ContextSearchParams,
): Promise<BrickContextSearch[]> {
  if (typeof params === "string") {
    return request<BrickContextSearch[]>("/context-search/bricks-search", {
      method: "POST",
      body: { query: params },
    });
  }

  const { query, kind, limit = 30, page } = params;
  let offset = params.offset;
  if (offset === undefined && page !== undefined && page > 1) {
    offset = (page - 1) * limit;
  } else if (offset === undefined) {
    offset = 0;
  }

  const body: {
    query: string;
    kind?: "word" | "sentence" | null;
    limit: number;
    offset: number;
  } = {
    query,
    limit,
    offset,
  };

  if (kind) {
    body.kind = kind;
  }

  return request<BrickContextSearch[]>("/context-search/bricks-search", {
    method: "POST",
    body,
  });
}
