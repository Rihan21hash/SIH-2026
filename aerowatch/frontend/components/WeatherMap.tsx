'use client'

import React, { useEffect, useRef, useState } from 'react'
import { WeatherEvent } from '@/lib/api'
import { SEVERITY_BADGE_CLASSES, HAZARD_LABELS } from '@/lib/themes'
import { 
  Maximize2, 
  ZoomIn, 
  ZoomOut, 
  Layers, 
  Compass, 
  Flame, 
  CloudRain, 
  Wind, 
  Eye, 
  Activity,
  Crosshair
} from 'lucide-react'

interface WeatherMapProps {
  events: WeatherEvent[]
  selectedEvent: string | null
  onEventSelect: (eventId: string) => void
  timeline: number
  demoMode: boolean
  activeLayers?: {
    radar: boolean
    events: boolean
    heatmap: boolean
    districts: boolean
  }
}

export default function WeatherMap({
  events,
  selectedEvent,
  onEventSelect,
  timeline,
  demoMode,
  activeLayers = { radar: true, events: true, heatmap: true, districts: true }
}: WeatherMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const [zoomLevel, setZoomLevel] = useState<number>(5)
  const [hoveredEvent, setHoveredEvent] = useState<WeatherEvent | null>(null)
  const [radarSweepAngle, setRadarSweepAngle] = useState<number>(0)

  // Map coordinates projection parameters for India
  // Lat: 6 to 36, Lon: 68 to 98
  const projectToMap = (lat: number, lon: number) => {
    const minLat = 6.0, maxLat = 37.0
    const minLon = 67.0, maxLon = 98.0
    const xPct = ((lon - minLon) / (maxLon - minLon)) * 100
    const yPct = ((maxLat - lat) / (maxLat - minLat)) * 100
    return { x: Math.max(5, Math.min(95, xPct)), y: Math.max(5, Math.min(95, yPct)) }
  }

  // Tactical radar sweep animation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setRadarSweepAngle((prev) => (prev + 3) % 360)
    }, 40)
    return () => clearInterval(interval)
  }, [])

  return (
    <div 
      ref={mapContainerRef}
      className="relative w-full h-full bg-[#090D12] overflow-hidden select-none border-r border-[#30363D]"
    >
      {/* Background Cartographic Grid & Coordinates */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, #30363D 1px, transparent 1px),
            linear-gradient(to bottom, #30363D 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Stylized India Subcontinent Outline & Regional Meshes */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
        <defs>
          <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1F6FEB" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#1F6FEB" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient Geographic Grid Lines */}
        <line x1="20%" y1="0%" x2="20%" y2="100%" stroke="#1F6FEB" strokeWidth="0.5" strokeDasharray="4,4" opacity="0.3" />
        <line x1="50%" y1="0%" x2="50%" y2="100%" stroke="#1F6FEB" strokeWidth="0.5" strokeDasharray="4,4" opacity="0.3" />
        <line x1="80%" y1="0%" x2="80%" y2="100%" stroke="#1F6FEB" strokeWidth="0.5" strokeDasharray="4,4" opacity="0.3" />
        <line x1="0%" y1="30%" x2="100%" y2="30%" stroke="#1F6FEB" strokeWidth="0.5" strokeDasharray="4,4" opacity="0.3" />
        <line x1="0%" y1="65%" x2="100%" y2="65%" stroke="#1F6FEB" strokeWidth="0.5" strokeDasharray="4,4" opacity="0.3" />

        {/* Approximate Peninsular Coastline Reference Lines */}
        <path
          d="M 28% 18% Q 40% 12% 60% 18% T 82% 28% Q 78% 45% 72% 58% T 50% 88% Q 36% 70% 30% 50% Z"
          fill="url(#radarGlow)"
          stroke="#388BFD"
          strokeWidth="1.5"
          strokeDasharray="6,4"
          opacity="0.5"
        />
      </svg>

      {/* Radar Sweep Overlay */}
      {activeLayers.radar && (
        <div 
          className="absolute inset-0 pointer-events-none opacity-25 overflow-hidden"
          style={{
            background: `conic-gradient(from ${radarSweepAngle}deg at 50% 50%, rgba(56, 139, 253, 0.25) 0deg, transparent 45deg, transparent 360deg)`
          }}
        />
      )}

      {/* Render Weather Hazard Event Polygons and Pulsing Centroids */}
      {events.map((event) => {
        const coords = projectToMap(event.centroid_lat, event.centroid_lon)
        const isSelected = selectedEvent === event.event_id
        const isExtreme = event.severity === 'EXTREME' || event.severity === 'SEVERE'
        
        // Compute radius based on affected area
        const radius = Math.max(28, Math.min(80, Math.sqrt(event.affected_area_km2) * 0.45))

        return (
          <div
            key={event.event_id}
            onClick={() => onEventSelect(event.event_id)}
            onMouseEnter={() => setHoveredEvent(event)}
            onMouseLeave={() => setHoveredEvent(null)}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
            style={{ left: `${coords.x}%`, top: `${coords.y}%` }}
          >
            {/* Outer Hazard Footprint Buffer Zone */}
            <div
              className={`rounded-full transition-all duration-500 flex items-center justify-center ${
                isSelected
                  ? 'border-2 border-blue-400 bg-blue-500/20 shadow-[0_0_30px_rgba(56,139,253,0.6)] scale-110'
                  : isExtreme
                  ? 'border border-red-500/60 bg-red-500/15 shadow-[0_0_20px_rgba(248,81,73,0.4)]'
                  : 'border border-amber-500/40 bg-amber-500/10'
              }`}
              style={{
                width: `${radius * 2}px`,
                height: `${radius * 2}px`,
              }}
            >
              {/* Animated Pulse Ring */}
              <div 
                className={`absolute inset-0 rounded-full border ${
                  isExtreme ? 'border-red-500/80 animate-ping' : 'border-blue-400/50'
                }`}
                style={{ animationDuration: isExtreme ? '2.5s' : '4s' }}
              />

              {/* Centroid Tactical Node */}
              <div className={`w-6 h-6 rounded-full flex items-center justify-center shadow-lg transition-transform group-hover:scale-125 ${
                isExtreme ? 'bg-red-600 text-white shadow-red-900/80' : 'bg-blue-600 text-white shadow-blue-900/80'
              }`}>
                {event.hazard_type === 'heatwave' ? (
                  <Flame className="w-3.5 h-3.5" />
                ) : event.hazard_type === 'extreme_wind' ? (
                  <Wind className="w-3.5 h-3.5" />
                ) : (
                  <CloudRain className="w-3.5 h-3.5" />
                )}
              </div>
            </div>

            {/* Tactical Callout Label */}
            <div className={`absolute top-full mt-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider pointer-events-none transition-all shadow-md ${
              isSelected
                ? 'bg-blue-600 text-white ring-1 ring-blue-300'
                : isExtreme
                ? 'bg-red-950/90 text-red-300 border border-red-500/60'
                : 'bg-gray-900/90 text-gray-200 border border-gray-700'
            }`}>
              {event.event_id} • {Math.round(event.risk_score)}R
            </div>
          </div>
        )
      })}

      {/* Floating Tactical Tooltip on Hover */}
      {hoveredEvent && (
        <div 
          className="absolute pointer-events-none z-40 bg-[#161B22]/95 border border-[#30363D] p-3 rounded shadow-2xl backdrop-blur-md font-mono text-xs w-64"
          style={{
            left: `calc(${projectToMap(hoveredEvent.centroid_lat, hoveredEvent.centroid_lon).x}% + 35px)`,
            top: `calc(${projectToMap(hoveredEvent.centroid_lat, hoveredEvent.centroid_lon).y}% - 40px)`
          }}
        >
          <div className="flex items-center justify-between border-b border-[#30363D] pb-1.5 mb-2">
            <span className="font-bold text-white tracking-wider">{hoveredEvent.event_id}</span>
            <span className={`px-1.5 py-0.2 rounded text-[9px] ${SEVERITY_BADGE_CLASSES[hoveredEvent.severity] || ''}`}>
              {hoveredEvent.severity}
            </span>
          </div>
          <div className="space-y-1 text-[11px] text-gray-300">
            <div className="flex justify-between">
              <span className="text-gray-400">TYPE:</span>
              <span className="text-blue-300 font-semibold">{HAZARD_LABELS[hoveredEvent.hazard_type] || hoveredEvent.hazard_type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">RISK INDEX:</span>
              <span className="text-red-400 font-bold">{hoveredEvent.risk_score} / 100</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">AREA:</span>
              <span>{hoveredEvent.affected_area_km2.toLocaleString()} km²</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">LEAD TIME:</span>
              <span className="text-emerald-400">+{hoveredEvent.lead_time_hours}h</span>
            </div>
            <div className="text-[10px] text-gray-400 pt-1 border-t border-[#21262D]">
              REGIONS: {hoveredEvent.affected_districts.slice(0, 3).join(', ')}
            </div>
          </div>
        </div>
      )}

      {/* On-Map HUD Controls & Legend */}
      <div className="absolute top-3 left-3 z-30 flex flex-col space-y-2">
        <div className="bg-[#161B22]/90 border border-[#30363D] p-2 rounded backdrop-blur text-[10px] font-mono text-gray-300 space-y-1 shadow-lg">
          <div className="font-bold text-white flex items-center space-x-1 mb-1">
            <Compass className="w-3 h-3 text-blue-400" />
            <span>GEO SECTOR: INDIA REGIONAL (IMD/GFS)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block" />
            <span>EXTREME / SEVERE (80-100)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
            <span>WARNING / WATCH (40-79)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            <span>NORMAL BASELINE (&lt;40)</span>
          </div>
        </div>
      </div>

      {/* Map Zoom / Recenter HUD Actions */}
      <div className="absolute top-3 right-3 z-30 flex flex-col space-y-1.5 bg-[#161B22]/90 border border-[#30363D] p-1 rounded backdrop-blur">
        <button 
          onClick={() => setZoomLevel(z => Math.min(z + 1, 10))}
          className="p-1.5 hover:bg-[#30363D] text-gray-300 rounded transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button 
          onClick={() => setZoomLevel(z => Math.max(z - 1, 3))}
          className="p-1.5 hover:bg-[#30363D] text-gray-300 rounded transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button 
          onClick={() => onEventSelect(events[0]?.event_id || 'AW-001')}
          className="p-1.5 hover:bg-[#30363D] text-blue-400 rounded transition-colors"
          title="Center on Highest Priority Threat"
        >
          <Crosshair className="w-4 h-4" />
        </button>
      </div>

      {/* Lat/Lon Cursor Coordinate Bar */}
      <div className="absolute bottom-2 left-3 z-30 font-mono text-[10px] text-gray-400 bg-[#161B22]/80 px-2 py-0.5 rounded border border-[#30363D]">
        PROJECTION: EPSG:4326 • GRID: 0.25° • RADAR: ACTIVE ({timeline}h TIMESTEP)
      </div>
    </div>
  )
}
