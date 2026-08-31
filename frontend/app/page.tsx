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

// Dynamic import for MapLibre (no SSR)
const IndiaMap = dynamic(() => import('@/components/map/IndiaMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-sm border-2 border-primary-container/40 border-t-primary-container animate-spin" />
        <p className="font-mono text-[11px] text-on-surface-variant tracking-widest uppercase animate-pulse">
          Loading Map...
        </p>
      </div>
    </div>
  ),
});

const AnomalyChart = dynamic(() => import('@/components/charts/AnomalyChart'), { ssr: false });

// Refresh interval
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
      setModeBanner('LIVE DATA UNAVAILABLE — Switched to DEMO MODE');
      setTimeout(() => setModeBanner(null), 5000);
    }

    setLoadingEvents(false);
    setLoadingStatus(false);
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(() => loadData(), REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [loadData]);

  function handleModeToggle() {
    const newMode: DataMode = dataMode === 'LIVE' ? 'DEMO' : 'LIVE';
    setLoadingEvents(true);
    setLoadingStatus(true);
    loadData(newMode);
  }

  const selectedEvent = events.find(e => e.event_id === selectedId) ?? null;

  // KPI data
  const kpi: KPIData = status
    ? {
        active_events: status.active_event_count,
        high_risk_events: status.high_risk_count,
        severe_events: status.severe_count,
        affected_districts: status.affected_districts_count,
        max_risk: status.max_risk_score,
        forecast_lead_hours: status.forecast_lead_hours,
      }
    : { active_events: 0, high_risk_events: 0, severe_events: 0, affected_districts: 0, max_risk: 0, forecast_lead_hours: 0 };

  const handleSetTimeStep = useCallback((v: number | ((prev: number) => number)) => {
    setTimeStepIndex(typeof v === 'function' ? v : () => v);
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-background">
      {/* Top nav */}
      <TopNav
        status={status}
        dataMode={dataMode}
        onModeToggle={handleModeToggle}
        backendOnline={backendOnline}
      />

      {/* Mode banner */}
      {modeBanner && (
        <div className="fixed top-16 left-0 right-0 z-40 flex items-center justify-center py-2 text-center"
          style={{ background: 'rgba(255,136,0,0.15)', borderBottom: '1px solid rgba(255,136,0,0.3)' }}>
          <span className="material-symbols-outlined text-[16px] mr-2" style={{ color: '#ff8800' }}>warning</span>
          <span className="font-mono text-[11px] font-medium tracking-wider uppercase" style={{ color: '#ff8800' }}>
            {modeBanner}
          </span>
        </div>
      )}

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden pt-16">
        {/* Side nav */}
        <SideNav activeItem="map" />

        {/* Content area */}
        <div className="flex flex-1 flex-col overflow-hidden ml-[72px]">

          {/* KPI Strip */}
          <div className="flex-shrink-0 px-4 py-3 border-b border-outline-variant/20 bg-surface-container-lowest/40">
            <div className="grid grid-cols-6 gap-2">
              <KPICard
                label="Active Events"
                value={kpi.active_events}
                severity="info"
                icon="cyclone"
                loading={loadingStatus}
              />
              <KPICard
                label="High Risk"
                value={kpi.high_risk_events}
                severity={kpi.high_risk_events > 0 ? 'warning' : 'normal'}
                icon="warning"
                loading={loadingStatus}
              />
              <KPICard
                label="Severe Events"
                value={kpi.severe_events}
                severity={kpi.severe_events > 0 ? 'danger' : 'normal'}
                icon="emergency"
                loading={loadingStatus}
              />
              <KPICard
                label="Districts Affected"
                value={kpi.affected_districts}
                severity="normal"
                icon="location_on"
                subtext="across India"
                loading={loadingStatus}
              />
              <KPICard
                label="Max Risk Score"
                value={kpi.max_risk}
                unit="/100"
                severity={kpi.max_risk > 80 ? 'danger' : kpi.max_risk > 60 ? 'warning' : kpi.max_risk > 40 ? 'info' : 'normal'}
                icon="bar_chart"
                loading={loadingStatus}
              />
              <KPICard
                label="Forecast Lead"
                value={kpi.forecast_lead_hours}
                unit="h"
                severity="normal"
                icon="schedule"
                subtext="medium-range"
                loading={loadingStatus}
              />
            </div>
          </div>

          {/* Command center — map + panels */}
          <div className="flex flex-1 overflow-hidden">

            {/* LEFT — Event List */}
            <div className="w-64 flex-shrink-0 flex flex-col border-r border-outline-variant/20 bg-surface-container-lowest/30">
              <div className="px-3 py-2 border-b border-outline-variant/20 flex items-center gap-2">
                <span className="material-symbols-outlined text-[14px] text-primary-container">list</span>
                <span className="font-mono text-[11px] font-medium tracking-widest uppercase text-on-surface-variant">
                  Active Events
                </span>
                <span className="ml-auto font-mono text-[10px] px-1.5 py-0.5 rounded-sm"
                  style={{ background: 'rgba(0,240,255,0.1)', color: '#00dbe9', border: '1px solid rgba(0,240,255,0.2)' }}>
                  {events.length}
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

            {/* CENTER — Map */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Map area */}
              <div className="flex-1 relative overflow-hidden">
                {/* Map header overlay */}
                <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-2 pointer-events-none"
                  style={{ background: 'linear-gradient(to bottom, rgba(17,19,24,0.8), transparent)' }}>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[10px] text-on-surface-variant tracking-widest uppercase">
                      India — Operational Weather Map
                    </span>
                    <span className="status-chip border-outline-variant/50 text-on-surface-variant">
                      {events.length} anomalies detected
                    </span>
                  </div>
                  <div className="status-chip" style={{
                    borderColor: dataMode === 'LIVE' ? 'rgba(0,219,233,0.5)' : 'rgba(255,136,0,0.5)',
                    color: dataMode === 'LIVE' ? '#00dbe9' : '#ff8800',
                    background: dataMode === 'LIVE' ? 'rgba(0,219,233,0.08)' : 'rgba(255,136,0,0.08)',
                  }}>
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{
                      background: dataMode === 'LIVE' ? '#00dbe9' : '#ff8800'
                    }} />
                    {dataMode}
                  </div>
                </div>

                <IndiaMap
                  events={events}
                  selectedId={selectedId}
                  onSelectEvent={setSelectedId}
                  timeStepIndex={timeStepIndex}
                />
              </div>

              {/* Timeline strip */}
              <div className="flex-shrink-0 border-t border-outline-variant/20 bg-surface-container-lowest/50">
                <ForecastTimeline
                  timeStepIndex={timeStepIndex}
                  onChange={handleSetTimeStep}
                />
              </div>
            </div>

            {/* RIGHT — Event Intelligence Panel */}
            <div className="w-72 flex-shrink-0 flex flex-col border-l border-outline-variant/20 bg-surface-container-lowest/30">
              <div className="px-3 py-2 border-b border-outline-variant/20 flex items-center gap-2">
                <span className="material-symbols-outlined text-[14px] text-primary-container">radar</span>
                <span className="font-mono text-[11px] font-medium tracking-widest uppercase text-on-surface-variant">
                  Event Intelligence
                </span>
              </div>

              <div className="flex-1 overflow-hidden flex flex-col">
                <EventPanel event={selectedEvent} loading={loadingEvents && !selectedEvent} />

                {/* Chart — only when event selected */}
                {selectedEvent && (
                  <div className="flex-shrink-0 px-4 py-3 border-t border-outline-variant/20">
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
