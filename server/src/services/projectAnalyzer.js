import fs from 'fs';
import path from 'path';
import { detectProjectStack } from '../modernization/projectDetector.js';

export function analyzeProject(sessionDir, extractedFiles) {
  const inventory = {
    totalFiles: extractedFiles.length,
    javaScriptFiles: [],
    htmlFiles: [],
    cssFiles: [],
    backendFiles: [],
    dataFiles: [],
    configFiles: [],
    sensitiveFiles: [],
    assetFiles: []
  };

  const fileContentsMap = new Map();
  const projectManifest = [];

  for (const file of extractedFiles) {
    const fullPath = path.join(sessionDir, file.relativePath);
    const ext = file.extension;
    const relPath = file.relativePath;

    // Detect sensitive files
    if (relPath.includes('.env') || relPath.includes('credentials') || relPath.includes('id_rsa')) {
      inventory.sensitiveFiles.push(relPath);
      continue;
    }

    if (['.js', '.jsx', '.ts', '.tsx', '.vue'].includes(ext)) {
      inventory.javaScriptFiles.push(relPath);
    } else if (['.html', '.htm'].includes(ext)) {
      inventory.htmlFiles.push(relPath);
    } else if (['.css', '.scss', '.less'].includes(ext)) {
      inventory.cssFiles.push(relPath);
    } else if (['.rb', '.php', '.java', '.py', '.cs', '.go'].includes(ext) || relPath === 'Gemfile') {
      inventory.backendFiles.push(relPath);
    } else if (['.sql', '.wsdl', '.json', '.prisma'].includes(ext)) {
      inventory.dataFiles.push(relPath);
    } else if (['.png', '.jpg', '.jpeg', '.svg', '.ico', '.zip', '.tar', '.gz'].includes(ext)) {
      inventory.assetFiles.push(relPath);
      continue; // Skip reading binary assets into text map
    } else {
      inventory.configFiles.push(relPath);
    }

    try {
      if (file.sizeBytes < 5 * 1024 * 1024) { // Read text files < 5MB
        const content = fs.readFileSync(fullPath, 'utf-8');
        fileContentsMap.set(relPath, content);
      }
    } catch (_) {}
  }

  // Detect multi-stack technologies across all project files
  const stackDetection = detectProjectStack(fileContentsMap);

  // Build Project Manifest for every file in the workspace
  for (const [relPath, content] of fileContentsMap.entries()) {
    const fileMeta = stackDetection.fileOwnership[relPath];
    const ext = path.extname(relPath).toLowerCase();

    let category = 'config';
    if (inventory.javaScriptFiles.includes(relPath) || inventory.htmlFiles.includes(relPath)) category = 'frontend';
    else if (inventory.backendFiles.includes(relPath)) category = 'backend';
    else if (inventory.dataFiles.includes(relPath)) category = 'database';

    projectManifest.push({
      relativePath: relPath,
      filename: path.basename(relPath),
      extension: ext,
      detectedTechnology: fileMeta ? fileMeta.technology : 'Configuration/Asset',
      category: fileMeta ? fileMeta.layer : category,
      isSupported: Boolean(fileMeta && fileMeta.adapterId),
      adapterId: fileMeta ? fileMeta.adapterId : null,
      targetTechnology: fileMeta ? fileMeta.target : null
    });
  }

  // Build Dynamic Architecture Nodes & Edges from Actual Project Manifest
  const nodes = [
    { id: 'user-client', label: 'User / Browser Client', type: 'client' }
  ];
  const edges = [];

  const frontendFiles = projectManifest.filter(m => m.category === 'frontend' || m.category === 'web');
  const backendFiles = projectManifest.filter(m => m.category === 'backend');
  const dbFiles = projectManifest.filter(m => m.category === 'database' || m.category === 'data');
  const infraFiles = projectManifest.filter(m => m.category === 'infrastructure');

  if (frontendFiles.length > 0) {
    const frontendTech = stackDetection.migrations.find(m => m.layer === 'frontend' || m.layer === 'web')?.source || 'Frontend';
    const frontendLabel = `${frontendTech} (${frontendFiles.length} file(s))`;
    nodes.push({ id: 'frontend-layer', label: frontendLabel, type: 'frontend' });
    edges.push({ from: 'user-client', to: 'frontend-layer' });
  }

  if (backendFiles.length > 0) {
    const backendTech = stackDetection.migrations.find(m => m.layer === 'backend')?.source || 'Backend';
    const backendLabel = `${backendTech} Services (${backendFiles.length} file(s))`;
    nodes.push({ id: 'backend-layer', label: backendLabel, type: 'backend' });
    if (frontendFiles.length > 0) {
      edges.push({ from: 'frontend-layer', to: 'backend-layer' });
    } else {
      edges.push({ from: 'user-client', to: 'backend-layer' });
    }
  }

  if (dbFiles.length > 0) {
    const dbTech = stackDetection.migrations.find(m => m.layer === 'database' || m.layer === 'data')?.source || 'Database';
    const dbLabel = `${dbTech} Persistence Layer (${dbFiles.length} file(s))`;
    nodes.push({ id: 'db-layer', label: dbLabel, type: 'database' });
    if (backendFiles.length > 0) {
      edges.push({ from: 'backend-layer', to: 'db-layer' });
    } else if (frontendFiles.length > 0) {
      edges.push({ from: 'frontend-layer', to: 'db-layer' });
    }
  }

  if (infraFiles.length > 0) {
    nodes.push({ id: 'infra-layer', label: 'Infrastructure & IaC', type: 'infrastructure' });
  }

  const technologies = stackDetection.technologies.map(t => ({
    name: `${t.technology} (${t.layer})`,
    confidence: t.confidence,
    layer: t.layer,
    source: t.technology
  }));

  // Calculate Project Health & Risk
  let domMutationsCount = 0;
  let eventHandlersCount = 0;
  let globalVarsCount = 0;
  let ajaxCallsCount = 0;

  for (const content of fileContentsMap.values()) {
    if (content.includes('.click(') || content.includes('.on(')) eventHandlersCount += 2;
    if (content.includes('.html(') || content.includes('.addClass(') || content.includes('.append(')) domMutationsCount += 3;
    if (content.includes('var ') || content.includes('let ')) globalVarsCount += 1;
    if (content.includes('$.ajax') || content.includes('fetch(') || content.includes('http')) ajaxCallsCount += 2;
  }

  const rawRiskScore = 100 - Math.min(80, (domMutationsCount * 2 + globalVarsCount + eventHandlersCount + ajaxCallsCount * 3));
  const projectRiskScore = Math.max(20, Math.min(95, rawRiskScore));
  const riskLevel = projectRiskScore < 50 ? 'HIGH' : projectRiskScore < 80 ? 'MEDIUM' : 'LOW';

  const riskFactors = [
    `Project contains ${inventory.totalFiles} file(s) across ${technologies.length || 1} detected layer(s)`,
    `Imperative coupling and unencapsulated side effects in legacy modules`,
    `Asynchronous cross-layer API & service interactions`
  ];

  // Impact Analysis
  const affectedFiles = [...inventory.javaScriptFiles, ...inventory.backendFiles, ...inventory.htmlFiles];
  const highRiskFiles = [...inventory.javaScriptFiles, ...inventory.backendFiles].filter(f => {
    const c = fileContentsMap.get(f) || '';
    return c.includes('$.ajax') || c.includes('.click(') || c.includes('localStorage') || c.includes('require');
  });

  // Project Behavioral Contracts
  const behavioralContracts = [
    {
      module: 'Multi-Stack Integration Contracts',
      behaviors: [
        { action: 'Frontend & API Interaction', expected: 'Triggers state update and dispatches REST requests' },
        { action: 'Backend & Service Logic', expected: 'Processes payload, validates params, and returns JSON' },
        { action: 'Database & Schema Persistence', expected: 'Ensures relational data model integrity' }
      ]
    }
  ];

  // Project Migration Plan & Topological Order across detected layers
  const migrationPlan = {
    phases: stackDetection.migrations.map((m, idx) => ({
      phase: idx + 1,
      title: `Migrate ${m.layer.toUpperCase()} Layer: ${m.source} → ${m.target}`,
      description: `Transform ${m.layer} legacy modules to modern ${m.target} structure`,
      files: projectManifest.filter(p => p.adapterId === m.adapterId).map(p => p.relativePath)
    }))
  };

  return {
    inventory,
    projectManifest,
    technologies,
    stackDetection,
    primaryMigration: stackDetection.migrations.map(m => `${m.source} → ${m.target}`).join(' | ') || 'Source → Target Modernization',
    architecture: { nodes, edges },
    dependencyGraph: { nodes, edges },
    health: {
      score: projectRiskScore,
      overall: riskLevel === 'HIGH' ? 'High Technical Debt' : 'Moderate Technical Debt',
      riskLevel
    },
    riskAssessment: {
      score: projectRiskScore,
      level: riskLevel,
      factors: riskFactors
    },
    impactAnalysis: {
      totalFilesCount: inventory.totalFiles,
      affectedFilesCount: affectedFiles.length,
      affectedFiles,
      highRiskFiles,
      potentialBreakingAreas: ['Cross-layer API contracts', 'Global mutable state sync', 'Database schema mapping']
    },
    behavioralContracts,
    migrationPlan,
    fileContentsMap
  };
}
