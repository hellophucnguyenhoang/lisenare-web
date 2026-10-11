import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { type Collection, type Brick } from "@/types";
import BrickCard from "@/components/bricks/BrickCard";
import AddCollectionModal from "@/components/bricks/AddCollectionModal";
import ImportCollectionModal from "@/components/bricks/ImportCollectionModal";
import {
  Plus,
  Search,
  ChevronDown,
  Check,
  FolderPlus,
  Pencil,
  Trash2,
  SlidersHorizontal,
  Download,
  Upload,
  X,
  Tag,
  ArrowUp,
} from "lucide-react";
import {
  useCollections,
  useDeleteCollection,
  useUpdateCollection,
  useCreateCollection,
  useExportCollection,
} from "@/hooks/useCollections";
import { useInfiniteBricks, useDeleteBrick } from "@/hooks/useBricks";
import { useLearnerMe } from "@/hooks/useLearner";
import { type AuthMode } from "@/types";
import { useHeader } from "@/context/HeaderContext";
import { toast } from "sonner";

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
  type UnitTypeFilter = "word" | "sentence" | null;

  const [sortBy, setSortBy] = useState<BrickSortType>("NEWEST");
  const [statusFilter, setStatusFilter] = useState<BrickStatusFilter>(null);
  const [unitTypeFilter, setUnitTypeFilter] = useState<UnitTypeFilter>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagInputText, setTagInputText] = useState("");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 350);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
      unit_type: unitTypeFilter ?? undefined,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
      sort_by: sortBy,
      limit: 20,
    },
    isLoggedIn,
  );

  const allBricks = useMemo(
    () => bricksPages?.pages.flatMap((page) => page.items) ?? [],
    [bricksPages],
  );
  const totalBricks = bricksPages?.pages[0]?.total ?? 0;
  const hasActiveFilters =
    statusFilter !== null ||
    unitTypeFilter !== null ||
    selectedTags.length > 0 ||
    sortBy !== "NEWEST";

  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    collections.forEach((c) => c.tags?.forEach((t) => tagSet.add(t.trim())));
    allBricks.forEach((b) => b.tags?.forEach((t) => tagSet.add(t.trim())));
    return Array.from(tagSet).filter(Boolean).sort();
  }, [collections, allBricks]);

  const handleToggleTag = (tag: string) => {
    const clean = tag.replace(/^#/, "").trim();
    if (!clean) return;
    setSelectedTags((prev) =>
      prev.includes(clean) ? prev.filter((t) => t !== clean) : [...prev, clean],
    );
  };

  const handleAddCustomTag = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = tagInputText.replace(/^#/, "").trim();
    if (clean && !selectedTags.includes(clean)) {
      setSelectedTags((prev) => [...prev, clean]);
      setTagInputText("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setSelectedTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleResetFilters = () => {
    setStatusFilter(null);
    setUnitTypeFilter(null);
    setSelectedTags([]);
    setSortBy("NEWEST");
  };

  const deleteCollection = useDeleteCollection();
  const updateCollection = useUpdateCollection();
  const createCollection = useCreateCollection();
  const deleteBrick = useDeleteBrick();
  const exportCollection = useExportCollection();

  const [showImportModal, setShowImportModal] = useState(false);
  const [importTargetCollectionId, setImportTargetCollectionId] = useState<
    number | null
  >(null);

  const handleExportCollection = async (col: Collection) => {
    try {
      toast.info(`Exporting "${col.name}"...`);
      const { data } = await exportCollection.mutateAsync({
        collectionId: col.id,
        collectionName: col.name,
      });
      toast.success(`Exported "${col.name}" (${data.length} bricks)`);
    } catch (err: unknown) {
      console.error("Failed to export collection:", err);
      toast.error(`Failed to export "${col.name}". Please try again.`);
    }
  };

  const handleOpenImportModal = (targetCollectionId?: number | null) => {
    setImportTargetCollectionId(
      targetCollectionId ?? selectedCollectionId ?? null,
    );
    setShowImportModal(true);
  };

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
            {unitTypeFilter === "word"
              ? " • Words"
              : unitTypeFilter === "sentence"
                ? " • Sentences"
                : ""}
            {statusFilter === "LEARNED"
              ? " • Learned"
              : statusFilter === "NOT_LEARNED"
                ? " • Not Learned"
                : ""}
            {selectedTags.length > 0
              ? ` • ${selectedTags.map((t) => `#${t}`).join(", ")}`
              : ""}
            {sortBy === "NEWEST"
              ? " • newest"
              : sortBy === "AZ"
                ? " • a-z"
                : " • z-a"}
          </p>
        </div>

        {selectedCollection && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleExportCollection(selectedCollection)}
              disabled={exportCollection.isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-container-low hover:bg-surface-container border border-outline-variant/60 rounded-xl text-xs font-bold text-on-surface transition-all active:scale-95 shadow-2xs cursor-pointer"
              title={`Export "${selectedCollection.name}" to JSON`}
            >
              <Upload className="w-3.5 h-3.5 text-primary" />
              <span>Export</span>
            </button>

            <button
              type="button"
              onClick={() => handleOpenImportModal(selectedCollection.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-container-low hover:bg-surface-container border border-outline-variant/60 rounded-xl text-xs font-bold text-on-surface transition-all active:scale-95 shadow-2xs cursor-pointer"
              title={`Import JSON into "${selectedCollection.name}"`}
            >
              <Download className="w-3.5 h-3.5 text-primary" />
              <span>Import</span>
            </button>
          </div>
        )}
      </section>

      {/* Filter Bar: Collection selector + Sort controls + Search Button */}
      <div className="sticky top-14 sm:top-16 z-20 bg-surface/90 backdrop-blur-md -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-2.5 mb-5 border-b border-outline-variant/30 flex flex-wrap items-center justify-between gap-3 shadow-2xs transition-all">
        {/* Collection Filter Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowCollectionDropdown(!showCollectionDropdown)}
            className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-medium transition-all cursor-pointer min-w-45 justify-between ${
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
            <div className="absolute left-0 top-full mt-1.5 z-30 w-72 sm:w-80 max-w-[calc(100vw-2rem)] bg-surface-container-lowest border border-outline-variant/60 rounded-xl shadow-lg animate-in fade-in zoom-in-95 duration-150 max-h-80 overflow-y-auto">
              {/* "All Collections" option */}
              <button
                type="button"
                onClick={() => {
                  setSelectedCollectionId(null);
                  setShowCollectionDropdown(false);
                }}
                className={`w-full px-4 py-2.5 text-left text-xs font-semibold flex items-center justify-between hover:bg-surface-container transition-colors cursor-pointer ${
                  !selectedCollectionId
                    ? "text-primary bg-primary/5"
                    : "text-on-surface"
                }`}
              >
                <span>All Collections</span>
                {!selectedCollectionId && (
                  <Check className="w-4 h-4 text-primary shrink-0" />
                )}
              </button>

              <div className="h-px bg-outline-variant/30 mx-3" />

              {isLoadingCollections ? (
                <div className="p-4 flex justify-center">
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                collections.map((col) => (
                  <div
                    key={col.id}
                    className={`w-full px-3.5 py-1.5 flex items-center justify-between transition-colors hover:bg-surface-container/60 ${
                      selectedCollectionId === col.id
                        ? "text-primary bg-primary/5 font-semibold"
                        : "text-on-surface"
                    }`}
                  >
                    {/* Collection selection button */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCollectionId(col.id);
                        setShowCollectionDropdown(false);
                      }}
                      className="flex-1 flex flex-col min-w-0 pr-2 py-1 text-left cursor-pointer"
                    >
                      <span className="truncate text-xs font-medium">
                        {col.name}
                      </span>
                      <span className="text-[10px] text-outline font-normal">
                        {col.brickCount ?? 0} bricks
                      </span>
                    </button>

                    {/* Actions: check indicator, edit, export, import, delete - always visible for mobile & desktop */}
                    <div className="flex items-center gap-0.5 shrink-0">
                      {selectedCollectionId === col.id && (
                        <Check className="w-4 h-4 text-primary shrink-0 mr-0.5" />
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingCollection(col);
                          setShowCollectionDropdown(false);
                        }}
                        className="p-1.5 rounded-lg text-outline hover:text-primary hover:bg-primary/10 active:scale-95 transition-all cursor-pointer"
                        title="Edit collection"
                        aria-label={`Edit ${col.name}`}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExportCollection(col);
                        }}
                        className="p-1.5 rounded-lg text-outline hover:text-primary hover:bg-primary/10 active:scale-95 transition-all cursor-pointer"
                        title={`Export "${col.name}" to JSON`}
                        aria-label={`Export ${col.name}`}
                      >
                        <Upload className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowCollectionDropdown(false);
                          handleOpenImportModal(col.id);
                        }}
                        className="p-1.5 rounded-lg text-outline hover:text-primary hover:bg-primary/10 active:scale-95 transition-all cursor-pointer"
                        title={`Import JSON into "${col.name}"`}
                        aria-label={`Import into ${col.name}`}
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowCollectionDropdown(false);
                          handleDeleteCollection(col.id);
                        }}
                        className="p-1.5 rounded-lg text-outline hover:text-error hover:bg-error/10 active:scale-95 transition-all cursor-pointer"
                        title="Delete collection"
                        aria-label={`Delete ${col.name}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}

              <div className="h-px bg-outline-variant/30 mx-3" />

              {/* Create new collection inline */}
              <button
                type="button"
                onClick={() => {
                  setShowCollectionDropdown(false);
                  setShowCollectionModal(true);
                }}
                className="w-full px-4 py-2 text-left text-xs font-semibold text-primary flex items-center gap-2 hover:bg-primary/5 transition-colors cursor-pointer"
              >
                <FolderPlus className="w-4 h-4" />
                <span>New Collection</span>
              </button>

              {/* Import collection inline */}
              <button
                type="button"
                onClick={() => {
                  setShowCollectionDropdown(false);
                  handleOpenImportModal(null);
                }}
                className="w-full px-4 py-2 text-left text-xs font-semibold text-primary flex items-center gap-2 hover:bg-primary/5 transition-colors cursor-pointer border-t border-outline-variant/20"
              >
                <Download className="w-4 h-4" />
                <span>Import Collection (JSON)</span>
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
              <div className="absolute right-0 top-full mt-1.5 z-30 w-64 sm:w-72 bg-surface-container-lowest border border-outline-variant/60 rounded-xl shadow-lg p-3 space-y-3 animate-in fade-in zoom-in-95 duration-150 max-h-[80vh] overflow-y-auto">
                {/* Unit Type Filter */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-outline px-2 block">
                    Unit Type
                  </span>
                  <button
                    type="button"
                    onClick={() => setUnitTypeFilter(null)}
                    className={`w-full px-2.5 py-1.5 text-xs font-medium rounded-lg flex items-center justify-between hover:bg-surface-container transition-colors cursor-pointer ${
                      unitTypeFilter === null
                        ? "text-primary bg-primary/10 font-semibold"
                        : "text-on-surface"
                    }`}
                  >
                    <span>All</span>
                    {unitTypeFilter === null && (
                      <Check className="w-3.5 h-3.5 text-primary" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setUnitTypeFilter("word")}
                    className={`w-full px-2.5 py-1.5 text-xs font-medium rounded-lg flex items-center justify-between hover:bg-surface-container transition-colors cursor-pointer ${
                      unitTypeFilter === "word"
                        ? "text-primary bg-primary/10 font-semibold"
                        : "text-on-surface"
                    }`}
                  >
                    <span>Words</span>
                    {unitTypeFilter === "word" && (
                      <Check className="w-3.5 h-3.5 text-primary" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setUnitTypeFilter("sentence")}
                    className={`w-full px-2.5 py-1.5 text-xs font-medium rounded-lg flex items-center justify-between hover:bg-surface-container transition-colors cursor-pointer ${
                      unitTypeFilter === "sentence"
                        ? "text-primary bg-primary/10 font-semibold"
                        : "text-on-surface"
                    }`}
                  >
                    <span>Sentences</span>
                    {unitTypeFilter === "sentence" && (
                      <Check className="w-3.5 h-3.5 text-primary" />
                    )}
                  </button>
                </div>

                <div className="h-px bg-outline-variant/30" />

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

                <div className="h-px bg-outline-variant/30" />

                {/* Tags Filter */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-outline flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      <span>Tags</span>
                    </span>
                    {selectedTags.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedTags([])}
                        className="text-[10px] text-primary hover:underline cursor-pointer"
                      >
                        Clear tags
                      </button>
                    )}
                  </div>

                  {/* Add custom tag input */}
                  <form onSubmit={handleAddCustomTag} className="flex gap-1 px-1">
                    <input
                      type="text"
                      value={tagInputText}
                      onChange={(e) => setTagInputText(e.target.value)}
                      placeholder="Add tag filter..."
                      className="grow px-2 py-1 text-xs bg-surface-container border border-outline-variant/60 rounded-lg outline-none focus:border-primary text-on-surface"
                    />
                    <button
                      type="submit"
                      disabled={!tagInputText.trim()}
                      className="px-2 py-1 bg-primary text-on-primary text-xs font-bold rounded-lg disabled:opacity-40 cursor-pointer"
                    >
                      +
                    </button>
                  </form>

                  {/* Available tags chips */}
                  {availableTags.length > 0 && (
                    <div className="flex flex-wrap gap-1 max-h-28 overflow-y-auto px-1 pt-1">
                      {availableTags.map((tag) => {
                        const isSelected = selectedTags.includes(tag);
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => handleToggleTag(tag)}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition-colors cursor-pointer ${
                              isSelected
                                ? "bg-primary text-on-primary font-bold shadow-2xs"
                                : "bg-surface-container hover:bg-surface-container-high text-on-surface-variant"
                            }`}
                          >
                            #{tag}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {hasActiveFilters && (
                  <>
                    <div className="h-px bg-outline-variant/30" />
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="w-full text-center py-1 text-xs text-primary font-semibold hover:underline cursor-pointer"
                    >
                      Reset all filters
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Search Bricks Button */}
          <button
            type="button"
            id="btn-open-search"
            onClick={onNavigateToSearch}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-surface-container-lowest hover:bg-surface-container-high border border-outline-variant/60 hover:border-primary/40 text-on-surface font-semibold text-xs rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
            title="Search Bricks"
          >
            <Search className="w-4 h-4 text-primary" />
            <span className="hidden sm:inline">Search</span>
          </button>
        </div>
      </div>

      {/* Active Filter Chips Bar */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-1.5 mb-5 p-2.5 bg-surface-container-low/60 border border-outline-variant/40 rounded-xl animate-in fade-in duration-150">
          <span className="text-[11px] font-semibold text-on-surface-variant mr-1">
            Active filters:
          </span>
          {unitTypeFilter && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary border border-primary/20 rounded-lg text-xs font-medium">
              <span>Type: {unitTypeFilter === "word" ? "Words" : "Sentences"}</span>
              <button
                type="button"
                onClick={() => setUnitTypeFilter(null)}
                className="hover:bg-primary/20 rounded-full p-0.5 cursor-pointer"
                aria-label="Remove unit type filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {statusFilter && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary border border-primary/20 rounded-lg text-xs font-medium">
              <span>Status: {statusFilter === "LEARNED" ? "Learned" : "Not Learned"}</span>
              <button
                type="button"
                onClick={() => setStatusFilter(null)}
                className="hover:bg-primary/20 rounded-full p-0.5 cursor-pointer"
                aria-label="Remove status filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary border border-primary/20 rounded-lg text-xs font-medium"
            >
              <span>#{tag}</span>
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="hover:bg-primary/20 rounded-full p-0.5 cursor-pointer"
                aria-label={`Remove #${tag} filter`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {sortBy !== "NEWEST" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-surface-container text-on-surface border border-outline-variant/60 rounded-lg text-xs font-medium">
              <span>Sort: {sortBy === "AZ" ? "A to Z" : "Z to A"}</span>
              <button
                type="button"
                onClick={() => setSortBy("NEWEST")}
                className="hover:bg-surface-container-high rounded-full p-0.5 cursor-pointer"
                aria-label="Reset sort"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          <button
            type="button"
            onClick={handleResetFilters}
            className="text-xs text-primary hover:underline font-semibold ml-auto cursor-pointer"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Bricks Grid */}
      {isLoadingBricks ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : allBricks.length === 0 ? (
        <div className="border-2 border-dashed border-outline-variant/60 rounded-2xl p-10 text-center bg-surface-container-lowest/50">
          <h3 className="text-base font-bold text-on-surface">
            {hasActiveFilters ? "No Bricks Found" : "No Bricks Yet"}
          </h3>
          <p className="text-xs text-on-surface-variant max-w-sm mx-auto mt-1 mb-4">
            {hasActiveFilters
              ? "No bricks match the selected filters. Try adjusting or clearing your filters."
              : "Start building your vocabulary by adding your first brick."}
          </p>
          {hasActiveFilters ? (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary font-bold text-xs rounded-xl hover:bg-primary/95 active:scale-95 transition-all shadow-sm cursor-pointer"
            >
              <span>Clear All Filters</span>
            </button>
          ) : (
            <button
              onClick={handleAddBrick}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary font-bold text-xs rounded-xl hover:bg-primary/95 active:scale-95 transition-all shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Brick</span>
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
                onSelectTag={handleToggleTag}
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
          onExportCollection={handleExportCollection}
          collectionToEdit={editingCollection || undefined}
        />
      )}

      {/* Import Collection Modal */}
      {showImportModal && (
        <ImportCollectionModal
          isOpen={showImportModal}
          onClose={() => {
            setShowImportModal(false);
            setImportTargetCollectionId(null);
          }}
          collections={collections}
          defaultCollectionId={importTargetCollectionId}
          onSuccess={(targetColId) => {
            setSelectedCollectionId(targetColId);
          }}
        />
      )}

      {/* Floating Scroll to Top Button */}
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
