import { request } from "./client";

export interface TranscribeAudioResponse {
  transcript: string;
}

export interface ReviewBase {
  brick_id: number;
  reviewed_at?: string;
  is_answer_revealed?: boolean;
  learner_target_text?: string | null;
  learner_target_audio_path?: string | null;
}

export interface SentenceCompareRequest {
  sentence1: string;
  sentence2: string;
  review_base?: ReviewBase | null;
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
      review_base: params.review_base ?? null,
    },
  });
}
