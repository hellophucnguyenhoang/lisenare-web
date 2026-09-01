import { useState, useEffect } from "react";
import {
  X,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useChangePassword } from "@/hooks/useLearner";
import { toast } from "sonner";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChangePasswordModal({
  isOpen,
  onClose,
}: ChangePasswordModalProps) {
  const changePasswordMutation = useChangePassword();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(true);
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

  // Reset form state on open
  useEffect(() => {
    if (isOpen) {
      setOldPassword("");
      setNewPassword("");
      setShowOldPassword(false);
      setShowNewPassword(true);
      setErrorMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, text: "", color: "bg-outline-variant/30" };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 1, text: "Weak", color: "bg-red-500" };
    if (score <= 2) return { score: 2, text: "Fair", color: "bg-amber-500" };
    if (score <= 3) return { score: 3, text: "Good", color: "bg-teal-500" };
    return { score: 4, text: "Strong", color: "bg-primary" };
  };

  const strength = getPasswordStrength(newPassword);

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!oldPassword) {
      setErrorMessage("Please enter your current password.");
      return;
    }
    if (newPassword.length < 6) {
      setErrorMessage("New password must be at least 6 characters long.");
      return;
    }

    changePasswordMutation.mutate(
      { old_password: oldPassword, new_password: newPassword },
      {
        onSuccess: () => {
          toast.success("Password updated successfully!");
          onClose();
        },
      },
    );
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
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-display text-on-surface">
                Change Password
              </h3>
              <p className="text-[11px] text-outline">
                Enter your current and new password
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

        <form onSubmit={handleSubmit} className="space-y-4 mt-5" noValidate>
          {/* Current / Old Password */}
          <div className="space-y-1.5">
            <label
              htmlFor="change-old-password"
              className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant"
            >
              Current Password
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 pointer-events-none text-outline">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="change-old-password"
                type={showOldPassword ? "text" : "password"}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full pl-10 pr-11 py-2.5 bg-surface-container-low border border-outline-variant/60 rounded-xl text-sm font-medium text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                required
                autoFocus
              />
              <button
                type="button"
                id="btn-toggle-change-old-password"
                onClick={() => setShowOldPassword(!showOldPassword)}
                className="absolute right-3 p-1.5 rounded-lg text-outline hover:text-on-surface transition-colors cursor-pointer"
                aria-label={
                  showOldPassword ? "Hide password" : "Show password"
                }
              >
                {showOldPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4 text-outline" />
                )}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-1.5">
            <label
              htmlFor="change-new-password"
              className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant"
            >
              New Password
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 pointer-events-none text-outline">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                id="change-new-password"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full pl-10 pr-11 py-2.5 bg-surface-container-low border border-outline-variant/60 rounded-xl text-sm font-medium text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                required
              />
              <button
                type="button"
                id="btn-toggle-change-new-password"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 p-1.5 rounded-lg text-outline hover:text-on-surface transition-colors cursor-pointer"
                aria-label={
                  showNewPassword ? "Hide password" : "Show password"
                }
              >
                {showNewPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4 text-outline" />
                )}
              </button>
            </div>

            {/* Strength Meter */}
            {newPassword && (
              <div className="flex items-center gap-2 pt-1">
                <div className="flex-1 h-1.5 bg-surface-container rounded-full overflow-hidden flex gap-1">
                  <div
                    className={`h-full flex-1 rounded-full ${strength.score >= 1 ? strength.color : "bg-transparent"}`}
                  />
                  <div
                    className={`h-full flex-1 rounded-full ${strength.score >= 2 ? strength.color : "bg-transparent"}`}
                  />
                  <div
                    className={`h-full flex-1 rounded-full ${strength.score >= 3 ? strength.color : "bg-transparent"}`}
                  />
                  <div
                    className={`h-full flex-1 rounded-full ${strength.score >= 4 ? strength.color : "bg-transparent"}`}
                  />
                </div>
                <span className="text-[10px] font-bold text-on-surface-variant uppercase">
                  {strength.text}
                </span>
              </div>
            )}
          </div>

          {/* Submit Button */}
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
              id="btn-submit-change-password"
              disabled={changePasswordMutation.isPending}
              className="px-5 py-2.5 bg-primary hover:bg-primary/95 text-on-primary font-bold text-xs rounded-xl shadow-xs transition-all active:scale-98 disabled:opacity-60 flex items-center gap-2 cursor-pointer"
            >
              {changePasswordMutation.isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <span>Update Password</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
