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
  Eye,
  EyeOff,
} from "lucide-react";
import { useInfiniteListeningBricks } from "@/hooks/useBricks";
import { type BrickListeningData } from "@/api/bricks";
import { resolveAudioUrl } from "@/utils/audio";

export type ListeningPlaybackMode = "auto" | "manual";

interface ListeningRetrievalModalProps {
  isOpen: boolean;
  onClose: () => void;
  islandId?: number | null;
  islandName?: string | null;
}

const PLAYBACK_SPEEDS = [0.8, 1.0, 1.2] as const;

function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

const getStorageBool = (key: string) => {
  try {
    return localStorage.getItem(key) === "true";
  } catch {
    return false;
  }
};

const setStorageBool = (key: string, val: boolean) => {
  try {
    localStorage.setItem(key, String(val));
  } catch {}
};

export default function ListeningRetrievalModal({
  isOpen,
  onClose,
  islandId,
  islandName,
}: ListeningRetrievalModalProps) {
  const [playbackMode, setPlaybackMode] =
    useState<ListeningPlaybackMode>("auto");
  const [shuffleEnabled, setShuffleEnabled] = useState(() =>
    getStorageBool("listening_shuffle"),
  );
  const [autoPlayAgain, setAutoPlayAgain] = useState(() =>
    getStorageBool("listening_auto_play_again"),
  );
  const [isRevealed, setIsRevealed] = useState(() => {
    try {
      const stored = localStorage.getItem("listening_show_answer");
      return stored !== null ? stored === "true" : true;
    } catch {
      return true;
    }
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [order, setOrder] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isFinishedSession, setIsFinishedSession] = useState(false);
  const [hasUserStarted, setHasUserStarted] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      island_ids: islandId ? [islandId] : undefined,
      limit: 15,
      shuffle_page: shuffleEnabled,
    },
    isOpen,
  );

  const rawItems: BrickListeningData[] = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data],
  );
  const totalCount = data?.pages[0]?.total ?? rawItems.length;

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  // Keep order synchronized with loaded rawItems
  useEffect(() => {
    if (rawItems.length === 0) {
      setOrder([]);
      return;
    }
    setOrder((prev) => {
      if (prev.length === 0) {
        const idxs = Array.from({ length: rawItems.length }, (_, i) => i);
        return shuffleEnabled ? shuffle(idxs) : idxs;
      }
      if (rawItems.length > prev.length) {
        const added = Array.from(
          { length: rawItems.length - prev.length },
          (_, i) => prev.length + i,
        );
        return [...prev, ...(shuffleEnabled ? shuffle(added) : added)];
      }
      return prev.filter((i) => i < rawItems.length);
    });
  }, [rawItems.length, shuffleEnabled]);

  const currentBrick = useMemo(
    () =>
      order.length > 0 && order[currentIndex] !== undefined
        ? rawItems[order[currentIndex]]
        : undefined,
    [order, currentIndex, rawItems],
  );

  // Audio setup and cleanup
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;
    return () => {
      audio.pause();
      audio.src = "";
      audioRef.current = null;
      clearTimer();
    };
  }, []);

  // Modal open/close reset
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
      setIsPlaying(false);
      setIsFinishedSession(false);
      setHasUserStarted(false);
    } else {
      audioRef.current?.pause();
      if (audioRef.current) audioRef.current.src = "";
      clearTimer();
      setIsPlaying(false);
    }
  }, [isOpen]);

  // Audio play helper
  const playAudio = useCallback(
    (brick?: BrickListeningData) => {
      clearTimer();
      if (!audioRef.current || !brick?.audio_path) return;
      const audio = audioRef.current;
      const url = resolveAudioUrl(brick.audio_path);
      if (audio.src !== url) audio.src = url;
      audio.playbackRate = playbackSpeed;
      audio
        .play()
        .then(() => {
          setIsPlaying(true);
          setHasUserStarted(true);
        })
        .catch(() => setIsPlaying(false));
    },
    [playbackSpeed],
  );

  // Loop session
  const loopSession = useCallback(() => {
    clearTimer();
    setIsFinishedSession(false);
    setHasUserStarted(true);
    if (rawItems.length === 0) return;

    let newOrder = Array.from({ length: rawItems.length }, (_, i) => i);
    if (shuffleEnabled && rawItems.length > 1) {
      const lastRawIdx = order[currentIndex];
      newOrder = shuffle(newOrder);
      if (newOrder[0] === lastRawIdx) {
        const swap = Math.floor(Math.random() * (newOrder.length - 1)) + 1;
        [newOrder[0], newOrder[swap]] = [newOrder[swap], newOrder[0]];
      }
    }
    setOrder(newOrder);
    if (currentIndex === 0) playAudio(rawItems[newOrder[0]]);
    else setCurrentIndex(0);
  }, [shuffleEnabled, rawItems, order, currentIndex, playAudio]);

  // Move next
  const handleNext = useCallback(() => {
    clearTimer();
    if (currentIndex < order.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setHasUserStarted(true);
    } else if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage().then((res) => {
        const total = res.data?.pages.flatMap((p) => p.items).length ?? 0;
        if (total > rawItems.length) {
          setCurrentIndex((prev) => prev + 1);
          setHasUserStarted(true);
        } else if (autoPlayAgain && rawItems.length > 0) {
          loopSession();
        } else {
          setIsPlaying(false);
          setIsFinishedSession(true);
        }
      });
    } else if (autoPlayAgain && rawItems.length > 0) {
      loopSession();
    } else {
      setIsPlaying(false);
      setIsFinishedSession(true);
      audioRef.current?.pause();
    }
  }, [
    currentIndex,
    order.length,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    rawItems.length,
    autoPlayAgain,
    loopSession,
  ]);

  const handlePrevious = () => {
    clearTimer();
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setIsFinishedSession(false);
      setHasUserStarted(true);
    }
  };

  const handlePause = () => {
    clearTimer();
    audioRef.current?.pause();
    setIsPlaying(false);
  };

  const handleTogglePlay = () => {
    if (isPlaying) handlePause();
    else if (isFinishedSession) loopSession();
    else if (currentBrick) playAudio(currentBrick);
  };

  const handleReplay = () => {
    clearTimer();
    if (!audioRef.current || !currentBrick) return;
    audioRef.current.currentTime = 0;
    audioRef.current.playbackRate = playbackSpeed;
    audioRef.current
      .play()
      .then(() => setIsPlaying(true))
      .catch(() => setIsPlaying(false));
  };

  const handleToggleShuffle = () => {
    const next = !shuffleEnabled;
    setShuffleEnabled(next);
    setStorageBool("listening_shuffle", next);
    if (rawItems.length > 0) {
      const currentRaw = order[currentIndex] ?? 0;
      if (next) {
        const rest = Array.from(
          { length: rawItems.length },
          (_, i) => i,
        ).filter((i) => i !== currentRaw);
        setOrder([currentRaw, ...shuffle(rest)]);
        setCurrentIndex(0);
      } else {
        setOrder(Array.from({ length: rawItems.length }, (_, i) => i));
        setCurrentIndex(currentRaw);
      }
    }
  };

  const handleToggleAutoPlayAgain = () => {
    const next = !autoPlayAgain;
    setAutoPlayAgain(next);
    setStorageBool("listening_auto_play_again", next);
  };

  const handleToggleReveal = () => {
    setIsRevealed((prev) => {
      const next = !prev;
      setStorageBool("listening_show_answer", next);
      return next;
    });
  };

  // Prefetch when near end
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

  // Audio ended listener
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onEnded = () => {
      setIsPlaying(false);
      if (playbackMode === "auto")
        timerRef.current = setTimeout(handleNext, 850);
    };
    const onError = () => setIsPlaying(false);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);
    return () => {
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
    };
  }, [playbackMode, handleNext]);

  // Autoplay on current brick change
  useEffect(() => {
    if (!isOpen || !currentBrick || isFinishedSession) return;
    if (hasUserStarted || playbackMode === "auto") playAudio(currentBrick);
  }, [
    isOpen,
    currentBrick,
    playAudio,
    hasUserStarted,
    playbackMode,
    isFinishedSession,
  ]);

  // Playback speed sync
  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = playbackSpeed;
  }, [playbackSpeed]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;
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
      } else if (e.key === "e" || e.key === "E") {
        e.preventDefault();
        handleToggleReveal();
      } else if (e.code === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    isOpen,
    isPlaying,
    isFinishedSession,
    currentBrick,
    currentIndex,
    order,
    hasNextPage,
    isFetchingNextPage,
    rawItems,
    autoPlayAgain,
    loopSession,
    handleNext,
    onClose,
    playAudio,
    shuffleEnabled,
    handleToggleReveal,
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
                {islandName && (
                  <span className="text-outline font-normal text-xs truncate">
                    • {islandName}
                  </span>
                )}
              </h2>
              <p className="text-[11px] text-outline truncate">
                {rawItems.length > 0
                  ? `Brick ${currentIndex + 1} of ${totalCount}`
                  : "Continuous listening retrieval"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
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

        {/* Playback Mode Switcher */}
        <div className="px-5 pt-3.5 pb-2 flex items-center justify-between gap-2 border-b border-outline-variant/20 bg-surface-container-lowest">
          <span className="text-[11px] font-semibold text-outline uppercase tracking-wider">
            Mode
          </span>
          <div className="inline-flex p-0.5 rounded-xl bg-surface-container border border-outline-variant/40">
            {(["auto", "manual"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => {
                  setPlaybackMode(mode);
                  clearTimer();
                }}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  playbackMode === mode
                    ? "bg-surface-container-lowest text-primary shadow-xs"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {mode === "auto" ? "Auto-Play" : "Manual Step"}
              </button>
            ))}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-surface-container-high h-1 overflow-hidden">
          <div
            className="bg-primary h-full transition-all duration-300 ease-out"
            style={{
              width: `${totalCount > 0 ? Math.min(100, ((currentIndex + 1) / totalCount) * 100) : 0}%`,
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
                Add bricks to your island first to start listening retrieval.
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
            <div className="w-full space-y-4 sm:space-y-5 animate-in fade-in duration-150 flex flex-col items-center">
              {/* Sound visualizer pill */}
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

              {/* Native Sentence */}
              <div className="space-y-1 w-full max-w-md">
                <span className="px-2.5 py-0.5 bg-surface-container text-on-surface-variant rounded-md text-[9px] font-bold tracking-wider uppercase">
                  Native Sentence
                </span>
                <h2 className="text-base sm:text-lg font-bold font-display text-on-surface leading-snug select-text">
                  {currentBrick?.native_text}
                </h2>
              </div>

              {/* Show/Hide Answer Toggle Button (matching RetrievalPage flashcard) */}
              <div className="flex items-center justify-center my-0.5">
                <button
                  type="button"
                  id="btn-listening-toggle-reveal"
                  onClick={handleToggleReveal}
                  className={`p-3.5 rounded-full transition-all active:scale-90 shadow-xs cursor-pointer ${
                    isRevealed
                      ? "bg-secondary/15 text-secondary ring-2 ring-secondary/20 hover:bg-secondary/25"
                      : "bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-secondary"
                  }`}
                  title={
                    isRevealed
                      ? "Hide target sentence"
                      : "Reveal target sentence"
                  }
                  aria-label={
                    isRevealed
                      ? "Hide target sentence"
                      : "Reveal target sentence"
                  }
                >
                  {isRevealed ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Revealed Target Content */}
              {isRevealed && (
                <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-200 flex flex-col items-center pt-2 border-t border-outline-variant/30">
                  <span className="px-2.5 py-0.5 bg-primary/10 text-primary rounded-md text-[9px] font-bold tracking-wider uppercase mb-1.5">
                    Target Sentence
                  </span>
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold font-display text-primary leading-tight tracking-tight select-text">
                    {currentBrick?.target_text}
                  </h3>
                  {currentBrick?.target_pron && (
                    <p className="text-xs text-outline font-mono select-none mt-1">
                      {currentBrick.target_pron}
                    </p>
                  )}
                </div>
              )}

              {/* Context if available */}
              {currentBrick?.context && (
                <p className="text-xs text-on-surface-variant/80 italic mt-2 pt-2 border-t border-outline-variant/20 w-full max-w-md select-text">
                  "{currentBrick.context}"
                </p>
              )}
            </div>
          )}
        </div>

        {/* Bottom Control Bar */}
        {!isLoading &&
          !isError &&
          rawItems.length > 0 &&
          !isFinishedSession && (
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

                {/* Transport Buttons */}
                <div className="flex items-center gap-2 sm:gap-3">
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

                  <button
                    type="button"
                    onClick={handleTogglePlay}
                    className="w-13 h-13 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-md hover:bg-primary/95 active:scale-95 transition-all cursor-pointer"
                    title={isPlaying ? "Pause (Space)" : "Play audio (Space)"}
                    aria-label={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? (
                      <Pause className="w-6 h-6 fill-current" />
                    ) : (
                      <Play className="w-6 h-6 fill-current ml-0.5" />
                    )}
                  </button>

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

                {/* Replay button */}
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
                  ? "Auto-advancing upon audio completion • Space to pause • E to show/hide • S to shuffle"
                  : "Manual mode • Press Next or Right Arrow to advance • Space to play • E to show/hide"}
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
