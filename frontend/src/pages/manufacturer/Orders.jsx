import React, { useState } from 'react';
import { 
    ShoppingBag, Search, Filter, ChevronRight, Clock, 
    CheckCircle2, Package, Truck, Factory, Eye
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

// Mock orders data
const mockOrders = [
    {
        id: 'ORD-2024-001',
        brand: 'Fashion Brand Co',
        styleName: 'Organic Cotton T-Shirts',
        styleNo: 'TS-2024-001',
        quantity: 5000,
        dueDate: '2024-02-15',
        status: 'in_production',
        progress: 65,
        stages: [
            { name: 'Order Received', status: 'completed', date: '2024-01-10' },
            { name: 'Fabric Sourcing', status: 'completed', date: '2024-01-15' },
            { name: 'Cutting', status: 'completed', date: '2024-01-20' },
            { name: 'Sewing', status: 'in_progress', date: '2024-01-25' },
            { name: 'Finishing', status: 'pending', date: null },
            { name: 'Quality Check', status: 'pending', date: null },
            { name: 'Packing', status: 'pending', date: null },
            { name: 'Shipping', status: 'pending', date: null },
        ]
    },
    {
        id: 'ORD-2024-002',
        brand: 'EcoWear Ltd',
        styleName: 'Recycled Polyester Jackets',
        styleNo: 'JK-2024-002',
        quantity: 2000,
        dueDate: '2024-02-20',
        status: 'dyeing',
        progress: 40,
        stages: [
            { name: 'Order Received', status: 'completed', date: '2024-01-12' },
            { name: 'Fabric Sourcing', status: 'completed', date: '2024-01-18' },
            { name: 'Dyeing', status: 'in_progress', date: '2024-01-28' },
            { name: 'Cutting', status: 'pending', date: null },
            { name: 'Sewing', status: 'pending', date: null },
            { name: 'Finishing', status: 'pending', date: null },
            { name: 'Quality Check', status: 'pending', date: null },
            { name: 'Packing', status: 'pending', date: null },
        ]
    },
    {
        id: 'ORD-2024-003',
        brand: 'Sustainable Style',
        styleName: 'Hemp Blend Shirts',
        styleNo: 'SH-2024-003',
        quantity: 3000,
        dueDate: '2024-02-10',
        status: 'quality_check',
        progress: 90,
        stages: [
            { name: 'Order Received', status: 'completed', date: '2024-01-05' },
            { name: 'Fabric Sourcing', status: 'completed', date: '2024-01-08' },
            { name: 'Cutting', status: 'completed', date: '2024-01-12' },
            { name: 'Sewing', status: 'completed', date: '2024-01-20' },
            { name: 'Finishing', status: 'completed', date: '2024-01-25' },
            { name: 'Quality Check', status: 'in_progress', date: '2024-01-28' },
            { name: 'Packing', status: 'pending', date: null },
            { name: 'Shipping', status: 'pending', date: null },
        ]
    },
    {
        id: 'ORD-2024-004',
        brand: 'Green Threads',
        styleName: 'Bamboo Fabric Pants',
        styleNo: 'PT-2024-004',
        quantity: 4000,
        dueDate: '2024-02-25',
        status: 'cutting',
        progress: 25,
        stages: [
            { name: 'Order Received', status: 'completed', date: '2024-01-20' },
            { name: 'Fabric Sourcing', status: 'completed', date: '2024-01-25' },
            { name: 'Cutting', status: 'in_progress', date: '2024-01-30' },
            { name: 'Sewing', status: 'pending', date: null },
            { name: 'Finishing', status: 'pending', date: null },
            { name: 'Quality Check', status: 'pending', date: null },
            { name: 'Packing', status: 'pending', date: null },
            { name: 'Shipping', status: 'pending', date: null },
        ]
    },
];

const statusConfig = {
    in_production: { label: 'In Production', color: 'bg-blue-500', badge: 'bg-blue-100 text-blue-700' },
    dyeing: { label: 'Dyeing', color: 'bg-purple-500', badge: 'bg-purple-100 text-purple-700' },
    quality_check: { label: 'Quality Check', color: 'bg-orange-500', badge: 'bg-orange-100 text-orange-700' },
    cutting: { label: 'Cutting', color: 'bg-cyan-500', badge: 'bg-cyan-100 text-cyan-700' },
    completed: { label: 'Completed', color: 'bg-green-500', badge: 'bg-green-100 text-green-700' },
    shipped: { label: 'Shipped', color: 'bg-green-600', badge: 'bg-green-100 text-green-700' },
};

export const Orders = () => {
    const [orders, setOrders] = useState(mockOrders);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredOrders = orders.filter(order => {
        const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
        const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            order.styleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            order.brand.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const handleUpdateStage = (orderId, stageIndex) => {
        setOrders(orders.map(order => {
            if (order.id === orderId) {
                const updatedStages = order.stages.map((stage, idx) => {
                    if (idx === stageIndex && stage.status === 'in_progress') {
                        return { ...stage, status: 'completed', date: new Date().toISOString().split('T')[0] };
                    }
                    if (idx === stageIndex + 1 && stage.status === 'pending') {
                        return { ...stage, status: 'in_progress', date: new Date().toISOString().split('T')[0] };
                    }
                    return stage;
                });
                
                const completedCount = updatedStages.filter(s => s.status === 'completed').length;
                const newProgress = Math.round((completedCount / updatedStages.length) * 100);
                
                return { ...order, stages: updatedStages, progress: newProgress };
            }
            return order;
        }));
        toast.success('Production stage updated');
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
                        Orders & Styles
                    </h1>
                    <p className="text-muted-foreground">
                        View and manage your assigned brand orders
                    </p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Total Orders</p>
                                <p className="text-2xl font-bold text-foreground">{orders.length}</p>
                            </div>
                            <ShoppingBag className="h-8 w-8 text-muted-foreground/50" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">In Progress</p>
                                <p className="text-2xl font-bold text-blue-600">
                                    {orders.filter(o => o.progress < 100).length}
                                </p>
                            </div>
                            <Factory className="h-8 w-8 text-blue-500/50" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Total Pieces</p>
                                <p className="text-2xl font-bold text-foreground">
                                    {orders.reduce((sum, o) => sum + o.quantity, 0).toLocaleString()}
                                </p>
                            </div>
                            <Package className="h-8 w-8 text-muted-foreground/50" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Due This Week</p>
                                <p className="text-2xl font-bold text-warning">2</p>
                            </div>
                            <Clock className="h-8 w-8 text-warning/50" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search orders, styles, brands..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger className="w-[180px]">
                                <Filter className="h-4 w-4 mr-2" />
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="cutting">Cutting</SelectItem>
                                <SelectItem value="dyeing">Dyeing</SelectItem>
                                <SelectItem value="in_production">In Production</SelectItem>
                                <SelectItem value="quality_check">Quality Check</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Orders List */}
            <div className="space-y-4">
                {filteredOrders.map((order) => {
                    const config = statusConfig[order.status];
                    return (
                        <Card key={order.id} className="overflow-hidden">
                            <CardContent className="p-0">
                                <div className="flex flex-col lg:flex-row">
                                    {/* Order Info */}
                                    <div className="flex-1 p-5">
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-semibold text-foreground">{order.styleName}</h3>
                                                    <Badge className={config.badge}>{config.label}</Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground">{order.brand}</p>
                                            </div>
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)}>
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        Details
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-2xl">
                                                    <DialogHeader>
                                                        <DialogTitle>Order Details - {order.id}</DialogTitle>
                                                        <DialogDescription>
                                                            {order.styleName} for {order.brand}
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <div className="space-y-6 py-4">
                                                        {/* Order Summary */}
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <p className="text-sm text-muted-foreground">Style No.</p>
                                                                <p className="font-medium">{order.styleNo}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm text-muted-foreground">Quantity</p>
                                                                <p className="font-medium">{order.quantity.toLocaleString()} pcs</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm text-muted-foreground">Due Date</p>
                                                                <p className="font-medium">{order.dueDate}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm text-muted-foreground">Progress</p>
                                                                <p className="font-medium">{order.progress}%</p>
                                                            </div>
                                                        </div>
                                                        
                                                        {/* Production Stages */}
                                                        <div>
                                                            <h4 className="font-medium mb-3">Production Stages</h4>
                                                            <div className="space-y-3">
                                                                {order.stages.map((stage, idx) => (
                                                                    <div key={idx} className="flex items-center gap-4">
                                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                                                            stage.status === 'completed' ? 'bg-success text-success-foreground' :
                                                                            stage.status === 'in_progress' ? 'bg-secondary text-secondary-foreground' :
                                                                            'bg-muted text-muted-foreground'
                                                                        }`}>
                                                                            {stage.status === 'completed' ? (
                                                                                <CheckCircle2 className="h-4 w-4" />
                                                                            ) : (
                                                                                <span className="text-sm">{idx + 1}</span>
                                                                            )}
                                                                        </div>
                                                                        <div className="flex-1">
                                                                            <p className={`font-medium ${
                                                                                stage.status === 'pending' ? 'text-muted-foreground' : 'text-foreground'
                                                                            }`}>
                                                                                {stage.name}
                                                                            </p>
                                                                            {stage.date && (
                                                                                <p className="text-xs text-muted-foreground">{stage.date}</p>
                                                                            )}
                                                                        </div>
                                                                        {stage.status === 'in_progress' && (
                                                                            <Button 
                                                                                size="sm" 
                                                                                variant="hero"
                                                                                onClick={() => handleUpdateStage(order.id, idx)}
                                                                            >
                                                                                Complete Stage
                                                                            </Button>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                        
                                        <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                                            <div>
                                                <p className="text-muted-foreground">Order ID</p>
                                                <p className="font-medium text-foreground">{order.id}</p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">Quantity</p>
                                                <p className="font-medium text-foreground">{order.quantity.toLocaleString()} pcs</p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">Due Date</p>
                                                <p className="font-medium text-foreground">{order.dueDate}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">Production Progress</span>
                                                <span className="font-medium text-foreground">{order.progress}%</span>
                                            </div>
                                            <Progress value={order.progress} className="h-2" />
                                        </div>
                                    </div>

                                    {/* Stage Indicator */}
                                    <div className="lg:w-64 bg-muted/30 p-4 border-t lg:border-t-0 lg:border-l border-border">
                                        <p className="text-xs text-muted-foreground mb-3">Current Stage</p>
                                        <div className="space-y-2">
                                            {order.stages.slice(0, 5).map((stage, idx) => (
                                                <div key={idx} className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${
                                                        stage.status === 'completed' ? 'bg-success' :
                                                        stage.status === 'in_progress' ? 'bg-secondary' :
                                                        'bg-muted-foreground/30'
                                                    }`} />
                                                    <span className={`text-xs ${
                                                        stage.status === 'in_progress' ? 'font-medium text-foreground' : 'text-muted-foreground'
                                                    }`}>
                                                        {stage.name}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {filteredOrders.length === 0 && (
                <Card>
                    <CardContent className="p-12 text-center">
                        <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                        <p className="text-muted-foreground">No orders found</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default Orders;
