import React, { useState } from 'react';
import { User, Globe, Server, Database, ArrowDown, Code2, FileCode, CheckCircle2, Shield, Info, Terminal, Cpu, X } from 'lucide-react';

export default function ArchitectureLayerContainers({ architecture, isModern }) {
  const [selectedComp, setSelectedComp] = useState(null);

  if (!architecture || !architecture.nodes || architecture.nodes.length === 0) return null;

  const nodes = architecture.nodes;

  // Filter nodes by layer container
  const uiNodes = nodes.filter(n => n.category === 'HTML' || n.category === 'JavaScript' || n.category === 'ReactComponent' || n.category === 'EntryPoint');
  const apiNodes = nodes.filter(n => n.category === 'API');
  const beNodes = nodes.filter(n => n.category === 'BackendController' || n.category === 'Service');
  const dbNodes = nodes.filter(n => n.category === 'DataSchema');
  const infraNodes = nodes.filter(n => n.category === 'InfraManifest');

  return (
    <div className="space-y-6 font-mono max-w-4xl mx-auto">
      {/* System Architecture Document Header */}
      <div className="bg-[#0c1219] border border-[#1c2e38] rounded-xl p-4 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-[#10b981] font-bold uppercase tracking-wider block">TECHNICAL ARCHITECTURE SPECIFICATION</span>
          <h3 className="text-sm font-bold text-white mt-0.5">{architecture.title}</h3>
          <p className="text-xs text-slate-400 mt-0.5">{architecture.subtitle}</p>
        </div>
        <div className="text-right">
          <span className="text-[10px] bg-[#1c2e38] text-slate-300 px-2.5 py-1 rounded-full font-bold">
            {isModern ? 'MODERN WORKSPACE' : 'LEGACY WORKSPACE'}
          </span>
        </div>
      </div>

      {/* Vertical Layered Container Stack */}
      <div className="space-y-4 relative">
        {/* Layer 0: USER */}
        <div className="bg-[#0c1219] border border-purple-500/40 rounded-2xl p-4 text-center space-y-1 shadow-lg">
          <div className="flex items-center justify-center space-x-2 text-purple-400">
            <User className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">USER / CLIENT BROWSER</span>
          </div>
          <p className="text-[11px] text-slate-400">Web Dashboard & Client Session</p>
        </div>

        {/* Directional Down Arrow */}
        <div className="flex justify-center text-slate-500 my-1">
          <div className="flex items-center space-x-1 text-[10px] bg-[#070a0e] px-2 py-0.5 rounded-full border border-[#1c2e38] text-slate-400 font-bold">
            <span>HTTP / HTTPS</span>
            <ArrowDown className="w-3 h-3 text-[#10b981]" />
          </div>
        </div>

        {/* Layer 1: FRONTEND CONTAINER */}
        {uiNodes.length > 0 && (
          <div className="bg-[#0c1219] border border-sky-500/40 rounded-2xl p-5 space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#1c2e38] pb-2">
              <div className="flex items-center space-x-2 text-sky-400">
                <Globe className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  FRONTEND LAYER: {isModern ? 'React 18 Component Stack' : 'jQuery / HTML UI'}
                </h4>
              </div>
              <span className="text-[10px] text-slate-400 font-bold">{uiNodes.length} Discovered Components</span>
            </div>

            {/* Inner Component Boxes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {uiNodes.map(node => (
                <div
                  key={node.id}
                  onClick={() => setSelectedComp(node)}
                  className="bg-[#070a0e] border border-sky-500/30 hover:border-sky-400 p-3 rounded-xl cursor-pointer transition-all hover:scale-[1.02] space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs truncate">{node.label}</span>
                    <Code2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  </div>
                  <span className="text-[10px] text-slate-400 block font-mono">{node.category}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Directional Arrow to API */}
        {(apiNodes.length > 0 || beNodes.length > 0) && (
          <div className="flex justify-center text-slate-500 my-1">
            <div className="flex items-center space-x-1 text-[10px] bg-[#070a0e] px-2.5 py-0.5 rounded-full border border-[#1c2e38] text-teal-400 font-bold">
              <span>REST / AJAX JSON</span>
              <ArrowDown className="w-3 h-3 text-[#10b981]" />
            </div>
          </div>
        )}

        {/* Layer 2: API CONTAINER */}
        {apiNodes.length > 0 && (
          <div className="bg-[#0c1219] border border-teal-500/40 rounded-2xl p-5 space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#1c2e38] pb-2">
              <div className="flex items-center space-x-2 text-teal-400">
                <Cpu className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  API & REST ENDPOINTS LAYER
                </h4>
              </div>
              <span className="text-[10px] text-slate-400 font-bold">{apiNodes.length} Verified Endpoints</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {apiNodes.map(node => (
                <div
                  key={node.id}
                  onClick={() => setSelectedComp(node)}
                  className="bg-[#070a0e] border border-teal-500/30 p-2.5 rounded-xl flex items-center justify-between text-xs cursor-pointer hover:border-teal-400 transition-colors"
                >
                  <span className="font-bold text-teal-300">{node.label}</span>
                  <span className="text-[10px] bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-full">REST API</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Directional Arrow to Backend */}
        {beNodes.length > 0 && (
          <div className="flex justify-center text-slate-500 my-1">
            <div className="flex items-center space-x-1 text-[10px] bg-[#070a0e] px-2.5 py-0.5 rounded-full border border-[#1c2e38] text-purple-400 font-bold">
              <span>CONTROLLER INVOCATION</span>
              <ArrowDown className="w-3 h-3 text-[#10b981]" />
            </div>
          </div>
        )}

        {/* Layer 3: BACKEND CONTAINER */}
        {beNodes.length > 0 && (
          <div className="bg-[#0c1219] border border-purple-500/40 rounded-2xl p-5 space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#1c2e38] pb-2">
              <div className="flex items-center space-x-2 text-purple-400">
                <Server className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  BACKEND LAYER: {beNodes[0]?.technology || 'Controllers & Services'}
                </h4>
              </div>
              <span className="text-[10px] text-slate-400 font-bold">{beNodes.length} Verified Controllers</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {beNodes.map(node => (
                <div
                  key={node.id}
                  onClick={() => setSelectedComp(node)}
                  className="bg-[#070a0e] border border-purple-500/30 hover:border-purple-400 p-3 rounded-xl cursor-pointer transition-all hover:scale-[1.02] space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs truncate">{node.label}</span>
                    <Server className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  </div>
                  <span className="text-[10px] text-slate-400 block font-mono">{node.technology}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Directional Arrow to Data Storage */}
        {dbNodes.length > 0 && (
          <div className="flex justify-center text-slate-500 my-1">
            <div className="flex items-center space-x-1 text-[10px] bg-[#070a0e] px-2.5 py-0.5 rounded-full border border-[#1c2e38] text-emerald-400 font-bold">
              <span>SQL / ORM QUERY</span>
              <ArrowDown className="w-3 h-3 text-[#10b981]" />
            </div>
          </div>
        )}

        {/* Layer 4: DATA STORAGE CONTAINER */}
        {dbNodes.length > 0 && (
          <div className="bg-[#0c1219] border border-emerald-500/40 rounded-2xl p-5 space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#1c2e38] pb-2">
              <div className="flex items-center space-x-2 text-emerald-400">
                <Database className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  DATA STORAGE LAYER: {dbNodes[0]?.technology || 'Database Schemas'}
                </h4>
              </div>
              <span className="text-[10px] text-slate-400 font-bold">{dbNodes.length} Schema Artifacts</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {dbNodes.map(node => (
                <div
                  key={node.id}
                  onClick={() => setSelectedComp(node)}
                  className="bg-[#070a0e] border border-emerald-500/30 p-3 rounded-xl flex items-center justify-between text-xs cursor-pointer hover:border-emerald-400 transition-colors"
                >
                  <span className="font-bold text-emerald-300">{node.label}</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">{node.technology}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Layer 5: INFRASTRUCTURE CONTAINER */}
        {infraNodes.length > 0 && (
          <div className="bg-[#0c1219] border border-indigo-500/40 rounded-2xl p-5 space-y-3 shadow-xl mt-4">
            <div className="flex items-center justify-between border-b border-[#1c2e38] pb-2">
              <div className="flex items-center space-x-2 text-indigo-400">
                <Terminal className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  INFRASTRUCTURE & DEPLOYMENT LAYER
                </h4>
              </div>
              <span className="text-[10px] text-slate-400 font-bold">{infraNodes.length} Infrastructure Manifests</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {infraNodes.map(node => (
                <div
                  key={node.id}
                  onClick={() => setSelectedComp(node)}
                  className="bg-[#070a0e] border border-indigo-500/30 p-3 rounded-xl flex items-center justify-between text-xs cursor-pointer hover:border-indigo-400 transition-colors"
                >
                  <span className="font-bold text-indigo-300">{node.label}</span>
                  <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-bold">{node.technology}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Selected Component Inspection Modal / Drawer */}
      {selectedComp && (
        <div className="bg-[#0c1219] border border-[#10b981]/50 rounded-2xl p-5 space-y-3 shadow-2xl animate-in fade-in slide-in-from-bottom-3 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-[#1c2e38] pb-2">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
              <h4 className="font-bold text-white text-sm">{selectedComp.label}</h4>
              <span className="text-[10px] bg-[#1c2e38] text-[#10b981] px-2.5 py-0.5 rounded-full font-bold uppercase">
                {selectedComp.technology || selectedComp.category}
              </span>
            </div>
            <button
              onClick={() => setSelectedComp(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Layer & Category:</span>
              <span className="text-slate-200">{selectedComp.category} ({selectedComp.layer || 'general'})</span>

              <span className="text-[10px] text-slate-500 uppercase font-bold block pt-2">Source File Evidence:</span>
              <span className="text-sky-300 bg-[#070a0e] p-2 rounded-lg border border-[#1c2e38] block font-mono truncate">
                {Array.isArray(selectedComp.evidence) ? selectedComp.evidence.join(', ') : selectedComp.id}
              </span>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Responsibilities & Capabilities:</span>
              <p className="text-slate-300 bg-[#070a0e] p-2 rounded-lg border border-[#1c2e38]">
                {selectedComp.category === 'ReactComponent'
                  ? 'Renders declarative React 18 UI components with encapsulated state hooks'
                  : selectedComp.category === 'BackendController'
                  ? 'Handles incoming REST API requests, params validation, and business service invocation'
                  : selectedComp.category === 'DataSchema'
                  ? 'Defines database schema, relational models, and persistence constraints'
                  : 'Encapsulates application state, side-effects, and component rendering logic'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
