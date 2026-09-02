'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import type { WeatherEvent, SystemStatus, DataMode, KPIData } from '@/types';
import { fetchEvents, fetchStatus, fetchHealth } from '@/lib/api';
import { DEMO_EVENTS, DEMO_STATUS } from '@/lib/demo-data';

import TopNav from '@/components/layout/TopNav';
import SideNav from '@/components/layout/SideNav';
import KPICard from '@/components/dashboard/KPICard';
import EventList from '@/components/events/EventList';
import EventPanel from '@/components/events/EventPanel';
import ForecastTimeline from '@/components/timeline/ForecastTimeline';
import WelcomeGuide from '@/components/onboarding/WelcomeGuide';
import AlertsModal from '@/components/alerts/AlertsModal';

// Dynamic import for MapLibre (no SSR)
const IndiaMap = dynamic(() => import('@/components/map/IndiaMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#0d1117]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full border-3 border-cyan-400/40 border-t-cyan-400 animate-spin" />
        <p className="font-sans text-xs text-cyan-300 font-semibold tracking-wide animate-pulse">
          Initializing Satellite Earth Map & Grids...
        </p>
      </div>
    </div>
  ),
});

const AnomalyChart = dynamic(() => import('@/components/charts/AnomalyChart'), { ssr: false });

const REFRESH_INTERVAL = 60000; // 60s

