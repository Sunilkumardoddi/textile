import React, { useState } from 'react';
import { ClipboardList, Search, CheckCircle, Clock, Calendar, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const AUDITS = [
  { id: 'AUD-001', manufacturer: 'TCH Garments Pvt Ltd', auditor: 'SGS Auditor',      type: 'SA8000 Social',    scheduled: '10 Jan 2027', completed: '10 Jan 2027', score: 92, status: 'Completed',   findings: 2 },
  { id: 'AUD-002', manufacturer: 'TCH Garments Pvt Ltd', auditor: 'Bureau Veritas',   type: 'ISO 14001 Environmental', scheduled: '15 Feb 2027', completed: '15 Feb 2027', score: 88, status: 'Completed', findings: 3 },
  { id: 'AUD-003', manufacturer: 'Beximco Garments Ltd', auditor: 'Intertek Testing', type: 'SMETA 4-Pillar',   scheduled: '01 Mar 2027', completed: '—',           score: null, status: 'In Progress', findings: 0 },
  { id: 'AUD-004', manufacturer: 'Beximco Garments Ltd', auditor: 'SGS Auditor',      type: 'GOTS Certification',scheduled: '20 Mar 2027', completed: '—',          score: null, status: 'Scheduled',  findings: 0 },
  { id: 'AUD-005', manufacturer: 'Arvind Ltd',           auditor: 'Bureau Veritas',   type: 'Higg FEM Level 2', scheduled: '05 Apr 2027', completed: '—',           score: null, status: 'Scheduled',  findings: 0 },
  { id: 'AUD-006', manufacturer: 'TCH Garments Pvt Ltd', auditor: 'Intertek Testing', type: 'OEKO-TEX 100',     scheduled: '20 Jan 2027', completed: '20 Jan 2027', score: 95, status: 'Completed',   findings: 1 },
  { id: 'AUD-007', manufacturer: 'Beximco Garments Ltd', auditor: 'SGS Auditor',      type: 'Sedex SMETA',      scheduled: '01 Feb 2027', completed: '01 Feb 2027', score: 79, status: 'Completed',   findings: 5 },
  { id: 'AUD-008', manufacturer: 'Arvind Ltd',           auditor: 'Bureau Veritas',   type: 'SA8000 Social',    scheduled: '10 Apr 2027', completed: '—',           score: null, status: 'Scheduled',  findings: 0 },
];

const STATUS_CFG = {
  Completed:   { cls: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', icon: CheckCircle },
  'In Progress': { cls: 'bg-blue-500/20 text-blue-300 border-blue-500/40',        icon: Clock },
  Scheduled:   { cls: 'bg-amber-500/20 text-amber-300 border-amber-500/40',      icon: Calendar },
};

const AUDITORS = ['All', 'SGS Auditor', 'Bureau Veritas', 'Intertek Testing'];
const STATUSES = ['All', 'Completed', 'In Progress', 'Scheduled'];

export default function AdminAudits() {
  const [search, setSearch]    = useState('');
  const [auditor, setAuditor]  = useState('All');
  const [status, setStatus]    = useState('All');
  const [expanded, setExpanded] = useState(null);

  const filtered = AUDITS.filter(a =>
    (auditor === 'All' || a.auditor === auditor) &&
    (status === 'All' || a.status === status) &&
    (a.id.toLowerCase().includes(search.toLowerCase()) || a.manufacturer.toLowerCase().includes(search.toLowerCase()) || a.type.toLowerCase().includes(search.toLowerCase()))
  );

  const counts = {
    total: AUDITS.length,
    completed: AUDITS.filter(a => a.status === 'Completed').length,
    inProgress: AUDITS.filter(a => a.status === 'In Progress').length,
    scheduled: AUDITS.filter(a => a.status === 'Scheduled').length,
  };

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-3xl font-bold text-white">All Audits</h1>
        <p className="text-slate-400 mt-1">Platform-wide audit activity across all manufacturers</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Audits', val: counts.total, color: 'text-white' },
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
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search audit ID, manufacturer, or type…"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500/60" />
        </div>
        <select value={auditor} onChange={e => setAuditor(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500/60">
          {AUDITORS.map(a => <option key={a}>{a}</option>)}
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
                  {['Audit ID', 'Manufacturer', 'Auditor', 'Type', 'Scheduled', 'Completed', 'Score', 'Findings', 'Status'].map(h => (
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
                        <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{a.auditor}</td>
                        <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{a.type}</td>
                        <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{a.scheduled}</td>
                        <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{a.completed}</td>
                        <td className="px-4 py-3">
                          {a.score !== null
                            ? <span className={`font-bold ${a.score >= 90 ? 'text-emerald-400' : a.score >= 80 ? 'text-amber-400' : 'text-red-400'}`}>{a.score}%</span>
                            : <span className="text-slate-600">—</span>}
                        </td>
                        <td className="px-4 py-3">
                          {a.findings > 0
                            ? <span className="text-red-400 font-medium">{a.findings}</span>
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
                          <td colSpan={9} className="px-6 py-4 bg-slate-900/50">
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div><span className="text-slate-500">Audit ID: </span><span className="text-slate-300 font-mono">{a.id}</span></div>
                              <div><span className="text-slate-500">Type: </span><span className="text-slate-300">{a.type}</span></div>
                              <div><span className="text-slate-500">Findings: </span><span className={a.findings > 0 ? 'text-red-400' : 'text-emerald-400'}>{a.findings > 0 ? `${a.findings} non-conformance(s)` : 'None'}</span></div>
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
            <div className="text-center py-12 text-slate-500">No audits match your filters.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
