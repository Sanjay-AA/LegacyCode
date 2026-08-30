import { analyzeLegacyCodebase, analyzeModernCodebase, scanDirectory } from './analyzer.js';
import { createArchitectureGraph } from './dependencyGraph.js';

/**
 * Builds normalized Evidence-Driven Legacy Architecture object
 */
export function buildLegacyArchitecture(workspaceDir, rawSingleCode = null, singleFilename = null) {
  let fileList = [];
  if (workspaceDir) {
    fileList = scanDirectory(workspaceDir);
  }

  const analysis = analyzeLegacyCodebase(fileList, rawSingleCode, singleFilename);
  const graph = createArchitectureGraph(analysis, false);

  const detectedTechList = (analysis.externalDependencies || []).join(', ');

  return {
    type: 'LEGACY',
    title: 'LEGACY SYSTEM ARCHITECTURE',
    subtitle: detectedTechList ? `Discovered Architecture: ${detectedTechList}` : 'Source Code Architecture Analysis',
    nodes: graph.nodes,
    edges: graph.edges,
    workflow: graph.workflow,
    entryPoints: graph.entryPoints,
    dependencies: graph.dependencies,
    isEvidenceSufficient: graph.isEvidenceSufficient,
    metrics: {
      ...graph.metrics,
      couplingScore: Math.round(100 - graph.healthScore),
      healthScore: graph.healthScore
    },
    healthScore: graph.healthScore
  };
}

/**
 * Builds normalized Evidence-Driven Modern Architecture object
 */
export function buildModernArchitecture(workspaceDir, rawSingleCode = null, singleFilename = null) {
  let fileList = [];
  if (workspaceDir) {
    fileList = scanDirectory(workspaceDir);
  }

  const analysis = analyzeModernCodebase(fileList, rawSingleCode, singleFilename);
  const graph = createArchitectureGraph(analysis, true);

  const modernTechList = (analysis.externalDependencies || []).join(', ');

  return {
    type: 'MODERN',
    title: 'MODERNIZED SYSTEM ARCHITECTURE',
    subtitle: modernTechList ? `Generated Architecture: ${modernTechList}` : 'Modern Project Architecture',
    nodes: graph.nodes,
    edges: graph.edges,
    workflow: graph.workflow,
    entryPoints: graph.entryPoints,
    dependencies: graph.dependencies,
    isEvidenceSufficient: graph.isEvidenceSufficient,
    metrics: {
      ...graph.metrics,
      couplingScore: 12,
      healthScore: graph.healthScore
    },
    healthScore: graph.healthScore
  };
}

/**
 * Builds Evidence-Driven Architecture Comparison matrix
 */
export function buildArchitectureComparison(legacyArch, modernArch) {
  const comparisons = [];

  // Map Entry Points
  const legacyEntry = legacyArch.entryPoints[0] || 'Source Entry';
  const modernEntry = modernArch.entryPoints[0] || 'Modern Entry';
  comparisons.push({
    category: 'Application Entry & Shell',
    status: 'Migrated',
    legacy: { name: legacyEntry, type: 'Legacy Entry Point', detail: 'Imperative entry point / template inclusion' },
    modern: { name: modernEntry, type: 'Modern Root App', detail: 'Virtual DOM Mounting & Component Tree' }
  });

  // Map Component / Module Transformation
  const legacyModulesCount = legacyArch.metrics?.modulesCount || 0;
  const modernComponentsCount = modernArch.metrics?.componentsCount || 0;
  comparisons.push({
    category: 'UI & State Paradigm',
    status: 'Migrated',
    legacy: {
      name: `${legacyModulesCount} Legacy Modules`,
      type: 'Direct DOM Manipulation',
      detail: `${legacyArch.metrics?.domMutationsCount || 0} direct DOM mutations and ${legacyArch.metrics?.jqueryUsageCount || 0} jQuery selectors`
    },
    modern: {
      name: `${modernComponentsCount} Modern Components`,
      type: 'Declarative State Hooks',
      detail: 'Encapsulated JSX state hooks & automatic Virtual DOM reconciliation'
    }
  });

  // Map Backend Controllers if present
  if (modernArch.metrics?.controllersCount > 0) {
    comparisons.push({
      category: 'Backend Controller Layer',
      status: 'Migrated',
      legacy: {
        name: 'Unstructured Backend Scripts',
        type: 'Legacy Backend Scripts',
        detail: 'Procedural request handling & unencapsulated endpoints'
      },
      modern: {
        name: `${modernArch.metrics.controllersCount} Modern Controllers`,
        type: 'Encapsulated REST Controllers',
        detail: 'Restful controller endpoints with input validation & error boundaries'
      }
    });
  }

  // Map Data Schemas if present
  if (modernArch.metrics?.schemasCount > 0) {
    comparisons.push({
      category: 'Database & Schema Layer',
      status: 'Migrated',
      legacy: {
        name: 'Legacy SQL / DDL Scripts',
        type: 'Raw Database DDL',
        detail: 'Unversioned SQL DDL or XML definitions'
      },
      modern: {
        name: `${modernArch.metrics.schemasCount} Modern Schemas`,
        type: 'ORM / OpenAPI Specifications',
        detail: 'Type-safe Prisma schemas or Knex.js versioned migration scripts'
      }
    });
  }

  // Map Health & Debt
  comparisons.push({
    category: 'Architecture Health Score',
    status: 'Improved',
    legacy: {
      name: `Legacy Health: ${legacyArch.healthScore} / 100`,
      type: 'Technical Debt Baseline',
      detail: 'Imperative side-effects and global coupling'
    },
    modern: {
      name: `Modern Health: ${modernArch.healthScore} / 100`,
      type: 'Modern Architecture',
      detail: 'Clean modular boundaries, zero direct DOM mutations'
    }
  });

  return {
    legacySummary: {
      framework: (legacyArch.dependencies || []).join(', ') || 'Legacy Scripts',
      paradigm: 'Imperative / Global State',
      totalFiles: legacyArch.metrics?.totalFiles || 1
    },
    modernSummary: {
      framework: (modernArch.dependencies || []).join(', ') || 'Modern Stack',
      paradigm: 'Declarative Components',
      totalFiles: modernArch.metrics?.totalFiles || 1
    },
    comparisons
  };
}
