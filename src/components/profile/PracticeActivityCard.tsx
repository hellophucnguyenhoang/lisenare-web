import { BarChart3, Loader2 } from "lucide-react";
import { type TimeSeriesPoint } from "@/api/stats";
import TotalLearningLineChart from "./TotalLearningLineChart";
import ReviewsBarChart from "./ReviewsBarChart";

interface PracticeActivityCardProps {
  metric: "reviews" | "total_learning";
  onMetricChange: (metric: "reviews" | "total_learning") => void;
  days: number | null;
  onDaysChange: (days: number | null) => void;
  points: TimeSeriesPoint[];
  isLoading: boolean;
}

export default function PracticeActivityCard({
  metric,
  onMetricChange,
  days,
  onDaysChange,
  points,
  isLoading,
}: PracticeActivityCardProps) {
  const maxTimeseriesValue = Math.max(...points.map((p) => p.value), 1);
  const totalTimeseriesValue = points.reduce((sum, p) => sum + p.value, 0);
  const latestTimeseriesValue =
    points.length > 0 ? points[points.length - 1].value : 0;

  return (
    <section className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-bold font-display text-on-surface flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            Practice Activity
          </h3>
          <p className="text-xs text-on-surface-variant font-medium mt-0.5">
            {metric === "total_learning"
              ? "Cumulative total of bricks learned per day"
              : "Number of reviews per day"}
          </p>
          <p className="text-[11px] text-outline mt-0.5">
            {metric === "total_learning"
              ? `Latest: ${latestTimeseriesValue} bricks learned`
              : `Total: ${totalTimeseriesValue} reviews in this period`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Metric Toggle */}
          <div className="flex items-center bg-surface-container/60 border border-outline-variant/40 rounded-lg p-0.5 text-xs">
            <button
              type="button"
              onClick={() => onMetricChange("reviews")}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                metric === "reviews"
                  ? "bg-primary text-on-primary shadow-xs"
                  : "text-outline hover:text-on-surface"
              }`}
            >
              Reviews
            </button>
            <button
              type="button"
              onClick={() => onMetricChange("total_learning")}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                metric === "total_learning"
                  ? "bg-primary text-on-primary shadow-xs"
                  : "text-outline hover:text-on-surface"
              }`}
            >
              Learned
            </button>
          </div>

          {/* Timeframe Switcher */}
          <div className="flex items-center bg-surface-container/60 border border-outline-variant/40 rounded-lg p-0.5 text-xs">
            {(
              [
                { label: "7D", value: 7 },
                { label: "14D", value: 14 },
                { label: "30D", value: 30 },
                { label: "All", value: null },
              ] as const
            ).map(({ label, value }) => (
              <button
                key={label}
                type="button"
                onClick={() => onDaysChange(value)}
                className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                  days === value
                    ? "bg-primary text-on-primary shadow-xs"
                    : "text-outline hover:text-on-surface"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Area */}
      {isLoading ? (
        <div className="h-36 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      ) : points.length === 0 ? (
        <div className="h-36 flex flex-col items-center justify-center text-center p-4">
          <p className="text-xs text-outline font-medium">
            No activity recorded for this period yet.
          </p>
          <p className="text-[11px] text-outline/70 mt-1">
            Start practicing bricks to see your progress here!
          </p>
        </div>
      ) : metric === "total_learning" ? (
        <TotalLearningLineChart points={points} maxValue={maxTimeseriesValue} />
      ) : (
        <ReviewsBarChart points={points} maxValue={maxTimeseriesValue} />
      )}
    </section>
  );
}
