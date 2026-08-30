'use client'

import React from 'react'
import { AlertOctagon, Flame, CloudRain, MapPin, Gauge, Clock } from 'lucide-react'

interface StatusCardsProps {
  activeEvents: number
  highRiskEvents: number
  severeEvents: number
  affectedDistricts: number
  maxRisk: number
  forecastHorizon: number
}

export default function StatusCards({
  activeEvents,
  highRiskEvents,
  severeEvents,
  affectedDistricts,
  maxRisk,
  forecastHorizon
}: StatusCardsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
      {/* 1. Active Events */}
      <div className="bg-[#161B22] border border-[#30363D] hover:border-blue-500/50 p-2.5 rounded transition-all shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-gray-400 font-mono tracking-wider">ACTIVE HAZARDS</span>
          <CloudRain className="w-3.5 h-3.5 text-blue-400" />
        </div>
        <div className="flex items-baseline space-x-1.5 mt-1">
          <span className="text-xl font-bold font-mono text-blue-400">{activeEvents}</span>
          <span className="text-[10px] text-gray-400 font-mono">TRACKED</span>
        </div>
      </div>

      {/* 2. High Risk */}
      <div className="bg-[#161B22] border border-[#30363D] hover:border-amber-500/50 p-2.5 rounded transition-all shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-gray-400 font-mono tracking-wider">HIGH RISK (&gt;60)</span>
          <Flame className="w-3.5 h-3.5 text-amber-400" />
        </div>
        <div className="flex items-baseline space-x-1.5 mt-1">
          <span className="text-xl font-bold font-mono text-amber-400">{highRiskEvents}</span>
          <span className="text-[10px] text-amber-500/70 font-mono">ELEVATED</span>
        </div>
      </div>

      {/* 3. Severe/Extreme */}
      <div className="bg-[#161B22] border border-red-900/60 hover:border-red-500/60 p-2.5 rounded transition-all shadow-sm bg-gradient-to-b from-red-950/20 to-transparent">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-red-300 font-mono tracking-wider font-semibold">SEVERE / EXTREME</span>
          <AlertOctagon className="w-3.5 h-3.5 text-red-400 animate-pulse" />
        </div>
        <div className="flex items-baseline space-x-1.5 mt-1">
          <span className="text-xl font-bold font-mono text-red-400">{severeEvents}</span>
          <span className="text-[10px] text-red-400/80 font-mono animate-pulse">TIER-1 PRIORITY</span>
        </div>
      </div>

      {/* 4. Districts at Risk */}
      <div className="bg-[#161B22] border border-[#30363D] hover:border-cyan-500/50 p-2.5 rounded transition-all shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-gray-400 font-mono tracking-wider">DISTRICTS IN VECTOR</span>
          <MapPin className="w-3.5 h-3.5 text-cyan-400" />
        </div>
        <div className="flex items-baseline space-x-1.5 mt-1">
          <span className="text-xl font-bold font-mono text-cyan-400">{affectedDistricts}</span>
          <span className="text-[10px] text-gray-400 font-mono">ADMIN UNITS</span>
        </div>
      </div>

      {/* 5. Max Risk */}
      <div className="bg-[#161B22] border border-[#30363D] hover:border-orange-500/50 p-2.5 rounded transition-all shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-gray-400 font-mono tracking-wider">MAX RISK INDEX</span>
          <Gauge className="w-3.5 h-3.5 text-orange-400" />
        </div>
        <div className="flex items-baseline space-x-1.5 mt-1">
          <span className="text-xl font-bold font-mono text-orange-400">{Math.round(maxRisk)}</span>
          <span className="text-[10px] text-gray-400 font-mono">/ 100</span>
        </div>
      </div>

      {/* 6. Forecast Horizon */}
      <div className="bg-[#161B22] border border-[#30363D] hover:border-emerald-500/50 p-2.5 rounded transition-all shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-gray-400 font-mono tracking-wider">FORECAST LEAD</span>
          <Clock className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <div className="flex items-baseline space-x-1.5 mt-1">
          <span className="text-xl font-bold font-mono text-emerald-400">{forecastHorizon}h</span>
          <span className="text-[10px] text-emerald-500/70 font-mono">5-DAY GFS</span>
        </div>
      </div>
    </div>
  )
}
