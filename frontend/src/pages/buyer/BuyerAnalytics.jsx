import React, { useState } from 'react';
import { 
    BarChart3, TrendingUp, Clock, AlertTriangle, Package,
    Calendar, Filter, Download, RefreshCw, ChevronDown,
    Factory, Leaf, Circle, Shirt, Droplets, ArrowUp, ArrowDown
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

// Mock analytics data (simulating Power BI metrics)
const inventoryMetrics = {
    fiber: { processed: 12500, pending: 3500, unit: 'KG', trend: '+12%' },
    yarn: { processed: 10200, pending: 2300, unit: 'KG', trend: '+8%' },
    fabric: { processed: 45000, pending: 15000, unit: 'Meters', trend: '+15%' },
    garments: { processed: 8500, pending: 6500, unit: 'Units', trend: '+5%' },
};

const leadTimeData = [
    { stage: 'Fiber Sourcing', avgDays: 5, target: 4, status: 'warning' },
    { stage: 'Spinning', avgDays: 8, target: 10, status: 'good' },
    { stage: 'Weaving/Knitting', avgDays: 12, target: 12, status: 'good' },
    { stage: 'Processing (Dyeing)', avgDays: 7, target: 5, status: 'critical' },
    { stage: 'CMT', avgDays: 10, target: 12, status: 'good' },
    { stage: 'Final QC & Packing', avgDays: 3, target: 3, status: 'good' },
];

const bottleneckData = [
    { stage: 'Processing', poCount: 5, avgDelay: 4.2, impact: 'High', reason: 'Equipment capacity' },
    { stage: 'Fiber Sourcing', poCount: 3, avgDelay: 2.8, impact: 'Medium', reason: 'Certification delays' },
    { stage: 'Spinning', poCount: 2, avgDelay: 1.5, impact: 'Low', reason: 'Raw material shortage' },
];

const poPerformance = [
    { id: 'PO-2024-001', product: 'Organic T-Shirts', progress: 65, daysRemaining: 14, status: 'on_track' },
    { id: 'PO-2024-002', product: 'Recycled Jackets', progress: 35, daysRemaining: 6, status: 'at_risk' },
    { id: 'PO-2024-003', product: 'Hemp Shirts', progress: 90, daysRemaining: 3, status: 'on_track' },
    { id: 'PO-2024-004', product: 'BCI Cotton Pants', progress: 20, daysRemaining: 21, status: 'on_track' },
    { id: 'PO-2024-005', product: 'Linen Dresses', progress: 45, daysRemaining: 8, status: 'delayed' },
];

// Simulated chart component (in real implementation, this would be Power BI embed)
const SimulatedChart = ({ type, data, title }) => {
    if (type === 'bar') {
        return (
            <div className="space-y-3">
                {data.map((item, idx) => (
                    <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{item.label}</span>
                            <span className="font-medium">{item.value}</span>
                        </div>
                        <div className="h-3 bg-muted rounded-full overflow-hidden">
                            <div 
                                className={`h-full rounded-full transition-all ${
                                    item.color || 'bg-secondary'
                                }`}
                                style={{ width: `${item.percent}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        );
    }
    
    if (type === 'donut') {
        const total = data.reduce((sum, d) => sum + d.value, 0);
        return (
            <div className="flex items-center gap-6">
                <div className="relative w-32 h-32">
                    <svg className="w-full h-full transform -rotate-90">
                        {data.reduce((acc, item, idx) => {
                            const prevPercent = acc.offset;
                            const percent = (item.value / total) * 100;
                            acc.elements.push(
                                <circle
                                    key={idx}
                                    cx="64"
                                    cy="64"
                                    r="50"
                                    fill="none"
                                    stroke={item.color}
                                    strokeWidth="12"
                                    strokeDasharray={`${percent * 3.14} ${314 - percent * 3.14}`}
                                    strokeDashoffset={`${-prevPercent * 3.14}`}
                                    className="transition-all"
                                />
                            );
                            acc.offset += percent;
                            return acc;
                        }, { elements: [], offset: 0 }).elements}
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xl font-bold">{total}</span>
                    </div>
                </div>
                <div className="space-y-2">
                    {data.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="text-sm text-muted-foreground">{item.label}</span>
                            <span className="text-sm font-medium ml-auto">{item.value}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    
    return null;
};

export const BuyerAnalytics = () => {
    const [dateRange, setDateRange] = useState('30d');
    const [selectedPO, setSelectedPO] = useState('all');

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
                        Analytics Dashboard
                    </h1>
                    <p className="text-muted-foreground">
                        Power BI integrated metrics and supply chain insights
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Select value={dateRange} onValueChange={setDateRange}>
                        <SelectTrigger className="w-32">
                            <Calendar className="h-4 w-4 mr-2" />
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="7d">Last 7 days</SelectItem>
                            <SelectItem value="30d">Last 30 days</SelectItem>
                            <SelectItem value="90d">Last 90 days</SelectItem>
                            <SelectItem value="1y">Last year</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline" size="icon">
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Power BI Notice */}
            <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-4 flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-primary/10">
                        <BarChart3 className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                        <p className="font-medium text-foreground">Power BI Integration</p>
                        <p className="text-sm text-muted-foreground">
                            These dashboards are simulated views. In production, embed actual Power BI reports for live data visualization.
                        </p>
                    </div>
                    <Badge variant="secondary">Demo Mode</Badge>
                </CardContent>
            </Card>

            <Tabs defaultValue="inventory" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
                    <TabsTrigger value="inventory">Inventory</TabsTrigger>
                    <TabsTrigger value="timeline">Lead Time</TabsTrigger>
                    <TabsTrigger value="bottlenecks">Bottlenecks</TabsTrigger>
                    <TabsTrigger value="performance">PO Performance</TabsTrigger>
                </TabsList>

                {/* Inventory Metrics Tab */}
                <TabsContent value="inventory" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {Object.entries(inventoryMetrics).map(([key, data]) => (
                            <Card key={key}>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground capitalize">
                                        {key} Inventory
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex items-end justify-between">
                                            <div>
                                                <p className="text-2xl font-bold text-foreground">
                                                    {data.processed.toLocaleString()}
                                                </p>
                                                <p className="text-xs text-muted-foreground">{data.unit} Processed</p>
                                            </div>
                                            <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                                                <ArrowUp className="h-3 w-3 mr-1" />
                                                {data.trend}
                                            </Badge>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-xs">
                                                <span className="text-muted-foreground">Pending</span>
                                                <span>{data.pending.toLocaleString()} {data.unit}</span>
                                            </div>
                                            <Progress 
                                                value={(data.processed / (data.processed + data.pending)) * 100} 
                                                className="h-2"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Inventory Distribution Chart */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Processing Status by Stage</CardTitle>
                                <CardDescription>KG/Meters processed vs pending per PO</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <SimulatedChart 
                                    type="bar"
                                    data={[
                                        { label: 'Fiber (KG)', value: '12.5K / 3.5K', percent: 78, color: 'bg-green-500' },
                                        { label: 'Yarn (KG)', value: '10.2K / 2.3K', percent: 82, color: 'bg-blue-500' },
                                        { label: 'Fabric (M)', value: '45K / 15K', percent: 75, color: 'bg-purple-500' },
                                        { label: 'Garments', value: '8.5K / 6.5K', percent: 57, color: 'bg-orange-500' },
                                    ]}
                                />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Order Status Distribution</CardTitle>
                                <CardDescription>Current status of all active POs</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <SimulatedChart 
                                    type="donut"
                                    data={[
                                        { label: 'On Track', value: 18, color: '#22c55e' },
                                        { label: 'At Risk', value: 3, color: '#f59e0b' },
                                        { label: 'Delayed', value: 3, color: '#ef4444' },
                                    ]}
                                />
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Lead Time Tab */}
                <TabsContent value="timeline" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Lead Time Analysis by Stage</CardTitle>
                            <CardDescription>Average days at each production stage vs target</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {leadTimeData.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-4">
                                        <div className="w-40 text-sm font-medium text-foreground">{item.stage}</div>
                                        <div className="flex-1">
                                            <div className="relative h-8 bg-muted rounded-lg overflow-hidden">
                                                <div 
                                                    className={`absolute inset-y-0 left-0 rounded-lg ${
                                                        item.status === 'good' ? 'bg-success' :
                                                        item.status === 'warning' ? 'bg-warning' :
                                                        'bg-destructive'
                                                    }`}
                                                    style={{ width: `${(item.avgDays / 15) * 100}%` }}
                                                />
                                                <div 
                                                    className="absolute inset-y-0 w-0.5 bg-foreground/50"
                                                    style={{ left: `${(item.target / 15) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                        <div className="w-24 text-right">
                                            <span className="font-medium">{item.avgDays}d</span>
                                            <span className="text-muted-foreground text-xs"> / {item.target}d target</span>
                                        </div>
                                        <Badge 
                                            variant="outline"
                                            className={
                                                item.status === 'good' ? 'bg-success/10 text-success border-success/30' :
                                                item.status === 'warning' ? 'bg-warning/10 text-warning border-warning/30' :
                                                'bg-destructive/10 text-destructive border-destructive/30'
                                            }
                                        >
                                            {item.status === 'good' ? 'On Target' : 
                                             item.status === 'warning' ? 'Slight Delay' : 'Critical'}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                            <CardContent className="p-6 text-center">
                                <p className="text-4xl font-bold text-foreground">42</p>
                                <p className="text-sm text-muted-foreground mt-1">Avg Total Lead Time (Days)</p>
                                <Badge variant="outline" className="mt-2 bg-success/10 text-success border-success/30">
                                    <ArrowDown className="h-3 w-3 mr-1" />
                                    3 days faster than target
                                </Badge>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6 text-center">
                                <p className="text-4xl font-bold text-foreground">7</p>
                                <p className="text-sm text-muted-foreground mt-1">Processing Stage (Bottleneck)</p>
                                <Badge variant="outline" className="mt-2 bg-destructive/10 text-destructive border-destructive/30">
                                    <ArrowUp className="h-3 w-3 mr-1" />
                                    2 days over target
                                </Badge>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6 text-center">
                                <p className="text-4xl font-bold text-foreground">85%</p>
                                <p className="text-sm text-muted-foreground mt-1">On-Time Delivery Rate</p>
                                <Badge variant="outline" className="mt-2 bg-warning/10 text-warning border-warning/30">
                                    Target: 90%
                                </Badge>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Bottlenecks Tab */}
                <TabsContent value="bottlenecks" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-destructive" />
                                Bottleneck Detection
                            </CardTitle>
                            <CardDescription>Stages where production is stalled or exceeding estimated time</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {bottleneckData.map((item, idx) => (
                                    <div 
                                        key={idx} 
                                        className={`p-4 rounded-xl border ${
                                            item.impact === 'High' ? 'border-destructive/50 bg-destructive/5' :
                                            item.impact === 'Medium' ? 'border-warning/50 bg-warning/5' :
                                            'border-border bg-muted/30'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <h4 className="font-medium text-foreground">{item.stage}</h4>
                                                <p className="text-sm text-muted-foreground">{item.reason}</p>
                                            </div>
                                            <Badge 
                                                variant="outline"
                                                className={
                                                    item.impact === 'High' ? 'bg-destructive/10 text-destructive' :
                                                    item.impact === 'Medium' ? 'bg-warning/10 text-warning' :
                                                    'bg-muted text-muted-foreground'
                                                }
                                            >
                                                {item.impact} Impact
                                            </Badge>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="text-muted-foreground">Affected POs:</span>
                                                <span className="font-medium ml-2">{item.poCount}</span>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Avg Delay:</span>
                                                <span className="font-medium ml-2">{item.avgDelay} days</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* PO Performance Tab */}
                <TabsContent value="performance" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Purchase Order Performance</CardTitle>
                            <CardDescription>Track progress and delivery status of all active POs</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {poPerformance.map((po) => (
                                    <div key={po.id} className="p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center justify-between mb-3">
                                            <div>
                                                <p className="font-medium text-foreground">{po.id}</p>
                                                <p className="text-sm text-muted-foreground">{po.product}</p>
                                            </div>
                                            <div className="text-right">
                                                <Badge 
                                                    variant="outline"
                                                    className={
                                                        po.status === 'on_track' ? 'bg-success/10 text-success border-success/30' :
                                                        po.status === 'at_risk' ? 'bg-warning/10 text-warning border-warning/30' :
                                                        'bg-destructive/10 text-destructive border-destructive/30'
                                                    }
                                                >
                                                    {po.status === 'on_track' ? 'On Track' : 
                                                     po.status === 'at_risk' ? 'At Risk' : 'Delayed'}
                                                </Badge>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {po.daysRemaining} days remaining
                                                </p>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Progress</span>
                                                <span className="font-medium">{po.progress}%</span>
                                            </div>
                                            <Progress value={po.progress} className="h-2" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default BuyerAnalytics;
