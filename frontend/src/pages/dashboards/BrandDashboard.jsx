import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Globe, Package, TrendingUp, AlertTriangle, 
    LogOut, Bell, Search, ChevronRight, 
    Factory, Truck, Leaf, BarChart3, 
    MapPin, Clock, CheckCircle2, ArrowUpRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

// Mock data for brand dashboard
const mockMetrics = [
    { label: 'Active Suppliers', value: '247', change: '+12%', icon: Factory, color: 'text-secondary' },
    { label: 'Products Tracked', value: '15.2K', change: '+8%', icon: Package, color: 'text-accent' },
    { label: 'Compliance Rate', value: '94%', change: '+2%', icon: CheckCircle2, color: 'text-success' },
    { label: 'Pending Audits', value: '18', change: '-5', icon: AlertTriangle, color: 'text-warning' },
];

const mockOrders = [
    { id: 'ORD-2024-001', product: 'Organic Cotton T-Shirts', supplier: 'Dhaka Textiles Ltd', status: 'In Transit', progress: 75 },
    { id: 'ORD-2024-002', product: 'Recycled Denim Jeans', supplier: 'Mumbai Fabrics Co', status: 'Manufacturing', progress: 45 },
    { id: 'ORD-2024-003', product: 'Hemp Blend Hoodies', supplier: 'Shanghai Mills', status: 'Quality Check', progress: 90 },
    { id: 'ORD-2024-004', product: 'Bamboo Fabric Shirts', supplier: 'Vietnam Textiles', status: 'Shipped', progress: 100 },
];

const mockSupplyChainEvents = [
    { time: '2 hours ago', event: 'Shipment arrived at Rotterdam port', location: 'Netherlands', type: 'transit' },
    { time: '5 hours ago', event: 'Quality inspection completed', location: 'Ho Chi Minh City', type: 'inspection' },
    { time: '1 day ago', event: 'New supplier certification approved', location: 'Mumbai, India', type: 'certification' },
    { time: '2 days ago', event: 'Sustainability audit scheduled', location: 'Dhaka, Bangladesh', type: 'audit' },
];

export const BrandDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('textileUser');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        } else {
            navigate('/login');
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('textileUser');
        toast.success('Logged out successfully');
        navigate('/login');
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-background">
            {/* Top Navigation */}
            <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
                <div className="container flex h-16 items-center justify-between px-4 md:px-6">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Globe className="h-7 w-7 text-secondary" />
                            <span className="font-heading text-xl font-bold text-foreground">TextileTrace</span>
                        </div>
                        <Badge variant="secondary" className="hidden md:flex">
                            Brand Portal
                        </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="relative hidden md:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search orders, suppliers..." 
                                className="pl-10 w-64 bg-muted/50"
                            />
                        </div>
                        <Button variant="ghost" size="icon" className="relative">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
                        </Button>
                        <div className="flex items-center gap-3 pl-3 border-l border-border">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-medium text-foreground">{user.name}</p>
                                <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={handleLogout}>
                                <LogOut className="h-5 w-5 text-muted-foreground" />
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container px-4 md:px-6 py-8">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-2">
                        Welcome back, {user.name.split(' ')[0]}!
                    </h1>
                    <p className="text-muted-foreground">
                        Here&apos;s what&apos;s happening across your global supply chain today.
                    </p>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {mockMetrics.map((metric, index) => (
                        <Card key={index} className="bg-card hover:shadow-lg transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">{metric.label}</p>
                                        <p className="text-2xl font-bold text-foreground">{metric.value}</p>
                                        <p className={`text-xs mt-1 ${metric.change.startsWith('+') ? 'text-success' : 'text-muted-foreground'}`}>
                                            {metric.change} from last month
                                        </p>
                                    </div>
                                    <div className={`p-3 rounded-xl bg-muted ${metric.color}`}>
                                        <metric.icon className="h-5 w-5" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Active Orders */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="font-heading text-lg">Active Orders</CardTitle>
                                    <CardDescription>Track your supply chain orders in real-time</CardDescription>
                                </div>
                                <Button variant="ghost" size="sm" className="text-secondary">
                                    View All <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {mockOrders.map((order) => (
                                    <div 
                                        key={order.id} 
                                        className="p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <p className="font-medium text-foreground">{order.product}</p>
                                                <p className="text-sm text-muted-foreground">{order.supplier}</p>
                                            </div>
                                            <Badge 
                                                variant={order.status === 'Shipped' ? 'default' : 'secondary'}
                                                className={order.status === 'Shipped' ? 'bg-success text-success-foreground' : ''}
                                            >
                                                {order.status}
                                            </Badge>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">{order.id}</span>
                                                <span className="text-foreground font-medium">{order.progress}%</span>
                                            </div>
                                            <Progress value={order.progress} className="h-2" />
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Supply Chain Activity */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-heading text-lg">Recent Activity</CardTitle>
                            <CardDescription>Latest supply chain events</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {mockSupplyChainEvents.map((event, index) => (
                                <div key={index} className="flex gap-3">
                                    <div className={`mt-1 p-2 rounded-lg ${
                                        event.type === 'transit' ? 'bg-accent/10 text-accent' :
                                        event.type === 'inspection' ? 'bg-success/10 text-success' :
                                        event.type === 'certification' ? 'bg-secondary/10 text-secondary' :
                                        'bg-warning/10 text-warning'
                                    }`}>
                                        {event.type === 'transit' ? <Truck className="h-4 w-4" /> :
                                         event.type === 'inspection' ? <CheckCircle2 className="h-4 w-4" /> :
                                         event.type === 'certification' ? <Leaf className="h-4 w-4" /> :
                                         <BarChart3 className="h-4 w-4" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-foreground truncate">
                                            {event.event}
                                        </p>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                            <MapPin className="h-3 w-3" />
                                            <span className="truncate">{event.location}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                                            <Clock className="h-3 w-3" />
                                            <span>{event.time}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: 'Create New Order', icon: Package, desc: 'Start a new supply chain order' },
                        { label: 'View Suppliers', icon: Factory, desc: 'Manage your supplier network' },
                        { label: 'Sustainability Report', icon: Leaf, desc: 'View environmental impact' },
                        { label: 'Analytics', icon: TrendingUp, desc: 'Supply chain insights' },
                    ].map((action, index) => (
                        <Card 
                            key={index} 
                            className="group cursor-pointer hover:border-secondary/50 hover:shadow-lg transition-all"
                        >
                            <CardContent className="p-5 flex items-start gap-4">
                                <div className="p-3 rounded-xl bg-secondary/10 text-secondary group-hover:bg-secondary group-hover:text-secondary-foreground transition-colors">
                                    <action.icon className="h-5 w-5" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-foreground group-hover:text-secondary transition-colors">
                                        {action.label}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {action.desc}
                                    </p>
                                </div>
                                <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default BrandDashboard;
