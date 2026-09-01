import { request } from "./client";
import type { Snippet } from "@/types";

// ── API response types (snake_case from server) ─────────

interface LearnerApi {
  id: number;
  name: string;
}

interface SnippetReadApi {
  id: number;
  content: string;
  translation: string | null;
  content_audio_path: string | null;
  content_pron: string | null;
  context: string | null;
  is_public: boolean;
  last_edit_at: string;
  creator: LearnerApi;
  reaction: string | null;
  contribution_count: number;
  tags: string[];
}

// ── Mapper ──────────────────────────────────────────────

function toSnippet(api: SnippetReadApi): Snippet {
  return {
    id: api.id,
    content: api.content,
    translation: api.translation,
    contentAudioPath: api.content_audio_path,
    contentPron: api.content_pron,
    context: api.context,
    isPublic: api.is_public,
    lastEditAt: api.last_edit_at,
    creator: api.creator,
    reaction: api.reaction,
    contributionCount: api.contribution_count,
    tags: api.tags,
  };
}

// ── Service functions ───────────────────────────────────

export async function getRandomSnippets(pageSize = 5) {
  const data = await request<SnippetReadApi[]>(
    `/snippets/random?page_size=${pageSize}`,
  );
  return data.map(toSnippet);
}

export async function createSnippet(formData: FormData) {
  const api = await request<SnippetReadApi>("/snippets", {
    method: "POST",
    body: formData,
  });
  return toSnippet(api);
}
