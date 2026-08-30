import { activeStore } from '../pipeline/store.js';
import { buildLegacyArchitecture, buildModernArchitecture, buildArchitectureComparison } from './architectureBuilder.js';
import { ensureWorkspaceForSession } from '../workspace/workspaceService.js';

export function getLegacyArchitecture(sessionIdReq) {
  const session = activeStore.getSession();

  if (!session || (!session.rawCode && !session.workspaceDir)) {
    return {
      success: false,
      statusCode: 404,
      error: 'PROJECT_UNAVAILABLE',
      message: 'No active migration session or legacy project found. Upload a project first.'
    };
  }

  if (sessionIdReq && session.id && sessionIdReq !== session.id) {
    return {
      success: false,
      statusCode: 403,
      error: 'INVALID_SESSION_ID',
      message: 'Session ID mismatch.'
    };
  }

  try {
    const workspaceDir = session.legacyWorkspace || session.workspaceDir;
    const rawCode = session.rawCode;
    const filename = session.filename || 'legacy-project.js';

    const architecture = buildLegacyArchitecture(workspaceDir, rawCode, filename);

    return {
      success: true,
      statusCode: 200,
      architecture
    };
  } catch (err) {
    return {
      success: false,
      statusCode: 500,
      error: 'ANALYSIS_FAILURE',
      message: err.message || 'Failed to analyze legacy architecture'
    };
  }
}

export function getModernArchitecture(sessionIdReq) {
  const session = activeStore.getSession();

  if (!session || (!session.migratedCode && !session.workspaceDir)) {
    return {
      success: false,
      statusCode: 404,
      error: 'MODERN_WORKSPACE_UNAVAILABLE',
      message: 'Modernized project not available yet. Complete the migration step first.'
    };
  }

  if (sessionIdReq && session.id && sessionIdReq !== session.id) {
    return {
      success: false,
      statusCode: 403,
      error: 'INVALID_SESSION_ID',
      message: 'Session ID mismatch.'
    };
  }

  try {
    const workspaceDir = session.modernWorkspace || session.workspaceDir || ensureWorkspaceForSession();
    const migratedCode = session.migratedCode;
    const filename = session.filename ? session.filename.replace(/\.(js|php|html)$/, '.jsx') : 'MigratedComponent.jsx';

    const architecture = buildModernArchitecture(workspaceDir, migratedCode, filename);

    return {
      success: true,
      statusCode: 200,
      architecture
    };
  } catch (err) {
    return {
      success: false,
      statusCode: 500,
      error: 'ANALYSIS_FAILURE',
      message: err.message || 'Failed to analyze modern architecture'
    };
  }
}

export function getArchitectureComparison(sessionIdReq) {
  const legacyRes = getLegacyArchitecture(sessionIdReq);
  if (!legacyRes.success) return legacyRes;

  const modernRes = getModernArchitecture(sessionIdReq);
  if (!modernRes.success) return modernRes;

  try {
    const comparison = buildArchitectureComparison(legacyRes.architecture, modernRes.architecture);

    return {
      success: true,
      statusCode: 200,
      legacy: legacyRes.architecture,
      modern: modernRes.architecture,
      comparison
    };
  } catch (err) {
    return {
      success: false,
      statusCode: 500,
      error: 'COMPARISON_FAILURE',
      message: err.message || 'Failed to generate architecture comparison'
    };
  }
}
