import { useState, useEffect } from "react";
import { Flag, X, Loader2 } from "lucide-react";
import { useReportBrick } from "@/hooks/useBricks";
import { toast } from "sonner";

interface ReportBrickModalProps {
  isOpen: boolean;
  brickId: number | null;
  targetText?: string;
  onClose: () => void;
}

const PRESET_REASONS = [
  "Incorrect translation",
  "Audio pronunciation error",
  "Spelling or typo",
  "Inappropriate content",
];

export default function ReportBrickModal({
  isOpen,
  brickId,
  targetText,
  onClose,
}: ReportBrickModalProps) {
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [customDetails, setCustomDetails] = useState<string>("");
  const reportMutation = useReportBrick();

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedReason("");
      setCustomDetails("");
    }
  }, [isOpen]);

  if (!isOpen || !brickId) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const parts = [selectedReason, customDetails.trim()].filter(Boolean);
    const reasonText = parts.length > 0 ? parts.join(": ") : "Not provided";

    reportMutation.mutate(
      { brickId, reason: reasonText },
      {
        onSuccess: () => {
          toast.success("Brick reported. Thank you for your feedback!");
          onClose();
        },
        onError: (err: unknown) => {
          const errorObj = err as
            | { detail?: string; message?: string }
            | undefined;
          toast.error(
            errorObj?.detail ||
              errorObj?.message ||
              "Failed to submit report. Please try again.",
          );
        },
      },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={reportMutation.isPending ? undefined : onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200"
      />

      {/* Modal card  */}
      <div className="relative w-full max-w-sm sm:max-w-md bg-surface-container-lowest border border-outline-variant/60 rounded-3xl p-6 shadow-2xl z-10 animate-in zoom-in-95 fade-in duration-200 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-500">
              <Flag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-display text-on-surface">
                Report brick
              </h2>
              {targetText && (
                <p className="text-xs text-on-surface-variant truncate max-w-50 sm:max-w-62.5">
                  &ldquo;{targetText}&rdquo;
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={reportMutation.isPending}
            className="p-1.5 text-outline hover:text-on-surface rounded-full hover:bg-surface-container transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content & Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-on-surface mb-2">
              Select reason (optional)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_REASONS.map((reason) => {
                const isSelected = selectedReason === reason;
                return (
                  <button
                    key={reason}
                    type="button"
                    onClick={() => setSelectedReason(isSelected ? "" : reason)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all active:scale-95 cursor-pointer ${
                      isSelected
                        ? "bg-rose-500/15 text-rose-600 border border-rose-500/30 font-semibold"
                        : "bg-surface-container hover:bg-surface-container-high text-on-surface-variant border border-outline-variant/40"
                    }`}
                  >
                    {reason}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label
              htmlFor="report-custom-details"
              className="block text-xs font-semibold text-on-surface mb-1.5"
            >
              Additional details (optional)
            </label>
            <textarea
              id="report-custom-details"
              rows={3}
              value={customDetails}
              onChange={(e) => setCustomDetails(e.target.value)}
              placeholder="Explain the issue with this brick..."
              className="w-full p-3 rounded-xl bg-surface-container-low border border-outline-variant/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs text-on-surface placeholder:text-outline transition-all resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-outline-variant/40">
            <button
              type="button"
              onClick={onClose}
              disabled={reportMutation.isPending}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={reportMutation.isPending}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-all active:scale-95 shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {reportMutation.isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Flag className="w-3.5 h-3.5" />
                  <span>Submit report</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
