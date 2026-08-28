import React, { useState } from 'react';
import { CheckCircle, CheckCircle2, XCircle, AlertTriangle, ShieldCheck, RefreshCw, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

export default function VerifyViewer({
  verification,
  onRunVerification,
  isVerifying,
  verifyError,
  hasMigrated
}) {
  const [expandedTest, setExpandedTest] = useState(null);
  const [showJson, setShowJson] = useState(false);

  if (!verification) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center h-full min-h-[480px]">
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-4 text-emerald-400">
          <CheckCircle className="w-8 h-8 stroke-1.5" />
        </div>
        <h3 className="text-base font-semibold text-slate-200 mb-1">4. Behavioral Verification Stage</h3>
        <p className="text-xs text-slate-400 max-w-sm mb-5">
          {hasMigrated
            ? 'React code generation complete. Click "Run Behavioral Verification" to execute assertions against the baseline jQuery rules.'
            : 'Complete the Analyze, Plan, and Migrate stages first to unlock behavioral verification.'}
        </p>

        {verifyError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 max-w-sm text-left">
            <p className="font-semibold">Verification Error</p>
            <p className="text-rose-400/90">{verifyError}</p>
          </div>
        )}

        <button
          onClick={onRunVerification}
          disabled={!hasMigrated || isVerifying}
          className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center space-x-2 transition-all"
        >
          {isVerifying ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Running Behavioral Tests...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              <span>Run Behavioral Verification</span>
            </>
          )}
        </button>
      </div>
    );
  }

  const { overallStatus, metrics, testCases, summary } = verification;
  const isAllPassed = overallStatus === 'VERIFIED';

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col h-full overflow-hidden">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-800 gap-2 mb-4">
        <div className="flex items-center space-x-2.5">
          <div className={`p-1.5 rounded-lg border ${
            isAllPassed 
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
              : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
          }`}>
            {isAllPassed ? <ShieldCheck className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              Behavioral Verification
              <span className={`text-[10px] border px-2 py-0.5 rounded-full font-mono ${
                isAllPassed
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
              }`}>
                {overallStatus}
              </span>
            </h3>
            <p className="text-xs text-slate-400 font-mono font-medium">
              {metrics.passedTests} / {metrics.totalTests} tests passed ({metrics.passRate})
            </p>
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
          <pre>{JSON.stringify(verification, null, 2)}</pre>
        </div>
      ) : (
        <div className="flex-1 space-y-4 overflow-y-auto pr-1">
          {/* Executive Summary Card */}
          <div className={`border rounded-xl p-4 ${
            isAllPassed
              ? 'bg-emerald-950/20 border-emerald-500/30'
              : 'bg-rose-950/20 border-rose-500/30'
          }`}>
            <h4 className={`text-xs font-semibold uppercase tracking-wider mb-1 ${
              isAllPassed ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              Verification Result Overview
            </h4>
            <p className="text-sm font-medium text-slate-200 mb-1">{summary}</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              {isAllPassed
                ? 'All behavioral assertions passed against the baseline jQuery rules. The React component preserves user interaction logic and state contracts.'
                : 'Some behavioral tests failed. Inspect the failing test details below to resolve disparities.'}
            </p>
          </div>

          {/* Test Cases Results Panel */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Behavioral Test Suite Results ({testCases.length})</span>
              <span className="text-[11px] font-mono text-emerald-400">{metrics.passRate} Pass Rate</span>
            </h4>

            {testCases.map((tc) => {
              const isPassed = tc.status === 'PASSED';
              const isExpanded = expandedTest === tc.id;

              return (
                <div
                  key={tc.id}
                  className={`border rounded-xl transition-all overflow-hidden ${
                    isPassed
                      ? 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                      : 'bg-rose-950/30 border-rose-500/40'
                  }`}
                >
                  {/* Test Item Bar */}
                  <div
                    onClick={() => setExpandedTest(isExpanded ? null : tc.id)}
                    className="p-3.5 flex items-center justify-between cursor-pointer select-none"
                  >
                    <div className="flex items-center space-x-3">
                      {isPassed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0 animate-pulse" />
                      )}
                      <div>
                        <span className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                          {tc.name}
                          <span className="text-[10px] font-mono bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded border border-slate-800">
                            {tc.category}
                          </span>
                        </span>
                        <p className="text-[11px] text-slate-400 mt-0.5">{tc.userAction}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${
                        isPassed
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}>
                        {tc.status}
                      </span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                    </div>
                  </div>

                  {/* Expanded Detail View */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 border-t border-slate-800/60 bg-slate-950/80 space-y-2 text-xs">
                      <div>
                        <span className="text-slate-500 text-[11px] block font-semibold">Initial State:</span>
                        <p className="text-slate-300 font-mono text-[11px]">{tc.initialState}</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg">
                          <span className="text-sky-400 text-[10px] block font-semibold uppercase">Expected Behavior:</span>
                          <p className="text-slate-200 text-[11px] mt-0.5">{tc.expectedBehavior}</p>
                        </div>
                        <div className={`border p-2.5 rounded-lg ${
                          isPassed ? 'bg-emerald-950/20 border-emerald-500/20' : 'bg-rose-950/30 border-rose-500/30'
                        }`}>
                          <span className={`text-[10px] block font-semibold uppercase ${isPassed ? 'text-emerald-400' : 'text-rose-400'}`}>
                            Actual Measured Behavior:
                          </span>
                          <p className="text-slate-200 text-[11px] mt-0.5">{tc.actualBehavior}</p>
                        </div>
                      </div>

                      {!isPassed && tc.affectedFunctionality && (
                        <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[11px]">
                          <strong>Affected Functionality:</strong> {tc.affectedFunctionality}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
