import { useState, useEffect } from "react";
import {
  X,
  Upload,
  Brain,
  History,
  Check,
  Loader2,
} from "lucide-react";
import { type Island } from "@/types";
import { useExportIsland } from "@/hooks/useIslands";
import { toast } from "sonner";

interface ExportIslandModalProps {
  isOpen: boolean;
  onClose: () => void;
  island: Island | null;
}

export default function ExportIslandModal({
  isOpen,
  onClose,
  island,
}: ExportIslandModalProps) {
  const [includeMemory, setIncludeMemory] = useState(true);
  const [includeReviewHistory, setIncludeReviewHistory] = useState(true);
  const exportIslandMutation = useExportIsland();

  // Reset options when opened for a new island
  useEffect(() => {
    if (isOpen) {
      setIncludeMemory(true);
      setIncludeReviewHistory(true);
    }
  }, [isOpen, island?.id]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !exportIslandMutation.isPending) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, exportIslandMutation.isPending]);

  if (!isOpen || !island) return null;

  const handleExport = async () => {
    try {
      toast.info(`Exporting "${island.name}"...`);
      const { data } = await exportIslandMutation.mutateAsync({
        islandId: island.id,
        islandName: island.name,
        include_memory: includeMemory,
        include_review_history: includeReviewHistory,
      });
      toast.success(`Exported "${island.name}" (${data.length} bricks)`);
      onClose();
    } catch (err: unknown) {
      console.error("Failed to export island:", err);
      toast.error(`Failed to export "${island.name}". Please try again.`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        onClick={exportIslandMutation.isPending ? undefined : onClose}
        className="fixed inset-0 bg-on-surface/40 backdrop-blur-xs transition-opacity"
        aria-hidden="true"
      />

      {/* Modal dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Export ${island.name}`}
        className="relative bg-surface-container-lowest border border-outline-variant/80 rounded-3xl p-5 sm:p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 z-10 max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-outline-variant/30">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold font-display text-on-surface">
                Export island
              </h3>
              <p className="text-xs text-outline truncate max-w-[200px] sm:max-w-[260px]">
                {island.name} • {island.brickCount ?? 0} bricks
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={exportIslandMutation.isPending}
            className="p-1.5 rounded-xl text-outline hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer disabled:opacity-40"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="py-4 space-y-3.5">
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Choose what learning data to include when exporting this island as a JSON file.
          </p>

          {/* Toggle: Include Memory */}
          <div
            onClick={() => setIncludeMemory(!includeMemory)}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
              includeMemory
                ? "bg-primary/5 border-primary/30"
                : "bg-surface-container-low/60 border-outline-variant/40 hover:bg-surface-container-low"
            }`}
          >
            <div
              className={`p-2 rounded-xl shrink-0 mt-0.5 transition-colors ${
                includeMemory
                  ? "bg-primary/10 text-primary"
                  : "bg-surface-container text-outline"
              }`}
            >
              <Brain className="w-4 h-4" />
            </div>

            <div className="grow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-on-surface">
                  Include memory progress
                </span>
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                    includeMemory
                      ? "bg-primary text-on-primary"
                      : "border border-outline-variant/80 bg-surface"
                  }`}
                >
                  {includeMemory && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>
              <p className="text-[11px] text-on-surface-variant mt-0.5 leading-relaxed">
                Save spaced repetition status, stability, interval, and next due date.
              </p>
            </div>
          </div>

          {/* Toggle: Include Review History */}
          <div
            onClick={() => setIncludeReviewHistory(!includeReviewHistory)}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
              includeReviewHistory
                ? "bg-primary/5 border-primary/30"
                : "bg-surface-container-low/60 border-outline-variant/40 hover:bg-surface-container-low"
            }`}
          >
            <div
              className={`p-2 rounded-xl shrink-0 mt-0.5 transition-colors ${
                includeReviewHistory
                  ? "bg-primary/10 text-primary"
                  : "bg-surface-container text-outline"
              }`}
            >
              <History className="w-4 h-4" />
            </div>

            <div className="grow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-on-surface">
                  Include review history
                </span>
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                    includeReviewHistory
                      ? "bg-primary text-on-primary"
                      : "border border-outline-variant/80 bg-surface"
                  }`}
                >
                  {includeReviewHistory && (
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  )}
                </div>
              </div>
              <p className="text-[11px] text-on-surface-variant mt-0.5 leading-relaxed">
                Save past practice attempts, evaluation logs, and timestamps.
              </p>
            </div>
          </div>

          <div className="text-[11px] text-outline bg-surface-container-low/50 p-2.5 rounded-xl border border-outline-variant/20 leading-relaxed">
            Both options are enabled by default for a full backup. Disable them if you want a clean vocabulary-only export.
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 pt-3 border-t border-outline-variant/30">
          <button
            type="button"
            onClick={onClose}
            disabled={exportIslandMutation.isPending}
            className="flex-1 py-2.5 px-4 bg-surface hover:bg-surface-container border border-outline-variant/60 text-on-surface font-semibold text-xs rounded-xl transition-colors cursor-pointer disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={exportIslandMutation.isPending}
            className="flex-2 py-2.5 px-4 bg-primary text-on-primary font-bold text-xs rounded-xl shadow-xs hover:bg-primary/95 transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {exportIslandMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Export JSON</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
