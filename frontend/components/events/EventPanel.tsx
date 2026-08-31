'use client';

import type { WeatherEvent } from '@/types';
import { severityColor, riskColor } from '@/lib/api';

interface EventPanelProps {
  event: WeatherEvent | null;
  loading?: boolean;
}

function DriverRow({ label, value, unit, max = 100, color }: {
  label: string; value: number; unit: string; max?: number; color: string;
}) {
  const pct = Math.min(100, Math.abs(value) / max * 100);
  const displayVal = value >= 0 ? `+${value}${unit}` : `${value}${unit}`;
  return (
    <div className="py-2 border-b border-outline-variant/30 last:border-0">
      <div className="flex items-center justify-between mb-1.5">
        <span className="font-sans text-[12px] text-on-surface-variant">{label}</span>
        <span className="font-mono text-[12px] font-semibold" style={{ color }}>{displayVal}</span>
      </div>
      <div className="anomaly-bar-track">
        <div className="anomaly-bar-fill"
          style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-outline-variant/20 last:border-0">
      <span className="font-mono text-[10px] font-medium tracking-widest uppercase text-on-surface-variant">{label}</span>
      <span className="font-mono text-[12px] text-on-surface">{value}</span>
    </div>
  );
}

export default function EventPanel({ event, loading }: EventPanelProps) {
  if (loading) {
    return (
      <div className="flex flex-col h-full p-4 gap-4">
        {[80, 40, 60, 100, 60].map((w, i) => (
          <div key={i} className="shimmer rounded h-4" style={{ width: `${w}%` }} />
        ))}
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6">
        <div className="w-12 h-12 rounded-sm flex items-center justify-center mb-4"
          style={{ background: 'rgba(0,219,233,0.08)', border: '1px solid rgba(0,219,233,0.2)' }}>
          <span className="material-symbols-outlined text-2xl" style={{ color: '#00dbe9' }}>touch_app</span>
        </div>
        <p className="font-mono text-xs text-on-surface-variant tracking-wider uppercase mb-1">
          Select an Event
        </p>
        <p className="font-sans text-[12px] text-on-surface-variant/60">
          Click on a map marker or list item to view event intelligence
        </p>
      </div>
    );
  }

  const sevColor = severityColor(event.severity);
  const rCol = riskColor(event.risk_score);
  const d = event.anomaly_drivers;

  const startDate = new Date(event.start_time);
  const startStr = startDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="px-4 py-3 border-b border-outline-variant/30"
        style={{ background: `linear-gradient(135deg, ${sevColor}08, transparent)` }}>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-[10px] font-semibold tracking-widest uppercase px-1.5 py-0.5 rounded-sm"
                style={{ color: sevColor, background: `${sevColor}15`, border: `1px solid ${sevColor}30` }}>
                {event.severity}
              </span>
              <span className="font-mono text-[10px] text-on-surface-variant">{event.event_id}</span>
            </div>
            <div className="font-mono text-sm font-bold text-on-surface">
              {event.hazard_type.replace(/_/g, ' ')}
            </div>
            <div className="font-sans text-[12px] text-on-surface-variant mt-0.5">
              {event.location.region_name}
            </div>
          </div>

          {/* Risk gauge */}
          <div className="flex flex-col items-center flex-shrink-0">
            <div className="w-12 h-12 rounded-sm flex items-center justify-center relative"
              style={{ background: `${rCol}12`, border: `1px solid ${rCol}30` }}>
              <span className="kpi-value text-lg" style={{ color: rCol }}>{event.risk_score}</span>
            </div>
            <span className="font-mono text-[9px] text-on-surface-variant mt-1 tracking-wider uppercase">Risk</span>
          </div>
        </div>

        {/* Confidence bar */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-on-surface-variant tracking-wider uppercase">
            Confidence
          </span>
          <div className="flex-1 anomaly-bar-track">
            <div className="anomaly-bar-fill" style={{ width: `${event.confidence}%`, background: '#00dbe9' }} />
          </div>
          <span className="font-mono text-[11px] text-primary-container">{event.confidence}%</span>
        </div>
      </div>

      {/* Metadata */}
      <div className="px-4 py-3 border-b border-outline-variant/20">
        <MetaRow label="Hazard" value={event.hazard_type.replace(/_/g, ' ')} />
        <MetaRow label="Location" value={`${event.location.state}${event.location.district ? ` — ${event.location.district}` : ''}`} />
        <MetaRow label="Start" value={startStr} />
        <MetaRow label="Duration" value={`~${event.expected_duration_hours}h`} />
        <MetaRow label="Area" value={`${event.affected_area_km2.toLocaleString()} km²`} />
        <MetaRow label="Districts" value={`${event.affected_districts.length} affected`} />
        {event.movement_direction && (
          <MetaRow label="Movement" value={`${event.movement_direction} at ${event.movement_speed_kmh} km/h`} />
        )}
        <MetaRow label="Growth" value={`+${event.growth_rate_pct}% / 24h`} />
        <MetaRow label="Lead Time" value={`${event.forecast_lead_hours}h`} />
      </div>

      {/* Affected districts */}
      <div className="px-4 py-3 border-b border-outline-variant/20">
        <div className="font-mono text-[10px] font-medium tracking-widest uppercase text-on-surface-variant mb-2">
          Affected Districts
        </div>
        <div className="flex flex-wrap gap-1">
          {event.affected_districts.map(d2 => (
            <span key={d2} className="font-mono text-[10px] px-1.5 py-0.5 rounded-sm text-on-surface-variant"
              style={{ background: 'rgba(59,73,75,0.3)', border: '1px solid rgba(59,73,75,0.5)' }}>
              {d2}
            </span>
          ))}
        </div>
      </div>

      {/* Anomaly drivers */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-2 mb-3">
          <span className="material-symbols-outlined text-[14px]" style={{ color: '#00dbe9' }}>info</span>
          <span className="font-mono text-[10px] font-medium tracking-widest uppercase text-on-surface-variant">
            Why Was This Event Flagged?
          </span>
        </div>
        <DriverRow
          label="Rainfall Anomaly"
          value={d.rainfall_anomaly_pct}
          unit="%"
          max={400}
          color={d.rainfall_anomaly_pct > 0 ? '#44aaff' : '#ff8800'}
        />
        <DriverRow
          label="Temperature Anomaly"
          value={d.temperature_anomaly_c}
          unit="°C"
          max={10}
          color={d.temperature_anomaly_c > 0 ? '#ff4444' : '#44aaff'}
        />
        <DriverRow
          label="Wind Anomaly"
          value={d.wind_anomaly_pct}
          unit="%"
          max={200}
          color="#ffcc00"
        />
        <DriverRow
          label="Pressure Anomaly"
          value={d.pressure_anomaly_hpa}
          unit=" hPa"
          max={30}
          color={d.pressure_anomaly_hpa < 0 ? '#ff4444' : '#00dbe9'}
        />
        <DriverRow
          label="Persistence"
          value={d.persistence_days}
          unit=" days"
          max={7}
          color="#d1bcff"
        />
        <DriverRow
          label="Spatial Growth"
          value={d.spatial_growth_pct}
          unit="%"
          max={60}
          color={sevColor}
        />
      </div>
    </div>
  );
}
