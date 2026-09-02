'use client';

import type { WeatherEvent } from '@/types';

interface AlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: WeatherEvent[];
  onSelectEvent: (id: string) => void;
}

export default function AlertsModal({ isOpen, onClose, events, onSelectEvent }: AlertsModalProps) {
  if (!isOpen) return null;

  const severeCount = events.filter((e) => e.severity === 'SEVERE').length;
  const highCount = events.filter((e) => e.severity === 'HIGH').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#111622] border border-[#334155] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#161c2c]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 font-bold text-lg">
              <i className="bi bi-bell-fill text-red-400 text-lg"></i>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Active Meteorological Alerts</span>
                <span className="text-[11px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full border border-red-500/40 font-bold">
                  {severeCount + highCount} Urgent
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Early situational awareness & civil protection advisories
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all text-sm font-bold cursor-pointer"
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        {/* List of alerts */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {events.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <i className="bi bi-check-circle-fill text-emerald-400 text-4xl mb-2 inline-block"></i>
              <p className="mt-2 font-medium">No severe weather anomalies currently detected.</p>
            </div>
          ) : (
            events.map((event) => {
              const isSevere = event.severity === 'SEVERE';
              const isHigh = event.severity === 'HIGH';
              const badgeBg = isSevere
                ? 'bg-red-500/20 text-red-400 border-red-500/50'
                : isHigh
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/50'
                : 'bg-sky-500/20 text-sky-400 border-sky-500/50';

              return (
                <div
                  key={event.event_id}
                  className="bg-slate-900/90 border border-slate-800 hover:border-slate-600 rounded-xl p-4 transition-all flex flex-col gap-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase ${badgeBg}`}>
                          {event.severity} ALERT
                        </span>
                        <span className="text-xs font-mono text-slate-400 font-medium">
                          ID: {event.event_id}
                        </span>
                      </div>
                      <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                        <span>{event.hazard_type.replace(/_/g, ' ')}</span>
                        <span className="text-slate-400 font-normal text-xs">
                          — {event.location.region_name}
                        </span>
                      </h4>
                    </div>

                    <div className="text-right">
                      <div className="text-base font-bold text-white font-mono">
                        Risk {event.risk_score}
                        <span className="text-xs text-slate-500">/100</span>
                      </div>
                      <span className="text-[11px] text-cyan-400 font-mono">
                        Lead: {event.forecast_lead_hours}h
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 flex items-start gap-2">
                    <i className="bi bi-info-circle-fill text-cyan-400 text-xs mt-0.5 flex-shrink-0"></i>
                    <span>
                      {isSevere
                        ? `High-priority hazard warning for ${event.location.state}. Heavy anomalous precipitation surplus (${event.anomaly_drivers.rainfall_anomaly_pct > 0 ? `+${event.anomaly_drivers.rainfall_anomaly_pct}%` : 'Normal'}) and wind anomalies require immediate district-level alert mobilization.`
                        : `Medium-range forecast indicates developing meteorological deviation across ${event.location.state}. Tracking ${event.movement_direction || 'North'} at ${event.movement_speed_kmh || 10} km/h.`}
                    </span>
                  </p>

                  <div className="flex items-center justify-between pt-1 text-xs">
                    <div className="text-slate-400">
                      Districts: <span className="text-slate-200">{event.affected_districts.slice(0, 3).join(', ')}{event.affected_districts.length > 3 ? ` +${event.affected_districts.length - 3} more` : ''}</span>
                    </div>
                    <button
                      onClick={() => {
                        onSelectEvent(event.event_id);
                        onClose();
                      }}
                      className="px-3 py-1 bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 font-semibold rounded-md border border-cyan-500/40 transition-all text-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Locate on Radar</span>
                      <i className="bi bi-crosshair"></i>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-800 bg-[#161c2c]">
          <span className="text-xs text-slate-400">
            Source: Live Open-Meteo & Climatological Baselines
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
