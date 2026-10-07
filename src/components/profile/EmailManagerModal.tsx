import { useState, useEffect, useRef, type KeyboardEvent } from "react";
import {
  Mail,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowLeft,
  Send,
  KeyRound,
  User as UserIcon,
  Loader2,
  Edit3,
} from "lucide-react";
import { type Learner } from "@/types";
import { useSendEmailChangeOtp, useChangeEmail } from "@/hooks/useLearner";
import { maskEmail } from "@/utils/maskEmail";
import { toast } from "sonner";

interface EmailManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLearner?: Learner;
}

type EmailStep = "overview" | "enter-details" | "verify-otp" | "success";

export default function EmailManagerModal({
  isOpen,
  onClose,
  currentLearner,
}: EmailManagerModalProps) {
  const currentEmail = currentLearner?.email || "";
  const isVerified = currentLearner?.isEmailVerified ?? Boolean(currentEmail);
  const currentUsername = currentLearner?.name || "";

  const sendEmailOtpMutation = useSendEmailChangeOtp();
  const changeEmailMutation = useChangeEmail();

  const [step, setStep] = useState<EmailStep>("overview");
  const [username, setUsername] = useState(currentUsername);
  const [oldEmail, setOldEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(60 * 5);
  const [isCounting, setIsCounting] = useState(false);

  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const isLoading =
    sendEmailOtpMutation.isPending || changeEmailMutation.isPending;

  // Reset state when opening modal
  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      setOtpDigits(["", "", "", "", "", ""]);
      setOldEmail("");
      setNewEmail("");
      setUsername(currentUsername);

      if (!currentEmail) {
        setStep("enter-details");
      } else {
        setStep("overview");
      }
    }
  }, [isOpen, currentEmail, currentUsername]);

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (isCounting && countdown > 0) {
      timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    } else if (countdown === 0) {
      setIsCounting(false);
    }
    return () => clearTimeout(timer);
  }, [isCounting, countdown]);

  if (!isOpen) return null;

  // Handle OTP digit change with auto-advance
  const handleDigitChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Paste handling
      const digits = value.replace(/\D/g, "").slice(0, 6).split("");
      if (digits.length > 0) {
        const nextDigits = [...otpDigits];
        digits.forEach((d, i) => {
          if (index + i < 6) nextDigits[index + i] = d;
        });
        setOtpDigits(nextDigits);
        const nextFocus = Math.min(index + digits.length, 5);
        otpInputsRef.current[nextFocus]?.focus();
      }
      return;
    }

    const cleanChar = value.replace(/\D/g, "");
    const nextDigits = [...otpDigits];
    nextDigits[index] = cleanChar;
    setOtpDigits(nextDigits);

    if (cleanChar && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  // Action: Request OTP for new/current email
  const handleSendOtp = (e: React.SubmitEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!username.trim()) {
      setErrorMessage("Username is required to request an OTP.");
      return;
    }

    if (currentEmail) {
      if (!oldEmail.trim() || !emailRegex.test(oldEmail.trim())) {
        setErrorMessage("Please enter your current email address.");
        return;
      }
    }

    if (!newEmail.trim() || !emailRegex.test(newEmail.trim())) {
      setErrorMessage("Please enter a valid new email address.");
      return;
    }

    if (
      currentEmail &&
      oldEmail.trim().toLowerCase() === newEmail.trim().toLowerCase()
    ) {
      setErrorMessage(
        "New email address must be different from your current email.",
      );
      return;
    }

    sendEmailOtpMutation.mutate(
      {
        old_email: currentEmail ? oldEmail.trim().toLowerCase() : null,
        new_email: newEmail.trim().toLowerCase(),
      },
      {
        onSuccess: () => {
          toast.success(
            `Verification code sent to ${maskEmail(newEmail.trim())}`,
          );
          setStep("verify-otp");
          setCountdown(60 * 5);
          setIsCounting(true);
          setOtpDigits(["", "", "", "", "", ""]);
          setTimeout(() => {
            otpInputsRef.current[0]?.focus();
          }, 150);
        },
      },
    );
  };

  // Action: Verify OTP Code and change email
  const handleVerifyOtp = (e: React.SubmitEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const enteredCode = otpDigits.join("");
    if (enteredCode.length !== 6) {
      setErrorMessage("Please enter the complete 6-digit verification code.");
      return;
    }

    changeEmailMutation.mutate(
      {
        old_email: currentEmail ? oldEmail.trim().toLowerCase() : null,
        new_email: newEmail.trim().toLowerCase(),
        otp: enteredCode,
      },
      {
        onSuccess: () => {
          toast.success("Email successfully verified and updated!");
          setStep("success");
        },
      },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      {/* Modal Container */}
      <div className="relative bg-surface-container-lowest border border-outline-variant/60 rounded-3xl w-full max-w-md p-6 shadow-2xl z-10 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-outline-variant/30">
          <div className="flex items-center gap-2.5">
            {step !== "overview" && step !== "success" && currentEmail && (
              <button
                type="button"
                onClick={() => {
                  setErrorMessage(null);
                  setStep("overview");
                }}
                className="p-1.5 -ml-1 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors cursor-pointer"
                title="Back"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold font-display text-on-surface">
                {currentEmail ? "Change Email" : "Add Email"}
              </h3>
              <p className="text-xs text-outline">
                {currentEmail
                  ? "Update your linked email address"
                  : "Link an email address to your account"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-outline hover:text-on-surface hover:bg-surface-container rounded-xl transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error notification banner */}
        {errorMessage && (
          <div className="mt-4 p-3 bg-error-container/20 border border-error/30 rounded-xl flex items-start gap-2.5 text-xs text-error animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="flex-1">{errorMessage}</span>
          </div>
        )}

        {/* STEP 1: Overview (if user already has an email) */}
        {step === "overview" && currentEmail && (
          <div className="mt-5 space-y-4">
            <div className="bg-surface-container-low border border-outline-variant/50 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-outline">
                  Current Email
                </span>
                {isVerified ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
                    <AlertCircle className="w-3 h-3" />
                    Unverified
                  </span>
                )}
              </div>

              <div className="text-sm font-semibold text-on-surface">
                {maskEmail(currentEmail)}
              </div>
            </div>

            <button
              type="button"
              id="btn-goto-change-email"
              onClick={() => {
                setErrorMessage(null);
                setStep("enter-details");
              }}
              className="w-full py-3 px-4 bg-primary text-on-primary font-bold text-sm rounded-xl shadow-xs hover:bg-primary/95 transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
            >
              <Edit3 className="w-4 h-4" />
              Change Email Address
            </button>
          </div>
        )}

        {/* STEP 2: Input Details (Username, Old Email if exists, New Email) & Send OTP */}
        {step === "enter-details" && (
          <form onSubmit={handleSendOtp} className="mt-5 space-y-4" noValidate>
            {/* Username Input */}
            <div className="space-y-1.5">
              <label
                htmlFor="input-email-username"
                className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant"
              >
                Username
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 pointer-events-none text-outline">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  id="input-email-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low border border-outline-variant/60 rounded-xl text-sm font-medium text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                  required
                />
              </div>
            </div>

            {/* Old Email Input (Only shown if user currently has an email) */}
            {currentEmail && (
              <div className="space-y-1.5">
                <label
                  htmlFor="input-email-old"
                  className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant"
                >
                  Current Email
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 pointer-events-none text-outline">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="input-email-old"
                    type="email"
                    value={oldEmail}
                    onChange={(e) => setOldEmail(e.target.value)}
                    placeholder={`e.g. ${maskEmail(currentEmail)}`}
                    className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low border border-outline-variant/60 rounded-xl text-sm font-medium text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                    required
                  />
                </div>
              </div>
            )}

            {/* New Email Input */}
            <div className="space-y-1.5">
              <label
                htmlFor="input-email-new"
                className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant"
              >
                {currentEmail ? "New Email Address" : "Email Address"}
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 pointer-events-none text-outline">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="input-email-new"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="e.g. your.email@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low border border-outline-variant/60 rounded-xl text-sm font-medium text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                  required
                  autoFocus
                />
              </div>
              <p className="text-[11px] text-outline mt-1">
                We'll send a 6-digit OTP to verify your new email.
              </p>
            </div>

            <div className="flex gap-2 pt-2 border-t border-outline-variant/30">
              <button
                type="button"
                onClick={() => {
                  setErrorMessage(null);
                  if (currentEmail) {
                    setStep("overview");
                  } else {
                    onClose();
                  }
                }}
                className="flex-1 py-2.5 px-3 bg-surface hover:bg-surface-container border border-outline-variant/60 text-on-surface text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                id="btn-submit-send-email-otp"
                disabled={isLoading}
                className="flex-2 py-2.5 px-4 bg-primary text-on-primary font-bold text-xs rounded-xl shadow-xs hover:bg-primary/95 transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                Send OTP
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Verify OTP Code */}
        {step === "verify-otp" && (
          <form
            onSubmit={handleVerifyOtp}
            className="mt-5 space-y-4"
            noValidate
          >
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary mb-2">
                <KeyRound className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-on-surface">
                Enter 6-Digit Code
              </h4>
              <p className="text-xs text-outline mt-0.5">
                Sent to{" "}
                <span className="font-semibold text-on-surface">
                  {maskEmail(newEmail)}
                </span>
              </p>
            </div>

            {/* OTP Input 6-Box Grid */}
            <div className="flex justify-center gap-2 my-4">
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    otpInputsRef.current[idx] = el;
                  }}
                  id={`otp-input-${idx}`}
                  type="text"
                  maxLength={1}
                  inputMode="numeric"
                  value={digit}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className="w-10 h-12 text-center text-lg font-bold font-mono bg-surface border border-outline-variant/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-on-surface shadow-xs transition-all"
                />
              ))}
            </div>

            {/* Resend OTP */}
            <div className="flex items-center justify-between text-xs text-outline pt-1">
              <span>Didn't get the code?</span>
              <button
                type="button"
                disabled={isCounting || isLoading}
                onClick={(e) =>
                  handleSendOtp(e as unknown as React.SubmitEvent)
                }
                className="font-bold text-primary hover:underline disabled:text-outline/50 disabled:no-underline cursor-pointer"
              >
                {isCounting ? `Resend in ${countdown}s` : "Resend OTP"}
              </button>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              id="btn-confirm-email-otp"
              disabled={isLoading || otpDigits.join("").length !== 6}
              className="w-full py-3 px-4 bg-primary text-on-primary font-bold text-sm rounded-xl shadow-xs hover:bg-primary/95 transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              Confirm & Update Email
            </button>
          </form>
        )}

        {/* STEP 4: Success View */}
        {step === "success" && (
          <div className="mt-5 text-center space-y-4 py-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-on-surface">
                Email Updated!
              </h4>
              <p className="text-xs text-outline mt-1">
                Your email has been successfully updated to{" "}
                <span className="font-semibold text-on-surface">
                  {maskEmail(newEmail)}
                </span>
                .
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 px-4 bg-primary text-on-primary font-bold text-xs rounded-xl shadow-xs hover:bg-primary/95 transition-all cursor-pointer"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
