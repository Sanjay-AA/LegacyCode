import React from 'react';
import { Search, Map, Code, CheckCircle, Send } from 'lucide-react';

const PIPELINE_STAGES = [
  { id: 'analyze', label: '1. Analyze', icon: Search, desc: 'Inspect jQuery AST & DOM patterns' },
  { id: 'plan', label: '2. Plan', icon: Map, desc: 'Design React component hierarchy & state' },
  { id: 'migrate', label: '3. Migrate', icon: Code, desc: 'Transform imperative code to JSX/Hooks' },
  { id: 'verify', label: '4. Verify', icon: CheckCircle, desc: 'Validate syntax & functional equality' },
  { id: 'ship', label: '5. Ship', icon: Send, desc: 'Generate modernized React module' }
];

export default function PipelineOverview() {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-200">Modernization Workflow Pipeline</h2>
          <p className="text-xs text-slate-400">5-Stage Autonomous Agent Architecture</p>
        </div>
        <span className="text-[11px] font-mono text-slate-400 bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700/50">
          Scope: jQuery → React Only
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        {PIPELINE_STAGES.map((stage) => {
          const Icon = stage.icon;
          return (
            <div
              key={stage.id}
              className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3.5 relative opacity-60 hover:opacity-80 transition-opacity"
            >
              <div className="flex items-center space-x-2.5 mb-2">
                <div className="p-1.5 rounded-lg bg-slate-800 text-slate-400">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-medium text-slate-300">{stage.label}</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">{stage.desc}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                  Pending
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