export default function CommandCenter() {
  const [events, setEvents] = useState<WeatherEvent[]>([]);
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [dataMode, setDataMode] = useState<DataMode>('DEMO');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [timeStepIndex, setTimeStepIndex] = useState(0);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [backendOnline, setBackendOnline] = useState(false);
  const [modeBanner, setModeBanner] = useState<string | null>(null);

  // Modals for Onboarding & Alerts
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);

  // Check first-time user for guide popup
  useEffect(() => {
    try {
      const seen = localStorage.getItem('aerowatch_guide_viewed');
      if (!seen) {
        setIsGuideOpen(true);
        localStorage.setItem('aerowatch_guide_viewed', 'true');
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  // Load data
  const loadData = useCallback(async (forceMode?: DataMode) => {
    const online = await fetchHealth();
    setBackendOnline(online);

    const [evRes, stRes] = await Promise.all([fetchEvents(), fetchStatus()]);

    const actualMode = forceMode ?? evRes.mode;
    setDataMode(actualMode);
    setEvents(actualMode === 'DEMO' ? DEMO_EVENTS : evRes.data);
    setStatus(actualMode === 'DEMO' ? { ...DEMO_STATUS, data_mode: 'DEMO' } : stRes.data);

    if (evRes.mode === 'DEMO' && !forceMode) {
      setModeBanner('Live server connecting — loaded validated demo scenarios');
      setTimeout(() => setModeBanner(null), 4000);
    }

    setLoadingEvents(false);
    setLoadingStatus(false);
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(() => loadData(), REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [loadData]);

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsGuideOpen(false);
        setIsAlertsOpen(false);
        setSelectedId(null);
      } else if (e.key === 'ArrowRight') {
        setTimeStepIndex(prev => Math.min(5, prev + 1));
      } else if (e.key === 'ArrowLeft') {
        setTimeStepIndex(prev => Math.max(0, prev - 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  function handleModeToggle() {
    const newMode: DataMode = dataMode === 'LIVE' ? 'DEMO' : 'LIVE';
    setLoadingEvents(true);
    setLoadingStatus(true);
    loadData(newMode);
  }

  const selectedEvent = events.find(e => e.event_id === selectedId) ?? null;

  // KPI calculations
  const kpi: KPIData = status
    ? {
        active_events: status.active_event_count,
        high_risk_events: status.high_risk_count,
        severe_events: status.severe_count,
        affected_districts: status.affected_districts_count,
        max_risk: status.max_risk_score,
        forecast_lead_hours: status.forecast_lead_hours,
      }
    : {
        active_events: events.length,
        high_risk_events: events.filter(e => e.risk_score >= 60).length,
        severe_events: events.filter(e => e.severity === 'SEVERE').length,
        affected_districts: 18,
        max_risk: Math.max(...events.map(e => e.risk_score), 0),
        forecast_lead_hours: 72,
      };

  const handleSetTimeStep = useCallback((v: number | ((prev: number) => number)) => {
    setTimeStepIndex(typeof v === 'function' ? v : () => v);
  }, []);

  const urgentAlertCount = events.filter(e => e.severity === 'SEVERE' || e.severity === 'HIGH').length;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0d1117] text-slate-100 font-sans">
      {/* Top Navigation */}
      <TopNav
        status={status}
        dataMode={dataMode}
        onModeToggle={handleModeToggle}
        backendOnline={backendOnline}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenAlerts={() => setIsAlertsOpen(true)}
        alertCount={urgentAlertCount}
      />

      {/* Interactive Onboarding Guide Modal */}
      <WelcomeGuide
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      {/* Real-time Alerts Modal */}
      <AlertsModal
        isOpen={isAlertsOpen}
        onClose={() => setIsAlertsOpen(false)}
        events={events}
        onSelectEvent={(id) => {
          setSelectedId(id);
          setIsAlertsOpen(false);
        }}
      />

      {/* Notification Banner */}
      {modeBanner && (
        <div className="fixed top-16 left-0 right-0 z-40 flex items-center justify-center py-2 px-4 text-center bg-cyan-950/80 border-b border-cyan-500/30 text-cyan-300 text-xs font-semibold backdrop-blur-md">
          <i className="bi bi-info-circle-fill text-cyan-400 mr-2"></i>
          <span>{modeBanner}</span>
        </div>
      )}

      {/* Main Layout Area */}
      <div className="flex flex-1 overflow-hidden pt-16">
        {/* Left Vertical Side Navigation */}
        <SideNav
          activeItem="map"
          onOpenGuide={() => setIsGuideOpen(true)}
          onOpenAlerts={() => setIsAlertsOpen(true)}
        />

        {/* Primary Content Window */}
        <div className="flex flex-1 flex-col overflow-hidden ml-[72px]">
          {/* Top KPI Telemetry Strip */}
          <div className="flex-shrink-0 px-4 py-2.5 border-b border-slate-800 bg-[#0d121c]/80 backdrop-blur-md">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              <KPICard
                label="Active Weather Targets"
                value={kpi.active_events}
                severity="info"
                icon="radar"
                subtext="tracked across India"
                loading={loadingStatus}
              />
              <KPICard
                label="High Risk Zones"
                value={kpi.high_risk_events}
                severity={kpi.high_risk_events > 0 ? 'warning' : 'normal'}
                icon="warning"
                subtext="risk score 60 to 80"
                loading={loadingStatus}
              />
              <KPICard
                label="Severe Emergencies"
                value={kpi.severe_events}
                severity={kpi.severe_events > 0 ? 'danger' : 'normal'}
                icon="emergency"
                subtext="risk score > 80"
                loading={loadingStatus}
              />
              <KPICard
                label="Districts Monitored"
                value={kpi.affected_districts}
                severity="normal"
                icon="location_on"
                subtext="under active watch"
                loading={loadingStatus}
              />
              <KPICard
                label="Peak Risk Level"
                value={kpi.max_risk}
                unit="/100"
                severity={kpi.max_risk > 80 ? 'danger' : kpi.max_risk > 60 ? 'warning' : kpi.max_risk > 40 ? 'info' : 'normal'}
                icon="speed"
                subtext="highest anomaly index"
                loading={loadingStatus}
              />
              <KPICard
                label="Forecast Lead Time"
                value={kpi.forecast_lead_hours}
                unit="h"
                severity="normal"
                icon="schedule"
                subtext="medium-range interval"
                loading={loadingStatus}
              />
            </div>
          </div>

          {/* Core Command Dashboard: Events List + Radar Map + Event Intelligence */}
          <div className="flex flex-1 overflow-hidden">
            {/* LEFT: Searchable Active Events List */}
            <div className="w-72 sm:w-80 flex-shrink-0 flex flex-col border-r border-slate-800 bg-[#0f131d]">
              <div className="px-4 py-2.5 border-b border-slate-800 flex items-center justify-between bg-[#121624]">
                <div className="flex items-center gap-2">
                  <i className="bi bi-card-checklist text-cyan-400 font-bold text-sm"></i>
                  <span className="font-bold text-xs uppercase tracking-wider text-slate-200">
                    Active Events
                  </span>
                </div>
                <span className="text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/30">
                  {events.length} Live
                </span>
              </div>
              <div className="flex-1 overflow-y-auto">
                <EventList
                  events={events}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                  loading={loadingEvents}
                />
              </div>
            </div>

            {/* CENTER: Google Earth & Radar Map + Timeline Scrubber */}
            <div className="flex-1 flex flex-col overflow-hidden relative">
              <div className="flex-1 relative overflow-hidden">
                <IndiaMap
                  events={events}
                  selectedId={selectedId}
                  onSelectEvent={setSelectedId}
                  timeStepIndex={timeStepIndex}
                />
              </div>

              {/* 72-Hour Medium Range Forecast Scrubber */}
              <div className="flex-shrink-0">
                <ForecastTimeline
                  timeStepIndex={timeStepIndex}
                  onChange={handleSetTimeStep}
                />
              </div>
            </div>

            {/* RIGHT: Detailed Event Intelligence & NDMA Action Panel */}
            <div className="w-80 sm:w-96 flex-shrink-0 flex flex-col border-l border-slate-800 bg-[#0f131d]">
              <div className="px-4 py-2.5 border-b border-slate-800 flex items-center justify-between bg-[#121624]">
                <div className="flex items-center gap-2">
                  <i className="bi bi-activity text-cyan-400 font-bold text-sm"></i>
                  <span className="font-bold text-xs uppercase tracking-wider text-slate-200">
                    Event Intelligence
                  </span>
                </div>
                {selectedEvent && (
                  <span className="text-[11px] font-mono text-slate-400 font-semibold">
                    {selectedEvent.event_id}
                  </span>
                )}
              </div>

              <div className="flex-1 overflow-hidden flex flex-col">
                <div className="flex-1 overflow-y-auto">
                  <EventPanel event={selectedEvent} loading={loadingEvents && !selectedEvent} />
                </div>

                {/* Trajectory Risk Chart */}
                {selectedEvent && (
                  <div className="flex-shrink-0 p-3 border-t border-slate-800 bg-[#0d111a]">
                    <AnomalyChart event={selectedEvent} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
