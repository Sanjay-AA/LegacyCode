import fs from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import { activeStore } from '../pipeline/store.js';
import { isSafeWorkspacePath } from './workspaceSecurity.js';
import { openInVSCode } from './vscodeService.js';
import { createWorkspaceBaseline, checkWorkspaceChanges } from './workspaceStatus.js';

/**
 * Creates or ensures single-file migration workspace on disk if needed.
 */
export function ensureWorkspaceForSession() {
  const session = activeStore.getSession();
  if (!session) return null;

  if (session.workspaceDir && fs.existsSync(session.workspaceDir)) {
    return session.workspaceDir;
  }

  const sessionId = session.id || crypto.randomBytes(8).toString('hex');
  const sessionDir = path.join(os.tmpdir(), 'latentcode', 'sessions', sessionId);

  if (!fs.existsSync(sessionDir)) {
    fs.mkdirSync(sessionDir, { recursive: true });
  }

  // Write migrated component files to disk
  if (session.migratedCode) {
    const filename = session.filename || 'MigratedComponent.jsx';
    const compName = path.basename(filename, path.extname(filename));
    const srcDir = path.join(sessionDir, 'src', 'components');
    fs.mkdirSync(srcDir, { recursive: true });
    fs.writeFileSync(path.join(srcDir, `${compName}.jsx`), session.migratedCode);

    // Write package.json
    fs.writeFileSync(
      path.join(sessionDir, 'package.json'),
      JSON.stringify({
        name: 'migrated-project',
        version: '1.0.0',
        dependencies: { react: '^18.2.0', 'react-dom': '^18.2.0' }
      }, null, 2)
    );
  }

  const baseline = createWorkspaceBaseline(sessionDir);
  activeStore.setWorkspace(sessionId, sessionDir, baseline);

  return sessionDir;
}

export async function openWorkspaceInVSCode(sessionIdReq) {
  const session = activeStore.getSession();

  if (!session) {
    return {
      success: false,
      statusCode: 404,
      error: 'SESSION_NOT_FOUND',
      message: 'Active migration session not found.'
    };
  }

  // Verify migration status
  if (!session.migratedCode && !session.verificationResult) {
    return {
      success: false,
      statusCode: 400,
      error: 'MIGRATION_NOT_COMPLETE',
      message: 'Migration has not completed successfully yet.'
    };
  }

  // Validate session ID match if passed
  if (sessionIdReq && session.id && sessionIdReq !== session.id) {
    return {
      success: false,
      statusCode: 403,
      error: 'INVALID_SESSION_ID',
      message: 'Session ID mismatch.'
    };
  }

  const workspaceDir = session.workspaceDir || ensureWorkspaceForSession();

  if (!workspaceDir || !fs.existsSync(workspaceDir)) {
    return {
      success: false,
      statusCode: 404,
      error: 'MIGRATION_WORKSPACE_NOT_FOUND',
      message: 'The migrated workspace could not be found.'
    };
  }

  if (!isSafeWorkspacePath(workspaceDir)) {
    return {
      success: false,
      statusCode: 400,
      error: 'WORKSPACE_INVALID',
      message: 'Migration workspace path validation failed.'
    };
  }

  try {
    const result = await openInVSCode(workspaceDir);
    return {
      success: true,
      statusCode: 200,
      message: result.message
    };
  } catch (err) {
    return {
      success: false,
      statusCode: 500,
      error: err.error || 'VSCODE_LAUNCH_FAILED',
      message: err.message || 'Failed to launch VS Code'
    };
  }
}

export function getWorkspaceStatus(sessionIdReq) {
  const session = activeStore.getSession();

  if (!session || (!session.workspaceDir && !session.migratedCode)) {
    return {
      success: false,
      statusCode: 404,
      error: 'SESSION_NOT_FOUND',
      message: 'Active migration session or workspace not found.'
    };
  }

  const workspaceDir = session.workspaceDir || ensureWorkspaceForSession();

  if (!workspaceDir || !fs.existsSync(workspaceDir)) {
    return {
      success: false,
      statusCode: 404,
      error: 'MIGRATION_WORKSPACE_NOT_FOUND',
      message: 'The migrated workspace could not be found.'
    };
  }

  const result = checkWorkspaceChanges(workspaceDir, session.workspaceBaseline);
  return {
    success: true,
    statusCode: 200,
    changed: result.changed,
    filesChanged: result.filesChanged
  };
}
