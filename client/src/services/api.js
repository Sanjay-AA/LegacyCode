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
