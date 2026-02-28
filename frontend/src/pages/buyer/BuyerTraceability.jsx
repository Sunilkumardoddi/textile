import React, { useState } from 'react';
import { 
    Package, Leaf, Factory, Droplets, Shirt, CheckCircle2,
    ChevronRight, MapPin, Calendar, Clock, AlertTriangle,
    Search, Filter, Eye, QrCode, Download, ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock traceability data
const mockTraceData = {
    po: 'PO-2024-001',
    product: 'Organic Cotton T-Shirts',
    quantity: '5,000 pcs',
    totalWeight: '1,250 KG',
    stages: [
        {
            id: 'fiber',
            name: 'Fiber Sourcing',
            icon: Leaf,
            status: 'complete',
            supplier: 'Organic Farms Co-op',
            location: 'Gujarat, India',
            date: '2024-01-05',
            input: { qty: '1,500 KG', unit: 'Raw Cotton' },
            output: { qty: '1,450 KG', unit: 'Clean Cotton' },
            certifications: ['GOTS', 'OCS'],
            documents: ['Certificate of Origin', 'Organic Cert'],
        },
        {
            id: 'spinning',
            name: 'Spinning',
            icon: Factory,
            status: 'complete',
            supplier: 'SpinWell Textiles',
            location: 'Coimbatore, India',
            date: '2024-01-12',
            input: { qty: '1,450 KG', unit: 'Clean Cotton' },
            output: { qty: '1,380 KG', unit: 'Cotton Yarn (30s)' },
            certifications: ['GOTS'],
            documents: ['Yarn Test Report', 'Lot Card'],
        },
        {
            id: 'fabric',
            name: 'Fabric Production',
            icon: Package,
            status: 'complete',
            supplier: 'KnitCraft Industries',
            location: 'Tirupur, India',
            date: '2024-01-18',
            input: { qty: '1,380 KG', unit: 'Cotton Yarn' },
            output: { qty: '7,500 M', unit: 'Jersey Fabric (180 GSM)' },
            conversion: '1 KG = ~5.4 Meters',
            certifications: ['GOTS'],
            documents: ['Fabric Inspection Report'],
        },
        {
            id: 'processing',
            name: 'Dyeing & Processing',
            icon: Droplets,
            status: 'in_progress',
            progress: 80,
            supplier: 'ColorEco Processing',
            location: 'Tirupur, India',
            date: '2024-01-22',
            input: { qty: '7,500 M', unit: 'Grey Fabric' },
            output: { qty: '7,200 M', unit: 'Finished Fabric' },
            certifications: ['GOTS', 'OEKO-TEX'],
            documents: ['Color Matching Report'],
        },
        {
            id: 'cmt',
            name: 'CMT (Cut-Make-Trim)',
            icon: Shirt,
            status: 'in_progress',
            progress: 40,
            supplier: 'FairStitch Garments',
            location: 'Dhaka, Bangladesh',
            date: '2024-01-28',
            input: { qty: '7,200 M', unit: 'Finished Fabric' },
            output: { qty: '3,250 pcs', unit: 'T-Shirts (of 5,000)' },
            conversion: '1.44 M per garment',
            certifications: ['SA8000', 'WRAP'],
            documents: ['Cutting Report', 'Production Log'],
        },
        {
            id: 'final',
            name: 'Final QC & Packing',
            icon: CheckCircle2,
            status: 'pending',
            supplier: 'QualityFirst Labs',
            location: 'Dhaka, Bangladesh',
            date: 'Est. 2024-02-05',
            input: { qty: '-', unit: 'Finished Garments' },
            output: { qty: '-', unit: 'Packed Units' },
            certifications: ['AQL 2.5'],
            documents: [],
        },
    ],
};

const statusColors = {
    complete: 'bg-success text-success-foreground',
    in_progress: 'bg-secondary text-secondary-foreground',
    pending: 'bg-muted text-muted-foreground',
};

export const BuyerTraceability = () => {
    const [selectedStage, setSelectedStage] = useState(null);
    const [viewMode, setViewMode] = useState('timeline');

    const overallProgress = Math.round(
        (mockTraceData.stages.filter(s => s.status === 'complete').length / mockTraceData.stages.length) * 100
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
                        Supply Chain Traceability
                    </h1>
                    <p className="text-muted-foreground">
                        Track materials and production across your supply chain
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Select defaultValue="PO-2024-001">
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="Select PO" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="PO-2024-001">PO-2024-001</SelectItem>
                            <SelectItem value="PO-2024-002">PO-2024-002</SelectItem>
                            <SelectItem value="PO-2024-003">PO-2024-003</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                </div>
            </div>

            {/* PO Overview Card */}
            <Card className="bg-gradient-to-r from-primary/5 to-secondary/5">
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <Badge variant="secondary" className="mb-2">{mockTraceData.po}</Badge>
                            <h2 className="font-heading text-xl font-bold text-foreground">{mockTraceData.product}</h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                {mockTraceData.quantity} • Total Weight: {mockTraceData.totalWeight}
                            </p>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="text-center">
                                <div className="relative w-20 h-20">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle cx="40" cy="40" r="35" fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
                                        <circle 
                                            cx="40" cy="40" r="35" 
                                            fill="none" 
                                            stroke="hsl(var(--secondary))" 
                                            strokeWidth="6"
                                            strokeDasharray={`${overallProgress * 2.2} ${220 - overallProgress * 2.2}`}
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-lg font-bold">{overallProgress}%</span>
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Overall Progress</p>
                            </div>
                            <Button variant="hero">
                                <QrCode className="h-4 w-4 mr-2" />
                                Generate QR
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* View Toggle */}
            <div className="flex items-center gap-2">
                <Button 
                    variant={viewMode === 'timeline' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('timeline')}
                >
                    Timeline View
                </Button>
                <Button 
                    variant={viewMode === 'table' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('table')}
                >
                    Table View
                </Button>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Timeline */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Production Journey</CardTitle>
                            <CardDescription>Material flow from fiber to finished product</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-1">
                            {mockTraceData.stages.map((stage, index) => (
                                <div 
                                    key={stage.id}
                                    className={`relative pl-8 pb-6 cursor-pointer transition-all ${
                                        selectedStage?.id === stage.id ? 'bg-muted/50 -mx-4 px-12 rounded-xl' : ''
                                    }`}
                                    onClick={() => setSelectedStage(stage)}
                                    data-testid={`trace-stage-${stage.id}`}
                                >
                                    {/* Connection Line */}
                                    {index < mockTraceData.stages.length - 1 && (
                                        <div className={`absolute left-3 top-10 w-0.5 h-full ${
                                            stage.status === 'complete' ? 'bg-success' :
                                            stage.status === 'in_progress' ? 'bg-secondary' : 'bg-muted'
                                        }`} />
                                    )}

                                    {/* Stage Node */}
                                    <div className={`absolute left-0 w-6 h-6 rounded-full flex items-center justify-center ${statusColors[stage.status]}`}>
                                        {stage.status === 'complete' ? (
                                            <CheckCircle2 className="h-4 w-4" />
                                        ) : stage.status === 'in_progress' ? (
                                            <Clock className="h-4 w-4" />
                                        ) : (
                                            <span className="w-2 h-2 rounded-full bg-current" />
                                        )}
                                    </div>

                                    {/* Stage Content */}
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <stage.icon className="h-4 w-4 text-muted-foreground" />
                                                <span className="font-medium text-foreground">{stage.name}</span>
                                                {stage.status === 'in_progress' && stage.progress && (
                                                    <Badge variant="secondary" className="text-[10px]">
                                                        {stage.progress}%
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground">{stage.supplier}</p>
                                            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="h-3 w-3" />
                                                    {stage.location}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {stage.date}
                                                </span>
                                            </div>
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                    </div>

                                    {/* Material Flow */}
                                    <div className="flex items-center gap-2 mt-3 text-sm">
                                        <div className="px-3 py-1.5 rounded-lg bg-muted/50">
                                            <span className="text-muted-foreground">In:</span>
                                            <span className="font-medium ml-1">{stage.input.qty}</span>
                                            <span className="text-xs text-muted-foreground ml-1">{stage.input.unit}</span>
                                        </div>
                                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                        <div className="px-3 py-1.5 rounded-lg bg-secondary/10">
                                            <span className="text-muted-foreground">Out:</span>
                                            <span className="font-medium ml-1">{stage.output.qty}</span>
                                            <span className="text-xs text-muted-foreground ml-1">{stage.output.unit}</span>
                                        </div>
                                    </div>

                                    {stage.conversion && (
                                        <p className="text-xs text-muted-foreground mt-2 italic">
                                            Conversion: {stage.conversion}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Detail Panel */}
                <div className="space-y-4">
                    {selectedStage ? (
                        <>
                            <Card>
                                <CardHeader className="pb-3">
                                    <div className="flex items-center gap-2">
                                        <selectedStage.icon className="h-5 w-5 text-secondary" />
                                        <CardTitle className="text-lg">{selectedStage.name}</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-muted-foreground">Supplier</span>
                                            <span className="text-sm font-medium">{selectedStage.supplier}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-muted-foreground">Location</span>
                                            <span className="text-sm font-medium">{selectedStage.location}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-muted-foreground">Date</span>
                                            <span className="text-sm font-medium">{selectedStage.date}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-muted-foreground">Status</span>
                                            <Badge variant="outline" className={
                                                selectedStage.status === 'complete' ? 'bg-success/10 text-success' :
                                                selectedStage.status === 'in_progress' ? 'bg-secondary/10 text-secondary' :
                                                'bg-muted'
                                            }>
                                                {selectedStage.status.replace('_', ' ')}
                                            </Badge>
                                        </div>
                                    </div>

                                    {selectedStage.status === 'in_progress' && selectedStage.progress && (
                                        <div className="pt-3 border-t">
                                            <div className="flex justify-between text-sm mb-2">
                                                <span className="text-muted-foreground">Progress</span>
                                                <span className="font-medium">{selectedStage.progress}%</span>
                                            </div>
                                            <Progress value={selectedStage.progress} className="h-2" />
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm">Certifications</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedStage.certifications.map((cert, idx) => (
                                            <Badge key={idx} variant="outline" className="bg-success/10 text-success border-success/30">
                                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                                {cert}
                                            </Badge>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm">Documents</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {selectedStage.documents.length > 0 ? (
                                        selectedStage.documents.map((doc, idx) => (
                                            <Button key={idx} variant="ghost" className="w-full justify-start text-sm h-auto py-2">
                                                <Package className="h-4 w-4 mr-2 text-muted-foreground" />
                                                {doc}
                                            </Button>
                                        ))
                                    ) : (
                                        <p className="text-sm text-muted-foreground">No documents yet</p>
                                    )}
                                </CardContent>
                            </Card>
                        </>
                    ) : (
                        <Card className="h-64 flex items-center justify-center">
                            <CardContent className="text-center">
                                <Package className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                                <p className="text-muted-foreground">Select a stage to view details</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BuyerTraceability;
