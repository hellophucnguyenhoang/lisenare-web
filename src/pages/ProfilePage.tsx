import { useState } from "react";
import {
  Flame,
  Award,
  CheckCircle,
  Mic,
  LogIn,
  LogOut,
  UserPlus,
  KeyRound,
  ShieldCheck,
  Mail,
  Edit3,
  Cloud,
  Layers,
  BarChart3,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { type AuthMode } from "@/types";
import { useLearnerMe } from "@/hooks/useLearner";
import { useBricks } from "@/hooks/useBricks";
import EmailManagerModal from "@/components/profile/EmailManagerModal";
import ChangePasswordModal from "@/components/profile/ChangePasswordModal";
import ChangeNameModal from "@/components/profile/ChangeNameModal";
import ProfileHeaderCard from "@/components/profile/ProfileHeaderCard";

interface ProfilePageProps {
  onOpenAuth?: (mode: AuthMode) => void;
  onLogout?: () => void;
}

export default function ProfilePage({
  onOpenAuth,
  onLogout,
}: ProfilePageProps) {
  const { data: learner, isLoading: loadingLearner } = useLearnerMe();
  const { data: bricksData } = useBricks();
  const bricks = bricksData?.items ?? [];

  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);

  const isLoggedIn = Boolean(learner);

  // Statistics
  const learnedCount = bricks.filter((b) => b.learned).length;
  const totalCount = bricks.length;

  const weeklyActivity = [
    { day: "Mon", count: 4 },
    { day: "Tue", count: 8 },
    { day: "Wed", count: 5 },
    { day: "Thu", count: 12 },
    { day: "Fri", count: 6 },
    { day: "Sat", count: 2 },
    { day: "Sun", count: 9 },
  ];

  const maxWeeklyCount = Math.max(...weeklyActivity.map((w) => w.count));

  const learnerName = learner?.name || "Learner";
  const learnerEmail = learner?.email || "";
  const isEmailVerified = learner?.isEmailVerified ?? Boolean(learnerEmail);

  if (loadingLearner) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-24 text-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 1. GUEST / LOGGED-OUT VIEW
  // ─────────────────────────────────────────────────────────────
  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto px-4 sm:px-6 pt-10 pb-24 animate-in fade-in duration-300">
        <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-3xl p-8 shadow-xs flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl border border-primary/20 flex items-center justify-center mb-4 shadow-xs overflow-hidden">
            <img
              src="/favicon.svg"
              alt="Lisenare Logo"
              className="w-full h-full object-contain rounded-xl"
            />
          </div>

          <h2 className="text-xl font-bold font-display text-on-surface mb-2">
            Welcome to Lisenare
          </h2>

          <p className="text-xs text-on-surface-variant max-w-xs mb-6 leading-relaxed">
            Sign in to sync your vocabulary bricks, track pronunciation
            accuracy, and maintain streaks across devices.
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

  // ─────────────────────────────────────────────────────────────
  // 2. LOGGED-IN VIEW
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 pb-24 animate-in fade-in duration-300 space-y-6">
      {/* Learner Header Profile Card */}
      <ProfileHeaderCard
        learnerName={learnerName}
        learnerEmail={learnerEmail}
        isEmailVerified={isEmailVerified}
        onOpenEmailModal={() => setIsEmailModalOpen(true)}
        onOpenNameModal={() => setIsNameModalOpen(true)}
      />

      {/* Learning Metrics Grid */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-xs">
          <Flame className="w-6 h-6 text-secondary fill-secondary-container/20 mb-1.5" />
          <span className="text-xl font-bold font-display text-on-surface">
            7 Days
          </span>
          <span className="text-[10px] text-outline font-semibold uppercase tracking-wider">
            Streak
          </span>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-xs">
          <Award className="w-6 h-6 text-primary mb-1.5" />
          <span className="text-xl font-bold font-display text-on-surface">
            {learnedCount * 10} XP
          </span>
          <span className="text-[10px] text-outline font-semibold uppercase tracking-wider">
            Total Score
          </span>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-xs">
          <CheckCircle className="w-6 h-6 text-emerald-600 mb-1.5" />
          <span className="text-xl font-bold font-display text-on-surface">
            {learnedCount} / {totalCount}
          </span>
          <span className="text-[10px] text-outline font-semibold uppercase tracking-wider">
            Learned
          </span>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-xs">
          <Mic className="w-6 h-6 text-secondary mb-1.5" />
          <span className="text-xl font-bold font-display text-on-surface">
            92%
          </span>
          <span className="text-[10px] text-outline font-semibold uppercase tracking-wider">
            Pronunciation
          </span>
        </div>
      </section>

      {/* Weekly Activity Overview */}
      <section className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-5 shadow-xs">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold font-display text-on-surface flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Weekly Practice Activity
          </h3>
          <span className="text-[11px] text-outline font-medium flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            Last 7 Days
          </span>
        </div>

        <div className="flex items-end justify-between h-28 pt-2">
          {weeklyActivity.map((w, index) => {
            const heightPercent =
              maxWeeklyCount > 0 ? (w.count / maxWeeklyCount) * 100 : 0;
            return (
              <div
                key={index}
                className="flex flex-col items-center group flex-1"
              >
                <div className="h-20 w-full flex items-end justify-center px-2">
                  <div
                    className="w-4 bg-primary hover:bg-primary/80 rounded-t-md transition-all duration-300 shadow-xs cursor-pointer"
                    style={{ height: `${Math.max(heightPercent, 12)}%` }}
                    title={`${w.count} bricks studied on ${w.day}`}
                  ></div>
                </div>
                <span className="text-[10px] font-bold text-on-surface-variant mt-2">
                  {w.day}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Account Controls */}
      <section className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-5 shadow-xs">
        <h3 className="text-sm font-bold font-display text-on-surface mb-3 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-primary" />
          Account Settings
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* Email Settings */}
          <button
            type="button"
            id="btn-email-settings"
            onClick={() => setIsEmailModalOpen(true)}
            className="p-3 bg-surface hover:bg-surface-container border border-outline-variant/50 rounded-xl text-left transition-all active:scale-98 group flex items-center gap-3 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Mail className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-on-surface group-hover:text-primary transition-colors truncate">
                Email Settings
              </h4>
              <p className="text-[10px] text-outline truncate">
                {learnerEmail
                  ? isEmailVerified
                    ? "Verified"
                    : "Unverified"
                  : "Add email"}
              </p>
            </div>
          </button>

          {/* Change Password (direct password change, no OTP) */}
          <button
            type="button"
            id="btn-change-password"
            onClick={() => setIsPasswordModalOpen(true)}
            className="p-3 bg-surface hover:bg-surface-container border border-outline-variant/50 rounded-xl text-left transition-all active:scale-98 group flex items-center gap-3 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <KeyRound className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-on-surface group-hover:text-primary transition-colors truncate">
                Change Password
              </h4>
              <p className="text-[10px] text-outline truncate">
                Update password
              </p>
            </div>
          </button>

          {/* Edit Display Name */}
          <button
            type="button"
            id="btn-edit-name-settings"
            onClick={() => setIsNameModalOpen(true)}
            className="p-3 bg-surface hover:bg-surface-container border border-outline-variant/50 rounded-xl text-left transition-all active:scale-98 group flex items-center gap-3 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Edit3 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-on-surface group-hover:text-primary transition-colors truncate">
                Display Name
              </h4>
              <p className="text-[10px] text-outline truncate">
                Edit profile name
              </p>
            </div>
          </button>

          {/* Sign Out */}
          <button
            type="button"
            id="btn-sign-out"
            onClick={onLogout}
            className="p-3 bg-surface hover:bg-error-container/20 border border-outline-variant/50 hover:border-error/40 rounded-xl text-left transition-all active:scale-98 group flex items-center gap-3 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-error-container/10 text-error flex items-center justify-center shrink-0">
              <LogOut className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-error truncate">
                Sign Out
              </h4>
              <p className="text-[10px] text-outline truncate">
                Switch to guest
              </p>
            </div>
          </button>
        </div>
      </section>

      {/* Email Management Modal */}
      <EmailManagerModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        currentLearner={learner}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />

      {/* Change Name Modal */}
      <ChangeNameModal
        isOpen={isNameModalOpen}
        currentName={learnerName}
        onClose={() => setIsNameModalOpen(false)}
      />
    </div>
  );
}
