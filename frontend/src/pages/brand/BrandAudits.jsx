import React, { useState } from 'react';
import { ClipboardList, Plus, Search, CheckCircle, Clock, Calendar, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const AUDIT_REQUESTS = [
  { id: 'AR-001', manufacturer: 'TCH Garments Pvt Ltd', type: 'SA8000 Social Audit',        auditor: 'SGS Group',      requested: '05 Jan 2027', scheduled: '10 Jan 2027', status: 'Completed',  score: 92 },
  { id: 'AR-002', manufacturer: 'TCH Garments Pvt Ltd', type: 'ISO 14001 Environmental',    auditor: 'Bureau Veritas', requested: '10 Feb 2027', scheduled: '15 Feb 2027', status: 'Completed',  score: 88 },
  { id: 'AR-003', manufacturer: 'Beximco Garments Ltd', type: 'SMETA 4-Pillar Audit',       auditor: 'Intertek Group', requested: '20 Feb 2027', scheduled: '01 Mar 2027', status: 'In Progress', score: null },
  { id: 'AR-004', manufacturer: 'Beximco Garments Ltd', type: 'GOTS Chain of Custody',      auditor: 'Control Union',  requested: '10 Mar 2027', scheduled: '20 Mar 2027', status: 'Scheduled',  score: null },
  { id: 'AR-005', manufacturer: 'TCH Garments Pvt Ltd', type: 'OEKO-TEX Standard 100',      auditor: 'Intertek Group', requested: '15 Mar 2027', scheduled: '05 Apr 2027', status: 'Scheduled',  score: null },
  { id: 'AR-006', manufacturer: 'Arvind Ltd',           type: 'Higg FEM Environmental',     auditor: 'Bureau Veritas', requested: '01 Apr 2027', scheduled: '15 Apr 2027', status: 'Scheduled',  score: null },
];

const STATUS_CFG = {
  Completed:   { cls: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', icon: CheckCircle },
  'In Progress': { cls: 'bg-blue-500/20 text-blue-300 border-blue-500/40',        icon: Clock },
  Scheduled:   { cls: 'bg-amber-500/20 text-amber-300 border-amber-500/40',      icon: Calendar },
};

const STATUSES = ['All', 'Completed', 'In Progress', 'Scheduled'];

export default function BrandAudits() {
  const [search, setSearch]   = useState('');
  const [status, setStatus]   = useState('All');
  const [expanded, setExpanded] = useState(null);

  const filtered = AUDIT_REQUESTS.filter(a =>
    (status === 'All' || a.status === status) &&
    (a.id.toLowerCase().includes(search.toLowerCase()) ||
     a.manufacturer.toLowerCase().includes(search.toLowerCase()) ||
     a.type.toLowerCase().includes(search.toLowerCase()))
  );

  const counts = {
    total: AUDIT_REQUESTS.length,
    completed: AUDIT_REQUESTS.filter(a => a.status === 'Completed').length,
    inProgress: AUDIT_REQUESTS.filter(a => a.status === 'In Progress').length,
    scheduled: AUDIT_REQUESTS.filter(a => a.status === 'Scheduled').length,
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Audit Requests</h1>
          <p className="text-slate-400 mt-1">Supplier audit requests and results for Zara (Inditex)</p>
        </div>
        <Button className="bg-teal-600 hover:bg-teal-700 text-white">
          <Plus className="h-4 w-4 mr-2" />Request Audit
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Requests', val: counts.total, color: 'text-white' },
          { label: 'Completed', val: counts.completed, color: 'text-emerald-400' },
          { label: 'In Progress', val: counts.inProgress, color: 'text-blue-400' },
          { label: 'Scheduled', val: counts.scheduled, color: 'text-amber-400' },
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
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by manufacturer or audit type…"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500/60" />
        </div>
        <div className="flex gap-2">
          {STATUSES.map(s => (
            <button key={s} onClick={() => setStatus(s)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${status === s ? 'bg-teal-600/20 border-teal-500/50 text-teal-300' : 'border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'}`}>
              {s}
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
                  {['Request ID', 'Manufacturer', 'Audit Type', 'Auditing Body', 'Requested', 'Scheduled', 'Score', 'Status'].map(h => (
                    <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(a => {
                  const scfg = STATUS_CFG[a.status] || STATUS_CFG.Scheduled;
                  const Icon = scfg.icon;
                  return (
                    <React.Fragment key={a.id}>
                      <tr className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors cursor-pointer"
                        onClick={() => setExpanded(expanded === a.id ? null : a.id)}>
                        <td className="px-4 py-3 text-teal-300 font-mono text-xs">{a.id}</td>
                        <td className="px-4 py-3 text-white whitespace-nowrap">{a.manufacturer}</td>
                        <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{a.type}</td>
                        <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{a.auditor}</td>
                        <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{a.requested}</td>
                        <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{a.scheduled}</td>
                        <td className="px-4 py-3">
                          {a.score !== null
                            ? <span className={`font-bold ${a.score >= 90 ? 'text-emerald-400' : a.score >= 80 ? 'text-amber-400' : 'text-red-400'}`}>{a.score}%</span>
                            : <span className="text-slate-600">—</span>}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${scfg.cls}`}>
                            <Icon className="w-3 h-3" />{a.status}
                          </span>
                        </td>
                      </tr>
                      {expanded === a.id && (
                        <tr className="border-b border-slate-700/50">
                          <td colSpan={8} className="px-6 py-4 bg-slate-900/50">
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div><span className="text-slate-500">Request ID: </span><span className="text-slate-300 font-mono">{a.id}</span></div>
                              <div><span className="text-slate-500">Auditing Body: </span><span className="text-slate-300">{a.auditor}</span></div>
                              <div><span className="text-slate-500">Score: </span><span className={a.score !== null ? (a.score >= 90 ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold') : 'text-slate-600'}>{a.score !== null ? `${a.score}%` : 'Pending'}</span></div>
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
            <div className="text-center py-12 text-slate-500">No audit requests match your filters.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
