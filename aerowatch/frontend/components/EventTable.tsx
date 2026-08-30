'use client'

import React from 'react'
import { WeatherEvent } from '@/lib/api'
import { SEVERITY_BADGE_CLASSES, HAZARD_LABELS } from '@/lib/themes'

interface EventTableProps {
  events: WeatherEvent[]
  selectedEvent: string | null
  onEventSelect: (eventId: string) => void
}

export default function EventTable({ events, selectedEvent, onEventSelect }: EventTableProps) {
  return (
    <div className="w-full overflow-x-auto font-mono text-xs select-none">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-[#30363D] bg-[#0D1117] text-gray-400 text-[10px]">
            <th className="py-2 px-3 font-semibold">EVENT ID</th>
            <th className="py-2 px-3 font-semibold">HAZARD TYPE</th>
            <th className="py-2 px-3 font-semibold">SEVERITY</th>
            <th className="py-2 px-3 font-semibold">RISK INDEX</th>
            <th className="py-2 px-3 font-semibold">CONFIDENCE</th>
            <th className="py-2 px-3 font-semibold">AFFECTED AREA</th>
            <th className="py-2 px-3 font-semibold">LEAD TIME</th>
            <th className="py-2 px-3 font-semibold">PRIMARY STATE</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#21262D]">
          {events.map((e) => {
            const isSelected = selectedEvent === e.event_id
            return (
              <tr
                key={e.event_id}
                onClick={() => onEventSelect(e.event_id)}
                className={`cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-blue-950/40 text-blue-200 border-l-2 border-blue-500'
                    : 'hover:bg-[#1F242C] text-gray-300'
                }`}
              >
                <td className="py-2 px-3 font-bold text-blue-400">{e.event_id}</td>
                <td className="py-2 px-3 font-semibold">{HAZARD_LABELS[e.hazard_type] || e.hazard_type}</td>
                <td className="py-2 px-3">
                  <span className={`px-1.5 py-0.2 rounded text-[9px] ${SEVERITY_BADGE_CLASSES[e.severity] || ''}`}>
                    {e.severity}
                  </span>
                </td>
                <td className="py-2 px-3 font-bold text-red-400">{Math.round(e.risk_score)} / 100</td>
                <td className="py-2 px-3 text-emerald-400">{Math.round(e.confidence)}%</td>
                <td className="py-2 px-3">{e.affected_area_km2.toLocaleString()} km²</td>
                <td className="py-2 px-3 text-cyan-400">+{e.lead_time_hours}h</td>
                <td className="py-2 px-3 text-gray-400">{e.affected_states[0] || 'N/A'}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
