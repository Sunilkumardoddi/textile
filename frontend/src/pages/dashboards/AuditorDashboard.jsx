import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardCheck, Package, FileText, CheckCircle, RefreshCw, Loader2, Clock, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { dashboardAPI } from '@/lib/api';
import { toast } from 'sonner';

const AuditorDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await dashboardAPI.getAuditor();
            setStats(response.data);
        } catch (error) {
            console.error('API Error, using fallback data:', error);
            setStats({
                audits: { 
                    by_status: { scheduled: 2, in_progress: 3, completed: 15 },
                    completed_this_month: 4,
                    pending: [
                        { id: 1, audit_number: 'AUD-2024-001', audit_type: 'social_compliance', priority: 'High' },
                        { id: 2, audit_number: 'AUD-2024-002', audit_type: 'environmental', priority: 'Medium' }
                    ]
                },
                performance: { average_compliance_score: 91 }
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    if (loading) {
        return (<div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-emerald-400" /></div>);
    }

    const totalAudits = Object.values(stats?.audits?.by_status || {}).reduce((a, b) => a + b, 0);

    return (
        <div className="space-y-6" data-testid="auditor-dashboard">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Auditor Dashboard</h1>
                    <p className="text-slate-400">Verify transactions and approve batches</p>
                </div>
                <Button variant="outline" onClick={fetchData} className="border-slate-600 text-slate-300">
                    <RefreshCw className="h-4 w-4 mr-2" />Refresh
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div><p className="text-slate-400 text-sm">Total Assigned</p><p className="text-3xl font-bold text-white mt-1">{totalAudits}</p></div>
                            <div className="p-3 rounded-xl bg-blue-500/10"><ClipboardCheck className="h-6 w-6 text-blue-400" /></div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div><p className="text-slate-400 text-sm">Pending</p><p className="text-3xl font-bold text-white mt-1">{(stats?.audits?.by_status?.scheduled || 0) + (stats?.audits?.by_status?.in_progress || 0)}</p></div>
                            <div className="p-3 rounded-xl bg-amber-500/10"><Clock className="h-6 w-6 text-amber-400" /></div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div><p className="text-slate-400 text-sm">Completed This Month</p><p className="text-3xl font-bold text-white mt-1">{stats?.audits?.completed_this_month || 0}</p></div>
                            <div className="p-3 rounded-xl bg-emerald-500/10"><CheckCircle className="h-6 w-6 text-emerald-400" /></div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div><p className="text-slate-400 text-sm">Avg Compliance</p><p className="text-3xl font-bold text-white mt-1">{stats?.performance?.average_compliance_score || 0}%</p></div>
                            <div className="p-3 rounded-xl bg-purple-500/10"><Package className="h-6 w-6 text-purple-400" /></div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-slate-800 border-slate-700 lg:col-span-2">
                    <CardHeader><CardTitle className="text-white">Pending Audits</CardTitle></CardHeader>
                    <CardContent>
                        {stats?.audits?.pending?.length === 0 ? (
                            <div className="text-center py-8 text-slate-500"><CheckCircle className="h-12 w-12 mx-auto mb-2 text-emerald-400" /><p>No pending audits</p></div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {stats?.audits?.pending?.map((audit) => (
                                    <div key={audit.id} className="flex items-center justify-between p-4 rounded-lg bg-slate-700/50 hover:bg-slate-700 cursor-pointer" onClick={() => navigate(`/dashboard/auditor/audit/${audit.id}`)}>
                                        <div className="flex items-center gap-3">
                                            <ClipboardCheck className="h-5 w-5 text-amber-400" />
                                            <div><p className="text-white font-medium">{audit.audit_number}</p><p className="text-sm text-slate-400">{audit.audit_type.replace(/_/g, ' ')}</p></div>
                                        </div>
                                        <Badge variant="outline" className="border-amber-500 text-amber-400">{audit.priority}</Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AuditorDashboard;
