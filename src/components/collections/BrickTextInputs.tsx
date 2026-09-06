import { AlertTriangle, Loader2 } from "lucide-react";

interface BrickTextInputsProps {
  nativeText: string;
  onNativeTextChange: (value: string) => void;
  targetText: string;
  onTargetTextChange: (value: string) => void;
  pronunciation: string;
  onPronunciationChange: (value: string) => void;
  targetExists?: boolean;
  isCheckingTargetExists?: boolean;
}

export default function BrickTextInputs({
  nativeText,
  onNativeTextChange,
  targetText,
  onTargetTextChange,
  pronunciation,
  onPronunciationChange,
  targetExists = false,
  isCheckingTargetExists = false,
}: BrickTextInputsProps) {
  return (
    <section className="bg-white p-6 rounded-2xl border border-outline-variant/60 shadow-xs space-y-5">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-on-surface-variant flex items-center gap-2">
          <span>Native Sentence</span>
        </label>
        <input
          type="text"
          value={nativeText}
          onChange={(e) => onNativeTextChange(e.target.value)}
          placeholder="Type native sentence..."
          className="w-full h-14 px-4 rounded-xl bg-surface border-2 border-transparent focus:border-primary focus:ring-0 transition-all font-semibold text-sm outline-none placeholder:text-on-surface-variant/40"
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-on-surface-variant flex items-center gap-2">
            <span>Target Sentence</span>
          </label>
          {isCheckingTargetExists && (
            <div className="flex items-center gap-1 text-[11px] text-outline font-medium">
              <Loader2 className="w-3 h-3 animate-spin text-primary" />
              <span>Checking...</span>
            </div>
          )}
        </div>

        <div className="relative">
          <input
            type="text"
            value={targetText}
            onChange={(e) => onTargetTextChange(e.target.value)}
            placeholder="Type target sentence..."
            className={`w-full h-14 px-4 rounded-xl bg-surface border-2 transition-all font-semibold text-sm outline-none placeholder:text-on-surface-variant/40 ${
              targetExists
                ? "border-amber-400 focus:border-amber-500 text-amber-900 bg-amber-50/20"
                : "border-transparent focus:border-primary text-primary"
            }`}
          />
        </div>

        {targetExists && (
          <div className="flex items-center gap-2 text-xs text-amber-800 bg-amber-50 border border-amber-200/80 px-3 py-2 rounded-xl animate-in fade-in slide-in-from-top-1 duration-200">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>A brick with this target sentence already exists.</span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-on-surface-variant">
          Target Pronunciation (Optional)
        </label>
        <input
          type="text"
          value={pronunciation}
          onChange={(e) => onPronunciationChange(e.target.value)}
          placeholder="Phonetic transcription e.g. /wɛər ɪz ðə ˈlaɪbrɛri/"
          className="w-full h-12 px-4 rounded-xl bg-surface border-2 border-transparent focus:border-primary focus:ring-0 transition-all text-xs font-mono outline-none"
        />
      </div>
    </section>
  );
}
