'use client';

import { useState } from 'react';
import type { WeatherEvent } from '@/types';
import { severityColor, riskColor } from '@/lib/api';

interface EventPanelProps {
  event: WeatherEvent | null;
  loading?: boolean;
}

function DriverRow({
  label,
  value,
  unit,
  max = 100,
  color,
  explanation,
}: {
  label: string;
  value: number;
  unit: string;
  max?: number;
  color: string;
  explanation: string;
}) {
  const pct = Math.min(100, (Math.abs(value) / max) * 100);
  const displayVal = value >= 0 ? `+${value}${unit}` : `${value}${unit}`;

  return (
    <div className="py-2.5 border-b border-slate-800 last:border-0">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold text-slate-200">{label}</span>
        <span className="font-mono text-xs font-bold" style={{ color }}>
          {displayVal}
        </span>
      </div>
      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-1">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
      <div className="text-[11px] text-slate-400 leading-tight">{explanation}</div>
    </div>
  );
}

export default function EventPanel({ event, loading }: EventPanelProps) {
  const [copied, setCopied] = useState(false);

  if (loading) {
    return (
      <div className="flex flex-col h-full p-4 gap-3">
        {[80, 40, 60, 100, 60].map((w, i) => (
          <div key={i} className="bg-slate-800/40 animate-pulse rounded-lg h-10" style={{ width: `${w}%` }} />
        ))}
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6 text-slate-400">
        <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-2xl mb-3 text-cyan-400">
          <i className="bi bi-crosshair text-2xl text-cyan-400"></i>
        </div>
        <h3 className="font-bold text-sm text-white mb-1">No Event Selected</h3>
        <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
          Click any event marker on the Google Earth radar map or select from the list to view meteorological drivers and emergency advisories.
        </p>
      </div>
    );
  }

  const sevColor = severityColor(event.severity);
  const rCol = riskColor(event.risk_score);
  const d = event.anomaly_drivers;

  const handleCopyReport = () => {
    const reportText = `[AEROWATCH EMERGENCY BRIEFING]
Event ID: ${event.event_id}
Hazard: ${event.hazard_type}
Severity: ${event.severity} (Risk: ${event.risk_score}/100)
Location: ${event.location.region_name}
Affected Area: ${event.affected_area_km2.toLocaleString()} km²
Districts: ${event.affected_districts.join(', ')}
Forecast Trajectory: Tracking ${event.movement_direction || 'N'} at ${event.movement_speed_kmh || 10} km/h
Rainfall Anomaly: ${d.rainfall_anomaly_pct}% departure
Temperature Deviation: ${d.temperature_anomaly_c}°C
Barometric Pressure Delta: ${d.pressure_anomaly_hpa} hPa
Confidence: ${event.confidence}%`;

    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-[#0b0e14] divide-y divide-slate-800 text-xs">
      {/* Header Banner */}
      <div className="p-4 bg-gradient-to-b from-slate-900 to-transparent">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className="font-bold text-[10px] px-2 py-0.5 rounded font-mono uppercase"
                style={{ background: `${sevColor}20`, color: sevColor, border: `1px solid ${sevColor}50` }}
              >
                {event.severity} ALERT
              </span>
              <span className="font-mono text-slate-400 text-[11px] font-semibold">{event.event_id}</span>
            </div>
            <h2 className="text-base font-bold text-white leading-tight">
              {event.hazard_type.replace(/_/g, ' ')}
            </h2>
            <div className="text-slate-400 text-xs mt-0.5 flex items-center gap-1">
              <i className="bi bi-geo-alt-fill text-slate-500 text-[11px]"></i>
              <span>{event.location.region_name}</span>
            </div>
          </div>

          {/* Risk Badge */}
          <div className="flex flex-col items-center">
            <div
              className="w-13 h-13 rounded-xl flex items-center justify-center font-bold text-lg font-mono shadow-lg"
              style={{ background: `${rCol}20`, color: rCol, border: `1px solid ${rCol}50` }}
            >
              {event.risk_score}
            </div>
            <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">Risk / 100</span>
          </div>
        </div>

        {/* Confidence & Lead Time Strip */}
        <div className="flex items-center justify-between gap-3 bg-slate-900/80 p-2 rounded-lg border border-slate-800 mt-2">
          <div>
            <span className="text-slate-400 text-[11px]">Detection Lead: </span>
            <span className="font-bold text-cyan-400">{event.forecast_lead_hours} Hours</span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px]">AI Confidence: </span>
            <span className="font-bold text-emerald-400">{event.confidence}%</span>
          </div>
        </div>
      </div>

      {/* Executive Summary Briefing */}
      <div className="p-4 bg-slate-900/40">
        <div className="font-bold text-white text-xs mb-1.5 flex items-center gap-1.5">
          <i className="bi bi-clipboard-data text-cyan-400"></i>
          <span>Executive Briefing</span>
        </div>
        <p className="text-slate-300 text-xs leading-relaxed">
          {event.severity === 'SEVERE' || event.severity === 'HIGH' ? (
            <>
              Anomalous weather cluster identified in <strong>{event.location.state}</strong>. Barometric pressure is showing a departure of <strong>{d.pressure_anomaly_hpa} hPa</strong> with severe precipitation departure of <strong>{d.rainfall_anomaly_pct > 0 ? `+${d.rainfall_anomaly_pct}%` : `${d.rainfall_anomaly_pct}%`}</strong>. Expected to persist for ~<strong>{event.expected_duration_hours} hours</strong> with active displacement towards <strong>{event.movement_direction || 'North'}</strong>.
            </>
          ) : (
            <>
              Moderate meteorological fluctuation observed over <strong>{event.location.state}</strong>. Weather systems are tracking within expected medium-range climatological bounds with <strong>{event.confidence}%</strong> model confidence.
            </>
          )}
        </p>
      </div>

      {/* Recommended Emergency Actions (NDMA / IMD Protocol) */}
      <div className="p-4">
        <div className="font-bold text-white text-xs mb-2 flex items-center gap-1.5">
          <i className="bi bi-shield-exclamation text-amber-400"></i>
          <span>Civil Protection Advisory</span>
        </div>
        <div className="space-y-2">
          {event.severity === 'SEVERE' ? (
            <>
              <div className="flex items-start gap-2 text-slate-300">
                <span className="text-red-400 font-bold">1.</span>
                <span>Immediate coastal/low-lying evacuation for vulnerable settlements in {event.location.district || event.location.state}.</span>
              </div>
              <div className="flex items-start gap-2 text-slate-300">
                <span className="text-red-400 font-bold">2.</span>
                <span>Pre-position National Disaster Response Force (NDRF) and civil supplies in staging areas.</span>
              </div>
              <div className="flex items-start gap-2 text-slate-300">
                <span className="text-red-400 font-bold">3.</span>
                <span>Suspend marine fishing operations and issue red warnings to transport corridors.</span>
              </div>
            </>
          ) : event.severity === 'HIGH' ? (
            <>
              <div className="flex items-start gap-2 text-slate-300">
                <span className="text-amber-400 font-bold">1.</span>
                <span>Alert District Emergency Operations Centers (DEOC) across {event.affected_districts.slice(0, 3).join(', ')}.</span>
              </div>
              <div className="flex items-start gap-2 text-slate-300">
                <span className="text-amber-400 font-bold">2.</span>
                <span>Clear arterial storm drainage systems and inspect embankment safety.</span>
              </div>
            </>
          ) : (
            <div className="text-slate-400 text-xs">
              Standard vigilance protocol active. Maintain monitoring through IMD medium-range forecast intervals.
            </div>
          )}
        </div>
      </div>

      {/* Meteorological Anomaly Drivers (Explainable AI) */}
      <div className="p-4">
        <div className="font-bold text-white text-xs mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <i className="bi bi-activity text-cyan-400"></i>
            <span>Why Was This Event Flagged?</span>
          </span>
          <span className="text-[10px] text-cyan-400 font-mono">Z-Score & Baselines</span>
        </div>

        <DriverRow
          label="Precipitation Surplus / Deficit"
          value={d.rainfall_anomaly_pct}
          unit="%"
          max={300}
          color={d.rainfall_anomaly_pct > 0 ? '#38bdf8' : '#fb923c'}
          explanation={d.rainfall_anomaly_pct > 50 ? 'Excessive surplus vs 30-year IMD seasonal normal' : 'Moderate rainfall fluctuation'}
        />

        <DriverRow
          label="Temperature Deviation"
          value={d.temperature_anomaly_c}
          unit="°C"
          max={8}
          color={d.temperature_anomaly_c > 0 ? '#f87171' : '#60a5fa'}
          explanation={d.temperature_anomaly_c > 3 ? 'Substantial thermal departure above climatological average' : 'Near seasonal norm'}
        />

        <DriverRow
          label="Wind Velocity Departure"
          value={d.wind_anomaly_pct}
          unit="%"
          max={150}
          color="#facc15"
          explanation={d.wind_anomaly_pct > 40 ? 'Gale-force wind speeds accelerating storm propagation' : 'Standard wind currents'}
        />

        <DriverRow
          label="Surface Barometric Pressure Delta"
          value={d.pressure_anomaly_hpa}
          unit=" hPa"
          max={25}
          color={d.pressure_anomaly_hpa < 0 ? '#f87171' : '#2dd4bf'}
          explanation={d.pressure_anomaly_hpa < -5 ? 'Steep barometric drop indicating deep depression / cyclonic core' : 'Atmospheric pressure stable'}
        />
      </div>

      {/* Affected Districts */}
      <div className="p-4">
        <div className="font-bold text-white text-xs mb-2 flex items-center justify-between">
          <span>Affected Districts ({event.affected_districts.length})</span>
          <span className="text-slate-400 font-mono text-[11px]">{event.affected_area_km2.toLocaleString()} km²</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {event.affected_districts.map(d2 => (
            <span
              key={d2}
              className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-200 border border-slate-700 text-[11px]"
            >
              {d2}
            </span>
          ))}
        </div>
      </div>

      {/* Copy / Export Report Action */}
      <div className="p-4 bg-slate-900/60 flex items-center justify-between">
        <button
          onClick={handleCopyReport}
          className="w-full py-2 px-4 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-bold border border-cyan-400/40 text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          {copied ? <i className="bi bi-check2-circle text-emerald-400 text-sm"></i> : <i className="bi bi-copy text-sm"></i>}
          <span>{copied ? 'Briefing Copied to Clipboard!' : 'Copy Operational Briefing'}</span>
        </button>
      </div>
    </div>
  );
}
