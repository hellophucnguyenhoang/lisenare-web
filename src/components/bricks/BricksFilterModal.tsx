import { useState, useEffect } from "react";
import {
  X,
  SlidersHorizontal,
  Check,
  Tag,
  Plus,
  RotateCcw,
} from "lucide-react";

export type BrickSortType = "NEWEST" | "AZ" | "ZA";
export type BrickStatusFilter = "LEARNED" | "NOT_LEARNED" | null;
export type UnitTypeFilter = "word" | "sentence" | null;

interface BricksFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  sortBy: BrickSortType;
  onSortByChange: (sort: BrickSortType) => void;
  statusFilter: BrickStatusFilter;
  onStatusFilterChange: (status: BrickStatusFilter) => void;
  kindFilter: UnitTypeFilter;
  onKindFilterChange: (kind: UnitTypeFilter) => void;
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
  onAddCustomTag: (tag: string) => void;
  onClearTags: () => void;
  availableTags: string[];
  onResetFilters: () => void;
  hasActiveFilters: boolean;
  totalBricks?: number;
}

export default function BricksFilterModal({
  isOpen,
  onClose,
  sortBy,
  onSortByChange,
  statusFilter,
  onStatusFilterChange,
  kindFilter,
  onKindFilterChange,
  selectedTags,
  onToggleTag,
  onAddCustomTag,
  onClearTags,
  availableTags,
  onResetFilters,
  hasActiveFilters,
  totalBricks,
}: BricksFilterModalProps) {
  const [tagInputText, setTagInputText] = useState("");

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCustomTagSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = tagInputText.replace(/^#/, "").trim();
    if (clean) {
      onAddCustomTag(clean);
      setTagInputText("");
    }
  };

  const kindOptions: { label: string; value: UnitTypeFilter }[] = [
    { label: "All", value: null },
    { label: "Words", value: "word" },
    { label: "Sentences", value: "sentence" },
  ];

  const statusOptions: { label: string; value: BrickStatusFilter }[] = [
    { label: "All", value: null },
    { label: "Learned", value: "LEARNED" },
    { label: "Not learned", value: "NOT_LEARNED" },
  ];

  const sortOptions: { label: string; value: BrickSortType }[] = [
    { label: "Newest", value: "NEWEST" },
    { label: "A to Z", value: "AZ" },
    { label: "Z to A", value: "ZA" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-on-surface/40 backdrop-blur-xs transition-opacity"
        aria-hidden="true"
      />

      {/* Modal card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Sort and filter bricks"
        className="relative bg-surface-container-lowest border border-outline-variant/80 rounded-3xl p-5 sm:p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 z-10 max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-outline-variant/30">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold font-display text-on-surface">
                Sort & filter
              </h3>
              <p className="text-xs text-outline">Refine your brick list</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={onResetFilters}
                className="text-xs text-primary font-bold hover:underline cursor-pointer flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-primary/5 transition-colors"
                title="Reset all filters"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-outline hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-1">
          {/* Kind section */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block">
              Kind
            </span>
            <div className="grid grid-cols-3 gap-2">
              {kindOptions.map((opt) => {
                const isSelected = kindFilter === opt.value;
                return (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => onKindFilterChange(opt.value)}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all text-center cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 ${
                      isSelected
                        ? "bg-primary text-on-primary border-primary shadow-xs"
                        : "bg-surface-container hover:bg-surface-container-high text-on-surface border-transparent"
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Status section */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block">
              Status
            </span>
            <div className="grid grid-cols-3 gap-2">
              {statusOptions.map((opt) => {
                const isSelected = statusFilter === opt.value;
                return (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => onStatusFilterChange(opt.value)}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all text-center cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 ${
                      isSelected
                        ? "bg-primary text-on-primary border-primary shadow-xs"
                        : "bg-surface-container hover:bg-surface-container-high text-on-surface border-transparent"
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sort by section */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block">
              Sort by
            </span>
            <div className="grid grid-cols-3 gap-2">
              {sortOptions.map((opt) => {
                const isSelected = sortBy === opt.value;
                return (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => onSortByChange(opt.value)}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all text-center cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 ${
                      isSelected
                        ? "bg-primary text-on-primary border-primary shadow-xs"
                        : "bg-surface-container hover:bg-surface-container-high text-on-surface border-transparent"
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tags section */}
          <div className="space-y-2 pt-1 border-t border-outline-variant/30">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-primary" />
                <span>Tags</span>
              </span>
              {selectedTags.length > 0 && (
                <button
                  type="button"
                  onClick={onClearTags}
                  className="text-xs text-primary font-bold hover:underline cursor-pointer"
                >
                  Clear tags
                </button>
              )}
            </div>

            {/* Custom tag input form */}
            <form onSubmit={handleCustomTagSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="w-3.5 h-3.5 text-outline absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={tagInputText}
                  onChange={(e) => setTagInputText(e.target.value)}
                  placeholder="Add custom tag filter..."
                  className="w-full pl-8 pr-3 py-2 text-xs bg-surface-container border border-outline-variant/60 rounded-xl outline-none focus:border-primary text-on-surface placeholder:text-outline"
                />
              </div>
              <button
                type="submit"
                disabled={!tagInputText.trim()}
                className="px-3.5 py-2 bg-primary text-on-primary text-xs font-bold rounded-xl disabled:opacity-40 hover:bg-primary/95 active:scale-95 transition-all cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </form>

            {/* Selected tags badges */}
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {selectedTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary text-on-primary rounded-lg text-xs font-semibold shadow-2xs"
                  >
                    <span>#{tag}</span>
                    <button
                      type="button"
                      onClick={() => onToggleTag(tag)}
                      className="hover:bg-primary-container rounded-full p-0.5 cursor-pointer"
                      aria-label={`Remove #${tag}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Available tags pool */}
            {availableTags.length > 0 ? (
              <div className="space-y-1 pt-1">
                <span className="text-[11px] font-medium text-outline block">
                  Available tags
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 bg-surface-container-low/60 border border-outline-variant/30 rounded-xl">
                  {availableTags.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => onToggleTag(tag)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer active:scale-95 ${
                          isSelected
                            ? "bg-primary/15 text-primary border border-primary/30 font-bold"
                            : "bg-surface-container hover:bg-surface-container-high text-on-surface-variant border border-transparent"
                        }`}
                      >
                        #{tag}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="text-xs text-outline italic pt-1">
                No tags available yet.
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-outline-variant/30">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 bg-primary text-on-primary font-bold text-xs rounded-xl shadow-xs hover:bg-primary/95 active:scale-98 transition-all cursor-pointer text-center"
          >
            {totalBricks !== undefined
              ? `Show ${totalBricks} brick${totalBricks !== 1 ? "s" : ""}`
              : "Done"}
          </button>
        </div>
      </div>
    </div>
  );
}
