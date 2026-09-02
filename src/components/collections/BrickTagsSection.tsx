import { useState, type KeyboardEvent } from "react";
import { Tag, Plus, X } from "lucide-react";

interface BrickTagsSectionProps {
  tags: string[];
  onChange: (tags: string[]) => void;
}

export default function BrickTagsSection({
  tags,
  onChange,
}: BrickTagsSectionProps) {
  const [tagInput, setTagInput] = useState("");

  const handleAddTag = () => {
    const trimmed = tagInput.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onChange(tags.filter((t) => t !== tagToRemove));
  };

  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-lg font-bold font-display text-on-surface">
          Tags (Optional)
        </h2>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-outline-variant/60 shadow-xs space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1 flex items-center">
            <div className="absolute left-3 pointer-events-none text-outline">
              <Tag className="w-3.5 h-3.5" />
            </div>
            <input
              id="input-brick-tags"
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder="Type a tag and press Enter"
              className="w-full pl-9 pr-3.5 py-2.5 bg-surface-container-low border border-outline-variant/60 rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary focus:outline-none text-xs font-medium text-on-surface placeholder:text-outline transition-all"
            />
          </div>
          <button
            type="button"
            onClick={handleAddTag}
            disabled={!tagInput.trim()}
            className="px-3.5 py-2.5 bg-surface-container hover:bg-surface-container-high border border-outline-variant/60 text-on-surface text-xs font-bold rounded-xl transition-all disabled:opacity-40 cursor-pointer flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            Add
          </button>
        </div>

        {/* Tag Pills */}
        {tags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 border border-primary/20 text-primary rounded-lg text-xs font-semibold"
              >
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="text-primary/70 hover:text-primary transition-colors cursor-pointer"
                  title={`Remove tag ${tag}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-[11px] text-outline italic">No tags added yet</p>
        )}
      </div>
    </section>
  );
}
