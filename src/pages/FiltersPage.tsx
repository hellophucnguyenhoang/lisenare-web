import { useState } from "react";
import {
  ArrowLeft,
  CheckCheck,
  X,
  Plus,
  Shuffle,
  Calendar,
  Layers,
  ArrowDown,
  ArrowUp,
} from "lucide-react";
import { type BrickStatus, type SortOption } from "@/types";

interface FiltersPageProps {
  onBack: () => void;
  onApplyFilters: (
    sort: SortOption,
    status: BrickStatus[],
    tags: string[],
  ) => void;
  onClearAll: () => void;
  initialSort: SortOption;
  initialStatus: BrickStatus[];
  initialTags: string[];
  allTags: string[];
}

export default function FiltersPage({
  onBack,
  onApplyFilters,
  onClearAll,
  initialSort,
  initialStatus,
  initialTags,
  allTags,
}: FiltersPageProps) {
  const [activeSort, setActiveSort] = useState<SortOption>(initialSort);
  const [activeStatuses, setActiveStatuses] =
    useState<BrickStatus[]>(initialStatus);
  const [activeTags, setActiveTags] = useState<string[]>(initialTags);

  const toggleStatus = (status: BrickStatus) => {
    setActiveStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status],
    );
  };

  const toggleTag = (tag: string) => {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const handleClear = () => {
    setActiveSort("random");
    setActiveStatuses([]);
    setActiveTags([]);
    onClearAll();
  };

  const handleApply = () => {
    onApplyFilters(activeSort, activeStatuses, activeTags);
    onBack();
  };

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 pt-6 pb-36 animate-in fade-in duration-300">
      {/* Top App Bar Navigation */}
      <header className="sticky top-0 z-10 bg-surface/90 backdrop-blur-xs w-full max-w-lg mx-auto h-16 flex items-center justify-between border-b border-outline-variant/25 mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-full hover:bg-surface-container transition-all active:scale-95"
            aria-label="Back"
          >
            <ArrowLeft className="w-6 h-6 text-on-surface" />
          </button>
          <h1 className="text-xl font-bold font-display text-on-surface">
            Sort & Filter
          </h1>
        </div>
        <button
          onClick={handleClear}
          className="text-primary font-bold text-xs px-3 py-2 rounded-lg hover:bg-primary/5 transition-all active:scale-95"
        >
          Clear All
        </button>
      </header>

      <main className="max-w-lg mx-auto space-y-8">
        {/* Sort Section */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold font-display text-on-surface-variant px-1">
            Sort
          </h2>
          <div className="space-y-3">
            {/* Random Option */}
            <label
              onClick={() => setActiveSort("random")}
              className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all shadow-xs ${
                activeSort === "random"
                  ? "border-primary bg-primary/5 font-semibold"
                  : "border-outline-variant/40 bg-surface-container-lowest"
              }`}
            >
              <div className="flex items-center gap-3">
                <Shuffle className="w-5 h-5 text-primary" />
                <span className="text-sm">Random</span>
              </div>
              <input
                type="radio"
                name="sort"
                checked={activeSort === "random"}
                onChange={() => setActiveSort("random")}
                className="w-4 h-4 text-primary border-outline-variant focus:ring-primary focus:ring-0"
              />
            </label>

            {/* Date Option wrapper */}
            <div
              className={`rounded-xl border shadow-xs overflow-hidden transition-all ${
                ["newest", "oldest"].includes(activeSort)
                  ? "border-primary"
                  : "border-outline-variant/40 bg-surface-container-lowest"
              }`}
            >
              <label
                onClick={() => {
                  if (!["newest", "oldest"].includes(activeSort)) {
                    setActiveSort("newest");
                  }
                }}
                className="flex items-center justify-between p-4 cursor-pointer border-b border-outline-variant/10"
              >
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-on-surface-variant" />
                  <span
                    className={`text-sm ${["newest", "oldest"].includes(activeSort) ? "font-semibold" : ""}`}
                  >
                    Date
                  </span>
                </div>
                <input
                  type="radio"
                  name="sort"
                  checked={["newest", "oldest"].includes(activeSort)}
                  onChange={() => {}}
                  className="w-4 h-4 text-primary border-outline-variant focus:ring-primary focus:ring-0"
                />
              </label>

              <div className="flex p-2 gap-2 bg-surface-container-low/50">
                <button
                  onClick={() => setActiveSort("newest")}
                  className={`flex-1 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                    activeSort === "newest"
                      ? "bg-primary text-on-primary shadow-xs"
                      : "hover:bg-surface-variant text-on-surface-variant"
                  }`}
                >
                  <ArrowDown className="w-4 h-4" />
                  <span>Newest</span>
                </button>
                <button
                  onClick={() => setActiveSort("oldest")}
                  className={`flex-1 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                    activeSort === "oldest"
                      ? "bg-primary text-on-primary shadow-xs"
                      : "hover:bg-surface-variant text-on-surface-variant"
                  }`}
                >
                  <ArrowUp className="w-4 h-4" />
                  <span>Oldest</span>
                </button>
              </div>
            </div>

            {/* Alphabetical Option wrapper */}
            <div
              className={`rounded-xl border shadow-xs overflow-hidden transition-all ${
                ["az", "za"].includes(activeSort)
                  ? "border-primary"
                  : "border-outline-variant/40 bg-surface-container-lowest"
              }`}
            >
              <label
                onClick={() => {
                  if (!["az", "za"].includes(activeSort)) {
                    setActiveSort("az");
                  }
                }}
                className="flex items-center justify-between p-4 cursor-pointer border-b border-outline-variant/10"
              >
                <div className="flex items-center gap-3">
                  <Layers className="w-5 h-5 text-on-surface-variant" />
                  <span
                    className={`text-sm ${["az", "za"].includes(activeSort) ? "font-semibold" : ""}`}
                  >
                    Alphabetical
                  </span>
                </div>
                <input
                  type="radio"
                  name="sort"
                  checked={["az", "za"].includes(activeSort)}
                  onChange={() => {}}
                  className="w-4 h-4 text-primary border-outline-variant focus:ring-primary focus:ring-0"
                />
              </label>

              <div className="flex p-2 gap-2 bg-surface-container-low/50">
                <button
                  onClick={() => setActiveSort("az")}
                  className={`flex-1 py-2 rounded-lg font-bold text-xs flex items-center justify-center transition-all ${
                    activeSort === "az"
                      ? "bg-primary text-on-primary shadow-xs"
                      : "hover:bg-surface-variant text-on-surface-variant"
                  }`}
                >
                  A - Z
                </button>
                <button
                  onClick={() => setActiveSort("za")}
                  className={`flex-1 py-2 rounded-lg font-bold text-xs flex items-center justify-center transition-all ${
                    activeSort === "za"
                      ? "bg-primary text-on-primary shadow-xs"
                      : "hover:bg-surface-variant text-on-surface-variant"
                  }`}
                >
                  Z - A
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Filter - Status Section */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold font-display text-on-surface-variant px-1">
            Status
          </h2>
          <div className="flex flex-wrap gap-2.5">
            {[
              { id: "new" as const, label: "New" },
              { id: "learned" as const, label: "Learned" },
            ].map((stat) => {
              const isSelected = activeStatuses.includes(stat.id);
              return (
                <button
                  key={stat.id}
                  onClick={() => toggleStatus(stat.id)}
                  className={`px-5 py-2.5 rounded-full border text-xs font-bold transition-all active:scale-95 ${
                    isSelected
                      ? "bg-primary border-primary text-on-primary shadow-sm"
                      : "bg-surface-container-lowest border-outline-variant/60 text-on-surface-variant hover:border-primary"
                  }`}
                >
                  {stat.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* Filter - Tags Section */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold font-display text-on-surface-variant px-1">
            Tags
          </h2>
          <div className="flex flex-wrap gap-2.5">
            {allTags.map((tag) => {
              const isSelected = activeTags.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-5 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 ${
                    isSelected
                      ? "bg-primary/10 border-primary text-primary font-bold"
                      : "bg-surface-container-lowest border-outline-variant/60 text-on-surface-variant hover:bg-surface-variant"
                  }`}
                >
                  <span>{tag}</span>
                  {isSelected && <X className="w-3.5 h-3.5" />}
                </button>
              );
            })}

            <button className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border-2 border-dashed border-secondary text-secondary font-bold text-xs hover:bg-secondary/5 transition-all">
              <Plus className="w-4 h-4" />
              <span>Add tag</span>
            </button>
          </div>
        </section>

        <div className="h-10"></div>
      </main>

      {/* Bottom Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-surface-container-lowest border-t border-outline-variant/20 p-4 safe-bottom z-40 shadow-lg">
        <div className="max-w-lg mx-auto">
          <button
            onClick={handleApply}
            className="w-full bg-primary text-on-primary py-4 rounded-xl font-bold font-display shadow-md shadow-primary/10 active:scale-98 hover:shadow-lg flex items-center justify-center gap-2"
          >
            <span>Apply Filters</span>
            <CheckCheck className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
