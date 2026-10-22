import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { type Island, type Brick } from "@/types";
import BrickCard from "@/components/bricks/BrickCard";
import AddIslandModal from "@/components/bricks/AddIslandModal";
import ImportIslandModal from "@/components/bricks/ImportIslandModal";
import ListeningRetrievalModal from "@/components/bricks/ListeningRetrievalModal";
import BricksFilterModal from "@/components/bricks/BricksFilterModal";
import ExportIslandModal from "@/components/bricks/ExportIslandModal";
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
  ArrowUp,
  Headphones,
} from "lucide-react";
import {
  useIslands,
  useDeleteIsland,
  useUpdateIsland,
  useCreateIsland,
  useImportIsland,
  useImportToNewIsland,
} from "@/hooks/useIslands";
import {
  useInfiniteBricks,
  useDeleteBrick,
  useForgetBrick,
} from "@/hooks/useBricks";
import { useLearnerMe } from "@/hooks/useLearner";
import { type AuthMode } from "@/types";
import { useHeader } from "@/context/HeaderContext";
import { toast } from "sonner";

interface BricksPageProps {
  onNavigateToAddBrick: (islandId?: number) => void;
  onNavigateToEditBrick: (brick: Brick) => void;
  onNavigateToRetrieval: (brickId?: number) => void;
  onNavigateToSearch: () => void;
  onOpenAuth?: (mode: AuthMode) => void;
}

