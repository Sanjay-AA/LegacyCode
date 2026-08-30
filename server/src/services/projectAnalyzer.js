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

  for (const file of extractedFiles) {
    const fullPath = path.join(sessionDir, file.relativePath);
    const ext = file.extension;

    // Detect sensitive files
    if (file.relativePath.includes('.env') || file.relativePath.includes('credentials') || file.relativePath.includes('id_rsa')) {
      inventory.sensitiveFiles.push(file.relativePath);
      continue;
    }

    if (['.js', '.jsx', '.ts', '.tsx', '.vue'].includes(ext)) {
      inventory.javaScriptFiles.push(file.relativePath);
    } else if (['.html', '.htm'].includes(ext)) {
      inventory.htmlFiles.push(file.relativePath);
    } else if (['.css', '.scss', '.less'].includes(ext)) {
      inventory.cssFiles.push(file.relativePath);
    } else if (['.rb', '.php', '.java', '.py', '.cs', '.go'].includes(ext) || file.relativePath === 'Gemfile') {
      inventory.backendFiles.push(file.relativePath);
    } else if (['.sql', '.wsdl', '.json', '.prisma'].includes(ext)) {
      inventory.dataFiles.push(file.relativePath);
    } else if (['.png', '.jpg', '.jpeg', '.svg', '.ico', '.zip', '.tar', '.gz'].includes(ext)) {
      inventory.assetFiles.push(file.relativePath);
      continue; // Skip reading binary assets
    } else {
      inventory.configFiles.push(file.relativePath);
    }

    try {
      if (file.sizeBytes < 2 * 1024 * 1024) { // Read text files < 2MB
        const content = fs.readFileSync(fullPath, 'utf-8');
        fileContentsMap.set(file.relativePath, content);
      }
    } catch (_) {}
  }

  // Detect multi-stack technologies across all project files
  const stackDetection = detectProjectStack(fileContentsMap);
  const technologies = stackDetection.technologies.map(t => ({
    name: `${t.technology} (${t.layer})`,
    confidence: t.confidence,
    layer: t.layer,
    source: t.technology
  }));

  // Build Project Dependency Graph
  const nodes = [
    { id: 'app-root', label: 'Legacy Project Root', type: 'source' }
  ];
  const edges = [];

  inventory.htmlFiles.forEach(f => {
    nodes.push({ id: f, label: f, type: 'target' });
    edges.push({ from: 'app-root', to: f });
  });

  inventory.javaScriptFiles.forEach(f => {
    nodes.push({ id: f, label: f, type: 'source' });
    edges.push({ from: 'app-root', to: f });
  });

  inventory.backendFiles.forEach(f => {
    nodes.push({ id: f, label: f, type: 'source' });
    edges.push({ from: 'app-root', to: f });
  });

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
      files: Object.entries(stackDetection.fileOwnership).filter(([_, info]) => info.adapterId === m.adapterId).map(([p]) => p)
    }))
  };

  return {
    inventory,
    technologies,
    stackDetection,
    primaryMigration: stackDetection.migrations.map(m => `${m.source} → ${m.target}`).join(' | ') || 'Source → Target Modernization',
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
    dependencyGraph: { nodes, edges },
    behavioralContracts,
    migrationPlan,
    fileContentsMap
  };
}
