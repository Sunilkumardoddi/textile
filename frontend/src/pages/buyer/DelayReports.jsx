import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
    AlertTriangle, Clock, Calendar, Filter, Download, ChevronDown,
    Factory, Package, Droplets, CheckCircle2, XCircle, ArrowUpRight,
    Search, ChevronRight, Bell, RefreshCw, TrendingUp, Users
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

// Mock delay data
const mockDelays = [
    {
        id: 'DL-2024-001',
        poNumber: 'PO-2024-002',
        product: 'Recycled Polyester Jackets',
        supplier: 'Mumbai Fabrics Co',
        supplierTier: 'Tier 1',
        stage: 'Spinning',
        stageSupplier: 'SpinCo Ltd',
        reason: 'Raw material shortage - Recycled polyester chips unavailable',
        reportedDate: '2024-02-10',
        expectedResolution: '2024-02-18',
        daysDelayed: 5,
        impactLevel: 'high',
        status: 'active',
        affectedQuantity: '2,000 KG',
        escalated: true,
        notes: 'Alternative supplier being contacted. Expected 3-day additional delay.',
        timeline: [
            { date: '2024-02-10', event: 'Delay reported by SpinCo Ltd', type: 'alert' },
            { date: '2024-02-11', event: 'Root cause analysis completed', type: 'update' },
            { date: '2024-02-12', event: 'Escalated to procurement team', type: 'escalation' },
            { date: '2024-02-13', event: 'Alternative supplier identified', type: 'resolution' },
        ]
    },
    {
        id: 'DL-2024-002',
        poNumber: 'PO-2024-005',
        product: 'Organic Cotton Dresses',
        supplier: 'Vietnam Textiles',
        supplierTier: 'Tier 1',
        stage: 'Dyeing & Processing',
        stageSupplier: 'ColorTex Industries',
        reason: 'Equipment maintenance - Dyeing machine under repair',
        reportedDate: '2024-02-12',
        expectedResolution: '2024-02-15',
        daysDelayed: 3,
        impactLevel: 'medium',
        status: 'active',
        affectedQuantity: '15,000 Meters',
        escalated: false,
        notes: 'Maintenance scheduled completion by Feb 15.',
        timeline: [
            { date: '2024-02-12', event: 'Delay flagged due to equipment issue', type: 'alert' },
            { date: '2024-02-13', event: 'Maintenance team deployed', type: 'update' },
        ]
    },
    {
        id: 'DL-2024-003',
        poNumber: 'PO-2024-008',
        product: 'BCI Cotton T-Shirts',
        supplier: 'Dhaka Textiles Ltd',
        supplierTier: 'Tier 2',
        stage: 'Fiber Sourcing',
        stageSupplier: 'Organic Farms Co-op',
        reason: 'Certification pending - GOTS certificate renewal in progress',
        reportedDate: '2024-02-08',
        expectedResolution: '2024-02-20',
        daysDelayed: 7,
        impactLevel: 'high',
        status: 'active',
        affectedQuantity: '5,000 KG',
        escalated: true,
        notes: 'Certification body audit scheduled for Feb 16.',
        timeline: [
            { date: '2024-02-08', event: 'Certification expiry flagged', type: 'alert' },
            { date: '2024-02-09', event: 'Renewal application submitted', type: 'update' },
            { date: '2024-02-11', event: 'Audit scheduled', type: 'update' },
            { date: '2024-02-14', event: 'Escalated to compliance team', type: 'escalation' },
        ]
    },
    {
        id: 'DL-2024-004',
        poNumber: 'PO-2024-003',
        product: 'Hemp Blend Shirts',
        supplier: 'Vietnam Textiles',
        supplierTier: 'Tier 1',
        stage: 'CMT',
        stageSupplier: 'SewRight Manufacturing',
        reason: 'Labor shortage - Skilled operators on leave during festival',
        reportedDate: '2024-02-05',
        expectedResolution: '2024-02-10',
        daysDelayed: 2,
        impactLevel: 'low',
        status: 'resolved',
        affectedQuantity: '1,500 Units',
        escalated: false,
        resolvedDate: '2024-02-09',
        notes: 'Production resumed on Feb 9. Caught up with schedule.',
        timeline: [
            { date: '2024-02-05', event: 'Delay reported due to festival holidays', type: 'alert' },
            { date: '2024-02-07', event: 'Temporary staff arranged', type: 'update' },
            { date: '2024-02-09', event: 'Production resumed at full capacity', type: 'resolution' },
        ]
    },
];

