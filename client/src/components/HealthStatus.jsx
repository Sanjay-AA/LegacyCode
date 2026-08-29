import React, { useState, useEffect } from 'react';
import { checkHealth } from '../services/api';

export default function HealthStatus() {
  const [status, setStatus] = useState('checking'); // 'connected', 'error', 'checking'
  const [latency, setLatency] = useState(null);

  const fetchHealth = async () => {
    try {
      const data = await checkHealth();
      setLatency(data.latency || 12);
      setStatus('connected');
    } catch (err) {
      setStatus('error');
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center space-x-2 bg-[#070a0e] border border-[#1c2e38] rounded-lg px-3 py-1 font-mono text-xs">
      <span className={`w-2 h-2 rounded-full ${
        status === 'connected' ? 'bg-[#10b981] animate-pulse' : status === 'error' ? 'bg-rose-500' : 'bg-amber-400 animate-pulse'
      }`} />
      <span className={`font-bold ${
        status === 'connected' ? 'text-[#10b981]' : status === 'error' ? 'text-rose-400' : 'text-amber-400'
      }`}>
        {status === 'connected' ? 'Backend Connected' : status === 'error' ? 'Backend Disconnected' : 'Checking...'}
      </span>
      {status === 'connected' && latency !== null && (
        <span className="text-slate-500 border-l border-[#1c2e38] pl-2">
          {latency}ms
        </span>
      )}
    </div>
  );
}
