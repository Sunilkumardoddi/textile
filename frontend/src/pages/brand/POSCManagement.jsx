import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ShoppingCart, DollarSign, ClipboardCheck, Layers, GitBranch,
    Leaf, QrCode, ArrowRight, TrendingUp, Package, AlertTriangle,
    CheckCircle, Clock
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

// ── Static Data ────────────────────────────────────────────────────────────────

const MODULES = [
    {
        id:      'po-sc-management',
        label:   'PO & Supply Chain Management',
        icon:    ShoppingCart,
        color:   'blue',
        path:    '/dashboard/brand/po-sc-management',
        current: true,
        desc:    'Central hub — overview of all PO and supply chain workflows',
        stat:    '14 Active POs',
    },
    {
        id:    'po-garment-costing',
        label: 'PO Wise Garment Costing',
        icon:  DollarSign,
        color: 'amber',
        path:  '/dashboard/brand/po-garment-costing',
        desc:  'Full BOM, CMT & FOB cost sheet per style and colour lot',
        stat:  '4 Styles · $234K FOB',
    },
    {
        id:    'po-fit-samples',
        label: 'PO Fit Samples Approval & Follow-ups',
        icon:  ClipboardCheck,
        color: 'purple',
        path:  '/dashboard/brand/po-fit-samples',
        desc:  'Track fit sample submissions, approvals, and revision cycles',
        stat:  '6 Pending Approvals',
    },
    {
        id:    'po-lot-creation',
        label: 'PO Wise Internal Lot Creation',
        icon:  Layers,
        color: 'teal',
        path:  '/dashboard/brand/po-lot-creation',
        desc:  'Colour-wise internal lot numbers linked to buyer PO reference',
        stat:  '16 Lots · 12,400 pcs',
    },
    {
        id:    'po-traceability',
        label: 'PO Wise Traceability',
        icon:  GitBranch,
        color: 'green',
        path:  '/dashboard/brand/po-traceability',
        desc:  'End-to-end supply chain traceability per PO — fibre to finished goods',
        stat:  '78% Tier coverage',
    },
    {
        id:    'po-sustainability',
        label: 'PO Wise Sustainability',
        icon:  Leaf,
        color: 'emerald',
        path:  '/dashboard/brand/po-sustainability',
        desc:  'Carbon footprint, water usage, and certification compliance per PO',
        stat:  'GHG: 14.2 kgCO₂e/pc',
    },
    {
        id:    'po-qr-scan',
        label: 'Supply Chain QR Code Scan Visibility',
        icon:  QrCode,
        color: 'orange',
        path:  '/dashboard/brand/po-qr-scan',
        desc:  'Real-time QR scan events from factory floor to port of export',
        stat:  '1,204 Scan Events',
    },
];

const PO_PIPELINE = [
    { po: 'PO-AW27-4812', brand: 'Zara (Inditex)',   styles: 4, qty: '12,400', value: '$234,760', stage: 'Costing',    pct: 45, alert: false },
    { po: 'PO-AW27-3991', brand: 'H&M Group',        styles: 3, qty:  '8,600', value: '$142,500', stage: 'Lot Creation',pct: 62, alert: false },
    { po: 'PO-AW27-5100', brand: 'Marks & Spencer',  styles: 5, qty: '15,200', value: '$298,400', stage: 'Fit Samples', pct: 28, alert: true  },
    { po: 'PO-AW27-0011', brand: 'Next PLC',         styles: 2, qty:  '5,800', value: '$89,320',  stage: 'Production',  pct: 80, alert: false },
    { po: 'PO-AW27-2244', brand: 'Primark',          styles: 6, qty: '24,000', value: '$312,000', stage: 'QC Review',   pct: 90, alert: false },
    { po: 'PO-AW27-7731', brand: 'C&A',              styles: 3, qty:  '9,200', value: '$156,400', stage: 'Costing',     pct: 15, alert: true  },
];

