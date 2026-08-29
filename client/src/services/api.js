/**
 * Service module for interacting with the Legacy Rescue backend API.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export async function checkHealth() {
  const startTime = performance.now();
  const response = await fetch(`${API_BASE_URL}/health`, {
    headers: {
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Health check failed with status: ${response.status}`);
  }

  const data = await response.json();
  const latency = Math.round(performance.now() - startTime);

  return {
    ...data,
    latency
  };
}

export async function analyzeCode(code, filename = 'legacy-component.js') {
  const response = await fetch(`${API_BASE_URL}/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({ code, filename })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `Analysis failed with status ${response.status}`);
  }

  return data.analysis;
}

export async function generatePlan(analysis) {
  const response = await fetch(`${API_BASE_URL}/plan`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({ analysis })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `Planning failed with status ${response.status}`);
  }

  return data.plan;
}

export async function performMigrationApi(rawCode, analysis, plan) {
  const response = await fetch(`${API_BASE_URL}/migrate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({ rawCode, analysis, plan })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `Migration failed with status ${response.status}`);
  }

  return data;
}

export async function runVerificationApi(rawCode, analysis, plan, migratedCode) {
  const response = await fetch(`${API_BASE_URL}/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({ rawCode, analysis, plan, migratedCode })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `Verification failed with status ${response.status}`);
  }

  return data.verification;
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

export async function runPipelineStream({ code, filename, retryStage }, onEvent, onError, onComplete) {
  try {
    const response = await fetch(`${API_BASE_URL}/pipeline/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream'
      },
      body: JSON.stringify({ code, filename, retryStage })
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
