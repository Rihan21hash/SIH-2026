'use client'

import React, { useMemo } from 'react'

interface RiskChartProps {
  eventId: string
  currentTimestep: number
}

export default function RiskChart({ eventId, currentTimestep }: RiskChartProps) {
  // Generate 120-hour synthetic curve based on eventId
  const data = useMemo(() => {
    const points = []
    const baseRisk = eventId === 'AW-001' ? 94 : eventId === 'AW-002' ? 82 : 70
    for (let t = 0; t <= 120; t += 4) {
      const phase = t / 120.0
      let r = baseRisk * (0.35 + 0.65 * Math.sin(phase * Math.PI))
      r += (Math.sin(t * 0.5) * 3)
      points.push({
        hour: t,
        risk: Math.max(10, Math.min(100, Math.round(r))),
        intensity: Math.max(10, Math.min(100, Math.round(r * 0.92)))
      })
    }
    return points
  }, [eventId])

  // SVG Chart Dimensions
  const width = 340
  const height = 150
  const padding = { top: 15, right: 15, bottom: 25, left: 30 }

  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom

  const getX = (hour: number) => padding.left + (hour / 120) * chartWidth
  const getY = (val: number) => padding.top + (1 - val / 100) * chartHeight

  // Generate SVG path strings
  const riskPath = data.reduce((acc, pt, i) => {
    const cmd = i === 0 ? 'M' : 'L'
    return `${acc} ${cmd} ${getX(pt.hour)} ${getY(pt.risk)}`
  }, '')

  const riskArea = `${riskPath} L ${getX(120)} ${getY(0)} L ${getX(0)} ${getY(0)} Z`

  const currentX = getX(currentTimestep)

  return (
    <div className="bg-[#1F242C] p-2.5 rounded border border-[#30363D] font-mono">
      <div className="flex items-center justify-between text-[10px] text-gray-400 mb-2">
        <div className="flex items-center space-x-3">
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
            <span className="text-gray-300">Composite Risk</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
            <span className="text-gray-300">Hazard Anomaly</span>
          </span>
        </div>
        <span className="text-cyan-400 font-bold">T+{currentTimestep}h ACTIVE</span>
      </div>

      {/* SVG Vector Chart */}
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        <defs>
          <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F85149" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#F85149" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[20, 40, 60, 80, 100].map(val => (
          <g key={val}>
            <line
              x1={padding.left}
              y1={getY(val)}
              x2={width - padding.right}
              y2={getY(val)}
              stroke="#30363D"
              strokeDasharray="2,2"
              strokeWidth="0.8"
            />
            <text
              x={padding.left - 4}
              y={getY(val) + 3}
              textAnchor="end"
              fill="#6E7681"
              fontSize="8"
            >
              {val}
            </text>
          </g>
        ))}

        {/* X Axis Ticks */}
        {[0, 24, 48, 72, 96, 120].map(h => (
          <g key={h}>
            <text
              x={getX(h)}
              y={height - 8}
              textAnchor="middle"
              fill="#6E7681"
              fontSize="8"
            >
              +{h}h
            </text>
          </g>
        ))}

        {/* Area fill */}
        <path d={riskArea} fill="url(#riskGrad)" />

        {/* Line */}
        <path d={riskPath} fill="none" stroke="#F85149" strokeWidth="2" strokeLinecap="round" />

        {/* Current Time Cursor Line */}
        <line
          x1={currentX}
          y1={padding.top}
          x2={currentX}
          y2={height - padding.bottom}
          stroke="#58A6FF"
          strokeWidth="1.5"
          strokeDasharray="3,2"
        />
        <circle cx={currentX} cy={getY(data.find(d => Math.abs(d.hour - currentTimestep) < 4)?.risk || 50)} r="4" fill="#58A6FF" />
      </svg>
    </div>
  )
}
