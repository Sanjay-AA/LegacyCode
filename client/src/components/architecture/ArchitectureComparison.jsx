import React from 'react';
import { ArrowRight, Layers, ShieldCheck, Sparkles, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function ArchitectureComparison({ comparison, legacyArch, modernArch }) {
  if (!comparison) return null;

  const { legacySummary, modernSummary, comparisons } = comparison;

  return (
    <div className="space-y-6 font-mono">
      {/* Top Paradigm Summary Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Legacy Summary Card */}
        <div className="bg-rose-950/20 border border-rose-500/30 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-rose-500/20">
            <h4 className="text-sm font-bold text-rose-400 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>LEGACY ARCHITECTURE</span>
            </h4>
            <span className="text-xs bg-rose-500/20 text-rose-300 px-2.5 py-0.5 rounded-full border border-rose-500/30">
              Health: {legacyArch?.healthScore || 42}/100
            </span>
          </div>

          <div className="space-y-1.5 text-xs text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-400">Framework:</span>
              <span className="font-bold text-slate-200">{legacySummary?.framework || 'jQuery'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">UI Paradigm:</span>
              <span className="font-bold text-slate-200">{legacySummary?.paradigm || 'Imperative DOM'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">State Model:</span>
              <span className="font-bold text-slate-200">{legacySummary?.stateModel || 'Global / Direct DOM'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Module System:</span>
              <span className="font-bold text-slate-200">{legacySummary?.moduleSystem || 'Global Script Tags'}</span>
            </div>
          </div>
        </div>

        {/* Modern Summary Card */}
        <div className="bg-emerald-950/20 border border-[#10b981]/30 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#10b981]/20">
            <h4 className="text-sm font-bold text-[#10b981] flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-[#10b981]" />
              <span>MODERN ARCHITECTURE</span>
            </h4>
            <span className="text-xs bg-[#10b981]/20 text-[#10b981] px-2.5 py-0.5 rounded-full border border-[#10b981]/30">
              Health: {modernArch?.healthScore || 92}/100
            </span>
          </div>

          <div className="space-y-1.5 text-xs text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-400">Framework:</span>
              <span className="font-bold text-emerald-300">{modernSummary?.framework || 'React 18'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">UI Paradigm:</span>
              <span className="font-bold text-emerald-300">{modernSummary?.paradigm || 'Declarative Components'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">State Model:</span>
              <span className="font-bold text-emerald-300">{modernSummary?.stateModel || 'Encapsulated Hooks State'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Module System:</span>
              <span className="font-bold text-emerald-300">{modernSummary?.moduleSystem || 'Modern ESM Modules'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Mapped Architecture Comparison Rows */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-[#1c2e38] pb-1.5">
          Detailed Architectural Transformation Map
        </h4>

        {(comparisons || []).map((row, idx) => (
          <div key={idx} className="bg-[#0c1219] border border-[#1c2e38] rounded-xl p-3.5 space-y-2">
            <span className="text-[11px] font-extrabold text-[#10b981] uppercase tracking-wider block">
              {row.category}
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs items-center">
              {/* Legacy Side */}
              <div className="bg-[#070a0e] border border-rose-500/20 p-2.5 rounded-lg space-y-1">
                <p className="font-bold text-rose-300 flex items-center justify-between">
                  <span>{row.legacy.name}</span>
                  <span className="text-[10px] text-slate-500">{row.legacy.type}</span>
                </p>
                <p className="text-slate-400 text-[11px]">{row.legacy.detail}</p>
              </div>

              {/* Modern Side */}
              <div className="bg-[#070a0e] border border-emerald-500/20 p-2.5 rounded-lg space-y-1">
                <p className="font-bold text-emerald-300 flex items-center justify-between">
                  <span>{row.modern.name}</span>
                  <span className="text-[10px] text-slate-500">{row.modern.type}</span>
                </p>
                <p className="text-slate-400 text-[11px]">{row.modern.detail}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
