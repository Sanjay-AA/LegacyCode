import React, { useState, useEffect, useRef } from 'react';
import Header from './Header';
import PipelineOverview from './PipelineOverview';
import CodeUploader from './CodeUploader';
import CodeWorkspace from './CodeWorkspace';
import AgentTrace from './AgentTrace';
import HealthReport from './HealthReport';
import RiskAssessment from './RiskAssessment';
import BehavioralContract from './BehavioralContract';
import TransformationExplanations from './TransformationExplanations';
import MigrationReport from './MigrationReport';
import DependencyGraph from './DependencyGraph';
import MigrationHistory from './MigrationHistory';
import AdapterDashboard from './AdapterDashboard';
import VerifyViewer from './VerifyViewer';
import PlanViewer from './PlanViewer';
import ArchitectureView from './architecture/ArchitectureView';
import { runPipelineStream, runProjectPipelineStream, shipMigrationApi, fetchAdaptersApi, openVSCodeApi, fetchWorkspaceStatusApi } from '../services/api';
import { calculateLegacySafetyScore, calculateModernSafetyScore } from '../services/migrationSafety';
import {
  RefreshCw, RotateCcw, XCircle, CheckCircle2, ExternalLink, GitPullRequest,
  Code, Activity, ShieldAlert, FileText, Lightbulb, Network, History, Award, Layers, Map, ShieldCheck, Send, Sparkles, FolderOpen, AlertCircle
} from 'lucide-react';

