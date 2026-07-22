import { type Brick, type Collection } from "../types";
import {
  Trophy,
  Flame,
  Award,
  TrendingUp,
  User,
  BookOpen,
  CheckCircle,
  Mic,
  Calendar,
} from "lucide-react";

interface ProfileViewProps {
  bricks: Brick[];
  collections: Collection[];
  points: number;
}

export default function ProfileView({
  bricks,
  collections,
  points,
}: ProfileViewProps) {
  // Statistics computation
  const masteredCount = bricks.filter((b) => b.status === "mastered").length;
  const learningCount = bricks.filter((b) => b.status === "reviewing").length;
  const totalCount = bricks.length;

  // Calculate average pronunciation score
  const bricksWithScores = bricks.filter(
    (b) => b.pronunciationScore !== undefined && b.pronunciationScore > 0,
  );
  const avgPronunciation =
    bricksWithScores.length > 0
      ? Math.round(
          bricksWithScores.reduce(
            (acc, curr) => acc + (curr.pronunciationScore || 0),
            0,
          ) / bricksWithScores.length,
        )
      : 92; // default high average fallback

  // Active collections
  const activeColCount = collections.length;

  const achievements = [
    {
      id: "early",
      title: "First Brick Laid",
      description: "Mastered your first vocabulary brick.",
      completed: masteredCount >= 1,
      icon: BookOpen,
      color: "text-primary",
    },
    {
      id: "vocal",
      title: "Vocal Champion",
      description: "Maintain average pronunciation above 90%.",
      completed: avgPronunciation >= 90,
      icon: Mic,
      color: "text-secondary",
    },
    {
      id: "streak",
      title: "Consistent Builder",
      description: "Collect more than 10 total vocabulary bricks.",
      completed: totalCount >= 10,
      icon: Flame,
      color: "text-orange-500",
    },
    {
      id: "master",
      title: "Spanish Survivalist",
      description: "Master 5+ bricks in the Travel Phrases set.",
      completed:
        bricks.filter(
          (b) => b.collectionId === "travel" && b.status === "mastered",
        ).length >= 5,
      icon: Trophy,
      color: "text-yellow-500",
    },
  ];

  // Daily activity bars data representation
  const weeklyActivity = [
    { day: "Mon", count: 4, label: "4 bricks" },
    { day: "Tue", count: 8, label: "8 bricks" },
    { day: "Wed", count: 5, label: "5 bricks" },
    { day: "Thu", count: 12, label: "12 bricks" },
    { day: "Fri", count: 6, label: "6 bricks" },
    { day: "Sat", count: 2, label: "2 bricks" },
    { day: "Sun", count: 9, label: "9 bricks" },
  ];

  const maxWeeklyCount = Math.max(...weeklyActivity.map((w) => w.count));

  return (
    <div className="max-w-max-width mx-auto px-container-padding pt-6 pb-32 animate-in fade-in duration-300">
      {/* User profile card */}
      <section className="mb-10 bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 shadow-xs">
        <div className="w-20 h-20 rounded-full border-4 border-primary-fixed-dim overflow-hidden bg-surface-container-high relative">
          <img
            className="w-full h-full object-cover"
            alt="Educator headshot"
            src="/coder_cat.png"
          />
        </div>
        <div className="text-center md:text-left flex-1 space-y-1">
          <h2 className="text-2xl font-bold font-display text-on-surface">
            Hello, Builder!
          </h2>
          <p className="text-sm font-semibold text-primary">
            Phuc Nguyen Hoang
          </p>
          <p className="text-xs text-outline">hellophucnguyenhoang@gmail.com</p>
        </div>
        <div className="flex gap-4">
          <div className="text-center">
            <span className="text-xs text-outline uppercase font-extrabold tracking-wider">
              Level
            </span>
            <div className="bg-primary/10 text-primary px-4 py-2 rounded-xl text-lg font-bold font-display mt-1">
              Explorer 3
            </div>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {/* Streak */}
        <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-5 flex flex-col items-center justify-center text-center shadow-xs">
          <Flame className="w-8 h-8 text-secondary fill-secondary-container/20 mb-2" />
          <span className="text-2xl font-bold font-display text-on-surface">
            7 Days
          </span>
          <span className="text-xs text-outline font-semibold uppercase tracking-wider mt-1">
            Daily Streak
          </span>
        </div>

        {/* XP Points */}
        <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-5 flex flex-col items-center justify-center text-center shadow-xs">
          <Award className="w-8 h-8 text-primary mb-2" />
          <span className="text-2xl font-bold font-display text-on-surface">
            {points} XP
          </span>
          <span className="text-xs text-outline font-semibold uppercase tracking-wider mt-1">
            Total Score
          </span>
        </div>

        {/* Mastered Bricks */}
        <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-5 flex flex-col items-center justify-center text-center shadow-xs">
          <CheckCircle className="w-8 h-8 text-green-600 mb-2" />
          <span className="text-2xl font-bold font-display text-on-surface">
            {masteredCount}
          </span>
          <span className="text-xs text-outline font-semibold uppercase tracking-wider mt-1">
            Mastered Bricks
          </span>
        </div>

        {/* Average Pronunciation */}
        <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-5 flex flex-col items-center justify-center text-center shadow-xs">
          <Mic className="w-8 h-8 text-secondary mb-2" />
          <span className="text-2xl font-bold font-display text-on-surface">
            {avgPronunciation}%
          </span>
          <span className="text-xs text-outline font-semibold uppercase tracking-wider mt-1">
            Speech Rating
          </span>
        </div>
      </section>

      {/* Visual Analytics Block */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Weekly activity bars */}
        <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-6 md:col-span-2 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold font-display text-on-surface flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Weekly Build Activity
            </h3>
            <span className="text-xs text-outline font-semibold flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              This Week
            </span>
          </div>

          <div className="flex items-end justify-between h-40 pt-4">
            {weeklyActivity.map((w, index) => {
              const heightPercent =
                maxWeeklyCount > 0 ? (w.count / maxWeeklyCount) * 100 : 0;
              return (
                <div
                  key={index}
                  className="flex flex-col items-center group flex-1"
                >
                  <div className="h-28 w-full flex items-end justify-center relative px-2">
                    {/* Tooltip on hover */}
                    <span className="absolute bottom-full mb-1.5 opacity-0 group-hover:opacity-100 bg-inverse-surface text-inverse-on-surface text-[10px] font-bold px-2 py-1 rounded-md transition-opacity pointer-events-none whitespace-nowrap shadow-md">
                      {w.label}
                    </span>
                    <div
                      className="w-4 bg-primary hover:bg-primary/80 rounded-t-md transition-all duration-500 shadow-sm"
                      style={{ height: `${heightPercent}%` }}
                    ></div>
                  </div>
                  <span className="text-[11px] font-bold text-on-surface-variant mt-2">
                    {w.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary bento module */}
        <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <h3 className="text-lg font-bold font-display text-on-surface mb-4">
            Wall Cluster Statistics
          </h3>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs text-on-surface-variant font-bold mb-1">
                <span>Mastered Bricks</span>
                <span>
                  {masteredCount} / {totalCount}
                </span>
              </div>
              <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{
                    width: `${totalCount > 0 ? (masteredCount / totalCount) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-on-surface-variant font-bold mb-1">
                <span>Learning Bricks</span>
                <span>
                  {learningCount} / {totalCount}
                </span>
              </div>
              <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                <div
                  className="h-full bg-secondary-container rounded-full"
                  style={{
                    width: `${totalCount > 0 ? (learningCount / totalCount) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-on-surface-variant font-bold mb-1">
                <span>New / Unstudied</span>
                <span>
                  {totalCount - masteredCount - learningCount} / {totalCount}
                </span>
              </div>
              <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                <div
                  className="h-full bg-outline-variant rounded-full"
                  style={{
                    width: `${totalCount > 0 ? ((totalCount - masteredCount - learningCount) / totalCount) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-outline italic leading-relaxed mt-4">
            Build larger clusters and perfect your accent by completing spelling
            tests and pronunciation exercises.
          </p>
        </div>
      </section>

      {/* Badges and Achievements */}
      <section className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-6 shadow-xs">
        <h3 className="text-lg font-bold font-display text-on-surface mb-6 flex items-center gap-2">
          <Award className="w-5 h-5 text-secondary" />
          Achievements & Milestones
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map((ach) => {
            const IconComponent = ach.icon;
            return (
              <div
                key={ach.id}
                className={`p-4 border rounded-xl flex items-center gap-4 transition-all ${
                  ach.completed
                    ? "border-primary/20 bg-primary/5"
                    : "border-outline-variant/40 bg-surface/30 opacity-70"
                }`}
              >
                <div
                  className={`p-3 rounded-xl ${ach.completed ? "bg-white shadow-xs" : "bg-surface-container"}`}
                >
                  <IconComponent
                    className={`w-6 h-6 ${ach.completed ? ach.color : "text-outline-variant"}`}
                  />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-on-surface flex items-center gap-2">
                    {ach.title}
                    {ach.completed && (
                      <span className="bg-green-100 text-green-700 text-[9px] font-extrabold px-1.5 py-0.5 rounded-md uppercase">
                        Achieved
                      </span>
                    )}
                  </h4>
                  <p className="text-xs text-on-surface-variant">
                    {ach.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
