import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, RefreshCw, Loader2, AlertTriangle, CheckCircle, Clock,
    FileText, Users, Package, Upload, Plus, Eye, Download, Edit2,
    ShieldCheck, ShieldAlert, ShieldX, Leaf, Globe, ChevronRight,
    ArrowRight, Factory, Shirt, Truck, Check, X, ExternalLink,
    AlertCircle, XCircle, Layers, MapPin, Calendar, Award
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { traceabilityAPI, purchaseOrdersAPI } from '@/lib/api';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const SUPPLY_CHAIN_STAGES = [
    { key: 'fiber', label: 'Fiber', icon: Leaf, description: 'Raw material sourcing' },
    { key: 'yarn', label: 'Yarn', icon: Layers, description: 'Yarn spinning' },
    { key: 'fabric', label: 'Fabric', icon: Layers, description: 'Fabric weaving/knitting' },
    { key: 'garment', label: 'Garment', icon: Shirt, description: 'Garment manufacturing' },
    { key: 'dispatch', label: 'Dispatch', icon: Truck, description: 'Shipping & delivery' },
];

const DOCUMENT_TYPES = [
    { value: 'organic_certification', label: 'Organic Certification' },
    { value: 'recycled_certification', label: 'Recycled Certification' },
    { value: 'gots_certification', label: 'GOTS Certification' },
    { value: 'oeko_tex_certification', label: 'OEKO-TEX Certification' },
    { value: 'grs_certification', label: 'GRS Certification' },
    { value: 'social_compliance', label: 'Social Compliance Report' },
    { value: 'audit_report', label: 'Audit Report' },
    { value: 'test_report', label: 'Test Report' },
    { value: 'material_specification', label: 'Material Specification' },
    { value: 'other', label: 'Other' },
];

