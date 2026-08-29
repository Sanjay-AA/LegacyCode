/**
 * Legacy Rescue - jQuery Code Analyzer Module
 * Analyzes jQuery source code to produce structured JSON metadata,
 * Legacy Code Health Report, Migration Risk Assessment, and Behavioral Contract.
 */

export function analyzeJQueryCode(code, filename = 'legacy-component.js') {
  if (!code || typeof code !== 'string' || code.trim().length === 0) {
    throw new Error('Code content is required for analysis');
  }

  const cleanCode = code.trim();

  // 1. Detect Selectors: $(...) or jQuery(...)
  const selectorRegex = /(?:\$|jQuery)\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g;
  const selectorsSet = new Set();
  let match;
  while ((match = selectorRegex.exec(cleanCode)) !== null) {
    const sel = match[1].trim();
    if (!sel.startsWith('<') && sel !== 'document' && sel !== 'window') {
      selectorsSet.add(sel);
    }
  }

  // 2. Detect jQuery Methods
  const commonJQueryMethods = [
    'on', 'off', 'click', 'submit', 'change', 'keyup', 'keydown', 'hover',
    'addClass', 'removeClass', 'toggleClass', 'hasClass',
    'html', 'text', 'val', 'attr', 'removeAttr', 'css', 'prop',
    'hide', 'show', 'toggle', 'fadeIn', 'fadeOut', 'slideUp', 'slideDown',
    'append', 'prepend', 'after', 'before', 'remove', 'empty', 'find', 'parent', 'children',
    'ajax', 'get', 'post', 'getJSON'
  ];

  const jqueryMethodsSet = new Set();
  commonJQueryMethods.forEach(method => {
    const methodRegex = new RegExp(`\\.(?:${method})\\s*\\(`, 'g');
    if (methodRegex.test(cleanCode) || cleanCode.includes(`$.${method}`)) {
      jqueryMethodsSet.add(method);
    }
  });

  // 3. Detect Event Handlers
  const eventHandlers = [];
  const eventNames = ['click', 'submit', 'change', 'keyup', 'keydown', 'blur', 'focus', 'hover', 'input'];
  eventNames.forEach(evt => {
    const onRegex = new RegExp(`(?:\\$|jQuery)\\s*\\(\\s*['"\`]([^'"\`]+)['"\`]\\s*\\)\\s*\\.on\\s*\\(\\s*['"\`]${evt}['"\`]`, 'g');
    while ((match = onRegex.exec(cleanCode)) !== null) {
      eventHandlers.push({
        event: evt,
        selector: match[1],
        description: `Handles ${evt} on selector "${match[1]}"`
      });
    }
    const shorthandRegex = new RegExp(`(?:\\$|jQuery)\\s*\\(\\s*['"\`]([^'"\`]+)['"\`]\\s*\\)\\s*\\.${evt}\\s*\\(`, 'g');
    while ((match = shorthandRegex.exec(cleanCode)) !== null) {
      if (!eventHandlers.some(e => e.event === evt && e.selector === match[1])) {
        eventHandlers.push({
          event: evt,
          selector: match[1],
          description: `Handles ${evt} shorthand on selector "${match[1]}"`
        });
      }
    }
  });

  // 4. Detect DOM Manipulations
  const domManipulations = [];
  const manipulationMethods = ['addClass', 'removeClass', 'toggleClass', 'html', 'text', 'val', 'css', 'hide', 'show', 'fadeIn', 'fadeOut', 'append'];
  manipulationMethods.forEach(m => {
    const manipRegex = new RegExp(`(?:\\$|jQuery)\\s*\\(\\s*['"\`]([^'"\`]+)['"\`]\\s*\\)\\s*\\.${m}\\s*\\(([^)]*)\\)`, 'g');
    while ((match = manipRegex.exec(cleanCode)) !== null) {
      domManipulations.push({
        method: m,
        target: match[1],
        argument: match[2]?.trim() || ''
      });
    }
  });

  // 5. Detect State-like variables
  const varRegex = /(?:var|let|const)\s+([a-zA-Z0-9_$]+)\s*=/g;
  const stateVariablesSet = new Set();
  while ((match = varRegex.exec(cleanCode)) !== null) {
    const vName = match[1];
    if (!['$ele', '$input', '$this', 'self', 'that', 'e', 'evt', 'event', 'i', 'err', 'response', 'data'].includes(vName)) {
      stateVariablesSet.add(vName);
    }
  }

  // 6. Detect AJAX / Network Behavior
  const ajaxCalls = [];
  if (/\$\.(?:ajax|get|post|getJSON)/.test(cleanCode) || /\.ajax\s*\(/.test(cleanCode)) {
    const urlMatch = cleanCode.match(/url\s*:\s*['"`]([^'"`]+)['"`]/) || cleanCode.match(/\$\.(?:get|post|getJSON)\s*\(\s*['"`]([^'"`]+)['"`]/);
    const methodMatch = cleanCode.match(/(?:type|method)\s*:\s*['"`]([^'"`]+)['"`]/i);
    ajaxCalls.push({
      type: (methodMatch && methodMatch[1]) ? methodMatch[1].toUpperCase() : (cleanCode.includes('$.post') ? 'POST' : 'GET/POST'),
      url: (urlMatch && urlMatch[1]) ? urlMatch[1] : 'Dynamic Endpoint',
      dataType: cleanCode.match(/dataType\s*:\s*['"`]([^'"`]+)['"`]/)?.[1] || 'json'
    });
  }

  // 7. Detect LocalStorage / SessionStorage
  const localStorageUsage = [];
  if (cleanCode.includes('localStorage.getItem') || cleanCode.includes('localStorage[')) {
    localStorageUsage.push('Reads from localStorage');
  }
  if (cleanCode.includes('localStorage.setItem') || cleanCode.includes('localStorage.')) {
    localStorageUsage.push('Writes to localStorage');
  }
  if (cleanCode.includes('sessionStorage.')) {
    localStorageUsage.push('Uses sessionStorage');
  }

  const selectors = Array.from(selectorsSet);
  const jqueryMethods = Array.from(jqueryMethodsSet);
  const stateVariables = Array.from(stateVariablesSet);

  // 8. Deterministic Legacy Health & Risk Assessment
  let riskScore = 100; // 100 = cleanest state
  const risks = [];

  if (domManipulations.length > 0) {
    const penalty = Math.min(30, domManipulations.length * 3);
    riskScore -= penalty;
    risks.push({
      severity: domManipulations.length > 5 ? 'high' : 'medium',
      title: 'Heavy Direct DOM Manipulation',
      description: `Detected ${domManipulations.length} imperative DOM mutations bypassing React's virtual DOM.`
    });
  }

  if (stateVariables.length > 0) {
    const penalty = Math.min(25, stateVariables.length * 5);
    riskScore -= penalty;
    risks.push({
      severity: stateVariables.length > 3 ? 'high' : 'medium',
      title: 'Global / Implicit Mutable State',
      description: `Component holds ${stateVariables.length} mutable variable(s) outside declarative React hooks.`
    });
  }

  if (eventHandlers.length > 0) {
    const penalty = Math.min(20, eventHandlers.length * 3);
    riskScore -= penalty;
    risks.push({
      severity: 'medium',
      title: 'Imperative Event Handlers',
      description: `Detected ${eventHandlers.length} jQuery event listener(s) requiring synthetic React event binding.`
    });
  }

  if (ajaxCalls.length > 0) {
    riskScore -= 15;
    risks.push({
      severity: 'medium',
      title: 'Asynchronous Network Operations',
      description: `Contains $.ajax / network calls that need conversion to modern async fetch with state synchronization.`
    });
  }

  const dependencies = ['jQuery'];
  if (cleanCode.includes('bootstrap') || cleanCode.includes('modal(')) dependencies.push('Bootstrap UI');
  if (cleanCode.includes('moment(')) dependencies.push('Moment.js');

  if (dependencies.length > 1) {
    riskScore -= 10;
    risks.push({
      severity: 'medium',
      title: 'External Plugin Coupling',
      description: `Depends on external libraries [${dependencies.slice(1).join(', ')}] that must be replaced with native React code.`
    });
  }

  const finalRiskScore = Math.max(15, Math.min(100, riskScore));
  const healthOverall = finalRiskScore >= 80 ? 'Low Risk' : finalRiskScore >= 50 ? 'Medium Risk' : 'High Risk';
  const riskLevel = finalRiskScore >= 80 ? 'LOW' : finalRiskScore >= 50 ? 'MEDIUM' : 'HIGH';

  const health = {
    overall: healthOverall,
    score: finalRiskScore,
    riskLevel
  };

  const patternCounts = {
    domManipulation: domManipulations.length,
    eventHandlers: eventHandlers.length,
    globalVariables: stateVariables.length,
    ajaxCalls: ajaxCalls.length
  };

  // 9. Behavioral Contract Generation
  const initialContractState = {};
  stateVariables.forEach(v => {
    if (/count|total|qty|price|num/i.test(v)) initialContractState[v] = 0;
    else if (/is|has|show|active|flag/i.test(v)) initialContractState[v] = false;
    else initialContractState[v] = '';
  });

  const behaviors = [];
  eventHandlers.forEach(h => {
    let expectedDesc = `Triggers state transition or handler logic for ${h.selector}`;
    if (h.selector.includes('qty-plus') || h.selector.includes('increment')) {
      expectedDesc = 'Increments count / quantity by 1';
    } else if (h.selector.includes('qty-minus') || h.selector.includes('decrement')) {
      expectedDesc = 'Decrements count / quantity by 1 (minimum threshold enforced)';
    } else if (h.selector.includes('coupon') || h.event === 'submit') {
      expectedDesc = 'Validates input, fires async network request, and updates feedback banner';
    }

    behaviors.push({
      action: `${h.event} interaction on "${h.selector}"`,
      expected: expectedDesc
    });
  });

  const behavioralContract = {
    component: filename.replace(/\.[^/.]+$/, ''),
    initialState: initialContractState,
    behaviors: behaviors.length > 0 ? behaviors : [
      { action: 'Render component on mount', expected: 'Initializes state and mounts clean UI without DOM side effects' }
    ],
    rules: [
      'Preserve initial component state defaults',
      'Preserve user interaction handlers and state transitions',
      'Preserve boundary condition clamps (e.g., minimum item count)',
      'Preserve async API request handling and feedback banners'
    ]
  };

  const fileSizeBytes = Buffer.byteLength(code, 'utf8');
  const fileSizeFormatted = fileSizeBytes < 1024 
    ? `${fileSizeBytes} B` 
    : `${(fileSizeBytes / 1024).toFixed(2)} KB`;

  return {
    filename,
    fileSize: fileSizeFormatted,
    fileSizeBytes,
    analyzedAt: new Date().toISOString(),
    purpose: 'Interactive jQuery component targeted for React modernization',
    summary: `Analyzed ${filename} (${fileSizeFormatted}): Detected Health Score ${finalRiskScore}/100 (${healthOverall}). Found ${selectors.length} DOM selector(s), ${eventHandlers.length} event handler(s), ${domManipulations.length} DOM manipulation(s).`,
    selectors,
    eventHandlers,
    domManipulations,
    stateVariables,
    jqueryMethods,
    dependencies,
    ajaxCalls,
    localStorageUsage,
    health,
    patterns: patternCounts,
    risks,
    behavioralContract,
    riskAssessmentBefore: {
      score: finalRiskScore,
      level: riskLevel,
      reasons: risks.map(r => r.title)
    }
  };
}
