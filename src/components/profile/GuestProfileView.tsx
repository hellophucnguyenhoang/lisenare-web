import {
  LogIn,
  UserPlus,
  Cloud,
  Layers,
  BarChart3,
  KeyRound,
} from "lucide-react";
import { type AuthMode } from "@/types";

interface GuestProfileViewProps {
  onOpenAuth?: (mode: AuthMode) => void;
}

export default function GuestProfileView({
  onOpenAuth,
}: GuestProfileViewProps) {
  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 pt-10 pb-24 animate-in fade-in duration-300">
      <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-3xl p-8 shadow-xs flex flex-col items-center text-center">
        <h2 className="text-xl font-bold font-display text-on-surface mb-2">
          Welcome to Lisenare
        </h2>

        <p className="text-xs text-on-surface-variant max-w-xs mb-6 leading-relaxed">
          Simple and effective practice.
        </p>

        <div className="w-full flex flex-col gap-2.5 mb-6">
          <button
            type="button"
            onClick={() => onOpenAuth?.("login")}
            className="w-full py-3 px-4 bg-primary hover:bg-primary/95 text-on-primary font-bold text-xs rounded-xl shadow-xs transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            Log In to Account
          </button>

          <button
            type="button"
            onClick={() => onOpenAuth?.("register")}
            className="w-full py-2.5 px-4 bg-surface hover:bg-surface-container border border-outline-variant/70 text-on-surface font-semibold text-xs rounded-xl transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-primary" />
            Create Free Account
          </button>
        </div>

        <div className="w-full pt-4 border-t border-outline-variant/30 grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2 rounded-xl bg-surface/50">
            <Cloud className="w-4 h-4 text-primary mx-auto mb-1" />
            <span className="text-[10px] font-semibold text-outline block">
              Cloud Sync
            </span>
          </div>
          <div className="p-2 rounded-xl bg-surface/50">
            <Layers className="w-4 h-4 text-primary mx-auto mb-1" />
            <span className="text-[10px] font-semibold text-outline block">
              Collections
            </span>
          </div>
          <div className="p-2 rounded-xl bg-surface/50">
            <BarChart3 className="w-4 h-4 text-secondary mx-auto mb-1" />
            <span className="text-[10px] font-semibold text-outline block">
              Speech Stats
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onOpenAuth?.("forgot-password")}
          className="mt-5 text-[11px] text-outline hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
        >
          <KeyRound className="w-3 h-3" />
          Forgot Password?
        </button>
      </div>
    </div>
  );
}
