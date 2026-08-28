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
