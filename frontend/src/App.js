import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";

// Pages
import LoginPage from "@/pages/LoginPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import BrandDashboard from "@/pages/dashboards/BrandDashboard";
import ManufacturerDashboard from "@/pages/dashboards/ManufacturerDashboard";
import AuditorDashboard from "@/pages/dashboards/AuditorDashboard";
import AdminDashboard from "@/pages/dashboards/AdminDashboard";

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
          <Route 
            path="/dashboard/manufacturer" 
            element={
              <ProtectedRoute allowedRoles={['manufacturer']}>
                <ManufacturerDashboard />
              </ProtectedRoute>
            } 
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
