import React from 'react';
import { Activity, AlertTriangle, ShieldCheck, AlertCircle, FileCode, CheckCircle2 } from 'lucide-react';

export default function HealthReport({ healthData, filename, patterns, risks }) {
  if (!healthData) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 text-center text-slate-400 text-xs">
        No Legacy Health Report available yet.
      </div>
    );
  }

  const { score, overall, riskLevel } = healthData;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-xl border ${
            riskLevel === 'HIGH'
              ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
              : riskLevel === 'MEDIUM'
              ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
              : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
          }`}>
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">Legacy Code Health Report</h3>
            <p className="text-xs text-slate-400">Source: <strong className="font-mono text-slate-200">{filename}</strong></p>
          </div>
        </div>

        {/* Health Score Pill */}
        <div className="flex items-center space-x-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold uppercase font-mono">Health Score:</span>
          <span className={`text-xl font-bold font-mono ${
            riskLevel === 'HIGH' ? 'text-rose-400' : riskLevel === 'MEDIUM' ? 'text-amber-400' : 'text-emerald-400'
          }`}>
            {score} / 100
          </span>
          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${
            riskLevel === 'HIGH'
              ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
              : riskLevel === 'MEDIUM'
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
          }`}>
            {overall}
          </span>
        </div>
      </div>

      {/* Pattern Breakdown Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl">
          <span className="text-slate-500 block text-[10px] uppercase font-mono mb-1">Direct DOM Mutations</span>
          <span className="text-base font-bold font-mono text-amber-300">{patterns?.domManipulation || 0}</span>
        </div>
        <div className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl">
          <span className="text-slate-500 block text-[10px] uppercase font-mono mb-1">Event Listeners</span>
          <span className="text-base font-bold font-mono text-sky-300">{patterns?.eventHandlers || 0}</span>
        </div>
        <div className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl">
          <span className="text-slate-500 block text-[10px] uppercase font-mono mb-1">Global Mutable Variables</span>
          <span className="text-base font-bold font-mono text-rose-300">{patterns?.globalVariables || 0}</span>
        </div>
        <div className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl">
          <span className="text-slate-500 block text-[10px] uppercase font-mono mb-1">AJAX / Network Calls</span>
          <span className="text-base font-bold font-mono text-purple-300">{patterns?.ajaxCalls || 0}</span>
        </div>
      </div>

      {/* Detected Risks */}
      {risks && risks.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-slate-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Identified Code Quality & Migration Risks ({risks.length})</span>
          </h4>

          <div className="space-y-2">
            {risks.map((r, idx) => (
              <div key={idx} className="bg-slate-950/80 border border-slate-800/80 p-3 rounded-xl text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">{r.title}</span>
                  <span className={`text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded border ${
                    r.severity === 'high'
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}>
                    {r.severity} severity
                  </span>
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">{r.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
