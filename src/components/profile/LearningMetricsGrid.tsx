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

export default function LearningMetricsGrid({
  stats,
  isLoading,
}: LearningMetricsGridProps) {
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

        {/* Average Stability (Replaced estimated_recalled) */}
        <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-xs relative">
          <div className="absolute top-2.5 right-2.5">
            <InfoTooltip text="Average number of days you remember a card" />
          </div>
          <Clock className="w-6 h-6 text-emerald-600 mb-1.5" />
          <span className="text-xl font-bold font-display text-on-surface">
            {isLoading
              ? "..."
              : stats?.average_stability != null
                ? `${stats.average_stability.toFixed(1)} days`
                : "0 days"}
          </span>
          <span className="text-[10px] text-outline font-semibold uppercase tracking-wider">
            Stability
          </span>
        </div>
      </div>
    </section>
  );
}
