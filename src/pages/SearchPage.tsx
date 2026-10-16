import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Search,
  X,
  User,
  Globe,
  Play,
  ChevronLeft,
  ChevronRight,
  Volume2,
  Heart,
  Plus,
  ArrowUp,
  Sparkles,
  RotateCcw,
  MoreVertical,
  Edit3,
  Trash2,
  Flag,
} from "lucide-react";
import { useSearchContextBricks } from "@/hooks/useContextSearch";
import { useLearnerMe } from "@/hooks/useLearner";
import { useIslands, useCreateIsland } from "@/hooks/useIslands";
import {
  useAddBrickFrom,
  useAddBricksFromIsland,
  useDeleteBrick,
  useForgetBrick,
} from "@/hooks/useBricks";
import {
  getRecommendedBricks,
  createBrickInteraction,
  getBrickDetail,
} from "@/api/bricks";
import { playShortAudio } from "@/utils/audio";
import { type Brick, type AuthMode } from "@/types";
import SaveToIslandModal from "@/components/bricks/SaveToIslandModal";
import BrickDetailModal from "@/components/bricks/BrickDetailModal";
import ReportBrickModal from "@/components/bricks/ReportBrickModal";
import { toast } from "sonner";

interface SearchPageProps {
  onBack: () => void;
  onNavigateToRetrieval?: (brickId?: number) => void;
  onNavigateToEditBrick?: (brick: Brick) => void;
  onOpenAuth?: (mode: AuthMode) => void;
}

type SearchTab = "yours" | "public";
type UnitTypeFilter = "word" | "sentence" | null;
const PAGE_SIZE = 30;
const RECOMMENDATION_PAGE_SIZE = 6;