const STAGE_COLOR = {
    Costing:      'bg-amber-500/20 text-amber-400 border-amber-500/40',
    'Lot Creation':'bg-teal-500/20 text-teal-400 border-teal-500/40',
    'Fit Samples':'bg-purple-500/20 text-purple-400 border-purple-500/40',
    Production:   'bg-blue-500/20 text-blue-400 border-blue-500/40',
    'QC Review':  'bg-orange-500/20 text-orange-400 border-orange-500/40',
};

const COLOR_MAP = {
    blue:    { bg: 'bg-blue-500/10',    icon: 'text-blue-400',    border: 'border-blue-500/30 hover:border-blue-500/60'    },
    amber:   { bg: 'bg-amber-500/10',   icon: 'text-amber-400',   border: 'border-amber-500/30 hover:border-amber-500/60'   },
    purple:  { bg: 'bg-purple-500/10',  icon: 'text-purple-400',  border: 'border-purple-500/30 hover:border-purple-500/60' },
    teal:    { bg: 'bg-teal-500/10',    icon: 'text-teal-400',    border: 'border-teal-500/30 hover:border-teal-500/60'    },
    green:   { bg: 'bg-green-500/10',   icon: 'text-green-400',   border: 'border-green-500/30 hover:border-green-500/60'   },
    emerald: { bg: 'bg-emerald-500/10', icon: 'text-emerald-400', border: 'border-emerald-500/30 hover:border-emerald-500/60'},
    orange:  { bg: 'bg-orange-500/10',  icon: 'text-orange-400',  border: 'border-orange-500/30 hover:border-orange-500/60' },
};

// ── Component ─────────────────────────────────────────────────────────────────

