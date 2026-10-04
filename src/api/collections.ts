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
    tags: api.tags || [],
  };
}

// ── Service functions ───────────────────────────────────

export async function listCollections() {
  const data = await request<CollectionReadApi[]>("/collections");
  return data.map(toCollection);
}

export async function createCollection(data: {
  name: string;
  description?: string | null;
  tags?: string[];
}) {
  const api = await request<CollectionReadApi>("/collections", {
    method: "POST",
    body: {
      name: data.name,
      description: data.description || null,
      tags: data.tags || [],
    },
  });
  return toCollection(api);
}

export async function updateCollection(
  collectionId: number,
  data: {
    name?: string | null;
    description?: string | null;
    tags?: string[] | null;
  },
) {
  const api = await request<CollectionReadApi>(`/collections/${collectionId}`, {
    method: "PATCH",
    body: data,
  });
  return toCollection(api);
}

export async function deleteCollection(collectionId: number) {
  await request<void>(`/collections/${collectionId}`, {
    method: "DELETE",
  });
}

// ── Export / Import Collection ──────────────────────────

export interface BrickExport {
  native_text: string;
  target_text: string;
  target_audio_path: string;
  target_lang?: string;
  target_pron?: string | null;
  context?: string | null;
  unit_type?: string;
  tags?: string[];
  is_private?: boolean;
}

export interface AddCollectionResult {
  added: number;
  skipped: number;
}

export async function exportCollection(
  collectionId: number,
): Promise<BrickExport[]> {
  return request<BrickExport[]>(`/collections/${collectionId}/export`);
}

export async function importCollection(
  collectionId: number,
  file: File | Blob,
): Promise<AddCollectionResult> {
  const formData = new FormData();
  formData.append("file", file);
  return request<AddCollectionResult>(`/collections/${collectionId}/import`, {
    method: "POST",
    body: formData,
  });
}

