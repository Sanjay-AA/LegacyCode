import React, { useState } from 'react';
import { Map, CheckCircle2, AlertTriangle, ArrowRight, Code2, ShieldAlert, Cpu, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

export default function PlanViewer({ plan, onGeneratePlan, isPlanning, planError, hasAnalysis }) {
  const [showJson, setShowJson] = useState(false);

  if (!plan) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center h-full min-h-[480px]">
        <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/20 mb-4 text-sky-400">
          <Map className="w-8 h-8 stroke-1.5" />
        </div>
        <h3 className="text-base font-semibold text-slate-200 mb-1">2. Migration Planning Stage</h3>
        <p className="text-xs text-slate-400 max-w-sm mb-5">
          {hasAnalysis
            ? 'Analysis is complete. Click "Generate Migration Plan" to construct the step-by-step React blueprint.'
            : 'Complete the Analyze stage first to unlock automated migration planning.'}
        </p>

        {planError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 max-w-sm text-left">
            <p className="font-semibold">Planning Error</p>
            <p className="text-rose-400/90">{planError}</p>
          </div>
        )}

        <button
          onClick={onGeneratePlan}
          disabled={!hasAnalysis || isPlanning}
          className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-sky-500/20 flex items-center space-x-2 transition-all"
        >
          {isPlanning ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              <span>Building Migration Plan...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate Migration Plan</span>
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col h-full overflow-hidden">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-800 gap-2 mb-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400">
            <Map className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              React Migration Plan
              <span className="text-[10px] bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2 py-0.5 rounded-full font-mono">
                Ready
              </span>
            </h3>
            <p className="text-xs text-slate-400">Target Component: <strong className="text-sky-300">{plan.componentName}</strong></p>
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
        <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-sky-300 overflow-auto">
          <pre>{JSON.stringify(plan, null, 2)}</pre>
        </div>
      ) : (
        <div className="flex-1 space-y-4 overflow-y-auto pr-1">
          {/* Executive Summary Card */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
            <h4 className="text-xs font-semibold text-sky-400 uppercase tracking-wider mb-1">Proposed React Architecture</h4>
            <p className="text-xs text-slate-300 font-medium mb-1">{plan.targetArchitecture}</p>
            <p className="text-xs text-slate-400 leading-relaxed">{plan.summary}</p>
          </div>

          {/* Proposed State Hooks Table */}
          {plan.stateHooks && plan.stateHooks.length > 0 && (
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
              <h4 className="text-xs font-semibold text-slate-300 mb-2.5 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-purple-400" />
                Proposed React State Hooks ({plan.stateHooks.length})
              </h4>
              <div className="space-y-2">
                {plan.stateHooks.map((s, idx) => (
                  <div key={idx} className="bg-slate-900 border border-slate-800/80 rounded-lg p-2.5 text-xs flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2 font-mono">
                      <span className="text-purple-300 font-semibold">{s.stateName}</span>
                      <span className="text-slate-500">→</span>
                      <span className="text-slate-400 text-[11px]">{s.setterName}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] uppercase font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20 px-1.5 py-0.5 rounded">
                        {s.inferredType} (init: {s.initialValue})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step-by-Step Transformations */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Step-by-Step Migration Transformations ({plan.transformations.length})</span>
              <span className="text-[11px] text-slate-400 font-normal">Ordered by execution lifecycle</span>
            </h4>

            {plan.transformations.map((t) => (
              <div key={t.id} className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-4 space-y-3">
                {/* Step Header */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
                  <div className="flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[11px] font-mono font-bold flex items-center justify-center">
                      {t.stepNumber}
                    </span>
                    <h5 className="text-xs font-semibold text-slate-200">{t.title}</h5>
                  </div>
                  <span className="text-[10px] uppercase font-mono bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700/50">
                    {t.category}
                  </span>
                </div>

                {/* Pattern Comparison: jQuery -> React */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono">
                  <div className="bg-amber-950/20 border border-amber-500/20 rounded-lg p-2.5 text-amber-200/90">
                    <span className="text-[10px] text-amber-400 font-sans block mb-1 font-semibold">Detected jQuery Pattern:</span>
                    <code className="text-[11px]">{t.jqueryPattern}</code>
                  </div>
                  <div className="bg-sky-950/20 border border-sky-500/20 rounded-lg p-2.5 text-sky-200/90">
                    <span className="text-[10px] text-sky-400 font-sans block mb-1 font-semibold">Equivalent React Pattern:</span>
                    <code className="text-[11px]">{t.reactEquivalent}</code>
                  </div>
                </div>

                {/* Required Transformation */}
                <div className="text-xs">
                  <span className="text-slate-400 block mb-0.5 font-semibold">Required Transformation:</span>
                  <p className="text-slate-300 leading-relaxed bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 text-[11px]">
                    {t.requiredTransformation}
                  </p>
                </div>

                {/* Behavioral Invariant & Risk */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-lg p-2 text-emerald-300/90">
                    <span className="font-semibold text-emerald-400 block mb-0.5">Preserved Behavior:</span>
                    {t.preservedBehavior}
                  </div>
                  <div className="bg-rose-950/20 border border-rose-500/20 rounded-lg p-2 text-rose-300/90">
                    <span className="font-semibold text-rose-400 block mb-0.5">Potential Migration Risk:</span>
                    {t.migrationRisks}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Risk Assessment Summary */}
          {plan.riskAssessment && plan.riskAssessment.length > 0 && (
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
              <h4 className="text-xs font-semibold text-slate-300 mb-2.5 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                Migration Risk Assessment & Mitigations
              </h4>
              <div className="space-y-2">
                {plan.riskAssessment.map((r, idx) => (
                  <div key={idx} className="bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-slate-200">{r.category}</span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                        r.level === 'High' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        : r.level === 'Medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      }`}>
                        {r.level} Risk
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px] mb-1">{r.description}</p>
                    <p className="text-sky-400 text-[11px] font-mono">Mitigation: {r.mitigation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
