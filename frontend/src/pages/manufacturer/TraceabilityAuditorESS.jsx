import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GitBranch, User, AlertTriangle, CheckCircle, Clock, XCircle, ArrowLeft, Bell } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import mfrData from '@/data/manufacturerData.json';

const { traceabilityTiers, auditor, ess } = mfrData;

const TierCard = ({ tier, name, location, activity, progress, status }) => {
    const barColor = progress >= 75 ? 'bg-emerald-500' : progress >= 50 ? 'bg-orange-400' : 'bg-red-500';
    const statusColor = progress >= 75 ? 'text-emerald-400' : progress >= 50 ? 'text-orange-400' : 'text-red-400';
    return (
        <div className="relative pl-6 pb-6 last:pb-0">
            {/* vertical line */}
            <div className="absolute left-2 top-4 bottom-0 w-0.5 bg-slate-700 last:hidden" />
            {/* dot */}
            <div className={`absolute left-0 top-3 w-4 h-4 rounded-full border-2 border-slate-700 ${barColor}`} />
            <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4 hover:border-slate-600 transition-colors">
                <div className="flex items-start justify-between mb-2">
                    <div>
                        <span className="text-xs text-slate-500 font-semibold uppercase tracking-wide">{tier}</span>
                        <p className="text-white text-sm font-semibold">{name}</p>
                        <p className="text-slate-500 text-xs">{location}</p>
                    </div>
                    <span className={`text-sm font-bold ${statusColor}`}>{progress}%</span>
                </div>
                <p className="text-slate-400 text-xs mb-2.5">{activity}</p>
                <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className={`${barColor} h-2 rounded-full transition-all duration-700`} style={{ width: `${progress}%` }} />
                </div>
                <p className={`text-xs mt-1 ${statusColor}`}>{status}</p>
            </div>
        </div>
    );
};

const AuditStatusBadge = ({ status }) => {
    const map = {
        Verified: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
        Warning:  'bg-orange-500/20 text-orange-400 border-orange-500/40',
    };
    return <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${map[status] || map.Warning}`}>{status}</span>;
};

const ESSAlert = ({ severity, message }) => {
    const map = {
        Critical: { bar: 'border-l-red-500 bg-red-500/5', badge: 'bg-red-500/20 text-red-400 border-red-500/40', icon: XCircle },
        Warning:  { bar: 'border-l-orange-500 bg-orange-500/5', badge: 'bg-orange-500/20 text-orange-400 border-orange-500/40', icon: AlertTriangle },
        Info:     { bar: 'border-l-blue-500 bg-blue-500/5', badge: 'bg-blue-500/20 text-blue-400 border-blue-500/40', icon: Bell },
    };
    const { bar, badge, icon: Icon } = map[severity] || map.Info;
    return (
        <div className={`flex items-start gap-2 p-3 rounded-lg border-l-4 ${bar}`}>
            <Icon className="h-4 w-4 shrink-0 mt-0.5" style={{ color: severity === 'Critical' ? '#F87171' : severity === 'Warning' ? '#FB923C' : '#60A5FA' }} />
            <div>
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-semibold border ${badge} mb-1`}>{severity}</span>
                <p className="text-slate-300 text-xs">{message}</p>
            </div>
        </div>
    );
};

const TraceabilityAuditorESS = () => {
    const navigate = useNavigate();

    return (
        <div className="space-y-6 pb-8" data-testid="traceability-auditor-ess">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Traceability · Auditor · ESS</h1>
                    <p className="text-slate-400 mt-1">Arvind Mills Ltd — supply chain verification, audit, and ESS panel</p>
                </div>
                <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800"
                    onClick={() => navigate('/dashboard/manufacturer/overview')}>
                    <ArrowLeft className="h-4 w-4 mr-2" /> Mfr Overview
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* LEFT — Traceability */}
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <GitBranch className="h-5 w-5 text-teal-400" />Supply Chain Traceability
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {traceabilityTiers.map((tier, i) => (
                            <TierCard key={i} {...tier} />
                        ))}
                    </CardContent>
                </Card>

                {/* MIDDLE — Auditor Module */}
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <User className="h-5 w-5 text-purple-400" />Auditor Module
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Auditor info */}
                        <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                            <p className="text-white font-semibold text-sm">{auditor.name}</p>
                            <p className="text-purple-300 text-xs">{auditor.firm}</p>
                            <p className="text-slate-400 text-xs mt-1">Assessment: {auditor.assessmentDate}</p>
                        </div>

                        {/* Audit items */}
                        <div className="space-y-2">
                            <p className="text-slate-400 text-xs uppercase tracking-wide font-semibold">Audit Checklist</p>
                            {auditor.auditItems.map((item, i) => (
                                <div key={i} className="flex items-start justify-between gap-2 p-3 rounded-lg bg-slate-900/40 border border-slate-700">
                                    <p className="text-slate-300 text-xs flex-1">{item.item}</p>
                                    <AuditStatusBadge status={item.status} />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* RIGHT — ESS Panel */}
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Bell className="h-5 w-5 text-orange-400" />ESS Panel
                        </CardTitle>
                        <CardDescription className="text-slate-400">Environmental & Social Score</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Score */}
                        <div className="flex flex-col items-center justify-center py-4">
                            <div className="relative w-28 h-28 flex items-center justify-center">
                                <svg viewBox="0 0 100 100" className="w-28 h-28 rotate-[-90deg]">
                                    <circle cx="50" cy="50" r="40" fill="none" stroke="#334155" strokeWidth="10" />
                                    <circle cx="50" cy="50" r="40" fill="none" stroke="#14B8A6" strokeWidth="10"
                                        strokeDasharray={`${(ess.score / ess.max) * 251.3} 251.3`} strokeLinecap="round" />
                                </svg>
                                <div className="absolute text-center">
                                    <p className="text-2xl font-bold text-white">{ess.score}</p>
                                    <p className="text-slate-400 text-xs">/ {ess.max}</p>
                                </div>
                            </div>
                            <p className="text-slate-400 text-sm mt-2">ESS Score</p>
                            <Button className="mt-4 w-full bg-teal-600 hover:bg-teal-700 text-white text-sm">
                                Submit ESS Report
                            </Button>
                        </div>

                        {/* Alerts */}
                        <div className="space-y-2">
                            <p className="text-slate-400 text-xs uppercase tracking-wide font-semibold">Alerts</p>
                            {ess.alerts.map((alert, i) => (
                                <ESSAlert key={i} {...alert} />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default TraceabilityAuditorESS;
