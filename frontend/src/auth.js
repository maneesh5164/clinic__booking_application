export function saveAuth({ token, role, name }) {
  localStorage.setItem('auth', JSON.stringify({ token, role, name }));
}
export function getAuth() {
  try { return JSON.parse(localStorage.getItem('auth')) || null; } catch { return null; }
}
export function clearAuth() {
  localStorage.removeItem('auth');
}
