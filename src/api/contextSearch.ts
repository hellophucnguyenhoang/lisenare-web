import { request } from "./client";
import type { Snippet } from "@/types";

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
    tags: api.tags || [],
  };
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

export async function searchContextSnippets(
  query: string,
): Promise<Snippet[]> {
  const data = await request<SnippetReadApi[]>(
    "/context-search/snippets-search",
    {
      method: "POST",
      body: { query },
    },
  );
  return data.map(toSnippet);
}
