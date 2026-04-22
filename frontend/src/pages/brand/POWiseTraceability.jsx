import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, GitBranch, ChevronRight, MapPin, Award, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// ── Static Seed Data ───────────────────────────────────────────────────────────

const PO_OPTIONS = [
  { id: 'PO-AW27-4812', brand: 'Zara', season: 'AW2027', qty: 12400 },
  { id: 'PO-AW27-3991', brand: 'H&M',  season: 'AW2027', qty: 8600  },
  { id: 'PO-AW27-5100', brand: 'M&S',  season: 'AW2027', qty: 15200 },
];

const CHAIN_DATA = {
  'PO-AW27-4812': [
    { stage: 'Raw Material',      supplier: 'Xinjiang Cotton Co.',       location: 'Changji, China',          certs: ['GOTS', 'BCI'],               pct: 100, status: 'Completed',   address: '14 Industrial Rd, Changji, Xinjiang 831100, China',         contact: '+86 994 312 4400', batchRef: 'RM-XJC-AW27-001', batchQty: '18,400 kg raw cotton' },
    { stage: 'Spinning',          supplier: 'Arvind Spinning Mills',     location: 'Ahmedabad, India',        certs: ['OE-Tex', 'ISO 9001'],         pct: 100, status: 'Completed',   address: 'Naroda Industrial Estate, Ahmedabad 382330, Gujarat, India', contact: '+91 79 2280 1100', batchRef: 'SP-ASM-AW27-042', batchQty: '14,200 kg yarn (Ne 30s)' },
    { stage: 'Weaving / Knitting',supplier: 'Coats Digital Fabrics',     location: 'Tirupur, India',          certs: ['OEKO-TEX 100'],               pct: 100, status: 'Completed',   address: 'Phase II, SIDCO Industrial Estate, Tirupur 641604, Tamil Nadu', contact: '+91 421 2250 800', batchRef: 'WV-CDF-AW27-088', batchQty: '11,600 m² woven fabric' },
    { stage: 'Dyeing & Finishing',supplier: 'Hyosung Green',             location: 'Daegu, South Korea',      certs: ['GOTS', 'bluesign'],           pct: 80,  status: 'In Progress', address: '22 Seongseo Industrial Complex, Daegu 42714, South Korea',   contact: '+82 53 600 7700', batchRef: 'DY-HYO-AW27-031', batchQty: '9,280 m² (80% complete)' },
    { stage: 'Cut & Sew',         supplier: 'TCH Garments Pvt Ltd',      location: 'Bangalore, India',        certs: ['SA8000', 'ISO 14001'],        pct: 65,  status: 'In Progress', address: 'Plot 47, Bommasandra Industrial Area, Bangalore 560099, India', contact: '+91 80 2783 5500', batchRef: 'CS-TCH-AW27-017', batchQty: '8,060 pcs cut (65% sewn)' },
    { stage: 'QC & Packing',      supplier: 'TCH Garments Pvt Ltd',      location: 'Bangalore, India',        certs: ['ISO 9001'],                   pct: 10,  status: 'Pending',    address: 'Plot 47, Bommasandra Industrial Area, Bangalore 560099, India', contact: '+91 80 2783 5500', batchRef: 'QC-TCH-AW27-017', batchQty: '1,240 pcs QC cleared' },
    { stage: 'Shipped',           supplier: 'Maersk Logistics',          location: 'Chennai Port, India',     certs: [],                             pct: 0,   status: 'Pending',    address: 'Chennai Port Trust, Rajaji Salai, Chennai 600001, India',   contact: '+91 44 2525 4000', batchRef: 'SH-MLG-AW27-—',  batchQty: 'Not yet dispatched' },
  ],
  'PO-AW27-3991': [
    { stage: 'Raw Material',      supplier: 'Better Cotton Initiative',  location: 'Izmir, Turkey',           certs: ['BCI', 'GOTS'],                pct: 100, status: 'Completed',   address: 'Organize Sanayi Bölgesi, Izmir 35620, Turkey',              contact: '+90 232 472 3300', batchRef: 'RM-BCI-AW27-022', batchQty: '12,100 kg BCI cotton' },
    { stage: 'Spinning',          supplier: 'Soktas Spinning',           location: 'Bursa, Turkey',           certs: ['ISO 9001', 'OEKO-TEX 100'],   pct: 100, status: 'Completed',   address: 'Demirtaş OSB, Bursa 16370, Turkey',                        contact: '+90 224 411 8800', batchRef: 'SP-SOK-AW27-031', batchQty: '9,800 kg yarn (Ne 40s)' },
    { stage: 'Weaving / Knitting',supplier: 'Pacific Knits Ltd',         location: 'Dhaka, Bangladesh',       certs: ['OEKO-TEX 100', 'ISO 9001'],   pct: 100, status: 'Completed',   address: 'Ashulia EPZ, Savar, Dhaka 1345, Bangladesh',               contact: '+880 2 7789 2200', batchRef: 'KN-PKL-AW27-055', batchQty: '8,200 m² knit fabric' },
    { stage: 'Dyeing & Finishing',supplier: 'Nylstar Dyehouse',          location: 'Porto, Portugal',         certs: ['bluesign', 'GOTS'],           pct: 90,  status: 'In Progress', address: 'Rua Industrial 88, Porto 4460-009, Portugal',              contact: '+351 22 946 5500', batchRef: 'DY-NYL-AW27-044', batchQty: '7,380 m² dyed' },
    { stage: 'Cut & Sew',         supplier: 'Beximco Garments',          location: 'Gazipur, Bangladesh',     certs: ['SA8000', 'ISO 14001'],        pct: 50,  status: 'In Progress', address: 'Bhaluka EPZ, Gazipur 1700, Bangladesh',                    contact: '+880 2 9860 4400', batchRef: 'CS-BEX-AW27-028', batchQty: '4,300 pcs in production' },
    { stage: 'QC & Packing',      supplier: 'Beximco Garments',          location: 'Gazipur, Bangladesh',     certs: ['ISO 9001'],                   pct: 0,   status: 'Pending',    address: 'Bhaluka EPZ, Gazipur 1700, Bangladesh',                    contact: '+880 2 9860 4400', batchRef: 'QC-BEX-AW27-—',  batchQty: 'Not yet started' },
    { stage: 'Shipped',           supplier: 'CMA CGM Logistics',         location: 'Chittagong Port, BD',     certs: [],                             pct: 0,   status: 'Pending',    address: 'Chittagong Port Authority, Bandar, Chittagong 4100, BD',   contact: '+880 31 710 3300', batchRef: 'SH-CMA-AW27-—',  batchQty: 'Not yet dispatched' },
  ],
  'PO-AW27-5100': [
    { stage: 'Raw Material',      supplier: 'Scottish Wool Board',       location: 'Edinburgh, Scotland',     certs: ['GOTS', 'RWS'],                pct: 100, status: 'Completed',   address: 'National Wool Centre, Edinburgh EH12 9DQ, Scotland',       contact: '+44 131 335 1200', batchRef: 'RM-SWB-AW27-009', batchQty: '22,000 kg wool tops' },
    { stage: 'Spinning',          supplier: 'Zegna Baruffa Yarns',       location: 'Biella, Italy',           certs: ['OE-Tex', 'ISO 9001'],         pct: 100, status: 'Completed',   address: 'Via Vaglio Rosso 1, Biella 13900, Italy',                  contact: '+39 015 252 2200', batchRef: 'SP-ZBY-AW27-018', batchQty: '17,800 kg worsted yarn' },
    { stage: 'Weaving / Knitting',supplier: 'Abraham Moon & Sons',       location: 'Leeds, UK',               certs: ['OEKO-TEX 100', 'ISO 9001'],   pct: 100, status: 'Completed',   address: 'Netherfield Mills, Guiseley, Leeds LS20 9PD, UK',          contact: '+44 1943 872 204', batchRef: 'WV-AMS-AW27-033', batchQty: '14,600 m² woven tweed' },
    { stage: 'Dyeing & Finishing',supplier: 'Hainsworth Textiles',       location: 'Leeds, UK',               certs: ['bluesign', 'Higg FEM'],       pct: 95,  status: 'In Progress', address: 'Stanningley Mills, Leeds LS28 6BQ, UK',                    contact: '+44 113 255 6868', batchRef: 'DY-HAI-AW27-021', batchQty: '13,870 m² finished' },
    { stage: 'Cut & Sew',         supplier: 'Dewhirst Group Ltd',        location: 'Leeds, UK',               certs: ['SA8000', 'ISO 14001'],        pct: 70,  status: 'In Progress', address: 'Dewhirst House, Eldon St, Leeds LS2 7DF, UK',              contact: '+44 113 246 7700', batchRef: 'CS-DEW-AW27-011', batchQty: '10,640 pcs in production' },
    { stage: 'QC & Packing',      supplier: 'Dewhirst Group Ltd',        location: 'Leeds, UK',               certs: ['ISO 9001'],                   pct: 25,  status: 'In Progress', address: 'Dewhirst House, Eldon St, Leeds LS2 7DF, UK',              contact: '+44 113 246 7700', batchRef: 'QC-DEW-AW27-011', batchQty: '3,800 pcs QC passed' },
    { stage: 'Shipped',           supplier: 'DB Schenker UK',            location: 'Felixstowe Port, UK',     certs: [],                             pct: 0,   status: 'Pending',    address: 'Dock Gate 1, Felixstowe IP11 3SY, Suffolk, UK',            contact: '+44 1394 604 200', batchRef: 'SH-DBS-AW27-—',  batchQty: 'Not yet dispatched' },
  ],
};

