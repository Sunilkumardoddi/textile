import React, { useState } from 'react';
import { GitBranch, Leaf, DollarSign, ChevronDown, CheckCircle, Clock, XCircle, AlertTriangle, Package, Truck, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// ── Static data ─────────────────────────────────────────────────────────────
const SEASONS = ['All Seasons', 'AW2027', 'SS2027', 'AW2028'];
const SUPPLIERS = ['All Suppliers', 'TCH Garments Pvt Ltd', 'Beximco Garments Ltd', 'Arvind Ltd'];

const PO_DATA = {
  'All Seasons': {
    'All Suppliers': ['PO-AW27-4812', 'PO-AW27-3991', 'PO-SS27-2201', 'PO-SS27-2202', 'PO-AW28-1001'],
  },
  AW2027: {
    'All Suppliers':        ['PO-AW27-4812', 'PO-AW27-3991'],
    'TCH Garments Pvt Ltd': ['PO-AW27-4812'],
    'Beximco Garments Ltd': ['PO-AW27-3991'],
    'Arvind Ltd':           [],
  },
  SS2027: {
    'All Suppliers':        ['PO-SS27-2201', 'PO-SS27-2202'],
    'TCH Garments Pvt Ltd': ['PO-SS27-2201'],
    'Beximco Garments Ltd': ['PO-SS27-2202'],
    'Arvind Ltd':           [],
  },
  AW2028: {
    'All Suppliers':        ['PO-AW28-1001'],
    'TCH Garments Pvt Ltd': ['PO-AW28-1001'],
    'Beximco Garments Ltd': [],
    'Arvind Ltd':           [],
  },
};

const PO_DETAILS = {
  'PO-AW27-4812': {
    brand: 'Zara (Inditex)', manufacturer: 'TCH Garments Pvt Ltd', season: 'AW2027',
    status: 'Completed', totalQty: 12400, totalValue: 489200, delivery: '15 Oct 2027',
    styles: [
      { no: 'ZR-AW27-JK001', desc: 'Wool Blend Jacket',         category: 'Outerwear', qty: 800,  fob: 24.5,  status: 'Completed',    fabric: 'Wool Blend 400gsm',   mill: 'Kavali Textiles Pvt Ltd' },
      { no: 'ZR-AW27-SW002', desc: 'Cotton Fleece Sweatshirt',  category: 'Tops',      qty: 1200, fob: 12.8,  status: 'Completed',    fabric: 'Cotton Fleece 280gsm', mill: 'Danilo Fabrics' },
      { no: 'ZR-AW27-TR003', desc: 'Polyester Twill Trousers',  category: 'Bottoms',   qty: 700,  fob: 18.2,  status: 'Shipped',      fabric: 'Poly Twill 220gsm',   mill: 'Kavali Textiles Pvt Ltd' },
      { no: 'ZR-AW27-DRS004',desc: 'Viscose Satin Dress',       category: 'Dresses',   qty: 400,  fob: 22.1,  status: 'In Production',fabric: 'Viscose Satin 110gsm', mill: 'Danilo Fabrics' },
    ],
  },
  'PO-AW27-3991': {
    brand: 'Zara (Inditex)', manufacturer: 'Beximco Garments Ltd', season: 'AW2027',
    status: 'Active', totalQty: 8600, totalValue: 298400, delivery: '20 Sep 2027',
    styles: [
      { no: 'ZR-AW27-KN001', desc: 'Merino Wool Knit Top',      category: 'Tops',      qty: 3200, fob: 18.5,  status: 'In Production',fabric: 'Merino Wool 200gsm',   mill: 'Kavali Textiles Pvt Ltd' },
      { no: 'ZR-AW27-JK002', desc: 'Padded Puffer Jacket',      category: 'Outerwear', qty: 2800, fob: 32.0,  status: 'QC',           fabric: 'Nylon Ripstop 80gsm',  mill: 'Danilo Fabrics' },
      { no: 'ZR-AW27-PT002', desc: 'Slim Fit Ponte Trousers',   category: 'Bottoms',   qty: 2600, fob: 16.5,  status: 'Shipped',      fabric: 'Ponte Fabric 280gsm',  mill: 'Kavali Textiles Pvt Ltd' },
    ],
  },
  'PO-SS27-2201': {
    brand: 'Zara (Inditex)', manufacturer: 'TCH Garments Pvt Ltd', season: 'SS2027',
    status: 'Active', totalQty: 9200, totalValue: 156000, delivery: '30 Apr 2027',
    styles: [
      { no: 'ZR-SS27-LN001', desc: 'Linen Shirt',               category: 'Tops',      qty: 4000, fob: 10.2,  status: 'In Production',fabric: 'Linen Plain 140gsm',   mill: 'Kavali Textiles Pvt Ltd' },
      { no: 'ZR-SS27-SH002', desc: 'Floral Print Shorts',       category: 'Bottoms',   qty: 3200, fob: 9.5,   status: 'QC',           fabric: 'Cotton Poplin 120gsm', mill: 'Danilo Fabrics' },
      { no: 'ZR-SS27-DR001', desc: 'Wrap Midi Dress',           category: 'Dresses',   qty: 2000, fob: 14.8,  status: 'Pending',      fabric: 'Rayon Challis 100gsm', mill: 'Danilo Fabrics' },
    ],
  },
  'PO-SS27-2202': {
    brand: 'Zara (Inditex)', manufacturer: 'Beximco Garments Ltd', season: 'SS2027',
    status: 'Pending Confirmation', totalQty: 6400, totalValue: 110000, delivery: '15 May 2027',
    styles: [
      { no: 'ZR-SS27-TR002', desc: 'Linen Blend Trousers',      category: 'Bottoms',   qty: 3600, fob: 11.2,  status: 'Pending',      fabric: 'Linen Blend 160gsm',   mill: 'Kavali Textiles Pvt Ltd' },
      { no: 'ZR-SS27-TP001', desc: 'Pique Polo Top',            category: 'Tops',      qty: 2800, fob: 8.9,   status: 'Pending',      fabric: 'Cotton Pique 180gsm',  mill: 'Danilo Fabrics' },
    ],
  },
  'PO-AW28-1001': {
    brand: 'Zara (Inditex)', manufacturer: 'TCH Garments Pvt Ltd', season: 'AW2028',
    status: 'Pending Confirmation', totalQty: 5000, totalValue: 110000, delivery: '01 Sep 2028',
    styles: [
      { no: 'ZR-AW28-JK001', desc: 'Double-Breasted Blazer',    category: 'Outerwear', qty: 2000, fob: 28.5,  status: 'Pending',      fabric: 'Wool Mix 320gsm',     mill: 'Kavali Textiles Pvt Ltd' },
      { no: 'ZR-AW28-TR001', desc: 'Wide Leg Tweed Trousers',   category: 'Bottoms',   qty: 3000, fob: 17.8,  status: 'Pending',      fabric: 'Tweed 260gsm',        mill: 'Danilo Fabrics' },
    ],
  },
};

const SUSTAINABILITY_DATA = {
  'TCH Garments Pvt Ltd':   { femScore: 77, certs: ['GOTS','SA8000','ISO 14001','Sedex SMETA'], carbon: '2.8 kg CO₂/pcs', water: '32 L/pcs', compliance: 91 },
  'Beximco Garments Ltd':   { femScore: 63, certs: ['SA8000','Sedex SMETA'], carbon: '3.4 kg CO₂/pcs', water: '41 L/pcs', compliance: 74 },
  'Arvind Ltd':             { femScore: 71, certs: ['GOTS','OCS'], carbon: '3.1 kg CO₂/pcs', water: '36 L/pcs', compliance: 85 },
  'Kavali Textiles Pvt Ltd':{ femScore: 68, certs: ['GOTS','GRS','OCS'], carbon: '1.9 kg CO₂/mtr', water: '28 L/mtr', compliance: 78 },
  'Danilo Fabrics':         { femScore: 61, certs: ['BCI'], carbon: '2.2 kg CO₂/mtr', water: '35 L/mtr', compliance: 62 },
};

const STYLE_STATUS_CFG = {
  Completed:     'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  Shipped:       'bg-teal-500/20 text-teal-300 border-teal-500/40',
  QC:            'bg-amber-500/20 text-amber-300 border-amber-500/40',
  'In Production':'bg-blue-500/20 text-blue-300 border-blue-500/40',
  Pending:       'bg-slate-500/20 text-slate-300 border-slate-500/40',
};
const PO_STATUS_CFG = {
  Completed:               'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  Active:                  'bg-blue-500/20 text-blue-300 border-blue-500/40',
  'Pending Confirmation':  'bg-amber-500/20 text-amber-300 border-amber-500/40',
};

function ScoreBar({ score, max = 100 }) {
  const pct = Math.round((score / max) * 100);
  const color = pct >= 75 ? 'bg-emerald-500' : pct >= 60 ? 'bg-amber-400' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-xs font-bold w-8 text-right ${pct >= 75 ? 'text-emerald-400' : pct >= 60 ? 'text-amber-400' : 'text-red-400'}`}>{score}</span>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function SupplyChainSustainability() {
  const [season, setSeason]     = useState('All Seasons');
  const [supplier, setSupplier] = useState('All Suppliers');
  const [selectedPO, setSelectedPO] = useState('All POs');
  const [activeTab, setActiveTab]   = useState('chain');

  const availablePOs = ['All POs', ...(PO_DATA[season]?.[supplier] || PO_DATA[season]?.['All Suppliers'] || Object.keys(PO_DETAILS))];

  const filteredPOs = Object.entries(PO_DETAILS).filter(([id, po]) => {
    const seasonMatch = season === 'All Seasons' || po.season === season;
    const supplierMatch = supplier === 'All Suppliers' || po.manufacturer === supplier;
    const poMatch = selectedPO === 'All POs' || id === selectedPO;
    return seasonMatch && supplierMatch && poMatch;
  });

  const totalValue = filteredPOs.reduce((n, [, p]) => n + p.totalValue, 0);
  const totalQty   = filteredPOs.reduce((n, [, p]) => n + p.totalQty, 0);
  const totalStyles = filteredPOs.reduce((n, [, p]) => n + p.styles.length, 0);

  const TABS = [
    { id: 'chain', label: 'Supply Chain Map', icon: GitBranch },
    { id: 'sustainability', label: 'Sustainability', icon: Leaf },
    { id: 'costing', label: 'Costing', icon: DollarSign },
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Supply Chain · Sustainability · Costing</h1>
        <p className="text-slate-400 mt-1">End-to-end visibility across supply chain, environmental performance, and style costing</p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-3 items-center p-4 bg-slate-800 rounded-xl border border-slate-700">
        {[
          { label: 'Season', value: season, options: SEASONS, onChange: v => { setSeason(v); setSelectedPO('All POs'); } },
          { label: 'Supplier', value: supplier, options: SUPPLIERS, onChange: v => { setSupplier(v); setSelectedPO('All POs'); } },
          { label: 'PO', value: selectedPO, options: availablePOs, onChange: v => setSelectedPO(v) },
        ].map(f => (
          <div key={f.label} className="flex items-center gap-2">
            <span className="text-slate-400 text-sm">{f.label}:</span>
            <div className="relative">
              <select value={f.value} onChange={e => f.onChange(e.target.value)}
                className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-1.5 text-sm text-white appearance-none pr-8 focus:outline-none focus:border-teal-500/60">
                {f.options.map(o => <option key={o}>{o}</option>)}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        ))}

        <div className="ml-auto flex gap-6 text-sm">
          <div className="text-center"><p className="text-slate-500 text-xs">POs</p><p className="text-white font-bold">{filteredPOs.length}</p></div>
          <div className="text-center"><p className="text-slate-500 text-xs">Styles</p><p className="text-white font-bold">{totalStyles}</p></div>
          <div className="text-center"><p className="text-slate-500 text-xs">Total Qty</p><p className="text-teal-300 font-bold">{totalQty.toLocaleString()} pcs</p></div>
          <div className="text-center"><p className="text-slate-500 text-xs">Total Value</p><p className="text-emerald-400 font-bold">${totalValue.toLocaleString()}</p></div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-2">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all ${activeTab === t.id ? 'bg-teal-600/20 border-teal-500/50 text-teal-300' : 'border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'}`}>
            <t.icon className="w-4 h-4" />{t.label}
          </button>
        ))}
      </div>

      {/* ── TAB: Supply Chain Map ── */}
      {activeTab === 'chain' && (
        <div className="space-y-4">
          {filteredPOs.map(([poId, po]) => (
            <Card key={poId} className="bg-slate-800 border-slate-700">
              <CardContent className="p-5">
                {/* PO Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-teal-500/20 flex items-center justify-center text-teal-300 font-bold text-sm">
                      {po.brand.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="text-teal-300 font-mono font-semibold">{poId}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs border ${PO_STATUS_CFG[po.status] || 'bg-slate-500/20 text-slate-300 border-slate-500/40'}`}>{po.status}</span>
                        <span className="text-slate-500 text-xs">{po.season}</span>
                      </div>
                      <p className="text-white font-medium mt-0.5">{po.brand}</p>
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <p className="text-emerald-400 font-bold">${po.totalValue.toLocaleString()}</p>
                    <p className="text-slate-400">{po.totalQty.toLocaleString()} pcs · Delivery {po.delivery}</p>
                  </div>
                </div>

                {/* Supply chain visual: Brand → Mfr → Fabric Mill */}
                <div className="flex items-center gap-2 mb-4 text-xs text-slate-400 bg-slate-900/40 rounded-lg p-3">
                  <span className="px-2 py-1 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">Brand: {po.brand}</span>
                  <span>→</span>
                  <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">Tier 1: {po.manufacturer}</span>
                  <span>→</span>
                  <span className="px-2 py-1 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                    Tier 2: {[...new Set(po.styles.map(s => s.mill))].join(', ')}
                  </span>
                  <span>→</span>
                  <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Tier 3: Raw Materials</span>
                </div>

                {/* Style Breakdown */}
                <p className="text-slate-500 text-xs uppercase font-semibold mb-2">Style Breakdown</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-slate-500 text-xs border-b border-slate-700">
                        <th className="text-left pb-2">Style No.</th>
                        <th className="text-left pb-2">Description</th>
                        <th className="text-left pb-2">Category</th>
                        <th className="text-right pb-2">Qty</th>
                        <th className="text-left pb-2">Fabric</th>
                        <th className="text-left pb-2">Fabric Mill (Tier 2)</th>
                        <th className="text-left pb-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {po.styles.map(s => (
                        <tr key={s.no} className="border-b border-slate-700/40">
                          <td className="py-2 text-teal-300 font-mono text-xs">{s.no}</td>
                          <td className="py-2 text-white">{s.desc}</td>
                          <td className="py-2 text-slate-400">{s.category}</td>
                          <td className="py-2 text-slate-300 text-right">{s.qty.toLocaleString()}</td>
                          <td className="py-2 text-slate-400 text-xs">{s.fabric}</td>
                          <td className="py-2 text-slate-400 text-xs">{s.mill}</td>
                          <td className="py-2">
                            <span className={`px-2 py-0.5 rounded-full text-xs border ${STYLE_STATUS_CFG[s.status] || 'bg-slate-500/20 text-slate-300 border-slate-500/40'}`}>{s.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ))}
          {filteredPOs.length === 0 && (
            <div className="text-center py-16 text-slate-500">
              <GitBranch className="w-10 h-10 mx-auto mb-2 text-slate-700" />
              No POs match your filters.
            </div>
          )}
        </div>
      )}

      {/* ── TAB: Sustainability ── */}
      {activeTab === 'sustainability' && (
        <div className="space-y-4">
          {/* Per-manufacturer sustainability cards */}
          {(() => {
            const mfrs = supplier === 'All Suppliers'
              ? [...new Set(filteredPOs.map(([, p]) => p.manufacturer))]
              : [supplier];
            return mfrs.map(mfr => {
              const sd = SUSTAINABILITY_DATA[mfr];
              if (!sd) return null;
              return (
                <Card key={mfr} className="bg-slate-800 border-slate-700">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-white text-base">{mfr}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                      <div>
                        <p className="text-slate-500 text-xs mb-1">Higg FEM Score</p>
                        <ScoreBar score={sd.femScore} />
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs mb-1">Compliance Score</p>
                        <ScoreBar score={sd.compliance} />
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs mb-1">Carbon Footprint</p>
                        <p className="text-emerald-300 font-medium">{sd.carbon}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs mb-1">Water Usage</p>
                        <p className="text-blue-300 font-medium">{sd.water}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs mb-1">Certifications</p>
                        <div className="flex flex-wrap gap-1">
                          {sd.certs.map(c => (
                            <span key={c} className="px-1.5 py-0.5 rounded text-xs bg-teal-500/20 text-teal-300 border border-teal-500/30">{c}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Tier 2 mills for this manufacturer */}
                    {(() => {
                      const mills = [...new Set(
                        filteredPOs
                          .filter(([, p]) => p.manufacturer === mfr)
                          .flatMap(([, p]) => p.styles.map(s => s.mill))
                      )];
                      return mills.length > 0 ? (
                        <div className="mt-4 pt-4 border-t border-slate-700">
                          <p className="text-slate-500 text-xs uppercase font-semibold mb-2">Tier 2 Fabric Mills</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {mills.map(mill => {
                              const msd = SUSTAINABILITY_DATA[mill];
                              if (!msd) return null;
                              return (
                                <div key={mill} className="p-3 rounded-lg bg-slate-900/50 border border-slate-700">
                                  <p className="text-white text-sm font-medium mb-2">{mill}</p>
                                  <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div><span className="text-slate-500">FEM: </span><span className={msd.femScore >= 70 ? 'text-emerald-400' : 'text-amber-400'}>{msd.femScore}/100</span></div>
                                    <div><span className="text-slate-500">Carbon: </span><span className="text-slate-300">{msd.carbon}</span></div>
                                    <div className="col-span-2">
                                      <span className="text-slate-500">Certs: </span>
                                      <span className="text-slate-300">{msd.certs.join(', ')}</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : null;
                    })()}
                  </CardContent>
                </Card>
              );
            });
          })()}
          {filteredPOs.length === 0 && (
            <div className="text-center py-16 text-slate-500">No data matches your filters.</div>
          )}
        </div>
      )}

      {/* ── TAB: Costing ── */}
      {activeTab === 'costing' && (
        <div className="space-y-4">
          {filteredPOs.map(([poId, po]) => (
            <Card key={poId} className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white text-base flex items-center gap-3">
                      <span className="text-teal-300 font-mono">{poId}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs border ${PO_STATUS_CFG[po.status] || 'bg-slate-500/20 text-slate-300 border-slate-500/40'}`}>{po.status}</span>
                    </CardTitle>
                    <p className="text-slate-400 text-sm mt-0.5">{po.manufacturer} · {po.season} · Delivery {po.delivery}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-400 font-bold text-lg">${po.totalValue.toLocaleString()}</p>
                    <p className="text-slate-400 text-xs">{po.totalQty.toLocaleString()} pcs total</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-900/50 border-y border-slate-700 text-slate-400 text-xs uppercase">
                        <th className="text-left px-4 py-2">Style No.</th>
                        <th className="text-left px-4 py-2">Description</th>
                        <th className="text-left px-4 py-2">Category</th>
                        <th className="text-right px-4 py-2">Qty</th>
                        <th className="text-right px-4 py-2">FOB Price</th>
                        <th className="text-right px-4 py-2">Total Value</th>
                        <th className="text-left px-4 py-2">Delivery</th>
                        <th className="text-left px-4 py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {po.styles.map(s => (
                        <tr key={s.no} className="border-b border-slate-700/40 hover:bg-slate-700/20">
                          <td className="px-4 py-3 text-teal-300 font-mono text-xs">{s.no}</td>
                          <td className="px-4 py-3 text-white">{s.desc}</td>
                          <td className="px-4 py-3 text-slate-400">{s.category}</td>
                          <td className="px-4 py-3 text-slate-300 text-right">{s.qty.toLocaleString()}</td>
                          <td className="px-4 py-3 text-emerald-300 text-right font-medium">${s.fob}</td>
                          <td className="px-4 py-3 text-white font-bold text-right">${(s.qty * s.fob).toLocaleString()}</td>
                          <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{po.delivery}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs border ${STYLE_STATUS_CFG[s.status] || 'bg-slate-500/20 text-slate-300 border-slate-500/40'}`}>{s.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-900/50 border-t border-slate-700">
                        <td colSpan={3} className="px-4 py-2 text-slate-400 text-xs font-semibold uppercase">PO Total</td>
                        <td className="px-4 py-2 text-white font-bold text-right">{po.totalQty.toLocaleString()}</td>
                        <td className="px-4 py-2"></td>
                        <td className="px-4 py-2 text-emerald-400 font-bold text-right">${po.totalValue.toLocaleString()}</td>
                        <td colSpan={2}></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </CardContent>
            </Card>
          ))}
          {filteredPOs.length === 0 && (
            <div className="text-center py-16 text-slate-500">No POs match your filters.</div>
          )}

          {/* Grand total */}
          {filteredPOs.length > 1 && (
            <Card className="bg-teal-900/20 border-teal-500/30">
              <CardContent className="p-4 flex items-center justify-between">
                <p className="text-teal-300 font-semibold">Grand Total — {filteredPOs.length} POs · {totalStyles} Styles</p>
                <div className="flex gap-8 text-sm">
                  <div><span className="text-slate-400">Total Qty: </span><span className="text-white font-bold">{totalQty.toLocaleString()} pcs</span></div>
                  <div><span className="text-slate-400">Total Value: </span><span className="text-emerald-400 font-bold text-lg">${totalValue.toLocaleString()}</span></div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
