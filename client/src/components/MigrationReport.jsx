import React from 'react';
import { Award, CheckCircle2, GitPullRequest, ExternalLink, ShieldCheck, Activity, RefreshCw } from 'lucide-react';

export default function MigrationReport({
  sourceFile,
  componentName,
  verificationMetrics,
  repairAttempts = 0,
  beforeScore = 42,
  afterScore = 92,
  transformationsCount = 12,
  pullRequest = null,
  status = 'Shipped'
}) {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">Final Migration Report</h3>
            <p className="text-xs text-slate-400">Executive Modernization Summary</p>
          </div>
        </div>

        <span className="text-xs font-mono font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full">
          {status}
        </span>
      </div>

      {/* Metrics Table Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
        <div className="bg-slate-950/70 border border-slate-800/80 p-3.5 rounded-xl space-y-1">
          <span className="text-slate-500 block text-[10px] uppercase">Source File</span>
          <p className="text-slate-200 font-bold truncate">{sourceFile || 'legacy-component.js'}</p>
        </div>

        <div className="bg-slate-950/70 border border-slate-800/80 p-3.5 rounded-xl space-y-1">
          <span className="text-slate-500 block text-[10px] uppercase">Target React Component</span>
          <p className="text-emerald-400 font-bold truncate">{componentName || 'Component'}.jsx</p>
        </div>

        <div className="bg-slate-950/70 border border-slate-800/80 p-3.5 rounded-xl space-y-1">
          <span className="text-slate-500 block text-[10px] uppercase">Verification Status</span>
          <p className="text-emerald-400 font-bold">
            {verificationMetrics?.passedTests || 0} / {verificationMetrics?.totalTests || 0} passed
          </p>
        </div>

        <div className="bg-slate-950/70 border border-slate-800/80 p-3.5 rounded-xl space-y-1">
          <span className="text-slate-500 block text-[10px] uppercase">Self-Repair Attempts</span>
          <p className="text-sky-400 font-bold">{repairAttempts}</p>
        </div>

        <div className="bg-slate-950/70 border border-slate-800/80 p-3.5 rounded-xl space-y-1">
          <span className="text-slate-500 block text-[10px] uppercase">Risk Score Improvement</span>
          <p className="text-purple-400 font-bold">{beforeScore} → {afterScore}</p>
        </div>

        <div className="bg-slate-950/70 border border-slate-800/80 p-3.5 rounded-xl space-y-1">
          <span className="text-slate-500 block text-[10px] uppercase">Transformations Applied</span>
          <p className="text-amber-400 font-bold">{transformationsCount}</p>
        </div>

        <div className="bg-slate-950/70 border border-slate-800/80 p-3.5 rounded-xl space-y-1">
          <span className="text-slate-500 block text-[10px] uppercase">GitHub Pull Request</span>
          <p className="text-sky-300 font-bold">#{pullRequest?.number || 'XX'}</p>
        </div>

        <div className="bg-slate-950/70 border border-slate-800/80 p-3.5 rounded-xl space-y-1">
          <span className="text-slate-500 block text-[10px] uppercase">Status</span>
          <p className="text-emerald-400 font-bold">{status}</p>
        </div>
      </div>

      {pullRequest && pullRequest.url && (
        <div className="pt-2 flex justify-end">
          <a
            href={pullRequest.url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-sky-500/20 transition-all flex items-center space-x-2"
          >
            <GitPullRequest className="w-4 h-4" />
            <span>View Pull Request #{pullRequest.number} on GitHub</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}
    </div>
  );
}
