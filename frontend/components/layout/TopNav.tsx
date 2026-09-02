'use client';

import { useEffect, useState } from 'react';
import { formatTimeAgo } from '@/lib/api';
import type { SystemStatus, DataMode } from '@/types';

interface TopNavProps {
  status: SystemStatus | null;
  dataMode: DataMode;
  onModeToggle: () => void;
  backendOnline: boolean;
  onOpenGuide?: () => void;
  onOpenAlerts?: () => void;
  alertCount?: number;
}

export default function TopNav({
  status,
  dataMode,
  onModeToggle,
  backendOnline,
  onOpenGuide,
  onOpenAlerts,
  alertCount = 0,
}: TopNavProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const timeAgo = status?.last_updated ? formatTimeAgo(status.last_updated) : 'Just now';

  return (
    <header
      suppressHydrationWarning
      className="fixed top-0 left-0 right-0 h-16 z-50 bg-[#0d111a]/95 backdrop-blur-xl border-b border-slate-800 flex items-center justify-between px-4 sm:px-6 shadow-xl"
    >
      {/* Left — Logo + Status */}
      <div className="flex items-center gap-4 sm:gap-6">
        <div className="flex items-center gap-3">
          {/* Logo mark */}
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-cyan-500/15 border border-cyan-400/40 shadow-md shadow-cyan-500/20 text-cyan-400 font-bold text-lg">
            <i className="bi bi-tornado text-cyan-400 text-lg"></i>
          </div>
          <div>
            <div className="font-bold text-white tracking-tight text-xl leading-none flex items-center gap-2">
              <span>AeroWatch</span>
              <span className="hidden sm:inline-block text-[10px] bg-cyan-500/20 text-cyan-300 font-mono px-2 py-0.5 rounded-full border border-cyan-500/30 font-semibold uppercase tracking-wider">
                SIH26078
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-medium mt-0.5 hidden sm:block">
              Extreme Weather Intelligence Command Center
            </div>
          </div>
        </div>

        {/* Status indicators */}
        <div className="hidden xl:flex items-center gap-2 text-xs">
          {/* System Online / Offline */}
          <div
            className={`px-2.5 py-1 rounded-full flex items-center gap-1.5 font-semibold text-xs border ${
              backendOnline
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                backendOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span>{backendOnline ? 'Backend Online' : 'Simulation Mode'}</span>
          </div>

          {/* Data Mode */}
          <div
            className={`px-2.5 py-1 rounded-full flex items-center gap-1.5 font-semibold text-xs border ${
              dataMode === 'LIVE'
                ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                : 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
            }`}
          >
            <i className={dataMode === 'LIVE' ? 'bi bi-broadcast text-cyan-300' : 'bi bi-cpu text-indigo-300'}></i>
            <span>{dataMode === 'LIVE' ? 'Live Meteorological Feed' : 'Demo Scenarios'}</span>
          </div>

          {/* Last Update */}
          {mounted && (
            <div className="text-slate-400 text-xs bg-slate-800/60 px-2.5 py-1 rounded-full border border-slate-700/60">
              Synced: <span className="text-slate-200 font-medium">{timeAgo}</span>
            </div>
          )}
        </div>
      </div>

      {/* Right — Actions & Guides */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Guide / Help Button */}
        <button
          onClick={onOpenGuide}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-400/40 text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
          title="Open first-time guide and scientific methodology"
        >
          <i className="bi bi-book-half"></i>
          <span className="hidden sm:inline">Quick Guide</span>
        </button>

        {/* Alerts Notification Button */}
        <button
          onClick={onOpenAlerts}
          className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/40 text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
          title="View active weather alerts"
        >
          <i className="bi bi-bell-fill"></i>
          <span className="hidden sm:inline">Alerts</span>
          {alertCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-red-500 text-white font-bold text-[10px] flex items-center justify-center shadow-md">
              {alertCount}
            </span>
          )}
        </button>

        {/* Live / Demo Mode Toggle */}
        <button
          onClick={onModeToggle}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all cursor-pointer"
          title="Switch between Live Open-Meteo data and offline Demo scenarios"
        >
          <i className={dataMode === 'LIVE' ? 'bi bi-cpu' : 'bi bi-broadcast'}></i>
          <span className="hidden md:inline">
            {dataMode === 'LIVE' ? 'Switch to Demo' : 'Switch to Live'}
          </span>
        </button>
      </div>
    </header>
  );
}
