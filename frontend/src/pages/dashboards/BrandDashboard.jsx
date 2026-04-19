import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Package, Truck, ClipboardCheck, BarChart3, RefreshCw, Loader2,
    ArrowRight, Shield, Building2, ShoppingCart, Plus, Eye,
    CheckCircle, MapPin, TrendingUp, TrendingDown, AlertTriangle,
    Clock, Activity, Target, Zap, FileText, ArrowUpRight, ArrowDownRight,
    Leaf, Award, GitBranch, BarChart2, Bell, ChevronDown, Palette
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { dashboardAPI, suppliersAPI, purchaseOrdersAPI, seasonsAPI } from '@/lib/api';
import { toast } from 'sonner';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    Area, AreaChart
} from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Static data imports
import brandData from '@/data/brandDashboardData.json';

// ─── colour palette ───────────────────────────────────────────────────────────
const COLORS = {
    primary: '#10B981', secondary: '#6366F1', warning: '#F59E0B',
    danger: '#EF4444', info: '#3B82F6', purple: '#8B5CF6',
    teal: '#14B8A6', pink: '#EC4899'
};
const PIE_COLORS = ['#10B981', '#6366F1', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6'];

// ─── helpers ──────────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-xl">
                <p className="text-slate-300 text-sm font-medium">{label}</p>
                {payload.map((entry, i) => (
                    <p key={i} className="text-sm" style={{ color: entry.color }}>
                        {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

const SeverityBadge = ({ severity }) => {
    const map = {
        Critical: 'bg-red-500/20 text-red-400 border-red-500/40',
        Warning:  'bg-orange-500/20 text-orange-400 border-orange-500/40',
        Info:     'bg-blue-500/20 text-blue-400 border-blue-500/40',
    };
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${map[severity] || map.Info}`}>
            {severity}
        </span>
    );
};

const ProgressBar = ({ value, color }) => {
    const barColor = color === 'green' ? 'bg-emerald-500'
        : color === 'orange' ? 'bg-orange-400'
        : 'bg-red-500';
    return (
        <div className="w-full bg-slate-700 rounded-full h-2.5">
            <div className={`${barColor} h-2.5 rounded-full transition-all duration-700`} style={{ width: `${value}%` }} />
        </div>
    );
};

// ─── KPI Card ─────────────────────────────────────────────────────────────────
const KPICard = ({ title, value, subtitle, icon: Icon, trend, trendValue, color, onClick }) => {
    const isPositive = trend === 'up';
    const TrendIcon = isPositive ? ArrowUpRight : ArrowDownRight;
    return (
        <Card
            className={`bg-gradient-to-br from-slate-800 to-slate-800/50 border-slate-700 hover:border-slate-600 transition-all cursor-pointer group ${onClick ? 'hover:scale-[1.02]' : ''}`}
            onClick={onClick}
        >
            <CardContent className="p-6">
                <div className="flex items-start justify-between">
                    <div className="space-y-2">
                        <p className="text-slate-400 text-sm font-medium uppercase tracking-wide">{title}</p>
                        <p className="text-4xl font-bold text-white">{value}</p>
                        {subtitle && <p className="text-slate-500 text-sm">{subtitle}</p>}
                        {trendValue && (
                            <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                                <TrendIcon className="h-4 w-4" />
                                <span>{trendValue}</span>
                            </div>
                        )}
                    </div>
                    <div className={`p-4 rounded-2xl bg-gradient-to-br ${color} group-hover:scale-110 transition-transform`}>
                        <Icon className="h-7 w-7 text-white" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

// ═════════════════════════════════════════════════════════════════════════════
const BrandDashboard = () => {
    const navigate = useNavigate();

    // Legacy state kept intact
    const [stats, setStats] = useState(null);
    const [suppliers, setSuppliers] = useState([]);
    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [seasons, setSeasons] = useState([]);
    const [selectedSeasonId, setSelectedSeasonId] = useState('all');
    const [filteredPOs, setFilteredPOs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showPODialog, setShowPODialog] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [creatingPO, setCreatingPO] = useState(false);
    const [poForm, setPOForm] = useState({
        product_name: '', quantity: '', unit_price: '',
        delivery_date: '', delivery_address: '', notes: '', season_id: ''
    });

    // New state for tabs & dropdowns
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedSeason, setSelectedSeason] = useState('AW2027');
    const [selectedSupplierDrop, setSelectedSupplierDrop] = useState('All Suppliers');

    const fetchData = async () => {
        try {
            setLoading(true);
            const [dashboardRes, suppliersRes, posRes, seasonsRes] = await Promise.all([
                dashboardAPI.getBrand(),
                suppliersAPI.getAll({ limit: 20 }),
                purchaseOrdersAPI.getAll({ limit: 50 }),
                seasonsAPI.getAll({ limit: 20 })
            ]);
            setStats(dashboardRes.data);
            setSuppliers(suppliersRes.data);
            setPurchaseOrders(posRes.data);
            setFilteredPOs(posRes.data);
            setSeasons(seasonsRes.data);
        } catch {
            // silently use static data if API fails
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    useEffect(() => {
        if (selectedSeasonId === 'all') setFilteredPOs(purchaseOrders);
        else setFilteredPOs(purchaseOrders.filter(po => po.season_id === selectedSeasonId));
    }, [selectedSeasonId, purchaseOrders]);

    const seasonDisplayName = selectedSeasonId === 'all'
        ? 'All Seasons'
        : seasons.find(s => s.id === selectedSeasonId)?.season_code || 'Unknown Season';

    // Chart generators
    const generateProductionData = () =>
        ['Jan','Feb','Mar','Apr','May','Jun'].map((month) => ({
            month,
            planned: Math.floor(Math.random() * 500) + 800,
            actual:  Math.floor(Math.random() * 400) + 700,
        }));

    const generateSupplierPerformance = () =>
        suppliers.slice(0, 6).map(s => ({
            name: s.company_name?.substring(0, 12) || 'Supplier',
            compliance: s.compliance_score || Math.floor(Math.random() * 30) + 70,
            onTime: Math.floor(Math.random() * 25) + 75,
            quality: Math.floor(Math.random() * 20) + 80,
        }));

    const generateOrderDistribution = () => {
        const statusCounts = {};
        purchaseOrders.forEach(po => {
            const status = po.status || 'pending';
            statusCounts[status] = (statusCounts[status] || 0) + 1;
        });
        return Object.entries(statusCounts).map(([name, value]) => ({
            name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), value
        }));
    };

    const productionData     = generateProductionData();
    const supplierPerformance = generateSupplierPerformance();
    const orderDistribution  = generateOrderDistribution();

    const totalOrders       = purchaseOrders.length;
    const completedOrders   = purchaseOrders.filter(p => p.status === 'completed' || p.status === 'delivered').length;
    const productionProgress = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0;
    const delayedOrders     = purchaseOrders.filter(p =>
        p.status === 'delayed' || (p.delivery_date && new Date(p.delivery_date) < new Date() && p.status !== 'completed')
    ).length;
    const avgCompliance     = suppliers.length > 0
        ? Math.round(suppliers.reduce((acc, s) => acc + (s.compliance_score || 80), 0) / suppliers.length)
        : 85;

    const getStatusColor = (status) => {
        const colors = {
            awaiting_acceptance: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
            accepted:            'bg-blue-500/10 text-blue-400 border-blue-500/30',
            in_production:       'bg-purple-500/10 text-purple-400 border-purple-500/30',
            shipped:             'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
            delivered:           'bg-green-500/10 text-green-400 border-green-500/30',
            completed:           'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
            rejected:            'bg-red-500/10 text-red-400 border-red-500/30',
        };
        return colors[status] || 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    };

    const getRiskColor = (risk) => {
        const colors = {
            low:      'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
            medium:   'bg-amber-500/10 text-amber-400 border-amber-500/30',
            high:     'bg-orange-500/10 text-orange-400 border-orange-500/30',
            critical: 'bg-red-500/10 text-red-400 border-red-500/30',
        };
        return colors[risk] || colors.medium;
    };

    const handleCreatePO = async () => {
        if (!selectedSupplier || !poForm.product_name || !poForm.quantity || !poForm.unit_price || !poForm.delivery_date || !poForm.delivery_address) {
            toast.error('Please fill in all required fields');
            return;
        }
        setCreatingPO(true);
        try {
            await purchaseOrdersAPI.create({
                supplier_id: selectedSupplier.id,
                season_id: poForm.season_id || null,
                line_items: [{ product_name: poForm.product_name, quantity: parseFloat(poForm.quantity), unit: 'pcs', unit_price: parseFloat(poForm.unit_price) }],
                delivery_date: new Date(poForm.delivery_date).toISOString(),
                delivery_address: poForm.delivery_address,
                notes: poForm.notes,
                priority: 'normal'
            });
            toast.success('Purchase order created successfully');
            setShowPODialog(false);
            setSelectedSupplier(null);
            setPOForm({ product_name: '', quantity: '', unit_price: '', delivery_date: '', delivery_address: '', notes: '', season_id: '' });
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to create purchase order');
        } finally {
            setCreatingPO(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-emerald-400 mx-auto mb-4" />
                    <p className="text-slate-400">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    // ── tabs ─────────────────────────────────────────────────────────────────
    const tabs = [
        { id: 'overview',      label: 'Overview',      icon: BarChart2 },
        { id: 'supply-chain',  label: 'Supply Chain',  icon: Truck },
    ];

    return (
        <div className="space-y-6 pb-8" data-testid="brand-dashboard">

            {/* ── Header ─────────────────────────────────────────────────── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">TCH Brand Portal</h1>
                    <p className="text-slate-400 mt-1">Season AW2027 — Sustainability & Supply Chain Dashboard</p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                    {/* Season selector */}
                    <Select value={selectedSeason} onValueChange={setSelectedSeason}>
                        <SelectTrigger className="w-[140px] bg-slate-800 border-slate-600 text-white">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                            {brandData.seasons.map(s => (
                                <SelectItem key={s} value={s} className="text-white hover:bg-slate-700">{s}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Supplier dropdown — gold/amber */}
                    <Select value={selectedSupplierDrop} onValueChange={setSelectedSupplierDrop}>
                        <SelectTrigger className="w-[170px] bg-amber-600/20 border-amber-500/50 text-amber-300">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                            <SelectItem value="All Suppliers" className="text-white">All Suppliers</SelectItem>
                            {brandData.suppliers.map(s => (
                                <SelectItem key={s} value={s} className="text-white hover:bg-slate-700">{s}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <div className="flex items-center gap-2 px-3 py-2 bg-slate-800 rounded-lg border border-slate-700">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-sm text-slate-300">Live</span>
                    </div>
                    <Button variant="outline" onClick={fetchData} className="border-slate-600 text-slate-300 hover:bg-slate-700">
                        <RefreshCw className="h-4 w-4 mr-2" />Refresh
                    </Button>
                </div>
            </div>

            {/* ── Tab bar ────────────────────────────────────────────────── */}
            <div className="flex gap-1 bg-slate-800/50 p-1 rounded-xl border border-slate-700 w-fit">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                            activeTab === tab.id
                                ? 'bg-teal-600 text-white shadow-lg'
                                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                        }`}
                    >
                        <tab.icon className="h-4 w-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ══════════════════════════════════════════════════════════════
                TAB 1 — OVERVIEW
            ══════════════════════════════════════════════════════════════ */}
            {activeTab === 'overview' && (
                <div className="space-y-6">

                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <KPICard
                            title="Sustainability Score"
                            value={`${brandData.kpis.sustainabilityScore.value}/100`}
                            subtitle={brandData.kpis.sustainabilityScore.trend}
                            icon={Leaf}
                            trend="up" trendValue="+4 pts"
                            color="from-teal-500 to-teal-600"
                        />
                        <KPICard
                            title="Active Suppliers"
                            value={brandData.kpis.activeSuppliers.value}
                            subtitle={brandData.kpis.activeSuppliers.trend}
                            icon={Building2}
                            trend="up" trendValue="+6 new"
                            color="from-blue-500 to-blue-600"
                        />
                        <KPICard
                            title="Certified Materials"
                            value={`${brandData.kpis.certifiedMaterials.value}%`}
                            subtitle={brandData.kpis.certifiedMaterials.trend}
                            icon={Award}
                            trend="up" trendValue="+3%"
                            color="from-emerald-500 to-emerald-600"
                        />
                        <Card className="bg-gradient-to-br from-slate-800 to-slate-800/50 border-slate-700 hover:border-slate-600 transition-all">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-2">
                                        <p className="text-slate-400 text-sm font-medium uppercase tracking-wide">Open Alerts</p>
                                        <p className="text-4xl font-bold text-white">{brandData.kpis.openAlerts.total}</p>
                                        <div className="flex gap-2 flex-wrap">
                                            <span className="px-2 py-0.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded text-xs font-semibold">
                                                {brandData.kpis.openAlerts.critical} Critical
                                            </span>
                                            <span className="px-2 py-0.5 bg-slate-600/50 text-slate-300 border border-slate-600 rounded text-xs font-semibold">
                                                {brandData.kpis.openAlerts.low} Low
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-gradient-to-br from-red-500 to-red-600">
                                        <Bell className="h-7 w-7 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sustainability Snapshot + Quick Alerts */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Sustainability Snapshot */}
                        <Card className="lg:col-span-2 bg-slate-800/50 border-slate-700">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <Leaf className="h-5 w-5 text-teal-400" />
                                    Sustainability Snapshot — {selectedSeason}
                                </CardTitle>
                                <CardDescription className="text-slate-400">
                                    Score breakdown across 4 sustainability categories
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                {brandData.sustainabilitySnapshot.map((item) => (
                                    <div key={item.category}>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-sm font-medium text-slate-200">{item.category}</span>
                                            <div className="flex items-center gap-3">
                                                <span className={`text-sm font-bold ${
                                                    item.color === 'green' ? 'text-emerald-400'
                                                    : item.color === 'orange' ? 'text-orange-400'
                                                    : 'text-red-400'}`}>
                                                    {item.value}%
                                                </span>
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                                    item.color === 'green' ? 'bg-emerald-500/10 text-emerald-400'
                                                    : item.color === 'orange' ? 'bg-orange-500/10 text-orange-400'
                                                    : 'bg-red-500/10 text-red-400'}`}>
                                                    {item.status}
                                                </span>
                                            </div>
                                        </div>
                                        <ProgressBar value={item.value} color={item.color} />
                                    </div>
                                ))}

                                {/* Quick nav buttons */}
                                <div className="grid grid-cols-2 gap-3 pt-2">
                                    <Button
                                        variant="outline"
                                        className="border-teal-600/40 text-teal-400 hover:bg-teal-600/10 text-sm"
                                        onClick={() => navigate('/dashboard/brand/sustainability')}
                                    >
                                        Sustainability Module <ArrowRight className="h-4 w-4 ml-1" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="border-emerald-600/40 text-emerald-400 hover:bg-emerald-600/10 text-sm"
                                        onClick={() => navigate('/dashboard/brand/certifications')}
                                    >
                                        Certification Tracker <ArrowRight className="h-4 w-4 ml-1" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Alerts */}
                        <Card className="bg-slate-800/50 border-slate-700">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <Bell className="h-5 w-5 text-red-400" />
                                    Quick Alerts
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 max-h-80 overflow-y-auto">
                                {brandData.quickAlerts.map(alert => (
                                    <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg bg-slate-900/50 border border-slate-700">
                                        <SeverityBadge severity={alert.severity} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-slate-300 leading-relaxed">{alert.message}</p>
                                            <p className="text-xs text-slate-500 mt-1">{alert.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Quick action nav row */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {[
                            { label: 'Supplier Trace', icon: GitBranch, color: 'text-teal-400 border-teal-600/40 hover:bg-teal-600/10', path: '/dashboard/brand/supplier-trace' },
                            { label: 'Season Benchmark', icon: BarChart3, color: 'text-purple-400 border-purple-600/40 hover:bg-purple-600/10', path: '/dashboard/brand/season-benchmark' },
                            { label: 'Roles & Flow', icon: Shield, color: 'text-blue-400 border-blue-600/40 hover:bg-blue-600/10', path: '/dashboard/brand/roles-flow' },
                            { label: 'Mood Board', icon: Palette, color: 'text-amber-400 border-amber-600/40 hover:bg-amber-600/10', path: '/dashboard/brand/seasons/mood-board' },
                            { label: 'PO Tracker', icon: Truck, color: 'text-orange-400 border-orange-600/40 hover:bg-orange-600/10', path: '/dashboard/brand/po-tracker' },
                        ].map(({ label, icon: Icon, color, path }) => (
                            <Button key={label} variant="outline"
                                className={`h-auto py-4 flex-col border-slate-700 text-slate-300 hover:bg-slate-800 ${color}`}
                                onClick={() => navigate(path)}>
                                <Icon className="h-6 w-6 mb-2" />
                                <span className="text-xs font-medium">{label}</span>
                            </Button>
                        ))}
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════════
                TAB 2 — SUPPLY CHAIN (original content preserved)
            ══════════════════════════════════════════════════════════════ */}
            {activeTab === 'supply-chain' && (
                <div className="space-y-6">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Supply Chain Command Center</h2>
                        <p className="text-slate-400 mt-1">Real-time visibility across your entire supply chain</p>
                    </div>

                    {/* Legacy KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <KPICard title="Total Orders" value={totalOrders} subtitle={`${completedOrders} completed`}
                            icon={ShoppingCart} trend="up" trendValue="+12%" color="from-blue-500 to-blue-600" />
                        <KPICard title="Production Progress" value={`${productionProgress}%`} subtitle="Overall completion rate"
                            icon={Activity} trend="up" trendValue="+5%" color="from-emerald-500 to-emerald-600" />
                        <KPICard title="Delayed Orders" value={delayedOrders} subtitle={delayedOrders > 0 ? 'Needs attention' : 'All on track'}
                            icon={AlertTriangle} trend={delayedOrders > 0 ? 'down' : 'up'} trendValue={delayedOrders > 0 ? `${delayedOrders} pending` : '0 delays'}
                            color={delayedOrders > 0 ? 'from-red-500 to-red-600' : 'from-emerald-500 to-emerald-600'} />
                        <KPICard title="Compliance Status" value={`${avgCompliance}%`} subtitle={avgCompliance >= 80 ? 'Compliant' : 'Review needed'}
                            icon={Shield} trend={avgCompliance >= 80 ? 'up' : 'down'} trendValue={avgCompliance >= 80 ? 'Good standing' : 'Below target'}
                            color={avgCompliance >= 80 ? 'from-emerald-500 to-teal-600' : 'from-amber-500 to-orange-600'} />
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card className="bg-slate-800/50 border-slate-700">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <Activity className="h-5 w-5 text-emerald-400" />Production Progress
                                </CardTitle>
                                <CardDescription className="text-slate-400">Planned vs Actual production over time</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={280}>
                                    <AreaChart data={productionData}>
                                        <defs>
                                            <linearGradient id="colorPlanned" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                                            </linearGradient>
                                            <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={COLORS.secondary} stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor={COLORS.secondary} stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                        <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                                        <YAxis stroke="#64748b" fontSize={12} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend />
                                        <Area type="monotone" dataKey="planned" stroke={COLORS.primary} fillOpacity={1} fill="url(#colorPlanned)" name="Planned" />
                                        <Area type="monotone" dataKey="actual" stroke={COLORS.secondary} fillOpacity={1} fill="url(#colorActual)" name="Actual" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card className="bg-slate-800/50 border-slate-700">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <BarChart3 className="h-5 w-5 text-blue-400" />Supplier Performance
                                </CardTitle>
                                <CardDescription className="text-slate-400">Compliance, on-time delivery, and quality scores</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={280}>
                                    <BarChart data={supplierPerformance} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                        <XAxis type="number" domain={[0, 100]} stroke="#64748b" fontSize={12} />
                                        <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={11} width={80} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend />
                                        <Bar dataKey="compliance" fill={COLORS.primary} name="Compliance" radius={[0, 4, 4, 0]} />
                                        <Bar dataKey="onTime" fill={COLORS.info} name="On-Time" radius={[0, 4, 4, 0]} />
                                        <Bar dataKey="quality" fill={COLORS.purple} name="Quality" radius={[0, 4, 4, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Order Distribution + Supplier Directory */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <Card className="bg-slate-800/50 border-slate-700">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <Target className="h-5 w-5 text-purple-400" />Order Distribution
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={220}>
                                    <PieChart>
                                        <Pie data={orderDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                                            paddingAngle={5} dataKey="value"
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            labelLine={false}>
                                            {orderDistribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card className="bg-slate-800/50 border-slate-700 lg:col-span-2">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-white flex items-center gap-2">
                                        <Building2 className="h-5 w-5 text-teal-400" />Supplier Directory
                                    </CardTitle>
                                    <CardDescription className="text-slate-400">Click to create purchase order</CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {suppliers.length === 0 ? (
                                    <div className="text-center py-8 text-slate-500">
                                        <Building2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                        <p>No suppliers available</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {suppliers.slice(0, 4).map((supplier) => (
                                            <div key={supplier.id}
                                                className="flex items-center justify-between p-4 rounded-xl bg-slate-900/50 border border-slate-700 hover:border-emerald-500/50 transition-all cursor-pointer group"
                                                onClick={() => { setSelectedSupplier(supplier); setShowPODialog(true); }}
                                                data-testid={`supplier-${supplier.id}`}>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <p className="text-white font-medium">{supplier.company_name}</p>
                                                        <Badge variant="outline" className={getRiskColor(supplier.risk_category)}>
                                                            {supplier.risk_category}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-sm text-slate-400">
                                                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{supplier.country}</span>
                                                        <span className="flex items-center gap-1"><CheckCircle className="h-3 w-3 text-emerald-400" />{supplier.compliance_score?.toFixed(0) || 85}%</span>
                                                    </div>
                                                </div>
                                                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recent POs */}
                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <ShoppingCart className="h-5 w-5 text-purple-400" />
                                    {selectedSeasonId === 'all' ? 'Recent Purchase Orders' : `${seasonDisplayName} — Recent Purchase Orders`}
                                </CardTitle>
                                <CardDescription className="text-slate-400">
                                    {selectedSeasonId === 'all' ? 'Click to view full traceability' : `Showing ${filteredPOs.length} POs for ${seasonDisplayName}`}
                                </CardDescription>
                            </div>
                            <div className="flex items-center gap-3">
                                <Select value={selectedSeasonId} onValueChange={setSelectedSeasonId}>
                                    <SelectTrigger className="w-[180px] bg-slate-900 border-slate-600 text-white" data-testid="season-selector">
                                        <SelectValue placeholder="Select Season" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-800 border-slate-700">
                                        <SelectItem value="all" className="text-white hover:bg-slate-700">All Seasons</SelectItem>
                                        {seasons.map((season) => (
                                            <SelectItem key={season.id} value={season.id} className="text-white hover:bg-slate-700">
                                                {season.season_code} - {season.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {filteredPOs.length === 0 ? (
                                <div className="text-center py-8 text-slate-500">
                                    <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                    <p>No purchase orders {selectedSeasonId !== 'all' ? `for ${seasonDisplayName}` : 'found'}</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-slate-700 bg-slate-900/50">
                                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-300">PO Number</th>
                                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-300">Season</th>
                                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-300">Supplier</th>
                                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-300">Status</th>
                                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-300">Progress</th>
                                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-300">Value</th>
                                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-300">Delivery</th>
                                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-300">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredPOs.slice(0, 5).map((po) => {
                                                const progressMap = { awaiting_acceptance: 10, accepted: 25, in_production: 50, shipped: 75, delivered: 90, completed: 100 };
                                                const progress = progressMap[po.status] || 0;
                                                return (
                                                    <tr key={po.id} className="border-b border-slate-700/50 hover:bg-slate-800/50 cursor-pointer" data-testid={`po-row-${po.id}`}>
                                                        <td className="py-3 px-4"><span className="font-medium text-white">{po.po_number}</span></td>
                                                        <td className="py-3 px-4">
                                                            {po.season_code
                                                                ? <Badge variant="outline" className="border-purple-500/30 text-purple-400 bg-purple-500/10">{po.season_code}</Badge>
                                                                : <span className="text-slate-500">-</span>}
                                                        </td>
                                                        <td className="py-3 px-4 text-slate-300">{po.supplier_name}</td>
                                                        <td className="py-3 px-4">
                                                            <Badge variant="outline" className={getStatusColor(po.status)}>{po.status?.replace(/_/g, ' ')}</Badge>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <div className="flex items-center gap-2">
                                                                <Progress value={progress} className="w-20 h-2" />
                                                                <span className="text-slate-400 text-sm">{progress}%</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-4 text-slate-300">${po.total_amount?.toLocaleString()}</td>
                                                        <td className="py-3 px-4 text-slate-300">
                                                            {po.delivery_date ? new Date(po.delivery_date).toLocaleDateString() : '-'}
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <div className="flex items-center gap-2">
                                                                <Button variant="ghost" size="sm"
                                                                    className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                                                                    onClick={() => navigate(`/dashboard/brand/traceability/${po.id}`)}>
                                                                    <Eye className="h-4 w-4 mr-1" />Track
                                                                </Button>
                                                                <Button variant="ghost" size="sm"
                                                                    className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                                                                    onClick={() => navigate(`/dashboard/brand/po/${po.id}/reports`)}>
                                                                    <FileText className="h-4 w-4 mr-1" />Reports
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: 'View Traceability', sub: 'End-to-end tracking', icon: Package, color: 'hover:border-emerald-500/50', iconColor: 'text-emerald-400', path: '/dashboard/brand/traceability' },
                            { label: 'Request Audit', sub: 'Quality assurance', icon: ClipboardCheck, color: 'hover:border-purple-500/50', iconColor: 'text-purple-400', path: '/dashboard/brand/audits' },
                            { label: 'Analytics', sub: 'Insights & reports', icon: BarChart3, color: 'hover:border-blue-500/50', iconColor: 'text-blue-400', path: '/dashboard/brand/reports' },
                            { label: 'Compliance', sub: 'Certifications & docs', icon: FileText, color: 'hover:border-amber-500/50', iconColor: 'text-amber-400', path: '/dashboard/brand/compliance' },
                        ].map(({ label, sub, icon: Icon, color, iconColor, path }) => (
                            <Button key={label} variant="outline"
                                className={`h-auto py-6 flex-col border-slate-700 text-slate-300 hover:bg-slate-800 ${color}`}
                                onClick={() => navigate(path)}>
                                <Icon className={`h-8 w-8 mb-3 ${iconColor}`} />
                                <span className="font-medium">{label}</span>
                                <span className="text-xs text-slate-500 mt-1">{sub}</span>
                            </Button>
                        ))}
                    </div>
                </div>
            )}

            {/* Create PO Dialog — preserved */}
            <Dialog open={showPODialog} onOpenChange={setShowPODialog}>
                <DialogContent className="bg-slate-800 border-slate-700 max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="text-white">Create Purchase Order</DialogTitle>
                        <DialogDescription className="text-slate-400">
                            {selectedSupplier && `Creating PO for ${selectedSupplier.company_name}`}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label className="text-slate-300">Product Name *</Label>
                            <Input placeholder="e.g., Organic Cotton Fabric"
                                value={poForm.product_name}
                                onChange={(e) => setPOForm(prev => ({ ...prev, product_name: e.target.value }))}
                                className="bg-slate-900/50 border-slate-600 text-white" data-testid="po-product-name" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-slate-300">Quantity *</Label>
                                <Input type="number" placeholder="1000"
                                    value={poForm.quantity}
                                    onChange={(e) => setPOForm(prev => ({ ...prev, quantity: e.target.value }))}
                                    className="bg-slate-900/50 border-slate-600 text-white" data-testid="po-quantity" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-300">Unit Price ($) *</Label>
                                <Input type="number" step="0.01" placeholder="10.00"
                                    value={poForm.unit_price}
                                    onChange={(e) => setPOForm(prev => ({ ...prev, unit_price: e.target.value }))}
                                    className="bg-slate-900/50 border-slate-600 text-white" data-testid="po-unit-price" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-300">Delivery Date *</Label>
                            <Input type="date" value={poForm.delivery_date}
                                onChange={(e) => setPOForm(prev => ({ ...prev, delivery_date: e.target.value }))}
                                className="bg-slate-900/50 border-slate-600 text-white" data-testid="po-delivery-date" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-300">Delivery Address *</Label>
                            <Textarea placeholder="Enter delivery address"
                                value={poForm.delivery_address}
                                onChange={(e) => setPOForm(prev => ({ ...prev, delivery_address: e.target.value }))}
                                className="bg-slate-900/50 border-slate-600 text-white" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowPODialog(false)} className="border-slate-600 text-slate-300">Cancel</Button>
                        <Button onClick={handleCreatePO} disabled={creatingPO} className="bg-emerald-600 hover:bg-emerald-700">
                            {creatingPO ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</> : 'Create PO'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default BrandDashboard;
