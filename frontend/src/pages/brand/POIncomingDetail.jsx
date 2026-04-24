import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Package, Truck, MapPin, Clock, AlertTriangle, CheckCircle, 
    XCircle, ArrowLeft, RefreshCw, FileText, Upload, Eye,
    Download, Navigation, Box, Calendar, Building2, Phone,
    User, ChevronDown, ChevronUp, Loader2, Play, ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { incomingAPI } from '@/lib/api';
import { toast } from 'sonner';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons
const createIcon = (color) => new L.DivIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
});

const sourceIcon = createIcon('#3b82f6');
const destIcon = createIcon('#10b981');
const currentIcon = createIcon('#f59e0b');

const STATUS_COLORS = {
    pending: { bg: 'bg-slate-500/20', text: 'text-slate-400', border: 'border-slate-500/30' },
    dispatched: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
    in_transit: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' },
    out_for_delivery: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/30' },
    delivered: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
    partially_delivered: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' },
    delayed: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
    cancelled: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' }
};

const DELIVERY_STATUS_COLORS = {
    on_time: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30', label: 'On Time' },
    slight_delay: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30', label: 'Slight Delay' },
    critical_delay: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30', label: 'Critical Delay' },
    pending: { bg: 'bg-slate-500/20', text: 'text-slate-400', border: 'border-slate-500/30', label: 'Pending' }
};

