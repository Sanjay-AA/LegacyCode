import React from 'react';

export default function Header({ status = 'Ready', stageStatus = 'idle' }) {
  // Determine header status indicator text and styling
  let badgeText = '● Ready';
  let badgeClass = 'text-[#10b981] bg-[#10b981]/10 border-[#10b981]/20';

  if (stageStatus === 'running') {
    badgeText = '● Migrating';
    badgeClass = 'text-sky-400 bg-sky-500/10 border-sky-500/30 animate-pulse';
  } else if (stageStatus === 'success' || stageStatus === 'ready_for_review') {
    badgeText = '✓ Complete';
    badgeClass = 'text-[#10b981] bg-[#10b981]/15 border-[#10b981]/30';
  } else if (stageStatus === 'error') {
    badgeText = '✕ Error';
    badgeClass = 'text-rose-400 bg-rose-500/10 border-rose-500/30';
  } else if (status) {
    if (status.toLowerCase().includes('shipped') || status.toLowerCase().includes('complete')) {
      badgeText = '✓ Complete';
      badgeClass = 'text-[#10b981] bg-[#10b981]/15 border-[#10b981]/30';
    } else if (status.toLowerCase().includes('active') || status.toLowerCase().includes('migrat')) {
      badgeText = '● Migrating';
      badgeClass = 'text-sky-400 bg-sky-500/10 border-sky-500/30 animate-pulse';
    }
  }

  return (
    <header className="border-b border-[#1c2e38] bg-[#0c1219] sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* LEFT: Minimal Branding */}
        <div className="flex items-center space-x-3">
          <h1 className="text-sm font-extrabold tracking-wider font-mono text-white flex items-center gap-2">
            <span>LEGACY</span>
            <span className="text-[#10b981]">RESCUE</span>
          </h1>
          <span className="text-slate-600 font-mono text-xs hidden sm:inline">•</span>
          <p className="text-xs text-slate-400 font-sans hidden sm:inline">
            Autonomous Code Modernization
          </p>
        </div>

        {/* RIGHT: Minimal Status Indicator */}
        <div className="flex items-center">
          <span className={`px-2.5 py-1 rounded-md border text-xs font-mono font-bold ${badgeClass}`}>
            {badgeText}
          </span>
        </div>
      </div>
    </header>
  );
}
