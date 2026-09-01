import { useState } from "react";
import { type Brick, type AudioContribution } from "@/types";
import {
  ArrowLeft,
  Volume2,
  Mic,
  Users,
  ThumbsUp,
  Flag,
  CheckCircle2,
} from "lucide-react";
import AudioWaveform from "@/components/common/AudioWaveform";

interface CommunityContributionsViewProps {
  brick: Brick;
  onBack: () => void;
  onPlayAudio: (text: string) => void;
  onIncrementPoints: (pts: number) => void;
  onUpdateBrickContributions: (
    brickId: number,
    contributions: AudioContribution[],
  ) => void;
  onShowToast: (message: string) => void;
}

export default function CommunityContributionsView({
  brick,
  onBack,
  onPlayAudio,
  onIncrementPoints,
  onUpdateBrickContributions,
  onShowToast,
}: CommunityContributionsViewProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecordedAudio, setHasRecordedAudio] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [contribs, setContribs] = useState<AudioContribution[]>([]);

  const handlePlayContributionAudio = (
    contrib: AudioContribution,
    brickTargetText: string,
  ) => {
    if (playingAudioId === contrib.id) {
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
      setPlayingAudioId(null);
      return;
    }

    setPlayingAudioId(contrib.id);
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(brickTargetText);
      utterance.lang = "en-US";
      utterance.onend = () => setPlayingAudioId(null);
      utterance.onerror = () => setPlayingAudioId(null);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setPlayingAudioId(null), 2500);
    }
  };

  const handleLikeContribution = (contribId: string) => {
    const updatedContribs = contribs.map((c: AudioContribution) => {
      if (c.id !== contribId) return c;
      const isLiked = !c.isLiked;
      return {
        ...c,
        isLiked,
        likes: isLiked ? c.likes + 1 : c.likes - 1,
      };
    });
    setContribs(updatedContribs);
    onUpdateBrickContributions(brick.id, updatedContribs);
  };

  const handleReportContribution = (contribId: string) => {
    const updatedContribs = contribs.map((c: AudioContribution) => {
      if (c.id !== contribId) return c;
      return { ...c, isReported: true };
    });
    setContribs(updatedContribs);
    onUpdateBrickContributions(brick.id, updatedContribs);
    onShowToast("Contribution reported to moderators for review.");
  };

  const handleRecordUserAudio = () => {
    if (isRecording) {
      setIsRecording(false);
      setHasRecordedAudio(true);
    } else {
      setIsRecording(true);
      setTimeout(() => {
        setIsRecording(false);
        setHasRecordedAudio(true);
      }, 3000);
    }
  };

  const handleSubmitUserContribution = () => {
    if (!hasRecordedAudio) return;

    const newContrib: AudioContribution = {
      id: `user-${Date.now()}`,
      author: "Phuc Nguyen Hoang",
      avatarUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAZ8xQGTyYN6uppJ8xHs9i9fdVzEFMeLlUQyzfrM67yUrCD8cn43MEZ24cxTB_R6t2bMkO9VPLvO9IggFf-WXw4MKsPfQgr7CbvAMBaR6sG35Jm9GAsCu6M6rozDjY4OIB5iZjPbo6OK4Wq1l35CmEHwqKF7UZfhZI1UnCzvWjc36RfUobkGZxM3k2CzJ9Ldd0IruKOfTMSHt93KTYP_OjduIMt9EtAMC_TrOatTpZCoIGSU01rkctx",
      likes: 1,
      isLiked: true,
      createdAt: "Just now",
    };

    const updatedContribs = [newContrib, ...contribs];
    setContribs(updatedContribs);
    onUpdateBrickContributions(brick.id, updatedContribs);
    setHasRecordedAudio(false);
    onIncrementPoints(10);
    onShowToast("Your audio contribution has been posted! +10 XP");
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-6 pb-32 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          type="button"
          id="btn-back-discover-feed"
          onClick={onBack}
          className="p-2 -ml-2 rounded-full hover:bg-surface-container transition-all active:scale-95 cursor-pointer"
          aria-label="Back to discovery feed"
        >
          <ArrowLeft className="w-6 h-6 text-primary" />
        </button>
        <div className="text-center">
          <span className="text-[10px] font-bold text-outline uppercase tracking-wider block">
            Community Audio
          </span>
          <h1 className="text-lg font-bold font-display text-on-surface">
            Contributions
          </h1>
        </div>
        <div className="w-10"></div>
      </div>

      {/* Brick Target Phrase Summary Card */}
      <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-5 mb-6 shadow-xs space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold text-outline uppercase tracking-wider">
              Target Sentence
            </span>
            <h2 className="text-xl font-bold font-display text-primary mt-0.5">
              {brick.targetText}
            </h2>
            {brick.targetPron && (
              <p className="text-xs text-outline font-mono mt-1">
                {brick.targetPron}
              </p>
            )}
            <p className="text-xs text-on-surface-variant font-medium mt-1">
              Vietnamese:{" "}
              <span className="font-semibold text-on-surface">
                {brick.nativeText}
              </span>
            </p>
          </div>

          <button
            type="button"
            id="btn-play-standard-audio"
            onClick={() => onPlayAudio(brick.targetText)}
            className="p-3 bg-primary/10 text-primary rounded-full hover:bg-primary/20 active:scale-90 transition-all shadow-xs cursor-pointer"
            title="Listen to standard pronunciation"
            aria-label="Listen to standard pronunciation"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Contribute Your Audio Section */}
      <div className="bg-surface-container-lowest border border-primary/30 rounded-2xl p-6 mb-8 shadow-xs text-center space-y-4">
        <div className="flex items-center justify-center gap-2 text-primary font-bold text-sm">
          <Mic className="w-5 h-5" />
          <span>Contribute Your Pronunciation</span>
        </div>
        <p className="text-xs text-on-surface-variant max-w-md mx-auto">
          Record your voice reading this phrase to help fellow learners practice
          listening to different accents.
        </p>

        <div className="py-2 flex flex-col items-center">
          <AudioWaveform isRecording={isRecording} />

          <div className="mt-3 flex justify-center gap-3">
            <button
              type="button"
              id="btn-record-audio-toggle"
              onClick={handleRecordUserAudio}
              className={`px-6 py-3 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer ${
                isRecording
                  ? "bg-error text-on-error animate-pulse shadow-error/20"
                  : "bg-primary text-on-primary hover:bg-primary/90 shadow-primary/20"
              }`}
            >
              <Mic className="w-4 h-4" />
              <span>{isRecording ? "Stop Recording" : "Record Audio"}</span>
            </button>

            {hasRecordedAudio && (
              <button
                type="button"
                id="btn-publish-user-audio"
                onClick={handleSubmitUserContribution}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-xs shadow-md active:scale-95 transition-all flex items-center gap-2 animate-in zoom-in duration-200 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Publish Audio (+10 XP)</span>
              </button>
            )}
          </div>

          {hasRecordedAudio && (
            <p className="text-xs text-green-600 font-semibold mt-2">
              ✓ Recording ready! Click "Publish Audio" to share with learners.
            </p>
          )}
        </div>
      </div>

      {/* Community Audio Contributions List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-base font-bold font-display text-on-surface flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            Community Audio ({contribs.length})
          </h3>
          <span className="text-xs text-outline font-medium">
            Sorted by popularity
          </span>
        </div>

        {contribs.length === 0 ? (
          <div className="border-2 border-dashed border-outline-variant rounded-2xl p-8 text-center bg-white/50">
            <Mic className="w-10 h-10 text-outline mx-auto mb-3" />
            <p className="text-sm font-bold text-on-surface">
              No audio contributions yet
            </p>
            <p className="text-xs text-on-surface-variant max-w-xs mx-auto mt-1">
              Be the very first learner to record and contribute your voice for
              this phrase!
            </p>
          </div>
        ) : (
          contribs.map((contrib) => {
            const isPlaying = playingAudioId === contrib.id;

            return (
              <div
                key={contrib.id}
                id={`contrib-card-${contrib.id}`}
                className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-4 shadow-xs flex items-center justify-between gap-4 transition-all hover:border-primary/20"
              >
                {/* User details & audio trigger */}
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  <img
                    src={
                      contrib.avatarUrl ||
                      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120"
                    }
                    alt={contrib.author}
                    className="w-11 h-11 rounded-full object-cover border-2 border-surface-container-high shrink-0"
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-on-surface truncate">
                        {contrib.author}
                      </span>
                      <span className="text-[10px] text-outline font-medium">
                        {contrib.createdAt}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <button
                        type="button"
                        id={`btn-play-contrib-${contrib.id}`}
                        onClick={() =>
                          handlePlayContributionAudio(contrib, brick.targetText)
                        }
                        className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
                          isPlaying
                            ? "bg-primary text-on-primary shadow-xs animate-pulse"
                            : "bg-primary/10 text-primary hover:bg-primary/20"
                        }`}
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>{isPlaying ? "Playing..." : "Listen Audio"}</span>
                      </button>

                      {isPlaying && (
                        <div className="flex items-center gap-1 h-3">
                          <span className="w-1 bg-primary h-full animate-bounce"></span>
                          <span className="w-1 bg-primary h-3/4 animate-bounce delay-100"></span>
                          <span className="w-1 bg-primary h-1/2 animate-bounce delay-200"></span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Like & Report Buttons */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    id={`btn-like-contrib-${contrib.id}`}
                    onClick={() => handleLikeContribution(contrib.id)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all active:scale-90 cursor-pointer ${
                      contrib.isLiked
                        ? "bg-primary/10 text-primary"
                        : "text-outline hover:text-primary hover:bg-primary/5"
                    }`}
                    title="Like audio clip"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span>{contrib.likes}</span>
                  </button>

                  <button
                    type="button"
                    id={`btn-report-contrib-${contrib.id}`}
                    onClick={() => handleReportContribution(contrib.id)}
                    className={`p-2 rounded-full transition-all active:scale-90 cursor-pointer ${
                      contrib.isReported
                        ? "text-error bg-error/10"
                        : "text-outline hover:text-error hover:bg-error/5"
                    }`}
                    title="Report inappropriate audio"
                  >
                    <Flag className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
