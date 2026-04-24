import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, AlertTriangle, CheckCircle, Clock, Search, ChevronRight, Filter, Users, Award, Plus, X, Layers } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import mfrData from '@/data/manufacturerData.json';

const ALL_CERTIFICATIONS = [
    'All', 'GOTS', 'OCS', 'GRS', 'RCS', 'HIGG FEM', 'HIGG FSLM',
    'ZDHC', 'Fair Trade', 'OEKO-TEX STD 100', 'OEKO-TEX STEP',
    'OEKO-TEX Organic', 'SUPIMA', 'CMIA', 'PCP', 'BCI',
    'Egyptian Cotton', 'Australian Cotton',
];

const STATUS_OPTIONS = ['All', 'Active', 'Pending', 'Gap', 'Partial'];
const TIER_OPTIONS   = ['All Tiers', 'Tier 1', 'Tier 2', 'Tier 3', 'Tier 4'];

const SWATCH_PALETTE = [
    { name: 'Ivory White',   hex: '#F5F0E8', fabric: 'Cotton Twill 200gsm' },
    { name: 'Navy Indigo',   hex: '#1B2A4A', fabric: 'Denim Warp 12oz' },
    { name: 'Camel Beige',   hex: '#C8A87A', fabric: 'Wool Blend 280gsm' },
    { name: 'Slate Grey',    hex: '#6B7280', fabric: 'Polyester Knit 180gsm' },
    { name: 'Forest Green',  hex: '#2D5016', fabric: 'Organic Cotton 240gsm' },
    { name: 'Burgundy',      hex: '#7C2D3E', fabric: 'Viscose Blend 160gsm' },
    { name: 'Sky Blue',      hex: '#7EC8E3', fabric: 'Chambray 140gsm' },
    { name: 'Warm Sand',     hex: '#D4B896', fabric: 'Linen Weave 200gsm' },
    { name: 'Charcoal',      hex: '#374151', fabric: 'Technical Fleece 320gsm' },
    { name: 'Terracotta',    hex: '#C2714F', fabric: 'Yarn Dyed Twill 220gsm' },
    { name: 'Dusty Rose',    hex: '#D4A3A3', fabric: 'Jersey Knit 160gsm' },
    { name: 'Olive',         hex: '#6B7C35', fabric: 'Canvas Weave 260gsm' },
    { name: 'Off White',     hex: '#EDE8DC', fabric: 'Muslin 120gsm' },
    { name: 'Dark Teal',     hex: '#134E4A', fabric: 'Ponte Roma 240gsm' },
    { name: 'Blush',         hex: '#F4C5C5', fabric: 'Chiffon 60gsm' },
    { name: 'Midnight Blue', hex: '#1E3A5F', fabric: 'Suiting Fabric 300gsm' },
];

const generateSwatches = (supplier) => {
    const start = (supplier.id * 5) % SWATCH_PALETTE.length;
    const count = 5 + (supplier.id % 3);
    return Array.from({ length: count }, (_, i) => SWATCH_PALETTE[(start + i) % SWATCH_PALETTE.length]);
};

const isLight = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 > 128;
};

const statusStyle = {
    Active:  'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
    Pending: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
    Gap:     'bg-red-500/20 text-red-400 border-red-500/40',
    Partial: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
};

const KPISmall = ({ title, value, sub, color }) => (
    <Card className={`bg-gradient-to-br from-slate-800 to-slate-800/50 border ${color}`}>
        <CardContent className="p-5">
            <p className="text-slate-400 text-xs uppercase tracking-wide mb-1">{title}</p>
            <p className="text-3xl font-bold text-white">{value}</p>
            {sub && <p className="text-slate-500 text-xs mt-1">{sub}</p>}
        </CardContent>
    </Card>
);

const CheckItem = ({ item, status }) => (
    <div className="flex items-center gap-2 py-1">
        {status === 'done'
            ? <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
            : <Clock className="h-4 w-4 text-orange-400 shrink-0" />}
        <span className={`text-sm ${status === 'done' ? 'text-slate-300' : 'text-orange-300'}`}>{item}</span>
    </div>
);

