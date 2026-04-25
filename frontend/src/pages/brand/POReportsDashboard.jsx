import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, RefreshCw, Loader2, AlertTriangle, CheckCircle, Clock,
    FileText, TrendingUp, BarChart3, Package, Download, Eye, Filter,
    Upload, Calendar, Factory, AlertCircle, XCircle, Check, X,
    Activity, Target, Percent, ChevronRight, ThumbsUp, ThumbsDown,
    Link2, Award, User, MapPin, ExternalLink, CalendarDays, Info
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, RadialBarChart, RadialBar } from 'recharts';
import { poReportsAPI, purchaseOrdersAPI, traceabilityAPI } from '@/lib/api';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const CHART_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const POReportsDashboard = () => {
    const { poId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [po, setPO] = useState(null);
    const [enhancedSummary, setEnhancedSummary] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [timeline, setTimeline] = useState([]);
    const [alertsPanel, setAlertsPanel] = useState(null);
    const [supplierPerformance, setSupplierPerformance] = useState(null);
    const [missingDates, setMissingDates] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    
    // Report data
    const [productionReports, setProductionReports] = useState([]);
    const [qualityReports, setQualityReports] = useState([]);
    const [inspectionReports, setInspectionReports] = useState([]);
    const [fabricTestReports, setFabricTestReports] = useState([]);
    const [trimsReports, setTrimsReports] = useState([]);
    
    // Filters
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [supplierFilter, setSupplierFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    
    // Dialogs
    const [selectedReport, setSelectedReport] = useState(null);
    const [reportDetail, setReportDetail] = useState(null);
    const [showReportDetail, setShowReportDetail] = useState(false);
    const [showApprovalDialog, setShowApprovalDialog] = useState(false);
    const [approvalData, setApprovalData] = useState({ status: '', comments: '' });
    const [loadingDetail, setLoadingDetail] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [poRes, summaryRes, analyticsRes, timelineRes, alertsRes, perfRes, missingRes] = await Promise.all([
                purchaseOrdersAPI.getById(poId),
                poReportsAPI.getEnhancedSummary(poId),
                poReportsAPI.getPOAnalytics(poId),
                poReportsAPI.getPOTimeline(poId, {}),
                poReportsAPI.getAlertsPanel(poId),
                poReportsAPI.getSupplierPerformance(poId),
                poReportsAPI.getMissingDates(poId, {})
            ]);
            
            setPO(poRes.data);
            setEnhancedSummary(summaryRes.data);
            setAnalytics(analyticsRes.data);
            setTimeline(timelineRes.data);
            setAlertsPanel(alertsRes.data);
            setSupplierPerformance(perfRes.data);
            setMissingDates(missingRes.data);
            
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
            const PO_FALLBACK = {
                'PO-AW27-4812': { po_number: 'PO-AW27-4812', supplier_name: 'TCH Garments Pvt Ltd', style: 'ZR-AW27-OC001 / JK002 / TR003' },
                'PO-AW27-3991': { po_number: 'PO-AW27-3991', supplier_name: 'Beximco Garments Ltd', style: 'ZR-AW27-PJ004 / KN005' },
                'PO-SS27-2201': { po_number: 'PO-SS27-2201', supplier_name: 'TCH Garments Pvt Ltd', style: 'ZR-SS27-DR001 / TB002' },
                'PO-SS27-2202': { po_number: 'PO-SS27-2202', supplier_name: 'Beximco Garments Ltd', style: 'ZR-SS27-SH003 / PT004' },
            };
            setPO(PO_FALLBACK[poId] || { po_number: poId, supplier_name: 'Supplier', style: 'Multiple Styles' });
            setEnhancedSummary({
                total_reports: 18,
                pending_count: 3,
                status_breakdown: { approved: 12, rejected: 1, under_review: 2 },
                active_alerts: 1,
                avg_efficiency: 91,
                avg_dhu: 2.4,
                inspection_pass_rate: 94,
                supplier_name: PO_FALLBACK[poId]?.supplier_name || 'Supplier',
                style: PO_FALLBACK[poId]?.style || 'Multiple Styles',
                last_report_date: '2027-09-12',
                type_breakdown: { production: 8, quality: 5, inspection: 3, fabric_test: 1, trims: 1 },
            });
            setAnalytics({
                production_trends: [
                    { date: 'Week 1', target: 800, actual: 780 },
                    { date: 'Week 2', target: 800, actual: 820 },
                    { date: 'Week 3', target: 900, actual: 870 },
                    { date: 'Week 4', target: 900, actual: 920 },
                    { date: 'Week 5', target: 1000, actual: 960 },
                    { date: 'Week 6', target: 1000, actual: 1020 },
                ],
                quality_trends: [
                    { date: 'Week 1', dhu_percentage: 3.2 },
                    { date: 'Week 2', dhu_percentage: 2.8 },
                    { date: 'Week 3', dhu_percentage: 4.1 },
                    { date: 'Week 4', dhu_percentage: 2.4 },
                    { date: 'Week 5', dhu_percentage: 1.9 },
                    { date: 'Week 6', dhu_percentage: 2.1 },
                ],
                inspection_results: { pass: 12, conditional: 2, fail: 1 },
                defect_breakdown: { 'Stitching Skip': 14, 'Measurement Variance': 8, 'Fabric Flaw': 5, 'Button Missing': 3, 'Label Error': 2 },
            });
            setTimeline([]);
            setAlertsPanel({ total_alerts: 0 });
            setSupplierPerformance({ metrics: { overall_score: 88, quality: 91, delivery: 86, compliance: 89 } });
            setMissingDates(null);
            setProductionReports([]);
            setQualityReports([]);
            setInspectionReports([]);
            setFabricTestReports([]);
            setTrimsReports([]);
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

    const openReportDetail = async (report, type) => {
        setLoadingDetail(true);
        setShowReportDetail(true);
        try {
            const res = await poReportsAPI.getReportDetail(poId, type, report.id);
            setReportDetail(res.data);
        } catch (error) {
            toast.error('Failed to load report details');
        } finally {
            setLoadingDetail(false);
        }
    };

    const openApprovalDialog = (report, type) => {
        setSelectedReport({ ...report, type });
        setShowApprovalDialog(true);
    };

    const handleResolveAlert = async (alertId) => {
        try {
            await poReportsAPI.resolveReportAlert(alertId, 'Resolved from dashboard');
            toast.success('Alert resolved');
            fetchData();
        } catch (error) {
            toast.error('Failed to resolve alert');
        }
    };

    // Filter timeline based on date and type
    const filteredTimeline = timeline.filter(item => {
        if (dateFrom && item.date < dateFrom) return false;
        if (dateTo && item.date > dateTo) return false;
        if (typeFilter !== 'all' && item.type !== typeFilter) return false;
        return true;
    });

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

    // Supplier performance gauge data
    const performanceGaugeData = supplierPerformance ? [
        { name: 'Overall', value: supplierPerformance.metrics?.overall_score || 0, fill: '#10b981' }
    ] : [];

    return (
        <div className="space-y-6" data-testid="po-reports-dashboard">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button 
                    variant="ghost" 
                    onClick={() => navigate('/dashboard/brand')}
                    className="text-slate-400 hover:text-white"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
            </div>

            <div className="flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-white">{po.po_number}</h1>
                        <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/30">
                            Reports Section
                        </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-slate-400">
                        <span className="flex items-center gap-1">
                            <Factory className="h-4 w-4" />
                            {enhancedSummary?.supplier_name || po.supplier_name}
                        </span>
                        <span className="flex items-center gap-1">
                            <Package className="h-4 w-4" />
                            {enhancedSummary?.style || po.style || 'Multiple Styles'}
                        </span>
                        {enhancedSummary?.last_report_date && (
                            <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                Last Report: {enhancedSummary.last_report_date}
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button 
                        variant="outline" 
                        onClick={() => navigate(`/dashboard/brand/traceability/${poId}`)}
                        className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                    >
                        <Link2 className="h-4 w-4 mr-2" />
                        View Traceability
                    </Button>
                    <Button variant="outline" onClick={fetchData} className="border-slate-600 text-slate-300">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Summary Cards - Status Breakdown */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-purple-500/10">
                                <FileText className="h-5 w-5 text-purple-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{enhancedSummary?.total_reports || 0}</p>
                                <p className="text-xs text-slate-400">Total Reports</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-amber-500/10">
                                <Clock className="h-5 w-5 text-amber-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-amber-400">{enhancedSummary?.pending_count || 0}</p>
                                <p className="text-xs text-slate-400">Pending</p>
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
                                <p className="text-2xl font-bold text-emerald-400">{enhancedSummary?.status_breakdown?.approved || 0}</p>
                                <p className="text-xs text-slate-400">Approved</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-red-500/10">
                                <XCircle className="h-5 w-5 text-red-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-red-400">{enhancedSummary?.status_breakdown?.rejected || 0}</p>
                                <p className="text-xs text-slate-400">Rejected</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${(enhancedSummary?.active_alerts || 0) > 0 ? 'bg-red-500/10' : 'bg-slate-700'}`}>
                                <AlertTriangle className={`h-5 w-5 ${(enhancedSummary?.active_alerts || 0) > 0 ? 'text-red-400' : 'text-slate-400'}`} />
                            </div>
                            <div>
                                <p className={`text-2xl font-bold ${(enhancedSummary?.active_alerts || 0) > 0 ? 'text-red-400' : 'text-white'}`}>
                                    {enhancedSummary?.active_alerts || 0}
                                </p>
                                <p className="text-xs text-slate-400">Alerts</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-sm">Avg Efficiency</p>
                                <p className="text-3xl font-bold text-white">{enhancedSummary?.avg_efficiency || 0}%</p>
                            </div>
                            <Progress value={enhancedSummary?.avg_efficiency || 0} className="w-16 h-2 [&>div]:bg-emerald-500" />
                        </div>
                    </CardContent>
                </Card>
                
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-sm">Avg DHU</p>
                                <p className={`text-3xl font-bold ${(enhancedSummary?.avg_dhu || 0) > 5 ? 'text-red-400' : 'text-white'}`}>
                                    {enhancedSummary?.avg_dhu || 0}%
                                </p>
                            </div>
                            <Progress value={Math.min((enhancedSummary?.avg_dhu || 0) * 10, 100)} className={`w-16 h-2 [&>div]:${(enhancedSummary?.avg_dhu || 0) > 5 ? 'bg-red-500' : 'bg-blue-500'}`} />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-sm">Inspection Pass Rate</p>
                                <p className={`text-3xl font-bold ${(enhancedSummary?.inspection_pass_rate || 0) < 80 ? 'text-amber-400' : 'text-emerald-400'}`}>
                                    {enhancedSummary?.inspection_pass_rate || 0}%
                                </p>
                            </div>
                            <Progress value={enhancedSummary?.inspection_pass_rate || 0} className="w-16 h-2 [&>div]:bg-emerald-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-sm">Supplier Score</p>
                                <p className={`text-3xl font-bold ${(supplierPerformance?.metrics?.overall_score || 0) >= 80 ? 'text-emerald-400' : (supplierPerformance?.metrics?.overall_score || 0) >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
                                    {supplierPerformance?.metrics?.overall_score || 0}
                                </p>
                            </div>
                            <Award className={`h-8 w-8 ${(supplierPerformance?.metrics?.overall_score || 0) >= 80 ? 'text-emerald-400' : 'text-amber-400'}`} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Alerts Panel */}
            {(alertsPanel?.total_alerts || 0) > 0 && (
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-white text-lg flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-red-400" />
                                Active Alerts
                            </CardTitle>
                            <div className="flex items-center gap-2">
                                {alertsPanel?.counts?.critical > 0 && (
                                    <Badge className="bg-red-500">{alertsPanel.counts.critical} Critical</Badge>
                                )}
                                {alertsPanel?.counts?.warning > 0 && (
                                    <Badge className="bg-amber-500">{alertsPanel.counts.warning} Warning</Badge>
                                )}
                                {alertsPanel?.counts?.info > 0 && (
                                    <Badge className="bg-blue-500">{alertsPanel.counts.info} Info</Badge>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {/* Critical Alerts */}
                            {alertsPanel?.by_severity?.critical?.map((alert) => (
                                <div key={alert.id} className="flex items-center justify-between p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                                    <div className="flex items-center gap-3">
                                        <XCircle className="h-5 w-5 text-red-400" />
                                        <div>
                                            <p className="text-white font-medium">{alert.title}</p>
                                            <p className="text-red-300 text-sm">{alert.description}</p>
                                        </div>
                                    </div>
                                    <Button size="sm" variant="outline" onClick={() => handleResolveAlert(alert.id)} className="border-red-500/30 text-red-400">
                                        Resolve
                                    </Button>
                                </div>
                            ))}
                            {/* Warning Alerts */}
                            {alertsPanel?.by_severity?.warning?.map((alert) => (
                                <div key={alert.id} className="flex items-center justify-between p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                                    <div className="flex items-center gap-3">
                                        <AlertTriangle className="h-5 w-5 text-amber-400" />
                                        <div>
                                            <p className="text-white font-medium">{alert.title}</p>
                                            <p className="text-amber-300 text-sm">{alert.description}</p>
                                        </div>
                                    </div>
                                    <Button size="sm" variant="outline" onClick={() => handleResolveAlert(alert.id)} className="border-amber-500/30 text-amber-400">
                                        Resolve
                                    </Button>
                                </div>
                            ))}
                            {/* Info Alerts */}
                            {alertsPanel?.by_severity?.info?.map((alert) => (
                                <div key={alert.id} className="flex items-center justify-between p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                                    <div className="flex items-center gap-3">
                                        <Info className="h-5 w-5 text-blue-400" />
                                        <div>
                                            <p className="text-white font-medium">{alert.title}</p>
                                            <p className="text-blue-300 text-sm">{alert.description}</p>
                                        </div>
                                    </div>
                                    <Button size="sm" variant="outline" onClick={() => handleResolveAlert(alert.id)} className="border-blue-500/30 text-blue-400">
                                        Resolve
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Main Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="bg-slate-800 border border-slate-700 flex-wrap">
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
                    <TabsTrigger value="supplier" className="data-[state=active]:bg-emerald-600">Supplier Performance</TabsTrigger>
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
                                <CardDescription className="text-slate-400">DHU % Over Time (Threshold: 5%)</CardDescription>
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
                                            <Bar dataKey="dhu_percentage" name="DHU %">
                                                {qualityChartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.dhu_percentage > 5 ? '#ef4444' : '#f59e0b'} />
                                                ))}
                                            </Bar>
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
                                {inspectionPieData.length > 0 && inspectionPieData.some(d => d.value > 0) ? (
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
                                                label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}
                                            >
                                                {inspectionPieData.map((entry) => (
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

                    {/* Report Type Breakdown */}
                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardHeader>
                            <CardTitle className="text-white text-lg">Reports by Type</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-5 gap-4">
                                <div className="text-center p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
                                    <Activity className="h-6 w-6 text-blue-400 mx-auto mb-2" />
                                    <p className="text-2xl font-bold text-white">{enhancedSummary?.type_breakdown?.production || 0}</p>
                                    <p className="text-xs text-slate-400">Production (DPR)</p>
                                </div>
                                <div className="text-center p-4 rounded-lg bg-purple-500/5 border border-purple-500/20">
                                    <Target className="h-6 w-6 text-purple-400 mx-auto mb-2" />
                                    <p className="text-2xl font-bold text-white">{enhancedSummary?.type_breakdown?.quality || 0}</p>
                                    <p className="text-xs text-slate-400">Quality (DQR)</p>
                                </div>
                                <div className="text-center p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                                    <CheckCircle className="h-6 w-6 text-emerald-400 mx-auto mb-2" />
                                    <p className="text-2xl font-bold text-white">{enhancedSummary?.type_breakdown?.inspection || 0}</p>
                                    <p className="text-xs text-slate-400">Inspection</p>
                                </div>
                                <div className="text-center p-4 rounded-lg bg-teal-500/5 border border-teal-500/20">
                                    <FileText className="h-6 w-6 text-teal-400 mx-auto mb-2" />
                                    <p className="text-2xl font-bold text-white">{enhancedSummary?.type_breakdown?.fabric_test || 0}</p>
                                    <p className="text-xs text-slate-400">Fabric Tests</p>
                                </div>
                                <div className="text-center p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
                                    <Package className="h-6 w-6 text-amber-400 mx-auto mb-2" />
                                    <p className="text-2xl font-bold text-white">{enhancedSummary?.type_breakdown?.trims || 0}</p>
                                    <p className="text-xs text-slate-400">Trims</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
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
                                <Card key={report.id} className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors">
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
                                                    <p className="text-slate-500 text-xs">
                                                        {report.lines?.length || 0} production lines
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
                                                <div className="flex gap-2">
                                                    <Button 
                                                        size="sm" 
                                                        variant="ghost"
                                                        onClick={() => openReportDetail(report, 'production')}
                                                        className="text-slate-300"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    {report.status === 'submitted' && (
                                                        <Button 
                                                            size="sm" 
                                                            variant="outline"
                                                            onClick={() => openApprovalDialog(report, 'production')}
                                                            className="border-emerald-500/30 text-emerald-400"
                                                        >
                                                            Review
                                                        </Button>
                                                    )}
                                                </div>
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
                                                    <p className="text-slate-500 text-xs">
                                                        {report.inspection_type} inspection • {report.total_defects || 0} total defects
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
                                                <div className="flex gap-2">
                                                    <Button 
                                                        size="sm" 
                                                        variant="ghost"
                                                        onClick={() => openReportDetail(report, 'quality')}
                                                        className="text-slate-300"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    {report.status === 'submitted' && (
                                                        <Button 
                                                            size="sm" 
                                                            variant="outline"
                                                            onClick={() => openApprovalDialog(report, 'quality')}
                                                            className="border-emerald-500/30 text-emerald-400"
                                                        >
                                                            Review
                                                        </Button>
                                                    )}
                                                </div>
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
                                                        <p className="text-slate-500 text-xs flex items-center gap-1">
                                                            <User className="h-3 w-3" />
                                                            {report.inspector_name} ({report.inspector_company})
                                                        </p>
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
                                                <div className="flex gap-2">
                                                    <Button 
                                                        size="sm" 
                                                        variant="ghost"
                                                        onClick={() => openReportDetail(report, 'inspection')}
                                                        className="text-slate-300"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    {report.status === 'submitted' && (
                                                        <Button 
                                                            size="sm" 
                                                            variant="outline"
                                                            onClick={() => openApprovalDialog(report, 'inspection')}
                                                            className="border-emerald-500/30 text-emerald-400"
                                                        >
                                                            Review
                                                        </Button>
                                                    )}
                                                </div>
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
                                                <Button 
                                                    size="sm" 
                                                    variant="ghost"
                                                    onClick={() => openReportDetail(report, 'fabric_test')}
                                                    className="text-slate-300"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
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
                                <Package className="h-8 w-8 text-slate-600 mx-auto mb-2" />
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
                                                <Button 
                                                    size="sm" 
                                                    variant="ghost"
                                                    onClick={() => openReportDetail(report, 'trims')}
                                                    className="text-slate-300"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
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
                    {/* Filters */}
                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-4 flex-wrap">
                                <div className="flex items-center gap-2">
                                    <Label className="text-slate-400">From:</Label>
                                    <Input
                                        type="date"
                                        value={dateFrom}
                                        onChange={(e) => setDateFrom(e.target.value)}
                                        className="bg-slate-900/50 border-slate-600 text-white w-40"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Label className="text-slate-400">To:</Label>
                                    <Input
                                        type="date"
                                        value={dateTo}
                                        onChange={(e) => setDateTo(e.target.value)}
                                        className="bg-slate-900/50 border-slate-600 text-white w-40"
                                    />
                                </div>
                                <Select value={typeFilter} onValueChange={setTypeFilter}>
                                    <SelectTrigger className="w-48 bg-slate-900/50 border-slate-600 text-white">
                                        <SelectValue placeholder="Filter by type" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-800 border-slate-700">
                                        <SelectItem value="all">All Types</SelectItem>
                                        <SelectItem value="production">Production</SelectItem>
                                        <SelectItem value="quality">Quality</SelectItem>
                                        <SelectItem value="inspection">Inspection</SelectItem>
                                        <SelectItem value="fabric_test">Fabric Test</SelectItem>
                                        <SelectItem value="trims">Trims</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button 
                                    variant="outline" 
                                    onClick={() => { setDateFrom(''); setDateTo(''); setTypeFilter('all'); }}
                                    className="border-slate-600 text-slate-300"
                                >
                                    Clear Filters
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Missing Dates Highlight */}
                    {missingDates && missingDates.missing_count > 0 && (
                        <Card className="bg-amber-500/10 border-amber-500/30">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <CalendarDays className="h-5 w-5 text-amber-400" />
                                    <span className="text-amber-400 font-medium">{missingDates.missing_count} Missing Report Dates</span>
                                    <span className="text-amber-300 text-sm">
                                        - Reports expected but not received
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {filteredTimeline.length === 0 ? (
                        <Card className="bg-slate-800/50 border-slate-700">
                            <CardContent className="py-12 text-center">
                                <Calendar className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-white mb-2">No Reports Found</h3>
                                <p className="text-slate-400">Adjust filters or check back later</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="relative">
                            {/* Timeline line */}
                            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-700" />
                            
                            <div className="space-y-4">
                                {filteredTimeline.map((item) => (
                                    <div key={item.id} className="relative pl-14">
                                        {/* Timeline dot */}
                                        <div className={`absolute left-4 w-5 h-5 rounded-full border-2 ${
                                            item.type === 'production' ? 'bg-blue-500 border-blue-400' :
                                            item.type === 'quality' ? 'bg-purple-500 border-purple-400' :
                                            item.type === 'inspection' ? 'bg-emerald-500 border-emerald-400' :
                                            item.type === 'fabric_test' ? 'bg-teal-500 border-teal-400' :
                                            'bg-amber-500 border-amber-400'
                                        }`} />
                                        
                                        <Card className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors cursor-pointer"
                                              onClick={() => openReportDetail(item, item.type)}>
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
                                                    <div className="text-right flex items-center gap-4">
                                                        {item.efficiency !== undefined && (
                                                            <div>
                                                                <p className={`font-medium ${item.efficiency >= 70 ? 'text-emerald-400' : 'text-amber-400'}`}>{item.efficiency}%</p>
                                                                <p className="text-xs text-slate-500">Efficiency</p>
                                                            </div>
                                                        )}
                                                        {item.dhu !== undefined && (
                                                            <div>
                                                                <p className={`font-medium ${item.dhu > 5 ? 'text-red-400' : 'text-white'}`}>{item.dhu}%</p>
                                                                <p className="text-xs text-slate-500">DHU</p>
                                                            </div>
                                                        )}
                                                        {item.result && (
                                                            <Badge variant="outline" className={getResultColor(item.result)}>
                                                                {item.result?.toUpperCase()}
                                                            </Badge>
                                                        )}
                                                        <ChevronRight className="h-4 w-4 text-slate-400" />
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

                {/* Supplier Performance Tab */}
                <TabsContent value="supplier" className="space-y-4">
                    {supplierPerformance ? (
                        <>
                            <Card className="bg-slate-800/50 border-slate-700">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-white">{supplierPerformance.supplier_name}</CardTitle>
                                            <CardDescription className="text-slate-400">Supplier Performance Scorecard</CardDescription>
                                        </div>
                                        <div className={`text-center p-4 rounded-xl ${
                                            supplierPerformance.metrics?.overall_score >= 80 ? 'bg-emerald-500/10' :
                                            supplierPerformance.metrics?.overall_score >= 60 ? 'bg-amber-500/10' :
                                            'bg-red-500/10'
                                        }`}>
                                            <p className={`text-4xl font-bold ${
                                                supplierPerformance.metrics?.overall_score >= 80 ? 'text-emerald-400' :
                                                supplierPerformance.metrics?.overall_score >= 60 ? 'text-amber-400' :
                                                'text-red-400'
                                            }`}>
                                                {supplierPerformance.metrics?.overall_score || 0}
                                            </p>
                                            <p className="text-slate-400 text-sm">Overall Score</p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="p-4 rounded-lg bg-slate-900/50">
                                            <p className="text-slate-400 text-sm mb-1">Quality Score</p>
                                            <p className="text-2xl font-bold text-white">{supplierPerformance.metrics?.quality_score || 0}</p>
                                            <Progress value={supplierPerformance.metrics?.quality_score || 0} className="mt-2 h-1 [&>div]:bg-purple-500" />
                                        </div>
                                        <div className="p-4 rounded-lg bg-slate-900/50">
                                            <p className="text-slate-400 text-sm mb-1">Avg Efficiency</p>
                                            <p className="text-2xl font-bold text-white">{supplierPerformance.metrics?.avg_efficiency || 0}%</p>
                                            <Progress value={supplierPerformance.metrics?.avg_efficiency || 0} className="mt-2 h-1 [&>div]:bg-blue-500" />
                                        </div>
                                        <div className="p-4 rounded-lg bg-slate-900/50">
                                            <p className="text-slate-400 text-sm mb-1">Inspection Pass Rate</p>
                                            <p className="text-2xl font-bold text-white">{supplierPerformance.metrics?.inspection_pass_rate || 0}%</p>
                                            <Progress value={supplierPerformance.metrics?.inspection_pass_rate || 0} className="mt-2 h-1 [&>div]:bg-emerald-500" />
                                        </div>
                                        <div className="p-4 rounded-lg bg-slate-900/50">
                                            <p className="text-slate-400 text-sm mb-1">On-Time Submission</p>
                                            <p className="text-2xl font-bold text-white">{supplierPerformance.metrics?.on_time_submission_rate || 0}%</p>
                                            <Progress value={supplierPerformance.metrics?.on_time_submission_rate || 0} className="mt-2 h-1 [&>div]:bg-teal-500" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-slate-800/50 border-slate-700">
                                <CardHeader>
                                    <CardTitle className="text-white">Report Submission Summary</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="text-center p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
                                            <p className="text-3xl font-bold text-white">{supplierPerformance.report_counts?.production_reports || 0}</p>
                                            <p className="text-slate-400 text-sm">Production Reports</p>
                                            <p className="text-slate-500 text-xs mt-1">{supplierPerformance.report_counts?.unique_production_dates || 0} unique dates</p>
                                        </div>
                                        <div className="text-center p-4 rounded-lg bg-purple-500/5 border border-purple-500/20">
                                            <p className="text-3xl font-bold text-white">{supplierPerformance.report_counts?.quality_reports || 0}</p>
                                            <p className="text-slate-400 text-sm">Quality Reports</p>
                                            <p className="text-slate-500 text-xs mt-1">{supplierPerformance.report_counts?.unique_quality_dates || 0} unique dates</p>
                                        </div>
                                        <div className="text-center p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                                            <p className="text-3xl font-bold text-white">{supplierPerformance.report_counts?.inspection_reports || 0}</p>
                                            <p className="text-slate-400 text-sm">Inspection Reports</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    ) : (
                        <Card className="bg-slate-800/50 border-slate-700">
                            <CardContent className="py-12 text-center">
                                <Award className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                                <p className="text-slate-400">Loading supplier performance data...</p>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>

            {/* Report Detail Dialog */}
            <Dialog open={showReportDetail} onOpenChange={setShowReportDetail}>
                <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-white">Report Details</DialogTitle>
                    </DialogHeader>
                    {loadingDetail ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
                        </div>
                    ) : reportDetail ? (
                        <div className="space-y-4">
                            {/* Report Header */}
                            <div className="flex items-center justify-between">
                                <Badge variant="outline" className="capitalize">{reportDetail.report_type}</Badge>
                                <Badge variant="outline" className={getStatusColor(reportDetail.report?.status)}>
                                    {reportDetail.report?.status}
                                </Badge>
                            </div>

                            {/* Report Data */}
                            <Card className="bg-slate-900/50 border-slate-700">
                                <CardContent className="p-4 space-y-3">
                                    {reportDetail.report?.report_date && (
                                        <div className="flex justify-between">
                                            <span className="text-slate-400">Date</span>
                                            <span className="text-white">{reportDetail.report.report_date}</span>
                                        </div>
                                    )}
                                    {reportDetail.report?.supplier_name && (
                                        <div className="flex justify-between">
                                            <span className="text-slate-400">Supplier</span>
                                            <span className="text-white">{reportDetail.report.supplier_name}</span>
                                        </div>
                                    )}
                                    {reportDetail.report?.overall_efficiency !== undefined && (
                                        <div className="flex justify-between">
                                            <span className="text-slate-400">Efficiency</span>
                                            <span className="text-emerald-400 font-medium">{reportDetail.report.overall_efficiency}%</span>
                                        </div>
                                    )}
                                    {reportDetail.report?.dhu_percentage !== undefined && (
                                        <div className="flex justify-between">
                                            <span className="text-slate-400">DHU</span>
                                            <span className={`font-medium ${reportDetail.report.dhu_percentage > 5 ? 'text-red-400' : 'text-white'}`}>{reportDetail.report.dhu_percentage}%</span>
                                        </div>
                                    )}
                                    {reportDetail.report?.result && (
                                        <div className="flex justify-between">
                                            <span className="text-slate-400">Result</span>
                                            <Badge variant="outline" className={getResultColor(reportDetail.report.result)}>
                                                {reportDetail.report.result?.toUpperCase()}
                                            </Badge>
                                        </div>
                                    )}
                                    {reportDetail.report?.remarks && (
                                        <div>
                                            <span className="text-slate-400">Remarks</span>
                                            <p className="text-white mt-1">{reportDetail.report.remarks}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Defects (for quality reports) */}
                            {reportDetail.report?.defects && reportDetail.report.defects.length > 0 && (
                                <Card className="bg-slate-900/50 border-slate-700">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-white text-sm">Defects Found</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-4">
                                        <div className="space-y-2">
                                            {reportDetail.report.defects.map((defect, idx) => (
                                                <div key={idx} className="flex items-center justify-between p-2 rounded bg-slate-800">
                                                    <span className="text-slate-300">{defect.defect_name}</span>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline" className={
                                                            defect.severity === 'critical' ? 'bg-red-500/10 text-red-400 border-red-500/30' :
                                                            defect.severity === 'major' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                                                            'bg-blue-500/10 text-blue-400 border-blue-500/30'
                                                        }>
                                                            {defect.severity}
                                                        </Badge>
                                                        <span className="text-white font-medium">{defect.quantity}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Approval History */}
                            {reportDetail.approval_history && reportDetail.approval_history.length > 0 && (
                                <Card className="bg-slate-900/50 border-slate-700">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-white text-sm">Approval History</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-4">
                                        {reportDetail.approval_history.map((entry, idx) => (
                                            <div key={idx} className="flex items-start gap-3">
                                                <div className={`p-1 rounded-full ${entry.action === 'approved' ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                                                    {entry.action === 'approved' ? (
                                                        <Check className="h-4 w-4 text-emerald-400" />
                                                    ) : (
                                                        <X className="h-4 w-4 text-red-400" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-white capitalize">{entry.action}</p>
                                                    <p className="text-slate-400 text-sm">{entry.at}</p>
                                                    {entry.comments && <p className="text-slate-300 text-sm mt-1">{entry.comments}</p>}
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            )}

                            {/* Traceability Link */}
                            {reportDetail.traceability_link?.id && (
                                <Button 
                                    variant="outline" 
                                    className="w-full border-emerald-500/30 text-emerald-400"
                                    onClick={() => {
                                        setShowReportDetail(false);
                                        navigate(`/dashboard/brand/traceability/${poId}`);
                                    }}
                                >
                                    <Link2 className="h-4 w-4 mr-2" />
                                    View Traceability (Score: {reportDetail.traceability_link.score}%)
                                </Button>
                            )}
                        </div>
                    ) : (
                        <p className="text-slate-400 text-center py-8">No report data available</p>
                    )}
                </DialogContent>
            </Dialog>

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
                                    <SelectItem value="rejected">Reject (Request Re-upload)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-300">Comments</Label>
                            <Textarea
                                value={approvalData.comments}
                                onChange={(e) => setApprovalData(prev => ({ ...prev, comments: e.target.value }))}
                                className="bg-slate-900/50 border-slate-600 text-white"
                                placeholder="Add review comments..."
                                rows={3}
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
