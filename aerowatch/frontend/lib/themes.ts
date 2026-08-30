// frontend/lib/themes.ts

export const C2_COLORS = {
  // Background
  darkBg: '#0D1117',
  cardBg: '#161B22',
  panelBg: '#1F242C',
  subtleBg: '#090D12',
  
  // Text
  textPrimary: '#F0F6FC',
  textSecondary: '#8B949E',
  textMuted: '#6E7681',
  textAccent: '#58A6FF',
  
  // Borders & Dividers
  border: '#30363D',
  borderHighlight: '#58A6FF',
  divider: '#21262D',
  
  // Severity / Status colors
  normal: '#2EA043',       // Green
  watch: '#E3B341',        // Yellow
  warning: '#D29922',      // Amber
  severe: '#F85149',       // Red
  extreme: '#DA3633',      // Dark Crimson Red
  
  // Primary/Secondary
  primary: '#1F6FEB',      // C2 Cyber Blue
  secondary: '#388BFD',    // Active Accent Blue
  accent: '#FF7B72',       // Alert Accent
  cyan: '#39C5BB',         // Sensor Cyan
  
  // Charts
  chartLine1: '#58A6FF',
  chartLine2: '#3FB950',
  chartLine3: '#D29922',
  chartLine4: '#F85149',
}

export const SEVERITY_BADGE_CLASSES: Record<string, string> = {
  NORMAL: 'bg-emerald-950/70 text-emerald-400 border border-emerald-500/30',
  WATCH: 'bg-amber-950/70 text-amber-300 border border-amber-500/30',
  WARNING: 'bg-orange-950/70 text-orange-400 border border-orange-500/30',
  HIGH: 'bg-orange-950/70 text-orange-400 border border-orange-500/30',
  SEVERE: 'bg-rose-950/70 text-rose-400 border border-rose-500/40 animate-pulse',
  EXTREME: 'bg-red-950/90 text-red-300 border border-red-500/60 font-bold animate-pulse',
}

export const HAZARD_LABELS: Record<string, string> = {
  extreme_rainfall: 'EXTREME RAINFALL',
  heatwave: 'HEATWAVE',
  extreme_wind: 'SEVERE WIND / GALE',
  cold_wave: 'COLD WAVE',
  thunderstorm: 'SEVERE THUNDERSTORM',
}
