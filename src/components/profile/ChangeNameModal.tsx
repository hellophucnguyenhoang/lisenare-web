import { useState, useEffect } from "react";
import { X, User, Loader2, AlertCircle } from "lucide-react";
import { useUpdateLearnerName } from "@/hooks/useLearner";
import { toast } from "sonner";
import PlainTextInput from "@/components/common/PlainTextInput";

interface ChangeNameModalProps {
  isOpen: boolean;
  currentName: string;
  onClose: () => void;
}

export default function ChangeNameModal({
  isOpen,
  currentName,
  onClose,
}: ChangeNameModalProps) {
  const updateNameMutation = useUpdateLearnerName();
  const [name, setName] = useState(currentName);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  // Sync state with currentName when modal opens
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setName(currentName);
      setErrorMessage(null);
    }
  }

  if (!isOpen) return null;

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmed = name.trim();
    if (!trimmed) {
      setErrorMessage("Please enter a valid name.");
      return;
    }
    if (trimmed.length < 2) {
      setErrorMessage("Name must be at least 2 characters long.");
      return;
    }

    updateNameMutation.mutate(trimmed, {
      onSuccess: () => {
        toast.success("Name updated successfully!");
        onClose();
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200"
      />

      {/* Modal Container */}
      <div className="relative bg-surface-container-lowest border border-outline-variant/60 rounded-3xl w-full max-w-md p-6 shadow-2xl z-10 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-outline-variant/30">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-display text-on-surface">
                Edit Display Name
              </h3>
              <p className="text-[11px] text-outline">
                Update how your name appears across Lisenare
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-surface-container text-outline hover:text-on-surface transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mt-4 p-3 bg-error-container/40 border border-error/30 rounded-xl flex items-start gap-2.5 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-error shrink-0 mt-0.5" />
            <p className="text-xs font-semibold text-on-error-container">
              {errorMessage}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-5" autoComplete="off" noValidate>
          <div className="space-y-1.5">
            <label
              htmlFor="edit-display-name"
              className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant"
            >
              Display Name
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 pointer-events-none text-outline">
                <User className="w-4 h-4" />
              </div>
              <PlainTextInput
                id="edit-display-name"
                value={name}
                onChange={setName}
                placeholder="Enter your name"
                className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low border border-outline-variant/60 rounded-xl text-sm font-medium text-on-surface focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all outline-none"
                autoFocus
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-outline-variant/30">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-on-surface-variant hover:bg-surface-container rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="btn-submit-change-name"
              disabled={updateNameMutation.isPending}
              className="px-5 py-2.5 bg-primary hover:bg-primary/95 text-on-primary font-bold text-xs rounded-xl shadow-xs transition-all active:scale-98 disabled:opacity-60 flex items-center gap-2 cursor-pointer"
            >
              {updateNameMutation.isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Name</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
