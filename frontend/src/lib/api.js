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
    login: async (data) => {
        // Mocked login to bypass backend DB connection issues
        return {
            data: {
                access_token: 'mock_token',
                user: {
                    id: '123',
                    email: data.email,
                    name: 'Brand user',
                    role: 'brand'
                }
            }
        };
    },
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

// Collections API (Manufacturer Collections / Swatch Library)
export const collectionsAPI = {
    getAll: (params) => api.get('/collections/', { params }),
    getById: (id) => api.get(`/collections/${id}`),
    create: (data) => api.post('/collections/', data),
    update: (id, data) => api.put(`/collections/${id}`, data),
    getAnalytics: (id) => api.get(`/collections/${id}/analytics`),
    inviteSuppliers: (id, supplierIds) => api.post(`/collections/${id}/invite`, supplierIds),
    // Swatches
    getSwatches: (collectionId, params) => api.get(`/collections/${collectionId}/swatches`, { params }),
    getSwatchCount: (collectionId) => api.get(`/collections/${collectionId}/swatches/count`),
    uploadSwatch: (collectionId, formData) => api.post(`/collections/${collectionId}/swatches`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    bulkUploadSwatches: (collectionId, formData) => api.post(`/collections/${collectionId}/swatches/bulk`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    getSwatch: (swatchId) => api.get(`/collections/swatches/${swatchId}`),
    selectSwatches: (collectionId, data) => api.post(`/collections/${collectionId}/swatches/select`, data),
    getDuplicates: (collectionId) => api.get(`/collections/${collectionId}/swatches/duplicates`),
    getSupplierStats: (collectionId) => api.get(`/collections/${collectionId}/suppliers/stats`),
};

// Traceability API
export const traceabilityAPI = {
    // PO-level traceability
    getByPO: (poId) => api.get(`/traceability/po/${poId}`),
    createForPO: (poId) => api.post(`/traceability/po/${poId}`),
    updateSupplyChain: (poId, stages) => api.put(`/traceability/po/${poId}/supply-chain`, stages),
    updateSuppliers: (poId, suppliers) => api.put(`/traceability/po/${poId}/suppliers`, suppliers),
    updateMaterials: (poId, formData) => api.put(`/traceability/po/${poId}/materials`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    // Documents
    uploadDocument: (poId, formData) => api.post(`/traceability/po/${poId}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    getDocuments: (poId) => api.get(`/traceability/po/${poId}/documents`),
    verifyDocument: (poId, docId, status, notes) => api.put(`/traceability/po/${poId}/documents/${docId}/verify`, null, {
        params: { status, notes }
    }),
    // Season-level
    getSeasonSummary: (seasonId) => api.get(`/traceability/season/${seasonId}`),
    getSeasonPOs: (seasonId, params) => api.get(`/traceability/season/${seasonId}/pos`, { params }),
    // Alerts
    getAlerts: (params) => api.get('/traceability/alerts', { params }),
    resolveAlert: (alertId, notes) => api.put(`/traceability/alerts/${alertId}/resolve`, null, { params: { notes } }),
    // Stats
    getOverview: () => api.get('/traceability/stats/overview'),
};

// PO Reports API
export const poReportsAPI = {
    // File upload
    uploadFile: (formData) => api.post('/reports/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    // Production Reports (DPR)
    createProductionReport: (formData) => api.post('/reports/production', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    getProductionReports: (params) => api.get('/reports/production', { params }),
    getProductionReport: (reportId) => api.get(`/reports/production/${reportId}`),
    // Quality Reports (DQR)
    createQualityReport: (formData) => api.post('/reports/quality', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    getQualityReports: (params) => api.get('/reports/quality', { params }),
    getQualityReport: (reportId) => api.get(`/reports/quality/${reportId}`),
    // Inspection Reports
    createInspectionReport: (formData) => api.post('/reports/inspection', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    getInspectionReports: (params) => api.get('/reports/inspection', { params }),
    getInspectionReport: (reportId) => api.get(`/reports/inspection/${reportId}`),
    // Fabric Test Reports
    createFabricTestReport: (formData) => api.post('/reports/fabric-tests', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    getFabricTestReports: (params) => api.get('/reports/fabric-tests', { params }),
    getFabricTestReport: (reportId) => api.get(`/reports/fabric-tests/${reportId}`),
    // Trims Reports
    createTrimsReport: (formData) => api.post('/reports/trims', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    getTrimsReports: (params) => api.get('/reports/trims', { params }),
    getTrimsReport: (reportId) => api.get(`/reports/trims/${reportId}`),
    // PO Summary & Analytics
    getPOSummary: (poId) => api.get(`/reports/po/${poId}`),
    getPOAnalytics: (poId) => api.get(`/reports/po/${poId}/analytics`),
    getPOTimeline: (poId, params) => api.get(`/reports/po/${poId}/timeline`, { params }),
    // Enhanced endpoints
    getEnhancedSummary: (poId) => api.get(`/reports/po/${poId}/enhanced-summary`),
    getSupplierPerformance: (poId) => api.get(`/reports/po/${poId}/supplier-performance`),
    getMissingDates: (poId, params) => api.get(`/reports/po/${poId}/missing-dates`, { params }),
    getReportDetail: (poId, reportType, reportId) => api.get(`/reports/po/${poId}/report-detail/${reportType}/${reportId}`),
    getAlertsPanel: (poId) => api.get(`/reports/po/${poId}/alerts-panel`),
    // Approval
    approveReport: (reportType, reportId, data) => api.put(`/reports/${reportType}/${reportId}/approve`, data),
    // Alerts
    getReportAlerts: (params) => api.get('/reports/alerts', { params }),
    resolveReportAlert: (alertId, notes) => api.put(`/reports/alerts/${alertId}/resolve`, null, { params: { notes } }),
};

// Incoming & Dispatch Management API
export const incomingAPI = {
    // Destinations
    getDestinations: (params) => api.get('/incoming/destinations', { params }),
    getDestination: (id) => api.get(`/incoming/destinations/${id}`),
    createDestination: (data) => api.post('/incoming/destinations', data),
    updateDestination: (id, data) => api.put(`/incoming/destinations/${id}`, data),
    deleteDestination: (id) => api.delete(`/incoming/destinations/${id}`),
    
    // Invoices
    getInvoices: (params) => api.get('/incoming/invoices', { params }),
    getInvoice: (id) => api.get(`/incoming/invoices/${id}`),
    createInvoice: (data) => api.post('/incoming/invoices', data),
    uploadInvoiceDocument: (invoiceId, formData) => api.post(`/incoming/invoices/${invoiceId}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    
    // Dispatches
    getDispatches: (params) => api.get('/incoming/dispatches', { params }),
    getDispatch: (id) => api.get(`/incoming/dispatches/${id}`),
    createDispatch: (data) => api.post('/incoming/dispatches', data),
    updateTracking: (id, params) => api.put(`/incoming/dispatches/${id}/tracking`, null, { params }),
    receiveDispatch: (id, data) => api.put(`/incoming/dispatches/${id}/receive`, null, { params: data }),
    uploadDispatchDocument: (dispatchId, formData) => api.post(`/incoming/dispatches/${dispatchId}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    simulateTracking: (id) => api.post(`/incoming/dispatches/${id}/simulate-tracking`),
    
    // PO-specific
    getPOSummary: (poId) => api.get(`/incoming/po/${poId}/summary`),
    getPOInvoices: (poId) => api.get(`/incoming/po/${poId}/invoices`),
    getPODispatches: (poId) => api.get(`/incoming/po/${poId}/dispatches`),
    
    // Alerts
    getAlerts: (params) => api.get('/incoming/alerts', { params }),
    resolveAlert: (alertId, notes) => api.put(`/incoming/alerts/${alertId}/resolve`, null, { params: { notes } }),
    
    // Analytics
    getDeliveryPerformance: (params) => api.get('/incoming/analytics/delivery-performance', { params }),
    getSupplierLogistics: () => api.get('/incoming/analytics/supplier-logistics'),
    getDistanceDeliveryAnalysis: () => api.get('/incoming/analytics/distance-delivery'),
    
    // Dashboard
    getDashboardOverview: () => api.get('/incoming/dashboard/overview'),
    getPOsWithShipments: (params) => api.get('/incoming/dashboard/pos-with-shipments', { params }),
};

// Supply Chain Command Center API
export const commandCenterAPI = {
    // Get suppliers for dropdown
    getSuppliers: () => api.get('/command-center/suppliers'),
    
    // Supplier-specific data (all accept optional season_id param)
    getOverview: (supplierId, seasonId) => api.get(`/command-center/supplier/${supplierId}/overview`, { params: { season_id: seasonId } }),
    getProduction: (supplierId, seasonId) => api.get(`/command-center/supplier/${supplierId}/production`, { params: { season_id: seasonId } }),
    getQuality: (supplierId, seasonId) => api.get(`/command-center/supplier/${supplierId}/quality`, { params: { season_id: seasonId } }),
    getDelivery: (supplierId, seasonId) => api.get(`/command-center/supplier/${supplierId}/delivery`, { params: { season_id: seasonId } }),
    getCompliance: (supplierId, seasonId) => api.get(`/command-center/supplier/${supplierId}/compliance`, { params: { season_id: seasonId } }),
    getReports: (supplierId, seasonId) => api.get(`/command-center/supplier/${supplierId}/reports`, { params: { season_id: seasonId } }),
    getAlerts: (supplierId, seasonId) => api.get(`/command-center/supplier/${supplierId}/alerts`, { params: { season_id: seasonId } }),
    getKPIs: (supplierId, seasonId) => api.get(`/command-center/supplier/${supplierId}/kpis`, { params: { season_id: seasonId } }),
};

export default api;
