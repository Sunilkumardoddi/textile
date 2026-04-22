import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    DollarSign, ChevronDown, ChevronRight, CheckCircle, Clock,
    Download, ArrowLeft, Scissors, Layers, TrendingUp, BarChart2,
    FileText, RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// ── Static Data ────────────────────────────────────────────────────────────────

const PO_LIST = [
    { id: 'PO-SS25-4812', styles: 4, qty: '12,400 pcs', exFactory: '15 Jun 2025' },
    { id: 'PO-SS25-3991', styles: 3, qty: '8,600 pcs',  exFactory: '10 Jun 2025' },
    { id: 'PO-SS25-5100', styles: 5, qty: '15,200 pcs', exFactory: '20 Jun 2025' },
    { id: 'PO-AW25-0011', styles: 2, qty: '5,800 pcs',  exFactory: '28 Sep 2025' },
];

const STYLES = [
    { id: 'ZR-SS25-LB001',  name: 'Linen Relaxed Blazer',    cat: 'Outerwear', fob: '$18.90', status: 'Approved'  },
    { id: 'ZR-SS25-TS002',  name: 'Organic Slub Tee',        cat: 'Tops',      fob: '$7.20',  status: 'In Review' },
    { id: 'ZR-SS25-TR003',  name: 'Linen Wide-Leg Trouser',  cat: 'Bottoms',   fob: '$12.40', status: 'Draft'     },
    { id: 'ZR-SS25-DRS004', name: 'Bias-Cut Slip Dress',     cat: 'Dresses',   fob: '$14.60', status: 'In Review' },
];

const PO_SUMMARY = { fobValue: '$234,760', totalCost: '$178,200', grossMargin: '24.1%', marginPct: 24.1 };

// Per-style data ──────────────────────────────────────────────────────────────

