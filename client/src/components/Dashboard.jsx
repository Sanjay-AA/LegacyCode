import React, { useState } from 'react';
import PipelineOverview from './PipelineOverview';
import CodeUploader from './CodeUploader';
import AnalysisViewer from './AnalysisViewer';
import { analyzeCode } from '../services/api';

export default function Dashboard() {
  const [code, setCode] = useState('');
  const [filename, setFilename] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!code.trim()) return;
    setIsAnalyzing(true);
    setError('');

    try {
      const result = await analyzeCode(code, filename || 'legacy-component.js');
      setAnalysis(result);
    } catch (err) {
      console.error('Analyze stage failed:', err);
      setError(err.message || 'Failed to analyze jQuery code');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 5-Stage Pipeline Status Overview */}
      <PipelineOverview currentStage="analyze" hasAnalysis={!!analysis} />

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
          error={error}
        />

        {/* Right: Analysis Results Viewer */}
        <AnalysisViewer analysis={analysis} />
      </div>
    </main>
  );
}
