import React, { useState, useEffect } from 'react';
import { checkHealth } from '../services/api';
import { Activity, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';

export default function HealthStatus() {
  const [status, setStatus] = useState('checking'); // 'connected', 'error', 'checking'
  const [details, setDetails] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchHealth = async () => {
    setIsRefreshing(true);
    try {
      const data = await checkHealth();
      setDetails(data);
      setStatus('connected');
      setErrorMsg('');
    } catch (err) {
      console.error('Backend health check error:', err);
      setStatus('error');
      setErrorMsg(err.message || 'Failed to connect');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center space-x-3 bg-slate-800/80 border border-slate-700/60 rounded-full px-3.5 py-1.5 text-xs font-medium backdrop-blur-sm">
      <div className="flex items-center space-x-2">
        {status === 'connected' && (
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
        )}
        {status === 'error' && (
          <span className="relative flex h-2.5 w-2.5">
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
          </span>
        )}
        {status === 'checking' && (
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-pulse inline-flex rounded-full h-2.5 w-2.5 bg-amber-400"></span>
          </span>
        )}

        <span className="text-slate-300">
          Backend API: {' '}
          <strong className={status === 'connected' ? 'text-emerald-400 font-semibold' : status === 'error' ? 'text-rose-400 font-semibold' : 'text-amber-400 font-semibold'}>
            {status === 'connected' ? 'Connected' : status === 'error' ? 'Disconnected' : 'Checking...'}
          </strong>
        </span>
      </div>

      {status === 'connected' && details && (
        <span className="text-slate-400 hidden sm:inline border-l border-slate-700 pl-2.5">
          {details.latency}ms
        </span>
      )}

      {status === 'error' && (
        <span className="text-rose-400 hidden sm:inline border-l border-slate-700 pl-2.5 max-w-[150px] truncate" title={errorMsg}>
          {errorMsg}
        </span>
      )}

      <button
        onClick={fetchHealth}
        disabled={isRefreshing}
        title="Refresh health status"
        className="text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-50 p-0.5 rounded"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
      </button>
    </div>
  );
}
