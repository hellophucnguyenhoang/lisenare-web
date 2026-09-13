import { useState, useRef, useCallback, useEffect } from "react";
import { type Collection, type Brick } from "@/types";
import BrickCard from "@/components/collections/BrickCard";
import AddCollectionModal from "@/components/collections/AddCollectionModal";
import {
  Plus,
  Search,
  ChevronDown,
  Check,
  FolderPlus,
  Pencil,
  Trash2,
  SlidersHorizontal,
} from "lucide-react";
import {
  useCollections,
  useDeleteCollection,
  useUpdateCollection,
  useCreateCollection,
} from "@/hooks/useCollections";
import { useInfiniteBricks, useDeleteBrick } from "@/hooks/useBricks";
import { useLearnerMe } from "@/hooks/useLearner";
import { type AuthMode } from "@/types";
import { useHeader } from "@/context/HeaderContext";

interface BricksPageProps {
  onNavigateToAddBrick: (collectionId?: number) => void;
  onNavigateToEditBrick: (brick: Brick) => void;
  onNavigateToPractice: (brickId?: number) => void;
  onNavigateToSearch: () => void;
  onOpenAuth?: (mode: AuthMode) => void;
}

export default function BricksPage({
  onNavigateToAddBrick,
  onNavigateToEditBrick,
  onNavigateToPractice,
  onNavigateToSearch,
  onOpenAuth,
}: BricksPageProps) {
  const { data: learner } = useLearnerMe();
  const isLoggedIn = Boolean(learner);

  // Collection filter state
  const [selectedCollectionId, setSelectedCollectionId] = useState<
    number | null
  >(null);
  const [showCollectionDropdown, setShowCollectionDropdown] = useState(false);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(
    null,
  );

  // Sort and filter state
  type BrickSortType = "NEWEST" | "AZ" | "ZA";
  type BrickStatusFilter = "LEARNED" | "NOT_LEARNED" | null;

  const [sortBy, setSortBy] = useState<BrickSortType>("NEWEST");
  const [statusFilter, setStatusFilter] = useState<BrickStatusFilter>(null);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Hooks
  const { data: collections = [], isLoading: isLoadingCollections } =
    useCollections(isLoggedIn);

  const {
    data: bricksPages,
    isLoading: isLoadingBricks,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteBricks(
    {
      collection_ids: selectedCollectionId ? [selectedCollectionId] : undefined,
      status: statusFilter ?? undefined,
      sort_by: sortBy,
      limit: 20,
    },
    isLoggedIn,
  );

  const allBricks = bricksPages?.pages.flatMap((page) => page.items) ?? [];
  const totalBricks = bricksPages?.pages[0]?.total ?? 0;
  const hasActiveFilters = statusFilter !== null || sortBy !== "NEWEST";

  const deleteCollection = useDeleteCollection();
  const updateCollection = useUpdateCollection();
  const createCollection = useCreateCollection();
  const deleteBrick = useDeleteBrick();

  // Refs for click-outside
  const dropdownRef = useRef<HTMLDivElement>(null);
  const filterDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowCollectionDropdown(false);
      }
      if (
        filterDropdownRef.current &&
        !filterDropdownRef.current.contains(e.target as Node)
      ) {
        setShowFilterDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Infinite scroll observer
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (observerRef.current) observerRef.current.disconnect();
      if (!node) return;
      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        },
        { threshold: 0.1 },
      );
      observerRef.current.observe(node);
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage],
  );

  const selectedCollection = selectedCollectionId
    ? collections.find((c) => c.id === selectedCollectionId)
    : null;

  const handleAddCollection = (data: {
    name: string;
    description: string;
    tags: string[];
  }) => {
    createCollection.mutate(data);
  };

  const handleEditCollection = (
    id: number,
    data: { name: string; description: string; tags: string[] },
  ) => {
    updateCollection.mutate({ collectionId: id, data });
  };

  const handleDeleteCollection = (id: number) => {
    if (
      confirm(`Delete this collection? All bricks inside will also be deleted.`)
    ) {
      deleteCollection.mutate(id);
      if (selectedCollectionId === id) {
        setSelectedCollectionId(null);
      }
    }
  };

  // Determine which collection to add brick to
  const handleAddBrick = useCallback(() => {
    onNavigateToAddBrick(selectedCollectionId ?? undefined);
  }, [onNavigateToAddBrick, selectedCollectionId]);

  const { setHeaderContent } = useHeader();

  // Dynamically update the fixed sticky header with brick stats & Add Brick action
  useEffect(() => {
    if (!isLoggedIn) {
      setHeaderContent(null);
      return;
    }
    setHeaderContent(
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-on-surface-variant hidden sm:inline">
          {totalBricks} brick{totalBricks !== 1 ? "s" : ""}
        </span>
        <button
          type="button"
          onClick={handleAddBrick}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-on-primary font-bold text-xs rounded-xl hover:bg-primary/95 active:scale-95 transition-all shadow-xs cursor-pointer"
          title="Add new brick"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Add Brick</span>
        </button>
      </div>,
    );
    return () => setHeaderContent(null);
  }, [isLoggedIn, totalBricks, handleAddBrick, setHeaderContent]);

  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center animate-in fade-in duration-300 flex flex-col items-center">
        <div className="w-16 h-16 rounded-2xl bg-white border border-primary/20 shadow-xs flex items-center justify-center mb-5 overflow-hidden p-3">
          <img
            src="/favicon.svg"
            alt="Lisenare Logo"
            className="w-full h-full object-contain rounded-xl"
          />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold font-display text-on-surface mb-2">
          Your Bricks
        </h2>
        <p className="text-xs text-on-surface-variant max-w-xs mb-6 leading-relaxed">
          Sign in to view, create, organize, and search your vocabulary
          collections.
        </p>
        {onOpenAuth && (
          <button
            type="button"
            onClick={() => onOpenAuth("login")}
            className="py-3 px-6 bg-primary hover:bg-primary/95 text-on-primary font-bold text-xs rounded-xl shadow-xs transition-all active:scale-98 cursor-pointer"
          >
            Log In to View Bricks
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-28 animate-in fade-in duration-300">
      {/* Page Header */}
      <section className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-on-surface">
            {totalBricks} Brick{totalBricks !== 1 ? "s" : ""}
          </h2>
          <p className="text-on-surface-variant text-xs sm:text-sm mt-0.5 max-w-lg">
            {selectedCollection ? ` in "${selectedCollection.name}"` : ""}
            {statusFilter === "LEARNED"
              ? " • Learned"
              : statusFilter === "NOT_LEARNED"
                ? " • Not Learned"
                : ""}
            {sortBy === "NEWEST"
              ? " • newest"
              : sortBy === "AZ"
                ? " • a-z"
                : sortBy === "ZA"
                  ? "z-a"
                  : ""}
          </p>
        </div>
      </section>

      {/* Filter Bar: Collection selector + Sort controls + Context Search Button */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        {/* Collection Filter Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowCollectionDropdown(!showCollectionDropdown)}
            className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-medium transition-all cursor-pointer min-w-[180px] justify-between ${
              selectedCollectionId
                ? "bg-primary/5 border-primary/30 text-primary"
                : "bg-surface-container-lowest border-outline-variant/60 text-on-surface-variant"
            }`}
          >
            <span className="truncate text-xs">
              {selectedCollection?.name || "All Collections"}
            </span>
            <ChevronDown
              className={`w-4 h-4 shrink-0 transition-transform ${
                showCollectionDropdown ? "rotate-180" : ""
              }`}
            />
          </button>

          {showCollectionDropdown && (
            <div className="absolute left-0 top-full mt-1.5 z-30 w-72 bg-surface-container-lowest border border-outline-variant/60 rounded-xl shadow-lg animate-in fade-in zoom-in-95 duration-150 max-h-80 overflow-y-auto">
              {/* "All Collections" option */}
              <button
                onClick={() => {
                  setSelectedCollectionId(null);
                  setShowCollectionDropdown(false);
                }}
                className={`w-full px-4 py-2.5 text-left text-xs font-semibold flex items-center justify-between hover:bg-surface-container transition-colors ${
                  !selectedCollectionId
                    ? "text-primary bg-primary/5"
                    : "text-on-surface"
                }`}
              >
                <span>All Collections</span>
                {!selectedCollectionId && (
                  <Check className="w-4 h-4 text-primary" />
                )}
              </button>

              <div className="h-px bg-outline-variant/30 mx-3" />

              {isLoadingCollections ? (
                <div className="p-4 flex justify-center">
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                collections.map((col) => (
                  <div key={col.id} className="relative group">
                    <button
                      onClick={() => {
                        setSelectedCollectionId(col.id);
                        setShowCollectionDropdown(false);
                      }}
                      className={`w-full px-4 py-2.5 text-left text-xs font-medium flex items-center justify-between hover:bg-surface-container transition-colors ${
                        selectedCollectionId === col.id
                          ? "text-primary bg-primary/5 font-semibold"
                          : "text-on-surface"
                      }`}
                    >
                      <div className="flex flex-col min-w-0">
                        <span className="truncate">{col.name}</span>
                        <span className="text-[10px] text-outline font-normal">
                          {col.brickCount ?? 0} bricks
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {selectedCollectionId === col.id && (
                          <Check className="w-4 h-4 text-primary" />
                        )}
                        {/* Inline edit/delete on hover */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingCollection(col);
                            setShowCollectionDropdown(false);
                          }}
                          className="p-1 rounded-md text-outline hover:text-primary hover:bg-primary/10 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                          title="Edit collection"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowCollectionDropdown(false);
                            handleDeleteCollection(col.id);
                          }}
                          className="p-1 rounded-md text-outline hover:text-error hover:bg-error/10 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                          title="Delete collection"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </button>
                  </div>
                ))
              )}

              <div className="h-px bg-outline-variant/30 mx-3" />

              {/* Create new collection inline */}
              <button
                onClick={() => {
                  setShowCollectionDropdown(false);
                  setShowCollectionModal(true);
                }}
                className="w-full px-4 py-2.5 text-left text-xs font-semibold text-primary flex items-center gap-2 hover:bg-primary/5 transition-colors cursor-pointer"
              >
                <FolderPlus className="w-4 h-4" />
                <span>New Collection</span>
              </button>
            </div>
          )}
        </div>

        {/* Right side: Sort & Filter + Search Button */}
        <div className="flex items-center gap-2">
          {/* Sort & Filter Dropdown Button (icon-only) */}
          <div className="relative" ref={filterDropdownRef}>
            <button
              type="button"
              id="btn-sort-filter"
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className={`relative p-2.5 border rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer flex items-center justify-center ${
                hasActiveFilters
                  ? "bg-primary/10 border-primary/40 text-primary"
                  : "bg-surface-container-lowest hover:bg-surface-container-high border-outline-variant/60 hover:border-primary/40 text-on-surface"
              }`}
              title="Sort and filter"
              aria-label="Sort and filter"
            >
              <SlidersHorizontal className="w-4 h-4 text-primary" />
              {hasActiveFilters && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary ring-2 ring-surface" />
              )}
            </button>

            {showFilterDropdown && (
              <div className="absolute right-0 top-full mt-1.5 z-30 w-56 bg-surface-container-lowest border border-outline-variant/60 rounded-xl shadow-lg p-3 space-y-3 animate-in fade-in zoom-in-95 duration-150">
                {/* Status Filter */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-outline px-2 block">
                    Status
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setStatusFilter(null);
                    }}
                    className={`w-full px-2.5 py-1.5 text-xs font-medium rounded-lg flex items-center justify-between hover:bg-surface-container transition-colors cursor-pointer ${
                      statusFilter === null
                        ? "text-primary bg-primary/10 font-semibold"
                        : "text-on-surface"
                    }`}
                  >
                    <span>All</span>
                    {statusFilter === null && (
                      <Check className="w-3.5 h-3.5 text-primary" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStatusFilter("LEARNED");
                    }}
                    className={`w-full px-2.5 py-1.5 text-xs font-medium rounded-lg flex items-center justify-between hover:bg-surface-container transition-colors cursor-pointer ${
                      statusFilter === "LEARNED"
                        ? "text-primary bg-primary/10 font-semibold"
                        : "text-on-surface"
                    }`}
                  >
                    <span>Learned</span>
                    {statusFilter === "LEARNED" && (
                      <Check className="w-3.5 h-3.5 text-primary" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStatusFilter("NOT_LEARNED");
                    }}
                    className={`w-full px-2.5 py-1.5 text-xs font-medium rounded-lg flex items-center justify-between hover:bg-surface-container transition-colors cursor-pointer ${
                      statusFilter === "NOT_LEARNED"
                        ? "text-primary bg-primary/10 font-semibold"
                        : "text-on-surface"
                    }`}
                  >
                    <span>Not Learned</span>
                    {statusFilter === "NOT_LEARNED" && (
                      <Check className="w-3.5 h-3.5 text-primary" />
                    )}
                  </button>
                </div>

                <div className="h-px bg-outline-variant/30" />

                {/* Sort By */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-outline px-2 block">
                    Sort By
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSortBy("NEWEST");
                    }}
                    className={`w-full px-2.5 py-1.5 text-xs font-medium rounded-lg flex items-center justify-between hover:bg-surface-container transition-colors cursor-pointer ${
                      sortBy === "NEWEST"
                        ? "text-primary bg-primary/10 font-semibold"
                        : "text-on-surface"
                    }`}
                  >
                    <span>Newest</span>
                    {sortBy === "NEWEST" && (
                      <Check className="w-3.5 h-3.5 text-primary" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSortBy("AZ");
                    }}
                    className={`w-full px-2.5 py-1.5 text-xs font-medium rounded-lg flex items-center justify-between hover:bg-surface-container transition-colors cursor-pointer ${
                      sortBy === "AZ"
                        ? "text-primary bg-primary/10 font-semibold"
                        : "text-on-surface"
                    }`}
                  >
                    <span>A to Z</span>
                    {sortBy === "AZ" && (
                      <Check className="w-3.5 h-3.5 text-primary" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSortBy("ZA");
                    }}
                    className={`w-full px-2.5 py-1.5 text-xs font-medium rounded-lg flex items-center justify-between hover:bg-surface-container transition-colors cursor-pointer ${
                      sortBy === "ZA"
                        ? "text-primary bg-primary/10 font-semibold"
                        : "text-on-surface"
                    }`}
                  >
                    <span>Z to A</span>
                    {sortBy === "ZA" && (
                      <Check className="w-3.5 h-3.5 text-primary" />
                    )}
                  </button>
                </div>

                {hasActiveFilters && (
                  <>
                    <div className="h-px bg-outline-variant/30" />
                    <button
                      type="button"
                      onClick={() => {
                        setStatusFilter(null);
                        setSortBy("NEWEST");
                      }}
                      className="w-full text-center py-1 text-xs text-primary font-semibold hover:underline cursor-pointer"
                    >
                      Reset filters
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Context Search Button */}
          <button
            type="button"
            id="btn-open-context-search"
            onClick={onNavigateToSearch}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-surface-container-lowest hover:bg-surface-container-high border border-outline-variant/60 hover:border-primary/40 text-on-surface font-semibold text-xs rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
            title="Search Bricks & Videos by Context"
          >
            <Search className="w-4 h-4 text-primary" />
            <span className="hidden sm:inline">Search</span>
          </button>
        </div>
      </div>

      {/* Bricks Grid */}
      {isLoadingBricks ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : allBricks.length === 0 ? (
        <div className="border-2 border-dashed border-outline-variant/60 rounded-2xl p-10 text-center bg-surface-container-lowest/50">
          <h3 className="text-base font-bold text-on-surface">
            {statusFilter !== null ? "No Bricks Found" : "No Bricks Yet"}
          </h3>
          <p className="text-xs text-on-surface-variant max-w-sm mx-auto mt-1 mb-4">
            {statusFilter !== null
              ? `No ${statusFilter === "LEARNED" ? "learned" : "unlearned"} bricks found with the current filter.`
              : "Start building your vocabulary by adding your first brick."}
          </p>
          {statusFilter !== null ? (
            <button
              onClick={() => setStatusFilter(null)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary font-bold text-xs rounded-xl hover:bg-primary/95 active:scale-95 transition-all shadow-sm cursor-pointer"
            >
              <span>Clear Filter</span>
            </button>
          ) : (
            <button
              onClick={handleAddBrick}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary font-bold text-xs rounded-xl hover:bg-primary/95 active:scale-95 transition-all shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Your First Brick</span>
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {allBricks.map((brick) => (
              <BrickCard
                key={brick.id}
                brick={brick}
                onEditBrick={onNavigateToEditBrick}
                onDeleteBrick={(brickId: number) => deleteBrick.mutate(brickId)}
                onSelectBrick={() => onNavigateToPractice(brick.id)}
                onStudyBrick={() => onNavigateToPractice(brick.id)}
              />
            ))}
          </div>

          {/* Infinite scroll sentinel */}
          {hasNextPage && (
            <div ref={loadMoreRef} className="flex justify-center py-8">
              {isFetchingNextPage ? (
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <span className="text-xs text-outline">Loading more...</span>
              )}
            </div>
          )}
        </>
      )}

      {/* Add / Edit Collection Modal */}
      {(showCollectionModal || editingCollection) && (
        <AddCollectionModal
          onClose={() => {
            setShowCollectionModal(false);
            setEditingCollection(null);
          }}
          onAddCollection={handleAddCollection}
          onEditCollection={handleEditCollection}
          collectionToEdit={editingCollection || undefined}
        />
      )}
    </div>
  );
}
