import React, { useEffect, useRef } from 'react';
import { Terminal, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function AgentTrace({ traceLogs = [], currentStage, stageStatus, errorState }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [traceLogs]);

  return (
    <div className="bg-[#0c1219] border border-[#1c2e38] rounded-2xl p-4 flex flex-col h-full font-mono text-xs overflow-hidden shadow-xl">
      <div className="flex items-center justify-between pb-3 border-b border-[#1c2e38] mb-3">
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20">
            <Terminal className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-slate-200 uppercase tracking-wider">Agent Trace</span>
        </div>

        <div className="flex items-center space-x-2 text-[11px]">
          {stageStatus === 'running' && (
            <span className="flex items-center space-x-1.5 text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded-full animate-pulse font-bold">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Active Agent Stream</span>
            </span>
          )}
          {(stageStatus === 'success' || stageStatus === 'ready_for_review') && (
            <span className="flex items-center space-x-1 text-[#10b981] bg-[#10b981]/10 border border-[#10b981]/20 px-2 py-0.5 rounded-full font-bold">
              <CheckCircle2 className="w-3 h-3" />
              <span>Pipeline Stream Active</span>
            </span>
          )}
          {stageStatus === 'error' && (
            <span className="flex items-center space-x-1 text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full font-bold">
              <AlertCircle className="w-3 h-3" />
              <span>Pipeline Halted</span>
            </span>
          )}
        </div>
      </div>

      {/* Log Feed Stream */}
      <div
        ref={scrollRef}
        className="flex-1 bg-[#070a0e] border border-[#1c2e38] rounded-xl p-3 overflow-y-auto space-y-2 min-h-[160px] max-h-[360px] leading-relaxed"
      >
        {traceLogs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-600 text-[11px] italic">
            Waiting for file upload to start agent trace stream...
          </div>
        ) : (
          traceLogs.map((log, index) => {
            const isError = log.type === 'error';
            const isSuccess = log.type === 'success';
            const isStart = log.type === 'start';

            return (
              <div
                key={index}
                className={`flex items-start space-x-2 text-[11px] font-mono transition-all ${
                  isError
                    ? 'text-rose-400 bg-rose-950/20 p-1.5 rounded border border-rose-500/20'
                    : isSuccess
                    ? 'text-[#10b981] font-semibold'
                    : isStart
                    ? 'text-sky-300 font-semibold'
                    : 'text-slate-300'
                }`}
              >
                <span className="text-slate-500 shrink-0 select-none">{log.timestamp}</span>
                <span className="text-[#10b981] shrink-0 font-bold select-none">
                  {isError ? '✕' : isSuccess ? '✓' : isStart ? '●' : 'ℹ'}
                </span>
                <span className="flex-1">{log.text}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
