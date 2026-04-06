import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, RefreshCw, Loader2, AlertTriangle, CheckCircle, Clock,
    FileText, TrendingUp, BarChart3, Package, Download, Eye, Filter,
    Upload, Calendar, Factory, AlertCircle, XCircle, Check, X,
    Activity, Target, Percent, ChevronRight, ThumbsUp, ThumbsDown
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { poReportsAPI, purchaseOrdersAPI } from '@/lib/api';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const CHART_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

const POReportsDashboard = () => {
    const { poId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [po, setPO] = useState(null);
    const [summary, setSummary] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [timeline, setTimeline] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [activeTab, setActiveTab] = useState('overview');
    
    // Report data
    const [productionReports, setProductionReports] = useState([]);
    const [qualityReports, setQualityReports] = useState([]);
    const [inspectionReports, setInspectionReports] = useState([]);
    const [fabricTestReports, setFabricTestReports] = useState([]);
    const [trimsReports, setTrimsReports] = useState([]);
    
    // Filters
    const [dateFilter, setDateFilter] = useState('all');
    
    // Dialogs
    const [selectedReport, setSelectedReport] = useState(null);
    const [showReportDetail, setShowReportDetail] = useState(false);
    const [showApprovalDialog, setShowApprovalDialog] = useState(false);
    const [approvalData, setApprovalData] = useState({ status: '', comments: '' });

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [poRes, summaryRes, analyticsRes, timelineRes, alertsRes] = await Promise.all([
                purchaseOrdersAPI.getById(poId),
                poReportsAPI.getPOSummary(poId),
                poReportsAPI.getPOAnalytics(poId),
                poReportsAPI.getPOTimeline(poId, {}),
                poReportsAPI.getReportAlerts({ po_id: poId, resolved: false })
            ]);
            
            setPO(poRes.data);
            setSummary(summaryRes.data);
            setAnalytics(analyticsRes.data);
            setTimeline(timelineRes.data);
            setAlerts(alertsRes.data);
            
            // Fetch individual report types
            const [prodRes, qualRes, inspRes, fabricRes, trimsRes] = await Promise.all([
                poReportsAPI.getProductionReports({ po_id: poId }),
                poReportsAPI.getQualityReports({ po_id: poId }),
                poReportsAPI.getInspectionReports({ po_id: poId }),
                poReportsAPI.getFabricTestReports({ po_id: poId }),
                poReportsAPI.getTrimsReports({ po_id: poId })
            ]);
            
            setProductionReports(prodRes.data);
            setQualityReports(qualRes.data);
            setInspectionReports(inspRes.data);
            setFabricTestReports(fabricRes.data);
            setTrimsReports(trimsRes.data);
            
        } catch (error) {
            console.error('Failed to fetch data:', error);
            toast.error('Failed to load reports data');
        } finally {
            setLoading(false);
        }
    }, [poId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
            case 'under_review': return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
            case 'submitted': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
            case 'rejected': return 'bg-red-500/10 text-red-400 border-red-500/30';
            default: return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
        }
    };

    const getResultColor = (result) => {
        switch (result) {
            case 'pass': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
            case 'fail': return 'bg-red-500/10 text-red-400 border-red-500/30';
            case 'conditional': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
            default: return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
        }
    };

    const handleApprove = async () => {
        if (!selectedReport || !approvalData.status) return;
        
        try {
            await poReportsAPI.approveReport(selectedReport.type, selectedReport.id, approvalData);
            toast.success(`Report ${approvalData.status}`);
            setShowApprovalDialog(false);
            setSelectedReport(null);
            setApprovalData({ status: '', comments: '' });
            fetchData();
        } catch (error) {
            toast.error('Failed to update report');
        }
    };

    const openApprovalDialog = (report, type) => {
        setSelectedReport({ ...report, type });
        setShowApprovalDialog(true);
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

    // Prepare chart data
    const productionChartData = analytics?.production_trends || [];
    const qualityChartData = analytics?.quality_trends || [];
    const inspectionPieData = analytics?.inspection_results ? 
        Object.entries(analytics.inspection_results).map(([name, value]) => ({ name, value })) : [];
    const defectPieData = analytics?.defect_breakdown ?
        Object.entries(analytics.defect_breakdown).slice(0, 5).map(([name, value]) => ({ name, value })) : [];

    return (
        <div className="space-y-6" data-testid="po-reports-dashboard">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button 
                    variant="ghost" 
                    onClick={() => navigate(-1)}
                    className="text-slate-400 hover:text-white"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
            </div>

            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">{po.po_number} - Reports</h1>
                    <p className="text-slate-400 mt-1">
                        {po.supplier_name} • {po.style || 'Multiple Styles'}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" onClick={fetchData} className="border-slate-600 text-slate-300">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-500/10">
                                <Activity className="h-5 w-5 text-blue-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{summary?.total_production_reports || 0}</p>
                                <p className="text-xs text-slate-400">Production</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-purple-500/10">
                                <Target className="h-5 w-5 text-purple-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{summary?.total_quality_reports || 0}</p>
                                <p className="text-xs text-slate-400">Quality</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-emerald-500/10">
                                <CheckCircle className="h-5 w-5 text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{summary?.total_inspection_reports || 0}</p>
                                <p className="text-xs text-slate-400">Inspections</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-teal-500/10">
                                <FileText className="h-5 w-5 text-teal-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{(summary?.total_fabric_test_reports || 0) + (summary?.total_trims_reports || 0)}</p>
                                <p className="text-xs text-slate-400">Test Reports</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${(summary?.pending_approvals || 0) > 0 ? 'bg-amber-500/10' : 'bg-slate-700'}`}>
                                <Clock className={`h-5 w-5 ${(summary?.pending_approvals || 0) > 0 ? 'text-amber-400' : 'text-slate-400'}`} />
                            </div>
                            <div>
                                <p className={`text-2xl font-bold ${(summary?.pending_approvals || 0) > 0 ? 'text-amber-400' : 'text-white'}`}>
                                    {summary?.pending_approvals || 0}
                                </p>
                                <p className="text-xs text-slate-400">Pending</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-sm">Avg Efficiency</p>
                                <p className="text-3xl font-bold text-white">{summary?.avg_efficiency || 0}%</p>
                            </div>
                            <div className="w-16 h-16">
                                <Progress value={summary?.avg_efficiency || 0} className="h-3 [&>div]:bg-emerald-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-sm">Avg DHU</p>
                                <p className={`text-3xl font-bold ${(summary?.avg_dhu || 0) > 5 ? 'text-red-400' : 'text-white'}`}>
                                    {summary?.avg_dhu || 0}%
                                </p>
                            </div>
                            <div className="w-16 h-16">
                                <Progress value={Math.min(summary?.avg_dhu || 0, 10) * 10} className={`h-3 [&>div]:${(summary?.avg_dhu || 0) > 5 ? 'bg-red-500' : 'bg-blue-500'}`} />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-sm">Inspection Pass Rate</p>
                                <p className={`text-3xl font-bold ${(summary?.inspection_pass_rate || 0) < 80 ? 'text-amber-400' : 'text-emerald-400'}`}>
                                    {summary?.inspection_pass_rate || 0}%
                                </p>
                            </div>
                            <div className="w-16 h-16">
                                <Progress value={summary?.inspection_pass_rate || 0} className="h-3 [&>div]:bg-emerald-500" />
                            </div>
                        </div>
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
                            <span className="text-red-300 text-sm">- Quality or inspection issues detected</span>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Main Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="bg-slate-800 border border-slate-700">
                    <TabsTrigger value="overview" className="data-[state=active]:bg-emerald-600">Overview</TabsTrigger>
                    <TabsTrigger value="production" className="data-[state=active]:bg-emerald-600">
                        Production ({productionReports.length})
                    </TabsTrigger>
                    <TabsTrigger value="quality" className="data-[state=active]:bg-emerald-600">
                        Quality ({qualityReports.length})
                    </TabsTrigger>
                    <TabsTrigger value="inspection" className="data-[state=active]:bg-emerald-600">
                        Inspection ({inspectionReports.length})
                    </TabsTrigger>
                    <TabsTrigger value="tests" className="data-[state=active]:bg-emerald-600">
                        Tests ({fabricTestReports.length + trimsReports.length})
                    </TabsTrigger>
                    <TabsTrigger value="timeline" className="data-[state=active]:bg-emerald-600">Timeline</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Production Trend Chart */}
                        <Card className="bg-slate-800/50 border-slate-700">
                            <CardHeader>
                                <CardTitle className="text-white text-lg">Production Trend</CardTitle>
                                <CardDescription className="text-slate-400">Target vs Actual Output</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {productionChartData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={250}>
                                        <LineChart data={productionChartData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                            <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                                            <YAxis stroke="#94a3b8" fontSize={12} />
                                            <Tooltip 
                                                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                                                labelStyle={{ color: '#fff' }}
                                            />
                                            <Legend />
                                            <Line type="monotone" dataKey="target" stroke="#3b82f6" name="Target" strokeWidth={2} />
                                            <Line type="monotone" dataKey="actual" stroke="#10b981" name="Actual" strokeWidth={2} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-64 flex items-center justify-center text-slate-500">
                                        No production data available
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Quality Trend Chart */}
                        <Card className="bg-slate-800/50 border-slate-700">
                            <CardHeader>
                                <CardTitle className="text-white text-lg">Quality Trend</CardTitle>
                                <CardDescription className="text-slate-400">DHU % Over Time</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {qualityChartData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={250}>
                                        <BarChart data={qualityChartData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                            <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                                            <YAxis stroke="#94a3b8" fontSize={12} />
                                            <Tooltip 
                                                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                                                labelStyle={{ color: '#fff' }}
                                            />
                                            <Bar dataKey="dhu_percentage" fill="#f59e0b" name="DHU %" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-64 flex items-center justify-center text-slate-500">
                                        No quality data available
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Inspection Results Pie */}
                        <Card className="bg-slate-800/50 border-slate-700">
                            <CardHeader>
                                <CardTitle className="text-white text-lg">Inspection Results</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {inspectionPieData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={200}>
                                        <PieChart>
                                            <Pie
                                                data={inspectionPieData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={50}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                                label={({ name, value }) => `${name}: ${value}`}
                                            >
                                                {inspectionPieData.map((entry, index) => (
                                                    <Cell key={entry.name} fill={entry.name === 'pass' ? '#10b981' : entry.name === 'fail' ? '#ef4444' : '#f59e0b'} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-48 flex items-center justify-center text-slate-500">
                                        No inspection data available
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Defect Breakdown */}
                        <Card className="bg-slate-800/50 border-slate-700">
                            <CardHeader>
                                <CardTitle className="text-white text-lg">Top Defects</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {defectPieData.length > 0 ? (
                                    <div className="space-y-3">
                                        {defectPieData.map((defect, index) => (
                                            <div key={defect.name} className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
                                                    <span className="text-slate-300 text-sm">{defect.name}</span>
                                                </div>
                                                <span className="text-white font-medium">{defect.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="h-48 flex items-center justify-center text-slate-500">
                                        No defect data available
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Production Reports Tab */}
                <TabsContent value="production" className="space-y-4">
                    {productionReports.length === 0 ? (
                        <Card className="bg-slate-800/50 border-slate-700">
                            <CardContent className="py-12 text-center">
                                <Activity className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-white mb-2">No Production Reports</h3>
                                <p className="text-slate-400">Daily Production Reports will appear here</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-3">
                            {productionReports.map((report) => (
                                <Card key={report.id} className="bg-slate-800/50 border-slate-700">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="p-2 rounded-lg bg-blue-500/10">
                                                    <Activity className="h-5 w-5 text-blue-400" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-white font-medium">DPR - {report.report_date}</span>
                                                        <Badge variant="outline" className={getStatusColor(report.status)}>
                                                            {report.status}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-slate-400 text-sm">
                                                        Target: {report.total_target} | Actual: {report.total_actual} | WIP: {report.total_wip}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <p className={`text-2xl font-bold ${report.overall_efficiency >= 70 ? 'text-emerald-400' : 'text-amber-400'}`}>
                                                        {report.overall_efficiency}%
                                                    </p>
                                                    <p className="text-xs text-slate-400">Efficiency</p>
                                                </div>
                                                {report.status === 'submitted' && (
                                                    <div className="flex gap-2">
                                                        <Button 
                                                            size="sm" 
                                                            variant="outline"
                                                            onClick={() => openApprovalDialog(report, 'production')}
                                                            className="border-slate-600 text-slate-300"
                                                        >
                                                            Review
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* Quality Reports Tab */}
                <TabsContent value="quality" className="space-y-4">
                    {qualityReports.length === 0 ? (
                        <Card className="bg-slate-800/50 border-slate-700">
                            <CardContent className="py-12 text-center">
                                <Target className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-white mb-2">No Quality Reports</h3>
                                <p className="text-slate-400">Daily Quality Reports will appear here</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-3">
                            {qualityReports.map((report) => (
                                <Card key={report.id} className={`border ${report.dhu_percentage > 5 ? 'bg-red-500/5 border-red-500/30' : 'bg-slate-800/50 border-slate-700'}`}>
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className={`p-2 rounded-lg ${report.dhu_percentage > 5 ? 'bg-red-500/10' : 'bg-purple-500/10'}`}>
                                                    <Target className={`h-5 w-5 ${report.dhu_percentage > 5 ? 'text-red-400' : 'text-purple-400'}`} />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-white font-medium">DQR - {report.report_date}</span>
                                                        <Badge variant="outline" className={getStatusColor(report.status)}>
                                                            {report.status}
                                                        </Badge>
                                                        {report.critical_defects > 0 && (
                                                            <Badge className="bg-red-500">Critical: {report.critical_defects}</Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-slate-400 text-sm">
                                                        Inspected: {report.pieces_inspected} | Passed: {report.pieces_passed} | Rejected: {report.pieces_rejected}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <p className={`text-2xl font-bold ${report.dhu_percentage > 5 ? 'text-red-400' : 'text-white'}`}>
                                                        {report.dhu_percentage}%
                                                    </p>
                                                    <p className="text-xs text-slate-400">DHU</p>
                                                </div>
                                                {report.status === 'submitted' && (
                                                    <Button 
                                                        size="sm" 
                                                        variant="outline"
                                                        onClick={() => openApprovalDialog(report, 'quality')}
                                                        className="border-slate-600 text-slate-300"
                                                    >
                                                        Review
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* Inspection Reports Tab */}
                <TabsContent value="inspection" className="space-y-4">
                    {inspectionReports.length === 0 ? (
                        <Card className="bg-slate-800/50 border-slate-700">
                            <CardContent className="py-12 text-center">
                                <CheckCircle className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-white mb-2">No Inspection Reports</h3>
                                <p className="text-slate-400">Final Inspection Reports will appear here</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-3">
                            {inspectionReports.map((report) => (
                                <Card key={report.id} className={`border ${report.result === 'fail' ? 'bg-red-500/5 border-red-500/30' : 'bg-slate-800/50 border-slate-700'}`}>
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className={`p-2 rounded-lg ${report.result === 'pass' ? 'bg-emerald-500/10' : report.result === 'fail' ? 'bg-red-500/10' : 'bg-amber-500/10'}`}>
                                                    {report.result === 'pass' ? (
                                                        <CheckCircle className="h-5 w-5 text-emerald-400" />
                                                    ) : report.result === 'fail' ? (
                                                        <XCircle className="h-5 w-5 text-red-400" />
                                                    ) : (
                                                        <AlertCircle className="h-5 w-5 text-amber-400" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-white font-medium">Inspection - {report.inspection_date}</span>
                                                        <Badge variant="outline" className={getResultColor(report.result)}>
                                                            {report.result?.toUpperCase()}
                                                        </Badge>
                                                        <Badge variant="outline" className={getStatusColor(report.status)}>
                                                            {report.status}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-slate-400 text-sm">
                                                        Lot: {report.lot_size} | Sample: {report.sample_size} | AQL: {report.aql_level}
                                                    </p>
                                                    {report.inspector_name && (
                                                        <p className="text-slate-500 text-xs">Inspector: {report.inspector_name}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <p className="text-emerald-400 font-bold">{report.approved_qty}</p>
                                                    <p className="text-xs text-slate-400">Approved</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-red-400 font-bold">{report.rejected_qty}</p>
                                                    <p className="text-xs text-slate-400">Rejected</p>
                                                </div>
                                                {report.status === 'submitted' && (
                                                    <Button 
                                                        size="sm" 
                                                        variant="outline"
                                                        onClick={() => openApprovalDialog(report, 'inspection')}
                                                        className="border-slate-600 text-slate-300"
                                                    >
                                                        Review
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* Test Reports Tab */}
                <TabsContent value="tests" className="space-y-4">
                    <h3 className="text-lg font-medium text-white">Fabric Test Reports</h3>
                    {fabricTestReports.length === 0 ? (
                        <Card className="bg-slate-800/50 border-slate-700">
                            <CardContent className="py-8 text-center">
                                <FileText className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                                <p className="text-slate-400">No fabric test reports</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-3">
                            {fabricTestReports.map((report) => (
                                <Card key={report.id} className="bg-slate-800/50 border-slate-700">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className={`p-2 rounded-lg ${report.overall_result === 'pass' ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                                                    <FileText className={`h-5 w-5 ${report.overall_result === 'pass' ? 'text-emerald-400' : 'text-red-400'}`} />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-white font-medium">Fabric Test - {report.test_date}</span>
                                                        <Badge variant="outline" className={getResultColor(report.overall_result)}>
                                                            {report.overall_result?.toUpperCase()}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-slate-400 text-sm">
                                                        {report.fabric_type || 'Fabric'} | Lab: {report.lab_name || 'N/A'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <p className="text-emerald-400 font-bold">{report.tests_passed}</p>
                                                    <p className="text-xs text-slate-400">Passed</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-red-400 font-bold">{report.tests_failed}</p>
                                                    <p className="text-xs text-slate-400">Failed</p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    <h3 className="text-lg font-medium text-white mt-6">Trims & Accessories Reports</h3>
                    {trimsReports.length === 0 ? (
                        <Card className="bg-slate-800/50 border-slate-700">
                            <CardContent className="py-8 text-center">
                                <FileText className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                                <p className="text-slate-400">No trims test reports</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-3">
                            {trimsReports.map((report) => (
                                <Card key={report.id} className="bg-slate-800/50 border-slate-700">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className={`p-2 rounded-lg ${report.overall_result === 'pass' ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                                                    <Package className={`h-5 w-5 ${report.overall_result === 'pass' ? 'text-emerald-400' : 'text-red-400'}`} />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-white font-medium">Trims Test - {report.test_date}</span>
                                                        <Badge variant="outline" className={getResultColor(report.overall_result)}>
                                                            {report.overall_result?.toUpperCase()}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-slate-400 text-sm">
                                                        {report.items_tested?.length || 0} items tested
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <p className="text-emerald-400 font-bold">{report.tests_passed}</p>
                                                    <p className="text-xs text-slate-400">Passed</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-red-400 font-bold">{report.tests_failed}</p>
                                                    <p className="text-xs text-slate-400">Failed</p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* Timeline Tab */}
                <TabsContent value="timeline" className="space-y-4">
                    {timeline.length === 0 ? (
                        <Card className="bg-slate-800/50 border-slate-700">
                            <CardContent className="py-12 text-center">
                                <Calendar className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-white mb-2">No Reports Yet</h3>
                                <p className="text-slate-400">Reports will appear here in chronological order</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="relative">
                            {/* Timeline line */}
                            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-700" />
                            
                            <div className="space-y-4">
                                {timeline.map((item, index) => (
                                    <div key={item.id} className="relative pl-14">
                                        {/* Timeline dot */}
                                        <div className={`absolute left-4 w-5 h-5 rounded-full border-2 ${
                                            item.type === 'production' ? 'bg-blue-500 border-blue-400' :
                                            item.type === 'quality' ? 'bg-purple-500 border-purple-400' :
                                            item.type === 'inspection' ? 'bg-emerald-500 border-emerald-400' :
                                            'bg-teal-500 border-teal-400'
                                        }`} />
                                        
                                        <Card className="bg-slate-800/50 border-slate-700">
                                            <CardContent className="p-4">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-white font-medium">{item.title}</span>
                                                            <Badge variant="outline" className={getStatusColor(item.status)}>
                                                                {item.status}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-slate-500 text-sm">{item.date}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        {item.efficiency && (
                                                            <p className="text-emerald-400 font-medium">{item.efficiency}% Eff</p>
                                                        )}
                                                        {item.dhu && (
                                                            <p className={`font-medium ${item.dhu > 5 ? 'text-red-400' : 'text-white'}`}>{item.dhu}% DHU</p>
                                                        )}
                                                        {item.result && (
                                                            <Badge variant="outline" className={getResultColor(item.result)}>
                                                                {item.result?.toUpperCase()}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* Approval Dialog */}
            <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
                <DialogContent className="bg-slate-800 border-slate-700">
                    <DialogHeader>
                        <DialogTitle className="text-white">Review Report</DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Approve or reject this report submission
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label className="text-slate-300">Status</Label>
                            <Select value={approvalData.status} onValueChange={(v) => setApprovalData(prev => ({ ...prev, status: v }))}>
                                <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-slate-700">
                                    <SelectItem value="approved">Approve</SelectItem>
                                    <SelectItem value="under_review">Under Review</SelectItem>
                                    <SelectItem value="rejected">Reject</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-300">Comments</Label>
                            <Input
                                value={approvalData.comments}
                                onChange={(e) => setApprovalData(prev => ({ ...prev, comments: e.target.value }))}
                                className="bg-slate-900/50 border-slate-600 text-white"
                                placeholder="Add review comments..."
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowApprovalDialog(false)} className="border-slate-600 text-slate-300">
                            Cancel
                        </Button>
                        <Button onClick={handleApprove} className="bg-emerald-600 hover:bg-emerald-700">
                            Submit Review
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default POReportsDashboard;
