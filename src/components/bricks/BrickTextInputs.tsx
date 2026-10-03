import { useState, useRef, useEffect } from "react";
import {
  AlertTriangle,
  ChevronDown,
  Loader2,
  Sparkles,
  HelpCircle,
  Check,
} from "lucide-react";
import PlainTextInput from "@/components/common/PlainTextInput";
import { type TargetLang } from "@/types";

interface LanguageOption {
  code: TargetLang;
  name: string;
  flag: string;
}

const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "ja", name: "Japanese", flag: "🇯🇵" },
  { code: "vi", name: "Vietnam", flag: "🇻🇳" },
];

function InfoTooltip({ text }: { text: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative inline-flex items-center">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="p-0.5 rounded-full text-outline hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer select-none"
        aria-label="Information"
        title={text}
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>

      {isOpen && (
        <div
          role="tooltip"
          className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 w-60 sm:w-68 p-2.5 bg-on-surface text-surface text-[11px] leading-relaxed font-normal rounded-xl shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150 pointer-events-none"
        >
          {text}
        </div>
      )}
    </div>
  );
}

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
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  const selectedLangOption =
    LANGUAGE_OPTIONS.find((opt) => opt.code === targetLang) ||
    LANGUAGE_OPTIONS[0];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        langDropdownRef.current &&
        !langDropdownRef.current.contains(e.target as Node)
      ) {
        setIsLangDropdownOpen(false);
      }
    }
    if (isLangDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isLangDropdownOpen]);

  return (
    <section className="bg-white p-6 rounded-2xl border border-outline-variant/60 shadow-xs space-y-5">
      {/* Native Sentence */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-on-surface-variant flex items-center gap-1.5">
          <span>Native Sentence</span>
          <InfoTooltip text="Native text you want to express." />
        </label>
        <PlainTextInput
          value={nativeText}
          onChange={onNativeTextChange}
          placeholder="Type native sentence..."
          className="w-full h-14 px-4 rounded-xl bg-surface border-2 border-transparent focus-within:border-primary font-semibold text-sm outline-none"
        />
      </div>

      {/* Target Sentence with Integrated Flag Language Chooser */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <label className="text-sm font-bold text-on-surface-variant flex items-center gap-1.5">
              <span>Target Sentence</span>
              <InfoTooltip text="Target text you want to say." />
            </label>

            {/* Language Dropdown with Flag */}
            <div
              ref={langDropdownRef}
              className="relative inline-flex items-center"
            >
              <button
                type="button"
                id="btn-brick-target-lang-dropdown"
                onClick={() => setIsLangDropdownOpen((prev) => !prev)}
                className="inline-flex items-center gap-1.5 bg-surface-container/60 hover:bg-surface-container border border-outline-variant/60 text-primary font-bold text-xs py-1 px-2.5 rounded-xl cursor-pointer outline-none focus:border-primary transition-all shadow-2xs active:scale-98"
                title="Select target language"
                aria-label="Target language"
                aria-expanded={isLangDropdownOpen}
              >
                <span className="text-sm select-none leading-none">
                  {selectedLangOption.flag}
                </span>
                <span>{selectedLangOption.name}</span>
                <ChevronDown
                  className={`w-3 h-3 text-primary transition-transform duration-200 ${
                    isLangDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Custom Dropdown Menu */}
              {isLangDropdownOpen && (
                <div
                  role="listbox"
                  className="absolute left-0 sm:left-auto sm:right-0 top-full mt-1.5 w-36 bg-surface-container-lowest border border-outline-variant/60 rounded-xl shadow-lg p-1 z-30 animate-in fade-in zoom-in-95 duration-150"
                >
                  {LANGUAGE_OPTIONS.map((opt) => (
                    <button
                      key={opt.code}
                      type="button"
                      onClick={() => {
                        onTargetLangChange?.(opt.code);
                        setIsLangDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg font-medium transition-colors cursor-pointer ${
                        opt.code === targetLang
                          ? "bg-primary/10 text-primary font-bold"
                          : "text-on-surface hover:bg-surface-container"
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm select-none">{opt.flag}</span>
                        <span>{opt.name}</span>
                      </div>
                      {opt.code === targetLang && (
                        <Check className="w-3.5 h-3.5 text-primary" />
                      )}
                    </button>
                  ))}
                </div>
              )}
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
        <label className="text-sm font-bold text-on-surface-variant flex items-center gap-1.5">
          <span>Target Pronunciation (Optional)</span>
          <InfoTooltip text="Optional pronunciation guide." />
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
        <label className="text-sm font-bold text-on-surface-variant flex items-center gap-1.5">
          <span>Context (Optional)</span>
          <InfoTooltip text="Optional scenario, context, or notes to help remember how it's used." />
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
