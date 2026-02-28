import React, { useState } from 'react';
import { 
    FileText, Download, Calendar, Filter, Search, Eye,
    BarChart3, TrendingUp, Package, Factory, Clock, 
    CheckCircle2, AlertTriangle, PieChart, ArrowUpRight
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock reports data
const mockReports = [
    {
        id: 'RPT-2024-001',
        name: 'Monthly Supply Chain Performance',
        type: 'performance',
        period: 'January 2024',
        generatedDate: '2024-02-01',
        status: 'ready',
        format: 'PDF',
        size: '2.4 MB',
    },
    {
        id: 'RPT-2024-002',
        name: 'Supplier Compliance Summary',
        type: 'compliance',
        period: 'Q4 2023',
        generatedDate: '2024-01-15',
        status: 'ready',
        format: 'PDF',
        size: '1.8 MB',
    },
    {
        id: 'RPT-2024-003',
        name: 'Sustainability Impact Report',
        type: 'sustainability',
        period: '2023 Annual',
        generatedDate: '2024-01-20',
        status: 'ready',
        format: 'PDF',
        size: '5.2 MB',
    },
    {
        id: 'RPT-2024-004',
        name: 'Delay Analysis Report',
        type: 'delays',
        period: 'January 2024',
        generatedDate: '2024-02-02',
        status: 'generating',
        format: 'PDF',
        size: '-',
    },
    {
        id: 'RPT-2024-005',
        name: 'Inventory Movement Report',
        type: 'inventory',
        period: 'January 2024',
        generatedDate: '2024-02-01',
        status: 'ready',
        format: 'Excel',
        size: '856 KB',
    },
];

const reportTemplates = [
    { id: 'perf', name: 'Performance Summary', icon: TrendingUp, desc: 'KPIs, lead times, on-time delivery' },
    { id: 'trace', name: 'Traceability Report', icon: Package, desc: 'Full supply chain journey per PO' },
    { id: 'supplier', name: 'Supplier Scorecard', icon: Factory, desc: 'Supplier ratings and metrics' },
    { id: 'delay', name: 'Delay Analysis', icon: AlertTriangle, desc: 'Bottlenecks and root causes' },
    { id: 'sustain', name: 'Sustainability Report', icon: PieChart, desc: 'Environmental impact metrics' },
    { id: 'inventory', name: 'Inventory Report', icon: BarChart3, desc: 'Stock levels and movements' },
];

const typeIcons = {
    performance: TrendingUp,
    compliance: CheckCircle2,
    sustainability: PieChart,
    delays: AlertTriangle,
    inventory: BarChart3,
};

const typeColors = {
    performance: 'bg-primary/10 text-primary',
    compliance: 'bg-success/10 text-success',
    sustainability: 'bg-secondary/10 text-secondary',
    delays: 'bg-destructive/10 text-destructive',
    inventory: 'bg-accent/10 text-accent',
};

export const BuyerReports = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('all');

    const filteredReports = mockReports.filter(report => {
        const matchesSearch = report.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = filterType === 'all' || report.type === filterType;
        return matchesSearch && matchesType;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
                        Reports & Analytics
                    </h1>
                    <p className="text-muted-foreground">
                        Generate and download supply chain reports
                    </p>
                </div>
                <Button variant="hero">
                    <FileText className="h-4 w-4 mr-2" />
                    Generate New Report
                </Button>
            </div>

            <Tabs defaultValue="reports" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="reports">My Reports</TabsTrigger>
                    <TabsTrigger value="templates">Report Templates</TabsTrigger>
                    <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
                </TabsList>

                {/* Reports Tab */}
                <TabsContent value="reports" className="space-y-6">
                    {/* Filters */}
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input 
                                        placeholder="Search reports..." 
                                        className="pl-10"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <Select value={filterType} onValueChange={setFilterType}>
                                    <SelectTrigger className="w-48">
                                        <SelectValue placeholder="Report Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        <SelectItem value="performance">Performance</SelectItem>
                                        <SelectItem value="compliance">Compliance</SelectItem>
                                        <SelectItem value="sustainability">Sustainability</SelectItem>
                                        <SelectItem value="delays">Delays</SelectItem>
                                        <SelectItem value="inventory">Inventory</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select defaultValue="30d">
                                    <SelectTrigger className="w-40">
                                        <Calendar className="h-4 w-4 mr-2" />
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="7d">Last 7 days</SelectItem>
                                        <SelectItem value="30d">Last 30 days</SelectItem>
                                        <SelectItem value="90d">Last 90 days</SelectItem>
                                        <SelectItem value="all">All time</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Reports List */}
                    <div className="space-y-4">
                        {filteredReports.map((report) => {
                            const TypeIcon = typeIcons[report.type] || FileText;
                            return (
                                <Card key={report.id} className="hover:shadow-lg transition-shadow" data-testid={`report-card-${report.id}`}>
                                    <CardContent className="p-5">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-xl ${typeColors[report.type]}`}>
                                                <TypeIcon className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-medium text-foreground">{report.name}</span>
                                                    {report.status === 'generating' && (
                                                        <Badge variant="secondary" className="text-[10px]">
                                                            <Clock className="h-3 w-3 mr-1 animate-spin" />
                                                            Generating
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                    <span>{report.period}</span>
                                                    <span>•</span>
                                                    <span>Generated: {report.generatedDate}</span>
                                                    {report.size !== '-' && (
                                                        <>
                                                            <span>•</span>
                                                            <span>{report.format} ({report.size})</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button variant="ghost" size="sm" disabled={report.status === 'generating'}>
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    View
                                                </Button>
                                                <Button variant="outline" size="sm" disabled={report.status === 'generating'}>
                                                    <Download className="h-4 w-4 mr-1" />
                                                    Download
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    {filteredReports.length === 0 && (
                        <Card>
                            <CardContent className="p-8 text-center">
                                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-lg font-medium text-foreground">No reports found</p>
                                <p className="text-sm text-muted-foreground">Generate a new report or adjust your filters</p>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                {/* Templates Tab */}
                <TabsContent value="templates" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {reportTemplates.map((template) => (
                            <Card 
                                key={template.id} 
                                className="cursor-pointer hover:border-primary/50 hover:shadow-lg transition-all group"
                                data-testid={`template-card-${template.id}`}
                            >
                                <CardContent className="p-5">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                            <template.icon className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-medium text-foreground mb-1">{template.name}</h3>
                                            <p className="text-sm text-muted-foreground">{template.desc}</p>
                                        </div>
                                        <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* Scheduled Tab */}
                <TabsContent value="scheduled" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Scheduled Reports</CardTitle>
                            <CardDescription>Automated reports delivered to your inbox</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="p-4 rounded-xl bg-muted/30 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                            <TrendingUp className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-foreground">Weekly Performance Summary</p>
                                            <p className="text-sm text-muted-foreground">Every Monday at 9:00 AM</p>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="bg-success/10 text-success border-success/30">Active</Badge>
                                </div>
                                <div className="p-4 rounded-xl bg-muted/30 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-secondary/10 text-secondary">
                                            <PieChart className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-foreground">Monthly Sustainability Report</p>
                                            <p className="text-sm text-muted-foreground">1st of every month</p>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="bg-success/10 text-success border-success/30">Active</Badge>
                                </div>
                                <Button variant="outline" className="w-full">
                                    <Clock className="h-4 w-4 mr-2" />
                                    Schedule New Report
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default BuyerReports;
