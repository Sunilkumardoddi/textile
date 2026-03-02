import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    Users, Package, ClipboardCheck, TrendingUp, AlertTriangle,
    CheckCircle, Clock, XCircle, ArrowUpRight, RefreshCw, Loader2,
    Building2, ShoppingCart
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { dashboardAPI, usersAPI, suppliersAPI } from '@/lib/api';
import { toast } from 'sonner';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [supplierStats, setSupplierStats] = useState(null);
    const [pendingUsers, setPendingUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [approving, setApproving] = useState(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [dashboardRes, pendingRes, suppliersRes] = await Promise.all([
                dashboardAPI.getAdmin(),
                usersAPI.getPending(),
                suppliersAPI.getStats().catch(() => ({ data: null }))
            ]);
            setStats(dashboardRes.data);
            setPendingUsers(pendingRes.data);
            setSupplierStats(suppliersRes.data);
        } catch (error) {
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleApprove = async (userId) => {
        try {
            setApproving(userId);
            await usersAPI.approve(userId);
            toast.success('User approved successfully');
            fetchData();
        } catch (error) {
            toast.error('Failed to approve user');
        } finally {
            setApproving(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
            </div>
        );
    }

    const statCards = [
        { 
            title: 'Total Users', 
            value: stats?.users?.by_role ? Object.values(stats.users.by_role).reduce((a, b) => a + b.total, 0) : 0,
            icon: Users,
            color: 'text-blue-400',
            bgColor: 'bg-blue-500/10',
        },
        { 
            title: 'Active Manufacturers', 
            value: stats?.users?.by_role?.manufacturer?.active || 0,
            icon: Package,
            color: 'text-emerald-400',
            bgColor: 'bg-emerald-500/10',
        },
        { 
            title: 'Active Brands', 
            value: stats?.users?.by_role?.brand?.active || 0,
            icon: TrendingUp,
            color: 'text-purple-400',
            bgColor: 'bg-purple-500/10',
        },
        { 
            title: 'Registered Manufacturers', 
            value: supplierStats?.total_suppliers || (stats?.users?.by_role?.manufacturer?.active || 0),
            icon: Building2,
            color: 'text-teal-400',
            bgColor: 'bg-teal-500/10',
        },
        { 
            title: 'Pending Approvals', 
            value: stats?.users?.pending_approvals || 0,
            icon: Clock,
            color: 'text-amber-400',
            bgColor: 'bg-amber-500/10',
        },
        { 
            title: 'High Risk Manufacturers', 
            value: supplierStats?.high_risk_suppliers || 0,
            icon: AlertTriangle,
            color: 'text-red-400',
            bgColor: 'bg-red-500/10',
        },
    ];

    return (
        <div className="space-y-6" data-testid="admin-dashboard">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                    <p className="text-slate-400">System overview and management</p>
                </div>
                <Button variant="outline" onClick={fetchData} className="border-slate-600 text-slate-300">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {statCards.map((stat, idx) => (
                    <Card key={idx} className="bg-slate-800 border-slate-700">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-slate-400 text-sm">{stat.title}</p>
                                    <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
                                </div>
                                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Clock className="h-5 w-5 text-amber-400" />
                            Pending Approvals
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {pendingUsers.length === 0 ? (
                            <div className="text-center py-8 text-slate-500">
                                <CheckCircle className="h-12 w-12 mx-auto mb-2 text-emerald-400" />
                                <p>No pending approvals</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {pendingUsers.slice(0, 5).map((user) => (
                                    <div key={user.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-700/50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center text-white font-medium">
                                                {user.name?.charAt(0)?.toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-white font-medium">{user.name}</p>
                                                <p className="text-sm text-slate-400">{user.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="border-slate-500 text-slate-300">
                                                {user.role}
                                            </Badge>
                                            <Button 
                                                size="sm" 
                                                className="bg-emerald-600 hover:bg-emerald-700"
                                                onClick={() => handleApprove(user.id)}
                                                disabled={approving === user.id}
                                            >
                                                {approving === user.id ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Approve'}
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Package className="h-5 w-5 text-emerald-400" />
                            Batch Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {Object.entries(stats?.batches?.by_status || {}).slice(0, 6).map(([status, count]) => (
                                <div key={status} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full ${
                                            status === 'completed' ? 'bg-emerald-400' :
                                            status === 'audit_approved' ? 'bg-green-400' :
                                            status === 'audit_rejected' ? 'bg-red-400' :
                                            status === 'created' ? 'bg-blue-400' :
                                            'bg-amber-400'
                                        }`} />
                                        <span className="text-slate-300 capitalize">{status.replace(/_/g, ' ')}</span>
                                    </div>
                                    <span className="text-white font-medium">{count}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Manufacturer Risk Distribution */}
                {supplierStats && (
                    <Card className="bg-slate-800 border-slate-700">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <Building2 className="h-5 w-5 text-teal-400" />
                                Manufacturer Overview
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400">Total Manufacturers</span>
                                    <span className="text-white font-medium">{supplierStats.total_suppliers}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400">Avg Compliance</span>
                                    <span className="text-emerald-400 font-medium">{supplierStats.average_compliance?.toFixed(1)}%</span>
                                </div>
                                <div className="pt-2 border-t border-slate-700">
                                    <p className="text-sm text-slate-400 mb-3">Risk Distribution</p>
                                    {Object.entries(supplierStats.risk_distribution || {}).map(([risk, count]) => (
                                        <div key={risk} className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-3 h-3 rounded-full ${
                                                    risk === 'low' ? 'bg-emerald-400' :
                                                    risk === 'medium' ? 'bg-amber-400' :
                                                    risk === 'high' ? 'bg-orange-400' :
                                                    'bg-red-400'
                                                }`} />
                                                <span className="text-slate-300 capitalize">{risk}</span>
                                            </div>
                                            <span className="text-white font-medium">{count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
