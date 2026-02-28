import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
    ShoppingCart, Package, Clock, CheckCircle2, AlertTriangle,
    Search, Filter, Plus, ChevronRight, Calendar, Factory,
    FileText, Download, Eye, MoreVertical, TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock orders data
const mockOrders = [
    {
        id: 'PO-2024-001',
        product: 'Organic Cotton T-Shirts',
        supplier: 'Dhaka Textiles Ltd',
        quantity: 5000,
        unit: 'pcs',
        totalValue: '$45,000',
        orderDate: '2024-01-15',
        dueDate: '2024-02-28',
        status: 'in_production',
        progress: 65,
        currentStage: 'CMT',
        paymentStatus: 'partial',
    },
    {
        id: 'PO-2024-002',
        product: 'Recycled Polyester Jackets',
        supplier: 'Mumbai Fabrics Co',
        quantity: 2000,
        unit: 'pcs',
        totalValue: '$68,000',
        orderDate: '2024-01-20',
        dueDate: '2024-02-20',
        status: 'delayed',
        progress: 35,
        currentStage: 'Dyeing',
        delayDays: 5,
        paymentStatus: 'pending',
    },
    {
        id: 'PO-2024-003',
        product: 'Hemp Blend Shirts',
        supplier: 'Vietnam Textiles',
        quantity: 3000,
        unit: 'pcs',
        totalValue: '$52,500',
        orderDate: '2024-01-10',
        dueDate: '2024-02-15',
        status: 'in_production',
        progress: 90,
        currentStage: 'Final QC',
        paymentStatus: 'complete',
    },
    {
        id: 'PO-2024-004',
        product: 'BCI Cotton Pants',
        supplier: 'Bangladesh Apparel',
        quantity: 4000,
        unit: 'pcs',
        totalValue: '$72,000',
        orderDate: '2024-02-01',
        dueDate: '2024-03-15',
        status: 'in_production',
        progress: 20,
        currentStage: 'Spinning',
        paymentStatus: 'partial',
    },
    {
        id: 'PO-2024-005',
        product: 'Linen Summer Dresses',
        supplier: 'Vietnam Textiles',
        quantity: 2500,
        unit: 'pcs',
        totalValue: '$56,250',
        orderDate: '2024-01-25',
        dueDate: '2024-03-01',
        status: 'delayed',
        progress: 45,
        currentStage: 'Dyeing',
        delayDays: 3,
        paymentStatus: 'partial',
    },
    {
        id: 'PO-2024-006',
        product: 'Wool Blend Sweaters',
        supplier: 'Dhaka Textiles Ltd',
        quantity: 1500,
        unit: 'pcs',
        totalValue: '$48,000',
        orderDate: '2024-02-05',
        dueDate: '2024-03-20',
        status: 'pending',
        progress: 0,
        currentStage: 'Awaiting Materials',
        paymentStatus: 'pending',
    },
];

const statusConfig = {
    in_production: { label: 'In Production', color: 'bg-secondary/10 text-secondary border-secondary/30', icon: Factory },
    delayed: { label: 'Delayed', color: 'bg-destructive/10 text-destructive border-destructive/30', icon: AlertTriangle },
    pending: { label: 'Pending', color: 'bg-warning/10 text-warning border-warning/30', icon: Clock },
    completed: { label: 'Completed', color: 'bg-success/10 text-success border-success/30', icon: CheckCircle2 },
};

export const BuyerOrders = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterSupplier, setFilterSupplier] = useState('all');

    const suppliers = [...new Set(mockOrders.map(o => o.supplier))];

    const filteredOrders = mockOrders.filter(order => {
        const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            order.product.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
        const matchesSupplier = filterSupplier === 'all' || order.supplier === filterSupplier;
        return matchesSearch && matchesStatus && matchesSupplier;
    });

    const orderStats = {
        total: mockOrders.length,
        inProduction: mockOrders.filter(o => o.status === 'in_production').length,
        delayed: mockOrders.filter(o => o.status === 'delayed').length,
        totalValue: '$341,750',
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
                        Purchase Orders
                    </h1>
                    <p className="text-muted-foreground">
                        Manage and track all your purchase orders
                    </p>
                </div>
                <Button variant="hero">
                    <Plus className="h-4 w-4 mr-2" />
                    New Purchase Order
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Total Orders</p>
                                <p className="text-2xl font-bold text-foreground">{orderStats.total}</p>
                            </div>
                            <ShoppingCart className="h-8 w-8 text-primary/20" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">In Production</p>
                                <p className="text-2xl font-bold text-secondary">{orderStats.inProduction}</p>
                            </div>
                            <Factory className="h-8 w-8 text-secondary/20" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Delayed</p>
                                <p className="text-2xl font-bold text-destructive">{orderStats.delayed}</p>
                            </div>
                            <AlertTriangle className="h-8 w-8 text-destructive/20" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Total Value</p>
                                <p className="text-2xl font-bold text-foreground">{orderStats.totalValue}</p>
                            </div>
                            <TrendingUp className="h-8 w-8 text-primary/20" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search orders..." 
                                className="pl-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="in_production">In Production</SelectItem>
                                <SelectItem value="delayed">Delayed</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={filterSupplier} onValueChange={setFilterSupplier}>
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="Supplier" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Suppliers</SelectItem>
                                {suppliers.map(supplier => (
                                    <SelectItem key={supplier} value={supplier}>{supplier}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button variant="outline">
                            <Download className="h-4 w-4 mr-2" />
                            Export
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Orders List */}
            <div className="space-y-4">
                {filteredOrders.map((order) => {
                    const statusInfo = statusConfig[order.status];
                    const StatusIcon = statusInfo.icon;
                    
                    return (
                        <Card key={order.id} className="hover:shadow-lg transition-shadow" data-testid={`order-card-${order.id}`}>
                            <CardContent className="p-5">
                                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                                    {/* Order Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-medium text-foreground">{order.id}</span>
                                                    <Badge variant="outline" className={statusInfo.color}>
                                                        <StatusIcon className="h-3 w-3 mr-1" />
                                                        {statusInfo.label}
                                                        {order.delayDays && (
                                                            <span className="ml-1">+{order.delayDays}d</span>
                                                        )}
                                                    </Badge>
                                                </div>
                                                <p className="text-foreground font-medium">{order.product}</p>
                                                <p className="text-sm text-muted-foreground">{order.supplier}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-4">
                                            <div>
                                                <span className="text-muted-foreground">Quantity</span>
                                                <p className="font-medium">{order.quantity.toLocaleString()} {order.unit}</p>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Value</span>
                                                <p className="font-medium">{order.totalValue}</p>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Order Date</span>
                                                <p className="font-medium">{order.orderDate}</p>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Due Date</span>
                                                <p className="font-medium">{order.dueDate}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Progress & Actions */}
                                    <div className="lg:w-64 space-y-3">
                                        <div>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-muted-foreground">Progress</span>
                                                <span className="font-medium">{order.progress}%</span>
                                            </div>
                                            <Progress value={order.progress} className="h-2" />
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Current: {order.currentStage}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Button variant="outline" size="sm" className="flex-1" asChild>
                                                <Link to={`/buyer/traceability?po=${order.id}`}>
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    Track
                                                </Link>
                                            </Button>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem>
                                                        <FileText className="h-4 w-4 mr-2" />
                                                        View Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        <Download className="h-4 w-4 mr-2" />
                                                        Download PO
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        <Factory className="h-4 w-4 mr-2" />
                                                        Contact Supplier
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
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
                    <CardContent className="p-8 text-center">
                        <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-lg font-medium text-foreground">No orders found</p>
                        <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default BuyerOrders;
