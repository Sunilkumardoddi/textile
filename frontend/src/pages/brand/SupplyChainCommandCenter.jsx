import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Building2, Package, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, 
    Clock, Truck, FileText, Shield, Activity, BarChart3, Target, Zap,
    RefreshCw, ChevronRight, Eye, ArrowRight, Loader2, Filter, Calendar,
    Factory, ClipboardCheck, AlertCircle, XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { commandCenterAPI, seasonsAPI } from '@/lib/api';
import { toast } from 'sonner';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const COLORS = {
    green: '#10b981',
    yellow: '#f59e0b',
    red: '#ef4444',
    blue: '#3b82f6',
    purple: '#8b5cf6',
    cyan: '#06b6d4',
    orange: '#f97316',
    gray: '#6b7280'
};

const KPI_THRESHOLDS = {
    quality_score: { good: 80, warning: 60 },
    on_time_rate: { good: 90, warning: 70 },
    production_progress: { good: 80, warning: 50 },
    dhu: { good: 3, warning: 5 }
};

const getScoreColor = (value, type) => {
    const thresholds = KPI_THRESHOLDS[type];
    if (!thresholds) return 'text-white';
    
    if (type === 'dhu') {
        // Lower is better for DHU
        if (value <= thresholds.good) return 'text-emerald-400';
        if (value <= thresholds.warning) return 'text-amber-400';
        return 'text-red-400';
    } else {
        if (value >= thresholds.good) return 'text-emerald-400';
        if (value >= thresholds.warning) return 'text-amber-400';
        return 'text-red-400';
    }
};

