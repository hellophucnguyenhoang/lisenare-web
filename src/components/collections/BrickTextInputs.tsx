import { AlertTriangle, ChevronDown, Loader2, Sparkles } from "lucide-react";
import PlainTextInput from "@/components/common/PlainTextInput";
import { type TargetLang } from "@/types";

interface BrickTextInputsProps {
  nativeText: string;
  onNativeTextChange: (value: string) => void;
  targetText: string;
  onTargetTextChange: (value: string) => void;
  targetLang?: TargetLang;
  onTargetLangChange?: (value: TargetLang) => void;
  pronunciation: string;
  onPronunciationChange: (value: string) => void;
  context?: string;
  onContextChange?: (value: string) => void;
  targetExists?: boolean;
  isCheckingTargetExists?: boolean;
  onGenerateAudio?: () => void;
  isGeneratingAudio?: boolean;
}

export default function BrickTextInputs({
  nativeText,
  onNativeTextChange,
  targetText,
  onTargetTextChange,
  targetLang = "en",
  onTargetLangChange,
  pronunciation,
  onPronunciationChange,
  context = "",
  onContextChange,
  targetExists = false,
  isCheckingTargetExists = false,
  onGenerateAudio,
  isGeneratingAudio = false,
}: BrickTextInputsProps) {
  return (
    <section className="bg-white p-6 rounded-2xl border border-outline-variant/60 shadow-xs space-y-5">
      {/* Native Sentence */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-on-surface-variant flex items-center gap-2">
          <span>Native Sentence</span>
        </label>
        <PlainTextInput
          value={nativeText}
          onChange={onNativeTextChange}
          placeholder="Type native sentence..."
          className="w-full h-14 px-4 rounded-xl bg-surface border-2 border-transparent focus-within:border-primary font-semibold text-sm outline-none"
        />
      </div>

      {/* Target Sentence with Integrated Minimal Language Chooser */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <label className="text-sm font-bold text-on-surface-variant">
              Target Sentence
            </label>

            {/* Minimal Language Dropdown */}
            <div className="relative inline-flex items-center">
              <select
                value={targetLang}
                onChange={(e) =>
                  onTargetLangChange?.(e.target.value as TargetLang)
                }
                className="appearance-none bg-surface-container/60 hover:bg-surface-container border border-outline-variant/60 text-primary font-bold text-xs py-0.5 pl-2 pr-5 rounded-lg cursor-pointer outline-none focus:border-primary transition-all shadow-2xs"
                title="Select target language"
                aria-label="Target language"
              >
                <option value="en">English</option>
                <option value="ja">Japanese</option>
              </select>
              <ChevronDown className="w-3 h-3 text-primary pointer-events-none absolute right-1.5" />
            </div>
          </div>

          {isCheckingTargetExists && (
            <div className="flex items-center gap-1 text-[11px] text-outline font-medium">
              <Loader2 className="w-3 h-3 animate-spin text-primary" />
              <span>Checking...</span>
            </div>
          )}
        </div>

        <div className="relative">
          <PlainTextInput
            value={targetText}
            onChange={onTargetTextChange}
            placeholder={
              targetLang === "ja"
                ? "Type target sentence (e.g. こんにちは)..."
                : "Type target sentence..."
            }
            className={`w-full h-14 px-4 rounded-xl bg-surface border-2 transition-all font-semibold text-sm outline-none ${
              targetExists
                ? "border-amber-400 focus-within:border-amber-500 text-amber-900 bg-amber-50/20"
                : "border-transparent focus-within:border-primary text-primary"
            }`}
          />
        </div>

        {targetExists && (
          <div className="flex items-center gap-2 text-xs text-amber-800 bg-amber-50 border border-amber-200/80 px-3 py-2 rounded-xl animate-in fade-in slide-in-from-top-1 duration-200">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>A brick with this target sentence already exists.</span>
          </div>
        )}

        {/* Auto-generate Audio Button */}
        {onGenerateAudio && (
          <div className="flex items-center justify-between gap-2 pt-0.5">
            <button
              type="button"
              onClick={onGenerateAudio}
              disabled={!targetText.trim() || isGeneratingAudio}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 rounded-xl transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              title={
                !targetText.trim()
                  ? "Enter target sentence first"
                  : "Generate audio pronunciation using AI Text-to-Speech"
              }
            >
              {isGeneratingAudio ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                  <span>Generating Audio...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span>Auto-generate Audio</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Target Pronunciation */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-on-surface-variant">
          Target Pronunciation (Optional)
        </label>
        <PlainTextInput
          value={pronunciation}
          onChange={onPronunciationChange}
          placeholder="Phonetic transcription e.g. /wɛər ɪz ðə ˈlaɪbrɛri/"
          className="w-full h-12 px-4 rounded-xl bg-surface border-2 border-transparent focus-within:border-primary text-xs font-mono outline-none"
        />
      </div>

      {/* Context */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-on-surface-variant">
          Context (Optional)
        </label>
        <PlainTextInput
          value={context}
          onChange={onContextChange ?? (() => {})}
          placeholder="Usage situation, clip source, or notes e.g. At the airport check-in..."
          className="w-full h-12 px-4 rounded-xl bg-surface border-2 border-transparent focus-within:border-primary text-xs outline-none"
        />
      </div>
    </section>
  );
}
