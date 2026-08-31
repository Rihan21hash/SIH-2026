'use client';

import { useEffect, useState } from 'react';
import { formatTimeAgo } from '@/lib/api';
import type { SystemStatus, DataMode } from '@/types';

interface TopNavProps {
  status: SystemStatus | null;
  dataMode: DataMode;
  onModeToggle: () => void;
  backendOnline: boolean;
}

export default function TopNav({ status, dataMode, onModeToggle, backendOnline }: TopNavProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  const timeAgo = status?.last_updated ? formatTimeAgo(status.last_updated) : '—';

  return (
    <header className="fixed top-0 left-0 right-0 h-16 z-50 glass-surface border-b border-primary-container/20 flex items-center justify-between px-5"
      style={{ boxShadow: '0 4px 30px rgba(0, 240, 255, 0.04)' }}>
      
      {/* Left — Logo + Status */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          {/* Logo mark */}
          <div className="w-8 h-8 rounded-sm flex items-center justify-center relative"
            style={{ background: 'rgba(0, 240, 255, 0.1)', border: '1px solid rgba(0, 240, 255, 0.3)' }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 1L16 5.5V12.5L9 17L2 12.5V5.5L9 1Z" stroke="#00f0ff" strokeWidth="1.5" fill="none" />
              <circle cx="9" cy="9" r="2.5" fill="#00f0ff" opacity="0.8" />
              <line x1="9" y1="3" x2="9" y2="6" stroke="#00f0ff" strokeWidth="1" opacity="0.5" />
            </svg>
          </div>
          <div>
            <div className="font-mono font-bold text-primary tracking-tighter text-xl leading-none glow-cyan">
              AeroWatch
            </div>
            <div className="font-mono text-[9px] text-on-surface-variant tracking-widest uppercase mt-0.5">
              SIH26078 — Extreme Weather Intel
            </div>
          </div>
        </div>

        {/* Status chips */}
        <div className="hidden lg:flex items-center gap-2">
          <div className="status-chip" style={{
            borderColor: backendOnline ? 'rgba(0, 219, 233, 0.5)' : 'rgba(255, 68, 68, 0.5)',
            color: backendOnline ? '#00dbe9' : '#ff4444',
            background: backendOnline ? 'rgba(0, 219, 233, 0.08)' : 'rgba(255, 68, 68, 0.08)',
          }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{
              background: backendOnline ? '#00dbe9' : '#ff4444'
            }} />
            {backendOnline ? 'SYS ONLINE' : 'SYS OFFLINE'}
          </div>
          <div className="status-chip border-outline-variant text-on-surface-variant">
            CYCLE: {status?.forecast_cycle ?? '00Z'}
          </div>
          <div className="status-chip" style={{
            borderColor: dataMode === 'LIVE' ? 'rgba(0, 219, 233, 0.5)' : 'rgba(255, 136, 0, 0.5)',
            color: dataMode === 'LIVE' ? '#00dbe9' : '#ff8800',
            background: dataMode === 'LIVE' ? 'rgba(0, 219, 233, 0.08)' : 'rgba(255, 136, 0, 0.08)',
          }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{
              background: dataMode === 'LIVE' ? '#00dbe9' : '#ff8800'
            }} />
            {dataMode}
          </div>
          <div className="status-chip border-outline-variant text-on-surface-variant">
            UPD: {timeAgo}
          </div>
        </div>
      </div>

      {/* Center — Nav */}
      <nav className="hidden md:flex items-center gap-1">
        {[
          { label: 'Live Tracking', active: true },
          { label: 'Historical', active: false },
          { label: 'Risk Analysis', active: false },
          { label: 'Alerts', active: false },
        ].map(({ label, active }) => (
          <a key={label} href="#"
            className={`px-3 py-1 font-mono text-[11px] font-medium tracking-wider uppercase transition-all duration-150 rounded-sm ${
              active
                ? 'text-primary-container bg-primary-container/10 border border-primary-container/30'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high border border-transparent'
            }`}>
            {label}
          </a>
        ))}
      </nav>

      {/* Right — Actions */}
      <div className="flex items-center gap-3">
        {/* Mode toggle */}
        <button onClick={onModeToggle} className="btn-ghost text-[10px]">
          <span className="material-symbols-outlined text-sm leading-none">
            {dataMode === 'LIVE' ? 'cloud_off' : 'cloud'}
          </span>
          {dataMode === 'LIVE' ? 'Demo Mode' : 'Live Mode'}
        </button>

        {/* Deploy alert button */}
        <button className="btn-primary hidden sm:flex">
          <span className="material-symbols-outlined text-sm leading-none">warning</span>
          Deploy Alert
        </button>

        {/* Icon actions */}
        <div className="flex items-center gap-1">
          {['notifications', 'settings', 'account_circle'].map(icon => (
            <button key={icon}
              className="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:text-primary-container hover:bg-primary-container/10 rounded-sm transition-all duration-150">
              <span className="material-symbols-outlined text-[20px]">{icon}</span>
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
