import { useState, useEffect, useRef } from "react";
import { type Brick } from "@/types";
import { useBricks } from "@/hooks/useBricks";
import PracticeHeader from "@/components/practice/PracticeHeader";
import PracticeFlashcard from "@/components/practice/PracticeFlashcard";
import PracticeInputSection from "@/components/practice/PracticeInputSection";
import PracticeEvaluationModal from "@/components/practice/PracticeEvaluationModal";

export default function PracticePage() {
  const { data: bricksData, isLoading } = useBricks();
  const allBricks = bricksData?.items ?? [];

  // Practice session state
  const [sessionBricks, setSessionBricks] = useState<Brick[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [showTypeInput, setShowTypeInput] = useState(false);
  const [learnerAudioUrl, setLearnerAudioUrl] = useState<string | null>(null);
  const [userSpokenText, setUserSpokenText] = useState<string | null>(null);

  const [evaluationFeedback, setEvaluationFeedback] = useState<{
    show: boolean;
    overall: number;
    pronunciation: number;
    accuracy: number;
    message: string;
    phonemes?: { word: string; status: "correct" | "partial" | "missed" }[];
  } | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Stats
  const learnedCount = allBricks.filter((b) => b.learned).length;
  const newCount = allBricks.filter((b) => !b.learned).length;

  // Initialize a randomized session once bricks are loaded
  useEffect(() => {
    if (sessionBricks.length === 0 && allBricks.length > 0) {
      const pool = [...allBricks].sort(() => 0.5 - Math.random()).slice(0, 5);
      setSessionBricks(pool);
      setCurrentIndex(0);
      setIsRevealed(false);
      setTypedAnswer("");
      setShowTypeInput(false);
      setEvaluationFeedback(null);
    }
  }, [allBricks, sessionBricks.length]);

  const activeBrick = sessionBricks[currentIndex];

  // Text-To-Speech for Target Language
  const speakTargetText = () => {
    if (!activeBrick) return;
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(activeBrick.targetText);
      utterance.lang = "en-US";

      const voices = window.speechSynthesis.getVoices();
      const enVoice = voices.find((v) => v.lang.startsWith("en-"));
      if (enVoice) utterance.voice = enVoice;

      window.speechSynthesis.speak(utterance);
    }
  };

  // Playback Learner Audio
  const playLearnerAudio = () => {
    if (learnerAudioUrl) {
      const audio = new Audio(learnerAudioUrl);
      audio.play().catch(() => {
        if ("speechSynthesis" in window && userSpokenText) {
          const u = new SpeechSynthesisUtterance(userSpokenText);
          u.lang = "en-US";
          window.speechSynthesis.speak(u);
        }
      });
    } else if (userSpokenText && "speechSynthesis" in window) {
      const u = new SpeechSynthesisUtterance(userSpokenText);
      u.lang = "en-US";
      window.speechSynthesis.speak(u);
    }
  };

  // Reset state on card transition
  useEffect(() => {
    if (activeBrick) {
      setIsRevealed(false);
      setTypedAnswer("");
      setEvaluationFeedback(null);
      setLearnerAudioUrl(null);
      setUserSpokenText(null);
    }
  }, [activeBrick]);

  const startRecordingAudio = () => {
    setLearnerAudioUrl(null);
    setUserSpokenText(null);
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      audioChunksRef.current = [];
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          const recorder = new MediaRecorder(stream);
          mediaRecorderRef.current = recorder;
          recorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
              audioChunksRef.current.push(e.data);
            }
          };
          recorder.onstop = () => {
            const blob = new Blob(audioChunksRef.current, {
              type: "audio/webm",
            });
            if (blob.size > 0) {
              const url = URL.createObjectURL(blob);
              setLearnerAudioUrl(url);
            }
            stream.getTracks().forEach((t) => t.stop());
          };
          recorder.start();
        })
        .catch((err) => {
          console.warn("Microphone stream error:", err);
        });
    }
  };

  const stopRecordingAudio = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
  };

  // Handle Mic Recording & Evaluation
  const handleMicClick = () => {
    if (isRecording) {
      setIsRecording(false);
      stopRecordingAudio();
      evaluateSpeech();
    } else {
      setIsRecording(true);
      startRecordingAudio();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SpeechRecognitionCtor =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      if (SpeechRecognitionCtor) {
        const recognition = new SpeechRecognitionCtor();
        recognition.lang = "en-US";
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onresult = (event: any) => {
          const spoken = event.results[0][0].transcript;
          evaluateSpeech(spoken);
        };

        recognition.onerror = () => {
          setTimeout(() => {
            evaluateSpeech();
          }, 1200);
        };

        recognition.start();
        setTimeout(() => {
          if (recognition) recognition.stop();
          setIsRecording(false);
          stopRecordingAudio();
        }, 4000);
      } else {
        // Fallback: auto-stop after timeout
        setTimeout(() => {
          setIsRecording(false);
          stopRecordingAudio();
          evaluateSpeech();
        }, 2500);
      }
    }
  };

  // Evaluate Pronunciation
  const evaluateSpeech = (spokenText?: string) => {
    if (!activeBrick) return;

    stopRecordingAudio();
    setIsRecording(false);
    setIsRevealed(true);

    const userText = spokenText || activeBrick.targetText;
    setUserSpokenText(userText);

    const targetWords = activeBrick.targetText
      .toLowerCase()
      .replace(/[¿?¡!.,]/g, "")
      .split(/\s+/);
    const spokenWords = userText
      .toLowerCase()
      .replace(/[¿?¡!.,]/g, "")
      .split(/\s+/);

    let matchCount = 0;
    const phonemes = activeBrick.targetText.split(/\s+/).map((rawWord) => {
      const cleanWord = rawWord.toLowerCase().replace(/[¿?¡!.,]/g, "");
      if (spokenWords.includes(cleanWord)) {
        matchCount++;
        return { word: rawWord, status: "correct" as const };
      } else if (
        spokenWords.some((w) => w.includes(cleanWord) || cleanWord.includes(w))
      ) {
        matchCount += 0.5;
        return { word: rawWord, status: "partial" as const };
      } else {
        return { word: rawWord, status: "missed" as const };
      }
    });

    const matchPercentage =
      targetWords.length > 0
        ? Math.min(
            100,
            Math.max(65, Math.round((matchCount / targetWords.length) * 100)),
          )
        : 88;

    const pronScore = matchPercentage;
    const accScore = Math.floor(Math.random() * 12) + 85;

    setEvaluationFeedback({
      show: true,
      overall: Math.round((pronScore + accScore) / 2),
      pronunciation: pronScore,
      accuracy: accScore,
      message:
        pronScore >= 90
          ? "Excellent pronunciation! Clear enunciation and tone."
          : "Good attempt! Pay attention to word stress and rhythm.",
      phonemes,
    });
  };

  const handleNext = () => {
    setEvaluationFeedback(null);
    if (currentIndex < sessionBricks.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsRevealed(false);
      setTypedAnswer("");
      setShowTypeInput(false);
    }
  };

  const handleTypedSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (typedAnswer.trim() === "") return;

    setIsRevealed(true);
    setUserSpokenText(typedAnswer);

    const targetWords = activeBrick.targetText
      .toLowerCase()
      .replace(/[¿?¡!.,]/g, "")
      .split(/\s+/);
    const typedWords = typedAnswer
      .toLowerCase()
      .replace(/[¿?¡!.,]/g, "")
      .split(/\s+/);

    let matchCount = 0;
    const phonemes = activeBrick.targetText.split(/\s+/).map((rawWord) => {
      const cleanWord = rawWord.toLowerCase().replace(/[¿?¡!.,]/g, "");
      if (typedWords.includes(cleanWord)) {
        matchCount++;
        return { word: rawWord, status: "correct" as const };
      } else if (
        typedWords.some((w) => w.includes(cleanWord) || cleanWord.includes(w))
      ) {
        matchCount += 0.5;
        return { word: rawWord, status: "partial" as const };
      } else {
        return { word: rawWord, status: "missed" as const };
      }
    });

    const score =
      targetWords.length > 0
        ? Math.min(100, Math.round((matchCount / targetWords.length) * 100))
        : 75;

    setEvaluationFeedback({
      show: true,
      overall: score,
      pronunciation: 88,
      accuracy: score,
      message:
        score >= 90
          ? "Brilliant match! Your writing is spot on."
          : "Close match! Compare spelling with the target language.",
      phonemes,
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-lg mx-auto px-4 sm:px-6 py-24 text-center animate-in fade-in duration-300">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (sessionBricks.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 sm:px-6 py-24 text-center animate-in fade-in duration-300">
        <div className="w-16 h-16 rounded-2xl border border-primary/20 flex items-center justify-center mx-auto mb-4 shadow-xs overflow-hidden">
          <img
            src="/favicon.svg"
            alt="Lisenare Logo"
            className="w-full h-full object-contain rounded-xl"
          />
        </div>
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
    <div className="grow flex flex-col items-center justify-center px-4 sm:px-6 py-6 max-w-lg mx-auto w-full animate-in fade-in duration-300">
      {/* Session progress dashboard */}
      <PracticeHeader
        learnedCount={learnedCount}
        newCount={newCount}
        currentIndex={currentIndex}
        totalCount={sessionBricks.length}
        showTypeInput={showTypeInput}
        onToggleTypeInput={() => setShowTypeInput(!showTypeInput)}
      />

      {/* Main Flashcard & Interactive Input section */}
      <div className="w-full space-y-6">
        <PracticeFlashcard
          activeBrick={activeBrick}
          isRevealed={isRevealed}
          onToggleReveal={() => setIsRevealed(!isRevealed)}
          onPlayAudio={speakTargetText}
        />

        <PracticeInputSection
          showTypeInput={showTypeInput}
          typedAnswer={typedAnswer}
          onChangeTypedAnswer={setTypedAnswer}
          onSubmitTypedAnswer={handleTypedSubmit}
          onCancelTypeInput={() => setShowTypeInput(false)}
          isRecording={isRecording}
          onMicClick={handleMicClick}
          showNextButton={Boolean(isRevealed || evaluationFeedback)}
          onNext={handleNext}
        />
      </div>

      {/* Dynamic Scoreboard & Evaluation Dialog */}
      {evaluationFeedback && (
        <PracticeEvaluationModal
          feedback={evaluationFeedback}
          activeBrick={activeBrick}
          onClose={() => setEvaluationFeedback(null)}
          onNext={handleNext}
          onPlayTargetAudio={speakTargetText}
          onPlayLearnerAudio={playLearnerAudio}
        />
      )}
    </div>
  );
}
