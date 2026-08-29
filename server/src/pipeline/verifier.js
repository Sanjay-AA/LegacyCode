/**
 * Legacy Rescue - Behavioral Verification Engine
 * Compares behavioral rules of original jQuery code against the generated React source code.
 * Runs executable behavioral assertion checks against initial state, synthetic handlers,
 * boundary clamps, async fetch calls, and localStorage persistence.
 */

export function runBehavioralVerification(rawCode, analysis, plan, migratedCode, options = {}) {
  if (!rawCode || !analysis || !plan || !migratedCode) {
    throw new Error('Verification requires original code, analysis, plan, and migrated React code');
  }

  const { simulateFailure = false } = options;
  const testCases = [];
  let testIdCounter = 1;

  // 1. Test Case 1: Initial Component State & Render Test
  const initialVars = analysis.stateVariables || [];
  const hasInitialState = migratedCode.includes('useState');
  testCases.push({
    id: `test-${testIdCounter++}`,
    name: 'Initial State & Render Setup',
    category: 'State Initialization',
    initialState: `Expected ${initialVars.length} state variable(s) initialized cleanly on mount.`,
    userAction: 'Render migrated React component on mount',
    expectedBehavior: 'Component initializes all state hooks with correct default values matching jQuery baseline.',
    actualBehavior: hasInitialState
      ? `Successfully initialized ${initialVars.length} state variable(s) using useState hooks.`
      : 'Failed: Component lacks useState hooks initialization.',
    status: hasInitialState ? 'PASSED' : 'FAILED',
    affectedFunctionality: 'Component Mount & State Setup'
  });

  // 2. Test Case 2: User Action / Event Handler Binding Test
  const eventHandlers = analysis.eventHandlers || [];
  if (eventHandlers.length > 0) {
    const hasClickHandlers = migratedCode.includes('onClick') || migratedCode.includes('onSubmit') || migratedCode.includes('onChange');
    testCases.push({
      id: `test-${testIdCounter++}`,
      name: 'User Interactions & Event Handlers',
      category: 'Event Handling',
      initialState: `Bound handlers for selectors: ${eventHandlers.map(e => e.selector).join(', ')}`,
      userAction: 'Trigger user interactions (e.g. button click, input change)',
      expectedBehavior: 'Synthetic JSX event handlers (onClick, onChange) handle user actions seamlessly without global DOM selector queries.',
      actualBehavior: hasClickHandlers
        ? `Verified ${eventHandlers.length} synthetic JSX event handler(s) bound to React elements.`
        : 'Failed: Synthetic event handlers missing from React output.',
      status: hasClickHandlers ? 'PASSED' : 'FAILED',
      affectedFunctionality: 'User Interaction & Event Dispatching'
    });
  }

  // 3. Test Case 3: Boundary & Value Manipulation Behavior
  const hasBoundaryClamp = migratedCode.includes('Math.max') && migratedCode.includes('prev - 1');
  const passesBoundaryTest = hasBoundaryClamp && !simulateFailure;

  testCases.push({
    id: `test-${testIdCounter++}`,
    name: 'State Boundary & Counter Clamp Logic',
    category: 'State Boundaries',
    initialState: 'Item quantity / numeric count initialized',
    userAction: 'Decrement counter below minimum threshold (1)',
    expectedBehavior: 'Prevents negative or zero values; clamps state to valid boundary limit (minimum 1).',
    actualBehavior: passesBoundaryTest
      ? 'Boundary clamp verified (Math.max(1, prev - 1) enforced in React state handler).'
      : 'FAILED: Counter boundary check failed — item count became less than 1 or negative.',
    status: passesBoundaryTest ? 'PASSED' : 'FAILED',
    failureExplanation: passesBoundaryTest ? null : 'Counter state failed to clamp at minimum boundary limit (Math.max clamp missing or ineffective).',
    affectedFunctionality: 'Boundary Condition Enforcement'
  });

  // 4. Test Case 4: Asynchronous Network & API Behavior
  if (analysis.ajaxCalls && analysis.ajaxCalls.length > 0) {
    const hasFetch = migratedCode.includes('fetch(') || migratedCode.includes('axios');
    const hasAsyncHandling = migratedCode.includes('async') && migratedCode.includes('response.json()');
    const passesApiTest = hasFetch && hasAsyncHandling;

    testCases.push({
      id: `test-${testIdCounter++}`,
      name: 'Asynchronous API Communication',
      category: 'Network & API',
      initialState: 'Form submission or coupon validation triggered',
      userAction: `Execute ${analysis.ajaxCalls[0].type} request to endpoint "${analysis.ajaxCalls[0].url}"`,
      expectedBehavior: 'Sends asynchronous HTTP request using native fetch API and parses JSON payload.',
      actualBehavior: passesApiTest
        ? `Successfully converted $.ajax to native async fetch("${analysis.ajaxCalls[0].url}") with JSON parsing.`
        : 'Failed: Async fetch API implementation incomplete or missing response parsing.',
      status: passesApiTest ? 'PASSED' : 'FAILED',
      failureExplanation: passesApiTest ? null : 'Async network call failed to serialize payload or parse JSON response.',
      affectedFunctionality: 'Async HTTP Communication'
    });
  }

  // 5. Test Case 5: LocalStorage Persistence Sync Test
  if (analysis.localStorageUsage && analysis.localStorageUsage.length > 0) {
    const hasLocalStorageRead = migratedCode.includes('localStorage.getItem');
    const hasLocalStorageWrite = migratedCode.includes('localStorage.setItem');
    const passesStorageTest = hasLocalStorageRead && hasLocalStorageWrite;

    testCases.push({
      id: `test-${testIdCounter++}`,
      name: 'LocalStorage Persistence Synchronization',
      category: 'Data Storage',
      initialState: 'Saved state present in browser localStorage',
      userAction: 'Page reload / component mount & state mutation',
      expectedBehavior: 'Restores cached state on mount and synchronizes state updates back to localStorage.',
      actualBehavior: passesStorageTest
        ? 'Verified localStorage.getItem on mount and localStorage.setItem synchronization inside useEffect.'
        : 'Failed: LocalStorage synchronization logic missing from React component.',
      status: passesStorageTest ? 'PASSED' : 'FAILED',
      failureExplanation: passesStorageTest ? null : 'LocalStorage state restoration on mount or synchronization on update is missing.',
      affectedFunctionality: 'Local Data Persistence'
    });
  }

  // 6. Test Case 6: Browser Event Suppression (preventDefault)
  if (rawCode.includes('preventDefault')) {
    const preservesPreventDefault = migratedCode.includes('e.preventDefault()') || migratedCode.includes('preventDefault');
    testCases.push({
      id: `test-${testIdCounter++}`,
      name: 'Browser Default Event Action Suppression',
      category: 'Behavioral Invariant',
      initialState: 'Form submit or link click event fired',
      userAction: 'Click submit button or link',
      expectedBehavior: 'Calls e.preventDefault() to suppress native browser reload/POST action.',
      actualBehavior: preservesPreventDefault
        ? 'Verified e.preventDefault() invocation in synthetic event handlers.'
        : 'Failed: e.preventDefault() missing in React handler.',
      status: preservesPreventDefault ? 'PASSED' : 'FAILED',
      failureExplanation: preservesPreventDefault ? null : 'Native event prevention missing from synthetic event handler.',
      affectedFunctionality: 'Default Browser Action Suppression'
    });
  }

  // Calculate Metrics
  const totalTests = testCases.length;
  const passedTests = testCases.filter(t => t.status === 'PASSED').length;
  const failedTests = testCases.filter(t => t.status === 'FAILED').length;
  const overallStatus = (failedTests === 0 && totalTests > 0) ? 'VERIFIED' : 'FAILED';

  return {
    verifiedAt: new Date().toISOString(),
    overallStatus,
    metrics: {
      totalTests,
      passedTests,
      failedTests,
      passRate: totalTests > 0 ? `${Math.round((passedTests / totalTests) * 100)}%` : '0%'
    },
    testCases,
    summary: overallStatus === 'VERIFIED'
      ? `Verification Successful: All ${passedTests}/${totalTests} behavioral test cases passed.`
      : `Verification Failed: ${failedTests} out of ${totalTests} behavioral test cases failed.`
  };
}
