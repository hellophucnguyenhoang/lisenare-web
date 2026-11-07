import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { X, Play, Pause, Shuffle, Repeat, Eye, EyeOff, Loader2 } from "lucide-react";
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
  const [autoplay, setAutoplay] = useState(() =>
    getStorageBool("listening_autoplay", true),
  );
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
    audio.currentTime = 0;
    audio
      .play()
      .then(() => setIsPlaying(true))
      .catch(() => setIsPlaying(false));
  }, []);

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

  const handleToggleAutoplay = useCallback(() => {
    setAutoplay((prev) => {
      const next = !prev;
      setStorageBool("listening_autoplay", next);
      if (!next) {
        clearTimer();
      } else {
        if (isFinishedSession) {
          setIsFinishedSession(false);
          setCurrentIndex(0);
          const firstBrick = rawItems[order[0]];
          if (firstBrick) playAudio(firstBrick);
        } else if (!isPlaying) {
          const targetBrick = currentBrick ?? rawItems[order[currentIndex] ?? 0];
          if (targetBrick) playAudio(targetBrick);
        }
      }
      return next;
    });
  }, [
    isFinishedSession,
    isPlaying,
    currentBrick,
    rawItems,
    order,
    currentIndex,
    playAudio,
  ]);

  const handleSelectBrick = (displayIndex: number) => {
    clearTimer();
    setIsFinishedSession(false);
    setCurrentIndex(displayIndex);
    const targetBrick = rawItems[order[displayIndex]];
    if (targetBrick) {
      playAudio(targetBrick);
    }
  };

  const handleReplay = useCallback(() => {
    if (currentBrick) {
      playAudio(currentBrick);
    }
  }, [currentBrick, playAudio]);

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
      if (autoplay) {
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
  }, [autoplay, handleNext]);

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
        handleToggleAutoplay();
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
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    isOpen,
    handleToggleAutoplay,
    handleNext,
    handlePrevious,
    handleReplay,
    handleToggleShowNative,
    handleToggleShowTarget,
  ]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Listen bricks modal"
      style={{ willChange: "opacity" }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 animate-in fade-in duration-200"
    >
      <div
        style={{ willChange: "transform, opacity" }}
        className="w-full max-w-2xl bg-surface-container-lowest border border-outline-variant/60 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[88vh] max-h-205 animate-in zoom-in-95 duration-200"
      >
        {/* Top header */}
        <div className="px-4 sm:px-5 py-3 border-b border-outline-variant/30 flex items-center justify-between gap-2.5 sm:gap-3 bg-surface-container-low/40">
          <div className="min-w-0 flex-1">
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

          <div className="flex items-center gap-2 shrink-0">
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
                    onClick={() => handleSelectBrick(displayIdx)}
                    className={`group w-full text-left p-3 sm:p-3.5 rounded-2xl transition-all cursor-pointer flex items-start justify-between gap-3 select-none ${
                      isActive
                        ? "bg-primary/8 border border-primary/30 shadow-xs"
                        : "hover:bg-surface-container-low/70 border border-transparent"
                    }`}
                  >
                    {/* Sentence content */}
                    <div className="flex-1 min-w-0">
                      {/* Target sentence */}
                      <div>
                        {isTargetVisible ? (
                          <div className="flex items-start gap-2">
                            <p
                              className={`text-sm sm:text-base font-bold leading-snug wrap-break-words ${
                                isActive ? "text-primary" : "text-on-surface"
                              }`}
                            >
                              {brick.target_text}
                            </p>
                            {!showTarget && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleRevealTarget(rawIdx);
                                }}
                                className="p-1 rounded-md text-outline hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer shrink-0 mt-0.5"
                                title="Hide target sentence"
                                aria-label="Hide target sentence"
                              >
                                <EyeOff className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-mono text-outline/40 tracking-widest select-none">
                              ••••••••••••••••
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleRevealTarget(rawIdx);
                              }}
                              className="p-1 rounded-md text-outline hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer shrink-0"
                              title="Reveal target sentence"
                              aria-label="Reveal target sentence"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}

                        {brick.target_pron && isTargetVisible && (
                          <p className="text-[11px] text-outline font-mono mt-0.5 leading-relaxed wrap-break-words">
                            {brick.target_pron}
                          </p>
                        )}
                      </div>

                      {/* Native sentence */}
                      <div className="mt-1">
                        {isNativeVisible ? (
                          <div className="flex items-start gap-2">
                            <p className="text-xs text-on-surface-variant leading-relaxed wrap-break-words">
                              {brick.native_text}
                            </p>
                            {!showNative && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleRevealNative(rawIdx);
                                }}
                                className="p-1 rounded-md text-outline hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer shrink-0"
                                title="Hide native sentence"
                                aria-label="Hide native sentence"
                              >
                                <EyeOff className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-outline/40 tracking-widest select-none">
                              ••••••••••••
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleRevealNative(rawIdx);
                              }}
                              className="p-1 rounded-md text-outline hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer shrink-0"
                              title="Reveal native sentence"
                              aria-label="Reveal native sentence"
                            >
                              <Eye className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Context */}
                      {brick.context && isTargetVisible && (
                        <p className="text-[11px] text-outline/80 italic mt-1 leading-relaxed wrap-break-words">
                          "{brick.context}"
                        </p>
                      )}
                    </div>

                    {/* Right side: Brick index & playing indicator */}
                    <div className="shrink-0 flex items-center gap-1.5 text-right pt-0.5">
                      {isItemPlaying && (
                        <span className="flex items-end gap-0.5 h-3 text-primary" title="Playing">
                          <span className="w-1 h-2 bg-primary rounded-full animate-pulse" />
                          <span className="w-1 h-3 bg-primary rounded-full animate-pulse delay-75" />
                          <span className="w-1 h-1.5 bg-primary rounded-full animate-pulse delay-150" />
                        </span>
                      )}
                      <span
                        className={`text-[11px] font-mono ${
                          isActive ? "text-primary font-bold" : "text-outline"
                        }`}
                      >
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

        {/* Bottom controls bar */}
        {!isLoading && !isError && rawItems.length > 0 && (
          <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-t border-outline-variant/30 bg-surface-container-low/60 flex items-center justify-between gap-2">
            {/* Left: Reveal toggles */}
            <div className="flex items-center gap-1 sm:gap-1.5">
              {/* Toggle show native text */}
              <button
                type="button"
                onClick={handleToggleShowNative}
                className={`p-2 rounded-xl text-xs transition-colors cursor-pointer ${
                  showNative
                    ? "text-outline hover:text-on-surface hover:bg-surface-container"
                    : "bg-surface-container text-on-surface-variant font-bold border border-outline-variant/60"
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
            </div>

            {/* Middle: Autoplay Play/Pause button */}
            <button
              type="button"
              id="btn-listening-autoplay"
              onClick={handleToggleAutoplay}
              className={`w-10 h-10 rounded-full shadow-md flex items-center justify-center transition-all active:scale-95 cursor-pointer ${
                autoplay
                  ? "bg-primary hover:bg-primary/90 text-on-primary"
                  : "bg-surface-container hover:bg-surface-container-high text-on-surface-variant border border-outline-variant/60"
              }`}
              title={
                autoplay
                  ? "Autoplay is on • Click to turn off (Space)"
                  : "Autoplay is off • Click to turn on (Space)"
              }
              aria-label={autoplay ? "Turn off autoplay" : "Turn on autoplay"}
            >
              {autoplay ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>

            {/* Right: Playback options (Shuffle, Loop) */}
            <div className="flex items-center gap-1.5 sm:gap-2">
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
