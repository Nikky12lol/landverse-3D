export const API_BASE_URL =
  (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';

export const config = {
  apiUrl: API_BASE_URL,
};
