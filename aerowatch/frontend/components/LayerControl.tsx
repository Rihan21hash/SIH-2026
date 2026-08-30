'use client'

import React from 'react'
import { Layers, Eye, EyeOff } from 'lucide-react'

interface LayerControlProps {
  layers: {
    radar: boolean
    events: boolean
    heatmap: boolean
    districts: boolean
  }
  onLayerToggle: (layerKey: 'radar' | 'events' | 'heatmap' | 'districts') => void
}

export default function LayerControl({ layers, onLayerToggle }: LayerControlProps) {
  return (
    <div className="bg-[#161B22]/90 border border-[#30363D] p-2 rounded backdrop-blur font-mono text-[11px] space-y-1.5 shadow-lg select-none">
      <div className="flex items-center space-x-1.5 text-gray-300 font-bold border-b border-[#30363D] pb-1">
        <Layers className="w-3.5 h-3.5 text-blue-400" />
        <span>MAP LAYERS</span>
      </div>

      <div className="space-y-1">
        {[
          { key: 'radar' as const, label: 'Doppler Radar Scan' },
          { key: 'events' as const, label: 'Threat Polygons' },
          { key: 'heatmap' as const, label: 'Anomaly Heatmap' },
          { key: 'districts' as const, label: 'District Vectors' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => onLayerToggle(key)}
            className={`w-full flex items-center justify-between px-2 py-1 rounded transition-colors ${
              layers[key]
                ? 'bg-blue-950/60 text-blue-300 border border-blue-800/40'
                : 'text-gray-500 hover:text-gray-400'
            }`}
          >
            <span>{label}</span>
            {layers[key] ? <Eye className="w-3 h-3 text-blue-400" /> : <EyeOff className="w-3 h-3 text-gray-600" />}
          </button>
        ))}
      </div>
    </div>
  )
}
