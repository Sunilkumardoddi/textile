import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
    Factory, Package, TrendingUp, AlertTriangle, 
    ChevronRight, Clock, CheckCircle2, ArrowUpRight,
    GitBranch, Award, FileCheck, ShoppingBag, 
    ShoppingCart, Sparkles, Edit3, RefreshCw,
    Download, FileSpreadsheet, FileText, X, Filter,
    Calendar, Timer, XCircle, Pause, Zap, ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from 'sonner';

// Status configuration with colors
const statusConfig = {
    incoming: { label: 'Incoming', color: 'bg-blue-500', textColor: 'text-blue-700', bgLight: 'bg-blue-50', borderColor: 'border-blue-300' },
    pending: { label: 'Pending Traceability', color: 'bg-orange-500', textColor: 'text-orange-700', bgLight: 'bg-orange-50', borderColor: 'border-orange-300' },
    in_progress: { label: 'In Progress', color: 'bg-teal-500', textColor: 'text-teal-700', bgLight: 'bg-teal-50', borderColor: 'border-teal-300' },
    delayed: { label: 'Delayed', color: 'bg-red-500', textColor: 'text-red-700', bgLight: 'bg-red-50', borderColor: 'border-red-300' },
    complete: { label: 'Completed', color: 'bg-green-500', textColor: 'text-green-700', bgLight: 'bg-green-50', borderColor: 'border-green-300' },
    canceled: { label: 'Canceled', color: 'bg-gray-500', textColor: 'text-gray-700', bgLight: 'bg-gray-50', borderColor: 'border-gray-300' },
};

// Delay reason options for RCA
const delayReasons = [
    { value: 'raw_material', label: 'Raw Material Shortage' },
    { value: 'machine_breakdown', label: 'Machine Breakdown' },
    { value: 'labor_shortage', label: 'Labor Shortage' },
    { value: 'power_cut', label: 'Power Cut' },
    { value: 'buyer_change', label: 'Buyer Specification Change' },
    { value: 'quality_issue', label: 'Quality Rejection/Rework' },
    { value: 'logistics', label: 'Logistics/Shipping Delay' },
    { value: 'other', label: 'Other' },
];

// Extended PO data with more realistic statuses (Brand = PO owner)
const allPOs = [
    { 
        poNumber: 'PO-2024-001', 
        brand: 'EcoWear Brands Ltd', 
        product: 'Organic Cotton T-Shirts',
        style: 'Classic Crew Neck',
        quantity: 5000, 
        unit: 'pcs',
        dueDate: '2024-02-15', // Past due
        receivedDate: '2024-01-15',
        currentStage: 'Processing',
        progress: 65,
    },
    { 
        poNumber: 'PO-2024-002', 
        brand: 'GreenStyle Fashion', 
        product: 'Recycled Polyester Jackets',
        style: 'Urban Windbreaker',
        quantity: 2000, 
        unit: 'pcs',
        dueDate: '2024-02-20', // Past due
        receivedDate: '2024-01-20',
        currentStage: 'Spinning',
        progress: 35,
    },
    { 
        poNumber: 'PO-2024-003', 
        brand: 'Sustainable Threads', 
        product: 'Hemp Blend Shirts',
        style: 'Casual Linen',
        quantity: 3000, 
        unit: 'pcs',
        dueDate: '2024-03-01',
        receivedDate: '2024-01-25',
        currentStage: 'Final QC',
        progress: 95,
    },
    { 
        poNumber: 'PO-2024-004', 
        brand: 'EcoWear Brands Ltd', 
        product: 'BCI Cotton Pants',
        style: 'Relaxed Chino',
        quantity: 4000, 
        unit: 'pcs',
        dueDate: '2024-03-10',
        receivedDate: '2024-02-01',
        currentStage: 'Fiber Sourcing',
        progress: 10,
    },
    { 
        poNumber: 'PO-2024-005', 
        brand: 'GreenStyle Fashion', 
        product: 'Organic Denim Jeans',
        style: 'Slim Fit',
        quantity: 2500, 
        unit: 'pcs',
        dueDate: '2024-03-20',
        receivedDate: '2024-02-05',
        currentStage: 'Not Started',
        progress: 0,
    },
    { 
        poNumber: 'PO-2024-006', 
        buyer: 'Sustainable Threads', 
        product: 'Wool Blend Sweaters',
        style: 'Cable Knit',
        quantity: 1500, 
        unit: 'pcs',
        dueDate: '2024-02-10', // Past due, canceled
        receivedDate: '2024-01-10',
        currentStage: 'Canceled',
        progress: 0,
        cancelReason: 'Buyer canceled order',
    },
];

