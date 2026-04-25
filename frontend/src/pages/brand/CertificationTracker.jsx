import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, AlertTriangle, CheckCircle, XCircle, Clock, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import certData from '@/data/certificationData.json';

const StatusBadge = ({ status }) => {
    const map = {
        Verified: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
        Partial:  'bg-orange-500/20 text-orange-400 border-orange-500/40',
        Good:     'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
        Gap:      'bg-red-500/20 text-red-400 border-red-500/40',
    };
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${map[status] || map.Partial}`}>
            {status}
        </span>
    );
};

const SummaryCard = ({ label, value, color }) => (
    <div className={`flex flex-col items-center justify-center p-5 rounded-xl border ${color} bg-slate-900/40`}>
        <p className="text-3xl font-bold text-white">{value}</p>
        <p className="text-slate-400 text-xs mt-1 text-center leading-tight">{label}</p>
    </div>
);

const CertificationTracker = () => {
    const navigate = useNavigate();
    const { summary, certifications } = certData;
    const expiringCerts = certifications.filter(c => c.daysToExpiry !== null && c.daysToExpiry <= 90);

    return (
        <div className="space-y-6 pb-8" data-testid="certification-tracker">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Certification Tracker</h1>
                    <p className="text-slate-400 mt-1">AW2027 — Certification status across all supplier tiers</p>
                </div>
                <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800"
                    onClick={() => navigate('/dashboard/brand')}>
                    <ArrowLeft className="h-4 w-4 mr-2" /> Sustainability Module
                </Button>
            </div>

            {/* Summary bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <SummaryCard label="Total Certs Required" value={summary.totalRequired} color="border-slate-700" />
                <SummaryCard label="Obtained" value={summary.obtained} color="border-emerald-500/30" />
                <SummaryCard label="Pending / Expiring" value={summary.pendingExpiring} color="border-orange-500/30" />
                <SummaryCard label="Missing / Gap" value={summary.missingGap} color="border-red-500/30" />
            </div>

            {/* Expiry warning bar */}
            {expiringCerts.length > 0 && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-orange-500/10 border border-orange-500/30">
                    <AlertTriangle className="h-5 w-5 text-orange-400 shrink-0" />
                    <p className="text-orange-300 text-sm font-medium">
                        <strong>{expiringCerts.length} certification{expiringCerts.length > 1 ? 's' : ''}</strong> expiring within <strong>90 days</strong>: {expiringCerts.map(c => c.name).join(', ')}
                    </p>
                </div>
            )}

            {/* Certification Table */}
            <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <Award className="h-5 w-5 text-amber-400" />
                        Certification Register
                    </CardTitle>
                    <CardDescription className="text-slate-400">Click a row to view details</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-900 border-b border-slate-700">
                                    <th className="text-left py-3 px-5 text-sm font-semibold text-white">Certification</th>
                                    <th className="text-left py-3 px-5 text-sm font-semibold text-white">Required For</th>
                                    <th className="text-left py-3 px-5 text-sm font-semibold text-white">Suppliers Covered</th>
                                    <th className="text-left py-3 px-5 text-sm font-semibold text-white">Valid Until</th>
                                    <th className="text-left py-3 px-5 text-sm font-semibold text-white">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {certifications.map((cert, i) => (
                                    <tr key={cert.name}
                                        className={`border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors cursor-pointer ${i % 2 === 0 ? '' : 'bg-slate-900/20'}`}>
                                        <td className="py-3.5 px-5">
                                            <div className="flex items-center gap-2">
                                                {cert.status === 'Verified' || cert.status === 'Good'
                                                    ? <CheckCircle className="h-4 w-4 text-emerald-400" />
                                                    : cert.status === 'Partial'
                                                    ? <Clock className="h-4 w-4 text-orange-400" />
                                                    : <XCircle className="h-4 w-4 text-red-400" />
                                                }
                                                <span className="font-semibold text-white text-sm">{cert.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-5 text-slate-300 text-sm">{cert.requiredFor}</td>
                                        <td className="py-3.5 px-5 text-slate-300 text-sm">{cert.suppliersCovered}</td>
                                        <td className="py-3.5 px-5 text-sm">
                                            {cert.daysToExpiry !== null && cert.daysToExpiry <= 90
                                                ? <span className="text-orange-400 font-medium">{cert.validUntil} ⚠</span>
                                                : <span className="text-slate-300">{cert.validUntil}</span>
                                            }
                                        </td>
                                        <td className="py-3.5 px-5">
                                            <StatusBadge status={cert.status} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Bottom warning */}
            {summary.expiringWithin90Days > 0 && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                    <AlertTriangle className="h-5 w-5 text-red-400 shrink-0" />
                    <p className="text-red-300 text-sm">
                        <strong>{summary.expiringWithin90Days} certifications</strong> expiring within 90 days — action required before next sourcing lock date.
                    </p>
                </div>
            )}
        </div>
    );
};

export default CertificationTracker;
