import { useState, useEffect } from "react";
import {
  Sparkles,
  Play,
  Pause,
  Languages,
  Volume2,
  Construction,
  MousePointerClick,
  Check,
  BookmarkPlus,
  Tv,
} from "lucide-react";
import { useHeader } from "@/context/HeaderContext";
import { toast } from "sonner";

interface WordData {
  text: string;
  cleanWord: string;
  pos: string;
  pron: string;
  translation: string;
  explanation: string;
}

const TRANSCRIPT_WORDS: WordData[] = [
  {
    text: "In",
    cleanWord: "In",
    pos: "preposition",
    pron: "/ɪn/",
    translation: "trong, ở trong / 〜の中で",
    explanation: "Expresses location, condition, or inclusion within limits.",
  },
  {
    text: "everyday",
    cleanWord: "everyday",
    pos: "adjective",
    pron: "/ˈev.ri.deɪ/",
    translation: "hàng ngày, thông thường / 毎日の、日常の",
    explanation: "Happening or used routinely; common and typical for normal life.",
  },
  {
    text: "conversations,",
    cleanWord: "conversations",
    pos: "noun",
    pron: "/ˌkɒn.vəˈseɪ.ʃənz/",
    translation: "cuộc trò chuyện / 会話",
    explanation: "Spoken exchanges between people sharing ideas, opinions, and thoughts.",
  },
  {
    text: "learners",
    cleanWord: "learners",
    pos: "noun",
    pron: "/ˈlɜː.nərz/",
    translation: "người học / 学習者",
    explanation: "People actively studying, acquiring skills, or practicing new knowledge.",
  },
  {
    text: "deeply",
    cleanWord: "deeply",
    pos: "adverb",
    pron: "/ˈdiːp.li/",
    translation: "sâu sắc / 深く",
    explanation: "To an intense, thorough, or profound extent.",
  },
  {
    text: "appreciate",
    cleanWord: "appreciate",
    pos: "verb",
    pron: "/əˈpriː.ʃi.eɪt/",
    translation: "trân trọng, đánh giá cao / 感謝する、高く評価する",
    explanation: "To recognize full value, importance, or to feel genuine gratitude.",
  },
  {
    text: "when",
    cleanWord: "when",
    pos: "conjunction",
    pron: "/wen/",
    translation: "khi, vào lúc / 〜のとき",
    explanation: "At or during the specific time or event that something occurs.",
  },
  {
    text: "subtitles",
    cleanWord: "subtitles",
    pos: "noun",
    pron: "/ˈsʌbˌtaɪ.təlz/",
    translation: "phụ đề / 字幕",
    explanation: "Captions displayed alongside speech translating or transcribing video audio.",
  },
  {
    text: "explain",
    cleanWord: "explain",
    pos: "verb",
    pron: "/ɪkˈspleɪn/",
    translation: "giải thích / 説明する",
    explanation: "To make an idea or situation clear by describing relevant details.",
  },
  {
    text: "the",
    cleanWord: "the",
    pos: "definite article",
    pron: "/ðə/",
    translation: "cái, người đó / その",
    explanation: "Specifies a particular noun already known or contextually identified.",
  },
  {
    text: "real-world",
    cleanWord: "real-world",
    pos: "adjective",
    pron: "/ˌrɪəlˈwɜːld/",
    translation: "thực tế, đời thực / 実際の、現実の",
    explanation: "Relating to authentic, practical situations rather than theoretical models.",
  },
  {
    text: "context.",
    cleanWord: "context",
    pos: "noun",
    pron: "/ˈkɒn.tekst/",
    translation: "ngữ cảnh, bối cảnh / 文脈、状況",
    explanation: "The surrounding circumstances or background that clarify authentic meaning.",
  },
];

