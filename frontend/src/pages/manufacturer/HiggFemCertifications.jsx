import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, Award, ArrowLeft, ExternalLink, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import mfrData from '@/data/manufacturerData.json';

const { higgFEM, certificationStatus } = mfrData;

const HiggBar = ({ module, score, target, status }) => {
    const barColor = status === 'met' ? 'bg-emerald-500' : status === 'close' ? 'bg-orange-400' : 'bg-red-500';
    const textColor = status === 'met' ? 'text-emerald-400' : status === 'close' ? 'text-orange-400' : 'text-red-400';
    return (
        <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
                <span className="text-slate-200 text-sm font-medium">{module}</span>
                <div className="flex items-center gap-3">
                    <span className={`text-sm font-bold ${textColor}`}>{score}%</span>
                    <span className="text-slate-500 text-xs">Target: {target}%</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        status === 'met' ? 'bg-emerald-500/10 text-emerald-400'
                        : status === 'close' ? 'bg-orange-500/10 text-orange-400'
                        : 'bg-red-500/10 text-red-400'}`}>
                        {status === 'met' ? '✓ Met' : status === 'close' ? '~ Close' : '✗ Below'}
                    </span>
                </div>
            </div>
            {/* stacked bar: score vs target */}
            <div className="relative w-full bg-slate-700 rounded-full h-3">
                <div className={`${barColor} h-3 rounded-full transition-all duration-700`} style={{ width: `${score}%` }} />
                {/* target marker */}
                <div className="absolute top-0 bottom-0 w-0.5 bg-white/70"
                    style={{ left: `${target}%`, transform: 'translateX(-50%)' }} />
            </div>
        </div>
    );
};

const CertStatusBadge = ({ status }) => {
    const map = {
        Verified: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
        Partial:  'bg-orange-500/20 text-orange-400 border-orange-500/40',
        Pending:  'bg-orange-500/20 text-orange-400 border-orange-500/40',
        Gap:      'bg-red-500/20 text-red-400 border-red-500/40',
    };
    return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${map[status] || map.Pending}`}>{status}</span>;
};

const HiggFemCertifications = () => {
    const navigate = useNavigate();
    return (
        <div className="space-y-6 pb-8" data-testid="higg-fem-certifications">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Higg FEM + Certifications</h1>
                    <p className="text-slate-400 mt-1">Arvind Mills Ltd — Environmental module scores & certification status</p>
                </div>
                <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800"
                    onClick={() => navigate('/dashboard/manufacturer/overview')}>
                    <ArrowLeft className="h-4 w-4 mr-2" /> Mfr Overview
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* LEFT — Higg FEM */}
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Leaf className="h-5 w-5 text-teal-400" />
                            Higg FEM Environmental Module
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                            Score vs target per environmental pillar — white line marks target
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {higgFEM.map((item, i) => (
                            <HiggBar key={i} {...item} />
                        ))}
                        <div className="mt-4 p-3 rounded-lg bg-slate-900/50 border border-slate-700">
                            <p className="text-slate-400 text-xs">Overall Higg FEM: <strong className="text-white">68/100</strong> · Target: <strong className="text-teal-400">75/100</strong> · Status: <span className="text-orange-400">Below Target</span></p>
                        </div>
                    </CardContent>
                </Card>

                {/* RIGHT — Certification Status */}
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Award className="h-5 w-5 text-amber-400" />
                            Certification Status
                        </CardTitle>
                        <CardDescription className="text-slate-400">Current certification register for this facility</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-900 border-b border-slate-700">
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-white">Certificate</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-white">Status</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-white">Expiry</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-white">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {certificationStatus.map((cert, i) => (
                                        <tr key={cert.name}
                                            className={`border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors ${i % 2 === 0 ? '' : 'bg-slate-900/20'}`}>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    {cert.status === 'Verified' ? <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                                                        : cert.status === 'Gap'  ? <XCircle className="h-3.5 w-3.5 text-red-400" />
                                                        : <Clock className="h-3.5 w-3.5 text-orange-400" />}
                                                    <span className="text-white text-sm font-medium">{cert.name}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4"><CertStatusBadge status={cert.status} /></td>
                                            <td className="py-3 px-4 text-slate-400 text-xs">{cert.expiry}</td>
                                            <td className="py-3 px-4">
                                                <Button size="sm" variant="outline"
                                                    className={`text-xs h-7 px-2.5 ${
                                                        cert.action === 'Apply' || cert.action === 'Upload'
                                                            ? 'border-teal-500/50 text-teal-400 hover:bg-teal-500/10'
                                                            : cert.action === 'Renew' || cert.action === 'Complete'
                                                            ? 'border-orange-500/50 text-orange-400 hover:bg-orange-500/10'
                                                            : 'border-slate-600 text-slate-300'
                                                    }`}>
                                                    {cert.action}
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default HiggFemCertifications;