// Helper function to get PO status from localStorage
const getPOData = (poNumber) => {
    const statusData = JSON.parse(localStorage.getItem('po_status') || '{}');
    return statusData[poNumber] || {};
};

// Helper to check if PO is delayed
const isDelayed = (po) => {
    const today = new Date();
    const dueDate = new Date(po.dueDate);
    const storedData = getPOData(po.poNumber);
    return dueDate < today && storedData.status !== 'complete' && po.currentStage !== 'Canceled';
};

// Calculate lead time in days
const calculateLeadTime = (receivedDate, completedDate = null) => {
    const start = new Date(receivedDate);
    const end = completedDate ? new Date(completedDate) : new Date();
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const ManufacturerOverview = () => {
    const navigate = useNavigate();
    const [processedPOs, setProcessedPOs] = useState([]);
    const [activeFilter, setActiveFilter] = useState('all');
    const [showDelayModal, setShowDelayModal] = useState(false);
    const [selectedDelayPO, setSelectedDelayPO] = useState(null);
    const [delayReason, setDelayReason] = useState('');
    const [delayComments, setDelayComments] = useState('');

    // Load and process PO data
    useEffect(() => {
        const processed = allPOs.map(po => {
            const storedData = getPOData(po.poNumber);
            let status = storedData.status || 'pending';
            
            // Check for delayed status
            if (isDelayed(po) && status !== 'complete') {
                status = 'delayed';
            }
            
            // Check for canceled
            if (po.currentStage === 'Canceled') {
                status = 'canceled';
            }
            
            // Check for incoming (new, not started)
            if (po.progress === 0 && status === 'pending' && po.currentStage === 'Not Started') {
                status = 'incoming';
            }
            
            return {
                ...po,
                status,
                delayReason: storedData.delayReason || null,
                delayComments: storedData.delayComments || null,
                leadTime: calculateLeadTime(po.receivedDate, storedData.completedAt),
            };
        });
        setProcessedPOs(processed);
    }, []);

    // Calculate status counts
    const statusCounts = useMemo(() => {
        return {
            all: processedPOs.length,
            incoming: processedPOs.filter(po => po.status === 'incoming').length,
            pending: processedPOs.filter(po => po.status === 'pending').length,
            in_progress: processedPOs.filter(po => po.status === 'in_progress').length,
            delayed: processedPOs.filter(po => po.status === 'delayed').length,
            complete: processedPOs.filter(po => po.status === 'complete').length,
            canceled: processedPOs.filter(po => po.status === 'canceled').length,
        };
    }, [processedPOs]);

    // Filter POs based on active filter
    const filteredPOs = useMemo(() => {
        if (activeFilter === 'all') return processedPOs;
        return processedPOs.filter(po => po.status === activeFilter);
    }, [processedPOs, activeFilter]);

    // Handle clicking on a delayed PO's Continue button
    const handleDelayedPOClick = (po) => {
        const storedData = getPOData(po.poNumber);
        if (po.status === 'delayed' && !storedData.delayReason) {
            setSelectedDelayPO(po);
            setShowDelayModal(true);
        } else {
            navigate(`/manufacturer/create-product/${po.poNumber}`);
        }
    };

    // Submit delay reason
    const handleSubmitDelayReason = () => {
        if (!delayReason) {
            toast.error('Please select a reason for delay');
            return;
        }

        // Save delay reason to localStorage
        const statusData = JSON.parse(localStorage.getItem('po_status') || '{}');
        statusData[selectedDelayPO.poNumber] = {
            ...statusData[selectedDelayPO.poNumber],
            status: 'in_progress',
            delayReason,
            delayComments,
            delayReportedAt: new Date().toISOString(),
        };
        localStorage.setItem('po_status', JSON.stringify(statusData));

        // Sync to Brand Dashboard
        syncDelayToBrand(selectedDelayPO, delayReason, delayComments);

        toast.success('Delay reason recorded', {
            description: 'Synced to Brand Dashboard',
        });

        setShowDelayModal(false);
        setDelayReason('');
        setDelayComments('');
        
        // Navigate to traceability
        navigate(`/manufacturer/create-product/${selectedDelayPO.poNumber}`);
    };

    // Sync delay reason to Brand Dashboard
    const syncDelayToBrand = (po, reason, comments) => {
        const brandDelays = JSON.parse(localStorage.getItem('brand_delay_reports') || '[]');
        brandDelays.push({
            poNumber: po.poNumber,
            product: po.product,
            buyer: po.buyer,
            dueDate: po.dueDate,
            delayReason: reason,
            delayComments: comments,
            reportedAt: new Date().toISOString(),
            daysDelayed: calculateLeadTime(po.dueDate),
        });
        localStorage.setItem('brand_delay_reports', JSON.stringify(brandDelays));
    };

    // Export report function
    const exportReport = (format) => {
        const data = filteredPOs.map(po => ({
            'PO Number': po.poNumber,
            'Style': po.style,
            'Product': po.product,
            'Buyer': po.buyer,
            'Quantity': `${po.quantity} ${po.unit}`,
            'Current Stage': po.currentStage,
            'Progress': `${po.progress}%`,
            'Status': statusConfig[po.status]?.label || po.status,
            'Due Date': po.dueDate,
            'Lead Time (Days)': po.leadTime,
            'Delay Reason': po.delayReason ? delayReasons.find(r => r.value === po.delayReason)?.label : '-',
            'Delay Comments': po.delayComments || '-',
        }));

        if (format === 'excel') {
            // Generate CSV (Excel compatible)
            const headers = Object.keys(data[0]);
            const csvContent = [
                headers.join(','),
                ...data.map(row => headers.map(h => `"${row[h]}"`).join(','))
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `PO_Report_${activeFilter}_${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            toast.success('Excel report downloaded');
        } else {
            // Generate text report (PDF placeholder)
            const reportContent = `
PURCHASE ORDER REPORT
Generated: ${new Date().toLocaleString()}
Filter: ${activeFilter === 'all' ? 'All Orders' : statusConfig[activeFilter]?.label}
Total Orders: ${data.length}

${'='.repeat(80)}

${data.map(po => `
PO: ${po['PO Number']}
Style: ${po['Style']} | Product: ${po['Product']}
Buyer: ${po['Buyer']}
Quantity: ${po['Quantity']}
Current Stage: ${po['Current Stage']} (${po['Progress']})
Status: ${po['Status']}
Due Date: ${po['Due Date']} | Lead Time: ${po['Lead Time (Days)']} days
${po['Delay Reason'] !== '-' ? `Delay Reason: ${po['Delay Reason']}` : ''}
${po['Delay Comments'] !== '-' ? `Comments: ${po['Delay Comments']}` : ''}
${'-'.repeat(40)}`).join('\n')}
            `;

            const blob = new Blob([reportContent], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `PO_Report_${activeFilter}_${new Date().toISOString().split('T')[0]}.txt`;
            a.click();
            toast.success('Report downloaded (PDF format simulated)');
        }
    };

    // Status box component
    const StatusBox = ({ statusKey, count, icon: Icon }) => {
        const config = statusConfig[statusKey];
        const isActive = activeFilter === statusKey;
        
        return (
            <Card 
                className={`cursor-pointer transition-all hover:shadow-lg ${
                    isActive ? `ring-2 ring-offset-2 ${config.borderColor} ring-current` : ''
                } ${config.bgLight} ${config.borderColor} border-2`}
                onClick={() => setActiveFilter(statusKey)}
                data-testid={`status-box-${statusKey}`}
            >
                <CardContent className="p-4 text-center">
                    <div className={`w-10 h-10 rounded-full ${config.color} text-white flex items-center justify-center mx-auto mb-2`}>
                        <Icon className="h-5 w-5" />
                    </div>
                    <p className={`text-3xl font-bold ${config.textColor}`}>{count}</p>
                    <p className="text-sm text-muted-foreground">{config.label}</p>
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="space-y-6" data-testid="manufacturer-dashboard">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
                        Manufacturing Dashboard
                    </h1>
                    <p className="text-muted-foreground">
                        Monitor production operations, traceability & delays
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                                <Download className="h-4 w-4 mr-2" />
                                Download Report
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => exportReport('excel')}>
                                <FileSpreadsheet className="h-4 w-4 mr-2 text-green-600" />
                                Export as Excel (.csv)
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => exportReport('pdf')}>
                                <FileText className="h-4 w-4 mr-2 text-red-600" />
                                Export as PDF
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button variant="ghost" size="icon" onClick={() => window.location.reload()}>
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Interactive Status Boxes */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <StatusBox statusKey="incoming" count={statusCounts.incoming} icon={ShoppingCart} />
                <StatusBox statusKey="pending" count={statusCounts.pending} icon={Clock} />
                <StatusBox statusKey="in_progress" count={statusCounts.in_progress} icon={Zap} />
                <StatusBox statusKey="delayed" count={statusCounts.delayed} icon={AlertTriangle} />
                <StatusBox statusKey="complete" count={statusCounts.complete} icon={CheckCircle2} />
                <StatusBox statusKey="canceled" count={statusCounts.canceled} icon={XCircle} />
            </div>

            {/* Filter Badge & Clear */}
            {activeFilter !== 'all' && (
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`${statusConfig[activeFilter].bgLight} ${statusConfig[activeFilter].textColor} ${statusConfig[activeFilter].borderColor}`}>
                        <Filter className="h-3 w-3 mr-1" />
                        Showing: {statusConfig[activeFilter].label} ({filteredPOs.length})
                    </Badge>
                    <Button variant="ghost" size="sm" onClick={() => setActiveFilter('all')}>
                        <X className="h-3 w-3 mr-1" />
                        Clear Filter
                    </Button>
                </div>
            )}

            {/* PO List */}
            <Card>
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="font-heading text-lg">Purchase Orders</CardTitle>
                            <CardDescription>
                                {activeFilter === 'all' ? 'All orders' : `Filtered by ${statusConfig[activeFilter]?.label}`} • {filteredPOs.length} orders
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3">
                    {filteredPOs.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                            <p>No orders found with this status</p>
                        </div>
                    ) : (
                        filteredPOs.map((po) => {
                            const config = statusConfig[po.status];
                            
                            return (
                                <div 
                                    key={po.poNumber} 
                                    className={`p-4 rounded-xl border-2 transition-all hover:shadow-lg ${config.bgLight} ${config.borderColor}`}
                                    data-testid={`po-card-${po.poNumber}`}
                                >
                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                        {/* PO Info */}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                <span className="font-mono font-bold text-foreground">{po.poNumber}</span>
                                                <Badge 
                                                    variant="outline" 
                                                    className={`${config.bgLight} ${config.textColor} ${config.borderColor}`}
                                                >
                                                    {config.label}
                                                </Badge>
                                                {po.status === 'delayed' && po.delayReason && (
                                                    <Badge variant="secondary" className="bg-red-100 text-red-700">
                                                        {delayReasons.find(r => r.value === po.delayReason)?.label}
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="font-medium text-foreground">{po.product}</p>
                                            <p className="text-sm text-muted-foreground">{po.style}</p>
                                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                                                <span>{po.buyer}</span>
                                                <span>•</span>
                                                <span>{po.quantity.toLocaleString()} {po.unit}</span>
                                                <span>•</span>
                                                <span className={po.status === 'delayed' ? 'text-red-600 font-medium' : ''}>
                                                    Due: {po.dueDate}
                                                </span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1">
                                                    <Timer className="h-3 w-3" />
                                                    {po.leadTime}d lead time
                                                </span>
                                            </div>
                                        </div>

                                        {/* Progress & Stage */}
                                        <div className="lg:w-48">
                                            <div className="flex items-center justify-between text-sm mb-1">
                                                <span className="text-muted-foreground">Stage:</span>
                                                <span className="font-medium">{po.currentStage}</span>
                                            </div>
                                            <Progress 
                                                value={po.progress} 
                                                className={`h-2 ${po.status === 'delayed' ? '[&>div]:bg-red-500' : ''}`}
                                            />
                                            <p className="text-xs text-right mt-1 text-muted-foreground">{po.progress}% complete</p>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2">
                                            {po.status === 'incoming' || (po.status === 'pending' && po.progress === 0) ? (
                                                <Button variant="hero" size="sm" asChild>
                                                    <Link to={`/manufacturer/create-product/${po.poNumber}`}>
                                                        <Edit3 className="h-4 w-4 mr-1" />
                                                        Start Traceability
                                                    </Link>
                                                </Button>
                                            ) : po.status === 'delayed' ? (
                                                <Button 
                                                    variant="destructive" 
                                                    size="sm"
                                                    onClick={() => handleDelayedPOClick(po)}
                                                >
                                                    <AlertTriangle className="h-4 w-4 mr-1" />
                                                    Continue Traceability
                                                </Button>
                                            ) : po.status === 'in_progress' || po.status === 'pending' ? (
                                                <Button variant="secondary" size="sm" asChild>
                                                    <Link to={`/manufacturer/create-product/${po.poNumber}`}>
                                                        <Sparkles className="h-4 w-4 mr-1" />
                                                        Continue Traceability
                                                    </Link>
                                                </Button>
                                            ) : po.status === 'complete' ? (
                                                <Button variant="outline" size="sm" className="border-green-500 text-green-700 hover:bg-green-50" asChild>
                                                    <Link to="/manufacturer/traceability-tree">
                                                        <CheckCircle2 className="h-4 w-4 mr-1" />
                                                        View Complete
                                                    </Link>
                                                </Button>
                                            ) : po.status === 'canceled' ? (
                                                <Badge variant="outline" className="bg-gray-100 text-gray-500">
                                                    Order Canceled
                                                </Badge>
                                            ) : null}
                                        </div>
                                    </div>

                                    {/* Delay Info Banner */}
                                    {po.status === 'delayed' && po.delayReason && (
                                        <div className="mt-3 p-3 rounded-lg bg-red-100 border border-red-200">
                                            <p className="text-sm text-red-800">
                                                <strong>Delay Reason:</strong> {delayReasons.find(r => r.value === po.delayReason)?.label}
                                                {po.delayComments && <span className="block mt-1 text-red-600">"{po.delayComments}"</span>}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </CardContent>
            </Card>

            {/* Delay Reason Modal (RCA) */}
            <Dialog open={showDelayModal} onOpenChange={setShowDelayModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-700">
                            <AlertTriangle className="h-5 w-5" />
                            Order Behind Schedule
                        </DialogTitle>
                        <DialogDescription>
                            This order ({selectedDelayPO?.poNumber}) has passed its due date. 
                            Please provide the reason for delay before continuing.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                    <span className="text-muted-foreground">Due Date:</span>
                                    <p className="font-medium text-red-700">{selectedDelayPO?.dueDate}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Days Overdue:</span>
                                    <p className="font-medium text-red-700">
                                        {selectedDelayPO && calculateLeadTime(selectedDelayPO.dueDate)} days
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="delayReason" className="text-red-700">Reason for Delay *</Label>
                            <Select value={delayReason} onValueChange={setDelayReason}>
                                <SelectTrigger className="border-red-200">
                                    <SelectValue placeholder="Select reason..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {delayReasons.map((reason) => (
                                        <SelectItem key={reason.value} value={reason.value}>
                                            {reason.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="delayComments">Additional Comments</Label>
                            <Textarea 
                                id="delayComments"
                                placeholder="Brief explanation (optional)..."
                                value={delayComments}
                                onChange={(e) => setDelayComments(e.target.value)}
                                className="min-h-[80px]"
                            />
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                            <Zap className="h-4 w-4 text-secondary" />
                            <span>This reason will be automatically synced to the Brand's Dashboard</span>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDelayModal(false)}>
                            Cancel
                        </Button>
                        <Button 
                            variant="destructive" 
                            onClick={handleSubmitDelayReason}
                            disabled={!delayReason}
                        >
                            Submit & Continue
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Efficiency Score Card */}
            <Card className="bg-gradient-to-r from-primary/5 to-secondary/5">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-secondary" />
                        Efficiency Metrics
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-3 rounded-xl bg-background">
                            <p className="text-2xl font-bold text-foreground">
                                {Math.round(processedPOs.reduce((acc, po) => acc + po.leadTime, 0) / processedPOs.length || 0)}
                            </p>
                            <p className="text-xs text-muted-foreground">Avg Lead Time (Days)</p>
                        </div>
                        <div className="text-center p-3 rounded-xl bg-background">
                            <p className="text-2xl font-bold text-green-600">
                                {Math.round((statusCounts.complete / (processedPOs.length - statusCounts.canceled)) * 100 || 0)}%
                            </p>
                            <p className="text-xs text-muted-foreground">Completion Rate</p>
                        </div>
                        <div className="text-center p-3 rounded-xl bg-background">
                            <p className="text-2xl font-bold text-red-600">
                                {Math.round((statusCounts.delayed / processedPOs.length) * 100 || 0)}%
                            </p>
                            <p className="text-xs text-muted-foreground">Delay Rate</p>
                        </div>
                        <div className="text-center p-3 rounded-xl bg-background">
                            <p className="text-2xl font-bold text-secondary">
                                {100 - Math.round((statusCounts.delayed / processedPOs.length) * 100 || 0)}
                            </p>
                            <p className="text-xs text-muted-foreground">Efficiency Score</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ManufacturerOverview;
