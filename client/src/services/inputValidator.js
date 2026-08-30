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

  // Code constructs and programming syntax patterns
  const codePatterns = [
    /\b(function|var|let|const|if|else|for|while|return|class|import|export|public|private|protected|def|select|insert|update|delete|create|table|from|where|echo|print|try|catch|new|this)\b/i,
    /[;{}()$<>=\[\]\/\*\\#]/,
    /<\?php/,
    /\$\s*\(/,
    /public\s+class/,
    /import\s+/,
    /package\s+/,
    /<html|<div|<script|<template/i
  ];

  const hasCodeConstruct = codePatterns.some(pattern => pattern.test(trimmed));

  // Plain text / random word detection (e.g. "hello", "this is my project", "123456", "test")
  const isPlainSentence = /^[a-zA-Z0-9\s.,!?'"-]+$/.test(trimmed) && !hasCodeConstruct;

  if (isPlainSentence || (!hasCodeConstruct && trimmed.length < 15)) {
    return {
      valid: false,
      errorType: 'INVALID_CODE',
      title: 'Invalid code',
      message: 'The content you entered does not appear to be source code. Please paste a valid legacy source file or upload a project.'
    };
  }

  return { valid: true };
}
