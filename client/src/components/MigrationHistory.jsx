import React from 'react';
import { History, CheckCircle2, GitPullRequest, ExternalLink, XCircle, Clock } from 'lucide-react';

export default function MigrationHistory({ history = [] }) {
  if (!history || history.length === 0) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 text-center text-slate-400 text-xs">
        No migration history recorded in this session.
      </div>
    );
  }

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">Session Migration History</h3>
            <p className="text-xs text-slate-400">In-Memory Audit Log of Completed Migrations ({history.length})</p>
          </div>
        </div>
      </div>

      <div className="space-y-2.5">
        {history.map((item, idx) => (
          <div key={idx} className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center space-x-3">
              <div className="text-slate-500 font-bold">#{item.number}</div>
              <div>
                <span className="text-slate-200 font-bold">{item.source} → {item.target}</span>
                <p className="text-[11px] text-slate-400">{item.filename}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-slate-400 text-[11px] flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-500" />
                <span>{item.timestamp}</span>
              </span>

              <span className="text-emerald-400 font-semibold text-[11px]">
                {item.verifiedTests} tests
              </span>

              <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase border ${
                item.status === 'SHIPPED' || item.status === 'VERIFIED'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : item.status === 'AWAITING_APPROVAL'
                  ? 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
              }`}>
                {item.status}
              </span>

              {item.prUrl && (
                <a
                  href={item.prUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-400 hover:text-sky-300 flex items-center space-x-1"
                >
                  <GitPullRequest className="w-3.5 h-3.5" />
                  <span>PR #{item.prNumber}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
