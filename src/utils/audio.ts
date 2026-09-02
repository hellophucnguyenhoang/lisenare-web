import { resolveAudioUrl } from "@/api/endpoints";

/**
 * Instantiates and plays a short audio clip from a relative path or direct URL.
 * Handles browser autoplay promise rejections gracefully.
 */
export const playShortAudio = (
  relativePath: string | null | undefined,
): void => {
  if (!relativePath) return;

  const fullUrl =
    relativePath.startsWith("blob:") ||
    relativePath.startsWith("http://") ||
    relativePath.startsWith("https://")
      ? relativePath
      : resolveAudioUrl(relativePath);

  const audio = new Audio(fullUrl);

  audio.play().catch((error) => {
    console.error("Audio playback failed:", error);
  });
};
