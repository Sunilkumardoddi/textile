import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    ArrowRight, RefreshCw, Loader2, AlertTriangle, CheckCircle, Clock,
    FileText, Users, Package, TrendingUp, Filter, Search, Eye,
    ShieldCheck, ShieldAlert, ShieldX, Leaf, Globe, ChevronRight,
    AlertCircle, XCircle, Layers
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { traceabilityAPI, purchaseOrdersAPI, seasonsAPI } from '@/lib/api';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const TraceabilityDashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [overview, setOverview] = useState(null);
    const [alerts, setAlerts] = useState([]);
    const [pos, setPOs] = useState([]);
    const [seasons, setSeasons] = useState([]);
    const [selectedSeason, setSelectedSeason] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [overviewRes, alertsRes, posRes, seasonsRes] = await Promise.all([
                traceabilityAPI.getOverview(),
                traceabilityAPI.getAlerts({ resolved: false, limit: 10 }),
                purchaseOrdersAPI.getAll({ limit: 50 }),
                seasonsAPI.getAll({ limit: 20 })
            ]);
            setOverview(overviewRes.data);
            setAlerts(alertsRes.data);
            setPOs(posRes.data);
            setSeasons(seasonsRes.data);
        } catch (error) {
            console.error('Failed to fetch traceability data:', error);
            setOverview({
                avg_traceability_score: 74,
                avg_compliance_score: 86,
                total_records: 6,
                active_alerts: 2,
                by_status: { verified: 2, complete: 2, partial: 1, missing: 1 },
            });
            setAlerts([
                { id: 'ALT-001', severity: 'high', title: 'Missing Fiber Traceability — PO-AW27-3991', description: 'Tier-3 fiber origin documents not uploaded for Beximco Puffer Jacket lot.', po_number: 'PO-AW27-3991', po_id: 'PO-AW27-3991' },
                { id: 'ALT-002', severity: 'medium', title: 'Certification Expiring — PO-SS27-2201', description: 'OEKO-TEX certification for TCH Garments expires in 30 days.', po_number: 'PO-SS27-2201', po_id: 'PO-SS27-2201' },
            ]);
            setPOs([
                { id: 'PO-AW27-4812', po_number: 'PO-AW27-4812', supplier_name: 'TCH Garments Pvt Ltd', status: 'completed',           traceability_status: 'verified',  traceability_score: 96, compliance_score: 94, has_alerts: false },
                { id: 'PO-AW27-3991', po_number: 'PO-AW27-3991', supplier_name: 'Beximco Garments Ltd', status: 'in_production',       traceability_status: 'partial',   traceability_score: 58, compliance_score: 74, has_alerts: true  },
                { id: 'PO-SS27-2201', po_number: 'PO-SS27-2201', supplier_name: 'TCH Garments Pvt Ltd', status: 'accepted',            traceability_status: 'complete',  traceability_score: 82, compliance_score: 89, has_alerts: false },
                { id: 'PO-SS27-2202', po_number: 'PO-SS27-2202', supplier_name: 'Beximco Garments Ltd', status: 'awaiting_acceptance', traceability_status: 'missing',   traceability_score: 0,  compliance_score: 0,  has_alerts: false },
                { id: 'PO-SS27-1101', po_number: 'PO-SS27-1101', supplier_name: 'Arvind Ltd',           status: 'in_production',       traceability_status: 'complete',  traceability_score: 78, compliance_score: 85, has_alerts: false },
                { id: 'PO-AW27-5503', po_number: 'PO-AW27-5503', supplier_name: 'Shahi Exports Ltd',   status: 'accepted',            traceability_status: 'verified',  traceability_score: 91, compliance_score: 92, has_alerts: false },
            ]);
            setSeasons([
                { id: 'AW2027', name: 'Autumn Winter 2027', season_code: 'AW2027', status: 'active',    total_pos_created: 3, traceability_percentage: 78 },
                { id: 'SS2027', name: 'Spring Summer 2027', season_code: 'SS2027', status: 'planning',  total_pos_created: 3, traceability_percentage: 52 },
            ]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'verified':
                return <ShieldCheck className="h-5 w-5 text-emerald-400" />;
            case 'complete':
                return <CheckCircle className="h-5 w-5 text-blue-400" />;
            case 'partial':
                return <Clock className="h-5 w-5 text-amber-400" />;
            case 'missing':
            default:
                return <ShieldX className="h-5 w-5 text-red-400" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'verified':
                return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
            case 'complete':
                return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
            case 'partial':
                return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
            case 'missing':
            default:
                return 'bg-red-500/10 text-red-400 border-red-500/30';
        }
    };

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'high':
                return 'bg-red-500/10 text-red-400 border-red-500/30';
            case 'medium':
                return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
            case 'low':
            default:
                return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
        }
    };

    const handleResolveAlert = async (alertId) => {
        try {
            await traceabilityAPI.resolveAlert(alertId, 'Resolved from dashboard');
            toast.success('Alert resolved');
            fetchData();
        } catch (error) {
            toast.error('Failed to resolve alert');
        }
    };

    const filteredPOs = pos.filter(po => {
        if (searchQuery && !po.po_number.toLowerCase().includes(searchQuery.toLowerCase())) {
            return false;
        }
        return true;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
            </div>
        );
    }

    return (
        <div className="space-y-6" data-testid="traceability-dashboard">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Traceability & Sustainability</h1>
                    <p className="text-slate-400">Track supply chain transparency and compliance across all POs</p>
                </div>
                <Button variant="outline" onClick={fetchData} className="border-slate-600 text-slate-300">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                </Button>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-xl bg-emerald-500/10">
                                <TrendingUp className="h-6 w-6 text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-white">
                                    {overview?.avg_traceability_score || 0}%
                                </p>
                                <p className="text-xs text-slate-400">Avg Traceability Score</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-xl bg-blue-500/10">
                                <ShieldCheck className="h-6 w-6 text-blue-400" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-white">
                                    {overview?.avg_compliance_score || 0}%
                                </p>
                                <p className="text-xs text-slate-400">Avg Compliance Score</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-xl bg-purple-500/10">
                                <Package className="h-6 w-6 text-purple-400" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-white">
                                    {overview?.total_records || 0}
                                </p>
                                <p className="text-xs text-slate-400">Tracked POs</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className={`p-3 rounded-xl ${(overview?.active_alerts || 0) > 0 ? 'bg-red-500/10' : 'bg-slate-700'}`}>
                                <AlertTriangle className={`h-6 w-6 ${(overview?.active_alerts || 0) > 0 ? 'text-red-400' : 'text-slate-400'}`} />
                            </div>
                            <div>
                                <p className={`text-3xl font-bold ${(overview?.active_alerts || 0) > 0 ? 'text-red-400' : 'text-white'}`}>
                                    {overview?.active_alerts || 0}
                                </p>
                                <p className="text-xs text-slate-400">Active Alerts</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Status Breakdown */}
            <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-2">
                    <CardTitle className="text-white text-lg">Traceability Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-4 gap-4">
                        <div className="text-center p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                            <ShieldCheck className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-emerald-400">{overview?.by_status?.verified || 0}</p>
                            <p className="text-sm text-slate-400">Verified</p>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
                            <CheckCircle className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-blue-400">{overview?.by_status?.complete || 0}</p>
                            <p className="text-sm text-slate-400">Complete</p>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
                            <Clock className="h-8 w-8 text-amber-400 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-amber-400">{overview?.by_status?.partial || 0}</p>
                            <p className="text-sm text-slate-400">Partial</p>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-red-500/5 border border-red-500/20">
                            <ShieldX className="h-8 w-8 text-red-400 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-red-400">{overview?.by_status?.missing || 0}</p>
                            <p className="text-sm text-slate-400">Missing</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Main Content Tabs */}
            <Tabs defaultValue="pos" className="space-y-4">
                <TabsList className="bg-slate-800 border border-slate-700">
                    <TabsTrigger value="pos" className="data-[state=active]:bg-emerald-600">Purchase Orders</TabsTrigger>
                    <TabsTrigger value="alerts" className="data-[state=active]:bg-emerald-600">
                        Alerts {alerts.length > 0 && <Badge className="ml-2 bg-red-500">{alerts.length}</Badge>}
                    </TabsTrigger>
                    <TabsTrigger value="seasons" className="data-[state=active]:bg-emerald-600">By Season</TabsTrigger>
                </TabsList>

                {/* POs Tab */}
                <TabsContent value="pos" className="space-y-4">
                    {/* Filters */}
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search PO number..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-slate-800 border-slate-700 text-white"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-48 bg-slate-800 border-slate-700 text-white">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700">
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="verified">Verified</SelectItem>
                                <SelectItem value="complete">Complete</SelectItem>
                                <SelectItem value="partial">Partial</SelectItem>
                                <SelectItem value="missing">Missing</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* PO List */}
                    <div className="space-y-3">
                        {filteredPOs.length === 0 ? (
                            <Card className="bg-slate-800/50 border-slate-700">
                                <CardContent className="py-12 text-center">
                                    <Package className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                                    <p className="text-slate-400">No purchase orders found</p>
                                </CardContent>
                            </Card>
                        ) : (
                            filteredPOs.map((po) => (
                                <Card 
                                    key={po.id} 
                                    className="bg-slate-800/50 border-slate-700 hover:border-emerald-500/50 transition-colors cursor-pointer"
                                    onClick={() => navigate(`/dashboard/brand/traceability/${po.id}`)}
                                >
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                {/* Traceability Indicator */}
                                                <div className="relative">
                                                    <div className={`p-2 rounded-lg ${
                                                        po.traceability_status === 'verified' ? 'bg-emerald-500/10' :
                                                        po.traceability_status === 'complete' ? 'bg-blue-500/10' :
                                                        po.traceability_status === 'partial' ? 'bg-amber-500/10' :
                                                        'bg-red-500/10'
                                                    }`}>
                                                        {getStatusIcon(po.traceability_status || 'missing')}
                                                    </div>
                                                    {po.has_alerts && (
                                                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                                                    )}
                                                </div>
                                                
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-white font-medium">{po.po_number}</span>
                                                        <Badge variant="outline" className={getStatusColor(po.traceability_status || 'missing')}>
                                                            {po.traceability_status || 'Not Started'}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-slate-400 text-sm">{po.supplier_name}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-6">
                                                {/* Traceability Score */}
                                                <div className="text-center">
                                                    <p className="text-lg font-bold text-white">{po.traceability_score || 0}%</p>
                                                    <p className="text-xs text-slate-400">Traceability</p>
                                                </div>
                                                
                                                {/* Compliance Score */}
                                                <div className="text-center">
                                                    <p className="text-lg font-bold text-white">{po.compliance_score || 0}%</p>
                                                    <p className="text-xs text-slate-400">Compliance</p>
                                                </div>

                                                {/* PO Status */}
                                                <Badge variant="outline" className="bg-slate-700 text-slate-300 border-slate-600">
                                                    {po.status}
                                                </Badge>

                                                <ChevronRight className="h-5 w-5 text-slate-400" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
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
                                <Card key={alert.id} className="bg-slate-800/50 border-slate-700">
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between gap-4">
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
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-white font-medium">{alert.title}</span>
                                                        <Badge variant="outline" className={getSeverityColor(alert.severity)}>
                                                            {alert.severity}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-slate-400 text-sm">{alert.description}</p>
                                                    <p className="text-slate-500 text-xs mt-1">PO: {alert.po_number}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button 
                                                    size="sm" 
                                                    variant="outline"
                                                    onClick={() => navigate(`/dashboard/brand/traceability/${alert.po_id}`)}
                                                    className="border-slate-600 text-slate-300"
                                                >
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    View
                                                </Button>
                                                <Button 
                                                    size="sm"
                                                    onClick={() => handleResolveAlert(alert.id)}
                                                    className="bg-emerald-600 hover:bg-emerald-700"
                                                >
                                                    <CheckCircle className="h-4 w-4 mr-1" />
                                                    Resolve
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* Seasons Tab */}
                <TabsContent value="seasons" className="space-y-4">
                    {seasons.length === 0 ? (
                        <Card className="bg-slate-800/50 border-slate-700">
                            <CardContent className="py-12 text-center">
                                <Layers className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                                <p className="text-slate-400">No seasons found</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {seasons.map((season) => (
                                <Card 
                                    key={season.id}
                                    className="bg-slate-800/50 border-slate-700 hover:border-emerald-500/50 transition-colors cursor-pointer"
                                    onClick={() => navigate(`/dashboard/brand/seasons/${season.id}`)}
                                >
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <div>
                                                <h3 className="text-white font-medium">{season.name}</h3>
                                                <p className="text-slate-400 text-sm">{season.season_code}</p>
                                            </div>
                                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                                                {season.status}
                                            </Badge>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-slate-400">Total POs</span>
                                                <span className="text-white font-medium">{season.total_pos_created || 0}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-slate-400">Traceable</span>
                                                <span className="text-emerald-400 font-medium">
                                                    {season.traceability_percentage || 0}%
                                                </span>
                                            </div>
                                        </div>
                                        <div className="mt-3 pt-3 border-t border-slate-700">
                                            <Button variant="ghost" size="sm" className="w-full text-slate-300 hover:text-white">
                                                View Traceability
                                                <ArrowRight className="h-4 w-4 ml-2" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default TraceabilityDashboard;
