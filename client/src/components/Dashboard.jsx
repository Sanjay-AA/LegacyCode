import React, { useState } from 'react';
import PipelineOverview from './PipelineOverview';
import CodeUploader from './CodeUploader';
import AnalysisViewer from './AnalysisViewer';
import PlanViewer from './PlanViewer';
import MigrateViewer from './MigrateViewer';
import VerifyViewer from './VerifyViewer';
import ShipViewer from './ShipViewer';
import { analyzeCode, generatePlan, performMigrationApi, runVerificationApi, shipMigrationApi } from '../services/api';
import { Search, Map, Code, CheckCircle, Send } from 'lucide-react';

export default function Dashboard() {
  const [code, setCode] = useState('');
  const [filename, setFilename] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [analyzeError, setAnalyzeError] = useState('');

  const [isPlanning, setIsPlanning] = useState(false);
  const [plan, setPlan] = useState(null);
  const [planError, setPlanError] = useState('');

  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationData, setMigrationData] = useState(null);
  const [migrationError, setMigrationError] = useState('');

  const [isVerifying, setIsVerifying] = useState(false);
  const [verification, setVerification] = useState(null);
  const [verifyError, setVerifyError] = useState('');

  const [isShipping, setIsShipping] = useState(false);
  const [shipResult, setShipResult] = useState(null);
  const [shipError, setShipError] = useState('');

  const [activeTab, setActiveTab] = useState('analyze'); // 'analyze' | 'plan' | 'migrate' | 'verify' | 'ship'

  const handleAnalyze = async () => {
    if (!code.trim()) return;
    setIsAnalyzing(true);
    setAnalyzeError('');
    setPlan(null);
    setMigrationData(null);
    setVerification(null);
    setShipResult(null);

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
    setMigrationData(null);
    setVerification(null);
    setShipResult(null);

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

  const handleRunMigration = async () => {
    if (!code || !analysis || !plan) return;
    setIsMigrating(true);
    setMigrationError('');
    setVerification(null);
    setShipResult(null);

    try {
      const migrationRes = await performMigrationApi(code, analysis, plan);
      setMigrationData(migrationRes);
      setActiveTab('migrate');
    } catch (err) {
      console.error('Migrate stage failed:', err);
      setMigrationError(err.message || 'Failed to execute code migration');
    } finally {
      setIsMigrating(false);
    }
  };

  const handleRunVerification = async () => {
    if (!code || !analysis || !plan || !migrationData) return;
    setIsVerifying(true);
    setVerifyError('');
    setShipResult(null);

    try {
      const verificationRes = await runVerificationApi(
        code,
        analysis,
        plan,
        migrationData.migratedCode
      );
      setVerification(verificationRes);
      setActiveTab('verify');
    } catch (err) {
      console.error('Verify stage failed:', err);
      setVerifyError(err.message || 'Failed to run behavioral verification');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleShip = async () => {
    if (!verification || verification.overallStatus !== 'VERIFIED') return;
    setIsShipping(true);
    setShipError('');

    try {
      const result = await shipMigrationApi();
      setShipResult(result);
      setActiveTab('ship');
    } catch (err) {
      console.error('Ship stage failed:', err);
      setShipError(err.message || 'Failed to ship migration');
    } finally {
      setIsShipping(false);
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 5-Stage Pipeline Status Overview */}
      <PipelineOverview
        hasAnalysis={!!analysis}
        hasPlan={!!plan}
        hasMigrated={!!migrationData}
        hasVerified={!!verification}
        hasShipped={!!shipResult}
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

        {/* Right: Results View (Tabbed Pipeline Outputs) */}
        <div className="flex flex-col h-full">
          {/* Result View Tab Selector Header */}
          <div className="flex items-center space-x-1 mb-3 bg-slate-900/60 p-1 rounded-xl border border-slate-800 text-[11px] font-semibold">
            <button
              onClick={() => setActiveTab('analyze')}
              className={`flex-1 py-1.5 px-1.5 rounded-lg flex items-center justify-center space-x-1 transition-colors ${
                activeTab === 'analyze'
                  ? 'bg-slate-800 text-sky-400 border border-slate-700/60 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Search className="w-3 h-3" />
              <span>1. Analyze {analysis ? '✓' : ''}</span>
            </button>

            <button
              onClick={() => setActiveTab('plan')}
              disabled={!analysis}
              className={`flex-1 py-1.5 px-1.5 rounded-lg flex items-center justify-center space-x-1 transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                activeTab === 'plan'
                  ? 'bg-slate-800 text-sky-400 border border-slate-700/60 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Map className="w-3 h-3" />
              <span>2. Plan {plan ? '✓' : ''}</span>
            </button>

            <button
              onClick={() => setActiveTab('migrate')}
              disabled={!plan}
              className={`flex-1 py-1.5 px-1.5 rounded-lg flex items-center justify-center space-x-1 transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                activeTab === 'migrate'
                  ? 'bg-slate-800 text-sky-400 border border-slate-700/60 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code className="w-3 h-3" />
              <span>3. Migrate {migrationData ? '✓' : ''}</span>
            </button>

            <button
              onClick={() => setActiveTab('verify')}
              disabled={!migrationData}
              className={`flex-1 py-1.5 px-1.5 rounded-lg flex items-center justify-center space-x-1 transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                activeTab === 'verify'
                  ? 'bg-slate-800 text-emerald-400 border border-slate-700/60 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <CheckCircle className="w-3 h-3" />
              <span>4. Verify {verification ? '✓' : ''}</span>
            </button>

            <button
              onClick={() => setActiveTab('ship')}
              disabled={!verification}
              className={`flex-1 py-1.5 px-1.5 rounded-lg flex items-center justify-center space-x-1 transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                activeTab === 'ship'
                  ? 'bg-slate-800 text-sky-400 border border-slate-700/60 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Send className="w-3 h-3" />
              <span>5. Ship {shipResult ? '✓' : ''}</span>
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
                      Analysis complete! Proceed to Stage 2: Plan.
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
            ) : activeTab === 'plan' ? (
              <div className="h-full flex flex-col">
                <PlanViewer
                  plan={plan}
                  onGeneratePlan={handleGeneratePlan}
                  isPlanning={isPlanning}
                  planError={planError}
                  hasAnalysis={!!analysis}
                />
                {plan && (
                  <div className="mt-3 bg-slate-900/60 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
                    <span className="text-xs text-slate-300">
                      Plan generated! Proceed to Stage 3: Migrate.
                    </span>
                    <button
                      onClick={handleRunMigration}
                      disabled={isMigrating}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition-colors flex items-center space-x-1.5 shadow"
                    >
                      <Code className="w-3.5 h-3.5" />
                      <span>Run Code Migration →</span>
                    </button>
                  </div>
                )}
              </div>
            ) : activeTab === 'migrate' ? (
              <div className="h-full flex flex-col">
                <MigrateViewer
                  migrationData={migrationData}
                  rawCode={code}
                  onRunMigration={handleRunMigration}
                  isMigrating={isMigrating}
                  migrationError={migrationError}
                  hasPlan={!!plan}
                />
                {migrationData && (
                  <div className="mt-3 bg-slate-900/60 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
                    <span className="text-xs text-slate-300">
                      Code migration complete! Proceed to Stage 4: Verify.
                    </span>
                    <button
                      onClick={handleRunVerification}
                      disabled={isVerifying}
                      className="bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition-colors flex items-center space-x-1.5 shadow"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Run Verification Stage →</span>
                    </button>
                  </div>
                )}
              </div>
            ) : activeTab === 'verify' ? (
              <div className="h-full flex flex-col">
                <VerifyViewer
                  verification={verification}
                  onRunVerification={handleRunVerification}
                  isVerifying={isVerifying}
                  verifyError={verifyError}
                  hasMigrated={!!migrationData}
                />
                {verification && verification.overallStatus === 'VERIFIED' && (
                  <div className="mt-3 bg-slate-900/60 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
                    <span className="text-xs text-emerald-400 font-semibold">
                      Verification Passed 100%! Ready to Ship.
                    </span>
                    <button
                      onClick={handleShip}
                      disabled={isShipping}
                      className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition-colors flex items-center space-x-1.5 shadow"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Proceed to Ship Stage →</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <ShipViewer
                shipResult={shipResult}
                onShip={handleShip}
                isShipping={isShipping}
                shipError={shipError}
                hasVerified={!!verification}
                verification={verification}
              />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
