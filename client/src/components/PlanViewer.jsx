import React, { useState } from 'react';
import { Map, ChevronDown, ChevronUp, FileCode } from 'lucide-react';

export default function PlanViewer({ plan }) {
  const [expandedStep, setExpandedStep] = useState(0);

  if (!plan) {
    return (
      <div className="bg-[#0c1219] border border-[#1c2e38] rounded-2xl p-6 text-center text-slate-400 text-xs font-mono">
        No migration plan generated yet.
      </div>
    );
  }

  // Derive steps from real plan data (plan.transformations or plan.phases or fallback)
  const steps = (plan.transformations || []).map((t, idx) => ({
    num: t.stepNumber ? String(t.stepNumber).padStart(2, '0') : String(idx + 1).padStart(2, '0'),
    title: t.title || t.action || `Step ${idx + 1}`,
    category: t.category || 'Refactoring',
    pattern: t.jqueryPattern || t.pattern || 'Legacy Pattern',
    equivalent: t.reactEquivalent || t.equivalent || 'Modern Equivalent',
    reason: t.requiredTransformation || t.reason || t.currentBehavior || 'Migration step',
    risk: t.migrationRisks ? 'Medium' : 'Low',
    files: [plan.filename || 'legacy-source.js']
  }));

  // Handle project-level plan phases if present
  if (plan.phases && Array.isArray(plan.phases)) {
    plan.phases.forEach((p, idx) => {
      steps.push({
        num: String(p.phase || idx + 1).padStart(2, '0'),
        title: p.title || 'Phase Step',
        category: 'Project Structure',
        pattern: 'Multi-module project files',
        equivalent: 'React 18 Component Hierarchy',
        reason: 'Architectural refactoring across project files.',
        risk: 'Medium',
        files: p.files || []
      });
    });
  }

  // Fallback default steps if plan data is minimal
  if (steps.length === 0) {
    steps.push(
      {
        num: '01',
        title: 'Replace imperative DOM manipulation with declarative JSX rendering',
        category: 'DOM & UI',
        pattern: '$(selector).html(), .addClass(), .text()',
        equivalent: 'JSX Expressions & State Attributes',
        reason: 'Bypasses direct browser DOM mutation to leverage React virtual DOM reconciliation.',
        risk: 'Low',
        files: [plan.filename || 'legacy-component.js']
      },
      {
        num: '02',
        title: 'Convert jQuery event listeners to synthetic JSX event attributes',
        category: 'Event Handling',
        pattern: '$(selector).on("click", handler) / .click()',
        equivalent: '<button onClick={handleAction}>',
        reason: 'Declarative event binding scoped to component lifecycle.',
        risk: 'Low',
        files: [plan.filename || 'legacy-component.js']
      },
      {
        num: '03',
        title: 'Move scope mutable variables to reactive useState hooks',
        category: 'State Management',
        pattern: 'var count = 0; var items = [];',
        equivalent: 'const [count, setCount] = useState(0);',
        reason: 'Ensures UI automatically re-renders whenever state changes.',
        risk: 'Medium',
        files: [plan.filename || 'legacy-component.js']
      }
    );
  }

  return (
    <div className="bg-[#0c1219] border border-[#1c2e38] rounded-2xl p-6 space-y-6 shadow-xl font-mono">
      <div className="flex items-center justify-between pb-4 border-b border-[#1c2e38]">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-[#10b981]/10 border border-[#10b981]/20 text-[#10b981]">
            <Map className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              Topological Migration Plan
            </h3>
            <p className="text-xs text-slate-400">
              Component Architecture & Refactoring Steps ({steps.length} Steps)
            </p>
          </div>
        </div>

        <span className="text-xs font-bold text-[#10b981] bg-[#10b981]/10 px-3 py-1 rounded border border-[#10b981]/20">
          Target: {plan.componentName || 'Component'}.jsx
        </span>
      </div>

      <div className="space-y-3">
        {steps.map((step, idx) => {
          const isExpanded = expandedStep === idx;
          const fileList = Array.isArray(step.files) ? step.files : [];

          return (
            <div
              key={idx}
              className={`border rounded-xl transition-all overflow-hidden ${
                isExpanded
                  ? 'bg-[#070a0e] border-[#10b981]/50'
                  : 'bg-[#070a0e]/60 border-[#1c2e38] hover:border-[#10b981]/30'
              }`}
            >
              <div
                onClick={() => setExpandedStep(isExpanded ? -1 : idx)}
                className="p-4 flex items-center justify-between cursor-pointer select-none"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-bold text-[#10b981] bg-[#10b981]/10 px-2.5 py-1 rounded border border-[#10b981]/20">
                    {step.num}
                  </span>
                  <span className="text-xs font-bold text-slate-200">{step.title}</span>
                </div>

                <div className="flex items-center space-x-3 text-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-500 bg-[#0c1219] px-2 py-0.5 rounded border border-[#1c2e38]">
                    Risk: {step.risk}
                  </span>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-[#10b981]" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                </div>
              </div>

              {isExpanded && (
                <div className="p-4 bg-[#0c1219] border-t border-[#1c2e38] space-y-3 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                    <div className="bg-[#070a0e] border border-amber-500/20 p-2.5 rounded text-amber-300">
                      <span className="text-[10px] uppercase text-amber-400 font-bold block mb-1">Original Pattern</span>
                      <code>{step.pattern}</code>
                    </div>

                    <div className="bg-[#070a0e] border border-[#10b981]/20 p-2.5 rounded text-[#10b981]">
                      <span className="text-[10px] uppercase text-[#10b981] font-bold block mb-1">React Equivalent</span>
                      <code>{step.equivalent}</code>
                    </div>
                  </div>

                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    <strong className="text-[#10b981]">REASON:</strong> {step.reason}
                  </p>

                  {fileList.length > 0 && (
                    <div className="flex items-center space-x-2 text-[10px] text-slate-400">
                      <FileCode className="w-3.5 h-3.5 text-slate-500" />
                      <span>AFFECTED FILES: {fileList.join(', ')}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
