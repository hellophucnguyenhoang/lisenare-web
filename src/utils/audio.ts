import { getBrickAudioUrl } from "@/api/bricks";

// Global reference to the currently playing audio element
let activeAudio: HTMLAudioElement | null = null;

/**
 * Immediately stops and cleans up any currently playing audio clip.
 */
export const stopShortAudio = (): void => {
  if (activeAudio) {
    try {
      activeAudio.pause();
      activeAudio.currentTime = 0;
      activeAudio.src = "";
    } catch {
      // Ignore pause errors
    }
    activeAudio = null;
  }
};

/**
 * Instantiates and plays a short audio clip from a direct URL, blob URL, or brick ID.
 * Automatically stops and cancels any previously playing audio to prevent audio overlap.
 */
export const playShortAudio = (
  audioUrlOrBrickId: string | number | null | undefined,
  startTimeSec?: number,
  onEnded?: () => void,
): void => {
  if (audioUrlOrBrickId === null || audioUrlOrBrickId === undefined) return;

  if (typeof audioUrlOrBrickId === "number") {
    void playBrickAudio(audioUrlOrBrickId, startTimeSec);
    return;
  }

  // Stop any previously playing audio instance immediately
  stopShortAudio();

  const audio = new Audio(audioUrlOrBrickId);
  activeAudio = audio;

  const startPlayback = () => {
    // If another audio was triggered before this one started, abort
    if (activeAudio !== audio) return;

    if (typeof startTimeSec === "number" && startTimeSec >= 0) {
      try {
        audio.currentTime = startTimeSec;
      } catch (e) {
        console.warn("Could not set audio currentTime:", e);
      }
    }

    audio.play().catch((error) => {
      // Don't log abort errors if user intentionally cancelled by playing another audio
      if (error?.name !== "AbortError") {
        console.error("Audio playback failed:", error);
      }
      onEnded?.();
    });
  };

  audio.onended = () => {
    if (activeAudio === audio) {
      activeAudio = null;
    }
    onEnded?.();
  };

  if (typeof startTimeSec === "number" && startTimeSec > 0) {
    if (audio.readyState >= 1) {
      startPlayback();
    } else {
      audio.addEventListener("loadedmetadata", startPlayback, { once: true });
      audio.load();
    }
  } else {
    startPlayback();
  }
};

/**
 * Retrieves the complete audio URL for a brick using its ID and plays it.
 * Calls GET /api/bricks/{brick_id}/audio under the hood.
 */
export const playBrickAudio = async (
  brickId: number | null | undefined,
  startTimeSec?: number,
): Promise<void> => {
  if (brickId === null || brickId === undefined) return;
  try {
    const url = await getBrickAudioUrl(brickId);
    if (url) {
      playShortAudio(url, startTimeSec);
    }
  } catch (error) {
    console.error(`Failed to play audio for brick ${brickId}:`, error);
  }
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
