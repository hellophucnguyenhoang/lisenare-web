import {
  ArrowLeft,
  MessageSquare,
  Volume2,
  BookOpen,
  RotateCcw,
  ArrowRight,
  Plus,
} from "lucide-react";

interface PracticeInstructionsPageProps {
  onBack: () => void;
  onNavigateToAddBrick?: () => void;
}

export default function PracticeInstructionsPage({
  onBack,
  onNavigateToAddBrick,
}: PracticeInstructionsPageProps) {
  const steps = [
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
  ];

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 pt-6 pb-24 animate-in fade-in duration-300">
      {/* Top Header */}
      <header className="flex items-center justify-between h-14 w-full mb-6">
        <button
          onClick={onBack}
          className="p-2 -ml-2 rounded-full hover:bg-surface-container transition-all active:scale-95 cursor-pointer"
          aria-label="Go back to practice"
        >
          <ArrowLeft className="w-6 h-6 text-primary" />
        </button>
        <h1 className="text-xl font-bold font-display text-primary">
          5 Steps to Practice
        </h1>
        <div className="w-10" />
      </header>

      <main className="space-y-4">
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
            How to Practice
          </h2>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Follow these 5 simple steps for every sentence to build real fluency.
          </p>
        </section>

        {/* 5 Steps */}
        {steps.map((s, idx) => {
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
              <span>Add Your First Brick</span>
            </button>
            <button
              type="button"
              onClick={onBack}
              className="text-xs text-outline hover:text-on-surface transition-colors cursor-pointer py-1"
            >
              Back to Practice
            </button>
          </section>
        )}
      </main>
    </div>
  );
}
