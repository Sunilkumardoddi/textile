import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ClipboardCheck, CheckCircle, XCircle, Clock, Send, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// ── Static Seed Data ───────────────────────────────────────────────────────────

const PO_OPTIONS = [
  { id: 'PO-AW27-4812', brand: 'Zara', season: 'AW2027', qty: 12400 },
  { id: 'PO-AW27-3991', brand: 'H&M',  season: 'AW2027', qty: 8600  },
  { id: 'PO-AW27-5100', brand: 'M&S',  season: 'AW2027', qty: 15200 },
];

const STAGES = ['Proto', 'SMS', 'PP', 'TOP'];

const SEED = {
  'PO-AW27-4812': [
    { styleNo: 'ZR-AW27-JK001',  styleName: 'Wool Blend Overcoat',      stages: { Proto: { status: 'Approved', due: '15 Mar' }, SMS: { status: 'Approved', due: '25 Mar' }, PP: { status: 'Pending', due: '10 Apr' }, TOP: { status: 'Awaiting Dispatch', due: '25 Apr' } } },
    { styleNo: 'ZR-AW27-SW002',  styleName: 'Merino Turtleneck',         stages: { Proto: { status: 'Approved', due: '12 Mar' }, SMS: { status: 'In Review', due: '22 Mar' }, PP: { status: 'Awaiting Dispatch', due: '08 Apr' }, TOP: { status: 'Awaiting Dispatch', due: '22 Apr' } } },
    { styleNo: 'ZR-AW27-TR003',  styleName: 'Flannel Wide-Leg Trouser',  stages: { Proto: { status: 'Approved', due: '10 Mar' }, SMS: { status: 'Approved', due: '20 Mar' }, PP: { status: 'Approved', due: '05 Apr' }, TOP: { status: 'Pending', due: '20 Apr' } } },
    { styleNo: 'ZR-AW27-DRS004', styleName: 'Velvet Midi Dress',         stages: { Proto: { status: 'Pending', due: '18 Mar' }, SMS: { status: 'Awaiting Dispatch', due: '28 Mar' }, PP: { status: 'Awaiting Dispatch', due: '12 Apr' }, TOP: { status: 'Awaiting Dispatch', due: '27 Apr' } } },
  ],
  'PO-AW27-3991': [
    { styleNo: 'HM-AW27-PK001',  styleName: 'Quilted Puffer Jacket',     stages: { Proto: { status: 'Approved', due: '08 Mar' }, SMS: { status: 'Approved', due: '18 Mar' }, PP: { status: 'Pending', due: '05 Apr' }, TOP: { status: 'Awaiting Dispatch', due: '22 Apr' } } },
    { styleNo: 'HM-AW27-KN002',  styleName: 'Ribbed Knit Cardigan',      stages: { Proto: { status: 'Approved', due: '10 Mar' }, SMS: { status: 'Pending', due: '20 Mar' }, PP: { status: 'Awaiting Dispatch', due: '07 Apr' }, TOP: { status: 'Awaiting Dispatch', due: '24 Apr' } } },
    { styleNo: 'HM-AW27-DN003',  styleName: 'Slim Fit Denim Jeans',      stages: { Proto: { status: 'Rejected', due: '09 Mar' }, SMS: { status: 'In Review', due: '19 Mar' }, PP: { status: 'Awaiting Dispatch', due: '06 Apr' }, TOP: { status: 'Awaiting Dispatch', due: '23 Apr' } } },
  ],
  'PO-AW27-5100': [
    { styleNo: 'MS-AW27-CT001',  styleName: 'Cashmere Blend Coat',       stages: { Proto: { status: 'Approved', due: '05 Mar' }, SMS: { status: 'Approved', due: '15 Mar' }, PP: { status: 'Approved', due: '02 Apr' }, TOP: { status: 'Pending', due: '18 Apr' } } },
    { styleNo: 'MS-AW27-BL002',  styleName: 'Silk Blend Blouse',         stages: { Proto: { status: 'Approved', due: '07 Mar' }, SMS: { status: 'Approved', due: '17 Mar' }, PP: { status: 'In Review', due: '04 Apr' }, TOP: { status: 'Awaiting Dispatch', due: '20 Apr' } } },
    { styleNo: 'MS-AW27-SK003',  styleName: 'Tweed A-Line Skirt',        stages: { Proto: { status: 'Pending', due: '11 Mar' }, SMS: { status: 'Awaiting Dispatch', due: '21 Mar' }, PP: { status: 'Awaiting Dispatch', due: '08 Apr' }, TOP: { status: 'Awaiting Dispatch', due: '25 Apr' } } },
  ],
};

