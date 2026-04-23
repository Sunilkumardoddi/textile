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

// Brand Pages — existing
import SeasonManagement from '@/pages/brand/SeasonManagement';
import SeasonDetail from '@/pages/brand/SeasonDetail';
import ManufacturerCollection from '@/pages/brand/ManufacturerCollection';
import TraceabilityDashboard from '@/pages/brand/TraceabilityDashboard';
import POTraceabilityDetail from '@/pages/brand/POTraceabilityDetail';
import POReportsDashboard from '@/pages/brand/POReportsDashboard';
import IncomingDashboard from '@/pages/brand/IncomingDashboard';
import POIncomingDetail from '@/pages/brand/POIncomingDetail';
import SupplyChainCommandCenter from '@/pages/brand/SupplyChainCommandCenter';

// Brand Pages — Module A new screens
import SupplyChainSustainability from '@/pages/brand/SupplyChainSustainability';
import SustainabilityModule from '@/pages/brand/SustainabilityModule';
import CertificationTracker from '@/pages/brand/CertificationTracker';
import SupplierTraceabilityView from '@/pages/brand/SupplierTraceabilityView';
import SeasonBenchmark from '@/pages/brand/SeasonBenchmark';

// Brand Pages — Module C Season & PO Workflow
import SeasonMoodBoard from '@/pages/brand/SeasonMoodBoard';
import AIStyleEngine from '@/pages/brand/AIStyleEngine';
import SourcingCostingTracking from '@/pages/brand/SourcingCostingTracking';
import MoodBoardPunching from '@/pages/brand/MoodBoardPunching';
import POAutoGeneration from '@/pages/brand/POAutoGeneration';

// Brand Pages — PO & Supply Chain Management
import POSCManagement from '@/pages/brand/POSCManagement';
import POGarmentCosting from '@/pages/brand/POGarmentCosting';
import POInternalLotCreation from '@/pages/brand/POInternalLotCreation';
import POFitSamplesApproval from '@/pages/brand/POFitSamplesApproval';
import POWiseTraceability from '@/pages/brand/POWiseTraceability';
import POWiseSustainability from '@/pages/brand/POWiseSustainability';
import POQRScanVisibility from '@/pages/brand/POQRScanVisibility';

// Manufacturer Pages — sub-pages
import ManufacturerBatches from '@/pages/manufacturer/ManufacturerBatches';
import ManufacturerOrders from '@/pages/manufacturer/ManufacturerOrders';
import ManufacturerProduction from '@/pages/manufacturer/ManufacturerProduction';
import ManufacturerShipments from '@/pages/manufacturer/ManufacturerShipments';
import ManufacturerDocuments from '@/pages/manufacturer/ManufacturerDocuments';

// Manufacturer Pages — Module B new screens
import MfrDashboardOverview from '@/pages/manufacturer/MfrDashboardOverview';
import HiggFemCertifications from '@/pages/manufacturer/HiggFemCertifications';
import TraceabilityAuditorESS from '@/pages/manufacturer/TraceabilityAuditorESS';

// Admin Pages
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminBatches from '@/pages/admin/AdminBatches';
import AdminAudits from '@/pages/admin/AdminAudits';
import AdminReports from '@/pages/admin/AdminReports';
import AdminAlerts from '@/pages/admin/AdminAlerts';

// Brand Pages — Audits, Reports, Compliance
import BrandAudits from '@/pages/brand/BrandAudits';
import BrandReports from '@/pages/brand/BrandReports';
import BrandCompliance from '@/pages/brand/BrandCompliance';

// Auditor Pages
import AuditorAssigned from '@/pages/auditor/AuditorAssigned';
import AuditorBatches from '@/pages/auditor/AuditorBatches';
import AuditorReports from '@/pages/auditor/AuditorReports';
import AuditorAuditDetail from '@/pages/auditor/AuditorAuditDetail';

import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { user, loading, isAuthenticated } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role?.toLowerCase())) {
        return <Navigate to={`/dashboard/${user?.role?.toLowerCase()}`} replace />;
    }

    return children;
};

