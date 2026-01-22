import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Globe, Users, Settings, Activity,
    LogOut, Bell, Search, ChevronRight, 
    Database, Shield, Server, Lock,
    UserPlus, Building2, ArrowUpRight, BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

// Mock data for admin dashboard
const mockMetrics = [
    { label: 'Total Users', value: '1,247', change: '+85 this month', icon: Users, color: 'text-primary' },
    { label: 'Active Sessions', value: '342', change: 'Real-time', icon: Activity, color: 'text-success' },
    { label: 'System Uptime', value: '99.9%', change: 'Last 30 days', icon: Server, color: 'text-secondary' },
    { label: 'Security Alerts', value: '3', change: 'Requires review', icon: Shield, color: 'text-warning' },
];

const mockUserStats = [
    { role: 'Brand Managers', count: 156, active: 89, growth: '+12%' },
    { role: 'Manufacturers', count: 423, active: 187, growth: '+8%' },
    { role: 'Auditors', count: 78, active: 45, growth: '+15%' },
    { role: 'Administrators', count: 12, active: 10, growth: '0%' },
];

const mockRecentActivity = [
    { user: 'brand@textile.com', action: 'Created new order', time: '5 min ago', type: 'create' },
    { user: 'auditor@textile.com', action: 'Submitted audit report', time: '12 min ago', type: 'submit' },
    { user: 'admin@textile.com', action: 'Updated system settings', time: '1 hour ago', type: 'settings' },
    { user: 'manufacturer@textile.com', action: 'Updated production status', time: '2 hours ago', type: 'update' },
    { user: 'brand@textile.com', action: 'Logged in from new device', time: '3 hours ago', type: 'security' },
];

const mockSystemHealth = [
    { name: 'API Server', status: 'Healthy', load: 45 },
    { name: 'Database', status: 'Healthy', load: 32 },
    { name: 'Authentication', status: 'Healthy', load: 18 },
    { name: 'File Storage', status: 'Warning', load: 78 },
];

export const AdminDashboard = () => {
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
                        <Badge variant="secondary" className="hidden md:flex bg-primary/10 text-primary border-primary/20">
                            Admin Portal
                        </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="relative hidden md:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search users, logs..." 
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
                        System Administration
                    </h1>
                    <p className="text-muted-foreground">
                        Manage users, monitor system health, and configure platform settings.
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
                                        <p className="text-xs mt-1 text-muted-foreground">
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
                    {/* User Statistics */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="font-heading text-lg">User Statistics</CardTitle>
                                    <CardDescription>Overview of platform users by role</CardDescription>
                                </div>
                                <Button variant="ghost" size="sm" className="text-primary">
                                    Manage Users <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {mockUserStats.map((stat, index) => (
                                    <div 
                                        key={index} 
                                        className="p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-primary/10">
                                                    <Users className="h-4 w-4 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-foreground">{stat.role}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {stat.active} active / {stat.count} total
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className={
                                                stat.growth.startsWith('+') 
                                                    ? 'bg-success/10 text-success border-success/20' 
                                                    : 'bg-muted text-muted-foreground'
                                            }>
                                                {stat.growth}
                                            </Badge>
                                        </div>
                                        <Progress value={(stat.active / stat.count) * 100} className="h-2" />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    {/* System Health */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-heading text-lg">System Health</CardTitle>
                            <CardDescription>Server and service status</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {mockSystemHealth.map((system, index) => (
                                <div key={index} className="p-3 rounded-lg bg-muted/30">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${
                                                system.status === 'Healthy' ? 'bg-success' : 'bg-warning'
                                            }`} />
                                            <span className="text-sm font-medium text-foreground">{system.name}</span>
                                        </div>
                                        <Badge 
                                            variant="outline"
                                            className={system.status === 'Healthy' 
                                                ? 'bg-success/10 text-success border-success/20' 
                                                : 'bg-warning/10 text-warning border-warning/20'
                                            }
                                        >
                                            {system.status}
                                        </Badge>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                                            <span>Load</span>
                                            <span>{system.load}%</span>
                                        </div>
                                        <Progress 
                                            value={system.load} 
                                            className={`h-1.5 ${system.load > 70 ? '[&>div]:bg-warning' : ''}`} 
                                        />
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Activity */}
                <Card className="mt-6">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="font-heading text-lg">Recent Activity</CardTitle>
                            <CardDescription>Latest actions across the platform</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" className="text-primary">
                            View Logs <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {mockRecentActivity.map((activity, index) => (
                                <div 
                                    key={index} 
                                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/30 transition-colors"
                                >
                                    <div className={`p-2 rounded-lg ${
                                        activity.type === 'create' ? 'bg-success/10 text-success' :
                                        activity.type === 'security' ? 'bg-warning/10 text-warning' :
                                        activity.type === 'settings' ? 'bg-primary/10 text-primary' :
                                        'bg-secondary/10 text-secondary'
                                    }`}>
                                        {activity.type === 'create' ? <Database className="h-4 w-4" /> :
                                         activity.type === 'security' ? <Lock className="h-4 w-4" /> :
                                         activity.type === 'settings' ? <Settings className="h-4 w-4" /> :
                                         <Activity className="h-4 w-4" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-foreground">{activity.action}</p>
                                        <p className="text-xs text-muted-foreground truncate">{activity.user}</p>
                                    </div>
                                    <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: 'Add New User', icon: UserPlus, desc: 'Create user account' },
                        { label: 'Manage Companies', icon: Building2, desc: 'Organization settings' },
                        { label: 'System Settings', icon: Settings, desc: 'Platform configuration' },
                        { label: 'Analytics', icon: BarChart3, desc: 'View detailed reports' },
                    ].map((action, index) => (
                        <Card 
                            key={index} 
                            className="group cursor-pointer hover:border-primary/50 hover:shadow-lg transition-all"
                        >
                            <CardContent className="p-5 flex items-start gap-4">
                                <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                    <action.icon className="h-5 w-5" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-foreground group-hover:text-primary transition-colors">
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

export default AdminDashboard;
