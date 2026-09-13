import { useState } from "react";
import {
  ArrowLeft,
  MessageSquare,
  Volume2,
  BookOpen,
  RotateCcw,
  ArrowRight,
  Plus,
} from "lucide-react";

type InstructionLang = "en" | "vi" | "ja";

interface LanguageOption {
  code: InstructionLang;
  label: string;
  flag: string;
}

const LANGUAGES: LanguageOption[] = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "vi", label: "Tiếng Việt", flag: "🇻🇳" },
  { code: "ja", label: "日本語", flag: "🇯🇵" },
];

interface StepItem {
  step: string;
  title: string;
  description: string;
  icon: typeof MessageSquare;
  color: string;
  badgeColor: string;
  note?: string;
}

interface InstructionContent {
  pageTitle: string;
  backAria: string;
  introTitle: string;
  introDescription: string;
  addBrickButton: string;
  backButton: string;
  steps: StepItem[];
}

const INSTRUCTION_CONTENT: Record<InstructionLang, InstructionContent> = {
  en: {
    pageTitle: "5 Steps to Practice",
    backAria: "Go back to practice",
    introTitle: "How to Practice",
    introDescription:
      "Follow these 5 simple steps for every sentence (brick) to build real fluency.",
    addBrickButton: "Add Your First Brick",
    backButton: "Back to Practice",
    steps: [
      {
        step: "Step 1",
        title: "Look at the native sentence and say the target sentence",
        description:
          "Look at the native sentence (the language you already understand) and say the target sentence (the language you want to learn) out loud.",
        icon: MessageSquare,
        color: "text-primary bg-primary/10",
        badgeColor: "text-primary",
      },
      {
        step: "Step 2",
        title: "Listen to the target audio",
        description:
          "Tap the sound button to hear how the target sentence is pronounced.",
        icon: Volume2,
        color: "text-secondary bg-secondary/10",
        badgeColor: "text-secondary",
      },
      {
        step: "Step 3",
        title: "Read the target sentence (Must understand 100%)",
        description:
          "Reveal and read the target sentence (the language you want to learn). Make sure you understand 100% of the words and meaning.",
        icon: BookOpen,
        color: "text-blue-600 bg-blue-500/10",
        badgeColor: "text-blue-600",
        note: "You must understand the target sentence 100% before moving on.",
      },
      {
        step: "Step 4",
        title: "Try Step 1 again until you get it right",
        description:
          "Repeat Step 1 without looking at the answer until you can say the target sentence smoothly and correctly.",
        icon: RotateCcw,
        color: "text-amber-600 bg-amber-500/10",
        badgeColor: "text-amber-600",
      },
      {
        step: "Step 5",
        title: "Move to the next sentence",
        description:
          "Once you can say it fluently, tap Next to move to your next brick and keep learning!",
        icon: ArrowRight,
        color: "text-emerald-600 bg-emerald-500/10",
        badgeColor: "text-emerald-600",
      },
    ],
  },
  vi: {
    pageTitle: "5 Bước Luyện Tập",
    backAria: "Quay lại luyện tập",
    introTitle: "Cách Luyện Tập",
    introDescription:
      "Thực hiện 5 bước đơn giản này cho mỗi câu (brick) để hình thành phản xạ tự nhiên.",
    addBrickButton: "Thêm Brick Đầu Tiên",
    backButton: "Quay Lại Luyện Tập",
    steps: [
      {
        step: "Bước 1",
        title: "Nhìn câu tiếng mẹ đẻ và nói to câu mục tiêu",
        description:
          "Nhìn vào câu tiếng mẹ đẻ (ngôn ngữ bạn đã hiểu rõ) và tự nói to câu mục tiêu (ngôn ngữ bạn đang học).",
        icon: MessageSquare,
        color: "text-primary bg-primary/10",
        badgeColor: "text-primary",
      },
      {
        step: "Bước 2",
        title: "Nghe âm thanh mục tiêu",
        description:
          "Nhấn vào nút loa để nghe cách phát âm chuẩn xác của câu mục tiêu.",
        icon: Volume2,
        color: "text-secondary bg-secondary/10",
        badgeColor: "text-secondary",
      },
      {
        step: "Bước 3",
        title: "Đọc câu mục tiêu (Bắt buộc phải hiểu 100%)",
        description:
          "Mở câu mục tiêu ra để xem và đọc. Hãy đảm bảo rằng bạn hiểu 100% tất cả các từ và ý nghĩa của câu.",
        icon: BookOpen,
        color: "text-blue-600 bg-blue-500/10",
        badgeColor: "text-blue-600",
        note: "Bạn phải hiểu câu mục tiêu 100% trước khi chuyển sang bước tiếp theo.",
      },
      {
        step: "Bước 4",
        title: "Lặp lại Bước 1 cho đến khi thuần thục",
        description:
          "Lặp lại Bước 1 mà không nhìn vào đáp án cho đến khi bạn có thể nói câu mục tiêu một cách trôi chảy và tự nhiên.",
        icon: RotateCcw,
        color: "text-amber-600 bg-amber-500/10",
        badgeColor: "text-amber-600",
      },
      {
        step: "Bước 5",
        title: "Chuyển sang câu tiếp theo",
        description:
          "Khi bạn đã nói trôi chảy, nhấn 'Next' để chuyển sang câu tiếp theo và tiếp tục hành trình học tập!",
        icon: ArrowRight,
        color: "text-emerald-600 bg-emerald-500/10",
        badgeColor: "text-emerald-600",
      },
    ],
  },
  ja: {
    pageTitle: "練習の5つのステップ",
    backAria: "練習に戻る",
    introTitle: "効果的な練習方法",
    introDescription:
      "1文(brick)ごとにこの5つのシンプルなステップを実践して、本物の流暢さを身につけましょう。",
    addBrickButton: "最初のBrickを追加",
    backButton: "練習に戻る",
    steps: [
      {
        step: "ステップ 1",
        title: "母国語の文を見て、対象言語の文を声に出す",
        description:
          "母国語（すでに理解できる言語）を見て、学習したい対象言語の文を声に出して言います。",
        icon: MessageSquare,
        color: "text-primary bg-primary/10",
        badgeColor: "text-primary",
      },
      {
        step: "ステップ 2",
        title: "お手本音声を聞く",
        description:
          "音声ボタンをタップして、対象言語の文の発音とリズムを確認します。",
        icon: Volume2,
        color: "text-secondary bg-secondary/10",
        badgeColor: "text-secondary",
      },
      {
        step: "ステップ 3",
        title: "対象言語の文を読む（100%理解すること）",
        description:
          "答えを表示して対象言語の文を読みます。文中の単語や文法の意味を100%理解できていることを確認してください。",
        icon: BookOpen,
        color: "text-blue-600 bg-blue-500/10",
        badgeColor: "text-blue-600",
        note: "次に進む前に、対象文の意味と語彙を100%理解している必要があります。",
      },
      {
        step: "ステップ 4",
        title: "正しく言えるまでステップ1を繰り返す",
        description:
          "答えを見ずに、スラスラと自然に言えるようになるまでステップ1を繰り返します。",
        icon: RotateCcw,
        color: "text-amber-600 bg-amber-500/10",
        badgeColor: "text-amber-600",
      },
      {
        step: "ステップ 5",
        title: "次の文に進む",
        description:
          "流暢に言えるようになったら、「Next」をタップして次のBrickへ進み、学習を続けましょう！",
        icon: ArrowRight,
        color: "text-emerald-600 bg-emerald-500/10",
        badgeColor: "text-emerald-600",
      },
    ],
  },
};

