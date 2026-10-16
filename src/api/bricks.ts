import { request } from "./client";
import type { Brick } from "@/types";

// ── API request payload schemas (multipart/form-data) ───

export interface BrickCreateJsonData {
  native_text: string;
  target_text: string;
  target_lang?: string;
  target_pron?: string | null;
  context?: string | null;
  kind?: string;
  is_private?: boolean;
  island_id?: number;
  island_name?: string;
  tags?: string[];
}

export interface BrickUpdateJsonData {
  native_text?: string | null;
  target_text?: string | null;
  target_lang?: string | null;
  target_pron?: string | null;
  context?: string | null;
  kind?: string | null;
  is_private?: boolean | null;
  island_id?: number | null;
  tags?: string[] | null;
}

export interface AddBrickRequest {
  island_id: number;
}

export interface AddIslandRequest {
  target_island_id: number;
}

export interface AddIslandResult {
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
  kind?: string;
  is_private: boolean;
  target_audio_path: string;
  last_edit_at: string;
  creator_id: number;
  island_id: number;
  tags?: string[];
  learned?: boolean;
}

export type InteractionType = "LISTEN" | "ADD" | "LIKE" | "REMOVE_REACTION";

export interface BrickInteractionCreate {
  session_id: string;
  brick_id: number;
  interaction_type: InteractionType;
}

export interface BrickCreator {
  id: number;
  name: string;
  retrieval_lang?: string;
}

export interface BrickDetail extends Brick {
  islandName: string;
  creatorId: number;
  creator: BrickCreator;
  reaction: string | null;
}

interface BrickDetailApi extends BrickReadApi {
  island_name?: string;
  creator: BrickCreator;
  reaction?: string | null;
}

interface BrickPageApi {
  items: BrickReadApi[];
  total: number;
}

// ── Query params ────────────────────────────────────────

export interface BrickListParams {
  island_ids?: number[];
  status?: "LEARNED" | "NOT_LEARNED";
  kind?: "word" | "sentence";
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
    kind: api.kind || api.kind || "sentence",
    isPrivate: api.is_private,
    lastEditAt: api.last_edit_at,
    tags: api.tags || [],
    islandId: api.island_id,
    learned: api.learned ?? false,
  };
}

function toBrickDetail(api: BrickDetailApi): BrickDetail {
  return {
    ...toBrick(api),
    islandName: api.island_name || "",
    creatorId: api.creator_id,
    creator: api.creator,
    reaction: api.reaction || null,
  };
}

// ── Service functions ───────────────────────────────────

export async function listBricks(params?: BrickListParams) {
  const q = new URLSearchParams();
  if (params?.island_ids) {
    params.island_ids.forEach((id) => q.append("island_ids", String(id)));
  }
  if (params?.status) q.set("status", params.status);
  if (params?.kind) q.set("kind", params.kind);
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
  islandIds?: number[];
  brickId?: number | null;
}

export async function getNextBrick(
  paramsOrIslandIds?: NextBrickParams | number[],
  maybeBrickId?: number | null,
) {
  const q = new URLSearchParams();
  let islandIds: number[] | undefined;
  let brickId: number | null | undefined;

  if (Array.isArray(paramsOrIslandIds)) {
    islandIds = paramsOrIslandIds;
    brickId = maybeBrickId;
  } else if (paramsOrIslandIds) {
    islandIds = paramsOrIslandIds.islandIds;
    brickId = paramsOrIslandIds.brickId;
  }

  if (islandIds && islandIds.length > 0) {
    islandIds.forEach((id) => q.append("island_ids", String(id)));
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
 * Copies a brick into the learner's island.
 * Calls POST /api/bricks/add-from/{brick_id}
 */
export async function addBrickFrom(
  brickId: number,
  islandId: number,
): Promise<Brick> {
  const api = await request<BrickReadApi>(`/bricks/add-from/${brickId}`, {
    method: "POST",
    body: { island_id: islandId },
  });
  return toBrick(api);
}

/**
 * Copies all public bricks from an island into the learner's target island.
 * Calls POST /api/bricks/add-from-island/{island_id}
 */
export async function addBricksFromIsland(
  islandId: number,
  targetIslandId: number,
): Promise<AddIslandResult> {
  return request<AddIslandResult>(`/bricks/add-from-island/${islandId}`, {
    method: "POST",
    body: { target_island_id: targetIslandId },
  });
}

/**
 * Retrieves full details of a brick including creator and island info.
 * Calls GET /api/bricks/{brick_id}
 */
export async function getBrickDetail(brickId: number): Promise<BrickDetail> {
  const api = await request<BrickDetailApi>(`/bricks/${brickId}`);
  return toBrickDetail(api);
}

/**
 * Retrieves recommended bricks for the given session.
 * Calls GET /api/bricks/recommended/{session_id}
 */
export async function getRecommendedBricks(
  sessionId: string,
  pageSize = 5,
): Promise<{ items: Brick[]; total: number }> {
  const q = new URLSearchParams();
  if (pageSize) q.set("page_size", String(pageSize));
  const qs = q.toString();
  const data = await request<BrickPageApi>(
    `/bricks/recommended/${encodeURIComponent(sessionId)}${qs ? `?${qs}` : ""}`,
  );
  return {
    items: (data.items || []).map(toBrick),
    total: data.total ?? (data.items || []).length,
  };
}

/**
 * Sends a brick interaction to update the profile vector for the session.
 * Calls POST /api/brick-interactions
 */
export async function createBrickInteraction(
  payload: BrickInteractionCreate,
): Promise<void> {
  await request<Record<string, unknown>>("/brick-interactions", {
    method: "POST",
    body: payload as unknown as Record<string, unknown>,
  });
}

export interface BrickReportCreate {
  reason?: string;
}

/**
 * Reports an issue with a brick.
 * Calls POST /api/bricks/{brick_id}/report
 */
export async function reportBrick(
  brickId: number,
  reason = "Not provided",
): Promise<void> {
  await request<Record<string, unknown>>(`/bricks/${brickId}/report`, {
    method: "POST",
    body: { reason },
  });
}

/**
 * Resets memory and review history for a brick.
 * Calls POST /api/bricks/{brick_id}/forget
 */
export async function forgetBrick(brickId: number): Promise<void> {
  await request<void>(`/bricks/${brickId}/forget`, {
    method: "POST",
  });
}

export interface BrickListeningData {
  audio_path: string;
  target_text: string;
  native_text: string;
  target_pron?: string | null;
  context?: string | null;
}

export interface BrickListeningPage {
  items: BrickListeningData[];
  offset: number;
  limit: number;
  total: number;
}

export interface BrickListeningParams {
  island_ids?: number[];
  offset?: number;
  limit?: number;
  shuffle_page?: boolean;
}

/**
 * Retrieves bricks formatted specifically for listening retrieval with pagination.
 * Calls GET /api/bricks/listening
 */
export async function getListeningBricks(
  params: BrickListeningParams = {},
): Promise<BrickListeningPage> {
  const q = new URLSearchParams();
  if (params.offset !== undefined) q.set("offset", String(params.offset));
  if (params.limit !== undefined) q.set("limit", String(params.limit));
  if (params.shuffle_page !== undefined)
    q.set("shuffle_page", String(params.shuffle_page));
  if (params.island_ids && params.island_ids.length > 0) {
    params.island_ids.forEach((id) => q.append("island_ids", String(id)));
  }
  const qs = q.toString();
  return request<BrickListeningPage>(`/bricks/listening${qs ? `?${qs}` : ""}`);
}
