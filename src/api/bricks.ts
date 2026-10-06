import { request } from "./client";
import type { Brick } from "@/types";

// ── API request payload schemas (multipart/form-data) ───

export interface BrickCreateJsonData {
  native_text: string;
  target_text: string;
  target_lang?: string;
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
  target_lang?: string | null;
  target_pron?: string | null;
  context?: string | null;
  unit_type?: string | null;
  is_private?: boolean | null;
  collection_id?: number | null;
  tags?: string[] | null;
}

export interface AddBrickRequest {
  collection_id: number;
}

export interface AddCollectionRequest {
  target_collection_id: number;
}

export interface AddCollectionResult {
  added: number;
  skipped: number;
}

// ── API response types (snake_case from server) ─────────

interface BrickReadApi {
  id: number;
  native_text: string;
  target_text: string;
  target_lang?: string;
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

export interface BrickCreator {
  id: number;
  name: string;
  practice_lang?: string;
}

export interface BrickDetail extends Brick {
  collectionName: string;
  creatorId: number;
  creator: BrickCreator;
  reaction: string | null;
}

interface BrickDetailApi extends BrickReadApi {
  collection_name?: string;
  creator: BrickCreator;
  reaction?: string | null;
}

interface BrickPageApi {
  items: BrickReadApi[];
  total: number;
}

// ── Query params ────────────────────────────────────────

export interface BrickListParams {
  collection_ids?: number[];
  status?: "LEARNED" | "NOT_LEARNED";
  unit_type?: "word" | "sentence";
  tags?: string[];
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
    targetLang: api.target_lang || "en",
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

function toBrickDetail(api: BrickDetailApi): BrickDetail {
  return {
    ...toBrick(api),
    collectionName: api.collection_name || "",
    creatorId: api.creator_id,
    creator: api.creator,
    reaction: api.reaction || null,
  };
}

// ── Service functions ───────────────────────────────────

export async function listBricks(params?: BrickListParams) {
  const q = new URLSearchParams();
  if (params?.collection_ids) {
    params.collection_ids.forEach((id) =>
      q.append("collection_ids", String(id)),
    );
  }
  if (params?.status) q.set("status", params.status);
  if (params?.unit_type) q.set("unit_type", params.unit_type);
  if (params?.tags && params.tags.length > 0) {
    params.tags.forEach((tag) => q.append("tags", tag));
  }
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

export interface NextBrickParams {
  collectionIds?: number[];
  brickId?: number | null;
}

export async function getNextBrick(
  paramsOrCollectionIds?: NextBrickParams | number[],
  maybeBrickId?: number | null,
) {
  const q = new URLSearchParams();
  let collectionIds: number[] | undefined;
  let brickId: number | null | undefined;

  if (Array.isArray(paramsOrCollectionIds)) {
    collectionIds = paramsOrCollectionIds;
    brickId = maybeBrickId;
  } else if (paramsOrCollectionIds) {
    collectionIds = paramsOrCollectionIds.collectionIds;
    brickId = paramsOrCollectionIds.brickId;
  }

  if (collectionIds && collectionIds.length > 0) {
    collectionIds.forEach((id) => q.append("collection_ids", String(id)));
  }
  if (brickId != null) {
    q.set("brick_id", String(brickId));
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

/**
 * Retrieves the direct audio URL for a brick from the backend.
 * Calls GET /api/bricks/{brick_id}/audio
 *
 * @param brickId - The unique ID of the brick
 * @returns The complete URL to play the audio directly
 */
export async function getBrickAudioUrl(brickId: number): Promise<string> {
  return request<string>(`/bricks/${brickId}/audio`);
}

/**
 * Copies a brick into the learner's collection.
 * Calls POST /api/bricks/add-from/{brick_id}
 */
export async function addBrickFrom(
  brickId: number,
  collectionId: number,
): Promise<Brick> {
  const api = await request<BrickReadApi>(`/bricks/add-from/${brickId}`, {
    method: "POST",
    body: { collection_id: collectionId },
  });
  return toBrick(api);
}

/**
 * Copies all public bricks from a collection into the learner's target collection.
 * Calls POST /api/bricks/add-from-collection/{collection_id}
 */
export async function addBricksFromCollection(
  collectionId: number,
  targetCollectionId: number,
): Promise<AddCollectionResult> {
  return request<AddCollectionResult>(
    `/bricks/add-from-collection/${collectionId}`,
    {
      method: "POST",
      body: { target_collection_id: targetCollectionId },
    },
  );
}

/**
 * Retrieves full details of a brick including creator and collection info.
 * Calls GET /api/bricks/{brick_id}
 */
export async function getBrickDetail(brickId: number): Promise<BrickDetail> {
  const api = await request<BrickDetailApi>(`/bricks/${brickId}`);
  return toBrickDetail(api);
}


