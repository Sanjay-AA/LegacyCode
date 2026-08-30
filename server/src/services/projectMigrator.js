import { orchestrateProjectMigration } from '../modernization/projectOrchestrator.js';

/**
 * Project Migrator Wrapper
 * Delegates project-level migration to Autonomous Multi-Stack Orchestrator.
 */
export function migrateProject(sessionDir, projectAnalysis, adapterId = 'jquery-to-react', repairHint = null) {
  return orchestrateProjectMigration(sessionDir, projectAnalysis, adapterId, repairHint);
}
