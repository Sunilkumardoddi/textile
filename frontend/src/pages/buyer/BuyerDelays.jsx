import React, { useState } from 'react';
import { 
    AlertTriangle, Clock, Calendar, Filter, Search,
    ChevronRight, Factory, CheckCircle2, XCircle, MessageSquare
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

// Mock delay data with supplier-provided reasons
const mockDelays = [
    {
        id: 'DL-2024-001',
        poNumber: 'PO-2024-002',
        product: 'Recycled Polyester Jackets',
        stage: 'Spinning',
        supplier: 'SpinCo Textiles Ltd',
        supplierContact: 'supplier@spinco.com',
        daysDelayed: 5,
        originalDue: '2024-01-25',
        revisedDue: '2024-01-30',
        reason: 'Raw material shortage - Recycled polyester chips delayed from supplier',
        reasonCategory: 'Material Shortage',
        impact: 'high',
        status: 'active',
        flaggedDate: '2024-01-20',
        supplierResponse: 'Material expected by Jan 28. Production will resume immediately upon receipt.',
        attachments: ['delay_proof.pdf']
    },
    {
        id: 'DL-2024-002',
        poNumber: 'PO-2024-005',
        product: 'Linen Summer Dresses',
        stage: 'Dyeing',
        supplier: 'ColorTex Industries',
        supplierContact: 'ops@colortex.com',
        daysDelayed: 3,
        originalDue: '2024-01-28',
        revisedDue: '2024-01-31',
        reason: 'Equipment maintenance - Main dyeing machine under scheduled maintenance',
        reasonCategory: 'Equipment Issue',
        impact: 'medium',
        status: 'active',
        flaggedDate: '2024-01-25',
        supplierResponse: 'Maintenance completion expected by Jan 29. Backup machine available for partial capacity.',
        attachments: []
    },
    {
        id: 'DL-2024-003',
        poNumber: 'PO-2024-008',
        product: 'Organic Cotton Basics',
        stage: 'Fiber Sourcing',
        supplier: 'Organic Farms Cooperative',
        supplierContact: 'sales@organicfarms.in',
        daysDelayed: 7,
        originalDue: '2024-01-15',
        revisedDue: '2024-01-22',
        reason: 'Certification delay - GOTS certification renewal in progress',
        reasonCategory: 'Certification',
        impact: 'high',
        status: 'resolved',
        flaggedDate: '2024-01-10',
        supplierResponse: 'GOTS certification renewed on Jan 20. Shipment dispatched Jan 21.',
        resolvedDate: '2024-01-22',
        attachments: ['gots_certificate.pdf']
    },
    {
        id: 'DL-2024-004',
        poNumber: 'PO-2024-003',
        product: 'Hemp Blend Shirts',
        stage: 'CMT',
        supplier: 'Garment Solutions Ltd',
        supplierContact: 'production@garmentsol.bd',
        daysDelayed: 2,
        originalDue: '2024-01-30',
        revisedDue: '2024-02-01',
        reason: 'Worker shortage - Public holiday extended workforce availability issue',
        reasonCategory: 'Labor',
        impact: 'low',
        status: 'resolved',
        flaggedDate: '2024-01-28',
        supplierResponse: 'Additional shift scheduled. Back on track.',
        resolvedDate: '2024-01-31',
        attachments: []
    },
];

const reasonCategories = ['All', 'Material Shortage', 'Equipment Issue', 'Certification', 'Labor', 'Quality Issue', 'Logistics', 'Other'];

export const BuyerDelays = () => {
    const [delays, setDelays] = useState(mockDelays);
    const [activeTab, setActiveTab] = useState('active');
    const [filterCategory, setFilterCategory] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDelay, setSelectedDelay] = useState(null);

    const filteredDelays = delays.filter(delay => {
        const matchesTab = activeTab === 'all' || delay.status === activeTab;
        const matchesCategory = filterCategory === 'All' || delay.reasonCategory === filterCategory;
        const matchesSearch = delay.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            delay.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            delay.supplier.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesTab && matchesCategory && matchesSearch;
    });

    const stats = {
        active: delays.filter(d => d.status === 'active').length,
        resolved: delays.filter(d => d.status === 'resolved').length,
        highImpact: delays.filter(d => d.impact === 'high' && d.status === 'active').length,
        avgDelay: Math.round(delays.reduce((sum, d) => sum + d.daysDelayed, 0) / delays.length * 10) / 10,
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
                        Delay Reports
                    </h1>
                    <p className="text-muted-foreground">
                        Monitor and track production delays with supplier explanations
                    </p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className={stats.active > 0 ? 'border-destructive/50' : ''}>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Active Delays</p>
                                <p className="text-2xl font-bold text-destructive">{stats.active}</p>
                            </div>
                            <AlertTriangle className="h-8 w-8 text-destructive/50" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Resolved</p>
                                <p className="text-2xl font-bold text-success">{stats.resolved}</p>
                            </div>
                            <CheckCircle2 className="h-8 w-8 text-success/50" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">High Impact</p>
                                <p className="text-2xl font-bold text-warning">{stats.highImpact}</p>
                            </div>
                            <XCircle className="h-8 w-8 text-warning/50" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Avg Delay</p>
                                <p className="text-2xl font-bold text-foreground">{stats.avgDelay}d</p>
                            </div>
                            <Clock className="h-8 w-8 text-muted-foreground/50" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search PO, product, supplier..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={filterCategory} onValueChange={setFilterCategory}>
                            <SelectTrigger className="w-48">
                                <Filter className="h-4 w-4 mr-2" />
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {reasonCategories.map((cat) => (
                                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="active" className="text-destructive data-[state=active]:text-destructive">
                        Active ({stats.active})
                    </TabsTrigger>
                    <TabsTrigger value="resolved">
                        Resolved ({stats.resolved})
                    </TabsTrigger>
                    <TabsTrigger value="all">
                        All
                    </TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="mt-6">
                    <div className="space-y-4">
                        {filteredDelays.map((delay) => (
                            <Card 
                                key={delay.id}
                                className={`overflow-hidden ${
                                    delay.status === 'active' && delay.impact === 'high' 
                                        ? 'border-destructive/50' 
                                        : ''
                                }`}
                            >
                                <CardContent className="p-0">
                                    <div className="flex flex-col lg:flex-row">
                                        {/* Main Info */}
                                        <div className="flex-1 p-5">
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-semibold text-foreground">{delay.poNumber}</span>
                                                        <Badge 
                                                            variant="outline"
                                                            className={
                                                                delay.impact === 'high' ? 'bg-destructive/10 text-destructive border-destructive/30' :
                                                                delay.impact === 'medium' ? 'bg-warning/10 text-warning border-warning/30' :
                                                                'bg-muted text-muted-foreground'
                                                            }
                                                        >
                                                            {delay.impact} impact
                                                        </Badge>
                                                        {delay.status === 'resolved' && (
                                                            <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                                                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                                                Resolved
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">{delay.product}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-lg font-bold text-destructive">+{delay.daysDelayed} days</p>
                                                    <p className="text-xs text-muted-foreground">delay</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                                                <div>
                                                    <p className="text-muted-foreground">Stage</p>
                                                    <p className="font-medium">{delay.stage}</p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground">Supplier</p>
                                                    <p className="font-medium">{delay.supplier}</p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground">Original Due</p>
                                                    <p className="font-medium">{delay.originalDue}</p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground">Revised Due</p>
                                                    <p className="font-medium text-warning">{delay.revisedDue}</p>
                                                </div>
                                            </div>

                                            {/* Reason */}
                                            <div className="p-3 rounded-lg bg-muted/50 mb-3">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <AlertTriangle className="h-4 w-4 text-warning" />
                                                    <span className="text-sm font-medium text-foreground">Delay Reason</span>
                                                    <Badge variant="secondary" className="text-[10px]">{delay.reasonCategory}</Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground">{delay.reason}</p>
                                            </div>

                                            {/* Supplier Response */}
                                            <div className="p-3 rounded-lg bg-secondary/10 border border-secondary/20">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <MessageSquare className="h-4 w-4 text-secondary" />
                                                    <span className="text-sm font-medium text-foreground">Supplier Response</span>
                                                </div>
                                                <p className="text-sm text-muted-foreground">{delay.supplierResponse}</p>
                                            </div>
                                        </div>

                                        {/* Side Panel */}
                                        <div className="lg:w-48 bg-muted/30 p-4 border-t lg:border-t-0 lg:border-l border-border">
                                            <div className="space-y-3 text-sm">
                                                <div>
                                                    <p className="text-muted-foreground text-xs">Flagged</p>
                                                    <p className="font-medium">{delay.flaggedDate}</p>
                                                </div>
                                                {delay.resolvedDate && (
                                                    <div>
                                                        <p className="text-muted-foreground text-xs">Resolved</p>
                                                        <p className="font-medium text-success">{delay.resolvedDate}</p>
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-muted-foreground text-xs">ID</p>
                                                    <p className="font-mono text-xs">{delay.id}</p>
                                                </div>
                                                {delay.attachments.length > 0 && (
                                                    <div>
                                                        <p className="text-muted-foreground text-xs mb-1">Attachments</p>
                                                        {delay.attachments.map((file, idx) => (
                                                            <Badge key={idx} variant="outline" className="text-[10px] mr-1">
                                                                {file}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        {filteredDelays.length === 0 && (
                            <Card>
                                <CardContent className="p-12 text-center">
                                    <CheckCircle2 className="h-12 w-12 mx-auto text-success/50 mb-4" />
                                    <p className="text-muted-foreground">No delays found</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default BuyerDelays;