const POSCManagement = () => {
    const navigate = useNavigate();

    const totalValue = '$1.23M';
    const activePOs  = PO_PIPELINE.length;
    const alerts     = PO_PIPELINE.filter(p => p.alert).length;
    const readyPOs   = PO_PIPELINE.filter(p => p.pct >= 80).length;

    return (
        <div className="space-y-6 pb-8" data-testid="po-sc-management">

            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white">PO & Supply Chain Management</h1>
                <p className="text-slate-400 mt-1">AW2027 — End-to-end PO workflow from costing to QR scan visibility</p>
            </div>

            {/* KPI Strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Active POs',     value: activePOs,   sub: 'season AW2027',        icon: ShoppingCart, color: 'text-white',       bg: 'bg-blue-500/10',    iconColor: 'text-blue-400'    },
                    { label: 'Total Value',    value: totalValue,  sub: 'FOB across all POs',    icon: DollarSign,   color: 'text-amber-400',   bg: 'bg-amber-500/10',   iconColor: 'text-amber-400'   },
                    { label: 'Alerts',         value: alerts,      sub: 'require attention',     icon: AlertTriangle,color: 'text-orange-400',  bg: 'bg-orange-500/10',  iconColor: 'text-orange-400'  },
                    { label: 'Near Ready',     value: readyPOs,    sub: 'POs ≥ 80% complete',   icon: CheckCircle,  color: 'text-emerald-400', bg: 'bg-emerald-500/10', iconColor: 'text-emerald-400' },
                ].map((kpi, i) => (
                    <Card key={i} className="bg-slate-800/50 border-slate-700">
                        <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                                <p className="text-slate-400 text-xs uppercase tracking-wide">{kpi.label}</p>
                                <div className={`p-1.5 rounded-lg ${kpi.bg}`}>
                                    <kpi.icon className={`h-4 w-4 ${kpi.iconColor}`} />
                                </div>
                            </div>
                            <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
                            <p className="text-slate-500 text-xs mt-0.5">{kpi.sub}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Module Navigation Grid */}
            <div>
                <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400 mb-3">Workflow Modules</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {MODULES.filter(m => !m.current).map(mod => {
                        const cm = COLOR_MAP[mod.color];
                        const Icon = mod.icon;
                        return (
                            <Card key={mod.id}
                                className={`bg-slate-800/60 border transition-all cursor-pointer ${cm.border}`}
                                onClick={() => navigate(mod.path)}>
                                <CardContent className="p-5">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className={`p-2.5 rounded-xl ${cm.bg}`}>
                                            <Icon className={`h-5 w-5 ${cm.icon}`} />
                                        </div>
                                        <span className={`text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300`}>
                                            {mod.stat}
                                        </span>
                                    </div>
                                    <p className="text-white text-sm font-semibold mb-1">{mod.label}</p>
                                    <p className="text-slate-400 text-xs leading-relaxed">{mod.desc}</p>
                                    <div className="flex items-center gap-1 mt-3">
                                        <span className={`text-xs font-semibold ${cm.icon}`}>Open Module</span>
                                        <ArrowRight className={`h-3 w-3 ${cm.icon}`} />
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>

            {/* Active PO Pipeline Table */}
            <div>
                <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400 mb-3">Active PO Pipeline</h2>
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-900 border-b border-slate-700">
                                        {['PO Number','Brand','Styles','Qty (pcs)','Value (FOB)','Current Stage','Progress','Alert'].map(h => (
                                            <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-white whitespace-nowrap">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {PO_PIPELINE.map((po, i) => (
                                        <tr key={i} className={`border-b border-slate-700/50 transition-colors hover:bg-slate-700/20 ${i % 2 === 0 ? '' : 'bg-slate-900/20'} ${po.alert ? 'border-l-2 border-l-orange-500' : ''}`}>
                                            <td className="py-3 px-4">
                                                <span className="text-white text-xs font-bold font-mono">{po.po}</span>
                                            </td>
                                            <td className="py-3 px-4 text-slate-300 text-xs">{po.brand}</td>
                                            <td className="py-3 px-4 text-slate-400 text-xs text-center">{po.styles}</td>
                                            <td className="py-3 px-4 text-slate-300 text-xs font-mono">{po.qty}</td>
                                            <td className="py-3 px-4 text-amber-400 text-xs font-semibold font-mono">{po.value}</td>
                                            <td className="py-3 px-4">
                                                <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold border ${STAGE_COLOR[po.stage] || 'bg-slate-500/20 text-slate-400 border-slate-500/40'}`}>
                                                    {po.stage}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-20 bg-slate-700 rounded-full h-1.5">
                                                        <div className={`h-1.5 rounded-full ${po.pct >= 80 ? 'bg-emerald-500' : po.pct >= 50 ? 'bg-teal-500' : 'bg-orange-500'}`}
                                                            style={{ width: `${po.pct}%` }} />
                                                    </div>
                                                    <span className="text-slate-400 text-xs">{po.pct}%</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                {po.alert
                                                    ? <span className="flex items-center gap-1 text-xs text-orange-400"><AlertTriangle className="h-3.5 w-3.5" />Action needed</span>
                                                    : <span className="flex items-center gap-1 text-xs text-slate-500"><CheckCircle className="h-3.5 w-3.5" />On Track</span>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick-action nav row */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                    { label: 'Open Garment Costing',   path: '/dashboard/brand/po-garment-costing', color: 'border-amber-600/40 text-amber-400 hover:bg-amber-600/10'    },
                    { label: 'Open Lot Creation',      path: '/dashboard/brand/po-lot-creation',    color: 'border-teal-600/40 text-teal-400 hover:bg-teal-600/10'       },
                    { label: 'Open PO Traceability',   path: '/dashboard/brand/po-traceability',    color: 'border-green-600/40 text-green-400 hover:bg-green-600/10'     },
                    { label: 'Open PO Sustainability', path: '/dashboard/brand/po-sustainability',  color: 'border-emerald-600/40 text-emerald-400 hover:bg-emerald-600/10'},
                    { label: 'Open QR Scan Visibility',path: '/dashboard/brand/po-qr-scan',         color: 'border-orange-600/40 text-orange-400 hover:bg-orange-600/10'  },
                    { label: 'Open Fit Samples',       path: '/dashboard/brand/po-fit-samples',     color: 'border-purple-600/40 text-purple-400 hover:bg-purple-600/10'  },
                ].map((btn, i) => (
                    <button key={i} onClick={() => navigate(btn.path)}
                        className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-sm font-medium ${btn.color}`}>
                        {btn.label}
                        <ArrowRight className="h-4 w-4 ml-2" />
                    </button>
                ))}
            </div>
        </div>
    );
};

export default POSCManagement;
