import { getBrickAudioUrl } from "@/api/bricks";

// Global reference to the currently playing audio element and its source URL
let activeAudio: HTMLAudioElement | null = null;
let activeAudioUrl: string | null = null;
const brickAudioUrlCache = new Map<number, string>();

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
    activeAudioUrl = null;
  }
};

/**
 * Instantiates and plays a short audio clip from a direct URL, blob URL, or brick ID.
 * Automatically stops and cancels any previously playing audio to prevent audio overlap.
 * Fully supports seeking to a specific start time across desktop and mobile web browsers.
 */
export const playShortAudio = (
  audioUrlOrBrickId: string | number | null | undefined,
  startTimeSec?: number,
  onEnded?: () => void,
): void => {
  if (audioUrlOrBrickId === null || audioUrlOrBrickId === undefined) return;

  if (typeof audioUrlOrBrickId === "number") {
    void playBrickAudio(audioUrlOrBrickId, startTimeSec, onEnded);
    return;
  }

  const resolvedUrl = resolveAudioUrl(String(audioUrlOrBrickId));
  const hasSeekTime = typeof startTimeSec === "number" && startTimeSec > 0;
  const targetSeek = hasSeekTime ? (startTimeSec as number) : 0;

  let audio = activeAudio;
  const isSameAudio =
    audio &&
    activeAudioUrl === resolvedUrl &&
    audio.src &&
    !audio.error;

  if (!isSameAudio) {
    stopShortAudio();
    audio = new Audio(resolvedUrl);
    audio.preload = "auto";
    activeAudio = audio;
    activeAudioUrl = resolvedUrl;
  } else if (audio) {
    try {
      audio.pause();
    } catch {
      // ignore
    }
  }

  if (!audio) return;

  const currentAudio = audio;

  const applySeek = () => {
    if (activeAudio !== currentAudio) return;
    if (hasSeekTime) {
      try {
        if (Math.abs(currentAudio.currentTime - targetSeek) > 0.08) {
          currentAudio.currentTime = targetSeek;
        }
      } catch (e) {
        console.warn("Could not set audio currentTime:", e);
      }
    }
  };

  const handleEnded = () => {
    if (activeAudio === currentAudio) {
      activeAudio = null;
      activeAudioUrl = null;
    }
    onEnded?.();
  };

  currentAudio.onended = handleEnded;

  const startPlayback = () => {
    if (activeAudio !== currentAudio) return;

    applySeek();

    const playPromise = currentAudio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          if (activeAudio !== currentAudio) return;
          // In mobile Safari / WebKit, setting currentTime before or right as play() starts
          // often gets reset back to 0. Re-apply seek once the play pipeline is active.
          if (
            hasSeekTime &&
            Math.abs(currentAudio.currentTime - targetSeek) > 0.15
          ) {
            applySeek();
          }
        })
        .catch((error) => {
          if (error?.name !== "AbortError") {
            console.error("Audio playback failed:", error);
          }
          handleEnded();
        });
    }

    if (hasSeekTime) {
      // Fallback listeners for mobile browsers where playback starts at 0 before seeking
      const ensureSeekOnPlay = () => {
        if (activeAudio !== currentAudio) return;
        if (
          Math.abs(currentAudio.currentTime - targetSeek) > 0.15 &&
          currentAudio.currentTime < targetSeek
        ) {
          applySeek();
        }
      };

      currentAudio.addEventListener("playing", ensureSeekOnPlay, { once: true });
      currentAudio.addEventListener("timeupdate", ensureSeekOnPlay, {
        once: true,
      });

      setTimeout(ensureSeekOnPlay, 60);
      setTimeout(ensureSeekOnPlay, 180);
    }
  };

  if (hasSeekTime) {
    if (currentAudio.readyState >= 1) {
      startPlayback();
    } else {
      const onReady = () => {
        currentAudio.removeEventListener("loadedmetadata", onReady);
        currentAudio.removeEventListener("canplay", onReady);
        startPlayback();
      };
      currentAudio.addEventListener("loadedmetadata", onReady, { once: true });
      currentAudio.addEventListener("canplay", onReady, { once: true });
      currentAudio.load();
    }
  } else {
    try {
      currentAudio.currentTime = 0;
    } catch {
      // ignore
    }
    startPlayback();
  }
};

/**
 * Retrieves the complete audio URL for a brick using its ID and plays it.
 * Calls GET /api/bricks/{brick_id}/audio under the hood with in-memory caching.
 */
export const playBrickAudio = async (
  brickId: number | null | undefined,
  startTimeSec?: number,
  onEnded?: () => void,
): Promise<void> => {
  if (brickId === null || brickId === undefined) {
    onEnded?.();
    return;
  }
  try {
    let url = brickAudioUrlCache.get(brickId);
    if (!url) {
      url = await getBrickAudioUrl(brickId);
      if (url) {
        brickAudioUrlCache.set(brickId, url);
      }
    }
    if (url) {
      playShortAudio(url, startTimeSec, onEnded);
    } else {
      onEnded?.();
    }
  } catch (error) {
    console.error(`Failed to play audio for brick ${brickId}:`, error);
    onEnded?.();
  }
};

/**
 * Cross-browser helper to obtain an audio MediaStream from the microphone.
 */
export async function getAudioMediaStream(): Promise<MediaStream> {
  if (typeof window !== "undefined" && window.isSecureContext === false) {
    throw new Error(
      "Microphone access requires a secure context (HTTPS or localhost).",
    );
  }

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

/**
 * Ensures an audio path or URL is properly formatted for browser playback.
 */
export function resolveAudioUrl(audioPath: string | null | undefined): string {
  if (!audioPath) return "";
  if (
    audioPath.startsWith("http://") ||
    audioPath.startsWith("https://") ||
    audioPath.startsWith("blob:") ||
    audioPath.startsWith("data:")
  ) {
    return audioPath;
  }
  if (audioPath.startsWith("/")) {
    return audioPath;
  }
  return `/${audioPath}`;
}