// ── Helpers ────────────────────────────────────────────────────────────────────

const STATUS_CFG = {
  'Approved':          { color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', icon: CheckCircle },
  'Pending':           { color: 'bg-amber-500/20 text-amber-300 border-amber-500/40',       icon: Clock },
  'Rejected':          { color: 'bg-red-500/20 text-red-300 border-red-500/40',             icon: XCircle },
  'Awaiting Dispatch': { color: 'bg-blue-500/20 text-blue-300 border-blue-500/40',          icon: Send },
  'In Review':         { color: 'bg-slate-500/20 text-slate-300 border-slate-500/40',       icon: AlertTriangle },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] || STATUS_CFG['In Review'];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.color}`}>
      {status}
    </span>
  );
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function POFitSamplesApproval() {
  const navigate = useNavigate();
  const [activePO, setActivePO] = useState('PO-AW27-4812');
  const [overrides, setOverrides] = useState({});

  const styles = SEED[activePO] || [];

  function getStatus(styleNo, stage) {
    const key = `${styleNo}__${stage}`;
    return overrides[key] ?? SEED[activePO].find(s => s.styleNo === styleNo).stages[stage].status;
  }

  function setStatus(styleNo, stage, val) {
    setOverrides(prev => ({ ...prev, [`${styleNo}__${stage}`]: val }));
  }

  // KPIs
  const allItems = styles.flatMap(s => STAGES.map(st => getStatus(s.styleNo, st)));
  const kpis = {
    total:    styles.length,
    approved: allItems.filter(s => s === 'Approved').length,
    pending:  allItems.filter(s => s === 'Pending').length,
    overdue:  allItems.filter(s => s === 'Rejected').length,
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/brand/po-sc-management')}
          className="text-slate-400 hover:text-white">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <ClipboardCheck className="w-6 h-6 text-teal-400" />
        <h1 className="text-xl font-semibold text-white">PO Fit Samples Approval &amp; Follow-ups</h1>
      </div>

      {/* PO Tabs */}
      <div className="flex gap-2 mb-6">
        {PO_OPTIONS.map(po => (
          <button key={po.id} onClick={() => { setActivePO(po.id); setOverrides({}); }}
            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
              activePO === po.id
                ? 'bg-teal-600/20 border-teal-500/50 text-teal-300'
                : 'border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'
            }`}>
            {po.id} <span className="opacity-60">· {po.brand}</span>
          </button>
        ))}
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Styles', val: kpis.total,    color: 'text-white' },
          { label: 'Approved',     val: kpis.approved, color: 'text-emerald-400' },
          { label: 'Pending',      val: kpis.pending,  color: 'text-amber-400' },
          { label: 'Rejected',     val: kpis.overdue,  color: 'text-red-400' },
        ].map(k => (
          <Card key={k.label} className="bg-slate-800 border-slate-700">
            <CardContent className="p-4 text-center">
              <div className={`text-2xl font-bold ${k.color}`}>{k.val}</div>
              <div className="text-xs text-slate-400 mt-1">{k.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-slate-200">Sample Stage Tracker</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400 text-xs uppercase">
                  <th className="px-4 py-3 text-left">Style No</th>
                  <th className="px-4 py-3 text-left">Style Name</th>
                  {STAGES.map(st => (
                    <th key={st} className="px-4 py-3 text-center">{st}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {styles.map(style => (
                  <tr key={style.styleNo} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-teal-300">{style.styleNo}</td>
                    <td className="px-4 py-3 text-slate-200 font-medium">{style.styleName}</td>
                    {STAGES.map(stage => {
                      const status = getStatus(style.styleNo, stage);
                      const due = style.stages[stage].due;
                      return (
                        <td key={stage} className="px-4 py-3 text-center">
                          <div className="flex flex-col items-center gap-1.5">
                            <StatusBadge status={status} />
                            <span className="text-xs text-slate-500">{due}</span>
                            {status === 'Pending' && (
                              <div className="flex gap-1">
                                <button onClick={() => setStatus(style.styleNo, stage, 'Approved')}
                                  className="px-2 py-0.5 text-xs rounded bg-emerald-600/30 text-emerald-300 hover:bg-emerald-600/50 border border-emerald-600/40 transition-all">
                                  Approve
                                </button>
                                <button onClick={() => setStatus(style.styleNo, stage, 'Rejected')}
                                  className="px-2 py-0.5 text-xs rounded bg-red-600/30 text-red-300 hover:bg-red-600/50 border border-red-600/40 transition-all">
                                  Reject
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
