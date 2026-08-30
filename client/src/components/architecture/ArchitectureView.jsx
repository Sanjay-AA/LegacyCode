import React, { useState, useEffect } from 'react';
import ArchitectureAsciiView from './ArchitectureAsciiView';
import ArchitectureInsights from './ArchitectureInsights';
import { fetchLegacyArchitectureApi, fetchModernArchitectureApi, fetchArchitectureComparisonApi } from '../../services/api';
import { RefreshCw, GitCompare, Layers, AlertCircle, Info, Terminal } from 'lucide-react';

export default function ArchitectureView({ session }) {
  const [activeMode, setActiveMode] = useState('compare'); // 'compare' | 'legacy' | 'modern'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [legacyData, setLegacyData] = useState(null);
  const [modernData, setModernData] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);

  // Load architecture data when session updates
  useEffect(() => {
    loadArchitectureData();
  }, [session?.id, session?.migratedCode]);

  const loadArchitectureData = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Fetch Legacy Architecture from actual legacy workspace
      const legRes = await fetchLegacyArchitectureApi(session?.id);
      if (legRes.architecture) {
        setLegacyData(legRes.architecture);
      }

      // 2. Fetch Modern Architecture from actual modern workspace if migrated
      if (session?.migratedCode || session?.verification) {
        try {
          const modRes = await fetchModernArchitectureApi(session?.id);
          if (modRes.architecture) {
            setModernData(modRes.architecture);
          }

          const compRes = await fetchArchitectureComparisonApi(session?.id);
          if (compRes.comparison) {
            setComparisonData(compRes.comparison);
          }
        } catch (_) {}
      }
    } catch (err) {
      console.error('Failed to load architecture:', err);
      setError(err.message || 'Architecture analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-mono max-w-7xl mx-auto">
      {/* Header & Controls Bar */}
      <div className="bg-[#0c1219] border border-[#1c2e38] rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1c2e38] pb-4">
          <div>
            <h2 className="text-xl font-extrabold text-white flex items-center space-x-2.5">
              <Terminal className="w-5 h-5 text-[#10b981]" />
              <span>SYSTEM ARCHITECTURE RECONSTRUCTION (ASCII FLOW)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Data-driven realistic ASCII architecture flow reconstructed directly from source code evidence.
            </p>
          </div>

          {/* Controls Toolbar */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center bg-[#070a0e] p-1 rounded-xl border border-[#1c2e38] text-xs font-bold">
              <button
                onClick={() => setActiveMode('compare')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 ${
                  activeMode === 'compare' ? 'bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/30' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <GitCompare className="w-3.5 h-3.5 text-purple-400" />
                <span>COMPARE</span>
              </button>

              <button
                onClick={() => setActiveMode('legacy')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeMode === 'legacy' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>LEGACY</span>
              </button>

              <button
                onClick={() => setActiveMode('modern')}
                disabled={!session?.migratedCode && !modernData}
                className={`px-3 py-1.5 rounded-lg transition-all disabled:opacity-40 ${
                  activeMode === 'modern' ? 'bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/30' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>MODERN</span>
              </button>
            </div>

            {/* Refresh Analysis Button */}
            <button
              onClick={loadArchitectureData}
              disabled={loading}
              className="p-2 bg-[#111a22] text-slate-300 hover:text-white border border-[#1c2e38] rounded-xl transition-colors"
              title="Refresh Architecture Analysis"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#10b981]' : ''}`} />
            </button>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
            <span>
              Representation Mode:{' '}
              <strong className="text-slate-200 uppercase">
                {activeMode === 'compare' ? 'DUAL LEGACY vs MODERN ASCII SYSTEM FLOW' : `${activeMode.toUpperCase()} ASCII ARCHITECTURE`}
              </strong>
            </span>
          </span>

          {!session?.migratedCode && (
            <span className="text-amber-400 text-[11px] flex items-center space-x-1">
              <Info className="w-3.5 h-3.5" />
              <span>Complete migration to generate Modern ASCII Architecture</span>
            </span>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && !legacyData && (
        <div className="bg-[#0c1219] border border-[#1c2e38] rounded-2xl p-12 text-center text-slate-300 space-y-3">
          <RefreshCw className="w-8 h-8 text-[#10b981] animate-spin mx-auto" />
          <p className="font-bold text-sm">Analyzing source code evidence and building ASCII architecture flow...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-rose-950/40 border border-rose-500/40 rounded-2xl p-6 text-xs text-rose-300 space-y-2">
          <div className="flex items-center space-x-2 font-bold text-rose-400 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>Architecture Analysis Error</span>
          </div>
          <p className="bg-[#070a0e] p-3 rounded-xl border border-rose-500/20 text-slate-200">{error}</p>
        </div>
      )}

      {/* Main View Area: Sole ASCII Flow Visualization */}
      {!loading && !error && (
        <div className="space-y-6">
          <ArchitectureAsciiView
            legacyArch={legacyData}
            modernArch={modernData}
            selectedMode={activeMode}
          />

          {/* Transformation Metrics Summary */}
          <ArchitectureInsights
            architecture={modernData || legacyData}
            isModern={Boolean(modernData)}
          />
        </div>
      )}
    </div>
  );
}
