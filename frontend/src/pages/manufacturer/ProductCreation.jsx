import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Leaf, Factory, Package, Droplets, Sparkles, Shirt, 
    ChevronRight, ChevronLeft, Check, Save, AlertCircle,
    Plus, Trash2, Search, Building2, FileText, Calendar,
    ArrowRight, Shield, QrCode, Copy, ExternalLink
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
import { toast } from 'sonner';

// Mock PO Data (would come from Buyer's PO)
const mockPOData = {
    'PO-2024-001': {
        poNumber: 'PO-2024-001',
        buyer: 'EcoWear Brands Ltd',
        product: 'Organic Cotton T-Shirts',
        category: 'T-Shirt',
        quantity: 5000,
        unit: 'pcs',
        dueDate: '2024-02-28',
        specifications: 'White, Size M-XL, 180 GSM Jersey',
    },
    'PO-2024-002': {
        poNumber: 'PO-2024-002',
        buyer: 'GreenStyle Fashion',
        product: 'Recycled Polyester Jackets',
        category: 'Jacket',
        quantity: 2000,
        unit: 'pcs',
        dueDate: '2024-03-15',
        specifications: 'Navy Blue, Size S-XXL, Waterproof',
    },
};

// Mock saved suppliers for auto-fill
const savedSuppliers = {
    fiber: [
        { id: 'SUP-F1', name: 'Organic Farms Co-op', location: 'Gujarat, India', certification: 'GOTS' },
        { id: 'SUP-F2', name: 'EcoFiber Mills', location: 'Tamil Nadu, India', certification: 'OCS' },
    ],
    spinning: [
        { id: 'SUP-S1', name: 'SpinWell Textiles', location: 'Coimbatore, India', certification: 'GOTS' },
        { id: 'SUP-S2', name: 'YarnCraft Industries', location: 'Tirupur, India', certification: 'ISO 9001' },
    ],
    fabric: [
        { id: 'SUP-FA1', name: 'KnitCraft Industries', location: 'Tirupur, India', certification: 'GOTS' },
        { id: 'SUP-FA2', name: 'WeaveMaster Textiles', location: 'Erode, India', certification: 'OEKO-TEX' },
    ],
    processing: [
        { id: 'SUP-P1', name: 'ColorEco Processing', location: 'Tirupur, India', certification: 'ZDHC' },
        { id: 'SUP-P2', name: 'GreenDye Solutions', location: 'Ahmedabad, India', certification: 'GOTS' },
    ],
};

// Step definitions
const steps = [
    { id: 'product', title: 'Product Identity', icon: FileText, description: 'Basic product & company info' },
    { id: 'fiber', title: 'Fiber Details', icon: Leaf, description: 'Raw material sourcing' },
    { id: 'spinning', title: 'Spinning', icon: Factory, description: 'Yarn production details' },
    { id: 'fabric', title: 'Fabric Production', icon: Package, description: 'Weaving/Knitting details' },
    { id: 'processing', title: 'Processing/Dyeing', icon: Droplets, description: 'Dyeing & finishing' },
    { id: 'value', title: 'Value Addition', icon: Sparkles, description: 'Embroidery/Printing' },
    { id: 'final', title: 'Final Construction', icon: Shirt, description: 'Assembly & QC' },
];

// Generate unique Traceability ID
const generateTraceId = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `TRC-${timestamp}-${random}`;
};

