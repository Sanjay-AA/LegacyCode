import React from 'react';
import { FileText, CheckCircle2, ShieldCheck, Code2 } from 'lucide-react';

export default function BehavioralContract({ contract }) {
  if (!contract) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 text-center text-slate-400 text-xs">
        No Behavioral Contract generated yet.
      </div>
    );
  }

  const { component, initialState, behaviors, rules } = contract;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">Behavioral Contract</h3>
            <p className="text-xs text-slate-400">Observable Invariants & State Contracts Preserved in React</p>
          </div>
        </div>
      </div>

      {/* Contract Verification Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs font-mono">
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl text-emerald-400 font-semibold flex items-center space-x-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Initial state</span>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl text-emerald-400 font-semibold flex items-center space-x-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">User interactions</span>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl text-emerald-400 font-semibold flex items-center space-x-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">State transitions</span>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl text-emerald-400 font-semibold flex items-center space-x-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Boundary rules</span>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl text-emerald-400 font-semibold flex items-center space-x-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">External behavior</span>
        </div>
      </div>

      {/* Initial State Contract */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2">
        <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
          <Code2 className="w-4 h-4 text-sky-400" />
          Initial Component State Invariants:
        </span>
        <pre className="bg-slate-900 border border-slate-800 p-3 rounded-lg font-mono text-xs text-sky-300 select-all overflow-x-auto">
          {JSON.stringify(initialState || {}, null, 2)}
        </pre>
      </div>

      {/* Expected Behaviors List */}
      {behaviors && behaviors.length > 0 && (
        <div className="space-y-2.5">
          <h4 className="text-xs font-semibold text-slate-300">
            Action & Response Behavior Rules ({behaviors.length})
          </h4>
          <div className="space-y-2">
            {behaviors.map((b, idx) => (
              <div key={idx} className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="font-mono text-amber-300 font-semibold">{b.action}</span>
                <span className="text-slate-300 font-mono text-[11px] bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
                  Expected: {b.expected}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
