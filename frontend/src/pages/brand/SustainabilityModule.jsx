import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, AlertTriangle, XCircle, Award, BarChart3, TrendingUp, TrendingDown, ArrowRight, Factory, Zap, Network } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import sustainabilityData from '@/data/sustainabilityData.json';

const StatusIcon = ({ icon }) => {
    if (icon === 'tick')    return <CheckCircle  className="h-5 w-5 text-emerald-400" />;
    if (icon === 'warning') return <AlertTriangle className="h-5 w-5 text-orange-400" />;
    return <XCircle className="h-5 w-5 text-red-400" />;
};

const ScoreBadge = ({ score, max }) => {
    const pct = (score / max) * 100;
    const cls = pct >= 80 ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
        : pct >= 65    ? 'bg-orange-500/20 text-orange-300 border-orange-500/40'
        :                'bg-red-500/20 text-red-300 border-red-500/40';
    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold border ${cls}`}>
            {score}/{max}
        </span>
    );
};

const scopeStatusStyle = (status) => {
    if (status === 'on_track')     return { bar: 'bg-emerald-500', text: 'text-emerald-400', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', label: 'On Track' };
    if (status === 'above_target') return { bar: 'bg-red-500',     text: 'text-red-400',     badge: 'bg-red-500/20 text-red-300 border-red-500/40',     label: 'Above Target' };
    return { bar: 'bg-orange-400', text: 'text-orange-400', badge: 'bg-orange-500/20 text-orange-300 border-orange-500/40', label: 'Warning' };
};

const ScopeEmissionBox = ({ data, icon: Icon, accentColor }) => {
    const style = scopeStatusStyle(data.status);
    return (
        <Card className={`bg-slate-800/60 border border-slate-700 hover:border-${accentColor}-500/50 transition-all`}>
            <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                    <div className={`p-2.5 rounded-xl bg-${accentColor}-500/10`}>
                        <Icon className={`h-5 w-5 text-${accentColor}-400`} />
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${style.badge}`}>{style.label}</span>
                </div>
                <p className="text-slate-400 text-xs uppercase tracking-wide mb-1">{data.title}</p>
                <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-2xl font-bold text-white">{data.value}</span>
                    <span className="text-slate-400 text-sm">{data.unit}</span>
                </div>
                <p className="text-slate-500 text-xs mb-3">{data.source}</p>
                <div className="w-full bg-slate-700 rounded-full h-1.5 mb-2">
                    <div className={`${style.bar} h-1.5 rounded-full`} style={{ width: '70%' }} />
                </div>
                <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Target: {data.target}</span>
                    <span className={style.text}>{data.change}</span>
                </div>
            </CardContent>
        </Card>
    );
};

const quadrantIcons = {
    certifications: Award,
    comparisons:    BarChart3,
};

const SustainabilityModule = () => {
    const navigate = useNavigate();
    const [activeQuadrant, setActiveQuadrant] = useState(null);
    const { scopeEmissions, quadrants } = sustainabilityData;

    const cardBorder = (color) =>
        color === 'green'  ? 'border-emerald-500/30 hover:border-emerald-500/60'
        : color === 'orange' ? 'border-orange-500/30 hover:border-orange-500/60'
        :                      'border-red-500/30 hover:border-red-500/60';

    return (
        <div className="space-y-6 pb-8" data-testid="sustainability-module">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Sustainability Module</h1>
                    <p className="text-slate-400 mt-1">AW2027 — Emissions, certifications & supply chain performance</p>
                </div>
                <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800"
                    onClick={() => navigate('/dashboard/brand')}>
                    ← Back to Dashboard
                </Button>
            </div>

            {/* Scope Emissions Section */}
            <div>
                <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Factory className="h-5 w-5 text-orange-400" /> GHG Emissions Overview
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <ScopeEmissionBox data={scopeEmissions.scope1}            icon={Factory} accentColor="red" />
                    <ScopeEmissionBox data={scopeEmissions.scope2Electricity}  icon={Zap}     accentColor="teal" />
                    <ScopeEmissionBox data={scopeEmissions.scope2Downstream}   icon={Network} accentColor="orange" />
                </div>
            </div>

            {/* Certification & Comparison Quadrants */}
            <div>
                <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Award className="h-5 w-5 text-emerald-400" /> Certification Performance
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {quadrants.map((q) => {
                        const Icon = quadrantIcons[q.id] || Award;
                        return (
                            <Card key={q.id}
                                className={`bg-slate-800/60 border transition-all cursor-pointer ${cardBorder(q.color)} ${activeQuadrant === q.id ? 'ring-2 ring-teal-500/40' : ''}`}
                                onClick={() => setActiveQuadrant(activeQuadrant === q.id ? null : q.id)}>
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2.5 rounded-xl ${q.color === 'green' ? 'bg-emerald-500/10' : q.color === 'orange' ? 'bg-orange-500/10' : 'bg-red-500/10'}`}>
                                                <Icon className={`h-6 w-6 ${q.color === 'green' ? 'text-emerald-400' : q.color === 'orange' ? 'text-orange-400' : 'text-red-400'}`} />
                                            </div>
                                            <div>
                                                <CardTitle className="text-white text-lg">{q.title}</CardTitle>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <ScoreBadge score={q.score} max={q.max} />
                                            <StatusIcon icon={q.statusIcon} />
                                        </div>
                                    </div>
                                    <div className="mt-3">
                                        <div className="w-full bg-slate-700 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full transition-all duration-700 ${q.color === 'green' ? 'bg-emerald-500' : q.color === 'orange' ? 'bg-orange-400' : 'bg-red-500'}`}
                                                style={{ width: `${(q.score / q.max) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-3">
                                    {/* Certifications fractions */}
                                    {q.id === 'certifications' && q.bullets.map((b, i) => (
                                        <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-900/40">
                                            <div className="flex items-center gap-2">
                                                <span className={`w-2 h-2 rounded-full ${b.status === 'verified' ? 'bg-emerald-500' : 'bg-orange-400'}`} />
                                                <span className="text-slate-300 text-sm font-medium">{b.label}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-white text-sm font-semibold">
                                                    {b.unit ? `${b.obtained}${b.unit}` : `${b.obtained}/${b.required}`}
                                                </span>
                                                <Badge variant="outline" className={b.status === 'verified'
                                                    ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10 text-xs'
                                                    : 'border-orange-500/40 text-orange-400 bg-orange-500/10 text-xs'}>
                                                    {b.status === 'verified' ? 'Verified' : 'Partial'}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Cert comparisons */}
                                    {q.id === 'comparisons' && q.comparisons.map((c, i) => (
                                        <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-900/40">
                                            <span className="text-slate-400 text-sm">{c.label}</span>
                                            <div className="flex items-center gap-1">
                                                {c.trend === 'up'   && <TrendingUp   className="h-3.5 w-3.5 text-emerald-400" />}
                                                {c.trend === 'down' && <TrendingDown  className="h-3.5 w-3.5 text-red-400" />}
                                                <span className={`text-sm font-bold ${c.trend === 'up' ? 'text-emerald-400' : c.trend === 'down' ? 'text-red-400' : 'text-slate-200'}`}>
                                                    {c.value}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>

            {/* Navigation row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="border-teal-600/40 text-teal-400 hover:bg-teal-600/10"
                    onClick={() => navigate('/dashboard/brand/certifications')}>
                    Certification Tracker <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="outline" className="border-blue-600/40 text-blue-400 hover:bg-blue-600/10"
                    onClick={() => navigate('/dashboard/brand/supplier-trace')}>
                    Supplier Traceability <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
        </div>
    );
};

export default SustainabilityModule;
