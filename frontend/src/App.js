import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";

// Pages
import LoginPage from "@/pages/LoginPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import RoleSelectionPage from "@/pages/RoleSelectionPage";
import SignUpPage from "@/pages/SignUpPage";
import BrandDashboard from "@/pages/dashboards/BrandDashboard";
import AuditorDashboard from "@/pages/dashboards/AuditorDashboard";
import AdminDashboard from "@/pages/dashboards/AdminDashboard";

// Manufacturer Module
import ManufacturerLayout from "@/pages/manufacturer/ManufacturerLayout";
import ManufacturerOverview from "@/pages/manufacturer/ManufacturerOverview";
import FactoryProfile from "@/pages/manufacturer/FactoryProfile";
import ProductionCapabilities from "@/pages/manufacturer/ProductionCapabilities";
import Orders from "@/pages/manufacturer/Orders";
import TraceabilityFlow from "@/pages/manufacturer/TraceabilityFlow";
import TraceabilityTree from "@/pages/manufacturer/TraceabilityTree";
import Certifications from "@/pages/manufacturer/Certifications";
import Documents from "@/pages/manufacturer/Documents";
import AuditResponses from "@/pages/manufacturer/AuditResponses";
import Alerts from "@/pages/manufacturer/Alerts";
import ProductCreation from "@/pages/manufacturer/ProductCreation";

// Buyer Module - DEPRECATED (redirects to Brand)
// All Buyer functionality is now consolidated into Brand Dashboard
// Keeping imports for backward compatibility redirects

// Consumer Module
import QrStoryPage from "@/pages/consumer/QrStoryPage";

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = JSON.parse(localStorage.getItem('textileUser') || 'null');
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={`/dashboard/${user.role}`} replace />;
  }
  
  return children;
};

// Dashboard Router - redirects to role-specific dashboard
const DashboardRouter = () => {
  const user = JSON.parse(localStorage.getItem('textileUser') || 'null');
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <Navigate to={`/dashboard/${user.role}`} replace />;
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/roles" element={<RoleSelectionPage />} />
          <Route path="/signup/:role" element={<SignUpPage />} />
          
          {/* Dashboard Router */}
          <Route path="/dashboard" element={<DashboardRouter />} />
          
          {/* Role-based Dashboards */}
          <Route 
            path="/dashboard/brand" 
            element={
              <ProtectedRoute allowedRoles={['brand']}>
                <BrandDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Manufacturer Module with nested routes */}
          <Route 
            path="/manufacturer" 
            element={
              <ProtectedRoute allowedRoles={['manufacturer']}>
                <ManufacturerLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<ManufacturerOverview />} />
            <Route path="profile" element={<FactoryProfile />} />
            <Route path="capabilities" element={<ProductionCapabilities />} />
            <Route path="orders" element={<Orders />} />
            <Route path="traceability" element={<TraceabilityFlow />} />
            <Route path="traceability-tree" element={<TraceabilityTree />} />
            <Route path="certifications" element={<Certifications />} />
            <Route path="documents" element={<Documents />} />
            <Route path="audits" element={<AuditResponses />} />
            <Route path="alerts" element={<Alerts />} />
            <Route path="create-product/:poId" element={<ProductCreation />} />
          </Route>
          
          {/* Buyer Module with nested routes */}
          <Route 
            path="/buyer" 
            element={
              <ProtectedRoute allowedRoles={['buyer']}>
                <BuyerLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<BuyerOverview />} />
            <Route path="orders" element={<BuyerOrders />} />
            <Route path="traceability" element={<BuyerTraceability />} />
            <Route path="analytics" element={<BuyerAnalytics />} />
            <Route path="delays" element={<DelayReports />} />
            <Route path="reports" element={<BuyerReports />} />
          </Route>
          
          {/* Legacy buyer dashboard redirect */}
          <Route 
            path="/dashboard/buyer" 
            element={<Navigate to="/buyer" replace />}
          />
          
          {/* Consumer Routes (Public - QR Code Access) */}
          <Route path="/product/:productId" element={<QrStoryPage />} />
          <Route path="/trace/:traceId" element={<QrStoryPage />} />
          
          {/* Legacy manufacturer dashboard redirect */}
          <Route 
            path="/dashboard/manufacturer" 
            element={<Navigate to="/manufacturer" replace />}
          />
          
          <Route 
            path="/dashboard/auditor" 
            element={
              <ProtectedRoute allowedRoles={['auditor']}>
                <AuditorDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/admin" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
      
      {/* Toast Notifications */}
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            color: 'hsl(var(--foreground))',
          },
        }}
      />
    </div>
  );
}

export default App;
