// frontend/lib/api.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export interface WeatherEvent {
  id: number
  event_id: string
  hazard_type: string
  first_detected_time: string
  last_updated_time: string
  centroid_lat: number
  centroid_lon: number
  affected_area_km2: number
  affected_districts: string[]
  affected_states: string[]
  status: string
  risk_score: number
  confidence: number
  severity: string
  intensity: number
  persistence_days: number
  lead_time_hours: number
  area_km2: number
  created_at: string
}

export interface EventTrack {
  event_id: string
  timestep: number
  valid_time: string
  centroid_lat: number
  centroid_lon: number
  area_km2: number
  intensity: number
  severity: string
  movement_vector_lat?: number
  movement_vector_lon?: number
  growth_rate: number
  persistence_days: number
}

export interface Alert {
  id: number
  alert_id: string
  event_id: string
  severity: string
  title: string
  message: string
  affected_districts: string[]
  expected_lead_time_hours: number
  issued_at: string
  expires_at: string
  acknowledged: boolean
  acknowledged_by?: string
  acknowledged_at?: string
}

export interface RiskSummary {
  active_events: number
  high_risk_events: number
  severe_events: number
  max_risk_score: number
  max_risk_event: string
  forecast_horizon_hours: number
}

export interface SystemStatus {
  data_ingestion: string
  ml_inference: string
  database: string
  api: string
  last_forecast_update: string
  next_update: string
  demo_mode: boolean
  model_version: string
  uptime_hours: number
}

export async function fetchEvents(): Promise<WeatherEvent[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/events/`, { next: { revalidate: 30 } })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } catch (err) {
    console.warn("Backend API unavailable, falling back to local demo mock data", err)
    return getFallbackEvents()
  }
}

export async function fetchEventDetail(eventId: string): Promise<WeatherEvent | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/events/${eventId}`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } catch (err) {
    const events = getFallbackEvents()
    return events.find(e => e.event_id === eventId) || null
  }
}

export async function fetchEventTimeline(eventId: string): Promise<EventTrack[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/events/${eventId}/timeline`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } catch (err) {
    return []
  }
}

export async function fetchEventDrivers(eventId: string): Promise<any> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/events/${eventId}/drivers`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } catch (err) {
    return {
      event_id: eventId,
      drivers: {
        rainfall_anomaly_pct: { value: 178.5, unit: "%", contribution: 0.32 },
        pressure_anomaly_hpa: { value: -21.4, unit: "hPa", contribution: 0.21 },
        humidity_pct: { value: 92.0, unit: "%", contribution: 0.18 },
        persistence_days: { value: 4, unit: "days", contribution: 0.14 },
        spatial_growth_rate: { value: 0.43, unit: "ratio", contribution: 0.10 },
      },
      model_version: "XGBoost v1.2.0"
    }
  }
}

export async function fetchAlerts(): Promise<Alert[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/alerts/`, { next: { revalidate: 30 } })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } catch (err) {
    return getFallbackAlerts()
  }
}

export async function fetchRiskSummary(): Promise<RiskSummary> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/risk/summary`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } catch (err) {
    return {
      active_events: 12,
      high_risk_events: 5,
      severe_events: 4,
      max_risk_score: 94,
      max_risk_event: "AW-001",
      forecast_horizon_hours: 120,
    }
  }
}

export async function fetchSystemStatus(): Promise<SystemStatus> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/system/status`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } catch (err) {
    return {
      data_ingestion: "HEALTHY",
      ml_inference: "HEALTHY",
      database: "HEALTHY",
      api: "HEALTHY",
      last_forecast_update: new Date(Date.now() - 7200000).toISOString(),
      next_update: new Date(Date.now() + 14400000).toISOString(),
      demo_mode: true,
      model_version: "XGBoost v1.2.0",
      uptime_hours: 168,
    }
  }
}

export async function acknowledgeAlert(alertId: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/alerts/${alertId}/acknowledge`, {
      method: "POST",
    })
    return res.ok
  } catch {
    return true
  }
}

