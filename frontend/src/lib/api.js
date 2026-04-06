import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || '';

// Create axios instance
const api = axios.create({
    baseURL: `${API_BASE_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    logout: () => api.post('/auth/logout'),
    getMe: () => api.get('/auth/me'),
    updateMe: (data) => api.put('/auth/me', data),
};

// Users API (Admin)
export const usersAPI = {
    getAll: (params) => api.get('/users', { params }),
    getStats: () => api.get('/users/stats'),
    getPending: () => api.get('/users/pending'),
    getById: (id) => api.get(`/users/${id}`),
    update: (id, data) => api.put(`/users/${id}`, data),
    approve: (id) => api.post(`/users/${id}/approve`),
    suspend: (id) => api.post(`/users/${id}/suspend`),
    delete: (id) => api.delete(`/users/${id}`),
};

// Batches API
export const batchesAPI = {
    getAll: (params) => api.get('/batches', { params }),
    getStats: () => api.get('/batches/stats'),
    getById: (id) => api.get(`/batches/${id}`),
    create: (data) => api.post('/batches', data),
    update: (id, data) => api.put(`/batches/${id}`, data),
    delete: (id) => api.delete(`/batches/${id}`),
    getTraceability: (id) => api.get(`/batches/${id}/traceability`),
};

// Materials API
export const materialsAPI = {
    getAll: (params) => api.get('/materials', { params }),
    getById: (id) => api.get(`/materials/${id}`),
    create: (data) => api.post('/materials', data),
    update: (id, data) => api.put(`/materials/${id}`, data),
    delete: (id) => api.delete(`/materials/${id}`),
};

// Production API
export const productionAPI = {
    getAll: (params) => api.get('/production', { params }),
    getById: (id) => api.get(`/production/${id}`),
    create: (data) => api.post('/production', data),
    update: (id, data) => api.put(`/production/${id}`, data),
    complete: (id, data) => api.post(`/production/${id}/complete`, null, { params: data }),
};

// Shipments API
export const shipmentsAPI = {
    getAll: (params) => api.get('/shipments', { params }),
    getById: (id) => api.get(`/shipments/${id}`),
    create: (data) => api.post('/shipments', data),
    update: (id, data) => api.put(`/shipments/${id}`, data),
    updateStatus: (id, status, notes) => api.post(`/shipments/${id}/track`, null, { params: { new_status: status, notes } }),
};

// Audits API
export const auditsAPI = {
    getAll: (params) => api.get('/audits', { params }),
    getAssigned: () => api.get('/audits/assigned'),
    getById: (id) => api.get(`/audits/${id}`),
    create: (data) => api.post('/audits', data),
    request: (batchId, auditType, notes) => api.post('/audits/request', null, { params: { batch_id: batchId, audit_type: auditType, notes } }),
    start: (id) => api.post(`/audits/${id}/start`),
    addFinding: (id, data) => api.post(`/audits/${id}/finding`, null, { params: data }),
    approve: (id, complianceScore, notes) => api.post(`/audits/${id}/approve`, null, { params: { compliance_score: complianceScore, notes } }),
    reject: (id, reason) => api.post(`/audits/${id}/reject`, null, { params: { reason } }),
};

// Dashboard API
export const dashboardAPI = {
    getAdmin: () => api.get('/dashboard/admin'),
    getManufacturer: () => api.get('/dashboard/manufacturer'),
    getBrand: () => api.get('/dashboard/brand'),
    getAuditor: () => api.get('/dashboard/auditor'),
    getActivity: (params) => api.get('/dashboard/activity', { params }),
    getAlerts: (params) => api.get('/dashboard/alerts', { params }),
};

// Reports API
export const reportsAPI = {
    getBatchTraceability: (batchId) => api.get(`/reports/batch-traceability/${batchId}`),
    getMaterialBalance: (manufacturerId) => api.get('/reports/material-balance', { params: { manufacturer_id: manufacturerId } }),
    getComplianceCertificate: (batchId) => api.get(`/reports/compliance-certificate/${batchId}`),
    exportBatches: (status) => api.get('/reports/export/batches', { params: { status }, responseType: 'blob' }),
    exportTransactions: (batchId) => api.get('/reports/export/transactions', { params: { batch_id: batchId }, responseType: 'blob' }),
    getAnalyticsOverview: () => api.get('/reports/analytics/overview'),
};

// Suppliers API
// Note: Using trailing slashes to match FastAPI route definitions
export const suppliersAPI = {
    getAll: (params) => api.get('/suppliers/', { params }),
    getStats: () => api.get('/suppliers/stats'),
    getById: (id) => api.get(`/suppliers/${id}`),
    create: (data) => api.post('/suppliers/', data),
    update: (id, data) => api.put(`/suppliers/${id}`, data),
    delete: (id) => api.delete(`/suppliers/${id}`),
    activate: (id) => api.post(`/suppliers/${id}/activate`),
    deactivate: (id) => api.post(`/suppliers/${id}/deactivate`),
    lock: (id, reason) => api.post(`/suppliers/${id}/lock`, null, { params: { reason } }),
    unlock: (id) => api.post(`/suppliers/${id}/unlock`),
    getPerformance: (id) => api.get(`/suppliers/${id}/performance`),
};

// Purchase Orders API
// Note: Using trailing slashes to match FastAPI route definitions
export const purchaseOrdersAPI = {
    getAll: (params) => api.get('/purchase-orders/', { params }),
    getStats: () => api.get('/purchase-orders/stats'),
    getById: (id) => api.get(`/purchase-orders/${id}`),
    create: (data) => api.post('/purchase-orders/', data),
    accept: (id) => api.post(`/purchase-orders/${id}/accept`),
    reject: (id, reason) => api.post(`/purchase-orders/${id}/reject`, null, { params: { reason } }),
    updateStatus: (id, status, notes) => api.post(`/purchase-orders/${id}/status`, null, { params: { new_status: status, notes } }),
    lock: (id) => api.post(`/purchase-orders/${id}/lock`),
    unlock: (id) => api.post(`/purchase-orders/${id}/unlock`),
    getHistory: (id) => api.get(`/purchase-orders/${id}/history`),
};

// Seasons API
export const seasonsAPI = {
    getAll: (params) => api.get('/seasons/', { params }),
    getById: (id) => api.get(`/seasons/${id}`),
    create: (data) => api.post('/seasons/', data),
    update: (id, data) => api.put(`/seasons/${id}`, data),
    getStats: (id) => api.get(`/seasons/${id}/stats`),
    // Mood Boards
    getMoodBoards: (seasonId) => api.get(`/seasons/${seasonId}/mood-boards`),
    createMoodBoard: (seasonId, formData) => api.post(`/seasons/${seasonId}/mood-boards`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    getMoodBoard: (id) => api.get(`/seasons/mood-boards/${id}`),
    addMoodBoardImages: (id, formData) => api.post(`/seasons/mood-boards/${id}/images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    // Designs
    getDesigns: (seasonId, params) => api.get(`/seasons/${seasonId}/designs`, { params }),
    submitDesign: (seasonId, formData) => api.post(`/seasons/${seasonId}/designs`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    getDesign: (id) => api.get(`/seasons/designs/${id}`),
    selectDesigns: (seasonId, data) => api.post(`/seasons/${seasonId}/designs/select`, data),
    getDuplicates: (seasonId) => api.get(`/seasons/${seasonId}/designs/duplicates`),
};

export default api;
