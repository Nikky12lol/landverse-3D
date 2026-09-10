const _viteApi = (import.meta as any).env?.VITE_API_URL;
// Priority: runtime hook (/config.js, set by cloud hosts) > build-time
// VITE_API_URL ("" means same-origin) > localhost dev default.
const _runtimeApi =
  typeof window !== "undefined" ? (window as any).__LANDVERSE_API_URL__ : undefined;
export const API_BASE_URL =
  _runtimeApi ||
  (_viteApi === undefined || _viteApi === null ? 'http://localhost:8000' : _viteApi);

export const config = {
  apiUrl: API_BASE_URL,
};
