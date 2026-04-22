import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, Plus, CheckCircle, Clock, ArrowLeft, Hash, Download, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// ── Static Seed Data ───────────────────────────────────────────────────────────

const PO_OPTIONS = [
    { id: 'PO-AW27-4812', brand: 'Zara (Inditex)',  season: 'AW2027', totalQty: 12400 },
    { id: 'PO-AW27-3991', brand: 'H&M Group',        season: 'AW2027', totalQty:  8600 },
    { id: 'PO-AW27-5100', brand: 'Marks & Spencer',  season: 'AW2027', totalQty: 15200 },
];

const SEED_LOT_DATA = {
    'PO-AW27-4812': [
        {
            styleNo: 'ZR-AW27-JK001', styleName: 'Wool Blend Overcoat', category: 'Outerwear', totalQty: 3200,
            lots: [
                { lotNo: 'LOT-JK001-CHC-01', colour: 'Charcoal Melange', hex: '#3a3f4a', poRef: 'PO-AW27-4812-A', ratio: '1:2:3:2:1', qty: 800,  ef: '28 Sep 2027', fob: '$48.20', status: 'Confirmed'   },
                { lotNo: 'LOT-JK001-OAT-02', colour: 'Oat Beige',        hex: '#d4c5a9', poRef: 'PO-AW27-4812-B', ratio: '1:2:3:2:1', qty: 720,  ef: '29 Sep 2027', fob: '$48.20', status: 'Confirmed'   },
                { lotNo: 'LOT-JK001-NVY-03', colour: 'Deep Navy',         hex: '#1b2a4a', poRef: 'PO-AW27-4812-C', ratio: '1:2:3:2:1', qty: 960,  ef: '30 Sep 2027', fob: '$48.20', status: 'In Progress' },
                { lotNo: 'LOT-JK001-BUR-04', colour: 'Burgundy',           hex: '#6b1a2e', poRef: 'PO-AW27-4812-D', ratio: '1:2:3:2:1', qty: 720,  ef: '01 Oct 2027', fob: '$48.20', status: 'Draft'      },
            ],
        },
        {
            styleNo: 'ZR-AW27-SW002', styleName: 'Merino Turtleneck', category: 'Knitwear', totalQty: 4800,
            lots: [
                { lotNo: 'LOT-SW002-IVY-01', colour: 'Ivory White',   hex: '#f2ede2', poRef: 'PO-AW27-4812-E', ratio: '1:2:4:2:1', qty: 1200, ef: '25 Sep 2027', fob: '$28.50', status: 'Confirmed'   },
                { lotNo: 'LOT-SW002-MST-02', colour: 'Mustard Yellow', hex: '#c8922a', poRef: 'PO-AW27-4812-F', ratio: '1:2:4:2:1', qty: 1000, ef: '26 Sep 2027', fob: '$28.50', status: 'In Progress' },
                { lotNo: 'LOT-SW002-GRN-03', colour: 'Forest Green',   hex: '#2e4a2e', poRef: 'PO-AW27-4812-G', ratio: '1:2:4:2:1', qty: 1400, ef: '27 Sep 2027', fob: '$28.50', status: 'Draft'      },
                { lotNo: 'LOT-SW002-RST-04', colour: 'Rust Orange',    hex: '#8b3a2a', poRef: 'PO-AW27-4812-H', ratio: '1:2:4:2:1', qty: 1200, ef: '28 Sep 2027', fob: '$28.50', status: 'Draft'      },
            ],
        },
        {
            styleNo: 'ZR-AW27-TR003', styleName: 'Flannel Wide-Leg Trouser', category: 'Bottoms', totalQty: 2800,
            lots: [
                { lotNo: 'LOT-TR003-CHC-01', colour: 'Charcoal Check', hex: '#3a3f4a', poRef: 'PO-AW27-4812-I', ratio: '1:2:3:2:1', qty: 700, ef: '02 Oct 2027', fob: '$22.80', status: 'Confirmed' },
                { lotNo: 'LOT-TR003-TAN-02', colour: 'Tan Brown',       hex: '#a0785a', poRef: 'PO-AW27-4812-J', ratio: '1:2:3:2:1', qty: 700, ef: '03 Oct 2027', fob: '$22.80', status: 'Draft'     },
                { lotNo: 'LOT-TR003-BLK-03', colour: 'Jet Black',        hex: '#1a1a1a', poRef: 'PO-AW27-4812-K', ratio: '1:2:3:2:1', qty: 700, ef: '04 Oct 2027', fob: '$22.80', status: 'Draft'     },
                { lotNo: 'LOT-TR003-OLV-04', colour: 'Olive Drab',       hex: '#6b7a3e', poRef: 'PO-AW27-4812-L', ratio: '1:2:3:2:1', qty: 700, ef: '05 Oct 2027', fob: '$22.80', status: 'Draft'     },
            ],
        },
        {
            styleNo: 'ZR-AW27-DRS004', styleName: 'Velvet Midi Dress', category: 'Dresses', totalQty: 1600,
            lots: [
                { lotNo: 'LOT-DRS004-EMR-01', colour: 'Emerald Green', hex: '#1d6b4a', poRef: 'PO-AW27-4812-M', ratio: '1:2:3:2:1', qty: 400, ef: '06 Oct 2027', fob: '$34.10', status: 'Confirmed' },
                { lotNo: 'LOT-DRS004-PUR-02', colour: 'Deep Purple',    hex: '#4a1a6b', poRef: 'PO-AW27-4812-N', ratio: '1:2:3:2:1', qty: 400, ef: '07 Oct 2027', fob: '$34.10', status: 'Draft'     },
                { lotNo: 'LOT-DRS004-BUR-03', colour: 'Burgundy',        hex: '#6b1a2e', poRef: 'PO-AW27-4812-O', ratio: '1:2:3:2:1', qty: 400, ef: '08 Oct 2027', fob: '$34.10', status: 'Draft'     },
                { lotNo: 'LOT-DRS004-BLK-04', colour: 'Jet Black',       hex: '#1a1a1a', poRef: 'PO-AW27-4812-P', ratio: '1:2:3:2:1', qty: 400, ef: '09 Oct 2027', fob: '$34.10', status: 'Draft'     },
            ],
        },
    ],
    'PO-AW27-3991': [
        {
            styleNo: 'HM-AW27-PK001', styleName: 'Quilted Puffer Jacket', category: 'Outerwear', totalQty: 3200,
            lots: [
                { lotNo: 'LOT-PK001-BLK-01', colour: 'Jet Black',   hex: '#1a1a1a', poRef: 'PO-AW27-3991-A', ratio: '1:2:3:2:1', qty: 800, ef: '20 Sep 2027', fob: '$38.60', status: 'Confirmed'   },
                { lotNo: 'LOT-PK001-RED-02', colour: 'Cherry Red',  hex: '#b31e2e', poRef: 'PO-AW27-3991-B', ratio: '1:2:3:2:1', qty: 720, ef: '21 Sep 2027', fob: '$38.60', status: 'In Progress' },
                { lotNo: 'LOT-PK001-NVY-03', colour: 'Dark Navy',   hex: '#1b2a4a', poRef: 'PO-AW27-3991-C', ratio: '1:2:3:2:1', qty: 680, ef: '22 Sep 2027', fob: '$38.60', status: 'Draft'      },
                { lotNo: 'LOT-PK001-OLV-04', colour: 'Army Olive',  hex: '#4a5230', poRef: 'PO-AW27-3991-D', ratio: '1:2:3:2:1', qty: 600, ef: '23 Sep 2027', fob: '$38.60', status: 'Draft'      },
                { lotNo: 'LOT-PK001-TAN-05', colour: 'Camel Tan',   hex: '#c4956a', poRef: 'PO-AW27-3991-E', ratio: '1:2:3:2:1', qty: 400, ef: '24 Sep 2027', fob: '$38.60', status: 'Draft'      },
            ],
        },
        {
            styleNo: 'HM-AW27-CN002', styleName: 'Cable-Knit Cardigan', category: 'Knitwear', totalQty: 2800,
            lots: [
                { lotNo: 'LOT-CN002-CRM-01', colour: 'Cream',     hex: '#f5ede0', poRef: 'PO-AW27-3991-F', ratio: '1:2:4:2:1', qty: 900, ef: '18 Sep 2027', fob: '$24.40', status: 'Confirmed' },
                { lotNo: 'LOT-CN002-GRY-02', colour: 'Mid Grey',  hex: '#808080', poRef: 'PO-AW27-3991-G', ratio: '1:2:4:2:1', qty: 800, ef: '19 Sep 2027', fob: '$24.40', status: 'Confirmed' },
                { lotNo: 'LOT-CN002-RST-03', colour: 'Rust',      hex: '#8b3a2a', poRef: 'PO-AW27-3991-H', ratio: '1:2:4:2:1', qty: 600, ef: '20 Sep 2027', fob: '$24.40', status: 'Draft'     },
                { lotNo: 'LOT-CN002-BLK-04', colour: 'Black',     hex: '#1a1a1a', poRef: 'PO-AW27-3991-I', ratio: '1:2:4:2:1', qty: 500, ef: '21 Sep 2027', fob: '$24.40', status: 'Draft'     },
            ],
        },
        {
            styleNo: 'HM-AW27-TR003', styleName: 'Corduroy Slim Trouser', category: 'Bottoms', totalQty: 2600,
            lots: [
                { lotNo: 'LOT-CRTR-TAN-01', colour: 'Tan',       hex: '#c4956a', poRef: 'PO-AW27-3991-J', ratio: '1:2:3:2:1', qty: 700, ef: '17 Sep 2027', fob: '$19.80', status: 'Confirmed' },
                { lotNo: 'LOT-CRTR-BLK-02', colour: 'Black',     hex: '#1a1a1a', poRef: 'PO-AW27-3991-K', ratio: '1:2:3:2:1', qty: 700, ef: '18 Sep 2027', fob: '$19.80', status: 'Confirmed' },
                { lotNo: 'LOT-CRTR-BRG-03', colour: 'Burgundy',  hex: '#6b1a2e', poRef: 'PO-AW27-3991-L', ratio: '1:2:3:2:1', qty: 600, ef: '19 Sep 2027', fob: '$19.80', status: 'Draft'     },
                { lotNo: 'LOT-CRTR-FOR-04', colour: 'Forest',    hex: '#2e4a2e', poRef: 'PO-AW27-3991-M', ratio: '1:2:3:2:1', qty: 600, ef: '20 Sep 2027', fob: '$19.80', status: 'Draft'     },
            ],
        },
    ],
    'PO-AW27-5100': [
        {
            styleNo: 'MS-AW27-CT001', styleName: 'Cashmere Blend Coat', category: 'Outerwear', totalQty: 2400,
            lots: [
                { lotNo: 'LOT-CT001-CAM-01', colour: 'Camel',       hex: '#c4956a', poRef: 'PO-AW27-5100-A', ratio: '1:2:3:2:1', qty: 600, ef: '05 Oct 2027', fob: '$92.50', status: 'Confirmed'   },
                { lotNo: 'LOT-CT001-CHC-02', colour: 'Charcoal',    hex: '#3a3f4a', poRef: 'PO-AW27-5100-B', ratio: '1:2:3:2:1', qty: 600, ef: '06 Oct 2027', fob: '$92.50', status: 'In Progress' },
                { lotNo: 'LOT-CT001-CRM-03', colour: 'Cream',        hex: '#f5ede0', poRef: 'PO-AW27-5100-C', ratio: '1:2:3:2:1', qty: 600, ef: '07 Oct 2027', fob: '$92.50', status: 'Draft'      },
                { lotNo: 'LOT-CT001-NVY-04', colour: 'Navy',         hex: '#1b2a4a', poRef: 'PO-AW27-5100-D', ratio: '1:2:3:2:1', qty: 600, ef: '08 Oct 2027', fob: '$92.50', status: 'Draft'      },
            ],
        },
        {
            styleNo: 'MS-AW27-SW002', styleName: 'Lambswool Crew Neck', category: 'Knitwear', totalQty: 3600,
            lots: [
                { lotNo: 'LOT-SW002-NVY-01', colour: 'Navy',     hex: '#1b2a4a', poRef: 'PO-AW27-5100-E', ratio: '1:2:4:2:1', qty: 1200, ef: '01 Oct 2027', fob: '$42.00', status: 'Confirmed' },
                { lotNo: 'LOT-SW002-BRG-02', colour: 'Burgundy', hex: '#6b1a2e', poRef: 'PO-AW27-5100-F', ratio: '1:2:4:2:1', qty: 1000, ef: '02 Oct 2027', fob: '$42.00', status: 'Confirmed' },
                { lotNo: 'LOT-SW002-HGR-03', colour: 'Heather Grey',hex: '#9090a0',poRef: 'PO-AW27-5100-G', ratio: '1:2:4:2:1', qty: 800, ef: '03 Oct 2027', fob: '$42.00', status: 'Draft'     },
                { lotNo: 'LOT-SW002-FOR-04', colour: 'Forest',    hex: '#2e4a2e', poRef: 'PO-AW27-5100-H', ratio: '1:2:4:2:1', qty: 600, ef: '04 Oct 2027', fob: '$42.00', status: 'Draft'     },
            ],
        },
        {
            styleNo: 'MS-AW27-TR003', styleName: 'Tweed Straight Trouser', category: 'Bottoms', totalQty: 2800,
            lots: [
                { lotNo: 'LOT-TWT-HRB-01', colour: 'Herringbone',hex: '#5a5050', poRef: 'PO-AW27-5100-I', ratio: '1:2:3:2:1', qty: 700, ef: '03 Oct 2027', fob: '$36.20', status: 'Confirmed' },
                { lotNo: 'LOT-TWT-BLK-02', colour: 'Black',       hex: '#1a1a1a', poRef: 'PO-AW27-5100-J', ratio: '1:2:3:2:1', qty: 700, ef: '04 Oct 2027', fob: '$36.20', status: 'Draft'     },
                { lotNo: 'LOT-TWT-NVY-03', colour: 'Navy',         hex: '#1b2a4a', poRef: 'PO-AW27-5100-K', ratio: '1:2:3:2:1', qty: 700, ef: '05 Oct 2027', fob: '$36.20', status: 'Draft'     },
                { lotNo: 'LOT-TWT-CHC-04', colour: 'Charcoal',    hex: '#3a3f4a', poRef: 'PO-AW27-5100-L', ratio: '1:2:3:2:1', qty: 700, ef: '06 Oct 2027', fob: '$36.20', status: 'Draft'     },
            ],
        },
        {
            styleNo: 'MS-AW27-SC004', styleName: 'Merino Scarf & Gloves Set', category: 'Accessories', totalQty: 2400,
            lots: [
                { lotNo: 'LOT-SCF-CAM-01', colour: 'Camel',     hex: '#c4956a', poRef: 'PO-AW27-5100-M', ratio: '—', qty: 600, ef: '30 Sep 2027', fob: '$18.80', status: 'Confirmed' },
                { lotNo: 'LOT-SCF-CHC-02', colour: 'Charcoal',  hex: '#3a3f4a', poRef: 'PO-AW27-5100-N', ratio: '—', qty: 600, ef: '01 Oct 2027', fob: '$18.80', status: 'Confirmed' },
                { lotNo: 'LOT-SCF-BRG-03', colour: 'Burgundy',  hex: '#6b1a2e', poRef: 'PO-AW27-5100-O', ratio: '—', qty: 600, ef: '02 Oct 2027', fob: '$18.80', status: 'Draft'     },
                { lotNo: 'LOT-SCF-NVY-04', colour: 'Navy',      hex: '#1b2a4a', poRef: 'PO-AW27-5100-P', ratio: '—', qty: 600, ef: '03 Oct 2027', fob: '$18.80', status: 'Draft'     },
            ],
        },
        {
            styleNo: 'MS-AW27-BL005', styleName: 'Silk Blouse', category: 'Tops', totalQty: 4000,
            lots: [
                { lotNo: 'LOT-BL005-IVY-01', colour: 'Ivory',    hex: '#f5ede0', poRef: 'PO-AW27-5100-Q', ratio: '1:2:4:2:1', qty: 1200, ef: '28 Sep 2027', fob: '$28.40', status: 'Confirmed'   },
                { lotNo: 'LOT-BL005-BLK-02', colour: 'Black',     hex: '#1a1a1a', poRef: 'PO-AW27-5100-R', ratio: '1:2:4:2:1', qty: 1000, ef: '29 Sep 2027', fob: '$28.40', status: 'In Progress' },
                { lotNo: 'LOT-BL005-DRS-03', colour: 'Dusty Rose', hex: '#d4a0a0', poRef: 'PO-AW27-5100-S', ratio: '1:2:4:2:1', qty: 1000, ef: '30 Sep 2027', fob: '$28.40', status: 'Draft'      },
                { lotNo: 'LOT-BL005-SGR-04', colour: 'Sage Green', hex: '#8ba888', poRef: 'PO-AW27-5100-T', ratio: '1:2:4:2:1', qty: 800,  ef: '01 Oct 2027', fob: '$28.40', status: 'Draft'      },
            ],
        },
    ],
};

