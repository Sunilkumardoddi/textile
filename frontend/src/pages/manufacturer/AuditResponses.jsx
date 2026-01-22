import React, { useState } from 'react';
import { 
    ClipboardCheck, AlertTriangle, CheckCircle2, Clock, 
    MessageSquare, Send, ChevronRight, FileText, Calendar
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

// Mock audit findings data
const mockAuditFindings = [
    {
        id: 'CAR-2024-001',
        auditType: 'BSCI Social Audit',
        auditor: 'SGS Certification',
        auditDate: '2024-01-15',
        finding: 'Fire safety equipment maintenance records incomplete',
        category: 'Health & Safety',
        severity: 'major',
        status: 'open',
        dueDate: '2024-02-15',
        responses: []
    },
    {
        id: 'CAR-2024-002',
        auditType: 'GOTS Certification Audit',
        auditor: 'Control Union',
        auditDate: '2024-01-10',
        finding: 'Chemical storage area lacking proper ventilation',
        category: 'Environmental',
        severity: 'major',
        status: 'in_progress',
        dueDate: '2024-02-10',
        responses: [
            { date: '2024-01-20', message: 'Ventilation system upgrade ordered', by: 'Factory Manager' }
        ]
    },
    {
        id: 'CAR-2024-003',
        auditType: 'WRAP Audit',
        auditor: 'Bureau Veritas',
        auditDate: '2024-01-08',
        finding: 'Worker overtime records need better documentation',
        category: 'Labor Practices',
        severity: 'minor',
        status: 'resolved',
        dueDate: '2024-02-08',
        responses: [
            { date: '2024-01-15', message: 'New digital attendance system implemented', by: 'HR Manager' },
            { date: '2024-01-25', message: 'System verified and operational', by: 'Compliance Officer' }
        ]
    },
    {
        id: 'CAR-2024-004',
        auditType: 'Environmental Audit',
        auditor: 'Intertek',
        auditDate: '2024-01-05',
        finding: 'Wastewater treatment facility capacity below requirements',
        category: 'Environmental',
        severity: 'critical',
        status: 'in_progress',
        dueDate: '2024-03-01',
        responses: [
            { date: '2024-01-12', message: 'Engineering assessment completed', by: 'Environmental Officer' },
            { date: '2024-01-20', message: 'Expansion project approved, contractor selected', by: 'Factory Director' }
        ]
    },
    {
        id: 'OBS-2024-001',
        auditType: 'OEKO-TEX Audit',
        auditor: 'Hohenstein Institute',
        auditDate: '2024-01-18',
        finding: 'Recommendation to improve chemical inventory tracking system',
        category: 'Chemical Management',
        severity: 'observation',
        status: 'acknowledged',
        dueDate: null,
        responses: [
            { date: '2024-01-22', message: 'Observation noted, will consider for next improvement cycle', by: 'Quality Manager' }
        ]
    },
];

const severityConfig = {
    critical: { label: 'Critical', color: 'bg-red-500', badge: 'bg-red-100 text-red-700 border-red-300' },
    major: { label: 'Major', color: 'bg-orange-500', badge: 'bg-orange-100 text-orange-700 border-orange-300' },
    minor: { label: 'Minor', color: 'bg-yellow-500', badge: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
    observation: { label: 'Observation', color: 'bg-blue-500', badge: 'bg-blue-100 text-blue-700 border-blue-300' },
};

const statusConfig = {
    open: { label: 'Open', icon: AlertTriangle, color: 'text-destructive' },
    in_progress: { label: 'In Progress', icon: Clock, color: 'text-warning' },
    resolved: { label: 'Resolved', icon: CheckCircle2, color: 'text-success' },
    acknowledged: { label: 'Acknowledged', icon: CheckCircle2, color: 'text-blue-500' },
};

export const AuditResponses = () => {
    const [findings, setFindings] = useState(mockAuditFindings);
    const [selectedFinding, setSelectedFinding] = useState(null);
    const [responseText, setResponseText] = useState('');
    const [activeTab, setActiveTab] = useState('all');

    const filteredFindings = findings.filter(finding => {
        if (activeTab === 'all') return true;
        if (activeTab === 'open') return finding.status === 'open' || finding.status === 'in_progress';
        if (activeTab === 'resolved') return finding.status === 'resolved' || finding.status === 'acknowledged';
        return finding.severity === activeTab;
    });

    const handleSubmitResponse = () => {
        if (!responseText.trim()) {
            toast.error('Please enter a response');
            return;
        }

        setFindings(findings.map(f => {
            if (f.id === selectedFinding.id) {
                return {
                    ...f,
                    status: 'in_progress',
                    responses: [
                        ...f.responses,
                        { date: new Date().toISOString().split('T')[0], message: responseText, by: 'Factory Manager' }
                    ]
                };
            }
            return f;
        }));

        setResponseText('');
        toast.success('Response submitted successfully');
    };

    const stats = {
        total: findings.length,
        open: findings.filter(f => f.status === 'open').length,
        inProgress: findings.filter(f => f.status === 'in_progress').length,
        resolved: findings.filter(f => f.status === 'resolved' || f.status === 'acknowledged').length,
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
                        Audit Responses
                    </h1>
                    <p className="text-muted-foreground">
                        Respond to audit findings and corrective action requests
                    </p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Total Findings</p>
                                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                            </div>
                            <ClipboardCheck className="h-8 w-8 text-muted-foreground/50" />
                        </div>
                    </CardContent>
                </Card>
                <Card className={stats.open > 0 ? 'border-destructive/50' : ''}>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Open</p>
                                <p className="text-2xl font-bold text-destructive">{stats.open}</p>
                            </div>
                            <AlertTriangle className="h-8 w-8 text-destructive/50" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">In Progress</p>
                                <p className="text-2xl font-bold text-warning">{stats.inProgress}</p>
                            </div>
                            <Clock className="h-8 w-8 text-warning/50" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Resolved</p>
                                <p className="text-2xl font-bold text-success">{stats.resolved}</p>
                            </div>
                            <CheckCircle2 className="h-8 w-8 text-success/50" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="flex-wrap h-auto gap-1 p-1">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="open" className="text-destructive data-[state=active]:text-destructive">
                        Open ({stats.open})
                    </TabsTrigger>
                    <TabsTrigger value="resolved">Resolved</TabsTrigger>
                    <TabsTrigger value="critical">Critical</TabsTrigger>
                    <TabsTrigger value="major">Major</TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="mt-6">
                    <div className="space-y-4">
                        {filteredFindings.map((finding) => {
                            const severity = severityConfig[finding.severity];
                            const status = statusConfig[finding.status];
                            const StatusIcon = status.icon;

                            return (
                                <Card key={finding.id} className="overflow-hidden">
                                    <CardContent className="p-0">
                                        <div className="p-5">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-start gap-3">
                                                    <div className={`mt-1 w-1 h-12 rounded-full ${severity.color}`} />
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h3 className="font-semibold text-foreground">{finding.id}</h3>
                                                            <Badge variant="outline" className={severity.badge}>
                                                                {severity.label}
                                                            </Badge>
                                                            <Badge variant="outline" className="flex items-center gap-1">
                                                                <StatusIcon className={`h-3 w-3 ${status.color}`} />
                                                                {status.label}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground">{finding.auditType} • {finding.auditor}</p>
                                                    </div>
                                                </div>
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button variant="outline" size="sm" onClick={() => setSelectedFinding(finding)}>
                                                            <MessageSquare className="h-4 w-4 mr-2" />
                                                            Respond
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                                        <DialogHeader>
                                                            <DialogTitle>Audit Finding - {finding.id}</DialogTitle>
                                                            <DialogDescription>
                                                                {finding.auditType} by {finding.auditor}
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <div className="space-y-4 py-4">
                                                            {/* Finding Details */}
                                                            <div className="p-4 rounded-lg bg-muted/30">
                                                                <h4 className="font-medium text-foreground mb-2">Finding</h4>
                                                                <p className="text-sm text-muted-foreground">{finding.finding}</p>
                                                                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                                                                    <span className="flex items-center gap-1">
                                                                        <Calendar className="h-3 w-3" />
                                                                        Audit Date: {finding.auditDate}
                                                                    </span>
                                                                    {finding.dueDate && (
                                                                        <span className="flex items-center gap-1">
                                                                            <Clock className="h-3 w-3" />
                                                                            Due: {finding.dueDate}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Response History */}
                                                            {finding.responses.length > 0 && (
                                                                <div>
                                                                    <h4 className="font-medium text-foreground mb-3">Response History</h4>
                                                                    <div className="space-y-3">
                                                                        {finding.responses.map((response, idx) => (
                                                                            <div key={idx} className="flex gap-3 p-3 rounded-lg bg-muted/20">
                                                                                <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                                                                                    <MessageSquare className="h-4 w-4 text-secondary" />
                                                                                </div>
                                                                                <div>
                                                                                    <p className="text-sm text-foreground">{response.message}</p>
                                                                                    <p className="text-xs text-muted-foreground mt-1">
                                                                                        {response.by} • {response.date}
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* New Response */}
                                                            {finding.status !== 'resolved' && (
                                                                <div>
                                                                    <h4 className="font-medium text-foreground mb-2">Add Response</h4>
                                                                    <Textarea
                                                                        placeholder="Enter your response or corrective action taken..."
                                                                        value={responseText}
                                                                        onChange={(e) => setResponseText(e.target.value)}
                                                                        rows={4}
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <DialogFooter>
                                                            {finding.status !== 'resolved' && (
                                                                <Button variant="hero" onClick={handleSubmitResponse}>
                                                                    <Send className="h-4 w-4 mr-2" />
                                                                    Submit Response
                                                                </Button>
                                                            )}
                                                        </DialogFooter>
                                                    </DialogContent>
                                                </Dialog>
                                            </div>

                                            <p className="text-foreground mb-3">{finding.finding}</p>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                    <span>{finding.category}</span>
                                                    <span>•</span>
                                                    <span>Audit: {finding.auditDate}</span>
                                                    {finding.dueDate && (
                                                        <>
                                                            <span>•</span>
                                                            <span className={finding.status === 'open' ? 'text-destructive' : ''}>
                                                                Due: {finding.dueDate}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                                {finding.responses.length > 0 && (
                                                    <Badge variant="secondary" className="text-xs">
                                                        {finding.responses.length} response{finding.responses.length > 1 ? 's' : ''}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </TabsContent>
            </Tabs>

            {filteredFindings.length === 0 && (
                <Card>
                    <CardContent className="p-12 text-center">
                        <ClipboardCheck className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                        <p className="text-muted-foreground">No audit findings to display</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default AuditResponses;
