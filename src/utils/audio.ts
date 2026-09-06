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

/**
 * Cross-browser helper to obtain an audio MediaStream.
 * Handles modern navigator.mediaDevices as well as legacy vendor-prefixed getUserMedia.
 */
export async function getAudioMediaStream(): Promise<MediaStream> {
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    return navigator.mediaDevices.getUserMedia({ audio: true });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nav = navigator as any;
  const legacyGetUserMedia =
    nav.getUserMedia ||
    nav.webkitGetUserMedia ||
    nav.mozGetUserMedia ||
    nav.msGetUserMedia;

  if (legacyGetUserMedia) {
    return new Promise((resolve, reject) => {
      legacyGetUserMedia.call(navigator, { audio: true }, resolve, reject);
    });
  }

  if (typeof window !== "undefined" && window.isSecureContext === false) {
    throw new Error(
      "Microphone access requires a secure context (HTTPS or localhost).",
    );
  }

  throw new Error("Microphone is not supported in this browser.");
}

/**
 * Determines the best supported audio MIME type for MediaRecorder.
 */
export function getSupportedAudioMimeType(): string {
  if (typeof MediaRecorder === "undefined") return "";
  const candidateTypes = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
    "audio/aac",
  ];
  for (const type of candidateTypes) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }
  return "";
}

/**
 * Creates a MediaRecorder instance configured with supported MIME types.
 */
export function createMediaRecorder(stream: MediaStream): MediaRecorder {
  const mimeType = getSupportedAudioMimeType();
  if (mimeType) {
    try {
      return new MediaRecorder(stream, { mimeType });
    } catch {
      return new MediaRecorder(stream);
    }
  }
  return new MediaRecorder(stream);
}
