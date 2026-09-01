import { useState } from "react";
import { AlertCircle, CheckCircle2, X } from "lucide-react";
import { type AuthMode } from "@/types";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import ForgotPasswordForm from "./ForgotPasswordForm";

interface AuthComponentProps {
  initialMode?: AuthMode;
  onSuccess?: () => void;
  onClose?: () => void;
  isModal?: boolean;
}

export default function AuthComponent({
  initialMode = "login",
  onSuccess,
  onClose,
  isModal = false,
}: AuthComponentProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const switchMode = (newMode: AuthMode) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setMode(newMode);
  };

  return (
    <div className={`w-full max-w-md mx-auto ${isModal ? "p-0" : "p-2"}`}>
      <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-3xl shadow-xl overflow-hidden relative transition-all duration-300">
        {/* Top accent line */}
        <div className="h-1.5 w-full bg-linear-to-r from-primary via-primary-fixed to-secondary" />

        {/* Modal Close Button */}
        {isModal && onClose && (
          <button
            id="btn-auth-close"
            onClick={onClose}
            aria-label="Close authentication window"
            className="absolute top-4 right-4 p-2 rounded-full text-outline hover:text-on-surface hover:bg-surface-container transition-all active:scale-95 z-20 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Notification alerts */}
        <div className="px-6 pt-6">
          {errorMessage && (
            <div
              id="auth-error-alert"
              className="mb-4 p-3.5 bg-error-container/40 border border-error/30 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-1 duration-200"
            >
              <AlertCircle className="w-5 h-5 text-error shrink-0 mt-0.5" />
              <p className="text-xs font-semibold text-on-error-container leading-relaxed">
                {errorMessage}
              </p>
            </div>
          )}

          {successMessage && (
            <div
              id="auth-success-alert"
              className="mb-4 p-3.5 bg-primary/10 border border-primary/30 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-1 duration-200"
            >
              <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <p className="text-xs font-semibold text-primary leading-relaxed">
                {successMessage}
              </p>
            </div>
          )}
        </div>

        {/* Form View Container */}
        <div className="p-6 md:p-8 pt-2">
          {mode === "login" && (
            <LoginForm
              onSuccess={onSuccess}
              onSwitchToRegister={() => switchMode("register")}
              onSwitchToForgotPassword={() => switchMode("forgot-password")}
              setErrorMessage={setErrorMessage}
              setSuccessMessage={setSuccessMessage}
            />
          )}

          {mode === "register" && (
            <RegisterForm
              onSuccess={onSuccess}
              onSwitchToLogin={() => switchMode("login")}
              setErrorMessage={setErrorMessage}
              setSuccessMessage={setSuccessMessage}
            />
          )}

          {mode === "forgot-password" && (
            <ForgotPasswordForm
              onSwitchToLogin={() => switchMode("login")}
              onPasswordResetSuccess={() => {
                switchMode("login");
              }}
              setErrorMessage={setErrorMessage}
              setSuccessMessage={setSuccessMessage}
            />
          )}
        </div>
      </div>
    </div>
  );
}
