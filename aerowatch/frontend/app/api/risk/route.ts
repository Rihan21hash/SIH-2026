import { NextResponse } from 'next/server'

export async function GET() {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
  try {
    const res = await fetch(`${backendUrl}/api/risk/summary`, { next: { revalidate: 10 } })
    if (res.ok) {
      const data = await res.json()
      return NextResponse.json(data)
    }
  } catch (err) {
    // Fallback
  }
  return NextResponse.json({
    active_events: 12,
    high_risk_events: 5,
    severe_events: 4,
    max_risk_score: 94,
    max_risk_event: "AW-001",
    forecast_horizon_hours: 120,
  })
}
