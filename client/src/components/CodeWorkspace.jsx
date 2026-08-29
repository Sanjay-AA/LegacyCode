import React, { useState } from 'react';
import { Copy, Check, Code2, Loader2, Sparkles, FileCode, ArrowRight } from 'lucide-react';

const TRANSFORMATION_SUMMARY_PILLS = [
  { from: '.click()', to: 'onClick' },
  { from: '.text()', to: 'JSX rendering' },
  { from: '.val()', to: 'React state' },
  { from: '.ready()', to: 'component lifecycle' },
  { from: 'DOM mutation', to: 'declarative rendering' }
];

export default function CodeWorkspace({
  originalSource,
  filename,
  migratedSource,
  componentName,
  currentStage,
  isMigrating
}) {
  const [copiedLegacy, setCopiedLegacy] = useState(false);
  const [copiedReact, setCopiedReact] = useState(false);

  const copyToClipboard = (text, type) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    if (type === 'legacy') {
      setCopiedLegacy(true);
      setTimeout(() => setCopiedLegacy(false), 2000);
    } else {
      setCopiedReact(true);
      setTimeout(() => setCopiedReact(false), 2000);
    }
  };

  const hasMigratedCode = !!migratedSource;
  const isMigratingActive = currentStage === 'migrate' || isMigrating;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col h-full min-h-[420px] shadow-lg space-y-3">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Code2 className="w-4 h-4" />
          </div>
          <span className="font-semibold text-slate-200 text-xs">Live Code Workspace</span>
        </div>

        <div className="text-[11px] font-mono text-slate-400 flex items-center space-x-2">
          <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
            {filename || 'legacy-component.js'}
          </span>
          {hasMigratedCode && (
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-semibold">
              Split Code View
            </span>
          )}
        </div>
      </div>

      {/* Transformation Summary Bar */}
      {hasMigratedCode && (
        <div className="bg-slate-950/80 border border-slate-800 p-2.5 rounded-xl flex items-center space-x-2 overflow-x-auto text-[11px] font-mono">
          <span className="text-slate-400 font-bold uppercase text-[10px] shrink-0">Transformations:</span>
          {TRANSFORMATION_SUMMARY_PILLS.map((pill, idx) => (
            <div key={idx} className="bg-slate-900 border border-slate-800 px-2 py-1 rounded-lg flex items-center space-x-1 shrink-0 text-slate-300">
              <span className="text-amber-400 font-semibold">{pill.from}</span>
              <ArrowRight className="w-3 h-3 text-slate-500" />
              <span className="text-emerald-400 font-semibold">{pill.to}</span>
            </div>
          ))}
        </div>
      )}

      {/* Code Viewer Panels */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-3 min-h-[360px]">
        {/* LEFT PANEL: LEGACY JQUERY */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl flex flex-col overflow-hidden">
          <div className="px-3 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-amber-400 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span>LEGACY JQUERY</span>
            </span>
            {originalSource && (
              <button
                onClick={() => copyToClipboard(originalSource, 'legacy')}
                className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center space-x-1 font-mono transition-colors"
              >
                {copiedLegacy ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLegacy ? 'Copied' : 'Copy'}</span>
              </button>
            )}
          </div>

          <pre className="flex-1 p-3.5 font-mono text-[11px] text-slate-300 overflow-auto leading-relaxed select-text">
            {originalSource || '// No source code loaded'}
          </pre>
        </div>

        {/* RIGHT PANEL: MODERN REACT */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl flex flex-col overflow-hidden">
          <div className="px-3 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-emerald-400 flex items-center space-x-2">
              <span className={`w-2 h-2 rounded-full ${hasMigratedCode ? 'bg-emerald-400' : 'bg-slate-600'}`}></span>
              <span>MODERN REACT</span>
            </span>
            {hasMigratedCode && (
              <button
                onClick={() => copyToClipboard(migratedSource, 'react')}
                className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center space-x-1 font-mono transition-colors"
              >
                {copiedReact ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedReact ? 'Copied' : 'Copy'}</span>
              </button>
            )}
          </div>

          {hasMigratedCode ? (
            <pre className="flex-1 p-3.5 font-mono text-[11px] text-emerald-300 overflow-auto leading-relaxed select-text">
              {migratedSource}
            </pre>
          ) : isMigratingActive ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-3">
              <div className="p-3 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 animate-bounce">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-sky-300 flex items-center justify-center space-x-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Migrating...</span>
                </p>
                <p className="text-[11px] text-slate-400 font-mono">Generating React component...</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-500 space-y-2">
              <FileCode className="w-8 h-8 opacity-40" />
              <p className="text-xs">Waiting for migration stage...</p>
              <p className="text-[11px] text-slate-600 max-w-xs">
                React component will appear here automatically when Migrate stage executes.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
