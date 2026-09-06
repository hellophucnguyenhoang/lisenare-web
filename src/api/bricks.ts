import { request } from "./client";
import type { Brick } from "@/types";

// ── API request payload schemas (multipart/form-data) ───

export interface BrickCreateJsonData {
  native_text: string;
  target_text: string;
  target_pron?: string | null;
  context?: string | null;
  unit_type?: string;
  is_private?: boolean;
  collection_id?: number;
  collection_name?: string;
  tags?: string[];
}

export interface BrickUpdateJsonData {
  native_text?: string | null;
  target_text?: string | null;
  target_pron?: string | null;
  context?: string | null;
  unit_type?: string | null;
  is_private?: boolean | null;
  collection_id?: number | null;
  tags?: string[] | null;
}

// ── API response types (snake_case from server) ─────────

interface BrickReadApi {
  id: number;
  native_text: string;
  target_text: string;
  target_pron: string | null;
  context: string | null;
  unit_type: string;
  is_private: boolean;
  target_audio_path: string;
  last_edit_at: string;
  creator_id: number;
  collection_id: number;
  tags: string[];
  learned?: boolean;
}

interface BrickPageApi {
  items: BrickReadApi[];
  total: number;
}

// ── Query params ────────────────────────────────────────

export interface BrickListParams {
  collection_ids?: number[];
  status?: "LEARNED" | "NOT_LEARNED";
  sort_by?: "NEWEST" | "AZ" | "ZA";
  limit?: number;
  page?: number;
}

// ── Mapper ──────────────────────────────────────────────

function toBrick(api: BrickReadApi): Brick {
  return {
    id: api.id,
    nativeText: api.native_text,
    targetText: api.target_text,
    targetAudioPath: api.target_audio_path,
    targetPron: api.target_pron,
    context: api.context,
    unitType: api.unit_type,
    isPrivate: api.is_private,
    lastEditAt: api.last_edit_at,
    tags: api.tags,
    collectionId: api.collection_id,
    learned: api.learned ?? false,
  };
}

// ── Service functions ───────────────────────────────────

export async function listBricks(params?: BrickListParams) {
  const q = new URLSearchParams();
  if (params?.collection_ids) {
    params.collection_ids.forEach((id) => q.append("collection_ids", String(id)));
  }
  if (params?.status) q.set("status", params.status);
  if (params?.sort_by) q.set("sort_by", params.sort_by);
  if (params?.limit) q.set("limit", String(params.limit));
  if (params?.page) q.set("page", String(params.page));

  const qs = q.toString();
  const data = await request<BrickPageApi>(`/bricks${qs ? `?${qs}` : ""}`);
  return { items: data.items.map(toBrick), total: data.total };
}

export async function createBrick(formData: FormData) {
  const api = await request<BrickReadApi>("/bricks", {
    method: "POST",
    body: formData,
  });
  return toBrick(api);
}

export async function updateBrick(brickId: number, formData: FormData) {
  const api = await request<BrickReadApi>(`/bricks/${brickId}`, {
    method: "PATCH",
    body: formData,
  });
  return toBrick(api);
}

export async function deleteBrick(brickId: number) {
  await request(`/bricks/${brickId}`, { method: "DELETE" });
}

export async function getNextBrick(collectionIds?: number[]) {
  const q = new URLSearchParams();
  if (collectionIds) {
    collectionIds.forEach((id) => q.append("collection_ids", String(id)));
  }
  const qs = q.toString();
  const api = await request<BrickReadApi | null>(
    `/bricks/next${qs ? `?${qs}` : ""}`,
  );
  return api ? toBrick(api) : null;
}

export async function checkBrickExists(targetText: string): Promise<boolean> {
  const q = new URLSearchParams();
  q.set("target_text", targetText);
  return request<boolean>(`/bricks/exists?${q.toString()}`);
}
