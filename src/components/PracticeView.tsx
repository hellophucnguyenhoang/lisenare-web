import React, { useState, useEffect, useRef } from "react";
import { type Brick, type Collection } from "../types";
import {
  Mic,
  Volume2,
  Settings,
  Keyboard,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Trophy,
} from "lucide-react";

interface PracticeViewProps {
  bricks: Brick[];
  collections: Collection[];
  onShowResults: (
    overall: number,
    pronunciation: number,
    accuracy: number,
  ) => void;
  onUpdateBrickStatus: (
    id: string,
    status: "new" | "reviewing" | "mastered",
  ) => void;
  onIncrementPoints: (pts: number) => void;
}

export default function PracticeView({
  bricks,
  collections,
  onShowResults,
  onUpdateBrickStatus,
  onIncrementPoints,
}: PracticeViewProps) {
  // Practice session state
  const [sessionBricks, setSessionBricks] = useState<Brick[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [showTypeInput, setShowTypeInput] = useState(false);
  const [evaluationFeedback, setEvaluationFeedback] = useState<{
    show: boolean;
    overall: number;
    pronunciation: number;
    accuracy: number;
    message: string;
  } | null>(null);

  // Stats
  const reviewCount = bricks.filter((b) => b.status === "reviewing").length;
  const newCount = bricks.filter((b) => b.status === "new").length;

  // Initialize a randomized session of up to 5 bricks
  useEffect(() => {
    if (bricks.length > 0) {
      // Prioritize new & reviewing, limit to 5
      const pool = [...bricks].sort(() => 0.5 - Math.random()).slice(0, 5);
      setSessionBricks(pool);
      setCurrentIndex(0);
      setIsRevealed(false);
      setTypedAnswer("");
      setShowTypeInput(false);
      setEvaluationFeedback(null);
    }
  }, [bricks]);

  const activeBrick = sessionBricks[currentIndex];

  // Text-To-Speech (SpeechSynthesis)
  const speakSpanishText = () => {
    if (!activeBrick) return;
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(activeBrick.targetText);
      utterance.lang = "es-ES"; // Spanish locale

      // Try to find a Spanish voice if available
      const voices = window.speechSynthesis.getVoices();
      const esVoice = voices.find((v) => v.lang.startsWith("es-"));
      if (esVoice) utterance.voice = esVoice;

      window.speechSynthesis.speak(utterance);
    } else {
      alert("Text-to-speech is not supported in this browser.");
    }
  };

  // Autoplay Spanish text on transition
  useEffect(() => {
    if (activeBrick) {
      setIsRevealed(false);
      setTypedAnswer("");
      setEvaluationFeedback(null);
      // Speak audio slightly after card is loaded for organic feel
      const t = setTimeout(() => {
        speakSpanishText();
      }, 400);
      return () => clearTimeout(t);
    }
  }, [activeBrick]);

  // Audio wave animation simulator
  const [waveAnimation, setWaveAnimation] = useState<number[]>([
    12, 12, 12, 12, 12,
  ]);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRecording) {
      const animate = () => {
        setWaveAnimation(
          Array.from({ length: 8 }, () => Math.floor(Math.random() * 24) + 4),
        );
        animationRef.current = requestAnimationFrame(animate);
      };
      animate();
    } else {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      setWaveAnimation([10, 10, 10, 10, 10, 10, 10, 10]);
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isRecording]);

  // Web Speech Recognition (Optional or Simulation)
  const handleMicClick = () => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      // Compute score
      evaluateSpeech();
    } else {
      // Start recording
      setIsRecording(true);
      // Simulate real progress
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = "es-ES";
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onresult = (event: any) => {
          const spoken = event.results[0][0].transcript;
          console.log("Spoken:", spoken);
          evaluateSpeech(spoken);
        };

        recognition.onerror = () => {
          // fallback to simulation
          setTimeout(() => {
            evaluateSpeech();
          }, 2000);
        };

        recognition.start();
        // Auto stop after 4s
        setTimeout(() => {
          recognition.stop();
          setIsRecording(false);
        }, 4000);
      } else {
        // Simulation mode
        setTimeout(() => {
          setIsRecording(false);
          evaluateSpeech();
        }, 3000);
      }
    }
  };

  // Evaluate Spanish Pronunciation
  const evaluateSpeech = (spokenText?: string) => {
    if (!activeBrick) return;

    let matchPercentage = 85; // Baseline high simulation
    if (spokenText) {
      const target = activeBrick.targetText
        .toLowerCase()
        .replace(/[¿?¡!.,]/g, "")
        .trim();
      const spoken = spokenText
        .toLowerCase()
        .replace(/[¿?¡!.,]/g, "")
        .trim();

      // Basic match score
      if (target === spoken) {
        matchPercentage = 100;
      } else {
        const intersection = target
          .split(" ")
          .filter((w) => spoken.includes(w)).length;
        matchPercentage = Math.round(
          (intersection / target.split(" ").length) * 100,
        );
        if (matchPercentage < 50) matchPercentage = 65; // Minimum standard score for encouragement
      }
    } else {
      // Simulated dynamic high score (between 80 and 98)
      matchPercentage = Math.floor(Math.random() * 19) + 80;
    }

    const pronScore = matchPercentage;
    const accScore = Math.floor(Math.random() * 15) + 80; // Simulated accuracy

    // Set interactive prompt feedback
    setEvaluationFeedback({
      show: true,
      overall: Math.round((pronScore + accScore) / 2),
      pronunciation: pronScore,
      accuracy: accScore,
      message:
        pronScore >= 90
          ? "Excellent pronunciation! Your accent is beautifully clear."
          : "Great effort! Focus slightly on the emphasis of vowels.",
    });

    // Mark current brick as mastered if score is high enough, else reviewing
    const newStatus = pronScore >= 90 ? "mastered" : "reviewing";
    onUpdateBrickStatus(activeBrick.id, newStatus);
    onIncrementPoints(Math.round((pronScore + accScore) / 4));
  };

  const handleNext = () => {
    if (currentIndex < sessionBricks.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsRevealed(false);
      setTypedAnswer("");
      setShowTypeInput(false);
      setEvaluationFeedback(null);
    } else {
      // Completed session! Show results screen modal
      const avgOverall = Math.round(
        sessionBricks.reduce(
          (acc, curr) => acc + (curr.pronunciationScore || 85),
          0,
        ) / sessionBricks.length,
      );
      const avgPron = Math.round(
        sessionBricks.reduce(
          (acc, curr) => acc + (curr.pronunciationScore || 92),
          0,
        ) / sessionBricks.length,
      );
      const avgAcc = Math.round(
        sessionBricks.reduce(
          (acc, curr) => acc + (curr.accuracyScore || 78),
          0,
        ) / sessionBricks.length,
      );
      onShowResults(avgOverall, avgPron, avgAcc);
    }
  };

  const handleTypedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (typedAnswer.trim() === "") return;

    setIsRevealed(true);
    const textTarget = activeBrick.targetText
      .toLowerCase()
      .replace(/[¿?¡!.,]/g, "")
      .trim();
    const textTyped = typedAnswer
      .toLowerCase()
      .replace(/[¿?¡!.,]/g, "")
      .trim();

    let score = 50;
    if (textTarget === textTyped) {
      score = 100;
    } else {
      const wordsTarget = textTarget.split(" ");
      const wordsTyped = textTyped.split(" ");
      const matching = wordsTarget.filter((w) => wordsTyped.includes(w)).length;
      score = Math.round((matching / wordsTarget.length) * 100);
    }

    setEvaluationFeedback({
      show: true,
      overall: score,
      pronunciation: 85, // Default/simulated spoken score
      accuracy: score,
      message:
        score >= 90
          ? "Brilliant match! Your writing is spot on."
          : "Close match! Compare spelling with the target language.",
    });

    const newStatus = score >= 90 ? "mastered" : "reviewing";
    onUpdateBrickStatus(activeBrick.id, newStatus);
    onIncrementPoints(Math.round(score / 5));
  };

  if (sessionBricks.length === 0) {
    return (
      <div className="max-w-max-width mx-auto px-container-padding py-24 text-center animate-in fade-in duration-300">
        <Sparkles className="w-16 h-16 text-primary mx-auto mb-4 animate-bounce" />
        <h2 className="text-2xl font-bold font-display text-on-surface">
          No Bricks Ready to Practice
        </h2>
        <p className="text-sm text-on-surface-variant max-w-sm mx-auto mt-2">
          Add some language bricks from the "Collections" tab or the "Discover"
          feed to start practicing!
        </p>
      </div>
    );
  }

  return (
    <div className="flex-grow flex flex-col items-center justify-center px-container-padding py-6 max-w-lg mx-auto w-full animate-in fade-in duration-300">
      {/* Session progress dashboard */}
      <header className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-2xl px-6 py-4 mb-6 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-outline uppercase tracking-wider">
              Review
            </span>
            <span className="text-xl text-secondary font-bold font-display">
              {reviewCount}
            </span>
          </div>
          <div className="h-8 w-[1.5px] bg-outline-variant/30"></div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-outline uppercase tracking-wider">
              New
            </span>
            <span className="text-xl text-primary font-bold font-display">
              {newCount}
            </span>
          </div>
        </div>

        <div className="flex-grow mx-6">
          <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{
                width: `${((currentIndex + 1) / sessionBricks.length) * 100}%`,
              }}
            ></div>
          </div>
          <p className="text-[10px] text-outline text-right mt-1 font-bold">
            {currentIndex + 1} / {sessionBricks.length} Bricks
          </p>
        </div>

        <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors text-outline">
          <Settings className="w-5 h-5" />
        </button>
      </header>

      {/* The Active practice card */}
      <div className="w-full relative">
        <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl shadow-md p-8 flex flex-col items-center text-center relative overflow-hidden">
          {/* Target language banner */}
          <span className="px-3 py-1 bg-surface-container text-on-surface-variant rounded-lg text-[10px] font-bold tracking-wider uppercase mb-6">
            Spanish
          </span>

          {/* Target Phrase */}
          <div className="mb-6">
            <span className="text-[10px] font-bold text-outline uppercase tracking-widest mb-1.5 block">
              Source Language
            </span>
            <h2 className="text-2xl md:text-3xl font-bold font-display text-on-background tracking-tight">
              {activeBrick.targetText}
            </h2>
            {activeBrick.pronunciation && (
              <p className="text-xs text-outline font-mono mt-1 select-none">
                {activeBrick.pronunciation}
              </p>
            )}
          </div>

          {/* Audio voice read button */}
          <button
            onClick={speakSpanishText}
            className="mb-6 w-11 h-11 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 active:scale-90 transition-all shadow-xs"
            title="Read vocabulary aloud"
          >
            <Volume2 className="w-5 h-5" />
          </button>

          {/* Flip / Reveal Action */}
          {!isRevealed ? (
            <div className="w-full" id="reveal-container">
              <button
                onClick={() => setIsRevealed(true)}
                className="w-full py-5 rounded-xl border border-dashed border-secondary-container bg-secondary-container/5 hover:bg-secondary-container/10 transition-all cursor-pointer group active:scale-[0.99]"
              >
                <span className="text-secondary font-bold text-sm flex items-center justify-center gap-2 group-hover:scale-105 transition-all">
                  Tap to Reveal English
                </span>
              </button>
            </div>
          ) : (
            <div className="w-full animate-in fade-in zoom-in-95 duration-300 flex flex-col items-center">
              <div className="h-[1.5px] w-12 bg-outline-variant/40 mb-6"></div>
              <span className="text-[10px] font-bold text-outline uppercase tracking-widest mb-1 block">
                English Meaning
              </span>
              <h3 className="text-lg md:text-xl font-bold text-primary mb-4 font-display">
                {activeBrick.nativeText}
              </h3>
            </div>
          )}

          {/* Tags */}
          <div className="mt-8 flex flex-wrap justify-center gap-1.5">
            {activeBrick.tags.map((t) => (
              <span
                key={t}
                className="px-2.5 py-1 bg-surface-container rounded-lg text-xs font-semibold text-on-surface-variant"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Action panel underneath the brick */}
      <div className="w-full mt-8 space-y-6 flex flex-col items-center">
        {/* Toggle between writing & speaking */}
        {!showTypeInput ? (
          <button
            onClick={() => setShowTypeInput(true)}
            className="text-primary font-bold text-xs flex items-center gap-1.5 hover:underline active:scale-95 transition-all"
          >
            <Keyboard className="w-4 h-4" />
            <span>Type your answer instead</span>
          </button>
        ) : (
          <form
            onSubmit={handleTypedSubmit}
            className="w-full flex gap-2 animate-in slide-in-from-bottom-2 duration-200"
          >
            <input
              type="text"
              placeholder="Type translation in Spanish..."
              value={typedAnswer}
              onChange={(e) => setTypedAnswer(e.target.value)}
              className="flex-grow px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary focus:outline-none text-sm transition-all shadow-sm"
              autoFocus
            />
            <button
              type="submit"
              className="bg-primary text-on-primary px-5 rounded-xl font-bold text-xs hover:bg-primary/95 transition-all"
            >
              Check
            </button>
            <button
              type="button"
              onClick={() => setShowTypeInput(false)}
              className="px-3 border border-outline-variant text-on-surface-variant rounded-xl hover:bg-surface"
            >
              Cancel
            </button>
          </form>
        )}

        {/* Pronunciation Recording Circle */}
        {!showTypeInput && (
          <div className="flex flex-col items-center gap-4 w-full">
            <div className="relative">
              <button
                onClick={handleMicClick}
                className={`w-20 h-20 rounded-full text-on-primary shadow-lg flex items-center justify-center transition-all ${
                  isRecording
                    ? "bg-error animate-pulse scale-105 shadow-error/20"
                    : "bg-primary hover:brightness-105 active:scale-95 shadow-primary/20"
                }`}
                title="Hold or tap to speak pronunciation"
              >
                <Mic className="w-9 h-9" />
              </button>

              {/* Simulated visual sound waves surrounding the mic */}
              {isRecording && (
                <div className="absolute -inset-4 border border-error/20 rounded-full animate-ping pointer-events-none"></div>
              )}
            </div>

            {/* Simulated soundwave bars */}
            {isRecording ? (
              <div className="flex items-center gap-1 mt-2 h-6">
                {waveAnimation.map((h, i) => (
                  <div
                    key={i}
                    className="w-1 bg-error rounded-full transition-all duration-100"
                    style={{ height: `${h}px` }}
                  ></div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-on-surface-variant font-medium select-none">
                Tap to record your pronunciation
              </p>
            )}
          </div>
        )}

        {/* Next brick CTA button */}
        {(isRevealed || evaluationFeedback) && (
          <button
            onClick={handleNext}
            className="w-full bg-primary text-on-primary py-4 rounded-xl shadow-md active:scale-98 transition-all hover:shadow-lg flex items-center justify-center gap-2 font-bold animate-in fade-in duration-300"
          >
            <span>Next Brick</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Dynamic Pronunciation / Score feedback scoreboard dialog */}
      {evaluationFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/40 backdrop-blur-xs p-container-padding animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/40 w-full max-w-md p-6 flex flex-col items-center text-center animate-in zoom-in duration-300">
            {/* Visual Header Icon */}
            <div className="relative w-full h-24 flex justify-center items-center mb-4">
              <div className="p-4 bg-primary/10 rounded-full">
                <Trophy className="w-10 h-10 text-primary" />
              </div>
            </div>

            {/* Overall Ring Score */}
            <div className="relative flex items-center justify-center mb-6">
              <div className="w-24 h-24 rounded-full border-4 border-surface-container-high flex items-center justify-center">
                <span className="text-2xl font-bold font-display text-primary">
                  {evaluationFeedback.overall}%
                </span>
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full border border-primary/20 animate-pulse pointer-events-none"></div>
            </div>

            <h4 className="text-lg font-bold text-on-surface mb-2 font-display">
              {evaluationFeedback.overall >= 90
                ? "Excellent Job!"
                : "Good Work!"}
            </h4>
            <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">
              {evaluationFeedback.message}
            </p>

            {/* Score Grid Breakdown */}
            <div className="w-full grid grid-cols-2 gap-3 mb-6">
              <div className="bg-surface-container-low border border-outline-variant rounded-xl p-3 flex flex-col items-center gap-1 shadow-xs">
                <Mic className="w-4 h-4 text-secondary" />
                <span className="text-sm font-bold text-on-surface">
                  {evaluationFeedback.pronunciation}%
                </span>
                <span className="text-[10px] text-outline uppercase font-extrabold tracking-wider">
                  Pronunciation
                </span>
              </div>

              <div className="bg-surface-container-low border border-outline-variant rounded-xl p-3 flex flex-col items-center gap-1 shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span className="text-sm font-bold text-on-surface">
                  {evaluationFeedback.accuracy}%
                </span>
                <span className="text-[10px] text-outline uppercase font-extrabold tracking-wider">
                  Accuracy
                </span>
              </div>
            </div>

            {/* Dismissal */}
            <div className="flex flex-col w-full gap-2">
              <button
                onClick={() => {
                  setEvaluationFeedback(null);
                  handleNext();
                }}
                className="w-full bg-primary text-on-primary py-3 rounded-xl font-bold shadow-xs hover:bg-primary/95 active:scale-95 transition-all"
              >
                Next Brick
              </button>
              <button
                onClick={() => setEvaluationFeedback(null)}
                className="w-full py-2.5 text-xs text-outline font-semibold hover:text-on-surface transition-colors"
              >
                Review Card
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
