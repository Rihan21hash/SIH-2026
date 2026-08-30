'use client'

import React, { useState, useEffect } from 'react'
import { Play, Pause, RotateCcw, FastForward, Clock, Calendar } from 'lucide-react'

interface TimelineProps {
  currentTimestep: number
  onTimestepChange: (timestep: number) => void
  maxTimesteps?: number // Default 120 (5 days at 1-hour intervals)
}

export default function Timeline({
  currentTimestep,
  onTimestepChange,
  maxTimesteps = 120,
}: TimelineProps) {
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1) // 1x, 2x, 4x

  useEffect(() => {
    let interval: any = null
    if (isPlaying) {
      interval = setInterval(() => {
        if (currentTimestep >= maxTimesteps - 1) {
          setIsPlaying(false)
          onTimestepChange(0)
        } else {
          onTimestepChange(currentTimestep + 1)
        }
      }, 1000 / playbackSpeed)
    }
    return () => clearInterval(interval)
  }, [isPlaying, playbackSpeed, maxTimesteps, currentTimestep, onTimestepChange])

  // Compute formatted forecast valid date string from timestep
  const getValidDateString = (hoursAhead: number) => {
    const base = new Date('2026-08-28T00:00:00Z')
    base.setHours(base.getHours() + hoursAhead)
    return base.toUTCString().replace(':00 GMT', ' UTC')
  }

  return (
    <div className="flex flex-col space-y-2 font-mono select-none">
      {/* Upper Controls Row */}
      <div className="flex items-center justify-between">
        {/* Play / Pause / Reset Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded text-xs font-bold transition-all shadow-sm ${
              isPlaying
                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                : 'bg-blue-600 hover:bg-blue-500 text-white'
            }`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'PAUSE FORECAST' : 'PLAY 120H SIM'}</span>
          </button>

          <button
            onClick={() => {
              setIsPlaying(false)
              onTimestepChange(0)
            }}
            className="p-1.5 rounded bg-[#161B22] border border-[#30363D] hover:bg-[#1F242C] text-gray-300 transition-colors"
            title="Reset to T+0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Speed Toggle */}
          <div className="flex items-center space-x-1 bg-[#161B22] border border-[#30363D] p-0.5 rounded text-[10px]">
            {[1, 2, 4].map((speed) => (
              <button
                key={speed}
                onClick={() => setPlaybackSpeed(speed)}
                className={`px-1.5 py-0.5 rounded transition-colors ${
                  playbackSpeed === speed
                    ? 'bg-blue-600 text-white font-bold'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>

        {/* Current Timestep Telemetry */}
        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1.5 bg-[#161B22] border border-[#30363D] px-2.5 py-1 rounded">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-gray-300">LEAD:</span>
            <span className="text-blue-400 font-bold">T+{currentTimestep}h</span>
          </div>

          <div className="hidden sm:flex items-center space-x-1.5 bg-[#161B22] border border-[#30363D] px-2.5 py-1 rounded text-gray-300 text-[11px]">
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            <span>{getValidDateString(currentTimestep)}</span>
          </div>
        </div>
      </div>

      {/* Scrubber Range Slider */}
      <div className="relative flex flex-col space-y-1">
        <input
          type="range"
          min="0"
          max={maxTimesteps - 1}
          value={currentTimestep}
          onChange={(e) => onTimestepChange(parseInt(e.target.value))}
          className="w-full h-2 bg-[#161B22] rounded-lg appearance-none cursor-pointer accent-blue-500 border border-[#30363D]"
        />

        {/* 24-hour interval tick marks */}
        <div className="flex justify-between text-[9px] text-gray-500 px-0.5">
          <span>T+0h (INIT)</span>
          <span>T+24h (DAY 1)</span>
          <span>T+48h (DAY 2)</span>
          <span>T+72h (DAY 3)</span>
          <span>T+96h (DAY 4)</span>
          <span>T+120h (DAY 5)</span>
        </div>
      </div>
    </div>
  )
}
