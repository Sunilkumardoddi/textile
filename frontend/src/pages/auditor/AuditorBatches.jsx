import React, { useState } from 'react';
import { Package, Search, CheckCircle, AlertTriangle, Clock, Flag } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const BATCHES = [
  { id: 'BAT-001', po: 'PO-AW27-4812', manufacturer: 'TCH Garments Pvt Ltd', fabric: 'Cotton Twill 200gsm', qty: 5000, units: 'mtr', production: 'Completed', verifyStatus: 'Verified',  flagReason: null, verifiedOn: '05 Mar 2027' },
  { id: 'BAT-002', po: 'PO-AW27-4813', manufacturer: 'TCH Garments Pvt Ltd', fabric: 'Polyester Blend',     qty: 3200, units: 'mtr', production: 'Shipped',    verifyStatus: 'Verified',  flagReason: null, verifiedOn: '15 Mar 2027' },
  { id: 'BAT-003', po: 'PO-SS27-2201', manufacturer: 'Beximco Garments Ltd', fabric: 'Organic Cotton Jersey', qty: 8000, units: 'pcs', production: 'In Production', verifyStatus: 'Pending', flagReason: null, verifiedOn: null },
  { id: 'BAT-004', po: 'PO-SS27-2202', manufacturer: 'Beximco Garments Ltd', fabric: 'Linen Blend',          qty: 4500, units: 'mtr', production: 'QC',        verifyStatus: 'Pending',   flagReason: null, verifiedOn: null },
  { id: 'BAT-006', po: 'PO-SS27-3001', manufacturer: 'Arvind Ltd',           fabric: 'Stretch Cotton',      qty: 2500, units: 'pcs', production: 'In Production', verifyStatus: 'Pending', flagReason: null, verifiedOn: null },
  { id: 'BAT-008', po: 'PO-SS27-2203', manufacturer: 'Beximco Garments Ltd', fabric: 'Viscose Crepe',       qty: 5500, units: 'mtr', production: 'Completed',  verifyStatus: 'Flagged',   flagReason: 'Fabric weight 8% below spec (184gsm vs 200gsm)', verifiedOn: '22 Mar 2027' },
];

const VER_CFG = {
  Verified: { cls: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', icon: CheckCircle },
  Pending:  { cls: 'bg-amber-500/20 text-amber-300 border-amber-500/40',      icon: Clock },
  Flagged:  { cls: 'bg-red-500/20 text-red-300 border-red-500/40',            icon: Flag },
};

const VERIFY_TABS = ['All', 'Pending', 'Verified', 'Flagged'];

export default function AuditorBatches() {
  const [tab, setTab]       = useState('All');
  const [search, setSearch] = useState('');
  const [overrides, setOverrides] = useState({});
  const [expanded, setExpanded]   = useState(null);

  const getStatus = (id, seed) => overrides[id]?.status ?? seed;
  const getFlag   = (id, seed) => overrides[id]?.flagReason ?? seed;

  const verify = (id) => setOverrides(p => ({ ...p, [id]: { status: 'Verified', flagReason: null } }));
  const flag   = (id, reason) => setOverrides(p => ({ ...p, [id]: { status: 'Flagged', flagReason: reason } }));

  const filtered = BATCHES.filter(b => {
    const st = getStatus(b.id, b.verifyStatus);
    return (tab === 'All' || st === tab) &&
      (b.id.toLowerCase().includes(search.toLowerCase()) ||
       b.po.toLowerCase().includes(search.toLowerCase()) ||
       b.manufacturer.toLowerCase().includes(search.toLowerCase()));
  });

  const counts = {
    total: BATCHES.length,
    pending:  BATCHES.filter(b => getStatus(b.id, b.verifyStatus) === 'Pending').length,
    verified: BATCHES.filter(b => getStatus(b.id, b.verifyStatus) === 'Verified').length,
    flagged:  BATCHES.filter(b => getStatus(b.id, b.verifyStatus) === 'Flagged').length,
  };

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Batch Verification</h1>
        <p className="text-slate-400 mt-1">Verify or flag production batches across assigned manufacturers</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Batches', val: counts.total, color: 'text-white' },
          { label: 'Pending', val: counts.pending, color: 'text-amber-400' },
          { label: 'Verified', val: counts.verified, color: 'text-emerald-400' },
          { label: 'Flagged', val: counts.flagged, color: 'text-red-400' },
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
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search batch, PO, or manufacturer…"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500/60" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {VERIFY_TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${tab === t ? 'bg-teal-600/20 border-teal-500/50 text-teal-300' : 'border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400 text-xs uppercase">
                  {['Batch ID', 'PO', 'Manufacturer', 'Fabric', 'Qty', 'Production', 'Verify Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(b => {
                  const st = getStatus(b.id, b.verifyStatus);
                  const fr = getFlag(b.id, b.flagReason);
                  const vcfg = VER_CFG[st] || VER_CFG.Pending;
                  const Icon = vcfg.icon;
                  return (
                    <React.Fragment key={b.id}>
                      <tr className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors cursor-pointer"
                        onClick={() => setExpanded(expanded === b.id ? null : b.id)}>
                        <td className="px-4 py-3 text-teal-300 font-mono text-xs">{b.id}</td>
                        <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{b.po}</td>
                        <td className="px-4 py-3 text-white whitespace-nowrap">{b.manufacturer}</td>
                        <td className="px-4 py-3 text-slate-300">{b.fabric}</td>
                        <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{b.qty.toLocaleString()} {b.units}</td>
                        <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{b.production}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${vcfg.cls}`}>
                            <Icon className="w-3 h-3" />{st}
                          </span>
                        </td>
                        <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                          <div className="flex gap-1">
                            {st === 'Pending' && (
                              <>
                                <button onClick={() => verify(b.id)}
                                  className="px-2 py-1 text-xs rounded bg-emerald-600/20 text-emerald-300 border border-emerald-600/40 hover:bg-emerald-600/30">Verify</button>
                                <button onClick={() => flag(b.id, 'Non-conformance flagged by auditor')}
                                  className="px-2 py-1 text-xs rounded bg-red-600/20 text-red-300 border border-red-600/40 hover:bg-red-600/30">Flag</button>
                              </>
                            )}
                            {st === 'Flagged' && (
                              <button onClick={() => verify(b.id)}
                                className="px-2 py-1 text-xs rounded bg-teal-600/20 text-teal-300 border border-teal-600/40 hover:bg-teal-600/30">Clear Flag</button>
                            )}
                          </div>
                        </td>
                      </tr>
                      {expanded === b.id && fr && (
                        <tr className="border-b border-slate-700/50">
                          <td colSpan={8} className="px-6 py-3 bg-red-900/10">
                            <div className="flex items-center gap-2 text-sm">
                              <Flag className="w-4 h-4 text-red-400 flex-shrink-0" />
                              <span className="text-red-300">Flag Reason: </span>
                              <span className="text-red-200">{fr}</span>
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
