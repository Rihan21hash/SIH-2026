'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Map, NavigationControl, Popup, type GeoJSONSource } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { WeatherEvent, EventTimestep } from '@/types';

interface IndiaMapProps {
  events: WeatherEvent[];
  selectedId: string | null;
  onSelectEvent: (id: string) => void;
  timeStepIndex: number;
}

export type BasemapType = 'satellite' | 'dark' | 'terrain' | 'osm';

const INDIA_CENTER: [number, number] = [79.5, 22.0];
const INDIA_ZOOM = 4.2;

// Severity to Hex Color & Glow
function sevToColor(severity: string): string {
  const m: Record<string, string> = {
    SEVERE:   '#ff3b3b',
    HIGH:     '#ff8800',
    ELEVATED: '#ffcc00',
    MODERATE: '#38bdf8',
    LOW:      '#00e5ff',
  };
  return m[severity] ?? '#00e5ff';
}

function getHazardIconClass(hazard: string): string {
  const map: Record<string, string> = {
    CYCLONE: 'bi bi-tornado',
    FLOOD: 'bi bi-water',
    HEATWAVE: 'bi bi-sun-fill',
    CLOUDBURST: 'bi bi-cloud-lightning-rain-fill',
    STORM: 'bi bi-wind',
    DROUGHT: 'bi bi-brightness-high-fill',
    COLD_WAVE: 'bi bi-snow',
  };
  return map[hazard] || 'bi bi-exclamation-triangle-fill';
}