export default function POIncomingDetail() {
    const { poId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('invoices');
    const [summary, setSummary] = useState(null);
    const [selectedDispatch, setSelectedDispatch] = useState(null);
    const [showTrackingDialog, setShowTrackingDialog] = useState(false);
    const [showReceiveDialog, setShowReceiveDialog] = useState(false);
    const [receiveQuantity, setReceiveQuantity] = useState(0);
    const [expandedInvoices, setExpandedInvoices] = useState({});

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await incomingAPI.getPOSummary(poId);
            setSummary(response.data);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load PO incoming data');
            setSummary({ po_number: poId, overall_delivery_status: 'pending', supplier_name: 'Supplier', total_invoices: 0, total_quantity_ordered: 0, total_quantity_dispatched: 0, total_quantity_received: 0, in_transit_count: 0, delayed_count: 0, invoices: [], dispatches: [] });
        } finally {
            setLoading(false);
        }
    }, [poId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const toggleInvoice = (invoiceId) => {
        setExpandedInvoices(prev => ({
            ...prev,
            [invoiceId]: !prev[invoiceId]
        }));
    };

    const handleSimulateTracking = async (dispatchId) => {
        try {
            const response = await incomingAPI.simulateTracking(dispatchId);
            toast.success(`Tracking updated: ${response.data.new_status}`);
            fetchData();
        } catch (error) {
            toast.error('Failed to simulate tracking');
        }
    };

    const handleReceiveDispatch = async () => {
        if (!selectedDispatch) return;
        try {
            await incomingAPI.receiveDispatch(selectedDispatch.id, { 
                quantity_received: receiveQuantity,
                notes: 'Received via dashboard'
            });
            toast.success('Dispatch received successfully');
            setShowReceiveDialog(false);
            setSelectedDispatch(null);
            fetchData();
        } catch (error) {
            toast.error('Failed to receive dispatch');
        }
    };

    const getDispatchesForInvoice = (invoiceId) => {
        return summary?.dispatches?.filter(d => d.invoice_id === invoiceId) || [];
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDelay = (hours) => {
        if (!hours || hours <= 0) return null;
        if (hours < 24) return `${Math.round(hours)}h delay`;
        return `${Math.round(hours / 24)}d delay`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
            </div>
        );
    }

    if (!summary) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <p className="text-slate-400">PO not found</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 p-6" data-testid="po-incoming-detail">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => navigate('/dashboard/brand/incoming')} className="text-slate-400">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-white">{summary.po_number}</h1>
                            <Badge className={`${DELIVERY_STATUS_COLORS[summary.overall_delivery_status]?.bg} ${DELIVERY_STATUS_COLORS[summary.overall_delivery_status]?.text}`}>
                                {DELIVERY_STATUS_COLORS[summary.overall_delivery_status]?.label}
                            </Badge>
                        </div>
                        <p className="text-slate-400 mt-1">{summary.supplier_name}</p>
                    </div>
                </div>
                <Button onClick={fetchData} variant="outline" className="border-slate-600 text-slate-300">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
                <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-4 text-center">
                        <p className="text-xs text-slate-400">Invoices</p>
                        <p className="text-2xl font-bold text-white">{summary.total_invoices}</p>
                    </CardContent>
                </Card>
                <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-4 text-center">
                        <p className="text-xs text-slate-400">Ordered</p>
                        <p className="text-2xl font-bold text-white">{summary.total_quantity_ordered}</p>
                    </CardContent>
                </Card>
                <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-4 text-center">
                        <p className="text-xs text-slate-400">Dispatched</p>
                        <p className="text-2xl font-bold text-blue-400">{summary.total_quantity_dispatched}</p>
                    </CardContent>
                </Card>
                <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-4 text-center">
                        <p className="text-xs text-slate-400">Received</p>
                        <p className="text-2xl font-bold text-emerald-400">{summary.total_quantity_received}</p>
                    </CardContent>
                </Card>
                <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-4 text-center">
                        <p className="text-xs text-slate-400">In Transit</p>
                        <p className="text-2xl font-bold text-purple-400">{summary.in_transit_count}</p>
                    </CardContent>
                </Card>
                <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-4 text-center">
                        <p className="text-xs text-slate-400">Delayed</p>
                        <p className="text-2xl font-bold text-red-400">{summary.delayed_count}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Progress Bar */}
            <Card className="bg-slate-800 border-slate-700 mb-6">
                <CardContent className="p-4">
                    <div className="flex justify-between text-sm text-slate-400 mb-2">
                        <span>Overall Progress</span>
                        <span>{summary.total_quantity_dispatched ? Math.round((summary.total_quantity_received / summary.total_quantity_dispatched) * 100) : 0}% Received</span>
                    </div>
                    <Progress 
                        value={summary.total_quantity_dispatched ? (summary.total_quantity_received / summary.total_quantity_dispatched) * 100 : 0}
                        className="h-3 bg-slate-700"
                    />
                </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="bg-slate-800 border border-slate-700 p-1">
                    <TabsTrigger value="invoices" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400">
                        Invoices ({summary.invoices?.length || 0})
                    </TabsTrigger>
                    <TabsTrigger value="tracking" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400">
                        Live Tracking
                    </TabsTrigger>
                    <TabsTrigger value="documents" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400">
                        Documents
                    </TabsTrigger>
                </TabsList>

                {/* Invoices Tab */}
                <TabsContent value="invoices" className="space-y-4">
                    {summary.invoices?.length === 0 ? (
                        <Card className="bg-slate-800 border-slate-700">
                            <CardContent className="p-8 text-center">
                                <FileText className="h-12 w-12 text-slate-500 mx-auto mb-3" />
                                <p className="text-slate-400">No invoices for this PO yet</p>
                            </CardContent>
                        </Card>
                    ) : (
                        summary.invoices?.map((invoice) => {
                            const invoiceDispatches = getDispatchesForInvoice(invoice.id);
                            const isExpanded = expandedInvoices[invoice.id];
                            
                            return (
                                <Card key={invoice.id} className="bg-slate-800 border-slate-700">
                                    <CardHeader 
                                        className="cursor-pointer hover:bg-slate-700/50 transition-colors"
                                        onClick={() => toggleInvoice(invoice.id)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-3 h-full min-h-[40px] rounded-full ${
                                                    invoice.delivery_status === 'on_time' ? 'bg-emerald-500' :
                                                    invoice.delivery_status === 'slight_delay' ? 'bg-amber-500' :
                                                    invoice.delivery_status === 'critical_delay' ? 'bg-red-500' :
                                                    'bg-slate-500'
                                                }`} />
                                                <div>
                                                    <div className="flex items-center gap-3">
                                                        <CardTitle className="text-white text-lg">{invoice.invoice_number}</CardTitle>
                                                        <Badge className={`${STATUS_COLORS[invoice.status]?.bg} ${STATUS_COLORS[invoice.status]?.text}`}>
                                                            {invoice.status?.replace('_', ' ')}
                                                        </Badge>
                                                        {invoice.delay_hours > 0 && (
                                                            <Badge className="bg-red-500/20 text-red-400">
                                                                <AlertTriangle className="h-3 w-3 mr-1" />
                                                                {formatDelay(invoice.delay_hours)}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-4 mt-1 text-sm text-slate-400">
                                                        <span className="flex items-center gap-1">
                                                            <MapPin className="h-3 w-3" />
                                                            {invoice.destination_name}, {invoice.destination_city}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="h-3 w-3" />
                                                            {formatDate(invoice.dispatch_date)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <div className="text-center">
                                                    <p className="text-xs text-slate-400">Shipped</p>
                                                    <p className="text-lg font-semibold text-white">{invoice.quantity_shipped}</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-xs text-slate-400">Received</p>
                                                    <p className="text-lg font-semibold text-emerald-400">{invoice.quantity_received}</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-xs text-slate-400">Distance</p>
                                                    <p className="text-lg font-semibold text-slate-300">{invoice.distance_km} km</p>
                                                </div>
                                                {isExpanded ? (
                                                    <ChevronUp className="h-5 w-5 text-slate-400" />
                                                ) : (
                                                    <ChevronDown className="h-5 w-5 text-slate-400" />
                                                )}
                                            </div>
                                        </div>
                                    </CardHeader>
                                    
                                    {isExpanded && (
                                        <CardContent className="pt-0">
                                            <div className="border-t border-slate-700 pt-4">
                                                <h4 className="text-sm font-medium text-slate-300 mb-3">Dispatches ({invoiceDispatches.length})</h4>
                                                
                                                {invoiceDispatches.length === 0 ? (
                                                    <p className="text-slate-500 text-sm">No dispatches yet</p>
                                                ) : (
                                                    <div className="space-y-3">
                                                        {invoiceDispatches.map((dispatch) => (
                                                            <div key={dispatch.id} className="p-4 bg-slate-700/50 rounded-lg">
                                                                <div className="flex items-center justify-between">
                                                                    <div>
                                                                        <div className="flex items-center gap-3">
                                                                            <span className="font-medium text-white">{dispatch.dispatch_number}</span>
                                                                            <Badge className={`${STATUS_COLORS[dispatch.status]?.bg} ${STATUS_COLORS[dispatch.status]?.text}`}>
                                                                                {dispatch.status?.replace('_', ' ')}
                                                                            </Badge>
                                                                            {dispatch.delay_hours > 0 && (
                                                                                <Badge className="bg-red-500/20 text-red-400">
                                                                                    {formatDelay(dispatch.delay_hours)}
                                                                                </Badge>
                                                                            )}
                                                                        </div>
                                                                        <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                                                                            {dispatch.vehicle_number && (
                                                                                <span className="flex items-center gap-1">
                                                                                    <Truck className="h-3 w-3" />
                                                                                    {dispatch.vehicle_number}
                                                                                </span>
                                                                            )}
                                                                            {dispatch.driver_name && (
                                                                                <span className="flex items-center gap-1">
                                                                                    <User className="h-3 w-3" />
                                                                                    {dispatch.driver_name}
                                                                                </span>
                                                                            )}
                                                                            {dispatch.current_location_name && (
                                                                                <span className="flex items-center gap-1">
                                                                                    <Navigation className="h-3 w-3" />
                                                                                    {dispatch.current_location_name}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center gap-4">
                                                                        <div className="text-center">
                                                                            <p className="text-xs text-slate-400">Qty</p>
                                                                            <p className="font-semibold text-white">{dispatch.quantity_dispatched}</p>
                                                                        </div>
                                                                        <div className="text-center">
                                                                            <p className="text-xs text-slate-400">Received</p>
                                                                            <p className="font-semibold text-emerald-400">{dispatch.quantity_received}</p>
                                                                        </div>
                                                                        <div className="flex gap-2">
                                                                            <Button 
                                                                                size="sm" 
                                                                                variant="outline"
                                                                                className="border-slate-600 text-slate-300"
                                                                                onClick={() => {
                                                                                    setSelectedDispatch(dispatch);
                                                                                    setShowTrackingDialog(true);
                                                                                }}
                                                                            >
                                                                                <Eye className="h-3 w-3 mr-1" />
                                                                                Track
                                                                            </Button>
                                                                            {dispatch.status !== 'delivered' && dispatch.status !== 'cancelled' && (
                                                                                <>
                                                                                    <Button 
                                                                                        size="sm" 
                                                                                        variant="outline"
                                                                                        className="border-purple-500/30 text-purple-400"
                                                                                        onClick={() => handleSimulateTracking(dispatch.id)}
                                                                                    >
                                                                                        <Play className="h-3 w-3 mr-1" />
                                                                                        Simulate
                                                                                    </Button>
                                                                                    <Button 
                                                                                        size="sm" 
                                                                                        className="bg-emerald-600 hover:bg-emerald-700"
                                                                                        onClick={() => {
                                                                                            setSelectedDispatch(dispatch);
                                                                                            setReceiveQuantity(dispatch.quantity_dispatched - dispatch.quantity_received);
                                                                                            setShowReceiveDialog(true);
                                                                                        }}
                                                                                    >
                                                                                        <CheckCircle className="h-3 w-3 mr-1" />
                                                                                        Receive
                                                                                    </Button>
                                                                                </>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    )}
                                </Card>
                            );
                        })
                    )}
                </TabsContent>

                {/* Live Tracking Tab */}
                <TabsContent value="tracking" className="space-y-4">
                    <Card className="bg-slate-800 border-slate-700">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <Navigation className="h-5 w-5 text-emerald-400" />
                                Live Shipment Tracking
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {summary.dispatches?.filter(d => d.status !== 'delivered' && d.status !== 'cancelled').length === 0 ? (
                                <div className="h-[400px] flex items-center justify-center">
                                    <div className="text-center">
                                        <CheckCircle className="h-12 w-12 text-emerald-400 mx-auto mb-3" />
                                        <p className="text-slate-400">All shipments delivered</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-[400px] rounded-lg overflow-hidden">
                                    <MapContainer
                                        center={[22.5, 78.5]} // Center of India
                                        zoom={5}
                                        style={{ height: '100%', width: '100%' }}
                                        className="rounded-lg"
                                    >
                                        <TileLayer
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        />
                                        
                                        {summary.dispatches?.filter(d => d.status !== 'delivered' && d.status !== 'cancelled').map((dispatch) => {
                                            const invoice = summary.invoices?.find(i => i.id === dispatch.invoice_id);
                                            
                                            if (!invoice) return null;
                                            
                                            const sourceLat = invoice.source_latitude || 19.0760;
                                            const sourceLon = invoice.source_longitude || 72.8777;
                                            const destLat = invoice.destination_latitude || 28.6139;
                                            const destLon = invoice.destination_longitude || 77.2090;
                                            const currentLat = dispatch.current_latitude || sourceLat;
                                            const currentLon = dispatch.current_longitude || sourceLon;
                                            
                                            return (
                                                <React.Fragment key={dispatch.id}>
                                                    {/* Route line */}
                                                    <Polyline
                                                        positions={[
                                                            [sourceLat, sourceLon],
                                                            [destLat, destLon]
                                                        ]}
                                                        color="#475569"
                                                        weight={2}
                                                        dashArray="5, 10"
                                                    />
                                                    
                                                    {/* Traveled path */}
                                                    <Polyline
                                                        positions={[
                                                            [sourceLat, sourceLon],
                                                            [currentLat, currentLon]
                                                        ]}
                                                        color="#10b981"
                                                        weight={3}
                                                    />
                                                    
                                                    {/* Source marker */}
                                                    <Marker position={[sourceLat, sourceLon]} icon={sourceIcon}>
                                                        <Popup>
                                                            <div className="text-sm">
                                                                <strong>Source</strong><br />
                                                                {invoice.source_city}
                                                            </div>
                                                        </Popup>
                                                    </Marker>
                                                    
                                                    {/* Destination marker */}
                                                    <Marker position={[destLat, destLon]} icon={destIcon}>
                                                        <Popup>
                                                            <div className="text-sm">
                                                                <strong>Destination</strong><br />
                                                                {invoice.destination_name}<br />
                                                                {invoice.destination_city}
                                                            </div>
                                                        </Popup>
                                                    </Marker>
                                                    
                                                    {/* Current location marker */}
                                                    <Marker position={[currentLat, currentLon]} icon={currentIcon}>
                                                        <Popup>
                                                            <div className="text-sm">
                                                                <strong>{dispatch.dispatch_number}</strong><br />
                                                                Status: {dispatch.status}<br />
                                                                Location: {dispatch.current_location_name || 'Unknown'}
                                                            </div>
                                                        </Popup>
                                                    </Marker>
                                                </React.Fragment>
                                            );
                                        })}
                                    </MapContainer>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Active Shipments List */}
                    <Card className="bg-slate-800 border-slate-700">
                        <CardHeader>
                            <CardTitle className="text-white">Active Shipments</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {summary.dispatches?.filter(d => d.status !== 'delivered' && d.status !== 'cancelled').map((dispatch) => (
                                    <div key={dispatch.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-3 h-3 rounded-full ${
                                                dispatch.status === 'in_transit' ? 'bg-purple-500 animate-pulse' :
                                                dispatch.status === 'out_for_delivery' ? 'bg-cyan-500 animate-pulse' :
                                                'bg-blue-500'
                                            }`} />
                                            <div>
                                                <p className="text-white font-medium">{dispatch.dispatch_number}</p>
                                                <p className="text-xs text-slate-400">{dispatch.current_location_name || 'Location unknown'}</p>
                                            </div>
                                        </div>
                                        <Badge className={`${STATUS_COLORS[dispatch.status]?.bg} ${STATUS_COLORS[dispatch.status]?.text}`}>
                                            {dispatch.status?.replace('_', ' ')}
                                        </Badge>
                                    </div>
                                ))}
                                {summary.dispatches?.filter(d => d.status !== 'delivered' && d.status !== 'cancelled').length === 0 && (
                                    <p className="text-slate-500 text-center py-4">No active shipments</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Documents Tab */}
                <TabsContent value="documents" className="space-y-4">
                    <Card className="bg-slate-800 border-slate-700">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <FileText className="h-5 w-5 text-blue-400" />
                                Dispatch Documents
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {summary.dispatches?.flatMap(d => d.documents || []).length === 0 ? (
                                <div className="py-8 text-center">
                                    <FileText className="h-12 w-12 text-slate-500 mx-auto mb-3" />
                                    <p className="text-slate-400">No documents uploaded yet</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {summary.dispatches?.flatMap(d => 
                                        (d.documents || []).map(doc => ({
                                            ...doc,
                                            dispatch_number: d.dispatch_number
                                        }))
                                    ).map((doc) => (
                                        <div key={doc.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <FileText className="h-5 w-5 text-blue-400" />
                                                <div>
                                                    <p className="text-white">{doc.title}</p>
                                                    <p className="text-xs text-slate-400">
                                                        {doc.document_type?.replace('_', ' ')} • {doc.dispatch_number}
                                                    </p>
                                                </div>
                                            </div>
                                            <Button 
                                                size="sm" 
                                                variant="outline"
                                                className="border-slate-600 text-slate-300"
                                                onClick={() => window.open(doc.file_url, '_blank')}
                                            >
                                                <Download className="h-4 w-4 mr-1" />
                                                Download
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Tracking Dialog */}
            <Dialog open={showTrackingDialog} onOpenChange={setShowTrackingDialog}>
                <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-white">
                            Tracking History - {selectedDispatch?.dispatch_number}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        {selectedDispatch?.tracking_history?.length === 0 ? (
                            <p className="text-slate-400 text-center py-4">No tracking history</p>
                        ) : (
                            <div className="relative pl-6 space-y-4">
                                <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-slate-600" />
                                {selectedDispatch?.tracking_history?.map((entry, index) => (
                                    <div key={entry.id || index} className="relative">
                                        <div className={`absolute -left-4 w-3 h-3 rounded-full ${
                                            index === 0 ? 'bg-emerald-500' : 'bg-slate-500'
                                        }`} />
                                        <div className="ml-4 p-3 bg-slate-700/50 rounded-lg">
                                            <div className="flex items-center justify-between">
                                                <Badge className={`${STATUS_COLORS[entry.status]?.bg} ${STATUS_COLORS[entry.status]?.text}`}>
                                                    {entry.status?.replace('_', ' ')}
                                                </Badge>
                                                <span className="text-xs text-slate-400">
                                                    {formatDate(entry.timestamp)}
                                                </span>
                                            </div>
                                            {entry.location_name && (
                                                <p className="text-sm text-slate-300 mt-2 flex items-center gap-1">
                                                    <MapPin className="h-3 w-3" />
                                                    {entry.location_name}
                                                </p>
                                            )}
                                            {entry.notes && (
                                                <p className="text-xs text-slate-400 mt-1">{entry.notes}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Receive Dialog */}
            <Dialog open={showReceiveDialog} onOpenChange={setShowReceiveDialog}>
                <DialogContent className="bg-slate-800 border-slate-700">
                    <DialogHeader>
                        <DialogTitle className="text-white">
                            Receive Shipment - {selectedDispatch?.dispatch_number}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div>
                            <label className="text-sm text-slate-400">Quantity Received</label>
                            <Input
                                type="number"
                                value={receiveQuantity}
                                onChange={(e) => setReceiveQuantity(parseInt(e.target.value) || 0)}
                                max={selectedDispatch?.quantity_dispatched - (selectedDispatch?.quantity_received || 0)}
                                className="bg-slate-700 border-slate-600 text-white mt-1"
                            />
                            <p className="text-xs text-slate-500 mt-1">
                                Max: {selectedDispatch?.quantity_dispatched - (selectedDispatch?.quantity_received || 0)} units remaining
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowReceiveDialog(false)} className="border-slate-600 text-slate-300">
                            Cancel
                        </Button>
                        <Button onClick={handleReceiveDispatch} className="bg-emerald-600 hover:bg-emerald-700">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Confirm Receipt
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
