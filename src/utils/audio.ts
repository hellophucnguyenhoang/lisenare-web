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
    void playBrickAudio(audioUrlOrBrickId, startTimeSec, onEnded);
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
  onEnded?: () => void,
): Promise<void> => {
  if (brickId === null || brickId === undefined) {
    onEnded?.();
    return;
  }
  try {
    const url = await getBrickAudioUrl(brickId);
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
 * Obtains an audio MediaStream with automatic gain control, hardware noise suppression,
 * and a software gain booster with dynamic range compression to match standard TTS/studio loudness.
 */
export async function getAudioMediaStream(): Promise<MediaStream> {
  if (typeof window !== "undefined" && window.isSecureContext === false) {
    throw new Error(
      "Microphone access requires a secure context (HTTPS or localhost).",
    );
  }

  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error("Microphone is not supported in this browser.");
  }

  const rawStream = await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    },
  });

  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return rawStream;

    const ctx = new AudioCtx();
    if (ctx.state === "suspended") {
      await ctx.resume();
    }

    const source = ctx.createMediaStreamSource(rawStream);

    // 1. Boost microphone gain (3.2x / +10 dB) to match mastered TTS broadcast volume
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(3.2, ctx.currentTime);

    // 2. Dynamics compressor to transparently tame peaks and prevent clipping
    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-14, ctx.currentTime);
    compressor.knee.setValueAtTime(12, ctx.currentTime);
    compressor.ratio.setValueAtTime(5, ctx.currentTime);
    compressor.attack.setValueAtTime(0.003, ctx.currentTime);
    compressor.release.setValueAtTime(0.08, ctx.currentTime);

    // 3. Output destination stream for MediaRecorder
    const destination = ctx.createMediaStreamDestination();

    source.connect(gainNode);
    gainNode.connect(compressor);
    compressor.connect(destination);

    const boostedStream = destination.stream;

    // Ensure stopping the boosted stream's tracks terminates hardware mic capture and frees AudioContext
    boostedStream.getAudioTracks().forEach((boostedTrack) => {
      const origStop = boostedTrack.stop.bind(boostedTrack);
      boostedTrack.stop = () => {
        origStop();
        rawStream.getTracks().forEach((t) => t.stop());
        void ctx.close();
      };
    });

    return boostedStream;
  } catch (err) {
    console.warn("Could not apply audio boost pipeline, using raw stream:", err);
    return rawStream;
  }
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
 * Creates a MediaRecorder instance configured with supported MIME types and high-quality speech bitrate.
 */
export function createMediaRecorder(stream: MediaStream): MediaRecorder {
  const mimeType = getSupportedAudioMimeType();
  const options: MediaRecorderOptions = {
    audioBitsPerSecond: 128000,
    ...(mimeType ? { mimeType } : {}),
  };

  try {
    return new MediaRecorder(stream, options);
  } catch {
    return new MediaRecorder(stream);
  }
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

