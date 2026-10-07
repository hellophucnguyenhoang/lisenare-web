import { useState } from "react";
import { type TimeSeriesPoint } from "@/api/stats";
import { formatBarDate, formatTooltipDate } from "./chartUtils";

interface TotalLearningLineChartProps {
  points: TimeSeriesPoint[];
  maxValue: number;
}

export default function TotalLearningLineChart({
  points,
  maxValue,
}: TotalLearningLineChartProps) {
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(
    null,
  );

  const [prevPoints, setPrevPoints] = useState(points);
  if (points !== prevPoints) {
    setPrevPoints(points);
    setHoveredPointIndex(null);
  }

  const vbWidth = 600;
  const vbHeight = 150;
  const padLeft = 28;
  const padRight = 24;
  const padTop = 18;
  const padBottom = 28;
  const plotWidth = vbWidth - padLeft - padRight;
  const plotHeight = vbHeight - padTop - padBottom;

  const minVal = 0;
  const maxVal = maxValue;
  const valRange = maxVal - minVal || 1;

  const coords = points.map((p, i) => {
    const x =
      points.length === 1
        ? padLeft + plotWidth / 2
        : padLeft + (i / (points.length - 1)) * plotWidth;
    const y =
      padTop + plotHeight - ((p.value - minVal) / valRange) * plotHeight;
    return { x, y, point: p, index: i };
  });

  const linePath = coords.reduce(
    (acc, c, i) =>
      i === 0
        ? `M ${c.x.toFixed(1)} ${c.y.toFixed(1)}`
        : `${acc} L ${c.x.toFixed(1)} ${c.y.toFixed(1)}`,
    "",
  );

  const areaPath = `${linePath} L ${coords[coords.length - 1].x.toFixed(1)} ${(padTop + plotHeight).toFixed(1)} L ${coords[0].x.toFixed(1)} ${(padTop + plotHeight).toFixed(1)} Z`;

  const labelStep = Math.max(1, Math.ceil(coords.length / 8));

  return (
    <div className="relative w-full pt-1">
      <svg
        viewBox={`0 0 ${vbWidth} ${vbHeight}`}
        className="w-full h-40 overflow-visible text-primary select-none"
      >
        <defs>
          <linearGradient
            id="totalLearningAreaGrad"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.28" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {[0, 0.5, 1].map((ratio) => {
          const y = padTop + plotHeight * (1 - ratio);
          return (
            <g key={ratio}>
              <line
                x1={padLeft}
                y1={y}
                x2={padLeft + plotWidth}
                y2={y}
                stroke="currentColor"
                strokeOpacity="0.08"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              <text
                x={padLeft - 6}
                y={y + 3}
                textAnchor="end"
                className="text-[9px] fill-outline font-medium"
              >
                {Math.round(minVal + valRange * ratio)}
              </text>
            </g>
          );
        })}

        {/* Shaded Area under Line */}
        <path d={areaPath} fill="url(#totalLearningAreaGrad)" />

        {/* Main Trend Line */}
        <path
          d={linePath}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Active Hover Vertical Guide Line */}
        {hoveredPointIndex !== null && coords[hoveredPointIndex] && (
          <line
            x1={coords[hoveredPointIndex].x}
            y1={padTop}
            x2={coords[hoveredPointIndex].x}
            y2={padTop + plotHeight}
            stroke="currentColor"
            strokeOpacity="0.35"
            strokeDasharray="3 3"
            strokeWidth="1.2"
          />
        )}

        {/* Interactive Points and Hitboxes */}
        {coords.map((c, i) => {
          const isHovered = hoveredPointIndex === i;
          const showDot =
            coords.length <= 16 ||
            isHovered ||
            i === 0 ||
            i === coords.length - 1;

          return (
            <g key={c.point.date || i}>
              {showDot && (
                <circle
                  cx={c.x}
                  cy={c.y}
                  r={isHovered ? 5.5 : 3.5}
                  className={`transition-all duration-150 ${
                    isHovered
                      ? "fill-surface stroke-primary stroke-[2.5]"
                      : "fill-primary stroke-surface stroke-[1.5]"
                  }`}
                />
              )}

              {/* Large hitbox for hover on touch/mouse */}
              <rect
                x={c.x - Math.max(plotWidth / coords.length, 20) / 2}
                y={padTop}
                width={Math.max(plotWidth / coords.length, 20)}
                height={plotHeight}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredPointIndex(i)}
                onMouseLeave={() => setHoveredPointIndex(null)}
                onClick={() =>
                  setHoveredPointIndex(hoveredPointIndex === i ? null : i)
                }
              />
            </g>
          );
        })}

        {/* X-axis Date Labels */}
        {coords.map((c, i) => {
          const showLabel =
            coords.length <= 8 ||
            i === 0 ||
            i === coords.length - 1 ||
            i % labelStep === 0;

          if (!showLabel) return null;

          return (
            <text
              key={i}
              x={c.x}
              y={padTop + plotHeight + 18}
              textAnchor="middle"
              className="text-[10px] fill-outline font-medium"
            >
              {formatBarDate(c.point.date, coords.length)}
            </text>
          );
        })}
      </svg>

      {/* Floating Tooltip */}
      {hoveredPointIndex !== null && coords[hoveredPointIndex] && (
        <div
          className="absolute -top-5 z-20 pointer-events-none -translate-x-1/2 bg-on-surface text-surface text-[11px] font-bold px-2 py-0.5 rounded-lg shadow-md whitespace-nowrap transition-all duration-75"
          style={{
            left: `${(coords[hoveredPointIndex].x / vbWidth) * 100}%`,
          }}
        >
          <span>
            {coords[hoveredPointIndex].point.value} bricks on{" "}
            {formatTooltipDate(coords[hoveredPointIndex].point.date)}
          </span>
        </div>
      )}
    </div>
  );
}