const STYLE_DATA = {
    'ZR-SS25-LB001': {
        category: 'Women\'s Outerwear', version: 'v3.1 · Approved',
        lots: [
            { colour: 'Natural Ecru',   hex: '#e8dfc8', lot: 'LOT-LB001-NEU-01', poRef: 'PO-SS25-4812-A', ratio: '1:2:3:2:1', qty: 640, ef: '12 Jun 25', fob: '$18.90', status: 'Production' },
            { colour: 'Soft Slate Blue',hex: '#8fa8b8', lot: 'LOT-LB001-SLB-02', poRef: 'PO-SS25-4812-B', ratio: '1:2:3:2:1', qty: 560, ef: '13 Jun 25', fob: '$18.90', status: 'QC Review'   },
            { colour: 'Warm Sand',      hex: '#c4956a', lot: 'LOT-LB001-WSN-03', poRef: 'PO-SS25-4812-C', ratio: '1:2:3:2:1', qty: 480, ef: '14 Jun 25', fob: '$18.90', status: 'Production' },
            { colour: 'Forest Green',   hex: '#2e4a2e', lot: 'LOT-LB001-FGN-04', poRef: 'PO-SS25-4812-D', ratio: '1:2:3:2:1', qty: 320, ef: '15 Jun 25', fob: '$18.90', status: 'Ready'      },
        ],
        fabricBOM: [
            { name: 'Linen Plain Weave — Main Shell', supplier: 'Vimal Fab · Gujarat · Art#VF-LN-220', origin: 'Gujarat, IN', comp: '100% Linen',   cert: 'Organic', certColor: 'emerald', unit: 'mtr', cons: '2.20', waste: '8%',  price: '$2.40/mtr', cost: '$5.70' },
            { name: 'Viscose Lining — Full Body',     supplier: 'Reliance Textiles · Art#RT-VL-80',   origin: 'Mumbai, IN',  comp: '100% Viscose', cert: 'Recycled',certColor: 'blue',    unit: 'mtr', cons: '1.80', waste: '10%', price: '$0.85/mtr', cost: '$1.68' },
            { name: 'Woven Fusible Interlining',      supplier: 'Freudenberg India · Art#FRE-WF-30',  origin: 'Pune, IN',    comp: '100% Poly',    cert: '—',       certColor: '',         unit: 'mtr', cons: '0.40', waste: '5%',  price: '$1.10/mtr', cost: '$0.46' },
        ],
        fabricSubtotal: '$7.84',
        trimsBOM: [
            { name: 'Corozo Buttons 4-Hole 20L', supplier: 'YKK India',      spec: 'Natural / To Match', cert: 'ECO', certColor: 'emerald', unit: 'pc',  qty: '3',   price: '$0.14/pc',    cost: '$0.42' },
            { name: 'Woven Care Label',           supplier: 'Avery Dennison', spec: 'Per Colorway',       cert: '—',   certColor: '',         unit: 'set', qty: '1',   price: '$0.08/set',   cost: '$0.08' },
            { name: 'Sewing Thread — Coats Astra',supplier: 'Coats India',    spec: 'Match Fabric',       cert: '—',   certColor: '',         unit: 'mtr', qty: '350', price: '$0.0009/mtr', cost: '$0.32' },
            { name: 'Hangtag + Barcode Label Set',supplier: 'Brand Supplied', spec: 'SS25 Spec',          cert: '—',   certColor: '',         unit: 'set', qty: '1',   price: '$0.07/set',   cost: '$0.07' },
            { name: 'Polybag + Carton Packaging', supplier: 'Local Supplier', spec: 'Standard',           cert: '—',   certColor: '',         unit: 'pc',  qty: '1',   price: '$0.07/pc',    cost: '$0.07' },
        ],
        trimsSubtotal: '$0.96',
        cmtBOM: [
            { stage: 'Cutting (CAD Marker)',     sam: '8.4',  eff: '85%', workers: '4',  wage: '$0.62/hr', machOH: '$0.12', cost: '$0.64' },
            { stage: 'Sewing (Jacket Assembly)', sam: '42.0', eff: '78%', workers: '18', wage: '$0.62/hr', machOH: '$0.40', cost: '$2.98' },
            { stage: 'Finishing, Pressing & QC', sam: '12.0', eff: '80%', workers: '5',  wage: '$0.62/hr', machOH: '$0.10', cost: '$0.84' },
            { stage: 'Packing & Carton',         sam: '4.2',  eff: '82%', workers: '2',  wage: '$0.62/hr', machOH: '$0.05', cost: '$0.34' },
        ],
        cmtTotal: '66.6', cmtSubtotal: '$4.80',
        overheadBOM: [
            { comp: 'Fabric Cost',             basis: 'BOM Section 1', rate: '—',     value: '$7.84', cum: '$7.84',  profit: false },
            { comp: 'Trims & Accessories',     basis: 'BOM Section 2', rate: '—',     value: '$0.96', cum: '$8.80',  profit: false },
            { comp: 'CMT Labour Cost',         basis: 'Section 3',     rate: '—',     value: '$4.80', cum: '$13.60', profit: false },
            { comp: 'Factory Overhead',        basis: '% on CMT',      rate: '18%',   value: '$0.86', cum: '$14.46', profit: false },
            { comp: 'Sustainability Compliance',basis:'Per Garment',   rate: 'Fixed', value: '$0.12', cum: '$14.58', profit: false },
            { comp: 'Agent Commission',        basis: '% on FOB',      rate: '4%',    value: '$0.76', cum: '$15.34', profit: false },
            { comp: 'Bank Charges / LC Cost',  basis: '% on FOB',      rate: '0.5%',  value: '$0.09', cum: '$15.43', profit: false },
            { comp: 'Manufacturer Net Profit', basis: '% on Cost',     rate: '22.4%', value: '$3.47', cum: '$18.90', profit: true  },
        ],
        fobPrice: '$18.90',
        costSummary: [
            { label: 'Fabric Cost',   value: '$7.84',  sub: '41.5% of FOB', color: 'text-amber-400'   },
            { label: 'Trims & Acc.',  value: '$0.96',  sub: '5.1% of FOB',  color: 'text-teal-400'    },
            { label: 'CMT Labour',    value: '$4.80',  sub: '25.4% of FOB', color: 'text-sky-400'     },
            { label: 'Overhead+Misc', value: '$1.83',  sub: '9.7% of FOB',  color: 'text-orange-400'  },
            { label: 'Net Profit',    value: '$3.47',  sub: '18.4% GP',     color: 'text-emerald-400' },
            { label: 'FOB Price',     value: '$18.90', sub: 'Agreed Brand', color: 'text-yellow-300'  },
        ],
        waterfall: [
            { label: 'Fabric',      pct: 41.5, val: '$7.84', bg: 'bg-amber-500'   },
            { label: 'CMT Labour',  pct: 25.4, val: '$4.80', bg: 'bg-sky-500'     },
            { label: 'Net Profit',  pct: 18.4, val: '$3.47', bg: 'bg-emerald-500' },
            { label: 'Overhead',    pct:  9.7, val: '$1.83', bg: 'bg-orange-500'  },
            { label: 'Trims',       pct:  5.1, val: '$0.96', bg: 'bg-teal-500'    },
        ],
        approvalSteps: [
            { label: 'Manufacturer\nCosting',    sub: 'TexElite · 20 Mar',  state: 'done'    },
            { label: 'Merchandiser\nReview',     sub: 'Priya S · 22 Mar',   state: 'done'    },
            { label: 'Costing Head\nSign-off',   sub: 'Rajesh K · 24 Mar',  state: 'done'    },
            { label: 'Brand Buyer\nNegotiation', sub: 'Zara · In Progress', state: 'current' },
            { label: 'Price\nConfirmation',      sub: 'Pending',             state: 'pending' },
            { label: 'PO Order\nConfirmation',   sub: 'Pending',             state: 'pending' },
            { label: 'Production\nRelease',      sub: 'Awaiting OC',        state: 'pending' },
        ],
    },

    'ZR-SS25-TS002': {
        category: 'Women\'s Tops', version: 'v1.2 · In Review',
        lots: [
            { colour: 'Off White',   hex: '#f2ede2', lot: 'LOT-TS002-OFW-01', poRef: 'PO-SS25-4812-E', ratio: '1:2:4:2:1', qty: 900, ef: '11 Jun 25', fob: '$7.20', status: 'Production' },
            { colour: 'Jet Black',   hex: '#1a1a1a', lot: 'LOT-TS002-BLK-02', poRef: 'PO-SS25-4812-F', ratio: '1:2:4:2:1', qty: 840, ef: '11 Jun 25', fob: '$7.20', status: 'QC Review'  },
            { colour: 'Olive Drab',  hex: '#6b7a3e', lot: 'LOT-TS002-OLV-03', poRef: 'PO-SS25-4812-G', ratio: '1:2:4:2:1', qty: 660, ef: '12 Jun 25', fob: '$7.20', status: 'Draft'      },
        ],
        fabricBOM: [
            { name: 'Organic Slub Jersey 160gsm',  supplier: 'Arvind Mills · Art#AM-SJ-160', origin: 'Ahmedabad, IN', comp: '100% Organic Cotton', cert: 'GOTS', certColor: 'emerald', unit: 'mtr', cons: '1.50', waste: '6%',  price: '$1.40/mtr', cost: '$2.23' },
            { name: 'Rib Trim — Neck & Cuff',      supplier: 'KPR Mill · Art#KPR-RB-02',    origin: 'Coimbatore, IN',comp: '95/5 Cotton/EA',     cert: 'OCS',  certColor: 'blue',    unit: 'mtr', cons: '0.30', waste: '8%',  price: '$0.90/mtr', cost: '$0.29' },
        ],
        fabricSubtotal: '$2.52',
        trimsBOM: [
            { name: 'Woven Care Label',           supplier: 'Avery Dennison', spec: 'Per Colorway', cert: '—', certColor: '', unit: 'set', qty: '1', price: '$0.05/set', cost: '$0.05' },
            { name: 'Sewing Thread — Coats 120',  supplier: 'Coats India',    spec: 'Match Fabric', cert: '—', certColor: '', unit: 'mtr', qty: '180', price: '$0.0008/mtr', cost: '$0.14' },
            { name: 'Hangtag + Barcode Label Set',supplier: 'Brand Supplied', spec: 'SS25 Spec',    cert: '—', certColor: '', unit: 'set', qty: '1', price: '$0.07/set',   cost: '$0.07' },
        ],
        trimsSubtotal: '$0.26',
        cmtBOM: [
            { stage: 'Cutting (CAD Marker)',     sam: '4.2',  eff: '88%', workers: '2', wage: '$0.62/hr', machOH: '$0.06', cost: '$0.36' },
            { stage: 'Sewing (Tee Assembly)',    sam: '12.0', eff: '82%', workers: '8', wage: '$0.62/hr', machOH: '$0.18', cost: '$0.95' },
            { stage: 'Finishing & QC',           sam: '4.2',  eff: '80%', workers: '2', wage: '$0.62/hr', machOH: '$0.04', cost: '$0.28' },
            { stage: 'Packing & Carton',         sam: '2.4',  eff: '85%', workers: '1', wage: '$0.62/hr', machOH: '$0.03', cost: '$0.14' },
        ],
        cmtTotal: '22.8', cmtSubtotal: '$1.73',
        overheadBOM: [
            { comp: 'Fabric Cost',             basis: 'BOM Section 1', rate: '—',     value: '$2.52', cum: '$2.52', profit: false },
            { comp: 'Trims & Accessories',     basis: 'BOM Section 2', rate: '—',     value: '$0.26', cum: '$2.78', profit: false },
            { comp: 'CMT Labour Cost',         basis: 'Section 3',     rate: '—',     value: '$1.73', cum: '$4.51', profit: false },
            { comp: 'Factory Overhead',        basis: '% on CMT',      rate: '18%',   value: '$0.31', cum: '$4.82', profit: false },
            { comp: 'Sustainability Compliance',basis:'Per Garment',   rate: 'Fixed', value: '$0.08', cum: '$4.90', profit: false },
            { comp: 'Agent Commission',        basis: '% on FOB',      rate: '4%',    value: '$0.29', cum: '$5.19', profit: false },
            { comp: 'Bank Charges / LC Cost',  basis: '% on FOB',      rate: '0.5%',  value: '$0.04', cum: '$5.23', profit: false },
            { comp: 'Manufacturer Net Profit', basis: '% on Cost',     rate: '27.3%', value: '$1.97', cum: '$7.20', profit: true  },
        ],
        fobPrice: '$7.20',
        costSummary: [
            { label: 'Fabric Cost',   value: '$2.52', sub: '35.0% of FOB', color: 'text-amber-400'   },
            { label: 'Trims & Acc.',  value: '$0.26', sub: '3.6% of FOB',  color: 'text-teal-400'    },
            { label: 'CMT Labour',    value: '$1.73', sub: '24.0% of FOB', color: 'text-sky-400'     },
            { label: 'Overhead+Misc', value: '$0.72', sub: '10.0% of FOB', color: 'text-orange-400'  },
            { label: 'Net Profit',    value: '$1.97', sub: '27.4% GP',     color: 'text-emerald-400' },
            { label: 'FOB Price',     value: '$7.20', sub: 'Agreed Brand', color: 'text-yellow-300'  },
        ],
        waterfall: [
            { label: 'Fabric',     pct: 35.0, val: '$2.52', bg: 'bg-amber-500'   },
            { label: 'CMT Labour', pct: 24.0, val: '$1.73', bg: 'bg-sky-500'     },
            { label: 'Net Profit', pct: 27.4, val: '$1.97', bg: 'bg-emerald-500' },
            { label: 'Overhead',   pct: 10.0, val: '$0.72', bg: 'bg-orange-500'  },
            { label: 'Trims',      pct:  3.6, val: '$0.26', bg: 'bg-teal-500'    },
        ],
        approvalSteps: [
            { label: 'Manufacturer\nCosting',    sub: 'TexElite · 18 Mar', state: 'done'    },
            { label: 'Merchandiser\nReview',     sub: 'Anita P · 20 Mar',  state: 'current' },
            { label: 'Costing Head\nSign-off',   sub: 'Pending',           state: 'pending' },
            { label: 'Brand Buyer\nNegotiation', sub: 'Pending',           state: 'pending' },
            { label: 'Price\nConfirmation',      sub: 'Pending',           state: 'pending' },
            { label: 'PO Order\nConfirmation',   sub: 'Pending',           state: 'pending' },
            { label: 'Production\nRelease',      sub: 'Awaiting OC',       state: 'pending' },
        ],
    },

    'ZR-SS25-TR003': {
        category: 'Women\'s Bottoms', version: 'v1.0 · Draft',
        lots: [
            { colour: 'Natural Sand',  hex: '#d4c5a9', lot: 'LOT-TR003-SND-01', poRef: 'PO-SS25-4812-H', ratio: '1:2:3:2:1', qty: 560, ef: '13 Jun 25', fob: '$12.40', status: 'Draft'     },
            { colour: 'Sage Green',    hex: '#8ba888', lot: 'LOT-TR003-SGR-02', poRef: 'PO-SS25-4812-I', ratio: '1:2:3:2:1', qty: 480, ef: '14 Jun 25', fob: '$12.40', status: 'Draft'     },
            { colour: 'Chalk White',   hex: '#f0ece4', lot: 'LOT-TR003-CWH-03', poRef: 'PO-SS25-4812-J', ratio: '1:2:3:2:1', qty: 400, ef: '15 Jun 25', fob: '$12.40', status: 'Draft'     },
        ],
        fabricBOM: [
            { name: 'Linen Twill 180gsm — Shell',    supplier: 'Nitin Spinners · Art#NS-LT-180', origin: 'Bhilwara, IN', comp: '100% Linen',  cert: 'Organic', certColor: 'emerald', unit: 'mtr', cons: '2.00', waste: '8%',  price: '$1.80/mtr', cost: '$3.89' },
            { name: 'Woven Fusible Interlining — Waist',supplier:'Freudenberg India · Art#FRE-WF-20',origin:'Pune, IN',  comp: '100% Poly',   cert: '—',       certColor: '',         unit: 'mtr', cons: '0.30', waste: '5%',  price: '$1.10/mtr', cost: '$0.35' },
        ],
        fabricSubtotal: '$4.24',
        trimsBOM: [
            { name: 'Metal Hook & Bar — Waistband', supplier: 'YKK India',      spec: 'Gunmetal / Black', cert: '—', certColor: '', unit: 'set', qty: '1',   price: '$0.12/set', cost: '$0.12' },
            { name: 'Metal Zip 20cm — Invisible',   supplier: 'YKK India',      spec: 'To Match',        cert: '—', certColor: '', unit: 'pc',  qty: '1',   price: '$0.18/pc',  cost: '$0.18' },
            { name: 'Woven Care Label',              supplier: 'Avery Dennison', spec: 'Per Colorway',    cert: '—', certColor: '', unit: 'set', qty: '1',   price: '$0.06/set', cost: '$0.06' },
            { name: 'Sewing Thread — Coats 120',    supplier: 'Coats India',    spec: 'Match Fabric',    cert: '—', certColor: '', unit: 'mtr', qty: '220', price: '$0.0009/mtr',cost: '$0.20' },
            { name: 'Hangtag + Barcode Label',       supplier: 'Brand Supplied', spec: 'SS25 Spec',       cert: '—', certColor: '', unit: 'set', qty: '1',   price: '$0.07/set', cost: '$0.07' },
        ],
        trimsSubtotal: '$0.63',
        cmtBOM: [
            { stage: 'Cutting (CAD Marker)',      sam: '5.4',  eff: '86%', workers: '2', wage: '$0.62/hr', machOH: '$0.07', cost: '$0.42' },
            { stage: 'Sewing (Trouser Assembly)', sam: '22.0', eff: '79%', workers: '9', wage: '$0.62/hr', machOH: '$0.25', cost: '$1.85' },
            { stage: 'Finishing & Pressing',      sam: '7.2',  eff: '81%', workers: '3', wage: '$0.62/hr', machOH: '$0.08', cost: '$0.60' },
            { stage: 'Packing & Carton',          sam: '3.0',  eff: '84%', workers: '1', wage: '$0.62/hr', machOH: '$0.04', cost: '$0.22' },
        ],
        cmtTotal: '37.6', cmtSubtotal: '$3.09',
        overheadBOM: [
            { comp: 'Fabric Cost',             basis: 'BOM Section 1', rate: '—',     value: '$4.24', cum: '$4.24',  profit: false },
            { comp: 'Trims & Accessories',     basis: 'BOM Section 2', rate: '—',     value: '$0.63', cum: '$4.87',  profit: false },
            { comp: 'CMT Labour Cost',         basis: 'Section 3',     rate: '—',     value: '$3.09', cum: '$7.96',  profit: false },
            { comp: 'Factory Overhead',        basis: '% on CMT',      rate: '18%',   value: '$0.56', cum: '$8.52',  profit: false },
            { comp: 'Sustainability Compliance',basis:'Per Garment',   rate: 'Fixed', value: '$0.10', cum: '$8.62',  profit: false },
            { comp: 'Agent Commission',        basis: '% on FOB',      rate: '4%',    value: '$0.50', cum: '$9.12',  profit: false },
            { comp: 'Bank Charges / LC Cost',  basis: '% on FOB',      rate: '0.5%',  value: '$0.06', cum: '$9.18',  profit: false },
            { comp: 'Manufacturer Net Profit', basis: '% on Cost',     rate: '35.1%', value: '$3.22', cum: '$12.40', profit: true  },
        ],
        fobPrice: '$12.40',
        costSummary: [
            { label: 'Fabric Cost',   value: '$4.24',  sub: '34.2% of FOB', color: 'text-amber-400'   },
            { label: 'Trims & Acc.',  value: '$0.63',  sub: '5.1% of FOB',  color: 'text-teal-400'    },
            { label: 'CMT Labour',    value: '$3.09',  sub: '24.9% of FOB', color: 'text-sky-400'     },
            { label: 'Overhead+Misc', value: '$1.22',  sub: '9.8% of FOB',  color: 'text-orange-400'  },
            { label: 'Net Profit',    value: '$3.22',  sub: '26.0% GP',     color: 'text-emerald-400' },
            { label: 'FOB Price',     value: '$12.40', sub: 'Agreed Brand', color: 'text-yellow-300'  },
        ],
        waterfall: [
            { label: 'Fabric',     pct: 34.2, val: '$4.24', bg: 'bg-amber-500'   },
            { label: 'CMT Labour', pct: 24.9, val: '$3.09', bg: 'bg-sky-500'     },
            { label: 'Net Profit', pct: 26.0, val: '$3.22', bg: 'bg-emerald-500' },
            { label: 'Overhead',   pct:  9.8, val: '$1.22', bg: 'bg-orange-500'  },
            { label: 'Trims',      pct:  5.1, val: '$0.63', bg: 'bg-teal-500'    },
        ],
        approvalSteps: [
            { label: 'Manufacturer\nCosting',    sub: 'TexElite · 21 Mar', state: 'done'    },
            { label: 'Merchandiser\nReview',     sub: 'Pending',           state: 'pending' },
            { label: 'Costing Head\nSign-off',   sub: 'Pending',           state: 'pending' },
            { label: 'Brand Buyer\nNegotiation', sub: 'Pending',           state: 'pending' },
            { label: 'Price\nConfirmation',      sub: 'Pending',           state: 'pending' },
            { label: 'PO Order\nConfirmation',   sub: 'Pending',           state: 'pending' },
            { label: 'Production\nRelease',      sub: 'Awaiting OC',       state: 'pending' },
        ],
    },

    'ZR-SS25-DRS004': {
        category: 'Women\'s Dresses', version: 'v2.0 · In Review',
        lots: [
            { colour: 'Blush Rose',  hex: '#e8b4a0', lot: 'LOT-DRS004-BLR-01', poRef: 'PO-SS25-4812-K', ratio: '1:2:3:2:1', qty: 420, ef: '13 Jun 25', fob: '$14.60', status: 'Production' },
            { colour: 'Jet Black',   hex: '#1a1a1a', lot: 'LOT-DRS004-BLK-02', poRef: 'PO-SS25-4812-L', ratio: '1:2:3:2:1', qty: 380, ef: '14 Jun 25', fob: '$14.60', status: 'QC Review'  },
            { colour: 'Ivory Cream', hex: '#f5ede0', lot: 'LOT-DRS004-IVC-03', poRef: 'PO-SS25-4812-M', ratio: '1:2:3:2:1', qty: 300, ef: '15 Jun 25', fob: '$14.60', status: 'Draft'      },
        ],
        fabricBOM: [
            { name: 'Cupro Satin 90gsm — Main Shell', supplier: 'Siyaram Silk · Art#SS-CS-090', origin: 'Surat, IN', comp: '100% Cupro',   cert: 'GRS', certColor: 'blue',    unit: 'mtr', cons: '2.40', waste: '10%', price: '$2.20/mtr', cost: '$5.81' },
            { name: 'Soft Mesh Lining — Full',         supplier: 'Alok Industries · Art#AI-ML-60', origin: 'Surat, IN', comp: '100% Nylon', cert: '—',   certColor: '',         unit: 'mtr', cons: '1.60', waste: '8%',  price: '$0.80/mtr', cost: '$1.38' },
        ],
        fabricSubtotal: '$7.19',
        trimsBOM: [
            { name: 'Invisible Zip 35cm',        supplier: 'YKK India',      spec: 'To Match',     cert: '—', certColor: '', unit: 'pc',  qty: '1',   price: '$0.28/pc',  cost: '$0.28' },
            { name: 'Woven Care Label',          supplier: 'Avery Dennison', spec: 'Per Colorway', cert: '—', certColor: '', unit: 'set', qty: '1',   price: '$0.06/set', cost: '$0.06' },
            { name: 'Sewing Thread — Coats 120', supplier: 'Coats India',    spec: 'Match Fabric', cert: '—', certColor: '', unit: 'mtr', qty: '260', price: '$0.0009/mtr',cost:'$0.23'  },
            { name: 'Hangtag + Barcode Label',   supplier: 'Brand Supplied', spec: 'SS25 Spec',    cert: '—', certColor: '', unit: 'set', qty: '1',   price: '$0.07/set', cost: '$0.07' },
        ],
        trimsSubtotal: '$0.64',
        cmtBOM: [
            { stage: 'Cutting (Manual Bias)',    sam: '7.0',  eff: '80%', workers: '3',  wage: '$0.62/hr', machOH: '$0.10', cost: '$0.55' },
            { stage: 'Sewing (Dress Assembly)',  sam: '26.0', eff: '77%', workers: '11', wage: '$0.62/hr', machOH: '$0.30', cost: '$2.35' },
            { stage: 'Finishing & Pressing',     sam: '8.0',  eff: '81%', workers: '3',  wage: '$0.62/hr', machOH: '$0.09', cost: '$0.64' },
            { stage: 'Packing & Carton',         sam: '3.0',  eff: '84%', workers: '1',  wage: '$0.62/hr', machOH: '$0.04', cost: '$0.22' },
        ],
        cmtTotal: '44.0', cmtSubtotal: '$3.76',
        overheadBOM: [
            { comp: 'Fabric Cost',             basis: 'BOM Section 1', rate: '—',     value: '$7.19', cum: '$7.19',  profit: false },
            { comp: 'Trims & Accessories',     basis: 'BOM Section 2', rate: '—',     value: '$0.64', cum: '$7.83',  profit: false },
            { comp: 'CMT Labour Cost',         basis: 'Section 3',     rate: '—',     value: '$3.76', cum: '$11.59', profit: false },
            { comp: 'Factory Overhead',        basis: '% on CMT',      rate: '18%',   value: '$0.68', cum: '$12.27', profit: false },
            { comp: 'Sustainability Compliance',basis:'Per Garment',   rate: 'Fixed', value: '$0.10', cum: '$12.37', profit: false },
            { comp: 'Agent Commission',        basis: '% on FOB',      rate: '4%',    value: '$0.58', cum: '$12.95', profit: false },
            { comp: 'Bank Charges / LC Cost',  basis: '% on FOB',      rate: '0.5%',  value: '$0.07', cum: '$13.02', profit: false },
            { comp: 'Manufacturer Net Profit', basis: '% on Cost',     rate: '12.1%', value: '$1.58', cum: '$14.60', profit: true  },
        ],
        fobPrice: '$14.60',
        costSummary: [
            { label: 'Fabric Cost',   value: '$7.19',  sub: '49.2% of FOB', color: 'text-amber-400'   },
            { label: 'Trims & Acc.',  value: '$0.64',  sub: '4.4% of FOB',  color: 'text-teal-400'    },
            { label: 'CMT Labour',    value: '$3.76',  sub: '25.8% of FOB', color: 'text-sky-400'     },
            { label: 'Overhead+Misc', value: '$1.43',  sub: '9.8% of FOB',  color: 'text-orange-400'  },
            { label: 'Net Profit',    value: '$1.58',  sub: '10.8% GP',     color: 'text-emerald-400' },
            { label: 'FOB Price',     value: '$14.60', sub: 'Agreed Brand', color: 'text-yellow-300'  },
        ],
        waterfall: [
            { label: 'Fabric',     pct: 49.2, val: '$7.19', bg: 'bg-amber-500'   },
            { label: 'CMT Labour', pct: 25.8, val: '$3.76', bg: 'bg-sky-500'     },
            { label: 'Net Profit', pct: 10.8, val: '$1.58', bg: 'bg-emerald-500' },
            { label: 'Overhead',   pct:  9.8, val: '$1.43', bg: 'bg-orange-500'  },
            { label: 'Trims',      pct:  4.4, val: '$0.64', bg: 'bg-teal-500'    },
        ],
        approvalSteps: [
            { label: 'Manufacturer\nCosting',    sub: 'TexElite · 19 Mar',  state: 'done'    },
            { label: 'Merchandiser\nReview',     sub: 'Anita P · 21 Mar',   state: 'done'    },
            { label: 'Costing Head\nSign-off',   sub: 'Rajesh K · In Progress', state: 'current' },
            { label: 'Brand Buyer\nNegotiation', sub: 'Pending',            state: 'pending' },
            { label: 'Price\nConfirmation',      sub: 'Pending',            state: 'pending' },
            { label: 'PO Order\nConfirmation',   sub: 'Pending',            state: 'pending' },
            { label: 'Production\nRelease',      sub: 'Awaiting OC',        state: 'pending' },
        ],
    },
};

