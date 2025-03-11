// ------------------------------------------------------------------------------------------------
// Tracking
// ------------------------------------------------------------------------------------------------

const API_URL = 'http://localhost:3002/api';

export async function initSession(sessionId: string): Promise<void> {
  const response = await fetch(`${API_URL}/log-session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sessionId }),
  });

  if (!response.ok) {
    throw new Error('Failed to initialize session');
  }
}

export async function trackClick(sessionId: string, elementId: string): Promise<void> {
  try {
    const response = await fetch(`${API_URL}/log-click`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionId, elementId }),
    });

    if (!response.ok) {
      throw new Error('Failed to log click');
    }
  } catch (error) {
    console.error('Error logging click:', error);
  }
}

