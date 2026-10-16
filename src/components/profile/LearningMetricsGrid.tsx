import { useState, useRef, useEffect } from "react";
import { Layers, Flame, TrendingUp, Clock, HelpCircle } from "lucide-react";
import { type LearningCardStats } from "@/api/stats";

interface LearningMetricsGridProps {
  stats?: LearningCardStats | null;
  isLoading: boolean;
}

function InfoTooltip({ text }: { text: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative inline-flex items-center">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="p-1 rounded-full text-outline/70 hover:text-primary hover:bg-surface-container transition-all cursor-pointer select-none active:scale-95"
        aria-label="Information"
        title={text}
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>

      {isOpen && (
        <div
          role="tooltip"
          className="absolute right-0 bottom-full mb-1.5 w-44 sm:w-52 p-2.5 bg-on-surface text-surface text-[11px] leading-relaxed font-normal rounded-xl shadow-xl z-30 animate-in fade-in zoom-in-95 duration-150 text-left pointer-events-none"
        >
          {text}
        </div>
      )}
    </div>
  );
}

type DueUnit = "days" | "hours" | "minutes" | "seconds";

const UNIT_PILL_LABEL: Record<DueUnit, string> = {
  days: "days",
  hours: "hours",
  minutes: "mins",
  seconds: "secs",
};

const UNIT_TITLE: Record<DueUnit, string> = {
  days: "View in days",
  hours: "View in hours",
  minutes: "View in minutes",
  seconds: "View in seconds",
};

function formatNextDueValue(
  seconds: number | null | undefined,
  unit: DueUnit,
): string {
  if (seconds == null || isNaN(seconds)) return "0";
  const val =
    unit === "days"
      ? seconds / 86400
      : unit === "hours"
        ? seconds / 3600
        : unit === "minutes"
          ? seconds / 60
          : seconds;
  return Number.isInteger(val)
    ? val.toString()
    : parseFloat(val.toFixed(4)).toString();
}

function getDefaultUnit(diffSeconds: number | null): DueUnit {
  if (diffSeconds == null || diffSeconds <= 0) return "hours";
  if (diffSeconds >= 86400) return "days";
  if (diffSeconds >= 3600) return "hours";
  if (diffSeconds >= 60) return "minutes";
  return "seconds";
}

export default function LearningMetricsGrid({
  stats,
  isLoading,
}: LearningMetricsGridProps) {
  const [userUnit, setUserUnit] = useState<DueUnit | null>(null);

  const dueMs = stats?.next_due ? new Date(stats.next_due).getTime() : null;
  const isOverdue = Boolean(dueMs && dueMs < Date.now());
  const diffSeconds = dueMs ? Math.abs(Date.now() - dueMs) / 1000 : null;

  // Adaptively show 3 relevant units across 4 levels:
  // - Large durations (>= 1 day): days, hours, mins
  // - Smaller durations (< 1 day): hours, mins, secs
  const availableUnits: DueUnit[] =
    diffSeconds != null && diffSeconds >= 86400
      ? ["days", "hours", "minutes"]
      : ["hours", "minutes", "seconds"];

  const activeUnit: DueUnit =
    userUnit && availableUnits.includes(userUnit)
      ? userUnit
      : getDefaultUnit(diffSeconds);

  const cycleDueUnit = () => {
    const idx = availableUnits.indexOf(activeUnit);
    setUserUnit(availableUnits[(idx + 1) % availableUnits.length]);
  };

  const formattedNextDue = formatNextDueValue(diffSeconds, activeUnit);

  const unitBadge =
    activeUnit === "days"
      ? formattedNextDue === "1"
        ? "day"
        : "days"
      : activeUnit === "hours"
        ? "hrs"
        : activeUnit === "minutes"
          ? "mins"
          : "secs";

  return (
    <section className="space-y-2">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Total Learning */}
        <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-xs">
          <Layers className="w-6 h-6 text-primary mb-1.5" />
          <span className="text-xl font-bold font-display text-on-surface">
            {isLoading ? "..." : (stats?.total_learning ?? 0)}
          </span>
          <span className="text-[10px] text-outline font-semibold uppercase tracking-wider">
            Total Learning
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
        <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-xs relative">
          <div className="absolute top-2.5 right-2.5">
            <InfoTooltip text="% of times you answer correctly" />
          </div>
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

        {/* Next Due / Overdue */}
        <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-3 sm:p-4 flex flex-col items-center justify-between text-center shadow-xs relative">
          <div className="absolute top-2.5 right-2.5">
            <InfoTooltip
              text={
                isOverdue
                  ? "Time elapsed since your nearest card became due for review"
                  : "Time until your next card is due for review"
              }
            />
          </div>
          <Clock
            className={`w-6 h-6 mb-1 ${
              isOverdue ? "text-rose-600 dark:text-rose-400" : "text-emerald-600"
            }`}
          />

          <button
            type="button"
            onClick={cycleDueUnit}
            className="flex items-baseline justify-center gap-1 cursor-pointer select-none group transition-transform active:scale-95"
            title={`Click to switch unit (${availableUnits
              .map((u) => UNIT_PILL_LABEL[u])
              .join(", ")}) - ${
              isOverdue ? "Overdue time" : "Remaining time"
            }`}
          >
            <span
              className={`text-xl font-bold font-display text-on-surface transition-colors ${
                isOverdue
                  ? "group-hover:text-rose-700 dark:group-hover:text-rose-300"
                  : "group-hover:text-emerald-700 dark:group-hover:text-emerald-400"
              }`}
            >
              {isLoading ? "..." : formattedNextDue}
            </span>
            <span
              className={`text-xs font-semibold ${
                isOverdue
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-emerald-600"
              }`}
            >
              {unitBadge}
            </span>
          </button>

          {/* Dynamic Unit Switcher (Adaptively shows 3 units from days, hours, mins, secs) */}
          <div className="inline-flex items-center gap-0.5 p-0.5 bg-surface-container rounded-lg my-1 border border-outline-variant/40">
            {availableUnits.map((unit) => (
              <button
                key={unit}
                type="button"
                onClick={() => setUserUnit(unit)}
                className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold transition-all cursor-pointer ${
                  activeUnit === unit
                    ? isOverdue
                      ? "bg-surface-container-lowest text-rose-700 dark:text-rose-300 shadow-2xs font-extrabold"
                      : "bg-surface-container-lowest text-emerald-700 dark:text-emerald-300 shadow-2xs font-extrabold"
                    : "text-outline hover:text-on-surface"
                }`}
                title={UNIT_TITLE[unit]}
              >
                {UNIT_PILL_LABEL[unit]}
              </button>
            ))}
          </div>

          <span className="text-[10px] text-outline font-semibold uppercase tracking-wider">
            {isOverdue ? "Overdue" : "Next Due"}
          </span>
        </div>
      </div>
    </section>
  );
}
