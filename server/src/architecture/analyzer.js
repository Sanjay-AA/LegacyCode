import fs from 'fs';
import path from 'path';

const IGNORED_DIRS = new Set([
  'node_modules', '.git', 'build', 'dist', 'coverage', '.next', '.cache',
  'temp', 'tmp', '.vscode', '.idea', 'vendor', '__pycache__', '.pytest_cache'
]);

const SUPPORTED_EXTENSIONS = new Set([
  '.html', '.htm', '.js', '.jsx', '.ts', '.tsx', '.vue',
  '.rb', '.php', '.java', '.py', '.cs', '.go', '.rs',
  '.sql', '.wsdl', '.prisma', '.json', '.xml', '.yml', '.yaml',
  '.css', '.scss', '.less', '.sh', '.tf'
]);

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB limit per text file

/**
 * Step 1: Complete Safe Directory Discovery & File Indexing
 */
export function scanDirectory(dirPath, baseDir = dirPath) {
  const files = [];
  if (!dirPath || !fs.existsSync(dirPath)) return files;

  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      if (IGNORED_DIRS.has(entry.name)) continue;
      const fullPath = path.join(dirPath, entry.name);
      const relPath = path.relative(baseDir, fullPath).replace(/\\/g, '/');

      // Path traversal safety check
      if (relPath.startsWith('..')) continue;

      if (entry.isDirectory()) {
        files.push(...scanDirectory(fullPath, baseDir));
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (!SUPPORTED_EXTENSIONS.has(ext) && !['Gemfile', 'Dockerfile', 'Makefile', 'pom.xml', 'requirements.txt', 'composer.json'].includes(entry.name)) {
          continue; // Skip irrelevant binary or non-code files
        }

        try {
          const stats = fs.statSync(fullPath);
          if (stats.size <= MAX_FILE_SIZE) {
            files.push({
              fullPath,
              relativePath: relPath,
              fileName: entry.name,
              extension: ext,
              size: stats.size
            });
          }
        } catch (_) {}
      }
    }
  } catch (_) {}

  return files;
}

/**
 * Steps 2-11: Evidence-Driven Multi-Stage Pipeline Analysis of Legacy Workspace
 */
