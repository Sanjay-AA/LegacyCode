import React, { useState } from 'react';
import { Search, CheckCircle2, Code, Activity, Layers, Database, Globe, ChevronDown, ChevronUp } from 'lucide-react';

export default function AnalysisViewer({ analysis }) {
  const [showJson, setShowJson] = useState(false);

  if (!analysis) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center h-full min-h-[480px]">
        <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50 mb-4 text-slate-400">
          <Search className="w-8 h-8 stroke-1.5" />
        </div>
        <h3 className="text-base font-semibold text-slate-200 mb-1">Analyze Stage Waiting</h3>
        <p className="text-xs text-slate-400 max-w-sm mb-4">
          Upload or load legacy jQuery source code on the left, then click <strong>"Run Analyze Stage"</strong> to generate structured metadata.
        </p>
        <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-400 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800">
          <span className="w-2 h-2 rounded-full bg-slate-600"></span>
          <span>Status: Idle</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col h-full overflow-hidden">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-800 gap-2 mb-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              Analysis Results
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono">
                Complete
              </span>
            </h3>
            <p className="text-xs text-slate-400">{analysis.filename}</p>
          </div>
        </div>

        <button
          onClick={() => setShowJson(!showJson)}
          className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors flex items-center space-x-1 font-mono"
        >
          <span>{showJson ? 'Hide Raw JSON' : 'View Raw JSON'}</span>
          {showJson ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {showJson ? (
        <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-emerald-300 overflow-auto">
          <pre>{JSON.stringify(analysis, null, 2)}</pre>
        </div>
      ) : (
        <div className="flex-1 space-y-4 overflow-y-auto pr-1">
          {/* Executive Summary Card */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
            <h4 className="text-xs font-semibold text-sky-400 uppercase tracking-wider mb-1">Component Purpose & Summary</h4>
            <p className="text-sm font-medium text-slate-200 mb-1">{analysis.purpose}</p>
            <p className="text-xs text-slate-400 leading-relaxed">{analysis.summary}</p>
          </div>

          {/* Grid Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-3">
              <span className="text-[10px] text-slate-400 block mb-0.5">DOM Selectors</span>
              <span className="text-base font-bold text-slate-200 font-mono">{analysis.selectors.length}</span>
            </div>
            <div className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-3">
              <span className="text-[10px] text-slate-400 block mb-0.5">Event Handlers</span>
              <span className="text-base font-bold text-amber-400 font-mono">{analysis.eventHandlers.length}</span>
            </div>
            <div className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-3">
              <span className="text-[10px] text-slate-400 block mb-0.5">DOM Manipulations</span>
              <span className="text-base font-bold text-sky-400 font-mono">{analysis.domManipulations.length}</span>
            </div>
            <div className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-3">
              <span className="text-[10px] text-slate-400 block mb-0.5">jQuery Methods</span>
              <span className="text-base font-bold text-emerald-400 font-mono">{analysis.jqueryMethods.length}</span>
            </div>
          </div>

          {/* Detected jQuery Methods & Selectors */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 space-y-3">
            <div>
              <h4 className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5 text-sky-400" />
                Detected jQuery Methods
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {analysis.jqueryMethods.map((m, idx) => (
                  <span key={idx} className="text-[11px] font-mono bg-sky-500/10 text-sky-300 border border-sky-500/20 px-2 py-0.5 rounded">
                    .{m}()
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80">
              <h4 className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                DOM Selectors Bound
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {analysis.selectors.map((sel, idx) => (
                  <span key={idx} className="text-[11px] font-mono bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded">
                    {sel}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Event Handlers & User Interactions */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
            <h4 className="text-xs font-semibold text-slate-300 mb-2.5 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              Event Handlers & User Interactions
            </h4>
            {analysis.eventHandlers.length === 0 ? (
              <p className="text-xs text-slate-400">No explicit event handlers detected.</p>
            ) : (
              <div className="space-y-2">
                {analysis.eventHandlers.map((h, idx) => (
                  <div key={idx} className="bg-slate-900 border border-slate-800/80 rounded-lg p-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 text-[11px]">
                        {h.event}
                      </span>
                      <span className="font-mono text-slate-300">{h.selector}</span>
                    </div>
                    <span className="text-slate-400 text-[11px]">{h.description}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* State, Storage & Async Behavior */}
          {(analysis.stateVariables.length > 0 || analysis.ajaxCalls.length > 0 || analysis.localStorageUsage.length > 0) && (
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-purple-400" />
                State, Storage & Network Behavior
              </h4>

              {analysis.stateVariables.length > 0 && (
                <div className="text-xs">
                  <span className="text-slate-400 block mb-1">State Variables to migrate:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.stateVariables.map((v, idx) => (
                      <span key={idx} className="font-mono bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2 py-0.5 rounded">
                        {v}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {analysis.ajaxCalls.length > 0 && (
                <div className="text-xs">
                  <span className="text-slate-400 block mb-1">AJAX Requests:</span>
                  {analysis.ajaxCalls.map((req, idx) => (
                    <div key={idx} className="font-mono bg-slate-900 border border-slate-800 rounded p-2 text-[11px] text-slate-300 flex items-center space-x-2">
                      <span className="text-sky-400 font-bold">{req.type}</span>
                      <span>{req.url}</span>
                    </div>
                  ))}
                </div>
              )}

              {analysis.localStorageUsage.length > 0 && (
                <div className="text-xs">
                  <span className="text-slate-400 block mb-1">Storage Access:</span>
                  <ul className="list-disc list-inside text-slate-300 text-[11px] space-y-0.5">
                    {analysis.localStorageUsage.map((u, idx) => (
                      <li key={idx}>{u}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Behavioral Rules */}
          {analysis.behavioralRules.length > 0 && (
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
              <h4 className="text-xs font-semibold text-slate-300 mb-2">Important Behavioral Rules</h4>
              <ul className="space-y-1">
                {analysis.behavioralRules.map((rule, idx) => (
                  <li key={idx} className="text-xs text-slate-300 flex items-start space-x-2">
                    <span className="text-sky-400 font-bold mt-0.5">•</span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
