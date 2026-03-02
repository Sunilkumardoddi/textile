import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Package, Factory, Truck, FileText, Plus, 
    RefreshCw, Loader2, ArrowRight, AlertTriangle,
    CheckCircle, Clock, TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { dashboardAPI } from '@/lib/api';
import { toast } from 'sonner';

const ManufacturerDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await dashboardAPI.getManufacturer();
            setStats(response.data);
        } catch (error) {
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
            </div>
        );
    }

    const totalBatches = Object.values(stats?.batches?.by_status || {}).reduce((a, b) => a + b.count, 0);

    return (
        <div className="space-y-6" data-testid="manufacturer-dashboard">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Manufacturer Dashboard</h1>
                    <p className="text-slate-400">Manage your production and batches</p>
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                                <p className="text-slate-400 text-sm">Materials</p>
                                <p className="text-3xl font-bold text-white mt-1">{stats?.materials?.total_entries || 0}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-amber-500/10">
                                <Factory className="h-6 w-6 text-amber-400" />
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
                            <div className="p-3 rounded-xl bg-emerald-500/10">
                                <Truck className="h-6 w-6 text-emerald-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-sm">Pending Audits</p>
                                <p className="text-3xl font-bold text-white mt-1">{stats?.audits?.pending || 0}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-purple-500/10">
                                <AlertTriangle className="h-6 w-6 text-purple-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

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
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ManufacturerDashboard;
