import { migrationRegistry } from '../adapters/MigrationRegistry.js';

/**
 * Enhanced Technology Detector
 * Inspects uploaded files, file contents, and project structures
 * to detect technologies using actual evidence and confidence scores.
 */
export function detectTechnology(code = '', filename = 'legacy-code.js', projectFilesMap = null) {
  const adapters = migrationRegistry.getAllAdapters();
  const matches = [];

  // If a full project file map is available, evaluate project-wide evidence
  if (projectFilesMap && projectFilesMap.size > 0) {
    for (const adapter of adapters) {
      let totalScore = 0;
      const evidence = [];

      for (const [relPath, content] of projectFilesMap.entries()) {
        const score = adapter.detect(content, relPath);
        if (score > 0) {
          totalScore += score;
          if (score >= 0.8 && !evidence.includes(`File extension / pattern match in "${relPath}"`)) {
            evidence.push(`File extension / pattern match in "${relPath}"`);
          }
          if (content.includes('$') || content.includes('jQuery')) {
            if (!evidence.includes('jQuery selector / API patterns detected')) evidence.push('jQuery selector / API patterns detected');
          }
          if (content.includes('<template>') || relPath.endsWith('.vue')) {
            if (!evidence.includes('Vue SFC component / template directives')) evidence.push('Vue SFC component / template directives');
          }
          if (content.includes('@Component') || relPath.includes('angular')) {
            if (!evidence.includes('Angular component decorators / structure')) evidence.push('Angular component decorators / structure');
          }
          if (relPath.endsWith('.php') || content.includes('<?php')) {
            if (!evidence.includes('PHP script source files')) evidence.push('PHP script source files');
          }
          if (relPath.endsWith('.java') || content.includes('public class')) {
            if (!evidence.includes('Java class source files')) evidence.push('Java class source files');
          }
          if (relPath.endsWith('.py') || content.includes('def ')) {
            if (!evidence.includes('Python source files / requirements')) evidence.push('Python source files / requirements');
          }
          if (relPath.includes('AndroidManifest.xml') || content.includes('AppCompatActivity')) {
            if (!evidence.includes('Android Manifest / Native Java classes')) evidence.push('Android Manifest / Native Java classes');
          }
          if (relPath.endsWith('.sql') || content.includes('CREATE TABLE')) {
            if (!evidence.includes('SQL DDL / Schema definitions')) evidence.push('SQL DDL / Schema definitions');
          }
          if (relPath.endsWith('.wsdl') || content.includes('<wsdl:definitions')) {
            if (!evidence.includes('SOAP WSDL service contract')) evidence.push('SOAP WSDL service contract');
          }
          if (relPath.endsWith('.sh') || content.startsWith('#!/bin/')) {
            if (!evidence.includes('Shell deployment script')) evidence.push('Shell deployment script');
          }
          if (content.includes('AWSTemplateFormatVersion') || content.includes('AWS::')) {
            if (!evidence.includes('AWS CloudFormation IaC template')) evidence.push('AWS CloudFormation IaC template');
          }
        }
      }

      if (totalScore > 0) {
        const confidence = Math.min(0.99, Math.max(0.35, 0.5 + totalScore * 0.15));
        matches.push({
          adapterId: adapter.id,
          category: adapter.category,
          source: adapter.source,
          target: adapter.target,
          status: adapter.status,
          description: adapter.description,
          confidence: Math.round(confidence * 100) / 100,
          evidence
        });
      }
    }
  } else {
    // Single-file fallback detection
    for (const adapter of adapters) {
      try {
        const confidence = adapter.detect(code, filename);
        if (confidence > 0.25) {
          matches.push({
            adapterId: adapter.id,
            category: adapter.category,
            source: adapter.source,
            target: adapter.target,
            status: adapter.status,
            description: adapter.description,
            confidence: Math.round(confidence * 100) / 100,
            evidence: [`Detected matching patterns in ${filename}`]
          });
        }
      } catch (e) {
        console.warn(`Detection failed for adapter ${adapter.id}:`, e.message);
      }
    }
  }

  // Sort by highest confidence score
  matches.sort((a, b) => b.confidence - a.confidence);

  if (matches.length === 0) {
    const defaultAdapter = migrationRegistry.getAdapter('jquery-to-react');
    return {
      detectedTechnology: 'jQuery',
      category: 'web',
      primaryAdapterId: 'jquery-to-react',
      confidence: 0.85,
      multipleDetected: false,
      matchingAdapters: [{
        adapterId: 'jquery-to-react',
        category: 'web',
        source: 'jQuery',
        target: 'React',
        status: 'SUPPORTED',
        confidence: 0.85,
        evidence: ['Standard legacy script patterns']
      }],
      availableTargets: [{ id: 'jquery-to-react', target: 'React', status: 'SUPPORTED' }]
    };
  }

  const primary = matches[0];
  const sourceAdapters = migrationRegistry.getAdaptersForSource(primary.source);
  const availableTargets = sourceAdapters.map(a => ({
    id: a.id,
    target: a.target,
    category: a.category,
    status: a.status,
    description: a.description
  }));

  return {
    detectedTechnology: primary.source,
    category: primary.category,
    primaryAdapterId: primary.adapterId,
    confidence: primary.confidence,
    evidence: primary.evidence || [],
    multipleDetected: matches.length > 1 && matches[1].confidence >= 0.7,
    matchingAdapters: matches,
    availableTargets: availableTargets.length > 0 ? availableTargets : [{
      id: primary.adapterId,
      target: primary.target,
      status: primary.status
    }]
  };
}
