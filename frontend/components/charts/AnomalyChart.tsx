'use client';

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { WeatherEvent } from '@/types';
import { riskColor } from '@/lib/api';

interface AnomalyChartProps {
  event: WeatherEvent;
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-sm px-3 py-2">
      <div className="font-mono text-[10px] text-on-surface-variant mb-1">{label}</div>
      <div className="font-mono text-sm font-bold" style={{ color: riskColor(payload[0].value) }}>
        Risk: {payload[0].value}
      </div>
    </div>
  );
};

export default function AnomalyChart({ event }: AnomalyChartProps) {
  const data = event.timeline.map(step => ({
    name: step.timestep,
    risk: step.risk_score,
    area: step.affected_area_km2,
  }));

  const maxRisk = Math.max(...data.map(d => d.risk));
  const gradientColor = riskColor(maxRisk);

  return (
    <div className="w-full h-28">
      <div className="font-mono text-[10px] text-on-surface-variant tracking-widest uppercase mb-2">
        Risk Trajectory
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={gradientColor} stopOpacity={0.3} />
              <stop offset="95%" stopColor={gradientColor} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="name"
            tick={{ fontFamily: 'JetBrains Mono', fontSize: 9, fill: '#849495' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontFamily: 'JetBrains Mono', fontSize: 9, fill: '#849495' }}
            axisLine={false}
            tickLine={false}
            ticks={[0, 25, 50, 75, 100]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="risk"
            stroke={gradientColor}
            strokeWidth={1.5}
            fill="url(#riskGrad)"
            dot={{ fill: gradientColor, strokeWidth: 0, r: 2 }}
            activeDot={{ fill: gradientColor, stroke: '#111318', strokeWidth: 2, r: 4 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
