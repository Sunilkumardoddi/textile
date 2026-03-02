import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

// Auth Pages
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';

// Layout
import DashboardLayout from '@/components/layouts/DashboardLayout';

// Dashboards
import AdminDashboard from '@/pages/dashboards/AdminDashboard';
import ManufacturerDashboard from '@/pages/dashboards/ManufacturerDashboard';
import BrandDashboard from '@/pages/dashboards/BrandDashboard';
import AuditorDashboard from '@/pages/dashboards/AuditorDashboard';

import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { user, loading, isAuthenticated } = useAuth();
    
    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
            </div>
        );
    }
    
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    
    if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
        return <Navigate to={`/dashboard/${user?.role}`} replace />;
    }
    
    return children;
};

// Public Route - redirect to dashboard if already logged in
const PublicRoute = ({ children }) => {
    const { user, loading, isAuthenticated } = useAuth();
    
    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
            </div>
        );
    }
    
    if (isAuthenticated) {
        return <Navigate to={`/dashboard/${user?.role}`} replace />;
    }
    
    return children;
};

// Placeholder for pages not yet implemented
const ComingSoon = ({ title }) => (
    <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="text-6xl mb-4">🚧</div>
        <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
        <p className="text-slate-400">This feature is coming soon!</p>
    </div>
);

