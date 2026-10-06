import { Type, AlignLeft } from "lucide-react";

export type UnitType = "word" | "sentence";

interface BrickUnitTypeSelectorProps {
  unitType: UnitType;
  onChange: (type: UnitType) => void;
}

export default function BrickUnitTypeSelector({
  unitType,
  onChange,
}: BrickUnitTypeSelectorProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-center justify-between gap-1 px-1">
        <label className="text-sm font-bold text-on-surface-variant">
          Unit Type
        </label>
        <span className="text-[11px] text-outline font-medium">
          {unitType === "word"
            ? "A simple word with complete meaning"
            : "A complete sentence with its own meaning"}
        </span>
      </div>

      <div
        className="grid grid-cols-2 p-1 bg-surface-container/60 rounded-xl border border-outline-variant/60"
        role="radiogroup"
        aria-label="Unit Type"
      >
        <button
          type="button"
          role="radio"
          id="btn-unit-type-word"
          aria-checked={unitType === "word"}
          onClick={() => onChange("word")}
          className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 ${
            unitType === "word"
              ? "bg-white text-primary shadow-xs"
              : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          <Type className="w-3.5 h-3.5" />
          <span>Word</span>
        </button>

        <button
          type="button"
          role="radio"
          id="btn-unit-type-sentence"
          aria-checked={unitType === "sentence"}
          onClick={() => onChange("sentence")}
          className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 ${
            unitType === "sentence"
              ? "bg-white text-primary shadow-xs"
              : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          <AlignLeft className="w-3.5 h-3.5" />
          <span>Sentence</span>
        </button>
      </div>
    </div>
  );
}
