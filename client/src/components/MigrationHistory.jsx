import React from 'react';
import { History, GitPullRequest, ExternalLink, Clock, FolderOpen, ArrowRight } from 'lucide-react';

export default function MigrationHistory({ history = [], onSelectHistory }) {
  if (!history || history.length === 0) {
    return (
      <div className="bg-[#0c1219] border border-[#1c2e38] rounded-2xl p-8 text-center text-slate-400 font-mono text-xs">
        No previous migrations stored yet.
      </div>
    );
  }

  return (
    <div className="bg-[#0c1219] border border-[#1c2e38] rounded-2xl p-6 space-y-4 shadow-xl font-mono">
      <div className="flex items-center justify-between pb-3 border-b border-[#1c2e38]">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-[#10b981]/10 border border-[#10b981]/20 text-[#10b981]">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Migration History</h3>
            <p className="text-xs text-slate-400 font-sans">Audit log of completed code modernizations ({history.length})</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {history.map((item, idx) => (
          <div
            key={item.id || idx}
            onClick={() => onSelectHistory && onSelectHistory(item)}
            className="bg-[#070a0e] border border-[#1c2e38] hover:border-[#10b981]/50 p-4 rounded-xl flex flex-wrap items-center justify-between gap-4 text-xs transition-all cursor-pointer group shadow-md"
          >
            <div className="flex items-center space-x-3">
              <div className="text-slate-500 font-bold text-sm">#{history.length - idx}</div>
              <div>
                <div className="flex items-center space-x-2 text-slate-200 font-bold text-sm group-hover:text-[#10b981] transition-colors">
                  <span>{item.source}</span>
                  <span className="text-slate-500">→</span>
                  <span>{item.target}</span>
                </div>
                <p className="text-xs text-slate-400 font-sans mt-0.5">{item.filename || 'Project'}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-slate-400 text-[11px] flex items-center gap-1 font-sans">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>{item.timestamp || 'Recent'}</span>
              </span>

              <span className="text-[#10b981] font-bold text-[11px] bg-[#10b981]/10 px-2.5 py-0.5 rounded border border-[#10b981]/20">
                {item.verifiedTests || 'Verified'}
              </span>

              <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase border ${
                item.status === 'SHIPPED' || item.status === 'COMPLETED' || item.status === 'VERIFIED'
                  ? 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/20'
                  : 'bg-sky-500/10 text-sky-400 border-sky-500/20'
              }`}>
                {item.status || 'COMPLETED'}
              </span>

              {item.prUrl && (
                <a
                  href={item.prUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-sky-400 hover:text-sky-300 flex items-center space-x-1"
                >
                  <GitPullRequest className="w-3.5 h-3.5" />
                  <span>PR #{item.prNumber}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onSelectHistory) onSelectHistory(item);
                }}
                className="bg-[#111a22] group-hover:bg-[#10b981] text-slate-200 group-hover:text-slate-950 px-3 py-1.5 rounded-lg border border-[#1c2e38] transition-all flex items-center space-x-1.5 font-bold"
              >
                <span>View Result</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
