import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Leaf, Factory, Package, Droplets, Sparkles, Shirt, 
    ChevronRight, ChevronLeft, Check, Save, AlertCircle,
    Plus, Trash2, Search, Building2, FileText, Calendar,
    ArrowRight, Shield, QrCode, Copy, ExternalLink, Loader2,
    TrendingUp, Scale, Zap, CheckCircle2, Clock, Link2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

// Mock PO Data (would come from Brand's PO via API)
const mockPOData = {
    'PO-2024-001': {
        poNumber: 'PO-2024-001',
        brand: 'EcoWear Brands Ltd',
        brandContact: 'Sarah Johnson',
        product: 'Organic Cotton T-Shirts',
        category: 'T-Shirt',
        quantity: 5000,
        unit: 'pcs',
        dueDate: '2024-02-28',
        specifications: 'White, Size M-XL, 180 GSM Jersey',
        pricePerUnit: 9.00,
    },
    'PO-2024-002': {
        poNumber: 'PO-2024-002',
        brand: 'GreenStyle Fashion',
        brandContact: 'Michael Chen',
        product: 'Recycled Polyester Jackets',
        category: 'Jacket',
        quantity: 2000,
        unit: 'pcs',
        dueDate: '2024-03-15',
        specifications: 'Navy Blue, Size S-XXL, Waterproof',
        pricePerUnit: 34.00,
    },
    'PO-2024-003': {
        poNumber: 'PO-2024-003',
        brand: 'Sustainable Threads',
        brandContact: 'Emma Wilson',
        product: 'Hemp Blend Shirts',
        category: 'Shirt',
        quantity: 3000,
        unit: 'pcs',
        dueDate: '2024-03-01',
        specifications: 'Natural, Size S-XXL, 120 GSM',
        pricePerUnit: 17.50,
    },
};

// Mock saved suppliers with API data simulation
const savedSuppliers = {
    fiber: [
        { id: 'SUP-F1', name: 'Organic Farms Co-op', location: 'Gujarat, India', certification: 'GOTS', 
          latestLot: 'LOT-F-2024-0892', availableStock: '2,500 KG', lastDelivery: '2024-01-28' },
        { id: 'SUP-F2', name: 'EcoFiber Mills', location: 'Tamil Nadu, India', certification: 'OCS',
          latestLot: 'LOT-F-2024-0756', availableStock: '1,800 KG', lastDelivery: '2024-01-25' },
    ],
    spinning: [
        { id: 'SUP-S1', name: 'SpinWell Textiles', location: 'Coimbatore, India', certification: 'GOTS',
          latestLot: 'LOT-Y-2024-1045', yarnCount: '30s Combed', currentCapacity: '85%' },
        { id: 'SUP-S2', name: 'YarnCraft Industries', location: 'Tirupur, India', certification: 'ISO 9001',
          latestLot: 'LOT-Y-2024-0998', yarnCount: '40s Ring', currentCapacity: '70%' },
    ],
    fabric: [
        { id: 'SUP-FA1', name: 'KnitCraft Industries', location: 'Tirupur, India', certification: 'GOTS',
          latestLot: 'LOT-FB-2024-0567', gsm: '180', fabricType: 'Jersey' },
        { id: 'SUP-FA2', name: 'WeaveMaster Textiles', location: 'Erode, India', certification: 'OEKO-TEX',
          latestLot: 'LOT-FB-2024-0512', gsm: '160', fabricType: 'Poplin' },
    ],
    processing: [
        { id: 'SUP-P1', name: 'ColorEco Processing', location: 'Tirupur, India', certification: 'ZDHC',
          approvedShades: ['Natural White', 'Sky Blue', 'Forest Green'], avgLeadTime: '5 days' },
        { id: 'SUP-P2', name: 'GreenDye Solutions', location: 'Ahmedabad, India', certification: 'GOTS',
          approvedShades: ['Organic White', 'Earth Brown', 'Navy'], avgLeadTime: '4 days' },
    ],
};

// Yield conversion factors (industry standard)
const yieldFactors = {
    fiberToYarn: 0.92, // 8% loss in spinning
    yarnToFabric: 5.4, // 1 KG yarn = 5.4 meters fabric (180 GSM)
    fabricToGarment: 1.44, // 1.44 meters per T-shirt
};

// Generate unique Traceability ID
const generateTraceId = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `TRC-${timestamp}-${random}`;
};

