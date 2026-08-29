import { execFile, spawn } from 'child_process';
import os from 'os';

/**
 * Executes VS Code CLI ('code') safely with execFile / spawn on the validated workspace path.
 */
export function openInVSCode(workspacePath) {
  return new Promise((resolve, reject) => {
    const isWin = os.platform() === 'win32';
    const cmd = isWin ? 'code.cmd' : 'code';

    // Using execFile / spawn with args array avoids shell interpolation vulnerabilities
    const options = {
      windowsHide: true
    };

    // On Windows, 'code' CLI is typically a batch file code.cmd in PATH. Using cmd.exe /c code <path> or execFile('code.cmd')
    if (isWin) {
      // execFile calling cmd.exe /c code <path> safely passing workspacePath as single argument
      execFile('cmd.exe', ['/c', 'code', workspacePath], options, (error, stdout, stderr) => {
        if (error) {
          // Fallback to direct spawn if cmd.exe returns non-zero or error
          const child = spawn('code', [workspacePath], { shell: true, detached: true, stdio: 'ignore' });
          child.on('error', (spawnErr) => {
            return reject({
              error: 'VSCODE_NOT_FOUND',
              message: "VS Code command-line interface was not found. Make sure VS Code is installed and the 'code' command is available in your PATH."
            });
          });
          child.unref();
          return resolve({ success: true, message: 'VS Code opened successfully' });
        }
        return resolve({ success: true, message: 'VS Code opened successfully' });
      });
    } else {
      execFile(cmd, [workspacePath], options, (error, stdout, stderr) => {
        if (error) {
          return reject({
            error: 'VSCODE_NOT_FOUND',
            message: "VS Code command-line interface was not found. Make sure VS Code is installed and the 'code' command is available in your PATH."
          });
        }
        return resolve({ success: true, message: 'VS Code opened successfully' });
      });
    }
  });
}
