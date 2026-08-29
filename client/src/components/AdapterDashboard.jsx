import React, { useState, useEffect } from 'react';
import { Layers, CheckCircle2, AlertTriangle, Play, RefreshCw, Activity, Terminal } from 'lucide-react';

export default function AdapterDashboard({ onRunTest }) {
  const [healthData, setHealthData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAdapterId, setSelectedAdapterId] = useState('jquery-to-react');
  const [testResult, setTestResult] = useState(null);

  const fetchHealth = () => {
    setIsLoading(true);
    fetch('/api/pipeline/health')
      .then(res => res.json())
      .then(data => {
        setHealthData(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Health check error:', err);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const handleRunSingleCheck = (adapterId) => {
    setIsLoading(true);
    setSelectedAdapterId(adapterId);
    fetch(`/api/pipeline/health/${adapterId}`)
      .then(res => res.json())
      .then(data => {
        setTestResult(data.results?.[0] || null);
        setIsLoading(false);
      })
      .catch(console.error);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
      <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">Adapter Health & Capability Dashboard</h3>
            <p className="text-xs text-slate-400">Live capability validation across registered migration adapters</p>
          </div>
        </div>

        <button
          onClick={fetchHealth}
          disabled={isLoading}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-4 py-2 rounded-xl border border-slate-700 flex items-center space-x-2 shadow"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Run All Capability Audits</span>
        </button>
      </div>

      {/* Metrics Summary */}
      {healthData && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
          <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl space-y-1">
            <span className="text-slate-500 uppercase text-[10px]">Total Adapters</span>
            <p className="text-slate-200 text-lg font-bold">{healthData.totalAdapters}</p>
          </div>
          <div className="bg-slate-950/70 border border-emerald-500/20 p-3.5 rounded-xl space-y-1">
            <span className="text-slate-500 uppercase text-[10px]">Fully Implemented (Healthy)</span>
            <p className="text-emerald-400 text-lg font-bold">{healthData.implementedCount}</p>
          </div>
          <div className="bg-slate-950/70 border border-amber-500/20 p-3.5 rounded-xl space-y-1">
            <span className="text-slate-500 uppercase text-[10px]">Experimental</span>
            <p className="text-amber-400 text-lg font-bold">{healthData.experimentalCount}</p>
          </div>
        </div>
      )}

      {/* Adapter Capabilities Table */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-300 uppercase font-mono">
          Registered Adapters Status Matrix
        </h4>

        <div className="space-y-2">
          {healthData?.results?.map((adapter) => {
            const isImplemented = adapter.status === 'implemented';
            const caps = adapter.capabilities || {};

            return (
              <div key={adapter.id} className="bg-slate-950/80 border border-slate-800/80 p-3.5 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                <div className="flex items-center space-x-3 min-w-[200px]">
                  <div className={`p-1.5 rounded-lg ${isImplemented ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                    {isImplemented ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  </div>
                  <div>
                    <span className="font-bold text-slate-200">{adapter.source} → {adapter.target}</span>
                    <p className="text-[10px] text-slate-500 capitalize">{adapter.category} stack</p>
                  </div>
                </div>

                {/* Capability Pills */}
                <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                  <span className={`px-2 py-0.5 rounded border ${caps.detect ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-900 text-slate-600'}`}>Detect</span>
                  <span className={`px-2 py-0.5 rounded border ${caps.analyze ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-900 text-slate-600'}`}>Analyze</span>
                  <span className={`px-2 py-0.5 rounded border ${caps.plan ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-900 text-slate-600'}`}>Plan</span>
                  <span className={`px-2 py-0.5 rounded border ${caps.migrate ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-900 text-slate-600'}`}>Migrate</span>
                  <span className={`px-2 py-0.5 rounded border ${caps.verify ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-900 text-slate-600'}`}>Verify</span>
                  <span className={`px-2 py-0.5 rounded border ${caps.repair ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-900 text-slate-600'}`}>Repair</span>
                  <span className={`px-2 py-0.5 rounded border ${caps.ship ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-900 text-slate-600'}`}>Ship</span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className={`px-2.5 py-0.5 rounded font-bold uppercase text-[10px] border ${
                    isImplemented ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}>
                    {isImplemented ? '✓ Implemented' : '⚠ Experimental'}
                  </span>

                  <button
                    onClick={() => handleRunSingleCheck(adapter.id)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                    title="Run Single Check"
                  >
                    <Play className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Test Result Inspector if run */}
      {testResult && (
        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2 text-xs font-mono">
          <div className="flex items-center justify-between text-sky-400 font-bold">
            <span>Capability Test Result for {testResult.source} → {testResult.target}</span>
            <span>{testResult.health}</span>
          </div>
          <div className="text-[11px] text-slate-400 space-y-1">
            <p>Analysis Timing: {testResult.metrics?.analysisDurationMs}ms</p>
            <p>Migration Timing: {testResult.metrics?.migrationDurationMs}ms</p>
            <p>Verification Timing: {testResult.metrics?.verificationDurationMs}ms</p>
          </div>
        </div>
      )}
    </div>
  );
}
