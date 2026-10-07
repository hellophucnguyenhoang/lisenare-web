import { memo } from "react";

interface AudioWaveformProps {
  isRecording: boolean;
  audioLevels?: number[];
}

const DEFAULT_LEVELS = [40, 65, 85, 45, 90, 70, 50, 80, 60, 30];

function AudioWaveformComponent({
  isRecording,
  audioLevels = DEFAULT_LEVELS,
}: AudioWaveformProps) {
  return (
    <div className="flex items-center justify-center gap-1 h-6 my-2">
      {audioLevels.map((level, idx) => {
        const heightPercent = isRecording ? Math.max(15, Math.min(100, level)) : 20;

        return (
          <div
            key={idx}
            className={`w-1 rounded-full transition-all duration-150 ${
              isRecording ? "bg-primary shadow-xs" : "bg-outline-variant/40"
            }`}
            style={{
              height: `${heightPercent}%`,
            }}
          />
        );
      })}
    </div>
  );
}

const AudioWaveform = memo(AudioWaveformComponent);
export default AudioWaveform;
