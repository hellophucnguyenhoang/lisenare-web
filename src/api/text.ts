import { request } from "./client";

export interface TTSRequest {
  text: string;
  voice?: string;
}

/**
 * Calls POST /text/to-speech to convert text to speech, save audio locally on server,
 * and return the relative path to the generated audio file.
 */
export async function textToSpeech(params: TTSRequest): Promise<string> {
  return request<string>("/text/to-speech", {
    method: "POST",
    body: params as unknown as Record<string, unknown>,
  });
}
