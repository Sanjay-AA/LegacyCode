import React, { useState } from 'react';
import { Send, CheckCircle2, AlertTriangle, ExternalLink, GitBranch, GitCommit, GitPullRequest, RefreshCw, ShieldAlert, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

export default function ShipViewer({
  shipResult,
  onShip,
  isShipping,
  shipError,
  hasVerified,
  verification
}) {
  const [showJson, setShowJson] = useState(false);

  const isVerifiedPassed = hasVerified && verification && verification.overallStatus === 'VERIFIED';

  if (!isVerifiedPassed) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center h-full min-h-[480px]">
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 mb-4 text-rose-400">
          <ShieldAlert className="w-8 h-8 stroke-1.5" />
        </div>
        <h3 className="text-base font-semibold text-slate-200 mb-1">Shipping Stage Blocked</h3>
        <p className="text-xs text-rose-300 max-w-md mb-5 bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl">
          Shipping is disabled until behavioral verification completes with 100% passing tests. Run Stage 4 (Verify) first to unblock PR creation.
        </p>
        <div className="flex items-center space-x-2 text-xs font-mono text-slate-400 bg-slate-950 p-2 rounded-lg border border-slate-800">
          <span className="w-2 h-2 rounded-full bg-rose-500"></span>
          <span>Verification Status: {verification?.overallStatus || 'Pending'}</span>
        </div>
      </div>
    );
  }

  if (!shipResult) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center h-full min-h-[480px]">
        <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/20 mb-4 text-sky-400">
          <Send className="w-8 h-8 stroke-1.5" />
        </div>
        <h3 className="text-base font-semibold text-slate-200 mb-1">5. Ship Modernized React Component</h3>
        <p className="text-xs text-slate-400 max-w-sm mb-5">
          Verification is 100% complete! Click <strong>"Ship Migration to GitHub"</strong> to create a dedicated branch, commit the component, and open a Pull Request.
        </p>

        {shipError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 max-w-sm text-left">
            <p className="font-semibold">Shipping Error</p>
            <p className="text-rose-400/90">{shipError}</p>
          </div>
        )}

        <button
          onClick={onShip}
          disabled={isShipping}
          className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 disabled:opacity-50 text-white text-xs font-semibold px-6 py-3 rounded-xl shadow-lg shadow-sky-500/20 flex items-center space-x-2 transition-all"
        >
          {isShipping ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Shipping Migration...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Ship Migration to GitHub</span>
            </>
          )}
        </button>
      </div>
    );
  }

  const { branch, commit, pullRequest, steps } = shipResult;

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
              Migration Shipped Successfully
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono">
                PR Open
              </span>
            </h3>
            <p className="text-xs text-slate-400">Pull Request created on GitHub</p>
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
          <pre>{JSON.stringify(shipResult, null, 2)}</pre>
        </div>
      ) : (
        <div className="flex-1 space-y-4 overflow-y-auto pr-1">
          {/* Progress Tracker Card */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
            <h4 className="text-xs font-semibold text-sky-400 uppercase tracking-wider mb-2.5">
              Automated Shipping Pipeline Execution
            </h4>
            <div className="space-y-2 text-xs">
              {steps.map((st, idx) => (
                <div key={idx} className="flex items-center justify-between bg-slate-900 border border-slate-800 p-2.5 rounded-lg">
                  <div className="flex items-center space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-slate-200 font-medium">{st.step}</span>
                  </div>
                  <span className="text-[10px] uppercase font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded">
                    {st.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Git Branch & Commit Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {/* Branch Card */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 space-y-2">
              <span className="text-[10px] text-slate-400 uppercase font-mono flex items-center gap-1.5">
                <GitBranch className="w-3.5 h-3.5 text-sky-400" />
                Target Git Branch
              </span>
              <p className="font-mono text-xs text-sky-300 bg-slate-900 p-2 rounded border border-slate-800 select-all font-semibold">
                {branch}
              </p>
            </div>

            {/* Commit Card */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 space-y-2">
              <span className="text-[10px] text-slate-400 uppercase font-mono flex items-center gap-1.5">
                <GitCommit className="w-3.5 h-3.5 text-amber-400" />
                Commit Hash & Info
              </span>
              <p className="font-mono text-xs text-amber-300 bg-slate-900 p-2 rounded border border-slate-800 truncate font-semibold">
                [{commit.hash}] {commit.message}
              </p>
            </div>
          </div>

          {/* GitHub Pull Request Link Banner */}
          <div className="bg-gradient-to-r from-sky-950/40 to-blue-950/40 border border-sky-500/30 rounded-xl p-5 text-center space-y-3 shadow-lg">
            <div className="flex items-center justify-center space-x-2 text-sky-400">
              <GitPullRequest className="w-5 h-5" />
              <h4 className="text-sm font-bold text-white">GitHub Pull Request #{pullRequest.number}</h4>
            </div>

            <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
              {pullRequest.title}
            </p>

            <a
              href={pullRequest.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-sky-500/20 transition-all"
            >
              <span>View Pull Request on GitHub</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