// ── Helpers ────────────────────────────────────────────────────────────────────

const STATUS_STYLE = {
  'Completed':   'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  'In Progress': 'bg-teal-500/20 text-teal-300 border-teal-500/40',
  'Pending':     'bg-slate-600/30 text-slate-400 border-slate-600/50',
};

const STAGE_BG = {
  'Completed':   'bg-emerald-600/20 border-emerald-500/40',
  'In Progress': 'bg-teal-600/20 border-teal-500/40',
  'Pending':     'bg-slate-700/40 border-slate-600/40',
};

// ── Component ──────────────────────────────────────────────────────────────────

export default function POWiseTraceability() {
  const navigate = useNavigate();
  const [activePO, setActivePO]       = useState('PO-AW27-4812');
  const [expandedIdx, setExpandedIdx] = useState(null);

  const chain = CHAIN_DATA[activePO] || [];

  function toggleExpand(idx) {
    setExpandedIdx(prev => (prev === idx ? null : idx));
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/brand/po-sc-management')}
          className="text-slate-400 hover:text-white">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <GitBranch className="w-6 h-6 text-teal-400" />
        <h1 className="text-xl font-semibold text-white">PO Wise Supply Chain Traceability</h1>
      </div>

      {/* PO Tabs */}
      <div className="flex gap-2 mb-6">
        {PO_OPTIONS.map(po => (
          <button key={po.id} onClick={() => { setActivePO(po.id); setExpandedIdx(null); }}
            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
              activePO === po.id
                ? 'bg-teal-600/20 border-teal-500/50 text-teal-300'
                : 'border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'
            }`}>
            {po.id} <span className="opacity-60">· {po.brand}</span>
          </button>
        ))}
      </div>

      {/* Chain Flow */}
      <div className="flex items-start gap-1 mb-6 overflow-x-auto pb-2">
        {chain.map((node, idx) => (
          <React.Fragment key={node.stage}>
            <button onClick={() => toggleExpand(idx)}
              className={`flex-shrink-0 w-36 rounded-xl border p-3 text-left transition-all hover:scale-105 ${
                expandedIdx === idx ? 'ring-2 ring-teal-500/60 ' : ''
              }${STAGE_BG[node.status]}`}>
              <div className="text-xs font-semibold text-slate-200 leading-tight mb-2">{node.stage}</div>
              <div className="text-xs text-slate-400 truncate">{node.supplier}</div>
              <div className="flex items-center gap-1 mt-2">
                <MapPin className="w-3 h-3 text-slate-500 flex-shrink-0" />
                <span className="text-xs text-slate-500 truncate">{node.location.split(',')[0]}</span>
              </div>
              <div className="mt-2">
                <div className="flex justify-between text-xs mb-1">
                  <span className={`font-medium ${node.status === 'Completed' ? 'text-emerald-400' : node.status === 'In Progress' ? 'text-teal-400' : 'text-slate-500'}`}>{node.pct}%</span>
                </div>
                <div className="h-1 rounded-full bg-slate-700">
                  <div className={`h-1 rounded-full transition-all ${node.status === 'Completed' ? 'bg-emerald-500' : node.status === 'In Progress' ? 'bg-teal-500' : 'bg-slate-600'}`}
                    style={{ width: `${node.pct}%` }} />
                </div>
              </div>
              <div className="mt-2">
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs border ${STATUS_STYLE[node.status]}`}>{node.status}</span>
              </div>
              <div className="mt-1 text-xs text-slate-500 flex items-center gap-0.5">
                {expandedIdx === idx ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                <span>Details</span>
              </div>
            </button>
            {idx < chain.length - 1 && (
              <div className="flex-shrink-0 self-center">
                <ChevronRight className="w-5 h-5 text-slate-600" />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Expanded Detail Panel */}
      {expandedIdx !== null && (
        <Card className="bg-slate-800 border-slate-700 mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-teal-300 flex items-center gap-2">
              <GitBranch className="w-4 h-4" />
              {chain[expandedIdx].stage} — {chain[expandedIdx].supplier}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-slate-500 text-xs mb-1">Address</div>
                <div className="text-slate-200">{chain[expandedIdx].address}</div>
              </div>
              <div>
                <div className="text-slate-500 text-xs mb-1">Contact</div>
                <div className="text-slate-200">{chain[expandedIdx].contact}</div>
              </div>
              <div>
                <div className="text-slate-500 text-xs mb-1">Batch Reference</div>
                <div className="text-teal-300 font-mono">{chain[expandedIdx].batchRef}</div>
              </div>
              <div>
                <div className="text-slate-500 text-xs mb-1">Batch Quantity</div>
                <div className="text-slate-200">{chain[expandedIdx].batchQty}</div>
              </div>
            </div>
            <div className="mt-4">
              <div className="text-slate-500 text-xs mb-2">Certifications</div>
              <div className="flex gap-2 flex-wrap">
                {chain[expandedIdx].certs.length > 0
                  ? chain[expandedIdx].certs.map(c => (
                    <span key={c} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 text-xs">
                      <Award className="w-3 h-3" /> {c}
                    </span>
                  ))
                  : <span className="text-slate-500 text-xs">No certifications applicable</span>
                }
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Legend */}
      <div className="flex gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />Completed</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-teal-500 inline-block" />In Progress</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-600 inline-block" />Pending</span>
      </div>
    </div>
  );
}
