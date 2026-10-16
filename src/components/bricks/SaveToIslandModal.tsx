import { useState } from "react";
import { type Island } from "@/types";
import {
  PlusCircle,
  FolderPlus,
  Plus,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";

interface SaveToIslandModalProps {
  isOpen: boolean;
  mode?: "brick" | "island";
  brick?: { nativeText?: string; targetText?: string } | null;
  islandToCopy?: { island_id: number; island_name: string } | null;
  islands: Island[];
  isSaving?: boolean;
  onSave: (islandId: number) => void;
  onCreateAndSave?: (name: string) => void;
  onClose: () => void;
}

function SaveToIslandModalContent({
  mode = "brick",
  brick,
  islandToCopy,
  islands,
  isSaving = false,
  onSave,
  onCreateAndSave,
  onClose,
}: Omit<SaveToIslandModalProps, "isOpen">) {
  const isIslandMode = mode === "island";
  const [showCreateInput, setShowCreateInput] = useState(islands.length === 0);
  const [newIslandName, setNewIslandName] = useState(
    isIslandMode && islandToCopy?.island_name ? islandToCopy.island_name : "",
  );

  if (!isIslandMode && !brick) return null;
  if (isIslandMode && !islandToCopy) return null;

  const displayText = brick?.targetText || brick?.nativeText || "this brick";
  const sourceIslandName = islandToCopy?.island_name || "this island";

  const handleCreateSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newIslandName.trim();
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

      {/* Modal card  */}
      <div className="relative bg-surface-container-lowest border border-outline-variant/80 rounded-3xl p-5 sm:p-6 w-full max-w-sm sm:max-w-md shadow-2xl animate-in zoom-in duration-200 text-center z-10 max-h-[90vh] overflow-y-auto">
        {/* Top header  with single Back button */}
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
          {isIslandMode ? (
            <FolderPlus className="w-5 h-5" />
          ) : (
            <PlusCircle className="w-5 h-5" />
          )}
        </div>

        <h3 className="text-lg font-bold text-primary mb-1 font-display">
          {isIslandMode ? "Add this island" : "Add this brick"}
        </h3>
        <p className="text-xs text-on-surface-variant mb-4 px-2 leading-relaxed">
          {isIslandMode ? (
            <>
              Choose an existing island to add all bricks from{" "}
              <strong className="text-on-surface">"{sourceIslandName}"</strong>{" "}
              into, or create a new one:
            </>
          ) : (
            <>
              Choose an existing island to save{" "}
              <strong className="text-on-surface">"{displayText}"</strong> into,
              or create a new one:
            </>
          )}
        </p>

        {/* Existing islands List: Shown FIRST for 1-tap save */}
        {islands.length > 0 ? (
          <div className="space-y-2 mb-3 max-h-56 sm:max-h-64 overflow-y-auto pr-1 text-left">
            {islands.map((col) => (
              <button
                key={col.id}
                type="button"
                id={`btn-select-col-${col.id}`}
                disabled={isSaving}
                onClick={() => onSave(col.id)}
                className="w-full text-left p-3.5 bg-surface-container-low hover:bg-primary/10 hover:border-primary/40 active:scale-98 transition-all border border-outline-variant/60 rounded-2xl flex items-center justify-between cursor-pointer disabled:opacity-50 min-h-12"
              >
                <div className="truncate mr-2">
                  <span className="block truncate text-xs sm:text-sm font-bold text-on-surface">
                    {col.name}
                  </span>
                  <span className="text-[11px] text-outline font-normal">
                    {col.brickCount ?? 0}{" "}
                    {col.brickCount === 1 ? "brick" : "bricks"}
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
            You don't have any islands yet. Create your first island below:
          </div>
        )}

        {/* Create new  island Section */}
        <div className="mb-4 text-left">
          {islands.length > 0 && !showCreateInput ? (
            <button
              type="button"
              onClick={() => setShowCreateInput(true)}
              className="w-full py-2.5 px-3.5 border border-dashed border-outline-variant/80 hover:border-primary hover:bg-primary/5 rounded-2xl text-xs font-bold text-on-surface-variant hover:text-primary transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-10.5"
            >
              <Plus className="w-3.5 h-3.5 text-primary" />
              <span>Or create a new island</span>
            </button>
          ) : (
            <form
              onSubmit={handleCreateSubmit}
              className="p-3.5 bg-surface-container/40 border border-outline-variant/60 rounded-2xl space-y-3 animate-in fade-in duration-150"
            >
              <label className="text-[11px] font-bold text-on-surface-variant block">
                New island name
              </label>
              <input
                type="text"
                value={newIslandName}
                onChange={(e) => setNewIslandName(e.target.value)}
                placeholder="Island name..."
                disabled={isSaving}
                className="w-full px-3.5 py-2.5 text-xs bg-surface-container-lowest border border-outline-variant/60 rounded-xl text-on-surface focus:border-primary focus:outline-none transition-colors"
                autoFocus={islands.length > 0}
              />
              <div className="flex items-center gap-2">
                {islands.length > 0 && (
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
                  disabled={!newIslandName.trim() || isSaving}
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

export default function SaveToIslandModal(props: SaveToIslandModalProps) {
  if (!props.isOpen) return null;
  return (
    <SaveToIslandModalContent
      key={`${props.mode ?? "brick"}-${props.islandToCopy?.island_id ?? props.brick?.targetText ?? "item"}`}
      {...props}
    />
  );
}
