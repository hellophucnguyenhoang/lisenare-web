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

type DueUnit = "hours" | "minutes" | "seconds";

function formatNextDueValue(
  seconds: number | null | undefined,
  unit: DueUnit,
): string {
  if (seconds == null || isNaN(seconds)) return "0";
  if (seconds <= 0) return "0";

  let val: number;
  if (unit === "hours") {
    val = seconds / 3600;
  } else if (unit === "minutes") {
    val = seconds / 60;
  } else {
    val = seconds;
  }

  // If it's an integer, format cleanly
  if (Number.isInteger(val)) {
    return val.toString();
  }

  // Preserve exact significant digits without floating point noise or forced truncation
  const rounded = parseFloat(val.toFixed(4));
  return rounded.toString();
}

export default function LearningMetricsGrid({
  stats,
  isLoading,
}: LearningMetricsGridProps) {
  const [dueUnit, setDueUnit] = useState<DueUnit>("hours");

  const cycleDueUnit = () => {
    setDueUnit((prev) => {
      if (prev === "hours") return "minutes";
      if (prev === "minutes") return "seconds";
      return "hours";
    });
  };

  const formattedNextDue = formatNextDueValue(
    stats?.next_due_in_seconds,
    dueUnit,
  );

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

        {/* Next Due */}
        <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-3 sm:p-4 flex flex-col items-center justify-between text-center shadow-xs relative">
          <div className="absolute top-2.5 right-2.5">
            <InfoTooltip text="Time until your next card is due for review" />
          </div>
          <Clock className="w-6 h-6 text-emerald-600 mb-1" />

          <button
            type="button"
            onClick={cycleDueUnit}
            className="flex items-baseline justify-center gap-1 cursor-pointer select-none group transition-transform active:scale-95"
            title="Click to switch unit (hours, minutes, seconds)"
          >
            <span className="text-xl font-bold font-display text-on-surface group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
              {isLoading ? "..." : formattedNextDue}
            </span>
            <span className="text-xs font-semibold text-emerald-600">
              {dueUnit === "hours"
                ? "hrs"
                : dueUnit === "minutes"
                  ? "mins"
                  : "secs"}
            </span>
          </button>

          {/* Dynamic Unit Switcher */}
          <div className="inline-flex items-center gap-0.5 p-0.5 bg-surface-container rounded-lg my-1 border border-outline-variant/40">
            <button
              type="button"
              onClick={() => setDueUnit("hours")}
              className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold transition-all cursor-pointer ${
                dueUnit === "hours"
                  ? "bg-surface-container-lowest text-emerald-700 dark:text-emerald-300 shadow-2xs font-extrabold"
                  : "text-outline hover:text-on-surface"
              }`}
              title="View in hours"
            >
              hours
            </button>
            <button
              type="button"
              onClick={() => setDueUnit("minutes")}
              className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold transition-all cursor-pointer ${
                dueUnit === "minutes"
                  ? "bg-surface-container-lowest text-emerald-700 dark:text-emerald-300 shadow-2xs font-extrabold"
                  : "text-outline hover:text-on-surface"
              }`}
              title="View in minutes"
            >
              mins
            </button>
            <button
              type="button"
              onClick={() => setDueUnit("seconds")}
              className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold transition-all cursor-pointer ${
                dueUnit === "seconds"
                  ? "bg-surface-container-lowest text-emerald-700 dark:text-emerald-300 shadow-2xs font-extrabold"
                  : "text-outline hover:text-on-surface"
              }`}
              title="View in seconds"
            >
              secs
            </button>
          </div>

          <span className="text-[10px] text-outline font-semibold uppercase tracking-wider">
            Next Due
          </span>
        </div>
      </div>
    </section>
  );
}
