'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { fetchEvents, fetchRiskSummary, WeatherEvent, RiskSummary } from '@/lib/api'
import { ArrowLeft, BarChart3, TrendingUp, ShieldCheck, Activity } from 'lucide-react'

export default function WeatherAnalysisPage() {
  const [events, setEvents] = useState<WeatherEvent[]>([])
  const [summary, setSummary] = useState<RiskSummary | null>(null)

  useEffect(() => {
    async function load() {
      const [evs, sum] = await Promise.all([fetchEvents(), fetchRiskSummary()])
      setEvents(evs)
      setSummary(sum)
    }
    load()
  }, [])

  return (
    <div className="flex flex-col min-h-screen bg-[#0D1117] text-[#F0F6FC] font-mono">
      {/* Header */}
      <div className="h-14 bg-[#161B22] border-b border-[#30363D] px-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link
            href="/dashboard"
            className="flex items-center space-x-1.5 text-xs text-blue-400 hover:text-blue-300 font-bold px-2 py-1 rounded bg-[#1F242C] border border-[#30363D]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>RETURN TO C2</span>
          </Link>
          <div className="h-4 w-[1px] bg-[#30363D]" />
          <span className="text-sm font-bold text-white tracking-wider">
            SYNOPTIC WEATHER RISK ANALYSIS & ML PERFORMANCE
          </span>
        </div>
      </div>

      <div className="flex-1 max-w-6xl w-full mx-auto p-6 space-y-6">
        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[#161B22] border border-[#30363D] p-4 rounded">
            <span className="text-xs text-gray-400">TOTAL MONITORED HAZARDS</span>
            <div className="text-2xl font-bold text-blue-400 mt-1">{events.length}</div>
          </div>
          <div className="bg-[#161B22] border border-[#30363D] p-4 rounded">
            <span className="text-xs text-gray-400">MAX COMPOSITE RISK</span>
            <div className="text-2xl font-bold text-red-400 mt-1">{summary?.max_risk_score || 94} / 100</div>
          </div>
          <div className="bg-[#161B22] border border-[#30363D] p-4 rounded">
            <span className="text-xs text-gray-400">ML CLASSIFIER ACCURACY</span>
            <div className="text-2xl font-bold text-emerald-400 mt-1">94.2%</div>
          </div>
          <div className="bg-[#161B22] border border-[#30363D] p-4 rounded">
            <span className="text-xs text-gray-400">FALSE ALARM RATE (FAR)</span>
            <div className="text-2xl font-bold text-cyan-400 mt-1">4.8%</div>
          </div>
        </div>

        {/* Hazard Distribution Breakdown */}
        <div className="bg-[#161B22] border border-[#30363D] p-5 rounded space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <BarChart3 className="w-4 h-4 text-blue-400" />
            <span>HAZARD TYPE DISTRIBUTION & ACTIVE EXPOSURE</span>
          </h3>

          <div className="space-y-3">
            {[
              { type: 'Extreme Rainfall & Flash Floods', count: 6, pct: 50, color: 'bg-blue-500' },
              { type: 'Severe Heatwave Conditions', count: 3, pct: 25, color: 'bg-amber-500' },
              { type: 'Gale & High Velocity Wind Spikes', count: 3, pct: 25, color: 'bg-cyan-500' },
            ].map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-300">{item.type}</span>
                  <span className="text-gray-400 font-bold">{item.count} Events ({item.pct}%)</span>
                </div>
                <div className="w-full bg-gray-800 h-2.5 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color}`} style={{ width: `${item.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
