import axios from 'axios';
import { config } from '../config';

const apiClient = axios.create({
  baseURL: config.apiUrl,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error('API Error:', err?.response?.data || err.message);
    return Promise.reject(err);
  }
);

export const api = {
  health: () => apiClient.get('/health').then((r) => r.data),
  stats: () => apiClient.get('/stats/dashboard').then((r) => r.data),
  parcels: () => apiClient.get('/parcels/').then((r) => r.data),
  parcel: (id: number) => apiClient.get(`/parcels/${id}`).then((r) => r.data),
  createParcel: (d: any) => apiClient.post('/parcels/', d).then((r) => r.data),
  buildings: (parcelId?: number) =>
    apiClient.get('/buildings/', { params: parcelId ? { parcel_id: parcelId } : {} }).then((r) => r.data),
  building: (id: number) => apiClient.get(`/buildings/${id}`).then((r) => r.data),
  hierarchy: (id: number) => apiClient.get(`/buildings/${id}/hierarchy`).then((r) => r.data),
  createBuilding: (d: any) => apiClient.post('/buildings/', d).then((r) => r.data),
  updateBuilding: (id: number, d: any) => apiClient.put(`/buildings/${id}`, d).then((r) => r.data),
  deleteBuilding: (id: number) => apiClient.delete(`/buildings/${id}`).then((r) => r.data),
  floors: (buildingId: number) => apiClient.get(`/buildings/${buildingId}/floors`).then((r) => r.data),
  units: (floorId: number) => apiClient.get(`/units/floors/${floorId}/units`).then((r) => r.data),
  createUnit: (floorId: number, d: any) => apiClient.post(`/units/floors/${floorId}/units`, d).then((r) => r.data),
  ulpins: () => apiClient.get('/ulpin/').then((r) => r.data),
  generateUlpin: (d: any) => apiClient.post('/ulpin/generate', d).then((r) => r.data),
  validateUlpin: (code: string) => apiClient.post('/ulpin/validate', { code }).then((r) => r.data),
  upload: (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    return apiClient.post('/analysis/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data);
  },
  runAnalysis: (d: any) => apiClient.post('/analysis/run', d).then((r) => r.data),
  jobs: () => apiClient.get('/analysis/').then((r) => r.data),
  runValidation: (building_id: number) => apiClient.post('/validation/run', { building_id }).then((r) => r.data),
  validations: () => apiClient.get('/validation/').then((r) => r.data),
  infra: () => apiClient.get('/infrastructure/').then((r) => r.data),
  createInfra: (d: any) => apiClient.post('/infrastructure/', d).then((r) => r.data),
  checkConflict: (d: any) => apiClient.post('/infrastructure/check-conflict', d).then((r) => r.data),
};

export default apiClient;