export default function IndiaMap({ events, selectedId, onSelectEvent, timeStepIndex }: IndiaMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const popupRef = useRef<Popup | null>(null);
  const [mapReady, setMapReady] = useState(false);

  // Basemap & Layer toggles
  const [activeBasemap, setActiveBasemap] = useState<BasemapType>('satellite');
  const [showBorders, setShowBorders] = useState(true);
  const [showHalos, setShowHalos] = useState(true);
  const [showTrajectory, setShowTrajectory] = useState(true);
  const [showControlPanel, setShowControlPanel] = useState(false);

  // Get position for event at current timestep
  const getEventPos = useCallback((event: WeatherEvent): { lat: number; lon: number; risk: number; severity: string } => {
    const step: EventTimestep | undefined = event.timeline?.[timeStepIndex];
    if (step) {
      return { lat: step.lat, lon: step.lon, risk: step.risk_score, severity: step.severity };
    }
    return { lat: event.location.lat, lon: event.location.lon, risk: event.risk_score, severity: event.severity };
  }, [timeStepIndex]);

  // Switch basemap layer visibility
  const applyBasemap = useCallback((map: Map, type: BasemapType) => {
    const layers: { id: string; type: BasemapType }[] = [
      { id: 'satellite-layer', type: 'satellite' },
      { id: 'dark-layer', type: 'dark' },
      { id: 'terrain-layer', type: 'terrain' },
      { id: 'osm-layer', type: 'osm' },
    ];

    layers.forEach(({ id, type: layerType }) => {
      if (map.getLayer(id)) {
        map.setLayoutProperty(id, 'visibility', layerType === type ? 'visible' : 'none');
      }
    });
  }, []);

  // Initialize MapLibre
  useEffect(() => {
    let mounted = true;
    if (!mapContainer.current) return;

    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    try {
      const map = new Map({
        container: mapContainer.current,
        style: {
          version: 8,
          glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
          sources: {
            // 1. Google Earth Satellite (Hybrid with borders, roads, place names)
            satellite_earth: {
              type: 'raster',
              tiles: [
                'https://mt0.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
                'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
                'https://mt2.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
                'https://mt3.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
              ],
              tileSize: 256,
              attribution: '© Google Earth / Satellite',
              maxzoom: 20,
            },
            // 2. CartoDB Dark Matter (Tactical Dark Mode)
            carto_dark: {
              type: 'raster',
              tiles: [
                'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
                'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
                'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
                'https://d.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
              ],
              tileSize: 256,
              attribution: '© CARTO, © OpenStreetMap contributors',
              maxzoom: 19,
            },
            // 3. Google Terrain (Elevation & Physical Topography)
            google_terrain: {
              type: 'raster',
              tiles: [
                'https://mt0.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',
                'https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',
                'https://mt2.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',
                'https://mt3.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',
              ],
              tileSize: 256,
              attribution: '© Google Terrain',
              maxzoom: 20,
            },
            // 4. OpenStreetMap Standard
            osm_tiles: {
              type: 'raster',
              tiles: [
                'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
              ],
              tileSize: 256,
              attribution: '© OpenStreetMap contributors',
              maxzoom: 19,
            },
          },
          layers: [
            {
              id: 'background',
              type: 'background',
              paint: { 'background-color': '#090d16' },
            },
            {
              id: 'satellite-layer',
              type: 'raster',
              source: 'satellite_earth',
              layout: { visibility: 'visible' },
              paint: { 'raster-opacity': 0.96 },
            },
            {
              id: 'dark-layer',
              type: 'raster',
              source: 'carto_dark',
              layout: { visibility: 'none' },
              paint: { 'raster-opacity': 0.95 },
            },
            {
              id: 'terrain-layer',
              type: 'raster',
              source: 'google_terrain',
              layout: { visibility: 'none' },
              paint: { 'raster-opacity': 0.95 },
            },
            {
              id: 'osm-layer',
              type: 'raster',
              source: 'osm_tiles',
              layout: { visibility: 'none' },
              paint: { 'raster-opacity': 0.95 },
            },
          ],
        },
        center: INDIA_CENTER,
        zoom: INDIA_ZOOM,
        minZoom: 3,
        maxZoom: 16,
        attributionControl: false,
      });

      map.addControl(new NavigationControl({ showCompass: true, showZoom: true }), 'bottom-right');

      map.on('load', async () => {
        if (!mounted) return;

        // Apply selected initial basemap
        applyBasemap(map, activeBasemap);

        // 1. Add India State Boundaries Layer
        try {
          const geoRes = await fetch('/india_states.geojson');
          if (geoRes.ok) {
            const geoData = await geoRes.json();
            if (!map.getSource('india-states')) {
              map.addSource('india-states', { type: 'geojson', data: geoData });

              map.addLayer({
                id: 'india-state-fill',
                type: 'fill',
                source: 'india-states',
                paint: {
                  'fill-color': 'rgba(0, 229, 255, 0.04)',
                  'fill-outline-color': 'rgba(0, 229, 255, 0.35)',
                },
              });

              map.addLayer({
                id: 'india-state-glow',
                type: 'line',
                source: 'india-states',
                paint: {
                  'line-color': 'rgba(0, 229, 255, 0.6)',
                  'line-width': 1.4,
                },
              });
            }
          }
        } catch (e) {
          console.warn('India states geojson failed to load:', e);
        }

        // 2. Trajectory Track Line Source & Layer (for selected event)
        if (!map.getSource('trajectory-track')) {
          map.addSource('trajectory-track', {
            type: 'geojson',
            data: { type: 'FeatureCollection', features: [] },
          });

          map.addLayer({
            id: 'trajectory-line-glow',
            type: 'line',
            source: 'trajectory-track',
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: {
              'line-color': '#00e5ff',
              'line-width': 6,
              'line-opacity': 0.5,
              'line-blur': 4,
            },
          });

          map.addLayer({
            id: 'trajectory-line',
            type: 'line',
            source: 'trajectory-track',
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: {
              'line-color': '#ffffff',
              'line-width': 2.5,
              'line-dasharray': [3, 2],
              'line-opacity': 0.95,
            },
          });

          map.addLayer({
            id: 'trajectory-waypoints',
            type: 'circle',
            source: 'trajectory-track',
            paint: {
              'circle-radius': 5,
              'circle-color': '#00e5ff',
              'circle-stroke-color': '#ffffff',
              'circle-stroke-width': 2,
            },
          });
        }

        // 3. Events Source & Layers
        if (!map.getSource('events')) {
          map.addSource('events', {
            type: 'geojson',
            data: { type: 'FeatureCollection', features: [] },
          });

          // Outer glowing risk envelope / impact zone
          map.addLayer({
            id: 'event-outer-halo',
            type: 'circle',
            source: 'events',
            paint: {
              'circle-radius': [
                'interpolate', ['linear'], ['zoom'],
                3, ['*', ['get', 'risk_radius'], 0.9],
                8, ['*', ['get', 'risk_radius'], 2.8],
              ],
              'circle-color': ['get', 'color'],
              'circle-opacity': 0.18,
              'circle-blur': 0.85,
            },
          });

          // Mid pulse area
          map.addLayer({
            id: 'event-area',
            type: 'circle',
            source: 'events',
            paint: {
              'circle-radius': [
                'interpolate', ['linear'], ['zoom'],
                3, ['*', ['get', 'risk_radius'], 0.45],
                8, ['*', ['get', 'risk_radius'], 1.3],
              ],
              'circle-color': ['get', 'color'],
              'circle-opacity': 0.38,
              'circle-blur': 0.3,
            },
          });

          // Core event circle
          map.addLayer({
            id: 'event-circle',
            type: 'circle',
            source: 'events',
            paint: {
              'circle-radius': [
                'interpolate', ['linear'], ['zoom'],
                3, 10,
                8, 20,
              ],
              'circle-color': ['get', 'color'],
              'circle-opacity': 0.95,
              'circle-stroke-color': '#ffffff',
              'circle-stroke-width': 2,
            },
          });

          // Selection highlight ring
          map.addLayer({
            id: 'event-selected',
            type: 'circle',
            source: 'events',
            filter: ['==', ['get', 'id'], ''],
            paint: {
              'circle-radius': [
                'interpolate', ['linear'], ['zoom'],
                3, 18,
                8, 30,
              ],
              'circle-color': 'transparent',
              'circle-stroke-color': '#ffffff',
              'circle-stroke-width': 3,
              'circle-stroke-opacity': 0.95,
            },
          });
        }

        // 4. Hover popup setup
        const popup = new Popup({
          closeButton: false,
          closeOnClick: false,
          className: 'aero-popup',
          offset: 16,
        });
        popupRef.current = popup;

        map.on('mouseenter', 'event-circle', (e) => {
          map.getCanvas().style.cursor = 'pointer';
          const f = e.features?.[0];
          if (!f?.properties) return;
          const { hazard, state, risk, severity, district } = f.properties;
          const col = sevToColor(severity);
          const iconClass = getHazardIconClass(hazard);

          popup.setLngLat(e.lngLat)
            .setHTML(`
              <div style="background:#131722;border:1px solid ${col};padding:10px 14px;border-radius:8px;font-family:system-ui,-apple-system,sans-serif;box-shadow:0 12px 32px rgba(0,0,0,0.85);min-width:180px;color:#fff">
                <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:6px">
                  <span style="display:flex;align-items:center;gap:4px;font-weight:700;font-size:11px;color:${col};letter-spacing:0.05em;text-transform:uppercase">
                    <span style="width:8px;height:8px;border-radius:50%;background:${col};display:inline-block"></span>
                    ${severity}
                  </span>
                  <span style="background:${col}25;color:${col};border:1px solid ${col}60;font-weight:800;font-size:12px;padding:2px 7px;border-radius:4px">
                    Risk ${risk}/100
                  </span>
                </div>
                <div style="font-size:14px;font-weight:700;margin-bottom:4px;display:flex;align-items:center;gap:6px">
                  <i class="${iconClass}" style="color:${col};font-size:16px"></i>
                  <span>${hazard?.replace(/_/g, ' ')}</span>
                </div>
                <div style="color:#94a3b8;font-size:12px;display:flex;align-items:center;gap:4px">
                  <i class="bi bi-geo-alt-fill" style="color:#94a3b8"></i>
                  <span>${district ? `${district}, ` : ''}${state}</span>
                </div>
                <div style="margin-top:6px;padding-top:6px;border-top:1px solid rgba(255,255,255,0.1);font-size:11px;color:#38bdf8;display:flex;align-items:center;gap:4px">
                  <i class="bi bi-cursor-fill"></i>
                  <span>Click to inspect trajectory & advice</span>
                </div>
              </div>`)
            .addTo(map);
        });

        map.on('mouseleave', 'event-circle', () => {
          map.getCanvas().style.cursor = '';
          popup.remove();
        });

        // 5. Click event handler
        map.on('click', 'event-circle', (e) => {
          const f = e.features?.[0];
          if (f?.properties?.id) {
            onSelectEvent(f.properties.id);
          }
        });

        mapRef.current = map;
        setMapReady(true);

        setTimeout(() => {
          map.resize();
        }, 150);
      });

    } catch (err) {
      console.error('Failed to initialize MapLibre GL:', err);
    }

    const resizeObserver = new ResizeObserver(() => {
      if (mapRef.current) {
        mapRef.current.resize();
      }
    });

    if (mapContainer.current) {
      resizeObserver.observe(mapContainer.current);
    }

    return () => {
      mounted = false;
      resizeObserver.disconnect();
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update Basemap when state changes
  useEffect(() => {
    if (!mapRef.current || !mapReady) return;
    applyBasemap(mapRef.current, activeBasemap);
  }, [activeBasemap, mapReady, applyBasemap]);

  // Update Layer Toggles (Borders, Halos, Trajectory)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    if (map.getLayer('india-state-fill')) {
      map.setLayoutProperty('india-state-fill', 'visibility', showBorders ? 'visible' : 'none');
    }
    if (map.getLayer('india-state-glow')) {
      map.setLayoutProperty('india-state-glow', 'visibility', showBorders ? 'visible' : 'none');
    }

    if (map.getLayer('event-outer-halo')) {
      map.setLayoutProperty('event-outer-halo', 'visibility', showHalos ? 'visible' : 'none');
    }
    if (map.getLayer('event-area')) {
      map.setLayoutProperty('event-area', 'visibility', showHalos ? 'visible' : 'none');
    }

    if (map.getLayer('trajectory-line')) {
      map.setLayoutProperty('trajectory-line', 'visibility', showTrajectory ? 'visible' : 'none');
    }
    if (map.getLayer('trajectory-line-glow')) {
      map.setLayoutProperty('trajectory-line-glow', 'visibility', showTrajectory ? 'visible' : 'none');
    }
    if (map.getLayer('trajectory-waypoints')) {
      map.setLayoutProperty('trajectory-waypoints', 'visibility', showTrajectory ? 'visible' : 'none');
    }
  }, [showBorders, showHalos, showTrajectory, mapReady]);

  // Update event markers & trajectories when data or timestep changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    const src = map.getSource('events') as GeoJSONSource | undefined;
    if (src) {
      const features = events.map((ev) => {
        const pos = getEventPos(ev);
        const color = sevToColor(pos.severity);
        return {
          type: 'Feature' as const,
          geometry: { type: 'Point' as const, coordinates: [pos.lon, pos.lat] },
          properties: {
            id: ev.event_id,
            hazard: ev.hazard_type,
            state: ev.location.state,
            district: ev.location.district || '',
            severity: pos.severity,
            risk: pos.risk,
            color,
            risk_radius: Math.max(14, pos.risk / 2.2),
            selected: ev.event_id === selectedId,
          },
        };
      });

      src.setData({ type: 'FeatureCollection', features });
    }

    // Update Trajectory for Selected Event
    const trajSrc = map.getSource('trajectory-track') as GeoJSONSource | undefined;
    if (trajSrc) {
      const selectedEvent = events.find((e) => e.event_id === selectedId);
      if (selectedEvent && selectedEvent.timeline && selectedEvent.timeline.length > 1) {
        const coords = selectedEvent.timeline.map((step) => [step.lon, step.lat]);
        const waypointFeatures = selectedEvent.timeline.map((step) => ({
          type: 'Feature' as const,
          geometry: { type: 'Point' as const, coordinates: [step.lon, step.lat] },
          properties: {
            timestep: step.timestep,
            risk: step.risk_score,
          },
        }));

        trajSrc.setData({
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature' as const,
              geometry: {
                type: 'LineString' as const,
                coordinates: coords,
              },
              properties: {
                id: selectedEvent.event_id,
              },
            },
            ...waypointFeatures,
          ],
        });
      } else {
        trajSrc.setData({ type: 'FeatureCollection', features: [] });
      }
    }

    if (map.getLayer('event-selected')) {
      map.setFilter('event-selected', selectedId
        ? ['==', ['get', 'id'], selectedId]
        : ['==', ['get', 'id'], '']);
    }
  }, [events, selectedId, timeStepIndex, mapReady, getEventPos]);

  // Center map on selected event
  useEffect(() => {
    if (!selectedId || !mapRef.current || !mapReady) return;
    const ev = events.find((e) => e.event_id === selectedId);
    if (!ev) return;
    const pos = getEventPos(ev);
    mapRef.current.flyTo({
      center: [pos.lon, pos.lat],
      zoom: Math.max(5.8, mapRef.current.getZoom()),
      duration: 1200,
      essential: true,
    });
  }, [selectedId, mapReady, events, getEventPos]);

  // Reset to full India view
  const handleResetView = () => {
    if (!mapRef.current) return;
    mapRef.current.flyTo({
      center: INDIA_CENTER,
      zoom: INDIA_ZOOM,
      duration: 1000,
      essential: true,
    });
  };

  return (
    <div className="relative w-full h-full bg-[#0a0e17] overflow-hidden">
      {/* Map canvas container */}
      <div ref={mapContainer} className="absolute inset-0 w-full h-full" />

      {/* Loading state indicator */}
      {!mapReady && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0d1117]/90 z-30 backdrop-blur-md">
          <div className="w-12 h-12 rounded-full border-3 border-[#00f0ff]/30 border-t-[#00f0ff] animate-spin mb-3" />
          <p className="font-sans text-sm font-semibold text-[#00f0ff] tracking-wide animate-pulse">
            Loading Satellite Earth Imagery & Radar Feeds...
          </p>
          <span className="text-xs text-[#849495] mt-1">Connecting to live meteorological grid</span>
        </div>
      )}

      {/* TOP LEFT: Basemap Switcher (Google Earth Satellite, Dark Radar, Terrain, OSM) */}
      <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
        <div className="bg-[#131722]/90 backdrop-blur-md p-1 rounded-lg border border-[#334155] shadow-2xl flex items-center gap-1">
          <button
            onClick={() => setActiveBasemap('satellite')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeBasemap === 'satellite'
                ? 'bg-[#0284c7] text-white shadow-lg shadow-sky-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title="Google Earth Satellite imagery with hybrid boundaries"
          >
            <i className="bi bi-globe-americas"></i>
            <span>Google Earth</span>
          </button>

          <button
            onClick={() => setActiveBasemap('dark')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeBasemap === 'dark'
                ? 'bg-[#0284c7] text-white shadow-lg shadow-sky-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title="Tactical dark theme (high contrast radar view)"
          >
            <i className="bi bi-moon-stars-fill"></i>
            <span>Dark Radar</span>
          </button>

          <button
            onClick={() => setActiveBasemap('terrain')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeBasemap === 'terrain'
                ? 'bg-[#0284c7] text-white shadow-lg shadow-sky-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title="Physical elevation & topography terrain"
          >
            <i className="bi bi-layers-fill"></i>
            <span>Terrain</span>
          </button>

          <button
            onClick={() => setActiveBasemap('osm')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeBasemap === 'osm'
                ? 'bg-[#0284c7] text-white shadow-lg shadow-sky-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title="OpenStreetMap Standard view"
          >
            <i className="bi bi-map-fill"></i>
            <span>Street</span>
          </button>
        </div>

        {/* Layer Toggles & Reset Button */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleResetView}
            className="bg-[#131722]/90 hover:bg-slate-800 text-slate-200 border border-[#334155] px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-lg backdrop-blur-md transition-all active:scale-95"
            title="Zoom back to full India view"
          >
            <i className="bi bi-arrow-counterclockwise"></i>
            <span>Reset View</span>
          </button>

          <button
            onClick={() => setShowControlPanel(!showControlPanel)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border shadow-lg backdrop-blur-md transition-all ${
              showControlPanel
                ? 'bg-slate-800 text-cyan-400 border-cyan-500/50'
                : 'bg-[#131722]/90 text-slate-300 border-[#334155] hover:text-white'
            }`}
          >
            <i className="bi bi-sliders"></i>
            <span>Layers {showControlPanel ? '▲' : '▼'}</span>
          </button>
        </div>

        {/* Dropdown Layer Toggles */}
        {showControlPanel && (
          <div className="bg-[#131722]/95 backdrop-blur-md p-3 rounded-lg border border-[#334155] shadow-2xl flex flex-col gap-2 w-52 text-xs text-slate-200">
            <div className="font-bold text-slate-400 uppercase tracking-wider text-[10px] pb-1 border-b border-slate-700">
              Map Overlays
            </div>
            <label className="flex items-center justify-between cursor-pointer hover:text-white">
              <span>State Boundaries</span>
              <input
                type="checkbox"
                checked={showBorders}
                onChange={(e) => setShowBorders(e.target.checked)}
                className="w-4 h-4 rounded text-cyan-500 focus:ring-0 cursor-pointer"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer hover:text-white">
              <span>Impact Risk Halos</span>
              <input
                type="checkbox"
                checked={showHalos}
                onChange={(e) => setShowHalos(e.target.checked)}
                className="w-4 h-4 rounded text-cyan-500 focus:ring-0 cursor-pointer"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer hover:text-white">
              <span>Forecast Trajectory</span>
              <input
                type="checkbox"
                checked={showTrajectory}
                onChange={(e) => setShowTrajectory(e.target.checked)}
                className="w-4 h-4 rounded text-cyan-500 focus:ring-0 cursor-pointer"
              />
            </label>
          </div>
        )}
      </div>

      {/* BOTTOM LEFT: Coordinates HUD */}
      <div className="absolute bottom-3 left-3 pointer-events-none flex items-center gap-3 bg-[#111827]/85 px-3 py-1.5 rounded-lg border border-slate-700/60 backdrop-blur-md text-xs font-mono text-slate-300 shadow-xl">
        <span className="text-cyan-400 font-semibold flex items-center gap-1">
          <i className="bi bi-pin-map-fill"></i>
          <span>INDIA REGION</span>
        </span>
        <span className="text-slate-600">|</span>
        <span>22.00°N, 79.50°E</span>
        <span className="text-slate-600">|</span>
        <span className="text-emerald-400 font-bold">{events.length} ACTIVE TARGETS</span>
      </div>

      {/* TOP RIGHT: Severity Legend */}
      <div className="absolute top-3 right-3 bg-[#131722]/90 backdrop-blur-md rounded-xl p-3 flex flex-col gap-1.5 z-10 border border-slate-700/60 shadow-2xl text-xs">
        <div className="font-bold text-slate-400 tracking-wider uppercase text-[10px] pb-1 border-b border-slate-700/60 flex items-center justify-between">
          <span>SEVERITY INDEX</span>
          <span className="text-[10px] text-cyan-400 lowercase font-normal">click to view</span>
        </div>
        {[
          { label: 'SEVERE', color: '#ff3b3b', desc: 'Risk > 80', count: events.filter(e => e.severity === 'SEVERE').length },
          { label: 'HIGH', color: '#ff8800', desc: 'Risk 60–80', count: events.filter(e => e.severity === 'HIGH').length },
          { label: 'ELEVATED', color: '#ffcc00', desc: 'Risk 40–60', count: events.filter(e => e.severity === 'ELEVATED').length },
          { label: 'MODERATE', color: '#38bdf8', desc: 'Risk 20–40', count: events.filter(e => e.severity === 'MODERATE').length },
          { label: 'LOW', color: '#00e5ff', desc: 'Risk < 20', count: events.filter(e => e.severity === 'LOW').length },
        ].map(({ label, color, desc, count }) => (
          <div key={label} className="flex items-center justify-between gap-3 text-xs py-0.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
              <span className="font-medium text-slate-200">{label}</span>
              <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">({desc})</span>
            </div>
            {count > 0 && (
              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded font-bold" style={{ background: `${color}25`, color }}>
                {count}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