export const ProductCreation = () => {
    const { poId } = useParams();
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);
    const [poData, setPoData] = useState(null);
    const [traceId, setTraceId] = useState('');
    const [showSupplierSearch, setShowSupplierSearch] = useState(null);
    
    // Form data state
    const [formData, setFormData] = useState({
        // Step 0: Product Identity
        styleName: '',
        styleNumber: '',
        sku: '',
        category: '',
        invoiceNumber: '',
        totalUnits: '',
        deliveryDate: '',
        manufacturerName: '',
        factoryAddress: '',
        certifications: [],
        
        // Step 1: Fiber Details
        fiberType: '',
        fiberSource: '',
        fiberSupplier: '',
        fiberSupplierLocation: '',
        fiberLotNumber: '',
        baleWeight: '',
        fiberCertification: '',
        fiberNotes: '',
        
        // Step 2: Spinning
        spinningMill: '',
        spinningLocation: '',
        yarnCount: '',
        tpi: '',
        spinningWeight: '',
        spinningLotNumber: '',
        spinningCertification: '',
        spinningNotes: '',
        
        // Step 3: Fabric
        fabricType: '',
        fabricSupplier: '',
        fabricLocation: '',
        gsm: '',
        fabricWidth: '',
        totalMeters: '',
        fabricLotNumber: '',
        fabricCertification: '',
        fabricNotes: '',
        
        // Step 4: Processing
        dyeingHouse: '',
        dyeingLocation: '',
        dyeType: '',
        shadeNumber: '',
        chemicalLogs: '',
        shadeApproval: false,
        waterUsage: '',
        processingCertification: '',
        processingNotes: '',
        
        // Step 5: Value Addition
        hasEmbroidery: false,
        embroideryDetails: '',
        embroideryUnits: '',
        hasPrinting: false,
        printingDetails: '',
        printingUnits: '',
        hasWashing: false,
        washingDetails: '',
        valueAdditionNotes: '',
        
        // Step 6: Final Construction
        cmtFactory: '',
        cmtLocation: '',
        cuttingDate: '',
        sewingDate: '',
        finishingDate: '',
        qcDate: '',
        packedUnits: '',
        defectRate: '',
        finalNotes: '',
    });

    useEffect(() => {
        // Load PO data
        const po = mockPOData[poId] || mockPOData['PO-2024-001'];
        setPoData(po);
        setTraceId(generateTraceId());
        
        // Pre-fill from PO
        setFormData(prev => ({
            ...prev,
            category: po.category,
            totalUnits: po.quantity.toString(),
            deliveryDate: po.dueDate,
        }));
    }, [poId]);

    const updateFormData = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const selectSavedSupplier = (type, supplier) => {
        const fieldMappings = {
            fiber: {
                fiberSupplier: supplier.name,
                fiberSupplierLocation: supplier.location,
                fiberCertification: supplier.certification,
            },
            spinning: {
                spinningMill: supplier.name,
                spinningLocation: supplier.location,
                spinningCertification: supplier.certification,
            },
            fabric: {
                fabricSupplier: supplier.name,
                fabricLocation: supplier.location,
                fabricCertification: supplier.certification,
            },
            processing: {
                dyeingHouse: supplier.name,
                dyeingLocation: supplier.location,
                processingCertification: supplier.certification,
            },
        };
        
        setFormData(prev => ({ ...prev, ...fieldMappings[type] }));
        setShowSupplierSearch(null);
        toast.success(`${supplier.name} selected and data auto-filled`);
    };

    const sendVerificationNotification = (supplierName) => {
        toast.success(`Digital handshake sent to ${supplierName}`, {
            description: 'Supplier will receive notification to verify data',
        });
    };

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSaveDraft = () => {
        const draft = {
            traceId,
            poId,
            formData,
            currentStep,
            savedAt: new Date().toISOString(),
        };
        localStorage.setItem(`product_draft_${poId}`, JSON.stringify(draft));
        toast.success('Draft saved successfully');
    };

    const handleSubmit = () => {
        // Save complete product data
        const productData = {
            traceId,
            poId,
            poData,
            formData,
            status: 'complete',
            createdAt: new Date().toISOString(),
        };
        
        // Store in localStorage (would be API call in production)
        const existingProducts = JSON.parse(localStorage.getItem('textile_products') || '[]');
        existingProducts.push(productData);
        localStorage.setItem('textile_products', JSON.stringify(existingProducts));
        
        toast.success('Product created successfully!', {
            description: `Traceability ID: ${traceId}`,
        });
        
        navigate('/manufacturer/traceability-tree');
    };

    const progress = ((currentStep + 1) / steps.length) * 100;

    if (!poData) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6" data-testid="product-creation-page">
            {/* Header with PO Info */}
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                            {poData.poNumber}
                        </Badge>
                        <Badge variant="secondary">{poData.buyer}</Badge>
                    </div>
                    <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
                        Product Creation Engine
                    </h1>
                    <p className="text-muted-foreground">
                        {poData.product} • {poData.quantity.toLocaleString()} {poData.unit}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={handleSaveDraft}>
                        <Save className="h-4 w-4 mr-2" />
                        Save Draft
                    </Button>
                </div>
            </div>

            {/* Traceability ID Card */}
            <Card className="bg-gradient-to-r from-secondary/10 to-primary/10 border-secondary/30">
                <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-secondary/20">
                            <QrCode className="h-5 w-5 text-secondary" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Unique Traceability ID</p>
                            <p className="font-mono font-bold text-lg text-foreground">{traceId}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
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
                        <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                            <Shield className="h-3 w-3 mr-1" />
                            Blockchain Ready
                        </Badge>
                    </div>
                </CardContent>
            </Card>

            {/* Progress Steps */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium">Step {currentStep + 1} of {steps.length}</span>
                        <span className="text-sm text-muted-foreground">{Math.round(progress)}% Complete</span>
                    </div>
                    <Progress value={progress} className="h-2 mb-4" />
                    
                    <div className="hidden md:flex items-center justify-between">
                        {steps.map((step, index) => (
                            <div 
                                key={step.id}
                                className={`flex flex-col items-center cursor-pointer transition-all ${
                                    index === currentStep ? 'scale-105' : ''
                                }`}
                                onClick={() => setCurrentStep(index)}
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors ${
                                    index < currentStep ? 'bg-success text-success-foreground' :
                                    index === currentStep ? 'bg-primary text-primary-foreground' :
                                    'bg-muted text-muted-foreground'
                                }`}>
                                    {index < currentStep ? (
                                        <Check className="h-5 w-5" />
                                    ) : (
                                        <step.icon className="h-5 w-5" />
                                    )}
                                </div>
                                <span className={`text-xs text-center ${
                                    index === currentStep ? 'font-medium text-foreground' : 'text-muted-foreground'
                                }`}>
                                    {step.title}
                                </span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Step Content */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        {React.createElement(steps[currentStep].icon, { className: "h-6 w-6 text-secondary" })}
                        <div>
                            <CardTitle>{steps[currentStep].title}</CardTitle>
                            <CardDescription>{steps[currentStep].description}</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Step 0: Product Identity */}
                    {currentStep === 0 && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                    <Label htmlFor="styleNumber">Style Number *</Label>
                                    <Input 
                                        id="styleNumber"
                                        placeholder="e.g., STY-2024-001"
                                        value={formData.styleNumber}
                                        onChange={(e) => updateFormData('styleNumber', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="sku">SKU *</Label>
                                    <Input 
                                        id="sku"
                                        placeholder="e.g., TSH-ORG-WHT-M"
                                        value={formData.sku}
                                        onChange={(e) => updateFormData('sku', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="category">Category</Label>
                                    <Select 
                                        value={formData.category} 
                                        onValueChange={(v) => updateFormData('category', v)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="T-Shirt">T-Shirt</SelectItem>
                                            <SelectItem value="Shirt">Shirt</SelectItem>
                                            <SelectItem value="Pants">Pants</SelectItem>
                                            <SelectItem value="Jacket">Jacket</SelectItem>
                                            <SelectItem value="Dress">Dress</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
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
                                    <Label htmlFor="totalUnits">Total Units</Label>
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
                                    <Label htmlFor="deliveryDate">Delivery Date</Label>
                                    <Input 
                                        id="deliveryDate"
                                        type="date"
                                        value={formData.deliveryDate}
                                        onChange={(e) => updateFormData('deliveryDate', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="factoryAddress">Factory Address *</Label>
                                <Textarea 
                                    id="factoryAddress"
                                    placeholder="Complete factory address with city and country"
                                    value={formData.factoryAddress}
                                    onChange={(e) => updateFormData('factoryAddress', e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Certifications</Label>
                                <div className="flex flex-wrap gap-2">
                                    {['GOTS', 'OCS', 'OEKO-TEX', 'SA8000', 'WRAP', 'ISO 9001'].map((cert) => (
                                        <Badge 
                                            key={cert}
                                            variant={formData.certifications.includes(cert) ? 'default' : 'outline'}
                                            className="cursor-pointer"
                                            onClick={() => {
                                                const newCerts = formData.certifications.includes(cert)
                                                    ? formData.certifications.filter(c => c !== cert)
                                                    : [...formData.certifications, cert];
                                                updateFormData('certifications', newCerts);
                                            }}
                                        >
                                            {cert}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 1: Fiber Details */}
                    {currentStep === 1 && (
                        <div className="space-y-6">
                            {/* Saved Suppliers Quick Select */}
                            <Card className="bg-muted/30">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm font-medium">Quick Select from Saved Suppliers</span>
                                        <Button variant="ghost" size="sm" onClick={() => setShowSupplierSearch('fiber')}>
                                            <Search className="h-4 w-4 mr-1" />
                                            Browse All
                                        </Button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {savedSuppliers.fiber.map((supplier) => (
                                            <Button 
                                                key={supplier.id}
                                                variant="outline"
                                                size="sm"
                                                onClick={() => selectSavedSupplier('fiber', supplier)}
                                            >
                                                <Building2 className="h-3 w-3 mr-1" />
                                                {supplier.name}
                                            </Button>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="fiberType">Fiber Type *</Label>
                                    <Select 
                                        value={formData.fiberType} 
                                        onValueChange={(v) => updateFormData('fiberType', v)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select fiber type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Organic Cotton">Organic Cotton</SelectItem>
                                            <SelectItem value="BCI Cotton">BCI Cotton</SelectItem>
                                            <SelectItem value="Recycled Polyester">Recycled Polyester</SelectItem>
                                            <SelectItem value="Recycled Cotton">Recycled Cotton</SelectItem>
                                            <SelectItem value="Hemp">Hemp</SelectItem>
                                            <SelectItem value="Linen">Linen</SelectItem>
                                            <SelectItem value="Wool">Wool</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="fiberSource">Fiber Source/Origin</Label>
                                    <Input 
                                        id="fiberSource"
                                        placeholder="e.g., Gujarat, India"
                                        value={formData.fiberSource}
                                        onChange={(e) => updateFormData('fiberSource', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="fiberSupplier">Supplier Name *</Label>
                                    <Input 
                                        id="fiberSupplier"
                                        placeholder="Fiber supplier name"
                                        value={formData.fiberSupplier}
                                        onChange={(e) => updateFormData('fiberSupplier', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="fiberSupplierLocation">Supplier Location</Label>
                                    <Input 
                                        id="fiberSupplierLocation"
                                        placeholder="City, Country"
                                        value={formData.fiberSupplierLocation}
                                        onChange={(e) => updateFormData('fiberSupplierLocation', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="fiberLotNumber">Lot Number *</Label>
                                    <Input 
                                        id="fiberLotNumber"
                                        placeholder="e.g., LOT-2024-001"
                                        value={formData.fiberLotNumber}
                                        onChange={(e) => updateFormData('fiberLotNumber', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="baleWeight">Bale Weight (KG) *</Label>
                                    <Input 
                                        id="baleWeight"
                                        type="number"
                                        placeholder="e.g., 1500"
                                        value={formData.baleWeight}
                                        onChange={(e) => updateFormData('baleWeight', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="fiberCertification">Certification</Label>
                                    <Input 
                                        id="fiberCertification"
                                        placeholder="e.g., GOTS"
                                        value={formData.fiberCertification}
                                        onChange={(e) => updateFormData('fiberCertification', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="fiberNotes">Notes</Label>
                                <Textarea 
                                    id="fiberNotes"
                                    placeholder="Additional notes about fiber sourcing..."
                                    value={formData.fiberNotes}
                                    onChange={(e) => updateFormData('fiberNotes', e.target.value)}
                                />
                            </div>

                            {formData.fiberSupplier && (
                                <Button 
                                    variant="outline" 
                                    className="w-full"
                                    onClick={() => sendVerificationNotification(formData.fiberSupplier)}
                                >
                                    <Shield className="h-4 w-4 mr-2" />
                                    Send Digital Handshake to {formData.fiberSupplier}
                                </Button>
                            )}
                        </div>
                    )}

                    {/* Step 2: Spinning */}
                    {currentStep === 2 && (
                        <div className="space-y-6">
                            <Card className="bg-muted/30">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm font-medium">Quick Select from Saved Suppliers</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {savedSuppliers.spinning.map((supplier) => (
                                            <Button 
                                                key={supplier.id}
                                                variant="outline"
                                                size="sm"
                                                onClick={() => selectSavedSupplier('spinning', supplier)}
                                            >
                                                <Factory className="h-3 w-3 mr-1" />
                                                {supplier.name}
                                            </Button>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="spinningMill">Spinning Mill Name *</Label>
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
                                        placeholder="e.g., 30s, 40s"
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
                                    <Label htmlFor="spinningWeight">Weight (KG) *</Label>
                                    <Input 
                                        id="spinningWeight"
                                        type="number"
                                        placeholder="Total yarn weight"
                                        value={formData.spinningWeight}
                                        onChange={(e) => updateFormData('spinningWeight', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="spinningLotNumber">Lot Number</Label>
                                    <Input 
                                        id="spinningLotNumber"
                                        placeholder="Yarn lot number"
                                        value={formData.spinningLotNumber}
                                        onChange={(e) => updateFormData('spinningLotNumber', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="spinningCertification">Certification</Label>
                                    <Input 
                                        id="spinningCertification"
                                        placeholder="e.g., GOTS"
                                        value={formData.spinningCertification}
                                        onChange={(e) => updateFormData('spinningCertification', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="spinningNotes">Notes</Label>
                                <Textarea 
                                    id="spinningNotes"
                                    placeholder="Additional notes about spinning..."
                                    value={formData.spinningNotes}
                                    onChange={(e) => updateFormData('spinningNotes', e.target.value)}
                                />
                            </div>

                            {formData.spinningMill && (
                                <Button 
                                    variant="outline" 
                                    className="w-full"
                                    onClick={() => sendVerificationNotification(formData.spinningMill)}
                                >
                                    <Shield className="h-4 w-4 mr-2" />
                                    Send Digital Handshake to {formData.spinningMill}
                                </Button>
                            )}
                        </div>
                    )}

                    {/* Step 3: Fabric */}
                    {currentStep === 3 && (
                        <div className="space-y-6">
                            <Card className="bg-muted/30">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm font-medium">Quick Select from Saved Suppliers</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {savedSuppliers.fabric.map((supplier) => (
                                            <Button 
                                                key={supplier.id}
                                                variant="outline"
                                                size="sm"
                                                onClick={() => selectSavedSupplier('fabric', supplier)}
                                            >
                                                <Package className="h-3 w-3 mr-1" />
                                                {supplier.name}
                                            </Button>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="fabricType">Fabric Type *</Label>
                                    <Select 
                                        value={formData.fabricType} 
                                        onValueChange={(v) => updateFormData('fabricType', v)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select fabric type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Jersey">Jersey (Knit)</SelectItem>
                                            <SelectItem value="Pique">Pique (Knit)</SelectItem>
                                            <SelectItem value="Rib">Rib (Knit)</SelectItem>
                                            <SelectItem value="Interlock">Interlock (Knit)</SelectItem>
                                            <SelectItem value="Poplin">Poplin (Woven)</SelectItem>
                                            <SelectItem value="Twill">Twill (Woven)</SelectItem>
                                            <SelectItem value="Denim">Denim (Woven)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="fabricSupplier">Supplier Name *</Label>
                                    <Input 
                                        id="fabricSupplier"
                                        placeholder="Fabric supplier"
                                        value={formData.fabricSupplier}
                                        onChange={(e) => updateFormData('fabricSupplier', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="gsm">GSM *</Label>
                                    <Input 
                                        id="gsm"
                                        type="number"
                                        placeholder="e.g., 180"
                                        value={formData.gsm}
                                        onChange={(e) => updateFormData('gsm', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="fabricWidth">Width (inches)</Label>
                                    <Input 
                                        id="fabricWidth"
                                        placeholder="e.g., 72"
                                        value={formData.fabricWidth}
                                        onChange={(e) => updateFormData('fabricWidth', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="totalMeters">Total Meters *</Label>
                                    <Input 
                                        id="totalMeters"
                                        type="number"
                                        placeholder="Total fabric meters"
                                        value={formData.totalMeters}
                                        onChange={(e) => updateFormData('totalMeters', e.target.value)}
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
                                    <Label htmlFor="fabricLocation">Location</Label>
                                    <Input 
                                        id="fabricLocation"
                                        placeholder="City, Country"
                                        value={formData.fabricLocation}
                                        onChange={(e) => updateFormData('fabricLocation', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Processing/Dyeing */}
                    {currentStep === 4 && (
                        <div className="space-y-6">
                            <Card className="bg-muted/30">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm font-medium">Quick Select from Saved Suppliers</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {savedSuppliers.processing.map((supplier) => (
                                            <Button 
                                                key={supplier.id}
                                                variant="outline"
                                                size="sm"
                                                onClick={() => selectSavedSupplier('processing', supplier)}
                                            >
                                                <Droplets className="h-3 w-3 mr-1" />
                                                {supplier.name}
                                            </Button>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="dyeingHouse">Dyeing House Name *</Label>
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
                                    <Select 
                                        value={formData.dyeType} 
                                        onValueChange={(v) => updateFormData('dyeType', v)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select dye type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Reactive">Reactive Dye</SelectItem>
                                            <SelectItem value="Disperse">Disperse Dye</SelectItem>
                                            <SelectItem value="Vat">Vat Dye</SelectItem>
                                            <SelectItem value="Pigment">Pigment</SelectItem>
                                            <SelectItem value="Natural">Natural Dye</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="shadeNumber">Shade Number</Label>
                                    <Input 
                                        id="shadeNumber"
                                        placeholder="e.g., WHT-001"
                                        value={formData.shadeNumber}
                                        onChange={(e) => updateFormData('shadeNumber', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="waterUsage">Water Usage (Liters)</Label>
                                    <Input 
                                        id="waterUsage"
                                        type="number"
                                        placeholder="Total water used"
                                        value={formData.waterUsage}
                                        onChange={(e) => updateFormData('waterUsage', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="chemicalLogs">Chemical Logs / MSDS Reference</Label>
                                <Textarea 
                                    id="chemicalLogs"
                                    placeholder="List chemicals used and their compliance status..."
                                    value={formData.chemicalLogs}
                                    onChange={(e) => updateFormData('chemicalLogs', e.target.value)}
                                />
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox 
                                    id="shadeApproval"
                                    checked={formData.shadeApproval}
                                    onCheckedChange={(checked) => updateFormData('shadeApproval', checked)}
                                />
                                <Label htmlFor="shadeApproval" className="text-sm font-normal">
                                    Shade Approved by Buyer
                                </Label>
                            </div>
                        </div>
                    )}

                    {/* Step 5: Value Addition */}
                    {currentStep === 5 && (
                        <div className="space-y-6">
                            <div className="p-4 rounded-xl bg-muted/30">
                                <p className="text-sm text-muted-foreground mb-4">
                                    Select and configure any value-added processes applied to the garments
                                </p>
                            </div>

                            {/* Embroidery */}
                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center space-x-2 mb-4">
                                        <Checkbox 
                                            id="hasEmbroidery"
                                            checked={formData.hasEmbroidery}
                                            onCheckedChange={(checked) => updateFormData('hasEmbroidery', checked)}
                                        />
                                        <Label htmlFor="hasEmbroidery" className="font-medium">
                                            Embroidery
                                        </Label>
                                    </div>
                                    {formData.hasEmbroidery && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="embroideryDetails">Details</Label>
                                                <Input 
                                                    id="embroideryDetails"
                                                    placeholder="Logo, placement, thread type..."
                                                    value={formData.embroideryDetails}
                                                    onChange={(e) => updateFormData('embroideryDetails', e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="embroideryUnits">Units</Label>
                                                <Input 
                                                    id="embroideryUnits"
                                                    type="number"
                                                    placeholder="Number of units"
                                                    value={formData.embroideryUnits}
                                                    onChange={(e) => updateFormData('embroideryUnits', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Printing */}
                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center space-x-2 mb-4">
                                        <Checkbox 
                                            id="hasPrinting"
                                            checked={formData.hasPrinting}
                                            onCheckedChange={(checked) => updateFormData('hasPrinting', checked)}
                                        />
                                        <Label htmlFor="hasPrinting" className="font-medium">
                                            Printing
                                        </Label>
                                    </div>
                                    {formData.hasPrinting && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="printingDetails">Details</Label>
                                                <Input 
                                                    id="printingDetails"
                                                    placeholder="Print type, colors, placement..."
                                                    value={formData.printingDetails}
                                                    onChange={(e) => updateFormData('printingDetails', e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="printingUnits">Units</Label>
                                                <Input 
                                                    id="printingUnits"
                                                    type="number"
                                                    placeholder="Number of units"
                                                    value={formData.printingUnits}
                                                    onChange={(e) => updateFormData('printingUnits', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Washing */}
                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center space-x-2 mb-4">
                                        <Checkbox 
                                            id="hasWashing"
                                            checked={formData.hasWashing}
                                            onCheckedChange={(checked) => updateFormData('hasWashing', checked)}
                                        />
                                        <Label htmlFor="hasWashing" className="font-medium">
                                            Washing/Treatment
                                        </Label>
                                    </div>
                                    {formData.hasWashing && (
                                        <div className="pl-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="washingDetails">Washing Details</Label>
                                                <Input 
                                                    id="washingDetails"
                                                    placeholder="Wash type (enzyme, stone, etc.)..."
                                                    value={formData.washingDetails}
                                                    onChange={(e) => updateFormData('washingDetails', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <div className="space-y-2">
                                <Label htmlFor="valueAdditionNotes">Additional Notes</Label>
                                <Textarea 
                                    id="valueAdditionNotes"
                                    placeholder="Any other value addition details..."
                                    value={formData.valueAdditionNotes}
                                    onChange={(e) => updateFormData('valueAdditionNotes', e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 6: Final Construction */}
                    {currentStep === 6 && (
                        <div className="space-y-6">
                            <div className="p-4 rounded-xl bg-success/10 border border-success/30">
                                <div className="flex items-center gap-2 mb-2">
                                    <Shirt className="h-5 w-5 text-success" />
                                    <span className="font-medium text-success">Final Step - Link Everything Together</span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    This step links all previous entries to the final finished product.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="cmtFactory">CMT Factory Name *</Label>
                                    <Input 
                                        id="cmtFactory"
                                        placeholder="Cut-Make-Trim factory"
                                        value={formData.cmtFactory}
                                        onChange={(e) => updateFormData('cmtFactory', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="cmtLocation">Location</Label>
                                    <Input 
                                        id="cmtLocation"
                                        placeholder="City, Country"
                                        value={formData.cmtLocation}
                                        onChange={(e) => updateFormData('cmtLocation', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="cuttingDate">Cutting Date</Label>
                                    <Input 
                                        id="cuttingDate"
                                        type="date"
                                        value={formData.cuttingDate}
                                        onChange={(e) => updateFormData('cuttingDate', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="sewingDate">Sewing Date</Label>
                                    <Input 
                                        id="sewingDate"
                                        type="date"
                                        value={formData.sewingDate}
                                        onChange={(e) => updateFormData('sewingDate', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="finishingDate">Finishing Date</Label>
                                    <Input 
                                        id="finishingDate"
                                        type="date"
                                        value={formData.finishingDate}
                                        onChange={(e) => updateFormData('finishingDate', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="qcDate">QC Date</Label>
                                    <Input 
                                        id="qcDate"
                                        type="date"
                                        value={formData.qcDate}
                                        onChange={(e) => updateFormData('qcDate', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="packedUnits">Packed Units *</Label>
                                    <Input 
                                        id="packedUnits"
                                        type="number"
                                        placeholder="Total packed units"
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
                                    placeholder="Any final notes about the production..."
                                    value={formData.finalNotes}
                                    onChange={(e) => updateFormData('finalNotes', e.target.value)}
                                />
                            </div>

                            {/* Summary */}
                            <Card className="bg-muted/30">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base">Production Summary</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                        <div>
                                            <span className="text-muted-foreground">Fiber:</span>
                                            <p className="font-medium">{formData.fiberType || '-'}</p>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Yarn:</span>
                                            <p className="font-medium">{formData.yarnCount || '-'}</p>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Fabric:</span>
                                            <p className="font-medium">{formData.fabricType} {formData.gsm ? `(${formData.gsm} GSM)` : ''}</p>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Processing:</span>
                                            <p className="font-medium">{formData.dyeingHouse || '-'}</p>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Total Units:</span>
                                            <p className="font-medium">{formData.totalUnits || '-'}</p>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Packed:</span>
                                            <p className="font-medium">{formData.packedUnits || '-'}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between">
                <Button 
                    variant="outline" 
                    onClick={handlePrevious}
                    disabled={currentStep === 0}
                >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Previous
                </Button>
                
                <div className="flex items-center gap-2">
                    {currentStep === steps.length - 1 ? (
                        <Button variant="hero" onClick={handleSubmit}>
                            <Check className="h-4 w-4 mr-2" />
                            Complete & Generate Traceability
                        </Button>
                    ) : (
                        <Button onClick={handleNext}>
                            Next
                            <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductCreation;
