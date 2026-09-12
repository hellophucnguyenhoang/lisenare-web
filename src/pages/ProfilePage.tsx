import { useState } from "react";
import { type AuthMode } from "@/types";
import { useLearnerMe } from "@/hooks/useLearner";
import { useLearningStats, useLearningTimeseries } from "@/hooks/useStats";
import EmailManagerModal from "@/components/profile/EmailManagerModal";
import ChangePasswordModal from "@/components/profile/ChangePasswordModal";
import ChangeNameModal from "@/components/profile/ChangeNameModal";
import ProfileHeaderCard from "@/components/profile/ProfileHeaderCard";
import GuestProfileView from "@/components/profile/GuestProfileView";
import LearningMetricsGrid from "@/components/profile/LearningMetricsGrid";
import PracticeActivityCard from "@/components/profile/PracticeActivityCard";
import AccountSettingsSection from "@/components/profile/AccountSettingsSection";

interface ProfilePageProps {
  onOpenAuth?: (mode: AuthMode) => void;
  onLogout?: () => void;
}

export default function ProfilePage({
  onOpenAuth,
  onLogout,
}: ProfilePageProps) {
  const { data: learner, isLoading: loadingLearner } = useLearnerMe();
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
  const { data: stats, isLoading: loadingStats } = useLearningStats(
    undefined,
    isLoggedIn,
  );

  // Real timeseries data from /brick-memories/stats/timeseries
  const { data: timeseriesData, isLoading: loadingTimeseries } =
    useLearningTimeseries(
      {
        metric: timeseriesMetric,
        days: timeseriesDays,
      },
      isLoggedIn,
    );

  const timeseriesPoints = timeseriesData?.data ?? [];
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

  // 1. GUEST / LOGGED-OUT VIEW
  if (!isLoggedIn) {
    return <GuestProfileView onOpenAuth={onOpenAuth} />;
  }

  // 2. LOGGED-IN VIEW
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

      {/* Real Learning Metrics Grid from /brick-memories/stats */}
      <LearningMetricsGrid stats={stats} isLoading={loadingStats} />

      {/* Real Learning Timeseries Section from /brick-memories/stats/timeseries */}
      <PracticeActivityCard
        metric={timeseriesMetric}
        onMetricChange={setTimeseriesMetric}
        days={timeseriesDays}
        onDaysChange={setTimeseriesDays}
        points={timeseriesPoints}
        isLoading={loadingTimeseries}
      />

      {/* Account Settings Section */}
      <AccountSettingsSection
        learnerEmail={learnerEmail}
        isEmailVerified={isEmailVerified}
        onOpenEmailModal={() => setIsEmailModalOpen(true)}
        onOpenPasswordModal={() => setIsPasswordModalOpen(true)}
        onOpenNameModal={() => setIsNameModalOpen(true)}
        onLogout={onLogout}
      />

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
