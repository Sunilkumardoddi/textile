import React from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
    Globe, LogOut, Menu, X,
    LayoutDashboard, Users, Package, Factory, Truck,
    ClipboardCheck, BarChart3, FileText, AlertTriangle,
    ShoppingCart, Calendar, Layers,
    Leaf, GitBranch, ChevronRight, Palette, DollarSign,
    BarChart2, Zap, MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useState } from 'react';
import NotificationBell from '@/components/notifications/NotificationBell';

const DashboardLayout = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [expandedGroups, setExpandedGroups] = useState({ brand_season_po: false, brand_po_sc: false, mfr_new: true });

    const handleLogout = async () => {
        await logout();
        toast.success('Logged out successfully');
        navigate('/login');
    };

    const toggleGroup = (key) =>
        setExpandedGroups(prev => ({ ...prev, [key]: !prev[key] }));

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
                // ── New Mfr Screens ──
                { id: 'mfr-overview', label: 'Mfr Overview', icon: LayoutDashboard, path: '/dashboard/manufacturer/overview', group: 'mfr_new' },
                { id: 'higg-fem', label: 'Sustainability & Certs', icon: Leaf, path: '/dashboard/manufacturer/higg-fem', group: 'mfr_new' },
                { id: 'trace-ess', label: 'Traceability & ESS', icon: GitBranch, path: '/dashboard/manufacturer/traceability-ess', group: 'mfr_new' },
            ],
            brand: [
                // ── Season & PO Workflow group ──
                { id: 'mood-board', label: 'Season Mood Board', icon: Palette, path: '/dashboard/brand/seasons/mood-board', group: 'brand_season_po' },
                { id: 'ai-style', label: 'AI Style Engine', icon: Zap, path: '/dashboard/brand/ai-style', group: 'brand_season_po' },
                { id: 'sourcing', label: 'Developments Sourcing & Costing', icon: DollarSign, path: '/dashboard/brand/sourcing-costing', group: 'brand_season_po' },
                { id: 'mood-punch', label: 'Mood Board Punching', icon: Package, path: '/dashboard/brand/mood-punching', group: 'brand_season_po' },
                { id: 'po-auto', label: 'PO Auto-Gen', icon: FileText, path: '/dashboard/brand/po-auto', group: 'brand_season_po' },
                // ── PO & Supply Chain Management group ──
                { id: 'po-sc-mgmt', label: 'PO & SC Management', icon: ShoppingCart, path: '/dashboard/brand/po-sc-management', group: 'brand_po_sc' },
                { id: 'po-garment-costing', label: 'PO Garment Costing', icon: DollarSign, path: '/dashboard/brand/po-garment-costing', group: 'brand_po_sc' },
                { id: 'po-fit-samples', label: 'PO Fit Samples Approval', icon: ClipboardCheck, path: '/dashboard/brand/po-fit-samples', group: 'brand_po_sc' },
                { id: 'po-lot-creation', label: 'PO Internal Lot Creation', icon: Layers, path: '/dashboard/brand/po-lot-creation', group: 'brand_po_sc' },
                { id: 'po-traceability', label: 'PO Traceability', icon: GitBranch, path: '/dashboard/brand/po-traceability', group: 'brand_po_sc' },
                { id: 'po-sustainability', label: 'PO Sustainability', icon: Leaf, path: '/dashboard/brand/po-sustainability', group: 'brand_po_sc' },
                { id: 'po-qr-scan', label: 'Supply Chain QR Scan', icon: MapPin, path: '/dashboard/brand/po-qr-scan', group: 'brand_po_sc' },
                // ── Sustainability ──
                { id: 'sustainability', label: 'Sustainability', icon: Leaf, path: '/dashboard/brand/sustainability' },
                { id: 'sc-sustainability', label: 'SC · Sustainability · Costing', icon: GitBranch, path: '/dashboard/brand/sc-sustainability' },
                { id: 'supplier-trace', label: 'Supplier Trace', icon: GitBranch, path: '/dashboard/brand/supplier-trace' },
                { id: 'season-bench', label: 'Season Benchmark', icon: BarChart2, path: '/dashboard/brand/season-benchmark' },
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

    // Group definitions for section headers
    const groupDefs = {
        brand_season_po: { title: 'Season & PO Workflow', icon: Calendar, color: 'text-amber-400' },
        brand_po_sc: { title: 'PO & Supply Chain Mgmt', icon: ShoppingCart, color: 'text-blue-400' },
        mfr_new: { title: 'TCH Mfr Portal', icon: Factory, color: 'text-orange-400' },
    };

    // Process items logically in their defined order
    const renderList = [];
    const processedGroups = new Set();
    navItems.forEach(item => {
        if (!item.group) {
            renderList.push({ type: 'single', item });
        } else if (!processedGroups.has(item.group)) {
            processedGroups.add(item.group);
            const groupItems = navItems.filter(i => i.group === item.group);
            renderList.push({ type: 'group', groupKey: item.group, items: groupItems });
        }
    });

    const renderNavLink = (item) => (
        <Link
            key={item.id}
            to={item.path}
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive(item.path)
                    ? 'bg-teal-600/20 text-teal-400'
                    : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                }`}
            data-testid={`nav-${item.id}`}
        >
            <item.icon className="h-4 w-4 shrink-0" />
            <span className="text-sm">{item.label}</span>
            {item.badge && (
                <Badge variant="destructive" className="ml-auto h-5 w-5 p-0 flex items-center justify-center text-xs">
                    {item.badge}
                </Badge>
            )}
        </Link>
    );

    return (
        <div className="min-h-screen bg-slate-900" data-testid="dashboard-layout">
            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-800 border-r border-slate-700 transform transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="flex items-center gap-2 p-4 border-b border-slate-700">
                        <Globe className="h-8 w-8 text-teal-400" />
                        <span className="text-xl font-bold text-white">TCH Portal</span>
                        <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden text-slate-400">
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* User Info */}
                    <div className="p-4 border-b border-slate-700">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400 font-medium">
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
                    <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                        {renderList.map((block, idx) => {
                            if (block.type === 'single') {
                                return renderNavLink(block.item);
                            }

                            const { groupKey, items } = block;
                            const def = groupDefs[groupKey];
                            if (!def) return items.map(renderNavLink);

                            const isOpen = expandedGroups[groupKey];
                            return (
                                <div key={groupKey || idx} className="mt-3">
                                    <button
                                        onClick={() => toggleGroup(groupKey)}
                                        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-slate-300 transition-colors"
                                    >
                                        <def.icon className={`h-3.5 w-3.5 ${def.color}`} />
                                        <span className={def.color}>{def.title}</span>
                                        <ChevronRight className={`ml-auto h-3.5 w-3.5 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                                    </button>
                                    {isOpen && (
                                        <div className="mt-1 space-y-1 pl-2">
                                            {items.map(renderNavLink)}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </nav>

                    {/* Logout */}
                    <div className="p-4 border-t border-slate-700">
                        <Button
                            variant="ghost"
                            className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-700/50"
                            onClick={handleLogout}
                            data-testid="logout-button"
                        >
                            <LogOut className="h-5 w-5 mr-3" />Logout
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="lg:pl-64">
                {/* Top Bar */}
                <header className="sticky top-0 z-40 h-16 bg-slate-800/95 backdrop-blur border-b border-slate-700">
                    <div className="flex items-center justify-between h-full px-4">
                        <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-400 hover:text-white">
                            <Menu className="h-6 w-6" />
                        </button>

                        <div className="flex-1 lg:ml-0 ml-4">
                            <h1 className="text-lg font-semibold text-white capitalize">
                                {location.pathname.split('/').pop()?.replace(/-/g, ' ') || 'Dashboard'}
                            </h1>
                        </div>

                        <div className="flex items-center gap-4">
                            <NotificationBell />
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
