'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface ForecastTimelineProps {
  timeStepIndex: number;
  onChange: (index: number) => void;
}

const TIMESTEPS = [
  { label: 'T0 (Now)', short: 'Now', hours: 0, desc: 'Current Observed Field' },
  { label: 'T+12h', short: '+12h', hours: 12, desc: '+12h Medium-Range Forecast' },
  { label: 'T+24h', short: '+24h', hours: 24, desc: '+24h Medium-Range Forecast' },
  { label: 'T+36h', short: '+36h', hours: 36, desc: '+36h Peak Projection' },
  { label: 'T+48h', short: '+48h', hours: 48, desc: '+48h Track Decay/Landfall' },
  { label: 'T+72h', short: '+72h', hours: 72, desc: '+72h Long Range Track' },
];

export default function ForecastTimeline({ timeStepIndex, onChange }: ForecastTimelineProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const playRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const indexRef = useRef(timeStepIndex);

  indexRef.current = timeStepIndex;

  const stopPlayback = useCallback(() => {
    setIsPlaying(false);
    if (playRef.current) {
      clearInterval(playRef.current);
      playRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isPlaying) {
      playRef.current = setInterval(() => {
        const nextIndex = indexRef.current + 1;
        if (nextIndex >= TIMESTEPS.length) {
          stopPlayback();
          return;
        }
        onChange(nextIndex);
      }, 1500);
    } else {
      if (playRef.current) {
        clearInterval(playRef.current);
        playRef.current = null;
      }
    }
    return () => {
      if (playRef.current) {
        clearInterval(playRef.current);
        playRef.current = null;
      }
    };
  }, [isPlaying, onChange, stopPlayback]);

  function handlePlayToggle() {
    if (isPlaying) {
      stopPlayback();
      return;
    }
    if (timeStepIndex >= TIMESTEPS.length - 1) {
      onChange(0);
    }
    setIsPlaying(true);
  }

  const current = TIMESTEPS[timeStepIndex] || TIMESTEPS[0];

  return (
    <div className="flex flex-col gap-2 px-4 py-2.5 bg-[#0f131d] border-t border-slate-800 text-xs">
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <i className="bi bi-clock-history text-cyan-400 text-sm"></i>
          <span className="font-bold text-white tracking-wide text-xs">
            Medium-Range Forecast Playback (0 to 72h)
          </span>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            — {current.desc}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-cyan-300 font-bold text-xs bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
            Current Timestep: {current.label} ({current.hours === 0 ? 'Live T0' : `+${current.hours} Hours`})
          </span>
        </div>
      </div>

      {/* Controls and Clickable Steps */}
      <div className="flex items-center gap-3">
        {/* Play/Pause Button */}
        <button
          onClick={handlePlayToggle}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer flex-shrink-0 ${
            isPlaying
              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
              : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/20'
          }`}
          title={isPlaying ? 'Pause trajectory animation' : 'Play 72-hour forecast trajectory animation'}
        >
          <i className={isPlaying ? 'bi bi-pause-fill text-sm' : 'bi bi-play-fill text-sm'}></i>
          <span>{isPlaying ? 'Pause' : 'Play Track'}</span>
        </button>

        {/* Step Buttons */}
        <div className="flex items-center gap-1.5 flex-1 overflow-x-auto py-0.5">
          {TIMESTEPS.map((step, idx) => {
            const isCurrent = idx === timeStepIndex;
            return (
              <button
                key={step.label}
                onClick={() => {
                  stopPlayback();
                  onChange(idx);
                }}
                className={`flex-1 min-w-[70px] py-1.5 px-2 rounded-lg text-xs font-semibold flex flex-col items-center transition-all cursor-pointer border ${
                  isCurrent
                    ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200 shadow-md shadow-cyan-500/10'
                    : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span className="font-bold">{step.short}</span>
                <span className="text-[9px] opacity-70 font-mono">
                  {step.hours === 0 ? 'Now' : `+${step.hours}h`}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
