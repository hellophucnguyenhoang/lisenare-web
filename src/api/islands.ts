import { request } from "./client";
import type { Island } from "@/types";

// ── API response type (snake_case from server) ──────────

interface IslandReadApi {
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

function toIsland(api: IslandReadApi): Island {
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

export async function listIslands() {
  const data = await request<IslandReadApi[]>("/islands");
  return data.map(toIsland);
}

export async function createIsland(data: {
  name: string;
  description?: string | null;
  tags?: string[];
}) {
  const api = await request<IslandReadApi>("/islands", {
    method: "POST",
    body: {
      name: data.name,
      description: data.description || null,
      tags: data.tags || [],
    },
  });
  return toIsland(api);
}

export async function updateIsland(
  islandId: number,
  data: {
    name?: string | null;
    description?: string | null;
    tags?: string[] | null;
  },
) {
  const api = await request<IslandReadApi>(`/islands/${islandId}`, {
    method: "PATCH",
    body: data,
  });
  return toIsland(api);
}

export async function deleteIsland(islandId: number) {
  await request<void>(`/islands/${islandId}`, {
    method: "DELETE",
  });
}

// ── Export / Import Island ──────────────────────────

export interface BrickExport {
  native_text: string;
  target_text: string;
  target_audio_path: string;
  target_lang?: string;
  target_pron?: string | null;
  context?: string | null;
  kind?: string;
  tags?: string[];
  is_private?: boolean;
}

export interface AddIslandResult {
  added: number;
  skipped: number;
}

export async function exportIsland(islandId: number): Promise<BrickExport[]> {
  return request<BrickExport[]>(`/islands/${islandId}/export`);
}

export async function importIsland(
  islandId: number,
  file: File | Blob,
): Promise<AddIslandResult> {
  const formData = new FormData();
  formData.append("file", file);
  return request<AddIslandResult>(`/islands/${islandId}/import`, {
    method: "POST",
    body: formData,
  });
}
