'use client'

import React, { useState } from 'react'
import { Alert, acknowledgeAlert } from '@/lib/api'
import { SEVERITY_BADGE_CLASSES } from '@/lib/themes'
import { ShieldAlert, CheckCircle2, AlertTriangle, Bell, Clock, ChevronRight } from 'lucide-react'

interface AlertCenterProps {
  alerts: Alert[]
  onAlertAcknowledge?: (alertId: string) => void
}

export default function AlertCenter({ alerts, onAlertAcknowledge }: AlertCenterProps) {
  const [localAlerts, setLocalAlerts] = useState<Alert[]>(alerts)
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL')

  const handleAck = async (alertId: string) => {
    await acknowledgeAlert(alertId)
    setLocalAlerts((prev) =>
      prev.map((a) =>
        a.alert_id === alertId
          ? { ...a, acknowledged: true, acknowledged_by: 'C2_OPERATOR' }
          : a
      )
    )
    if (onAlertAcknowledge) onAlertAcknowledge(alertId)
  }

  const filtered = localAlerts.filter((a) => {
    if (filterSeverity === 'ALL') return true
    if (filterSeverity === 'UNACK') return !a.acknowledged
    return a.severity === filterSeverity
  })

  return (
    <div className="bg-[#161B22] p-3 font-mono text-xs select-none">
      {/* Alert Header & Filter Pills */}
      <div className="flex items-center justify-between border-b border-[#30363D] pb-2 mb-2">
        <div className="flex items-center space-x-2">
          <Bell className="w-4 h-4 text-red-400 animate-bounce" />
          <span className="font-bold text-white tracking-wider">OPERATIONAL ALERT DESK</span>
          <span className="px-1.5 py-0.5 rounded bg-red-950 text-red-300 border border-red-800/40 text-[10px]">
            {localAlerts.filter((a) => !a.acknowledged).length} UNACKNOWLEDGED
          </span>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-1 text-[10px]">
          {['ALL', 'UNACK', 'EXTREME', 'SEVERE'].map((f) => (
            <button
              key={f}
              onClick={() => setFilterSeverity(f)}
              className={`px-2 py-0.5 rounded transition-colors ${
                filterSeverity === f
                  ? 'bg-blue-600 text-white font-bold'
                  : 'bg-[#1F242C] text-gray-400 hover:text-gray-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Alert Cards List */}
      <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
        {filtered.length === 0 ? (
          <div className="text-center py-4 text-gray-500">NO ACTIVE ALERTS FOR THIS FILTER</div>
        ) : (
          filtered.map((alert) => (
            <div
              key={alert.alert_id}
              className={`p-2.5 rounded border transition-all ${
                alert.acknowledged
                  ? 'bg-[#1F242C]/50 border-[#30363D] opacity-60'
                  : 'bg-[#1F242C] border-red-900/60 hover:border-red-500/80 shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-gray-300">{alert.alert_id}</span>
                    <span className="text-gray-500">•</span>
                    <span className="text-blue-400 font-semibold">{alert.event_id}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[9px] ${
                        SEVERITY_BADGE_CLASSES[alert.severity] || ''
                      }`}
                    >
                      {alert.severity}
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-[11px]">{alert.title}</h4>
                  <p className="text-[10px] text-gray-400 line-clamp-2 leading-relaxed">
                    {alert.message}
                  </p>
                </div>

                {/* Acknowledge Button */}
                <div className="ml-3 flex flex-col items-end space-y-1 flex-shrink-0">
                  {alert.acknowledged ? (
                    <span className="flex items-center space-x-1 text-emerald-400 text-[10px]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>ACKNOWLEDGED</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => handleAck(alert.alert_id)}
                      className="px-2.5 py-1 rounded bg-red-600 hover:bg-red-500 text-white font-bold text-[10px] shadow transition-colors flex items-center space-x-1"
                    >
                      <span>ACKNOWLEDGE</span>
                    </button>
                  )}
                  <span className="text-[9px] text-gray-500">
                    LEAD: +{alert.expected_lead_time_hours}h
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
