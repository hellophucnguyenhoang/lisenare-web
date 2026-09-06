import { useState } from "react";
import { type Collection, type Brick, type SortOption } from "@/types";
import BrickCard from "@/components/collections/BrickCard";
import CollectionCard from "@/components/collections/CollectionCard";
import AddCollectionModal from "@/components/collections/AddCollectionModal";
import { Plus, ArrowLeft, X, Search } from "lucide-react";
import {
  useCollections,
  useDeleteCollection,
  useUpdateCollection,
  useCreateCollection,
} from "@/hooks/useCollections";
import { useBricks, useDeleteBrick } from "@/hooks/useBricks";

interface CollectionsPageProps {
  selectedCollectionId?: number | null;
  onSelectCollection?: (id: number | null) => void;
  onNavigateToAddBrick: (collectionId: number) => void;
  onNavigateToEditBrick: (brickId: number) => void;
  onNavigateToPractice: (brick: Brick) => void;
}

export default function CollectionsPage({
  selectedCollectionId: propSelectedCollectionId,
  onSelectCollection,
  onNavigateToAddBrick,
  onNavigateToEditBrick,
  onNavigateToPractice,
}: CollectionsPageProps) {
  const [internalSelectedId, setInternalSelectedId] = useState<number | null>(
    null,
  );
  const selectedCollectionId =
    propSelectedCollectionId !== undefined
      ? propSelectedCollectionId
      : internalSelectedId;
  const setSelectedCollectionId = onSelectCollection || setInternalSelectedId;
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(
    null,
  );

  // Filters & Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [sortType] = useState<SortOption>("newest");
  const [filterTags] = useState<string[]>([]);

  // Hooks
  const { data: collections = [], isLoading: isLoadingCollections } =
    useCollections();

  const { data: bricksData, isLoading: isLoadingBricks } = useBricks({
    collection_ids: selectedCollectionId ? [selectedCollectionId] : undefined,
  });

  const bricks = bricksData?.items || [];

  const deleteCollection = useDeleteCollection();
  const updateCollection = useUpdateCollection();
  const createCollection = useCreateCollection();
  const deleteBrick = useDeleteBrick();

  const handleAddCollection = (data: {
    name: string;
    description: string;
    tags: string[];
  }) => {
    createCollection.mutate(data);
  };

  const handleEditCollection = (
    id: number,
    data: {
      name: string;
      description: string;
      tags: string[];
    },
  ) => {
    updateCollection.mutate({ collectionId: id, data });
  };

  const handleDeleteCollection = (id: number) => {
    deleteCollection.mutate(id);
    if (selectedCollectionId === id) {
      setSelectedCollectionId(null);
    }
  };

  if (isLoadingCollections) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 1. DETAIL VIEW: Specific Collection
  // ─────────────────────────────────────────────────────────────
  if (selectedCollectionId) {
    const activeCollection = collections.find(
      (c) => c.id === selectedCollectionId,
    );

    // Statistics
    const totalCount = bricks.length;
    const learnedCount = bricks.filter((b) => b.learned).length;
    const progressPercent =
      totalCount > 0 ? Math.round((learnedCount / totalCount) * 100) : 0;

    // Apply Filter & Sort logic on bricks
    let filteredBricks = [...bricks];

    if (filterTags.length > 0) {
      filteredBricks = filteredBricks.filter((b) =>
        b.tags.some((t) => filterTags.includes(t)),
      );
    }

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      filteredBricks = filteredBricks.filter(
        (b) =>
          b.nativeText.toLowerCase().includes(q) ||
          (b.targetText && b.targetText.toLowerCase().includes(q)) ||
          b.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }

    if (sortType === "random") {
      filteredBricks.sort((a) => (a.id % 2 === 0 ? 1 : -1));
    } else if (sortType === "newest") {
      filteredBricks.sort(
        (a, b) =>
          new Date(b.lastEditAt).getTime() - new Date(a.lastEditAt).getTime(),
      );
    } else if (sortType === "oldest") {
      filteredBricks.sort(
        (a, b) =>
          new Date(a.lastEditAt).getTime() - new Date(b.lastEditAt).getTime(),
      );
    } else if (sortType === "az") {
      filteredBricks.sort((a, b) =>
        (a.targetText || "").localeCompare(b.targetText || ""),
      );
    } else if (sortType === "za") {
      filteredBricks.sort((a, b) =>
        (b.targetText || "").localeCompare(a.targetText || ""),
      );
    }

    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-28 animate-in fade-in duration-300">
        {/* Collection Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setSelectedCollectionId(null)}
            className="p-2 -ml-2 rounded-full hover:bg-surface-container transition-all active:scale-95 cursor-pointer"
            aria-label="Back to collections"
          >
            <ArrowLeft className="w-6 h-6 text-on-surface" />
          </button>
          <h1 className="text-xl font-bold font-display text-primary flex items-center gap-2">
            Bricks
          </h1>
        </div>

        {/* Hero Card / Stats block */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-6 shadow-xs">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold font-display text-on-surface">
              {activeCollection?.name}
            </h2>
            <div className="flex items-center gap-3 mt-2">
              <div className="h-2.5 w-36 bg-surface-container rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
              <span className="text-xs font-semibold text-outline">
                {learnedCount} / {totalCount} Learned ({progressPercent}%)
              </span>
            </div>
            {activeCollection?.description && (
              <p className="text-xs text-on-surface-variant max-w-xl mt-2 leading-relaxed">
                {activeCollection.description}
              </p>
            )}
          </div>

          {/* Single Consolidated Action */}
          <button
            onClick={() => onNavigateToAddBrick(selectedCollectionId)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-on-primary font-bold text-xs rounded-xl hover:bg-primary/95 active:scale-95 transition-all shadow-sm cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Brick</span>
          </button>
        </div>

        {/* Search Input for active collection */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
          <input
            type="text"
            placeholder="Search bricks in this collection..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-surface-container-lowest border border-outline-variant/60 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none text-sm transition-all shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Bricks Grid */}
        {isLoadingBricks ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredBricks.length === 0 ? (
          <div className="border-2 border-dashed border-outline-variant/60 rounded-2xl p-10 text-center bg-surface-container-lowest/50">
            <h3 className="text-base font-bold text-on-surface">
              No Bricks Found
            </h3>
            <p className="text-xs text-on-surface-variant max-w-sm mx-auto mt-1 mb-4">
              {searchQuery
                ? "No vocabulary bricks match your search."
                : "Start expanding this collection by adding your first word or phrase."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredBricks.map((brick) => (
              <BrickCard
                key={brick.id}
                brick={brick}
                onEditBrick={onNavigateToEditBrick}
                onDeleteBrick={(brickId: number) => deleteBrick.mutate(brickId)}
                onStudyBrick={onNavigateToPractice}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 2. OVERVIEW: Collections Bento Grid
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-28 animate-in fade-in duration-300">
      {/* Page Title & Consolidated Single Action */}
      <section className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-primary font-bold text-[11px] tracking-wider uppercase">
            Your Vocabulary
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-on-surface mt-0.5">
            Collections
          </h2>
          <p className="text-on-surface-variant text-xs sm:text-sm mt-1 max-w-lg">
            Organize your language journey into topic-based collections.
          </p>
        </div>

        {/* Consolidated Single Creation Button */}
        <button
          id="btn-new-collection"
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary font-bold text-xs rounded-xl hover:bg-primary/95 active:scale-95 transition-all shadow-sm shrink-0 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Collection</span>
        </button>
      </section>

      {/* Collections Grid or Clean Empty State */}
      {collections.length === 0 ? (
        <div className="border-2 border-dashed border-outline-variant/60 rounded-2xl p-12 text-center bg-surface-container-lowest/50">
          <h3 className="text-lg font-bold font-display text-on-surface">
            No Collections Yet
          </h3>
          <p className="text-xs text-on-surface-variant max-w-sm mx-auto mt-1 mb-5 leading-relaxed">
            Create your first vocabulary collection to start building flashcards
            and practicing pronunciation.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.map((col) => (
            <CollectionCard
              key={col.id}
              collection={col}
              onSelectCollection={setSelectedCollectionId}
              onDeleteCollection={handleDeleteCollection}
              onEditCollection={(collectionToEdit: Collection) =>
                setEditingCollection(collectionToEdit)
              }
            />
          ))}
        </div>
      )}

      {/* Add / Edit Collection Modal */}
      {(showAddModal || editingCollection) && (
        <AddCollectionModal
          onClose={() => {
            setShowAddModal(false);
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