export const ProductCreation = () => {
    const { poId } = useParams();
    const navigate = useNavigate();
    const [poData, setPoData] = useState(null);
    const [traceId, setTraceId] = useState('');
    const [creationStartTime, setCreationStartTime] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [apiLoading, setApiLoading] = useState({});
    
    // Form data state - unified for entire journey
    const [formData, setFormData] = useState({
        // Section 1: Core Product Identity (Auto-populated + Manual)
        poNumber: '',
        brandName: '',
        styleName: '',
        styleNumber: '',
        totalUnits: '',
        invoiceNumber: '',
        manufacturerName: '',
        factoryLocation: '',
        
        // Section 2: Fiber (Upstream)
        fiberSupplier: '',
        fiberLocation: '',
        fiberType: '',
        fiberLotNumber: '',
        fiberBaleWeight: '',
        fiberCertification: '',
        fiberDate: '',
        
        // Section 3: Spinning (Upstream)
        spinningMill: '',
        spinningLocation: '',
        yarnCount: '',
        tpi: '',
        spinningWeightKg: '',
        spinningLotNumber: '',
        spinningCertification: '',
        spinningDate: '',
        
        // Section 4: Fabric (Upstream)
        fabricSupplier: '',
        fabricLocation: '',
        fabricType: '',
        fabricGsm: '',
        fabricMeters: '',
        fabricLotNumber: '',
        fabricCertification: '',
        fabricDate: '',
        
        // Section 5: Processing/Dyeing (Upstream)
        dyeingHouse: '',
        dyeingLocation: '',
        dyeType: '',
        shadeNumber: '',
        chemicalLogs: '',
        shadeApproval: false,
        processingCertification: '',
        processingDate: '',
        
        // Section 6: Value Addition
        hasEmbroidery: false,
        embroideryDetails: '',
        embroideryUnits: '',
        hasPrinting: false,
        printingDetails: '',
        printingUnits: '',
        valueAddDate: '',
        
        // Section 7: Final QC
        finalQcDate: '',
        packedUnits: '',
        defectRate: '',
        finalNotes: '',
    });

    // Calculate yield metrics in real-time
    const yieldMetrics = useMemo(() => {
        const fiberKg = parseFloat(formData.fiberBaleWeight) || 0;
        const yarnKg = parseFloat(formData.spinningWeightKg) || fiberKg * yieldFactors.fiberToYarn;
        const fabricMeters = parseFloat(formData.fabricMeters) || yarnKg * yieldFactors.yarnToFabric;
        const garmentUnits = Math.floor(fabricMeters / yieldFactors.fabricToGarment);
        
        return {
            fiberKg: fiberKg.toFixed(0),
            yarnKg: yarnKg.toFixed(0),
            fabricMeters: fabricMeters.toFixed(0),
            garmentUnits: garmentUnits,
            targetUnits: parseInt(formData.totalUnits) || 0,
            efficiency: formData.totalUnits ? Math.round((garmentUnits / parseInt(formData.totalUnits)) * 100) : 0,
        };
    }, [formData.fiberBaleWeight, formData.spinningWeightKg, formData.fabricMeters, formData.totalUnits]);

    // Validation - check if all mandatory fields are filled
    const validationStatus = useMemo(() => {
        const mandatoryFields = {
            productIdentity: ['styleName', 'totalUnits', 'manufacturerName', 'factoryLocation'],
            fiber: ['fiberSupplier', 'fiberType', 'fiberLotNumber', 'fiberBaleWeight'],
            spinning: ['spinningMill', 'yarnCount', 'spinningWeightKg', 'spinningLotNumber'],
            fabric: ['fabricSupplier', 'fabricType', 'fabricGsm', 'fabricMeters'],
            processing: ['dyeingHouse', 'shadeNumber', 'shadeApproval'],
        };
        
        const status = {};
        let totalFilled = 0;
        let totalRequired = 0;
        
        Object.entries(mandatoryFields).forEach(([section, fields]) => {
            const filled = fields.filter(f => {
                if (f === 'shadeApproval') return formData[f] === true;
                return formData[f] && formData[f].toString().trim() !== '';
            }).length;
            status[section] = { filled, total: fields.length, complete: filled === fields.length };
            totalFilled += filled;
            totalRequired += fields.length;
        });
        
        status.overall = { filled: totalFilled, total: totalRequired, percentage: Math.round((totalFilled / totalRequired) * 100) };
        status.canSubmit = totalFilled === totalRequired;
        
        return status;
    }, [formData]);

    useEffect(() => {
        // Load PO data and start creation timer
        const po = mockPOData[poId] || mockPOData['PO-2024-001'];
        setPoData(po);
        setTraceId(generateTraceId());
        setCreationStartTime(new Date());
        
        // Auto-populate from PO
        setFormData(prev => ({
            ...prev,
            poNumber: po.poNumber,
            brandName: po.brand,
            totalUnits: po.quantity.toString(),
            styleName: po.product,
        }));
        
        // Update status in localStorage (simulating API call)
        updatePOStatus(poId, 'in_progress');
    }, [poId]);

    const updatePOStatus = (poNumber, status) => {
        const statusData = JSON.parse(localStorage.getItem('po_status') || '{}');
        statusData[poNumber] = { status, updatedAt: new Date().toISOString() };
        localStorage.setItem('po_status', JSON.stringify(statusData));
    };

    const updateFormData = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Simulate API call to fetch supplier data
    const fetchSupplierData = async (type, supplier) => {
        setApiLoading(prev => ({ ...prev, [type]: true }));
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const fieldMappings = {
            fiber: {
                fiberSupplier: supplier.name,
                fiberLocation: supplier.location,
                fiberCertification: supplier.certification,
                fiberLotNumber: supplier.latestLot,
            },
            spinning: {
                spinningMill: supplier.name,
                spinningLocation: supplier.location,
                spinningCertification: supplier.certification,
                spinningLotNumber: supplier.latestLot,
                yarnCount: supplier.yarnCount || '',
            },
            fabric: {
                fabricSupplier: supplier.name,
                fabricLocation: supplier.location,
                fabricCertification: supplier.certification,
                fabricLotNumber: supplier.latestLot,
                fabricGsm: supplier.gsm || '',
                fabricType: supplier.fabricType || '',
            },
            processing: {
                dyeingHouse: supplier.name,
                dyeingLocation: supplier.location,
                processingCertification: supplier.certification,
            },
        };
        
        setFormData(prev => ({ ...prev, ...fieldMappings[type] }));
        setApiLoading(prev => ({ ...prev, [type]: false }));
        
        toast.success(`Supplier data synced via API`, {
            description: `Latest lot: ${supplier.latestLot || 'N/A'}`,
        });
    };

    const handleSaveDraft = () => {
        const draft = {
            traceId,
            poId,
            formData,
            savedAt: new Date().toISOString(),
            creationStartTime: creationStartTime?.toISOString(),
        };
        localStorage.setItem(`product_draft_${poId}`, JSON.stringify(draft));
        toast.success('Draft saved successfully');
    };

    const handleSubmit = async () => {
        if (!validationStatus.canSubmit) {
            toast.error('Please complete all mandatory fields');
            return;
        }
        
        setIsSubmitting(true);
        
        // Simulate API submission
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const completionTime = new Date();
        const leadTimeMs = completionTime - creationStartTime;
        const leadTimeHours = Math.round(leadTimeMs / (1000 * 60 * 60) * 10) / 10;
        
        // Save complete product data
        const productData = {
            traceId,
            poId,
            poData,
            formData,
            yieldMetrics,
            status: 'complete', // Traceability Complete
            createdAt: creationStartTime?.toISOString(),
            completedAt: completionTime.toISOString(),
            leadTimeHours,
        };
        
        // Store in localStorage (would be API call in production)
        const existingProducts = JSON.parse(localStorage.getItem('textile_products') || '[]');
        existingProducts.push(productData);
        localStorage.setItem('textile_products', JSON.stringify(existingProducts));
        
        // Update PO status to complete
        updatePOStatus(poId, 'complete');
        
        // Instant sync to Brand Dashboard and QR Generator (no separate steps)
        syncToBrandDashboard(productData);
        
        setIsSubmitting(false);
        
        toast.success('Traceability Complete!', {
            description: `ID: ${traceId} • Synced to Brand Dashboard & QR`,
        });
        
        navigate('/manufacturer');
    };

    const syncToBrandDashboard = (productData) => {
        // Instant sync to Brand Dashboard
        const brandData = JSON.parse(localStorage.getItem('brand_po_data') || '[]');
        brandData.push({
            ...productData,
            syncedAt: new Date().toISOString(),
        });
        localStorage.setItem('brand_po_data', JSON.stringify(brandData));
        
        // Instant sync to QR Code generator - make product available for consumer view
        const qrProducts = JSON.parse(localStorage.getItem('qr_products') || '{}');
        qrProducts[productData.traceId] = {
            traceId: productData.traceId,
            poNumber: productData.poId,
            product: productData.poData.product,
            brand: productData.poData.brand,
            quantity: productData.poData.quantity,
            formData: productData.formData,
            yieldMetrics: productData.yieldMetrics,
            createdAt: productData.completedAt,
            qrUrl: `/product/${productData.traceId}`,
        };
        localStorage.setItem('qr_products', JSON.stringify(qrProducts));
        
        console.log('✅ Synced to Brand Dashboard and QR Generator:', productData.traceId);
    };

    if (!poData) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6" data-testid="product-creation-wizard">
            {/* Header with PO Info - Auto-populated */}
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 font-mono">
                            {poData.poNumber}
                        </Badge>
                        <Badge variant="secondary">{poData.brand}</Badge>
                        <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/30">
                            <Clock className="h-3 w-3 mr-1" />
                            In Progress
                        </Badge>
                    </div>
                    <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
                        Update Traceability
                    </h1>
                    <p className="text-muted-foreground">
                        Product Details & Supply Chain Thread for {poData.poNumber}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={handleSaveDraft}>
                        <Save className="h-4 w-4 mr-2" />
                        Save Draft
                    </Button>
                </div>
            </div>

            {/* Traceability ID & Progress Card */}
            <Card className="bg-gradient-to-r from-secondary/10 via-primary/5 to-accent/10 border-secondary/30">
                <CardContent className="p-4">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-secondary/20">
                                <QrCode className="h-6 w-6 text-secondary" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Unique Traceability ID</p>
                                <p className="font-mono font-bold text-xl text-foreground">{traceId}</p>
                            </div>
                            <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => {
                                    navigator.clipboard.writeText(traceId);
                                    toast.success('Copied to clipboard');
                                }}
                            >
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                        
                        {/* Completion Progress */}
                        <div className="flex items-center gap-6">
                            <div className="text-center">
                                <div className="relative w-16 h-16">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle cx="32" cy="32" r="28" fill="none" stroke="hsl(var(--muted))" strokeWidth="4" />
                                        <circle 
                                            cx="32" cy="32" r="28" 
                                            fill="none" 
                                            stroke={validationStatus.canSubmit ? "hsl(var(--success))" : "hsl(var(--secondary))"}
                                            strokeWidth="4"
                                            strokeDasharray={`${validationStatus.overall.percentage * 1.76} 176`}
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-lg font-bold">{validationStatus.overall.percentage}%</span>
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Traceability</p>
                            </div>
                            <Badge variant="outline" className={validationStatus.canSubmit ? 'bg-success/10 text-success border-success/30' : 'bg-warning/10 text-warning border-warning/30'}>
                                {validationStatus.canSubmit ? (
                                    <><CheckCircle2 className="h-3 w-3 mr-1" />Ready to Link</>
                                ) : (
                                    <><AlertCircle className="h-3 w-3 mr-1" />{validationStatus.overall.total - validationStatus.overall.filled} Fields Remaining</>
                                )}
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Live Yield Conversion Tracker */}
            <Card className="border-accent/30">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Scale className="h-4 w-4 text-accent" />
                        Live Yield Conversion
                    </CardTitle>
                    <CardDescription>Real-time material flow calculation</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-2 overflow-x-auto pb-2">
                        <div className="flex-shrink-0 text-center p-3 rounded-xl bg-green-50 min-w-[100px]">
                            <Leaf className="h-5 w-5 text-green-600 mx-auto mb-1" />
                            <p className="text-xl font-bold text-green-700">{yieldMetrics.fiberKg}</p>
                            <p className="text-xs text-muted-foreground">KG Fiber</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div className="flex-shrink-0 text-center p-3 rounded-xl bg-blue-50 min-w-[100px]">
                            <Factory className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                            <p className="text-xl font-bold text-blue-700">{yieldMetrics.yarnKg}</p>
                            <p className="text-xs text-muted-foreground">KG Yarn</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div className="flex-shrink-0 text-center p-3 rounded-xl bg-purple-50 min-w-[100px]">
                            <Package className="h-5 w-5 text-purple-600 mx-auto mb-1" />
                            <p className="text-xl font-bold text-purple-700">{yieldMetrics.fabricMeters}</p>
                            <p className="text-xs text-muted-foreground">Meters Fabric</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div className={`flex-shrink-0 text-center p-3 rounded-xl min-w-[100px] ${yieldMetrics.garmentUnits >= yieldMetrics.targetUnits ? 'bg-success/10' : 'bg-warning/10'}`}>
                            <Shirt className={`h-5 w-5 mx-auto mb-1 ${yieldMetrics.garmentUnits >= yieldMetrics.targetUnits ? 'text-success' : 'text-warning'}`} />
                            <p className={`text-xl font-bold ${yieldMetrics.garmentUnits >= yieldMetrics.targetUnits ? 'text-success' : 'text-warning'}`}>
                                {yieldMetrics.garmentUnits.toLocaleString()}
                            </p>
                            <p className="text-xs text-muted-foreground">/ {yieldMetrics.targetUnits.toLocaleString()} Units</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Main Form - Unified Sections */}
            <Tabs defaultValue="identity" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
                    <TabsTrigger value="identity" className="relative">
                        Product
                        {validationStatus.productIdentity?.complete && (
                            <CheckCircle2 className="absolute -top-1 -right-1 h-4 w-4 text-success" />
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="fiber" className="relative">
                        Fiber
                        {validationStatus.fiber?.complete && (
                            <CheckCircle2 className="absolute -top-1 -right-1 h-4 w-4 text-success" />
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="spinning" className="relative">
                        Yarn
                        {validationStatus.spinning?.complete && (
                            <CheckCircle2 className="absolute -top-1 -right-1 h-4 w-4 text-success" />
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="fabric" className="relative">
                        Fabric
                        {validationStatus.fabric?.complete && (
                            <CheckCircle2 className="absolute -top-1 -right-1 h-4 w-4 text-success" />
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="processing" className="relative">
                        Processing
                        {validationStatus.processing?.complete && (
                            <CheckCircle2 className="absolute -top-1 -right-1 h-4 w-4 text-success" />
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="final">
                        Final QC
                    </TabsTrigger>
                </TabsList>

                {/* Section 1: Product Identity */}
                <TabsContent value="identity">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-secondary" />
                                Core Product Identity
                            </CardTitle>
                            <CardDescription>Basic product and manufacturer information</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Auto-populated PO Info */}
                            <div className="p-4 rounded-xl bg-muted/50 border border-border">
                                <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                                    <Zap className="h-3 w-3" /> Auto-populated from Purchase Order
                                </p>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                        <Label className="text-xs text-muted-foreground">PO Number</Label>
                                        <p className="font-mono font-medium">{formData.poNumber}</p>
                                    </div>
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Brand</Label>
                                        <p className="font-medium">{formData.brandName}</p>
                                    </div>
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Target Units</Label>
                                        <p className="font-medium">{parseInt(formData.totalUnits).toLocaleString()} pcs</p>
                                    </div>
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Due Date</Label>
                                        <p className="font-medium">{poData.dueDate}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Manual Entry Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="styleName">Style Name *</Label>
                                    <Input 
                                        id="styleName"
                                        placeholder="e.g., Classic Crew Neck"
                                        value={formData.styleName}
                                        onChange={(e) => updateFormData('styleName', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="styleNumber">Style Number</Label>
                                    <Input 
                                        id="styleNumber"
                                        placeholder="e.g., STY-2024-001"
                                        value={formData.styleNumber}
                                        onChange={(e) => updateFormData('styleNumber', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="invoiceNumber">Invoice Number</Label>
                                    <Input 
                                        id="invoiceNumber"
                                        placeholder="e.g., INV-2024-001"
                                        value={formData.invoiceNumber}
                                        onChange={(e) => updateFormData('invoiceNumber', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="totalUnits">Total Units (pcs) *</Label>
                                    <Input 
                                        id="totalUnits"
                                        type="number"
                                        value={formData.totalUnits}
                                        onChange={(e) => updateFormData('totalUnits', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="manufacturerName">Manufacturer Name *</Label>
                                    <Input 
                                        id="manufacturerName"
                                        placeholder="Your company name"
                                        value={formData.manufacturerName}
                                        onChange={(e) => updateFormData('manufacturerName', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="factoryLocation">Factory Location *</Label>
                                    <Input 
                                        id="factoryLocation"
                                        placeholder="City, Country"
                                        value={formData.factoryLocation}
                                        onChange={(e) => updateFormData('factoryLocation', e.target.value)}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Section 2: Fiber */}
                <TabsContent value="fiber">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Leaf className="h-5 w-5 text-green-600" />
                                Fiber Sourcing (Upstream)
                            </CardTitle>
                            <CardDescription>Raw material source and specifications</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Smart Supplier Selection */}
                            <Card className="bg-gradient-to-r from-green-50 to-transparent border-green-200">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <Zap className="h-4 w-4 text-green-600" />
                                            <span className="text-sm font-medium">Smart Engine - Select Saved Supplier</span>
                                        </div>
                                        <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                                            API Auto-Fill
                                        </Badge>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {savedSuppliers.fiber.map((supplier) => (
                                            <Button 
                                                key={supplier.id}
                                                variant="outline"
                                                size="sm"
                                                disabled={apiLoading.fiber}
                                                onClick={() => fetchSupplierData('fiber', supplier)}
                                                className="border-green-300 hover:bg-green-100"
                                            >
                                                {apiLoading.fiber ? (
                                                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                                ) : (
                                                    <Building2 className="h-3 w-3 mr-1" />
                                                )}
                                                {supplier.name}
                                            </Button>
                                        ))}
                                    </div>
                                    {savedSuppliers.fiber[0] && (
                                        <p className="text-xs text-muted-foreground mt-2">
                                            Latest lot available: {savedSuppliers.fiber[0].latestLot} • Stock: {savedSuppliers.fiber[0].availableStock}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="fiberSupplier">Supplier Name *</Label>
                                    <Input 
                                        id="fiberSupplier"
                                        placeholder="Fiber supplier"
                                        value={formData.fiberSupplier}
                                        onChange={(e) => updateFormData('fiberSupplier', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="fiberLocation">Location</Label>
                                    <Input 
                                        id="fiberLocation"
                                        placeholder="City, Country"
                                        value={formData.fiberLocation}
                                        onChange={(e) => updateFormData('fiberLocation', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="fiberType">Fiber Type *</Label>
                                    <Select value={formData.fiberType} onValueChange={(v) => updateFormData('fiberType', v)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Organic Cotton">Organic Cotton</SelectItem>
                                            <SelectItem value="BCI Cotton">BCI Cotton</SelectItem>
                                            <SelectItem value="Recycled Polyester">Recycled Polyester</SelectItem>
                                            <SelectItem value="Hemp">Hemp</SelectItem>
                                            <SelectItem value="Linen">Linen</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="fiberLotNumber">Lot Number *</Label>
                                    <Input 
                                        id="fiberLotNumber"
                                        placeholder="e.g., LOT-F-2024-001"
                                        value={formData.fiberLotNumber}
                                        onChange={(e) => updateFormData('fiberLotNumber', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="fiberBaleWeight">Bale Weight (KG) *</Label>
                                    <Input 
                                        id="fiberBaleWeight"
                                        type="number"
                                        placeholder="e.g., 1500"
                                        value={formData.fiberBaleWeight}
                                        onChange={(e) => updateFormData('fiberBaleWeight', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="fiberCertification">Certification</Label>
                                    <Input 
                                        id="fiberCertification"
                                        placeholder="e.g., GOTS"
                                        value={formData.fiberCertification}
                                        onChange={(e) => updateFormData('fiberCertification', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="fiberDate">Date</Label>
                                    <Input 
                                        id="fiberDate"
                                        type="date"
                                        value={formData.fiberDate}
                                        onChange={(e) => updateFormData('fiberDate', e.target.value)}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Section 3: Spinning */}
                <TabsContent value="spinning">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Factory className="h-5 w-5 text-blue-600" />
                                Spinning (Yarn Production)
                            </CardTitle>
                            <CardDescription>Yarn count, TPI, and weight specifications</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <Card className="bg-gradient-to-r from-blue-50 to-transparent border-blue-200">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <Zap className="h-4 w-4 text-blue-600" />
                                            <span className="text-sm font-medium">Smart Engine - Select Spinning Mill</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {savedSuppliers.spinning.map((supplier) => (
                                            <Button 
                                                key={supplier.id}
                                                variant="outline"
                                                size="sm"
                                                disabled={apiLoading.spinning}
                                                onClick={() => fetchSupplierData('spinning', supplier)}
                                                className="border-blue-300 hover:bg-blue-100"
                                            >
                                                {apiLoading.spinning ? (
                                                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                                ) : (
                                                    <Factory className="h-3 w-3 mr-1" />
                                                )}
                                                {supplier.name}
                                            </Button>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="spinningMill">Spinning Mill *</Label>
                                    <Input 
                                        id="spinningMill"
                                        placeholder="Mill name"
                                        value={formData.spinningMill}
                                        onChange={(e) => updateFormData('spinningMill', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="spinningLocation">Location</Label>
                                    <Input 
                                        id="spinningLocation"
                                        placeholder="City, Country"
                                        value={formData.spinningLocation}
                                        onChange={(e) => updateFormData('spinningLocation', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="yarnCount">Yarn Count *</Label>
                                    <Input 
                                        id="yarnCount"
                                        placeholder="e.g., 30s Combed"
                                        value={formData.yarnCount}
                                        onChange={(e) => updateFormData('yarnCount', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="tpi">TPI (Turns Per Inch)</Label>
                                    <Input 
                                        id="tpi"
                                        type="number"
                                        placeholder="e.g., 22"
                                        value={formData.tpi}
                                        onChange={(e) => updateFormData('tpi', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="spinningWeightKg">Weight (KG) *</Label>
                                    <Input 
                                        id="spinningWeightKg"
                                        type="number"
                                        placeholder="Yarn weight"
                                        value={formData.spinningWeightKg}
                                        onChange={(e) => updateFormData('spinningWeightKg', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="spinningLotNumber">Lot Number *</Label>
                                    <Input 
                                        id="spinningLotNumber"
                                        placeholder="Yarn lot number"
                                        value={formData.spinningLotNumber}
                                        onChange={(e) => updateFormData('spinningLotNumber', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="spinningDate">Date</Label>
                                    <Input 
                                        id="spinningDate"
                                        type="date"
                                        value={formData.spinningDate}
                                        onChange={(e) => updateFormData('spinningDate', e.target.value)}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Section 4: Fabric */}
                <TabsContent value="fabric">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="h-5 w-5 text-purple-600" />
                                Fabric Production (Weaving/Knitting)
                            </CardTitle>
                            <CardDescription>GSM, meters, and fabric type specifications</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <Card className="bg-gradient-to-r from-purple-50 to-transparent border-purple-200">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <Zap className="h-4 w-4 text-purple-600" />
                                            <span className="text-sm font-medium">Smart Engine - Select Fabric Supplier</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {savedSuppliers.fabric.map((supplier) => (
                                            <Button 
                                                key={supplier.id}
                                                variant="outline"
                                                size="sm"
                                                disabled={apiLoading.fabric}
                                                onClick={() => fetchSupplierData('fabric', supplier)}
                                                className="border-purple-300 hover:bg-purple-100"
                                            >
                                                {apiLoading.fabric ? (
                                                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                                ) : (
                                                    <Package className="h-3 w-3 mr-1" />
                                                )}
                                                {supplier.name}
                                            </Button>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="fabricSupplier">Supplier Name *</Label>
                                    <Input 
                                        id="fabricSupplier"
                                        placeholder="Fabric supplier"
                                        value={formData.fabricSupplier}
                                        onChange={(e) => updateFormData('fabricSupplier', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="fabricLocation">Location</Label>
                                    <Input 
                                        id="fabricLocation"
                                        placeholder="City, Country"
                                        value={formData.fabricLocation}
                                        onChange={(e) => updateFormData('fabricLocation', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="fabricType">Fabric Type *</Label>
                                    <Select value={formData.fabricType} onValueChange={(v) => updateFormData('fabricType', v)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Jersey">Jersey (Knit)</SelectItem>
                                            <SelectItem value="Pique">Pique (Knit)</SelectItem>
                                            <SelectItem value="Rib">Rib (Knit)</SelectItem>
                                            <SelectItem value="Poplin">Poplin (Woven)</SelectItem>
                                            <SelectItem value="Twill">Twill (Woven)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="fabricGsm">GSM *</Label>
                                    <Input 
                                        id="fabricGsm"
                                        type="number"
                                        placeholder="e.g., 180"
                                        value={formData.fabricGsm}
                                        onChange={(e) => updateFormData('fabricGsm', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="fabricMeters">Total Meters *</Label>
                                    <Input 
                                        id="fabricMeters"
                                        type="number"
                                        placeholder="Fabric meters"
                                        value={formData.fabricMeters}
                                        onChange={(e) => updateFormData('fabricMeters', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="fabricLotNumber">Lot Number</Label>
                                    <Input 
                                        id="fabricLotNumber"
                                        placeholder="Fabric lot number"
                                        value={formData.fabricLotNumber}
                                        onChange={(e) => updateFormData('fabricLotNumber', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="fabricDate">Date</Label>
                                    <Input 
                                        id="fabricDate"
                                        type="date"
                                        value={formData.fabricDate}
                                        onChange={(e) => updateFormData('fabricDate', e.target.value)}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Section 5: Processing */}
                <TabsContent value="processing">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Droplets className="h-5 w-5 text-cyan-600" />
                                Processing / Dyeing
                            </CardTitle>
                            <CardDescription>Dyeing house, chemical logs, and shade approval</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <Card className="bg-gradient-to-r from-cyan-50 to-transparent border-cyan-200">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <Zap className="h-4 w-4 text-cyan-600" />
                                            <span className="text-sm font-medium">Smart Engine - Select Processing Unit</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {savedSuppliers.processing.map((supplier) => (
                                            <Button 
                                                key={supplier.id}
                                                variant="outline"
                                                size="sm"
                                                disabled={apiLoading.processing}
                                                onClick={() => fetchSupplierData('processing', supplier)}
                                                className="border-cyan-300 hover:bg-cyan-100"
                                            >
                                                {apiLoading.processing ? (
                                                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                                ) : (
                                                    <Droplets className="h-3 w-3 mr-1" />
                                                )}
                                                {supplier.name}
                                            </Button>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="dyeingHouse">Dyeing House *</Label>
                                    <Input 
                                        id="dyeingHouse"
                                        placeholder="Processing unit name"
                                        value={formData.dyeingHouse}
                                        onChange={(e) => updateFormData('dyeingHouse', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="dyeingLocation">Location</Label>
                                    <Input 
                                        id="dyeingLocation"
                                        placeholder="City, Country"
                                        value={formData.dyeingLocation}
                                        onChange={(e) => updateFormData('dyeingLocation', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="dyeType">Dye Type</Label>
                                    <Select value={formData.dyeType} onValueChange={(v) => updateFormData('dyeType', v)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Reactive">Reactive Dye</SelectItem>
                                            <SelectItem value="Disperse">Disperse Dye</SelectItem>
                                            <SelectItem value="Vat">Vat Dye</SelectItem>
                                            <SelectItem value="Natural">Natural Dye</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="shadeNumber">Shade Number *</Label>
                                    <Input 
                                        id="shadeNumber"
                                        placeholder="e.g., WHT-001"
                                        value={formData.shadeNumber}
                                        onChange={(e) => updateFormData('shadeNumber', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="processingDate">Date</Label>
                                    <Input 
                                        id="processingDate"
                                        type="date"
                                        value={formData.processingDate}
                                        onChange={(e) => updateFormData('processingDate', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="chemicalLogs">Chemical Logs / MSDS Reference</Label>
                                <Textarea 
                                    id="chemicalLogs"
                                    placeholder="List chemicals used and compliance status..."
                                    value={formData.chemicalLogs}
                                    onChange={(e) => updateFormData('chemicalLogs', e.target.value)}
                                />
                            </div>

                            <div className="flex items-center space-x-2 p-4 rounded-xl bg-warning/10 border border-warning/30">
                                <Checkbox 
                                    id="shadeApproval"
                                    checked={formData.shadeApproval}
                                    onCheckedChange={(checked) => updateFormData('shadeApproval', checked)}
                                />
                                <Label htmlFor="shadeApproval" className="text-sm font-medium cursor-pointer">
                                    Shade Approved by Buyer * (Required for submission)
                                </Label>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Section 6: Final QC */}
                <TabsContent value="final">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shirt className="h-5 w-5 text-orange-600" />
                                Value Addition & Final QC
                            </CardTitle>
                            <CardDescription>Embroidery, printing, and quality check</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Value Addition */}
                            <div className="space-y-4">
                                <h4 className="font-medium flex items-center gap-2">
                                    <Sparkles className="h-4 w-4" />
                                    Value Addition (Optional)
                                </h4>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Card className={formData.hasEmbroidery ? 'border-secondary' : ''}>
                                        <CardContent className="p-4">
                                            <div className="flex items-center space-x-2 mb-3">
                                                <Checkbox 
                                                    id="hasEmbroidery"
                                                    checked={formData.hasEmbroidery}
                                                    onCheckedChange={(checked) => updateFormData('hasEmbroidery', checked)}
                                                />
                                                <Label htmlFor="hasEmbroidery" className="font-medium cursor-pointer">Embroidery</Label>
                                            </div>
                                            {formData.hasEmbroidery && (
                                                <div className="space-y-3">
                                                    <Input 
                                                        placeholder="Details (logo, placement, thread)"
                                                        value={formData.embroideryDetails}
                                                        onChange={(e) => updateFormData('embroideryDetails', e.target.value)}
                                                    />
                                                    <Input 
                                                        type="number"
                                                        placeholder="Units with embroidery"
                                                        value={formData.embroideryUnits}
                                                        onChange={(e) => updateFormData('embroideryUnits', e.target.value)}
                                                    />
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>

                                    <Card className={formData.hasPrinting ? 'border-secondary' : ''}>
                                        <CardContent className="p-4">
                                            <div className="flex items-center space-x-2 mb-3">
                                                <Checkbox 
                                                    id="hasPrinting"
                                                    checked={formData.hasPrinting}
                                                    onCheckedChange={(checked) => updateFormData('hasPrinting', checked)}
                                                />
                                                <Label htmlFor="hasPrinting" className="font-medium cursor-pointer">Printing</Label>
                                            </div>
                                            {formData.hasPrinting && (
                                                <div className="space-y-3">
                                                    <Input 
                                                        placeholder="Details (type, colors, placement)"
                                                        value={formData.printingDetails}
                                                        onChange={(e) => updateFormData('printingDetails', e.target.value)}
                                                    />
                                                    <Input 
                                                        type="number"
                                                        placeholder="Units with printing"
                                                        value={formData.printingUnits}
                                                        onChange={(e) => updateFormData('printingUnits', e.target.value)}
                                                    />
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>

                            {/* Final QC */}
                            <div className="space-y-4 pt-4 border-t">
                                <h4 className="font-medium flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4" />
                                    Final Quality Check
                                </h4>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="finalQcDate">QC Date</Label>
                                        <Input 
                                            id="finalQcDate"
                                            type="date"
                                            value={formData.finalQcDate}
                                            onChange={(e) => updateFormData('finalQcDate', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="packedUnits">Packed Units</Label>
                                        <Input 
                                            id="packedUnits"
                                            type="number"
                                            placeholder="Total packed"
                                            value={formData.packedUnits}
                                            onChange={(e) => updateFormData('packedUnits', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="defectRate">Defect Rate (%)</Label>
                                        <Input 
                                            id="defectRate"
                                            type="number"
                                            step="0.1"
                                            placeholder="e.g., 0.5"
                                            value={formData.defectRate}
                                            onChange={(e) => updateFormData('defectRate', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="finalNotes">Final Notes</Label>
                                    <Textarea 
                                        id="finalNotes"
                                        placeholder="Any additional notes..."
                                        value={formData.finalNotes}
                                        onChange={(e) => updateFormData('finalNotes', e.target.value)}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Submit Section */}
            <Card className={validationStatus.canSubmit ? 'border-success/50 bg-success/5' : 'border-warning/50 bg-warning/5'}>
                <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${validationStatus.canSubmit ? 'bg-success/20' : 'bg-warning/20'}`}>
                                {validationStatus.canSubmit ? (
                                    <CheckCircle2 className="h-6 w-6 text-success" />
                                ) : (
                                    <AlertCircle className="h-6 w-6 text-warning" />
                                )}
                            </div>
                            <div>
                                <p className="font-medium text-foreground">
                                    {validationStatus.canSubmit 
                                        ? 'Ready to Complete Traceability' 
                                        : 'Complete All Supply Chain Stages to Submit'
                                    }
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {validationStatus.overall.filled} of {validationStatus.overall.total} mandatory fields completed • Auto-syncs to Brand Dashboard & QR
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <Button variant="outline" onClick={() => navigate('/manufacturer')}>
                                Cancel
                            </Button>
                            <Button 
                                variant="hero"
                                size="lg"
                                disabled={!validationStatus.canSubmit || isSubmitting}
                                onClick={handleSubmit}
                                className="min-w-[220px]"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Completing...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="h-4 w-4 mr-2" />
                                        Complete Traceability
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ProductCreation;