export function analyzeLegacyCodebase(fileListOrMap, rawSingleCode = null, singleFilename = null) {
  const modules = [];
  const scriptReferences = [];
  const htmlFiles = [];
  const jsFiles = [];
  const backendFiles = [];
  const dataFiles = [];
  const infraFiles = [];
  const cssFiles = [];
  const configFiles = [];
  const externalDeps = new Set();
  const apiEndpoints = new Set();
  const entryPoints = [];
  const databaseTables = new Set();
  const importsMap = new Map(); // File -> Array of imported modules

  let domMutationsCount = 0;
  let eventHandlersCount = 0;
  let globalVarsCount = 0;
  let apiCallsCount = 0;
  let jqueryUsageCount = 0;

  if (rawSingleCode && singleFilename) {
    const ext = path.extname(singleFilename).toLowerCase();
    const content = rawSingleCode;

    if (ext === '.html') {
      entryPoints.push(singleFilename);
      htmlFiles.push({ path: singleFilename, content });
    } else if (['.rb', '.php', '.java', '.py', '.cs', '.go'].includes(ext)) {
      backendFiles.push({ path: singleFilename, content });
      entryPoints.push(singleFilename);
    } else if (ext === '.sql' || ext === '.prisma') {
      dataFiles.push({ path: singleFilename, content });
    } else {
      jsFiles.push({ path: singleFilename, content });
      if (['app.js', 'main.js', 'index.js', 'script.js'].includes(singleFilename.toLowerCase())) {
        entryPoints.push(singleFilename);
      }
    }

    inspectJavaScriptFile(singleFilename, content, {
      externalDeps,
      apiEndpoints,
      counts: { domMutationsCount, eventHandlersCount, globalVarsCount, apiCallsCount, jqueryUsageCount },
      modules,
      importsMap
    });
  } else if (Array.isArray(fileListOrMap)) {
    for (const file of fileListOrMap) {
      let content = '';
      try {
        content = fs.readFileSync(file.fullPath, 'utf-8');
      } catch (_) {
        continue;
      }

      const relPath = file.relativePath;
      const ext = file.extension;

      if (ext === '.html' || ext === '.htm') {
        htmlFiles.push({ path: relPath, content });
        if (relPath.toLowerCase().includes('index.html') || relPath.toLowerCase().includes('app.html')) {
          entryPoints.push(relPath);
        }
        inspectHtmlFile(relPath, content, scriptReferences, externalDeps);
      } else if (['.js', '.jsx', '.ts', '.tsx', '.vue'].includes(ext)) {
        jsFiles.push({ path: relPath, content });
        if (
          relPath.toLowerCase().includes('index.js') ||
          relPath.toLowerCase().includes('app.js') ||
          relPath.toLowerCase().includes('main.js')
        ) {
          entryPoints.push(relPath);
        }
        const resCounts = inspectJavaScriptFile(relPath, content, {
          externalDeps,
          apiEndpoints,
          counts: { domMutationsCount, eventHandlersCount, globalVarsCount, apiCallsCount, jqueryUsageCount },
          modules,
          importsMap
        });
        domMutationsCount += resCounts.domMutations;
        eventHandlersCount += resCounts.eventHandlers;
        globalVarsCount += resCounts.globalVars;
        apiCallsCount += resCounts.apiCalls;
        jqueryUsageCount += resCounts.jqueryUsage;
      } else if (['.rb', '.php', '.java', '.py', '.cs', '.go'].includes(ext) || file.fileName === 'Gemfile') {
        backendFiles.push({ path: relPath, content });
        if (relPath.toLowerCase().includes('app') || relPath.toLowerCase().includes('main') || relPath.toLowerCase().includes('index') || relPath.toLowerCase().includes('server') || relPath.toLowerCase().includes('controller')) {
          entryPoints.push(relPath);
        }
        inspectBackendFile(relPath, content, externalDeps, apiEndpoints, importsMap);
      } else if (['.sql', '.wsdl', '.prisma'].includes(ext)) {
        dataFiles.push({ path: relPath, content });
        inspectDataFile(relPath, content, databaseTables, externalDeps);
      } else if (['.sh', '.tf', '.yaml', '.yml'].includes(ext) && (relPath.includes('k8s') || relPath.includes('deploy') || content.includes('AWSTemplate') || content.includes('resource'))) {
        infraFiles.push({ path: relPath, content });
        if (content.includes('AWSTemplate')) externalDeps.add('AWS CloudFormation');
        if (content.includes('resource "')) externalDeps.add('HashiCorp Terraform');
      } else if (['.css', '.scss', '.less'].includes(ext)) {
        cssFiles.push({ path: relPath, content });
      } else if (['.json', '.config.js'].includes(ext)) {
        configFiles.push({ path: relPath, content });
        if (file.fileName === 'package.json') {
          inspectPackageJson(content, externalDeps);
        }
      }
    }
  }

  if (entryPoints.length === 0) {
    if (htmlFiles.length > 0) entryPoints.push(htmlFiles[0].path);
    else if (jsFiles.length > 0) entryPoints.push(jsFiles[0].path);
    else if (backendFiles.length > 0) entryPoints.push(backendFiles[0].path);
  }

  const totalAnalyzedFiles = htmlFiles.length + jsFiles.length + backendFiles.length + dataFiles.length + infraFiles.length + cssFiles.length + configFiles.length;
  const penalty = Math.min(60, (domMutationsCount * 2 + globalVarsCount * 2 + jqueryUsageCount * 1.5 + apiCallsCount * 2));
  const healthScore = Math.max(15, Math.min(85, Math.round(90 - penalty)));

  return {
    isEvidenceSufficient: totalAnalyzedFiles > 0,
    entryPoints: Array.from(new Set(entryPoints)),
    htmlFiles: htmlFiles.map(f => f.path),
    jsFiles: jsFiles.map(f => f.path),
    backendFiles: backendFiles.map(f => f.path),
    dataFiles: dataFiles.map(f => f.path),
    infraFiles: infraFiles.map(f => f.path),
    cssFiles: cssFiles.map(f => f.path),
    configFiles: configFiles.map(f => f.path),
    scriptReferences,
    externalDependencies: Array.from(externalDeps),
    apiEndpoints: Array.from(apiEndpoints),
    databaseTables: Array.from(databaseTables),
    importsMap: Object.fromEntries(importsMap),
    modules,
    metrics: {
      totalFiles: totalAnalyzedFiles,
      modulesCount: modules.length || jsFiles.length + backendFiles.length,
      dependenciesCount: externalDeps.size,
      entryPointsCount: entryPoints.length,
      domMutationsCount,
      eventHandlersCount,
      globalVarsCount,
      apiCallsCount,
      jqueryUsageCount
    },
    healthScore
  };
}

/**
 * Evidence-Driven Static Analysis of Modernized Workspace
 */
