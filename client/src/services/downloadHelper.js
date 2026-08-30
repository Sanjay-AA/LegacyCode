/**
 * Helper utility for downloading modernized code files and project archives.
 */

export function downloadModernizedProject(session) {
  if (!session) return;

  const { filename, migratedCode, componentName, projectDiff } = session;

  // If we have a multi-file project diff
  if (projectDiff && Array.isArray(projectDiff) && projectDiff.length > 0) {
    // Generate combined bundle or iterate files
    projectDiff.forEach(fileItem => {
      if (fileItem.content || fileItem.code || fileItem.migratedContent) {
        const fileContent = fileItem.content || fileItem.code || fileItem.migratedContent;
        const name = fileItem.filename || fileItem.path || 'migrated-file.js';
        triggerDownload(name, fileContent);
      }
    });
    return;
  }

  // Single file download
  if (migratedCode) {
    let outputFilename = filename ? `modernized-${filename}` : `${componentName || 'MigratedComponent'}.jsx`;
    if (!outputFilename.endsWith('.jsx') && !outputFilename.endsWith('.js') && !outputFilename.endsWith('.tsx') && !outputFilename.endsWith('.ts')) {
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
