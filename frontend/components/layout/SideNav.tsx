'use client';

interface SideNavProps {
  activeItem?: string;
}

const NAV_ITEMS = [
  { id: 'map',      icon: 'map',            label: 'Map' },
  { id: 'events',   icon: 'cyclone',        label: 'Events' },
  { id: 'alerts',   icon: 'notification_important', label: 'Alerts' },
  { id: 'analysis', icon: 'analytics',      label: 'Analysis' },
  { id: 'timeline', icon: 'schedule',       label: 'Timeline' },
];

const BOTTOM_ITEMS = [
  { id: 'settings', icon: 'settings',  label: 'Settings' },
  { id: 'help',     icon: 'help',      label: 'Help' },
];

export default function SideNav({ activeItem = 'map' }: SideNavProps) {
  return (
    <aside className="fixed top-16 left-0 h-[calc(100vh-64px)] z-40 w-[72px] flex flex-col items-center justify-between py-3
      bg-surface-container-lowest/70 backdrop-blur-xl border-r border-white/[0.06]">
      
      {/* Top items */}
      <div className="flex flex-col items-center gap-1 w-full">
        {NAV_ITEMS.map(({ id, icon, label }) => {
          const isActive = id === activeItem;
          return (
            <a key={id} href="#"
              className={`nav-item w-full flex flex-col items-center justify-center py-3.5 gap-1 relative
                ${isActive
                  ? 'nav-active'
                  : 'text-on-surface-variant opacity-70 hover:opacity-100 hover:bg-surface-container-high/40 border-r-3 border-transparent'
                }`}>
              <span className={`material-symbols-outlined text-[22px] ${isActive ? 'glow-cyan' : ''}`}
                style={{ color: isActive ? '#00f0ff' : undefined }}>
                {icon}
              </span>
              <span className="font-mono text-[9px] font-medium tracking-wider uppercase"
                style={{ color: isActive ? '#00dbe9' : undefined }}>
                {label}
              </span>
              {isActive && (
                <div className="absolute right-0 top-0 bottom-0 w-0.5 rounded-l-full"
                  style={{ background: 'linear-gradient(to bottom, transparent, #00f0ff, transparent)' }} />
              )}
            </a>
          );
        })}
      </div>

      {/* Divider */}
      <div className="w-8 h-px bg-outline-variant/50 my-2" />

      {/* Bottom items */}
      <div className="flex flex-col items-center gap-1 w-full">
        {BOTTOM_ITEMS.map(({ id, icon, label }) => (
          <a key={id} href="#"
            className="nav-item w-full flex flex-col items-center justify-center py-3 gap-1
              text-on-surface-variant opacity-50 hover:opacity-80 hover:bg-surface-container-high/40">
            <span className="material-symbols-outlined text-[20px]">{icon}</span>
            <span className="font-mono text-[9px] tracking-wider uppercase">{label}</span>
          </a>
        ))}
      </div>
    </aside>
  );
}