export function analyzeModernCodebase(fileListOrMap, rawSingleCode = null, singleFilename = null) {
  const components = [];
  const services = [];
  const backendControllers = [];
  const dataSchemas = [];
  const infraManifests = [];
  const externalDeps = new Set();
  const apiEndpoints = new Set();
  const entryPoints = [];
  const jsFiles = [];
  const cssFiles = [];
  const importsMap = new Map();

  if (rawSingleCode) {
    const name = singleFilename ? path.basename(singleFilename, path.extname(singleFilename)) : 'MigratedComponent';
    components.push({
      name,
      path: `src/components/${name}.jsx`,
      type: 'ReactComponent',
      hooks: extractReactHooks(rawSingleCode),
      evidence: [`Generated modern React component in "src/components/${name}.jsx"`]
    });
    externalDeps.add('react');
    entryPoints.push(`src/components/${name}.jsx`);
  } else if (Array.isArray(fileListOrMap)) {
    for (const file of fileListOrMap) {
      let content = '';
      try {
        content = fs.readFileSync(file.fullPath, 'utf-8');
      } catch (_) {
        continue;
      }

      const relPath = file.relativePath;
      const ext = file.extension;

      if (['.jsx', '.tsx', '.js', '.ts'].includes(ext)) {
        jsFiles.push(relPath);
        if (relPath.includes('index') || relPath.includes('main') || relPath.includes('App')) {
          entryPoints.push(relPath);
        }

        // Extract imports for dependency graph
        extractImportsAndCalls(relPath, content, importsMap, externalDeps, apiEndpoints);

        if (content.includes('import React') || content.includes('return (') || content.includes('return <') || relPath.includes('component')) {
          const compName = path.basename(relPath, ext);
          components.push({
            name: compName,
            path: relPath,
            type: 'ReactComponent',
            hooks: extractReactHooks(content),
            evidence: [`React component file "${relPath}"`]
          });
          externalDeps.add('react');
        } else if (relPath.includes('api') || relPath.includes('service') || relPath.includes('util')) {
          services.push({
            name: path.basename(relPath, ext),
            path: relPath,
            type: 'Service',
            evidence: [`Service module file "${relPath}"`]
          });
        }
      } else if (['.rb', '.php', '.java', '.py', '.cs', '.go'].includes(ext)) {
        const compName = path.basename(relPath, ext);
        const tech = ext === '.rb' ? 'Rails' : ext === '.php' ? 'Laravel' : ext === '.java' ? 'Spring Boot' : ext === '.py' ? 'FastAPI' : 'Modern Backend';
        backendControllers.push({
          name: compName,
          path: relPath,
          type: 'BackendController',
          technology: tech,
          evidence: [`Backend controller file "${relPath}"`]
        });
        externalDeps.add(tech);
      } else if (['.prisma', '.sql', '.json'].includes(ext) && (relPath.includes('database') || relPath.includes('prisma') || relPath.includes('schema') || relPath.includes('openapi'))) {
        dataSchemas.push({
          name: path.basename(relPath, ext),
          path: relPath,
          type: 'DataSchema',
          evidence: [`Data/API schema file "${relPath}"`]
        });
      } else if (['.tf', '.yaml'].includes(ext) && relPath.includes('infrastructure')) {
        infraManifests.push({
          name: path.basename(relPath, ext),
          path: relPath,
          type: 'InfraManifest',
          evidence: [`Infrastructure manifest file "${relPath}"`]
        });
      } else if (ext === '.json' && file.fileName === 'package.json') {
        inspectPackageJson(content, externalDeps);
      }
    }
  }

  if (entryPoints.length === 0 && components.length > 0) {
    entryPoints.push(components[0].path);
  }

  const totalFiles = components.length + services.length + backendControllers.length + dataSchemas.length + infraManifests.length;
  const healthScore = Math.min(98, 88 + totalFiles * 2);

  return {
    isEvidenceSufficient: totalFiles > 0,
    entryPoints: Array.from(new Set(entryPoints)),
    components,
    services,
    backendControllers,
    dataSchemas,
    infraManifests,
    jsFiles,
    cssFiles,
    externalDependencies: Array.from(externalDeps),
    apiEndpoints: Array.from(apiEndpoints),
    importsMap: Object.fromEntries(importsMap),
    metrics: {
      totalFiles: totalFiles || 1,
      componentsCount: components.length,
      servicesCount: services.length,
      controllersCount: backendControllers.length,
      schemasCount: dataSchemas.length,
      dependenciesCount: externalDeps.size,
      entryPointsCount: entryPoints.length || 1,
      domMutationsCount: 0,
      globalVarsCount: 0
    },
    healthScore
  };
}

