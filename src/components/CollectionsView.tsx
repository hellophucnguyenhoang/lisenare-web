import { useState } from "react";
import { type Collection, type Brick, type BrickStatus } from "../types";
import {
  Plane,
  Briefcase,
  Utensils,
  Clock,
  Plus,
  ArrowLeft,
  MoreVertical,
  SlidersHorizontal,
  CheckCircle2,
  Star,
  Trash2,
  Edit3,
  BookOpen,
  X,
  Search,
  Check,
} from "lucide-react";

interface CollectionsViewProps {
  collections: Collection[];
  bricks: Brick[];
  onSelectCollection: (id: string) => void;
  selectedCollectionId: string | null;
  onBack: () => void;
  onAddBrick: (collectionId: string) => void;
  onEditBrick: (brickId: string) => void;
  onDeleteBrick: (brickId: string) => void;
  onAddCollection: (
    name: string,
    description: string,
    iconName: string,
  ) => void;
  onDeleteCollection: (id: string) => void;
  onOpenFilters: () => void;
  filterStatus: BrickStatus[];
  filterTags: string[];
  sortType: "recommended" | "newest" | "oldest" | "az" | "za";
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onStudyBrick: (brick: Brick) => void;
}

export default function CollectionsView({
  collections,
  bricks,
  onSelectCollection,
  selectedCollectionId,
  onBack,
  onAddBrick,
  onEditBrick,
  onDeleteBrick,
  onAddCollection,
  onDeleteCollection,
  onOpenFilters,
  filterStatus,
  filterTags,
  sortType,
  searchQuery,
  setSearchQuery,
  onStudyBrick,
}: CollectionsViewProps) {
  // State for adding a collection
  const [showAddModal, setShowAddModal] = useState(false);
  const [newColName, setNewColName] = useState("");
  const [newColDesc, setNewColDesc] = useState("");
  const [newColIcon, setNewColIcon] = useState("BookOpen");
  const [activeMenuBrickId, setActiveMenuBrickId] = useState<string | null>(
    null,
  );

  // Map icon strings to Lucide components
  const getIcon = (name: string, className = "w-6 h-6 text-primary") => {
    switch (name) {
      case "Plane":
        return <Plane className={className} />;
      case "Briefcase":
        return <Briefcase className={className} />;
      case "Utensils":
        return <Utensils className={className} />;
      case "Clock":
        return <Clock className={className} />;
      default:
        return <BookOpen className={className} />;
    }
  };

  const getCollectionStyles = (color: string) => {
    switch (color) {
      case "primary":
        return { bg: "bg-primary/10", text: "text-primary" };
      case "secondary":
        return { bg: "bg-secondary-container/10", text: "text-secondary" };
      case "tertiary":
        return { bg: "bg-tertiary-container/10", text: "text-tertiary" };
      default:
        return { bg: "bg-primary/10", text: "text-primary" };
    }
  };

  // If viewing a specific collection
  if (selectedCollectionId) {
    const activeCollection = collections.find(
      (c) => c.id === selectedCollectionId,
    );
    const collectionBricks = bricks.filter(
      (b) => b.collectionId === selectedCollectionId,
    );

    // Statistics
    const totalCount = collectionBricks.length;
    const masteredCount = collectionBricks.filter(
      (b) => b.status === "mastered",
    ).length;
    const progressPercent =
      totalCount > 0 ? Math.round((masteredCount / totalCount) * 100) : 0;

    // Apply Filter & Sort logic on bricks
    let filteredBricks = [...collectionBricks];

    // Filter by status if specified
    if (filterStatus.length > 0) {
      filteredBricks = filteredBricks.filter((b) =>
        filterStatus.includes(b.status),
      );
    }

    // Filter by tags if specified
    if (filterTags.length > 0) {
      filteredBricks = filteredBricks.filter((b) =>
        b.tags.some((t) => filterTags.includes(t)),
      );
    }

    // Filter by search query if specified
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      filteredBricks = filteredBricks.filter(
        (b) =>
          b.nativeText.toLowerCase().includes(q) ||
          b.targetText.toLowerCase().includes(q) ||
          b.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }

    // Sort bricks
    if (sortType === "newest") {
      filteredBricks.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    } else if (sortType === "oldest") {
      filteredBricks.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
    } else if (sortType === "az") {
      filteredBricks.sort((a, b) => a.targetText.localeCompare(b.targetText));
    } else if (sortType === "za") {
      filteredBricks.sort((a, b) => b.targetText.localeCompare(a.targetText));
    }

    return (
      <div className="max-w-max-width mx-auto px-container-padding pt-6 pb-32 animate-in fade-in duration-300">
        {/* Collection Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-full hover:bg-surface-container transition-all active:scale-95"
            aria-label="Back to collections"
          >
            <ArrowLeft className="w-6 h-6 text-primary" />
          </button>
          <h1 className="text-headline-md font-headline-md font-bold text-primary flex items-center gap-2">
            {getIcon(
              activeCollection?.iconName || "BookOpen",
              "w-6 h-6 text-primary",
            )}
            {activeCollection?.name}
          </h1>
        </div>

        {/* Hero Card / Stats block */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-secondary uppercase tracking-wider">
              Collection Detail
            </p>
            <h2 className="text-3xl font-bold font-display text-on-surface">
              {activeCollection?.name === "Travel Phrases"
                ? "Essential Spanish"
                : activeCollection?.name}
            </h2>
            <div className="flex items-center gap-3 mt-2">
              <div className="h-2.5 w-36 bg-surface-container rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium text-outline">
                {masteredCount} / {totalCount} Mastered ({progressPercent}%)
              </span>
            </div>
            {activeCollection?.description && (
              <p className="text-sm text-on-surface-variant max-w-xl mt-2">
                {activeCollection.description}
              </p>
            )}
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap gap-2 self-start md:self-auto">
            <button
              onClick={onOpenFilters}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary-container/10 border border-primary text-primary font-semibold rounded-xl hover:bg-primary/5 active:scale-95 transition-all shadow-sm"
            >
              <SlidersHorizontal className="w-5 h-5" />
              <span>Sort & Filter</span>
              {(filterStatus.length > 0 ||
                filterTags.length > 0 ||
                sortType !== "recommended") && (
                <span className="w-2.5 h-2.5 bg-secondary rounded-full"></span>
              )}
            </button>
            <button
              onClick={() => onAddBrick(selectedCollectionId)}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary font-semibold rounded-xl hover:bg-primary/90 active:scale-95 transition-all shadow-md"
            >
              <Plus className="w-5 h-5" />
              <span>Add Brick</span>
            </button>
          </div>
        </div>

        {/* Search Input for active collection */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-outline" />
          <input
            type="text"
            placeholder="Search words in this collection..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary focus:outline-none text-sm transition-all shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant hover:text-on-surface"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Bricks Grid */}
        {filteredBricks.length === 0 ? (
          <div className="border-2 border-dashed border-outline-variant rounded-2xl p-12 text-center bg-white/50">
            <BookOpen className="w-12 h-12 text-outline-variant mx-auto mb-4" />
            <h3 className="text-lg font-bold text-on-surface">
              No Bricks Found
            </h3>
            <p className="text-sm text-on-surface-variant max-w-sm mx-auto mt-1">
              No vocabulary bricks match your current search, filters, or
              collection settings.
            </p>
            <button
              onClick={() => onAddBrick(selectedCollectionId)}
              className="mt-4 px-6 py-2 bg-primary text-on-primary text-sm font-semibold rounded-xl hover:bg-primary/90 transition-all"
            >
              Add Your First Brick
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredBricks.map((brick, index) => {
              const isMenuOpen = activeMenuBrickId === brick.id;

              return (
                <div
                  key={brick.id}
                  className="brick-card bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-5 flex flex-col justify-between shadow-sm relative group hover:border-primary/20"
                >
                  {/* Status header */}
                  <div className="flex justify-between items-start mb-4">
                    {brick.status === "mastered" ? (
                      <span className="px-2.5 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded-lg uppercase tracking-wide">
                        Mastered
                      </span>
                    ) : brick.status === "reviewing" ? (
                      <span className="px-2.5 py-1 bg-secondary-fixed text-on-secondary-fixed-variant text-[10px] font-bold rounded-lg uppercase tracking-wide">
                        Learning
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-surface-variant text-on-surface-variant text-[10px] font-bold rounded-lg uppercase tracking-wide">
                        New
                      </span>
                    )}

                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuBrickId(isMenuOpen ? null : brick.id);
                        }}
                        className="text-outline hover:text-primary transition-all p-1 rounded-full hover:bg-surface-container-low"
                        aria-label="More options"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>

                      {isMenuOpen && (
                        <div className="absolute right-0 top-8 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg z-30 py-1.5 w-36">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditBrick(brick.id);
                              setActiveMenuBrickId(null);
                            }}
                            className="w-full px-4 py-2 text-left text-xs font-semibold hover:bg-surface-container flex items-center gap-2 text-on-surface"
                          >
                            <Edit3 className="w-4 h-4 text-outline" />
                            <span>Edit Brick</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (
                                confirm(
                                  "Are you sure you want to delete this brick?",
                                )
                              ) {
                                onDeleteBrick(brick.id);
                              }
                              setActiveMenuBrickId(null);
                            }}
                            className="w-full px-4 py-2 text-left text-xs font-semibold hover:bg-error/10 flex items-center gap-2 text-error"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Delete Brick</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Vocabulary Texts */}
                  <div className="space-y-1 mb-6">
                    <h3 className="text-xl font-bold font-display text-on-surface">
                      {brick.targetText}
                    </h3>
                    <p className="text-sm font-medium text-on-surface-variant italic">
                      {brick.nativeText}
                    </p>
                    {brick.pronunciation && (
                      <p className="text-xs text-outline font-mono">
                        {brick.pronunciation}
                      </p>
                    )}
                  </div>

                  {/* Footer metadata & Call to study */}
                  <div className="flex items-center justify-between pt-4 border-t border-outline-variant/30">
                    <div className="flex flex-wrap gap-1">
                      {brick.tags.slice(0, 2).map((t) => (
                        <span
                          key={t}
                          className="px-2 py-0.5 bg-surface-container text-on-surface-variant text-[10px] font-medium rounded-md"
                        >
                          {t}
                        </span>
                      ))}
                    </div>

                    {brick.status === "mastered" ? (
                      <CheckCircle2 className="w-5 h-5 text-primary fill-primary-fixed" />
                    ) : brick.status === "reviewing" ? (
                      <div className="flex gap-0.5">
                        <Star className="w-4 h-4 text-primary fill-primary" />
                        <Star className="w-4 h-4 text-primary fill-primary" />
                        <Star className="w-4 h-4 text-outline-variant" />
                      </div>
                    ) : (
                      <button
                        onClick={() => onStudyBrick(brick)}
                        className="text-primary hover:text-primary-container text-xs font-bold uppercase tracking-wide flex items-center gap-1 bg-primary/10 px-3 py-1.5 rounded-lg active:scale-95 transition-all"
                      >
                        <span>Study</span>
                        <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Floating Action for Mobile */}
        <div className="fixed bottom-24 right-6 md:hidden z-30">
          <button
            onClick={() => onAddBrick(selectedCollectionId)}
            className="w-14 h-14 rounded-full bg-primary text-on-primary shadow-xl flex items-center justify-center active:scale-95 transition-all hover:shadow-2xl"
            aria-label="Create new brick"
          >
            <Plus className="w-8 h-8" />
          </button>
        </div>
      </div>
    );
  }

  // Browse collections overview (Bento Grid)
  return (
    <div className="max-w-max-width mx-auto px-container-padding pt-6 pb-32 animate-in fade-in duration-300">
      {/* Page Title & Intro */}
      <section className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-primary font-bold text-sm tracking-wider uppercase">
            Your Progress
          </span>
          <h2 className="text-3xl font-bold font-display text-on-surface mt-1">
            Learning Bricks
          </h2>
          <p className="text-on-surface-variant text-sm mt-2 max-w-lg">
            Manage your curated sets of vocabulary and grammar blocks. Organize
            your journey brick by brick.
          </p>
        </div>
        <div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary font-semibold rounded-xl hover:bg-primary/90 active:scale-95 transition-all shadow-md"
          >
            <Plus className="w-5 h-5" />
            <span>New Collection</span>
          </button>
        </div>
      </section>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {collections.map((col) => {
          // Dynamic brick counting
          const colBricks = bricks.filter((b) => b.collectionId === col.id);
          const totalCount = colBricks.length;
          const masteredCount = colBricks.filter(
            (b) => b.status === "mastered",
          ).length;
          const progressPercent =
            totalCount > 0
              ? Math.round((masteredCount / totalCount) * 100)
              : col.progress;

          const themeStyles = getCollectionStyles(col.color);

          return (
            <div
              key={col.id}
              onClick={() => onSelectCollection(col.id)}
              className="brick-card bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-6 flex flex-col justify-between h-56 cursor-pointer hover:border-primary/20 relative"
            >
              {/* Top Row with icon and badge */}
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 ${themeStyles.bg} rounded-xl`}>
                    {getIcon(col.iconName, `w-6 h-6 ${themeStyles.text}`)}
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-surface-container rounded-lg text-on-surface-variant flex items-center gap-1">
                    <span>{totalCount} Bricks</span>
                  </span>
                </div>

                <h3 className="text-lg font-bold font-display text-on-surface">
                  {col.name}
                </h3>

                <div className="flex flex-wrap gap-1.5 mt-3">
                  {col.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 bg-surface-container text-on-surface-variant text-[10px] font-medium rounded-md"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Progress Slider */}
              <div className="flex items-center justify-between mt-4">
                <div className="h-1.5 flex-1 bg-surface-container rounded-full overflow-hidden mr-4">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
                <span className="text-xs font-bold text-primary">
                  {progressPercent}%
                </span>
              </div>

              {/* Delete trigger */}
              {!["travel", "business", "food", "routine"].includes(col.id) && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (
                      confirm(
                        `Are you sure you want to delete the collection "${col.name}"? All bricks in it will be lost.`,
                      )
                    ) {
                      onDeleteCollection(col.id);
                    }
                  }}
                  className="absolute top-6 right-6 p-1 text-outline-variant hover:text-error rounded-full hover:bg-error/10 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete Collection"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          );
        })}

        {/* New Collection Placeholder Card */}
        <div
          onClick={() => setShowAddModal(true)}
          className="border-2 border-dashed border-outline-variant rounded-xl p-6 flex flex-col items-center justify-center h-56 hover:bg-surface-container-low transition-all duration-300 cursor-pointer group hover:border-primary/50"
        >
          <div className="w-12 h-12 rounded-full border-2 border-dashed border-outline-variant flex items-center justify-center group-hover:scale-110 transition-transform group-hover:border-primary group-hover:bg-primary/5">
            <Plus className="w-6 h-6 text-outline group-hover:text-primary" />
          </div>
          <p className="mt-4 text-on-surface-variant font-bold text-sm group-hover:text-primary">
            Add New Collection
          </p>
        </div>
      </div>

      {/* Floating Action Button for mobile */}
      <div className="fixed bottom-24 right-6 md:hidden z-30">
        <button
          onClick={() => setShowAddModal(true)}
          className="w-14 h-14 rounded-full bg-primary text-on-primary shadow-xl flex items-center justify-center active:scale-95 transition-all"
        >
          <Plus className="w-8 h-8" />
        </button>
      </div>

      {/* Add Collection Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-primary font-display">
                Create Collection
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-outline hover:text-on-surface"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">
                  Collection Name
                </label>
                <input
                  type="text"
                  value={newColName}
                  onChange={(e) => setNewColName(e.target.value)}
                  placeholder="e.g. Slang Words, Medical Terms..."
                  className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-xl focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">
                  Description
                </label>
                <textarea
                  value={newColDesc}
                  onChange={(e) => setNewColDesc(e.target.value)}
                  placeholder="What is this set for?"
                  rows={2}
                  className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-xl focus:ring-1 focus:ring-primary focus:outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-2">
                  Select Icon
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { name: "BookOpen", label: "Book" },
                    { name: "Plane", label: "Travel" },
                    { name: "Briefcase", label: "Business" },
                    { name: "Utensils", label: "Food" },
                  ].map((ic) => (
                    <button
                      key={ic.name}
                      onClick={() => setNewColIcon(ic.name)}
                      className={`py-3 flex flex-col items-center justify-center border rounded-xl transition-all ${
                        newColIcon === ic.name
                          ? "border-primary bg-primary/10 text-primary font-semibold"
                          : "border-outline-variant hover:bg-surface"
                      }`}
                    >
                      {getIcon(
                        ic.name,
                        `w-6 h-6 mb-1 ${newColIcon === ic.name ? "text-primary" : "text-outline"}`,
                      )}
                      <span className="text-[10px]">{ic.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  if (newColName.trim() === "") {
                    alert("Please enter a collection name");
                    return;
                  }
                  onAddCollection(newColName, newColDesc, newColIcon);
                  setNewColName("");
                  setNewColDesc("");
                  setNewColIcon("BookOpen");
                  setShowAddModal(false);
                }}
                className="w-full bg-primary text-on-primary py-3 rounded-xl font-bold hover:bg-primary/95 transition-all shadow-md mt-2 flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" />
                <span>Create Collection</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
