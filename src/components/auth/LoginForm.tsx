import { useState } from "react";
import {
  Eye,
  EyeOff,
  Lock,
  User as UserIcon,
  KeyRound,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister: () => void;
  onSwitchToForgotPassword: () => void;
  setErrorMessage: (msg: string | null) => void;
  setSuccessMessage: (msg: string | null) => void;
}

export default function LoginForm({
  onSuccess,
  onSwitchToRegister,
  onSwitchToForgotPassword,
  setErrorMessage,
  setSuccessMessage,
}: LoginFormProps) {
  const { login, loginWithGoogle, isLoading } = useAuth();
  const [username, setUsername] = useState("hoangphuc");
  const [password, setPassword] = useState("kcmtl5cM#");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!username.trim()) {
      setErrorMessage("Please enter your username.");
      return;
    }
    if (!password) {
      setErrorMessage("Please enter your password.");
      return;
    }

    login(
      { username: username.trim(), password },
      {
        onSuccess: () => {
          toast.success("Logged in successfully!");
          setTimeout(() => {
            onSuccess?.();
          }, 600);
        },
      },
    );
  };

  const handleGoogleLogin = () => {
    setErrorMessage(null);
    loginWithGoogle({
      onSuccess: () => {
        toast.success("Signed in with Google successfully!");
        setTimeout(() => {
          onSuccess?.();
        }, 600);
      },
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Title */}
      <div className="text-center space-y-1.5">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center mb-2 shadow-xs">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold font-display text-on-surface tracking-tight">
          Welcome Back
        </h2>
        <p className="text-xs text-on-surface-variant font-medium">
          Continue building your vocabulary bricks
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Username Input */}
        <div className="space-y-1.5">
          <label
            htmlFor="login-username"
            className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant"
          >
            Username
          </label>
          <div className="relative flex items-center">
            <div className="absolute left-3.5 pointer-events-none text-outline">
              <UserIcon className="w-4 h-4" />
            </div>
            <input
              id="login-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="w-full pl-10 pr-4 py-3 bg-surface-container-low border border-outline-variant/60 rounded-xl text-sm font-medium text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
              required
            />
          </div>
        </div>

        {/* Password Input with Show/Hide toggle */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label
              htmlFor="login-password"
              className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant"
            >
              Password
            </label>
            <button
              type="button"
              id="btn-goto-forgot-password"
              onClick={onSwitchToForgotPassword}
              className="text-xs font-bold text-primary hover:text-primary-container transition-colors cursor-pointer"
            >
              Forgot Password?
            </button>
          </div>
          <div className="relative flex items-center">
            <div className="absolute left-3.5 pointer-events-none text-outline">
              <KeyRound className="w-4 h-4" />
            </div>
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full pl-10 pr-11 py-3 bg-surface-container-low border border-outline-variant/60 rounded-xl text-sm font-medium text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
              required
            />
            <button
              type="button"
              id="btn-toggle-login-password"
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
        </div>

        {/* Primary Log In Button */}
        <button
          type="submit"
          id="btn-login-submit"
          disabled={isLoading}
          className="w-full py-3 px-6 bg-primary hover:bg-primary-container text-on-primary font-bold text-sm rounded-xl shadow-md transition-all active:scale-98 disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer mt-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Logging in...</span>
            </>
          ) : (
            <span>Log In</span>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="relative flex items-center justify-center my-4">
        <div className="absolute left-0 right-0 border-t border-outline-variant/50 w-full"></div>
        <span className="relative z-10 bg-surface-container-lowest px-3 text-[11px] font-bold text-outline uppercase tracking-wider">
          Or
        </span>
      </div>

      {/* Google Sign-in */}
      <button
        type="button"
        id="btn-google-login"
        onClick={handleGoogleLogin}
        disabled={isLoading}
        className="w-full py-2.5 px-4 bg-surface border border-outline-variant/80 hover:bg-surface-container text-on-surface font-semibold text-sm rounded-xl transition-all active:scale-98 flex items-center justify-center gap-3 cursor-pointer shadow-2xs"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span>Sign in with Google</span>
      </button>

      {/* Switch to Register */}
      <div className="text-center pt-2">
        <p className="text-xs text-on-surface-variant font-medium">
          Don't have an account?{" "}
          <button
            type="button"
            id="btn-goto-register"
            onClick={onSwitchToRegister}
            className="font-bold text-primary hover:underline transition-all cursor-pointer ml-1"
          >
            Register
          </button>
        </p>
      </div>
    </div>
  );
}
