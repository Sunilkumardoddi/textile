import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Globe, Package, TrendingUp, AlertTriangle, 
    LogOut, Bell, Search, ChevronRight, 
    Factory, Settings, Users, BarChart3, 
    Clock, CheckCircle2, ArrowUpRight, Wrench
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

// Mock data for manufacturer dashboard
const mockMetrics = [
    { label: 'Active Orders', value: '34', change: '+5', icon: Package, color: 'text-secondary' },
    { label: 'Production Lines', value: '8', change: 'All Active', icon: Factory, color: 'text-accent' },
    { label: 'On-Time Delivery', value: '96%', change: '+3%', icon: Clock, color: 'text-success' },
    { label: 'Quality Issues', value: '2', change: '-4', icon: AlertTriangle, color: 'text-warning' },
];

const mockProductionOrders = [
    { id: 'PRD-001', product: 'Organic Cotton Fabric', client: 'Fashion Brand Co', stage: 'Weaving', progress: 65, deadline: '2024-02-15' },
    { id: 'PRD-002', product: 'Recycled Polyester', client: 'EcoWear Ltd', stage: 'Dyeing', progress: 40, deadline: '2024-02-20' },
    { id: 'PRD-003', product: 'Hemp Blend Material', client: 'Sustainable Style', stage: 'Quality Control', progress: 90, deadline: '2024-02-10' },
    { id: 'PRD-004', product: 'Bamboo Textile', client: 'Green Threads', stage: 'Spinning', progress: 25, deadline: '2024-02-25' },
];

const mockMachineStatus = [
    { name: 'Spinning Unit A', status: 'Running', efficiency: 94, lastMaintenance: '5 days ago' },
    { name: 'Weaving Loom B', status: 'Running', efficiency: 88, lastMaintenance: '12 days ago' },
    { name: 'Dyeing Station C', status: 'Maintenance', efficiency: 0, lastMaintenance: 'In Progress' },
    { name: 'Quality Check D', status: 'Running', efficiency: 97, lastMaintenance: '3 days ago' },
];

export const ManufacturerDashboard = () => {
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
                        <Badge variant="secondary" className="hidden md:flex bg-accent/10 text-accent border-accent/20">
                            Manufacturer Portal
                        </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="relative hidden md:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search production orders..." 
                                className="pl-10 w-64 bg-muted/50"
                            />
                        </div>
                        <Button variant="ghost" size="icon" className="relative">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-warning rounded-full" />
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
                        Production Dashboard
                    </h1>
                    <p className="text-muted-foreground">
                        Monitor your manufacturing operations and production lines.
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
                                        <p className={`text-xs mt-1 ${
                                            metric.change.startsWith('+') || metric.change.startsWith('-') 
                                                ? metric.change.startsWith('+') ? 'text-success' : 'text-destructive'
                                                : 'text-muted-foreground'
                                        }`}>
                                            {metric.change}
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
                    {/* Production Orders */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="font-heading text-lg">Production Orders</CardTitle>
                                    <CardDescription>Current manufacturing jobs</CardDescription>
                                </div>
                                <Button variant="ghost" size="sm" className="text-accent">
                                    View All <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {mockProductionOrders.map((order) => (
                                    <div 
                                        key={order.id} 
                                        className="p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <p className="font-medium text-foreground">{order.product}</p>
                                                <p className="text-sm text-muted-foreground">{order.client}</p>
                                            </div>
                                            <Badge variant="outline" className="text-xs">
                                                {order.stage}
                                            </Badge>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">Due: {order.deadline}</span>
                                                <span className="text-foreground font-medium">{order.progress}%</span>
                                            </div>
                                            <Progress value={order.progress} className="h-2" />
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Machine Status */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-heading text-lg">Machine Status</CardTitle>
                            <CardDescription>Production line health</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {mockMachineStatus.map((machine, index) => (
                                <div key={index} className="p-3 rounded-lg bg-muted/30">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-foreground">{machine.name}</span>
                                        <Badge 
                                            variant={machine.status === 'Running' ? 'default' : 'secondary'}
                                            className={machine.status === 'Running' ? 'bg-success/10 text-success border-success/20' : 'bg-warning/10 text-warning border-warning/20'}
                                        >
                                            {machine.status}
                                        </Badge>
                                    </div>
                                    {machine.status === 'Running' && (
                                        <div className="space-y-1">
                                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                <span>Efficiency</span>
                                                <span>{machine.efficiency}%</span>
                                            </div>
                                            <Progress value={machine.efficiency} className="h-1.5" />
                                        </div>
                                    )}
                                    <p className="text-xs text-muted-foreground mt-2">
                                        Maintenance: {machine.lastMaintenance}
                                    </p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: 'New Production Order', icon: Package, desc: 'Create manufacturing job' },
                        { label: 'Machine Settings', icon: Settings, desc: 'Configure equipment' },
                        { label: 'Workforce', icon: Users, desc: 'Manage team schedules' },
                        { label: 'Maintenance', icon: Wrench, desc: 'Schedule repairs' },
                    ].map((action, index) => (
                        <Card 
                            key={index} 
                            className="group cursor-pointer hover:border-accent/50 hover:shadow-lg transition-all"
                        >
                            <CardContent className="p-5 flex items-start gap-4">
                                <div className="p-3 rounded-xl bg-accent/10 text-accent group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                                    <action.icon className="h-5 w-5" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-foreground group-hover:text-accent transition-colors">
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

export default ManufacturerDashboard;
