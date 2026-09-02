'use client';

import { useState } from 'react';

interface WelcomeGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'start' | 'map' | 'science' | 'actions';

export default function WelcomeGuide({ isOpen, onClose }: WelcomeGuideProps) {
  const [activeTab, setActiveTab] = useState<TabType>('start');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-[#111622] border border-[#334155] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#161c2c]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold text-lg">
              <i className="bi bi-tornado text-cyan-400 text-lg"></i>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                AeroWatch Operational Guide
                <span className="text-[11px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/30">
                  SIH26078
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                AI & Statistical Spatio-Temporal Tracking of Extreme Weather Anomalies
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all text-sm font-bold"
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-800 bg-[#131826] px-6 gap-2 text-xs font-semibold overflow-x-auto">
          {[
            { id: 'start', label: 'Quick Start (Students & Observers)', icon: 'bi bi-lightning-charge-fill text-amber-400' },
            { id: 'map', label: 'Map & Google Earth Guide', icon: 'bi bi-globe-americas text-cyan-400' },
            { id: 'science', label: 'Scientific Model (Professors)', icon: 'bi bi-graph-up-arrow text-emerald-400' },
            { id: 'actions', label: 'Emergency Protocols (NDMA)', icon: 'bi bi-shield-exclamation text-red-400' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`py-3 px-3 border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-cyan-400 text-cyan-300 font-bold bg-cyan-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <i className={tab.icon}></i>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Modal Body Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-sm text-slate-300 flex-1">
          {/* TAB 1: QUICK START */}
          {activeTab === 'start' && (
            <div className="space-y-4">
              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4 text-cyan-200">
                <h3 className="font-bold text-base text-cyan-300 mb-1 flex items-center gap-2">
                  <i className="bi bi-info-circle-fill"></i>
                  <span>Welcome to AeroWatch!</span>
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  This command center monitors meteorological anomalies (cyclones, flash floods, cloudbursts, severe heatwaves) across India using live medium-range forecast models.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
                  <div className="text-cyan-400 text-2xl mb-2">
                    <i className="bi bi-1-circle-fill"></i>
                  </div>
                  <h4 className="font-bold text-white mb-1 text-xs uppercase tracking-wide">1. Explore Active Targets</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Look at the left panel or click any pulsing circle on the India radar map to select an event.
                  </p>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
                  <div className="text-cyan-400 text-2xl mb-2">
                    <i className="bi bi-2-circle-fill"></i>
                  </div>
                  <h4 className="font-bold text-white mb-1 text-xs uppercase tracking-wide">2. Forecast Timeline</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Use the scrubber or press <strong>Play Track</strong> at the bottom to watch the storm’s trajectory displace across 72 hours.
                  </p>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
                  <div className="text-cyan-400 text-2xl mb-2">
                    <i className="bi bi-3-circle-fill"></i>
                  </div>
                  <h4 className="font-bold text-white mb-1 text-xs uppercase tracking-wide">3. Review Drivers & Advice</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Check the right panel for anomaly Z-scores, affected districts, and emergency action checklists.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MAP & GOOGLE EARTH */}
          {activeTab === 'map' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5">
                  <div className="font-bold text-white text-xs mb-1 flex items-center gap-2">
                    <i className="bi bi-globe-americas text-cyan-400"></i>
                    <span>Google Earth Hybrid</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    High-resolution photorealistic satellite imagery with geographical borders, coastlines, and place names.
                  </p>
                </div>
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5">
                  <div className="font-bold text-white text-xs mb-1 flex items-center gap-2">
                    <i className="bi bi-moon-stars-fill text-slate-300"></i>
                    <span>Dark Tactical Radar</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    High-contrast dark theme optimized for viewing hazard risk halos and boundary lines without glare.
                  </p>
                </div>
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5">
                  <div className="font-bold text-white text-xs mb-1 flex items-center gap-2">
                    <i className="bi bi-layers-fill text-emerald-400"></i>
                    <span>Topographic Terrain</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Highlights elevation and mountain ranges — crucial for tracking cloudbursts in Himalayas and Western Ghats.
                  </p>
                </div>
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5">
                  <div className="font-bold text-white text-xs mb-1 flex items-center gap-2">
                    <i className="bi bi-map-fill text-indigo-400"></i>
                    <span>OpenStreetMap</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Full civil administrative boundaries, road corridors, and civic infrastructure for evacuation planning.
                  </p>
                </div>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-xs space-y-2">
                <div className="font-bold text-white">Visual Symbols Explained:</div>
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-red-500 shadow-md shadow-red-500/50"></span>
                  <span><strong>Red Core:</strong> Severe Risk (Risk score 80–100) — Immediate alert</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-amber-500 shadow-md shadow-amber-500/50"></span>
                  <span><strong>Orange Core:</strong> High Risk (Risk score 60–80) — Severe monitoring</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-8 h-1 bg-cyan-400 border border-dashed border-white"></span>
                  <span><strong>Cyan Dotted Line:</strong> Forecasted Trajectory Track (Direction & Speed)</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SCIENTIFIC METHODOLOGY */}
          {activeTab === 'science' && (
            <div className="space-y-3.5">
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-2">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <i className="bi bi-calculator"></i>
                  <span>1. Climatological Z-Score Formulation</span>
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  For each meteorological variable $x$ (2m Temperature, Surface Precipitation, 10m Wind Speed, Surface Pressure) at station coordinate $s$:
                </p>
                <div className="font-mono bg-black/50 p-2.5 rounded-lg text-xs text-cyan-300 text-center">
                  Z_x = (x_observed - μ_climatology) / max(σ_climatology, 0.1)
                </div>
                <p className="text-xs text-slate-400">
                  Baselines ($\mu_s, \sigma_s$) are calibrated against India Meteorological Department (IMD) 30-year seasonal normals.
                </p>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-2">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <i className="bi bi-pie-chart"></i>
                  <span>2. Composite 0–100 Risk Index</span>
                </h4>
                <p className="text-xs text-slate-300">
                  Calculated using a normalized multi-criteria weighting scheme configured in <code>backend/config.py</code>:
                </p>
                <ul className="text-xs space-y-1 text-slate-400 list-disc list-inside">
                  <li><strong>Rainfall Surplus Departure:</strong> 30% weight</li>
                  <li><strong>Temperature Anomaly:</strong> 20% weight</li>
                  <li><strong>Wind Speed Departure:</strong> 20% weight</li>
                  <li><strong>Barometric Pressure Drop:</strong> 15% weight</li>
                  <li><strong>Temporal Persistence:</strong> 10% weight</li>
                  <li><strong>Spatial Extent Area:</strong> 5% weight</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 4: EMERGENCY ACTIONS */}
          {activeTab === 'actions' && (
            <div className="space-y-3">
              <div className="border-l-4 border-red-500 bg-red-950/20 p-3.5 rounded-r-xl">
                <div className="font-bold text-red-400 text-xs mb-1 flex items-center gap-1.5">
                  <i className="bi bi-exclamation-octagon-fill"></i>
                  <span>RED ALERT (SEVERE / RISK &gt; 80)</span>
                </div>
                <p className="text-xs text-slate-300">
                  Total suspension of fishing and marine operations. Immediate evacuation of low-lying coastal or landslide-prone villages. Pre-position NDRF/SDRF response battalions.
                </p>
              </div>

              <div className="border-l-4 border-amber-500 bg-amber-950/20 p-3.5 rounded-r-xl">
                <div className="font-bold text-amber-400 text-xs mb-1 flex items-center gap-1.5">
                  <i className="bi bi-exclamation-triangle-fill"></i>
                  <span>ORANGE ALERT (HIGH / RISK 60–80)</span>
                </div>
                <p className="text-xs text-slate-300">
                  Activate District Emergency Operation Centers (DEOC). Inspect drainage sluices and check flood shelters. Issue public advisories to avoid unnecessary travel.
                </p>
              </div>

              <div className="border-l-4 border-yellow-500 bg-yellow-950/20 p-3.5 rounded-r-xl">
                <div className="font-bold text-yellow-400 text-xs mb-1 flex items-center gap-1.5">
                  <i className="bi bi-info-circle-fill"></i>
                  <span>YELLOW WATCH (ELEVATED / RISK 40–60)</span>
                </div>
                <p className="text-xs text-slate-300">
                  Stay updated on IMD & AeroWatch medium-range forecast cycles. Keep emergency communications and medical stock ready.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-800 bg-[#161c2c]">
          <span className="text-xs text-slate-500 flex items-center gap-1.5">
            <i className="bi bi-info-circle"></i>
            <span>Click <strong>Quick Guide</strong> in top menu anytime to reopen</span>
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-cyan-500/20 active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            <span>Got It, Launch Command Center</span>
            <i className="bi bi-arrow-right"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
