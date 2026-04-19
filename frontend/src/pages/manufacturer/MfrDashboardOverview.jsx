import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Package, AlertTriangle, CheckCircle, Clock, Search, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import mfrData from '@/data/manufacturerData.json';

const StatusBadge = ({ status }) => {
    const map = {
        Active:  'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
        Pending: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
        Gap:     'bg-red-500/20 text-red-400 border-red-500/40',
    };
    return <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${map[status] || map.Pending}`}>{status}</span>;
};

const CheckItem = ({ item, status }) => (
    <div className="flex items-center gap-2 py-1">
        {status === 'done'
            ? <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
            : <Clock className="h-4 w-4 text-orange-400 shrink-0" />}
        <span className={`text-sm ${status === 'done' ? 'text-slate-300' : 'text-orange-300'}`}>{item}</span>
    </div>
);

const KPISmall = ({ title, value, sub, color }) => (
    <Card className={`bg-gradient-to-br from-slate-800 to-slate-800/50 border ${color}`}>
        <CardContent className="p-5">
            <p className="text-slate-400 text-xs uppercase tracking-wide mb-1">{title}</p>
            <p className="text-3xl font-bold text-white">{value}</p>
            {sub && <p className="text-slate-500 text-xs mt-1">{sub}</p>}
        </CardContent>
    </Card>
);

const MfrDashboardOverview = () => {
    const navigate = useNavigate();
    const [selectedBrand, setSelectedBrand] = useState('H&M Group');
    const [selectedPO, setSelectedPO] = useState('PO-2027-001');
    const { supplier, kpis, brands, poDetail } = mfrData;

    return (
        <div className="space-y-6 pb-8" data-testid="mfr-dashboard-overview">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-slate-500">
                <button onClick={() => navigate('/dashboard/brand')} className="hover:text-teal-400 transition-colors">Brand Dashboard</button>
                <ChevronRight className="h-3.5 w-3.5" />
                <button onClick={() => navigate('/dashboard/manufacturer')} className="hover:text-teal-400 transition-colors">Tier 1 Supplier</button>
                <ChevronRight className="h-3.5 w-3.5" />
                <span className="text-slate-300">Mfr Dashboard</span>
            </div>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">{supplier.name} <span className="text-slate-400 text-xl font-normal">| {supplier.tier}</span></h1>
                    <p className="text-slate-400 mt-1">{supplier.location} · {supplier.activity}</p>
                </div>
                <div className="flex items-center gap-3">
                    <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                        <SelectTrigger className="w-[150px] bg-amber-600/20 border-amber-500/50 text-amber-300">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                            {brands.map(b => <SelectItem key={b.name} value={b.name} className="text-white">{b.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Select value={selectedPO} onValueChange={setSelectedPO}>
                        <SelectTrigger className="w-[160px] bg-slate-800 border-slate-600 text-white">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                            {brands.map(b => <SelectItem key={b.poRef} value={b.poRef} className="text-white">{b.poRef}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <KPISmall title="Active POs" value={kpis.activePOs.value} sub={kpis.activePOs.subtitle} color="border-blue-500/30" />
                <KPISmall title="Open Requirements" value={kpis.openRequirements.value} sub={kpis.openRequirements.subtitle} color="border-orange-500/30" />
                <Card className="bg-gradient-to-br from-slate-800 to-slate-800/50 border-teal-500/30">
                    <CardContent className="p-5">
                        <p className="text-slate-400 text-xs uppercase tracking-wide mb-1">Higg FEM Score</p>
                        <p className="text-3xl font-bold text-white">{kpis.higgFEMScore.value}%</p>
                        <div className="flex items-center gap-2 mt-2">
                            <div className="flex-1 bg-slate-700 rounded-full h-1.5">
                                <div className="bg-teal-500 h-1.5 rounded-full" style={{ width: `${kpis.higgFEMScore.value}%` }} />
                            </div>
                            <span className="text-slate-500 text-xs">Target {kpis.higgFEMScore.target}%</span>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-slate-800 to-slate-800/50 border-emerald-500/30">
                    <CardContent className="p-5">
                        <p className="text-slate-400 text-xs uppercase tracking-wide mb-1">Cert Compliance</p>
                        <p className="text-3xl font-bold text-white">{kpis.certCompliance.value}%</p>
                        <p className="text-orange-400 text-xs mt-1">{kpis.certCompliance.pending} pending</p>
                    </CardContent>
                </Card>
            </div>

            {/* Brands Box + PO Detail */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Brands Box */}
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-amber-400" />Brands Box
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 divide-y divide-slate-700/50">
                        {brands.map((brand) => (
                            <div key={brand.name}
                                onClick={() => setSelectedBrand(brand.name)}
                                className={`px-5 py-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-700/30 transition-colors ${selectedBrand === brand.name ? 'bg-teal-600/10 border-l-2 border-teal-500' : ''}`}>
                                <div>
                                    <p className="text-white text-sm font-medium">{brand.name}</p>
                                    <p className="text-slate-500 text-xs">{brand.poRef}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded">
                                        {brand.certBadge}
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <Progress value={brand.tracePercent} className="w-16 h-1.5" />
                                        <span className="text-slate-400 text-xs">{brand.tracePercent}%</span>
                                    </div>
                                    <StatusBadge status={brand.status} />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* PO Detail */}
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Package className="h-5 w-5 text-orange-400" />PO Detail — {poDetail.poRef}
                        </CardTitle>
                        <div className="flex gap-4 text-sm text-slate-400">
                            <span>{poDetail.styleCount} styles</span>
                            <span>·</span>
                            <span>{poDetail.quantity}</span>
                            <span>·</span>
                            <span>{poDetail.suppliersLinked} suppliers</span>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-1">
                            {poDetail.checklist.map((item, i) => (
                                <CheckItem key={i} item={item.item} status={item.status} />
                            ))}
                        </div>
                        <div className="grid grid-cols-2 gap-3 mt-5">
                            <Button className="bg-teal-600 hover:bg-teal-700 text-white text-sm"
                                onClick={() => navigate('/dashboard/manufacturer/higg-fem')}>
                                Higg FEM & Certs
                            </Button>
                            <Button variant="outline" className="border-slate-600 text-slate-300 text-sm"
                                onClick={() => navigate('/dashboard/manufacturer/traceability-ess')}>
                                Traceability & ESS
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default MfrDashboardOverview;
