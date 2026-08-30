'use client'

import React, { useState, useEffect } from 'react'
import C2TopBar from '@/components/C2TopBar'
import StatusCards from '@/components/StatusCards'
import WeatherMap from '@/components/WeatherMap'
import EventPanel from '@/components/EventPanel'
import Timeline from '@/components/Timeline'
import AlertCenter from '@/components/AlertCenter'
import EventTable from '@/components/EventTable'
import LayerControl from '@/components/LayerControl'
import { WeatherEvent, Alert, fetchEvents, fetchAlerts, fetchRiskSummary } from '@/lib/api'
import { LayoutGrid, Map, Table, SlidersHorizontal, ShieldAlert, Sparkles } from 'lucide-react'

export default function Dashboard() {
  const [selectedEvent, setSelectedEvent] = useState<string | null>('AW-001')
  const [timeline, setTimeline] = useState<number>(0)
  const [demoMode, setDemoMode] = useState<boolean>(true)
  const [events, setEvents] = useState<WeatherEvent[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [activeView, setActiveView] = useState<'map' | 'table' | 'split'>('split')
  const [loading, setLoading] = useState<boolean>(true)
  const [layers, setLayers] = useState({
    radar: true,
    events: true,
    heatmap: true,
    districts: true,
  })

  const loadData = async () => {
    try {
      const [evData, alData] = await Promise.all([
        fetchEvents(),
        fetchAlerts(),
      ])
      setEvents(evData)
      setAlerts(alData)
      if (evData.length > 0 && !selectedEvent) {
        setSelectedEvent(evData[0].event_id)
      }
    } catch (err) {
      console.error('Failed loading telemetry:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 30000)
    return () => clearInterval(interval)
  }, [demoMode])

  const handleLayerToggle = (layerKey: 'radar' | 'events' | 'heatmap' | 'districts') => {
    setLayers((prev) => ({ ...prev, [layerKey]: !prev[layerKey] }))
  }

  const activeEventsCount = events.length
  const highRiskCount = events.filter((e) => e.risk_score > 60).length
  const severeCount = events.filter(
    (e) => e.severity === 'SEVERE' || e.severity === 'EXTREME'
  ).length
  const affectedDistrictsCount = Array.from(
    new Set(events.flatMap((e) => e.affected_districts || []))
  ).length
  const maxRisk = events.reduce((max, e) => Math.max(max, e.risk_score || 0), 0)

  return (
    <div className="flex flex-col h-screen bg-[#0D1117] text-[#F0F6FC] overflow-hidden font-mono select-none">
      {/* 1. Military C2 Header */}
      <C2TopBar
        demoMode={demoMode}
        onDemoModeChange={setDemoMode}
        activeEventCount={activeEventsCount}
      />

      {/* 2. Top KPI Status Cards Bar */}
      <div className="px-3 py-2 bg-[#161B22] border-b border-[#30363D] z-20">
        <StatusCards
          activeEvents={activeEventsCount}
          highRiskEvents={highRiskCount}
          severeEvents={severeCount}
          affectedDistricts={affectedDistrictsCount}
          maxRisk={maxRisk}
          forecastHorizon={120}
        />
      </div>

      {/* 3. Main Center Workspace: Map + Event Intelligence Panel */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left/Center Main Tactical Map Area (70%) */}
        <div className="flex-1 relative bg-[#090D12] flex flex-col min-w-0">
          {/* Sub-header view switches & layer trigger */}
          <div className="absolute top-3 right-16 z-30 flex items-center space-x-1.5 bg-[#161B22]/90 border border-[#30363D] p-1 rounded backdrop-blur">
            <button
              onClick={() => setActiveView('split')}
              className={`p-1.5 rounded text-xs transition-colors flex items-center space-x-1 ${
                activeView === 'split' ? 'bg-blue-600 text-white font-bold' : 'text-gray-400 hover:text-gray-200'
              }`}
              title="Split Map + Panel View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setActiveView('map')}
              className={`p-1.5 rounded text-xs transition-colors flex items-center space-x-1 ${
                activeView === 'map' ? 'bg-blue-600 text-white font-bold' : 'text-gray-400 hover:text-gray-200'
              }`}
              title="Full Map View"
            >
              <Map className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setActiveView('table')}
              className={`p-1.5 rounded text-xs transition-colors flex items-center space-x-1 ${
                activeView === 'table' ? 'bg-blue-600 text-white font-bold' : 'text-gray-400 hover:text-gray-200'
              }`}
              title="Tabular Event Matrix"
            >
              <Table className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Floating Tactical Layer Control Widget */}
          <div className="absolute top-16 right-3 z-30">
            <LayerControl layers={layers} onLayerToggle={handleLayerToggle} />
          </div>

          {/* Render Active View */}
          {activeView === 'table' ? (
            <div className="flex-1 p-4 overflow-y-auto bg-[#0D1117]">
              <EventTable
                events={events}
                selectedEvent={selectedEvent}
                onEventSelect={setSelectedEvent}
              />
            </div>
          ) : (
            <WeatherMap
              events={events}
              selectedEvent={selectedEvent}
              onEventSelect={setSelectedEvent}
              timeline={timeline}
              demoMode={demoMode}
              activeLayers={layers}
            />
          )}
        </div>

        {/* Right Event Intelligence Panel (30%) */}
        {activeView !== 'map' && (
          <div className="w-[340px] lg:w-[380px] bg-[#161B22] border-l border-[#30363D] flex flex-col overflow-hidden z-20 shadow-2xl flex-shrink-0">
            {selectedEvent ? (
              <EventPanel eventId={selectedEvent} timeline={timeline} />
            ) : (
              <div className="p-6 text-center text-gray-500 my-auto text-xs">
                Select an active hazard signature on the map to initiate AI telemetry inspection.
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. Bottom Command Tray: 120H Timeline Scrubber & Real-Time Alert Desk */}
      <div className="bg-[#161B22] border-t border-[#30363D] z-30 shadow-lg">
        {/* Timeline Slider */}
        <div className="px-4 py-2 border-b border-[#30363D]">
          <Timeline
            currentTimestep={timeline}
            onTimestepChange={setTimeline}
            maxTimesteps={120}
          />
        </div>

        {/* Real-Time Operator Alert Center */}
        <AlertCenter alerts={alerts} />
      </div>
    </div>
  )
}
