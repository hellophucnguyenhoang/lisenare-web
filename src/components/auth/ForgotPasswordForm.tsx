import { useState, useEffect, useRef } from "react";
import {
  Eye,
  EyeOff,
  Lock,
  User as UserIcon,
  ArrowLeft,
  KeyRound,
  ShieldCheck,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { type ForgotPasswordStep } from "@/types";
import { useAuth } from "@/hooks/useAuth";

interface ForgotPasswordFormProps {
  onSwitchToLogin: () => void;
  onPasswordResetSuccess: (newPass: string) => void;
  setErrorMessage: (msg: string | null) => void;
  setSuccessMessage: (msg: string | null) => void;
}

export default function ForgotPasswordForm({
  onSwitchToLogin,
  onPasswordResetSuccess,
  setErrorMessage,
  setSuccessMessage,
}: ForgotPasswordFormProps) {
  const { sendOtp, resetPassword, isLoading } = useAuth();
  const [step, setStep] = useState<ForgotPasswordStep>(1);

  // Step 1 State
  const [username, setUsername] = useState("");

  // Step 2 State
  const [otpDigits, setOtpDigits] = useState<string[]>([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  const [resendCountdown, setResendCountdown] = useState<number>(0);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  // Timer for OTP resend countdown
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCountdown]);

  // Step 1: Send OTP
  const handleSendOtp = (e?: React.SubmitEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!username.trim()) {
      setErrorMessage("Please enter your username.");
      return;
    }

    sendOtp(username.trim(), {
      onSuccess: () => {
        setSuccessMessage("Verification code sent to your registered email!");
        setResendCountdown(60 * 5);
        setStep(2);
        setTimeout(() => {
          otpInputRefs.current[0]?.focus();
        }, 150);
      },
    });
  };

  // Step 2: OTP Digit changes
  const handleOtpDigitChange = (index: number, val: string) => {
    const cleaned = val.replace(/\D/g, "").slice(-1);
    const updated = [...otpDigits];
    updated[index] = cleaned;
    setOtpDigits(updated);

    if (cleaned && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (pasted) {
      const updated = [...otpDigits];
      for (let i = 0; i < 6; i++) {
        updated[i] = pasted[i] || "";
      }
      setOtpDigits(updated);
      const nextIdx = Math.min(pasted.length, 5);
      otpInputRefs.current[nextIdx]?.focus();
    }
  };

  // Step 2: Submit OTP and New Password together
  const handleResetPasswordSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const fullOtp = otpDigits.join("");
    if (fullOtp.length !== 6) {
      setErrorMessage("Please enter the complete 6-digit verification code.");
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage("New password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    resetPassword(
      {
        username: username.trim(),
        otp: fullOtp,
        new_password: newPassword,
      },
      {
        onSuccess: () => {
          setSuccessMessage(
            "Password reset successfully! You can now log in with your new password.",
          );
          setTimeout(() => {
            onPasswordResetSuccess(newPassword);
          }, 1200);
        },
      },
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Step Navigation Progress Indicator */}
      <div className="flex items-center justify-between pb-1 border-b border-outline-variant/30">
        <button
          type="button"
          id="btn-back-to-login"
          onClick={() => {
            if (step === 2) {
              setStep(1);
            } else {
              onSwitchToLogin();
            }
          }}
          className="flex items-center gap-1.5 text-xs font-bold text-outline hover:text-primary transition-colors py-1 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {step === 2 ? "Back" : "Back to Login"}
        </button>

        <div className="flex items-center gap-1.5">
          {[1, 2].map((s) => (
            <span
              key={s}
              className={`w-2 h-2 rounded-full transition-all ${
                step === s
                  ? "bg-primary w-5"
                  : step > s
                    ? "bg-primary-fixed-dim"
                    : "bg-surface-container-highest"
              }`}
            />
          ))}
        </div>
      </div>

      {/* STEP 1: Enter Username & Send OTP */}
      {step === 1 && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="text-center space-y-1.5">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center mb-2 shadow-xs">
              <KeyRound className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold font-display text-on-surface tracking-tight">
              Reset Password
            </h2>
            <p className="text-xs text-on-surface-variant font-medium">
              Step 1 of 2: Enter your username
            </p>
          </div>

          <form onSubmit={handleSendOtp} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <label
                htmlFor="forgot-username"
                className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant"
              >
                Username
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 pointer-events-none text-outline">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  id="forgot-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. phuchoang"
                  className="w-full pl-10 pr-4 py-3 bg-surface-container-low border border-outline-variant/60 rounded-xl text-sm font-medium text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                  required
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              id="btn-send-otp"
              disabled={isLoading || !username.trim()}
              className="w-full py-3 px-6 bg-primary hover:bg-primary-container text-on-primary font-bold text-sm rounded-xl shadow-md transition-all active:scale-98 disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer mt-3"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending OTP...</span>
                </>
              ) : (
                <span>Send OTP Code</span>
              )}
            </button>
          </form>
        </div>
      )}

      {/* STEP 2: Unified Form with OTP + New Password submitted together */}
      {step === 2 && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="text-center space-y-1.5">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center mb-2 shadow-xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold font-display text-on-surface tracking-tight">
              Set New Password
            </h2>
            <p className="text-xs text-on-surface-variant font-medium">
              Step 2 of 2: Enter the 6-digit code and your new password
            </p>
          </div>

          <form
            onSubmit={handleResetPasswordSubmit}
            className="space-y-4"
            noValidate
          >
            {/* 6 Digit Inline OTP Input Grid */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  6-Digit Verification Code
                </label>
                {resendCountdown > 0 ? (
                  <span className="text-[11px] text-outline font-medium">
                    Resend in{" "}
                    <strong className="text-primary">{resendCountdown}s</strong>
                  </span>
                ) : (
                  <button
                    type="button"
                    id="btn-resend-otp"
                    onClick={() => handleSendOtp()}
                    disabled={isLoading}
                    className="text-[11px] text-primary font-bold hover:underline flex items-center gap-1 cursor-pointer transition-all"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Resend OTP
                  </button>
                )}
              </div>
              <div className="flex justify-between gap-2">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      otpInputRefs.current[idx] = el;
                    }}
                    id={`otp-input-${idx}`}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    onPaste={handleOtpPaste}
                    className="w-11 h-12 text-center text-lg font-bold font-mono bg-surface-container-low border border-outline-variant/60 rounded-xl text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  />
                ))}
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-1.5 pt-1">
              <label
                htmlFor="new-password"
                className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant"
              >
                New Password (min. 8 characters)
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 pointer-events-none text-outline">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="new-password"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full pl-10 pr-11 py-2.5 bg-surface-container-low border border-outline-variant/60 rounded-xl text-sm font-medium text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  id="btn-toggle-new-password"
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
            </div>

            {/* Confirm New Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="confirm-new-password"
                className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant"
              >
                Confirm New Password
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 pointer-events-none text-outline">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <input
                  id="confirm-new-password"
                  type={showConfirmNewPassword ? "text" : "password"}
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className={`w-full pl-10 pr-11 py-2.5 bg-surface-container-low border rounded-xl text-sm font-medium text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 transition-all ${
                    confirmNewPassword && newPassword === confirmNewPassword
                      ? "border-green-500/60 focus:ring-green-500/40"
                      : "border-outline-variant/60 focus:ring-primary/40 focus:border-primary"
                  }`}
                  required
                />
                <button
                  type="button"
                  id="btn-toggle-confirm-new-password"
                  onClick={() =>
                    setShowConfirmNewPassword(!showConfirmNewPassword)
                  }
                  className="absolute right-3 p-1.5 rounded-lg text-outline hover:text-on-surface transition-colors cursor-pointer"
                  aria-label={
                    showConfirmNewPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                >
                  {showConfirmNewPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4 text-outline" />
                  )}
                </button>
              </div>
            </div>

            {/* Reset Password Button */}
            <button
              type="submit"
              id="btn-reset-password-submit"
              disabled={
                isLoading ||
                otpDigits.join("").length !== 6 ||
                newPassword.length < 8 ||
                newPassword !== confirmNewPassword
              }
              className="w-full py-3 px-6 bg-primary hover:bg-primary-container text-on-primary font-bold text-sm rounded-xl shadow-md transition-all active:scale-98 disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer mt-3"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Resetting password...</span>
                </>
              ) : (
                <span>Reset Password</span>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Back to Login link footer */}
      <div className="text-center pt-1">
        <button
          type="button"
          id="btn-footer-back-to-login"
          onClick={onSwitchToLogin}
          className="text-xs font-bold text-primary hover:underline transition-all cursor-pointer"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}
