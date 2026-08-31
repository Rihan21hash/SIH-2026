// AeroWatch type definitions

export type SeverityLevel = 'LOW' | 'MODERATE' | 'ELEVATED' | 'HIGH' | 'SEVERE';
export type DataMode = 'LIVE' | 'DEMO';
export type EventType = 'CYCLONE' | 'FLOOD' | 'HEATWAVE' | 'CLOUDBURST' | 'DROUGHT' | 'STORM' | 'COLD_WAVE';

export interface AnomalyDrivers {
  rainfall_anomaly_pct: number;      // % deviation from baseline
  temperature_anomaly_c: number;     // °C deviation
  wind_anomaly_pct: number;          // % deviation
  pressure_anomaly_hpa: number;      // hPa deviation (negative = low)
  persistence_days: number;          // days event has persisted
  spatial_growth_pct: number;        // % area growth
}

export interface EventLocation {
  lat: number;
  lon: number;
  state: string;
  district?: string;
  region_name: string;
}

export interface WeatherEvent {
  event_id: string;
  hazard_type: EventType;
  severity: SeverityLevel;
  risk_score: number;           // 0–100
  confidence: number;           // 0–100
  start_time: string;           // ISO datetime
  expected_duration_hours: number;
  location: EventLocation;
  affected_districts: string[];
  affected_area_km2: number;
  movement_direction?: string;  // e.g. "NNE"
  movement_speed_kmh?: number;
  growth_rate_pct: number;
  forecast_lead_hours: number;
  anomaly_drivers: AnomalyDrivers;
  timeline: EventTimestep[];
}

export interface EventTimestep {
  timestep: string;             // "T0" | "T+12h" | "T+24h" | "T+36h" | "T+48h" | "T+72h"
  offset_hours: number;
  lat: number;
  lon: number;
  risk_score: number;
  severity: SeverityLevel;
  intensity_value: number;
  affected_area_km2: number;
}

export interface SystemStatus {
  system_online: boolean;
  data_mode: DataMode;
  forecast_cycle: string;       // e.g. "00Z"
  last_updated: string;         // ISO datetime
  active_event_count: number;
  high_risk_count: number;
  severe_count: number;
  affected_districts_count: number;
  max_risk_score: number;
  forecast_lead_hours: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  mode: DataMode;
  timestamp: string;
  error?: string;
}

export interface KPIData {
  active_events: number;
  high_risk_events: number;
  severe_events: number;
  affected_districts: number;
  max_risk: number;
  forecast_lead_hours: number;
}
