/**
 * Helper utility for downloading modernized code files and project archives.
 */

const API_BASE_URL = typeof window !== 'undefined'
  ? `${window.location.protocol}//${window.location.hostname}:5000/api`
  : 'http://localhost:5000/api';

export function downloadModernizedProject(session) {
  if (!session) return;

  const { id, filename, migratedCode, componentName, projectDiff, isProject } = session;

  // Multi-file project ZIP archive download
  if (isProject || (projectDiff && Array.isArray(projectDiff) && projectDiff.length > 1)) {
    const downloadUrl = `${API_BASE_URL}/workspace/download-zip?sessionId=${encodeURIComponent(id || '')}`;
    
    // Direct browser ZIP download
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `modernized-${filename || 'project'}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
  }

  // Single file download with correct extension preservation
  if (migratedCode) {
    let outputFilename = filename ? `modernized-${filename}` : `${componentName || 'MigratedComponent'}.jsx`;
    const ext = (filename || '').split('.').pop().toLowerCase();

    // Preserve non-JS file extensions for Java, PHP, Python, Ruby, SQL, Shell, Kotlin, etc.
    if (['java', 'php', 'py', 'rb', 'sql', 'sh', 'kt', 'cs', 'prisma', 'json', 'yaml', 'tf'].includes(ext)) {
      outputFilename = filename ? `modernized-${filename}` : `${componentName || 'MigratedModule'}.${ext}`;
    } else if (!outputFilename.endsWith('.jsx') && !outputFilename.endsWith('.js') && !outputFilename.endsWith('.tsx') && !outputFilename.endsWith('.ts')) {
      outputFilename += '.jsx';
    }

    triggerDownload(outputFilename, migratedCode);
  }
}

function triggerDownload(filename, textContent) {
  const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
