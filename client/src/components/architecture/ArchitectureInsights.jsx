import React from 'react';
import { Files, Layers, Box, Compass, Activity, ShieldCheck, Database, Cpu } from 'lucide-react';

export default function ArchitectureInsights({ architecture, isModern }) {
  if (!architecture) return null;

  const metrics = architecture.metrics || {};
  const healthScore = architecture.healthScore || (isModern ? 92 : 42);

  return (
    <div className="space-y-4 font-mono">
      <div className="flex items-center justify-between border-b border-[#1c2e38] pb-2">
        <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
          <Activity className="w-4 h-4 text-[#10b981]" />
          <span>Architecture Insights & Calculated Metrics</span>
        </h4>

        {/* Health Score Badge */}
        <div className="flex items-center space-x-2 bg-[#0c1219] px-3 py-1.5 rounded-lg border border-[#1c2e38]">
          <span className="text-xs text-slate-400">Architecture Health:</span>
          <span className={`text-sm font-extrabold ${healthScore >= 75 ? 'text-[#10b981]' : healthScore >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
            {healthScore} / 100
          </span>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#0c1219] border border-[#1c2e38] p-3 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Files Analyzed</span>
            <Files className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <p className="text-xl font-extrabold text-white mt-2">{metrics.totalFiles || architecture.nodes?.length || 0}</p>
          <span className="text-[10px] text-slate-500 mt-1">Discovered in project</span>
        </div>

        <div className="bg-[#0c1219] border border-[#1c2e38] p-3 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>{isModern ? 'Components Discovered' : 'Modules Discovered'}</span>
            <Layers className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <p className="text-xl font-extrabold text-white mt-2">
            {isModern ? (metrics.componentsCount || architecture.nodes?.filter(n => n.category === 'ReactComponent').length || 0) : (metrics.modulesCount || architecture.nodes?.filter(n => n.category === 'JavaScript').length || 0)}
          </p>
          <span className="text-[10px] text-slate-500 mt-1">{isModern ? 'Modern components' : 'Source modules'}</span>
        </div>

        <div className="bg-[#0c1219] border border-[#1c2e38] p-3 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Dependencies</span>
            <Box className="w-3.5 h-3.5 text-pink-400" />
          </div>
          <p className="text-xl font-extrabold text-white mt-2">{architecture.dependencies?.length || metrics.dependenciesCount || 0}</p>
          <span className="text-[10px] text-slate-500 mt-1">Discovered packages</span>
        </div>

        <div className="bg-[#0c1219] border border-[#1c2e38] p-3 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Entry Points</span>
            <Compass className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <p className="text-xl font-extrabold text-white mt-2">{architecture.entryPoints?.length || 1}</p>
          <span className="text-[10px] text-slate-500 mt-1">Application bootstrap files</span>
        </div>
      </div>

      {/* Deep Behavioral Metrics Bar */}
      <div className="bg-[#0c1219] border border-[#1c2e38] p-3.5 rounded-xl text-xs space-y-2">
        <span className="text-slate-400 font-semibold uppercase text-[11px] block border-b border-[#1c2e38] pb-1">
          Detailed Coupling & State Metrics:
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="flex items-center justify-between bg-[#070a0e] p-2 rounded-lg border border-[#1c2e38]">
            <span className="text-slate-400 text-[11px]">Direct DOM Mutations:</span>
            <span className={`font-bold ${isModern ? 'text-[#10b981]' : (metrics.domMutationsCount || 0) > 0 ? 'text-rose-400' : 'text-[#10b981]'}`}>
              {isModern ? '0 (Component State)' : metrics.domMutationsCount || 0}
            </span>
          </div>

          <div className="flex items-center justify-between bg-[#070a0e] p-2 rounded-lg border border-[#1c2e38]">
            <span className="text-slate-400 text-[11px]">Global Variables:</span>
            <span className={`font-bold ${isModern ? 'text-[#10b981]' : (metrics.globalVarsCount || 0) > 0 ? 'text-amber-400' : 'text-[#10b981]'}`}>
              {isModern ? '0 (Scoped State)' : metrics.globalVarsCount || 0}
            </span>
          </div>

          <div className="flex items-center justify-between bg-[#070a0e] p-2 rounded-lg border border-[#1c2e38]">
            <span className="text-slate-400 text-[11px]">API Endpoints Detected:</span>
            <span className="font-bold text-teal-400">
              {architecture.nodes?.filter(n => n.category === 'API').length || metrics.apiCallsCount || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
