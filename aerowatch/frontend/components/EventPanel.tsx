'use client'

import React, { useState, useEffect } from 'react'
import { WeatherEvent, fetchEventDetail, fetchEventDrivers } from '@/lib/api'
import { SEVERITY_BADGE_CLASSES, HAZARD_LABELS } from '@/lib/themes'
import ConfidenceIndicator from './ConfidenceIndicator'
import SHAPExplanation from './SHAPExplanation'
import RiskChart from './RiskChart'
import { 
  ShieldAlert, 
  Clock, 
  MapPin, 
  Maximize2, 
  TrendingUp, 
  Cpu, 
  Users, 
  AlertTriangle,
  ChevronRight,
  Sparkles
} from 'lucide-react'

interface EventPanelProps {
  eventId: string
  timeline: number
}

export default function EventPanel({ eventId, timeline }: EventPanelProps) {
  const [event, setEvent] = useState<WeatherEvent | null>(null)
  const [drivers, setDrivers] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'drivers' | 'impact'>('overview')
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      const [evData, drvData] = await Promise.all([
        fetchEventDetail(eventId),
        fetchEventDrivers(eventId)
      ])
      setEvent(evData)
      setDrivers(drvData)
      setLoading(false)
    }
    loadData()
  }, [eventId, timeline])

  if (loading && !event) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 font-mono text-xs space-y-2">
        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span>ACQUIRING TELEMETRY FOR {eventId}...</span>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="p-4 text-center text-gray-500 font-mono text-xs">
        NO EVENT TELEMETRY FOUND
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-[#161B22] text-[#F0F6FC] select-none font-mono">
      {/* Event Header */}
      <div className="p-3.5 border-b border-[#30363D] bg-[#0D1117]/60">
        <div className="flex items-center justify-between">
          <span className="text-xs text-blue-400 font-bold tracking-widest">{event.event_id}</span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${SEVERITY_BADGE_CLASSES[event.severity] || ''}`}>
            {event.severity}
          </span>
        </div>
        <h2 className="text-sm font-bold text-white mt-1 tracking-wide">
          {HAZARD_LABELS[event.hazard_type] || event.hazard_type.toUpperCase()}
        </h2>
        <div className="flex items-center justify-between text-[11px] text-gray-400 mt-1">
          <span>STATUS: <span className="text-emerald-400 font-semibold">{event.status}</span></span>
          <span>PERSISTENCE: <span className="text-gray-200">{event.persistence_days} DAYS</span></span>
        </div>
      </div>

      {/* Dual Key Metrics: Risk Gauge & Confidence Dial */}
      <div className="grid grid-cols-2 gap-2 p-3 border-b border-[#30363D] bg-[#0D1117]/30">
        <div className="bg-[#1F242C] p-2.5 rounded border border-[#30363D] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-400">COMPOSITE RISK</span>
            <TrendingUp className="w-3.5 h-3.5 text-red-400" />
          </div>
          <div className="flex items-baseline space-x-1 mt-1">
            <span className="text-2xl font-black text-red-400">{Math.round(event.risk_score)}</span>
            <span className="text-[10px] text-gray-400">/ 100</span>
          </div>
          <div className="w-full bg-gray-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 transition-all duration-500"
              style={{ width: `${event.risk_score}%` }}
            />
          </div>
        </div>

        <div className="bg-[#1F242C] p-2.5 rounded border border-[#30363D] flex items-center justify-between">
          <div>
            <div className="text-[10px] text-gray-400">AI CONFIDENCE</div>
            <div className="text-xl font-bold text-emerald-400 mt-0.5">
              {Math.round(event.confidence)}%
            </div>
            <div className="text-[9px] text-gray-500">XGBOOST CLF</div>
          </div>
          <ConfidenceIndicator confidence={event.confidence} size={42} />
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-[#30363D] bg-[#0D1117]/40 text-xs">
        {(['overview', 'timeline', 'drivers', 'impact'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-[11px] font-bold tracking-wider transition-all ${
              activeTab === tab
                ? 'bg-[#1F242C] text-blue-400 border-b-2 border-blue-500 shadow-sm'
                : 'text-gray-400 hover:text-gray-200 hover:bg-[#161B22]'
            }`}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {activeTab === 'overview' && (
          <div className="space-y-3 text-xs">
            {/* Spatial Footprint Card */}
            <div className="bg-[#1F242C] p-2.5 rounded border border-[#30363D] space-y-2">
              <div className="flex items-center space-x-1.5 text-blue-400 font-bold text-[11px]">
                <MapPin className="w-3.5 h-3.5" />
                <span>SPATIAL & ADMINISTRATIVE VECTOR</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-gray-400 block text-[10px]">AFFECTED AREA:</span>
                  <span className="text-gray-200 font-bold">{event.affected_area_km2.toLocaleString()} km²</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">LEAD TIME:</span>
                  <span className="text-emerald-400 font-bold">+{event.lead_time_hours} Hours</span>
                </div>
              </div>
              <div className="pt-1.5 border-t border-[#30363D]">
                <span className="text-gray-400 block text-[10px] mb-1">IMPACTED DISTRICTS:</span>
                <div className="flex flex-wrap gap-1">
                  {event.affected_districts.map((d, i) => (
                    <span key={i} className="px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800/40 text-[10px]">
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Meteorological Telemetry */}
            <div className="bg-[#1F242C] p-2.5 rounded border border-[#30363D] space-y-2">
              <div className="text-[11px] font-bold text-gray-300 flex items-center justify-between">
                <span>METEOROLOGICAL ANOMALY METRICS</span>
                <span className="text-[10px] text-gray-500">ERA5 / IMD BASELINE</span>
              </div>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between py-1 border-b border-[#21262D]">
                  <span className="text-gray-400">Peak Anomaly Score:</span>
                  <span className="text-orange-400 font-bold">{event.intensity} / 100</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#21262D]">
                  <span className="text-gray-400">Centroid Coordinates:</span>
                  <span className="text-gray-300">{event.centroid_lat.toFixed(3)}°N, {event.centroid_lon.toFixed(3)}°E</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-400">Tracking Timestep:</span>
                  <span className="text-cyan-400 font-bold">T+{timeline}h</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="space-y-3">
            <div className="text-[11px] font-bold text-gray-300">
              120-HOUR RISK & INTENSITY EVOLUTION
            </div>
            <RiskChart eventId={eventId} currentTimestep={timeline} />
          </div>
        )}

        {activeTab === 'drivers' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-[11px] font-bold text-amber-300">
                <Sparkles className="w-3.5 h-3.5" />
                <span>EXPLAINABLE AI (XAI) DRIVERS</span>
              </div>
              <span className="text-[10px] text-gray-500">{drivers?.model_version || 'XGBoost v1.2'}</span>
            </div>
            <p className="text-[10px] text-gray-400 leading-relaxed">
              SHAP attribution breakdown identifies key atmospheric anomalies driving this hazard classification:
            </p>
            <SHAPExplanation drivers={drivers?.drivers || {}} />
          </div>
        )}

        {activeTab === 'impact' && (
          <div className="space-y-3 text-xs">
            <div className="bg-red-950/30 border border-red-500/30 p-2.5 rounded">
              <div className="flex items-center space-x-1.5 text-red-400 font-bold text-[11px] mb-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>ESTIMATED EXPOSURE SUMMARY</span>
              </div>
              <div className="text-sm font-bold text-gray-200">
                ~{(event.affected_districts.length * 1.8).toFixed(1)} Million Population in Hazard Path
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] text-gray-400 font-bold">DISTRICT VULNERABILITY RANKINGS</span>
              {event.affected_districts.map((d, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded bg-[#1F242C] border border-[#30363D] text-[11px]">
                  <span className="font-semibold text-gray-300">{d}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-orange-400 font-mono">EXPOSURE: {(0.95 - i * 0.12).toFixed(2)}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
