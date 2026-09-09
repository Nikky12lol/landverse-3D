const _viteApi = (import.meta as any).env?.VITE_API_URL;
// Empty string means same-origin (used by the Docker/nginx build so one
// public URL serves both the UI and the API through the reverse proxy).
export const API_BASE_URL =
  _viteApi === undefined || _viteApi === null ? 'http://localhost:8000' : _viteApi;

export const config = {
  apiUrl: API_BASE_URL,
};
