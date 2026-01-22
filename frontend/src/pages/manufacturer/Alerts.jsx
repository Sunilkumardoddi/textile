import React, { useState } from 'react';
import { 
    Bell, AlertTriangle, CheckCircle2, Clock, Award, 
    FileCheck, ShoppingBag, GitBranch, Filter, Check,
    ChevronRight, X
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

// Mock alerts data
const mockAlerts = [
    {
        id: 1,
        type: 'certification',
        title: 'GOTS Certificate Expiring',
        message: 'Your GOTS certificate (GOTS-2024-12345) will expire in 15 days. Please renew to maintain compliance.',
        priority: 'high',
        timestamp: '2024-02-01T10:30:00Z',
        read: false,
        actionUrl: '/manufacturer/certifications'
    },
    {
        id: 2,
        type: 'audit',
        title: 'Corrective Action Required',
        message: 'CAR-2024-005: Fire safety equipment maintenance overdue. Response required within 7 days.',
        priority: 'high',
        timestamp: '2024-02-01T09:15:00Z',
        read: false,
        actionUrl: '/manufacturer/audits'
    },
    {
        id: 3,
        type: 'traceability',
        title: 'Missing Traceability Data',
        message: 'Batch #B2024-112 is missing cotton source documentation. Please update traceability records.',
        priority: 'medium',
        timestamp: '2024-01-31T16:45:00Z',
        read: false,
        actionUrl: '/manufacturer/traceability'
    },
    {
        id: 4,
        type: 'order',
        title: 'New Style Assignment',
        message: 'Fashion Brand Co has assigned you a new style: TS-2024-005 (5000 pcs). Review order details.',
        priority: 'low',
        timestamp: '2024-01-31T14:20:00Z',
        read: true,
        actionUrl: '/manufacturer/orders'
    },
    {
        id: 5,
        type: 'certification',
        title: 'OCS Certificate Expired',
        message: 'Your OCS certificate has expired. Upload renewed certificate to continue processing organic content.',
        priority: 'high',
        timestamp: '2024-01-30T11:00:00Z',
        read: true,
        actionUrl: '/manufacturer/certifications'
    },
    {
        id: 6,
        type: 'order',
        title: 'Production Deadline Reminder',
        message: 'Order ORD-2024-001 is due in 5 days. Current progress: 65%. Update production status.',
        priority: 'medium',
        timestamp: '2024-01-30T09:30:00Z',
        read: true,
        actionUrl: '/manufacturer/orders'
    },
    {
        id: 7,
        type: 'audit',
        title: 'Upcoming Audit Scheduled',
        message: 'Annual BSCI audit scheduled for Feb 15, 2024. Prepare documentation.',
        priority: 'medium',
        timestamp: '2024-01-29T15:00:00Z',
        read: true,
        actionUrl: '/manufacturer/audits'
    },
    {
        id: 8,
        type: 'document',
        title: 'Document Upload Request',
        message: 'EcoWear Ltd has requested updated test reports for order ORD-2024-002.',
        priority: 'low',
        timestamp: '2024-01-28T10:15:00Z',
        read: true,
        actionUrl: '/manufacturer/documents'
    },
];

const alertTypeConfig = {
    certification: { icon: Award, color: 'text-purple-500', bg: 'bg-purple-50' },
    audit: { icon: FileCheck, color: 'text-blue-500', bg: 'bg-blue-50' },
    traceability: { icon: GitBranch, color: 'text-green-500', bg: 'bg-green-50' },
    order: { icon: ShoppingBag, color: 'text-orange-500', bg: 'bg-orange-50' },
    document: { icon: FileCheck, color: 'text-gray-500', bg: 'bg-gray-50' },
};

export const Alerts = () => {
    const [alerts, setAlerts] = useState(mockAlerts);
    const [activeTab, setActiveTab] = useState('all');

    const filteredAlerts = alerts.filter(alert => {
        if (activeTab === 'all') return true;
        if (activeTab === 'unread') return !alert.read;
        return alert.type === activeTab;
    });

    const unreadCount = alerts.filter(a => !a.read).length;

    const handleMarkAsRead = (id) => {
        setAlerts(alerts.map(a => 
            a.id === id ? { ...a, read: true } : a
        ));
    };

    const handleMarkAllAsRead = () => {
        setAlerts(alerts.map(a => ({ ...a, read: true })));
        toast.success('All notifications marked as read');
    };

    const handleDismiss = (id) => {
        setAlerts(alerts.filter(a => a.id !== id));
        toast.success('Notification dismissed');
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'border-destructive/50 bg-destructive/5';
            case 'medium': return 'border-warning/50 bg-warning/5';
            case 'low': return 'border-border bg-card';
            default: return 'border-border';
        }
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
        if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        return 'Just now';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
                        Alerts & Notifications
                    </h1>
                    <p className="text-muted-foreground">
                        Stay updated on important actions and deadlines
                    </p>
                </div>
                {unreadCount > 0 && (
                    <Button variant="outline" onClick={handleMarkAllAsRead}>
                        <Check className="h-4 w-4 mr-2" />
                        Mark All as Read
                    </Button>
                )}
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className={unreadCount > 0 ? 'border-destructive/50' : ''}>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Unread</p>
                                <p className="text-2xl font-bold text-foreground">{unreadCount}</p>
                            </div>
                            <Bell className={`h-8 w-8 ${unreadCount > 0 ? 'text-destructive' : 'text-muted-foreground/50'}`} />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">High Priority</p>
                                <p className="text-2xl font-bold text-destructive">
                                    {alerts.filter(a => a.priority === 'high' && !a.read).length}
                                </p>
                            </div>
                            <AlertTriangle className="h-8 w-8 text-destructive/50" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Certifications</p>
                                <p className="text-2xl font-bold text-foreground">
                                    {alerts.filter(a => a.type === 'certification').length}
                                </p>
                            </div>
                            <Award className="h-8 w-8 text-purple-500/50" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Audits</p>
                                <p className="text-2xl font-bold text-foreground">
                                    {alerts.filter(a => a.type === 'audit').length}
                                </p>
                            </div>
                            <FileCheck className="h-8 w-8 text-blue-500/50" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="flex-wrap h-auto gap-1 p-1">
                    <TabsTrigger value="all" className="data-[state=active]:bg-accent">
                        All
                        <Badge variant="secondary" className="ml-2 h-5">{alerts.length}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="unread" className="data-[state=active]:bg-accent">
                        Unread
                        {unreadCount > 0 && (
                            <Badge variant="destructive" className="ml-2 h-5">{unreadCount}</Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="certification" className="data-[state=active]:bg-accent">
                        <Award className="h-4 w-4 mr-1" />
                        Certifications
                    </TabsTrigger>
                    <TabsTrigger value="audit" className="data-[state=active]:bg-accent">
                        <FileCheck className="h-4 w-4 mr-1" />
                        Audits
                    </TabsTrigger>
                    <TabsTrigger value="traceability" className="data-[state=active]:bg-accent">
                        <GitBranch className="h-4 w-4 mr-1" />
                        Traceability
                    </TabsTrigger>
                    <TabsTrigger value="order" className="data-[state=active]:bg-accent">
                        <ShoppingBag className="h-4 w-4 mr-1" />
                        Orders
                    </TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="mt-6">
                    <div className="space-y-3">
                        {filteredAlerts.length === 0 ? (
                            <Card>
                                <CardContent className="p-12 text-center">
                                    <Bell className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                                    <p className="text-muted-foreground">No notifications to display</p>
                                </CardContent>
                            </Card>
                        ) : (
                            filteredAlerts.map((alert) => {
                                const config = alertTypeConfig[alert.type];
                                const Icon = config.icon;
                                
                                return (
                                    <Card 
                                        key={alert.id} 
                                        className={`transition-all ${getPriorityColor(alert.priority)} ${
                                            !alert.read ? 'shadow-md' : 'opacity-80'
                                        }`}
                                    >
                                        <CardContent className="p-4">
                                            <div className="flex items-start gap-4">
                                                <div className={`p-2 rounded-lg ${config.bg} ${config.color}`}>
                                                    <Icon className="h-5 w-5" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div>
                                                            <h4 className={`font-medium ${!alert.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                                {alert.title}
                                                            </h4>
                                                            <p className="text-sm text-muted-foreground mt-1">
                                                                {alert.message}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-2 flex-shrink-0">
                                                            {alert.priority === 'high' && (
                                                                <Badge variant="destructive" className="text-[10px]">
                                                                    Urgent
                                                                </Badge>
                                                            )}
                                                            {!alert.read && (
                                                                <div className="w-2 h-2 rounded-full bg-secondary" />
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between mt-3">
                                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            {formatTime(alert.timestamp)}
                                                        </span>
                                                        <div className="flex items-center gap-2">
                                                            {!alert.read && (
                                                                <Button 
                                                                    variant="ghost" 
                                                                    size="sm"
                                                                    className="h-7 text-xs"
                                                                    onClick={() => handleMarkAsRead(alert.id)}
                                                                >
                                                                    <Check className="h-3 w-3 mr-1" />
                                                                    Mark Read
                                                                </Button>
                                                            )}
                                                            <Button 
                                                                variant="outline" 
                                                                size="sm"
                                                                className="h-7 text-xs"
                                                                asChild
                                                            >
                                                                <a href={alert.actionUrl}>
                                                                    View Details
                                                                    <ChevronRight className="h-3 w-3 ml-1" />
                                                                </a>
                                                            </Button>
                                                            <Button 
                                                                variant="ghost" 
                                                                size="sm"
                                                                className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                                                                onClick={() => handleDismiss(alert.id)}
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default Alerts;
