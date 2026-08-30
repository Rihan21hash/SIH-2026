'use client'

import React from 'react'

interface DemoModeProps {
  demoMode: boolean
  onToggle: (enabled: boolean) => void
}

export default function DemoMode({ demoMode, onToggle }: DemoModeProps) {
  return (
    <div className="flex items-center space-x-2 font-mono text-xs">
      <span className={demoMode ? 'text-blue-400 font-bold' : 'text-gray-500'}>
        {demoMode ? 'SIMULATION MODE (ACTIVE)' : 'LIVE TELEMETRY'}
      </span>
      <button
        onClick={() => onToggle(!demoMode)}
        className={`w-8 h-4 flex items-center rounded-full p-0.5 transition-colors ${
          demoMode ? 'bg-blue-600' : 'bg-gray-700'
        }`}
      >
        <div
          className={`bg-white w-3 h-3 rounded-full shadow-md transform transition-transform ${
            demoMode ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  )
}
