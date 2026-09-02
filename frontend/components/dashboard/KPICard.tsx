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

const SEVERITY_STYLES: Record<string, { text: string; bg: string; border: string }> = {
  danger:  { text: '#f87171', border: 'rgba(239, 68, 68, 0.4)',  bg: 'rgba(239, 68, 68, 0.1)' },
  warning: { text: '#fb923c', border: 'rgba(249, 115, 22, 0.4)', bg: 'rgba(249, 115, 22, 0.1)' },
  info:    { text: '#38bdf8', border: 'rgba(56, 189, 248, 0.4)', bg: 'rgba(56, 189, 248, 0.1)' },
  normal:  { text: '#e2e8f0', border: 'rgba(51, 65, 85, 0.6)',   bg: 'rgba(15, 23, 42, 0.6)' },
};

export default function KPICard({ label, value, unit, subtext, severity = 'normal', icon, loading }: KPICardProps) {
  const styles = SEVERITY_STYLES[severity] || SEVERITY_STYLES.normal;

  if (loading) {
    return (
      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 animate-pulse flex flex-col justify-between">
        <div className="h-3 w-16 bg-slate-800 rounded mb-2" />
        <div className="h-7 w-12 bg-slate-800 rounded" />
      </div>
    );
  }

  return (
    <div
      className="p-3 rounded-xl transition-all duration-200 hover:border-slate-600 flex flex-col justify-between border shadow-md"
      style={{
        background: styles.bg,
        borderColor: styles.border,
      }}
    >
      {/* Label row */}
      <div className="flex items-center justify-between gap-1 mb-1">
        <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider truncate">
          {label}
        </span>
        {icon && (
          <span className="material-symbols-outlined text-[16px]" style={{ color: styles.text }}>
            {icon}
          </span>
        )}
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-1 my-0.5">
        <span className="text-2xl font-bold font-mono tracking-tight" style={{ color: styles.text }}>
          {value}
        </span>
        {unit && (
          <span className="text-xs text-slate-400 font-semibold">{unit}</span>
        )}
      </div>

      {/* Subtext */}
      {subtext && (
        <div className="text-[10px] text-slate-400 truncate">
          {subtext}
        </div>
      )}
    </div>
  );
}
