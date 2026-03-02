import React, { useState, useEffect } from 'react';
import { 
    ShoppingCart, Package, Truck, Clock, CheckCircle, XCircle, 
    AlertTriangle, TrendingUp, DollarSign, Calendar, Eye,
    ChevronRight, Loader2, RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { purchaseOrdersAPI, suppliersAPI } from '@/lib/api';
import { toast } from 'sonner';

const SupplierDashboard = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [orders, setOrders] = useState([]);
    const [performance, setPerformance] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [ordersRes, statsRes] = await Promise.all([
                purchaseOrdersAPI.getAll({ limit: 10 }),
                purchaseOrdersAPI.getStats()
            ]);
            setOrders(ordersRes.data);
            setStats(statsRes.data);
        } catch (error) {
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptOrder = async (orderId) => {
        setActionLoading(orderId);
        try {
            await purchaseOrdersAPI.accept(orderId);
            toast.success('Purchase order accepted');
            fetchDashboardData();
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
            fetchDashboardData();
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
            cancelled: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
        };
        return colors[status] || 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('en-US', { 
            month: 'short', day: 'numeric', year: 'numeric' 
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
            </div>
        );
    }

    const pendingOrders = orders.filter(o => o.status === 'awaiting_acceptance');
    const activeOrders = orders.filter(o => ['accepted', 'in_production', 'shipped'].includes(o.status));

    return (
        <div className="space-y-6" data-testid="supplier-dashboard">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Supplier Dashboard</h1>
                    <p className="text-slate-400">Welcome back, {user?.company_name || user?.name}</p>
                </div>
                <Button 
                    variant="outline" 
                    className="border-slate-600 text-slate-300"
                    onClick={fetchDashboardData}
                >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-400">Total Orders</p>
                                <p className="text-2xl font-bold text-white">{stats?.total_pos || 0}</p>
                            </div>
                            <div className="p-3 bg-blue-500/10 rounded-lg">
                                <ShoppingCart className="h-6 w-6 text-blue-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-400">Pending Acceptance</p>
                                <p className="text-2xl font-bold text-yellow-400">{pendingOrders.length}</p>
                            </div>
                            <div className="p-3 bg-yellow-500/10 rounded-lg">
                                <Clock className="h-6 w-6 text-yellow-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-400">Active Orders</p>
                                <p className="text-2xl font-bold text-emerald-400">{activeOrders.length}</p>
                            </div>
                            <div className="p-3 bg-emerald-500/10 rounded-lg">
                                <Package className="h-6 w-6 text-emerald-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-400">Total Value</p>
                                <p className="text-2xl font-bold text-white">{formatCurrency(stats?.total_value || 0)}</p>
                            </div>
                            <div className="p-3 bg-teal-500/10 rounded-lg">
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
                            Review and respond to these purchase orders
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

            {/* All Orders Table */}
            <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                    <CardTitle className="text-white">All Purchase Orders</CardTitle>
                    <CardDescription className="text-slate-400">
                        Track all your orders from brands
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {orders.length === 0 ? (
                        <div className="text-center py-8">
                            <ShoppingCart className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                            <p className="text-slate-400">No purchase orders yet</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-700">
                                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">PO Number</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Brand</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Items</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Value</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Delivery</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Status</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order) => (
                                        <tr 
                                            key={order.id} 
                                            className="border-b border-slate-700/50 hover:bg-slate-800/50"
                                            data-testid={`order-row-${order.id}`}
                                        >
                                            <td className="py-3 px-4">
                                                <span className="font-medium text-white">{order.po_number}</span>
                                            </td>
                                            <td className="py-3 px-4 text-slate-300">{order.brand_name}</td>
                                            <td className="py-3 px-4 text-slate-300">{order.line_items?.length || 0}</td>
                                            <td className="py-3 px-4 text-slate-300">{formatCurrency(order.total_amount)}</td>
                                            <td className="py-3 px-4 text-slate-300">{formatDate(order.delivery_date)}</td>
                                            <td className="py-3 px-4">
                                                <Badge variant="outline" className={getStatusColor(order.status)}>
                                                    {order.status.replace(/_/g, ' ')}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-4">
                                                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    View
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default SupplierDashboard;