export default function DiscoverPage() {
  const { setHeaderContent } = useHeader();
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedWord, setSelectedWord] = useState<WordData>(
    TRANSCRIPT_WORDS[5], // 'appreciate' selected by default to showcase the lookup
  );
  const [isSavedDemo, setIsSavedDemo] = useState(false);

  // Dynamically update the fixed sticky header with discover badge
  useEffect(() => {
    setHeaderContent(
      <div className="flex items-center gap-1.5 text-xs text-primary font-bold bg-primary/10 px-2.5 py-1 rounded-xl">
        <Sparkles className="w-3.5 h-3.5" />
        <span>Coming Soon</span>
      </div>,
    );
    return () => setHeaderContent(null);
  }, [setHeaderContent]);

  const handlePronounce = (word: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = "en-US";
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSaveDemo = () => {
    setIsSavedDemo(true);
    toast.success(`"${selectedWord.cleanWord}" preview saved to vocabulary!`);
    setTimeout(() => setIsSavedDemo(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 pb-24 animate-in fade-in duration-300">
      {/* Feature Under Development Notice */}
      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 sm:p-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-xs">
        <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-2xs">
          <Construction className="w-5 h-5" />
        </div>
        <div className="grow">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
              In Active Development
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-bold font-display text-on-surface">
            Discover: Video Immersion & Interactive Transcripts
          </h2>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5 leading-relaxed max-w-2xl">
            This feature is currently being crafted for learners. You will be
            able to discover videos you love, watch with synchronized live
            transcripts, and tap on any word to instantly inspect its
            translation, pronunciation, and contextual explanation.
          </p>
        </div>
      </div>

      {/* Feature Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="p-4 bg-surface-container-lowest border border-outline-variant/50 rounded-2xl shadow-2xs flex flex-col gap-1.5">
          <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-1">
            <Tv className="w-4 h-4" />
          </div>
          <h3 className="text-xs sm:text-sm font-bold text-on-surface">
            1. Watch Videos You Enjoy
          </h3>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Choose engaging real-world clips from YouTube and native video
            sources matching your interests.
          </p>
        </div>

        <div className="p-4 bg-surface-container-lowest border border-outline-variant/50 rounded-2xl shadow-2xs flex flex-col gap-1.5">
          <div className="w-8 h-8 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center mb-1">
            <Languages className="w-4 h-4" />
          </div>
          <h3 className="text-xs sm:text-sm font-bold text-on-surface">
            2. Live Interactive Transcripts
          </h3>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Follow synchronized speech in real time with line-by-line transcripts
            timed directly to native speakers.
          </p>
        </div>

        <div className="p-4 bg-surface-container-lowest border border-outline-variant/50 rounded-2xl shadow-2xs flex flex-col gap-1.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-1">
            <MousePointerClick className="w-4 h-4" />
          </div>
          <h3 className="text-xs sm:text-sm font-bold text-on-surface">
            3. Tap to Translate & Explain
          </h3>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Click on any unfamiliar word in the transcript to reveal instant
            translations, meanings, and save to your bricks.
          </p>
        </div>
      </div>

      {/* Interactive Dummy Preview Section */}
      <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-3xl p-5 sm:p-7 shadow-xs">
        <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-outline-variant/30">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-on-surface flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>Interactive Concept Preview</span>
            </h3>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Experience how clicking transcript words provides instant explanations:
            </p>
          </div>
          <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-xl shrink-0">
            Click any word below
          </span>
        </div>

        {/* Video Mockup Player */}
        <div className="relative aspect-video w-full max-w-2xl mx-auto rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 border border-outline-variant/40 shadow-md mb-5 flex flex-col items-center justify-center group select-none">
          {/* Mock Background Imagery / Grid */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />

          {/* Central Play/Pause Button */}
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="relative z-10 w-16 h-16 rounded-full bg-primary/90 hover:bg-primary text-on-primary flex items-center justify-center shadow-lg transition-transform group-hover:scale-105 active:scale-95 cursor-pointer"
            aria-label={isPlaying ? "Pause preview video" : "Play preview video"}
          >
            {isPlaying ? (
              <Pause className="w-7 h-7 fill-current" />
            ) : (
              <Play className="w-7 h-7 fill-current ml-1" />
            )}
          </button>

          {/* Video Mockup Overlay Details */}
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-xs text-white text-[11px] font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span>Sample Video Clip</span>
          </div>

          <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-black/70 text-white text-[10px] font-mono">
            01:45 / 03:20
          </div>

          <div className="absolute bottom-3 left-3 text-white text-xs font-semibold drop-shadow-md">
            Natural English Phrasing & Context
          </div>
        </div>

        {/* Live Transcript Box with Clickable Word Chips */}
        <div className="bg-surface-container/60 border border-outline-variant/40 rounded-2xl p-4 mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary" />
              Live Transcript (Click any word)
            </span>
            <span className="text-[11px] text-outline">English (US)</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 leading-relaxed text-sm sm:text-base font-medium text-on-surface py-1">
            {TRANSCRIPT_WORDS.map((w, idx) => {
              const isSelected = selectedWord.cleanWord === w.cleanWord;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedWord(w)}
                  className={`px-2 py-1 rounded-lg transition-all cursor-pointer text-sm sm:text-base ${
                    isSelected
                      ? "bg-primary text-on-primary font-bold shadow-xs scale-105"
                      : "bg-surface-container-lowest hover:bg-primary/10 hover:text-primary border border-outline-variant/50"
                  }`}
                  title={`Click to inspect "${w.cleanWord}"`}
                >
                  {w.text}
                </button>
              );
            })}
          </div>
        </div>

        {/* Word Explanation & Translation Card */}
        {selectedWord && (
          <div className="bg-surface-container-lowest border-2 border-primary/30 rounded-2xl p-4 sm:p-5 animate-in slide-in-from-bottom-2 duration-200 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-3 border-b border-outline-variant/30">
              <div className="flex items-center gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-lg font-bold font-display text-primary">
                      {selectedWord.cleanWord}
                    </h4>
                    <span className="text-[11px] font-medium text-outline bg-surface-container px-2 py-0.5 rounded-md italic">
                      {selectedWord.pos}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-on-surface-variant mt-0.5">
                    <span className="font-mono">{selectedWord.pron}</span>
                    <button
                      type="button"
                      onClick={() => handlePronounce(selectedWord.cleanWord)}
                      className="p-1 rounded-md text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                      title="Listen to pronunciation"
                      aria-label="Listen to pronunciation"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveDemo}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all shadow-2xs self-start sm:self-auto cursor-pointer ${
                  isSavedDemo
                    ? "bg-emerald-600 text-white"
                    : "bg-primary text-on-primary hover:bg-primary/95 active:scale-95"
                }`}
              >
                {isSavedDemo ? (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Saved to Bricks!</span>
                  </>
                ) : (
                  <>
                    <BookmarkPlus className="w-3.5 h-3.5" />
                    <span>Save Word to Bricks</span>
                  </>
                )}
              </button>
            </div>

            <div className="space-y-2 text-xs sm:text-sm">
              <div>
                <span className="font-bold text-on-surface">Translation: </span>
                <span className="text-primary font-medium">
                  {selectedWord.translation}
                </span>
              </div>
              <div>
                <span className="font-bold text-on-surface">Explanation: </span>
                <span className="text-on-surface-variant leading-relaxed">
                  {selectedWord.explanation}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
