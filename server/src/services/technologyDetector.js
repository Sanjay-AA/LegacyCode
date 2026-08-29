import { migrationRegistry } from '../adapters/MigrationRegistry.js';

export function detectTechnology(code = '', filename = 'legacy-code.js') {
  const adapters = migrationRegistry.getAllAdapters();
  const matches = [];

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
          confidence
        });
      }
    } catch (e) {
      console.warn(`Detection failed for adapter ${adapter.id}:`, e.message);
    }
  }

  // Sort by highest confidence score
  matches.sort((a, b) => b.confidence - a.confidence);

  if (matches.length === 0) {
    // Default fallback to jquery-to-react
    const defaultAdapter = migrationRegistry.getAdapter('jquery-to-react');
    return {
      detectedTechnology: 'jQuery',
      category: 'web',
      primaryAdapterId: 'jquery-to-react',
      confidence: 0.5,
      multipleDetected: false,
      matchingAdapters: [{
        adapterId: 'jquery-to-react',
        category: 'web',
        source: 'jQuery',
        target: 'React',
        status: 'SUPPORTED',
        confidence: 0.5
      }],
      availableTargets: [{ id: 'jquery-to-react', target: 'React', status: 'SUPPORTED' }]
    };
  }

  const primary = matches[0];

  // Get all available targets for the detected source technology
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
    multipleDetected: matches.length > 1 && matches[1].confidence >= 0.7,
    matchingAdapters: matches,
    availableTargets: availableTargets.length > 0 ? availableTargets : [{
      id: primary.adapterId,
      target: primary.target,
      status: primary.status
    }]
  };
}
