'use client';

import type { WeatherEvent } from '@/types';
import { severityColor } from '@/lib/api';

interface EventListProps {
  events: WeatherEvent[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  loading?: boolean;
}

const HAZARD_ICONS: Record<string, string> = {
  CYCLONE:    'cyclone',
  FLOOD:      'water',
  HEATWAVE:   'thermostat',
  CLOUDBURST: 'thunderstorm',
  DROUGHT:    'wb_sunny',
  STORM:      'air',
  COLD_WAVE:  'ac_unit',
};

const SEV_ORDER: Record<string, number> = {
  SEVERE: 0, HIGH: 1, ELEVATED: 2, MODERATE: 3, LOW: 4
};

export default function EventList({ events, selectedId, onSelect, loading }: EventListProps) {
  const sorted = [...events].sort((a, b) => SEV_ORDER[a.severity] - SEV_ORDER[b.severity]);

  if (loading) {
    return (
      <div className="flex flex-col gap-1 p-2">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="p-3 rounded-sm shimmer h-16" />
        ))}
      </div>
    );
  }

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-32 text-center px-4">
        <span className="material-symbols-outlined text-3xl text-on-surface-variant mb-2">check_circle</span>
        <p className="font-mono text-xs text-on-surface-variant tracking-wider uppercase">No active events</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col overflow-y-auto">
      {sorted.map(event => {
        const isSelected = event.event_id === selectedId;
        const sevColor = severityColor(event.severity);
        const icon = HAZARD_ICONS[event.hazard_type] ?? 'warning';

        return (
          <button
            key={event.event_id}
            onClick={() => onSelect(event.event_id)}
            className={`w-full text-left px-3 py-2.5 border-b border-outline-variant/30 transition-all duration-150
              ${isSelected ? 'event-item-selected' : 'hover:bg-surface-container-high/50'}`}>
            
            <div className="flex items-start gap-2.5">
              {/* Severity dot */}
              <div className="mt-0.5 flex-shrink-0">
                <div className="w-6 h-6 rounded-sm flex items-center justify-center"
                  style={{ background: `${sevColor}15`, border: `1px solid ${sevColor}40` }}>
                  <span className="material-symbols-outlined text-[14px]" style={{ color: sevColor }}>
                    {icon}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <span className="font-mono text-[10px] font-semibold tracking-wider uppercase truncate"
                    style={{ color: sevColor }}>
                    {event.severity}
                  </span>
                  <span className="font-mono text-[10px] text-on-surface-variant flex-shrink-0">
                    {event.event_id.split('-').slice(-1)[0]}
                  </span>
                </div>

                <div className="font-mono text-xs text-on-surface font-medium truncate leading-tight">
                  {event.hazard_type.replace('_', ' ')}
                </div>
                <div className="font-sans text-[11px] text-on-surface-variant truncate mt-0.5">
                  {event.location.region_name}
                </div>

                {/* Risk bar */}
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="flex-1 anomaly-bar-track">
                    <div className="anomaly-bar-fill risk-bar"
                      style={{ width: `${event.risk_score}%`, background: sevColor }} />
                  </div>
                  <span className="font-mono text-[10px] flex-shrink-0" style={{ color: sevColor }}>
                    {event.risk_score}
                  </span>
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
