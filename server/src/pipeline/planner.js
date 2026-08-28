/**
 * Legacy Rescue - jQuery to React Migration Planner Module
 * Converts structured Analyze output into a step-by-step React migration plan JSON.
 */

export function generateMigrationPlan(analysis) {
  if (!analysis || typeof analysis !== 'object') {
    throw new Error('Valid analysis object is required to generate a migration plan');
  }

  const filename = analysis.filename || 'LegacyComponent.js';
  // Derive clean React Component Name (e.g. legacy-cart.js -> LegacyCart)
  const baseName = filename.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9]/g, ' ');
  const componentName = baseName
    .split(' ')
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join('') || 'LegacyComponent';

  const transformations = [];
  let stepCounter = 1;

  // 1. Initialization / Lifecycle Transformation
  if (analysis.jqueryMethods?.includes('ready') || analysis.selectors?.includes('document')) {
    transformations.push({
      stepNumber: stepCounter++,
      id: 'lifecycle-init',
      title: 'Component Mount & Lifecycle Setup',
      category: 'Lifecycle',
      jqueryPattern: '$(document).ready(function() { ... })',
      currentBehavior: 'Runs initialization script once the HTML DOM is fully parsed and ready.',
      reactEquivalent: 'useEffect(..., []) Hook',
      requiredTransformation: 'Wrap initial data loading, event listener registration, and side-effects inside a React `useEffect` with an empty dependency array `[]`.',
      preservedBehavior: 'Initial DOM setup and initial data fetching must execute exactly once on component mount.',
      migrationRisks: 'In React StrictMode (development), `useEffect` runs twice on mount. Side-effects like double-fetching or double-binding must be idempotent or cleaned up in return handler.'
    });
  }

  // 2. State-like variables -> React useState Hooks
  const stateHooks = [];
  if (analysis.stateVariables && analysis.stateVariables.length > 0) {
    analysis.stateVariables.forEach(vName => {
      let inferredType = 'any';
      let initialVal = 'null';
      if (/count|total|qty|price|num/i.test(vName)) {
        inferredType = 'number';
        initialVal = '0';
      } else if (/is|has|show|active|flag/i.test(vName)) {
        inferredType = 'boolean';
        initialVal = 'false';
      } else if (/list|items|data|rows/i.test(vName)) {
        inferredType = 'array';
        initialVal = '[]';
      } else if (/key|name|code|str/i.test(vName)) {
        inferredType = 'string';
        initialVal = "''";
      }

      stateHooks.push({
        variableName: vName,
        stateName: vName,
        setterName: `set${vName.charAt(0).toUpperCase() + vName.slice(1)}`,
        inferredType,
        initialValue: initialVal,
        purpose: `Manages state for ${vName} reactively instead of holding imperative variable.`
      });
    });

    transformations.push({
      stepNumber: stepCounter++,
      id: 'state-migration',
      title: 'Imperative Variable to React State Conversion',
      category: 'State Management',
      jqueryPattern: `var/let/const ${analysis.stateVariables.join(', ')}`,
      currentBehavior: `Stores component state in ${analysis.stateVariables.length} mutable local variable(s).`,
      reactEquivalent: 'React useState() Hooks',
      requiredTransformation: `Replace mutable variables with ` + stateHooks.map(s => `const [${s.stateName}, ${s.setterName}] = useState(${s.initialValue})`).join('; ') + '.',
      preservedBehavior: 'State transitions must trigger component re-render so UI elements reflect the latest values automatically.',
      migrationRisks: 'React state updates are asynchronous. Direct reads immediately after setter calls must use functional state updates or derived values.'
    });
  }

  // 3. Event Handlers -> React JSX Event Attributes
  if (analysis.eventHandlers && analysis.eventHandlers.length > 0) {
    analysis.eventHandlers.forEach(handler => {
      const reactEvtName = handler.event === 'click' ? 'onClick' 
        : handler.event === 'submit' ? 'onSubmit' 
        : handler.event === 'change' ? 'onChange' 
        : handler.event === 'input' ? 'onInput' 
        : `on${handler.event.charAt(0).toUpperCase() + handler.event.slice(1)}`;

      transformations.push({
        stepNumber: stepCounter++,
        id: `event-${handler.selector.replace(/[^a-zA-Z0-9]/g, '-')}`,
        title: `Convert Event Listener for "${handler.selector}"`,
        category: 'Event Handling',
        jqueryPattern: `$('${handler.selector}').on('${handler.event}', ...) or shorthand`,
        currentBehavior: `Attaches imperative ${handler.event} listener to DOM element matching selector "${handler.selector}".`,
        reactEquivalent: `Synthetic JSX ${reactEvtName} prop`,
        requiredTransformation: `Bind ${reactEvtName}={(e) => handle${handler.selector.replace(/[^a-zA-Z0-9]/g, '')}(e)} directly on the JSX element instead of querying selector "${handler.selector}".`,
        preservedBehavior: handler.event === 'submit' ? 'Must call `e.preventDefault()` to prevent traditional browser form POST page reload.' : 'Preserve event bubbling and parameter propagation.',
        migrationRisks: `Ensure selector "${handler.selector}" is mapped to a declarative JSX element rather than relying on document global query.`
      });
    });
  }

  // 4. DOM Manipulations -> Declarative JSX Rendering & CSS Classes
  if (analysis.domManipulations && analysis.domManipulations.length > 0) {
    transformations.push({
      stepNumber: stepCounter++,
      id: 'dom-manipulation-refactor',
      title: 'Refactor DOM Manipulations to Declarative JSX',
      category: 'DOM & UI Rendering',
      jqueryPattern: analysis.domManipulations.map(d => `$('${d.target}').${d.method}()`).slice(0, 3).join(', ') + (analysis.domManipulations.length > 3 ? '...' : ''),
      currentBehavior: `Directly mutates DOM elements (${analysis.domManipulations.map(d => d.method).join(', ')}) matching target selectors.`,
      reactEquivalent: 'Declarative JSX Expression & Conditional Classes/Rendering',
      requiredTransformation: 'Replace direct `.text()`, `.addClass()`, `.removeClass()`, `.hide()`, `.show()` calls with React state-driven conditional classNames (e.g. `className={`base ${isActive ? "active" : ""}`}`) and JSX text interpolations.',
      preservedBehavior: 'Visual styles, transition animations, and visibility toggles must remain identical to the legacy UI.',
      migrationRisks: 'Direct DOM mutations outside React VDOM bypass state tracking and cause visual desynchronization.'
    });
  }

  // 5. AJAX / Network Requests -> Fetch / Axios API Integration
  if (analysis.ajaxCalls && analysis.ajaxCalls.length > 0) {
    analysis.ajaxCalls.forEach((ajax, idx) => {
      transformations.push({
        stepNumber: stepCounter++,
        id: `ajax-request-${idx}`,
        title: `Modernize ${ajax.type} Request to "${ajax.url}"`,
        category: 'Network & API',
        jqueryPattern: `$.ajax({ url: '${ajax.url}', type: '${ajax.type}' }) or $.${ajax.type.toLowerCase()}()`,
        currentBehavior: `Fires async HTTP ${ajax.type} request using jQuery.ajax wrapper to endpoint "${ajax.url}".`,
        reactEquivalent: 'native fetch() or Axios in async handler / custom hook',
        requiredTransformation: `Replace $.ajax with modern const res = await fetch("${ajax.url}", { method: "${ajax.type}", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }) inside an async handler function.`,
        preservedBehavior: 'Handle loading state (`isLoading`), success response state, and error message banners identically.',
        migrationRisks: 'Ensure CORS headers, content-type JSON encoding, and error catch blocks match backend API expectations.'
      });
    });
  }

  // 6. LocalStorage Usage -> React Custom Hook or useEffect Sync
  if (analysis.localStorageUsage && analysis.localStorageUsage.length > 0) {
    transformations.push({
      stepNumber: stepCounter++,
      id: 'local-storage-sync',
      title: 'LocalStorage State Persistence Synchronization',
      category: 'Storage',
      jqueryPattern: 'localStorage.getItem() / localStorage.setItem()',
      currentBehavior: analysis.localStorageUsage.join(' & '),
      reactEquivalent: 'useEffect state synchronization or custom useLocalStorage hook',
      requiredTransformation: 'Read initial state from `localStorage.getItem()` during `useState` initialization function, and sync updates using `useEffect(() => { localStorage.setItem(key, value) }, [state])`.',
      preservedBehavior: 'Cached user preferences and cart session data must persist across page refreshes.',
      migrationRisks: 'SSR/Hydration mismatch if window.localStorage is accessed during server rendering without client check.'
    });
  }

  // Comprehensive Risk Assessment
  const riskAssessment = [
    {
      level: 'Low',
      category: 'DOM Selection',
      description: 'Replacing jQuery $(selector) query calls with React JSX ref/state bindings.',
      mitigation: 'Bind state variables to JSX attributes directly.'
    },
    {
      level: analysis.ajaxCalls?.length > 0 ? 'Medium' : 'Low',
      category: 'Async Operations',
      description: 'Handling async HTTP responses and preventing memory leaks if component unmounts during request.',
      mitigation: 'Use AbortController or check mounted ref before calling state setters.'
    },
    {
      level: analysis.stateVariables?.length > 3 ? 'Medium' : 'Low',
      category: 'State Complexity',
      description: `Managing ${analysis.stateVariables?.length || 0} state variables without state desynchronization.`,
      mitigation: 'Group related properties into a single state object if needed.'
    }
  ];

  return {
    componentName,
    filename,
    generatedAt: new Date().toISOString(),
    summary: `Migration plan generated for ${componentName} (${filename}). Plan consists of ${transformations.length} step-by-step transformation modules converting ${analysis.jqueryMethods?.length || 0} jQuery patterns to React functional component hooks & JSX.`,
    targetArchitecture: `React 18 Functional Component (${componentName}) using useState, useEffect, and synthetic JSX event handlers.`,
    stateHooks,
    transformations,
    riskAssessment,
    sourceAnalysisSummary: {
      selectorsCount: analysis.selectors?.length || 0,
      eventHandlersCount: analysis.eventHandlers?.length || 0,
      domManipulationsCount: analysis.domManipulations?.length || 0,
      jqueryMethodsCount: analysis.jqueryMethods?.length || 0
    }
  };
}
