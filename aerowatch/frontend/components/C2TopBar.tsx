'use client'

import React, { useState, useEffect } from 'react'
import { 
  ShieldAlert, 
  Activity, 
  Database, 
  Cpu, 
  Radio, 
  Clock, 
  RefreshCw,
  Sliders,
  Layers
} from 'lucide-react'

interface C2TopBarProps {
  demoMode: boolean
  onDemoModeChange: (enabled: boolean) => void
  activeEventCount?: number
}

export default function C2TopBar({ demoMode, onDemoModeChange, activeEventCount = 12 }: C2TopBarProps) {
  const [time, setTime] = useState<string>('')
  const [utcTime, setUtcTime] = useState<string>('')

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setTime(now.toLocaleTimeString('en-GB', { hour12: false }))
      setUtcTime(now.toUTCString().split(' ')[4] + ' UTC')
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <header className="h-14 bg-[#0D1117] border-b border-[#30363D] px-4 flex items-center justify-between select-none z-30">
      {/* Left: Branding & System ID */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded bg-blue-600/20 border border-blue-500/50 flex items-center justify-center shadow-[0_0_12px_rgba(31,111,235,0.4)]">
            <Radio className="w-4 h-4 text-blue-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono font-black tracking-wider text-base text-white">AEROWATCH</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-700/50">
                C2 OPS
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-700/40">
                SIH26078
              </span>
            </div>
            <div className="text-[10px] text-gray-400 font-mono tracking-tight">
              OPERATIONAL WEATHER INTELLIGENCE COMMAND & CONTROL
            </div>
          </div>
        </div>

        <div className="h-6 w-[1px] bg-[#30363D] mx-2 hidden md:block" />

        {/* Telemetry Status Lights */}
        <div className="hidden lg:flex items-center space-x-3 text-xs font-mono text-gray-400">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
            <span className="text-gray-300">INGESTION: LIVE</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>XGB-SHAP v1.2</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Database className="w-3.5 h-3.5 text-blue-400" />
            <span>POSTGIS: OK</span>
          </div>
        </div>
      </div>

      {/* Center: Threat Level Banner */}
      <div className="hidden md:flex items-center space-x-2 bg-red-950/40 border border-red-500/40 px-3 py-1 rounded">
        <ShieldAlert className="w-4 h-4 text-red-400 animate-bounce" />
        <span className="text-xs font-mono font-bold text-red-400 tracking-wide">
          ALERT STATUS: TIER-1 EXTREME PRECIPITATION DETECTED
        </span>
      </div>

      {/* Right: Clock & Mode Controls */}
      <div className="flex items-center space-x-4">
        {/* UTC / Local Clocks */}
        <div className="hidden sm:flex flex-col text-right font-mono">
          <div className="text-xs font-bold text-gray-200 tracking-widest flex items-center justify-end space-x-1">
            <Clock className="w-3 h-3 text-blue-400 inline" />
            <span>{time} LOCAL</span>
          </div>
          <div className="text-[10px] text-gray-400">{utcTime}</div>
        </div>

        {/* Demo Mode Pill Toggle */}
        <div className="flex items-center space-x-2 bg-[#161B22] border border-[#30363D] px-2.5 py-1 rounded">
          <span className="text-[11px] font-mono text-gray-300">DEMO SIM</span>
          <button
            onClick={() => onDemoModeChange(!demoMode)}
            className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
              demoMode ? 'bg-blue-600' : 'bg-gray-700'
            }`}
            title="Toggle between Live Feed and Demo Simulation"
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                demoMode ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
    </header>
  )
}
