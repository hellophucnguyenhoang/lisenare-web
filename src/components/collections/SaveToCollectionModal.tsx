import { useState } from "react";
import { type Collection } from "@/types";
import {
  PlusCircle,
  FolderPlus,
  Plus,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";

interface SaveToCollectionModalProps {
  isOpen: boolean;
  mode?: "brick" | "collection";
  brick?: { nativeText?: string; targetText?: string } | null;
  collectionToCopy?: { collection_id: number; collection_name: string } | null;
  collections: Collection[];
  isSaving?: boolean;
  onSave: (collectionId: number) => void;
  onCreateAndSave?: (name: string) => void;
  onClose: () => void;
}

function SaveToCollectionModalContent({
  mode = "brick",
  brick,
  collectionToCopy,
  collections,
  isSaving = false,
  onSave,
  onCreateAndSave,
  onClose,
}: Omit<SaveToCollectionModalProps, "isOpen">) {
  const isCollectionMode = mode === "collection";
  const [showCreateInput, setShowCreateInput] = useState(collections.length === 0);
  const [newCollectionName, setNewCollectionName] = useState(
    isCollectionMode && collectionToCopy?.collection_name
      ? collectionToCopy.collection_name
      : "",
  );

  if (!isCollectionMode && !brick) return null;
  if (isCollectionMode && !collectionToCopy) return null;

  const displayText =
    brick?.targetText || brick?.nativeText || "this brick";
  const sourceCollectionName =
    collectionToCopy?.collection_name || "this collection";

  const handleCreateSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newCollectionName.trim();
    if (!trimmed || isSaving || !onCreateAndSave) return;
    onCreateAndSave(trimmed);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={isSaving ? undefined : onClose}
        className="fixed inset-0 bg-on-surface/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      {/* Modal Card */}
      <div className="relative bg-surface-container-lowest border border-outline-variant/80 rounded-3xl p-5 sm:p-6 w-full max-w-sm sm:max-w-md shadow-2xl animate-in zoom-in duration-200 text-center z-10 max-h-[90vh] overflow-y-auto">
        {/* Top Header with single Back button */}
        <div className="flex items-center justify-start mb-3 pb-2 border-b border-outline-variant/30">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-2.5 py-1 -ml-1 text-on-surface-variant hover:text-primary rounded-xl hover:bg-surface-container transition-all cursor-pointer disabled:opacity-40"
            aria-label="Back"
          >
            <ArrowLeft className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold">Back</span>
          </button>
        </div>

        <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
          {isCollectionMode ? (
            <FolderPlus className="w-5 h-5" />
          ) : (
            <PlusCircle className="w-5 h-5" />
          )}
        </div>

        <h3 className="text-lg font-bold text-primary mb-1 font-display">
          {isCollectionMode ? "Add this collection" : "Add this brick"}
        </h3>
        <p className="text-xs text-on-surface-variant mb-4 px-2 leading-relaxed">
          {isCollectionMode ? (
            <>
              Choose an existing collection to add all bricks from{" "}
              <strong className="text-on-surface">"{sourceCollectionName}"</strong> into, or create a new one:
            </>
          ) : (
            <>
              Choose an existing collection to save{" "}
              <strong className="text-on-surface">"{displayText}"</strong> into, or create a new one:
            </>
          )}
        </p>

        {/* Existing Collections List: Shown FIRST for 1-tap save */}
        {collections.length > 0 ? (
          <div className="space-y-2 mb-3 max-h-56 sm:max-h-64 overflow-y-auto pr-1 text-left">
            {collections.map((col) => (
              <button
                key={col.id}
                type="button"
                id={`btn-select-col-${col.id}`}
                disabled={isSaving}
                onClick={() => onSave(col.id)}
                className="w-full text-left p-3.5 bg-surface-container-low hover:bg-primary/10 hover:border-primary/40 active:scale-98 transition-all border border-outline-variant/60 rounded-2xl flex items-center justify-between cursor-pointer disabled:opacity-50 min-h-[48px]"
              >
                <div className="truncate mr-2">
                  <span className="block truncate text-xs sm:text-sm font-bold text-on-surface">
                    {col.name}
                  </span>
                  <span className="text-[11px] text-outline font-normal">
                    {col.brickCount ?? 0} {col.brickCount === 1 ? "brick" : "bricks"}
                  </span>
                </div>
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin shrink-0" />
                ) : (
                  <div className="p-1 rounded-full bg-primary/10 text-primary shrink-0">
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                )}
              </button>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-surface-container/30 border border-dashed border-outline-variant/60 rounded-2xl mb-4 text-xs text-on-surface-variant">
            You don't have any collections yet. Create your first collection below:
          </div>
        )}

        {/* Create New Collection Section */}
        <div className="mb-4 text-left">
          {collections.length > 0 && !showCreateInput ? (
            <button
              type="button"
              onClick={() => setShowCreateInput(true)}
              className="w-full py-2.5 px-3.5 border border-dashed border-outline-variant/80 hover:border-primary hover:bg-primary/5 rounded-2xl text-xs font-bold text-on-surface-variant hover:text-primary transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[42px]"
            >
              <Plus className="w-3.5 h-3.5 text-primary" />
              <span>Or create a new collection</span>
            </button>
          ) : (
            <form
              onSubmit={handleCreateSubmit}
              className="p-3.5 bg-surface-container/40 border border-outline-variant/60 rounded-2xl space-y-3 animate-in fade-in duration-150"
            >
              <label className="text-[11px] font-bold text-on-surface-variant block">
                New Collection Name
              </label>
              <input
                type="text"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                placeholder="Collection name..."
                disabled={isSaving}
                className="w-full px-3.5 py-2.5 text-xs bg-surface-container-lowest border border-outline-variant/60 rounded-xl text-on-surface focus:border-primary focus:outline-none transition-colors"
                autoFocus={collections.length > 0}
              />
              <div className="flex items-center gap-2">
                {collections.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowCreateInput(false)}
                    className="flex-1 py-2.5 text-xs font-bold text-on-surface-variant bg-surface-container hover:bg-surface-container-high rounded-xl transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={!newCollectionName.trim() || isSaving}
                  className="flex-1 py-2.5 bg-primary text-on-primary font-bold text-xs rounded-xl active:scale-95 transition-all shadow-xs cursor-pointer disabled:opacity-50 text-center"
                >
                  {isSaving ? "Saving..." : "Create & Save"}
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}

export default function SaveToCollectionModal(props: SaveToCollectionModalProps) {
  if (!props.isOpen) return null;
  return (
    <SaveToCollectionModalContent
      key={`${props.mode ?? "brick"}-${props.collectionToCopy?.collection_id ?? props.brick?.targetText ?? "item"}`}
      {...props}
    />
  );
}
