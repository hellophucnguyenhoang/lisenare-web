import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  Search,
  X,
  Plus,
  Check,
  User,
  Globe,
  Play,
} from "lucide-react";
import { useSearchContextBricks } from "@/hooks/useContextSearch";
import { useLearnerMe } from "@/hooks/useLearner";
import { useCollections } from "@/hooks/useCollections";
import { useAddBrickFrom, useCheckBrickExists } from "@/hooks/useBricks";
import { type Brick, type AuthMode } from "@/types";
import { type BrickContextSearch } from "@/api/contextSearch";
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
  "hang out",
  "job interview",
  "coffee shop",
  "daily routine",
  "travel",
  "making friends",
];

function PublicBrickCardAction({
  brick,
  isLoggedIn,
  isAdded,
  onAdd,
}: {
  brick: BrickContextSearch;
  isLoggedIn: boolean;
  isAdded: boolean;
  onAdd: () => void;
}) {
  const { data: alreadyExists } = useCheckBrickExists(
    brick.target_text,
    isLoggedIn && !isAdded,
    0,
  );

  if (isAdded || alreadyExists) {
    return (
      <span
        onClick={(e) => e.stopPropagation()}
        className="px-3 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 rounded-xl flex items-center gap-1.5"
      >
        <Check className="w-3.5 h-3.5" />
        <span>In collection</span>
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onAdd();
      }}
      className="px-3.5 py-1.5 bg-primary hover:bg-primary/95 text-on-primary rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 shadow-xs cursor-pointer"
    >
      <Plus className="w-3.5 h-3.5" />
      <span>Add Brick</span>
    </button>
  );
}

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
  const [addedBrickIds, setAddedBrickIds] = useState<Set<number>>(new Set());

  const { data: collections = [] } = useCollections(isLoggedIn);
  const addBrickMutation = useAddBrickFrom();

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
  }, [activeQuery, bricksQuery.isLoading, yoursBricks.length, publicBricks.length]);

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

  const handleSaveToCollection = (collectionId: number) => {
    if (!savingBrick) return;

    addBrickMutation.mutate(
      { brickId: savingBrick.brick_id, collectionId },
      {
        onSuccess: () => {
          toast.success("Brick added to your collection!");
          setAddedBrickIds((prev) => new Set(prev).add(savingBrick.brick_id));
          setSavingBrick(null);
        },
        onError: (err: unknown) => {
          const errorObj = err as { status?: number; detail?: string; message?: string } | undefined;
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

  const currentTabBricks = activeTab === "yours" ? yoursBricks : publicBricks;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-28 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          type="button"
          onClick={onBack}
          className="p-2 -ml-2 rounded-full hover:bg-surface-container text-on-surface transition-all active:scale-95 cursor-pointer"
          aria-label="Back"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-on-surface">
            Search Bricks
          </h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Search vocabulary and sentences in your collection and the community
          </p>
        </div>
      </div>

      {/* Main Search Input Form */}
      <form onSubmit={handleSearchSubmit} autoComplete="off" className="mb-6">
        <div className="relative flex items-center shadow-xs rounded-2xl bg-surface-container-lowest border border-outline-variant/60 focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
          <div className="pl-4 pr-2 text-primary pointer-events-none">
            <Search className="w-5 h-5" />
          </div>
          <div className="grow">
            <PlainTextInput
              value={searchInput}
              onChange={setSearchInput}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchInput.trim()) {
                  handleSearchSubmit(e as unknown as React.SubmitEvent);
                }
              }}
              placeholder="Search bricks by phrase, meaning, or topic (e.g. coffee shop, job interview)..."
              className="w-full py-3.5 pr-2 bg-transparent text-sm text-on-surface font-medium focus:outline-none"
              autoFocus
            />
          </div>
          {searchInput && (
            <button
              type="button"
              onClick={() => setSearchInput("")}
              className="p-1.5 mr-1 text-outline hover:text-on-surface transition-colors cursor-pointer"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="submit"
            disabled={!searchInput.trim()}
            className="mr-2 px-4 py-2 bg-primary text-on-primary font-bold text-xs rounded-xl shadow-xs hover:bg-primary/95 active:scale-95 transition-all disabled:opacity-40 cursor-pointer shrink-0"
          >
            Search
          </button>
        </div>

        {/* Suggestion Chips */}
        {!activeQuery && (
          <div className="mt-4">
            <span className="text-[11px] font-bold text-outline uppercase tracking-wider block mb-2">
              Popular Searches
            </span>
            <div className="flex flex-wrap gap-2">
              {POPULAR_SUGGESTIONS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => handleSelectSuggestion(item)}
                  className="px-3 py-1.5 bg-surface-container hover:bg-surface-container-high border border-outline-variant/40 rounded-xl text-xs font-medium text-on-surface transition-all active:scale-95 cursor-pointer"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}
      </form>

      {/* Results View when query is active */}
      {activeQuery && (
        <div className="space-y-4">
          {/* Tab Selection: Yours vs Public */}
          <div className="flex border-b border-outline-variant/40 mb-6 gap-2 sm:gap-6">
            <button
              type="button"
              onClick={() => setActiveTab("yours")}
              className={`pb-3 text-xs sm:text-sm font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
                activeTab === "yours"
                  ? "border-primary text-primary"
                  : "border-transparent text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <User className="w-4 h-4" />
              <span>Yours</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === "yours"
                    ? "bg-primary/10 text-primary"
                    : "bg-surface-container text-on-surface-variant"
                }`}
              >
                {yoursBricks.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("public")}
              className={`pb-3 text-xs sm:text-sm font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
                activeTab === "public"
                  ? "border-primary text-primary"
                  : "border-transparent text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>Public</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === "public"
                    ? "bg-primary/10 text-primary"
                    : "bg-surface-container text-on-surface-variant"
                }`}
              >
                {publicBricks.length}
              </span>
            </button>
          </div>

          {/* Loading State */}
          {bricksQuery.isLoading ? (
            <div className="flex justify-center p-16">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : currentTabBricks.length === 0 ? (
            <div className="border-2 border-dashed border-outline-variant/60 rounded-2xl p-10 text-center bg-surface-container-lowest/50">
              {activeTab === "yours" ? (
                <>
                  <User className="w-8 h-8 text-outline mx-auto mb-2 opacity-50" />
                  <h3 className="text-base font-bold text-on-surface">
                    {!isLoggedIn
                      ? "Sign In to View Your Bricks"
                      : "No Bricks in Your Collection"}
                  </h3>
                  <p className="text-xs text-on-surface-variant max-w-sm mx-auto mt-1">
                    {!isLoggedIn
                      ? "Sign in to see and manage your personal bricks matching this search."
                      : `You don't have any bricks matching "${activeQuery}".`}
                  </p>
                  {!isLoggedIn ? (
                    <button
                      type="button"
                      onClick={() => onOpenAuth?.("login")}
                      className="mt-4 px-4 py-2 bg-primary text-on-primary rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
                    >
                      Sign In
                    </button>
                  ) : publicBricks.length > 0 ? (
                    <button
                      type="button"
                      onClick={() => setActiveTab("public")}
                      className="mt-4 px-4 py-2 bg-primary text-on-primary rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>
                        View {publicBricks.length} Public{" "}
                        {publicBricks.length === 1 ? "Brick" : "Bricks"}
                      </span>
                    </button>
                  ) : null}
                </>
              ) : (
                <>
                  <Globe className="w-8 h-8 text-outline mx-auto mb-2 opacity-50" />
                  <h3 className="text-base font-bold text-on-surface">
                    No Public Bricks Found
                  </h3>
                  <p className="text-xs text-on-surface-variant max-w-sm mx-auto mt-1">
                    No public bricks matched "{activeQuery}". Try searching with
                    different keywords.
                  </p>
                  {yoursBricks.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setActiveTab("yours")}
                      className="mt-4 px-4 py-2 bg-primary text-on-primary rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>View {yoursBricks.length} in Yours</span>
                    </button>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {currentTabBricks.map((brick) => {
                const isAdded = addedBrickIds.has(brick.brick_id);

                return (
                  <div
                    key={brick.brick_id}
                    onClick={() => handleCardClick(brick.brick_id)}
                    className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-primary/40 hover:shadow-md transition-all group cursor-pointer"
                  >
                    <div>
                      {/* Text content */}
                      <div className="space-y-1 mb-4">
                        <h3 className="text-lg font-bold font-display text-primary leading-snug group-hover:text-primary/90 transition-colors">
                          {brick.target_text}
                        </h3>
                        <p className="text-xs text-on-surface-variant italic">
                          {brick.native_text}
                        </p>
                      </div>
                    </div>

                    {/* Actions bar */}
                    <div className="pt-3 border-t border-outline-variant/30 flex items-center justify-end gap-2">
                      {brick.is_own ? (
                        /* In Yours tab: only Practice action */
                        onNavigateToPractice && (
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
                        )
                      ) : (
                        /* In Public tab: Add Brick / In collection */
                        <PublicBrickCardAction
                          brick={brick}
                          isLoggedIn={isLoggedIn}
                          isAdded={isAdded}
                          onAdd={() => handleOpenAddToCollection(brick)}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal: Brick Details */}
      <BrickDetailModal
        isOpen={Boolean(detailBrickId)}
        brickId={detailBrickId}
        onClose={() => setDetailBrickId(null)}
        onPractice={onNavigateToPractice}
        onEdit={onNavigateToEditBrick}
        onAddToCollection={handleOpenAddToCollection}
        isLoggedIn={isLoggedIn}
        currentLearnerId={learner?.id}
        onOpenAuth={onOpenAuth}
      />

      {/* Modal: Add Brick to Collection */}
      <SaveToCollectionModal
        isOpen={Boolean(savingBrick)}
        brick={
          savingBrick
            ? {
                targetText: savingBrick.target_text,
                nativeText: savingBrick.native_text,
              }
            : null
        }
        collections={collections}
        isSaving={addBrickMutation.isPending}
        onSave={handleSaveToCollection}
        onClose={() => setSavingBrick(null)}
      />
    </div>
  );
}