export default function BricksPage({
  onNavigateToAddBrick,
  onNavigateToEditBrick,
  onNavigateToRetrieval,
  onNavigateToSearch,
  onOpenAuth,
}: BricksPageProps) {
  const { data: learner } = useLearnerMe();
  const isLoggedIn = Boolean(learner);

  // Island filter state
  const [selectedIslandId, setSelectedIslandId] = useState<number | null>(null);
  const [showIslandDropdown, setShowIslandDropdown] = useState(false);
  const [showIslandModal, setShowIslandModal] = useState(false);
  const [editingIsland, setEditingIsland] = useState<Island | null>(null);
  const [showListeningModal, setShowListeningModal] = useState(false);

  // Sort and filter state
  type BrickSortType = "NEWEST" | "AZ" | "ZA";
  type BrickStatusFilter = "LEARNED" | "NOT_LEARNED" | null;
  type UnitTypeFilter = "word" | "sentence" | null;

  const [sortBy, setSortBy] = useState<BrickSortType>("NEWEST");
  const [statusFilter, setStatusFilter] = useState<BrickStatusFilter>(null);
  const [kindFilter, setUnitTypeFilter] = useState<UnitTypeFilter>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 350);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Hooks
  const { data: islands = [], isLoading: isLoadingIslands } =
    useIslands(isLoggedIn);

  const {
    data: bricksPages,
    isLoading: isLoadingBricks,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteBricks(
    {
      island_ids: selectedIslandId ? [selectedIslandId] : undefined,
      status: statusFilter ?? undefined,
      kind: kindFilter ?? undefined,
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
    kindFilter !== null ||
    selectedTags.length > 0 ||
    sortBy !== "NEWEST";

  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    islands.forEach((c) => c.tags?.forEach((t) => tagSet.add(t.trim())));
    allBricks.forEach((b) => b.tags?.forEach((t) => tagSet.add(t.trim())));
    return Array.from(tagSet).filter(Boolean).sort();
  }, [islands, allBricks]);

  const handleToggleTag = (tag: string) => {
    const clean = tag.replace(/^#/, "").trim();
    if (!clean) return;
    setSelectedTags((prev) =>
      prev.includes(clean) ? prev.filter((t) => t !== clean) : [...prev, clean],
    );
  };

  const handleAddCustomTag = (tag: string) => {
    const clean = tag.replace(/^#/, "").trim();
    if (clean && !selectedTags.includes(clean)) {
      setSelectedTags((prev) => [...prev, clean]);
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

  const deleteIsland = useDeleteIsland();
  const updateIsland = useUpdateIsland();
  const createIsland = useCreateIsland();
  const deleteBrick = useDeleteBrick();
  const forgetBrick = useForgetBrick();
  const importToExisting = useImportIsland();
  const importToNew = useImportToNewIsland();

  const handleImportToExisting = (
    islandId: number,
    file: File | Blob,
    islandName: string,
  ) => {
    toast.info(`Importing bricks into "${islandName}" in the background...`);
    importToExisting.mutate(
      { islandId, islandName, file },
      {
        onSuccess: ({ islandId: targetId }) => {
          setSelectedIslandId(targetId);
        },
      },
    );
  };

  const handleImportToNew = (islandName: string, file: File | Blob) => {
    toast.info(`Importing into new island "${islandName}" in the background...`);
    importToNew.mutate(
      { islandName, file },
      {
        onSuccess: ({ island }) => {
          setSelectedIslandId(island.id);
        },
      },
    );
  };

  const [showImportModal, setShowImportModal] = useState(false);
  const [importTargetIslandId, setImportTargetIslandId] = useState<
    number | null
  >(null);
  const [exportingIsland, setExportingIsland] = useState<Island | null>(null);

  const handleOpenExportModal = (col: Island) => {
    setExportingIsland(col);
  };

  const handleOpenImportModal = (targetIslandId?: number | null) => {
    setImportTargetIslandId(targetIslandId ?? selectedIslandId ?? null);
    setShowImportModal(true);
  };

  // Refs for click-outside
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowIslandDropdown(false);
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

  const selectedIsland = selectedIslandId
    ? islands.find((c) => c.id === selectedIslandId)
    : null;

  const handleAddIsland = (data: {
    name: string;
    description: string;
    tags: string[];
  }) => {
    createIsland.mutate(data);
  };

  const handleEditIsland = (
    id: number,
    data: { name: string; description: string; tags: string[] },
  ) => {
    updateIsland.mutate({ islandId: id, data });
  };

  const handleDeleteIsland = (id: number) => {
    if (
      confirm(`Delete this island? All bricks inside will also be deleted.`)
    ) {
      deleteIsland.mutate(id);
      if (selectedIslandId === id) {
        setSelectedIslandId(null);
      }
    }
  };

  // Determine which island to add brick to
  const handleAddBrick = useCallback(() => {
    onNavigateToAddBrick(selectedIslandId ?? undefined);
  }, [onNavigateToAddBrick, selectedIslandId]);

  const { setHeaderContent } = useHeader();

  // Dynamically update the fixed sticky header with brick stats & Add brick action
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
          <span>Add brick</span>
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
            alt="Lisenare logo"
            className="w-full h-full object-contain rounded-xl"
          />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold font-display text-on-surface mb-2">
          Your bricks
        </h2>
        <p className="text-xs text-on-surface-variant max-w-xs mb-6 leading-relaxed">
          Sign in to view, create, organize, and search your vocabulary islands.
        </p>
        {onOpenAuth && (
          <button
            type="button"
            onClick={() => onOpenAuth("login")}
            className="py-3 px-6 bg-primary hover:bg-primary/95 text-on-primary font-bold text-xs rounded-xl shadow-xs transition-all active:scale-98 cursor-pointer"
          >
            Log in to view bricks
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-28 animate-in fade-in duration-300">
      {/* Page header */}
      <section className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-on-surface">
            {totalBricks} brick{totalBricks !== 1 ? "s" : ""}
          </h2>
          <p className="text-on-surface-variant text-xs sm:text-sm mt-0.5 max-w-lg">
            {selectedIsland ? ` in "${selectedIsland.name}"` : ""}
            {kindFilter === "word"
              ? " • Words"
              : kindFilter === "sentence"
                ? " • Sentences"
                : ""}
            {statusFilter === "LEARNED"
              ? " • Learned"
              : statusFilter === "NOT_LEARNED"
                ? " • Not learned"
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

        {selectedIsland && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowListeningModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-container-low hover:bg-surface-container border border-outline-variant/60 rounded-xl text-xs font-bold text-on-surface transition-all active:scale-95 shadow-2xs cursor-pointer"
              title={`Listen to "${selectedIsland.name}"`}
            >
              <Headphones className="w-3.5 h-3.5 text-primary" />
              <span>Listen</span>
            </button>

            <button
              type="button"
              onClick={() => handleOpenExportModal(selectedIsland)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-container-low hover:bg-surface-container border border-outline-variant/60 rounded-xl text-xs font-bold text-on-surface transition-all active:scale-95 shadow-2xs cursor-pointer"
              title={`Export "${selectedIsland.name}" to JSON`}
            >
              <Upload className="w-3.5 h-3.5 text-primary" />
              <span>Export</span>
            </button>

            <button
              type="button"
              onClick={() => handleOpenImportModal(selectedIsland.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-container-low hover:bg-surface-container border border-outline-variant/60 rounded-xl text-xs font-bold text-on-surface transition-all active:scale-95 shadow-2xs cursor-pointer"
              title={`Import JSON into "${selectedIsland.name}"`}
            >
              <Download className="w-3.5 h-3.5 text-primary" />
              <span>Import</span>
            </button>
          </div>
        )}
      </section>

      {/* Filter bar: Island selector + Sort controls + Search button */}
      <div className="sticky top-14 sm:top-16 z-20 bg-surface/90 backdrop-blur-md -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-2.5 mb-5 border-b border-outline-variant/30 flex flex-wrap items-center justify-between gap-3 shadow-2xs transition-all">
        {/* Island filter dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowIslandDropdown(!showIslandDropdown)}
            className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-medium transition-all cursor-pointer min-w-45 justify-between ${
              selectedIslandId
                ? "bg-primary/5 border-primary/30 text-primary"
                : "bg-surface-container-lowest border-outline-variant/60 text-on-surface-variant"
            }`}
          >
            <span className="truncate text-xs">
              {selectedIsland?.name || "All islands"}
            </span>
            <ChevronDown
              className={`w-4 h-4 shrink-0 transition-transform ${
                showIslandDropdown ? "rotate-180" : ""
              }`}
            />
          </button>

          {showIslandDropdown && (
            <div className="absolute left-0 top-full mt-1.5 z-30 w-72 sm:w-80 max-w-[calc(100vw-2rem)] bg-surface-container-lowest border border-outline-variant/60 rounded-xl shadow-lg animate-in fade-in zoom-in-95 duration-150 max-h-80 overflow-y-auto">
              {/* "All islands" option */}
              <button
                type="button"
                onClick={() => {
                  setSelectedIslandId(null);
                  setShowIslandDropdown(false);
                }}
                className={`w-full px-4 py-2.5 text-left text-xs font-semibold flex items-center justify-between hover:bg-surface-container transition-colors cursor-pointer ${
                  !selectedIslandId
                    ? "text-primary bg-primary/5"
                    : "text-on-surface"
                }`}
              >
                <span>All islands</span>
                {!selectedIslandId && (
                  <Check className="w-4 h-4 text-primary shrink-0" />
                )}
              </button>

              <div className="h-px bg-outline-variant/30 mx-3" />

              {isLoadingIslands ? (
                <div className="p-4 flex justify-center">
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                islands.map((col) => (
                  <div
                    key={col.id}
                    className={`w-full px-3.5 py-1.5 flex items-center justify-between transition-colors hover:bg-surface-container/60 ${
                      selectedIslandId === col.id
                        ? "text-primary bg-primary/5 font-semibold"
                        : "text-on-surface"
                    }`}
                  >
                    {/* Island selection button */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedIslandId(col.id);
                        setShowIslandDropdown(false);
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

                    {/* Actions: listen, check indicator, edit, export, import, delete - always visible for mobile & desktop */}
                    <div className="flex items-center gap-0.5 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedIslandId(col.id);
                          setShowIslandDropdown(false);
                          setShowListeningModal(true);
                        }}
                        className="p-1.5 rounded-lg text-outline hover:text-primary hover:bg-primary/10 active:scale-95 transition-all cursor-pointer"
                        title={`Listen to "${col.name}"`}
                        aria-label={`Listen to ${col.name}`}
                      >
                        <Headphones className="w-3.5 h-3.5" />
                      </button>
                      {selectedIslandId === col.id && (
                        <Check className="w-4 h-4 text-primary shrink-0 mr-0.5" />
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingIsland(col);
                          setShowIslandDropdown(false);
                        }}
                        className="p-1.5 rounded-lg text-outline hover:text-primary hover:bg-primary/10 active:scale-95 transition-all cursor-pointer"
                        title="Edit island"
                        aria-label={`Edit ${col.name}`}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowIslandDropdown(false);
                          handleOpenExportModal(col);
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
                          setShowIslandDropdown(false);
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
                          setShowIslandDropdown(false);
                          handleDeleteIsland(col.id);
                        }}
                        className="p-1.5 rounded-lg text-outline hover:text-error hover:bg-error/10 active:scale-95 transition-all cursor-pointer"
                        title="Delete island"
                        aria-label={`Delete ${col.name}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}

              <div className="h-px bg-outline-variant/30 mx-3" />

              {/* Create new island inline */}
              <button
                type="button"
                onClick={() => {
                  setShowIslandDropdown(false);
                  setShowIslandModal(true);
                }}
                className="w-full px-4 py-2 text-left text-xs font-semibold text-primary flex items-center gap-2 hover:bg-primary/5 transition-colors cursor-pointer"
              >
                <FolderPlus className="w-4 h-4" />
                <span>New island</span>
              </button>

              {/* Import island inline */}
              <button
                type="button"
                onClick={() => {
                  setShowIslandDropdown(false);
                  handleOpenImportModal(null);
                }}
                className="w-full px-4 py-2 text-left text-xs font-semibold text-primary flex items-center gap-2 hover:bg-primary/5 transition-colors cursor-pointer border-t border-outline-variant/20"
              >
                <Download className="w-4 h-4" />
                <span>Import island</span>
              </button>
            </div>
          )}
        </div>

        {/* Right side: Listen bricks + Sort & Filter + Search button */}
        <div className="flex items-center gap-2">
          {/* Listen bricks button */}
          <button
            type="button"
            id="btn-listen-bricks"
            onClick={() => setShowListeningModal(true)}
            className="p-2.5 bg-surface-container-lowest hover:bg-surface-container-high border border-outline-variant/60 hover:border-primary/40 text-on-surface rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer flex items-center justify-center"
            title={
              selectedIsland
                ? `Listen to "${selectedIsland.name}"`
                : "Listen to all bricks"
            }
            aria-label={
              selectedIsland
                ? `Listen to ${selectedIsland.name}`
                : "Listen to all bricks"
            }
          >
            <Headphones className="w-4 h-4 text-primary" />
          </button>

          {/* Sort & Filter button (opens modal) */}
          <button
            type="button"
            id="btn-sort-filter"
            onClick={() => setShowFilterModal(true)}
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

          {/* Search bricks Button */}
          <button
            type="button"
            id="btn-open-search"
            onClick={onNavigateToSearch}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-surface-container-lowest hover:bg-surface-container-high border border-outline-variant/60 hover:border-primary/40 text-on-surface font-semibold text-xs rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
            title="Search bricks"
          >
            <Search className="w-4 h-4 text-primary" />
            <span className="hidden sm:inline">Search</span>
          </button>
        </div>
      </div>

      {/* Active filter chips bar */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-1.5 mb-5 p-2.5 bg-surface-container-low/60 border border-outline-variant/40 rounded-xl animate-in fade-in duration-150">
          <span className="text-[11px] font-semibold text-on-surface-variant mr-1">
            Active filters:
          </span>
          {kindFilter && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary border border-primary/20 rounded-lg text-xs font-medium">
              <span>Type: {kindFilter === "word" ? "Words" : "Sentences"}</span>
              <button
                type="button"
                onClick={() => setUnitTypeFilter(null)}
                className="hover:bg-primary/20 rounded-full p-0.5 cursor-pointer"
                aria-label="Remove kind filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {statusFilter && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary border border-primary/20 rounded-lg text-xs font-medium">
              <span>
                Status: {statusFilter === "LEARNED" ? "Learned" : "Not learned"}
              </span>
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

      {/* Bricks grid */}
      {isLoadingBricks ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : allBricks.length === 0 ? (
        <div className="border-2 border-dashed border-outline-variant/60 rounded-2xl p-10 text-center bg-surface-container-lowest/50">
          <h3 className="text-base font-bold text-on-surface">
            {hasActiveFilters ? "No bricks found" : "No bricks yet"}
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
              <span>Clear all filters</span>
            </button>
          ) : (
            <button
              onClick={handleAddBrick}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary font-bold text-xs rounded-xl hover:bg-primary/95 active:scale-95 transition-all shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add brick</span>
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
                onForgetBrick={(brickId: number) => {
                  forgetBrick.mutate(brickId, {
                    onSuccess: () => {
                      toast.success("Brick memory reset successfully.");
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
                }}
                onSelectBrick={() => onNavigateToRetrieval(brick.id)}
                onStudyBrick={() => onNavigateToRetrieval(brick.id)}
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

      {/* Add / Edit island Modal */}
      {(showIslandModal || editingIsland) && (
        <AddIslandModal
          onClose={() => {
            setShowIslandModal(false);
            setEditingIsland(null);
          }}
          onAddIsland={handleAddIsland}
          onEditIsland={handleEditIsland}
          onExportIsland={(col) => {
            setShowIslandModal(false);
            setEditingIsland(null);
            handleOpenExportModal(col);
          }}
          islandToEdit={editingIsland || undefined}
        />
      )}

      {/* Export island modal */}
      {exportingIsland && (
        <ExportIslandModal
          isOpen={Boolean(exportingIsland)}
          onClose={() => setExportingIsland(null)}
          island={exportingIsland}
        />
      )}

      {/* Import island Modal */}
      {showImportModal && (
        <ImportIslandModal
          isOpen={showImportModal}
          onClose={() => {
            setShowImportModal(false);
            setImportTargetIslandId(null);
          }}
          islands={islands}
          defaultIslandId={importTargetIslandId}
          onImportToExisting={handleImportToExisting}
          onImportToNew={handleImportToNew}
        />
      )}

      {/* Listening retrieval modal */}
      <ListeningRetrievalModal
        isOpen={showListeningModal}
        onClose={() => setShowListeningModal(false)}
        islandId={selectedIslandId}
        islandName={selectedIsland?.name}
      />

      {/* Sort & filter modal */}
      <BricksFilterModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        kindFilter={kindFilter}
        onKindFilterChange={setUnitTypeFilter}
        selectedTags={selectedTags}
        onToggleTag={handleToggleTag}
        onAddCustomTag={handleAddCustomTag}
        onClearTags={() => setSelectedTags([])}
        availableTags={availableTags}
        onResetFilters={handleResetFilters}
        hasActiveFilters={hasActiveFilters}
        totalBricks={totalBricks}
      />

      {/* Floating scroll to Top button */}
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
