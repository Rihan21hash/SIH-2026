'use client';

interface SideNavProps {
  activeItem?: string;
  onOpenGuide?: () => void;
  onOpenAlerts?: () => void;
}

export default function SideNav({ activeItem = 'map', onOpenGuide, onOpenAlerts }: SideNavProps) {
  return (
    <aside className="fixed top-16 left-0 h-[calc(100vh-64px)] z-40 w-[72px] flex flex-col items-center justify-between py-3 bg-[#0d111a] border-r border-slate-800">
      {/* Top items */}
      <div className="flex flex-col items-center gap-1.5 w-full">
        {/* Map */}
        <button
          className="w-full flex flex-col items-center justify-center py-3 gap-1 relative bg-cyan-500/10 border-r-2 border-cyan-400 text-cyan-300 cursor-pointer"
          title="Live Operational Map"
        >
          <span className="material-symbols-outlined text-[24px] text-cyan-400">map</span>
          <span className="text-[10px] font-bold uppercase tracking-wider">Map</span>
        </button>

        {/* Alerts */}
        <button
          onClick={onOpenAlerts}
          className="w-full flex flex-col items-center justify-center py-3 gap-1 relative text-slate-400 hover:text-red-400 hover:bg-slate-800/50 transition-all cursor-pointer"
          title="Active Meteorological Alerts"
        >
          <span className="material-symbols-outlined text-[24px]">notification_important</span>
          <span className="text-[10px] font-medium uppercase tracking-wider">Alerts</span>
        </button>

        {/* Scientific Analysis */}
        <button
          onClick={onOpenGuide}
          className="w-full flex flex-col items-center justify-center py-3 gap-1 relative text-slate-400 hover:text-cyan-300 hover:bg-slate-800/50 transition-all cursor-pointer"
          title="Mathematical & ML Methodology"
        >
          <span className="material-symbols-outlined text-[24px]">analytics</span>
          <span className="text-[10px] font-medium uppercase tracking-wider">Method</span>
        </button>
      </div>

      {/* Bottom items */}
      <div className="flex flex-col items-center gap-1 w-full border-t border-slate-800/80 pt-3">
        {/* Help & Guide */}
        <button
          onClick={onOpenGuide}
          className="w-full flex flex-col items-center justify-center py-2.5 gap-1 text-slate-400 hover:text-cyan-300 hover:bg-slate-800/50 transition-all cursor-pointer"
          title="Help & User Manual"
        >
          <span className="material-symbols-outlined text-[22px]">help</span>
          <span className="text-[10px] font-medium uppercase tracking-wider">Guide</span>
        </button>
      </div>
    </aside>
  );
}