function AppRoutes() {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
            
            {/* Admin Routes */}
            <Route path="/dashboard/admin" element={
                <ProtectedRoute allowedRoles={['admin']}>
                    <DashboardLayout><AdminDashboard /></DashboardLayout>
                </ProtectedRoute>
            } />
            <Route path="/dashboard/admin/users" element={
                <ProtectedRoute allowedRoles={['admin']}>
                    <DashboardLayout><ComingSoon title="User Management" /></DashboardLayout>
                </ProtectedRoute>
            } />
            <Route path="/dashboard/admin/batches" element={
                <ProtectedRoute allowedRoles={['admin']}>
                    <DashboardLayout><ComingSoon title="All Batches" /></DashboardLayout>
                </ProtectedRoute>
            } />
            <Route path="/dashboard/admin/audits" element={
                <ProtectedRoute allowedRoles={['admin']}>
                    <DashboardLayout><ComingSoon title="All Audits" /></DashboardLayout>
                </ProtectedRoute>
            } />
            <Route path="/dashboard/admin/reports" element={
                <ProtectedRoute allowedRoles={['admin']}>
                    <DashboardLayout><ComingSoon title="Reports" /></DashboardLayout>
                </ProtectedRoute>
            } />
            <Route path="/dashboard/admin/alerts" element={
                <ProtectedRoute allowedRoles={['admin']}>
                    <DashboardLayout><ComingSoon title="Alerts" /></DashboardLayout>
                </ProtectedRoute>
            } />
            
            {/* Manufacturer Routes */}
            <Route path="/dashboard/manufacturer" element={
                <ProtectedRoute allowedRoles={['admin', 'manufacturer']}>
                    <DashboardLayout><ManufacturerDashboard /></DashboardLayout>
                </ProtectedRoute>
            } />
            <Route path="/dashboard/manufacturer/batches" element={
                <ProtectedRoute allowedRoles={['admin', 'manufacturer']}>
                    <DashboardLayout><ComingSoon title="Batches" /></DashboardLayout>
                </ProtectedRoute>
            } />
            <Route path="/dashboard/manufacturer/batches/new" element={
                <ProtectedRoute allowedRoles={['admin', 'manufacturer']}>
                    <DashboardLayout><ComingSoon title="Create Batch" /></DashboardLayout>
                </ProtectedRoute>
            } />
            <Route path="/dashboard/manufacturer/batches/:id" element={
                <ProtectedRoute allowedRoles={['admin', 'manufacturer']}>
                    <DashboardLayout><ComingSoon title="Batch Details" /></DashboardLayout>
                </ProtectedRoute>
            } />
            <Route path="/dashboard/manufacturer/production" element={
                <ProtectedRoute allowedRoles={['admin', 'manufacturer']}>
                    <DashboardLayout><ComingSoon title="Production" /></DashboardLayout>
                </ProtectedRoute>
            } />
            <Route path="/dashboard/manufacturer/shipments" element={
                <ProtectedRoute allowedRoles={['admin', 'manufacturer']}>
                    <DashboardLayout><ComingSoon title="Shipments" /></DashboardLayout>
                </ProtectedRoute>
            } />
            <Route path="/dashboard/manufacturer/documents" element={
                <ProtectedRoute allowedRoles={['admin', 'manufacturer']}>
                    <DashboardLayout><ComingSoon title="Documents" /></DashboardLayout>
                </ProtectedRoute>
            } />
            
            {/* Brand Routes */}
            <Route path="/dashboard/brand" element={
                <ProtectedRoute allowedRoles={['admin', 'brand']}>
                    <DashboardLayout><BrandDashboard /></DashboardLayout>
                </ProtectedRoute>
            } />
            <Route path="/dashboard/brand/traceability" element={
                <ProtectedRoute allowedRoles={['admin', 'brand']}>
                    <DashboardLayout><ComingSoon title="Traceability" /></DashboardLayout>
                </ProtectedRoute>
            } />
            <Route path="/dashboard/brand/shipments" element={
                <ProtectedRoute allowedRoles={['admin', 'brand']}>
                    <DashboardLayout><ComingSoon title="Incoming Shipments" /></DashboardLayout>
                </ProtectedRoute>
            } />
            <Route path="/dashboard/brand/audits" element={
                <ProtectedRoute allowedRoles={['admin', 'brand']}>
                    <DashboardLayout><ComingSoon title="Audit Requests" /></DashboardLayout>
                </ProtectedRoute>
            } />
            <Route path="/dashboard/brand/reports" element={
                <ProtectedRoute allowedRoles={['admin', 'brand']}>
                    <DashboardLayout><ComingSoon title="Reports" /></DashboardLayout>
                </ProtectedRoute>
            } />
            
            {/* Auditor Routes */}
            <Route path="/dashboard/auditor" element={
                <ProtectedRoute allowedRoles={['admin', 'auditor']}>
                    <DashboardLayout><AuditorDashboard /></DashboardLayout>
                </ProtectedRoute>
            } />
            <Route path="/dashboard/auditor/assigned" element={
                <ProtectedRoute allowedRoles={['admin', 'auditor']}>
                    <DashboardLayout><ComingSoon title="Assigned Audits" /></DashboardLayout>
                </ProtectedRoute>
            } />
            <Route path="/dashboard/auditor/batches" element={
                <ProtectedRoute allowedRoles={['admin', 'auditor']}>
                    <DashboardLayout><ComingSoon title="Batch Verification" /></DashboardLayout>
                </ProtectedRoute>
            } />
            <Route path="/dashboard/auditor/reports" element={
                <ProtectedRoute allowedRoles={['admin', 'auditor']}>
                    <DashboardLayout><ComingSoon title="Audit Reports" /></DashboardLayout>
                </ProtectedRoute>
            } />
            <Route path="/dashboard/auditor/audit/:id" element={
                <ProtectedRoute allowedRoles={['admin', 'auditor']}>
                    <DashboardLayout><ComingSoon title="Audit Details" /></DashboardLayout>
                </ProtectedRoute>
            } />
            
            {/* Supplier Routes */}
            <Route path="/dashboard/supplier" element={
                <ProtectedRoute allowedRoles={['admin', 'supplier']}>
                    <DashboardLayout><SupplierDashboard /></DashboardLayout>
                </ProtectedRoute>
            } />
            <Route path="/dashboard/supplier/orders" element={
                <ProtectedRoute allowedRoles={['admin', 'supplier']}>
                    <DashboardLayout><ComingSoon title="Purchase Orders" /></DashboardLayout>
                </ProtectedRoute>
            } />
            <Route path="/dashboard/supplier/shipments" element={
                <ProtectedRoute allowedRoles={['admin', 'supplier']}>
                    <DashboardLayout><ComingSoon title="Shipments" /></DashboardLayout>
                </ProtectedRoute>
            } />
            <Route path="/dashboard/supplier/documents" element={
                <ProtectedRoute allowedRoles={['admin', 'supplier']}>
                    <DashboardLayout><ComingSoon title="Documents" /></DashboardLayout>
                </ProtectedRoute>
            } />
            <Route path="/dashboard/supplier/performance" element={
                <ProtectedRoute allowedRoles={['admin', 'supplier']}>
                    <DashboardLayout><ComingSoon title="Performance Metrics" /></DashboardLayout>
                </ProtectedRoute>
            } />
            
            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
}

function App() {
    return (
        <Router>
            <AuthProvider>
                <AppRoutes />
                <Toaster position="top-right" richColors />
            </AuthProvider>
        </Router>
    );
}

export default App;
