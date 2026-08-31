import type { WeatherEvent, SystemStatus, ApiResponse, DataMode } from '@/types';
import { DEMO_EVENTS, DEMO_STATUS } from './demo-data';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const TIMEOUT_MS = 8000;

async function fetchWithTimeout<T>(url: string, options?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const tid = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } finally {
    clearTimeout(tid);
  }
}

// ─── API Client ──────────────────────────────────────────────────────────────

export async function fetchStatus(): Promise<{ data: SystemStatus; mode: DataMode }> {
  try {
    const data = await fetchWithTimeout<SystemStatus>(`${API_BASE}/api/status`);
    return { data, mode: 'LIVE' };
  } catch {
    return { data: { ...DEMO_STATUS, data_mode: 'DEMO' }, mode: 'DEMO' };
  }
}

export async function fetchEvents(): Promise<{ data: WeatherEvent[]; mode: DataMode }> {
  try {
    const res = await fetchWithTimeout<ApiResponse<WeatherEvent[]>>(`${API_BASE}/api/events`);
    return { data: res.data, mode: 'LIVE' };
  } catch {
    return { data: DEMO_EVENTS, mode: 'DEMO' };
  }
}

export async function fetchEvent(id: string): Promise<{ data: WeatherEvent | null; mode: DataMode }> {
  try {
    const res = await fetchWithTimeout<ApiResponse<WeatherEvent>>(`${API_BASE}/api/events/${id}`);
    return { data: res.data, mode: 'LIVE' };
  } catch {
    const found = DEMO_EVENTS.find(e => e.event_id === id) ?? null;
    return { data: found, mode: 'DEMO' };
  }
}

export async function fetchHealth(): Promise<boolean> {
  try {
    await fetchWithTimeout(`${API_BASE}/health`);
    return true;
  } catch {
    return false;
  }
}

export function formatTimeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function severityColor(severity: string): string {
  const map: Record<string, string> = {
    SEVERE: '#ff4444',
    HIGH: '#ff8800',
    ELEVATED: '#ffcc00',
    MODERATE: '#44aaff',
    LOW: '#00dbe9',
  };
  return map[severity] ?? '#b9cacb';
}

export function riskColor(score: number): string {
  if (score > 80) return '#ff4444';
  if (score > 60) return '#ff8800';
  if (score > 40) return '#ffcc00';
  if (score > 20) return '#44aaff';
  return '#00dbe9';
}