interface PracticeInstructionsPageProps {
  onBack: () => void;
  onNavigateToAddBrick?: () => void;
}

export default function PracticeInstructionsPage({
  onBack,
  onNavigateToAddBrick,
}: PracticeInstructionsPageProps) {
  const [lang, setLang] = useState<InstructionLang>(() => {
    const saved = localStorage.getItem("lisenare_instruction_lang");
    if (saved === "en" || saved === "vi" || saved === "ja") {
      return saved;
    }
    return "en";
  });

  const handleSelectLang = (newLang: InstructionLang) => {
    setLang(newLang);
    localStorage.setItem("lisenare_instruction_lang", newLang);
  };

  const t = INSTRUCTION_CONTENT[lang];

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 pt-6 pb-24 animate-in fade-in duration-300">
      {/* Top Header */}
      <header className="flex items-center justify-between h-14 w-full mb-4">
        <button
          onClick={onBack}
          className="p-2 -ml-2 rounded-full hover:bg-surface-container transition-all active:scale-95 cursor-pointer"
          aria-label={t.backAria}
        >
          <ArrowLeft className="w-6 h-6 text-primary" />
        </button>
        <h1 className="text-lg sm:text-xl font-bold font-display text-primary text-center">
          {t.pageTitle}
        </h1>
        <div className="w-10" />
      </header>

      <main className="space-y-4">
        {/* Language Selection Tabs */}
        <div className="flex items-center justify-center p-1 bg-surface-container-low rounded-2xl border border-outline-variant/60 shadow-2xs">
          {LANGUAGES.map((item) => {
            const isActive = lang === item.code;
            return (
              <button
                key={item.code}
                type="button"
                onClick={() => handleSelectLang(item.code)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? "bg-white text-primary shadow-xs border border-outline-variant/30"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container/50"
                }`}
              >
                <span className="text-base leading-none select-none">
                  {item.flag}
                </span>
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Intro Banner */}
        <section className="bg-white p-5 rounded-2xl border border-outline-variant/60 shadow-xs text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto overflow-hidden p-2 mb-1">
            <img
              src="/favicon.svg"
              alt="Lisenare Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <h2 className="text-base font-bold font-display text-on-surface">
            {t.introTitle}
          </h2>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            {t.introDescription}
          </p>
        </section>

        {/* 5 Steps */}
        {t.steps.map((s, idx) => {
          const Icon = s.icon;
          return (
            <section
              key={idx}
              className="bg-white p-4 sm:p-5 rounded-2xl border border-outline-variant/60 shadow-xs space-y-2"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${s.color}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider ${s.badgeColor}`}
                  >
                    {s.step}
                  </span>
                  <h3 className="text-sm font-bold text-on-surface leading-snug">
                    {s.title}
                  </h3>
                </div>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed pl-12">
                {s.description}
              </p>
              {s.note && (
                <div className="ml-12 p-2 bg-blue-50 border border-blue-200/60 rounded-lg text-[11px] text-blue-900 font-medium">
                  💡 {s.note}
                </div>
              )}
            </section>
          );
        })}

        {/* Call to Action */}
        {onNavigateToAddBrick && (
          <section className="pt-3 text-center space-y-3">
            <button
              type="button"
              onClick={onNavigateToAddBrick}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary text-on-primary rounded-xl font-bold text-sm shadow-md shadow-primary/20 hover:bg-primary/95 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
              <span>{t.addBrickButton}</span>
            </button>
            <button
              type="button"
              onClick={onBack}
              className="text-xs text-outline hover:text-on-surface transition-colors cursor-pointer py-1"
            >
              {t.backButton}
            </button>
          </section>
        )}
      </main>
    </div>
  );
}
