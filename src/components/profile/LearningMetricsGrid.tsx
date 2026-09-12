import { CheckCircle, Layers, Flame, TrendingUp } from "lucide-react";
import { type LearningCardStats } from "@/api/stats";

interface LearningMetricsGridProps {
  stats?: LearningCardStats | null;
  isLoading: boolean;
}

export default function LearningMetricsGrid({
  stats,
  isLoading,
}: LearningMetricsGridProps) {
  return (
    <section className="space-y-2">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Memorized */}
        <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-xs">
          <CheckCircle className="w-6 h-6 text-emerald-600 mb-1.5" />
          <span className="text-xl font-bold font-display text-on-surface">
            {isLoading ? "..." : (stats?.total_memorized ?? 0)}
          </span>
          <span className="text-[10px] text-outline font-semibold uppercase tracking-wider">
            Memorized
          </span>
        </div>

        {/* In Learning */}
        <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-xs">
          <Layers className="w-6 h-6 text-primary mb-1.5" />
          <span className="text-xl font-bold font-display text-on-surface">
            {isLoading ? "..." : (stats?.total_learning ?? 0)}
          </span>
          <span className="text-[10px] text-outline font-semibold uppercase tracking-wider">
            In Learning
          </span>
        </div>

        {/* Due Reviews */}
        <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-xs">
          <Flame className="w-6 h-6 text-amber-500 mb-1.5" />
          <span className="text-xl font-bold font-display text-on-surface">
            {isLoading ? "..." : (stats?.due_count ?? 0)}
          </span>
          <span className="text-[10px] text-outline font-semibold uppercase tracking-wider">
            Due Reviews
          </span>
        </div>

        {/* True Retention Rate */}
        <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-xs">
          <TrendingUp className="w-6 h-6 text-secondary mb-1.5" />
          <span className="text-xl font-bold font-display text-on-surface">
            {isLoading
              ? "..."
              : stats?.true_retention != null
                ? `${Math.round(stats.true_retention * 100)}%`
                : "0%"}
          </span>
          <span className="text-[10px] text-outline font-semibold uppercase tracking-wider">
            Retention Rate
          </span>
        </div>
      </div>

      {stats?.average_stability != null && stats.average_stability > 0 && (
        <div className="text-center pt-0.5">
          <span className="text-[11px] text-outline font-medium">
            Average Memory Stability:{" "}
            <strong className="text-on-surface font-semibold">
              {stats.average_stability.toFixed(1)} days
            </strong>
          </span>
        </div>
      )}
    </section>
  );
}
