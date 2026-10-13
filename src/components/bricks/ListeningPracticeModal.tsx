import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  X,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  SkipBack,
  Headphones,
  Shuffle,
  Repeat,
  Volume2,
  CheckCircle2,
} from "lucide-react";
import { useInfiniteListeningBricks } from "@/hooks/useBricks";
import { type BrickListeningData } from "@/api/bricks";
import { resolveAudioUrl } from "@/utils/audio";

export type ListeningPlaybackMode = "auto" | "manual";

interface ListeningPracticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  collectionId?: number | null;
  collectionName?: string | null;
}

const PLAYBACK_SPEEDS = [0.8, 1.0, 1.2] as const;

/**
 * Modern Fisher-Yates array shuffle
 */
function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export default function ListeningPracticeModal({
  isOpen,
  onClose,
  collectionId,
  collectionName,
}: ListeningPracticeModalProps) {
  const [playbackMode, setPlaybackMode] =
    useState<ListeningPlaybackMode>("auto");

  // Persistent user preferences
  const [shuffleEnabled, setShuffleEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem("listening_shuffle") === "true";
    } catch {
      return false;
    }
  });

  const [autoPlayAgain, setAutoPlayAgain] = useState<boolean>(() => {
    try {
      return localStorage.getItem("listening_auto_play_again") === "true";
    } catch {
      return false;
    }
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [order, setOrder] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isFinishedSession, setIsFinishedSession] = useState(false);
  const [hasUserStarted, setHasUserStarted] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const autoAdvanceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  // Fetch listening bricks with infinite pagination under the hood
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteListeningBricks(
    {
      collection_ids: collectionId ? [collectionId] : undefined,
      limit: 15,
      shuffle_page: shuffleEnabled,
    },
    isOpen,
  );

  // Flatten raw items across all loaded pages
  const rawItems: BrickListeningData[] = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data],
  );

  const totalCount = data?.pages[0]?.total ?? rawItems.length;

  // Synchronize playback order indices with rawItems
  useEffect(() => {
    if (rawItems.length === 0) {
      setOrder([]);
      return;
    }

    setOrder((prevOrder) => {
      // First load or query reset
      if (prevOrder.length === 0) {
        const indices = Array.from({ length: rawItems.length }, (_, i) => i);
        return shuffleEnabled ? shuffleArray(indices) : indices;
      }

      // Appending newly fetched pages from infinite query
      if (rawItems.length > prevOrder.length) {
        const addedIndices = Array.from(
          { length: rawItems.length - prevOrder.length },
          (_, i) => prevOrder.length + i,
        );

        if (shuffleEnabled) {
          return [...prevOrder, ...shuffleArray(addedIndices)];
        }
        return [...prevOrder, ...addedIndices];
      }

      // If items shrank (e.g. filter changed)
      if (rawItems.length < prevOrder.length) {
        const valid = prevOrder.filter((i) => i < rawItems.length);
        return valid.length === rawItems.length
          ? valid
          : Array.from({ length: rawItems.length }, (_, i) => i);
      }

      return prevOrder;
    });
  }, [rawItems.length, shuffleEnabled]);

  // Current active brick determined by order mapping
  const currentBrick = useMemo(() => {
    if (order.length === 0 || rawItems.length === 0) return undefined;
    const rawIdx = order[currentIndex];
    return rawIdx !== undefined ? rawItems[rawIdx] : undefined;
  }, [order, currentIndex, rawItems]);

  // Initialize and clean up audio element
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = "";
      audioRef.current = null;
      if (autoAdvanceTimeoutRef.current) {
        clearTimeout(autoAdvanceTimeoutRef.current);
      }
    };
  }, []);

  // Reset state when opening modal
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
      setIsPlaying(false);
      setIsFinishedSession(false);
      setHasUserStarted(false);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
      if (autoAdvanceTimeoutRef.current) {
        clearTimeout(autoAdvanceTimeoutRef.current);
      }
      setIsPlaying(false);
    }
  }, [isOpen]);

  // Stop auto-advance timer helper
  const clearAutoAdvanceTimer = useCallback(() => {
    if (autoAdvanceTimeoutRef.current) {
      clearTimeout(autoAdvanceTimeoutRef.current);
      autoAdvanceTimeoutRef.current = null;
    }
  }, []);

  // Background prefetch next page when approaching end of loaded items
  useEffect(() => {
    if (
      isOpen &&
      hasNextPage &&
      !isFetchingNextPage &&
      rawItems.length > 0 &&
      currentIndex >= order.length - 3
    ) {
      void fetchNextPage();
    }
  }, [
    isOpen,
    currentIndex,
    order.length,
    rawItems.length,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  ]);

  // Play audio for a specific brick
  const playAudioForBrick = useCallback(
    (brick: BrickListeningData | undefined) => {
      clearAutoAdvanceTimer();
      if (!audioRef.current || !brick?.audio_path) return;

      const audio = audioRef.current;
      const resolvedUrl = resolveAudioUrl(brick.audio_path);

      if (audio.src !== resolvedUrl) {
        audio.src = resolvedUrl;
      }
      audio.playbackRate = playbackSpeed;

      audio
        .play()
        .then(() => {
          setIsPlaying(true);
          setHasUserStarted(true);
        })
        .catch((err) => {
          if (err?.name !== "AbortError") {
            console.warn("Audio play rejected:", err);
          }
          setIsPlaying(false);
        });
    },
    [clearAutoAdvanceTimer, playbackSpeed],
  );

  // Restart / Loop the session automatically
  const loopSession = useCallback(() => {
    clearAutoAdvanceTimer();
    setIsFinishedSession(false);
    setHasUserStarted(true);

    if (rawItems.length === 0) return;

    if (shuffleEnabled && rawItems.length > 1) {
      // Unpredictable new order for this loop cycle
      const lastRawIdx = order[currentIndex];
      let newOrder = shuffleArray(
        Array.from({ length: rawItems.length }, (_, i) => i),
      );

      // Ensure the first brick in the new loop is not the exact same brick just finished
      if (newOrder[0] === lastRawIdx && newOrder.length > 1) {
        const swapIdx = Math.floor(Math.random() * (newOrder.length - 1)) + 1;
        [newOrder[0], newOrder[swapIdx]] = [newOrder[swapIdx], newOrder[0]];
      }

      setOrder(newOrder);
      if (currentIndex === 0) {
        playAudioForBrick(rawItems[newOrder[0]]);
      } else {
        setCurrentIndex(0);
      }
    } else {
      // Sequential loop (same original order)
      const sequentialOrder = Array.from(
        { length: rawItems.length },
        (_, i) => i,
      );
      setOrder(sequentialOrder);
      if (currentIndex === 0) {
        playAudioForBrick(rawItems[sequentialOrder[0]]);
      } else {
        setCurrentIndex(0);
      }
    }
  }, [
    clearAutoAdvanceTimer,
    shuffleEnabled,
    rawItems,
    order,
    currentIndex,
    playAudioForBrick,
  ]);

  // Move to next brick
  const handleNext = useCallback(() => {
    clearAutoAdvanceTimer();

    if (currentIndex < order.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setHasUserStarted(true);
    } else if (hasNextPage && !isFetchingNextPage) {
      // More items are available on backend: fetch and advance
      void fetchNextPage().then((res) => {
        const pages = res.data?.pages ?? [];
        const allLoaded = pages.flatMap((p) => p.items);
        if (allLoaded.length > rawItems.length) {
          setCurrentIndex((prev) => prev + 1);
          setHasUserStarted(true);
        } else if (autoPlayAgain && rawItems.length > 0) {
          loopSession();
        } else {
          setIsPlaying(false);
          setIsFinishedSession(true);
        }
      });
    } else {
      // Reached the end of all available bricks
      if (autoPlayAgain && rawItems.length > 0) {
        loopSession();
      } else {
        setIsPlaying(false);
        setIsFinishedSession(true);
        if (audioRef.current) {
          audioRef.current.pause();
        }
      }
    }
  }, [
    clearAutoAdvanceTimer,
    currentIndex,
    order.length,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    rawItems.length,
    autoPlayAgain,
    loopSession,
  ]);

  // Move to previous brick
  const handlePrevious = useCallback(() => {
    clearAutoAdvanceTimer();
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setIsFinishedSession(false);
      setHasUserStarted(true);
    }
  }, [clearAutoAdvanceTimer, currentIndex]);

  // Pause playback
  const handlePause = useCallback(() => {
    clearAutoAdvanceTimer();
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
  }, [clearAutoAdvanceTimer]);

  // Toggle play/pause
  const handleTogglePlay = useCallback(() => {
    if (isPlaying) {
      handlePause();
    } else {
      if (isFinishedSession) {
        loopSession();
      } else if (currentBrick) {
        playAudioForBrick(currentBrick);
      }
    }
  }, [isPlaying, isFinishedSession, handlePause, loopSession, currentBrick, playAudioForBrick]);

  // Replay current brick from start
  const handleReplay = useCallback(() => {
    clearAutoAdvanceTimer();
    if (!audioRef.current || !currentBrick) return;
    audioRef.current.currentTime = 0;
    audioRef.current.playbackRate = playbackSpeed;
    audioRef.current
      .play()
      .then(() => setIsPlaying(true))
      .catch(() => setIsPlaying(false));
  }, [clearAutoAdvanceTimer, currentBrick, playbackSpeed]);

  // Toggle Shuffle with seamless order transition
  const handleToggleShuffle = useCallback(() => {
    setShuffleEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("listening_shuffle", String(next));
      } catch {
        // Ignore storage errors
      }

      if (rawItems.length > 0) {
        const currentRawIdx = order[currentIndex] ?? 0;

        if (next) {
          // Shuffle ON: keep current brick at index 0, randomize upcoming items
          const remaining = Array.from(
            { length: rawItems.length },
            (_, i) => i,
          ).filter((i) => i !== currentRawIdx);
          setOrder([currentRawIdx, ...shuffleArray(remaining)]);
          setCurrentIndex(0);
        } else {
          // Shuffle OFF: restore original sequential order, keep current brick active
          const sequential = Array.from(
            { length: rawItems.length },
            (_, i) => i,
          );
          setOrder(sequential);
          setCurrentIndex(currentRawIdx);
        }
      }

      return next;
    });
  }, [rawItems.length, order, currentIndex]);

  // Toggle Auto Play Again preference
  const handleToggleAutoPlayAgain = useCallback(() => {
    setAutoPlayAgain((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("listening_auto_play_again", String(next));
      } catch {
        // Ignore storage errors
      }
      return next;
    });
  }, []);

  // Listen to audio element ended and error events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      setIsPlaying(false);

      if (playbackMode === "auto") {
        // Smooth breathing interval before auto-advancing to the next brick
        autoAdvanceTimeoutRef.current = setTimeout(() => {
          handleNext();
        }, 850);
      }
    };

    const handleError = () => {
      setIsPlaying(false);
    };

    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };
  }, [playbackMode, handleNext]);

  // Trigger audio playback whenever current brick updates
  useEffect(() => {
    if (!isOpen || !currentBrick || isFinishedSession) return;

    if (hasUserStarted || playbackMode === "auto") {
      playAudioForBrick(currentBrick);
    }
  }, [
    isOpen,
    currentBrick,
    playAudioForBrick,
    hasUserStarted,
    playbackMode,
    isFinishedSession,
  ]);

  // Keep audio playbackRate in sync
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  // Global keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.code === "Space") {
        e.preventDefault();
        handleTogglePlay();
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        handleNext();
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        handlePrevious();
      } else if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        handleReplay();
      } else if (e.key === "s" || e.key === "S") {
        e.preventDefault();
        handleToggleShuffle();
      } else if (e.code === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isOpen,
    handleTogglePlay,
    handleNext,
    handlePrevious,
    handleReplay,
    handleToggleShuffle,
    onClose,
  ]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Listen Bricks Modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-surface-container-lowest border border-outline-variant/60 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-5 py-4 border-b border-outline-variant/30 flex items-center justify-between gap-3 bg-surface-container-low/40">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-on-surface truncate flex items-center gap-1.5">
                <span>Listen Bricks</span>
                {collectionName && (
                  <span className="text-outline font-normal text-xs truncate">
                    • {collectionName}
                  </span>
                )}
              </h2>
              <p className="text-[11px] text-outline truncate">
                {rawItems.length > 0
                  ? `Brick ${currentIndex + 1} of ${totalCount}`
                  : "Continuous listening practice"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Auto play again (repeat/loop) toggle */}
            <button
              type="button"
              onClick={handleToggleAutoPlayAgain}
              className={`p-2 rounded-xl text-xs transition-colors cursor-pointer ${
                autoPlayAgain
                  ? "bg-primary/15 text-primary font-bold shadow-2xs"
                  : "text-outline hover:text-on-surface hover:bg-surface-container"
              }`}
              title={
                autoPlayAgain
                  ? shuffleEnabled
                    ? "Auto play again enabled (loops in shuffled order)"
                    : "Auto play again enabled (loops in order)"
                  : "Auto play again disabled"
              }
              aria-label="Toggle auto play again"
            >
              <Repeat className="w-4 h-4" />
            </button>

            {/* Shuffle toggle */}
            <button
              type="button"
              onClick={handleToggleShuffle}
              className={`p-2 rounded-xl text-xs transition-colors cursor-pointer ${
                shuffleEnabled
                  ? "bg-primary/15 text-primary font-bold shadow-2xs"
                  : "text-outline hover:text-on-surface hover:bg-surface-container"
              }`}
              title={
                shuffleEnabled
                  ? "Shuffle enabled (unpredictable order)"
                  : "Shuffle disabled (sequential order)"
              }
              aria-label="Toggle shuffle"
            >
              <Shuffle className="w-4 h-4" />
            </button>

            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-outline hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Playback Mode Switcher Toggle */}
        <div className="px-5 pt-3.5 pb-2 flex items-center justify-between gap-2 border-b border-outline-variant/20 bg-surface-container-lowest">
          <span className="text-[11px] font-semibold text-outline uppercase tracking-wider">
            Mode
          </span>
          <div className="inline-flex p-0.5 rounded-xl bg-surface-container border border-outline-variant/40">
            <button
              type="button"
              onClick={() => {
                setPlaybackMode("auto");
                clearAutoAdvanceTimer();
              }}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                playbackMode === "auto"
                  ? "bg-surface-container-lowest text-primary shadow-xs"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Auto-Play
            </button>
            <button
              type="button"
              onClick={() => {
                setPlaybackMode("manual");
                clearAutoAdvanceTimer();
              }}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                playbackMode === "manual"
                  ? "bg-surface-container-lowest text-primary shadow-xs"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Manual Step
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-surface-container-high h-1 overflow-hidden">
          <div
            className="bg-primary h-full transition-all duration-300 ease-out"
            style={{
              width: `${
                totalCount > 0
                  ? Math.min(100, ((currentIndex + 1) / totalCount) * 100)
                  : 0
              }%`,
            }}
          />
        </div>

        {/* Main Content Area */}
        <div className="p-6 sm:p-8 flex-1 overflow-y-auto flex flex-col justify-center items-center text-center">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-outline">Loading audio bricks...</p>
            </div>
          ) : isError ? (
            <div className="py-12 flex flex-col items-center gap-3">
              <p className="text-sm text-error font-medium">
                Failed to load listening bricks.
              </p>
              <button
                type="button"
                onClick={() => void refetch()}
                className="px-4 py-2 bg-primary text-on-primary text-xs font-bold rounded-xl"
              >
                Try Again
              </button>
            </div>
          ) : rawItems.length === 0 ? (
            <div className="py-12 flex flex-col items-center gap-3">
              <p className="text-sm font-bold text-on-surface">
                No bricks found to listen to.
              </p>
              <p className="text-xs text-outline max-w-xs">
                Add bricks to your collection first to start listening practice.
              </p>
            </div>
          ) : isFinishedSession ? (
            <div className="py-10 flex flex-col items-center gap-3 animate-in zoom-in-95 duration-200">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-1">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold font-display text-on-surface">
                All Done!
              </h3>
              <p className="text-xs text-outline max-w-xs">
                You have listened through all {totalCount} bricks in this
                session.
              </p>
              <div className="flex gap-2.5 mt-4">
                <button
                  type="button"
                  onClick={loopSession}
                  className="px-5 py-2.5 bg-primary text-on-primary font-bold text-xs rounded-xl shadow-sm hover:bg-primary/95 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Listen Again</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 bg-surface-container border border-outline-variant/60 text-on-surface font-semibold text-xs rounded-xl hover:bg-surface-container-high active:scale-95 transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full space-y-6 animate-in fade-in duration-150">
              {/* Sound wave visualizer pill */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container text-xs font-semibold text-on-surface-variant">
                {isPlaying ? (
                  <>
                    <span className="flex items-center gap-0.5 h-3">
                      <span className="w-1 bg-primary rounded-full animate-bounce h-2" />
                      <span
                        className="w-1 bg-primary rounded-full animate-bounce h-3"
                        style={{ animationDelay: "150ms" }}
                      />
                      <span
                        className="w-1 bg-primary rounded-full animate-bounce h-2"
                        style={{ animationDelay: "300ms" }}
                      />
                    </span>
                    <span className="text-primary font-bold text-[11px]">
                      Playing...
                    </span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-outline" />
                    <span className="text-outline text-[11px]">
                      {playbackMode === "auto" ? "Ready" : "Paused"}
                    </span>
                  </>
                )}
              </div>

              {/* Target Text (Simultaneously displayed) */}
              <div className="space-y-3">
                <h3 className="text-2xl sm:text-3xl font-extrabold font-display text-on-surface leading-tight tracking-tight select-text">
                  {currentBrick?.target_text}
                </h3>

                {/* Native Text (Simultaneously displayed) */}
                <p className="text-base sm:text-lg font-medium text-on-surface-variant italic leading-relaxed select-text">
                  {currentBrick?.native_text}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Control Bar */}
        {!isLoading && !isError && rawItems.length > 0 && !isFinishedSession && (
          <div className="p-4 sm:p-5 border-t border-outline-variant/30 bg-surface-container-low/40 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              {/* Speed selector */}
              <div className="flex items-center gap-1">
                {PLAYBACK_SPEEDS.map((speed) => (
                  <button
                    key={speed}
                    type="button"
                    onClick={() => setPlaybackSpeed(speed)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                      playbackSpeed === speed
                        ? "bg-primary text-on-primary shadow-2xs"
                        : "text-outline hover:text-on-surface bg-surface-container"
                    }`}
                    title={`Playback speed ${speed}x`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>

              {/* Main Player Transport Buttons */}
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Previous Brick */}
                <button
                  type="button"
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                  className="p-2.5 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                  title="Previous brick (Left Arrow)"
                  aria-label="Previous brick"
                >
                  <SkipBack className="w-5 h-5" />
                </button>

                {/* Play / Pause Toggle */}
                <button
                  type="button"
                  onClick={handleTogglePlay}
                  className="w-13 h-13 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-md hover:bg-primary/95 active:scale-95 transition-all cursor-pointer"
                  title={
                    isPlaying ? "Pause (Space)" : "Play audio (Space)"
                  }
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6 fill-current" />
                  ) : (
                    <Play className="w-6 h-6 fill-current ml-0.5" />
                  )}
                </button>

                {/* Next Brick */}
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={
                    !autoPlayAgain &&
                    !hasNextPage &&
                    currentIndex >= order.length - 1
                  }
                  className="p-2.5 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                  title="Next brick (Right Arrow)"
                  aria-label="Next brick"
                >
                  <SkipForward className="w-5 h-5" />
                </button>
              </div>

              {/* Replay current brick button */}
              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={handleReplay}
                  className="p-2.5 rounded-xl text-outline hover:text-primary hover:bg-surface-container active:scale-95 transition-all cursor-pointer"
                  title="Replay current audio (R)"
                  aria-label="Replay current audio"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Hint bar */}
            <div className="text-[10px] text-outline/80 text-center select-none hidden sm:block">
              {playbackMode === "auto"
                ? "Auto-advancing upon audio completion • Space to pause • S to shuffle"
                : "Manual mode • Press Next or Right Arrow to advance • Space to play"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
