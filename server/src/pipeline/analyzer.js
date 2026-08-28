/**
 * Legacy Rescue - jQuery Code Analyzer Module
 * Analyzes jQuery source code to produce structured JSON metadata for migration planning.
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
    // Exclude HTML creation tags like '<div>' or document/window
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
  // Pattern 1: $('.btn').on('click', ...) or $('.btn').click(...)
  const eventNames = ['click', 'submit', 'change', 'keyup', 'keydown', 'blur', 'focus', 'hover', 'input'];
  eventNames.forEach(evt => {
    // .on('click', ...)
    const onRegex = new RegExp(`(?:\\$|jQuery)\\s*\\(\\s*['"\`]([^'"\`]+)['"\`]\\s*\\)\\s*\\.on\\s*\\(\\s*['"\`]${evt}['"\`]`, 'g');
    while ((match = onRegex.exec(cleanCode)) !== null) {
      eventHandlers.push({
        event: evt,
        selector: match[1],
        description: `Handles ${evt} on selector "${match[1]}"`
      });
    }
    // .click(function...)
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

  // 5. Detect State-like variables (var, let, const in scope or window globals)
  const varRegex = /(?:var|let|const)\s+([a-zA-Z0-9_$]+)\s*=/g;
  const stateVariablesSet = new Set();
  while ((match = varRegex.exec(cleanCode)) !== null) {
    const vName = match[1];
    if (!['$ele', 'self', 'that', 'e', 'evt', 'event', 'i', 'err', 'response', 'data'].includes(vName)) {
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
      url: (urlMatch && urlMatch[1]) ? urlMatch[1] : 'Dynamic / Parameterized Endpoint',
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

  // 8. Detect User Interactions & Purpose Summary
  const userInteractions = new Set();
  eventHandlers.forEach(h => {
    if (h.event === 'click') userInteractions.add('Click interaction');
    if (h.event === 'submit') userInteractions.add('Form submission');
    if (h.event === 'change' || h.event === 'input') userInteractions.add('Form input modification');
    if (h.event === 'keyup' || h.event === 'keydown') userInteractions.add('Keyboard input');
  });

  // Infer purpose
  let inferredPurpose = 'Interactive UI component';
  if (eventHandlers.some(h => h.event === 'submit') || cleanCode.includes('val()')) {
    inferredPurpose = 'Form input processing & submission component';
  } else if (domManipulations.some(m => ['fadeIn', 'fadeOut', 'hide', 'show', 'toggleClass'].includes(m.method))) {
    inferredPurpose = 'Interactive toggle / modal / visibility component';
  } else if (ajaxCalls.length > 0) {
    inferredPurpose = 'Data-fetching interactive widget';
  }

  // 9. External Dependencies
  const dependencies = ['jQuery'];
  if (cleanCode.includes('bootstrap') || cleanCode.includes('modal(')) dependencies.push('Bootstrap UI');
  if (cleanCode.includes('moment(')) dependencies.push('Moment.js');
  if (cleanCode.includes('lodash') || cleanCode.includes('_.')) dependencies.push('Lodash');

  // 10. Behavioral Rules Summary
  const behavioralRules = [];
  if (cleanCode.includes('preventDefault')) {
    behavioralRules.push('Suppresses default browser event actions (e.g. form reload)');
  }
  if (domManipulations.some(d => d.method === 'addClass' || d.method === 'removeClass')) {
    behavioralRules.push('Updates DOM element class states based on user actions');
  }
  if (ajaxCalls.length > 0) {
    behavioralRules.push('Performs async HTTP communication with backend API');
  }
  if (stateVariablesSet.size > 0) {
    behavioralRules.push(`Maintains ${stateVariablesSet.size} local state variable(s) across operations`);
  }

  const selectors = Array.from(selectorsSet);
  const jqueryMethods = Array.from(jqueryMethodsSet);
  const stateVariables = Array.from(stateVariablesSet);

  const fileSizeBytes = Buffer.byteLength(code, 'utf8');
  const fileSizeFormatted = fileSizeBytes < 1024 
    ? `${fileSizeBytes} B` 
    : `${(fileSizeBytes / 1024).toFixed(2)} KB`;

  return {
    filename,
    fileSize: fileSizeFormatted,
    fileSizeBytes,
    analyzedAt: new Date().toISOString(),
    purpose: inferredPurpose,
    summary: `Analyzed ${filename} (${fileSizeFormatted}): Found ${selectors.length} DOM selector(s), ${eventHandlers.length} event handler(s), ${domManipulations.length} DOM manipulation(s), and ${jqueryMethods.length} jQuery pattern(s).`,
    selectors,
    eventHandlers,
    domManipulations,
    stateVariables,
    jqueryMethods,
    userInteractions: Array.from(userInteractions),
    dependencies,
    ajaxCalls,
    localStorageUsage,
    behavioralRules
  };
}
