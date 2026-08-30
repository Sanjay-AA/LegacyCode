/**
 * Client-Side Input Validation Utility for Legacy Rescue
 * Performs fast lightweight validation of source code inputs before pipeline invocation.
 */

export function validateCodeInput(code, filename) {
  if (!code || !code.trim()) {
    return {
      valid: false,
      errorType: 'EMPTY',
      title: 'Empty Input',
      message: 'Please enter some source code before starting modernization.'
    };
  }

  const trimmed = code.trim();

  // Code syntax symbols mandatory in source code files
  const hasSyntaxSymbols = /[;{}()$<>=+\-\*\/\\#\[\]@]/.test(trimmed) || /<\?php|\bpublic\s+class\b|\bimport\s+|\bpackage\s+|\bdef\s+|\bfunction\b/i.test(trimmed);

  // Plain English sentence without programming syntax symbols
  const isPlainSentence = /^[a-zA-Z0-9\s.,!?'"-]+$/.test(trimmed) && !hasSyntaxSymbols;

  if (isPlainSentence || (!hasSyntaxSymbols && trimmed.length < 50)) {
    return {
      valid: false,
      errorType: 'INVALID_CODE',
      title: 'Invalid file',
      message: 'Please upload a valid source-code file for modernization.'
    };
  }

  return { valid: true };
}
