import { Router } from 'express';
import { analyzeJQueryCode } from '../pipeline/analyzer.js';
import { generateMigrationPlan } from '../pipeline/planner.js';
import { performMigration } from '../pipeline/migrator.js';
import { runBehavioralVerification } from '../pipeline/verifier.js';
import { shipMigration } from '../pipeline/shipper.js';
import { activeStore } from '../pipeline/store.js';

const router = Router();

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * POST /api/pipeline/run
 * Streams pipeline events via Server-Sent Events (SSE) while executing stages:
 * Upload -> Analyze -> Plan -> Migrate -> Verify (with Self-Repair) -> Human Approval Gate
 */
router.post('/run', async (req, res) => {
  // Set headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  const emitEvent = (eventType, data) => {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    const payload = { ...data, timestamp: time };
    res.write(`event: ${eventType}\ndata: ${JSON.stringify(payload)}\n\n`);
    if (typeof res.flush === 'function') {
      res.flush();
    }
  };

  const { code, filename, retryStage, simulateFailure = false } = req.body || {};
  const safeFilename = filename || 'legacy-component.js';

  let currentStage = 'upload';

  try {
    let sessionCode = code;
    let sessionFilename = safeFilename;

    if (retryStage) {
      const session = activeStore.getSession();
      sessionCode = session.rawCode || code;
      sessionFilename = session.filename || safeFilename;
    } else {
      if (!code || typeof code !== 'string' || !code.trim()) {
        emitEvent('pipeline:error', {
          stage: 'upload',
          error: 'Invalid request: "code" string is required',
          message: 'Error: No code provided'
        });
        res.end();
        return;
      }
      activeStore.clear();
    }

    // 1. UPLOAD STAGE
    if (!retryStage || retryStage === 'analyze') {
      currentStage = 'upload';
      emitEvent('upload', {
        filename: sessionFilename,
        codeLength: sessionCode.length,
        message: `File uploaded: ${sessionFilename}`
      });
      await delay(300);
    }

    // 2. ANALYZE STAGE
    let analysis;
    if (!retryStage || retryStage === 'analyze') {
      currentStage = 'analyze';
      emitEvent('analyze:start', {
        message: 'Analyzing jQuery behavior...'
      });
      await delay(400);

      analysis = analyzeJQueryCode(sessionCode, sessionFilename);
      activeStore.setAnalysis(sessionFilename, sessionCode, analysis);

      emitEvent('analyze:complete', {
        analysis,
        message: 'Legacy Health Report & Behavioral Contract generated'
      });
      await delay(400);
    } else {
      analysis = activeStore.getSession().analysis;
    }

    // 3. PLAN STAGE
    let plan;
    if (!retryStage || ['analyze', 'plan'].includes(retryStage)) {
      currentStage = 'plan';
      emitEvent('plan:start', {
        message: 'Generating migration plan...'
      });
      await delay(400);

      plan = generateMigrationPlan(analysis);
      activeStore.setPlan(plan);

      emitEvent('plan:complete', {
        plan,
        message: 'Migration plan created'
      });
      await delay(400);
    } else {
      plan = activeStore.getSession().plan;
    }

    // 4. MIGRATE STAGE
    let migrationResult;
    if (!retryStage || ['analyze', 'plan', 'migrate'].includes(retryStage)) {
      currentStage = 'migrate';
      emitEvent('migrate:start', {
        message: 'Migrating jQuery → React...'
      });
      await delay(600);

      migrationResult = performMigration(sessionCode, analysis, plan);
      activeStore.setMigration(migrationResult.migratedCode, migrationResult.summary);

      emitEvent('migrate:complete', {
        migratedCode: migrationResult.migratedCode,
        summary: migrationResult.summary,
        explanations: migrationResult.explanations,
        message: 'React component generated'
      });
      await delay(400);
    } else {
      const session = activeStore.getSession();
      migrationResult = {
        migratedCode: session.migratedCode,
        summary: session.migrationSummary,
        explanations: session.explanations
      };
    }

    // 5. VERIFY STAGE & AUTONOMOUS SELF-REPAIR LOOP
    currentStage = 'verify';
    emitEvent('verify:start', {
      message: 'Running behavioral verification...'
    });
    await delay(600);

    let verification = runBehavioralVerification(
      sessionCode,
      analysis,
      plan,
      migrationResult.migratedCode,
      { simulateFailure }
    );

    let repairAttempts = 0;
    const MAX_REPAIR_ATTEMPTS = 2;

    while (
      (verification.overallStatus !== 'VERIFIED' || verification.metrics?.failedTests > 0) &&
      repairAttempts < MAX_REPAIR_ATTEMPTS
    ) {
      repairAttempts++;
      const passCount = verification.metrics?.passedTests || 0;
      const totalCount = verification.metrics?.totalTests || 0;
      const failedTest = verification.testCases?.find(t => t.status === 'FAILED');

      emitEvent('trace:log', {
        message: `${passCount}/${totalCount} tests passed`
      });

      emitEvent('repair:start', {
        repairAttempt: repairAttempts,
        maxAttempts: MAX_REPAIR_ATTEMPTS,
        failedTestName: failedTest ? failedTest.name : 'Behavioral Assertion',
        message: 'Migration correction required'
      });

      await delay(800);

      const repairHint = `Enforce boundary check for ${failedTest?.name || 'state handler'} to ensure values satisfy behavioral invariants.`;
      migrationResult = performMigration(sessionCode, analysis, plan, repairHint);
      activeStore.setMigration(migrationResult.migratedCode, migrationResult.summary);

      emitEvent('repair:complete', {
        repairAttempt: repairAttempts,
        migratedCode: migrationResult.migratedCode,
        message: 'Corrected React implementation generated'
      });

      await delay(600);

      emitEvent('verify:start', {
        message: 'Running verification again...'
      });
      await delay(600);

      // Re-run verification with self-repaired code
      verification = runBehavioralVerification(
        sessionCode,
        analysis,
        plan,
        migrationResult.migratedCode,
        { simulateFailure: false }
      );
    }

    activeStore.setVerification(verification);

    if (verification.overallStatus !== 'VERIFIED' || (verification.metrics && verification.metrics.failedTests > 0)) {
      const passCount = verification.metrics?.passedTests || 0;
      const totalCount = verification.metrics?.totalTests || 0;

      emitEvent('verify:complete', {
        verification,
        repairAttempts,
        message: `${passCount}/${totalCount} tests passed (FAILED)`
      });

      emitEvent('pipeline:error', {
        stage: 'verify',
        error: `Behavioral verification failed after ${repairAttempts} self-repair attempt(s). Shipping BLOCKED. Human review required.`,
        verification,
        repairAttempts,
        message: 'Verification failed - shipping blocked'
      });

      res.end();
      return;
    }

    // Verification Succeeded!
    const passCount = verification.metrics?.passedTests || 0;
    const totalCount = verification.metrics?.totalTests || 0;

    emitEvent('verify:complete', {
      verification,
      repairAttempts,
      readyForReview: true,
      message: `${passCount}/${totalCount} tests passed`
    });

    emitEvent('trace:log', {
      message: 'Awaiting human approval...'
    });

    // Stream ends at Human Approval Gate!
    res.end();
  } catch (error) {
    console.error(`[Pipeline Error at stage ${currentStage}]:`, error);
    emitEvent('pipeline:error', {
      stage: currentStage,
      error: error.message || 'Pipeline execution failed',
      message: `Error during ${currentStage}: ${error.message || 'Pipeline failed'}`
    });
    res.end();
  }
});

export default router;