const TABS = [
    { id: 'costsheet', label: '📋 Cost Sheet'      },
    { id: 'bom',       label: '🧵 BOM / Materials'  },
    { id: 'cmt',       label: '🏭 CMT Workings'     },
    { id: 'margin',    label: '📊 Margin Analysis'  },
    { id: 'revisions', label: '📜 Revisions'        },
];

// ── Sub-components ────────────────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
    const map = {
        Approved:    'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
        'In Review': 'bg-orange-500/20 text-orange-400 border-orange-500/40',
        Draft:       'bg-slate-500/20 text-slate-400 border-slate-500/40',
        Production:  'bg-blue-500/20 text-blue-400 border-blue-500/40',
        'QC Review': 'bg-purple-500/20 text-purple-400 border-purple-500/40',
        Ready:       'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
        Superseded:  'bg-slate-600/20 text-slate-500 border-slate-600/40',
    };
    return <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold border ${map[status] || map.Draft}`}>{status}</span>;
};

const CertBadge = ({ cert, color }) => {
    if (cert === '—') return <span className="text-slate-500 text-xs">—</span>;
    const cls = color === 'emerald' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              : color === 'blue'    ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
              :                      'bg-slate-500/20 text-slate-300 border-slate-500/40';
    return <span className={`inline-flex px-1.5 py-0.5 rounded text-xs border ${cls}`}>{cert}</span>;
};

const AccordionSection = ({ title, sub, totalLabel, iconEmoji, children, defaultOpen = true }) => {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="border-t border-slate-700">
            <button onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between p-4 hover:bg-slate-700/20 transition-colors">
                <div className="flex items-center gap-3">
                    <span className="text-lg">{iconEmoji}</span>
                    <div className="text-left">
                        <p className="text-white text-sm font-semibold">{title}</p>
                        <p className="text-slate-500 text-xs">{sub}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-teal-400 font-bold text-sm">{totalLabel}</span>
                    {open ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
                </div>
            </button>
            {open && <div className="border-t border-slate-700/50">{children}</div>}
        </div>
    );
};

const ApprovalDot = ({ state }) => {
    if (state === 'done')    return <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shrink-0"><CheckCircle className="h-4 w-4 text-white" /></div>;
    if (state === 'current') return <div className="w-8 h-8 rounded-full bg-orange-500 border-2 border-orange-300 flex items-center justify-center shrink-0"><div className="w-2 h-2 bg-white rounded-full animate-pulse" /></div>;
    return <div className="w-8 h-8 rounded-full bg-slate-700 border-2 border-slate-600 flex items-center justify-center shrink-0"><Clock className="h-4 w-4 text-slate-400" /></div>;
};

// ── Main Component ────────────────────────────────────────────────────────────

const POGarmentCosting = () => {
    const navigate  = useNavigate();
    const [activePO,    setActivePO]    = useState('PO-SS25-4812');
    const [activeStyle, setActiveStyle] = useState('ZR-SS25-LB001');
    const [activeTab,   setActiveTab]   = useState('costsheet');

    const style = STYLES.find(s => s.id === activeStyle) || STYLES[0];
    const sd    = STYLE_DATA[activeStyle] || STYLE_DATA['ZR-SS25-LB001'];

    const renderTabContent = () => {
        switch (activeTab) {

            case 'costsheet': return (
                <div>
                    {/* Colour × Lot Mapper */}
                    <div className="p-4 border-b border-slate-700">
                        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
                            🎨 Colour-wise Internal Lot Numbers → Linked to Buyer PO
                        </p>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-900 border-b border-slate-700">
                                        {['Colour / Shade','Internal Lot No.','Buyer PO Ref.','Size Ratio','Qty','Ex-Factory','FOB / pc','Status'].map(h => (
                                            <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-white whitespace-nowrap">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {sd.lots.map((r, i) => (
                                        <tr key={i} className={`border-b border-slate-700/40 ${i % 2 === 0 ? '' : 'bg-slate-900/20'}`}>
                                            <td className="py-2.5 px-3">
                                                <span className="flex items-center gap-2">
                                                    <span className="w-3 h-3 rounded-full border border-slate-600 shrink-0" style={{ background: r.hex }} />
                                                    <span className="text-slate-200 text-xs">{r.colour}</span>
                                                </span>
                                            </td>
                                            <td className="py-2.5 px-3"><span className="font-mono text-xs text-teal-300 bg-teal-500/10 px-2 py-0.5 rounded">{r.lot}</span></td>
                                            <td className="py-2.5 px-3"><span className="font-mono text-xs text-blue-300">{r.poRef}</span></td>
                                            <td className="py-2.5 px-3 text-slate-400 text-xs font-mono">{r.ratio}</td>
                                            <td className="py-2.5 px-3 text-slate-300 text-xs font-semibold">{r.qty.toLocaleString()} pcs</td>
                                            <td className="py-2.5 px-3 text-slate-400 text-xs">{r.ef}</td>
                                            <td className="py-2.5 px-3 text-teal-400 text-xs font-semibold">{r.fob}</td>
                                            <td className="py-2.5 px-3"><StatusBadge status={r.status} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Section 1 — Fabric */}
                    <AccordionSection title="Section 1 — Fabric Cost (BOM)" sub="Main shell, lining, interlining, fusibles" totalLabel={sd.fabricSubtotal + ' / pc'} iconEmoji="🧵">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-900 border-b border-slate-700">
                                        {['Material','Origin','Composition','Cert','Unit','Cons.','Waste%','Unit Price','Cost/pc'].map(h => (
                                            <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-white whitespace-nowrap">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {sd.fabricBOM.map((r, i) => (
                                        <tr key={i} className={`border-b border-slate-700/40 ${i % 2 === 0 ? '' : 'bg-slate-900/20'}`}>
                                            <td className="py-2.5 px-3">
                                                <p className="text-white text-xs font-medium">{r.name}</p>
                                                <p className="text-slate-500 text-xs">{r.supplier}</p>
                                            </td>
                                            <td className="py-2.5 px-3 text-slate-400 text-xs">{r.origin}</td>
                                            <td className="py-2.5 px-3 text-slate-400 text-xs">{r.comp}</td>
                                            <td className="py-2.5 px-3"><CertBadge cert={r.cert} color={r.certColor} /></td>
                                            <td className="py-2.5 px-3 text-slate-400 text-xs">{r.unit}</td>
                                            <td className="py-2.5 px-3 text-slate-300 text-xs font-mono">{r.cons}</td>
                                            <td className="py-2.5 px-3 text-slate-400 text-xs">{r.waste}</td>
                                            <td className="py-2.5 px-3 text-slate-400 text-xs font-mono">{r.price}</td>
                                            <td className="py-2.5 px-3 text-teal-400 text-xs font-bold">{r.cost}</td>
                                        </tr>
                                    ))}
                                    <tr className="bg-slate-900/60 border-t border-slate-600">
                                        <td colSpan={8} className="py-2 px-3 text-slate-400 text-xs font-semibold">Fabric Subtotal</td>
                                        <td className="py-2 px-3 text-teal-400 text-sm font-bold">{sd.fabricSubtotal}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </AccordionSection>

                    {/* Section 2 — Trims */}
                    <AccordionSection title="Section 2 — Trims & Accessories" sub="Buttons, labels, threads, hangtags, packaging" totalLabel={sd.trimsSubtotal + ' / pc'} iconEmoji="🪢">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-900 border-b border-slate-700">
                                        {['Item Description','Supplier','Spec','Cert','Unit','Qty/Garment','Unit Price','Cost/pc'].map(h => (
                                            <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-white whitespace-nowrap">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {sd.trimsBOM.map((r, i) => (
                                        <tr key={i} className={`border-b border-slate-700/40 ${i % 2 === 0 ? '' : 'bg-slate-900/20'}`}>
                                            <td className="py-2.5 px-3 text-white text-xs font-medium">{r.name}</td>
                                            <td className="py-2.5 px-3 text-slate-400 text-xs">{r.supplier}</td>
                                            <td className="py-2.5 px-3 text-slate-400 text-xs">{r.spec}</td>
                                            <td className="py-2.5 px-3"><CertBadge cert={r.cert} color={r.certColor} /></td>
                                            <td className="py-2.5 px-3 text-slate-400 text-xs">{r.unit}</td>
                                            <td className="py-2.5 px-3 text-slate-300 text-xs font-mono">{r.qty}</td>
                                            <td className="py-2.5 px-3 text-slate-400 text-xs font-mono">{r.price}</td>
                                            <td className="py-2.5 px-3 text-teal-400 text-xs font-bold">{r.cost}</td>
                                        </tr>
                                    ))}
                                    <tr className="bg-slate-900/60 border-t border-slate-600">
                                        <td colSpan={7} className="py-2 px-3 text-slate-400 text-xs font-semibold">Trims & Accessories Subtotal</td>
                                        <td className="py-2 px-3 text-teal-400 text-sm font-bold">{sd.trimsSubtotal}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </AccordionSection>

                    {/* Section 3 — CMT */}
                    <AccordionSection title="Section 3 — CMT (Cut · Make · Trim)" sub="Labour, machine, finishing, and pressing cost" totalLabel={sd.cmtSubtotal + ' / pc'} iconEmoji="🏭">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-900 border-b border-slate-700">
                                        {['Process Stage','SAM (mins)','Line Eff.%','Workers','Min Wage/hr','Machine OH','Cost/pc'].map(h => (
                                            <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-white whitespace-nowrap">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {sd.cmtBOM.map((r, i) => (
                                        <tr key={i} className={`border-b border-slate-700/40 ${i % 2 === 0 ? '' : 'bg-slate-900/20'}`}>
                                            <td className="py-2.5 px-3 text-white text-xs font-medium">{r.stage}</td>
                                            <td className="py-2.5 px-3 text-slate-300 text-xs font-mono">{r.sam}</td>
                                            <td className="py-2.5 px-3 text-slate-400 text-xs">{r.eff}</td>
                                            <td className="py-2.5 px-3 text-slate-400 text-xs">{r.workers}</td>
                                            <td className="py-2.5 px-3 text-slate-400 text-xs font-mono">{r.wage}</td>
                                            <td className="py-2.5 px-3 text-slate-400 text-xs font-mono">{r.machOH}</td>
                                            <td className="py-2.5 px-3 text-teal-400 text-xs font-bold">{r.cost}</td>
                                        </tr>
                                    ))}
                                    <tr className="bg-slate-900/60 border-t border-slate-600">
                                        <td className="py-2 px-3 text-slate-400 text-xs font-semibold">CMT Total</td>
                                        <td className="py-2 px-3 text-slate-300 text-xs font-mono">{sd.cmtTotal} SAM</td>
                                        <td colSpan={4}></td>
                                        <td className="py-2 px-3 text-teal-400 text-sm font-bold">{sd.cmtSubtotal}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </AccordionSection>

                    {/* Section 4 — Overhead + FOB */}
                    <AccordionSection title="Section 4 — Overhead, Margin & FOB Build-up" sub="Factory overhead, profit, freight, agent commission" totalLabel={sd.fobPrice + ' FOB'} iconEmoji="📈">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-900 border-b border-slate-700">
                                        {['Cost Component','Basis','Rate / %','Value / pc','Cumulative'].map(h => (
                                            <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-white whitespace-nowrap">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {sd.overheadBOM.map((r, i) => (
                                        <tr key={i} className={`border-b border-slate-700/40 ${r.profit ? 'bg-emerald-500/5' : i % 2 === 0 ? '' : 'bg-slate-900/20'}`}>
                                            <td className={`py-2.5 px-3 text-xs font-medium ${r.profit ? 'text-emerald-300' : 'text-white'}`}>{r.comp}</td>
                                            <td className="py-2.5 px-3 text-slate-400 text-xs">{r.basis}</td>
                                            <td className="py-2.5 px-3 text-slate-300 text-xs font-mono">{r.rate}</td>
                                            <td className={`py-2.5 px-3 text-xs font-mono ${r.profit ? 'text-emerald-400 font-bold' : 'text-slate-300'}`}>{r.value}</td>
                                            <td className="py-2.5 px-3 text-teal-400 text-xs font-bold">{r.cum}</td>
                                        </tr>
                                    ))}
                                    <tr className="bg-teal-500/10 border-t border-teal-500/30">
                                        <td colSpan={3} className="py-3 px-3 text-white text-sm font-bold">FOB Price (Ex-Factory, CMP Basis)</td>
                                        <td></td>
                                        <td className="py-3 px-3 text-teal-300 text-xl font-bold">{sd.fobPrice}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </AccordionSection>

                    {/* Cost Summary Bar */}
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-4 p-4 border-t border-slate-700 bg-slate-900/40">
                        {sd.costSummary.map((item, i) => (
                            <div key={i} className="text-center">
                                <p className="text-slate-500 text-xs uppercase tracking-wide mb-1">{item.label}</p>
                                <p className={`text-xl font-bold ${item.color}`}>{item.value}</p>
                                <p className="text-slate-600 text-xs mt-0.5">{item.sub}</p>
                            </div>
                        ))}
                    </div>

                    {/* Margin Waterfall */}
                    <div className="p-4 border-t border-slate-700">
                        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">Cost Waterfall — FOB Build-up</p>
                        <div className="space-y-2">
                            {sd.waterfall.map((row, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <span className="text-slate-400 text-xs w-20 shrink-0 text-right">{row.label}</span>
                                    <div className="flex-1 bg-slate-700 rounded-full h-5 overflow-hidden">
                                        <div className={`${row.bg} h-5 rounded-full flex items-center justify-end pr-2 transition-all duration-700`}
                                            style={{ width: `${row.pct}%` }}>
                                            <span className="text-white text-xs font-semibold">{row.pct}%</span>
                                        </div>
                                    </div>
                                    <span className="text-slate-300 text-xs font-mono w-12">{row.val}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Approval Workflow */}
                    <div className="p-4 border-t border-slate-700 bg-slate-900/20">
                        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">Approval Workflow</p>
                        <div className="flex items-start justify-between gap-2 overflow-x-auto pb-2">
                            {sd.approvalSteps.map((step, i) => (
                                <div key={i} className="flex flex-col items-center min-w-[80px] text-center">
                                    <ApprovalDot state={step.state} />
                                    <p className={`text-xs font-semibold mt-2 whitespace-pre-line leading-tight ${
                                        step.state === 'done'    ? 'text-emerald-400' :
                                        step.state === 'current' ? 'text-orange-300'  : 'text-slate-500'
                                    }`}>{step.label}</p>
                                    <p className="text-slate-600 text-xs mt-1">{step.sub}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            );

            case 'bom': return (
                <div className="p-4 space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">Full BOM — {style.name}</p>
                    <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-700 flex items-center justify-between">
                        <span className="text-slate-300 text-sm">Fabric Materials</span>
                        <span className="text-teal-400 font-bold">{sd.fabricSubtotal} / pc · {sd.fabricBOM.length} items</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-700 flex items-center justify-between">
                        <span className="text-slate-300 text-sm">Trims & Accessories</span>
                        <span className="text-teal-400 font-bold">{sd.trimsSubtotal} / pc · {sd.trimsBOM.length} items</span>
                    </div>
                    <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-between">
                        <span className="text-white text-sm font-semibold">Total Material Cost</span>
                        <span className="text-teal-300 font-bold text-lg">
                            ${(parseFloat(sd.fabricSubtotal.replace('$','')) + parseFloat(sd.trimsSubtotal.replace('$',''))).toFixed(2)} / pc
                        </span>
                    </div>
                    <p className="text-slate-500 text-xs mt-2">Switch to Cost Sheet tab to see full BOM details.</p>
                </div>
            );

            case 'cmt': return (
                <div className="p-4">
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">CMT Summary — {style.name}</p>
                    <div className="space-y-2">
                        {sd.cmtBOM.map((r, i) => (
                            <div key={i} className="p-3 rounded-xl bg-slate-900/40 border border-slate-700 flex items-center gap-4">
                                <span className="text-white text-xs font-medium flex-1">{r.stage}</span>
                                <span className="text-slate-400 text-xs font-mono">{r.sam} SAM</span>
                                <span className="text-slate-400 text-xs">{r.eff} eff.</span>
                                <span className="text-teal-400 text-xs font-bold w-10 text-right">{r.cost}</span>
                            </div>
                        ))}
                        <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-between">
                            <span className="text-white font-semibold text-sm">Total CMT Cost</span>
                            <span className="text-teal-300 font-bold text-lg">{sd.cmtSubtotal} · {sd.cmtTotal} SAM</span>
                        </div>
                    </div>
                </div>
            );

            case 'margin': return (
                <div className="p-4">
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">Margin Analysis — {style.name}</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {sd.costSummary.map((item, i) => (
                            <div key={i} className="p-4 rounded-xl bg-slate-900/40 border border-slate-700 text-center">
                                <p className="text-slate-400 text-xs uppercase tracking-wide mb-2">{item.label}</p>
                                <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
                                <p className="text-slate-500 text-xs mt-1">{item.sub}</p>
                            </div>
                        ))}
                    </div>
                </div>
            );

            case 'revisions': return (
                <div className="p-4 space-y-3">
                    {[
                        { ver: sd.version.split(' ·')[0], date: '24 Mar 2025', by: 'Rajesh K', note: sd.version.includes('Approved') ? 'Costing Head approved. FOB confirmed.' : 'Current working version.', status: sd.version.includes('Approved') ? 'Approved' : 'In Review' },
                        { ver: 'v1.0', date: '20 Mar 2025', by: 'TexElite', note: 'Initial submission with fabric prices from latest indent.', status: 'Superseded' },
                    ].map((r, i) => (
                        <div key={i} className="flex items-start gap-4 p-3 rounded-xl bg-slate-900/40 border border-slate-700">
                            <span className="font-mono text-xs text-teal-400 bg-teal-500/10 px-2 py-1 rounded shrink-0">{r.ver}</span>
                            <div className="flex-1">
                                <p className="text-white text-xs font-semibold">{r.note}</p>
                                <p className="text-slate-500 text-xs mt-0.5">{r.by} · {r.date}</p>
                            </div>
                            <StatusBadge status={r.status} />
                        </div>
                    ))}
                </div>
            );

            default: return null;
        }
    };

    return (
        <div className="space-y-6 pb-8" data-testid="po-garment-costing">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">PO Wise Garment Costing</h1>
                    <p className="text-slate-400 mt-1">AW2027 — Full BOM, CMT & FOB cost sheet per style and colour lot</p>
                </div>
                <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800"
                    onClick={() => navigate('/dashboard/brand/po-sc-management')}>
                    <ArrowLeft className="h-4 w-4 mr-2" /> PO & SC Management
                </Button>
            </div>

            {/* PO Selector Bar */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700 flex-wrap">
                <span className="text-slate-500 text-xs font-semibold uppercase tracking-widest">Active PO</span>
                <div className="flex gap-2 flex-wrap">
                    {PO_LIST.map(po => (
                        <button key={po.id} onClick={() => setActivePO(po.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                                activePO === po.id
                                    ? 'bg-teal-600/20 border-teal-500/50 text-teal-300'
                                    : 'bg-slate-900/40 border-slate-700 text-slate-400 hover:border-slate-500'
                            }`}>
                            {po.id}
                        </button>
                    ))}
                </div>
                <div className="w-px h-5 bg-slate-700 mx-1 hidden sm:block" />
                <span className="text-xs px-2 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300">🏷️ Zara (Inditex)</span>
                <span className="text-xs px-2 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300">📅 SS 2025</span>
                <div className="ml-auto flex gap-2">
                    <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 text-xs h-8">+ New Cost Sheet</Button>
                    <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white text-xs h-8">📤 Submit to Brand</Button>
                </div>
            </div>

            {/* Main Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                {/* LEFT — Style List */}
                <Card className="lg:col-span-2 bg-slate-800/50 border-slate-700">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-white text-base">Styles in PO</CardTitle>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-700 text-slate-300">4 STYLES</span>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {STYLES.map(s => (
                            <div key={s.id} onClick={() => { setActiveStyle(s.id); setActiveTab('costsheet'); }}
                                className={`p-4 cursor-pointer border-b border-slate-700/50 transition-all ${
                                    activeStyle === s.id
                                        ? 'bg-teal-600/10 border-l-2 border-l-teal-500'
                                        : 'hover:bg-slate-700/30'
                                }`}>
                                <p className="text-slate-500 text-xs font-mono mb-0.5">STY · {s.id}</p>
                                <p className="text-white text-sm font-semibold">{s.name}</p>
                                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                    <span className="text-xs px-2 py-0.5 rounded bg-slate-700 text-slate-300">{s.cat}</span>
                                    <span className="text-xs px-2 py-0.5 rounded bg-teal-500/10 border border-teal-500/30 text-teal-300 font-semibold">FOB {s.fob}</span>
                                    <StatusBadge status={s.status} />
                                </div>
                            </div>
                        ))}

                        {/* PO Cost Summary */}
                        <div className="p-4 bg-slate-900/40 border-t border-slate-700">
                            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">PO Cost Summary</p>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-slate-400 text-xs">Total FOB Value</span>
                                    <span className="text-teal-400 text-xs font-bold font-mono">{PO_SUMMARY.fobValue}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400 text-xs">Total Cost (Ex-Overhead)</span>
                                    <span className="text-slate-300 text-xs font-mono">{PO_SUMMARY.totalCost}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400 text-xs">Gross Margin</span>
                                    <span className="text-emerald-400 text-xs font-bold font-mono">{PO_SUMMARY.grossMargin}</span>
                                </div>
                                <div className="w-full bg-slate-700 rounded-full h-1.5 mt-1">
                                    <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${PO_SUMMARY.marginPct}%` }} />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* RIGHT — Cost Sheet */}
                <Card className="lg:col-span-3 bg-slate-800/50 border-slate-700 overflow-hidden">
                    {/* Sheet Top Bar */}
                    <div className="flex items-start justify-between p-4 border-b border-slate-700">
                        <div>
                            <p className="text-slate-400 text-xs font-mono">BUYER PO: {activePO} &nbsp;|&nbsp; STYLE: {activeStyle} &nbsp;|&nbsp; SEASON: SS 2025</p>
                            <p className="text-white text-lg font-bold mt-0.5">
                                {style.name}
                                <span className="text-slate-400 text-sm font-normal ml-2">— {sd.category}</span>
                            </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs px-2 py-1 rounded bg-teal-500/20 border border-teal-500/40 text-teal-300">{sd.version}</span>
                            <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 text-xs h-7">
                                <Download className="h-3 w-3 mr-1" />PDF
                            </Button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-0 border-b border-slate-700 overflow-x-auto">
                        {TABS.map(tab => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors ${
                                    activeTab === tab.id
                                        ? 'border-teal-500 text-teal-300 bg-teal-500/5'
                                        : 'border-transparent text-slate-400 hover:text-slate-300 hover:bg-slate-700/30'
                                }`}>
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {renderTabContent()}
                </Card>
            </div>
        </div>
    );
};

export default POGarmentCosting;
