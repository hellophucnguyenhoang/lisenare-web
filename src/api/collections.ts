import { request } from "./client";
import type { Collection } from "@/types";

// ── API response type (snake_case from server) ──────────

interface CollectionReadApi {
  id: number;
  name: string;
  description: string | null;
  creator_id: number;
  created_at: string;
  brick_count: number | null;
  learned_count: number | null;
  tags: string[];
}

// ── Mapper ──────────────────────────────────────────────

function toCollection(api: CollectionReadApi): Collection {
  return {
    id: api.id,
    name: api.name,
    description: api.description,
    brickCount: api.brick_count,
    learnedCount: api.learned_count,
    tags: api.tags,
  };
}

// ── Service functions ───────────────────────────────────

export async function listCollections() {
  const data = await request<CollectionReadApi[]>("/collections");
  return data.map(toCollection);
}

export async function createCollection(data: {
  name: string;
  description?: string;
}) {
  const api = await request<CollectionReadApi>("/collections", {
    method: "POST",
    body: data,
  });
  return toCollection(api);
}

export async function deleteCollection(collectionId: number) {
  await request(`/collections?collection_id=${collectionId}`, {
    method: "DELETE",
  });
}

export async function renameCollection(
  collectionId: number,
  newName: string,
) {
  const api = await request<CollectionReadApi>(
    `/collections/${collectionId}/name`,
    { method: "PATCH", body: { new_name: newName } },
  );
  return toCollection(api);
}
