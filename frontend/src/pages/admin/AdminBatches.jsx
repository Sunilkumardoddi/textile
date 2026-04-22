import React, { useState } from 'react';
import { Package, Search, ChevronDown, ChevronUp, CheckCircle, Clock, Truck, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const BATCHES = [
  { id: 'BAT-001', po: 'PO-AW27-4812', manufacturer: 'TCH Garments Pvt Ltd', country: 'India',      fabric: 'Cotton Twill 200gsm', qty: 5000, units: 'mtr', status: 'Completed',     started: '01 Jan 2027', completed: '28 Feb 2027' },
  { id: 'BAT-002', po: 'PO-AW27-4813', manufacturer: 'TCH Garments Pvt Ltd', country: 'India',      fabric: 'Polyester Blend',     qty: 3200, units: 'mtr', status: 'Shipped',       started: '15 Jan 2027', completed: '10 Mar 2027' },
  { id: 'BAT-003', po: 'PO-SS27-2201', manufacturer: 'Beximco Garments Ltd', country: 'Bangladesh', fabric: 'Organic Cotton Jersey', qty: 8000, units: 'pcs', status: 'In Production', started: '01 Mar 2027', completed: '—' },
  { id: 'BAT-004', po: 'PO-SS27-2202', manufacturer: 'Beximco Garments Ltd', country: 'Bangladesh', fabric: 'Linen Blend',          qty: 4500, units: 'mtr', status: 'QC',            started: '10 Mar 2027', completed: '—' },
  { id: 'BAT-005', po: 'PO-AW27-5001', manufacturer: 'Arvind Ltd',           country: 'India',      fabric: 'Denim 12oz',          qty: 6000, units: 'mtr', status: 'Pending Start',  started: '—',          completed: '—' },
  { id: 'BAT-006', po: 'PO-SS27-3001', manufacturer: 'Arvind Ltd',           country: 'India',      fabric: 'Stretch Cotton',      qty: 2500, units: 'pcs', status: 'In Production', started: '20 Mar 2027', completed: '—' },
  { id: 'BAT-007', po: 'PO-AW28-1001', manufacturer: 'TCH Garments Pvt Ltd', country: 'India',      fabric: 'Wool Blend 300gsm',   qty: 3000, units: 'mtr', status: 'QC',            started: '01 Apr 2027', completed: '—' },
  { id: 'BAT-008', po: 'PO-SS27-2203', manufacturer: 'Beximco Garments Ltd', country: 'Bangladesh', fabric: 'Viscose Crepe',       qty: 5500, units: 'mtr', status: 'Completed',     started: '01 Feb 2027', completed: '20 Mar 2027' },
];

const STATUS_CFG = {
  'Pending Start':  { cls: 'bg-slate-500/20 text-slate-300 border-slate-500/40',   icon: Clock },
  'In Production':  { cls: 'bg-blue-500/20 text-blue-300 border-blue-500/40',      icon: Package },
  'QC':             { cls: 'bg-amber-500/20 text-amber-300 border-amber-500/40',   icon: AlertCircle },
  'Completed':      { cls: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', icon: CheckCircle },
  'Shipped':        { cls: 'bg-teal-500/20 text-teal-300 border-teal-500/40',      icon: Truck },
};

const MANUFACTURERS = ['All', 'TCH Garments Pvt Ltd', 'Beximco Garments Ltd', 'Arvind Ltd'];
const STATUSES = ['All', 'Pending Start', 'In Production', 'QC', 'Completed', 'Shipped'];

export default function AdminBatches() {
  const [search, setSearch]   = useState('');
  const [mfr, setMfr]         = useState('All');
  const [status, setStatus]   = useState('All');
  const [expanded, setExpanded] = useState(null);

  const filtered = BATCHES.filter(b =>
    (mfr === 'All' || b.manufacturer === mfr) &&
    (status === 'All' || b.status === status) &&
    (b.id.toLowerCase().includes(search.toLowerCase()) || b.po.toLowerCase().includes(search.toLowerCase()) || b.fabric.toLowerCase().includes(search.toLowerCase()))
  );

  const counts = {
    total: BATCHES.length,
    inProd: BATCHES.filter(b => b.status === 'In Production').length,
    qc: BATCHES.filter(b => b.status === 'QC').length,
    completed: BATCHES.filter(b => b.status === 'Completed' || b.status === 'Shipped').length,
  };

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-3xl font-bold text-white">All Batches</h1>
        <p className="text-slate-400 mt-1">Cross-manufacturer production batch overview</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Batches', val: counts.total, color: 'text-white' },
          { label: 'In Production', val: counts.inProd, color: 'text-blue-400' },
          { label: 'In QC', val: counts.qc, color: 'text-amber-400' },
          { label: 'Completed / Shipped', val: counts.completed, color: 'text-emerald-400' },
        ].map(k => (
          <Card key={k.label} className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <p className="text-slate-400 text-xs">{k.label}</p>
              <p className={`text-3xl font-bold mt-1 ${k.color}`}>{k.val}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search batch ID, PO, or fabric…"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500/60" />
        </div>
        <select value={mfr} onChange={e => setMfr(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500/60">
          {MANUFACTURERS.map(m => <option key={m}>{m}</option>)}
        </select>
        <select value={status} onChange={e => setStatus(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500/60">
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400 text-xs uppercase">
                  {['Batch ID', 'PO Number', 'Manufacturer', 'Fabric', 'Quantity', 'Status', 'Started', 'Completed'].map(h => (
                    <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(b => {
                  const scfg = STATUS_CFG[b.status] || STATUS_CFG['Pending Start'];
                  const Icon = scfg.icon;
                  return (
                    <React.Fragment key={b.id}>
                      <tr className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors cursor-pointer"
                        onClick={() => setExpanded(expanded === b.id ? null : b.id)}>
                        <td className="px-4 py-3 text-teal-300 font-mono text-xs font-medium">{b.id}</td>
                        <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{b.po}</td>
                        <td className="px-4 py-3 text-white whitespace-nowrap">{b.manufacturer}</td>
                        <td className="px-4 py-3 text-slate-300">{b.fabric}</td>
                        <td className="px-4 py-3 text-slate-300">{b.qty.toLocaleString()} {b.units}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${scfg.cls}`}>
                            <Icon className="w-3 h-3" />{b.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{b.started}</td>
                        <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{b.completed}</td>
                      </tr>
                      {expanded === b.id && (
                        <tr className="border-b border-slate-700/50">
                          <td colSpan={8} className="px-6 py-4 bg-slate-900/50">
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div><span className="text-slate-500">Batch ID: </span><span className="text-slate-300 font-mono">{b.id}</span></div>
                              <div><span className="text-slate-500">Country: </span><span className="text-slate-300">{b.country}</span></div>
                              <div><span className="text-slate-500">Units: </span><span className="text-slate-300">{b.qty.toLocaleString()} {b.units}</span></div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-slate-500">No batches match your filters.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
