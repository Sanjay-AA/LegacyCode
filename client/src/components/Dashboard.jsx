import React, { useState } from 'react';
import PipelineOverview from './PipelineOverview';
import CodeUploader from './CodeUploader';
import AnalysisViewer from './AnalysisViewer';
import PlanViewer from './PlanViewer';
import { analyzeCode, generatePlan } from '../services/api';
import { Search, Map } from 'lucide-react';

export default function Dashboard() {
  const [code, setCode] = useState('');
  const [filename, setFilename] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [analyzeError, setAnalyzeError] = useState('');

  const [isPlanning, setIsPlanning] = useState(false);
  const [plan, setPlan] = useState(null);
  const [planError, setPlanError] = useState('');

  const [activeTab, setActiveTab] = useState('analyze'); // 'analyze' | 'plan'

  const handleAnalyze = async () => {
    if (!code.trim()) return;
    setIsAnalyzing(true);
    setAnalyzeError('');
    setPlan(null); // Reset downstream plan on new analysis

    try {
      const result = await analyzeCode(code, filename || 'legacy-component.js');
      setAnalysis(result);
      setActiveTab('analyze');
    } catch (err) {
      console.error('Analyze stage failed:', err);
      setAnalyzeError(err.message || 'Failed to analyze jQuery code');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGeneratePlan = async () => {
    if (!analysis) return;
    setIsPlanning(true);
    setPlanError('');

    try {
      const planResult = await generatePlan(analysis);
      setPlan(planResult);
      setActiveTab('plan');
    } catch (err) {
      console.error('Plan stage failed:', err);
      setPlanError(err.message || 'Failed to generate migration plan');
    } finally {
      setIsPlanning(false);
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 5-Stage Pipeline Status Overview */}
      <PipelineOverview
        hasAnalysis={!!analysis}
        hasPlan={!!plan}
        activeTab={activeTab}
      />

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[580px]">
        {/* Left: Code Input & Uploader */}
        <CodeUploader
          code={code}
          setCode={setCode}
          filename={filename}
          setFilename={setFilename}
          onAnalyze={handleAnalyze}
          isAnalyzing={isAnalyzing}
          error={analyzeError}
        />

        {/* Right: Results View (Tabbed: Analyze Output vs. Plan Blueprint) */}
        <div className="flex flex-col h-full">
          {/* Result View Tab Selector Header */}
          <div className="flex items-center space-x-2 mb-3 bg-slate-900/60 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('analyze')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center space-x-2 transition-colors ${
                activeTab === 'analyze'
                  ? 'bg-slate-800 text-sky-400 border border-slate-700/60 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>1. Analyze Output {analysis ? '✓' : ''}</span>
            </button>

            <button
              onClick={() => setActiveTab('plan')}
              disabled={!analysis}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center space-x-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                activeTab === 'plan'
                  ? 'bg-slate-800 text-sky-400 border border-slate-700/60 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              <span>2. Migration Plan {plan ? '✓' : ''}</span>
            </button>
          </div>

          {/* Active Result View Content */}
          <div className="flex-1">
            {activeTab === 'analyze' ? (
              <div className="h-full flex flex-col">
                <AnalysisViewer analysis={analysis} />
                {analysis && (
                  <div className="mt-3 bg-slate-900/60 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
                    <span className="text-xs text-slate-300">
                      Analysis complete! Ready for Stage 2.
                    </span>
                    <button
                      onClick={handleGeneratePlan}
                      disabled={isPlanning}
                      className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition-colors flex items-center space-x-1.5 shadow"
                    >
                      <Map className="w-3.5 h-3.5" />
                      <span>Proceed to Plan Stage →</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <PlanViewer
                plan={plan}
                onGeneratePlan={handleGeneratePlan}
                isPlanning={isPlanning}
                planError={planError}
                hasAnalysis={!!analysis}
              />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
