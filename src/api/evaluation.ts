import { request } from "./client";

export interface TranscribeAudioResponse {
  transcript: string;
}

export type Rating = 1 | 2 | 3 | 4;

export interface ReviewCreate {
  brick_id: number;
  rating: Rating;
  reviewed_at?: string;
  is_answer_revealed?: boolean;
  learner_target_text?: string | null;
  learner_target_audio_path?: string | null;
  first_score?: number;
}

export interface ReviewResponse {
  total_reviews: number;
}

export async function createBrickReview(
  data: ReviewCreate,
): Promise<ReviewResponse> {
  return request<ReviewResponse>("/brick-reviews", {
    method: "POST",
    body: data as unknown as Record<string, unknown>,
  });
}

export interface SentenceCompareRequest {
  sentence1: string;
  sentence2: string;
  lang?: string | null;
}

export interface SentenceCompareResponse {
  score: number;
  correct: boolean | null;
  threshold: number;
}

export async function transcribeAudio(audioFile: Blob | File): Promise<string> {
  const formData = new FormData();
  formData.append("file", audioFile, "audio.wav");
  const res = await request<TranscribeAudioResponse>("/audio/transcripts", {
    method: "POST",
    body: formData,
  });
  return res.transcript;
}

export async function compareSentences(
  params: SentenceCompareRequest,
): Promise<SentenceCompareResponse> {
  return request<SentenceCompareResponse>("/text/sentence-comparison", {
    method: "POST",
    body: {
      sentence1: params.sentence1,
      sentence2: params.sentence2,
      ...(params.lang ? { lang: params.lang } : {}),
    },
  });
}

export interface WordSegmentSecond {
  word: string;
  start_sec: number;
  end_sec: number;
}

export async function getForcedAlignment(
  brickId: number,
): Promise<WordSegmentSecond[]> {
  return request<WordSegmentSecond[]>(`/audio/forced-alignment/${brickId}`);
}

