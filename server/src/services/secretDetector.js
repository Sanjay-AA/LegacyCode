/**
 * Secret & Credential Detector for Legacy Rescue
 * Identifies API keys, private keys, cloud credentials, and .env files.
 * Masks raw values to prevent secret exposure.
 */

const SECRET_PATTERNS = [
  { name: 'AWS Access Key', regex: /AKIA[0-9A-Z]{16}/g },
  { name: 'AWS Secret Key', regex: /aws_secret_access_key\s*=\s*['"][A-Za-z0-9/+=]{40}['"]/gi },
  { name: 'OpenAI API Key', regex: /sk-proj-[A-Za-z0-9-_]{32,}/g },
  { name: 'GitHub Personal Access Token', regex: /ghp_[A-Za-z0-9]{36}/g },
  { name: 'RSA Private Key', regex: /-----BEGIN (RSA|OPENSSH|PRIVATE) KEY-----/g },
  { name: 'Database Connection String', regex: /(postgres|mysql|mongodb|redis):\/\/[a-zA-Z0-9_]+:[^@\s]+@[a-zA-Z0-9.-]+/gi },
  { name: 'Generic Secret Token', regex: /(secret|password|passwd|api_key|access_token)\s*[:=]\s*['"][^'"]{8,}['"]/gi }
];

export function detectSecrets(fileContentsMap, fileList = []) {
  const sensitiveFiles = [];
  const detectedSecrets = [];

  // 1. Check Filenames
  for (const file of fileList) {
    const filename = typeof file === 'string' ? file : file.relativePath || '';
    if (filename.includes('.env') || filename.includes('credentials') || filename.includes('id_rsa') || filename.includes('secrets')) {
      sensitiveFiles.push({
        filename,
        reason: 'Sensitive configuration / credential filename'
      });
    }
  }

  // 2. Scan File Contents
  for (const [filename, content] of fileContentsMap.entries()) {
    if (!content || typeof content !== 'string') continue;

    for (const pattern of SECRET_PATTERNS) {
      if (pattern.regex.test(content)) {
        detectedSecrets.push({
          filename,
          type: pattern.name,
          maskedValue: '⚠ Sensitive Secret Masked'
        });
        pattern.regex.lastIndex = 0; // Reset regex state
      }
    }
  }

  return {
    hasSecrets: sensitiveFiles.length > 0 || detectedSecrets.length > 0,
    sensitiveFiles,
    detectedSecrets
  };
}