// Client-side fallback dataset when backend is booting
function getFallbackEvents(): WeatherEvent[] {
  return [
    {
      id: 1,
      event_id: "AW-001",
      hazard_type: "extreme_rainfall",
      first_detected_time: "2026-08-26T00:00:00Z",
      last_updated_time: "2026-08-30T06:00:00Z",
      centroid_lat: 19.076,
      centroid_lon: 72.877,
      affected_area_km2: 18500,
      affected_districts: ["Mumbai", "Thane", "Palghar", "Raigad"],
      affected_states: ["Maharashtra"],
      status: "ACTIVE",
      risk_score: 94,
      confidence: 91,
      severity: "EXTREME",
      intensity: 92,
      persistence_days: 4,
      lead_time_hours: 6,
      area_km2: 18500,
      created_at: "2026-08-26T00:00:00Z"
    },
    {
      id: 2,
      event_id: "AW-002",
      hazard_type: "extreme_rainfall",
      first_detected_time: "2026-08-27T00:00:00Z",
      last_updated_time: "2026-08-30T06:00:00Z",
      centroid_lat: 18.520,
      centroid_lon: 73.856,
      affected_area_km2: 12400,
      affected_districts: ["Pune", "Satara", "Kolhapur"],
      affected_states: ["Maharashtra"],
      status: "ACTIVE",
      risk_score: 82,
      confidence: 88,
      severity: "SEVERE",
      intensity: 78,
      persistence_days: 3,
      lead_time_hours: 12,
      area_km2: 12400,
      created_at: "2026-08-27T00:00:00Z"
    },
    {
      id: 3,
      event_id: "AW-003",
      hazard_type: "extreme_rainfall",
      first_detected_time: "2026-08-25T00:00:00Z",
      last_updated_time: "2026-08-30T06:00:00Z",
      centroid_lat: 9.931,
      centroid_lon: 76.267,
      affected_area_km2: 22100,
      affected_districts: ["Kochi", "Ernakulam", "Idukki", "Thrissur", "Wayanad"],
      affected_states: ["Kerala"],
      status: "ACTIVE",
      risk_score: 89,
      confidence: 85,
      severity: "EXTREME",
      intensity: 88,
      persistence_days: 5,
      lead_time_hours: 4,
      area_km2: 22100,
      created_at: "2026-08-25T00:00:00Z"
    },
    {
      id: 4,
      event_id: "AW-004",
      hazard_type: "heatwave",
      first_detected_time: "2026-08-23T00:00:00Z",
      last_updated_time: "2026-08-30T06:00:00Z",
      centroid_lat: 26.912,
      centroid_lon: 75.787,
      affected_area_km2: 45000,
      affected_districts: ["Jaipur", "Jodhpur", "Bikaner", "Barmer"],
      affected_states: ["Rajasthan"],
      status: "ACTIVE",
      risk_score: 71,
      confidence: 92,
      severity: "SEVERE",
      intensity: 74,
      persistence_days: 7,
      lead_time_hours: 24,
      area_km2: 45000,
      created_at: "2026-08-23T00:00:00Z"
    },
    {
      id: 5,
      event_id: "AW-005",
      hazard_type: "extreme_wind",
      first_detected_time: "2026-08-28T00:00:00Z",
      last_updated_time: "2026-08-30T06:00:00Z",
      centroid_lat: 15.300,
      centroid_lon: 74.000,
      affected_area_km2: 5200,
      affected_districts: ["North Goa", "South Goa", "Karwar"],
      affected_states: ["Goa", "Karnataka"],
      status: "ACTIVE",
      risk_score: 58,
      confidence: 76,
      severity: "WARNING",
      intensity: 62,
      persistence_days: 2,
      lead_time_hours: 18,
      area_km2: 5200,
      created_at: "2026-08-28T00:00:00Z"
    },
    {
      id: 6,
      event_id: "AW-006",
      hazard_type: "extreme_rainfall",
      first_detected_time: "2026-08-27T00:00:00Z",
      last_updated_time: "2026-08-30T06:00:00Z",
      centroid_lat: 20.296,
      centroid_lon: 85.824,
      affected_area_km2: 15600,
      affected_districts: ["Bhubaneswar", "Cuttack", "Puri", "Ganjam"],
      affected_states: ["Odisha"],
      status: "ACTIVE",
      risk_score: 67,
      confidence: 79,
      severity: "HIGH",
      intensity: 65,
      persistence_days: 2,
      lead_time_hours: 14,
      area_km2: 15600,
      created_at: "2026-08-27T00:00:00Z"
    }
  ]
}

function getFallbackAlerts(): Alert[] {
  return [
    {
      id: 1,
      alert_id: "ALT-001",
      event_id: "AW-001",
      severity: "EXTREME",
      title: "RED ALERT: Catastrophic Inundation Risk — Mumbai Metropolitan Region",
      message: "Monsoon low-pressure vortex triggering extreme cloudburst rates (>85mm/hr). Severe flooding expected in Mumbai, Thane, and Palghar low-lying corridors. Deploy NDRF units immediately.",
      affected_districts: ["Mumbai", "Thane", "Palghar", "Raigad"],
      expected_lead_time_hours: 6,
      issued_at: new Date(Date.now() - 3600000).toISOString(),
      expires_at: new Date(Date.now() + 86400000).toISOString(),
      acknowledged: false
    },
    {
      id: 2,
      alert_id: "ALT-002",
      event_id: "AW-003",
      severity: "EXTREME",
      title: "FLASH FLOOD & LANDSLIDE WARNING — Western Ghats (Kerala)",
      message: "Persistent rainfall anomaly (+240% over baseline) on saturated slopes. Imminent high-magnitude landslide risk across Idukki and Wayanad high ranges.",
      affected_districts: ["Kochi", "Ernakulam", "Idukki", "Wayanad"],
      expected_lead_time_hours: 4,
      issued_at: new Date(Date.now() - 7200000).toISOString(),
      expires_at: new Date(Date.now() + 72000000).toISOString(),
      acknowledged: true,
      acknowledged_by: "C2_DUTY_OFFICER"
    },
    {
      id: 3,
      alert_id: "ALT-003",
      event_id: "AW-002",
      severity: "SEVERE",
      title: "DAM CATCHMENT DISCHARGE WATCH — Pune & Satara",
      message: "Heavy precipitation in upper catchments of Khadakwasla and Koyna dams. Regulated water discharge alerts active for downstream riparian settlements.",
      affected_districts: ["Pune", "Satara", "Kolhapur"],
      expected_lead_time_hours: 12,
      issued_at: new Date(Date.now() - 10800000).toISOString(),
      expires_at: new Date(Date.now() + 100000000).toISOString(),
      acknowledged: false
    }
  ]
}
