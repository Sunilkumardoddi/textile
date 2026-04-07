import React from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { 
    Globe, LogOut, Bell, Menu, X,
    LayoutDashboard, Users, Package, Factory, Truck, 
    ClipboardCheck, BarChart3, FileText, AlertTriangle, Settings,
    Building2, ShoppingCart, Calendar, Layers, Palette, Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useState } from 'react';

const DashboardLayout = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        toast.success('Logged out successfully');
        navigate('/login');
    };

    // Navigation items based on role
    const getNavItems = () => {
        const baseItems = [
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: `/dashboard/${user?.role}` },
        ];

        const roleItems = {
            admin: [
                { id: 'users', label: 'User Management', icon: Users, path: '/dashboard/admin/users' },
                { id: 'batches', label: 'All Batches', icon: Package, path: '/dashboard/admin/batches' },
                { id: 'audits', label: 'All Audits', icon: ClipboardCheck, path: '/dashboard/admin/audits' },
                { id: 'reports', label: 'Reports', icon: BarChart3, path: '/dashboard/admin/reports' },
                { id: 'alerts', label: 'Alerts', icon: AlertTriangle, path: '/dashboard/admin/alerts', badge: 3 },
            ],
            manufacturer: [
                { id: 'batches', label: 'My Batches', icon: Package, path: '/dashboard/manufacturer/batches' },
                { id: 'orders', label: 'Purchase Orders', icon: ShoppingCart, path: '/dashboard/manufacturer/orders' },
                { id: 'production', label: 'Production', icon: Factory, path: '/dashboard/manufacturer/production' },
                { id: 'shipments', label: 'Shipments', icon: Truck, path: '/dashboard/manufacturer/shipments' },
                { id: 'documents', label: 'Documents', icon: FileText, path: '/dashboard/manufacturer/documents' },
            ],
            brand: [
                { id: 'seasons', label: 'Seasons', icon: Calendar, path: '/dashboard/brand/seasons' },
                { id: 'traceability', label: 'Traceability', icon: Layers, path: '/dashboard/brand/traceability' },
                { id: 'shipments', label: 'Incoming', icon: Truck, path: '/dashboard/brand/shipments' },
                { id: 'command-center', label: 'Command Center', icon: Activity, path: '/dashboard/brand/command-center' },
                { id: 'audits', label: 'Audit Requests', icon: ClipboardCheck, path: '/dashboard/brand/audits' },
                { id: 'reports', label: 'Reports', icon: BarChart3, path: '/dashboard/brand/reports' },
            ],
            auditor: [
                { id: 'assigned', label: 'Assigned Audits', icon: ClipboardCheck, path: '/dashboard/auditor/assigned' },
                { id: 'batches', label: 'Batch Verification', icon: Package, path: '/dashboard/auditor/batches' },
                { id: 'reports', label: 'Audit Reports', icon: FileText, path: '/dashboard/auditor/reports' },
            ],
        };

        return [...baseItems, ...(roleItems[user?.role] || [])];
    };

    const navItems = getNavItems();
    const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

    const roleColors = {
        admin: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
        manufacturer: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
        brand: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        auditor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    };

    return (
        <div className="min-h-screen bg-slate-900" data-testid="dashboard-layout">
            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-800 border-r border-slate-700 transform transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="flex items-center gap-2 p-4 border-b border-slate-700">
                        <Globe className="h-8 w-8 text-emerald-400" />
                        <span className="text-xl font-bold text-white">TextileTrace</span>
                        <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden text-slate-400">
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* User Info */}
                    <div className="p-4 border-b border-slate-700">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-medium">
                                {user?.name?.charAt(0)?.toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                                <Badge variant="outline" className={`text-xs ${roleColors[user?.role]}`}>
                                    {user?.role?.toUpperCase()}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                        {navItems.map((item) => (
                            <Link
                                key={item.id}
                                to={item.path}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                                    isActive(item.path)
                                        ? 'bg-emerald-500/10 text-emerald-400'
                                        : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                                }`}
                                data-testid={`nav-${item.id}`}
                            >
                                <item.icon className="h-5 w-5" />
                                <span>{item.label}</span>
                                {item.badge && (
                                    <Badge variant="destructive" className="ml-auto h-5 w-5 p-0 flex items-center justify-center text-xs">
                                        {item.badge}
                                    </Badge>
                                )}
                            </Link>
                        ))}
                    </nav>

                    {/* Logout */}
                    <div className="p-4 border-t border-slate-700">
                        <Button 
                            variant="ghost" 
                            className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-700/50"
                            onClick={handleLogout}
                            data-testid="logout-button"
                        >
                            <LogOut className="h-5 w-5 mr-3" />
                            Logout
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="lg:pl-64">
                {/* Top Bar */}
                <header className="sticky top-0 z-40 h-16 bg-slate-800/95 backdrop-blur border-b border-slate-700">
                    <div className="flex items-center justify-between h-full px-4">
                        <button 
                            onClick={() => setSidebarOpen(true)} 
                            className="lg:hidden text-slate-400 hover:text-white"
                        >
                            <Menu className="h-6 w-6" />
                        </button>

                        <div className="flex-1 lg:ml-0 ml-4">
                            <h1 className="text-lg font-semibold text-white capitalize">
                                {location.pathname.split('/').pop()?.replace(/-/g, ' ') || 'Dashboard'}
                            </h1>
                        </div>

                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" className="relative text-slate-400 hover:text-white">
                                <Bell className="h-5 w-5" />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                            </Button>
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-medium text-white">{user?.company_name}</p>
                                <p className="text-xs text-slate-400">{user?.email}</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-4 lg:p-6">
                    {children || <Outlet />}
                </main>
            </div>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
                    onClick={() => setSidebarOpen(false)} 
                />
            )}
        </div>
    );
};

export default DashboardLayout;
