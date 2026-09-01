import { resolveAudioUrl } from "@/api/endpoints";

/**
 * Instantiates and plays a short audio clip from a relative path.
 * Handles browser autoplay promise rejections gracefully.
 */
export const playShortAudio = (relativePath: string | null): void => {
  if (!relativePath) return;

  const fullUrl = resolveAudioUrl(relativePath);
  const audio = new Audio(fullUrl);

  audio.play().catch((error) => {
    console.error("Audio playback failed:", error);
  });
};
