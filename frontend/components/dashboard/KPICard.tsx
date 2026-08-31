'use client';

interface KPICardProps {
  label: string;
  value: string | number;
  unit?: string;
  subtext?: string;
  severity?: 'normal' | 'warning' | 'danger' | 'info';
  icon?: string;
  loading?: boolean;
}

const SEVERITY_COLORS: Record<string, { text: string; glow: string; border: string; bg: string }> = {
  danger:  { text: '#ff4444', glow: '0 0 8px rgba(255,68,68,0.4)',   border: 'rgba(255,68,68,0.3)',   bg: 'rgba(255,68,68,0.05)' },
  warning: { text: '#ff8800', glow: '0 0 8px rgba(255,136,0,0.4)',  border: 'rgba(255,136,0,0.3)',   bg: 'rgba(255,136,0,0.05)' },
  info:    { text: '#00dbe9', glow: '0 0 8px rgba(0,219,233,0.4)',  border: 'rgba(0,219,233,0.3)',   bg: 'rgba(0,219,233,0.05)' },
  normal:  { text: '#e2e2e8', glow: 'none',                          border: 'rgba(59,73,75,0.5)',    bg: 'rgba(30,32,36,0.5)'   },
};

export default function KPICard({ label, value, unit, subtext, severity = 'normal', icon, loading }: KPICardProps) {
  const colors = SEVERITY_COLORS[severity];

  if (loading) {
    return (
      <div className="relative p-3 rounded-sm" style={{ background: '#1a1c20', border: '1px solid rgba(59,73,75,0.5)' }}>
        <div className="shimmer h-3 w-16 rounded mb-2" />
        <div className="shimmer h-8 w-12 rounded" />
      </div>
    );
  }

  return (
    <div className="relative p-3 rounded-sm hud-bracket transition-all duration-200 hover:scale-[1.01]"
      style={{
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        boxShadow: colors.glow !== 'none' ? colors.glow : undefined,
      }}>
      
      {/* Label row */}
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-[10px] font-medium tracking-widest uppercase text-on-surface-variant">
          {label}
        </span>
        {icon && (
          <span className="material-symbols-outlined text-[14px]" style={{ color: colors.text }}>
            {icon}
          </span>
        )}
      </div>

      {/* Value */}
      <div className="flex items-end gap-1">
        <span className="kpi-value text-3xl" style={{
          color: colors.text,
          textShadow: colors.glow !== 'none' ? colors.glow : undefined,
        }}>
          {value}
        </span>
        {unit && (
          <span className="font-mono text-xs text-on-surface-variant mb-1">{unit}</span>
        )}
      </div>

      {/* Subtext */}
      {subtext && (
        <div className="font-mono text-[10px] text-on-surface-variant mt-1 tracking-wide">
          {subtext}
        </div>
      )}
    </div>
  );
}
