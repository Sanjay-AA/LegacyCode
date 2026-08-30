import React, { useState } from 'react';
import { Sparkles, Terminal, User, Code2, Cpu, Server, Database, ArrowDown } from 'lucide-react';

export default function ArchitectureAsciiView({ legacyArch, modernArch, selectedMode = 'compare', onSelectComponent, selectedComp }) {
  const renderSinglePanel = (arch, isModern) => {
    if (!arch || !arch.nodes || arch.nodes.length === 0) {
      if (isModern) {
        return (
          <div className="bg-[#0c1219] border border-dashed border-[#1c2e38] rounded-2xl p-8 text-center space-y-3 font-mono">
            <Sparkles className="w-8 h-8 text-slate-600 mx-auto animate-pulse" />
            <h3 className="text-sm font-bold text-slate-300">MODERNIZED SYSTEM ARCHITECTURE</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Run pipeline migration to generate the modern project and render its ASCII flow architecture.
            </p>
          </div>
        );
      }
      return (
        <div className="bg-[#0c1219] border border-dashed border-[#1c2e38] rounded-2xl p-8 text-center space-y-2 font-mono">
          <p className="text-xs text-slate-500">No project source files detected for legacy architecture.</p>
        </div>
      );
    }

    const nodes = arch.nodes.filter(n => n.category !== 'Application');
    const uiNodes = nodes.filter(n => n.category === 'HTML' || n.category === 'JavaScript' || n.category === 'ReactComponent' || n.category === 'EntryPoint');
    const apiNodes = nodes.filter(n => n.category === 'API');
    const beNodes = nodes.filter(n => n.category === 'BackendController' || n.category === 'Service');
    const dbNodes = nodes.filter(n => n.category === 'DataSchema');
    const infraNodes = nodes.filter(n => n.category === 'InfraManifest');

    const frontendTech = uiNodes.length > 0
      ? (uiNodes.find(n => n.technology && n.technology !== 'Core')?.technology || (isModern ? 'React' : 'JavaScript / Web'))
      : null;

    const backendTech = beNodes.length > 0
      ? (beNodes.find(n => n.technology && n.technology !== 'Core')?.technology || 'Backend Services')
      : null;

    const dataTech = dbNodes.length > 0
      ? (dbNodes.find(n => n.technology && n.technology !== 'Core')?.technology || 'Data Schemas')
      : null;

    const techSummary = (arch.dependencies && arch.dependencies.length > 0)
      ? arch.dependencies.slice(0, 3).join(' + ')
      : [frontendTech, backendTech, dataTech].filter(Boolean).join(' + ') || 'Discovered Modules';

    // Helper to format box line
    const formatLine = (text, width = 34) => {
      const truncated = text.length > (width - 4) ? text.substring(0, width - 7) + '...' : text;
      return `│ ${truncated.padEnd(width - 4, ' ')} │`;
    };

    return (
      <div className={`bg-[#0c1219] border rounded-2xl p-5 shadow-2xl space-y-4 font-mono text-xs ${isModern ? 'border-[#10b981]/30' : 'border-amber-500/30'}`}>
        {/* Header */}
        <div className="border-b border-[#1c2e38] pb-3 flex items-center justify-between">
          <div>
            <h3 className={`text-sm font-extrabold flex items-center space-x-2 ${isModern ? 'text-[#10b981]' : 'text-amber-400'}`}>
              <Terminal className="w-4 h-4" />
              <span>{isModern ? 'MODERNIZED SYSTEM ARCHITECTURE' : 'LEGACY SYSTEM ARCHITECTURE'}</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">
              Stack: <strong className="text-slate-200">{techSummary}</strong>
            </p>
          </div>
          <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold border ${isModern ? 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/30' : 'bg-amber-500/10 text-amber-300 border-amber-500/30'}`}>
            {isModern ? 'GENERATED ASCII FLOW' : 'SOURCE ASCII FLOW'}
          </span>
        </div>

        {/* ASCII System Flow Container */}
        <div className="space-y-3">
          {/* USER LAYER */}
          <div className="bg-[#070a0e] border border-purple-500/30 rounded-xl p-3 text-center space-y-0.5">
            <div className="flex items-center justify-center space-x-1.5 text-purple-400 font-bold">
              <User className="w-3.5 h-3.5" />
              <span className="uppercase tracking-wider">USER / CLIENT</span>
            </div>
            <span className="text-[10px] text-slate-400 block">Browser / Client Session</span>
          </div>

          {/* Directional Arrow */}
          <div className="flex justify-center my-1">
            <div className="flex items-center space-x-1 text-[10px] bg-[#070a0e] px-2.5 py-0.5 rounded-full border border-[#1c2e38] text-slate-400 font-bold">
              <ArrowDown className="w-3 h-3 text-[#10b981]" />
              <span>HTTP / HTTPS</span>
            </div>
          </div>

          {/* FRONTEND ASCII BOX */}
          {uiNodes.length > 0 && (
            <div className="bg-[#070a0e] border border-sky-500/30 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between border-b border-[#1c2e38] pb-1.5 text-sky-400 font-bold">
                <div className="flex items-center space-x-1.5">
                  <Code2 className="w-3.5 h-3.5" />
                  <span className="uppercase tracking-wider">FRONTEND: {frontendTech}</span>
                </div>
                <span className="text-[10px] text-slate-500">{uiNodes.length} modules</span>
              </div>

              <pre className="text-sky-300 font-mono text-[11px] leading-tight bg-[#0c1219] p-3 rounded-lg border border-[#1c2e38] overflow-x-auto">
                {`┌──────────────────────────────────┐\n`}
                {formatLine(`FRONTEND LAYER: ${frontendTech}`)}
                {`├──────────────────────────────────┤\n`}
                {uiNodes.map(n => formatLine(`• ${n.label} (${n.id})`)).join('\n')}
                {`\n└──────────────────────────────────┘`}
              </pre>
            </div>
          )}

          {/* Communication Arrow */}
          {(apiNodes.length > 0 || beNodes.length > 0) && (
            <div className="flex justify-center my-1">
              <div className="flex items-center space-x-1 text-[10px] bg-[#070a0e] px-2.5 py-0.5 rounded-full border border-[#1c2e38] text-teal-400 font-bold">
                <ArrowDown className="w-3 h-3 text-[#10b981]" />
                <span>{isModern ? 'REST API / JSON' : 'HTTP / AJAX'}</span>
              </div>
            </div>
          )}

          {/* REST API ENDPOINTS */}
          {apiNodes.length > 0 && (
            <div className="bg-[#070a0e] border border-teal-500/30 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between border-b border-[#1c2e38] pb-1 text-teal-400 font-bold">
                <div className="flex items-center space-x-1.5">
                  <Cpu className="w-3.5 h-3.5" />
                  <span className="uppercase tracking-wider">API ENDPOINTS</span>
                </div>
                <span className="text-[10px] text-slate-500">{apiNodes.length} routes</span>
              </div>
              <pre className="text-teal-300 font-mono text-[11px] leading-tight bg-[#0c1219] p-3 rounded-lg border border-[#1c2e38] overflow-x-auto">
                {`┌──────────────────────────────────┐\n`}
                {formatLine(`REST / API ROUTES`)}
                {`├──────────────────────────────────┤\n`}
                {apiNodes.map(n => formatLine(`• ${n.label}`)).join('\n')}
                {`\n└──────────────────────────────────┘`}
              </pre>
            </div>
          )}

          {/* BACKEND ASCII BOX */}
          {beNodes.length > 0 && (
            <div className="bg-[#070a0e] border border-purple-500/30 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between border-b border-[#1c2e38] pb-1.5 text-purple-400 font-bold">
                <div className="flex items-center space-x-1.5">
                  <Server className="w-3.5 h-3.5" />
                  <span className="uppercase tracking-wider">BACKEND: {backendTech}</span>
                </div>
                <span className="text-[10px] text-slate-500">{beNodes.length} controllers</span>
              </div>

              <pre className="text-purple-300 font-mono text-[11px] leading-tight bg-[#0c1219] p-3 rounded-lg border border-[#1c2e38] overflow-x-auto">
                {`┌──────────────────────────────────┐\n`}
                {formatLine(`BACKEND LAYER: ${backendTech}`)}
                {`├──────────────────────────────────┤\n`}
                {beNodes.map(n => formatLine(`• ${n.label} (${n.id})`)).join('\n')}
                {`\n└──────────────────────────────────┘`}
              </pre>
            </div>
          )}

          {/* Database Arrow */}
          {dbNodes.length > 0 && (
            <div className="flex justify-center my-1">
              <div className="flex items-center space-x-1 text-[10px] bg-[#070a0e] px-2.5 py-0.5 rounded-full border border-[#1c2e38] text-emerald-400 font-bold">
                <ArrowDown className="w-3 h-3 text-[#10b981]" />
                <span>{isModern ? 'ORM / SQL QUERY' : 'SQL QUERY'}</span>
              </div>
            </div>
          )}

          {/* DATA STORAGE ASCII BOX */}
          {dbNodes.length > 0 && (
            <div className="bg-[#070a0e] border border-emerald-500/30 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between border-b border-[#1c2e38] pb-1.5 text-emerald-400 font-bold">
                <div className="flex items-center space-x-1.5">
                  <Database className="w-3.5 h-3.5" />
                  <span className="uppercase tracking-wider">DATA STORAGE: {dataTech}</span>
                </div>
                <span className="text-[10px] text-slate-500">{dbNodes.length} schemas</span>
              </div>

              <pre className="text-emerald-300 font-mono text-[11px] leading-tight bg-[#0c1219] p-3 rounded-lg border border-[#1c2e38] overflow-x-auto">
                {`┌──────────────────────────────────┐\n`}
                {formatLine(`DATA STORAGE LAYER: ${dataTech}`)}
                {`├──────────────────────────────────┤\n`}
                {dbNodes.map(n => formatLine(`• ${n.label} (${n.id})`)).join('\n')}
                {`\n└──────────────────────────────────┘`}
              </pre>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (selectedMode === 'legacy') {
    return renderSinglePanel(legacyArch, false);
  }

  if (selectedMode === 'modern') {
    return renderSinglePanel(modernArch, true);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start font-mono text-xs">
      {renderSinglePanel(legacyArch, false)}
      {renderSinglePanel(modernArch, true)}
    </div>
  );
}
