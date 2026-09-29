import { type Collection } from "@/types";
import { PlusCircle, X, FolderPlus } from "lucide-react";

interface SaveToCollectionModalProps {
  isOpen: boolean;
  brick: { nativeText?: string; targetText?: string } | null;
  collections: Collection[];
  isSaving?: boolean;
  onSave: (collectionId: number) => void;
  onClose: () => void;
}

export default function SaveToCollectionModal({
  isOpen,
  brick,
  collections,
  isSaving = false,
  onSave,
  onClose,
}: SaveToCollectionModalProps) {
  if (!isOpen || !brick) return null;

  const displayText = brick.targetText || brick.nativeText || "this brick";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={isSaving ? undefined : onClose}
        className="fixed inset-0 bg-on-surface/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      {/* Modal Card */}
      <div className="relative bg-surface-container-lowest border border-outline-variant/80 rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in duration-200 text-center z-10">
        <button
          type="button"
          onClick={onClose}
          disabled={isSaving}
          className="absolute top-4 right-4 p-1.5 text-outline hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors cursor-pointer disabled:opacity-40"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
          <FolderPlus className="w-5 h-5" />
        </div>

        <h3 className="text-lg font-bold text-primary mb-1 font-display">
          Add Brick to Collection
        </h3>
        <p className="text-xs text-on-surface-variant mb-4 line-clamp-2 px-2">
          Choose a collection to save{" "}
          <span className="font-semibold text-on-surface">
            "{displayText}"
          </span>
        </p>

        {collections.length === 0 ? (
          <div className="py-6 px-4 border border-dashed border-outline-variant/60 rounded-xl mb-4 bg-surface-container/30">
            <p className="text-xs text-on-surface-variant">
              No collections found. Please create a collection in your library first.
            </p>
          </div>
        ) : (
          <div className="space-y-2 mb-6 max-h-60 overflow-y-auto pr-1">
            {collections.map((col) => (
              <button
                key={col.id}
                type="button"
                id={`btn-select-col-${col.id}`}
                disabled={isSaving}
                onClick={() => onSave(col.id)}
                className="w-full text-left px-4 py-3 bg-surface hover:bg-primary/10 hover:text-primary transition-all border border-outline-variant/60 rounded-xl text-sm font-semibold flex items-center justify-between cursor-pointer disabled:opacity-50"
              >
                <div className="truncate mr-2">
                  <span className="block truncate">{col.name}</span>
                  {col.brickCount !== null && (
                    <span className="text-[11px] font-normal text-on-surface-variant">
                      {col.brickCount} {col.brickCount === 1 ? "brick" : "bricks"}
                    </span>
                  )}
                </div>
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin shrink-0" />
                ) : (
                  <PlusCircle className="w-4 h-4 text-primary shrink-0" />
                )}
              </button>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          disabled={isSaving}
          className="text-xs text-outline font-bold hover:text-on-surface transition-colors cursor-pointer disabled:opacity-40"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
