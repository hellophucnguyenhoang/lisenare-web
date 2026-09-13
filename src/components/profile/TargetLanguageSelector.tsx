import { useState, useRef, useEffect } from "react";
import { Languages, ChevronDown, Check, Loader2 } from "lucide-react";
import { type PracticeLang } from "@/types";

interface TargetLanguageSelectorProps {
  currentLang: PracticeLang;
  onSelectLang: (lang: PracticeLang) => void;
  isUpdating?: boolean;
}

interface LanguageOption {
  code: PracticeLang;
  name: string;
  flag: string;
}

const LANGUAGES: LanguageOption[] = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "ja", name: "Japanese", flag: "🇯🇵" },
  { code: "vi", name: "Vietnam", flag: "🇻🇳" },
];

export default function TargetLanguageSelector({
  currentLang,
  onSelectLang,
  isUpdating = false,
}: TargetLanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption =
    LANGUAGES.find((lang) => lang.code === currentLang) || LANGUAGES[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
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
    <div
      ref={containerRef}
      className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl px-4 sm:px-5 py-3 shadow-xs flex items-center justify-between gap-3 relative"
    >
      {/* Label with Icon */}
      <div className="flex items-center gap-2 min-w-0">
        <Languages className="w-4 h-4 text-primary shrink-0" />
        <span className="text-xs sm:text-sm font-bold text-on-surface truncate">
          Target Language
        </span>
      </div>

      {/* Custom Selector Button & Floating Dropdown */}
      <div className="relative shrink-0">
        <button
          type="button"
          id="btn-target-language-selector"
          onClick={() => setIsOpen((prev) => !prev)}
          disabled={isUpdating}
          className="inline-flex items-center gap-2 bg-surface hover:bg-surface-container border border-outline-variant/60 rounded-xl px-3 py-1.5 text-xs font-bold text-on-surface transition-all cursor-pointer shadow-2xs active:scale-98 disabled:opacity-50"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          title="Change target language"
        >
          {isUpdating ? (
            <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
          ) : (
            <span className="text-base select-none leading-none">
              {selectedOption.flag}
            </span>
          )}
          <span>{selectedOption.name}</span>
          <ChevronDown
            className={`w-3.5 h-3.5 text-outline transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Custom Dropdown Popover */}
        {isOpen && (
          <div
            role="listbox"
            className="absolute right-0 top-full mt-1.5 w-44 bg-surface rounded-xl border border-outline-variant/60 shadow-lg p-1 z-30 animate-in fade-in zoom-in-95 duration-150"
          >
            {LANGUAGES.map((opt) => {
              const isSelected = opt.code === currentLang;
              return (
                <button
                  key={opt.code}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onSelectLang(opt.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-primary/10 text-primary font-bold"
                      : "text-on-surface hover:bg-surface-container"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base select-none leading-none">
                      {opt.flag}
                    </span>
                    <span>{opt.name}</span>
                  </div>
                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-primary stroke-[2.5]" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
