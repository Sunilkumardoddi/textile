import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Bell, Info, CheckCircle, TrendingUp, TrendingDown, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import data from '@/data/seasonPOData.json';

const { poTierMap } = data;

const tierColors = {
    Brand:    { dot: 'bg-blue-500', bar: 'bg-blue-500', text: 'text-blue-400' },
    'Tier 1': { dot: 'bg-teal-500', bar: 'bg-teal-500', text: 'text-teal-400' },
    'Tier 2': { dot: 'bg-amber-500', bar: 'bg-amber-500', text: 'text-amber-400' },
    'Tier 3': { dot: 'bg-orange-500', bar: 'bg-orange-500', text: 'text-orange-400' },
    'Tier 4': { dot: 'bg-red-500', bar: 'bg-red-500', text: 'text-red-400' },
};

const alertConfig = {
    Critical: { cls: 'border-l-red-500 bg-red-500/5', badge: 'bg-red-500/20 text-red-400 border-red-500/40', icon: AlertTriangle },
    Warning:  { cls: 'border-l-orange-500 bg-orange-500/5', badge: 'bg-orange-500/20 text-orange-400 border-orange-500/40', icon: Bell },
    Info:     { cls: 'border-l-blue-500 bg-blue-500/5', badge: 'bg-blue-500/20 text-blue-400 border-blue-500/40', icon: Info },
};

const POTierMapAlerts = () => {
    const navigate = useNavigate();
    const { tierMap, allPOs, alerts, footerHealth } = poTierMap;

    const poStatusColor = (s) =>
        s === 'on-track' ? 'bg-emerald-500' : s === 'warning' ? 'bg-orange-400' : 'bg-red-500';

    return (
        <div className="space-y-6 pb-8" data-testid="po-tier-map-alerts">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">PO Tier Map + All POs Progress + Alerts</h1>
                    <p className="text-slate-400 mt-1">AW2027 — Full supply chain overview and health dashboard</p>
                </div>
                <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800"
                    onClick={() => navigate('/dashboard/brand/po-tracker')}>
                    <ArrowLeft className="h-4 w-4 mr-2" /> PO Tracker
                </Button>
            </div>

            {/* 3 columns */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* LEFT — Tier Map */}
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-white text-base">Supply Chain Tier Map</CardTitle>
                        <CardDescription className="text-slate-400">AW2027 — Brand → Tier 4 flow</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {tierMap.map((tier, i) => {
                            const colors = tierColors[tier.tier] || tierColors['Tier 4'];
                            return (
                                <div key={i} className="relative pl-6 pb-5 last:pb-0">
                                    {i < tierMap.length - 1 && (
                                        <div className="absolute left-2 top-5 bottom-0 w-0.5 bg-slate-700" />
                                    )}
                                    <div className={`absolute left-0 top-2 w-4 h-4 rounded-full ${colors.dot}`} />
                                    <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-3 hover:border-slate-600 transition-colors">
                                        <div className="flex justify-between items-start mb-1">
                                            <div>
                                                <span className="text-xs text-slate-500 font-semibold uppercase">{tier.tier}</span>
                                                <p className="text-white text-sm font-semibold">{tier.name}</p>
                                                <p className="text-slate-500 text-xs">{tier.location}</p>
                                            </div>
                                            <span className={`text-sm font-bold ${colors.text}`}>{tier.progress}%</span>
                                        </div>
                                        <p className="text-slate-400 text-xs mb-2">{tier.activity}</p>
                                        <div className="w-full bg-slate-700 rounded-full h-1.5">
                                            <div className={`${colors.bar} h-1.5 rounded-full`} style={{ width: `${tier.progress}%` }} />
                                        </div>
                                        <p className={`text-xs mt-1 ${colors.text}`}>{tier.status}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>

                {/* MIDDLE — All POs Progress */}
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-white text-base">All POs — Season Progress</CardTitle>
                        <CardDescription className="text-slate-400">AW2027 · {allPOs.length} purchase orders</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {allPOs.map((po, i) => {
                            const barColor = poStatusColor(po.status);
                            return (
                                <div key={i}>
                                    <div className="flex justify-between items-center mb-1">
                                        <div>
                                            <span className="text-white text-sm font-semibold">{po.poNo}</span>
                                            <span className="text-slate-500 text-xs ml-2">{po.supplier.split(' ')[0]}</span>
                                        </div>
                                        <span className={`text-sm font-bold ${
                                            po.status === 'on-track' ? 'text-emerald-400'
                                            : po.status === 'warning' ? 'text-orange-400'
                                            : 'text-red-400'}`}>{po.progress}%</span>
                                    </div>
                                    <div className="w-full bg-slate-700 rounded-full h-2.5">
                                        <div className={`${barColor} h-2.5 rounded-full transition-all duration-700`} style={{ width: `${po.progress}%` }} />
                                    </div>
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>

                {/* RIGHT — Supply Chain Alerts */}
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-white text-base flex items-center gap-2">
                            <Bell className="h-4 w-4 text-red-400" />Supply Chain Alerts
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {alerts.map((alert, i) => {
                            const { cls, badge, icon: Icon } = alertConfig[alert.severity] || alertConfig.Info;
                            return (
                                <div key={i} className={`p-3 rounded-lg border-l-4 ${cls}`}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-semibold border ${badge}`}>
                                            <Icon className="h-3 w-3 mr-1" />{alert.severity}
                                        </span>
                                        <span className="text-slate-500 text-xs">{alert.poNo}</span>
                                    </div>
                                    <p className="text-slate-300 text-xs">{alert.message}</p>
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>
            </div>

            {/* Footer health bar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-5 py-4 bg-slate-800/70 border border-teal-600/30 rounded-xl">
                <div className="flex items-center gap-4 flex-wrap">
                    <span className="text-slate-400 text-sm font-medium">Overall AW2027 Supply Chain Health:</span>
                    <div className="flex items-center gap-2">
                        <div className="w-32 bg-slate-700 rounded-full h-2.5">
                            <div className="bg-teal-500 h-2.5 rounded-full" style={{ width: `${footerHealth.overallComplete}%` }} />
                        </div>
                        <span className="text-teal-400 font-bold">{footerHealth.overallComplete}% complete</span>
                    </div>
                </div>
                <div className="flex items-center gap-6 text-sm text-slate-400 flex-wrap">
                    <span>Delivery: <strong className="text-white">{footerHealth.delivery}</strong></span>
                    <span className="text-red-400"><strong>{footerHealth.criticalAlerts}</strong> critical alerts</span>
                    <Button className="bg-teal-600 hover:bg-teal-700 text-white text-xs"
                        onClick={() => navigate('/dashboard/brand/po-tracker')}>
                        View PO Tracker
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default POTierMapAlerts;