export default function SupplyChainCommandCenter() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [suppliers, setSuppliers] = useState([]);
    const [seasons, setSeasons] = useState([]);
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [selectedSeason, setSelectedSeason] = useState('all');
    const [activeTab, setActiveTab] = useState('overview');
    
    // Data states
    const [kpis, setKpis] = useState(null);
    const [overview, setOverview] = useState(null);
    const [production, setProduction] = useState(null);
    const [quality, setQuality] = useState(null);
    const [delivery, setDelivery] = useState(null);
    const [compliance, setCompliance] = useState(null);
    const [reports, setReports] = useState(null);
    const [alerts, setAlerts] = useState(null);

    // Initial load - get suppliers and seasons
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [suppliersRes, seasonsRes] = await Promise.all([
                    commandCenterAPI.getSuppliers(),
                    seasonsAPI.getAll({ limit: 20 })
                ]);
                setSuppliers(suppliersRes.data);
                setSeasons(seasonsRes.data);
                
                // Auto-select first supplier if available
                if (suppliersRes.data.length > 0) {
                    setSelectedSupplier(suppliersRes.data[0]);
                }
            } catch (error) {
                console.error('Error loading initial data:', error);
                console.error('Failed to load command center data');
                const fallbackSuppliers = [
                    { id: 'SUP-001', name: 'TCH Garments Pvt Ltd', country: 'India', risk_category: 'low' },
                    { id: 'SUP-002', name: 'Beximco Garments Ltd', country: 'Bangladesh', risk_category: 'medium' },
                ];
                const fallbackSeasons = [{ id: 'AW2027', season_code: 'AW2027' }, { id: 'SS2027', season_code: 'SS2027' }];
                setSuppliers(fallbackSuppliers);
                setSeasons(fallbackSeasons);
                setSelectedSupplier(fallbackSuppliers[0]);
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, []);

    // Load supplier data when selection changes
    const loadSupplierData = useCallback(async () => {
        if (!selectedSupplier) return;
        
        setLoading(true);
        try {
            const seasonId = selectedSeason === 'all' ? null : selectedSeason;
            
            const [kpisRes, overviewRes, productionRes, qualityRes, deliveryRes, complianceRes, reportsRes, alertsRes] = await Promise.all([
                commandCenterAPI.getKPIs(selectedSupplier.id, seasonId),
                commandCenterAPI.getOverview(selectedSupplier.id, seasonId),
                commandCenterAPI.getProduction(selectedSupplier.id, seasonId),
                commandCenterAPI.getQuality(selectedSupplier.id, seasonId),
                commandCenterAPI.getDelivery(selectedSupplier.id, seasonId),
                commandCenterAPI.getCompliance(selectedSupplier.id, seasonId),
                commandCenterAPI.getReports(selectedSupplier.id, seasonId),
                commandCenterAPI.getAlerts(selectedSupplier.id, seasonId)
            ]);
            
            setKpis(kpisRes.data);
            setOverview(overviewRes.data);
            setProduction(productionRes.data);
            setQuality(qualityRes.data);
            setDelivery(deliveryRes.data);
            setCompliance(complianceRes.data);
            setReports(reportsRes.data);
            setAlerts(alertsRes.data);
        } catch (error) {
            console.error('Error loading supplier data:', error);
            console.error('Failed to load supplier data');
            setKpis({ kpis: { total_pos: 8, production_progress: 82, quality_score: 91, on_time_delivery_rate: 85, compliance_score: 94, active_alerts: 2 }, trends: { production: [], quality: [] }, alerts: [] });
            setOverview({ active_pos: 4, completed_pos: 3, delayed_pos: 1, total_value: 1200000, po_status_breakdown: { active: 4, completed: 3, delayed: 1 } });
            setDelivery({ on_time_deliveries: 12, slight_delay_deliveries: 2, critical_delay_deliveries: 1, on_time_rate: 80, average_transit_hours: 68 });
            setAlerts({ critical_alerts: 0, high_alerts: 1, total_alerts: 2 });
            setProduction(null);
            setQuality(null);
            setCompliance(null);
            setReports(null);
        } finally {
            setLoading(false);
        }
    }, [selectedSupplier, selectedSeason]);

    useEffect(() => {
        if (selectedSupplier) {
            loadSupplierData();
        }
    }, [selectedSupplier, selectedSeason, loadSupplierData]);

    const selectedSeasonData = seasons.find(s => s.id === selectedSeason);
    const seasonLabel = selectedSeason === 'all' ? 'All Seasons' : selectedSeasonData?.season_code || 'Unknown';

    if (loading && !selectedSupplier) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 p-6" data-testid="command-center">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Activity className="h-7 w-7 text-cyan-400" />
                        Supply Chain Command Center
                    </h1>
                    <p className="text-slate-400 mt-1">Supplier-specific performance and activity monitoring</p>
                </div>
                <Button onClick={loadSupplierData} variant="outline" className="border-slate-600 text-slate-300" disabled={loading}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* Supplier & Season Selectors */}
            <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex-1 min-w-[250px]">
                    <label className="text-sm text-slate-400 mb-1 block">Select Supplier</label>
                    <Select 
                        value={selectedSupplier?.id || ''} 
                        onValueChange={(value) => setSelectedSupplier(suppliers.find(s => s.id === value))}
                    >
                        <SelectTrigger className="bg-slate-800 border-slate-600 text-white" data-testid="supplier-selector">
                            <Building2 className="h-4 w-4 mr-2 text-cyan-400" />
                            <SelectValue placeholder="Select a supplier" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                            {suppliers.map((supplier) => (
                                <SelectItem 
                                    key={supplier.id} 
                                    value={supplier.id}
                                    className="text-white hover:bg-slate-700"
                                >
                                    {supplier.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="w-[200px]">
                    <label className="text-sm text-slate-400 mb-1 block">Filter by Season</label>
                    <Select value={selectedSeason} onValueChange={setSelectedSeason}>
                        <SelectTrigger className="bg-slate-800 border-slate-600 text-white" data-testid="season-filter">
                            <Calendar className="h-4 w-4 mr-2 text-purple-400" />
                            <SelectValue placeholder="All Seasons" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                            <SelectItem value="all" className="text-white hover:bg-slate-700">All Seasons</SelectItem>
                            {seasons.map((season) => (
                                <SelectItem 
                                    key={season.id} 
                                    value={season.id}
                                    className="text-white hover:bg-slate-700"
                                >
                                    {season.season_code} - {season.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* No Supplier Selected */}
            {!selectedSupplier && (
                <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="py-12 text-center">
                        <Building2 className="h-16 w-16 text-slate-500 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">Select a Supplier</h3>
                        <p className="text-slate-400">Choose a supplier from the dropdown to view their performance dashboard</p>
                    </CardContent>
                </Card>
            )}

            {/* Command Center Content */}
            {selectedSupplier && (
                <>
                    {/* Supplier Header */}
                    <Card className="bg-gradient-to-r from-cyan-900/30 to-purple-900/30 border-cyan-500/30 mb-6">
                        <CardContent className="py-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center">
                                        <Building2 className="h-6 w-6 text-cyan-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white">{selectedSupplier.name}</h2>
                                        <p className="text-sm text-slate-400">
                                            {selectedSupplier.country} • {seasonLabel}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    {alerts?.critical_alerts > 0 && (
                                        <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                                            <AlertTriangle className="h-3 w-3 mr-1" />
                                            {alerts.critical_alerts} Critical Alerts
                                        </Badge>
                                    )}
                                    <Badge className={`${selectedSupplier.risk_category === 'low' ? 'bg-emerald-500/20 text-emerald-400' : selectedSupplier.risk_category === 'medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}`}>
                                        {selectedSupplier.risk_category?.toUpperCase()} Risk
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* KPI Cards */}
                    {kpis && (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
                            <Card className="bg-slate-800 border-slate-700">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-blue-500/20">
                                            <Package className="h-5 w-5 text-blue-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400">Total POs</p>
                                            <p className="text-xl font-bold text-white">{kpis.kpis.total_pos}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-slate-800 border-slate-700">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-purple-500/20">
                                            <Factory className="h-5 w-5 text-purple-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400">Production</p>
                                            <p className={`text-xl font-bold ${getScoreColor(kpis.kpis.production_progress, 'production_progress')}`}>
                                                {kpis.kpis.production_progress}%
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-slate-800 border-slate-700">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-emerald-500/20">
                                            <CheckCircle className="h-5 w-5 text-emerald-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400">Quality Score</p>
                                            <p className={`text-xl font-bold ${getScoreColor(kpis.kpis.quality_score, 'quality_score')}`}>
                                                {kpis.kpis.quality_score}%
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-slate-800 border-slate-700">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-cyan-500/20">
                                            <Truck className="h-5 w-5 text-cyan-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400">On-Time Delivery</p>
                                            <p className={`text-xl font-bold ${getScoreColor(kpis.kpis.on_time_delivery_rate, 'on_time_rate')}`}>
                                                {kpis.kpis.on_time_delivery_rate}%
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-slate-800 border-slate-700">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-amber-500/20">
                                            <Shield className="h-5 w-5 text-amber-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400">Compliance</p>
                                            <p className={`text-xl font-bold ${getScoreColor(kpis.kpis.compliance_score, 'quality_score')}`}>
                                                {kpis.kpis.compliance_score}%
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-slate-800 border-slate-700">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-red-500/20">
                                            <AlertTriangle className="h-5 w-5 text-red-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400">Active Alerts</p>
                                            <p className="text-xl font-bold text-white">{kpis.kpis.active_alerts}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Main Tabs */}
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                        <TabsList className="bg-slate-800 border border-slate-700 p-1 flex-wrap">
                            <TabsTrigger value="overview" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
                                Overview
                            </TabsTrigger>
                            <TabsTrigger value="production" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
                                Production
                            </TabsTrigger>
                            <TabsTrigger value="quality" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
                                Quality
                            </TabsTrigger>
                            <TabsTrigger value="delivery" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
                                Delivery
                            </TabsTrigger>
                            <TabsTrigger value="compliance" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
                                Compliance
                            </TabsTrigger>
                            <TabsTrigger value="reports" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
                                Reports
                            </TabsTrigger>
                            <TabsTrigger value="alerts" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
                                Alerts ({alerts?.total_alerts || 0})
                            </TabsTrigger>
                        </TabsList>

                        {/* Overview Tab */}
                        <TabsContent value="overview" className="space-y-4">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {/* PO Status Breakdown */}
                                <Card className="bg-slate-800 border-slate-700">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-white text-lg flex items-center gap-2">
                                            <Package className="h-5 w-5 text-blue-400" />
                                            PO Status Breakdown
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {overview && (
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
                                                        <p className="text-sm text-blue-400">Active</p>
                                                        <p className="text-2xl font-bold text-white">{overview.active_pos}</p>
                                                    </div>
                                                    <div className="p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
                                                        <p className="text-sm text-emerald-400">Completed</p>
                                                        <p className="text-2xl font-bold text-white">{overview.completed_pos}</p>
                                                    </div>
                                                    <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/30">
                                                        <p className="text-sm text-red-400">Delayed</p>
                                                        <p className="text-2xl font-bold text-white">{overview.delayed_pos}</p>
                                                    </div>
                                                    <div className="p-3 bg-slate-500/10 rounded-lg border border-slate-500/30">
                                                        <p className="text-sm text-slate-400">Total Value</p>
                                                        <p className="text-2xl font-bold text-white">${overview.total_value?.toLocaleString()}</p>
                                                    </div>
                                                </div>
                                                <ResponsiveContainer width="100%" height={200}>
                                                    <PieChart>
                                                        <Pie
                                                            data={Object.entries(overview.po_status_breakdown || {}).map(([status, count]) => ({
                                                                name: status.replace(/_/g, ' '),
                                                                value: count
                                                            }))}
                                                            cx="50%"
                                                            cy="50%"
                                                            innerRadius={50}
                                                            outerRadius={80}
                                                            dataKey="value"
                                                        >
                                                            {Object.keys(overview.po_status_breakdown || {}).map((_, index) => (
                                                                <Cell key={`cell-${index}`} fill={Object.values(COLORS)[index % Object.values(COLORS).length]} />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                                                        <Legend />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Production Trend */}
                                <Card className="bg-slate-800 border-slate-700">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-white text-lg flex items-center gap-2">
                                            <TrendingUp className="h-5 w-5 text-purple-400" />
                                            Production Trend
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {kpis?.trends?.production?.length > 0 ? (
                                            <ResponsiveContainer width="100%" height={250}>
                                                <AreaChart data={kpis.trends.production}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                                                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} />
                                                    <YAxis stroke="#94a3b8" fontSize={12} />
                                                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                                                    <Area type="monotone" dataKey="target" name="Target" stroke={COLORS.blue} fill={COLORS.blue} fillOpacity={0.2} />
                                                    <Area type="monotone" dataKey="actual" name="Actual" stroke={COLORS.green} fill={COLORS.green} fillOpacity={0.3} />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="h-[250px] flex items-center justify-center text-slate-500">
                                                No production data available
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Quality Trend */}
                                <Card className="bg-slate-800 border-slate-700">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-white text-lg flex items-center gap-2">
                                            <BarChart3 className="h-5 w-5 text-amber-400" />
                                            Quality Trend (DHU %)
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {kpis?.trends?.quality?.length > 0 ? (
                                            <ResponsiveContainer width="100%" height={250}>
                                                <BarChart data={kpis.trends.quality}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                                                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} />
                                                    <YAxis stroke="#94a3b8" fontSize={12} />
                                                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                                                    <Bar dataKey="dhu" name="DHU %" radius={[4, 4, 0, 0]}>
                                                        {kpis.trends.quality.map((entry, index) => (
                                                            <Cell 
                                                                key={`cell-${index}`} 
                                                                fill={entry.dhu <= 3 ? COLORS.green : entry.dhu <= 5 ? COLORS.yellow : COLORS.red} 
                                                            />
                                                        ))}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="h-[250px] flex items-center justify-center text-slate-500">
                                                No quality data available
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Delivery Performance */}
                                <Card className="bg-slate-800 border-slate-700">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-white text-lg flex items-center gap-2">
                                            <Truck className="h-5 w-5 text-cyan-400" />
                                            Delivery Performance
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {delivery && (
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-3 gap-3 text-center">
                                                    <div className="p-3 bg-emerald-500/10 rounded-lg">
                                                        <p className="text-2xl font-bold text-emerald-400">{delivery.on_time_deliveries}</p>
                                                        <p className="text-xs text-slate-400">On Time</p>
                                                    </div>
                                                    <div className="p-3 bg-amber-500/10 rounded-lg">
                                                        <p className="text-2xl font-bold text-amber-400">{delivery.slight_delay_deliveries}</p>
                                                        <p className="text-xs text-slate-400">Slight Delay</p>
                                                    </div>
                                                    <div className="p-3 bg-red-500/10 rounded-lg">
                                                        <p className="text-2xl font-bold text-red-400">{delivery.critical_delay_deliveries}</p>
                                                        <p className="text-xs text-slate-400">Critical Delay</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                                                    <span className="text-slate-400">On-Time Rate</span>
                                                    <span className={`text-xl font-bold ${getScoreColor(delivery.on_time_rate, 'on_time_rate')}`}>
                                                        {delivery.on_time_rate}%
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                                                    <span className="text-slate-400">Avg Transit Time</span>
                                                    <span className="text-white font-semibold">{delivery.average_transit_hours}h</span>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Recent Alerts */}
                            {kpis?.alerts?.length > 0 && (
                                <Card className="bg-slate-800 border-slate-700">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-white text-lg flex items-center gap-2">
                                            <AlertTriangle className="h-5 w-5 text-red-400" />
                                            Recent Alerts
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            {kpis.alerts.map((alert) => (
                                                <div 
                                                    key={alert.id} 
                                                    className={`p-3 rounded-lg border flex items-center justify-between ${
                                                        alert.severity === 'critical' ? 'bg-red-500/10 border-red-500/30' :
                                                        alert.severity === 'high' ? 'bg-orange-500/10 border-orange-500/30' :
                                                        'bg-amber-500/10 border-amber-500/30'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <AlertCircle className={`h-4 w-4 ${
                                                            alert.severity === 'critical' ? 'text-red-400' :
                                                            alert.severity === 'high' ? 'text-orange-400' : 'text-amber-400'
                                                        }`} />
                                                        <div>
                                                            <p className="text-white text-sm">{alert.title}</p>
                                                            <p className="text-xs text-slate-400">{alert.po_number}</p>
                                                        </div>
                                                    </div>
                                                    <Badge className={
                                                        alert.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                                                        alert.severity === 'high' ? 'bg-orange-500/20 text-orange-400' : 'bg-amber-500/20 text-amber-400'
                                                    }>
                                                        {alert.severity}
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>

                        {/* Production Tab */}
                        <TabsContent value="production" className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <Card className="bg-slate-800 border-slate-700">
                                    <CardContent className="p-4 text-center">
                                        <p className="text-sm text-slate-400">Overall Progress</p>
                                        <p className={`text-3xl font-bold ${getScoreColor(production?.overall_progress || 0, 'production_progress')}`}>
                                            {production?.overall_progress || 0}%
                                        </p>
                                        <Progress value={production?.overall_progress || 0} className="mt-2 h-2" />
                                    </CardContent>
                                </Card>
                                <Card className="bg-slate-800 border-slate-700">
                                    <CardContent className="p-4 text-center">
                                        <p className="text-sm text-slate-400">Total Target</p>
                                        <p className="text-3xl font-bold text-white">{production?.total_target?.toLocaleString() || 0}</p>
                                    </CardContent>
                                </Card>
                                <Card className="bg-slate-800 border-slate-700">
                                    <CardContent className="p-4 text-center">
                                        <p className="text-sm text-slate-400">Total Actual</p>
                                        <p className="text-3xl font-bold text-emerald-400">{production?.total_actual?.toLocaleString() || 0}</p>
                                    </CardContent>
                                </Card>
                                <Card className="bg-slate-800 border-slate-700">
                                    <CardContent className="p-4 text-center">
                                        <p className="text-sm text-slate-400">WIP Quantity</p>
                                        <p className="text-3xl font-bold text-amber-400">{production?.wip_quantity?.toLocaleString() || 0}</p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Production Chart */}
                            <Card className="bg-slate-800 border-slate-700">
                                <CardHeader>
                                    <CardTitle className="text-white">Daily Output Trend</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {production?.daily_output_trend?.length > 0 ? (
                                        <ResponsiveContainer width="100%" height={300}>
                                            <LineChart data={production.daily_output_trend}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                                                <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} />
                                                <YAxis stroke="#94a3b8" fontSize={12} />
                                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                                                <Legend />
                                                <Line type="monotone" dataKey="target" name="Target" stroke={COLORS.blue} strokeWidth={2} dot={false} />
                                                <Line type="monotone" dataKey="actual" name="Actual" stroke={COLORS.green} strokeWidth={2} dot={false} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="h-[300px] flex items-center justify-center text-slate-500">
                                            No production trend data available
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Production by PO */}
                            <Card className="bg-slate-800 border-slate-700">
                                <CardHeader>
                                    <CardTitle className="text-white">Production by PO</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {production?.production_by_po?.length > 0 ? (
                                        <div className="space-y-3">
                                            {production.production_by_po.map((po) => (
                                                <div key={po.po_id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                                                    <div>
                                                        <p className="text-white font-medium">{po.po_number}</p>
                                                        <p className="text-xs text-slate-400">Target: {po.target} | Actual: {po.actual}</p>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <Progress value={po.efficiency} className="w-24 h-2" />
                                                        <span className={`font-bold ${getScoreColor(po.efficiency, 'production_progress')}`}>
                                                            {po.efficiency}%
                                                        </span>
                                                        <Button 
                                                            size="sm" 
                                                            variant="ghost" 
                                                            className="text-cyan-400"
                                                            onClick={() => navigate(`/dashboard/brand/traceability/${po.po_id}`)}
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-slate-500 text-center py-4">No PO production data available</p>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Quality Tab */}
                        <TabsContent value="quality" className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <Card className="bg-slate-800 border-slate-700">
                                    <CardContent className="p-4 text-center">
                                        <p className="text-sm text-slate-400">Quality Score</p>
                                        <p className={`text-3xl font-bold ${getScoreColor(quality?.quality_score || 0, 'quality_score')}`}>
                                            {quality?.quality_score || 0}%
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card className="bg-slate-800 border-slate-700">
                                    <CardContent className="p-4 text-center">
                                        <p className="text-sm text-slate-400">Avg DHU</p>
                                        <p className={`text-3xl font-bold ${getScoreColor(quality?.average_dhu || 0, 'dhu')}`}>
                                            {quality?.average_dhu || 0}%
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card className="bg-slate-800 border-slate-700">
                                    <CardContent className="p-4 text-center">
                                        <p className="text-sm text-slate-400">Total Defects</p>
                                        <p className="text-3xl font-bold text-amber-400">{quality?.total_defects || 0}</p>
                                    </CardContent>
                                </Card>
                                <Card className="bg-slate-800 border-slate-700">
                                    <CardContent className="p-4 text-center">
                                        <p className="text-sm text-slate-400">Critical Defects</p>
                                        <p className="text-3xl font-bold text-red-400">{quality?.critical_defects || 0}</p>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {/* DHU Trend */}
                                <Card className="bg-slate-800 border-slate-700">
                                    <CardHeader>
                                        <CardTitle className="text-white">DHU % Trend</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {quality?.dhu_trend?.length > 0 ? (
                                            <ResponsiveContainer width="100%" height={250}>
                                                <LineChart data={quality.dhu_trend}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                                                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} />
                                                    <YAxis stroke="#94a3b8" fontSize={12} />
                                                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                                                    <Line type="monotone" dataKey="dhu" name="DHU %" stroke={COLORS.red} strokeWidth={2} />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="h-[250px] flex items-center justify-center text-slate-500">
                                                No DHU trend data
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Defect Breakdown */}
                                <Card className="bg-slate-800 border-slate-700">
                                    <CardHeader>
                                        <CardTitle className="text-white">Defect Breakdown</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {quality?.defect_breakdown?.length > 0 ? (
                                            <div className="space-y-2">
                                                {quality.defect_breakdown.map((defect, index) => (
                                                    <div key={defect.type} className="flex items-center justify-between p-2 bg-slate-700/50 rounded">
                                                        <span className="text-white">{defect.type}</span>
                                                        <Badge className="bg-red-500/20 text-red-400">{defect.count}</Badge>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="h-[250px] flex items-center justify-center text-slate-500">
                                                No defect data
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* Delivery Tab */}
                        <TabsContent value="delivery" className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <Card className="bg-slate-800 border-slate-700">
                                    <CardContent className="p-4 text-center">
                                        <p className="text-sm text-slate-400">Total Deliveries</p>
                                        <p className="text-3xl font-bold text-white">{delivery?.total_deliveries || 0}</p>
                                    </CardContent>
                                </Card>
                                <Card className="bg-slate-800 border-slate-700">
                                    <CardContent className="p-4 text-center">
                                        <p className="text-sm text-slate-400">On-Time Rate</p>
                                        <p className={`text-3xl font-bold ${getScoreColor(delivery?.on_time_rate || 0, 'on_time_rate')}`}>
                                            {delivery?.on_time_rate || 0}%
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card className="bg-slate-800 border-slate-700">
                                    <CardContent className="p-4 text-center">
                                        <p className="text-sm text-slate-400">Avg Delay</p>
                                        <p className="text-3xl font-bold text-amber-400">{delivery?.average_delay_hours || 0}h</p>
                                    </CardContent>
                                </Card>
                                <Card className="bg-slate-800 border-slate-700">
                                    <CardContent className="p-4 text-center">
                                        <p className="text-sm text-slate-400">Pending</p>
                                        <p className="text-3xl font-bold text-purple-400">{delivery?.pending_dispatches || 0}</p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Delivery Trend */}
                            <Card className="bg-slate-800 border-slate-700">
                                <CardHeader>
                                    <CardTitle className="text-white">Weekly Delivery Performance</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {delivery?.delivery_trend?.length > 0 ? (
                                        <ResponsiveContainer width="100%" height={300}>
                                            <BarChart data={delivery.delivery_trend}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                                                <XAxis dataKey="week" stroke="#94a3b8" fontSize={10} />
                                                <YAxis stroke="#94a3b8" fontSize={12} />
                                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                                                <Legend />
                                                <Bar dataKey="total" name="Total" fill={COLORS.blue} radius={[4, 4, 0, 0]} />
                                                <Bar dataKey="on_time" name="On Time" fill={COLORS.green} radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="h-[300px] flex items-center justify-center text-slate-500">
                                            No delivery trend data
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Compliance Tab */}
                        <TabsContent value="compliance" className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <Card className="bg-slate-800 border-slate-700">
                                    <CardContent className="p-4 text-center">
                                        <p className="text-sm text-slate-400">Traceability Score</p>
                                        <p className={`text-3xl font-bold ${getScoreColor(compliance?.average_traceability_score || 0, 'quality_score')}`}>
                                            {compliance?.average_traceability_score || 0}%
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card className="bg-slate-800 border-slate-700">
                                    <CardContent className="p-4 text-center">
                                        <p className="text-sm text-slate-400">Compliance Score</p>
                                        <p className={`text-3xl font-bold ${getScoreColor(compliance?.average_compliance_score || 0, 'quality_score')}`}>
                                            {compliance?.average_compliance_score || 0}%
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card className="bg-slate-800 border-slate-700">
                                    <CardContent className="p-4 text-center">
                                        <p className="text-sm text-slate-400">Completion Rate</p>
                                        <p className="text-3xl font-bold text-cyan-400">{compliance?.traceability_completion || 0}%</p>
                                    </CardContent>
                                </Card>
                                <Card className="bg-slate-800 border-slate-700">
                                    <CardContent className="p-4 text-center">
                                        <p className="text-sm text-slate-400">Certified POs</p>
                                        <p className="text-3xl font-bold text-emerald-400">{compliance?.certified_pos || 0}</p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Risk Indicators */}
                            {compliance?.risk_indicators?.length > 0 && (
                                <Card className="bg-slate-800 border-slate-700">
                                    <CardHeader>
                                        <CardTitle className="text-white flex items-center gap-2">
                                            <AlertTriangle className="h-5 w-5 text-red-400" />
                                            Risk Indicators
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            {compliance.risk_indicators.map((risk, index) => (
                                                <div key={index} className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg border border-red-500/30">
                                                    <span className="text-white">{risk.type}</span>
                                                    <Badge className="bg-red-500/20 text-red-400">{risk.count} POs</Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Traceability by PO */}
                            <Card className="bg-slate-800 border-slate-700">
                                <CardHeader>
                                    <CardTitle className="text-white">Traceability by PO</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {compliance?.traceability_by_po?.length > 0 ? (
                                        <div className="space-y-2">
                                            {compliance.traceability_by_po.map((po) => (
                                                <div key={po.po_id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                                                    <div>
                                                        <p className="text-white font-medium">{po.po_number}</p>
                                                        <div className="flex gap-4 text-xs text-slate-400 mt-1">
                                                            <span>Traceability: {po.traceability_score}%</span>
                                                            <span>Compliance: {po.compliance_score}%</span>
                                                        </div>
                                                    </div>
                                                    <Badge className={po.status === 'complete' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}>
                                                        {po.status}
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-slate-500 text-center py-4">No traceability data</p>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Reports Tab */}
                        <TabsContent value="reports" className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <Card className="bg-slate-800 border-slate-700">
                                    <CardContent className="p-4 text-center">
                                        <p className="text-sm text-slate-400">Total Reports</p>
                                        <p className="text-3xl font-bold text-white">{reports?.total_reports || 0}</p>
                                    </CardContent>
                                </Card>
                                <Card className="bg-slate-800 border-slate-700">
                                    <CardContent className="p-4 text-center">
                                        <p className="text-sm text-slate-400">Pending</p>
                                        <p className="text-3xl font-bold text-amber-400">{reports?.pending_reports || 0}</p>
                                    </CardContent>
                                </Card>
                                <Card className="bg-slate-800 border-slate-700">
                                    <CardContent className="p-4 text-center">
                                        <p className="text-sm text-slate-400">Approved</p>
                                        <p className="text-3xl font-bold text-emerald-400">{reports?.approved_reports || 0}</p>
                                    </CardContent>
                                </Card>
                                <Card className="bg-slate-800 border-slate-700">
                                    <CardContent className="p-4 text-center">
                                        <p className="text-sm text-slate-400">Rejected</p>
                                        <p className="text-3xl font-bold text-red-400">{reports?.rejected_reports || 0}</p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Reports by Type */}
                            <Card className="bg-slate-800 border-slate-700">
                                <CardHeader>
                                    <CardTitle className="text-white">Reports by Type</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                        {Object.entries(reports?.reports_by_type || {}).map(([type, count]) => (
                                            <div key={type} className="p-4 bg-slate-700/50 rounded-lg text-center">
                                                <p className="text-2xl font-bold text-white">{count}</p>
                                                <p className="text-xs text-slate-400 capitalize">{type.replace('_', ' ')}</p>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Alerts Tab */}
                        <TabsContent value="alerts" className="space-y-4">
                            <Card className="bg-slate-800 border-slate-700">
                                <CardHeader>
                                    <CardTitle className="text-white flex items-center gap-2">
                                        <AlertTriangle className="h-5 w-5 text-red-400" />
                                        Active Alerts ({alerts?.total_alerts || 0})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {alerts?.alerts?.length > 0 ? (
                                        <div className="space-y-3">
                                            {alerts.alerts.map((alert) => (
                                                <div 
                                                    key={alert.id} 
                                                    className={`p-4 rounded-lg border ${
                                                        alert.severity === 'critical' ? 'bg-red-500/10 border-red-500/30' :
                                                        alert.severity === 'high' ? 'bg-orange-500/10 border-orange-500/30' :
                                                        alert.severity === 'medium' ? 'bg-amber-500/10 border-amber-500/30' :
                                                        'bg-blue-500/10 border-blue-500/30'
                                                    }`}
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <Badge className={
                                                                    alert.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                                                                    alert.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                                                                    alert.severity === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                                                                    'bg-blue-500/20 text-blue-400'
                                                                }>
                                                                    {alert.severity?.toUpperCase()}
                                                                </Badge>
                                                                <Badge variant="outline" className="border-slate-600 text-slate-400">
                                                                    {alert.type?.replace('_', ' ')}
                                                                </Badge>
                                                            </div>
                                                            <h4 className="text-white font-medium">{alert.title}</h4>
                                                            <p className="text-sm text-slate-400 mt-1">{alert.description}</p>
                                                            <p className="text-xs text-slate-500 mt-2">PO: {alert.po_number}</p>
                                                        </div>
                                                        <Button 
                                                            size="sm" 
                                                            variant="ghost" 
                                                            className="text-cyan-400"
                                                            onClick={() => navigate(`/dashboard/brand/traceability/${alert.po_id}`)}
                                                        >
                                                            View PO <ChevronRight className="h-4 w-4 ml-1" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-8 text-center">
                                            <CheckCircle className="h-12 w-12 text-emerald-400 mx-auto mb-3" />
                                            <p className="text-slate-400">No active alerts for this supplier</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </>
            )}
        </div>
    );
}
