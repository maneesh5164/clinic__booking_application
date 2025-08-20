const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';

export async function api(path, { method = 'GET', body, auth } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) headers['Authorization'] = `Bearer ${auth}`;
  const res = await fetch(`${API_BASE}/api${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = data?.error || { code: 'HTTP_ERROR', message: 'Request failed' };
    throw err;
  }
  return data;
}
