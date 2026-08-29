import React from 'react';
import { ShieldAlert, ArrowRight, CheckCircle2, TrendingDown } from 'lucide-react';

export default function RiskAssessment({ beforeScore, afterScore = 92, beforeLevel = 'HIGH', afterLevel = 'LOW', reasons = [] }) {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">Migration Risk Assessment</h3>
            <p className="text-xs text-slate-400">Quantitative Risk Comparison (Before vs After Modernization)</p>
          </div>
        </div>
      </div>

      {/* Before / After Risk Score Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* BEFORE CARD */}
        <div className="bg-rose-950/20 border border-rose-500/30 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-rose-400 font-mono font-bold uppercase tracking-wider block">
              BEFORE MIGRATION (Legacy jQuery)
            </span>
            <div className="text-2xl font-bold font-mono text-rose-300 mt-1">
              {beforeScore} / 100
            </div>
            <p className="text-xs text-rose-400/80 mt-0.5">{beforeLevel} RISK</p>
          </div>
          <div className="text-3xl font-bold text-rose-500/40 font-mono">
            {beforeScore}
          </div>
        </div>

        {/* AFTER CARD */}
        <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-emerald-400 font-mono font-bold uppercase tracking-wider block">
              AFTER MIGRATION (Modern React)
            </span>
            <div className="text-2xl font-bold font-mono text-emerald-300 mt-1 flex items-center gap-2">
              <span>{afterScore} / 100</span>
              <TrendingDown className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-xs text-emerald-400/80 mt-0.5">{afterLevel} RISK</p>
          </div>
          <div className="text-3xl font-bold text-emerald-500/40 font-mono">
            {afterScore}
          </div>
        </div>
      </div>

      {/* Main Contributing Factors */}
      {reasons && reasons.length > 0 && (
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 space-y-2 text-xs">
          <h4 className="font-semibold text-slate-300 uppercase tracking-wider text-[11px]">
            Primary Risk Factors Mitigated by Migration:
          </h4>
          <ul className="space-y-1.5 text-slate-300">
            {reasons.map((reason, idx) => (
              <li key={idx} className="flex items-center space-x-2 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
