import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, ChevronDown, ChevronUp, Package, User, AlertTriangle, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const STATUS_FLOW = {
  'Pending Start': 'In Production',
  'In Production': 'QC',
  'QC': 'Completed',
  'Completed': 'Shipped',
};
const STATUS_ACTIONS = {
  'Pending Start': 'Start Production',
  'In Production': 'Send to QC',
  'QC': 'Mark Completed',
  'Completed': 'Mark Shipped',
};

const batches = [
  { id: 'BATCH-001', style: 'ZR-AW27-JK001', buyer: 'Zara', po: 'PO-AW27-4812', qty: 800, start: '01 Jan', target: '28 Feb', status: 'Completed', progress: 100, fabric: 'Wool Blend 400gsm', trim: 'YKK Zipper, Snap Buttons', line: 'Line-1', supervisor: 'Rajesh Kumar', defect: '1.2%' },
  { id: 'BATCH-002', style: 'ZR-AW27-SW002', buyer: 'Zara', po: 'PO-AW27-4812', qty: 1200, start: '05 Jan', target: '10 Mar', status: 'Completed', progress: 100, fabric: 'Cotton Fleece 320gsm', trim: 'Ribbed Cuff, Drawcord', line: 'Line-2', supervisor: 'Priya Menon', defect: '0.9%' },
  { id: 'BATCH-003', style: 'ZR-AW27-TR003', buyer: 'Zara', po: 'PO-AW27-4812', qty: 700, start: '10 Feb', target: '30 Mar', status: 'Shipped', progress: 100, fabric: 'Polyester Twill 280gsm', trim: 'Metal Buttons, Belt Loop', line: 'Line-3', supervisor: 'Suresh Nair', defect: '1.5%' },
  { id: 'BATCH-004', style: 'HM-AW27-PK001', buyer: 'H&M', po: 'PO-AW27-3991', qty: 800, start: '15 Feb', target: '15 Apr', status: 'QC', progress: 88, fabric: 'Nylon Ripstop 200gsm', trim: 'Velcro Closure, Cord Stopper', line: 'Line-1', supervisor: 'Rajesh Kumar', defect: '2.1%' },
  { id: 'BATCH-005', style: 'HM-AW27-CN002', buyer: 'H&M', po: 'PO-AW27-3991', qty: 900, start: '20 Feb', target: '20 Apr', status: 'In Production', progress: 72, fabric: 'Organic Cotton Jersey 180gsm', trim: 'Flat Knit Rib, Care Label', line: 'Line-2', supervisor: 'Priya Menon', defect: '1.8%' },
  { id: 'BATCH-006', style: 'HM-AW27-TR003', buyer: 'H&M', po: 'PO-AW27-3991', qty: 700, start: '01 Mar', target: '25 Apr', status: 'In Production', progress: 55, fabric: 'Recycled Poly Twill 260gsm', trim: 'Brass Rivets, Patch Pocket', line: 'Line-3', supervisor: 'Suresh Nair', defect: '2.4%' },
  { id: 'BATCH-007', style: 'MS-AW27-CT001', buyer: 'M&S', po: 'PO-AW27-5100', qty: 600, start: '10 Mar', target: '30 Apr', status: 'In Production', progress: 40, fabric: 'Merino Wool 300gsm', trim: 'Shell Buttons, Woven Label', line: 'Line-4', supervisor: 'Anitha Rao', defect: '1.6%' },
  { id: 'BATCH-008', style: 'MS-AW27-SW002', buyer: 'M&S', po: 'PO-AW27-5100', qty: 1200, start: '15 Mar', target: '05 May', status: 'In Production', progress: 28, fabric: 'Cotton Modal Blend 240gsm', trim: 'Rib Collar, Printed Label', line: 'Line-5', supervisor: 'Kiran Bhat', defect: '1.1%' },
  { id: 'BATCH-009', style: 'ZR-AW27-DRS004', buyer: 'Zara', po: 'PO-AW27-4812', qty: 400, start: '20 Mar', target: '10 May', status: 'In Production', progress: 15, fabric: 'Viscose Satin 120gsm', trim: 'Invisible Zipper, Lining', line: 'Line-1', supervisor: 'Rajesh Kumar', defect: '3.0%' },
  { id: 'BATCH-010', style: 'MS-AW27-TR003', buyer: 'M&S', po: 'PO-AW27-5100', qty: 900, start: '25 Mar', target: '15 May', status: 'Pending Start', progress: 0, fabric: 'Cotton Chino 220gsm', trim: 'Horn Buttons, Belt Loops', line: 'Line-2', supervisor: 'Priya Menon', defect: '—' },
];

const STATUS_COLORS = {
  Completed: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  Shipped: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
  QC: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  'In Production': 'bg-teal-500/20 text-teal-300 border-teal-500/40',
  'Pending Start': 'bg-slate-500/20 text-slate-400 border-slate-500/40',
};

const FILTER_TABS = ['All', 'In Production', 'QC', 'Completed', 'Shipped'];

