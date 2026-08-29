import React from 'react';
import { Network, Database, Layers, Server, Code } from 'lucide-react';

export default function DependencyGraph({ graphData }) {
  if (!graphData || !graphData.nodes) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 text-center text-slate-400 text-xs">
        No dependency graph data generated yet.
      </div>
    );
  }

  const { nodes = [], edges = [] } = graphData;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">Project Dependency Graph</h3>
            <p className="text-xs text-slate-400">Architectural Component Dependencies & Coupling Analysis</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
        {nodes.map((node, idx) => (
          <div key={idx} className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl space-y-1">
            <div className="flex items-center space-x-2">
              <div className="p-1 rounded bg-slate-800 text-slate-300">
                {node.type === 'source' ? <Code className="w-3.5 h-3.5 text-amber-400" /> :
                 node.type === 'target' ? <Server className="w-3.5 h-3.5 text-emerald-400" /> :
                 node.type === 'state' ? <Layers className="w-3.5 h-3.5 text-purple-400" /> :
                 <Database className="w-3.5 h-3.5 text-sky-400" />}
              </div>
              <span className="text-[10px] uppercase font-bold text-slate-500">{node.type}</span>
            </div>
            <p className="font-bold text-slate-200 truncate">{node.label}</p>
          </div>
        ))}
      </div>

      {edges.length > 0 && (
        <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-xl space-y-2 text-xs">
          <span className="text-slate-400 font-bold uppercase text-[10px] block font-mono">
            Component Coupling Dependencies ({edges.length}):
          </span>
          <div className="space-y-1.5 font-mono text-[11px]">
            {edges.map((edge, idx) => (
              <div key={idx} className="flex items-center space-x-2 text-slate-300">
                <span className="text-sky-300 font-semibold">{edge.from}</span>
                <span className="text-slate-600">───►</span>
                <span className="text-emerald-300 font-semibold">{edge.to}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
