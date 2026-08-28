import React from 'react';
import HealthStatus from './HealthStatus';
import { Terminal, ArrowRight, Code2 } from 'lucide-react';

export default function Header() {
  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Migration Scope Badge */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2.5">
            <div className="bg-gradient-to-tr from-sky-500 to-cyan-400 p-2 rounded-xl text-slate-950 font-bold shadow-lg shadow-sky-500/20">
              <Terminal className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                Legacy Rescue
                <span className="text-[10px] uppercase tracking-wider bg-sky-500/10 text-sky-400 font-semibold px-2 py-0.5 rounded-full border border-sky-500/20">
                  BuildSprint 2026
                </span>
              </h1>
              <p className="text-xs text-slate-400">Autonomous Code Modernization Agent</p>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-2 text-xs bg-slate-800/60 border border-slate-700/50 px-3 py-1 rounded-lg text-slate-300">
            <Code2 className="w-3.5 h-3.5 text-amber-400" />
            <span>jQuery</span>
            <ArrowRight className="w-3 h-3 text-slate-500" />
            <span className="text-sky-400 font-medium">React</span>
          </div>
        </div>

        {/* Backend Connection Health */}
        <HealthStatus />
      </div>
    </header>
  );
}
