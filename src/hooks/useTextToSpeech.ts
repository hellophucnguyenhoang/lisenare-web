import { useMutation } from "@tanstack/react-query";
import { textToSpeech } from "@/api/text";
import { type TargetLang } from "@/types";

export interface GenerateAudioParams {
  text: string;
  targetLang: TargetLang;
}

export interface GeneratedAudioResult {
  audioPath: string;
  blob: Blob;
}

/**
 * Hook to request text-to-speech from backend and fetch the resulting audio file as a Blob.
 * Selects the Kokoro voice corresponding to the target language:
 * - 'en': 'af_heart'
 * - 'ja': 'jf_alpha'
 */
export function useTextToSpeech() {
  return useMutation<GeneratedAudioResult, Error, GenerateAudioParams>({
    mutationFn: async ({ text, targetLang }: GenerateAudioParams) => {
      const voice = targetLang === "ja" ? "jf_alpha" : "af_heart";
      const audioPath = await textToSpeech({
        text,
        voice,
      });

      const res = await fetch(audioPath);
      if (!res.ok) {
        throw new Error(`Failed to download generated audio from ${audioPath}`);
      }

      const blob = await res.blob();
      return { audioPath, blob };
    },
  });
}
