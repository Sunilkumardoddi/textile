import React, { useState } from 'react';
import { ShieldCheck, Search, CheckCircle, AlertTriangle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const SUPPLIERS = [
  {
    id: 'SUP-001',
    name: 'TCH Garments Pvt Ltd',
    country: 'India',
    tier: 'Tier 1',
    overallScore: 91,
    certifications: { total: 6, valid: 4, expiringSoon: 1, expired: 2 },
    audits: { last: '15 Feb 2027', score: 88, status: 'Completed' },
    policies: { codeOfConduct: true, antiCorruption: true, envPolicy: true, humanRights: true },
    status: 'Compliant',
  },
  {
    id: 'SUP-002',
    name: 'Beximco Garments Ltd',
    country: 'Bangladesh',
    tier: 'Tier 1',
    overallScore: 74,
    certifications: { total: 4, valid: 3, expiringSoon: 0, expired: 1 },
    audits: { last: '01 Feb 2027', score: 79, status: 'Completed' },
    policies: { codeOfConduct: true, antiCorruption: true, envPolicy: false, humanRights: true },
    status: 'Needs Attention',
  },
  {
    id: 'SUP-003',
    name: 'Arvind Ltd',
    country: 'India',
    tier: 'Tier 1',
    overallScore: 63,
    certifications: { total: 3, valid: 2, expiringSoon: 1, expired: 0 },
    audits: { last: '—', score: null, status: 'Scheduled' },
    policies: { codeOfConduct: true, antiCorruption: false, envPolicy: false, humanRights: true },
    status: 'Needs Attention',
  },
  {
    id: 'SUP-004',
    name: 'Vardhman Textiles',
    country: 'India',
    tier: 'Tier 2',
    overallScore: 85,
    certifications: { total: 5, valid: 5, expiringSoon: 0, expired: 0 },
    audits: { last: '10 Mar 2027', score: 90, status: 'Completed' },
    policies: { codeOfConduct: true, antiCorruption: true, envPolicy: true, humanRights: false },
    status: 'Compliant',
  },
];

const STATUS_CFG = {
  Compliant:       { cls: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', icon: CheckCircle },
  'Needs Attention': { cls: 'bg-amber-500/20 text-amber-300 border-amber-500/40',    icon: AlertTriangle },
  'Non-Compliant': { cls: 'bg-red-500/20 text-red-300 border-red-500/40',            icon: XCircle },
};

const TIER_TABS = ['All', 'Tier 1', 'Tier 2'];

function ScoreBar({ score }) {
  const color = score >= 85 ? 'bg-emerald-500' : score >= 70 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
        <div className={`h-2 rounded-full ${color} transition-all`} style={{ width: `${score}%` }} />
      </div>
      <span className={`text-xs font-bold w-8 text-right ${score >= 85 ? 'text-emerald-400' : score >= 70 ? 'text-amber-400' : 'text-red-400'}`}>{score}</span>
    </div>
  );
}

export default function BrandCompliance() {
  const [search, setSearch]   = useState('');
  const [tier, setTier]       = useState('All');
  const [expanded, setExpanded] = useState(null);

  const filtered = SUPPLIERS.filter(s =>
    (tier === 'All' || s.tier === tier) &&
    (s.name.toLowerCase().includes(search.toLowerCase()) || s.country.toLowerCase().includes(search.toLowerCase()))
  );

  const counts = {
    total: SUPPLIERS.length,
    compliant: SUPPLIERS.filter(s => s.status === 'Compliant').length,
    attention: SUPPLIERS.filter(s => s.status === 'Needs Attention').length,
    avgScore: Math.round(SUPPLIERS.reduce((n, s) => n + s.overallScore, 0) / SUPPLIERS.length),
  };

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Supplier Compliance</h1>
        <p className="text-slate-400 mt-1">Compliance scores and certification status for your supplier base</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Suppliers', val: counts.total, color: 'text-white' },
          { label: 'Compliant', val: counts.compliant, color: 'text-emerald-400' },
          { label: 'Needs Attention', val: counts.attention, color: 'text-amber-400' },
          { label: 'Avg Score', val: `${counts.avgScore}%`, color: counts.avgScore >= 85 ? 'text-emerald-400' : 'text-amber-400' },
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
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search supplier or country…"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500/60" />
        </div>
        <div className="flex gap-2">
          {TIER_TABS.map(t => (
            <button key={t} onClick={() => setTier(t)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${tier === t ? 'bg-teal-600/20 border-teal-500/50 text-teal-300' : 'border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Supplier Cards */}
      <div className="space-y-3">
        {filtered.map(s => {
          const scfg = STATUS_CFG[s.status] || STATUS_CFG['Needs Attention'];
          const StatusIcon = scfg.icon;
          const isOpen = expanded === s.id;
          return (
            <Card key={s.id} className="bg-slate-800 border-slate-700">
              <CardContent className="p-0">
                <button
                  className="w-full flex items-center gap-4 px-6 py-4 hover:bg-slate-700/20 transition-colors text-left"
                  onClick={() => setExpanded(isOpen ? null : s.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-white font-semibold">{s.name}</span>
                      <span className="text-slate-500 text-xs">{s.country} · {s.tier}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs border ${scfg.cls}`}>{s.status}</span>
                    </div>
                    <div className="max-w-xs">
                      <ScoreBar score={s.overallScore} />
                    </div>
                  </div>
                  <div className="text-slate-400 flex items-center gap-4 text-sm">
                    <span className="text-xs text-slate-500">{s.certifications.valid}/{s.certifications.total} certs valid</span>
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-5 border-t border-slate-700/50 pt-4 space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-slate-500 text-xs mb-1">Certifications</p>
                        <p className="text-white">{s.certifications.valid} valid</p>
                        {s.certifications.expiringSoon > 0 && <p className="text-amber-400 text-xs">{s.certifications.expiringSoon} expiring soon</p>}
                        {s.certifications.expired > 0 && <p className="text-red-400 text-xs">{s.certifications.expired} expired</p>}
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs mb-1">Last Audit</p>
                        <p className="text-white">{s.audits.last}</p>
                        {s.audits.score && <p className={`text-xs ${s.audits.score >= 85 ? 'text-emerald-400' : 'text-amber-400'}`}>{s.audits.score}% score</p>}
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs mb-2">Policy Compliance</p>
                        <div className="space-y-1">
                          {[
                            { label: 'Code of Conduct', val: s.policies.codeOfConduct },
                            { label: 'Anti-Corruption', val: s.policies.antiCorruption },
                            { label: 'Env. Policy', val: s.policies.envPolicy },
                            { label: 'Human Rights', val: s.policies.humanRights },
                          ].map(p => (
                            <div key={p.label} className="flex items-center gap-1.5 text-xs">
                              {p.val
                                ? <CheckCircle className="w-3 h-3 text-emerald-400" />
                                : <XCircle className="w-3 h-3 text-red-400" />}
                              <span className={p.val ? 'text-slate-300' : 'text-red-300'}>{p.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs mb-1">Overall Score</p>
                        <p className={`text-2xl font-bold ${s.overallScore >= 85 ? 'text-emerald-400' : s.overallScore >= 70 ? 'text-amber-400' : 'text-red-400'}`}>{s.overallScore}%</p>
                        <p className="text-slate-500 text-xs mt-1">{s.status}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-500">No suppliers match your filters.</div>
        )}
      </div>
    </div>
  );
}
