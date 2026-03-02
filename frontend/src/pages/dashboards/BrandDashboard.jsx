import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Truck, ClipboardCheck, BarChart3, RefreshCw, Loader2, ArrowRight, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { dashboardAPI } from '@/lib/api';
import { toast } from 'sonner';

const BrandDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await dashboardAPI.getBrand();
            setStats(response.data);
        } catch (error) {
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                            <div><p className="text-slate-400 text-sm">Incoming Shipments</p><p className="text-3xl font-bold text-white mt-1">{stats?.shipments?.recent?.length || 0}</p></div>
                            <div className="p-3 rounded-xl bg-purple-500/10"><Truck className="h-6 w-6 text-purple-400" /></div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div><p className="text-slate-400 text-sm">Audits Assessed</p><p className="text-3xl font-bold text-white mt-1">{stats?.compliance?.total_assessed || 0}</p></div>
                            <div className="p-3 rounded-xl bg-amber-500/10"><ClipboardCheck className="h-6 w-6 text-amber-400" /></div>
                        </div>
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
        </div>
    );
};

export default BrandDashboard;
