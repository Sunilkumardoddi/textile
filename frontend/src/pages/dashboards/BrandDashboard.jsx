import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
    Globe, Package, TrendingUp, AlertTriangle, 
    LogOut, Bell, Search, ChevronRight, ChevronDown, ChevronUp,
    Factory, Truck, Leaf, BarChart3, Scale,
    MapPin, Clock, CheckCircle2, ArrowUpRight, Eye, X,
    Calendar, RefreshCw, Download, Filter, Layers,
    Droplets, Shirt, ArrowRight, Shield, ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

// Delay reason labels
const delayReasonLabels = {
    raw_material: 'Raw Material Shortage',
    machine_breakdown: 'Machine Breakdown',
    labor_shortage: 'Labor Shortage',
    power_cut: 'Power Cut',
    buyer_change: 'Buyer Specification Change',
    quality_issue: 'Quality Rejection/Rework',
    logistics: 'Logistics/Shipping Delay',
    other: 'Other',
};

// Delay Reports Component (synced from Manufacturer)
const DelayReportsSection = () => {
    const [delayReports, setDelayReports] = useState([]);

    useEffect(() => {
        // Load delay reports from localStorage (synced from manufacturer)
        const reports = JSON.parse(localStorage.getItem('brand_delay_reports') || '[]');
        setDelayReports(reports);
    }, []);

    if (delayReports.length === 0) {
        return (
            <div className="text-center py-8">
                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <p className="font-medium text-foreground">No Delay Reports</p>
                <p className="text-sm text-muted-foreground">All manufacturers are on schedule</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {delayReports.map((report, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-white border border-red-200">
                    <div className="flex items-start justify-between mb-2">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-mono font-bold text-foreground">{report.poNumber}</span>
                                <Badge variant="destructive">
                                    +{report.daysDelayed} days overdue
                                </Badge>
                            </div>
                            <p className="font-medium text-foreground">{report.product}</p>
                            <p className="text-sm text-muted-foreground">{report.buyer}</p>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                            <p>Due: {report.dueDate}</p>
                            <p>Reported: {new Date(report.reportedAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                    <div className="mt-3 p-3 rounded-lg bg-red-100">
                        <p className="text-sm font-medium text-red-800">
                            Reason: {delayReasonLabels[report.delayReason] || report.delayReason}
                        </p>
                        {report.delayComments && (
                            <p className="text-sm text-red-600 mt-1">"{report.delayComments}"</p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

// Global PO Tracker Data with step completion
const globalPOTracker = [
    { 
        poNumber: 'PO-2024-001', 
        product: 'Organic Cotton T-Shirts',
        manufacturer: 'Dhaka Textiles Ltd',
        quantity: 5000,
        dueDate: '2024-02-28',
        traceId: 'TRC-LX8F2K-AB4D',
        steps: {
            fiber: { complete: true, date: '2024-01-05', supplier: 'Organic Farms Co-op', data: { type: 'Organic Cotton', weight: '1,500 KG', source: 'Gujarat, India' }},
            spinning: { complete: true, date: '2024-01-12', supplier: 'SpinWell Textiles', data: { count: '30s Combed', weight: '1,380 KG', tpi: '22' }},
            fabric: { complete: true, date: '2024-01-18', supplier: 'KnitCraft Industries', data: { type: 'Jersey', gsm: '180', meters: '7,500 M' }},
            processing: { complete: true, date: '2024-01-22', supplier: 'ColorEco Processing', data: { dye: 'Reactive', shade: 'Natural White', approval: 'Yes' }},
            valueAdd: { complete: false, date: null, supplier: null, data: null },
            final: { complete: false, date: null, supplier: null, data: null },
        },
        leadTime: { actual: 17, target: 20, status: 'on_track' },
    },
    { 
        poNumber: 'PO-2024-002', 
        product: 'Recycled Polyester Jackets',
        manufacturer: 'Mumbai Fabrics Co',
        quantity: 2000,
        dueDate: '2024-03-15',
        traceId: 'TRC-MN9G3H-CD5E',
        steps: {
            fiber: { complete: true, date: '2024-01-20', supplier: 'EcoFiber Mills', data: { type: 'Recycled Polyester', weight: '800 KG', source: 'Tamil Nadu' }},
            spinning: { complete: true, date: '2024-01-28', supplier: 'YarnCraft Industries', data: { count: '75D', weight: '750 KG', tpi: '-' }},
            fabric: { complete: false, date: null, supplier: null, data: null },
            processing: { complete: false, date: null, supplier: null, data: null },
            valueAdd: { complete: false, date: null, supplier: null, data: null },
            final: { complete: false, date: null, supplier: null, data: null },
        },
        leadTime: { actual: 8, target: 25, status: 'delayed' },
    },
    { 
        poNumber: 'PO-2024-003', 
        product: 'Hemp Blend Shirts',
        manufacturer: 'Vietnam Textiles',
        quantity: 3000,
        dueDate: '2024-02-15',
        traceId: 'TRC-KP7L4M-EF6G',
        steps: {
            fiber: { complete: true, date: '2024-01-10', supplier: 'Hemp Growers Co-op', data: { type: 'Hemp/Cotton Blend', weight: '1,200 KG', source: 'China' }},
            spinning: { complete: true, date: '2024-01-15', supplier: 'SpinWell Textiles', data: { count: '40s', weight: '1,100 KG', tpi: '18' }},
            fabric: { complete: true, date: '2024-01-20', supplier: 'WeaveMaster Textiles', data: { type: 'Poplin', gsm: '120', meters: '6,200 M' }},
            processing: { complete: true, date: '2024-01-25', supplier: 'GreenDye Solutions', data: { dye: 'Natural', shade: 'Sky Blue', approval: 'Yes' }},
            valueAdd: { complete: true, date: '2024-01-28', supplier: 'PrintMaster', data: { type: 'Screen Print', units: '3,000' }},
            final: { complete: true, date: '2024-02-02', supplier: 'FairStitch Garments', data: { packed: '2,950', defect: '1.7%' }},
        },
        leadTime: { actual: 23, target: 25, status: 'complete' },
    },
];

// Lead Time Analysis Data
const leadTimeAnalysis = [
    { stage: 'Fiber Sourcing', avgDays: 5, targetDays: 4, posCount: 3 },
    { stage: 'Spinning', avgDays: 7, targetDays: 8, posCount: 3 },
    { stage: 'Fabric Production', avgDays: 5, targetDays: 5, posCount: 2 },
    { stage: 'Processing/Dyeing', avgDays: 4, targetDays: 5, posCount: 2 },
    { stage: 'Value Addition', avgDays: 3, targetDays: 3, posCount: 1 },
    { stage: 'Final Construction', avgDays: 5, targetDays: 5, posCount: 1 },
];

const stepIcons = {
    fiber: Leaf,
    spinning: Factory,
    fabric: Package,
    processing: Droplets,
    valueAdd: Layers,
    final: Shirt,
};

const stepLabels = {
    fiber: 'Fiber',
    spinning: 'Spinning',
    fabric: 'Fabric',
    processing: 'Processing',
    valueAdd: 'Value Add',
    final: 'Final',
};

export const BrandDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [selectedPO, setSelectedPO] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');

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

    const getStepCompletion = (po) => {
        const steps = Object.values(po.steps);
        const completed = steps.filter(s => s.complete).length;
        return Math.round((completed / steps.length) * 100);
    };

    const filteredPOs = globalPOTracker.filter(po => {
        if (filterStatus === 'all') return true;
        if (filterStatus === 'complete') return getStepCompletion(po) === 100;
        if (filterStatus === 'in_progress') return getStepCompletion(po) > 0 && getStepCompletion(po) < 100;
        if (filterStatus === 'delayed') return po.leadTime.status === 'delayed';
        return true;
    });

    if (!user) return null;

    return (
        <div className="min-h-screen bg-background" data-testid="brand-dashboard">
            {/* Top Navigation */}
            <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
                <div className="container flex h-16 items-center justify-between px-4 md:px-6">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Globe className="h-7 w-7 text-secondary" />
                            <span className="font-heading text-xl font-bold text-foreground">TextileTrace</span>
                        </div>
                        <Badge variant="secondary" className="hidden md:flex bg-primary/10 text-primary border-primary/30">
                            Brand Master Dashboard
                        </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4">
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
            <main className="container px-4 md:px-6 py-6">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
                            Global PO Tracker
                        </h1>
                        <p className="text-muted-foreground">
                            Track traceability completion across all purchase orders
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon">
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Button variant="outline">
                            <Download className="h-4 w-4 mr-2" />
                            Export
                        </Button>
                    </div>
                </div>

                {/* Power BI Notice */}
                <Card className="bg-primary/5 border-primary/20 mb-6">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-primary/10">
                            <BarChart3 className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                            <p className="font-medium text-foreground">Power BI Integration Ready</p>
                            <p className="text-sm text-muted-foreground">
                                Connect your Power BI workspace for live analytics. Currently showing simulated data.
                            </p>
                        </div>
                        <Badge variant="secondary">Demo Mode</Badge>
                    </CardContent>
                </Card>

                <Tabs defaultValue="tracker" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-flex">
                        <TabsTrigger value="tracker">PO Tracker</TabsTrigger>
                        <TabsTrigger value="delays" className="relative">
                            Delay Reports
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                        </TabsTrigger>
                        <TabsTrigger value="yield">Yield</TabsTrigger>
                        <TabsTrigger value="leadtime">Lead Time</TabsTrigger>
                        <TabsTrigger value="drilldown">Drill-Down</TabsTrigger>
                    </TabsList>

                    {/* PO Tracker Tab */}
                    <TabsContent value="tracker" className="space-y-6">
                        {/* Summary Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Card>
                                <CardContent className="p-4 text-center">
                                    <p className="text-3xl font-bold text-foreground">{globalPOTracker.length}</p>
                                    <p className="text-sm text-muted-foreground">Total POs</p>
                                </CardContent>
                            </Card>
                            <Card className="border-success/30 bg-success/5">
                                <CardContent className="p-4 text-center">
                                    <p className="text-3xl font-bold text-success">
                                        {globalPOTracker.filter(po => getStepCompletion(po) === 100).length}
                                    </p>
                                    <p className="text-sm text-muted-foreground">Complete</p>
                                </CardContent>
                            </Card>
                            <Card className="border-secondary/30 bg-secondary/5">
                                <CardContent className="p-4 text-center">
                                    <p className="text-3xl font-bold text-secondary">
                                        {globalPOTracker.filter(po => getStepCompletion(po) > 0 && getStepCompletion(po) < 100).length}
                                    </p>
                                    <p className="text-sm text-muted-foreground">In Progress</p>
                                </CardContent>
                            </Card>
                            <Card className="border-destructive/30 bg-destructive/5">
                                <CardContent className="p-4 text-center">
                                    <p className="text-3xl font-bold text-destructive">
                                        {globalPOTracker.filter(po => po.leadTime.status === 'delayed').length}
                                    </p>
                                    <p className="text-sm text-muted-foreground">Delayed</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Filter */}
                        <div className="flex items-center gap-4">
                            <Select value={filterStatus} onValueChange={setFilterStatus}>
                                <SelectTrigger className="w-48">
                                    <Filter className="h-4 w-4 mr-2" />
                                    <SelectValue placeholder="Filter status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All POs</SelectItem>
                                    <SelectItem value="complete">Complete</SelectItem>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="delayed">Delayed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* PO List with Step Progress */}
                        <div className="space-y-4">
                            {filteredPOs.map((po) => {
                                const completion = getStepCompletion(po);
                                return (
                                    <Card 
                                        key={po.poNumber} 
                                        className={`hover:shadow-lg transition-all ${selectedPO?.poNumber === po.poNumber ? 'ring-2 ring-primary' : ''}`}
                                        data-testid={`po-tracker-${po.poNumber}`}
                                    >
                                        <CardContent className="p-5">
                                            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                                                {/* PO Info */}
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-mono font-bold text-foreground">{po.poNumber}</span>
                                                        <Badge 
                                                            variant="outline" 
                                                            className={
                                                                completion === 100 
                                                                    ? 'bg-success/10 text-success border-success/30'
                                                                    : po.leadTime.status === 'delayed'
                                                                        ? 'bg-destructive/10 text-destructive border-destructive/30'
                                                                        : 'bg-secondary/10 text-secondary border-secondary/30'
                                                            }
                                                        >
                                                            {completion === 100 ? 'Complete' : po.leadTime.status === 'delayed' ? 'Delayed' : 'In Progress'}
                                                        </Badge>
                                                    </div>
                                                    <p className="font-medium text-foreground">{po.product}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {po.manufacturer} • {po.quantity.toLocaleString()} pcs • Due: {po.dueDate}
                                                    </p>
                                                </div>

                                                {/* Step Progress Visual */}
                                                <div className="flex items-center gap-1">
                                                    {Object.entries(po.steps).map(([key, step], idx) => {
                                                        const Icon = stepIcons[key];
                                                        return (
                                                            <React.Fragment key={key}>
                                                                <div 
                                                                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                                                                        step.complete 
                                                                            ? 'bg-success text-success-foreground' 
                                                                            : 'bg-muted text-muted-foreground'
                                                                    }`}
                                                                    title={`${stepLabels[key]}: ${step.complete ? 'Complete' : 'Pending'}`}
                                                                >
                                                                    <Icon className="h-4 w-4" />
                                                                </div>
                                                                {idx < Object.keys(po.steps).length - 1 && (
                                                                    <div className={`w-4 h-0.5 ${step.complete ? 'bg-success' : 'bg-muted'}`} />
                                                                )}
                                                            </React.Fragment>
                                                        );
                                                    })}
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center gap-2">
                                                    <div className="text-right mr-4">
                                                        <p className="text-2xl font-bold text-foreground">{completion}%</p>
                                                        <p className="text-xs text-muted-foreground">Complete</p>
                                                    </div>
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm"
                                                        onClick={() => setSelectedPO(selectedPO?.poNumber === po.poNumber ? null : po)}
                                                    >
                                                        <Eye className="h-4 w-4 mr-1" />
                                                        Drill Down
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Expanded Drill-Down View */}
                                            {selectedPO?.poNumber === po.poNumber && (
                                                <div className="mt-6 pt-6 border-t border-border">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <h4 className="font-heading font-bold text-foreground flex items-center gap-2">
                                                            <Shield className="h-4 w-4 text-secondary" />
                                                            Traceability Journey: {po.traceId}
                                                        </h4>
                                                        <Button variant="ghost" size="sm" onClick={() => setSelectedPO(null)}>
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>

                                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                                        {Object.entries(po.steps).map(([key, step]) => {
                                                            const Icon = stepIcons[key];
                                                            return (
                                                                <Card key={key} className={`${step.complete ? 'border-success/30 bg-success/5' : 'opacity-60'}`}>
                                                                    <CardContent className="p-3">
                                                                        <div className="flex items-center gap-2 mb-2">
                                                                            <Icon className={`h-4 w-4 ${step.complete ? 'text-success' : 'text-muted-foreground'}`} />
                                                                            <span className="text-xs font-medium">{stepLabels[key]}</span>
                                                                        </div>
                                                                        {step.complete ? (
                                                                            <div className="space-y-1 text-xs">
                                                                                <p className="font-medium text-foreground truncate">{step.supplier}</p>
                                                                                <p className="text-muted-foreground">{step.date}</p>
                                                                                {step.data && Object.entries(step.data).slice(0, 2).map(([k, v]) => (
                                                                                    <p key={k} className="text-muted-foreground">
                                                                                        <span className="capitalize">{k}:</span> {v}
                                                                                    </p>
                                                                                ))}
                                                                            </div>
                                                                        ) : (
                                                                            <p className="text-xs text-muted-foreground">Pending</p>
                                                                        )}
                                                                    </CardContent>
                                                                </Card>
                                                            );
                                                        })}
                                                    </div>

                                                    <div className="mt-4 flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                                        <div className="flex items-center gap-4">
                                                            <div>
                                                                <span className="text-xs text-muted-foreground">Lead Time</span>
                                                                <p className="font-bold">{po.leadTime.actual} days</p>
                                                            </div>
                                                            <div>
                                                                <span className="text-xs text-muted-foreground">Target</span>
                                                                <p className="font-bold">{po.leadTime.target} days</p>
                                                            </div>
                                                            <Badge 
                                                                variant="outline"
                                                                className={
                                                                    po.leadTime.actual <= po.leadTime.target 
                                                                        ? 'bg-success/10 text-success'
                                                                        : 'bg-destructive/10 text-destructive'
                                                                }
                                                            >
                                                                {po.leadTime.actual <= po.leadTime.target ? 'On Target' : 'Over Target'}
                                                            </Badge>
                                                        </div>
                                                        <Button variant="outline" size="sm">
                                                            <ExternalLink className="h-4 w-4 mr-1" />
                                                            View Full Report
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </TabsContent>

                    {/* Delay Reports Tab - NEW (synced from Manufacturer RCA) */}
                    <TabsContent value="delays" className="space-y-6">
                        <Card className="border-red-200 bg-red-50/50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-red-700">
                                    <AlertTriangle className="h-5 w-5" />
                                    Manufacturer Delay Reports
                                </CardTitle>
                                <CardDescription>
                                    Real-time delay reasons synced from manufacturers (via webhook simulation)
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <DelayReportsSection />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Yield Conversion Tab - NEW */}
                    <TabsContent value="yield" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Scale className="h-5 w-5 text-accent" />
                                    Yield Conversion Metrics
                                </CardTitle>
                                <CardDescription>
                                    Real-time material flow from Fiber to Finished Garments
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {globalPOTracker.map((po) => {
                                    // Calculate yield from step data
                                    const fiberKg = po.steps.fiber.complete ? parseInt(po.steps.fiber.data.weight?.replace(/[^0-9]/g, '') || 0) : 0;
                                    const yarnKg = po.steps.spinning.complete ? parseInt(po.steps.spinning.data.weight?.replace(/[^0-9]/g, '') || 0) : 0;
                                    const fabricM = po.steps.fabric.complete ? parseInt(po.steps.fabric.data.meters?.replace(/[^0-9]/g, '') || 0) : 0;
                                    const finalUnits = po.steps.final.complete ? parseInt(po.steps.final.data.packed?.replace(/[^0-9]/g, '') || 0) : 0;
                                    const targetUnits = po.quantity;
                                    const efficiency = finalUnits > 0 ? Math.round((finalUnits / targetUnits) * 100) : 0;
                                    
                                    return (
                                        <div key={po.poNumber} className="p-4 rounded-xl border bg-card">
                                            <div className="flex items-center justify-between mb-4">
                                                <div>
                                                    <span className="font-mono font-medium">{po.poNumber}</span>
                                                    <p className="text-sm text-muted-foreground">{po.product}</p>
                                                </div>
                                                <Badge variant={efficiency >= 95 ? 'default' : efficiency >= 80 ? 'secondary' : 'destructive'}>
                                                    {efficiency > 0 ? `${efficiency}% Yield` : 'In Progress'}
                                                </Badge>
                                            </div>
                                            
                                            {/* Yield Flow Visualization */}
                                            <div className="flex items-center gap-2 overflow-x-auto pb-2">
                                                <div className="flex-shrink-0 text-center p-3 rounded-xl bg-green-50 min-w-[90px]">
                                                    <Leaf className="h-4 w-4 text-green-600 mx-auto mb-1" />
                                                    <p className="text-lg font-bold text-green-700">{fiberKg.toLocaleString()}</p>
                                                    <p className="text-[10px] text-muted-foreground">KG Fiber</p>
                                                </div>
                                                <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                                <div className="flex-shrink-0 text-center p-3 rounded-xl bg-blue-50 min-w-[90px]">
                                                    <Factory className="h-4 w-4 text-blue-600 mx-auto mb-1" />
                                                    <p className="text-lg font-bold text-blue-700">{yarnKg.toLocaleString()}</p>
                                                    <p className="text-[10px] text-muted-foreground">KG Yarn</p>
                                                </div>
                                                <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                                <div className="flex-shrink-0 text-center p-3 rounded-xl bg-purple-50 min-w-[90px]">
                                                    <Package className="h-4 w-4 text-purple-600 mx-auto mb-1" />
                                                    <p className="text-lg font-bold text-purple-700">{fabricM.toLocaleString()}</p>
                                                    <p className="text-[10px] text-muted-foreground">M Fabric</p>
                                                </div>
                                                <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                                <div className={`flex-shrink-0 text-center p-3 rounded-xl min-w-[90px] ${finalUnits > 0 ? 'bg-success/10' : 'bg-muted'}`}>
                                                    <Shirt className={`h-4 w-4 mx-auto mb-1 ${finalUnits > 0 ? 'text-success' : 'text-muted-foreground'}`} />
                                                    <p className={`text-lg font-bold ${finalUnits > 0 ? 'text-success' : 'text-muted-foreground'}`}>
                                                        {finalUnits > 0 ? finalUnits.toLocaleString() : '-'}
                                                    </p>
                                                    <p className="text-[10px] text-muted-foreground">/{targetUnits.toLocaleString()} pcs</p>
                                                </div>
                                            </div>
                                            
                                            {/* Conversion Ratios */}
                                            {fiberKg > 0 && (
                                                <div className="mt-3 pt-3 border-t flex items-center gap-4 text-xs text-muted-foreground">
                                                    {yarnKg > 0 && (
                                                        <span>Fiber→Yarn: {Math.round((yarnKg / fiberKg) * 100)}%</span>
                                                    )}
                                                    {yarnKg > 0 && fabricM > 0 && (
                                                        <span>1 KG = {(fabricM / yarnKg).toFixed(1)} M</span>
                                                    )}
                                                    {fabricM > 0 && finalUnits > 0 && (
                                                        <span>{(fabricM / finalUnits).toFixed(2)} M/garment</span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </CardContent>
                        </Card>
                        
                        {/* Summary Card */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card className="bg-green-50 border-green-200">
                                <CardContent className="p-6 text-center">
                                    <Leaf className="h-8 w-8 text-green-600 mx-auto mb-2" />
                                    <p className="text-3xl font-bold text-green-700">3,500</p>
                                    <p className="text-sm text-muted-foreground">Total KG Fiber Sourced</p>
                                </CardContent>
                            </Card>
                            <Card className="bg-purple-50 border-purple-200">
                                <CardContent className="p-6 text-center">
                                    <Package className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                                    <p className="text-3xl font-bold text-purple-700">13,700</p>
                                    <p className="text-sm text-muted-foreground">Total Meters Fabric</p>
                                </CardContent>
                            </Card>
                            <Card className="bg-success/10 border-success/30">
                                <CardContent className="p-6 text-center">
                                    <Shirt className="h-8 w-8 text-success mx-auto mb-2" />
                                    <p className="text-3xl font-bold text-success">2,950</p>
                                    <p className="text-sm text-muted-foreground">Garments Shipped</p>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Lead Time Analysis Tab */}
                    <TabsContent value="leadtime" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Lead Time Analysis by Stage</CardTitle>
                                <CardDescription>
                                    Average days at each production stage vs target across all POs
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {leadTimeAnalysis.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-4">
                                        <div className="w-40 text-sm font-medium text-foreground">{item.stage}</div>
                                        <div className="flex-1">
                                            <div className="relative h-8 bg-muted rounded-lg overflow-hidden">
                                                <div 
                                                    className={`absolute inset-y-0 left-0 rounded-lg ${
                                                        item.avgDays <= item.targetDays ? 'bg-success' : 'bg-destructive'
                                                    }`}
                                                    style={{ width: `${Math.min((item.avgDays / 10) * 100, 100)}%` }}
                                                />
                                                <div 
                                                    className="absolute inset-y-0 w-0.5 bg-foreground/50"
                                                    style={{ left: `${(item.targetDays / 10) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                        <div className="w-32 text-right">
                                            <span className="font-medium">{item.avgDays}d</span>
                                            <span className="text-muted-foreground text-xs"> / {item.targetDays}d target</span>
                                        </div>
                                        <Badge variant="outline" className="w-16 justify-center">
                                            {item.posCount} POs
                                        </Badge>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card>
                                <CardContent className="p-6 text-center">
                                    <p className="text-4xl font-bold text-foreground">29</p>
                                    <p className="text-sm text-muted-foreground mt-1">Avg Total Lead Time (Days)</p>
                                    <Badge variant="outline" className="mt-2 bg-success/10 text-success border-success/30">
                                        On Target
                                    </Badge>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-6 text-center">
                                    <p className="text-4xl font-bold text-foreground">Spinning</p>
                                    <p className="text-sm text-muted-foreground mt-1">Longest Stage</p>
                                    <Badge variant="outline" className="mt-2">7 days avg</Badge>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-6 text-center">
                                    <p className="text-4xl font-bold text-foreground">67%</p>
                                    <p className="text-sm text-muted-foreground mt-1">On-Time Completion Rate</p>
                                    <Badge variant="outline" className="mt-2 bg-warning/10 text-warning border-warning/30">
                                        Target: 80%
                                    </Badge>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Journey Drill-Down Tab */}
                    <TabsContent value="drilldown" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Select a PO to View Full Journey</CardTitle>
                                <CardDescription>
                                    Click on any PO to see the complete supply chain story
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Select onValueChange={(v) => setSelectedPO(globalPOTracker.find(po => po.poNumber === v))}>
                                    <SelectTrigger className="w-full md:w-96">
                                        <SelectValue placeholder="Select Purchase Order" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {globalPOTracker.map((po) => (
                                            <SelectItem key={po.poNumber} value={po.poNumber}>
                                                {po.poNumber} - {po.product}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </CardContent>
                        </Card>

                        {selectedPO && (
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="flex items-center gap-2">
                                                <Shield className="h-5 w-5 text-secondary" />
                                                Journey: {selectedPO.poNumber}
                                            </CardTitle>
                                            <CardDescription>{selectedPO.product} - {selectedPO.traceId}</CardDescription>
                                        </div>
                                        <Badge variant="outline" className="bg-secondary/10 text-secondary">
                                            {getStepCompletion(selectedPO)}% Complete
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-6">
                                        {Object.entries(selectedPO.steps).map(([key, step], idx) => {
                                            const Icon = stepIcons[key];
                                            return (
                                                <div key={key} className="flex items-start gap-4">
                                                    <div className="relative">
                                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                                            step.complete ? 'bg-success text-success-foreground' : 'bg-muted text-muted-foreground'
                                                        }`}>
                                                            <Icon className="h-6 w-6" />
                                                        </div>
                                                        {idx < Object.keys(selectedPO.steps).length - 1 && (
                                                            <div className={`absolute top-12 left-1/2 w-0.5 h-12 -translate-x-1/2 ${
                                                                step.complete ? 'bg-success' : 'bg-muted'
                                                            }`} />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 pb-6">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <h4 className="font-medium text-foreground">{stepLabels[key]}</h4>
                                                            {step.complete && (
                                                                <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                                                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                                                    Verified
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        {step.complete ? (
                                                            <Card className="bg-muted/30">
                                                                <CardContent className="p-4">
                                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                                        <div>
                                                                            <span className="text-muted-foreground">Supplier</span>
                                                                            <p className="font-medium">{step.supplier}</p>
                                                                        </div>
                                                                        <div>
                                                                            <span className="text-muted-foreground">Date</span>
                                                                            <p className="font-medium">{step.date}</p>
                                                                        </div>
                                                                        {step.data && Object.entries(step.data).map(([k, v]) => (
                                                                            <div key={k}>
                                                                                <span className="text-muted-foreground capitalize">{k}</span>
                                                                                <p className="font-medium">{v}</p>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </CardContent>
                                                            </Card>
                                                        ) : (
                                                            <p className="text-sm text-muted-foreground">Awaiting data from manufacturer</p>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
};

export default BrandDashboard;
