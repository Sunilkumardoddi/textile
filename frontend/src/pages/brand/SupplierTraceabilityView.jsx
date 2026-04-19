import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Building2, Upload, ArrowLeft, CheckCircle, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import data from '@/data/seasonPOData.json';

const { supplierTraceView } = data;

const StatusBadge = ({ status }) => {
    const map = {
        Certified: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
        Pending:   'bg-orange-500/20 text-orange-400 border-orange-500/40',
        Gap:       'bg-red-500/20 text-red-400 border-red-500/40',
    };
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${map[status] || map.Pending}`}>
            {status}
        </span>
    );
};

const SupplierTraceabilityView = () => {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [selectedSupplier, setSelectedSupplier] = useState(supplierTraceView.suppliers[0]);

    const filtered = supplierTraceView.suppliers.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase())
    );

    const tierColor = (val) =>
        val >= 75 ? 'bg-emerald-500' : val >= 50 ? 'bg-orange-400' : 'bg-red-500';

    return (
        <div className="space-y-6 pb-8" data-testid="supplier-traceability-view">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Supplier Traceability View</h1>
                    <p className="text-slate-400 mt-1">AW2027 — Supplier list, portal submission & supply chain tiers</p>
                </div>
                <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800"
                    onClick={() => navigate('/dashboard/brand')}>
                    <ArrowLeft className="h-4 w-4 mr-2" /> Dashboard
                </Button>
            </div>

            {/* 3-column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* LEFT — Supplier List */}
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-teal-400" />Supplier List
                        </CardTitle>
                        <div className="relative mt-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search suppliers…"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="pl-9 bg-slate-900 border-slate-600 text-white text-sm"
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 divide-y divide-slate-700/50">
                        {filtered.map(s => (
                            <button
                                key={s.name}
                                onClick={() => setSelectedSupplier(s)}
                                className={`w-full text-left px-4 py-3 flex items-center justify-between hover:bg-slate-700/40 transition-colors ${selectedSupplier?.name === s.name ? 'bg-teal-600/10 border-l-2 border-teal-500' : ''}`}
                            >
                                <div>
                                    <p className="text-white text-sm font-medium">{s.name}</p>
                                    <p className="text-slate-500 text-xs">{s.location} · {s.tier}</p>
                                </div>
                                <StatusBadge status={s.status} />
                            </button>
                        ))}
                    </CardContent>
                </Card>

                {/* MIDDLE — System Submit + Portal Accessibility */}
                <div className="space-y-4">
                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardHeader>
                            <CardTitle className="text-white text-base">System Submit Card</CardTitle>
                            <CardDescription className="text-slate-400">Portal data submission status</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {[
                                { label: 'PO Reference', value: supplierTraceView.systemSubmit.poRef },
                                { label: 'Style Count', value: supplierTraceView.systemSubmit.styleCount },
                                { label: 'Suppliers Linked', value: supplierTraceView.systemSubmit.suppliersLinked },
                                { label: 'Certs Uploaded', value: supplierTraceView.systemSubmit.certsUploaded },
                                { label: 'Ready Status', value: supplierTraceView.systemSubmit.readyStatus },
                            ].map(item => (
                                <div key={item.label} className="flex justify-between items-center py-1.5 border-b border-slate-700/50">
                                    <span className="text-slate-400 text-sm">{item.label}</span>
                                    <span className="text-white text-sm font-medium">{item.value}</span>
                                </div>
                            ))}
                            <Button className="w-full mt-2 bg-teal-600 hover:bg-teal-700 text-white">
                                <Upload className="h-4 w-4 mr-2" />Submit to Portal
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardHeader>
                            <CardTitle className="text-white text-base">Portal Accessibility</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {supplierTraceView.systemSubmit.portalAccess.map((item, i) => (
                                <div key={i} className="flex items-start gap-2">
                                    <CheckCircle className="h-4 w-4 text-teal-400 shrink-0 mt-0.5" />
                                    <p className="text-slate-300 text-sm">{item}</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* RIGHT — Supply Chain Traceability */}
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <ChevronRight className="h-5 w-5 text-amber-400" />Supply Chain Traceability
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                            {selectedSupplier?.name} — tier coverage
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        {supplierTraceView.traceability.map((tier, i) => (
                            <div key={i}>
                                <div className="flex justify-between items-center mb-1.5">
                                    <div>
                                        <p className="text-white text-sm font-semibold">{tier.tier}</p>
                                        <p className="text-slate-500 text-xs">{tier.label}</p>
                                    </div>
                                    <span className={`text-sm font-bold ${tier.value >= 75 ? 'text-emerald-400' : tier.value >= 50 ? 'text-orange-400' : 'text-red-400'}`}>
                                        {tier.value}%
                                    </span>
                                </div>
                                <div className="w-full bg-slate-700 rounded-full h-3">
                                    <div className={`${tierColor(tier.value)} h-3 rounded-full transition-all duration-700`} style={{ width: `${tier.value}%` }} />
                                </div>
                                {i < supplierTraceView.traceability.length - 1 && (
                                    <div className="flex justify-center mt-2">
                                        <div className="h-4 w-0.5 bg-slate-600" />
                                    </div>
                                )}
                            </div>
                        ))}

                        <div className="pt-3 border-t border-slate-700">
                            <p className="text-slate-400 text-xs">Tier 3 & 4 mapping below industry benchmark. Accelerate supplier onboarding to improve traceability score.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default SupplierTraceabilityView;