export default function Dashboard() {
  const [session, setSession] = useState({
    filename: null,
    rawCode: null,
    isProject: false,
    adapterId: 'jquery-to-react',
    detection: null,
    selectedAdapter: null,
    analysis: null,
    plan: null,
    migratedCode: null,
    migrationSummary: null,
    explanations: [],
    verification: null,
    repairAttempts: 0,
    readyForReview: false,
    shipResult: null,
    currentStage: 'idle',
    stageStatus: 'idle',
    errorState: null,
    traceLogs: []
  });

  const [activeTab, setActiveTab] = useState('workspace');
  const [adapters, setAdapters] = useState([]);
  const [history, setHistory] = useState([]);
  const [isShipping, setIsShipping] = useState(false);
  const [vscodeState, setVscodeState] = useState({ loading: false, success: false, error: null });
  const [workspaceStatus, setWorkspaceStatus] = useState({ changed: false, filesChanged: 0 });
  const abortControllerRef = useRef(null);

  useEffect(() => {
    fetchAdaptersApi().then(data => {
      if (data.adapters) setAdapters(data.adapters);
      if (data.history) setHistory(data.history);
    }).catch(console.error);
  }, []);

  const handleOpenVSCode = async () => {
    setVscodeState({ loading: true, success: false, error: null });
    try {
      await openVSCodeApi(session.id);
      setVscodeState({ loading: false, success: true, error: null });
      setTimeout(() => {
        setVscodeState(prev => ({ ...prev, success: false }));
      }, 3000);
    } catch (err) {
      setVscodeState({
        loading: false,
        success: false,
        error: err.message || "VS Code could not be opened. Make sure VS Code is installed and the 'code' command is available in your PATH."
      });
    }
  };

  const addTraceLog = (text, type = 'info', timestamp = null) => {
    const timeStr = timestamp || new Date().toLocaleTimeString('en-US', { hour12: false });
    setSession(prev => ({
      ...prev,
      traceLogs: [...prev.traceLogs, { timestamp: timeStr, text, type }]
    }));
  };

  const startPipeline = (codeContent, filename, chosenAdapterId) => {
    if (!codeContent || !codeContent.trim()) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const initialLog = {
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      text: `File uploaded: ${filename}`,
      type: 'start'
    };

    setSession({
      filename,
      rawCode: codeContent,
      isProject: false,
      adapterId: chosenAdapterId || 'jquery-to-react',
      detection: null,
      selectedAdapter: null,
      analysis: null,
      plan: null,
      migratedCode: null,
      migrationSummary: null,
      explanations: [],
      verification: null,
      repairAttempts: 0,
      readyForReview: false,
      shipResult: null,
      currentStage: 'detect',
      stageStatus: 'running',
      errorState: null,
      traceLogs: [initialLog]
    });

    setActiveTab('workspace');

    runPipelineStream(
      { code: codeContent, filename, adapterId: chosenAdapterId },
      handlePipelineEvent,
      handlePipelineError,
      handlePipelineComplete
    );
  };

  const startProjectPipeline = (zipBase64, filename, chosenAdapterId) => {
    if (!zipBase64) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const initialLog = {
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      text: `Project Archive Uploaded: ${filename}`,
      type: 'start'
    };

    setSession({
      filename,
      rawCode: `/* Project Archive: ${filename} */`,
      isProject: true,
      adapterId: chosenAdapterId || 'jquery-to-react',
      detection: null,
      selectedAdapter: null,
      analysis: null,
      plan: null,
      migratedCode: null,
      migrationSummary: null,
      explanations: [],
      verification: null,
      repairAttempts: 0,
      readyForReview: false,
      shipResult: null,
      currentStage: 'detect',
      stageStatus: 'running',
      errorState: null,
      traceLogs: [initialLog]
    });

    setActiveTab('workspace');

    runProjectPipelineStream(
      { projectZipBase64: zipBase64, filename, adapterId: chosenAdapterId },
      handlePipelineEvent,
      handlePipelineError,
      handlePipelineComplete
    );
  };

  const retryPipelineStage = () => {
    if (!session.errorState || !session.rawCode) return;

    const stageToRetry = session.errorState.stage || 'analyze';
    addTraceLog(`Retrying pipeline from stage: ${stageToRetry}...`, 'start');

    setSession(prev => ({
      ...prev,
      stageStatus: 'running',
      errorState: null,
      currentStage: stageToRetry
    }));

    runPipelineStream(
      { code: session.rawCode, filename: session.filename, adapterId: session.adapterId, retryStage: stageToRetry },
      handlePipelineEvent,
      handlePipelineError,
      handlePipelineComplete
    );
  };

  const handleApproveAndShip = async () => {
    if (!session.verification || session.verification.overallStatus !== 'VERIFIED') return;
    setIsShipping(true);

    addTraceLog('Human approval granted! Initiating GitHub branch creation & PR...', 'start');

    try {
      setSession(prev => ({ ...prev, currentStage: 'ship', stageStatus: 'running' }));
      const result = await shipMigrationApi();

      addTraceLog(`GitHub Pull Request #${result.pullRequest?.number} created successfully!`, 'success');

      setSession(prev => ({
        ...prev,
        shipResult: result,
        currentStage: 'completed',
        stageStatus: 'success',
        readyForReview: false
      }));

      fetchAdaptersApi().then(data => { if (data.history) setHistory(data.history); }).catch(() => {});
      setActiveTab('report');
    } catch (err) {
      console.error('Ship stage failed:', err);
      addTraceLog(`Shipping Error: ${err.message}`, 'error');
      setSession(prev => ({
        ...prev,
        stageStatus: 'error',
        errorState: {
          stage: 'ship',
          message: err.message || 'Failed to create GitHub Pull Request'
        }
      }));
    } finally {
      setIsShipping(false);
    }
  };

  const handlePipelineEvent = (eventType, data) => {
    const time = data.timestamp || new Date().toLocaleTimeString('en-US', { hour12: false });

    switch (eventType) {
      case 'detect:start':
        setSession(prev => ({
          ...prev,
          currentStage: 'detect',
          traceLogs: [...prev.traceLogs, { timestamp: time, text: data.message || 'Detecting technology stack...', type: 'start' }]
        }));
        break;

      case 'detect:complete':
        setSession(prev => ({
          ...prev,
          id: data.sessionId || prev.id,
          detection: data.detection || data.technologies,
          selectedAdapter: data.selectedAdapter,
          currentStage: 'analyze',
          traceLogs: [...prev.traceLogs, { timestamp: time, text: data.message || 'Technology stack identified', type: 'success' }]
        }));
        break;

      case 'analyze:start':
        setSession(prev => ({
          ...prev,
          currentStage: 'analyze',
          traceLogs: [...prev.traceLogs, { timestamp: time, text: data.message || 'Analyzing system behavior & health...', type: 'start' }]
        }));
        break;

      case 'analyze:complete':
        setSession(prev => ({
          ...prev,
          analysis: data.analysis,
          currentStage: 'plan',
          traceLogs: [
            ...prev.traceLogs,
            { timestamp: time, text: 'Legacy Health Report generated', type: 'info' },
            { timestamp: time, text: 'Behavioral Contract generated', type: 'success' }
          ]
        }));
        break;

      case 'plan:start':
        setSession(prev => ({
          ...prev,
          currentStage: 'plan',
          traceLogs: [...prev.traceLogs, { timestamp: time, text: data.message || 'Generating migration plan...', type: 'start' }]
        }));
        break;

      case 'plan:complete':
        setSession(prev => ({
          ...prev,
          plan: data.plan,
          currentStage: 'migrate',
          traceLogs: [...prev.traceLogs, { timestamp: time, text: data.message || 'Migration plan created', type: 'success' }]
        }));
        break;

      case 'migrate:start':
        setSession(prev => ({
          ...prev,
          currentStage: 'migrate',
          traceLogs: [...prev.traceLogs, { timestamp: time, text: data.message || 'Migrating code...', type: 'start' }]
        }));
        break;

      case 'migrate:complete':
        setSession(prev => ({
          ...prev,
          migratedCode: data.migratedCode,
          migrationSummary: data.summary,
          explanations: data.explanations || [],
          currentStage: 'verify',
          traceLogs: [...prev.traceLogs, { timestamp: time, text: data.message || 'Modernized code generated', type: 'success' }]
        }));
        break;

      case 'repair:start':
        setSession(prev => ({
          ...prev,
          repairAttempts: data.repairAttempt || 1,
          traceLogs: [
            ...prev.traceLogs,
            { timestamp: time, text: `Migration correction required (${data.failedTestName || 'Assertion Check'})`, type: 'error' },
            { timestamp: time, text: `Attempting autonomous self-repair ${data.repairAttempt}/${data.maxAttempts || 2}...`, type: 'start' }
          ]
        }));
        break;

      case 'repair:complete':
        setSession(prev => ({
          ...prev,
          migratedCode: data.migratedCode,
          traceLogs: [...prev.traceLogs, { timestamp: time, text: `Corrected implementation generated (Attempt ${data.repairAttempt})`, type: 'success' }]
        }));
        break;

      case 'verify:start':
        setSession(prev => ({
          ...prev,
          currentStage: 'verify',
          traceLogs: [...prev.traceLogs, { timestamp: time, text: data.message || 'Running behavioral verification...', type: 'start' }]
        }));
        break;

      case 'verify:complete':
        setSession(prev => ({
          ...prev,
          verification: data.verification,
          repairAttempts: data.repairAttempts || prev.repairAttempts,
          readyForReview: data.readyForReview || false,
          currentStage: 'verify',
          stageStatus: data.readyForReview ? 'ready_for_review' : prev.stageStatus,
          traceLogs: [
            ...prev.traceLogs,
            { timestamp: time, text: data.message || 'Verification complete', type: 'success' },
            ...(data.readyForReview ? [{ timestamp: time, text: 'Awaiting human approval before shipping...', type: 'start' }] : [])
          ]
        }));
        break;

      case 'pipeline:error':
        setSession(prev => ({
          ...prev,
          stageStatus: 'error',
          errorState: {
            stage: data.stage || prev.currentStage,
            message: data.error || data.message || 'Pipeline execution failed'
          },
          traceLogs: [...prev.traceLogs, { timestamp: time, text: `ERROR: ${data.error || data.message}`, type: 'error' }]
        }));
        break;

      case 'trace:log':
        addTraceLog(data.message, 'info', time);
        break;

      default:
        break;
    }
  };

  const handlePipelineError = (err) => {
    console.error('Pipeline streaming error:', err);
    setSession(prev => ({
      ...prev,
      stageStatus: 'error',
      errorState: {
        stage: prev.currentStage,
        message: err.message || 'Connection lost during pipeline streaming'
      },
      traceLogs: [
        ...prev.traceLogs,
        {
          timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
          text: `Pipeline Connection Error: ${err.message}`,
          type: 'error'
        }
      ]
    }));
  };

  const handlePipelineComplete = () => {
    setSession(prev => {
      if (prev.verification && prev.verification.overallStatus === 'VERIFIED') {
        return { ...prev, readyForReview: true };
      }
      return prev;
    });
  };

  const cancelPipeline = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setSession(prev => ({
      ...prev,
      stageStatus: 'error',
      errorState: { stage: prev.currentStage, message: 'Pipeline cancelled by user' },
      traceLogs: [
        ...prev.traceLogs,
        {
          timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
          text: 'Pipeline run cancelled by user.',
          type: 'error'
        }
      ]
    }));
  };

  const resetPipeline = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setSession({
      filename: null,
      rawCode: null,
      isProject: false,
      adapterId: 'jquery-to-react',
      detection: null,
      selectedAdapter: null,
      analysis: null,
      plan: null,
      migratedCode: null,
      migrationSummary: null,
      explanations: [],
      verification: null,
      repairAttempts: 0,
      readyForReview: false,
      shipResult: null,
      currentStage: 'idle',
      stageStatus: 'idle',
      errorState: null,
      traceLogs: []
    });
    setActiveTab('workspace');
  };

  const componentName = session.plan?.componentName || 'MigratedComponent';
  const legacySafety = calculateLegacySafetyScore(session.analysis);
  const modernSafety = calculateModernSafetyScore(session);

  const beforeScore = legacySafety.totalScore;
  const afterScore = modernSafety.totalScore;

  const activeAdapterSource = session.selectedAdapter?.source || session.analysis?.technology || 'jQuery';
  const activeAdapterTarget = session.selectedAdapter?.target || session.analysis?.target || 'React';

  const statusDisplay = session.shipResult
    ? 'Shipped'
    : session.readyForReview
    ? 'Ready for Review'
    : session.stageStatus === 'running'
    ? `${session.currentStage.toUpperCase()} Active`
    : session.stageStatus === 'error'
    ? 'Halted'
    : 'Idle';

  return (
    <>
      <Header
        sourceTech={activeAdapterSource}
        targetTech={activeAdapterTarget}
        status={statusDisplay}
        stageStatus={session.stageStatus}
        shipResult={session.shipResult}
      />

      <main className="max-[#070a0e] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {/* 7-Stage Universal Pipeline Overview Bar */}
        <PipelineOverview
          hasDetected={!!session.detection || !!session.analysis}
          hasAnalysis={!!session.analysis}
          hasPlan={!!session.plan}
          hasMigrated={!!session.migratedCode}
          hasVerified={!!session.verification}
          readyForReview={session.readyForReview}
          hasShipped={!!session.shipResult}
          currentStage={session.currentStage}
          errorState={session.errorState}
        />

        {/* Main Workspace Area */}
        {!session.rawCode ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-[#0c1219] p-1.5 rounded-xl border border-[#1c2e38] text-xs font-semibold font-mono max-w-5xl mx-auto">
              <button
                onClick={() => setActiveTab('workspace')}
                className={`px-4 py-2 rounded-lg flex items-center space-x-1.5 transition-colors ${
                  activeTab === 'workspace' ? 'bg-[#1c2e38] text-[#10b981]' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                <span>Universal Ingestion</span>
              </button>
              <button
                onClick={() => setActiveTab('adapters')}
                className={`px-4 py-2 rounded-lg flex items-center space-x-1.5 transition-colors ${
                  activeTab === 'adapters' ? 'bg-[#1c2e38] text-[#10b981]' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Adapter Capabilities Dashboard</span>
              </button>
            </div>

            {activeTab === 'adapters' ? (
              <div className="max-w-5xl mx-auto">
                <AdapterDashboard />
              </div>
            ) : (
              <CodeUploader
                onUpload={startPipeline}
                onUploadProject={startProjectPipeline}
                adapters={adapters}
                isProcessing={session.stageStatus === 'running'}
              />
            )}
          </div>
        ) : (
          /* ACTIVE / COMPLETED STATE: Universal Modernization Workspace */
          <div className="space-y-6">
            {/* Secondary Control Bar & Active Stack Indicator */}
            <div className="bg-[#0c1219] border border-[#1c2e38] rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xl">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono text-xs font-bold">
                  {session.filename || 'legacy-file'}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-200 flex items-center space-x-2 font-mono">
                    <span className="text-slate-400">{activeAdapterSource}</span>
                    <span className="text-slate-500">→</span>
                    <span className="text-[#10b981]">{activeAdapterTarget} ({componentName})</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    {session.stageStatus === 'running'
                      ? `Executing Stage: ${session.currentStage.toUpperCase()}...`
                      : session.shipResult
                      ? 'Migration fully completed & shipped!'
                      : session.readyForReview
                      ? 'Awaiting Human Approval Gate'
                      : `Halted at stage: ${session.currentStage.toUpperCase()}`}
                  </p>
                </div>
              </div>

              {/* Secondary Controls */}
              <div className="flex items-center space-x-2 font-mono text-xs">
                {session.stageStatus === 'running' && (
                  <button
                    onClick={cancelPipeline}
                    className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 px-3.5 py-1.5 rounded-xl transition-colors flex items-center space-x-1.5 font-bold"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Cancel Migration</span>
                  </button>
                )}

                {session.stageStatus === 'error' && (
                  <button
                    onClick={retryPipelineStage}
                    className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 px-3.5 py-1.5 rounded-xl transition-colors flex items-center space-x-1.5 font-bold"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Retry Stage ({session.errorState?.stage || 'current'})</span>
                  </button>
                )}

                <button
                  onClick={resetPipeline}
                  className="bg-[#111a22] hover:bg-[#16222d] text-slate-200 border border-[#1c2e38] px-3.5 py-1.5 rounded-xl transition-colors flex items-center space-x-1.5 font-bold"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#10b981]" />
                  <span>Start New Migration</span>
                </button>
              </div>
            </div>

            {/* DETECTED PROJECT STACK BANNER */}
            {session.analysis?.stackDetection?.migrations && (
              <div className="bg-[#0c1219] border border-[#1c2e38] rounded-2xl p-4 space-y-2 font-mono text-xs shadow-xl">
                <span className="font-extrabold text-slate-300 uppercase tracking-wider text-[11px] block border-b border-[#1c2e38] pb-1.5">
                  DETECTED PROJECT STACK & PLANNED MIGRATIONS
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  {session.analysis.stackDetection.migrations.map((m, idx) => (
                    <div key={idx} className="bg-[#070a0e] p-2.5 rounded-xl border border-[#1c2e38] flex items-center justify-between">
                      <span className="text-slate-400 capitalize">{m.layer}: <strong className="text-white">{m.source}</strong></span>
                      <span className="text-[#10b981] font-bold">→ {m.target}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* HUMAN APPROVAL GATE BANNER */}
            {session.readyForReview && !session.shipResult && (
              <div className="bg-[#0c1219] border-2 border-[#10b981] rounded-2xl p-6 shadow-2xl space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-[#1c2e38]">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-2xl bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/30">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2 font-mono">
                        READY TO SHIP — Waiting for your approval
                      </h3>
                      <p className="text-xs text-slate-300">
                        Continue editing the migrated project locally or review before creating the GitHub Pull Request.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {/* OPEN IN VS CODE BUTTON */}
                    <button
                      onClick={handleOpenVSCode}
                      disabled={vscodeState.loading}
                      className="bg-[#10b981]/10 hover:bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/30 disabled:opacity-50 text-xs font-extrabold font-mono px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center space-x-2"
                      title="Continue editing the migrated project locally in VS Code"
                    >
                      <FolderOpen className="w-4 h-4 stroke-[2.5]" />
                      <span>
                        {vscodeState.loading
                          ? 'Opening VS Code...'
                          : vscodeState.success
                          ? 'VS Code Opened ✓'
                          : 'Open in VS Code'}
                      </span>
                    </button>

                    <button
                      onClick={() => setActiveTab('workspace')}
                      className="bg-[#111a22] hover:bg-[#16222d] text-slate-200 text-xs font-bold font-mono px-4 py-2.5 rounded-xl border border-[#1c2e38] transition-all"
                    >
                      Review Migration Details
                    </button>
                    <button
                      onClick={handleApproveAndShip}
                      disabled={isShipping}
                      className="bg-[#10b981] hover:bg-emerald-400 disabled:opacity-50 text-slate-950 text-xs font-extrabold font-mono px-6 py-2.5 rounded-xl shadow-lg transition-all flex items-center space-x-2"
                    >
                      {isShipping ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Creating PR...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 stroke-[2.5]" />
                          <span>Approve & Create PR</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {vscodeState.error && (
                  <div className="bg-rose-950/40 border border-rose-500/40 text-rose-300 p-3 rounded-xl text-xs font-mono flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{vscodeState.error}</span>
                  </div>
                )}

                {workspaceStatus.changed && (
                  <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 p-3 rounded-xl text-xs font-mono flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Local Changes Detected ({workspaceStatus.filesChanged} file(s) modified)</span>
                    </div>
                    <button
                      disabled
                      className="bg-amber-500/20 text-amber-300 text-xs px-3 py-1 rounded-lg border border-amber-500/30 opacity-75 cursor-not-allowed"
                    >
                      Verify Local Changes (Coming Soon)
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                  <div className="bg-[#070a0e] border border-[#1c2e38] p-3 rounded-xl flex items-center space-x-2 text-[#10b981]">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Verification: {session.verification?.metrics?.passedTests}/{session.verification?.metrics?.totalTests} passed</span>
                  </div>
                  <div className="bg-[#070a0e] border border-[#1c2e38] p-3 rounded-xl flex items-center space-x-2 text-purple-300">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Migration Safety: {beforeScore} → {afterScore} ({modernSafety.riskLevel})</span>
                  </div>
                  <div className="bg-[#070a0e] border border-[#1c2e38] p-3 rounded-xl flex items-center space-x-2 text-sky-300">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Self-Repair: {session.repairAttempts} attempt(s)</span>
                  </div>
                </div>
              </div>
            )}

            {/* FINAL SUCCESS BANNER */}
            {session.shipResult && (
              <div className="bg-[#0c1219] border border-[#10b981] rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#1c2e38]">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-2xl bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/30">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2 font-mono">
                        MIGRATION SHIPPED ✓
                      </h3>
                      <p className="text-xs text-[#10b981]">
                        Successfully modernized {activeAdapterSource} → {activeAdapterTarget} and opened GitHub Pull Request #{session.shipResult.pullRequest?.number}.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {/* OPEN IN VS CODE BUTTON ALSO IN SHIPPED BANNER */}
                    <button
                      onClick={handleOpenVSCode}
                      disabled={vscodeState.loading}
                      className="bg-[#10b981]/10 hover:bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/30 disabled:opacity-50 text-xs font-extrabold font-mono px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center space-x-2"
                      title="Continue editing the migrated project locally in VS Code"
                    >
                      <FolderOpen className="w-4 h-4 stroke-[2.5]" />
                      <span>
                        {vscodeState.loading
                          ? 'Opening VS Code...'
                          : vscodeState.success
                          ? 'VS Code Opened ✓'
                          : 'Open in VS Code'}
                      </span>
                    </button>

                    <a
                      href={session.shipResult.pullRequest?.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[#10b981] hover:bg-emerald-400 text-slate-950 text-xs font-extrabold font-mono px-5 py-2.5 rounded-xl shadow-lg transition-all flex items-center space-x-2"
                    >
                      <GitPullRequest className="w-4 h-4 stroke-[2.5]" />
                      <span>View Pull Request #{session.shipResult.pullRequest?.number}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* ERROR ALERT BANNER */}
            {session.errorState && (
              <div className="bg-rose-950/40 border border-rose-500/40 rounded-2xl p-5 text-xs text-rose-300 space-y-2 shadow-lg font-mono">
                <div className="flex items-center space-x-2 font-bold text-rose-400 text-sm">
                  <XCircle className="w-5 h-5 shrink-0" />
                  <span>Pipeline Stopped: {session.errorState.stage.toUpperCase()} Stage Error</span>
                </div>
                <p className="text-slate-200 bg-[#070a0e] p-3 rounded-xl border border-rose-500/20">
                  {session.errorState.message}
                </p>
              </div>
            )}

            {/* VIEW SELECTOR TABS */}
            <div className="flex items-center space-x-1 bg-[#0c1219] p-1.5 rounded-xl border border-[#1c2e38] text-xs font-mono font-bold overflow-x-auto">
              <button
                onClick={() => setActiveTab('workspace')}
                className={`px-3 py-2 rounded-lg flex items-center space-x-1.5 transition-colors ${
                  activeTab === 'workspace' ? 'bg-[#1c2e38] text-[#10b981]' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                <span>Live Code Workspace</span>
              </button>

              <button
                onClick={() => setActiveTab('plan')}
                disabled={!session.plan}
                className={`px-3 py-2 rounded-lg flex items-center space-x-1 transition-colors disabled:opacity-40 ${
                  activeTab === 'plan' ? 'bg-[#1c2e38] text-[#10b981]' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Map className="w-3.5 h-3.5" />
                <span>Migration Plan</span>
              </button>

              <button
                onClick={() => setActiveTab('architecture')}
                disabled={!session.rawCode}
                className={`px-3 py-2 rounded-lg flex items-center space-x-1 transition-colors disabled:opacity-40 ${
                  activeTab === 'architecture' ? 'bg-[#1c2e38] text-[#10b981]' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Architecture</span>
              </button>

              <button
                onClick={() => setActiveTab('health')}
                disabled={!session.analysis}
                className={`px-3 py-2 rounded-lg flex items-center space-x-1 transition-colors disabled:opacity-40 ${
                  activeTab === 'health' ? 'bg-[#1c2e38] text-rose-400' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Legacy Health</span>
              </button>

              <button
                onClick={() => setActiveTab('risk')}
                disabled={!session.analysis}
                className={`px-3 py-2 rounded-lg flex items-center space-x-1 transition-colors disabled:opacity-40 ${
                  activeTab === 'risk' ? 'bg-[#1c2e38] text-purple-400' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Migration Safety</span>
              </button>

              <button
                onClick={() => setActiveTab('graph')}
                disabled={!session.analysis}
                className={`px-3 py-2 rounded-lg flex items-center space-x-1 transition-colors disabled:opacity-40 ${
                  activeTab === 'graph' ? 'bg-[#1c2e38] text-indigo-400' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Network className="w-3.5 h-3.5" />
                <span>Dependency Graph</span>
              </button>

              <button
                onClick={() => setActiveTab('contract')}
                disabled={!session.analysis}
                className={`px-3 py-2 rounded-lg flex items-center space-x-1 transition-colors disabled:opacity-40 ${
                  activeTab === 'contract' ? 'bg-[#1c2e38] text-teal-400' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Behavioral Contract</span>
              </button>

              <button
                onClick={() => setActiveTab('explanations')}
                disabled={!session.migratedCode}
                className={`px-3 py-2 rounded-lg flex items-center space-x-1 transition-colors disabled:opacity-40 ${
                  activeTab === 'explanations' ? 'bg-[#1c2e38] text-amber-400' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span>Explanations</span>
              </button>

              <button
                onClick={() => setActiveTab('verify')}
                disabled={!session.verification}
                className={`px-3 py-2 rounded-lg flex items-center space-x-1 transition-colors disabled:opacity-40 ${
                  activeTab === 'verify' ? 'bg-[#1c2e38] text-[#10b981]' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verification</span>
              </button>

              <button
                onClick={() => setActiveTab('history')}
                className={`px-3 py-2 rounded-lg flex items-center space-x-1 transition-colors ${
                  activeTab === 'history' ? 'bg-[#1c2e38] text-cyan-400' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>History ({history.length})</span>
              </button>

              {session.shipResult && (
                <button
                  onClick={() => setActiveTab('report')}
                  className={`px-3 py-2 rounded-lg flex items-center space-x-1 transition-colors ${
                    activeTab === 'report' ? 'bg-[#1c2e38] text-[#10b981]' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Final Report</span>
                </button>
              )}
            </div>

            {/* ACTIVE CONTENT VIEW */}
            {activeTab === 'workspace' ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <CodeWorkspace
                    originalSource={session.rawCode}
                    filename={session.filename}
                    migratedSource={session.migratedCode}
                    componentName={componentName}
                    currentStage={session.currentStage}
                    isMigrating={session.currentStage === 'migrate'}
                  />
                </div>

                <div className="lg:col-span-1">
                  <AgentTrace
                    traceLogs={session.traceLogs}
                    currentStage={session.currentStage}
                    stageStatus={session.stageStatus}
                    errorState={session.errorState}
                  />
                </div>
              </div>
            ) : activeTab === 'plan' ? (
              <PlanViewer plan={session.plan} />
            ) : activeTab === 'architecture' ? (
              <ArchitectureView session={session} />
            ) : activeTab === 'adapters' ? (
              <AdapterDashboard />
            ) : activeTab === 'health' ? (
              <HealthReport
                healthData={session.analysis?.health}
                filename={session.filename}
                patterns={session.analysis?.patterns}
                risks={session.analysis?.risks}
              />
            ) : activeTab === 'risk' ? (
              <RiskAssessment
                beforeScore={legacySafety.totalScore}
                afterScore={modernSafety.totalScore}
                beforeLevel={legacySafety.riskLevel}
                afterLevel={modernSafety.riskLevel}
                breakdown={modernSafety.breakdown}
                reasons={session.analysis?.risks?.map(r => r.title) || []}
              />
            ) : activeTab === 'graph' ? (
              <DependencyGraph graphData={session.analysis?.dependencyGraph} />
            ) : activeTab === 'contract' ? (
              <BehavioralContract contract={session.analysis?.behavioralContract} />
            ) : activeTab === 'explanations' ? (
              <TransformationExplanations explanations={session.explanations} />
            ) : activeTab === 'verify' ? (
              <VerifyViewer
                verification={session.verification}
                hasMigrated={!!session.migratedCode}
              />
            ) : activeTab === 'history' ? (
              <MigrationHistory history={history} />
            ) : (
              <MigrationReport
                sourceFile={session.filename}
                componentName={componentName}
                verificationMetrics={session.verification?.metrics}
                repairAttempts={session.repairAttempts}
                beforeScore={beforeScore}
                afterScore={afterScore}
                transformationsCount={session.explanations?.length || 5}
                pullRequest={session.shipResult?.pullRequest}
                status="Shipped"
              />
            )}
          </div>
        )}
      </main>
    </>
  );
}
