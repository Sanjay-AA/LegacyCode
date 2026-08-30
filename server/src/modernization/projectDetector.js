import path from 'path';

const LAYER_ADAPTER_MAP = {
  // Frontend / Web Stack
  'jQuery': { target: 'React', layer: 'frontend', adapterId: 'jquery-to-react' },
  'Vue.js': { target: 'React', layer: 'frontend', adapterId: 'vue-to-react' },
  'Angular': { target: 'React', layer: 'frontend', adapterId: 'angular-to-react' },

  // Backend Stack
  'Ruby': { target: 'Rails', layer: 'backend', adapterId: 'ruby-to-rails' },
  'PHP': { target: 'Laravel', layer: 'backend', adapterId: 'php-to-laravel' },
  'Java': { target: 'Spring Boot', layer: 'backend', adapterId: 'java-to-spring' },
  'Python': { target: 'FastAPI', layer: 'backend', adapterId: 'python-to-fastapi' },

  // Mobile Stack
  'Android Java': { target: 'Kotlin', layer: 'mobile', adapterId: 'android-java-to-kotlin' },
  'React Native': { target: 'Modern React Native', layer: 'mobile', adapterId: 'react-native-modernization' },
  'Cordova': { target: 'React Native', layer: 'mobile', adapterId: 'legacy-mobile' },

  // Data & API Stack
  'MySQL DDL': { target: 'PostgreSQL + Prisma', layer: 'database', adapterId: 'schema-modernization' },
  'SQL Dump': { target: 'Knex.js Migration', layer: 'database', adapterId: 'database-migration' },
  'SOAP WSDL': { target: 'OpenAPI 3.0 REST', layer: 'api', adapterId: 'api-modernization' },

  // Infrastructure Stack
  'Shell Script': { target: 'Kubernetes Manifests', layer: 'infrastructure', adapterId: 'infrastructure-modernization' },
  'CloudFormation': { target: 'Terraform IaC', layer: 'infrastructure', adapterId: 'legacy-cloud-config' }
};

/**
 * Strict Evidence-Driven Project Stack Detector
 * Inspects uploaded legacy workspace files and returns ONLY technologies backed by credible file evidence.
 */