export default function SearchPage({
  onBack,
  onNavigateToRetrieval,
  onNavigateToEditBrick,
  onOpenAuth,
}: SearchPageProps) {
  const { data: learner } = useLearnerMe();
  const isLoggedIn = Boolean(learner);

  // Frontend random session_id generated once on mount
  const [sessionId] = useState<string>(() => {
    if (
      typeof crypto !== "undefined" &&
      typeof crypto.randomUUID === "function"
    ) {
      return crypto.randomUUID();
    }
    return `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  });

  // Recommendation state
  const [recommendedBricks, setRecommendedBricks] = useState<Brick[]>([]);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Audio & interaction states
  const [playingBrickId, setPlayingBrickId] = useState<number | null>(null);
  const [likedMap, setLikedMap] = useState<Record<number, boolean>>({});
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Search state
  const [searchInput, setSearchInput] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [activeTab, setActiveTab] = useState<SearchTab>(
    isLoggedIn ? "yours" : "public",
  );
  const [kind, setUnitType] = useState<UnitTypeFilter>(null);
  const [page, setPage] = useState(1);
  const offset = (page - 1) * PAGE_SIZE;

  // Modals state
  const [detailBrickId, setDetailBrickId] = useState<number | null>(null);
  const [savingBrick, setSavingBrick] = useState<{
    brick_id: number;
    target_text: string;
    native_text: string;
  } | null>(null);
  const [savingIsland, setSavingIsland] = useState<{
    island_id: number;
    island_name: string;
  } | null>(null);

  const { data: islands = [] } = useIslands(isLoggedIn);
  const queryClient = useQueryClient();
  const addBrickMutation = useAddBrickFrom();
  const addBricksFromIslandMutation = useAddBricksFromIsland();
  const createIslandMutation = useCreateIsland();
  const deleteBrickMutation = useDeleteBrick();
  const forgetBrickMutation = useForgetBrick();
  const [openMenuBrickId, setOpenMenuBrickId] = useState<number | null>(null);
  const [reportingBrick, setReportingBrick] = useState<{
    brickId: number;
    targetText?: string;
  } | null>(null);

  // Close 3-dots dropdown menu when clicking anywhere outside
  useEffect(() => {
    const handleOutsideClick = () => setOpenMenuBrickId(null);
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  const handleOpenReport = (brickId: number, targetText?: string) => {
    if (!isLoggedIn) {
      toast.error("Please sign in to report a brick.");
      onOpenAuth?.("login");
      return;
    }
    setReportingBrick({ brickId, targetText });
  };

  const handleEditBrick = async (brickId: number) => {
    if (!onNavigateToEditBrick) return;
    try {
      const fullBrick = await getBrickDetail(brickId);
      onNavigateToEditBrick(fullBrick);
    } catch (err) {
      console.error("Failed to load brick for editing:", err);
      toast.error("Failed to load brick details.");
    }
  };

  const handleForgetBrick = (brickId: number) => {
    if (
      confirm(
        "Are you sure you want to forget this brick? All memory and review history for it will be reset.",
      )
    ) {
      forgetBrickMutation.mutate(brickId, {
        onSuccess: () => {
          toast.success("Brick memory reset successfully.");
          queryClient.invalidateQueries({ queryKey: ["context-search"] });
          queryClient.invalidateQueries({ queryKey: ["bricks"] });
          queryClient.invalidateQueries({ queryKey: ["stats"] });
        },
        onError: (err: unknown) => {
          const errorObj = err as
            | { detail?: string; message?: string }
            | undefined;
          toast.error(
            errorObj?.detail ||
              errorObj?.message ||
              "Failed to reset brick memory. Please try again.",
          );
        },
      });
    }
  };

  const handleDeleteBrick = (brickId: number) => {
    if (confirm("Are you sure you want to delete this brick?")) {
      deleteBrickMutation.mutate(brickId, {
        onSuccess: () => {
          toast.success("Brick deleted successfully.");
          queryClient.invalidateQueries({ queryKey: ["context-search"] });
          queryClient.invalidateQueries({ queryKey: ["bricks"] });
        },
        onError: (err: unknown) => {
          const errorObj = err as
            | { detail?: string; message?: string }
            | undefined;
          toast.error(
            errorObj?.detail || errorObj?.message || "Failed to delete brick.",
          );
        },
      });
    }
  };

  // Scroll listener for floating scroll-to-top button
  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 350);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch initial recommendations ONCE on mount
  useEffect(() => {
    if (!sessionId || !isLoggedIn) {
      setIsLoadingInitial(false);
      return;
    }
    getRecommendedBricks(sessionId, RECOMMENDATION_PAGE_SIZE)
      .then((res) => {
        if (res.items.length > 0) setRecommendedBricks(res.items);
      })
      .catch((err) => console.error("Initial recommendations error:", err))
      .finally(() => setIsLoadingInitial(false));
  }, [sessionId, isLoggedIn]);

  // Load more recommendations: ONLY called when user explicitly clicks "Load more"
  const handleLoadMore = async () => {
    if (isLoadingMore || !sessionId || !isLoggedIn) return;
    setIsLoadingMore(true);
    try {
      const res = await getRecommendedBricks(
        sessionId,
        RECOMMENDATION_PAGE_SIZE,
      );
      if (res.items.length > 0) {
        setRecommendedBricks((prev) => {
          const existingIds = new Set(prev.map((b) => b.id));
          const newItems = res.items.filter((b) => !existingIds.has(b.id));
          if (newItems.length === 0) {
            toast.info("No additional recommendations found right now.");
            return prev;
          }
          return [...prev, ...newItems];
        });
      } else {
        toast.info("You've viewed all current recommendations.");
      }
    } catch (err) {
      console.error("Failed to load more recommendations:", err);
      toast.error("Failed to load more recommendations.");
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Play audio: ONLY plays audio. Does NOT call recommendation endpoint.
  const handlePlayAudio = (brickId: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setPlayingBrickId(brickId);
    playShortAudio(brickId, undefined, () => {
      setPlayingBrickId((curr) => (curr === brickId ? null : curr));
    });
  };

  // Like brick: toggles state and asynchronously notifies backend profile without loading new bricks
  const handleToggleLike = (
    brickId: number,
    currentReaction?: string | null,
    e?: React.MouseEvent,
  ) => {
    if (e) e.stopPropagation();
    if (!isLoggedIn) {
      toast.error("Please sign in to react to bricks.");
      onOpenAuth?.("login");
      return;
    }
    const isCurrentlyLiked =
      likedMap[brickId] !== undefined
        ? likedMap[brickId]
        : currentReaction === "LIKE";
    const nextLiked = !isCurrentlyLiked;
    setLikedMap((prev) => ({ ...prev, [brickId]: nextLiked }));

    void createBrickInteraction({
      session_id: sessionId,
      brick_id: brickId,
      interaction_type: nextLiked ? "LIKE" : "REMOVE_REACTION",
    });
  };

  // Search query hook
  const bricksQuery = useSearchContextBricks(
    {
      query: activeQuery,
      kind: kind ?? undefined,
      limit: PAGE_SIZE,
      offset,
    },
    Boolean(activeQuery && isLoggedIn),
  );

  const searchResults = bricksQuery.data ?? [];
  const yoursBricks = searchResults.filter((b) => b.is_own);
  const publicBricks = searchResults.filter((b) => !b.is_own);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = searchInput.trim();
    if (!trimmed) return;
    if (!isLoggedIn) {
      toast.error("Please sign in to search bricks.");
      onOpenAuth?.("login");
      return;
    }
    setActiveQuery(trimmed);
    setPage(1);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setActiveQuery("");
    setPage(1);
  };

  const handleOpenAddIsland = (island: {
    island_id: number;
    island_name: string;
  }) => {
    if (!isLoggedIn) {
      toast.error("Please sign in to add islands.");
      onOpenAuth?.("login");
      return;
    }
    setSavingIsland(island);
  };

  const handleSaveToIsland = (islandId: number) => {
    if (!savingBrick) return;
    addBrickMutation.mutate(
      { brickId: savingBrick.brick_id, islandId },
      {
        onSuccess: () => {
          toast.success("Brick added to island!");
          void createBrickInteraction({
            session_id: sessionId,
            brick_id: savingBrick.brick_id,
            interaction_type: "ADD",
          });
          setSavingBrick(null);
          setDetailBrickId(null);
        },
        onError: (err: unknown) => {
          const errorObj = err as
            | { detail?: string; message?: string }
            | undefined;
          toast.error(
            errorObj?.detail || errorObj?.message || "Failed to add brick.",
          );
        },
      },
    );
  };

  const handleSaveIslandToTarget = (targetIslandId: number) => {
    if (!savingIsland) return;
    addBricksFromIslandMutation.mutate(
      {
        islandId: savingIsland.island_id,
        targetIslandId,
      },
      {
        onSuccess: (result) => {
          if (result.added === 0) {
            toast.info(
              "All bricks from this island are already in your island.",
            );
          } else if (result.skipped > 0) {
            toast.success(
              `Added ${result.added} new bricks to your island (${result.skipped} skipped as duplicates).`,
            );
          } else {
            toast.success(`Added all ${result.added} bricks to your island!`);
          }
          setSavingIsland(null);
          setDetailBrickId(null);
        },
        onError: (err: unknown) => {
          const errorObj = err as
            | { detail?: string; message?: string }
            | undefined;
          toast.error(
            errorObj?.detail || errorObj?.message || "Failed to add island.",
          );
        },
      },
    );
  };

  const handleCreateAndSave = async (name: string) => {
    try {
      const created = await createIslandMutation.mutateAsync({
        name,
        description: "",
        tags: [],
      });
      if (savingIsland) {
        handleSaveIslandToTarget(created.id);
      } else if (savingBrick) {
        handleSaveToIsland(created.id);
      }
    } catch (err: unknown) {
      const errorObj = err as { detail?: string; message?: string } | undefined;
      toast.error(
        errorObj?.detail || errorObj?.message || "Failed to create island.",
      );
    }
  };

  // Not logged in gate
  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 flex flex-col items-center justify-center text-center animate-in fade-in duration-300">
        <button
          type="button"
          onClick={onBack}
          className="self-start mb-6 p-2.5 rounded-xl hover:bg-surface-container transition-all active:scale-95 cursor-pointer text-on-surface bg-surface-container-lowest border border-outline-variant/60 shadow-2xs"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="w-16 h-16 rounded-2xl bg-white border border-primary/20 shadow-xs flex items-center justify-center mb-5 overflow-hidden p-3">
          <img
            src="/favicon.svg"
            alt="Lisenare logo"
            className="w-full h-full object-contain rounded-xl"
          />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold font-display text-on-surface mb-2">
          Search & Discover bricks
        </h2>
        <p className="text-xs text-on-surface-variant max-w-xs mb-6 leading-relaxed">
          Sign in to search vocabulary, receive personalized recommendations,
          and save bricks to your islands.
        </p>
        {onOpenAuth && (
          <button
            type="button"
            onClick={() => onOpenAuth("login")}
            className="py-3 px-6 bg-primary hover:bg-primary/95 text-on-primary font-bold text-xs rounded-xl shadow-xs transition-all active:scale-98 cursor-pointer"
          >
            Log in to search
          </button>
        )}
      </div>
    );
  }

  const currentTabBricks = activeTab === "yours" ? yoursBricks : publicBricks;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-28 animate-in fade-in duration-300">
      {/* Sticky search header */}
      <div className="sticky top-0 z-30 bg-surface/90 backdrop-blur-md -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 pt-3.5 pb-3 mb-6 border-b border-outline-variant/30 shadow-2xs">
        <div className="max-w-4xl mx-auto flex items-center gap-2.5">
          <button
            type="button"
            onClick={onBack}
            className="p-3 rounded-2xl hover:bg-surface-container transition-all active:scale-95 cursor-pointer text-on-surface bg-surface-container-lowest border border-outline-variant/60 shadow-2xs shrink-0"
            aria-label="Go back"
            title="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <div className="relative flex items-center">
              <input
                type="text"
                enterKeyHint="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search words, phrases, or context..."
                className="w-full h-12 pl-11 pr-24 rounded-2xl bg-surface-container-lowest border-2 border-outline-variant/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium transition-all shadow-2xs text-on-surface placeholder:text-outline"
              />
              <Search className="w-4.5 h-4.5 text-outline absolute left-3.5 pointer-events-none" />

              <div className="absolute right-2 flex items-center gap-1.5">
                {searchInput && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="p-1 text-outline hover:text-on-surface rounded-full transition-colors cursor-pointer"
                    aria-label="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="submit"
                  disabled={!searchInput.trim() || bricksQuery.isLoading}
                  className="px-3.5 py-1.5 bg-primary hover:bg-primary/95 text-on-primary rounded-xl text-xs font-bold transition-all active:scale-95 disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {bricksQuery.isLoading ? "..." : "Search"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* VIEW 1: Recommended bricks stream */}
      {!activeQuery && (
        <div className="space-y-6">
          {isLoadingInitial ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 animate-pulse space-y-3"
                >
                  <div className="h-4 bg-surface-container rounded-md w-16" />
                  <div className="h-6 bg-surface-container rounded-md w-3/4 mt-2" />
                  <div className="h-4 bg-surface-container rounded-md w-1/2" />
                </div>
              ))}
            </div>
          ) : recommendedBricks.length === 0 ? (
            <div className="border border-dashed border-outline-variant/60 rounded-2xl p-10 text-center bg-surface-container-lowest/50">
              <Sparkles className="w-8 h-8 text-outline mx-auto mb-3" />
              <p className="text-sm font-bold text-on-surface mb-1">
                No recommended bricks right now
              </p>
              <p className="text-xs text-on-surface-variant max-w-sm mx-auto mb-4">
                Try searching for specific words or phrases above to explore
                more vocabulary.
              </p>
              <button
                type="button"
                onClick={handleLoadMore}
                className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Refresh recommendations
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {recommendedBricks.map((brick) => {
                  const isPlaying = playingBrickId === brick.id;
                  const isLiked = likedMap[brick.id] ?? false;

                  return (
                    <div
                      key={brick.id}
                      onClick={() => setDetailBrickId(brick.id)}
                      className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-primary/40 hover:shadow-md transition-all group cursor-pointer relative"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-surface-container-high text-on-surface-variant">
                            {brick.kind === "sentence" ? "Sentence" : "Word"}
                          </span>
                          {brick.tags && brick.tags.length > 0 && (
                            <span className="text-[10px] font-medium text-outline truncate max-w-35">
                              #{brick.tags[0].replace(/^#/, "")}
                              {brick.tags.length > 1
                                ? ` +${brick.tags.length - 1}`
                                : ""}
                            </span>
                          )}
                        </div>

                        <div className="space-y-1">
                          <h3 className="text-xl font-bold font-display text-on-surface group-hover:text-primary transition-colors leading-snug">
                            {brick.targetText}
                          </h3>
                          {brick.targetPron && (
                            <p className="text-xs font-mono text-on-surface-variant/75">
                              {brick.targetPron}
                            </p>
                          )}
                          <p className="text-sm font-medium text-on-surface-variant italic mt-1 leading-snug">
                            {brick.nativeText}
                          </p>
                          {brick.context && (
                            <p className="text-xs text-outline line-clamp-2 leading-relaxed mt-2 pt-1.5 border-t border-outline-variant/20">
                              {brick.context}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="pt-3.5 mt-4 border-t border-outline-variant/30 flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => handlePlayAudio(brick.id, e)}
                          className={`p-2 rounded-xl transition-all active:scale-95 cursor-pointer ${
                            isPlaying
                              ? "bg-primary text-on-primary ring-2 ring-primary/30"
                              : "bg-surface-container hover:bg-surface-container-high text-on-surface"
                          }`}
                          title="Listen"
                          aria-label="Listen"
                        >
                          <Volume2
                            className={`w-4 h-4 ${isPlaying ? "animate-pulse" : ""}`}
                          />
                        </button>

                        <button
                          type="button"
                          onClick={(e) =>
                            handleToggleLike(brick.id, undefined, e)
                          }
                          className={`p-2 rounded-xl transition-all active:scale-95 cursor-pointer ${
                            isLiked
                              ? "bg-rose-50 text-rose-600 dark:bg-rose-950/40"
                              : "bg-surface-container hover:bg-surface-container-high text-outline hover:text-rose-500"
                          }`}
                          title={isLiked ? "Unlike" : "Like"}
                          aria-label={isLiked ? "Unlike" : "Like"}
                        >
                          <Heart
                            className={`w-4 h-4 ${isLiked ? "fill-rose-500 text-rose-500" : ""}`}
                          />
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSavingBrick({
                              brick_id: brick.id,
                              target_text: brick.targetText,
                              native_text: brick.nativeText,
                            });
                          }}
                          className="p-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface transition-all active:scale-95 cursor-pointer"
                          title="Add to island"
                          aria-label="Add to island"
                        >
                          <Plus className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenReport(brick.id, brick.targetText);
                          }}
                          className="p-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-outline hover:text-rose-500 transition-all active:scale-95 cursor-pointer"
                          title="Report this brick"
                          aria-label="Report this brick"
                        >
                          <Flag className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ONLY place that triggers additional recommendations */}
              <div className="flex flex-col items-center justify-center pt-6 pb-4">
                <button
                  type="button"
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/60 text-xs font-bold text-on-surface transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-2xs hover:shadow-xs"
                >
                  {isLoadingMore ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <span>Loading more...</span>
                    </>
                  ) : (
                    <span>More recommends</span>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* VIEW 2: Search results */}
      {activeQuery && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-outline-variant/40">
            <div>
              <h2 className="text-base sm:text-lg font-bold font-display text-on-surface">
                Search results for &ldquo;{activeQuery}&rdquo;
              </h2>
              <p className="text-xs text-on-surface-variant">
                Found {searchResults.length} matching result
                {searchResults.length !== 1 ? "s" : ""} on page {page}
              </p>
            </div>

            <button
              type="button"
              onClick={handleClearSearch}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/60 text-xs font-semibold text-on-surface transition-all active:scale-95 cursor-pointer shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5 text-primary" />
              <span>Back to Recommendations</span>
            </button>
          </div>

          {/* Tabs: Yours vs Public & Type selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-outline-variant/60 pb-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("yours")}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "yours"
                    ? "bg-primary text-on-primary shadow-xs"
                    : "text-on-surface-variant hover:bg-surface-container bg-surface-container-low/50"
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Yours</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                    activeTab === "yours"
                      ? "bg-white/20 text-on-primary"
                      : "bg-surface-container-high text-on-surface-variant"
                  }`}
                >
                  {bricksQuery.isLoading ? "..." : yoursBricks.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("public")}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "public"
                    ? "bg-primary text-on-primary shadow-xs"
                    : "text-on-surface-variant hover:bg-surface-container bg-surface-container-low/50"
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Public</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                    activeTab === "public"
                      ? "bg-white/20 text-on-primary"
                      : "bg-surface-container-high text-on-surface-variant"
                  }`}
                >
                  {bricksQuery.isLoading ? "..." : publicBricks.length}
                </span>
              </button>
            </div>

            {/* Type selector */}
            <div className="flex items-center gap-1 self-start sm:self-auto bg-surface-container-lowest border border-outline-variant/60 p-1 rounded-xl">
              <span className="text-[10px] font-bold text-outline uppercase tracking-wider px-2 hidden sm:inline">
                Type
              </span>
              <button
                type="button"
                onClick={() => {
                  setUnitType(null);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  kind === null
                    ? "bg-primary text-on-primary shadow-2xs font-bold"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => {
                  setUnitType("word");
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  kind === "word"
                    ? "bg-primary text-on-primary shadow-2xs font-bold"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
                }`}
              >
                Words
              </button>
              <button
                type="button"
                onClick={() => {
                  setUnitType("sentence");
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  kind === "sentence"
                    ? "bg-primary text-on-primary shadow-2xs font-bold"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
                }`}
              >
                Sentences
              </button>
            </div>
          </div>

          {bricksQuery.isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-on-surface-variant font-medium">
                Searching matching bricks...
              </span>
            </div>
          ) : currentTabBricks.length === 0 ? (
            <div className="border-2 border-dashed border-outline-variant/60 rounded-2xl p-10 text-center bg-surface-container-lowest/50">
              <p className="text-sm font-bold text-on-surface mb-1">
                {activeTab === "yours"
                  ? "No matching bricks in your island"
                  : "No public bricks found"}
              </p>
              <p className="text-xs text-on-surface-variant max-w-sm mx-auto mb-4">
                {activeTab === "yours"
                  ? `You haven't saved any bricks for "${activeQuery}" yet.`
                  : `No community bricks matched "${activeQuery}".`}
              </p>
              {activeTab === "yours" && publicBricks.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab("public")}
                  className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold rounded-xl transition-all inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>View {publicBricks.length} in Public</span>
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {currentTabBricks.map((brick) => {
                  const isPlaying = playingBrickId === brick.brick_id;

                  return (
                    <div
                      key={brick.brick_id}
                      onClick={() => setDetailBrickId(brick.brick_id)}
                      className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-primary/40 hover:shadow-md transition-all group cursor-pointer relative"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-surface-container-high text-on-surface-variant">
                            {brick.is_own ? "Your brick" : "Public"}
                          </span>

                          {brick.is_own && (
                            <div className="relative">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenuBrickId((curr) =>
                                    curr === brick.brick_id
                                      ? null
                                      : brick.brick_id,
                                  );
                                }}
                                className="text-outline hover:text-primary transition-all p-1 rounded-full hover:bg-surface-container-low cursor-pointer"
                                aria-label="More options"
                              >
                                <MoreVertical className="w-5 h-5" />
                              </button>

                              {openMenuBrickId === brick.brick_id && (
                                <div className="absolute right-0 top-8 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg z-30 py-1.5 w-36">
                                  {onNavigateToEditBrick && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setOpenMenuBrickId(null);
                                        handleEditBrick(brick.brick_id);
                                      }}
                                      className="w-full px-4 py-2 text-left text-xs font-semibold hover:bg-surface-container flex items-center gap-2 text-on-surface cursor-pointer"
                                    >
                                      <Edit3 className="w-4 h-4 text-outline" />
                                      <span>Edit brick</span>
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setOpenMenuBrickId(null);
                                      handleForgetBrick(brick.brick_id);
                                    }}
                                    className="w-full px-4 py-2 text-left text-xs font-semibold hover:bg-surface-container flex items-center gap-2 text-on-surface cursor-pointer"
                                  >
                                    <RotateCcw className="w-4 h-4 text-outline" />
                                    <span>Forget brick</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setOpenMenuBrickId(null);
                                      handleDeleteBrick(brick.brick_id);
                                    }}
                                    className="w-full px-4 py-2 text-left text-xs font-semibold hover:bg-error/10 flex items-center gap-2 text-error cursor-pointer"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    <span>Delete brick</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="space-y-1">
                          <h3 className="text-xl font-bold font-display text-on-surface group-hover:text-primary transition-colors leading-snug">
                            {brick.target_text}
                          </h3>
                          <p className="text-sm font-medium text-on-surface-variant italic mt-1 leading-snug">
                            {brick.native_text}
                          </p>
                        </div>
                      </div>

                      <div className="pt-3.5 mt-4 border-t border-outline-variant/30 flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => handlePlayAudio(brick.brick_id, e)}
                          className={`p-2 rounded-xl transition-all active:scale-95 cursor-pointer ${
                            isPlaying
                              ? "bg-primary text-on-primary ring-2 ring-primary/30"
                              : "bg-surface-container hover:bg-surface-container-high text-on-surface"
                          }`}
                          title="Listen"
                          aria-label="Listen"
                        >
                          <Volume2
                            className={`w-4 h-4 ${isPlaying ? "animate-pulse" : ""}`}
                          />
                        </button>

                        {!brick.is_own && (
                          <>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSavingBrick({
                                  brick_id: brick.brick_id,
                                  target_text: brick.target_text,
                                  native_text: brick.native_text,
                                });
                              }}
                              className="p-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface transition-all active:scale-95 cursor-pointer"
                              title="Add to island"
                              aria-label="Add to island"
                            >
                              <Plus className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenReport(
                                  brick.brick_id,
                                  brick.target_text,
                                );
                              }}
                              className="p-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-outline hover:text-rose-500 transition-all active:scale-95 cursor-pointer"
                              title="Report this brick"
                              aria-label="Report this brick"
                            >
                              <Flag className="w-4 h-4" />
                            </button>
                          </>
                        )}

                        {brick.is_own && onNavigateToRetrieval && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onNavigateToRetrieval(brick.brick_id);
                            }}
                            className="px-3 py-2 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer ml-1"
                            title="Retrieval this brick"
                          >
                            <Play className="w-3.5 h-3.5 text-primary" />
                            <span>Retrieval</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-outline-variant/40 mt-6">
                <div className="text-xs text-on-surface-variant font-medium">
                  Showing {searchResults.length > 0 ? offset + 1 : 0}–
                  {offset + searchResults.length}
                  <span className="text-outline mx-1.5">•</span>
                  Page {page}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPage((p) => Math.max(1, p - 1));
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    disabled={page <= 1 || bricksQuery.isLoading}
                    className="flex items-center gap-1 px-3.5 py-2 bg-surface-container hover:bg-surface-container-high border border-outline-variant/60 rounded-xl text-xs font-bold text-on-surface disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 cursor-pointer shadow-2xs"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>

                  <span className="px-3 py-1.5 rounded-lg bg-surface-container-lowest border border-outline-variant/60 text-xs font-bold font-mono text-primary shadow-2xs">
                    {page}
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      setPage((p) => p + 1);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    disabled={
                      searchResults.length < PAGE_SIZE || bricksQuery.isLoading
                    }
                    className="flex items-center gap-1 px-3.5 py-2 bg-surface-container hover:bg-surface-container-high border border-outline-variant/60 rounded-xl text-xs font-bold text-on-surface disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 cursor-pointer shadow-2xs"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Brick detail modal */}
      <BrickDetailModal
        isOpen={Boolean(detailBrickId) && !savingBrick && !savingIsland}
        brickId={detailBrickId}
        onClose={() => setDetailBrickId(null)}
        onRetrieval={onNavigateToRetrieval}
        onEdit={onNavigateToEditBrick}
        onAddToIsland={(brick) => setSavingBrick(brick)}
        onAddIsland={handleOpenAddIsland}
        isLoggedIn={isLoggedIn}
        currentLearnerId={learner?.id}
        onOpenAuth={onOpenAuth}
      />

      {/* Add brick or island Modal */}
      <SaveToIslandModal
        isOpen={Boolean(savingBrick || savingIsland)}
        mode={savingIsland ? "island" : "brick"}
        brick={
          savingBrick
            ? {
                targetText: savingBrick.target_text,
                nativeText: savingBrick.native_text,
              }
            : null
        }
        islandToCopy={savingIsland}
        islands={islands}
        isSaving={
          addBrickMutation.isPending ||
          addBricksFromIslandMutation.isPending ||
          createIslandMutation.isPending
        }
        onSave={(targetIslandId) => {
          if (savingIsland) {
            handleSaveIslandToTarget(targetIslandId);
          } else if (savingBrick) {
            handleSaveToIsland(targetIslandId);
          }
        }}
        onCreateAndSave={handleCreateAndSave}
        onClose={() => {
          setSavingBrick(null);
          setSavingIsland(null);
        }}
      />

      {/* Report brick dialog */}
      <ReportBrickModal
        isOpen={Boolean(reportingBrick)}
        brickId={reportingBrick?.brickId ?? null}
        targetText={reportingBrick?.targetText}
        onClose={() => setReportingBrick(null)}
      />

      {/* Floating scroll to top */}
      {showScrollTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-40 p-3.5 rounded-full bg-primary text-on-primary shadow-xl hover:shadow-2xl hover:bg-primary/95 transition-all active:scale-90 cursor-pointer animate-in fade-in zoom-in duration-200"
          title="Scroll to top"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
