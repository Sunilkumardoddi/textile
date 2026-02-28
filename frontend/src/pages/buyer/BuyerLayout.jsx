import React, { useState, useEffect } from 'react';
import { useNavigate, Outlet, Link, useLocation } from 'react-router-dom';
import { 
    Globe, ShoppingCart, Package, TrendingUp, Bell, LogOut, 
    Menu, X, ChevronRight, Home, FileText, AlertTriangle,
    BarChart3, Clock, CheckCircle2, Search, Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const navItems = [
    { id: 'overview', label: 'Dashboard', icon: Home, path: '/buyer' },
    { id: 'orders', label: 'Purchase Orders', icon: ShoppingCart, path: '/buyer/orders' },
    { id: 'traceability', label: 'Traceability', icon: Package, path: '/buyer/traceability' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/buyer/analytics' },
    { id: 'delays', label: 'Delay Reports', icon: AlertTriangle, path: '/buyer/delays', badge: 3 },
    { id: 'reports', label: 'Reports', icon: FileText, path: '/buyer/reports' },
];

export const BuyerLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('textileUser');
        if (storedUser) {
            const parsed = JSON.parse(storedUser);
            return parsed.role === 'buyer' ? parsed : null;
        }
        return null;
    });
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    const handleLogout = () => {
        localStorage.removeItem('textileUser');
        toast.success('Logged out successfully');
        navigate('/login');
    };

    const isActive = (path) => {
        if (path === '/buyer') {
            return location.pathname === '/buyer' || location.pathname === '/buyer/';
        }
        return location.pathname.startsWith(path);
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-background flex">
            {/* Sidebar */}
            <aside className={`hidden lg:flex flex-col fixed inset-y-0 left-0 z-50 bg-card border-r border-border transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
                <div className="flex items-center justify-between h-16 px-4 border-b border-border">
                    <Link to="/buyer" className="flex items-center gap-2">
                        <Globe className="h-8 w-8 text-secondary flex-shrink-0" />
                        {sidebarOpen && (
                            <span className="font-heading text-lg font-bold text-foreground">TextileTrace</span>
                        )}
                    </Link>
                    <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
                        <ChevronRight className={`h-4 w-4 transition-transform ${sidebarOpen ? 'rotate-180' : ''}`} />
                    </Button>
                </div>

                <nav className="flex-1 overflow-y-auto py-4 px-3">
                    {navItems.map((item) => (
                        <Link
                            key={item.id}
                            to={item.path}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all mb-1 ${
                                isActive(item.path)
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            }`}
                        >
                            <item.icon className="h-5 w-5 flex-shrink-0" />
                            {sidebarOpen && (
                                <>
                                    <span className="flex-1 text-sm font-medium">{item.label}</span>
                                    {item.badge && (
                                        <Badge variant="destructive" className="h-5 min-w-[20px]">
                                            {item.badge}
                                        </Badge>
                                    )}
                                </>
                            )}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-border">
                    <div className={`flex items-center gap-3 ${sidebarOpen ? '' : 'justify-center'}`}>
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                            <ShoppingCart className="h-5 w-5 text-primary-foreground" />
                        </div>
                        {sidebarOpen && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                                <p className="text-xs text-muted-foreground capitalize">Buyer</p>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}>
                    <div className="fixed inset-y-0 left-0 w-72 bg-card border-r border-border" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between h-16 px-4 border-b border-border">
                            <Link to="/buyer" className="flex items-center gap-2">
                                <Globe className="h-7 w-7 text-secondary" />
                                <span className="font-heading text-lg font-bold">TextileTrace</span>
                            </Link>
                            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                        <nav className="py-4 px-3">
                            {navItems.map((item) => (
                                <Link
                                    key={item.id}
                                    to={item.path}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all mb-1 ${
                                        isActive(item.path)
                                            ? 'bg-primary text-primary-foreground'
                                            : 'text-muted-foreground hover:bg-muted'
                                    }`}
                                >
                                    <item.icon className="h-5 w-5" />
                                    <span className="flex-1 text-sm font-medium">{item.label}</span>
                                    {item.badge && <Badge variant="destructive">{item.badge}</Badge>}
                                </Link>
                            ))}
                        </nav>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
                {/* Mobile Header */}
                <div className="lg:hidden fixed top-0 left-0 right-0 z-40 h-16 bg-card border-b border-border flex items-center justify-between px-4">
                    <Link to="/buyer" className="flex items-center gap-2">
                        <Globe className="h-7 w-7 text-secondary" />
                        <span className="font-heading text-lg font-bold">TextileTrace</span>
                    </Link>
                    <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(true)}>
                        <Menu className="h-6 w-6" />
                    </Button>
                </div>

                {/* Top Bar */}
                <header className="sticky top-0 z-30 h-16 bg-card/95 backdrop-blur border-b border-border flex items-center justify-between px-4 lg:px-6 mt-16 lg:mt-0">
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                        Buyer Portal
                    </Badge>
                    
                    <div className="flex items-center gap-4">
                        <div className="relative hidden md:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search POs, suppliers..." className="pl-10 w-64 bg-muted/50" />
                        </div>
                        <Button variant="ghost" size="icon" className="relative" asChild>
                            <Link to="/buyer/delays">
                                <Bell className="h-5 w-5" />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
                            </Link>
                        </Button>
                        <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-border">
                            <div className="text-right">
                                <p className="text-sm font-medium">{user.name}</p>
                                <p className="text-xs text-muted-foreground">Buyer</p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={handleLogout}>
                                <LogOut className="h-5 w-5 text-muted-foreground" />
                            </Button>
                        </div>
                    </div>
                </header>

                <div className="p-4 lg:p-6 pt-20 lg:pt-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default BuyerLayout;
