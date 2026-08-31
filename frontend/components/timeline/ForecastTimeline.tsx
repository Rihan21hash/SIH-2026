'use client';

import { useState, useEffect, useRef } from 'react';

interface ForecastTimelineProps {
  timeStepIndex: number;
  onChange: (index: number) => void;
}

const TIMESTEPS = [
  { label: 'NOW',   hours: 0 },
  { label: '+12h',  hours: 12 },
  { label: '+24h',  hours: 24 },
  { label: '+36h',  hours: 36 },
  { label: '+48h',  hours: 48 },
  { label: '+72h',  hours: 72 },
];

export default function ForecastTimeline({ timeStepIndex, onChange }: ForecastTimelineProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const playRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPlaying) {
      playRef.current = setInterval(() => {
        onChange((timeStepIndex + 1) % TIMESTEPS.length);
      }, 1200);
    } else {
      if (playRef.current) clearInterval(playRef.current);
    }
    return () => { if (playRef.current) clearInterval(playRef.current); };
  }, [isPlaying, timeStepIndex, onChange]);

  function handlePlay() {
    if (timeStepIndex === TIMESTEPS.length - 1) onChange(0);
    setIsPlaying(v => !v);
  }

  const current = TIMESTEPS[timeStepIndex];

  return (
    <div className="flex flex-col gap-2 px-4 py-3">
      {/* Header row */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px] text-primary-container">schedule</span>
          <span className="font-mono text-[11px] font-medium tracking-widest uppercase text-on-surface-variant">
            Forecast Timeline
          </span>
        </div>
        <div className="font-mono text-[11px] text-primary-container">
          T {current.hours === 0 ? '= Now' : `+${current.hours}h`}
        </div>
      </div>

      {/* Playback controls + scrubber */}
      <div className="flex items-center gap-3">
        {/* Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onChange(Math.max(0, timeStepIndex - 1))}
            className="w-7 h-7 flex items-center justify-center rounded-sm text-on-surface-variant
              hover:text-primary-container hover:bg-primary-container/10 transition-all duration-150">
            <span className="material-symbols-outlined text-[18px]">skip_previous</span>
          </button>
          <button
            onClick={handlePlay}
            className="w-8 h-8 flex items-center justify-center rounded-sm transition-all duration-150"
            style={{
              background: isPlaying ? 'rgba(0,240,255,0.15)' : 'rgba(0,240,255,0.08)',
              border: '1px solid rgba(0,240,255,0.3)',
              color: '#00f0ff',
            }}>
            <span className="material-symbols-outlined text-[18px]">
              {isPlaying ? 'pause' : 'play_arrow'}
            </span>
          </button>
          <button
            onClick={() => onChange(Math.min(TIMESTEPS.length - 1, timeStepIndex + 1))}
            className="w-7 h-7 flex items-center justify-center rounded-sm text-on-surface-variant
              hover:text-primary-container hover:bg-primary-container/10 transition-all duration-150">
            <span className="material-symbols-outlined text-[18px]">skip_next</span>
          </button>
        </div>

        {/* Scrubber */}
        <div className="flex-1 relative">
          <input
            type="range"
            className="timeline-range w-full"
            min={0}
            max={TIMESTEPS.length - 1}
            value={timeStepIndex}
            onChange={e => onChange(Number(e.target.value))}
          />
          {/* Step labels */}
          <div className="flex justify-between mt-1.5 pointer-events-none">
            {TIMESTEPS.map((step, i) => (
              <div key={step.label} className="flex flex-col items-center"
                style={{ width: `${100 / TIMESTEPS.length}%` }}>
                <div className="w-px h-1.5 mb-0.5"
                  style={{ background: i === timeStepIndex ? '#00f0ff' : '#3b494b' }} />
                <span className="font-mono text-[9px]"
                  style={{ color: i === timeStepIndex ? '#00dbe9' : '#849495' }}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