const MfrDashboardOverview = () => {
    const navigate = useNavigate();
    const { supplier, kpis, supplierDatabase, poDetail } = mfrData;

    const [search, setSearch]           = useState('');
    const [certFilter, setCertFilter]   = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [tierFilter, setTierFilter]   = useState('All Tiers');
    const [selectedPO, setSelectedPO]   = useState(poDetail.poRef);
    const [page, setPage]               = useState(1);
    const [swatchOpen, setSwatchOpen]   = useState(null);
    const PAGE_SIZE = 10;

    const filtered = useMemo(() => {
        return supplierDatabase.filter(s => {
            const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.location.toLowerCase().includes(search.toLowerCase());
            const matchCert   = certFilter === 'All' || s.certs.includes(certFilter);
            const matchStatus = statusFilter === 'All' || s.status === statusFilter;
            const matchTier   = tierFilter === 'All Tiers' || s.tier === tierFilter;
            return matchSearch && matchCert && matchStatus && matchTier;
        });
    }, [search, certFilter, statusFilter, tierFilter, supplierDatabase]);

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const activeFilters = [
        certFilter !== 'All' && certFilter,
        statusFilter !== 'All' && statusFilter,
        tierFilter !== 'All Tiers' && tierFilter,
    ].filter(Boolean);

    return (
        <div className="space-y-6 pb-8" data-testid="mfr-dashboard-overview">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-slate-500">
                <button onClick={() => navigate('/dashboard/manufacturer')} className="hover:text-teal-400 transition-colors">Manufacturer Dashboard</button>
                <ChevronRight className="h-3.5 w-3.5" />
                <span className="text-slate-300">Mfr Overview</span>
            </div>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">{supplier.name} <span className="text-slate-400 text-xl font-normal">| {supplier.tier}</span></h1>
                    <p className="text-slate-400 mt-1">{supplier.location} · {supplier.activity}</p>
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

            {/* Supplier Database */}
            <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        <div>
                            <CardTitle className="text-white flex items-center gap-2">
                                <Users className="h-5 w-5 text-teal-400" /> Supplier Database
                            </CardTitle>
                            <CardDescription className="text-slate-400 mt-1">
                                {filtered.length} of {supplierDatabase.length} suppliers · Select suppliers and filter by certification &amp; traceability requirements
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button className="bg-teal-600 hover:bg-teal-700 text-white text-sm"
                                onClick={() => navigate('/dashboard/manufacturer/higg-fem')}>
                                Higg FEM &amp; Certs
                            </Button>
                            <Button variant="outline" className="border-slate-600 text-slate-300 text-sm"
                                onClick={() => navigate('/dashboard/manufacturer/traceability-ess')}>
                                Traceability &amp; ESS
                            </Button>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search supplier / location..."
                                value={search}
                                onChange={e => { setSearch(e.target.value); setPage(1); }}
                                className="pl-9 bg-slate-900/40 border-slate-700 text-white placeholder:text-slate-500"
                            />
                        </div>
                        <Select value={certFilter} onValueChange={v => { setCertFilter(v); setPage(1); }}>
                            <SelectTrigger className="bg-slate-900/40 border-slate-700 text-white">
                                <Award className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
                                <SelectValue placeholder="Certification" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700 max-h-60">
                                {ALL_CERTIFICATIONS.map(c => (
                                    <SelectItem key={c} value={c} className="text-white hover:bg-slate-700">{c}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={tierFilter} onValueChange={v => { setTierFilter(v); setPage(1); }}>
                            <SelectTrigger className="bg-slate-900/40 border-slate-700 text-white">
                                <SelectValue placeholder="Tier" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700">
                                {TIER_OPTIONS.map(t => (
                                    <SelectItem key={t} value={t} className="text-white hover:bg-slate-700">{t}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(1); }}>
                            <SelectTrigger className="bg-slate-900/40 border-slate-700 text-white">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700">
                                {STATUS_OPTIONS.map(s => (
                                    <SelectItem key={s} value={s} className="text-white hover:bg-slate-700">{s}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Active filter pills */}
                    {activeFilters.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                            {activeFilters.map(f => (
                                <span key={f} className="px-2 py-0.5 rounded bg-teal-600/20 border border-teal-500/40 text-teal-300 text-xs">{f}</span>
                            ))}
                            <button
                                onClick={() => { setCertFilter('All'); setStatusFilter('All'); setTierFilter('All Tiers'); setSearch(''); setPage(1); }}
                                className="text-slate-500 hover:text-slate-300 text-xs underline">
                                Clear all
                            </button>
                        </div>
                    )}
                </CardHeader>

                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-900 border-b border-slate-700">
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-white">#</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-white">Supplier Name</th>
                                    <th className="text-left py-3 px-3 text-xs font-semibold text-white">Location</th>
                                    <th className="text-left py-3 px-3 text-xs font-semibold text-white">Activity</th>
                                    <th className="text-left py-3 px-3 text-xs font-semibold text-white">Tier</th>
                                    <th className="text-left py-3 px-3 text-xs font-semibold text-white">Certifications</th>
                                    <th className="text-left py-3 px-3 text-xs font-semibold text-white">Traceability</th>
                                    <th className="text-left py-3 px-3 text-xs font-semibold text-white">Status</th>

                                </tr>
                            </thead>
                            <tbody>
                                {paginated.map((s, i) => {
                                    const isOpen = swatchOpen === s.id;
                                    const swatches = generateSwatches(s);
                                    return (
                                        <React.Fragment key={s.id}>
                                            <tr className={`border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors ${i % 2 === 0 ? '' : 'bg-slate-900/20'} ${isOpen ? 'bg-slate-700/30' : ''}`}>
                                                <td className="py-3 px-4 text-slate-500 text-xs">{s.id}</td>
                                                <td className="py-3 px-4 text-white text-sm font-medium">{s.name}</td>
                                                <td className="py-3 px-3 text-slate-400 text-xs">{s.location}</td>
                                                <td className="py-3 px-3 text-slate-400 text-xs">{s.activity}</td>
                                                <td className="py-3 px-3">
                                                    <span className={`text-xs px-2 py-0.5 rounded border ${
                                                        s.tier === 'Tier 1' ? 'bg-teal-500/20 text-teal-300 border-teal-500/40' :
                                                        s.tier === 'Tier 2' ? 'bg-blue-500/20 text-blue-300 border-blue-500/40' :
                                                        s.tier === 'Tier 3' ? 'bg-orange-500/20 text-orange-300 border-orange-500/40' :
                                                        'bg-red-500/20 text-red-300 border-red-500/40'
                                                    }`}>{s.tier}</span>
                                                </td>
                                                <td className="py-3 px-3">
                                                    <div className="flex flex-wrap gap-1">
                                                        {s.certs.slice(0, 3).map(c => (
                                                            <span key={c} className="text-xs px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 border border-slate-600">{c}</span>
                                                        ))}
                                                        {s.certs.length > 3 && (
                                                            <span className="text-xs px-1.5 py-0.5 rounded bg-slate-700 text-slate-400">+{s.certs.length - 3}</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-3">
                                                    <div className="flex items-center gap-2">
                                                        <Progress value={s.tracePercent} className="w-16 h-1.5" />
                                                        <span className={`text-xs font-semibold ${s.tracePercent >= 75 ? 'text-emerald-400' : s.tracePercent >= 50 ? 'text-orange-400' : 'text-red-400'}`}>
                                                            {s.tracePercent}%
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-3">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <span className={`text-xs px-2 py-0.5 rounded border font-semibold ${statusStyle[s.status] || statusStyle.Pending}`}>
                                                            {s.status}
                                                        </span>
                                                        <button
                                                            onClick={() => setSwatchOpen(isOpen ? null : s.id)}
                                                            title="View fabric swatches"
                                                            className={`inline-flex items-center justify-center w-6 h-6 rounded-full border transition-all shrink-0 ${
                                                                isOpen
                                                                    ? 'bg-teal-600 border-teal-500 text-white'
                                                                    : 'border-slate-600 text-slate-400 hover:border-teal-500 hover:text-teal-400 hover:bg-teal-500/10'
                                                            }`}
                                                        >
                                                            {isOpen ? <X className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>

                                            {/* Expandable swatch row */}
                                            {isOpen && (
                                                <tr className="border-b border-teal-500/20 bg-slate-900/60">
                                                    <td colSpan={8} className="px-6 py-4">
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <Layers className="h-3.5 w-3.5 text-teal-400" />
                                                            <span className="text-xs font-semibold text-teal-400 uppercase tracking-wide">
                                                                Fabric Swatches — {s.name}
                                                            </span>
                                                            <span className="text-xs text-slate-500">· {s.activity}</span>
                                                        </div>
                                                        <div className="flex flex-wrap gap-3">
                                                            {swatches.map((sw, idx) => (
                                                                <div key={idx} className="flex flex-col items-center gap-1.5 group cursor-pointer">
                                                                    <div
                                                                        className="w-14 h-14 rounded-lg border-2 border-slate-600 group-hover:border-teal-500 transition-all shadow-md group-hover:scale-105"
                                                                        style={{ backgroundColor: sw.hex }}
                                                                        title={sw.fabric}
                                                                    />
                                                                    <p className={`text-xs font-medium text-center leading-tight max-w-[3.5rem] ${isLight(sw.hex) ? 'text-slate-200' : 'text-slate-300'}`}>
                                                                        {sw.name}
                                                                    </p>
                                                                    <p className="text-[10px] text-slate-500 text-center leading-tight max-w-[3.5rem]">
                                                                        {sw.fabric}
                                                                    </p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                                {paginated.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="py-10 text-center text-slate-500">No suppliers match the selected filters</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-700">
                            <span className="text-slate-500 text-xs">
                                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
                            </span>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 h-7 px-3"
                                    disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                                    Previous
                                </Button>
                                <span className="text-slate-400 text-xs">{page} / {totalPages}</span>
                                <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 h-7 px-3"
                                    disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
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
                        <span>{poDetail.suppliersLinked} suppliers linked</span>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-1">
                        {poDetail.checklist.map((item, i) => (
                            <CheckItem key={i} item={item.item} status={item.status} />
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default MfrDashboardOverview;
