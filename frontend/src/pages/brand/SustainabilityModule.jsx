import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, AlertTriangle, XCircle, Leaf, Award, GitBranch, BarChart3, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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

const TierBar = ({ label, value }) => {
    const color = value >= 75 ? 'bg-emerald-500' : value >= 50 ? 'bg-orange-400' : 'bg-red-500';
    return (
        <div className="flex items-center gap-3 mb-2">
            <span className="text-slate-300 text-sm w-24 shrink-0">{label}</span>
            <div className="flex-1 bg-slate-700 rounded-full h-2">
                <div className={`${color} h-2 rounded-full transition-all duration-700`} style={{ width: `${value}%` }} />
            </div>
            <span className={`text-sm font-semibold w-10 text-right ${color.replace('bg-', 'text-')}`}>{value}%</span>
        </div>
    );
};

const quadrantIcons = {
    sourcing:      Leaf,
    certifications: Award,
    traceability:  GitBranch,
    comparisons:   BarChart3,
};

const SustainabilityModule = () => {
    const navigate = useNavigate();
    const [activeQuadrant, setActiveQuadrant] = useState(null);

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
                    <p className="text-slate-400 mt-1">AW2027 — 4-quadrant sustainability performance view</p>
                </div>
                <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800"
                    onClick={() => navigate('/dashboard/brand')}>
                    ← Back to Dashboard
                </Button>
            </div>

            {/* 4 Quadrant Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sustainabilityData.quadrants.map((q) => {
                    const Icon = quadrantIcons[q.id] || Leaf;
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
                                {/* Score progress */}
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
                                {/* Sourcing bullets */}
                                {q.id === 'sourcing' && q.bullets.map((b, i) => (
                                    <div key={i} className="flex items-start gap-2">
                                        <StatusIcon icon={b.status} />
                                        <p className="text-slate-300 text-sm leading-relaxed">{b.text}</p>
                                    </div>
                                ))}

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

                                {/* Traceability tiers */}
                                {q.id === 'traceability' && (
                                    <div className="pt-1">
                                        {q.tiers.map((t, i) => (
                                            <div key={i}>
                                                <div className="flex justify-between text-xs text-slate-400 mb-1">
                                                    <span>{t.tier} — {t.label}</span>
                                                    {t.gap && <span className="text-red-400 font-semibold">⚠ Gap</span>}
                                                </div>
                                                <TierBar label="" value={t.value} />
                                            </div>
                                        ))}
                                    </div>
                                )}

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

            {/* Navigation row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="border-teal-600/40 text-teal-400 hover:bg-teal-600/10"
                    onClick={() => navigate('/dashboard/brand/certifications')}>
                    Certification Tracker <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="outline" className="border-blue-600/40 text-blue-400 hover:bg-blue-600/10"
                    onClick={() => navigate('/dashboard/brand/supplier-trace')}>
                    Supplier Traceability <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="outline" className="border-purple-600/40 text-purple-400 hover:bg-purple-600/10"
                    onClick={() => navigate('/dashboard/brand/season-benchmark')}>
                    Season Benchmark <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
        </div>
    );
};

export default SustainabilityModule;
