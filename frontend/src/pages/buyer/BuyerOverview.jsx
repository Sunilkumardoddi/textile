import React from 'react';
import { Link } from 'react-router-dom';
import { 
    ShoppingCart, Package, TrendingUp, AlertTriangle, Clock,
    ChevronRight, CheckCircle2, ArrowUpRight, BarChart3,
    Factory, Leaf, Circle, Shirt, Droplets
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

// Mock data
const mockMetrics = [
    { label: 'Active POs', value: '24', change: '+3 this month', icon: ShoppingCart, color: 'text-primary' },
    { label: 'In Production', value: '18', change: '75% on track', icon: Factory, color: 'text-secondary' },
    { label: 'Delayed Orders', value: '3', change: 'Requires attention', icon: AlertTriangle, color: 'text-destructive' },
    { label: 'Avg Lead Time', value: '42d', change: '-3d vs target', icon: Clock, color: 'text-accent' },
];

const mockOrders = [
    {
        id: 'PO-2024-001',
        product: 'Organic Cotton T-Shirts',
        supplier: 'Dhaka Textiles Ltd',
        quantity: '5,000 pcs',
        status: 'on_track',
        progress: 65,
        currentStage: 'CMT',
        dueDate: '2024-02-28',
        stages: { fiber: 100, spinning: 100, fabric: 100, processing: 80, cmt: 40, final: 0 }
    },
    {
        id: 'PO-2024-002',
        product: 'Recycled Polyester Jackets',
        supplier: 'Mumbai Fabrics Co',
        quantity: '2,000 pcs',
        status: 'delayed',
        progress: 35,
        currentStage: 'Dyeing',
        dueDate: '2024-02-20',
        delayReason: 'Raw material shortage at spinning stage',
        stages: { fiber: 100, spinning: 100, fabric: 60, processing: 0, cmt: 0, final: 0 }
    },
    {
        id: 'PO-2024-003',
        product: 'Hemp Blend Shirts',
        supplier: 'Vietnam Textiles',
        quantity: '3,000 pcs',
        status: 'on_track',
        progress: 90,
        currentStage: 'Final QC',
        dueDate: '2024-02-15',
        stages: { fiber: 100, spinning: 100, fabric: 100, processing: 100, cmt: 100, final: 70 }
    },
];

const mockDelays = [
    { id: 'DL-001', po: 'PO-2024-002', stage: 'Spinning', reason: 'Raw material shortage', daysDelayed: 5, supplier: 'SpinCo Ltd' },
    { id: 'DL-002', po: 'PO-2024-005', stage: 'Dyeing', reason: 'Equipment maintenance', daysDelayed: 3, supplier: 'ColorTex' },
    { id: 'DL-003', po: 'PO-2024-008', stage: 'Fiber', reason: 'Certification pending', daysDelayed: 7, supplier: 'Organic Farms' },
];

const stageIcons = {
    fiber: Leaf,
    spinning: Circle,
    fabric: Package,
    processing: Droplets,
    cmt: Factory,
    final: Shirt
};

export const BuyerOverview = () => {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
                        Buyer Dashboard
                    </h1>
                    <p className="text-muted-foreground">
                        Monitor your purchase orders and supply chain progress
                    </p>
                </div>
                <Button variant="hero" asChild>
                    <Link to="/buyer/analytics">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        View Analytics
                    </Link>
                </Button>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {mockMetrics.map((metric, index) => (
                    <Card key={index} className="hover:shadow-lg transition-shadow">
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

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Active Orders */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div>
                                <CardTitle className="font-heading text-lg">Active Orders</CardTitle>
                                <CardDescription>Track your purchase orders in real-time</CardDescription>
                            </div>
                            <Button variant="ghost" size="sm" className="text-primary" asChild>
                                <Link to="/buyer/orders">
                                    View All <ChevronRight className="h-4 w-4 ml-1" />
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {mockOrders.map((order) => (
                                <div key={order.id} className="p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="font-medium text-foreground">{order.product}</p>
                                                <Badge 
                                                    variant="outline"
                                                    className={order.status === 'on_track' 
                                                        ? 'bg-success/10 text-success border-success/30'
                                                        : 'bg-destructive/10 text-destructive border-destructive/30'
                                                    }
                                                >
                                                    {order.status === 'on_track' ? (
                                                        <><CheckCircle2 className="h-3 w-3 mr-1" />On Track</>
                                                    ) : (
                                                        <><AlertTriangle className="h-3 w-3 mr-1" />Delayed</>
                                                    )}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground">{order.supplier} • {order.quantity}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-foreground">{order.id}</p>
                                            <p className="text-xs text-muted-foreground">Due: {order.dueDate}</p>
                                        </div>
                                    </div>

                                    {/* Stage Progress */}
                                    <div className="flex items-center gap-1 mb-2">
                                        {Object.entries(order.stages).map(([stage, progress], idx) => {
                                            const Icon = stageIcons[stage];
                                            return (
                                                <div key={stage} className="flex-1 flex flex-col items-center">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                                                        progress === 100 ? 'bg-success text-success-foreground' :
                                                        progress > 0 ? 'bg-secondary text-secondary-foreground' :
                                                        'bg-muted text-muted-foreground'
                                                    }`}>
                                                        <Icon className="h-4 w-4" />
                                                    </div>
                                                    <div className={`h-1 w-full rounded ${
                                                        progress === 100 ? 'bg-success' :
                                                        progress > 0 ? 'bg-secondary' : 'bg-muted'
                                                    }`} />
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Current: {order.currentStage}</span>
                                        <span className="font-medium">{order.progress}% Complete</span>
                                    </div>

                                    {order.delayReason && (
                                        <div className="mt-2 p-2 rounded-lg bg-destructive/10 text-destructive text-xs flex items-center gap-2">
                                            <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
                                            <span>{order.delayReason}</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Delay Alerts */}
                <Card>
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="font-heading text-lg flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-destructive" />
                                Delay Alerts
                            </CardTitle>
                            <Badge variant="destructive">{mockDelays.length}</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {mockDelays.map((delay) => (
                            <div key={delay.id} className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                                <div className="flex items-start justify-between mb-2">
                                    <span className="font-medium text-foreground text-sm">{delay.po}</span>
                                    <Badge variant="outline" className="bg-destructive/10 text-destructive border-0 text-[10px]">
                                        +{delay.daysDelayed} days
                                    </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground mb-1">
                                    <strong>Stage:</strong> {delay.stage} @ {delay.supplier}
                                </p>
                                <p className="text-xs text-destructive">
                                    <strong>Reason:</strong> {delay.reason}
                                </p>
                            </div>
                        ))}
                        <Button variant="ghost" size="sm" className="w-full text-muted-foreground" asChild>
                            <Link to="/buyer/delays">View All Delays</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'New Purchase Order', icon: ShoppingCart, desc: 'Create new PO', path: '/buyer/orders' },
                    { label: 'View Traceability', icon: Package, desc: 'Track supply chain', path: '/buyer/traceability' },
                    { label: 'Analytics Dashboard', icon: BarChart3, desc: 'Power BI reports', path: '/buyer/analytics' },
                    { label: 'Delay Reports', icon: AlertTriangle, desc: 'Review bottlenecks', path: '/buyer/delays' },
                ].map((action, index) => (
                    <Card key={index} className="group cursor-pointer hover:border-primary/50 hover:shadow-lg transition-all" asChild>
                        <Link to={action.path}>
                            <CardContent className="p-5 flex items-start gap-4">
                                <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                    <action.icon className="h-5 w-5" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                                        {action.label}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-0.5">{action.desc}</p>
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

export default BuyerOverview;
