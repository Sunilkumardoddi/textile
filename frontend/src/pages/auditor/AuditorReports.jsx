import React, { useState } from 'react';
import { FileText, Download, Search, CheckCircle, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const REPORTS = [
  { id: 'RPT-001', auditId: 'AUD-001', manufacturer: 'TCH Garments Pvt Ltd', type: 'SA8000 Social Audit',        brand: 'Zara (Inditex)', completedOn: '10 Jan 2027', score: 92, findings: 2, fileSize: '1.4 MB' },
  { id: 'RPT-002', auditId: 'AUD-002', manufacturer: 'TCH Garments Pvt Ltd', type: 'ISO 14001 Environmental',    brand: 'Zara (Inditex)', completedOn: '15 Feb 2027', score: 88, findings: 3, fileSize: '2.1 MB' },
  { id: 'RPT-003', auditId: 'AUD-006', manufacturer: 'TCH Garments Pvt Ltd', type: 'OEKO-TEX Standard 100',      brand: 'Zara (Inditex)', completedOn: '20 Jan 2027', score: 95, findings: 1, fileSize: '1.0 MB' },
  { id: 'RPT-004', auditId: 'AUD-007', manufacturer: 'Beximco Garments Ltd', type: 'Sedex SMETA 4-Pillar',       brand: 'H&M Group',      completedOn: '01 Feb 2027', score: 79, findings: 5, fileSize: '2.8 MB' },
];

const SCORE_COLOR = (s) => s >= 90 ? 'text-emerald-400' : s >= 80 ? 'text-amber-400' : 'text-red-400';

const MANUFACTURERS = ['All', 'TCH Garments Pvt Ltd', 'Beximco Garments Ltd'];

export default function AuditorReports() {
  const [search, setSearch]   = useState('');
  const [mfr, setMfr]         = useState('All');
  const [downloaded, setDownloaded] = useState({});

  const filtered = REPORTS.filter(r =>
    (mfr === 'All' || r.manufacturer === mfr) &&
    (r.id.toLowerCase().includes(search.toLowerCase()) ||
     r.manufacturer.toLowerCase().includes(search.toLowerCase()) ||
     r.type.toLowerCase().includes(search.toLowerCase()))
  );

  const avgScore = Math.round(REPORTS.reduce((n, r) => n + r.score, 0) / REPORTS.length);

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Audit Reports</h1>
        <p className="text-slate-400 mt-1">Completed audit reports filed by SGS Auditor</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Reports Filed', val: REPORTS.length, color: 'text-white' },
          { label: 'Avg Score', val: `${avgScore}%`, color: SCORE_COLOR(avgScore) },
          { label: 'Total Findings', val: REPORTS.reduce((n, r) => n + r.findings, 0), color: 'text-red-400' },
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
        <select value={mfr} onChange={e => setMfr(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500/60">
          {MANUFACTURERS.map(m => <option key={m}>{m}</option>)}
        </select>
      </div>

      {/* Report Cards */}
      <div className="space-y-3">
        {filtered.map(r => (
          <Card key={r.id} className="bg-slate-800 border-slate-700">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <FileText className="w-8 h-8 text-teal-400 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-white font-semibold">{r.type}</span>
                      <span className="text-slate-500 text-xs font-mono">{r.auditId}</span>
                    </div>
                    <p className="text-slate-400 text-sm">{r.manufacturer} · Brand: {r.brand}</p>
                    <p className="text-slate-500 text-xs mt-1">Completed {r.completedOn} · {r.fileSize}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span>Score: <span className={`font-bold ${SCORE_COLOR(r.score)}`}>{r.score}%</span></span>
                      <span className="text-slate-500">·</span>
                      <span>Findings: <span className={r.findings > 0 ? 'text-red-400 font-medium' : 'text-emerald-400'}>{r.findings}</span></span>
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setDownloaded(p => ({ ...p, [r.id]: true }))}
                  className={`border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white text-xs flex-shrink-0 ${downloaded[r.id] ? 'border-emerald-600/40 text-emerald-400' : ''}`}
                >
                  {downloaded[r.id]
                    ? <><CheckCircle className="w-3 h-3 mr-1" />Downloaded</>
                    : <><Download className="w-3 h-3 mr-1" />Download</>}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <FileText className="w-8 h-8 mx-auto mb-2 text-slate-700" />
            No reports match your filters.
          </div>
        )}
      </div>
    </div>
  );
}