// Public Route - redirect to dashboard if already logged in
const PublicRoute = ({ children }) => {
    const { user, loading, isAuthenticated } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400"></div>
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
            <Route path="/login"    element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

            {/* Admin Routes */}
            <Route path="/dashboard/admin" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout><AdminDashboard /></DashboardLayout></ProtectedRoute>} />
            <Route path="/dashboard/admin/users"   element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout><AdminUsers /></DashboardLayout></ProtectedRoute>} />
            <Route path="/dashboard/admin/batches" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout><AdminBatches /></DashboardLayout></ProtectedRoute>} />
            <Route path="/dashboard/admin/audits"  element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout><AdminAudits /></DashboardLayout></ProtectedRoute>} />
            <Route path="/dashboard/admin/reports" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout><AdminReports /></DashboardLayout></ProtectedRoute>} />
            <Route path="/dashboard/admin/alerts"  element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout><AdminAlerts /></DashboardLayout></ProtectedRoute>} />

            {/* Manufacturer Routes — existing */}
            <Route path="/dashboard/manufacturer" element={<ProtectedRoute allowedRoles={['admin', 'manufacturer']}><DashboardLayout><ManufacturerDashboard /></DashboardLayout></ProtectedRoute>} />
            <Route path="/dashboard/manufacturer/batches"    element={<ProtectedRoute allowedRoles={['admin', 'manufacturer']}><DashboardLayout><ManufacturerBatches /></DashboardLayout></ProtectedRoute>} />
            <Route path="/dashboard/manufacturer/batches/new" element={<ProtectedRoute allowedRoles={['admin', 'manufacturer']}><DashboardLayout><ManufacturerBatches /></DashboardLayout></ProtectedRoute>} />
            <Route path="/dashboard/manufacturer/batches/:id" element={<ProtectedRoute allowedRoles={['admin', 'manufacturer']}><DashboardLayout><ManufacturerBatches /></DashboardLayout></ProtectedRoute>} />
            <Route path="/dashboard/manufacturer/production" element={<ProtectedRoute allowedRoles={['admin', 'manufacturer']}><DashboardLayout><ManufacturerProduction /></DashboardLayout></ProtectedRoute>} />
            <Route path="/dashboard/manufacturer/shipments"  element={<ProtectedRoute allowedRoles={['admin', 'manufacturer']}><DashboardLayout><ManufacturerShipments /></DashboardLayout></ProtectedRoute>} />
            <Route path="/dashboard/manufacturer/documents"  element={<ProtectedRoute allowedRoles={['admin', 'manufacturer']}><DashboardLayout><ManufacturerDocuments /></DashboardLayout></ProtectedRoute>} />
            <Route path="/dashboard/manufacturer/orders"     element={<ProtectedRoute allowedRoles={['admin', 'manufacturer']}><DashboardLayout><ManufacturerOrders /></DashboardLayout></ProtectedRoute>} />

            {/* Manufacturer Routes — Module B new */}
            <Route path="/dashboard/manufacturer/overview"          element={<ProtectedRoute allowedRoles={['admin', 'manufacturer']}><DashboardLayout><MfrDashboardOverview /></DashboardLayout></ProtectedRoute>} />
            <Route path="/dashboard/manufacturer/higg-fem"          element={<ProtectedRoute allowedRoles={['admin', 'manufacturer']}><DashboardLayout><HiggFemCertifications /></DashboardLayout></ProtectedRoute>} />
            <Route path="/dashboard/manufacturer/traceability-ess"  element={<ProtectedRoute allowedRoles={['admin', 'manufacturer']}><DashboardLayout><TraceabilityAuditorESS /></DashboardLayout></ProtectedRoute>} />

            {/* Brand Routes — existing */}
            <Route path="/dashboard/brand" element={<ProtectedRoute allowedRoles={['admin', 'brand']}><DashboardLayout><BrandDashboard /></DashboardLayout></ProtectedRoute>} />
            <Route path="/dashboard/brand/traceability"                             element={<ProtectedRoute allowedRoles={['admin', 'brand']}><DashboardLayout><TraceabilityDashboard /></DashboardLayout></ProtectedRoute>} />
            <Route path="/dashboard/brand/traceability/:poId"                       element={<ProtectedRoute allowedRoles={['admin', 'brand']}><DashboardLayout><POTraceabilityDetail /></DashboardLayout></ProtectedRoute>} />
            <Route path="/dashboard/brand/po/:poId/reports"                         element={<ProtectedRoute allowedRoles={['admin', 'brand']}><DashboardLayout><POReportsDashboard /></DashboardLayout></ProtectedRoute>} />
            <Route path="/dashboard/brand/shipments"                                element={<ProtectedRoute allowedRoles={['admin', 'brand']}><DashboardLayout><IncomingDashboard /></DashboardLayout></ProtectedRoute>} />
            <Route path="/dashboard/brand/incoming"                                 element={<ProtectedRoute allowedRoles={['admin', 'brand']}><DashboardLayout><IncomingDashboard /></DashboardLayout></ProtectedRoute>} />
            <Route path="/dashboard/brand/incoming/po/:poId"                        element={<ProtectedRoute allowedRoles={['admin', 'brand']}><DashboardLayout><POIncomingDetail /></DashboardLayout></ProtectedRoute>} />
            <Route path="/dashboard/brand/command-center"                           element={<ProtectedRoute allowedRoles={['admin', 'brand']}><DashboardLayout><SupplyChainCommandCenter /></DashboardLayout></ProtectedRoute>} />
            <Route path="/dashboard/brand/audits"                                   element={<ProtectedRoute allowedRoles={['admin', 'brand']}><DashboardLayout><BrandAudits /></DashboardLayout></ProtectedRoute>} />
            <Route path="/dashboard/brand/reports"                                  element={<ProtectedRoute allowedRoles={['admin', 'brand']}><DashboardLayout><BrandReports /></DashboardLayout></ProtectedRoute>} />
            <Route path="/dashboard/brand/compliance"                               element={<ProtectedRoute allowedRoles={['admin', 'brand']}><DashboardLayout><BrandCompliance /></DashboardLayout></ProtectedRoute>} />
            <Route path="/dashboard/brand/seasons"                                  element={<ProtectedRoute allowedRoles={['admin', 'brand']}><DashboardLayout><SeasonManagement /></DashboardLayout></ProtectedRoute>} />
            <Route path="/dashboard/brand/seasons/:seasonId"                        element={<ProtectedRoute allowedRoles={['admin', 'brand']}><DashboardLayout><SeasonDetail /></DashboardLayout></ProtectedRoute>} />
            <Route path="/dashboard/brand/seasons/:seasonId/collections"            element={<ProtectedRoute allowedRoles={['admin', 'brand']}><DashboardLayout><ManufacturerCollection /></DashboardLayout></ProtectedRoute>} />
            <Route path="/dashboard/brand/seasons/:seasonId/collections/:collectionId" element={<ProtectedRoute allowedRoles={['admin', 'brand']}><DashboardLayout><ManufacturerCollection /></DashboardLayout></ProtectedRoute>} />

            {/* Brand Routes — Module A new sustainability screens */}
            <Route path="/dashboard/brand/sc-sustainability" element={<ProtectedRoute allowedRoles={['admin', 'brand']}><DashboardLayout><SupplyChainSustainability /></DashboardLayout></ProtectedRoute>} />
            <Route path="/dashboard/brand/sustainability"   element={<ProtectedRoute allowedRoles={['admin', 'brand']}><DashboardLayout><SustainabilityModule /></DashboardLayout></ProtectedRoute>} />
            <Route path="/dashboard/brand/certifications"   element={<ProtectedRoute allowedRoles={['admin', 'brand']}><DashboardLayout><CertificationTracker /></DashboardLayout></ProtectedRoute>} />
            <Route path="/dashboard/brand/supplier-trace"   element={<ProtectedRoute allowedRoles={['admin', 'brand']}><DashboardLayout><SupplierTraceabilityView /></DashboardLayout></ProtectedRoute>} />
            <Route path="/dashboard/brand/season-benchmark" element={<ProtectedRoute allowedRoles={['admin', 'brand']}><DashboardLayout><SeasonBenchmark /></DashboardLayout></ProtectedRoute>} />

            {/* Brand Routes — Module C Season & PO Workflow */}
            <Route path="/dashboard/brand/seasons/mood-board"   element={<ProtectedRoute allowedRoles={['admin', 'brand']}><DashboardLayout><SeasonMoodBoard /></DashboardLayout></ProtectedRoute>} />
            <Route path="/dashboard/brand/ai-style"             element={<ProtectedRoute allowedRoles={['admin', 'brand']}><DashboardLayout><AIStyleEngine /></DashboardLayout></ProtectedRoute>} />
            <Route path="/dashboard/brand/sourcing-costing"     element={<ProtectedRoute allowedRoles={['admin', 'brand']}><DashboardLayout><SourcingCostingTracking /></DashboardLayout></ProtectedRoute>} />
            <Route path="/dashboard/brand/mood-punching"        element={<ProtectedRoute allowedRoles={['admin', 'brand']}><DashboardLayout><MoodBoardPunching /></DashboardLayout></ProtectedRoute>} />
            <Route path="/dashboard/brand/po-auto"              element={<ProtectedRoute allowedRoles={['admin', 'brand']}><DashboardLayout><POAutoGeneration /></DashboardLayout></ProtectedRoute>} />

            {/* Brand Routes — PO & Supply Chain Management */}
            <Route path="/dashboard/brand/po-sc-management"    element={<ProtectedRoute allowedRoles={['admin', 'brand']}><DashboardLayout><POSCManagement /></DashboardLayout></ProtectedRoute>} />
            <Route path="/dashboard/brand/po-garment-costing"  element={<ProtectedRoute allowedRoles={['admin', 'brand']}><DashboardLayout><POGarmentCosting /></DashboardLayout></ProtectedRoute>} />
            <Route path="/dashboard/brand/po-fit-samples"       element={<ProtectedRoute allowedRoles={['admin', 'brand']}><DashboardLayout><POFitSamplesApproval /></DashboardLayout></ProtectedRoute>} />
            <Route path="/dashboard/brand/po-lot-creation"      element={<ProtectedRoute allowedRoles={['admin', 'brand']}><DashboardLayout><POInternalLotCreation /></DashboardLayout></ProtectedRoute>} />
            <Route path="/dashboard/brand/po-traceability"      element={<ProtectedRoute allowedRoles={['admin', 'brand']}><DashboardLayout><POWiseTraceability /></DashboardLayout></ProtectedRoute>} />
            <Route path="/dashboard/brand/po-sustainability"    element={<ProtectedRoute allowedRoles={['admin', 'brand']}><DashboardLayout><POWiseSustainability /></DashboardLayout></ProtectedRoute>} />
            <Route path="/dashboard/brand/po-qr-scan"           element={<ProtectedRoute allowedRoles={['admin', 'brand']}><DashboardLayout><POQRScanVisibility /></DashboardLayout></ProtectedRoute>} />

            {/* Auditor Routes */}
            <Route path="/dashboard/auditor"           element={<ProtectedRoute allowedRoles={['admin', 'auditor']}><DashboardLayout><AuditorDashboard /></DashboardLayout></ProtectedRoute>} />
            <Route path="/dashboard/auditor/assigned"  element={<ProtectedRoute allowedRoles={['admin', 'auditor']}><DashboardLayout><AuditorAssigned /></DashboardLayout></ProtectedRoute>} />
            <Route path="/dashboard/auditor/batches"   element={<ProtectedRoute allowedRoles={['admin', 'auditor']}><DashboardLayout><AuditorBatches /></DashboardLayout></ProtectedRoute>} />
            <Route path="/dashboard/auditor/reports"   element={<ProtectedRoute allowedRoles={['admin', 'auditor']}><DashboardLayout><AuditorReports /></DashboardLayout></ProtectedRoute>} />
            <Route path="/dashboard/auditor/audit/:id" element={<ProtectedRoute allowedRoles={['admin', 'auditor']}><DashboardLayout><AuditorAuditDetail /></DashboardLayout></ProtectedRoute>} />

            {/* Default redirect */}
            <Route path="/"  element={<Navigate to="/login" replace />} />
            <Route path="*"  element={<Navigate to="/login" replace />} />
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
