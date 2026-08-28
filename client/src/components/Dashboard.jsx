import React from 'react';
import PipelineOverview from './PipelineOverview';
import { Code2, ArrowRight, Layers, Cpu, ShieldCheck } from 'lucide-react';

export default function Dashboard() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Visual Pipeline Header */}
      <PipelineOverview />

      {/* Main Workspace Shell */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Input jQuery Code Shell */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col h-[480px]">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
              <h3 className="text-sm font-semibold text-slate-200">Legacy jQuery Source</h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">input.js</span>
          </div>

          <div className="flex-1 bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 font-mono text-xs text-slate-400 overflow-auto flex items-center justify-center text-center">
            <div className="max-w-sm space-y-3">
              <Code2 className="w-10 h-10 text-slate-600 mx-auto stroke-1" />
              <p className="text-slate-300 font-sans font-medium">Legacy Code Input Ready</p>
              <p className="text-xs text-slate-400 font-sans">
                The agent environment is connected. Pipeline stages will populate source analysis here.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Output React Component Shell */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col h-[480px]">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-sky-500/80"></span>
              <h3 className="text-sm font-semibold text-slate-200">Modernized React Output</h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">ModernComponent.jsx</span>
          </div>

          <div className="flex-1 bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 font-mono text-xs text-slate-400 overflow-auto flex items-center justify-center text-center">
            <div className="max-w-sm space-y-3">
              <Cpu className="w-10 h-10 text-slate-600 mx-auto stroke-1" />
              <p className="text-slate-300 font-sans font-medium">React Component Output Target</p>
              <p className="text-xs text-slate-400 font-sans">
                Generated React component code and migration artifacts will be produced here.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
