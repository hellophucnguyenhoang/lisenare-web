import { request } from "./client";
import type { Learner, RetrievalLang } from "@/types";

export interface LearnerDetailApi {
  id: number;
  name: string;
  email: string | null;
  retrieval_lang?: string;
  avatar_path?: string | null;
}

export interface LearnerReadApi {
  id: number;
  name: string;
  retrieval_lang?: string;
  avatar_path?: string | null;
}

export function toLearner(api: LearnerDetailApi, avatarUrl?: string | null): Learner {
  return {
    id: api.id,
    name: api.name,
    email: api.email,
    avatarPath: api.avatar_path ?? null,
    avatarUrl: avatarUrl ?? null,
    retrievalLang: (api.retrieval_lang as RetrievalLang) || "en",
  };
}

/**
 * Fetches the current authenticated learner's profile.
 * If an avatar_path exists, fetches the direct avatar image URL via POST /learners/avatar.
 */
export async function getLearnerMe(): Promise<Learner> {
  const api = await request<LearnerDetailApi>("/learners/me");
  let avatarUrl: string | null = null;
  if (api.avatar_path) {
    try {
      avatarUrl = await getLearnerAvatarUrl();
    } catch (e) {
      console.warn("Failed to retrieve learner avatar URL:", e);
    }
  }
  return toLearner(api, avatarUrl);
}

/**
 * Gets the direct avatar image URL for the authenticated learner.
 * Calls POST /api/learners/avatar
 */
export async function getLearnerAvatarUrl(): Promise<string> {
  return request<string>("/learners/avatar", { method: "POST" });
}

/**
 * Updates the learner's avatar image.
 * Calls PATCH /api/learners/me/avatar with multipart/form-data.
 */
export async function updateLearnerAvatar(file: File): Promise<LearnerReadApi> {
  const formData = new FormData();
  formData.append("avatar_file", file);
  return request<LearnerReadApi>("/learners/me/avatar", {
    method: "PATCH",
    body: formData,
  });
}

/**
 * Updates the learner's display name.
 * Calls PATCH /api/learners/me
 */
export async function updateLearnerName(name: string): Promise<unknown> {
  return request<unknown>("/learners/me", {
    method: "PATCH",
    body: { name },
  });
}

/**
 * Updates the learner's retrieval language.
 * Calls PATCH /api/learners/me
 */
export async function updateLearnerRetrievalLang(
  retrievalLang: RetrievalLang,
): Promise<unknown> {
  return request<unknown>("/learners/me", {
    method: "PATCH",
    body: { retrieval_lang: retrievalLang },
  });
}
