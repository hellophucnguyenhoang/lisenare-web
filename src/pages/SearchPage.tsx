import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Search, X, User, Globe, Play } from "lucide-react";
import { useSearchContextBricks } from "@/hooks/useContextSearch";
import { useLearnerMe } from "@/hooks/useLearner";
import { useCollections, useCreateCollection } from "@/hooks/useCollections";
import { useAddBrickFrom, useAddBricksFromCollection } from "@/hooks/useBricks";
import { type Brick, type AuthMode } from "@/types";
import PlainTextInput from "@/components/common/PlainTextInput";
import SaveToCollectionModal from "@/components/collections/SaveToCollectionModal";
import BrickDetailModal from "@/components/collections/BrickDetailModal";
import { toast } from "sonner";

interface SearchPageProps {
  onBack: () => void;
  onNavigateToPractice?: (brickId?: number) => void;
  onNavigateToEditBrick?: (brick: Brick) => void;
  onOpenAuth?: (mode: AuthMode) => void;
}

type SearchTab = "yours" | "public";

const POPULAR_SUGGESTIONS = [
  "food",
  "weather",
  "movie",
  "say hello",
  "go to work",
  "watch a movie",
];

export default function SearchPage({
  onBack,
  onNavigateToPractice,
  onNavigateToEditBrick,
  onOpenAuth,
}: SearchPageProps) {
  const { data: learner } = useLearnerMe();
  const isLoggedIn = Boolean(learner);

  const [searchInput, setSearchInput] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [activeTab, setActiveTab] = useState<SearchTab>(
    isLoggedIn ? "yours" : "public",
  );

  const lastAutoSwitchedQueryRef = useRef<string>("");

  // Brick Detail modal state
  const [detailBrickId, setDetailBrickId] = useState<number | null>(null);

  // Collection modal state for "Add Brick"
  const [savingBrick, setSavingBrick] = useState<{
    brick_id: number;
    target_text: string;
    native_text: string;
  } | null>(null);

  // Collection modal state for "Add Collection"
  const [savingCollection, setSavingCollection] = useState<{
    collection_id: number;
    collection_name: string;
  } | null>(null);

  const { data: collections = [] } = useCollections(isLoggedIn);
  const addBrickMutation = useAddBrickFrom();
  const addBricksFromCollectionMutation = useAddBricksFromCollection();
  const createCollectionMutation = useCreateCollection();

  const bricksQuery = useSearchContextBricks(activeQuery, true);

  const bricks = bricksQuery.data ?? [];
  const yoursBricks = bricks.filter((b) => b.is_own);
  const publicBricks = bricks.filter((b) => !b.is_own);

  // Auto-switch to Public if user has 0 bricks in Yours but results exist in Public
  useEffect(() => {
    if (
      activeQuery &&
      !bricksQuery.isLoading &&
      lastAutoSwitchedQueryRef.current !== activeQuery
    ) {
      lastAutoSwitchedQueryRef.current = activeQuery;
      const timer = setTimeout(() => {
        if (yoursBricks.length === 0 && publicBricks.length > 0) {
          setActiveTab("public");
        } else if (yoursBricks.length > 0) {
          setActiveTab("yours");
        }
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [
    activeQuery,
    bricksQuery.isLoading,
    yoursBricks.length,
    publicBricks.length,
  ]);

  const handleSearchSubmit = (e?: React.SubmitEvent) => {
    if (e) e.preventDefault();
    const trimmed = searchInput.trim();
    if (trimmed) {
      setActiveQuery(trimmed);
    }
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setSearchInput(suggestion);
    setActiveQuery(suggestion);
  };

  const handleCardClick = (brickId: number) => {
    if (!isLoggedIn) {
      toast.error("Please sign in to view brick details.");
      onOpenAuth?.("login");
      return;
    }
    setDetailBrickId(brickId);
  };

  const handleOpenAddToCollection = (brick: {
    brick_id: number;
    target_text: string;
    native_text: string;
  }) => {
    if (!isLoggedIn) {
      toast.error("Please sign in to save bricks to your collection.");
      onOpenAuth?.("login");
      return;
    }
    setSavingBrick(brick);
  };

  const handleOpenAddCollection = (collection: {
    collection_id: number;
    collection_name: string;
  }) => {
    if (!isLoggedIn) {
      toast.error("Please sign in to add collections to your library.");
      onOpenAuth?.("login");
      return;
    }
    setSavingCollection(collection);
  };

  const handleSaveToCollection = (collectionId: number) => {
    if (!savingBrick) return;

    addBrickMutation.mutate(
      { brickId: savingBrick.brick_id, collectionId },
      {
        onSuccess: () => {
          toast.success("Brick added to your collection!");
          setSavingBrick(null);
          setDetailBrickId(null);
        },
        onError: (err: unknown) => {
          const errorObj = err as
            | { status?: number; detail?: string; message?: string }
            | undefined;
          const detail = errorObj?.detail || errorObj?.message || "";
          if (
            errorObj?.status === 409 ||
            detail.toLowerCase().includes("already have a brick") ||
            detail.toLowerCase().includes("duplicate")
          ) {
            toast.error(
              "You already have a brick with this target text in your collection.",
            );
          } else {
            toast.error(detail || "Failed to add brick to collection.");
          }
        },
      },
    );
  };

  const handleSaveCollectionToTarget = (targetCollectionId: number) => {
    if (!savingCollection) return;

    addBricksFromCollectionMutation.mutate(
      {
        collectionId: savingCollection.collection_id,
        targetCollectionId,
      },
      {
        onSuccess: (result) => {
          if (result.added === 0) {
            toast.info(
              "All bricks from this collection are already in your collection.",
            );
          } else if (result.skipped > 0) {
            toast.success(
              `Added ${result.added} new bricks to your collection (${result.skipped} skipped as already existing).`,
            );
          } else {
            toast.success(
              `Added all ${result.added} bricks to your collection!`,
            );
          }
          setSavingCollection(null);
          setDetailBrickId(null);
        },
        onError: (err: unknown) => {
          const errorObj = err as
            | { detail?: string; message?: string }
            | undefined;
          toast.error(
            errorObj?.detail ||
              errorObj?.message ||
              "Failed to add collection.",
          );
        },
      },
    );
  };

  const handleCreateAndSave = async (name: string) => {
    try {
      const created = await createCollectionMutation.mutateAsync({
        name,
        description: "",
        tags: [],
      });
      if (savingCollection) {
        handleSaveCollectionToTarget(created.id);
      } else if (savingBrick) {
        handleSaveToCollection(created.id);
      }
    } catch (err: unknown) {
      const errorObj = err as { detail?: string; message?: string } | undefined;
      toast.error(
        errorObj?.detail || errorObj?.message || "Failed to create collection.",
      );
    }
  };

  const currentTabBricks = activeTab === "yours" ? yoursBricks : publicBricks;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-28 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={onBack}
          className="p-2 -ml-2 rounded-full hover:bg-surface-container transition-all active:scale-95 cursor-pointer text-on-surface"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-on-surface">
            Search Bricks
          </h1>
          <p className="text-xs text-on-surface-variant">
            Explore and search bricks in real context across collections
          </p>
        </div>
      </div>

      {/* Search Input Bar */}
      <form onSubmit={handleSearchSubmit} className="relative mb-6">
        <div className="relative flex items-center">
          <PlainTextInput
            id="input-search-context"
            value={searchInput}
            onChange={setSearchInput}
            placeholder="Type a word or phrase (e.g. coffee, interview)..."
            className="w-full h-14 pl-12 pr-28 rounded-2xl bg-surface-container-lowest border-2 border-outline-variant/60 focus-within:border-primary text-sm font-medium transition-all shadow-xs"
          />
          <Search className="w-5 h-5 text-outline absolute left-4 pointer-events-none" />

          <div className="absolute right-2.5 flex items-center gap-1.5">
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput("");
                  setActiveQuery("");
                }}
                className="p-1.5 text-outline hover:text-on-surface rounded-full transition-colors cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="submit"
              disabled={!searchInput.trim() || bricksQuery.isLoading}
              className="px-4 py-2 bg-primary hover:bg-primary/95 text-on-primary rounded-xl text-xs font-bold transition-all active:scale-95 disabled:opacity-50 cursor-pointer shadow-xs"
            >
              {bricksQuery.isLoading ? "Searching..." : "Search"}
            </button>
          </div>
        </div>
      </form>

      {/* Suggestions if no search query */}
      {!activeQuery && (
        <div className="space-y-6 pt-4">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-outline mb-3">
              Suggested searches
            </h2>
            <div className="flex flex-wrap gap-2">
              {POPULAR_SUGGESTIONS.map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => handleSelectSuggestion(sug)}
                  className="px-3.5 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-xs font-medium text-on-surface transition-all active:scale-95 cursor-pointer border border-outline-variant/40"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results Section */}
      {activeQuery && (
        <div className="space-y-6">
          {/* Tabs: Yours vs Public */}
          <div className="flex items-center gap-2 border-b border-outline-variant/60 pb-1">
            <button
              type="button"
              onClick={() => setActiveTab("yours")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "yours"
                  ? "bg-primary text-on-primary shadow-xs"
                  : "text-on-surface-variant hover:bg-surface-container"
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
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "public"
                  ? "bg-primary text-on-primary shadow-xs"
                  : "text-on-surface-variant hover:bg-surface-container"
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

          {/* Tab Content: Bricks */}
          {bricksQuery.isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-on-surface-variant font-medium">
                Searching for matching bricks...
              </span>
            </div>
          ) : currentTabBricks.length === 0 ? (
            <div className="border-2 border-dashed border-outline-variant/60 rounded-2xl p-10 text-center bg-surface-container-lowest/50">
              <p className="text-sm font-bold text-on-surface mb-1">
                {activeTab === "yours"
                  ? "No matching bricks in your collection"
                  : "No public bricks found"}
              </p>
              <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
                {activeTab === "yours"
                  ? `You haven't saved any bricks for "${activeQuery}" yet.`
                  : `No community bricks matched "${activeQuery}".`}
              </p>
              {activeTab === "yours" && publicBricks.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab("public")}
                  className="mt-4 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold rounded-xl transition-all inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>View {publicBricks.length} in Public</span>
                </button>
              )}
              {activeTab === "public" && yoursBricks.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab("yours")}
                  className="mt-4 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold rounded-xl transition-all inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>View {yoursBricks.length} in Yours</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {currentTabBricks.map((brick) => {
                return (
                  <div
                    key={brick.brick_id}
                    onClick={() => handleCardClick(brick.brick_id)}
                    className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-primary/40 hover:shadow-md transition-all group cursor-pointer"
                  >
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold font-display text-primary leading-snug group-hover:text-primary/90 transition-colors">
                        {brick.target_text}
                      </h3>
                      <p className="text-xs text-on-surface-variant italic">
                        {brick.native_text}
                      </p>
                    </div>

                    {brick.is_own && onNavigateToPractice && (
                      <div className="pt-3 mt-4 border-t border-outline-variant/30 flex items-center justify-end">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigateToPractice(brick.brick_id);
                          }}
                          className="px-3.5 py-1.5 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 text-primary" />
                          <span>Practice</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal: Brick Details */}
      <BrickDetailModal
        isOpen={Boolean(detailBrickId) && !savingBrick && !savingCollection}
        brickId={detailBrickId}
        onClose={() => setDetailBrickId(null)}
        onPractice={onNavigateToPractice}
        onEdit={onNavigateToEditBrick}
        onAddToCollection={handleOpenAddToCollection}
        onAddCollection={handleOpenAddCollection}
        isLoggedIn={isLoggedIn}
        currentLearnerId={learner?.id}
        onOpenAuth={onOpenAuth}
      />

      {/* Modal: Add Brick or Collection to Library */}
      <SaveToCollectionModal
        isOpen={Boolean(savingBrick || savingCollection)}
        mode={savingCollection ? "collection" : "brick"}
        brick={
          savingBrick
            ? {
                targetText: savingBrick.target_text,
                nativeText: savingBrick.native_text,
              }
            : null
        }
        collectionToCopy={savingCollection}
        collections={collections}
        isSaving={
          addBrickMutation.isPending ||
          addBricksFromCollectionMutation.isPending ||
          createCollectionMutation.isPending
        }
        onSave={(targetCollectionId) => {
          if (savingCollection) {
            handleSaveCollectionToTarget(targetCollectionId);
          } else if (savingBrick) {
            handleSaveToCollection(targetCollectionId);
          }
        }}
        onCreateAndSave={handleCreateAndSave}
        onClose={() => {
          setSavingBrick(null);
          setSavingCollection(null);
        }}
      />
    </div>
  );
}
