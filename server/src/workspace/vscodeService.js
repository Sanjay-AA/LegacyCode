import { execFile, spawn } from 'child_process';
import os from 'os';
import path from 'path';

/**
 * Checks whether VS Code command line launcher 'code' is available in PATH
 */
export function checkVSCodeCLIAvailable() {
  return new Promise((resolve) => {
    const isWin = os.platform() === 'win32';
    const checkCmd = isWin ? 'cmd.exe' : 'code';
    const checkArgs = isWin ? ['/c', 'code', '--version'] : ['--version'];

    execFile(checkCmd, checkArgs, { timeout: 2000, windowsHide: true }, (error) => {
      if (error) {
        return resolve(false);
      }
      return resolve(true);
    });
  });
}

/**
 * Safely launches VS Code CLI ('code') on the authoritative modernized project directory path.
 */
export async function openInVSCode(workspacePath) {
  const isAvailable = await checkVSCodeCLIAvailable();
  if (!isAvailable) {
    throw {
      error: 'VSCODE_NOT_FOUND',
      message: "VS Code command-line launcher is not available. Please enable the 'code' command in PATH."
    };
  }

  const absolutePath = path.resolve(workspacePath);
  const isWin = os.platform() === 'win32';

  return new Promise((resolve, reject) => {
    try {
      if (isWin) {
        const child = spawn('cmd.exe', ['/c', 'code', absolutePath], {
          detached: true,
          stdio: 'ignore',
          windowsHide: true
        });

        child.on('error', (err) => {
          return reject({
            error: 'VSCODE_LAUNCH_FAILED',
            message: `Failed to launch VS Code: ${err.message}`
          });
        });

        child.unref();
      } else {
        const child = spawn('code', [absolutePath], {
          detached: true,
          stdio: 'ignore'
        });

        child.on('error', (err) => {
          return reject({
            error: 'VSCODE_LAUNCH_FAILED',
            message: `Failed to launch VS Code: ${err.message}`
          });
        });

        child.unref();
      }

      return resolve({
        success: true,
        message: 'Modernized project opened in VS Code',
        workspacePath: absolutePath
      });
    } catch (err) {
      return reject({
        error: 'VSCODE_LAUNCH_FAILED',
        message: `Failed to launch VS Code: ${err.message}`
      });
    }
  });
}
