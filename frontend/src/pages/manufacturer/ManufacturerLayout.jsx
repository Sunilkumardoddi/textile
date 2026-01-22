import React, { useState, useEffect } from 'react';
import { useNavigate, Outlet, Link, useLocation } from 'react-router-dom';
import { 
    Globe, Factory, Package, FileCheck, Bell, LogOut, 
    Menu, X, ChevronRight, Home, Building2, Settings,
    ClipboardList, GitBranch, Award, AlertTriangle, 
    ShoppingBag, MessageSquare, User, Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const navItems = [
    { id: 'overview', label: 'Dashboard', icon: Home, path: '/manufacturer' },
    { id: 'profile', label: 'Factory Profile', icon: Building2, path: '/manufacturer/profile' },
    { id: 'capabilities', label: 'Production Capabilities', icon: Settings, path: '/manufacturer/capabilities' },
    { id: 'orders', label: 'Orders & Styles', icon: ShoppingBag, path: '/manufacturer/orders' },
    { id: 'traceability', label: 'Traceability Flow', icon: GitBranch, path: '/manufacturer/traceability' },
    { id: 'certifications', label: 'Certifications', icon: Award, path: '/manufacturer/certifications' },
    { id: 'documents', label: 'Documents', icon: FileCheck, path: '/manufacturer/documents' },
    { id: 'audits', label: 'Audit Responses', icon: ClipboardList, path: '/manufacturer/audits' },
    { id: 'alerts', label: 'Alerts & Notifications', icon: AlertTriangle, path: '/manufacturer/alerts', badge: 5 },
];

export const ManufacturerLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('textileUser');
        if (storedUser) {
            const parsed = JSON.parse(storedUser);
            if (parsed.role !== 'manufacturer') {
                navigate('/login');
            } else {
                setUser(parsed);
            }
        } else {
            navigate('/login');
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('textileUser');
        toast.success('Logged out successfully');
        navigate('/login');
    };

    const isActive = (path) => {
        if (path === '/manufacturer') {
            return location.pathname === '/manufacturer' || location.pathname === '/manufacturer/';
        }
        return location.pathname.startsWith(path);
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-background flex">
            {/* Sidebar - Desktop */}
            <aside className={`hidden lg:flex flex-col fixed inset-y-0 left-0 z-50 bg-card border-r border-border transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
                {/* Logo */}
                <div className="flex items-center justify-between h-16 px-4 border-b border-border">
                    <Link to="/manufacturer" className="flex items-center gap-2">
                        <Globe className="h-8 w-8 text-secondary flex-shrink-0" />
                        {sidebarOpen && (
                            <span className="font-heading text-lg font-bold text-foreground">TextileTrace</span>
                        )}
                    </Link>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="text-muted-foreground"
                    >
                        <ChevronRight className={`h-4 w-4 transition-transform ${sidebarOpen ? 'rotate-180' : ''}`} />
                    </Button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-4 px-3">
                    <div className="space-y-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.id}
                                to={item.path}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                                    isActive(item.path)
                                        ? 'bg-accent text-accent-foreground'
                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                }`}
                            >
                                <item.icon className="h-5 w-5 flex-shrink-0" />
                                {sidebarOpen && (
                                    <>
                                        <span className="flex-1 text-sm font-medium">{item.label}</span>
                                        {item.badge && (
                                            <Badge variant="destructive" className="h-5 min-w-[20px] flex items-center justify-center text-[10px]">
                                                {item.badge}
                                            </Badge>
                                        )}
                                    </>
                                )}
                            </Link>
                        ))}
                    </div>
                </nav>

                {/* User Info */}
                <div className="p-4 border-t border-border">
                    <div className={`flex items-center gap-3 ${sidebarOpen ? '' : 'justify-center'}`}>
                        <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                            <Factory className="h-5 w-5 text-accent-foreground" />
                        </div>
                        {sidebarOpen && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                                <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-16 bg-card border-b border-border flex items-center justify-between px-4">
                <Link to="/manufacturer" className="flex items-center gap-2">
                    <Globe className="h-7 w-7 text-secondary" />
                    <span className="font-heading text-lg font-bold text-foreground">TextileTrace</span>
                </Link>
                <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(true)}>
                    <Menu className="h-6 w-6" />
                </Button>
            </div>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}>
                    <div className="fixed inset-y-0 left-0 w-72 bg-card border-r border-border" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between h-16 px-4 border-b border-border">
                            <Link to="/manufacturer" className="flex items-center gap-2">
                                <Globe className="h-7 w-7 text-secondary" />
                                <span className="font-heading text-lg font-bold text-foreground">TextileTrace</span>
                            </Link>
                            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                        <nav className="py-4 px-3">
                            <div className="space-y-1">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.id}
                                        to={item.path}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                                            isActive(item.path)
                                                ? 'bg-accent text-accent-foreground'
                                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                        }`}
                                    >
                                        <item.icon className="h-5 w-5" />
                                        <span className="flex-1 text-sm font-medium">{item.label}</span>
                                        {item.badge && (
                                            <Badge variant="destructive" className="h-5 min-w-[20px] flex items-center justify-center text-[10px]">
                                                {item.badge}
                                            </Badge>
                                        )}
                                    </Link>
                                ))}
                            </div>
                        </nav>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'} pt-16 lg:pt-0`}>
                {/* Top Bar */}
                <header className="sticky top-0 z-40 h-16 bg-card/95 backdrop-blur border-b border-border flex items-center justify-between px-4 lg:px-6">
                    <div className="flex items-center gap-4">
                        <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">
                            Manufacturer Portal
                        </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="relative hidden md:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search orders, batches..." 
                                className="pl-10 w-64 bg-muted/50"
                            />
                        </div>
                        <Button variant="ghost" size="icon" className="relative" asChild>
                            <Link to="/manufacturer/alerts">
                                <Bell className="h-5 w-5" />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
                            </Link>
                        </Button>
                        <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-border">
                            <div className="text-right">
                                <p className="text-sm font-medium text-foreground">{user.name}</p>
                                <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={handleLogout}>
                                <LogOut className="h-5 w-5 text-muted-foreground" />
                            </Button>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-4 lg:p-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default ManufacturerLayout;
