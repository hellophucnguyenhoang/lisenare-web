import { useState, type KeyboardEvent } from "react";
import {
  FolderPlus,
  FolderEdit,
  X,
  Check,
  Plus,
  Tag,
  Upload,
} from "lucide-react";
import { type Collection } from "@/types";
import PlainTextInput from "@/components/common/PlainTextInput";

interface AddCollectionModalProps {
  onClose: () => void;
  onAddCollection?: (data: {
    name: string;
    description: string;
    tags: string[];
  }) => void;
  onEditCollection?: (
    id: number,
    data: {
      name: string;
      description: string;
      tags: string[];
    },
  ) => void;
  onExportCollection?: (collection: Collection) => void;
  collectionToEdit?: Collection;
}

export default function AddCollectionModal({
  onClose,
  onAddCollection,
  onEditCollection,
  onExportCollection,
  collectionToEdit,
}: AddCollectionModalProps) {
  const [name, setName] = useState(collectionToEdit?.name || "");
  const [description, setDescription] = useState(
    collectionToEdit?.description || "",
  );
  const [tags, setTags] = useState<string[]>(collectionToEdit?.tags || []);
  const [tagInput, setTagInput] = useState("");

  const handleAddTag = () => {
    const trimmed = tagInput.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleTagKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = (e?: React.SubmitEvent) => {
    if (e) e.preventDefault();
    if (!name.trim()) {
      return;
    }

    const payload = {
      name: name.trim(),
      description: description.trim(),
      tags,
    };

    if (collectionToEdit && onEditCollection) {
      onEditCollection(collectionToEdit.id, payload);
    } else if (onAddCollection) {
      onAddCollection(payload);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest border border-outline-variant/70 rounded-3xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex justify-between items-center pb-4 border-b border-outline-variant/30">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              {collectionToEdit ? (
                <FolderEdit className="w-5 h-5" />
              ) : (
                <FolderPlus className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold font-display text-on-surface">
                {collectionToEdit ? "Edit Collection" : "Create Collection"}
              </h3>
              <p className="text-xs text-outline">
                {collectionToEdit
                  ? "Update collection details & tags"
                  : "Organize vocabulary by topics"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-outline hover:text-on-surface p-1.5 rounded-xl hover:bg-surface-container transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4" autoComplete="off" noValidate>
          {/* Collection Name */}
          <div className="space-y-1.5">
            <label
              htmlFor="input-collection-name"
              className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant"
            >
              Collection Name <span className="text-error">*</span>
            </label>
            <PlainTextInput
              id="input-collection-name"
              value={name}
              onChange={setName}
              placeholder="e.g. Slang Words, Medical Terms, Travel"
              className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant/60 rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary text-sm font-medium text-on-surface transition-all outline-none"
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label
              htmlFor="input-collection-desc"
              className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant"
            >
              Description (Optional)
            </label>
            <textarea
              id="input-collection-desc"
              name="collection-description"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              data-form-type="other"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this collection is for..."
              rows={2}
              className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant/60 rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary focus:outline-none text-sm font-medium text-on-surface placeholder:text-outline transition-all resize-none"
            />
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <label
              htmlFor="input-collection-tags"
              className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant"
            >
              Tags (Optional)
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1 flex items-center">
                <div className="absolute left-3 pointer-events-none text-outline">
                  <Tag className="w-3.5 h-3.5" />
                </div>
                <PlainTextInput
                  id="input-collection-tags"
                  value={tagInput}
                  onChange={setTagInput}
                  onKeyDown={handleTagKeyDown}
                  placeholder="Type a tag and press Enter"
                  className="w-full pl-9 pr-3.5 py-2 bg-surface-container-low border border-outline-variant/60 rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary text-xs font-medium text-on-surface transition-all outline-none"
                />
              </div>
              <button
                type="button"
                onClick={handleAddTag}
                disabled={!tagInput.trim()}
                className="px-3.5 py-2 bg-primary hover:bg-primary/95 text-on-primary text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 disabled:opacity-40 cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>

            {/* Tag Pills */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1.5">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 border border-primary/20 text-primary rounded-lg text-xs font-semibold"
                  >
                    <span>#{tag.replace(/^#/, "")}</span>
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
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2 border-t border-outline-variant/30">
            {collectionToEdit && onExportCollection && (
              <button
                type="button"
                onClick={() => onExportCollection(collectionToEdit)}
                className="py-2.5 px-3 bg-surface hover:bg-surface-container border border-outline-variant/60 text-primary font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                title="Export this collection as JSON"
              >
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">Export</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 bg-surface hover:bg-surface-container border border-outline-variant/60 text-on-surface font-semibold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex-2 py-2.5 px-4 bg-primary text-on-primary font-bold text-xs rounded-xl shadow-xs hover:bg-primary/95 transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>
                {collectionToEdit ? "Save Changes" : "Create Collection"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