export default function ManufacturerBatches() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [expandedBatch, setExpandedBatch] = useState(null);
  const [statusOverrides, setStatusOverrides] = useState({});

  const getStatus = (id, seed) => statusOverrides[id] ?? seed;
  const advanceStatus = (id, currentStatus) => {
    const next = STATUS_FLOW[currentStatus];
    if (next) setStatusOverrides(prev => ({ ...prev, [id]: next }));
  };

  const batchesWithStatus = batches.map(b => ({ ...b, status: getStatus(b.id, b.status) }));
  const filtered = activeFilter === 'All' ? batchesWithStatus : batchesWithStatus.filter(b => b.status === activeFilter);

  const activeBatches = batchesWithStatus.filter(b => b.status === 'In Production' || b.status === 'QC').length;
  const onTime = batchesWithStatus.filter(b => b.status === 'Completed' || b.status === 'Shipped').length;
  const qcPassRate = '94.2%';
  const completedMonth = batchesWithStatus.filter(b => b.status === 'Completed').length;

  const progressColor = (status) => {
    if (status === 'Completed' || status === 'Shipped') return 'bg-emerald-500';
    if (status === 'In Production') return 'bg-blue-500';
    if (status === 'QC') return 'bg-amber-500';
    return 'bg-slate-600';
  };

  return (
    <div className="min-h-screen bg-slate-900 p-6 text-white">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <Layers className="w-7 h-7 text-teal-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Production Batches</h1>
            <p className="text-slate-400 text-sm">TCH Garments Pvt Ltd — Bangalore, India</p>
          </div>
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Active Batches', value: activeBatches, color: 'text-teal-400' },
            { label: 'On Time', value: onTime, color: 'text-emerald-400' },
            { label: 'QC Pass Rate', value: qcPassRate, color: 'text-amber-400' },
            { label: 'Completed This Month', value: completedMonth, color: 'text-blue-400' },
          ].map(kpi => (
            <Card key={kpi.label} className="bg-slate-800 border-slate-700">
              <CardContent className="pt-4 pb-4">
                <p className="text-slate-400 text-xs mb-1">{kpi.label}</p>
                <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 flex-wrap">
          {FILTER_TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                activeFilter === tab
                  ? 'bg-teal-600/20 border-teal-500/50 text-teal-300'
                  : 'border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Table */}
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    {['Batch No', 'Style', 'Buyer', 'PO Ref', 'Qty', 'Start', 'Target', 'Status', 'Progress'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-slate-400 font-medium whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(batch => (
                    <React.Fragment key={batch.id}>
                      <tr
                        className="border-b border-slate-700/50 hover:bg-slate-700/30 cursor-pointer transition-colors"
                        onClick={() => setExpandedBatch(expandedBatch === batch.id ? null : batch.id)}
                      >
                        <td className="px-4 py-3 font-mono text-teal-400">{batch.id}</td>
                        <td className="px-4 py-3 text-white">{batch.style}</td>
                        <td className="px-4 py-3 text-slate-300">{batch.buyer}</td>
                        <td className="px-4 py-3 text-slate-400">{batch.po}</td>
                        <td className="px-4 py-3 text-slate-300">{batch.qty.toLocaleString()}</td>
                        <td className="px-4 py-3 text-slate-400">{batch.start}</td>
                        <td className="px-4 py-3 text-slate-400">{batch.target}</td>
                        <td className="px-4 py-3">
                          <Badge className={`text-xs ${STATUS_COLORS[batch.status]}`}>{batch.status}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 min-w-[100px]">
                            <div className="flex-1 bg-slate-700 rounded-full h-2">
                              <div className={`h-2 rounded-full ${progressColor(batch.status)}`} style={{ width: `${batch.progress}%` }} />
                            </div>
                            <span className="text-xs text-slate-400 w-8">{batch.progress}%</span>
                            {expandedBatch === batch.id ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                          </div>
                        </td>
                      </tr>
                      {expandedBatch === batch.id && (
                        <tr className="border-b border-slate-700/50">
                          <td colSpan={9} className="px-4 py-4 bg-slate-900/60">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div className="space-y-1">
                                <p className="text-slate-500 text-xs uppercase tracking-wide flex items-center gap-1"><Package className="w-3 h-3" /> Fabric Used</p>
                                <p className="text-slate-200">{batch.fabric}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-slate-500 text-xs uppercase tracking-wide">Trim Used</p>
                                <p className="text-slate-200">{batch.trim}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-slate-500 text-xs uppercase tracking-wide flex items-center gap-1"><User className="w-3 h-3" /> Line / Supervisor</p>
                                <p className="text-slate-200">{batch.line} &mdash; {batch.supervisor}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-slate-500 text-xs uppercase tracking-wide flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Defect Rate</p>
                                <p className={`font-semibold ${batch.defect === '—' ? 'text-slate-500' : parseFloat(batch.defect) > 2 ? 'text-red-400' : 'text-emerald-400'}`}>{batch.defect}</p>
                              </div>
                            </div>
                            {STATUS_ACTIONS[batch.status] && (
                              <div className="mt-4">
                                <button
                                  onClick={e => { e.stopPropagation(); advanceStatus(batch.id, batch.status); }}
                                  className="px-4 py-1.5 rounded-lg bg-teal-600/20 border border-teal-500/50 text-teal-300 text-xs font-medium hover:bg-teal-600/30 transition-colors">
                                  {STATUS_ACTIONS[batch.status]}
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
