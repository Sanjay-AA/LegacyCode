import React from 'react';
import { ShieldCheck, TrendingUp, CheckCircle2, Info } from 'lucide-react';

export default function RiskAssessment({
  beforeScore = 42,
  afterScore = 92,
  beforeLevel = 'HIGH RISK',
  afterLevel = 'LOW RISK',
  reasons = [],
  breakdown = null
}) {
  // Format levels cleanly
  const formattedBeforeLevel = beforeLevel.includes('RISK') ? beforeLevel : `${beforeLevel} RISK`;
  const formattedAfterLevel = afterLevel.includes('RISK') ? afterLevel : `${afterLevel} RISK`;

  // Default breakdown if not passed
  const activeBreakdown = breakdown || {
    behavioralVerification: { score: 30, max: 30 },
    dependencyHealth: { score: 18, max: 20 },
    architectureQuality: { score: 14, max: 15 },
    legacyPatternRemoval: { score: 14, max: 15 },
    testResults: { score: 8, max: 10 },
    criticalIssues: { score: 8, max: 10 }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl font-sans">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">MIGRATION SAFETY SCORE</h3>
            <p className="text-xs text-slate-400">Quantitative comparison of modernization safety</p>
          </div>
        </div>
      </div>

      {/* Explanatory Banner */}
      <div className="bg-[#0c1219] border border-[#1c2e38] p-3 rounded-xl text-xs text-slate-300 font-mono flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Info className="w-4 h-4 text-[#10b981] shrink-0" />
          <span>Safety Score measures how confidently the migrated application preserves behavior while reducing legacy and architectural risk.</span>
        </div>
        <span className="text-[#10b981] font-bold text-[11px] shrink-0 ml-2">Higher score = safer modernization</span>
      </div>

      {/* Before / After Safety Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono">
        {/* BEFORE CARD */}
        <div className="bg-rose-950/20 border border-rose-500/30 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider block">
              BEFORE MIGRATION (LEGACY jQUERY)
            </span>
            <div className="text-2xl font-bold text-rose-300 mt-1">
              {beforeScore} / 100
            </div>
            <p className="text-xs text-rose-400/80 mt-0.5 font-bold uppercase">{formattedBeforeLevel}</p>
          </div>
          <div className="text-3xl font-bold text-rose-500/40">
            {beforeScore}
          </div>
        </div>

        {/* AFTER CARD */}
        <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
              AFTER MIGRATION (MODERN REACT)
            </span>
            <div className="text-2xl font-bold text-emerald-300 mt-1 flex items-center gap-2">
              <span>{afterScore} / 100</span>
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-xs text-emerald-400/80 mt-0.5 font-bold uppercase">{formattedAfterLevel}</p>
          </div>
          <div className="text-3xl font-bold text-emerald-500/40">
            {afterScore}
          </div>
        </div>
      </div>

      {/* Migration Safety Score Breakdown Table */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3 font-mono text-xs">
        <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[11px] border-b border-slate-800 pb-2">
          MIGRATION SAFETY BREAKDOWN
        </h4>

        <div className="space-y-2 text-slate-300">
          <div className="flex justify-between items-center py-1 border-b border-slate-800/50">
            <span>Behavioral Verification</span>
            <span className="font-bold text-slate-100">{activeBreakdown.behavioralVerification.score} / {activeBreakdown.behavioralVerification.max}</span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-slate-800/50">
            <span>Dependency Health</span>
            <span className="font-bold text-slate-100">{activeBreakdown.dependencyHealth.score} / {activeBreakdown.dependencyHealth.max}</span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-slate-800/50">
            <span>Architecture Quality</span>
            <span className="font-bold text-slate-100">{activeBreakdown.architectureQuality.score} / {activeBreakdown.architectureQuality.max}</span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-slate-800/50">
            <span>Legacy Pattern Removal</span>
            <span className="font-bold text-slate-100">{activeBreakdown.legacyPatternRemoval.score} / {activeBreakdown.legacyPatternRemoval.max}</span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-slate-800/50">
            <span>Test Results</span>
            <span className="font-bold text-slate-100">{activeBreakdown.testResults.score} / {activeBreakdown.testResults.max}</span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-slate-800/50">
            <span>Critical Issues</span>
            <span className="font-bold text-slate-100">{activeBreakdown.criticalIssues.score} / {activeBreakdown.criticalIssues.max}</span>
          </div>

          <div className="flex justify-between items-center pt-2 font-extrabold text-sm text-[#10b981]">
            <span>TOTAL</span>
            <span>{afterScore} / 100</span>
          </div>
        </div>
      </div>

      {/* Main Contributing Factors Mitigated */}
      {reasons && reasons.length > 0 && (
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 space-y-2 text-xs">
          <h4 className="font-semibold text-slate-300 uppercase tracking-wider text-[11px]">
            PRIMARY RISK FACTORS MITIGATED BY MIGRATION:
          </h4>
          <ul className="space-y-1.5 text-slate-300">
            {reasons.map((reason, idx) => (
              <li key={idx} className="flex items-center space-x-2 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
