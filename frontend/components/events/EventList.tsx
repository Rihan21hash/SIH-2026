'use client';

import { useState, useMemo } from 'react';
import type { WeatherEvent } from '@/types';
import { severityColor } from '@/lib/api';

interface EventListProps {
  events: WeatherEvent[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  loading?: boolean;
}

const HAZARD_INFO: Record<string, { label: string; icon: string }> = {
  CYCLONE:    { label: 'Tropical Cyclone', icon: 'bi bi-tornado' },
  FLOOD:      { label: 'Flash Flood Risk', icon: 'bi bi-water' },
  HEATWAVE:   { label: 'Severe Heatwave', icon: 'bi bi-sun-fill' },
  CLOUDBURST: { label: 'Himalayan Cloudburst', icon: 'bi bi-cloud-lightning-rain-fill' },
  DROUGHT:    { label: 'Drought Stress', icon: 'bi bi-brightness-high-fill' },
  STORM:      { label: 'Severe Gale / Storm', icon: 'bi bi-wind' },
  COLD_WAVE:  { label: 'Extreme Cold Wave', icon: 'bi bi-snow' },
};

const SEV_ORDER: Record<string, number> = {
  SEVERE: 0, HIGH: 1, ELEVATED: 2, MODERATE: 3, LOW: 4
};

export default function EventList({ events, selectedId, onSelect, loading }: EventListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sevFilter, setSevFilter] = useState<string>('ALL');

  const filteredEvents = useMemo(() => {
    return events
      .filter(e => {
        if (sevFilter !== 'ALL' && e.severity !== sevFilter) return false;
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          e.hazard_type.toLowerCase().includes(q) ||
          e.location.state.toLowerCase().includes(q) ||
          (e.location.district && e.location.district.toLowerCase().includes(q)) ||
          e.event_id.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => SEV_ORDER[a.severity] - SEV_ORDER[b.severity]);
  }, [events, searchQuery, sevFilter]);

  if (loading) {
    return (
      <div className="flex flex-col gap-2 p-3">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="p-3 rounded-lg bg-slate-800/40 animate-pulse h-16 border border-slate-700/40" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#0c1017]">
      {/* Search & Filter Header */}
      <div className="p-3 border-b border-slate-800 flex flex-col gap-2 bg-[#10141e]">
        {/* Search input */}
        <div className="relative">
          <i className="bi bi-search absolute left-2.5 top-2 text-slate-400 text-xs"></i>
          <input
            type="text"
            placeholder="Search state, district, hazard..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-7 pr-3 py-1.5 bg-slate-900/90 text-xs text-slate-200 placeholder-slate-500 rounded-lg border border-slate-700 focus:outline-none focus:border-cyan-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1.5 text-slate-400 hover:text-white text-xs"
            >
              <i className="bi bi-x-lg"></i>
            </button>
          )}
        </div>

        {/* Severity Filter Chips */}
        <div className="flex items-center gap-1 text-[11px]">
          {[
            { id: 'ALL', label: 'All', icon: '' },
            { id: 'SEVERE', label: 'Severe', icon: 'bi bi-exclamation-octagon-fill text-red-400' },
            { id: 'HIGH', label: 'High', icon: 'bi bi-exclamation-triangle-fill text-amber-400' },
            { id: 'MODERATE', label: 'Mod', icon: 'bi bi-info-circle-fill text-sky-400' },
          ].map(chip => (
            <button
              key={chip.id}
              onClick={() => setSevFilter(chip.id)}
              className={`px-2 py-0.5 rounded-md font-medium transition-all flex items-center gap-1 ${
                sevFilter === chip.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent'
              }`}
            >
              {chip.icon && <i className={chip.icon}></i>}
              <span>{chip.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Events List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-850">
        {filteredEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6 text-center text-slate-400">
            <i className="bi bi-search text-2xl mb-1 text-slate-500"></i>
            <p className="text-xs font-semibold text-slate-300">No matching events found</p>
            <p className="text-[11px] text-slate-500 mt-1">Try changing search or severity filter</p>
          </div>
        ) : (
          filteredEvents.map(event => {
            const isSelected = event.event_id === selectedId;
            const sevColor = severityColor(event.severity);
            const info = HAZARD_INFO[event.hazard_type] || { label: event.hazard_type, icon: 'bi bi-exclamation-triangle-fill' };

            return (
              <button
                key={event.event_id}
                onClick={() => onSelect(event.event_id)}
                className={`w-full text-left p-3 transition-all cursor-pointer relative ${
                  isSelected
                    ? 'bg-cyan-500/10 border-l-3 border-cyan-400 shadow-inner'
                    : 'hover:bg-slate-800/40 border-l-3 border-transparent'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <i className={`${info.icon} text-base flex-shrink-0`} style={{ color: sevColor }}></i>
                    <div className="font-bold text-xs text-white truncate">
                      {info.label}
                    </div>
                  </div>
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.2 rounded font-mono uppercase flex-shrink-0"
                    style={{ background: `${sevColor}20`, color: sevColor, border: `1px solid ${sevColor}40` }}
                  >
                    {event.severity}
                  </span>
                </div>

                <div className="text-[11px] text-slate-400 flex items-center gap-1 mb-2">
                  <i className="bi bi-geo-alt-fill text-slate-500 text-[11px]"></i>
                  <span className="truncate">{event.location.district ? `${event.location.district}, ` : ''}{event.location.state}</span>
                </div>

                {/* Risk Progress Bar */}
                <div className="flex items-center justify-between gap-2 text-[10px]">
                  <div className="flex-1 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${event.risk_score}%`, background: sevColor }}
                    />
                  </div>
                  <span className="font-mono font-bold text-slate-300" style={{ color: sevColor }}>
                    {event.risk_score}/100
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Footer stats */}
      <div className="p-2 border-t border-slate-800 bg-[#10141e] text-[10px] font-mono text-slate-500 flex justify-between px-3">
        <span>Showing {filteredEvents.length} of {events.length}</span>
        <span className="text-cyan-400 font-semibold">Click target to inspect</span>
      </div>
    </div>
  );
}
