/**
 * Service module for interacting with the Legacy Rescue backend API.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export async function checkHealth() {
  const startTime = performance.now();
  const response = await fetch(`${API_BASE_URL}/health`, {
    headers: { 'Accept': 'application/json' }
  });

  if (!response.ok) {
    throw new Error(`Health check failed with status: ${response.status}`);
  }

  const data = await response.json();
  const latency = Math.round(performance.now() - startTime);

  return { ...data, latency };
}

export async function fetchAdaptersApi() {
  const response = await fetch(`${API_BASE_URL}/pipeline/adapters`, {
    headers: { 'Accept': 'application/json' }
  });
  if (!response.ok) return { adapters: [], history: [] };
  return await response.json();
}

export async function detectTechnologyApi(code, filename) {
  const response = await fetch(`${API_BASE_URL}/pipeline/detect`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({ code, filename })
  });

  if (!response.ok) {
    throw new Error('Technology detection failed');
  }

  return await response.json();
}

export async function openVSCodeApi(sessionId) {
  const response = await fetch(`${API_BASE_URL}/workspace/open-vscode`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({ sessionId })
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    const error = new Error(data.message || 'Failed to open VS Code');
    error.code = data.error;
    throw error;
  }
  return data;
}

export async function fetchWorkspaceStatusApi(sessionId) {
  const url = sessionId ? `${API_BASE_URL}/workspace/status?sessionId=${encodeURIComponent(sessionId)}` : `${API_BASE_URL}/workspace/status`;
  const response = await fetch(url, {
    headers: { 'Accept': 'application/json' }
  });
  if (!response.ok) return { success: false, changed: false, filesChanged: 0 };
  return await response.json();
}

export async function shipMigrationApi() {
  const response = await fetch(`${API_BASE_URL}/ship`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.error || `Shipping failed with status ${response.status}`);
    error.blocked = data.blocked;
    throw error;
  }

  return data.shipResult;
}

export async function runPipelineStream({ code, filename, adapterId, retryStage, simulateFailure }, onEvent, onError, onComplete) {
  try {
    const response = await fetch(`${API_BASE_URL}/pipeline/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream'
      },
      body: JSON.stringify({ code, filename, adapterId, retryStage, simulateFailure })
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Pipeline stream failed (${response.status}): ${text}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || '';

      for (const chunk of lines) {
        if (!chunk.trim()) continue;

        let eventType = 'message';
        let data = null;

        for (const line of chunk.split('\n')) {
          if (line.startsWith('event: ')) {
            eventType = line.replace('event: ', '').trim();
          } else if (line.startsWith('data: ')) {
            try {
              data = JSON.parse(line.replace('data: ', '').trim());
            } catch (e) {
              data = line.replace('data: ', '').trim();
            }
          }
        }

        if (data && onEvent) {
          onEvent(eventType, data);
        }
      }
    }

    if (onComplete) onComplete();
  } catch (err) {
    if (onError) onError(err);
  }
}

export async function runProjectPipelineStream({ projectZipBase64, filename, adapterId, simulateFailure }, onEvent, onError, onComplete) {
  try {
    const response = await fetch(`${API_BASE_URL}/pipeline/run-project`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream'
      },
      body: JSON.stringify({ projectZipBase64, filename, adapterId, simulateFailure })
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Project pipeline stream failed (${response.status}): ${text}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || '';

      for (const chunk of lines) {
        if (!chunk.trim()) continue;

        let eventType = 'message';
        let data = null;

        for (const line of chunk.split('\n')) {
          if (line.startsWith('event: ')) {
            eventType = line.replace('event: ', '').trim();
          } else if (line.startsWith('data: ')) {
            try {
              data = JSON.parse(line.replace('data: ', '').trim());
            } catch (e) {
              data = line.replace('data: ', '').trim();
            }
          }
        }

        if (data && onEvent) {
          onEvent(eventType, data);
        }
      }
    }

    if (onComplete) onComplete();
  } catch (err) {
    if (onError) onError(err);
  }
}
