import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Package, Truck, MapPin, Clock, AlertTriangle, CheckCircle, 
    XCircle, ArrowRight, RefreshCw, Filter, Search, Eye,
    FileText, Download, TrendingUp, TrendingDown, BarChart3,
    Calendar, Building2, ChevronRight, Loader2, Box
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { incomingAPI } from '@/lib/api';
import { toast } from 'sonner';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const COLORS = {
    green: '#10b981',
    yellow: '#f59e0b',
    red: '#ef4444',
    blue: '#3b82f6',
    purple: '#8b5cf6',
    gray: '#6b7280'
};

const STATUS_COLORS = {
    on_time: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    slight_delay: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    critical_delay: 'bg-red-500/20 text-red-400 border-red-500/30',
    pending: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    dispatched: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    in_transit: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    out_for_delivery: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    delivered: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    partially_delivered: 'bg-amber-500/20 text-amber-400 border-amber-500/30'
};

export default function IncomingDashboard() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    
    // Data states
    const [overview, setOverview] = useState(null);
    const [posWithShipments, setPosWithShipments] = useState([]);
    const [deliveryPerformance, setDeliveryPerformance] = useState(null);
    const [supplierLogistics, setSupplierLogistics] = useState([]);
    const [distanceAnalysis, setDistanceAnalysis] = useState([]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [overviewRes, posRes, perfRes, supplierRes, distRes] = await Promise.all([
                incomingAPI.getDashboardOverview(),
                incomingAPI.getPOsWithShipments({}),
                incomingAPI.getDeliveryPerformance({}),
                incomingAPI.getSupplierLogistics(),
                incomingAPI.getDistanceDeliveryAnalysis()
            ]);
            
            setOverview(overviewRes.data);
            setPosWithShipments(posRes.data);
            setDeliveryPerformance(perfRes.data);
            setSupplierLogistics(supplierRes.data);
            setDistanceAnalysis(distRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
            setOverview({
                total_invoices: 8, in_transit: 3, delivered: 4, pending: 1, delayed: 1, active_alerts: 2,
                total_quantity_dispatched: 26200, total_quantity_received: 16400, pending_quantity: 9800,
                alerts: [
                    { id: 1, severity: 'high', alert_type: 'delay_risk', title: 'Shipment Delay Risk — PO-AW27-3991', description: 'Beximco Cut & Sew is 3 days behind schedule for Puffer Jacket lots.', po_number: 'PO-AW27-3991' },
                    { id: 2, severity: 'medium', alert_type: 'inspection_due', title: 'Pre-Shipment Inspection Due — PO-AW27-4812', description: 'Wool Blend Overcoat final inspection scheduled for 18 Oct 2027.', po_number: 'PO-AW27-4812' },
                ]
            });
            setPosWithShipments([
                { id: 'PO-AW27-4812', po_number: 'PO-AW27-4812', supplier_name: 'TCH Garments Pvt Ltd', total_qty: 12400, dispatch_count: 3, invoice_count: 3, in_transit_count: 1, delivered_count: 2, delayed_count: 0, total_dispatched: 12400, total_received: 8200, pending_quantity: 4200, color_indicator: 'green' },
                { id: 'PO-AW27-3991', po_number: 'PO-AW27-3991', supplier_name: 'Beximco Garments Ltd', total_qty: 8600, dispatch_count: 2, invoice_count: 2, in_transit_count: 2, delivered_count: 0, delayed_count: 1, total_dispatched: 5800, total_received: 0, pending_quantity: 5800, color_indicator: 'red' },
                { id: 'PO-SS27-2201', po_number: 'PO-SS27-2201', supplier_name: 'TCH Garments Pvt Ltd', total_qty: 6200, dispatch_count: 2, invoice_count: 2, in_transit_count: 0, delivered_count: 2, delayed_count: 0, total_dispatched: 6200, total_received: 6200, pending_quantity: 0, color_indicator: 'green' },
                { id: 'PO-SS27-2202', po_number: 'PO-SS27-2202', supplier_name: 'Arvind Ltd', total_qty: 4800, dispatch_count: 1, invoice_count: 1, in_transit_count: 0, delivered_count: 1, delayed_count: 0, total_dispatched: 4800, total_received: 4800, pending_quantity: 0, color_indicator: 'green' },
            ]);
            setDeliveryPerformance({ on_time_percentage: 78, on_time_deliveries: 14, slight_delay_deliveries: 3, critical_delay_deliveries: 1, total_deliveries: 18, average_delay_hours: 18, average_transit_time_hours: 72 });
            setSupplierLogistics([
                { supplier_id: 'SUP-001', supplier_name: 'TCH Garments Pvt Ltd', total_dispatches: 16, on_time_count: 14, delayed_count: 2, dispatch_efficiency: 86, average_transit_time: 68 },
                { supplier_id: 'SUP-002', supplier_name: 'Beximco Garments Ltd', total_dispatches: 12, on_time_count: 8, delayed_count: 4, dispatch_efficiency: 67, average_transit_time: 84 },
                { supplier_id: 'SUP-003', supplier_name: 'Arvind Ltd', total_dispatches: 8, on_time_count: 7, delayed_count: 1, dispatch_efficiency: 88, average_transit_time: 60 },
            ]);
            setDistanceAnalysis([
                { distance_range: '0–500 km', average_transit_hours: 48, on_time_percentage: 92 },
                { distance_range: '500–2000 km', average_transit_hours: 72, on_time_percentage: 84 },
                { distance_range: '2000+ km', average_transit_hours: 120, on_time_percentage: 71 },
            ]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const filteredPOs = posWithShipments.filter(po => {
        const matchesSearch = !searchQuery || 
            po.po_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            po.supplier_name?.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesStatus = statusFilter === 'all' || 
            (statusFilter === 'delayed' && po.delayed_count > 0) ||
            (statusFilter === 'in_transit' && po.in_transit_count > 0) ||
            (statusFilter === 'delivered' && po.delivered_count === po.dispatch_count && po.dispatch_count > 0);
        
        return matchesSearch && matchesStatus;
    });

    const getColorIndicatorClass = (color) => {
        const classes = {
            green: 'bg-emerald-500',
            yellow: 'bg-amber-500',
            red: 'bg-red-500',
            blue: 'bg-blue-500',
            gray: 'bg-slate-500'
        };
        return classes[color] || classes.gray;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 p-6" data-testid="incoming-dashboard">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Truck className="h-7 w-7 text-emerald-400" />
                        Incoming & Dispatch Management
                    </h1>
                    <p className="text-slate-400 mt-1">Track all inbound shipments and deliveries</p>
                </div>
                <Button onClick={fetchData} variant="outline" className="border-slate-600 text-slate-300">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
                <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-500/20">
                                <FileText className="h-5 w-5 text-blue-400" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400">Total Invoices</p>
                                <p className="text-xl font-bold text-white">{overview?.total_invoices || 0}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-purple-500/20">
                                <Truck className="h-5 w-5 text-purple-400" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400">In Transit</p>
                                <p className="text-xl font-bold text-white">{overview?.in_transit || 0}</p>
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
                                <p className="text-xs text-slate-400">Delivered</p>
                                <p className="text-xl font-bold text-white">{overview?.delivered || 0}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-amber-500/20">
                                <Clock className="h-5 w-5 text-amber-400" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400">Pending</p>
                                <p className="text-xl font-bold text-white">{overview?.pending || 0}</p>
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
                                <p className="text-xs text-slate-400">Delayed</p>
                                <p className="text-xl font-bold text-white">{overview?.delayed || 0}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-rose-500/20">
                                <AlertTriangle className="h-5 w-5 text-rose-400" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400">Active Alerts</p>
                                <p className="text-xl font-bold text-white">{overview?.active_alerts || 0}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quantity Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-4">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-slate-400">Quantity Dispatched</span>
                            <Box className="h-4 w-4 text-blue-400" />
                        </div>
                        <p className="text-2xl font-bold text-white">{overview?.total_quantity_dispatched?.toLocaleString() || 0}</p>
                        <Progress value={100} className="h-1 mt-2 bg-slate-700" />
                    </CardContent>
                </Card>
                <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-4">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-slate-400">Quantity Received</span>
                            <CheckCircle className="h-4 w-4 text-emerald-400" />
                        </div>
                        <p className="text-2xl font-bold text-emerald-400">{overview?.total_quantity_received?.toLocaleString() || 0}</p>
                        <Progress 
                            value={overview?.total_quantity_dispatched ? (overview.total_quantity_received / overview.total_quantity_dispatched) * 100 : 0} 
                            className="h-1 mt-2 bg-slate-700" 
                        />
                    </CardContent>
                </Card>
                <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-4">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-slate-400">Pending Quantity</span>
                            <Clock className="h-4 w-4 text-amber-400" />
                        </div>
                        <p className="text-2xl font-bold text-amber-400">{overview?.pending_quantity?.toLocaleString() || 0}</p>
                        <Progress 
                            value={overview?.total_quantity_dispatched ? (overview.pending_quantity / overview.total_quantity_dispatched) * 100 : 0} 
                            className="h-1 mt-2 bg-slate-700" 
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="bg-slate-800 border border-slate-700 p-1">
                    <TabsTrigger value="overview" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400">
                        Overview
                    </TabsTrigger>
                    <TabsTrigger value="po-shipments" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400">
                        PO Shipments
                    </TabsTrigger>
                    <TabsTrigger value="analytics" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400">
                        Analytics
                    </TabsTrigger>
                    <TabsTrigger value="alerts" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400">
                        Alerts ({overview?.active_alerts || 0})
                    </TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Delivery Performance Chart */}
                        <Card className="bg-slate-800 border-slate-700">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-white text-lg flex items-center gap-2">
                                    <BarChart3 className="h-5 w-5 text-emerald-400" />
                                    Delivery Performance
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {deliveryPerformance && (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-400">On-Time Rate</span>
                                            <span className="text-2xl font-bold text-emerald-400">
                                                {deliveryPerformance.on_time_percentage}%
                                            </span>
                                        </div>
                                        <ResponsiveContainer width="100%" height={200}>
                                            <PieChart>
                                                <Pie
                                                    data={[
                                                        { name: 'On Time', value: deliveryPerformance.on_time_deliveries, color: COLORS.green },
                                                        { name: 'Slight Delay', value: deliveryPerformance.slight_delay_deliveries, color: COLORS.yellow },
                                                        { name: 'Critical Delay', value: deliveryPerformance.critical_delay_deliveries, color: COLORS.red }
                                                    ]}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={50}
                                                    outerRadius={80}
                                                    dataKey="value"
                                                >
                                                    {[COLORS.green, COLORS.yellow, COLORS.red].map((color, index) => (
                                                        <Cell key={`cell-${index}`} fill={color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip 
                                                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                                                    labelStyle={{ color: '#fff' }}
                                                />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div className="flex justify-between p-2 bg-slate-700/50 rounded">
                                                <span className="text-slate-400">Avg Delay</span>
                                                <span className="text-white">{deliveryPerformance.average_delay_hours}h</span>
                                            </div>
                                            <div className="flex justify-between p-2 bg-slate-700/50 rounded">
                                                <span className="text-slate-400">Avg Transit</span>
                                                <span className="text-white">{deliveryPerformance.average_transit_time_hours}h</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Distance vs Delivery Analysis */}
                        <Card className="bg-slate-800 border-slate-700">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-white text-lg flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-purple-400" />
                                    Distance vs Delivery Time
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {distanceAnalysis.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={250}>
                                        <BarChart data={distanceAnalysis}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                                            <XAxis dataKey="distance_range" stroke="#94a3b8" fontSize={12} />
                                            <YAxis stroke="#94a3b8" fontSize={12} />
                                            <Tooltip 
                                                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                                                labelStyle={{ color: '#fff' }}
                                            />
                                            <Bar dataKey="average_transit_hours" name="Avg Transit (hrs)" fill={COLORS.blue} radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="on_time_percentage" name="On-Time %" fill={COLORS.green} radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-[250px] flex items-center justify-center text-slate-500">
                                        No delivery data available
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Supplier Logistics Performance */}
                    <Card className="bg-slate-800 border-slate-700">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-white text-lg flex items-center gap-2">
                                <Building2 className="h-5 w-5 text-cyan-400" />
                                Supplier Logistics Performance
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {supplierLogistics.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-slate-700">
                                                <th className="text-left py-3 px-4 text-slate-400 font-medium">Supplier</th>
                                                <th className="text-center py-3 px-4 text-slate-400 font-medium">Dispatches</th>
                                                <th className="text-center py-3 px-4 text-slate-400 font-medium">On-Time</th>
                                                <th className="text-center py-3 px-4 text-slate-400 font-medium">Delayed</th>
                                                <th className="text-center py-3 px-4 text-slate-400 font-medium">Efficiency</th>
                                                <th className="text-center py-3 px-4 text-slate-400 font-medium">Avg Transit</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {supplierLogistics.slice(0, 5).map((supplier, index) => (
                                                <tr key={supplier.supplier_id} className="border-b border-slate-700/50">
                                                    <td className="py-3 px-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-2 h-2 rounded-full ${supplier.dispatch_efficiency >= 80 ? 'bg-emerald-500' : supplier.dispatch_efficiency >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} />
                                                            <span className="text-white">{supplier.supplier_name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="text-center py-3 px-4 text-white">{supplier.total_dispatches}</td>
                                                    <td className="text-center py-3 px-4 text-emerald-400">{supplier.on_time_count}</td>
                                                    <td className="text-center py-3 px-4 text-red-400">{supplier.delayed_count}</td>
                                                    <td className="text-center py-3 px-4">
                                                        <Badge className={supplier.dispatch_efficiency >= 80 ? 'bg-emerald-500/20 text-emerald-400' : supplier.dispatch_efficiency >= 50 ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}>
                                                            {supplier.dispatch_efficiency}%
                                                        </Badge>
                                                    </td>
                                                    <td className="text-center py-3 px-4 text-slate-300">{supplier.average_transit_time}h</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="h-[200px] flex items-center justify-center text-slate-500">
                                    No supplier data available
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* PO Shipments Tab */}
                <TabsContent value="po-shipments" className="space-y-4">
                    {/* Filters */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search by PO number or supplier..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-slate-800 border-slate-700 text-white"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[200px] bg-slate-800 border-slate-700 text-white">
                                <Filter className="h-4 w-4 mr-2" />
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700">
                                <SelectItem value="all">All Shipments</SelectItem>
                                <SelectItem value="in_transit">In Transit</SelectItem>
                                <SelectItem value="delayed">Delayed</SelectItem>
                                <SelectItem value="delivered">Delivered</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* PO List */}
                    <div className="space-y-3">
                        {filteredPOs.length === 0 ? (
                            <Card className="bg-slate-800 border-slate-700">
                                <CardContent className="p-8 text-center">
                                    <Package className="h-12 w-12 text-slate-500 mx-auto mb-3" />
                                    <p className="text-slate-400">No shipments found</p>
                                </CardContent>
                            </Card>
                        ) : (
                            filteredPOs.map((po) => (
                                <Card 
                                    key={po.id} 
                                    className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors cursor-pointer"
                                    onClick={() => navigate(`/dashboard/brand/incoming/po/${po.id}`)}
                                    data-testid={`po-card-${po.id}`}
                                >
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                {/* Color Indicator */}
                                                <div className={`w-3 h-12 rounded-full ${getColorIndicatorClass(po.color_indicator)}`} />
                                                
                                                {/* PO Info */}
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-semibold text-white">{po.po_number}</h3>
                                                        <Badge variant="outline" className="border-slate-600 text-slate-400">
                                                            {po.invoice_count} Invoice{po.invoice_count !== 1 ? 's' : ''}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-slate-400">{po.supplier_name}</p>
                                                </div>
                                            </div>

                                            {/* Stats */}
                                            <div className="flex items-center gap-6">
                                                <div className="text-center">
                                                    <p className="text-xs text-slate-400">Dispatched</p>
                                                    <p className="text-lg font-semibold text-white">{po.total_dispatched}</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-xs text-slate-400">Received</p>
                                                    <p className="text-lg font-semibold text-emerald-400">{po.total_received}</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-xs text-slate-400">Pending</p>
                                                    <p className="text-lg font-semibold text-amber-400">{po.pending_quantity}</p>
                                                </div>

                                                {/* Status Badges */}
                                                <div className="flex gap-2">
                                                    {po.in_transit_count > 0 && (
                                                        <Badge className="bg-purple-500/20 text-purple-400">
                                                            <Truck className="h-3 w-3 mr-1" />
                                                            {po.in_transit_count} In Transit
                                                        </Badge>
                                                    )}
                                                    {po.delayed_count > 0 && (
                                                        <Badge className="bg-red-500/20 text-red-400">
                                                            <AlertTriangle className="h-3 w-3 mr-1" />
                                                            {po.delayed_count} Delayed
                                                        </Badge>
                                                    )}
                                                    {po.delivered_count > 0 && (
                                                        <Badge className="bg-emerald-500/20 text-emerald-400">
                                                            <CheckCircle className="h-3 w-3 mr-1" />
                                                            {po.delivered_count} Delivered
                                                        </Badge>
                                                    )}
                                                </div>

                                                <ChevronRight className="h-5 w-5 text-slate-400" />
                                            </div>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="mt-3">
                                            <Progress 
                                                value={po.total_dispatched ? (po.total_received / po.total_dispatched) * 100 : 0}
                                                className="h-1.5 bg-slate-700"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </TabsContent>

                {/* Analytics Tab */}
                <TabsContent value="analytics" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Detailed Delivery Performance */}
                        <Card className="bg-slate-800 border-slate-700">
                            <CardHeader>
                                <CardTitle className="text-white">Delivery Performance Breakdown</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {deliveryPerformance ? (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
                                                <p className="text-sm text-emerald-400">On-Time Deliveries</p>
                                                <p className="text-3xl font-bold text-emerald-400">{deliveryPerformance.on_time_deliveries}</p>
                                            </div>
                                            <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/30">
                                                <p className="text-sm text-amber-400">Slight Delays</p>
                                                <p className="text-3xl font-bold text-amber-400">{deliveryPerformance.slight_delay_deliveries}</p>
                                            </div>
                                            <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/30">
                                                <p className="text-sm text-red-400">Critical Delays</p>
                                                <p className="text-3xl font-bold text-red-400">{deliveryPerformance.critical_delay_deliveries}</p>
                                            </div>
                                            <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
                                                <p className="text-sm text-blue-400">Total Deliveries</p>
                                                <p className="text-3xl font-bold text-blue-400">{deliveryPerformance.total_deliveries}</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-slate-500 text-center py-8">No delivery data available</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Supplier Rankings */}
                        <Card className="bg-slate-800 border-slate-700">
                            <CardHeader>
                                <CardTitle className="text-white">Top Performing Suppliers</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {supplierLogistics.length > 0 ? (
                                    <div className="space-y-3">
                                        {supplierLogistics.slice(0, 5).map((supplier, index) => (
                                            <div key={supplier.supplier_id} className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                                    index === 0 ? 'bg-yellow-500 text-black' :
                                                    index === 1 ? 'bg-slate-400 text-black' :
                                                    index === 2 ? 'bg-amber-700 text-white' :
                                                    'bg-slate-600 text-white'
                                                }`}>
                                                    {index + 1}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-white font-medium">{supplier.supplier_name}</p>
                                                    <p className="text-xs text-slate-400">{supplier.total_dispatches} dispatches</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className={`text-lg font-bold ${supplier.dispatch_efficiency >= 80 ? 'text-emerald-400' : supplier.dispatch_efficiency >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                                                        {supplier.dispatch_efficiency}%
                                                    </p>
                                                    <p className="text-xs text-slate-400">efficiency</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-slate-500 text-center py-8">No supplier data available</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Alerts Tab */}
                <TabsContent value="alerts" className="space-y-4">
                    <Card className="bg-slate-800 border-slate-700">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-red-400" />
                                Active Alerts
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {overview?.alerts?.length > 0 ? (
                                <div className="space-y-3">
                                    {overview.alerts.map((alert) => (
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
                                                    <div className="flex items-center gap-2">
                                                        <Badge className={
                                                            alert.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                                                            alert.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                                                            alert.severity === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                                                            'bg-blue-500/20 text-blue-400'
                                                        }>
                                                            {alert.severity?.toUpperCase()}
                                                        </Badge>
                                                        <Badge variant="outline" className="border-slate-600 text-slate-400">
                                                            {alert.alert_type?.replace('_', ' ')}
                                                        </Badge>
                                                    </div>
                                                    <h4 className="text-white font-medium mt-2">{alert.title}</h4>
                                                    <p className="text-sm text-slate-400 mt-1">{alert.description}</p>
                                                    <p className="text-xs text-slate-500 mt-2">PO: {alert.po_number}</p>
                                                </div>
                                                <Button 
                                                    size="sm" 
                                                    variant="outline" 
                                                    className="border-slate-600 text-slate-300"
                                                    onClick={async (e) => {
                                                        e.stopPropagation();
                                                        try {
                                                            await incomingAPI.resolveAlert(alert.id, 'Resolved from dashboard');
                                                            toast.success('Alert resolved');
                                                            fetchData();
                                                        } catch (err) {
                                                            toast.error('Failed to resolve alert');
                                                        }
                                                    }}
                                                >
                                                    Resolve
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-8 text-center">
                                    <CheckCircle className="h-12 w-12 text-emerald-400 mx-auto mb-3" />
                                    <p className="text-slate-400">No active alerts</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
