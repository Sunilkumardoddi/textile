import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Globe, FileCheck, AlertTriangle, 
    LogOut, Bell, Search, ChevronRight, 
    ClipboardCheck, Shield, Calendar, 
    Clock, CheckCircle2, ArrowUpRight, XCircle, MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

// Mock data for auditor dashboard
const mockMetrics = [
    { label: 'Audits Completed', value: '156', change: '+23 this month', icon: FileCheck, color: 'text-success' },
    { label: 'Pending Reviews', value: '12', change: '4 urgent', icon: ClipboardCheck, color: 'text-warning' },
    { label: 'Compliance Rate', value: '91%', change: 'Industry avg: 85%', icon: Shield, color: 'text-secondary' },
    { label: 'Non-Compliances', value: '8', change: 'Requires action', icon: AlertTriangle, color: 'text-destructive' },
];

const mockScheduledAudits = [
    { id: 'AUD-001', facility: 'Dhaka Textiles Ltd', type: 'Environmental', date: '2024-02-08', location: 'Dhaka, Bangladesh', status: 'Scheduled' },
    { id: 'AUD-002', facility: 'Mumbai Fabrics Co', type: 'Social Compliance', date: '2024-02-12', location: 'Mumbai, India', status: 'In Progress' },
    { id: 'AUD-003', facility: 'Vietnam Textiles', type: 'Quality Control', date: '2024-02-15', location: 'Ho Chi Minh, Vietnam', status: 'Scheduled' },
    { id: 'AUD-004', facility: 'Shanghai Mills', type: 'Safety', date: '2024-02-18', location: 'Shanghai, China', status: 'Pending Review' },
];

const mockRecentFindings = [
    { facility: 'Jakarta Garments', finding: 'Fire safety equipment outdated', severity: 'high', date: '2 days ago' },
    { facility: 'Lahore Textiles', finding: 'Worker overtime exceeds limits', severity: 'medium', date: '3 days ago' },
    { facility: 'Chennai Fabrics', finding: 'Documentation incomplete', severity: 'low', date: '5 days ago' },
    { facility: 'Manila Mills', finding: 'Chemical storage non-compliant', severity: 'high', date: '1 week ago' },
];

export const AuditorDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('textileUser');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        } else {
            navigate('/login');
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('textileUser');
        toast.success('Logged out successfully');
        navigate('/login');
    };

    const getSeverityStyles = (severity) => {
        switch (severity) {
            case 'high': return 'bg-destructive/10 text-destructive border-destructive/20';
            case 'medium': return 'bg-warning/10 text-warning border-warning/20';
            case 'low': return 'bg-muted text-muted-foreground border-border';
            default: return 'bg-muted text-muted-foreground border-border';
        }
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case 'In Progress': return 'bg-accent/10 text-accent border-accent/20';
            case 'Pending Review': return 'bg-warning/10 text-warning border-warning/20';
            case 'Scheduled': return 'bg-secondary/10 text-secondary border-secondary/20';
            default: return 'bg-muted text-muted-foreground border-border';
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-background">
            {/* Top Navigation */}
            <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
                <div className="container flex h-16 items-center justify-between px-4 md:px-6">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Globe className="h-7 w-7 text-secondary" />
                            <span className="font-heading text-xl font-bold text-foreground">TextileTrace</span>
                        </div>
                        <Badge variant="secondary" className="hidden md:flex bg-success/10 text-success border-success/20">
                            Auditor Portal
                        </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="relative hidden md:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search audits, facilities..." 
                                className="pl-10 w-64 bg-muted/50"
                            />
                        </div>
                        <Button variant="ghost" size="icon" className="relative">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
                        </Button>
                        <div className="flex items-center gap-3 pl-3 border-l border-border">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-medium text-foreground">{user.name}</p>
                                <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={handleLogout}>
                                <LogOut className="h-5 w-5 text-muted-foreground" />
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container px-4 md:px-6 py-8">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-2">
                        Auditor Dashboard
                    </h1>
                    <p className="text-muted-foreground">
                        Monitor compliance and manage audit schedules across the supply chain.
                    </p>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {mockMetrics.map((metric, index) => (
                        <Card key={index} className="bg-card hover:shadow-lg transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">{metric.label}</p>
                                        <p className="text-2xl font-bold text-foreground">{metric.value}</p>
                                        <p className="text-xs mt-1 text-muted-foreground">
                                            {metric.change}
                                        </p>
                                    </div>
                                    <div className={`p-3 rounded-xl bg-muted ${metric.color}`}>
                                        <metric.icon className="h-5 w-5" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Scheduled Audits */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="font-heading text-lg">Scheduled Audits</CardTitle>
                                    <CardDescription>Upcoming facility inspections</CardDescription>
                                </div>
                                <Button variant="ghost" size="sm" className="text-secondary">
                                    View Calendar <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {mockScheduledAudits.map((audit) => (
                                    <div 
                                        key={audit.id} 
                                        className="p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <p className="font-medium text-foreground">{audit.facility}</p>
                                                <p className="text-sm text-muted-foreground">{audit.type} Audit</p>
                                            </div>
                                            <Badge variant="outline" className={getStatusStyles(audit.status)}>
                                                {audit.status}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-4 w-4" />
                                                <span>{audit.date}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <MapPin className="h-4 w-4" />
                                                <span>{audit.location}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recent Findings */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-heading text-lg">Recent Findings</CardTitle>
                            <CardDescription>Compliance issues requiring attention</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {mockRecentFindings.map((finding, index) => (
                                <div key={index} className="p-3 rounded-lg bg-muted/30">
                                    <div className="flex items-start gap-3">
                                        <div className={`mt-1 p-1.5 rounded-lg ${
                                            finding.severity === 'high' ? 'bg-destructive/10' : 
                                            finding.severity === 'medium' ? 'bg-warning/10' : 'bg-muted'
                                        }`}>
                                            {finding.severity === 'high' ? (
                                                <XCircle className="h-4 w-4 text-destructive" />
                                            ) : finding.severity === 'medium' ? (
                                                <AlertTriangle className="h-4 w-4 text-warning" />
                                            ) : (
                                                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-foreground truncate">
                                                {finding.facility}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                                {finding.finding}
                                            </p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <Badge variant="outline" className={`text-[10px] ${getSeverityStyles(finding.severity)}`}>
                                                    {finding.severity}
                                                </Badge>
                                                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {finding.date}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: 'New Audit Report', icon: FileCheck, desc: 'Create inspection report' },
                        { label: 'Schedule Audit', icon: Calendar, desc: 'Plan facility visit' },
                        { label: 'Compliance Check', icon: ClipboardCheck, desc: 'Run compliance scan' },
                        { label: 'View Certificates', icon: Shield, desc: 'Manage certifications' },
                    ].map((action, index) => (
                        <Card 
                            key={index} 
                            className="group cursor-pointer hover:border-success/50 hover:shadow-lg transition-all"
                        >
                            <CardContent className="p-5 flex items-start gap-4">
                                <div className="p-3 rounded-xl bg-success/10 text-success group-hover:bg-success group-hover:text-success-foreground transition-colors">
                                    <action.icon className="h-5 w-5" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-foreground group-hover:text-success transition-colors">
                                        {action.label}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {action.desc}
                                    </p>
                                </div>
                                <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default AuditorDashboard;
