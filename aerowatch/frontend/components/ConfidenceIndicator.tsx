'use client'

import React from 'react'

interface ConfidenceIndicatorProps {
  confidence: number // 0-100
  size?: number
}

export default function ConfidenceIndicator({ confidence, size = 44 }: ConfidenceIndicatorProps) {
  const strokeWidth = 4
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (confidence / 100) * circumference

  const getColor = (val: number) => {
    if (val >= 80) return '#3FB950' // green
    if (val >= 60) return '#E3B341' // yellow
    return '#F85149' // red
  }

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#30363D"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress Arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getColor(confidence)}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <span className="absolute text-[10px] font-mono font-bold text-gray-200">
        {Math.round(confidence)}%
      </span>
    </div>
  )
}
