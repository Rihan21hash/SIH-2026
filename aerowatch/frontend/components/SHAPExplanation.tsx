'use client'

import React from 'react'

interface SHAPDriver {
  value: number
  unit: string
  contribution: number
}

interface SHAPExplanationProps {
  drivers: Record<string, SHAPDriver>
}

const DRIVER_LABELS: Record<string, string> = {
  rainfall_anomaly_pct: 'Rainfall Anomaly',
  pressure_anomaly_hpa: 'Atmospheric Pressure Deficit',
  humidity_pct: 'Relative Humidity Saturation',
  persistence_days: 'Event Persistence Window',
  spatial_growth_rate: 'Spatial Radial Expansion',
  wind_convergence: 'Low-Level Wind Convergence',
  temperature_anomaly_c: 'Temperature Thermal Anomaly',
  consecutive_hot_days: 'Consecutive Excessive Heat Days',
  humidity_deficit: 'Dry Air Vapor Pressure Deficit',
  solar_radiation: 'Incident Solar Insolation',
  wind_speed_anomaly: 'Peak Wind Velocity Spike',
  pressure_gradient: 'Synoptic Pressure Gradient',
}

export default function SHAPExplanation({ drivers }: SHAPExplanationProps) {
  const entries = Object.entries(drivers)

  if (entries.length === 0) {
    return (
      <div className="text-gray-500 text-[11px] font-mono py-2">
        No feature importance attributions available for this timestep.
      </div>
    )
  }

  // Find max contribution for relative bar scaling
  const maxContrib = Math.max(...entries.map(([_, d]) => Math.abs(d.contribution || 0)), 0.1)

  return (
    <div className="space-y-2.5 font-mono">
      {entries.map(([key, item]) => {
        const label = DRIVER_LABELS[key] || key.replace(/_/g, ' ')
        const pctWidth = Math.min(100, (Math.abs(item.contribution) / maxContrib) * 100)
        const isPositive = item.contribution >= 0

        return (
          <div key={key} className="bg-[#1F242C] p-2 rounded border border-[#30363D] space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-gray-300 font-semibold truncate max-w-[180px]">{label}</span>
              <span className="text-amber-400 font-bold">
                {item.value > 0 ? `+${item.value}` : item.value} {item.unit}
              </span>
            </div>

            {/* Contribution Bar */}
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-gray-800 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isPositive
                      ? 'bg-gradient-to-r from-amber-500 to-red-500'
                      : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                  }`}
                  style={{ width: `${pctWidth}%` }}
                />
              </div>
              <span className="text-[10px] text-gray-400 w-12 text-right">
                +{Math.round(item.contribution * 100)}% SHAP
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
