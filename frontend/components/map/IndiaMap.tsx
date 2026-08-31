'use client';

import { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { WeatherEvent, EventTimestep } from '@/types';
import { severityColor, riskColor } from '@/lib/api';

interface IndiaMapProps {
  events: WeatherEvent[];
  selectedId: string | null;
  onSelectEvent: (id: string) => void;
  timeStepIndex: number;
}

const INDIA_CENTER: [number, number] = [82.5, 22.5];
const INDIA_ZOOM = 4.2;

// Severity to MapLibre color
function sevToColor(severity: string): string {
  const m: Record<string, string> = {
    SEVERE:   '#ff4444',
    HIGH:     '#ff8800',
    ELEVATED: '#ffcc00',
    MODERATE: '#44aaff',
    LOW:      '#00dbe9',
  };
  return m[severity] ?? '#b9cacb';
}

export default function IndiaMap({ events, selectedId, onSelectEvent, timeStepIndex }: IndiaMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState(false);

  // Get position for event at given timestep
  function getEventPos(event: WeatherEvent): { lat: number; lon: number; risk: number; severity: string } {
    const step: EventTimestep | undefined = event.timeline[timeStepIndex];
    if (step) return { lat: step.lat, lon: step.lon, risk: step.risk_score, severity: step.severity };
    return { lat: event.location.lat, lon: event.location.lon, risk: event.risk_score, severity: event.severity };
  }

  useEffect(() => {
    let mounted = true;

    function initMap() {
      if (!mapContainer.current) return;
      try {
        if (!mounted || !mapContainer.current) return;

        const map = new maplibregl.Map({
          container: mapContainer.current,
          style: {
            version: 8,
            glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
            sources: {
              // Raster base from CARTO dark (free, no key needed)
              carto: {
                type: 'raster',
                tiles: [
                  'https://basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png',
                ],
                tileSize: 256,
                attribution: '© CARTO © OpenStreetMap contributors',
              },
            },
            layers: [
              {
                id: 'background',
                type: 'background',
                paint: { 'background-color': '#111318' },
              },
              {
                id: 'carto-base',
                type: 'raster',
                source: 'carto',
                paint: {
                  'raster-opacity': 0.6,
                  'raster-saturation': -0.8,
                  'raster-brightness-min': 0,
                  'raster-brightness-max': 0.5,
                },
              },
            ],
          },
          center: INDIA_CENTER,
          zoom: INDIA_ZOOM,
          minZoom: 3,
          maxZoom: 12,
          attributionControl: false,
        });

        map.on('load', async () => {
          if (!mounted) return;

          // Add India states GeoJSON
          try {
            const geoRes = await fetch('/india_states.geojson');
            if (geoRes.ok) {
              const geoData = await geoRes.json();
              map.addSource('india-states', { type: 'geojson', data: geoData });
              map.addLayer({
                id: 'india-state-fill',
                type: 'fill',
                source: 'india-states',
                paint: {
                  'fill-color': 'rgba(0, 219, 233, 0.02)',
                  'fill-outline-color': 'rgba(0, 219, 233, 0.25)',
                },
              });
              map.addLayer({
                id: 'india-state-line',
                type: 'line',
                source: 'india-states',
                paint: {
                  'line-color': 'rgba(0, 219, 233, 0.35)',
                  'line-width': 0.8,
                },
              });
            }
          } catch { /* boundaries optional */ }

          // Add event sources and layers
          map.addSource('events', {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: [],
            },
          });

          // Heatmap-like area layer
          map.addLayer({
            id: 'event-area',
            type: 'circle',
            source: 'events',
            paint: {
              'circle-radius': ['interpolate', ['linear'], ['zoom'],
                3, ['*', ['get', 'risk_radius'], 1],
                8, ['*', ['get', 'risk_radius'], 3],
              ],
              'circle-color': ['get', 'color'],
              'circle-opacity': 0.08,
              'circle-blur': 1.2,
            },
          });

          // Main event circle
          map.addLayer({
            id: 'event-circle',
            type: 'circle',
            source: 'events',
            paint: {
              'circle-radius': ['interpolate', ['linear'], ['zoom'],
                3, 8,
                8, 20,
              ],
              'circle-color': ['get', 'color'],
              'circle-opacity': 0.85,
              'circle-stroke-color': '#ffffff',
              'circle-stroke-width': 0.5,
              'circle-stroke-opacity': 0.4,
            },
          });

          // Selected ring
          map.addLayer({
            id: 'event-selected',
            type: 'circle',
            source: 'events',
            filter: ['==', ['get', 'selected'], true],
            paint: {
              'circle-radius': ['interpolate', ['linear'], ['zoom'],
                3, 14,
                8, 30,
              ],
              'circle-color': 'transparent',
              'circle-stroke-color': ['get', 'color'],
              'circle-stroke-width': 2,
              'circle-stroke-opacity': 0.9,
            },
          });

          // Risk label
          map.addLayer({
            id: 'event-label',
            type: 'symbol',
            source: 'events',
            layout: {
              'text-field': ['get', 'risk_str'],
              'text-font': ['Noto Sans Regular'],
              'text-size': 9,
              'text-anchor': 'center',
            },
            paint: {
              'text-color': '#ffffff',
              'text-halo-color': ['get', 'color'],
              'text-halo-width': 1,
            },
          });

          // Click handler
          map.on('click', 'event-circle', (e) => {
            const f = e.features?.[0];
            if (f?.properties?.id) {
              onSelectEvent(f.properties.id);
            }
          });

          // Cursor
          map.on('mouseenter', 'event-circle', () => {
            map.getCanvas().style.cursor = 'pointer';
          });
          map.on('mouseleave', 'event-circle', () => {
            map.getCanvas().style.cursor = '';
          });

          // Popup on hover
          const popup = new maplibregl.Popup({
            closeButton: false,
            closeOnClick: false,
            className: 'aero-popup',
            offset: 20,
          });
          map.on('mouseenter', 'event-circle', (e) => {
            const f = e.features?.[0];
            if (!f?.properties) return;
            const { hazard, state, risk, severity } = f.properties;
            const col = sevToColor(severity);
            popup.setLngLat(e.lngLat)
              .setHTML(`
                <div style="background:#1e2024;border:1px solid ${col}40;padding:8px 10px;border-radius:2px;font-family:'JetBrains Mono',monospace">
                  <div style="color:${col};font-size:10px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:4px">${severity}</div>
                  <div style="color:#e2e2e8;font-size:12px;font-weight:600;margin-bottom:2px">${hazard?.replace(/_/g, ' ')}</div>
                  <div style="color:#b9cacb;font-size:11px;margin-bottom:6px">${state}</div>
                  <div style="display:flex;align-items:center;gap:8px">
                    <span style="color:#849495;font-size:10px">RISK</span>
                    <span style="color:${col};font-size:14px;font-weight:700">${risk}</span>
                  </div>
                </div>`)
              .addTo(map);
          });
          map.on('mouseleave', 'event-circle', () => popup.remove());

          mapRef.current = map;
          setMapReady(true);
        });

        map.on('error', () => setMapError(true));
      } catch (err) {
        console.error('MapLibre init error:', err);
        setMapError(true);
      }
    }

    initMap();
    return () => {
      mounted = false;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // Update event features when events or timestep changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    const src = map.getSource('events') as import('maplibre-gl').GeoJSONSource | undefined;
    if (!src) return;

    const features = events.map(ev => {
      const pos = getEventPos(ev);
      const color = sevToColor(pos.severity);
      return {
        type: 'Feature' as const,
        geometry: { type: 'Point' as const, coordinates: [pos.lon, pos.lat] },
        properties: {
          id: ev.event_id,
          hazard: ev.hazard_type,
          state: ev.location.state,
          severity: pos.severity,
          risk: pos.risk,
          risk_str: String(pos.risk),
          color,
          risk_radius: Math.max(10, pos.risk / 4),
          selected: ev.event_id === selectedId,
        },
      };
    });

    src.setData({ type: 'FeatureCollection', features });

    // Update selected filter
    if (map.getLayer('event-selected')) {
      map.setFilter('event-selected', selectedId
        ? ['==', ['get', 'id'], selectedId]
        : ['==', ['get', 'id'], '']);
    }
  }, [events, selectedId, timeStepIndex, mapReady]);

  // Fly to selected event
  useEffect(() => {
    if (!selectedId || !mapRef.current || !mapReady) return;
    const ev = events.find(e => e.event_id === selectedId);
    if (!ev) return;
    const pos = getEventPos(ev);
    mapRef.current.flyTo({
      center: [pos.lon, pos.lat],
      zoom: Math.max(6, mapRef.current.getZoom()),
      duration: 1000,
      essential: true,
    });
  }, [selectedId, mapReady]);

  return (
    <div className="relative w-full h-full">
      {/* Map container */}
      <div ref={mapContainer} className="absolute inset-0" />

      {/* Map grid overlay */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `
          linear-gradient(to right, rgba(0, 219, 233, 0.025) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(0, 219, 233, 0.025) 1px, transparent 1px)`,
        backgroundSize: '60px 60px',
      }} />

      {/* Loading state */}
      {!mapReady && !mapError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background z-10">
          <div className="w-12 h-12 rounded-sm border-2 border-primary-container/40 border-t-primary-container animate-spin mb-4" />
          <p className="font-mono text-xs text-on-surface-variant tracking-widest uppercase animate-pulse">
            Initializing map...
          </p>
        </div>
      )}

      {/* Error fallback */}
      {mapError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background z-10">
          <span className="material-symbols-outlined text-3xl text-on-surface-variant mb-3">map_off</span>
          <p className="font-mono text-xs text-on-surface-variant tracking-wider uppercase mb-1">Map Unavailable</p>
          <p className="font-sans text-[11px] text-on-surface-variant/60">Check network connection</p>
        </div>
      )}

      {/* Coordinate display */}
      <div className="absolute bottom-3 left-3 font-mono text-[10px] text-on-surface-variant/50 pointer-events-none">
        {INDIA_CENTER[1].toFixed(2)}°N {INDIA_CENTER[0].toFixed(2)}°E
      </div>

      {/* Legend */}
      <div className="absolute top-3 right-3 glass rounded-sm p-2 flex flex-col gap-1.5">
        <div className="font-mono text-[9px] text-on-surface-variant tracking-widest uppercase mb-1">Severity</div>
        {[
          { label: 'Severe',   color: '#ff4444' },
          { label: 'High',     color: '#ff8800' },
          { label: 'Elevated', color: '#ffcc00' },
          { label: 'Moderate', color: '#44aaff' },
          { label: 'Low',      color: '#00dbe9' },
        ].map(({ label, color }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
            <span className="font-mono text-[10px] text-on-surface-variant">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
