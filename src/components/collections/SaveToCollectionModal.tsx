import { type Collection } from "@/types";
import { PlusCircle, X } from "lucide-react";

interface SaveToCollectionModalProps {
  isOpen: boolean;
  brick: { nativeText: string } | null;
  collections: Collection[];
  onSave: (collectionId: string) => void;
  onClose: () => void;
}

export default function SaveToCollectionModal({
  isOpen,
  brick,
  collections,
  onSave,
  onClose,
}: SaveToCollectionModalProps) {
  if (!isOpen || !brick) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-on-surface/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      {/* Modal Card */}
      <div className="relative bg-surface-container-lowest border border-outline-variant/80 rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in duration-200 text-center z-10">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-outline hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        <h3 className="text-lg font-bold text-primary mb-1 font-display">
          Save to Collection
        </h3>
        <p className="text-xs text-on-surface-variant mb-4">
          Select which collection to save{" "}
          <span className="font-semibold text-on-surface">
            "{brick.nativeText}"
          </span>{" "}
          to:
        </p>

        <div className="space-y-2 mb-6 max-h-60 overflow-y-auto pr-1">
          {collections.map((col) => (
            <button
              key={col.id}
              type="button"
              id={`btn-select-col-${col.id}`}
              onClick={() => onSave(String(col.id))}
              className="w-full text-left px-4 py-3 bg-surface hover:bg-primary/10 hover:text-primary transition-all border border-outline-variant/60 rounded-xl text-sm font-semibold flex items-center justify-between cursor-pointer"
            >
              <span>{col.name}</span>
              <PlusCircle className="w-4 h-4 text-primary" />
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="text-xs text-outline font-bold hover:text-on-surface transition-colors cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
