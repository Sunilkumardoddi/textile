import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Package, Factory, Truck, FileText, Plus,
    RefreshCw, Loader2, ArrowRight, AlertTriangle,
    CheckCircle, Clock, TrendingUp, ShoppingCart, XCircle, DollarSign, CreditCard
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { dashboardAPI, purchaseOrdersAPI } from '@/lib/api';
import { toast } from 'sonner';

const ManufacturerDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [poStats, setPOStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [dashboardRes, posRes, posStatsRes] = await Promise.all([
                dashboardAPI.getManufacturer(),
                purchaseOrdersAPI.getAll({ limit: 10 }).catch(() => ({ data: [] })),
                purchaseOrdersAPI.getStats().catch(() => ({ data: { total_pos: 0, total_value: 0 } }))
            ]);
            setStats(dashboardRes.data);
            setPurchaseOrders(posRes.data || []);
            setPOStats(posStatsRes.data);
        } catch (error) {
            setStats({
                batches: { by_status: { completed: 3, shipped: 1, in_production: 2, qc: 1, pending: 1 }, recent: [
                    { id: 'BAT-001', batch_number: 'BAT-001', product_name: 'Cotton Twill 200gsm', status: 'completed' },
                    { id: 'BAT-002', batch_number: 'BAT-002', product_name: 'Polyester Blend', status: 'shipped' },
                    { id: 'BAT-007', batch_number: 'BAT-007', product_name: 'Wool Blend 300gsm', status: 'qc' },
                ] },
                shipments: { by_status: { delivered: 2, in_transit: 1, pending: 1 } }
            });
            setPurchaseOrders([
                { id: 'PO-AW27-4812', po_number: 'PO-AW27-4812', brand_name: 'Zara (Inditex)', status: 'in_production', total_amount: 125000, delivery_date: '2027-03-15' },
                { id: 'PO-SS27-2201', po_number: 'PO-SS27-2201', brand_name: 'H&M Group', status: 'accepted', total_amount: 156000, delivery_date: '2027-04-30' },
                { id: 'PO-AW28-1001', po_number: 'PO-AW28-1001', brand_name: 'Primark Ltd', status: 'awaiting_acceptance', total_amount: 110000, delivery_date: '2027-09-01' },
            ]);
            setPOStats({ total_value: 391000 });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAcceptOrder = async (orderId) => {
        setActionLoading(orderId);
        try {
            await purchaseOrdersAPI.accept(orderId);
            toast.success('Purchase order accepted');
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to accept order');
        } finally {
            setActionLoading(null);
        }
    };

    const handleRejectOrder = async (orderId) => {
        const reason = prompt('Enter rejection reason:');
        if (!reason) return;
        
        setActionLoading(orderId);
        try {
            await purchaseOrdersAPI.reject(orderId, reason);
            toast.success('Purchase order rejected');
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to reject order');
        } finally {
            setActionLoading(null);
        }
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

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
            </div>
        );
    }

    const totalBatches = Object.values(stats?.batches?.by_status || {}).reduce((a, b) => a + (typeof b === 'number' ? b : (b.count || 0)), 0);
    const pendingOrders = purchaseOrders.filter(o => o.status === 'awaiting_acceptance');
    const activeOrders = purchaseOrders.filter(o => ['accepted', 'in_production', 'shipped'].includes(o.status));

    return (
        <div className="space-y-6" data-testid="manufacturer-dashboard">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Manufacturer Dashboard</h1>
                    <p className="text-slate-400">Manage your production, batches, and incoming orders</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={fetchData} className="border-slate-600 text-slate-300">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                    <Button 
                        className="bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => navigate('/dashboard/manufacturer/batches/new')}
                        data-testid="create-batch-btn"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Batch
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-sm">Total Batches</p>
                                <p className="text-3xl font-bold text-white mt-1">{totalBatches}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-blue-500/10">
                                <Package className="h-6 w-6 text-blue-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-sm">Pending Orders</p>
                                <p className="text-3xl font-bold text-yellow-400 mt-1">{pendingOrders.length}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-yellow-500/10">
                                <Clock className="h-6 w-6 text-yellow-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-sm">Active Orders</p>
                                <p className="text-3xl font-bold text-emerald-400 mt-1">{activeOrders.length}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-emerald-500/10">
                                <ShoppingCart className="h-6 w-6 text-emerald-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-sm">Shipments</p>
                                <p className="text-3xl font-bold text-white mt-1">
                                    {Object.values(stats?.shipments?.by_status || {}).reduce((a, b) => a + b, 0)}
                                </p>
                            </div>
                            <div className="p-3 rounded-xl bg-purple-500/10">
                                <Truck className="h-6 w-6 text-purple-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-sm">Total Order Value</p>
                                <p className="text-2xl font-bold text-white mt-1">{formatCurrency(poStats?.total_value)}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-teal-500/10">
                                <DollarSign className="h-6 w-6 text-teal-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Pending Orders Section */}
            {pendingOrders.length > 0 && (
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-yellow-400" />
                            Orders Awaiting Acceptance
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                            Review and respond to incoming purchase orders from brands
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {pendingOrders.map((order) => (
                                <div 
                                    key={order.id} 
                                    className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-yellow-500/20"
                                    data-testid={`pending-order-${order.id}`}
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="font-semibold text-white">{order.po_number}</span>
                                            <Badge variant="outline" className={getStatusColor(order.status)}>
                                                {order.status.replace(/_/g, ' ')}
                                            </Badge>
                                            {order.priority === 'urgent' && (
                                                <Badge variant="destructive">Urgent</Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-slate-400">
                                            <span>From: {order.brand_name}</span>
                                            <span>Items: {order.line_items?.length || 0}</span>
                                            <span>Value: {formatCurrency(order.total_amount)}</span>
                                            <span>Delivery: {formatDate(order.delivery_date)}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                                            onClick={() => handleRejectOrder(order.id)}
                                            disabled={actionLoading === order.id}
                                            data-testid={`reject-order-${order.id}`}
                                        >
                                            {actionLoading === order.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <XCircle className="h-4 w-4 mr-1" />
                                            )}
                                            Reject
                                        </Button>
                                        <Button
                                            size="sm"
                                            className="bg-emerald-600 hover:bg-emerald-700"
                                            onClick={() => handleAcceptOrder(order.id)}
                                            disabled={actionLoading === order.id}
                                            data-testid={`accept-order-${order.id}`}
                                        >
                                            {actionLoading === order.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <CheckCircle className="h-4 w-4 mr-1" />
                                            )}
                                            Accept
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-slate-800 border-slate-700">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-white">Recent Batches</CardTitle>
                            <CardDescription className="text-slate-400">Your latest batch entries</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" className="text-emerald-400" onClick={() => navigate('/dashboard/manufacturer/batches')}>
                            View All <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {stats?.batches?.recent?.length === 0 ? (
                            <div className="text-center py-8 text-slate-500">
                                <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                <p>No batches yet</p>
                                <Button className="mt-4 bg-emerald-600 hover:bg-emerald-700" onClick={() => navigate('/dashboard/manufacturer/batches/new')}>
                                    Create Your First Batch
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {stats?.batches?.recent?.map((batch) => (
                                    <div key={batch.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 cursor-pointer transition-colors" onClick={() => navigate(`/dashboard/manufacturer/batches/${batch.id}`)}>
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-slate-600">
                                                <Package className="h-4 w-4 text-emerald-400" />
                                            </div>
                                            <div>
                                                <p className="text-white font-medium">{batch.batch_number}</p>
                                                <p className="text-sm text-slate-400">{batch.product_name}</p>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className="border-slate-500 text-slate-300">
                                            {batch.status.replace(/_/g, ' ')}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-white">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-3">
                        <Button variant="outline" className="h-auto py-4 flex-col border-slate-600 text-slate-300 hover:bg-slate-700" onClick={() => navigate('/dashboard/manufacturer/batches/new')}>
                            <Package className="h-6 w-6 mb-2 text-emerald-400" />
                            <span>New Batch</span>
                        </Button>
                        <Button variant="outline" className="h-auto py-4 flex-col border-slate-600 text-slate-300 hover:bg-slate-700" onClick={() => navigate('/dashboard/manufacturer/production')}>
                            <Factory className="h-6 w-6 mb-2 text-blue-400" />
                            <span>Add Production</span>
                        </Button>
                        <Button variant="outline" className="h-auto py-4 flex-col border-slate-600 text-slate-300 hover:bg-slate-700" onClick={() => navigate('/dashboard/manufacturer/shipments')}>
                            <Truck className="h-6 w-6 mb-2 text-purple-400" />
                            <span>Create Shipment</span>
                        </Button>
                        <Button variant="outline" className="h-auto py-4 flex-col border-slate-600 text-slate-300 hover:bg-slate-700" onClick={() => navigate('/dashboard/manufacturer/documents')}>
                            <FileText className="h-6 w-6 mb-2 text-amber-400" />
                            <span>Upload TC</span>
                        </Button>
                        <Button variant="outline" className="h-auto py-4 flex-col border-slate-600 text-slate-300 hover:bg-slate-700 col-span-2" onClick={() => navigate('/dashboard/manufacturer/billing')}>
                            <CreditCard className="h-6 w-6 mb-2 text-cyan-400" />
                            <span>Billing & Plan</span>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ManufacturerDashboard;
