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
  return (
    <div className="overflow-x-auto pb-1">
      <div className="flex items-end justify-between gap-1 sm:gap-2 h-36 pt-5 px-1 min-w-full">
        {points.map((point, index) => {
          const heightPercent =
            maxValue > 0 ? (point.value / maxValue) * 100 : 0;
          const hasValue = point.value > 0;
          const showLabel =
            points.length <= 14 ||
            index === 0 ||
            index === points.length - 1 ||
            index % Math.ceil(points.length / 8) === 0;

          return (
            <div
              key={point.date || index}
              className="flex flex-col items-center group flex-1 h-full justify-end relative min-w-[10px]"
            >
              {/* Hover tooltip value */}
              <div className="absolute -top-6 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-on-surface text-surface text-[10px] font-bold px-1.5 py-0.5 rounded shadow-xs whitespace-nowrap z-10">
                {point.value} reviews
              </div>

              <div className="h-24 w-full flex items-end justify-center">
                <div
                  className={`w-full max-w-[28px] rounded-t-md transition-all duration-300 shadow-xs cursor-pointer ${
                    hasValue
                      ? "bg-primary hover:bg-primary/85 active:scale-95"
                      : "bg-surface-container-high/60 hover:bg-surface-container-highest"
                  }`}
                  style={{
                    height: hasValue ? `${Math.max(heightPercent, 10)}%` : "4px",
                  }}
                  title={`${point.value} reviews on ${formatTooltipDate(point.date)}`}
                />
              </div>

              <span className="text-[10px] font-medium text-outline group-hover:text-on-surface transition-colors mt-2 truncate w-full text-center h-3.5">
                {showLabel ? formatBarDate(point.date, points.length) : ""}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
