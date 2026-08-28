import React, { useState } from 'react';
import { Code, CheckCircle2, AlertTriangle, Copy, Check, RefreshCw, Sparkles, ArrowRight, FileCode, Layers } from 'lucide-react';

export default function MigrateViewer({
  migrationData,
  rawCode,
  onRunMigration,
  isMigrating,
  migrationError,
  hasPlan
}) {
  const [copiedBefore, setCopiedBefore] = useState(false);
  const [copiedAfter, setCopiedAfter] = useState(false);
  const [activeCodeTab, setActiveCodeTab] = useState('split'); // 'split' | 'before' | 'after'

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'before') {
      setCopiedBefore(true);
      setTimeout(() => setCopiedBefore(false), 2000);
    } else {
      setCopiedAfter(true);
      setTimeout(() => setCopiedAfter(false), 2000);
    }
  };

  if (!migrationData) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center h-full min-h-[480px]">
        <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/20 mb-4 text-sky-400">
          <Code className="w-8 h-8 stroke-1.5" />
        </div>
        <h3 className="text-base font-semibold text-slate-200 mb-1">3. Code Migration Stage</h3>
        <p className="text-xs text-slate-400 max-w-sm mb-5">
          {hasPlan
            ? 'Analysis and Planning are complete. Click "Run Code Migration" to generate the modern React component.'
            : 'Complete the Analyze and Plan stages first to unlock code migration.'}
        </p>

        {migrationError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 max-w-sm text-left">
            <p className="font-semibold">Migration Error</p>
            <p className="text-rose-400/90">{migrationError}</p>
          </div>
        )}

        <button
          onClick={onRunMigration}
          disabled={!hasPlan || isMigrating}
          className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-sky-500/20 flex items-center space-x-2 transition-all"
        >
          {isMigrating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Generating React Code...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Run Code Migration</span>
            </>
          )}
        </button>
      </div>
    );
  }

  const { migratedCode, summary } = migrationData;

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
              Code Migration Complete
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono">
                {summary.status}
              </span>
            </h3>
            <p className="text-xs text-slate-400">Target: <strong className="text-sky-300">{summary.componentName}.jsx</strong></p>
          </div>
        </div>

        {/* View Layout Controls */}
        <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setActiveCodeTab('split')}
            className={`px-2.5 py-1 rounded ${activeCodeTab === 'split' ? 'bg-slate-800 text-sky-400' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Split View
          </button>
          <button
            onClick={() => setActiveCodeTab('before')}
            className={`px-2.5 py-1 rounded ${activeCodeTab === 'before' ? 'bg-slate-800 text-amber-400' : 'text-slate-400 hover:text-slate-200'}`}
          >
            jQuery
          </button>
          <button
            onClick={() => setActiveCodeTab('after')}
            className={`px-2.5 py-1 rounded ${activeCodeTab === 'after' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-slate-200'}`}
          >
            React
          </button>
        </div>
      </div>

      {/* Migration Summary & Transformation Badges */}
      <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 mb-4 space-y-3">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-mono">Source File</span>
            <span className="text-slate-200 font-mono font-medium">{summary.sourceFile}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-mono">Target Engine</span>
            <span className="text-sky-400 font-mono font-medium">{summary.targetFramework}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-mono">React Component</span>
            <span className="text-emerald-400 font-mono font-medium">&lt;{summary.componentName} /&gt;</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-mono">Status</span>
            <span className="text-emerald-400 font-semibold">{summary.status}</span>
          </div>
        </div>

        {/* Applied Transformations */}
        {summary.transformationsApplied && (
          <div className="pt-2 border-t border-slate-800/60">
            <span className="text-[11px] font-semibold text-slate-300 block mb-1">Applied Transformations:</span>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-slate-300">
              {summary.transformationsApplied.map((t, idx) => (
                <li key={idx} className="flex items-start space-x-1.5">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Warnings if any */}
        {summary.warnings && summary.warnings.length > 0 && (
          <div className="pt-2 border-t border-slate-800/60">
            <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <ul className="space-y-0.5">
                {summary.warnings.map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* BEFORE / AFTER Code Comparison View */}
      <div className="flex-1 min-h-[320px] overflow-hidden">
        {activeCodeTab === 'split' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 h-full">
            {/* BEFORE Pane */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl flex flex-col h-full overflow-hidden">
              <div className="px-3 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
                <span className="text-xs font-mono font-semibold text-amber-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  BEFORE: Legacy jQuery ({summary.sourceFile})
                </span>
                <button
                  onClick={() => copyToClipboard(rawCode, 'before')}
                  className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center space-x-1"
                >
                  {copiedBefore ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedBefore ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="flex-1 p-3.5 font-mono text-[11px] text-slate-300 overflow-auto leading-relaxed">
                {rawCode}
              </pre>
            </div>

            {/* AFTER Pane */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl flex flex-col h-full overflow-hidden">
              <div className="px-3 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
                <span className="text-xs font-mono font-semibold text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  AFTER: Modern React ({summary.componentName}.jsx)
                </span>
                <button
                  onClick={() => copyToClipboard(migratedCode, 'after')}
                  className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center space-x-1"
                >
                  {copiedAfter ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedAfter ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="flex-1 p-3.5 font-mono text-[11px] text-emerald-300 overflow-auto leading-relaxed">
                {migratedCode}
              </pre>
            </div>
          </div>
        ) : activeCodeTab === 'before' ? (
          <div className="bg-slate-950 border border-slate-800 rounded-xl flex flex-col h-full overflow-hidden">
            <div className="px-3 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-mono font-semibold text-amber-400">
                BEFORE: Legacy jQuery Source Code ({summary.sourceFile})
              </span>
              <button
                onClick={() => copyToClipboard(rawCode, 'before')}
                className="text-xs text-slate-400 hover:text-slate-200 flex items-center space-x-1"
              >
                {copiedBefore ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedBefore ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="flex-1 p-4 font-mono text-xs text-slate-300 overflow-auto leading-relaxed">
              {rawCode}
            </pre>
          </div>
        ) : (
          <div className="bg-slate-950 border border-slate-800 rounded-xl flex flex-col h-full overflow-hidden">
            <div className="px-3 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-mono font-semibold text-emerald-400">
                AFTER: Generated React Component ({summary.componentName}.jsx)
              </span>
              <button
                onClick={() => copyToClipboard(migratedCode, 'after')}
                className="text-xs text-slate-400 hover:text-slate-200 flex items-center space-x-1"
              >
                {copiedAfter ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedAfter ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="flex-1 p-4 font-mono text-xs text-emerald-300 overflow-auto leading-relaxed">
              {migratedCode}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
