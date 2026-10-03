import { useState, useEffect } from "react";
import { type TimeSeriesPoint } from "@/api/stats";
import { formatBarDate, formatTooltipDate } from "./chartUtils";

interface ReviewsBarChartProps {
  points: TimeSeriesPoint[];
  maxValue: number;
}

export default function ReviewsBarChart({
  points,
  maxValue,
}: ReviewsBarChartProps) {
  const [selectedColumnIndex, setSelectedColumnIndex] = useState<number | null>(
    null,
  );

  useEffect(() => {
    setSelectedColumnIndex(null);
  }, [points]);

  return (
    <div className="overflow-x-auto pb-1">
      <div className="flex items-end justify-between gap-1 sm:gap-2 h-36 pt-6 px-1 min-w-full">
        {points.map((point, index) => {
          const heightPercent =
            maxValue > 0 ? (point.value / maxValue) * 100 : 0;
          const hasValue = point.value > 0;
          const isSelected = selectedColumnIndex === index;
          const showLabel =
            isSelected ||
            points.length <= 14 ||
            index === 0 ||
            index === points.length - 1 ||
            index % Math.ceil(points.length / 8) === 0;

          return (
            <div
              key={point.date || index}
              onClick={() => setSelectedColumnIndex(isSelected ? null : index)}
              className="flex flex-col items-center group flex-1 h-full justify-end relative min-w-2.5 cursor-pointer"
            >
              {/* Tooltip value */}
              <div
                className={`absolute -top-6.5 left-1/2 -translate-x-1/2 transition-all duration-150 pointer-events-none bg-on-surface text-surface text-[10px] font-bold px-2 py-0.5 rounded shadow-md whitespace-nowrap z-20 ${
                  isSelected
                    ? "opacity-100 scale-100 ring-2 ring-primary/40 -translate-y-0.5"
                    : "opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100"
                }`}
              >
                {point.value} {point.value === 1 ? "review" : "reviews"}
              </div>

              <div className="h-24 w-full flex items-end justify-center">
                <div
                  className={`w-full max-w-7 rounded-t-md transition-all duration-300 shadow-xs cursor-pointer ${
                    hasValue
                      ? isSelected
                        ? "bg-primary ring-2 ring-primary ring-offset-2 ring-offset-surface-container-lowest scale-105"
                        : "bg-primary hover:bg-primary/85 active:scale-95"
                      : isSelected
                        ? "bg-primary/40 ring-2 ring-primary/30 ring-offset-1 ring-offset-surface-container-lowest"
                        : "bg-surface-container-high/60 hover:bg-surface-container-highest"
                  }`}
                  style={{
                    height: hasValue
                      ? `${Math.max(heightPercent, 10)}%`
                      : "4px",
                  }}
                  title={`${point.value} reviews on ${formatTooltipDate(point.date)}`}
                />
              </div>

              <span
                className={`text-[10px] font-medium transition-colors mt-2 truncate w-full text-center h-3.5 ${
                  isSelected
                    ? "text-primary font-bold"
                    : "text-outline group-hover:text-on-surface"
                }`}
              >
                {showLabel ? formatBarDate(point.date, points.length) : ""}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
