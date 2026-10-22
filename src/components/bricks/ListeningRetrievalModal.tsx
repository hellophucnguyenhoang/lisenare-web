import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  X,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  SkipBack,
  Shuffle,
  Repeat,
  Eye,
  EyeOff,
  Loader2,
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

function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

const getStorageBool = (key: string, defaultVal = false) => {
  try {
    const stored = localStorage.getItem(key);
    return stored !== null ? stored === "true" : defaultVal;
  } catch {
    return defaultVal;
  }
};

const setStorageBool = (key: string, val: boolean) => {
  try {
    localStorage.setItem(key, String(val));
  } catch {
    // Ignore localStorage errors
  }
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
    getStorageBool("listening_shuffle", false),
  );
  const [autoPlayAgain, setAutoPlayAgain] = useState(() =>
    getStorageBool("listening_auto_play_again", false),
  );
  const [showNative, setShowNative] = useState(() =>
    getStorageBool("listening_show_native", true),
  );
  const [showTarget, setShowTarget] = useState(() =>
    getStorageBool("listening_show_target", true),
  );

  // Per-item manual reveal overrides when hidden globally
  const [revealedNative, setRevealedNative] = useState<Record<number, boolean>>(
    {},
  );
  const [revealedTarget, setRevealedTarget] = useState<Record<number, boolean>>(
    {},
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [order, setOrder] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFinishedSession, setIsFinishedSession] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

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

  // Synchronize order with rawItems count
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
      setRevealedNative({});
      setRevealedTarget({});
    } else {
      audioRef.current?.pause();
      if (audioRef.current) audioRef.current.src = "";
      clearTimer();
      setIsPlaying(false);
    }
  }, [isOpen]);

  // Audio play helper
  const playAudio = useCallback((brick?: BrickListeningData) => {
    clearTimer();
    if (!audioRef.current || !brick?.audio_path) return;
    const audio = audioRef.current;
    const url = resolveAudioUrl(brick.audio_path);
    if (audio.src !== url) audio.src = url;
    audio
      .play()
      .then(() => setIsPlaying(true))
      .catch(() => setIsPlaying(false));
  }, []);

  // Auto-scroll active item into view
  useEffect(() => {
    if (!isOpen) return;
    const el = itemRefs.current[currentIndex];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [currentIndex, isOpen]);

  // Move next
  const handleNext = useCallback(() => {
    clearTimer();
    if (currentIndex < order.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      const nextBrick = rawItems[order[nextIdx]];
      if (nextBrick) playAudio(nextBrick);
    } else if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage().then((res) => {
        const total = res.data?.pages.flatMap((p) => p.items).length ?? 0;
        if (total > rawItems.length) {
          const nextIdx = currentIndex + 1;
          setCurrentIndex(nextIdx);
          const nextBrick = rawItems[order[nextIdx]];
          if (nextBrick) playAudio(nextBrick);
        } else if (autoPlayAgain && rawItems.length > 0) {
          setCurrentIndex(0);
          const firstBrick = rawItems[order[0]];
          if (firstBrick) playAudio(firstBrick);
        } else {
          setIsPlaying(false);
          setIsFinishedSession(true);
        }
      });
    } else if (autoPlayAgain && rawItems.length > 0) {
      setCurrentIndex(0);
      const firstBrick = rawItems[order[0]];
      if (firstBrick) playAudio(firstBrick);
    } else {
      setIsPlaying(false);
      setIsFinishedSession(true);
      audioRef.current?.pause();
    }
  }, [
    currentIndex,
    order,
    rawItems,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    autoPlayAgain,
    playAudio,
  ]);

  const handlePrevious = useCallback(() => {
    clearTimer();
    if (currentIndex > 0) {
      const prevIdx = currentIndex - 1;
      setCurrentIndex(prevIdx);
      setIsFinishedSession(false);
      const prevBrick = rawItems[order[prevIdx]];
      if (prevBrick) playAudio(prevBrick);
    }
  }, [currentIndex, order, rawItems, playAudio]);

  const handleTogglePlay = useCallback(() => {
    if (isPlaying) {
      clearTimer();
      audioRef.current?.pause();
      setIsPlaying(false);
    } else if (isFinishedSession) {
      setIsFinishedSession(false);
      setCurrentIndex(0);
      const firstBrick = rawItems[order[0]];
      if (firstBrick) playAudio(firstBrick);
    } else if (currentBrick) {
      playAudio(currentBrick);
    }
  }, [isPlaying, isFinishedSession, currentBrick, rawItems, order, playAudio]);

  const handleSelectBrick = (displayIndex: number) => {
    clearTimer();
    setIsFinishedSession(false);
    if (displayIndex === currentIndex && isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
      return;
    }
    setCurrentIndex(displayIndex);
    const targetBrick = rawItems[order[displayIndex]];
    if (targetBrick) {
      playAudio(targetBrick);
    }
  };

  const handleReplay = useCallback(() => {
    clearTimer();
    if (!audioRef.current || !currentBrick) return;
    audioRef.current.currentTime = 0;
    audioRef.current
      .play()
      .then(() => setIsPlaying(true))
      .catch(() => setIsPlaying(false));
  }, [currentBrick]);

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

  const handleToggleShowNative = useCallback(() => {
    setShowNative((prev) => {
      const next = !prev;
      setStorageBool("listening_show_native", next);
      return next;
    });
    setRevealedNative({});
  }, []);

  const handleToggleShowTarget = useCallback(() => {
    setShowTarget((prev) => {
      const next = !prev;
      setStorageBool("listening_show_target", next);
      setStorageBool("listening_show_answer", next);
      return next;
    });
    setRevealedTarget({});
  }, []);

  const toggleRevealNative = (index: number) => {
    setRevealedNative((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const toggleRevealTarget = (index: number) => {
    setRevealedTarget((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  // Audio ended listener
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onEnded = () => {
      setIsPlaying(false);
      if (playbackMode === "auto") {
        timerRef.current = setTimeout(handleNext, 650);
      }
    };
    const onError = () => setIsPlaying(false);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);
    return () => {
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
    };
  }, [playbackMode, handleNext]);

  // Infinite scroll trigger on list scroll
  const handleListScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (
      scrollHeight - scrollTop - clientHeight < 250 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      void fetchNextPage();
    }
  };

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
      } else if (e.code === "ArrowDown" || e.code === "ArrowRight") {
        e.preventDefault();
        handleNext();
      } else if (e.code === "ArrowUp" || e.code === "ArrowLeft") {
        e.preventDefault();
        handlePrevious();
      } else if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        handleReplay();
      } else if (e.key === "s" || e.key === "S") {
        e.preventDefault();
        handleToggleShuffle();
      } else if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        handleToggleShowNative();
      } else if (
        e.key === "t" ||
        e.key === "T" ||
        e.key === "e" ||
        e.key === "E"
      ) {
        e.preventDefault();
        handleToggleShowTarget();
      } else if (e.code === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    isOpen,
    handleTogglePlay,
    handleNext,
    handlePrevious,
    handleReplay,
    handleToggleShowNative,
    handleToggleShowTarget,
    onClose,
  ]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Listen bricks modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-surface-container-lowest border border-outline-variant/60 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[88vh] max-h-[820px] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top header */}
        <div className="px-5 py-3 border-b border-outline-variant/30 flex items-center justify-between gap-3 bg-surface-container-low/40">
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-on-surface truncate flex items-center gap-1.5">
              <span>Listen bricks</span>
              {islandName && (
                <span className="text-outline font-normal text-xs truncate">
                  • {islandName}
                </span>
              )}
            </h2>
            <p className="text-[11px] text-outline truncate">
              {rawItems.length > 0
                ? `${totalCount} bricks • Playing ${currentIndex + 1}`
                : "Listening retrieval"}
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Playback mode switcher */}
            <div className="inline-flex p-0.5 rounded-xl bg-surface-container border border-outline-variant/40 mr-1">
              {(["auto", "manual"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => {
                    setPlaybackMode(mode);
                    clearTimer();
                  }}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    playbackMode === mode
                      ? "bg-surface-container-lowest text-primary shadow-xs"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                  title={
                    mode === "auto"
                      ? "Auto-play: advances down the list automatically"
                      : "Manual: click any brick to play"
                  }
                >
                  {mode === "auto" ? "Auto" : "Manual"}
                </button>
              ))}
            </div>

            {/* Toggle show native text */}
            <button
              type="button"
              onClick={handleToggleShowNative}
              className={`p-2 rounded-xl text-xs transition-colors cursor-pointer ${
                showNative
                  ? "text-outline hover:text-on-surface hover:bg-surface-container"
                  : "bg-amber-500/15 text-amber-600 font-bold"
              }`}
              title={
                showNative
                  ? "Native text visible • Click to hide (N)"
                  : "Native text hidden • Click to show (N)"
              }
              aria-label="Toggle native text"
            >
              {showNative ? (
                <Eye className="w-4 h-4" />
              ) : (
                <EyeOff className="w-4 h-4" />
              )}
            </button>

            {/* Toggle show target text */}
            <button
              type="button"
              onClick={handleToggleShowTarget}
              className={`p-2 rounded-xl text-xs transition-colors cursor-pointer ${
                showTarget
                  ? "text-outline hover:text-on-surface hover:bg-surface-container"
                  : "bg-primary/15 text-primary font-bold"
              }`}
              title={
                showTarget
                  ? "Target text visible • Click to hide (T)"
                  : "Target text hidden • Click to show (T)"
              }
              aria-label="Toggle target text"
            >
              {showTarget ? (
                <Eye className="w-4 h-4" />
              ) : (
                <EyeOff className="w-4 h-4" />
              )}
            </button>

            {/* Loop / Auto play again */}
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
                  ? "Loop enabled (restarts at end)"
                  : "Loop disabled"
              }
              aria-label="Toggle auto play again"
            >
              <Repeat className="w-4 h-4" />
            </button>

            {/* Shuffle */}
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
                  ? "Shuffle enabled (random order)"
                  : "Sequential order"
              }
              aria-label="Toggle shuffle"
            >
              <Shuffle className="w-4 h-4" />
            </button>

            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-outline hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer ml-1"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable brick list */}
        <div
          onScroll={handleListScroll}
          className="flex-1 overflow-y-auto divide-y divide-outline-variant/20 p-2 sm:p-3"
        >
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-xs text-outline">Loading bricks...</p>
            </div>
          ) : isError ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-center px-4">
              <p className="text-sm text-error font-medium">
                Failed to load listening bricks.
              </p>
              <button
                type="button"
                onClick={() => void refetch()}
                className="px-4 py-2 bg-primary text-on-primary text-xs font-bold rounded-xl cursor-pointer"
              >
                Try again
              </button>
            </div>
          ) : rawItems.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center gap-2 text-center px-4">
              <p className="text-sm font-bold text-on-surface">
                No bricks found to listen to.
              </p>
              <p className="text-xs text-outline max-w-xs">
                Add bricks to your island to practice listening retrieval.
              </p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {order.map((rawIdx, displayIdx) => {
                const brick = rawItems[rawIdx];
                if (!brick) return null;

                const isActive = displayIdx === currentIndex;
                const isItemPlaying = isActive && isPlaying;
                const isTargetVisible =
                  showTarget || Boolean(revealedTarget[rawIdx]);
                const isNativeVisible =
                  showNative || Boolean(revealedNative[rawIdx]);

                return (
                  <div
                    key={`${brick.audio_path}-${displayIdx}`}
                    ref={(el) => {
                      itemRefs.current[displayIdx] = el;
                    }}
                    onClick={() => handleSelectBrick(displayIdx)}
                    className={`group w-full text-left p-3 sm:p-3.5 rounded-2xl transition-all cursor-pointer flex items-start gap-3 select-none ${
                      isActive
                        ? "bg-primary/8 border border-primary/30 shadow-xs"
                        : "hover:bg-surface-container-low/70 border border-transparent"
                    }`}
                  >
                    {/* Play / Pause button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectBrick(displayIdx);
                      }}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform active:scale-90 cursor-pointer ${
                        isItemPlaying
                          ? "bg-primary text-on-primary shadow-xs"
                          : isActive
                            ? "bg-primary/20 text-primary"
                            : "bg-surface-container text-on-surface-variant group-hover:bg-primary/15 group-hover:text-primary"
                      }`}
                      title={isItemPlaying ? "Pause" : "Listen"}
                      aria-label={isItemPlaying ? "Pause" : "Listen"}
                    >
                      {isItemPlaying ? (
                        <Pause className="w-4 h-4 fill-current" />
                      ) : (
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      )}
                    </button>

                    {/* Sentence content */}
                    <div className="flex-1 min-w-0">
                      {/* Target sentence */}
                      <div>
                        {isTargetVisible ? (
                          <p
                            className={`text-sm sm:text-base font-bold leading-snug wrap-break-word ${
                              isActive ? "text-primary" : "text-on-surface"
                            }`}
                          >
                            {brick.target_text}
                          </p>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleRevealTarget(rawIdx);
                            }}
                            className="text-xs text-primary/80 italic py-0.5 px-2.5 rounded-lg border border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer"
                          >
                            Hidden target • Click to reveal
                          </button>
                        )}

                        {brick.target_pron && isTargetVisible && (
                          <p className="text-[11px] text-outline font-mono mt-0.5 truncate">
                            {brick.target_pron}
                          </p>
                        )}
                      </div>

                      {/* Native sentence */}
                      <div className="mt-1">
                        {isNativeVisible ? (
                          <p className="text-xs text-on-surface-variant leading-relaxed wrap-break-word">
                            {brick.native_text}
                          </p>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleRevealNative(rawIdx);
                            }}
                            className="text-xs text-outline italic py-0.5 px-2 rounded-md border border-dashed border-outline-variant/60 hover:text-on-surface transition-colors cursor-pointer"
                          >
                            Hidden native • Click to reveal
                          </button>
                        )}
                      </div>

                      {/* Context */}
                      {brick.context && isTargetVisible && (
                        <p className="text-[11px] text-outline/80 italic mt-1 line-clamp-2">
                          "{brick.context}"
                        </p>
                      )}
                    </div>

                    {/* Right side: Brick index */}
                    <div className="shrink-0 text-right">
                      <span className="text-[11px] font-mono text-outline">
                        #{displayIdx + 1}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Load more button if has next page */}
              {hasNextPage && (
                <div className="py-3 flex justify-center">
                  <button
                    type="button"
                    onClick={() => void fetchNextPage()}
                    disabled={isFetchingNextPage}
                    className="px-4 py-2 text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 rounded-xl transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {isFetchingNextPage ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Loading more...</span>
                      </>
                    ) : (
                      <span>Load more bricks</span>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Minimal sticky bottom player bar */}
        {!isLoading && !isError && rawItems.length > 0 && (
          <div className="px-5 py-2.5 border-t border-outline-variant/30 bg-surface-container-low/50 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleReplay}
              className="p-2 rounded-xl text-outline hover:text-primary hover:bg-surface-container active:scale-95 transition-all cursor-pointer"
              title="Replay (R)"
              aria-label="Replay current audio"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="p-2 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
              title="Previous brick (Left arrow / Up arrow)"
              aria-label="Previous brick"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              type="button"
              id="btn-listening-footer-play"
              onClick={handleTogglePlay}
              className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center shadow-xs hover:bg-primary/95 active:scale-95 transition-all cursor-pointer"
              title={isPlaying ? "Pause (Space)" : "Listen (Space)"}
              aria-label={isPlaying ? "Pause" : "Listen"}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
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
              className="p-2 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
              title="Next brick (Right arrow / Down arrow)"
              aria-label="Next brick"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
