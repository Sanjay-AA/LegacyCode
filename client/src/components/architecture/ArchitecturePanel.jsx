import React from 'react';
import { User, Globe, Server, Database, Cpu, Terminal, ArrowDown, Code2, Sparkles, Layers } from 'lucide-react';

export default function ArchitecturePanel({ architecture, isModern, onSelectComponent, selectedComp }) {
  if (!architecture || !architecture.nodes || architecture.nodes.length === 0) {
    if (isModern) {
      return (
        <div className="bg-[#0c1219] border border-dashed border-[#1c2e38] rounded-2xl p-8 text-center space-y-3 font-mono">
          <Sparkles className="w-8 h-8 text-slate-600 mx-auto animate-pulse" />
          <h3 className="text-sm font-bold text-slate-300">MODERNIZED SYSTEM ARCHITECTURE</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Complete the migration step to analyze the generated modern project and render its architecture.
          </p>
        </div>
      );
    }
    return null;
  }

  const nodes = architecture.nodes.filter(n => n.category !== 'Application');

  // Group nodes into layers based on evidence
  const uiNodes = nodes.filter(n => n.category === 'HTML' || n.category === 'JavaScript' || n.category === 'ReactComponent' || n.category === 'EntryPoint');
  const apiNodes = nodes.filter(n => n.category === 'API');
  const beNodes = nodes.filter(n => n.category === 'BackendController' || n.category === 'Service');
  const dbNodes = nodes.filter(n => n.category === 'DataSchema');
  const infraNodes = nodes.filter(n => n.category === 'InfraManifest');

  // Detect technologies per layer
  const frontendTech = isModern
    ? (uiNodes.some(n => n.technology?.includes('React')) ? 'React' : 'Modern Frontend')
    : (uiNodes.some(n => n.technology?.includes('jQuery')) ? 'jQuery' : uiNodes[0]?.technology || 'HTML / JS');

  const backendTech = beNodes[0]?.technology || (isModern ? 'Modern Service API' : 'Legacy Backend Scripts');
  const dataTech = dbNodes[0]?.technology || 'Database Schemas';

  // Overall tech stack summary string
  const techSummary = (architecture.dependencies && architecture.dependencies.length > 0)
    ? architecture.dependencies.slice(0, 3).join(' + ')
    : `${frontendTech}${beNodes.length > 0 ? ' + ' + backendTech : ''}`;

  return (
    <div className="bg-[#0c1219] border border-[#1c2e38] rounded-2xl p-5 shadow-2xl space-y-4 font-mono text-xs">
      {/* Panel Header */}
      <div className="border-b border-[#1c2e38] pb-3 flex items-center justify-between">
        <div>
          <h3 className={`text-sm font-extrabold flex items-center space-x-2 ${isModern ? 'text-[#10b981]' : 'text-amber-400'}`}>
            <span>{isModern ? 'MODERNIZED SYSTEM ARCHITECTURE' : 'LEGACY SYSTEM ARCHITECTURE'}</span>
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">
            Stack: <strong className="text-slate-200">{techSummary}</strong>
          </p>
        </div>
        <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold border ${isModern ? 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/30' : 'bg-amber-500/10 text-amber-300 border-amber-500/30'}`}>
          {isModern ? 'GENERATED' : 'ORIGINAL SOURCE'}
        </span>
      </div>

      {/* Vertical Architecture Execution Flow */}
      <div className="space-y-3">
        {/* Layer 0: USER / CLIENT */}
        <div className="bg-[#070a0e] border border-purple-500/30 rounded-xl p-3 text-center space-y-0.5">
          <div className="flex items-center justify-center space-x-1.5 text-purple-400 font-bold">
            <User className="w-3.5 h-3.5" />
            <span className="uppercase tracking-wider">USER</span>
          </div>
          <span className="text-[10px] text-slate-400 block">Browser / Client Session</span>
        </div>

        {/* Directional Down Arrow */}
        <div className="flex justify-center my-1">
          <div className="flex items-center space-x-1 text-[10px] bg-[#070a0e] px-2.5 py-0.5 rounded-full border border-[#1c2e38] text-slate-400 font-bold">
            <ArrowDown className="w-3 h-3 text-[#10b981]" />
            <span>HTTP / HTTPS</span>
          </div>
        </div>

        {/* Layer 1: FRONTEND LAYER */}
        {uiNodes.length > 0 && (
          <div className="bg-[#070a0e] border border-sky-500/30 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between border-b border-[#1c2e38] pb-1.5">
              <div className="flex items-center space-x-1.5 text-sky-400 font-bold">
                <Globe className="w-3.5 h-3.5" />
                <span className="uppercase tracking-wider">FRONTEND: {frontendTech}</span>
              </div>
              <span className="text-[10px] text-slate-500 font-bold">{uiNodes.length} modules</span>
            </div>

            {/* Nested Component Boxes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {uiNodes.map(node => {
                const isSel = selectedComp?.id === node.id;
                return (
                  <div
                    key={node.id}
                    onClick={() => onSelectComponent && onSelectComponent(node)}
                    className={`bg-[#0c1219] p-2.5 rounded-lg border cursor-pointer transition-all hover:scale-[1.02] space-y-1 ${
                      isSel ? 'border-[#10b981] bg-[#10b981]/10' : 'border-sky-500/20 hover:border-sky-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white truncate">{node.label}</span>
                      <Code2 className="w-3 h-3 text-sky-400 shrink-0" />
                    </div>
                    <span className="text-[10px] text-slate-400 block truncate">{node.id}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Arrow between Frontend and API / Backend */}
        {(apiNodes.length > 0 || beNodes.length > 0) && (
          <div className="flex justify-center my-1">
            <div className="flex items-center space-x-1 text-[10px] bg-[#070a0e] px-2.5 py-0.5 rounded-full border border-[#1c2e38] text-teal-400 font-bold">
              <ArrowDown className="w-3 h-3 text-[#10b981]" />
              <span>{isModern ? 'REST API / JSON' : 'HTTP / AJAX'}</span>
            </div>
          </div>
        )}

        {/* Layer 2: API ENDPOINTS (If explicitly detected) */}
        {apiNodes.length > 0 && (
          <div className="bg-[#070a0e] border border-teal-500/30 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between border-b border-[#1c2e38] pb-1">
              <div className="flex items-center space-x-1.5 text-teal-400 font-bold">
                <Cpu className="w-3.5 h-3.5" />
                <span className="uppercase tracking-wider">REST ENDPOINTS</span>
              </div>
              <span className="text-[10px] text-slate-500">{apiNodes.length} routes</span>
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              {apiNodes.map(node => (
                <div
                  key={node.id}
                  onClick={() => onSelectComponent && onSelectComponent(node)}
                  className="bg-[#0c1219] border border-teal-500/20 p-2 rounded-lg flex items-center justify-between cursor-pointer hover:border-teal-400"
                >
                  <span className="font-bold text-teal-300">{node.label}</span>
                  <span className="text-[9px] bg-teal-500/20 text-teal-300 px-1.5 py-0.5 rounded">REST</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Layer 3: BACKEND LAYER (ONLY if backend files exist) */}
        {beNodes.length > 0 && (
          <div className="bg-[#070a0e] border border-purple-500/30 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between border-b border-[#1c2e38] pb-1.5">
              <div className="flex items-center space-x-1.5 text-purple-400 font-bold">
                <Server className="w-3.5 h-3.5" />
                <span className="uppercase tracking-wider">BACKEND: {backendTech}</span>
              </div>
              <span className="text-[10px] text-slate-500 font-bold">{beNodes.length} controllers</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {beNodes.map(node => {
                const isSel = selectedComp?.id === node.id;
                return (
                  <div
                    key={node.id}
                    onClick={() => onSelectComponent && onSelectComponent(node)}
                    className={`bg-[#0c1219] p-2.5 rounded-lg border cursor-pointer transition-all hover:scale-[1.02] space-y-1 ${
                      isSel ? 'border-[#10b981] bg-[#10b981]/10' : 'border-purple-500/20 hover:border-purple-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white truncate">{node.label}</span>
                      <Server className="w-3 h-3 text-purple-400 shrink-0" />
                    </div>
                    <span className="text-[10px] text-slate-400 block truncate">{node.id}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Arrow to Database */}
        {dbNodes.length > 0 && (
          <div className="flex justify-center my-1">
            <div className="flex items-center space-x-1 text-[10px] bg-[#070a0e] px-2.5 py-0.5 rounded-full border border-[#1c2e38] text-emerald-400 font-bold">
              <ArrowDown className="w-3 h-3 text-[#10b981]" />
              <span>{isModern ? 'ORM / SQL QUERY' : 'SQL QUERY'}</span>
            </div>
          </div>
        )}

        {/* Layer 4: DATA STORAGE LAYER (ONLY if database files exist) */}
        {dbNodes.length > 0 && (
          <div className="bg-[#070a0e] border border-emerald-500/30 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between border-b border-[#1c2e38] pb-1.5">
              <div className="flex items-center space-x-1.5 text-emerald-400 font-bold">
                <Database className="w-3.5 h-3.5" />
                <span className="uppercase tracking-wider">DATA STORAGE: {dataTech}</span>
              </div>
              <span className="text-[10px] text-slate-500 font-bold">{dbNodes.length} schemas</span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {dbNodes.map(node => {
                const isSel = selectedComp?.id === node.id;
                return (
                  <div
                    key={node.id}
                    onClick={() => onSelectComponent && onSelectComponent(node)}
                    className={`bg-[#0c1219] p-2.5 rounded-lg border cursor-pointer transition-all hover:scale-[1.02] flex items-center justify-between ${
                      isSel ? 'border-[#10b981] bg-[#10b981]/10' : 'border-emerald-500/20 hover:border-emerald-400'
                    }`}
                  >
                    <span className="font-bold text-emerald-300 truncate">{node.label}</span>
                    <span className="text-[10px] text-slate-400 shrink-0 font-mono">{node.id}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Layer 5: INFRASTRUCTURE (ONLY if manifests exist) */}
        {infraNodes.length > 0 && (
          <div className="bg-[#070a0e] border border-indigo-500/30 rounded-xl p-3 space-y-2 mt-2">
            <div className="flex items-center justify-between border-b border-[#1c2e38] pb-1">
              <div className="flex items-center space-x-1.5 text-indigo-400 font-bold">
                <Terminal className="w-3.5 h-3.5" />
                <span className="uppercase tracking-wider">INFRASTRUCTURE</span>
              </div>
              <span className="text-[10px] text-slate-500">{infraNodes.length} manifests</span>
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              {infraNodes.map(node => (
                <div
                  key={node.id}
                  onClick={() => onSelectComponent && onSelectComponent(node)}
                  className="bg-[#0c1219] border border-indigo-500/20 p-2 rounded-lg flex items-center justify-between cursor-pointer hover:border-indigo-400"
                >
                  <span className="font-bold text-indigo-300">{node.label}</span>
                  <span className="text-[9px] text-slate-400">{node.id}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
