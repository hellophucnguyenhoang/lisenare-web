import { Type, AlignLeft } from "lucide-react";

export type UnitType = "word" | "sentence";

interface BrickUnitTypeSelectorProps {
  kind: UnitType;
  onChange: (type: UnitType) => void;
}

export default function BrickUnitTypeSelector({
  kind,
  onChange,
}: BrickUnitTypeSelectorProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-2 px-1">
        <h2 className="text-lg font-bold font-display text-on-surface">Kind</h2>
        <span className="text-xs text-outline font-medium text-right truncate">
          A complete meaning unit
        </span>
      </div>

      <div className="bg-white p-2 sm:p-2.5 rounded-2xl border border-outline-variant/60 shadow-xs">
        <div
          className="grid grid-cols-2 p-1 bg-surface-container-low rounded-xl border border-outline-variant/50 gap-1.5"
          role="radiogroup"
          aria-label="Kind"
        >
          <button
            type="button"
            role="radio"
            id="btn-unit-type-word"
            aria-checked={kind === "word"}
            onClick={() => onChange("word")}
            className={`py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 ${
              kind === "word"
                ? "bg-primary text-on-primary shadow-xs"
                : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container/60"
            }`}
          >
            <Type className="w-4 h-4" />
            <span>Word</span>
          </button>

          <button
            type="button"
            role="radio"
            id="btn-unit-type-sentence"
            aria-checked={kind === "sentence"}
            onClick={() => onChange("sentence")}
            className={`py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 ${
              kind === "sentence"
                ? "bg-primary text-on-primary shadow-xs"
                : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container/60"
            }`}
          >
            <AlignLeft className="w-4 h-4" />
            <span>Sentence</span>
          </button>
        </div>
      </div>
    </section>
  );
}
