import React, { useEffect, useRef } from 'react';
import { Terminal, Activity, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function AgentTrace({ traceLogs = [], currentStage, stageStatus, errorState }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [traceLogs]);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col h-full font-mono text-xs overflow-hidden shadow-lg">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Terminal className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold text-slate-200">Live Agent Trace</span>
        </div>

        <div className="flex items-center space-x-2 text-[11px]">
          {stageStatus === 'running' && (
            <span className="flex items-center space-x-1.5 text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded-full animate-pulse">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Active Agent Run</span>
            </span>
          )}
          {stageStatus === 'success' && (
            <span className="flex items-center space-x-1 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              <CheckCircle2 className="w-3 h-3" />
              <span>Pipeline Complete</span>
            </span>
          )}
          {stageStatus === 'error' && (
            <span className="flex items-center space-x-1 text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full">
              <AlertCircle className="w-3 h-3" />
              <span>Pipeline Halted</span>
            </span>
          )}
        </div>
      </div>

      {/* Log Feed Stream */}
      <div
        ref={scrollRef}
        className="flex-1 bg-slate-950 border border-slate-800/80 rounded-xl p-3 overflow-y-auto space-y-2 min-h-[160px] max-h-[300px] leading-relaxed"
      >
        {traceLogs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-600 text-[11px] italic">
            Waiting for file upload to start agent trace...
          </div>
        ) : (
          traceLogs.map((log, index) => {
            const isError = log.type === 'error';
            const isSuccess = log.type === 'success';
            const isStart = log.type === 'start';

            return (
              <div
                key={index}
                className={`flex items-start space-x-2.5 text-[11px] font-mono transition-all ${
                  isError
                    ? 'text-rose-400 bg-rose-950/20 p-1.5 rounded border border-rose-500/20'
                    : isSuccess
                    ? 'text-emerald-300'
                    : isStart
                    ? 'text-sky-300 font-semibold'
                    : 'text-slate-300'
                }`}
              >
                <span className="text-slate-500 shrink-0 select-none">{log.timestamp}</span>
                <span className="text-slate-600 shrink-0 select-none">│</span>
                <span className="flex-1">{log.text}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
