import React from 'react';
import { Lightbulb, CheckCircle2, ArrowRight, Code2 } from 'lucide-react';

export default function TransformationExplanations({ explanations = [] }) {
  if (!explanations || explanations.length === 0) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 text-center text-slate-400 text-xs">
        No transformation explanations available yet.
      </div>
    );
  }

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">Explainable Code Transformations</h3>
            <p className="text-xs text-slate-400">Concise engineering explanations for major jQuery → React refactorings</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {explanations.map((exp, idx) => (
          <div key={idx} className="bg-slate-950/80 border border-slate-800/90 rounded-2xl p-4 space-y-3">
            {/* Pattern Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono">
              <div className="bg-amber-950/20 border border-amber-500/20 rounded-xl p-3 text-amber-300">
                <span className="text-[10px] uppercase font-sans text-amber-400 font-bold block mb-1">
                  JQUERY
                </span>
                <code>{exp.originalPattern}</code>
              </div>

              <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-3 text-emerald-300">
                <span className="text-[10px] uppercase font-sans text-emerald-400 font-bold block mb-1">
                  REACT
                </span>
                <code>{exp.reactEquivalent}</code>
              </div>
            </div>

            {/* WHY / REASON */}
            <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-xs space-y-1">
              <span className="text-[10px] font-bold uppercase text-sky-400 font-mono block">WHY</span>
              <p className="text-slate-200 leading-relaxed text-[11px]">{exp.reason}</p>
            </div>

            {/* BEHAVIOR PRESERVED */}
            {exp.behaviorPreserved && (
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase text-emerald-400 font-mono block">
                  BEHAVIOR PRESERVED
                </span>
                <div className="flex flex-wrap gap-2 text-[11px] text-slate-300">
                  {exp.behaviorPreserved.map((bp, bIdx) => (
                    <span key={bIdx} className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2 py-0.5 rounded-lg flex items-center gap-1 font-mono">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span>{bp}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
