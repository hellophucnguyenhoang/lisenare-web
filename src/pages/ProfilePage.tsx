import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { type AuthMode, type RetrievalLang } from "@/types";
import { useLearnerMe, useUpdateRetrievalLang } from "@/hooks/useLearner";
import { useLearningStats, useLearningTimeseries } from "@/hooks/useStats";
import { useHeader } from "@/context/HeaderContext";
import EmailManagerModal from "@/components/profile/EmailManagerModal";
import ChangePasswordModal from "@/components/profile/ChangePasswordModal";
import ChangeNameModal from "@/components/profile/ChangeNameModal";
import ProfileHeaderCard from "@/components/profile/ProfileHeaderCard";
import GuestProfileView from "@/components/profile/GuestProfileView";
import LearningMetricsGrid from "@/components/profile/LearningMetricsGrid";
import RetrievalActivityCard from "@/components/profile/RetrievalActivityCard";
import AccountSettingsSection from "@/components/profile/AccountSettingsSection";
import TargetLanguageSelector from "@/components/profile/TargetLanguageSelector";

interface ProfilePageProps {
  onOpenAuth?: (mode: AuthMode) => void;
  onLogout?: () => void;
}

export default function ProfilePage({
  onOpenAuth,
  onLogout,
}: ProfilePageProps) {
  const {
    data: learner,
    isLoading: loadingLearner,
    refetch: refetchLearner,
    isFetching: fetchingLearner,
  } = useLearnerMe();
  const updateRetrievalLang = useUpdateRetrievalLang();
  const isLoggedIn = Boolean(learner);

  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);

  // Timeseries controls
  const [timeseriesMetric, setTimeseriesMetric] = useState<
    "reviews" | "total_learning"
  >("reviews");
  const [timeseriesDays, setTimeseriesDays] = useState<number | null>(7);

  // Real statistical data from /brick-memories/stats
  const {
    data: stats,
    isLoading: loadingStats,
    refetch: refetchStats,
    isFetching: fetchingStats,
  } = useLearningStats(undefined, isLoggedIn);

  // Real timeseries data from /brick-memories/stats/timeseries
  const {
    data: timeseriesData,
    isLoading: loadingTimeseries,
    refetch: refetchTimeseries,
    isFetching: fetchingTimeseries,
  } = useLearningTimeseries(
    {
      metric: timeseriesMetric,
      days: timeseriesDays,
    },
    isLoggedIn,
  );

  const queryClient = useQueryClient();
  const isReloading = fetchingLearner || fetchingStats || fetchingTimeseries;

  const handleReload = async () => {
    try {
      await Promise.all([
        refetchLearner(),
        refetchStats(),
        refetchTimeseries(),
        queryClient.invalidateQueries({ queryKey: ["learner"] }),
        queryClient.invalidateQueries({ queryKey: ["learning-stats"] }),
        queryClient.invalidateQueries({ queryKey: ["learning-timeseries"] }),
      ]);
      toast.success("Profile reloaded.");
    } catch {
      toast.error("Failed to reload profile.");
    }
  };

  const timeseriesPoints = timeseriesData?.data ?? [];
  const learnerName = learner?.name || "Learner";
  const learnerEmail = learner?.email || "";
  const isEmailVerified = learner?.isEmailVerified ?? Boolean(learnerEmail);
  const currentRetrievalLang = (learner?.retrieval_lang ||
    learner?.retrievalLang ||
    "en") as RetrievalLang;

  const handleSelectRetrievalLang = (newLang: RetrievalLang) => {
    if (newLang === currentRetrievalLang) return;
    updateRetrievalLang.mutate(newLang, {
      onSuccess: () => {
        const langName =
          newLang === "ja"
            ? "Japanese"
            : newLang === "vi"
              ? "Vietnam"
              : "English";
        toast.success(`Target language updated to ${langName}`);
      },
      onError: () => {
        toast.error("Failed to update target language. Please try again.");
      },
    });
  };

  const { setHeaderContent } = useHeader();

  // Dynamically update the fixed sticky header with target language info
  useEffect(() => {
    if (!isLoggedIn) {
      setHeaderContent(null);
      return;
    }
    const flag =
      currentRetrievalLang === "ja"
        ? "🇯🇵"
        : currentRetrievalLang === "vi"
          ? "🇻🇳"
          : "🇺🇸";
    const name =
      currentRetrievalLang === "ja"
        ? "Japanese"
        : currentRetrievalLang === "vi"
          ? "Vietnam"
          : "English";

    setHeaderContent(
      <div className="flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-xl">
        <span>{flag}</span>
        <span className="hidden sm:inline">{name}</span>
      </div>,
    );
    return () => setHeaderContent(null);
  }, [isLoggedIn, currentRetrievalLang, setHeaderContent]);

  if (loadingLearner) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-24 text-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  // 1. GUEST / LOGGED-OUT VIEW
  if (!isLoggedIn) {
    return <GuestProfileView onOpenAuth={onOpenAuth} />;
  }

  // 2. LOGGED-IN VIEW
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 pb-24 animate-in fade-in duration-300 space-y-6">
      {/* Learner header profile card */}
      <ProfileHeaderCard
        learnerName={learnerName}
        learnerEmail={learnerEmail}
        isEmailVerified={isEmailVerified}
        onOpenEmailModal={() => setIsEmailModalOpen(true)}
        onOpenNameModal={() => setIsNameModalOpen(true)}
        onReload={handleReload}
        isReloading={isReloading}
      />

      {/* Minimal target language selector */}
      <TargetLanguageSelector
        currentLang={currentRetrievalLang}
        onSelectLang={handleSelectRetrievalLang}
        isUpdating={updateRetrievalLang.isPending}
      />

      {/* Real learning metrics grid from /brick-memories/stats */}
      <LearningMetricsGrid stats={stats} isLoading={loadingStats} />

      {/* Real learning timeseries section from /brick-memories/stats/timeseries */}
      <RetrievalActivityCard
        metric={timeseriesMetric}
        onMetricChange={setTimeseriesMetric}
        days={timeseriesDays}
        onDaysChange={setTimeseriesDays}
        points={timeseriesPoints}
        isLoading={loadingTimeseries}
      />

      {/* Account settings section */}
      <AccountSettingsSection
        learnerEmail={learnerEmail}
        isEmailVerified={isEmailVerified}
        onOpenEmailModal={() => setIsEmailModalOpen(true)}
        onOpenPasswordModal={() => setIsPasswordModalOpen(true)}
        onOpenNameModal={() => setIsNameModalOpen(true)}
        onLogout={onLogout}
      />

      {/* Email management modal */}
      <EmailManagerModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        currentLearner={learner}
      />

      {/* Change password modal */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />

      {/* Change name modal */}
      <ChangeNameModal
        isOpen={isNameModalOpen}
        currentName={learnerName}
        onClose={() => setIsNameModalOpen(false)}
      />
    </div>
  );
}
