import { useState, useRef, useCallback, useEffect } from "react";
import { type Collection, type Brick, type SortOption } from "@/types";
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
} from "lucide-react";
import {
  useCollections,
  useDeleteCollection,
  useUpdateCollection,
  useCreateCollection,
} from "@/hooks/useCollections";
import { useInfiniteBricks, useDeleteBrick } from "@/hooks/useBricks";

interface BricksPageProps {
  onNavigateToAddBrick: (collectionId?: number) => void;
  onNavigateToEditBrick: (brick: Brick) => void;
  onNavigateToPractice: (brickId?: number) => void;
  onNavigateToSearch: () => void;
}

export default function BricksPage({
  onNavigateToAddBrick,
  onNavigateToEditBrick,
  onNavigateToPractice,
  onNavigateToSearch,
}: BricksPageProps) {
  // Collection filter state
  const [selectedCollectionId, setSelectedCollectionId] = useState<
    number | null
  >(null);
  const [showCollectionDropdown, setShowCollectionDropdown] = useState(false);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(
    null,
  );

  // Sort state
  const [sortType, setSortType] = useState<SortOption>("newest");

  // Hooks
  const { data: collections = [], isLoading: isLoadingCollections } =
    useCollections();

  const sortByApi =
    sortType === "newest"
      ? "NEWEST"
      : sortType === "az"
        ? "AZ"
        : sortType === "za"
          ? "ZA"
          : undefined;

  const {
    data: bricksPages,
    isLoading: isLoadingBricks,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteBricks({
    collection_ids: selectedCollectionId ? [selectedCollectionId] : undefined,
    sort_by: sortByApi as "NEWEST" | "AZ" | "ZA" | undefined,
    limit: 20,
  });

  const allBricks =
    bricksPages?.pages.flatMap((page) => page.items) ?? [];
  const totalBricks = bricksPages?.pages[0]?.total ?? 0;

  const deleteCollection = useDeleteCollection();
  const updateCollection = useUpdateCollection();
  const createCollection = useCreateCollection();
  const deleteBrick = useDeleteBrick();

  // Refs for click-outside
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowCollectionDropdown(false);
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
      confirm(
        `Delete this collection? All bricks inside will also be deleted.`,
      )
    ) {
      deleteCollection.mutate(id);
      if (selectedCollectionId === id) {
        setSelectedCollectionId(null);
      }
    }
  };

  // Determine which collection to add brick to
  const handleAddBrick = () => {
    onNavigateToAddBrick(selectedCollectionId ?? undefined);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-28 animate-in fade-in duration-300">
      {/* Page Header */}
      <section className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-on-surface">
            Bricks
          </h2>
          <p className="text-on-surface-variant text-xs sm:text-sm mt-0.5 max-w-lg">
            {totalBricks} vocabulary brick{totalBricks !== 1 ? "s" : ""}
            {selectedCollection ? ` in "${selectedCollection.name}"` : ""}
          </p>
        </div>

        <button
          onClick={handleAddBrick}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary font-bold text-xs rounded-xl hover:bg-primary/95 active:scale-95 transition-all shadow-sm shrink-0 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Brick</span>
        </button>
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

        {/* Right side: Sort Controls & Search Button */}
        <div className="flex items-center gap-2.5">
          {/* Sort Controls */}
          <div className="flex items-center gap-1 bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-1 text-xs shrink-0">
            <button
              type="button"
              onClick={() => setSortType("newest")}
              className={`px-2.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                sortType === "newest"
                  ? "bg-primary text-on-primary font-bold shadow-xs"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Newest
            </button>
            <button
              type="button"
              onClick={() => setSortType("az")}
              className={`px-2.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                sortType === "az"
                  ? "bg-primary text-on-primary font-bold shadow-xs"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              A-Z
            </button>
            <button
              type="button"
              onClick={() => setSortType("za")}
              className={`px-2.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                sortType === "za"
                  ? "bg-primary text-on-primary font-bold shadow-xs"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Z-A
            </button>
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
          <h3 className="text-base font-bold text-on-surface">No Bricks Yet</h3>
          <p className="text-xs text-on-surface-variant max-w-sm mx-auto mt-1 mb-4">
            Start building your vocabulary by adding your first brick.
          </p>
          <button
            onClick={handleAddBrick}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary font-bold text-xs rounded-xl hover:bg-primary/95 active:scale-95 transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Your First Brick</span>
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {allBricks.map((brick) => (
              <BrickCard
                key={brick.id}
                brick={brick}
                onEditBrick={onNavigateToEditBrick}
                onDeleteBrick={(brickId: number) =>
                  deleteBrick.mutate(brickId)
                }
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