// Helpers for Evidence Extraction & Imports Analysis
function extractImportsAndCalls(relPath, content, importsMap, externalDeps, apiEndpoints) {
  const imports = [];
  const importRegex = /(?:import\s+.*?\s+from\s+['"]([^'"]+)['"]|require\(['"]([^'"]+)['"]\))/g;
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    const impPath = match[1] || match[2];
    if (impPath) {
      if (impPath.startsWith('.')) {
        imports.push(impPath);
      } else {
        externalDeps.add(impPath);
      }
    }
  }
  importsMap.set(relPath, imports);

  const urlRegex = /['"](\/(api|v1|v2|users|cart|checkout|products|auth)[^'"]*)['"]/gi;
  let apiMatch;
  while ((apiMatch = urlRegex.exec(content)) !== null) {
    apiEndpoints.add(apiMatch[1]);
  }
}

function inspectHtmlFile(relPath, content, scriptReferences, externalDeps) {
  const scriptRegex = /<script\s+[^>]*src=["']([^"']+)["']/gi;
  let match;
  while ((match = scriptRegex.exec(content)) !== null) {
    const src = match[1];
    scriptReferences.push({ htmlPath: relPath, scriptSrc: src });
    if (src.includes('jquery')) externalDeps.add('jQuery');
    if (src.includes('bootstrap')) externalDeps.add('Bootstrap');
    if (src.includes('axios')) externalDeps.add('Axios');
    if (src.includes('vue')) externalDeps.add('Vue');
    if (src.includes('angular')) externalDeps.add('Angular');
  }
}

function inspectJavaScriptFile(relPath, content, ctx) {
  const domMutations = (content.match(/\.(html|append|prepend|after|before|text|addClass|removeClass|toggleClass|val|css)\s*\(/g) || []).length;
  const eventHandlers = (content.match(/\.(on|click|submit|change|bind|live|delegate)\s*\(/g) || []).length;
  const globalVars = (content.match(/\b(var|window\.[a-zA-Z0-9_$]+)\b/g) || []).length;
  const apiCalls = (content.match(/(\$\.(ajax|get|post|getJSON)|fetch\(|axios\.)/g) || []).length;
  const jqueryUsage = (content.match(/(\$\(|jQuery\()/g) || []).length;

  if (jqueryUsage > 0) ctx.externalDeps.add('jQuery');
  if (content.includes('fetch(') || content.includes('$.ajax') || content.includes('axios')) ctx.externalDeps.add('HTTP/REST API');

  extractImportsAndCalls(relPath, content, ctx.importsMap, ctx.externalDeps, ctx.apiEndpoints);

  ctx.modules.push({
    path: relPath,
    name: path.basename(relPath, path.extname(relPath)),
    domMutations,
    eventHandlers,
    globalVars,
    apiCalls,
    jqueryUsage
  });

  return { domMutations, eventHandlers, globalVars, apiCalls, jqueryUsage };
}

function inspectBackendFile(relPath, content, externalDeps, apiEndpoints, importsMap) {
  if (relPath.endsWith('.rb') || relPath === 'Gemfile') {
    externalDeps.add('Ruby / Rails');
  } else if (relPath.endsWith('.php') || relPath === 'composer.json') {
    externalDeps.add('PHP / Laravel');
  } else if (relPath.endsWith('.java') || relPath === 'pom.xml') {
    externalDeps.add('Java / Spring Boot');
  } else if (relPath.endsWith('.py') || relPath === 'requirements.txt') {
    externalDeps.add('Python / FastAPI');
  } else if (relPath.endsWith('.cs')) {
    externalDeps.add('C# / .NET');
  } else if (relPath.endsWith('.go')) {
    externalDeps.add('Go');
  }

  extractImportsAndCalls(relPath, content, importsMap, externalDeps, apiEndpoints);
}

function inspectDataFile(relPath, content, databaseTables, externalDeps) {
  if (relPath.endsWith('.sql')) {
    externalDeps.add('SQL Database');
    const tableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?`?([a-zA-Z0-9_]+)`?/gi;
    let match;
    while ((match = tableRegex.exec(content)) !== null) {
      databaseTables.add(match[1]);
    }
  } else if (relPath.endsWith('.prisma')) {
    externalDeps.add('Prisma ORM');
  } else if (relPath.endsWith('.wsdl')) {
    externalDeps.add('SOAP WSDL Service');
  }
}

function inspectPackageJson(content, externalDeps) {
  try {
    const pkg = JSON.parse(content);
    if (pkg.dependencies) {
      Object.keys(pkg.dependencies).forEach(d => externalDeps.add(d));
    }
  } catch (_) {}
}

function extractReactHooks(code) {
  const hooks = [];
  if (code.includes('useState')) hooks.push('useState');
  if (code.includes('useEffect')) hooks.push('useEffect');
  if (code.includes('useCallback')) hooks.push('useCallback');
  if (code.includes('useMemo')) hooks.push('useMemo');
  if (code.includes('useRef')) hooks.push('useRef');
  return hooks;
}
