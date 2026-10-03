import { useState, useRef, useMemo, useEffect, type ChangeEvent } from "react";
import { Mic, Upload, Volume2, Loader2, Square } from "lucide-react";
import {
  playShortAudio,
  playBrickAudio,
  stopShortAudio,
  getAudioMediaStream,
  createMediaRecorder,
  getSupportedAudioMimeType,
} from "@/utils/audio";
import { toast } from "sonner";

interface BrickAudioSectionProps {
  audioBlob: Blob | null;
  onAudioChange: (blob: Blob | null) => void;
  existingAudioPath?: string | null;
  brickId?: number;
}

export default function BrickAudioSection({
  audioBlob,
  onAudioChange,
  existingAudioPath,
  brickId,
}: BrickAudioSectionProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      stopShortAudio();
    };
  }, []);

  const previewAudioUrl = useMemo(() => {
    return audioBlob ? URL.createObjectURL(audioBlob) : null;
  }, [audioBlob]);

  const handleRecord = async () => {
    // If audio is currently playing, stop it immediately
    if (isPlayingAudio) {
      stopShortAudio();
      setIsPlayingAudio(false);
    }

    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      try {
        const stream = await getAudioMediaStream();
        const mediaRecorder = createMediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        mediaRecorder.onstop = () => {
          const mimeType =
            mediaRecorder.mimeType ||
            getSupportedAudioMimeType() ||
            "audio/webm";
          const blob = new Blob(audioChunksRef.current, { type: mimeType });
          onAudioChange(blob);
          stream.getTracks().forEach((track) => track.stop());
        };

        mediaRecorder.start();
        setIsRecording(true);
      } catch (err: unknown) {
        console.warn("Microphone access error:", err);
        const error = err as { name?: string; message?: string };
        const msg =
          error?.name === "NotAllowedError" ||
          error?.name === "PermissionDeniedError"
            ? "Microphone permission was denied. Please allow microphone access in your browser settings."
            : error?.message || "Could not access microphone.";
        toast.error(msg);
      }
    }
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (isPlayingAudio) {
        stopShortAudio();
        setIsPlayingAudio(false);
      }
      onAudioChange(file);
    }
  };

  const handlePlayAudio = async (e?: React.MouseEvent | React.TouchEvent) => {
    e?.stopPropagation();
    if (isLoadingAudio) return;

    if (isPlayingAudio) {
      stopShortAudio();
      setIsPlayingAudio(false);
      return;
    }

    if (previewAudioUrl) {
      setIsPlayingAudio(true);
      playShortAudio(previewAudioUrl, undefined, () => setIsPlayingAudio(false));
    } else if (brickId !== undefined) {
      setIsLoadingAudio(true);
      try {
        await playBrickAudio(brickId, undefined, () => setIsPlayingAudio(false));
        setIsPlayingAudio(true);
      } catch {
        setIsPlayingAudio(false);
      } finally {
        setIsLoadingAudio(false);
      }
    } else if (existingAudioPath) {
      setIsPlayingAudio(true);
      playShortAudio(existingAudioPath, undefined, () => setIsPlayingAudio(false));
    }
  };

  const hasPlayableAudio = Boolean(
    previewAudioUrl || brickId !== undefined || existingAudioPath,
  );

  const statusTitle = audioBlob
    ? "Audio attached"
    : brickId !== undefined || existingAudioPath
      ? "Audio available"
      : "No audio";

  const statusSubtitle = isLoadingAudio
    ? "Loading audio..."
    : isPlayingAudio
      ? "Playing... tap to stop"
      : hasPlayableAudio
        ? "Tap to listen"
        : "Record or upload audio below";

  return (
    <section className="space-y-3">
      {/* Hidden Audio File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      <h2 className="text-lg font-bold font-display text-on-surface px-1">
        Target Sentence Audio
      </h2>
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-outline-variant/60 shadow-xs flex flex-col gap-4">
        {/* Playable Audio Card with generous touch target */}
        <div
          onClick={hasPlayableAudio && !isLoadingAudio ? handlePlayAudio : undefined}
          className={`flex items-center justify-between w-full rounded-2xl p-3.5 sm:p-4 border transition-all select-none touch-manipulation [-webkit-tap-highlight-color:transparent] ${
            hasPlayableAudio
              ? "bg-surface-container-low hover:bg-surface-container border-outline-variant/40 shadow-xs cursor-pointer active:scale-[0.99]"
              : "bg-surface-container-low/50 border-dashed border-outline-variant/50 cursor-default"
          }`}
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <button
              type="button"
              onClick={handlePlayAudio}
              disabled={!hasPlayableAudio || isLoadingAudio}
              className={`w-11 h-11 shrink-0 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xs touch-manipulation [-webkit-tap-highlight-color:transparent] ${
                isPlayingAudio
                  ? "bg-primary text-on-primary ring-4 ring-primary/20 scale-105"
                  : "bg-primary text-on-primary active:scale-95 hover:brightness-105"
              } disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none`}
              title={
                isLoadingAudio
                  ? "Loading audio..."
                  : isPlayingAudio
                    ? "Stop audio"
                    : "Play pronunciation"
              }
              aria-label={isPlayingAudio ? "Stop pronunciation" : "Play pronunciation"}
            >
              {isLoadingAudio ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isPlayingAudio ? (
                <Square className="w-4 h-4 fill-current" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </button>
            <div className="min-w-0">
              <div className="text-xs font-bold text-on-surface truncate">
                {statusTitle}
              </div>
              <div className="text-[11px] text-on-surface-variant truncate">
                {statusSubtitle}
              </div>
            </div>
          </div>

          {isPlayingAudio && (
            <span className="text-[10px] font-bold text-primary uppercase tracking-wider bg-primary/10 px-2 py-0.5 rounded-md shrink-0 animate-pulse">
              Playing
            </span>
          )}
        </div>

        {/* Action Buttons: Record New & Upload File */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleRecord();
            }}
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs transition-all active:scale-95 cursor-pointer touch-manipulation [-webkit-tap-highlight-color:transparent] ${
              isRecording
                ? "bg-error text-on-error"
                : "bg-primary/10 text-primary hover:bg-primary/20"
            }`}
          >
            <Mic className="w-4 h-4" />
            <span>{isRecording ? "Stop Recording" : "Record New"}</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-surface text-on-surface-variant font-bold text-xs hover:bg-surface-container transition-all active:scale-95 cursor-pointer touch-manipulation [-webkit-tap-highlight-color:transparent]"
          >
            <Upload className="w-4 h-4" />
            <span>Upload File</span>
          </button>
        </div>
      </div>
    </section>
  );
}
