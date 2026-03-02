import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Package, Truck, ClipboardCheck, BarChart3, RefreshCw, Loader2, 
    ArrowRight, Shield, Building2, ShoppingCart, Plus, Eye,
    CheckCircle, MapPin
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { dashboardAPI, suppliersAPI, purchaseOrdersAPI } from '@/lib/api';
import { toast } from 'sonner';

const BrandDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [suppliers, setSuppliers] = useState([]);
    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showPODialog, setShowPODialog] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [creatingPO, setCreatingPO] = useState(false);
    const [poForm, setPOForm] = useState({
        product_name: '',
        quantity: '',
        unit_price: '',
        delivery_date: '',
        delivery_address: '',
        notes: ''
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [dashboardRes, suppliersRes, posRes] = await Promise.all([
                dashboardAPI.getBrand(),
                suppliersAPI.getAll({ limit: 10 }),
                purchaseOrdersAPI.getAll({ limit: 5 })
            ]);
            setStats(dashboardRes.data);
            setSuppliers(suppliersRes.data);
            setPurchaseOrders(posRes.data);
        } catch (error) {
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleCreatePO = async () => {
        if (!selectedSupplier || !poForm.product_name || !poForm.quantity || !poForm.unit_price || !poForm.delivery_date || !poForm.delivery_address) {
            toast.error('Please fill in all required fields');
            return;
        }

        setCreatingPO(true);
        try {
            await purchaseOrdersAPI.create({
                supplier_id: selectedSupplier.id,
                line_items: [{
                    product_name: poForm.product_name,
                    quantity: parseFloat(poForm.quantity),
                    unit: 'pcs',
                    unit_price: parseFloat(poForm.unit_price)
                }],
                delivery_date: new Date(poForm.delivery_date).toISOString(),
                delivery_address: poForm.delivery_address,
                notes: poForm.notes,
                priority: 'normal'
            });
            toast.success('Purchase order created successfully');
            setShowPODialog(false);
            setSelectedSupplier(null);
            setPOForm({ product_name: '', quantity: '', unit_price: '', delivery_date: '', delivery_address: '', notes: '' });
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to create purchase order');
        } finally {
            setCreatingPO(false);
        }
    };

    const getRiskColor = (risk) => {
        const colors = {
            low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
            medium: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
            high: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
            critical: 'bg-red-500/10 text-red-400 border-red-500/30',
        };
        return colors[risk] || colors.medium;
    };

    const getStatusColor = (status) => {
        const colors = {
            awaiting_acceptance: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
            accepted: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
            in_production: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
            shipped: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
            delivered: 'bg-green-500/10 text-green-400 border-green-500/30',
            completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
            rejected: 'bg-red-500/10 text-red-400 border-red-500/30',
        };
        return colors[status] || 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    };

    if (loading) {
        return (<div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-emerald-400" /></div>);
    }

    const totalBatches = Object.values(stats?.batches?.by_status || {}).reduce((a, b) => a + b, 0);

    return (
        <div className="space-y-6" data-testid="brand-dashboard">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Brand Dashboard</h1>
                    <p className="text-slate-400">Track your supply chain and compliance</p>
                </div>
                <Button variant="outline" onClick={fetchData} className="border-slate-600 text-slate-300">
                    <RefreshCw className="h-4 w-4 mr-2" />Refresh
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div><p className="text-slate-400 text-sm">Tracked Batches</p><p className="text-3xl font-bold text-white mt-1">{totalBatches}</p></div>
                            <div className="p-3 rounded-xl bg-blue-500/10"><Package className="h-6 w-6 text-blue-400" /></div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div><p className="text-slate-400 text-sm">Compliance Score</p><p className="text-3xl font-bold text-white mt-1">{stats?.compliance?.average_score || 0}%</p></div>
                            <div className="p-3 rounded-xl bg-emerald-500/10"><Shield className="h-6 w-6 text-emerald-400" /></div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div><p className="text-slate-400 text-sm">Active Suppliers</p><p className="text-3xl font-bold text-white mt-1">{suppliers.length}</p></div>
                            <div className="p-3 rounded-xl bg-teal-500/10"><Building2 className="h-6 w-6 text-teal-400" /></div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div><p className="text-slate-400 text-sm">Purchase Orders</p><p className="text-3xl font-bold text-white mt-1">{purchaseOrders.length}</p></div>
                            <div className="p-3 rounded-xl bg-purple-500/10"><ShoppingCart className="h-6 w-6 text-purple-400" /></div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div><p className="text-slate-400 text-sm">Incoming Shipments</p><p className="text-3xl font-bold text-white mt-1">{stats?.shipments?.recent?.length || 0}</p></div>
                            <div className="p-3 rounded-xl bg-amber-500/10"><Truck className="h-6 w-6 text-amber-400" /></div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Supplier Directory */}
                <Card className="bg-slate-800 border-slate-700">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-white flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-teal-400" />
                            Supplier Directory
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {suppliers.length === 0 ? (
                            <div className="text-center py-8 text-slate-500">
                                <Building2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                <p>No suppliers available</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {suppliers.slice(0, 5).map((supplier) => (
                                    <div key={supplier.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-700/50" data-testid={`supplier-${supplier.id}`}>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="text-white font-medium">{supplier.company_name}</p>
                                                <Badge variant="outline" className={getRiskColor(supplier.risk_category)}>
                                                    {supplier.risk_category}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm text-slate-400">
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="h-3 w-3" />
                                                    {supplier.country}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <CheckCircle className="h-3 w-3 text-emerald-400" />
                                                    {supplier.compliance_score?.toFixed(0)}%
                                                </span>
                                            </div>
                                        </div>
                                        <Button
                                            size="sm"
                                            className="bg-emerald-600 hover:bg-emerald-700"
                                            onClick={() => {
                                                setSelectedSupplier(supplier);
                                                setShowPODialog(true);
                                            }}
                                            data-testid={`create-po-${supplier.id}`}
                                        >
                                            <Plus className="h-4 w-4 mr-1" />
                                            Create PO
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Purchase Orders */}
                <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <ShoppingCart className="h-5 w-5 text-purple-400" />
                            Recent Purchase Orders
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {purchaseOrders.length === 0 ? (
                            <div className="text-center py-8 text-slate-500">
                                <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                <p>No purchase orders yet</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {purchaseOrders.map((po) => (
                                    <div key={po.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-700/50" data-testid={`po-${po.id}`}>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="text-white font-medium">{po.po_number}</p>
                                                <Badge variant="outline" className={getStatusColor(po.status)}>
                                                    {po.status.replace(/_/g, ' ')}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-slate-400">{po.supplier_name} - ${po.total_amount?.toLocaleString()}</p>
                                        </div>
                                        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-slate-800 border-slate-700">
                    <CardHeader><CardTitle className="text-white">Recent Shipments</CardTitle></CardHeader>
                    <CardContent>
                        {stats?.shipments?.recent?.length === 0 ? (
                            <div className="text-center py-8 text-slate-500"><Truck className="h-12 w-12 mx-auto mb-2 opacity-50" /><p>No incoming shipments</p></div>
                        ) : (
                            <div className="space-y-3">
                                {stats?.shipments?.recent?.map((s) => (
                                    <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-700/50">
                                        <div className="flex items-center gap-3">
                                            <Truck className="h-4 w-4 text-purple-400" />
                                            <div><p className="text-white font-medium">{s.shipment_number}</p><p className="text-sm text-slate-400">{s.quantity} kg</p></div>
                                        </div>
                                        <Badge variant="outline" className="border-slate-500 text-slate-300">{s.status.replace(/_/g, ' ')}</Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
                <Card className="bg-slate-800 border-slate-700">
                    <CardHeader><CardTitle className="text-white">Quick Actions</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-2 gap-3">
                        <Button variant="outline" className="h-auto py-4 flex-col border-slate-600 text-slate-300 hover:bg-slate-700" onClick={() => navigate('/dashboard/brand/traceability')}>
                            <Package className="h-6 w-6 mb-2 text-emerald-400" /><span>View Traceability</span>
                        </Button>
                        <Button variant="outline" className="h-auto py-4 flex-col border-slate-600 text-slate-300 hover:bg-slate-700" onClick={() => navigate('/dashboard/brand/audits')}>
                            <ClipboardCheck className="h-6 w-6 mb-2 text-purple-400" /><span>Request Audit</span>
                        </Button>
                        <Button variant="outline" className="h-auto py-4 flex-col border-slate-600 text-slate-300 hover:bg-slate-700" onClick={() => navigate('/dashboard/brand/reports')}>
                            <BarChart3 className="h-6 w-6 mb-2 text-blue-400" /><span>View Reports</span>
                        </Button>
                        <Button variant="outline" className="h-auto py-4 flex-col border-slate-600 text-slate-300 hover:bg-slate-700" onClick={() => navigate('/dashboard/brand/shipments')}>
                            <Truck className="h-6 w-6 mb-2 text-amber-400" /><span>Track Shipments</span>
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Create PO Dialog */}
            <Dialog open={showPODialog} onOpenChange={setShowPODialog}>
                <DialogContent className="bg-slate-800 border-slate-700 max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="text-white">Create Purchase Order</DialogTitle>
                        <DialogDescription className="text-slate-400">
                            {selectedSupplier && `Creating PO for ${selectedSupplier.company_name}`}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label className="text-slate-300">Product Name *</Label>
                            <Input
                                placeholder="e.g., Organic Cotton Fabric"
                                value={poForm.product_name}
                                onChange={(e) => setPOForm(prev => ({ ...prev, product_name: e.target.value }))}
                                className="bg-slate-900/50 border-slate-600 text-white"
                                data-testid="po-product-name"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-slate-300">Quantity *</Label>
                                <Input
                                    type="number"
                                    placeholder="1000"
                                    value={poForm.quantity}
                                    onChange={(e) => setPOForm(prev => ({ ...prev, quantity: e.target.value }))}
                                    className="bg-slate-900/50 border-slate-600 text-white"
                                    data-testid="po-quantity"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-300">Unit Price ($) *</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="10.00"
                                    value={poForm.unit_price}
                                    onChange={(e) => setPOForm(prev => ({ ...prev, unit_price: e.target.value }))}
                                    className="bg-slate-900/50 border-slate-600 text-white"
                                    data-testid="po-unit-price"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-300">Delivery Date *</Label>
                            <Input
                                type="date"
                                value={poForm.delivery_date}
                                onChange={(e) => setPOForm(prev => ({ ...prev, delivery_date: e.target.value }))}
                                className="bg-slate-900/50 border-slate-600 text-white"
                                data-testid="po-delivery-date"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-300">Delivery Address *</Label>
                            <Input
                                placeholder="Enter delivery address"
                                value={poForm.delivery_address}
                                onChange={(e) => setPOForm(prev => ({ ...prev, delivery_address: e.target.value }))}
                                className="bg-slate-900/50 border-slate-600 text-white"
                                data-testid="po-delivery-address"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-300">Notes</Label>
                            <Textarea
                                placeholder="Additional notes or requirements"
                                value={poForm.notes}
                                onChange={(e) => setPOForm(prev => ({ ...prev, notes: e.target.value }))}
                                className="bg-slate-900/50 border-slate-600 text-white"
                                data-testid="po-notes"
                            />
                        </div>
                        {poForm.quantity && poForm.unit_price && (
                            <div className="p-3 bg-slate-900/50 rounded-lg">
                                <p className="text-slate-400 text-sm">Total Amount</p>
                                <p className="text-2xl font-bold text-emerald-400">
                                    ${(parseFloat(poForm.quantity) * parseFloat(poForm.unit_price)).toLocaleString()}
                                </p>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowPODialog(false)} className="border-slate-600 text-slate-300">
                            Cancel
                        </Button>
                        <Button 
                            className="bg-emerald-600 hover:bg-emerald-700"
                            onClick={handleCreatePO}
                            disabled={creatingPO}
                            data-testid="submit-po"
                        >
                            {creatingPO ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                            Create PO
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default BrandDashboard;
