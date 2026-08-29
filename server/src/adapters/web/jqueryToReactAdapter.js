import { BaseAdapter } from '../BaseAdapter.js';
import { analyzeJQueryCode } from '../../pipeline/analyzer.js';
import { generateMigrationPlan } from '../../pipeline/planner.js';
import { performMigration } from '../../pipeline/migrator.js';
import { runBehavioralVerification } from '../../pipeline/verifier.js';

export class JQueryToReactAdapter extends BaseAdapter {
  constructor() {
    super({
      id: 'jquery-to-react',
      category: 'web',
      source: 'jQuery',
      target: 'React',
      status: 'SUPPORTED',
      supportedExtensions: ['.js', '.jsx', '.html'],
      description: 'Migrate legacy imperative jQuery DOM manipulation and events to modern React 18 functional components with hooks.'
    });
  }

  detect(code, filename) {
    let score = 0;
    const clean = code || '';
    if (filename.endsWith('.js') || filename.endsWith('.html')) score += 0.2;
    if (clean.includes('$') || clean.includes('jQuery')) score += 0.5;
    if (clean.includes('$(document).ready') || clean.includes('.click(') || clean.includes('.on(')) score += 0.3;
    return Math.min(1, score);
  }

  analyze(code, filename) {
    const analysis = analyzeJQueryCode(code, filename);
    analysis.technology = 'jQuery';
    analysis.target = 'React';
    analysis.dependencyGraph = {
      nodes: [
        { id: 'app', label: filename, type: 'source' },
        { id: 'jquery', label: 'jQuery Core', type: 'library' },
        { id: 'dom', label: 'Imperative Browser DOM', type: 'target' },
        { id: 'state', label: 'Mutable Scope State', type: 'state' }
      ],
      edges: [
        { from: 'app', to: 'jquery' },
        { from: 'jquery', to: 'dom' },
        { from: 'app', to: 'state' }
      ]
    };
    return analysis;
  }

  createPlan(analysis) {
    return generateMigrationPlan(analysis);
  }

  migrate(code, analysis, plan, repairHint = null) {
    return performMigration(code, analysis, plan, repairHint);
  }

  verify(code, analysis, plan, migratedCode, options = {}) {
    return runBehavioralVerification(code, analysis, plan, migratedCode, options);
  }
}