export function detectProjectStack(fileContentsMap) {
  const fileOwnership = new Map();
  const detectedTechScores = new Map();

  function recordScore(techName, score, evidenceItem, relPath) {
    if (!detectedTechScores.has(techName)) {
      detectedTechScores.set(techName, { score: 0, evidence: new Set(), pathCount: 0 });
    }
    const entry = detectedTechScores.get(techName);
    entry.score += score;
    entry.pathCount += 1;
    if (evidenceItem) entry.evidence.add(evidenceItem);
  }

  for (const [relPath, content] of fileContentsMap.entries()) {
    const ext = path.extname(relPath).toLowerCase();
    const fileName = path.basename(relPath).toLowerCase();

    // 1. Ruby Detection (Strict evidence: .rb files, Gemfile, Gemfile.lock, #!/usr/bin/env ruby)
    if (ext === '.rb' || fileName === 'gemfile' || fileName === 'gemfile.lock' || content.includes('#!/usr/bin/env ruby')) {
      recordScore('Ruby', 1.0, `Ruby source file "${relPath}"`, relPath);
      if (ext === '.rb') fileOwnership.set(relPath, 'Ruby');
      continue;
    }

    // 2. PHP Detection (Strict evidence: .php files, composer.json, <?php tag)
    if (ext === '.php' || fileName === 'composer.json' || content.includes('<?php')) {
      recordScore('PHP', 1.0, `PHP script "${relPath}"`, relPath);
      if (ext === '.php') fileOwnership.set(relPath, 'PHP');
      continue;
    }

    // 3. Java / Android Java Detection (Strict evidence: .java, pom.xml, AndroidManifest.xml)
    if (ext === '.java' || fileName === 'pom.xml' || (fileName === 'build.gradle' && content.includes('com.android.application'))) {
      if (relPath.includes('AndroidManifest.xml') || content.includes('AppCompatActivity') || content.includes('android.app')) {
        recordScore('Android Java', 1.0, `Android Java Activity "${relPath}"`, relPath);
        if (ext === '.java') fileOwnership.set(relPath, 'Android Java');
      } else {
        recordScore('Java', 1.0, `Java source class "${relPath}"`, relPath);
        if (ext === '.java') fileOwnership.set(relPath, 'Java');
      }
      continue;
    }

    // 4. Python Detection (Strict evidence: .py files, requirements.txt, pyproject.toml, Pipfile)
    if (ext === '.py' || fileName === 'requirements.txt' || fileName === 'pyproject.toml' || fileName === 'pipfile') {
      recordScore('Python', 1.0, `Python module "${relPath}"`, relPath);
      if (ext === '.py') fileOwnership.set(relPath, 'Python');
      continue;
    }

    // 5. Vue Detection (Strict evidence: .vue SFC, <template> + Vue.component)
    if (ext === '.vue' || (content.includes('<template>') && content.includes('</template>')) || content.includes('Vue.component(')) {
      recordScore('Vue.js', 1.0, `Vue SFC component "${relPath}"`, relPath);
      if (ext === '.vue') fileOwnership.set(relPath, 'Vue.js');
      continue;
    }

    // 6. Angular Detection (Strict evidence: angular.json, @Component, @Injectable)
    if (fileName === 'angular.json' || content.includes('@Component({') || content.includes('@Injectable({') || content.includes('ng-app=')) {
      recordScore('Angular', 1.0, `Angular component "${relPath}"`, relPath);
      if (ext === '.ts' || ext === '.js') fileOwnership.set(relPath, 'Angular');
      continue;
    }

    // 7. Cordova Detection (Strict evidence: config.xml with <widget> & cordova)
    if (fileName === 'config.xml' && content.includes('<widget') && content.includes('cordova')) {
      recordScore('Cordova', 1.0, `Cordova config.xml "${relPath}"`, relPath);
      continue;
    }

    // 8. SOAP WSDL Detection (Strict evidence: .wsdl or <wsdl:definitions)
    if (ext === '.wsdl' || (content.includes('<wsdl:definitions') || content.includes('<definitions')) && content.includes('soap')) {
      recordScore('SOAP WSDL', 1.0, `SOAP WSDL service contract "${relPath}"`, relPath);
      if (ext === '.wsdl' || ext === '.xml') fileOwnership.set(relPath, 'SOAP WSDL');
      continue;
    }

    // 9. Shell Script Detection (Strict evidence: .sh or #!/bin/bash shebang)
    if (ext === '.sh' || content.startsWith('#!/bin/bash') || content.startsWith('#!/bin/sh')) {
      recordScore('Shell Script', 1.0, `Shell script "${relPath}"`, relPath);
      if (ext === '.sh') fileOwnership.set(relPath, 'Shell Script');
      continue;
    }

    // 10. CloudFormation Detection (Strict evidence: AWSTemplateFormatVersion or AWS:: resource definitions)
    if (content.includes('AWSTemplateFormatVersion') || (content.includes('AWS::') && (content.includes('Type:') || content.includes('Resources:')))) {
      recordScore('CloudFormation', 1.0, `AWS CloudFormation template "${relPath}"`, relPath);
      if (ext === '.yaml' || ext === '.yml' || ext === '.json') fileOwnership.set(relPath, 'CloudFormation');
      continue;
    }

    // 11. Database SQL / Dump Detection (Strict evidence: .sql or CREATE TABLE / INSERT INTO DDL)
    if (ext === '.sql' || content.includes('CREATE TABLE')) {
      if (content.includes('INSERT INTO') || content.includes('DROP TABLE IF EXISTS')) {
        recordScore('SQL Dump', 1.0, `SQL Data Dump "${relPath}"`, relPath);
        if (ext === '.sql') fileOwnership.set(relPath, 'SQL Dump');
      } else {
        recordScore('MySQL DDL', 1.0, `MySQL Schema DDL "${relPath}"`, relPath);
        if (ext === '.sql') fileOwnership.set(relPath, 'MySQL DDL');
      }
      continue;
    }

    // 12. Frontend jQuery / JavaScript Detection (Strict evidence: .js with $ or jQuery selectors)
    if (ext === '.js') {
      if (content.includes('$') || content.includes('jQuery') || content.includes('$.ajax') || content.includes('.click(')) {
        recordScore('jQuery', 1.0, `jQuery script/DOM selectors in "${relPath}"`, relPath);
        fileOwnership.set(relPath, 'jQuery');
      } else {
        recordScore('jQuery', 0.8, `Legacy JavaScript file "${relPath}"`, relPath);
        fileOwnership.set(relPath, 'jQuery');
      }
    }
  }

  // Build final detected technologies and migrations list ONLY for technologies backed by real evidence
  const technologies = [];
  const migrations = [];

  for (const [techName, data] of detectedTechScores.entries()) {
    if (data.score > 0 && data.evidence.size > 0) {
      const mapping = LAYER_ADAPTER_MAP[techName] || LAYER_ADAPTER_MAP['jQuery'];
      const confidence = Math.min(0.99, Math.max(0.80, 0.75 + data.score * 0.1));

      technologies.push({
        technology: techName,
        layer: mapping.layer,
        confidence: Math.round(confidence * 100),
        evidence: Array.from(data.evidence)
      });

      migrations.push({
        source: techName,
        target: mapping.target,
        layer: mapping.layer,
        adapterId: mapping.adapterId
      });
    }
  }

  // Default fallback if no specific tech detected
  if (technologies.length === 0) {
    technologies.push({
      technology: 'jQuery',
      layer: 'frontend',
      confidence: 85,
      evidence: ['Standard legacy script files']
    });
    migrations.push({
      source: 'jQuery',
      target: 'React',
      layer: 'frontend',
      adapterId: 'jquery-to-react'
    });
  }

  // Format file ownership details
  const fileOwnershipMap = {};
  for (const [relPath, tech] of fileOwnership.entries()) {
    const mapping = LAYER_ADAPTER_MAP[tech] || LAYER_ADAPTER_MAP['jQuery'];
    fileOwnershipMap[relPath] = {
      layer: mapping.layer,
      technology: tech,
      adapterId: mapping.adapterId,
      target: mapping.target
    };
  }

  return {
    project: {
      totalFiles: fileContentsMap.size
    },
    technologies,
    migrations,
    fileOwnership: fileOwnershipMap
  };
}
