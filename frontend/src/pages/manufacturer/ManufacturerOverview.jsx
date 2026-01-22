import React from 'react';
import { Link } from 'react-router-dom';
import { 
    Factory, Package, TrendingUp, AlertTriangle, 
    ChevronRight, Clock, CheckCircle2, ArrowUpRight,
    GitBranch, Award, FileCheck, ShoppingBag
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

// Mock data for manufacturer overview
const mockMetrics = [
    { label: 'Active Orders', value: '12', change: '+3 this week', icon: ShoppingBag, color: 'text-secondary' },
    { label: 'Production Lines', value: '8', change: '6 Active', icon: Factory, color: 'text-accent' },
    { label: 'Traceability Complete', value: '87%', change: '+5% vs last month', icon: GitBranch, color: 'text-success' },
    { label: 'Pending Actions', value: '5', change: '2 urgent', icon: AlertTriangle, color: 'text-warning' },
];

const mockActiveOrders = [
    { id: 'ORD-2024-001', brand: 'Fashion Brand Co', style: 'Organic Cotton T-Shirts', status: 'In Production', progress: 65, dueDate: '2024-02-15' },
    { id: 'ORD-2024-002', brand: 'EcoWear Ltd', style: 'Recycled Polyester Jackets', status: 'Dyeing', progress: 40, dueDate: '2024-02-20' },
    { id: 'ORD-2024-003', brand: 'Sustainable Style', style: 'Hemp Blend Shirts', status: 'Quality Check', progress: 90, dueDate: '2024-02-10' },
];

const mockAlerts = [
    { type: 'certification', message: 'GOTS certificate expires in 15 days', priority: 'high' },
    { type: 'audit', message: 'Corrective action required for CAR-2024-005', priority: 'high' },
    { type: 'traceability', message: 'Missing cotton source data for Batch #B2024-112', priority: 'medium' },
    { type: 'order', message: 'New style assignment from Fashion Brand Co', priority: 'low' },
];

const mockCertifications = [
    { name: 'GOTS', status: 'Valid', expiryDays: 15 },
    { name: 'GRS', status: 'Valid', expiryDays: 120 },
    { name: 'OEKO-TEX', status: 'Valid', expiryDays: 89 },
    { name: 'OCS', status: 'Expiring', expiryDays: 7 },
];

export const ManufacturerOverview = () => {
    return (
        <div className="space-y-6">
            {/* Welcome Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
                        Manufacturing Dashboard
                    </h1>
                    <p className="text-muted-foreground">
                        Monitor your production operations and supply chain traceability.
                    </p>
                </div>
                <Button variant="hero" asChild>
                    <Link to="/manufacturer/traceability">
                        <GitBranch className="h-4 w-4 mr-2" />
                        Update Traceability
                    </Link>
                </Button>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {mockMetrics.map((metric, index) => (
                    <Card key={index} className="bg-card hover:shadow-lg transition-shadow">
                        <CardContent className="p-5">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">{metric.label}</p>
                                    <p className="text-2xl font-bold text-foreground">{metric.value}</p>
                                    <p className="text-xs mt-1 text-muted-foreground">{metric.change}</p>
                                </div>
                                <div className={`p-3 rounded-xl bg-muted ${metric.color}`}>
                                    <metric.icon className="h-5 w-5" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Active Orders */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div>
                                <CardTitle className="font-heading text-lg">Active Orders</CardTitle>
                                <CardDescription>Your assigned brand orders and production status</CardDescription>
                            </div>
                            <Button variant="ghost" size="sm" className="text-accent" asChild>
                                <Link to="/manufacturer/orders">
                                    View All <ChevronRight className="h-4 w-4 ml-1" />
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {mockActiveOrders.map((order) => (
                                <div 
                                    key={order.id} 
                                    className="p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <p className="font-medium text-foreground">{order.style}</p>
                                            <p className="text-sm text-muted-foreground">{order.brand}</p>
                                        </div>
                                        <Badge variant="outline" className="text-xs">
                                            {order.status}
                                        </Badge>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">{order.id} • Due: {order.dueDate}</span>
                                            <span className="text-foreground font-medium">{order.progress}%</span>
                                        </div>
                                        <Progress value={order.progress} className="h-2" />
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Alerts & Certifications */}
                <div className="space-y-6">
                    {/* Alerts */}
                    <Card>
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="font-heading text-lg">Alerts</CardTitle>
                                <Badge variant="destructive" className="text-xs">
                                    {mockAlerts.filter(a => a.priority === 'high').length} Urgent
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {mockAlerts.slice(0, 3).map((alert, index) => (
                                <div key={index} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                                    <div className={`mt-0.5 p-1.5 rounded-lg ${
                                        alert.priority === 'high' ? 'bg-destructive/10 text-destructive' :
                                        alert.priority === 'medium' ? 'bg-warning/10 text-warning' :
                                        'bg-muted text-muted-foreground'
                                    }`}>
                                        <AlertTriangle className="h-3.5 w-3.5" />
                                    </div>
                                    <p className="text-sm text-foreground flex-1">{alert.message}</p>
                                </div>
                            ))}
                            <Button variant="ghost" size="sm" className="w-full text-muted-foreground" asChild>
                                <Link to="/manufacturer/alerts">View All Alerts</Link>
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Certifications Status */}
                    <Card>
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="font-heading text-lg">Certifications</CardTitle>
                                <Button variant="ghost" size="sm" className="text-accent h-8" asChild>
                                    <Link to="/manufacturer/certifications">
                                        Manage <ChevronRight className="h-4 w-4 ml-1" />
                                    </Link>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {mockCertifications.map((cert, index) => (
                                <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                                    <div className="flex items-center gap-2">
                                        <Award className={`h-4 w-4 ${
                                            cert.expiryDays <= 7 ? 'text-destructive' :
                                            cert.expiryDays <= 30 ? 'text-warning' :
                                            'text-success'
                                        }`} />
                                        <span className="text-sm font-medium text-foreground">{cert.name}</span>
                                    </div>
                                    <Badge variant="outline" className={`text-[10px] ${
                                        cert.expiryDays <= 7 ? 'border-destructive/50 text-destructive' :
                                        cert.expiryDays <= 30 ? 'border-warning/50 text-warning' :
                                        'border-success/50 text-success'
                                    }`}>
                                        {cert.expiryDays}d left
                                    </Badge>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Update Production', icon: Factory, desc: 'Log production progress', path: '/manufacturer/orders' },
                    { label: 'Traceability Data', icon: GitBranch, desc: 'Submit supply chain data', path: '/manufacturer/traceability' },
                    { label: 'Upload Documents', icon: FileCheck, desc: 'Add certificates & reports', path: '/manufacturer/documents' },
                    { label: 'Respond to Audits', icon: Package, desc: 'Handle audit findings', path: '/manufacturer/audits' },
                ].map((action, index) => (
                    <Card 
                        key={index} 
                        className="group cursor-pointer hover:border-accent/50 hover:shadow-lg transition-all"
                        asChild
                    >
                        <Link to={action.path}>
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
                        </Link>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default ManufacturerOverview;