const SIZE_RATIOS = ['1:2:3:2:1', '1:1:2:2:1', '1:2:2:2:1', '2:3:4:3:2', '1:2:4:2:1', '—'];

const STATUS_STYLES = {
    Confirmed:    'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
    'In Progress':'bg-orange-500/20 text-orange-400 border-orange-500/40',
    Draft:        'bg-slate-500/20 text-slate-400 border-slate-500/40',
};

const STATUS_ICON = {
    Confirmed:    <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />,
    'In Progress':<div className="h-3.5 w-3.5 rounded-full border-2 border-orange-400 flex items-center justify-center"><div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" /></div>,
    Draft:        <Clock className="h-3.5 w-3.5 text-slate-500" />,
};

// ── Component ─────────────────────────────────────────────────────────────────

const POInternalLotCreation = () => {
    const navigate = useNavigate();
    const [activePO,    setActivePO]    = useState('PO-AW27-4812');
    const [activeStyle, setActiveStyle] = useState(0);
    const [addingLot,   setAddingLot]   = useState(false);
    const [newLot,      setNewLot]      = useState({ colour: '', hex: '#888888', ratio: '1:2:3:2:1', qty: '', exFactory: '' });

    // mutable lot statuses — keyed by lotNo, overrides seed status
    const [lotStatuses, setLotStatuses] = useState({});
    // new lots added via the form — keyed by "poId|styleIdx"
    const [addedLots, setAddedLots] = useState({});

    const getStatus = (lotNo, seedStatus) => lotStatuses[lotNo] ?? seedStatus;

    const confirmLot = (lotNo) =>
        setLotStatuses(prev => ({ ...prev, [lotNo]: 'Confirmed' }));

    const confirmAllStyle = (lots) =>
        setLotStatuses(prev => {
            const next = { ...prev };
            lots.forEach(l => { next[l.lotNo] = 'Confirmed'; });
            return next;
        });

    const saveLot = () => {
        if (!newLot.colour || !newLot.qty) return;
        const key = `${activePO}|${activeStyle}`;
        const styleData = (SEED_LOT_DATA[activePO] || [])[activeStyle];
        if (!styleData) return;
        const idx = (addedLots[key] || []).length + 1;
        const code = newLot.colour.replace(/\s+/g,'').substring(0,3).toUpperCase();
        const lotNo = `LOT-NEW${idx}-${code}-${String(Date.now()).slice(-4)}`;
        const newRow = {
            lotNo, colour: newLot.colour, hex: newLot.hex,
            poRef: `${activePO}-NEW${idx}`, ratio: newLot.ratio,
            qty: parseInt(newLot.qty) || 0, ef: newLot.exFactory || '—', fob: '—', status: 'Draft',
        };
        setAddedLots(prev => ({ ...prev, [key]: [...(prev[key] || []), newRow] }));
        setNewLot({ colour: '', hex: '#888888', ratio: '1:2:3:2:1', qty: '', exFactory: '' });
        setAddingLot(false);
    };

    const poData = SEED_LOT_DATA[activePO] || [];

    const getEffectiveLots = (styleIdx) => {
        const seed = (poData[styleIdx] || {}).lots || [];
        const extra = addedLots[`${activePO}|${styleIdx}`] || [];
        return [...seed, ...extra];
    };

    const styleData = poData[activeStyle] || poData[0];
    const effectiveLots = getEffectiveLots(activeStyle);

    const totalLots = useMemo(() =>
        poData.reduce((sum, _, i) => sum + getEffectiveLots(i).length, 0),
    [activePO, addedLots]); // eslint-disable-line

    const confirmedLots = useMemo(() =>
        poData.reduce((sum, _, i) =>
            sum + getEffectiveLots(i).filter(l => getStatus(l.lotNo, l.status) === 'Confirmed').length, 0),
    [activePO, lotStatuses, addedLots]); // eslint-disable-line

    const totalQty = useMemo(() =>
        poData.reduce((sum, s) => sum + s.totalQty, 0),
    [activePO]); // eslint-disable-line

    return (
        <div className="space-y-6 pb-8" data-testid="po-internal-lot-creation">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">PO Wise Internal Lot Creation</h1>
                    <p className="text-slate-400 mt-1">AW2027 — Colour-wise lot numbers linked to buyer PO reference</p>
                </div>
                <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800"
                    onClick={() => navigate('/dashboard/brand/po-sc-management')}>
                    <ArrowLeft className="h-4 w-4 mr-2" /> PO & SC Management
                </Button>
            </div>

            {/* KPI Strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Lots',      value: totalLots,               sub: 'across all styles',    color: 'text-white'       },
                    { label: 'Confirmed',        value: confirmedLots,           sub: 'lots finalised',       color: 'text-emerald-400' },
                    { label: 'Draft / Pending',  value: totalLots-confirmedLots, sub: 'awaiting confirmation',color: 'text-orange-400'  },
                    { label: 'Total PO Qty',     value: totalQty.toLocaleString(),sub: 'pcs across all styles',color: 'text-teal-400'   },
                ].map((kpi, i) => (
                    <Card key={i} className="bg-slate-800/50 border-slate-700">
                        <CardContent className="p-4">
                            <p className="text-slate-400 text-xs uppercase tracking-wide mb-1">{kpi.label}</p>
                            <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
                            <p className="text-slate-500 text-xs mt-0.5">{kpi.sub}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* PO Selector */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700 flex-wrap">
                <span className="text-slate-500 text-xs font-semibold uppercase tracking-widest">Buyer PO</span>
                {PO_OPTIONS.map(po => (
                    <button key={po.id} onClick={() => { setActivePO(po.id); setActiveStyle(0); }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                            activePO === po.id
                                ? 'bg-teal-600/20 border-teal-500/50 text-teal-300'
                                : 'bg-slate-900/40 border-slate-700 text-slate-400 hover:border-slate-500'
                        }`}>
                        {po.id}
                    </button>
                ))}
                <span className="text-xs text-slate-500 hidden sm:block">— {PO_OPTIONS.find(p=>p.id===activePO)?.brand}</span>
                <div className="ml-auto flex gap-2">
                    <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 text-xs h-8">
                        <Download className="h-3 w-3 mr-1" />Export
                    </Button>
                    <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white text-xs h-8">
                        <Send className="h-3 w-3 mr-1" />Send to Manufacturer
                    </Button>
                </div>
            </div>

            {/* Main Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                {/* LEFT — Style List */}
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-white text-sm">Styles in PO</CardTitle>
                        <CardDescription className="text-slate-400 text-xs">{poData.length} styles</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        {poData.map((s, i) => {
                            const eLots    = getEffectiveLots(i);
                            const confirmed = eLots.filter(l => getStatus(l.lotNo, l.status) === 'Confirmed').length;
                            const pct       = Math.round((confirmed / eLots.length) * 100);
                            return (
                                <div key={i} onClick={() => setActiveStyle(i)}
                                    className={`p-3 cursor-pointer border-b border-slate-700/50 transition-all ${
                                        activeStyle === i
                                            ? 'bg-teal-600/10 border-l-2 border-l-teal-500'
                                            : 'hover:bg-slate-700/30'
                                    }`}>
                                    <p className="text-slate-500 text-xs font-mono">{s.styleNo}</p>
                                    <p className="text-white text-xs font-semibold mt-0.5">{s.styleName}</p>
                                    <div className="flex items-center justify-between mt-1.5">
                                        <span className="text-xs text-slate-400">{eLots.length} lots · {s.totalQty.toLocaleString()} pcs</span>
                                        <span className={`text-xs font-semibold ${confirmed === eLots.length ? 'text-emerald-400' : 'text-orange-400'}`}>
                                            {confirmed}/{eLots.length} ✓
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-700 rounded-full h-1 mt-1.5">
                                        <div className="bg-teal-500 h-1 rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
                                    </div>
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>

                {/* RIGHT — Lot Table */}
                <Card className="lg:col-span-3 bg-slate-800/50 border-slate-700">
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <div>
                                <CardTitle className="text-white">{styleData?.styleName}</CardTitle>
                                <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                                    <span className="font-mono">{styleData?.styleNo}</span>
                                    <span>·</span>
                                    <span>{styleData?.category}</span>
                                    <span>·</span>
                                    <span>{styleData?.totalQty?.toLocaleString()} pcs total</span>
                                </div>
                            </div>
                            <Button size="sm" onClick={() => setAddingLot(!addingLot)}
                                className="bg-teal-600 hover:bg-teal-700 text-white text-xs h-8">
                                <Plus className="h-3.5 w-3.5 mr-1" />Add Lot
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">

                        {/* Add Lot Form */}
                        {addingLot && (
                            <div className="p-4 border-b border-slate-700 bg-teal-500/5">
                                <p className="text-teal-300 text-xs font-semibold mb-3">New Lot Entry</p>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                    <div>
                                        <label className="text-slate-400 text-xs mb-1 block">Colour Name</label>
                                        <input value={newLot.colour}
                                            onChange={e => setNewLot({ ...newLot, colour: e.target.value })}
                                            placeholder="e.g. Sage Green"
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-teal-500" />
                                    </div>
                                    <div>
                                        <label className="text-slate-400 text-xs mb-1 block">Swatch</label>
                                        <input type="color" value={newLot.hex}
                                            onChange={e => setNewLot({ ...newLot, hex: e.target.value })}
                                            className="w-full h-8 bg-slate-900 border border-slate-700 rounded-lg cursor-pointer" />
                                    </div>
                                    <div>
                                        <label className="text-slate-400 text-xs mb-1 block">Size Ratio</label>
                                        <select value={newLot.ratio}
                                            onChange={e => setNewLot({ ...newLot, ratio: e.target.value })}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-teal-500">
                                            {SIZE_RATIOS.map(r => <option key={r} value={r}>{r}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-slate-400 text-xs mb-1 block">Qty (pcs)</label>
                                        <input value={newLot.qty} type="number"
                                            onChange={e => setNewLot({ ...newLot, qty: e.target.value })}
                                            placeholder="e.g. 600"
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-teal-500" />
                                    </div>
                                    <div>
                                        <label className="text-slate-400 text-xs mb-1 block">Ex-Factory</label>
                                        <input value={newLot.exFactory} type="date"
                                            onChange={e => setNewLot({ ...newLot, exFactory: e.target.value })}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-teal-500" />
                                    </div>
                                </div>
                                <div className="flex gap-2 mt-3">
                                    <Button size="sm" onClick={saveLot}
                                        className="bg-teal-600 hover:bg-teal-700 text-white text-xs h-7">
                                        <CheckCircle className="h-3 w-3 mr-1" />Generate & Save
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => setAddingLot(false)}
                                        className="border-slate-600 text-slate-400 text-xs h-7">Cancel</Button>
                                </div>
                            </div>
                        )}

                        {/* Lot Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-900 border-b border-slate-700">
                                        {['Colour / Shade','Internal Lot No.','Buyer PO Ref.','Size Ratio','Qty (pcs)','Ex-Factory','FOB / pc','Status','Action'].map(h => (
                                            <th key={h} className="text-left py-2.5 px-3 text-xs font-semibold text-white whitespace-nowrap">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {effectiveLots.map((lot, i) => {
                                        const status = getStatus(lot.lotNo, lot.status);
                                        return (
                                            <tr key={lot.lotNo} className={`border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors ${i % 2 === 0 ? '' : 'bg-slate-900/20'}`}>
                                                <td className="py-3 px-3">
                                                    <span className="flex items-center gap-2">
                                                        <span className="w-4 h-4 rounded-full border border-slate-600 shrink-0" style={{ background: lot.hex }} />
                                                        <span className="text-slate-200 text-xs">{lot.colour}</span>
                                                    </span>
                                                </td>
                                                <td className="py-3 px-3">
                                                    <span className="font-mono text-xs text-teal-300 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">{lot.lotNo}</span>
                                                </td>
                                                <td className="py-3 px-3"><span className="font-mono text-xs text-blue-300">{lot.poRef}</span></td>
                                                <td className="py-3 px-3 text-slate-400 text-xs font-mono">{lot.ratio}</td>
                                                <td className="py-3 px-3 text-white text-xs font-semibold">{lot.qty.toLocaleString()}</td>
                                                <td className="py-3 px-3 text-slate-400 text-xs">{lot.ef}</td>
                                                <td className="py-3 px-3 text-teal-400 text-xs font-semibold">{lot.fob}</td>
                                                <td className="py-3 px-3">
                                                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold border ${STATUS_STYLES[status]}`}>
                                                        {STATUS_ICON[status]}
                                                        {status}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-3">
                                                    {status === 'Draft' || status === 'In Progress' ? (
                                                        <button onClick={() => confirmLot(lot.lotNo)}
                                                            className="text-xs px-2 py-0.5 rounded border border-teal-500/40 text-teal-400 hover:bg-teal-600/20 transition-colors">
                                                            Confirm
                                                        </button>
                                                    ) : (
                                                        <span className="text-slate-600 text-xs">Confirmed</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Style Lot Summary */}
                        <div className="p-4 border-t border-slate-700 bg-slate-900/30">
                            <div className="flex items-center justify-between flex-wrap gap-3">
                                <div className="flex items-center gap-6 text-xs">
                                    <span className="text-slate-400">
                                        Total Qty: <span className="text-white font-bold">
                                            {effectiveLots.reduce((s, l) => s + l.qty, 0).toLocaleString()} pcs
                                        </span>
                                    </span>
                                    <span className="text-slate-400">
                                        Lots: <span className="text-white font-bold">{effectiveLots.length}</span>
                                    </span>
                                    <span className="text-slate-400">
                                        Confirmed: <span className="text-emerald-400 font-bold">
                                            {effectiveLots.filter(l => getStatus(l.lotNo, l.status) === 'Confirmed').length}
                                        </span>
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="outline"
                                        className="border-slate-600 text-slate-300 text-xs h-7">
                                        <Hash className="h-3 w-3 mr-1" />Auto-Generate All
                                    </Button>
                                    <Button size="sm" onClick={() => confirmAllStyle(effectiveLots)}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-7">
                                        <CheckCircle className="h-3 w-3 mr-1" />Confirm All Lots
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* All Styles Overview */}
            <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                    <CardTitle className="text-white text-base flex items-center gap-2">
                        <Layers className="h-4 w-4 text-teal-400" />All Styles — Lot Progress
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-900 border-b border-slate-700">
                                    {['Style No.','Style Name','Category','Total Qty','Lots','Confirmed','In Progress','Draft','% Complete'].map(h => (
                                        <th key={h} className="text-left py-2.5 px-4 text-xs font-semibold text-white whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {poData.map((s, i) => {
                                    const eLots     = getEffectiveLots(i);
                                    const confirmed  = eLots.filter(l => getStatus(l.lotNo, l.status) === 'Confirmed').length;
                                    const inProgress = eLots.filter(l => getStatus(l.lotNo, l.status) === 'In Progress').length;
                                    const draft      = eLots.filter(l => getStatus(l.lotNo, l.status) === 'Draft').length;
                                    const pct        = Math.round((confirmed / eLots.length) * 100);
                                    return (
                                        <tr key={i} onClick={() => setActiveStyle(i)}
                                            className={`border-b border-slate-700/50 cursor-pointer hover:bg-slate-700/30 transition-colors ${i % 2 === 0 ? '' : 'bg-slate-900/20'}`}>
                                            <td className="py-3 px-4 text-slate-400 text-xs font-mono">{s.styleNo}</td>
                                            <td className="py-3 px-4 text-white text-xs font-semibold">{s.styleName}</td>
                                            <td className="py-3 px-4"><span className="text-xs px-2 py-0.5 rounded bg-slate-700 text-slate-300">{s.category}</span></td>
                                            <td className="py-3 px-4 text-slate-300 text-xs">{s.totalQty.toLocaleString()}</td>
                                            <td className="py-3 px-4 text-white text-xs font-bold">{eLots.length}</td>
                                            <td className="py-3 px-4 text-emerald-400 text-xs font-bold">{confirmed}</td>
                                            <td className="py-3 px-4 text-orange-400 text-xs font-bold">{inProgress}</td>
                                            <td className="py-3 px-4 text-slate-500 text-xs">{draft}</td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-20 bg-slate-700 rounded-full h-1.5">
                                                        <div className="bg-teal-500 h-1.5 rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
                                                    </div>
                                                    <span className={`text-xs font-semibold ${pct === 100 ? 'text-emerald-400' : 'text-slate-400'}`}>{pct}%</span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default POInternalLotCreation;