const POTraceabilityDetail = () => {
    const { poId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [po, setPO] = useState(null);
    const [traceability, setTraceability] = useState(null);
    const [alerts, setAlerts] = useState([]);
    const [activeTab, setActiveTab] = useState('supply-chain');
    
    // Dialogs
    const [showUploadDoc, setShowUploadDoc] = useState(false);
    const [showEditStage, setShowEditStage] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    
    // Form states
    const [docForm, setDocForm] = useState({
        document_type: '',
        title: '',
        description: '',
        issued_by: '',
        certificate_number: '',
        issue_date: '',
        expiry_date: '',
        file: null
    });
    
    const [stageForm, setStageForm] = useState({
        supplier_name: '',
        supplier_tier: 'tier_1',
        location: '',
        country: '',
        completed: false,
        batch_numbers: '',
        notes: ''
    });

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [poRes, traceRes, alertsRes] = await Promise.all([
                purchaseOrdersAPI.getById(poId),
                traceabilityAPI.getByPO(poId),
                traceabilityAPI.getAlerts({ po_id: poId, resolved: false })
            ]);
            setPO(poRes.data);
            setTraceability(traceRes.data);
            setAlerts(alertsRes.data);
        } catch (error) {
            console.error('Failed to fetch data:', error);
            toast.error('Failed to load traceability data');
        } finally {
            setLoading(false);
        }
    }, [poId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleUploadDocument = async () => {
        if (!docForm.document_type || !docForm.title || !docForm.file) {
            toast.error('Please fill in required fields');
            return;
        }
        
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('document_type', docForm.document_type);
            formData.append('title', docForm.title);
            formData.append('description', docForm.description || '');
            formData.append('issued_by', docForm.issued_by || '');
            formData.append('certificate_number', docForm.certificate_number || '');
            if (docForm.issue_date) formData.append('issue_date', docForm.issue_date);
            if (docForm.expiry_date) formData.append('expiry_date', docForm.expiry_date);
            formData.append('file', docForm.file);
            
            await traceabilityAPI.uploadDocument(poId, formData);
            toast.success('Document uploaded');
            setShowUploadDoc(false);
            setDocForm({
                document_type: '', title: '', description: '', issued_by: '',
                certificate_number: '', issue_date: '', expiry_date: '', file: null
            });
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to upload document');
        } finally {
            setUploading(false);
        }
    };

    const handleUpdateStage = async () => {
        if (!showEditStage) return;
        
        setSaving(true);
        try {
            const updates = [{
                stage: showEditStage,
                supplier_name: stageForm.supplier_name || null,
                supplier_tier: stageForm.supplier_tier || null,
                location: stageForm.location || null,
                country: stageForm.country || null,
                completed: stageForm.completed,
                batch_numbers: stageForm.batch_numbers ? stageForm.batch_numbers.split(',').map(s => s.trim()) : null,
                notes: stageForm.notes || null
            }];
            
            await traceabilityAPI.updateSupplyChain(poId, updates);
            toast.success('Stage updated');
            setShowEditStage(null);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to update stage');
        } finally {
            setSaving(false);
        }
    };

    const handleVerifyDocument = async (docId, status) => {
        try {
            await traceabilityAPI.verifyDocument(poId, docId, status);
            toast.success(`Document ${status}`);
            fetchData();
        } catch (error) {
            toast.error('Failed to update document');
        }
    };

    const openEditStage = (stageKey) => {
        const stageData = traceability?.supply_chain?.find(s => s.stage === stageKey) || {};
        setStageForm({
            supplier_name: stageData.supplier_name || '',
            supplier_tier: stageData.supplier_tier || 'tier_1',
            location: stageData.location || '',
            country: stageData.country || '',
            completed: stageData.completed || false,
            batch_numbers: stageData.batch_numbers?.join(', ') || '',
            notes: stageData.notes || ''
        });
        setShowEditStage(stageKey);
    };

    const getStageData = (stageKey) => {
        return traceability?.supply_chain?.find(s => s.stage === stageKey) || {};
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'verified':
                return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
            case 'pending':
                return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
            case 'expired':
                return 'text-red-400 bg-red-500/10 border-red-500/30';
            default:
                return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
            </div>
        );
    }

    if (!po) {
        return (
            <div className="text-center py-12">
                <Package className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">Purchase Order not found</p>
            </div>
        );
    }

    return (
        <div className="space-y-6" data-testid="po-traceability-detail">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button 
                    variant="ghost" 
                    onClick={() => navigate('/dashboard/brand/traceability')}
                    className="text-slate-400 hover:text-white"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
            </div>

            <div className="flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-white">{po.po_number}</h1>
                        {/* Traceability Indicator Symbol */}
                        <div className={`p-2 rounded-lg ${
                            traceability?.status === 'verified' ? 'bg-emerald-500/10' :
                            traceability?.status === 'complete' ? 'bg-blue-500/10' :
                            traceability?.status === 'partial' ? 'bg-amber-500/10' :
                            'bg-red-500/10'
                        }`}>
                            {traceability?.status === 'verified' ? (
                                <ShieldCheck className="h-6 w-6 text-emerald-400" />
                            ) : traceability?.status === 'complete' ? (
                                <CheckCircle className="h-6 w-6 text-blue-400" />
                            ) : traceability?.status === 'partial' ? (
                                <Clock className="h-6 w-6 text-amber-400" />
                            ) : (
                                <ShieldX className="h-6 w-6 text-red-400" />
                            )}
                        </div>
                        <Badge variant="outline" className={
                            traceability?.status === 'verified' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                            traceability?.status === 'complete' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
                            traceability?.status === 'partial' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                            'bg-red-500/10 text-red-400 border-red-500/30'
                        }>
                            {traceability?.status || 'Not Started'}
                        </Badge>
                    </div>
                    <p className="text-slate-400 mt-1">
                        Supplier: {po.supplier_name} • Status: {po.status}
                    </p>
                </div>
                <Button variant="outline" onClick={fetchData} className="border-slate-600 text-slate-300">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                </Button>
            </div>

            {/* Score Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-sm">Traceability Score</p>
                                <p className="text-3xl font-bold text-white">{traceability?.traceability_score || 0}%</p>
                            </div>
                            <Progress value={traceability?.traceability_score || 0} className="w-16 h-16 [&>div]:bg-emerald-500" />
                        </div>
                    </CardContent>
                </Card>
                
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-sm">Compliance Score</p>
                                <p className="text-3xl font-bold text-white">{traceability?.compliance_score || 0}%</p>
                            </div>
                            <Progress value={traceability?.compliance_score || 0} className="w-16 h-16 [&>div]:bg-blue-500" />
                        </div>
                    </CardContent>
                </Card>
                
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-4">
                        <p className="text-slate-400 text-sm">Tier Suppliers</p>
                        <p className="text-3xl font-bold text-white">{traceability?.tier_suppliers?.length || 0}</p>
                    </CardContent>
                </Card>
                
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-4">
                        <p className="text-slate-400 text-sm">Documents</p>
                        <p className="text-3xl font-bold text-white">{traceability?.documents?.length || 0}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Alerts Banner */}
            {alerts.length > 0 && (
                <Card className="bg-red-500/10 border-red-500/30">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <AlertTriangle className="h-5 w-5 text-red-400" />
                            <span className="text-red-400 font-medium">{alerts.length} Active Alert(s)</span>
                            <span className="text-red-300 text-sm">- Action required for complete traceability</span>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Main Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="bg-slate-800 border border-slate-700">
                    <TabsTrigger value="supply-chain" className="data-[state=active]:bg-emerald-600">Supply Chain</TabsTrigger>
                    <TabsTrigger value="suppliers" className="data-[state=active]:bg-emerald-600">Supplier Mapping</TabsTrigger>
                    <TabsTrigger value="materials" className="data-[state=active]:bg-emerald-600">Materials</TabsTrigger>
                    <TabsTrigger value="documents" className="data-[state=active]:bg-emerald-600">Documents</TabsTrigger>
                    <TabsTrigger value="alerts" className="data-[state=active]:bg-emerald-600">
                        Alerts {alerts.length > 0 && <Badge className="ml-2 bg-red-500">{alerts.length}</Badge>}
                    </TabsTrigger>
                </TabsList>

                {/* Supply Chain Tab */}
                <TabsContent value="supply-chain" className="space-y-6">
                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardHeader>
                            <CardTitle className="text-white">Supply Chain Flow</CardTitle>
                            <CardDescription className="text-slate-400">
                                Track the complete journey from fiber to finished product
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {/* Supply Chain Visualization */}
                            <div className="relative">
                                {/* Connection Line */}
                                <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-700 -translate-y-1/2 z-0" />
                                
                                {/* Stages */}
                                <div className="relative z-10 flex justify-between">
                                    {SUPPLY_CHAIN_STAGES.map((stage, index) => {
                                        const stageData = getStageData(stage.key);
                                        const isCompleted = stageData.completed;
                                        const Icon = stage.icon;
                                        
                                        return (
                                            <div key={stage.key} className="flex flex-col items-center">
                                                {/* Stage Circle */}
                                                <div 
                                                    className={`relative p-4 rounded-full cursor-pointer transition-all ${
                                                        isCompleted 
                                                            ? 'bg-emerald-500 hover:bg-emerald-600' 
                                                            : 'bg-slate-700 hover:bg-slate-600'
                                                    }`}
                                                    onClick={() => openEditStage(stage.key)}
                                                >
                                                    <Icon className={`h-6 w-6 ${isCompleted ? 'text-white' : 'text-slate-400'}`} />
                                                    {isCompleted && (
                                                        <div className="absolute -bottom-1 -right-1 p-1 bg-emerald-600 rounded-full">
                                                            <Check className="h-3 w-3 text-white" />
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                {/* Stage Label */}
                                                <div className="mt-3 text-center">
                                                    <p className={`font-medium ${isCompleted ? 'text-emerald-400' : 'text-slate-300'}`}>
                                                        {stage.label}
                                                    </p>
                                                    <p className="text-xs text-slate-500">{stage.description}</p>
                                                    {stageData.supplier_name && (
                                                        <p className="text-xs text-slate-400 mt-1">{stageData.supplier_name}</p>
                                                    )}
                                                </div>
                                                
                                                {/* Arrow */}
                                                {index < SUPPLY_CHAIN_STAGES.length - 1 && (
                                                    <ArrowRight className="absolute top-1/2 -right-4 h-4 w-4 text-slate-500 -translate-y-1/2 hidden md:block" />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            
                            <p className="text-center text-slate-500 text-sm mt-6">
                                Click on any stage to add or edit traceability data
                            </p>
                        </CardContent>
                    </Card>

                    {/* Stage Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {SUPPLY_CHAIN_STAGES.map((stage) => {
                            const stageData = getStageData(stage.key);
                            const Icon = stage.icon;
                            
                            return (
                                <Card key={stage.key} className={`border ${
                                    stageData.completed 
                                        ? 'bg-emerald-500/5 border-emerald-500/30' 
                                        : 'bg-slate-800/50 border-slate-700'
                                }`}>
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <Icon className={`h-5 w-5 ${stageData.completed ? 'text-emerald-400' : 'text-slate-400'}`} />
                                                <span className="text-white font-medium">{stage.label}</span>
                                            </div>
                                            <Badge variant="outline" className={
                                                stageData.completed 
                                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                                    : 'bg-slate-700 text-slate-400 border-slate-600'
                                            }>
                                                {stageData.completed ? 'Complete' : 'Pending'}
                                            </Badge>
                                        </div>
                                        
                                        {stageData.supplier_name ? (
                                            <div className="space-y-2 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <Factory className="h-4 w-4 text-slate-500" />
                                                    <span className="text-slate-300">{stageData.supplier_name}</span>
                                                </div>
                                                {stageData.country && (
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className="h-4 w-4 text-slate-500" />
                                                        <span className="text-slate-400">{stageData.location || stageData.country}</span>
                                                    </div>
                                                )}
                                                {stageData.batch_numbers?.length > 0 && (
                                                    <div className="flex items-center gap-2">
                                                        <Package className="h-4 w-4 text-slate-500" />
                                                        <span className="text-slate-400">Batch: {stageData.batch_numbers.join(', ')}</span>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-slate-500 text-sm">No data recorded</p>
                                        )}
                                        
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className="w-full mt-3 text-slate-300"
                                            onClick={() => openEditStage(stage.key)}
                                        >
                                            <Edit2 className="h-4 w-4 mr-2" />
                                            {stageData.supplier_name ? 'Edit' : 'Add Data'}
                                        </Button>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </TabsContent>

                {/* Supplier Mapping Tab */}
                <TabsContent value="suppliers" className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-white">Tier-wise Supplier Mapping</h3>
                    </div>
                    
                    {(!traceability?.tier_suppliers || traceability.tier_suppliers.length === 0) ? (
                        <Card className="bg-slate-800/50 border-slate-700">
                            <CardContent className="py-12 text-center">
                                <Users className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-white mb-2">No Suppliers Mapped</h3>
                                <p className="text-slate-400 mb-4">Add tier-wise suppliers from the supply chain stages</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Tier 1 */}
                            <div>
                                <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                                    <Badge className="bg-blue-500">Tier 1</Badge>
                                    Direct Suppliers
                                </h4>
                                <div className="space-y-3">
                                    {traceability.tier_suppliers.filter(s => s.tier === 'tier_1').map((supplier) => (
                                        <Card key={supplier.supplier_id} className="bg-slate-800/50 border-slate-700">
                                            <CardContent className="p-3">
                                                <p className="text-white font-medium">{supplier.supplier_name}</p>
                                                <p className="text-slate-400 text-sm">{supplier.role}</p>
                                                <p className="text-slate-500 text-xs">{supplier.country}</p>
                                            </CardContent>
                                        </Card>
                                    ))}
                                    {traceability.tier_suppliers.filter(s => s.tier === 'tier_1').length === 0 && (
                                        <p className="text-slate-500 text-sm">No Tier 1 suppliers</p>
                                    )}
                                </div>
                            </div>
                            
                            {/* Tier 2 */}
                            <div>
                                <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                                    <Badge className="bg-purple-500">Tier 2</Badge>
                                    Fabric Suppliers
                                </h4>
                                <div className="space-y-3">
                                    {traceability.tier_suppliers.filter(s => s.tier === 'tier_2').map((supplier) => (
                                        <Card key={supplier.supplier_id} className="bg-slate-800/50 border-slate-700">
                                            <CardContent className="p-3">
                                                <p className="text-white font-medium">{supplier.supplier_name}</p>
                                                <p className="text-slate-400 text-sm">{supplier.role}</p>
                                                <p className="text-slate-500 text-xs">{supplier.country}</p>
                                            </CardContent>
                                        </Card>
                                    ))}
                                    {traceability.tier_suppliers.filter(s => s.tier === 'tier_2').length === 0 && (
                                        <p className="text-slate-500 text-sm">No Tier 2 suppliers</p>
                                    )}
                                </div>
                            </div>
                            
                            {/* Tier 3 */}
                            <div>
                                <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                                    <Badge className="bg-teal-500">Tier 3</Badge>
                                    Raw Material Suppliers
                                </h4>
                                <div className="space-y-3">
                                    {traceability.tier_suppliers.filter(s => s.tier === 'tier_3').map((supplier) => (
                                        <Card key={supplier.supplier_id} className="bg-slate-800/50 border-slate-700">
                                            <CardContent className="p-3">
                                                <p className="text-white font-medium">{supplier.supplier_name}</p>
                                                <p className="text-slate-400 text-sm">{supplier.role}</p>
                                                <p className="text-slate-500 text-xs">{supplier.country}</p>
                                            </CardContent>
                                        </Card>
                                    ))}
                                    {traceability.tier_suppliers.filter(s => s.tier === 'tier_3').length === 0 && (
                                        <p className="text-slate-500 text-sm">No Tier 3 suppliers</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </TabsContent>

                {/* Materials Tab */}
                <TabsContent value="materials" className="space-y-4">
                    {traceability?.material_details ? (
                        <Card className="bg-slate-800/50 border-slate-700">
                            <CardHeader>
                                <CardTitle className="text-white">Material Specification</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                        <Label className="text-slate-400">Material Type</Label>
                                        <p className="text-white font-medium">{traceability.material_details.material_type}</p>
                                    </div>
                                    <div>
                                        <Label className="text-slate-400">Composition</Label>
                                        <p className="text-white font-medium">{traceability.material_details.composition}</p>
                                    </div>
                                    {traceability.material_details.gsm && (
                                        <div>
                                            <Label className="text-slate-400">GSM</Label>
                                            <p className="text-white font-medium">{traceability.material_details.gsm}</p>
                                        </div>
                                    )}
                                    {traceability.material_details.origin_country && (
                                        <div>
                                            <Label className="text-slate-400">Origin</Label>
                                            <p className="text-white font-medium">{traceability.material_details.origin_country}</p>
                                        </div>
                                    )}
                                </div>
                                {traceability.material_details.sustainability_tags?.length > 0 && (
                                    <div className="mt-4">
                                        <Label className="text-slate-400">Sustainability Tags</Label>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {traceability.material_details.sustainability_tags.map(tag => (
                                                <Badge key={tag} className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                                                    <Leaf className="h-3 w-3 mr-1" />
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="bg-slate-800/50 border-slate-700">
                            <CardContent className="py-12 text-center">
                                <Layers className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-white mb-2">No Material Details</h3>
                                <p className="text-slate-400">Material specifications have not been added yet</p>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                {/* Documents Tab */}
                <TabsContent value="documents" className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-white">Sustainability & Compliance Documents</h3>
                        <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setShowUploadDoc(true)}>
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Document
                        </Button>
                    </div>
                    
                    {(!traceability?.documents || traceability.documents.length === 0) ? (
                        <Card className="bg-slate-800/50 border-slate-700">
                            <CardContent className="py-12 text-center">
                                <FileText className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-white mb-2">No Documents</h3>
                                <p className="text-slate-400 mb-4">Upload certifications and compliance reports</p>
                                <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setShowUploadDoc(true)}>
                                    <Upload className="h-4 w-4 mr-2" />
                                    Upload First Document
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {traceability.documents.map((doc) => (
                                <Card key={doc.id} className="bg-slate-800/50 border-slate-700">
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-3">
                                                <div className="p-2 rounded-lg bg-blue-500/10">
                                                    <FileText className="h-5 w-5 text-blue-400" />
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium">{doc.title}</p>
                                                    <p className="text-slate-400 text-sm capitalize">{doc.document_type.replace(/_/g, ' ')}</p>
                                                    {doc.issued_by && (
                                                        <p className="text-slate-500 text-xs">Issued by: {doc.issued_by}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <Badge variant="outline" className={getStatusColor(doc.status)}>
                                                {doc.status}
                                            </Badge>
                                        </div>
                                        
                                        <div className="mt-3 flex items-center gap-2 text-sm text-slate-400">
                                            {doc.expiry_date && (
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-4 w-4" />
                                                    Expires: {new Date(doc.expiry_date).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                        
                                        <div className="mt-3 pt-3 border-t border-slate-700 flex items-center justify-between">
                                            <a 
                                                href={`${BACKEND_URL}${doc.file_url}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-emerald-400 text-sm hover:underline flex items-center gap-1"
                                            >
                                                <ExternalLink className="h-4 w-4" />
                                                View Document
                                            </a>
                                            {doc.status === 'pending' && (
                                                <div className="flex gap-2">
                                                    <Button 
                                                        size="sm" 
                                                        variant="outline"
                                                        onClick={() => handleVerifyDocument(doc.id, 'rejected')}
                                                        className="border-red-500/30 text-red-400"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                    <Button 
                                                        size="sm"
                                                        onClick={() => handleVerifyDocument(doc.id, 'verified')}
                                                        className="bg-emerald-600 hover:bg-emerald-700"
                                                    >
                                                        <Check className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* Alerts Tab */}
                <TabsContent value="alerts" className="space-y-4">
                    {alerts.length === 0 ? (
                        <Card className="bg-slate-800/50 border-slate-700">
                            <CardContent className="py-12 text-center">
                                <CheckCircle className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-white mb-2">No Active Alerts</h3>
                                <p className="text-slate-400">All traceability data is up to date</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-3">
                            {alerts.map((alert) => (
                                <Card key={alert.id} className={`border ${
                                    alert.severity === 'high' ? 'bg-red-500/5 border-red-500/30' :
                                    alert.severity === 'medium' ? 'bg-amber-500/5 border-amber-500/30' :
                                    'bg-blue-500/5 border-blue-500/30'
                                }`}>
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-3">
                                                <div className={`p-2 rounded-lg ${
                                                    alert.severity === 'high' ? 'bg-red-500/10' :
                                                    alert.severity === 'medium' ? 'bg-amber-500/10' :
                                                    'bg-blue-500/10'
                                                }`}>
                                                    {alert.severity === 'high' ? (
                                                        <XCircle className="h-5 w-5 text-red-400" />
                                                    ) : alert.severity === 'medium' ? (
                                                        <AlertTriangle className="h-5 w-5 text-amber-400" />
                                                    ) : (
                                                        <AlertCircle className="h-5 w-5 text-blue-400" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium">{alert.title}</p>
                                                    <p className="text-slate-400 text-sm">{alert.description}</p>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className={
                                                alert.severity === 'high' ? 'bg-red-500/10 text-red-400 border-red-500/30' :
                                                alert.severity === 'medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                                                'bg-blue-500/10 text-blue-400 border-blue-500/30'
                                            }>
                                                {alert.severity}
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* Upload Document Dialog */}
            <Dialog open={showUploadDoc} onOpenChange={setShowUploadDoc}>
                <DialogContent className="bg-slate-800 border-slate-700 max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="text-white">Upload Document</DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Add certification or compliance document
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label className="text-slate-300">Document Type *</Label>
                            <Select value={docForm.document_type} onValueChange={(v) => setDocForm(prev => ({ ...prev, document_type: v }))}>
                                <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-slate-700">
                                    {DOCUMENT_TYPES.map(t => (
                                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-300">Title *</Label>
                            <Input
                                value={docForm.title}
                                onChange={(e) => setDocForm(prev => ({ ...prev, title: e.target.value }))}
                                className="bg-slate-900/50 border-slate-600 text-white"
                                placeholder="e.g., GOTS Certificate 2026"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-slate-300">Issued By</Label>
                                <Input
                                    value={docForm.issued_by}
                                    onChange={(e) => setDocForm(prev => ({ ...prev, issued_by: e.target.value }))}
                                    className="bg-slate-900/50 border-slate-600 text-white"
                                    placeholder="Certifying body"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-300">Certificate #</Label>
                                <Input
                                    value={docForm.certificate_number}
                                    onChange={(e) => setDocForm(prev => ({ ...prev, certificate_number: e.target.value }))}
                                    className="bg-slate-900/50 border-slate-600 text-white"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-slate-300">Issue Date</Label>
                                <Input
                                    type="date"
                                    value={docForm.issue_date}
                                    onChange={(e) => setDocForm(prev => ({ ...prev, issue_date: e.target.value }))}
                                    className="bg-slate-900/50 border-slate-600 text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-300">Expiry Date</Label>
                                <Input
                                    type="date"
                                    value={docForm.expiry_date}
                                    onChange={(e) => setDocForm(prev => ({ ...prev, expiry_date: e.target.value }))}
                                    className="bg-slate-900/50 border-slate-600 text-white"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-300">File *</Label>
                            <Input
                                type="file"
                                onChange={(e) => setDocForm(prev => ({ ...prev, file: e.target.files[0] }))}
                                className="bg-slate-900/50 border-slate-600 text-white"
                                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowUploadDoc(false)} className="border-slate-600 text-slate-300">
                            Cancel
                        </Button>
                        <Button onClick={handleUploadDocument} disabled={uploading} className="bg-emerald-600 hover:bg-emerald-700">
                            {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                            Upload
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Stage Dialog */}
            <Dialog open={!!showEditStage} onOpenChange={() => setShowEditStage(null)}>
                <DialogContent className="bg-slate-800 border-slate-700 max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="text-white">
                            Edit {SUPPLY_CHAIN_STAGES.find(s => s.key === showEditStage)?.label || ''} Stage
                        </DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Add supplier and traceability data for this stage
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label className="text-slate-300">Supplier Name</Label>
                            <Input
                                value={stageForm.supplier_name}
                                onChange={(e) => setStageForm(prev => ({ ...prev, supplier_name: e.target.value }))}
                                className="bg-slate-900/50 border-slate-600 text-white"
                                placeholder="e.g., ABC Textiles Ltd"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-slate-300">Supplier Tier</Label>
                                <Select value={stageForm.supplier_tier} onValueChange={(v) => setStageForm(prev => ({ ...prev, supplier_tier: v }))}>
                                    <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-800 border-slate-700">
                                        <SelectItem value="tier_1">Tier 1 (Direct)</SelectItem>
                                        <SelectItem value="tier_2">Tier 2 (Fabric)</SelectItem>
                                        <SelectItem value="tier_3">Tier 3 (Raw Material)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-300">Country</Label>
                                <Input
                                    value={stageForm.country}
                                    onChange={(e) => setStageForm(prev => ({ ...prev, country: e.target.value }))}
                                    className="bg-slate-900/50 border-slate-600 text-white"
                                    placeholder="e.g., India"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-300">Location</Label>
                            <Input
                                value={stageForm.location}
                                onChange={(e) => setStageForm(prev => ({ ...prev, location: e.target.value }))}
                                className="bg-slate-900/50 border-slate-600 text-white"
                                placeholder="e.g., Mumbai, Maharashtra"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-300">Batch Numbers (comma-separated)</Label>
                            <Input
                                value={stageForm.batch_numbers}
                                onChange={(e) => setStageForm(prev => ({ ...prev, batch_numbers: e.target.value }))}
                                className="bg-slate-900/50 border-slate-600 text-white"
                                placeholder="e.g., BATCH-001, BATCH-002"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-300">Notes</Label>
                            <Textarea
                                value={stageForm.notes}
                                onChange={(e) => setStageForm(prev => ({ ...prev, notes: e.target.value }))}
                                className="bg-slate-900/50 border-slate-600 text-white"
                                rows={2}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="completed"
                                checked={stageForm.completed}
                                onChange={(e) => setStageForm(prev => ({ ...prev, completed: e.target.checked }))}
                                className="rounded"
                            />
                            <Label htmlFor="completed" className="text-slate-300">Mark as completed</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowEditStage(null)} className="border-slate-600 text-slate-300">
                            Cancel
                        </Button>
                        <Button onClick={handleUpdateStage} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
                            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
                            Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default POTraceabilityDetail;