const delayStats = {
    totalActive: 3,
    totalResolved: 1,
    avgResolutionDays: 4.2,
    criticalDelays: 2,
    suppliersAffected: 4,
};

const stageIcons = {
    'Fiber Sourcing': Package,
    'Spinning': Factory,
    'Dyeing & Processing': Droplets,
    'CMT': Factory,
};

export const DelayReports = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterImpact, setFilterImpact] = useState('all');
    const [selectedDelay, setSelectedDelay] = useState(null);

    const filteredDelays = mockDelays.filter(delay => {
        const matchesSearch = delay.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            delay.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            delay.supplier.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === 'all' || delay.status === filterStatus;
        const matchesImpact = filterImpact === 'all' || delay.impactLevel === filterImpact;
        return matchesSearch && matchesStatus && matchesImpact;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
                        <AlertTriangle className="h-8 w-8 text-destructive" />
                        Delay Reports
                    </h1>
                    <p className="text-muted-foreground">
                        Monitor and manage supplier delays across your supply chain
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon">
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export Report
                    </Button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card className="border-destructive/30 bg-destructive/5">
                    <CardContent className="p-4 text-center">
                        <p className="text-3xl font-bold text-destructive">{delayStats.totalActive}</p>
                        <p className="text-sm text-muted-foreground">Active Delays</p>
                    </CardContent>
                </Card>
                <Card className="border-success/30 bg-success/5">
                    <CardContent className="p-4 text-center">
                        <p className="text-3xl font-bold text-success">{delayStats.totalResolved}</p>
                        <p className="text-sm text-muted-foreground">Resolved</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <p className="text-3xl font-bold text-foreground">{delayStats.avgResolutionDays}</p>
                        <p className="text-sm text-muted-foreground">Avg Resolution (Days)</p>
                    </CardContent>
                </Card>
                <Card className="border-warning/30 bg-warning/5">
                    <CardContent className="p-4 text-center">
                        <p className="text-3xl font-bold text-warning">{delayStats.criticalDelays}</p>
                        <p className="text-sm text-muted-foreground">Critical</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <p className="text-3xl font-bold text-foreground">{delayStats.suppliersAffected}</p>
                        <p className="text-sm text-muted-foreground">Suppliers Affected</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search by PO, product, or supplier..." 
                                className="pl-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="resolved">Resolved</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={filterImpact} onValueChange={setFilterImpact}>
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Impact" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Impact</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="low">Low</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Delays List */}
                <div className="lg:col-span-2 space-y-4">
                    {filteredDelays.length === 0 ? (
                        <Card>
                            <CardContent className="p-8 text-center">
                                <CheckCircle2 className="h-12 w-12 text-success mx-auto mb-4" />
                                <p className="text-lg font-medium text-foreground">No delays found</p>
                                <p className="text-sm text-muted-foreground">All suppliers are operating on schedule</p>
                            </CardContent>
                        </Card>
                    ) : (
                        filteredDelays.map((delay) => {
                            const StageIcon = stageIcons[delay.stage] || Package;
                            return (
                                <Card 
                                    key={delay.id} 
                                    className={`cursor-pointer transition-all hover:shadow-lg ${
                                        selectedDelay?.id === delay.id ? 'ring-2 ring-primary' : ''
                                    } ${
                                        delay.status === 'resolved' ? 'opacity-75' : ''
                                    }`}
                                    onClick={() => setSelectedDelay(delay)}
                                    data-testid={`delay-card-${delay.id}`}
                                >
                                    <CardContent className="p-5">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-start gap-3">
                                                <div className={`p-2.5 rounded-xl ${
                                                    delay.impactLevel === 'high' ? 'bg-destructive/10 text-destructive' :
                                                    delay.impactLevel === 'medium' ? 'bg-warning/10 text-warning' :
                                                    'bg-muted text-muted-foreground'
                                                }`}>
                                                    <StageIcon className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-medium text-foreground">{delay.poNumber}</span>
                                                        {delay.escalated && (
                                                            <Badge variant="destructive" className="text-[10px] h-5">
                                                                <Bell className="h-3 w-3 mr-1" />
                                                                Escalated
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">{delay.product}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <Badge 
                                                    variant="outline"
                                                    className={
                                                        delay.status === 'resolved' 
                                                            ? 'bg-success/10 text-success border-success/30'
                                                            : delay.impactLevel === 'high' 
                                                                ? 'bg-destructive/10 text-destructive border-destructive/30'
                                                                : delay.impactLevel === 'medium'
                                                                    ? 'bg-warning/10 text-warning border-warning/30'
                                                                    : 'bg-muted text-muted-foreground'
                                                    }
                                                >
                                                    {delay.status === 'resolved' ? (
                                                        <><CheckCircle2 className="h-3 w-3 mr-1" />Resolved</>
                                                    ) : (
                                                        <><Clock className="h-3 w-3 mr-1" />+{delay.daysDelayed} days</>
                                                    )}
                                                </Badge>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                                            <div>
                                                <span className="text-muted-foreground">Stage:</span>
                                                <span className="font-medium ml-2 text-foreground">{delay.stage}</span>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Supplier:</span>
                                                <span className="font-medium ml-2 text-foreground">{delay.stageSupplier}</span>
                                            </div>
                                        </div>

                                        <div className={`p-3 rounded-lg ${
                                            delay.impactLevel === 'high' ? 'bg-destructive/5 border border-destructive/20' :
                                            delay.impactLevel === 'medium' ? 'bg-warning/5 border border-warning/20' :
                                            'bg-muted/50'
                                        }`}>
                                            <p className="text-sm">
                                                <strong>Reason:</strong> {delay.reason}
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    Reported: {delay.reportedDate}
                                                </span>
                                                {delay.status === 'resolved' ? (
                                                    <span className="flex items-center gap-1 text-success">
                                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                                        Resolved: {delay.resolvedDate}
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-3.5 w-3.5" />
                                                        Expected: {delay.expectedResolution}
                                                    </span>
                                                )}
                                            </div>
                                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })
                    )}
                </div>

                {/* Detail Panel */}
                <div className="space-y-4">
                    {selectedDelay ? (
                        <>
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg">Delay Details</CardTitle>
                                    <CardDescription>{selectedDelay.id}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-muted-foreground">Impact Level</span>
                                            <Badge 
                                                variant="outline"
                                                className={
                                                    selectedDelay.impactLevel === 'high' 
                                                        ? 'bg-destructive/10 text-destructive'
                                                        : selectedDelay.impactLevel === 'medium'
                                                            ? 'bg-warning/10 text-warning'
                                                            : 'bg-muted'
                                                }
                                            >
                                                {selectedDelay.impactLevel.charAt(0).toUpperCase() + selectedDelay.impactLevel.slice(1)}
                                            </Badge>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-muted-foreground">Affected Quantity</span>
                                            <span className="text-sm font-medium">{selectedDelay.affectedQuantity}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-muted-foreground">Supplier Tier</span>
                                            <span className="text-sm font-medium">{selectedDelay.supplierTier}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-muted-foreground">Main Supplier</span>
                                            <span className="text-sm font-medium">{selectedDelay.supplier}</span>
                                        </div>
                                    </div>

                                    <div className="pt-3 border-t">
                                        <p className="text-sm text-muted-foreground mb-2">Notes</p>
                                        <p className="text-sm bg-muted/50 p-3 rounded-lg">{selectedDelay.notes}</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        Timeline
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {selectedDelay.timeline.map((event, idx) => (
                                            <div key={idx} className="flex gap-3">
                                                <div className={`w-2 h-2 rounded-full mt-2 ${
                                                    event.type === 'alert' ? 'bg-destructive' :
                                                    event.type === 'escalation' ? 'bg-warning' :
                                                    event.type === 'resolution' ? 'bg-success' :
                                                    'bg-secondary'
                                                }`} />
                                                <div className="flex-1">
                                                    <p className="text-sm text-foreground">{event.event}</p>
                                                    <p className="text-xs text-muted-foreground">{event.date}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="flex gap-2">
                                <Button variant="outline" className="flex-1">
                                    Contact Supplier
                                </Button>
                                <Button variant="hero" className="flex-1">
                                    View PO Details
                                </Button>
                            </div>
                        </>
                    ) : (
                        <Card className="h-64 flex items-center justify-center">
                            <CardContent className="text-center">
                                <AlertTriangle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                                <p className="text-muted-foreground">Select a delay to view details</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DelayReports;
