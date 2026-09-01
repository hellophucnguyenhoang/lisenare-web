import { useState } from "react";
import {
  Eye,
  EyeOff,
  User as UserIcon,
  KeyRound,
  ShieldCheck,
  Sparkles,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin: () => void;
  setErrorMessage: (msg: string | null) => void;
  setSuccessMessage: (msg: string | null) => void;
}

export default function RegisterForm({
  onSuccess,
  onSwitchToLogin,
  setErrorMessage,
  setSuccessMessage,
}: RegisterFormProps) {
  const { register, isLoading } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  const regStrength = getPasswordStrength(password);

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!username.trim()) {
      setErrorMessage("Please choose a username.");
      return;
    }
    if (username.trim().length < 3) {
      setErrorMessage("Username must be at least 3 characters long.");
      return;
    }
    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    register(
      { username: username.trim(), email: "", password },
      {
        onSuccess: () => {
          setSuccessMessage("Account registered successfully! Welcome aboard.");
          setTimeout(() => {
            onSuccess?.();
          }, 700);
        },
      },
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Title */}
      <div className="text-center space-y-1.5">
        <div className="w-12 h-12 rounded-2xl bg-secondary/10 text-secondary mx-auto flex items-center justify-center mb-2 shadow-xs">
          <Sparkles className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold font-display text-on-surface tracking-tight">
          Create Account
        </h2>
        <p className="text-xs text-on-surface-variant font-medium">
          Join Lisenare to save your vocabulary streaks
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Username Input */}
        <div className="space-y-1.5">
          <label
            htmlFor="reg-username"
            className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant"
          >
            Username
          </label>
          <div className="relative flex items-center">
            <div className="absolute left-3.5 pointer-events-none text-outline">
              <UserIcon className="w-4 h-4" />
            </div>
            <input
              id="reg-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
              className="w-full pl-10 pr-4 py-3 bg-surface-container-low border border-outline-variant/60 rounded-xl text-sm font-medium text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
              required
            />
          </div>
        </div>

        {/* Password Input */}
        <div className="space-y-1.5">
          <label
            htmlFor="reg-password"
            className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant"
          >
            Password
          </label>
          <div className="relative flex items-center">
            <div className="absolute left-3.5 pointer-events-none text-outline">
              <KeyRound className="w-4 h-4" />
            </div>
            <input
              id="reg-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a strong password"
              className="w-full pl-10 pr-11 py-3 bg-surface-container-low border border-outline-variant/60 rounded-xl text-sm font-medium text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
              required
            />
            <button
              type="button"
              id="btn-toggle-reg-password"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 p-1.5 rounded-lg text-outline hover:text-on-surface transition-colors cursor-pointer"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4 text-outline" />
              )}
            </button>
          </div>

          {/* Strength Indicator */}
          {password && (
            <div className="flex items-center gap-2 pt-1">
              <div className="flex-1 h-1.5 bg-surface-container rounded-full overflow-hidden flex gap-1">
                <div
                  className={`h-full flex-1 rounded-full ${regStrength.score >= 1 ? regStrength.color : "bg-transparent"}`}
                ></div>
                <div
                  className={`h-full flex-1 rounded-full ${regStrength.score >= 2 ? regStrength.color : "bg-transparent"}`}
                ></div>
                <div
                  className={`h-full flex-1 rounded-full ${regStrength.score >= 3 ? regStrength.color : "bg-transparent"}`}
                ></div>
                <div
                  className={`h-full flex-1 rounded-full ${regStrength.score >= 4 ? regStrength.color : "bg-transparent"}`}
                ></div>
              </div>
              <span className="text-[10px] font-bold text-on-surface-variant uppercase">
                {regStrength.text}
              </span>
            </div>
          )}
        </div>

        {/* Confirm Password Input */}
        <div className="space-y-1.5">
          <label
            htmlFor="reg-confirm-password"
            className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant"
          >
            Confirm Password
          </label>
          <div className="relative flex items-center">
            <div className="absolute left-3.5 pointer-events-none text-outline">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <input
              id="reg-confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              className={`w-full pl-10 pr-11 py-3 bg-surface-container-low border rounded-xl text-sm font-medium text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 transition-all ${
                confirmPassword && password === confirmPassword
                  ? "border-green-500/60 focus:ring-green-500/40"
                  : "border-outline-variant/60 focus:ring-primary/40 focus:border-primary"
              }`}
              required
            />
            <button
              type="button"
              id="btn-toggle-reg-confirm-password"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 p-1.5 rounded-lg text-outline hover:text-on-surface transition-colors cursor-pointer"
              aria-label={
                showConfirmPassword
                  ? "Hide confirm password"
                  : "Show confirm password"
              }
            >
              {showConfirmPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4 text-outline" />
              )}
            </button>
          </div>
        </div>

        {/* Primary Register Button */}
        <button
          type="submit"
          id="btn-register-submit"
          disabled={isLoading}
          className="w-full py-3 px-6 bg-primary hover:bg-primary-container text-on-primary font-bold text-sm rounded-xl shadow-md transition-all active:scale-98 disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer mt-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Creating account...</span>
            </>
          ) : (
            <span>Register Now</span>
          )}
        </button>
      </form>

      {/* Switch to Login */}
      <div className="text-center pt-2">
        <p className="text-xs text-on-surface-variant font-medium">
          Already have an account?{" "}
          <button
            type="button"
            id="btn-goto-login-from-reg"
            onClick={onSwitchToLogin}
            className="font-bold text-primary hover:underline transition-all cursor-pointer ml-1"
          >
            Log In
          </button>
        </p>
      </div>
    </div>
  );
}
