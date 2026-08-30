import React from 'react';

const CATEGORIES = [
  { name: 'Application', color: '#a855f7' },
  { name: 'Entry Point', color: '#f59e0b' },
  { name: 'HTML', color: '#f97316' },
  { name: 'JavaScript', color: '#38bdf8' },
  { name: 'React Component', color: '#10b981' },
  { name: 'Service', color: '#8b5cf6' },
  { name: 'API Request', color: '#14b8a6' },
  { name: 'Dependency', color: '#f43f5e' }
];

const EDGES = [
  { name: 'IMPORTS', color: '#38bdf8' },
  { name: 'CALLS', color: '#c084fc' },
  { name: 'DEPENDS_ON', color: '#94a3b8' },
  { name: 'REFERENCES', color: '#f59e0b' },
  { name: 'RENDERS', color: '#10b981' },
  { name: 'API_REQUEST', color: '#14b8a6' }
];

export default function ArchitectureLegend() {
  return (
    <div className="bg-[#0c1219] border border-[#1c2e38] rounded-xl p-4 text-xs font-mono space-y-3">
      <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[11px] border-b border-[#1c2e38] pb-1.5">
        Graph Legend & Visual Treatments
      </h4>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div>
          <span className="text-slate-400 block mb-1 font-semibold text-[10px] uppercase">Node Categories:</span>
          <div className="space-y-1">
            {CATEGORIES.map(cat => (
              <div key={cat.name} className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: cat.color }} />
                <span className="text-slate-300 text-[10px]">{cat.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <span className="text-slate-400 block mb-1 font-semibold text-[10px] uppercase">Relationship Edges:</span>
          <div className="space-y-1">
            {EDGES.map(edge => (
              <div key={edge.name} className="flex items-center space-x-1.5">
                <span className="w-3 h-0.5 shrink-0" style={{ backgroundColor: edge.color }} />
                <span className="text-slate-300 text-[10px]">{edge.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-2 bg-[#070a0e] p-2.5 rounded-lg border border-[#1c2e38] text-[10px] text-slate-400 space-y-1">
          <p className="font-bold text-slate-200">Interactive Controls:</p>
          <p>• Click node to inspect details & detected calls</p>
          <p>• Drag canvas to pan across large architecture graphs</p>
          <p>• Zoom in/out using control buttons or mouse wheel</p>
        </div>
      </div>
    </div>
  );
}
