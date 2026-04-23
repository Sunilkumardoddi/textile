import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, Award, ArrowLeft, CheckCircle, Clock, XCircle, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// ── Per-supplier data ───────────────────────────────────────────────────────
const SUPPLIER_DATA = {
  'TCH Garments Pvt Ltd': {
    type: 'Own Facility',
    location: 'Bangalore, India',
    overallFEM: { score: 77, target: 75, status: 'Met' },
    higgFEM: [
      { module: 'Energy',          score: 78, target: 80, status: 'close' },
      { module: 'Water',           score: 72, target: 75, status: 'close' },
      { module: 'Wastewater',      score: 88, target: 80, status: 'met'   },
      { module: 'Air Emissions',   score: 82, target: 80, status: 'met'   },
      { module: 'Waste',           score: 70, target: 75, status: 'below' },
      { module: 'Chemicals/ZDHC',  score: 76, target: 80, status: 'close' },
    ],
    certs: [
      { name: 'GOTS',      status: 'Verified', expiry: '2025-12-31', action: 'View'     },
      { name: 'SA8000',    status: 'Verified', expiry: '2026-05-31', action: 'View'     },
      { name: 'ISO 14001', status: 'Verified', expiry: '2027-03-14', action: 'View'     },
      { name: 'OEKO-TEX',  status: 'Partial',  expiry: '2026-03-31', action: 'Complete' },
      { name: 'Higg FEM',  status: 'Pending',  expiry: 'Under Review', action: 'Upload' },
      { name: 'Sedex SMETA',status: 'Verified',expiry: '2026-08-31', action: 'View'     },
    ],
  },
  'Kavali Textiles Pvt Ltd': {
    type: 'Nominated Supplier — Tier 2 Fabric',
    location: 'Kavali, Andhra Pradesh, India',
    overallFEM: { score: 68, target: 75, status: 'Below' },
    higgFEM: [
      { module: 'Energy',          score: 72, target: 80, status: 'below' },
      { module: 'Water',           score: 65, target: 75, status: 'below' },
      { module: 'Wastewater',      score: 78, target: 80, status: 'close' },
      { module: 'Air Emissions',   score: 80, target: 80, status: 'met'   },
      { module: 'Waste',           score: 68, target: 75, status: 'below' },
      { module: 'Chemicals/ZDHC',  score: 71, target: 80, status: 'below' },
    ],
    certs: [
      { name: 'GOTS',     status: 'Verified', expiry: '2025-09-30', action: 'View'   },
      { name: 'GRS',      status: 'Verified', expiry: '2025-12-15', action: 'View'   },
      { name: 'OCS',      status: 'Verified', expiry: '2026-05-10', action: 'View'   },
      { name: 'RCS',      status: 'Partial',  expiry: 'Under Review', action: 'Complete' },
      { name: 'Higg FEM', status: 'Partial',  expiry: 'Under Review', action: 'Upload' },
      { name: 'BCI',      status: 'Pending',  expiry: '—',          action: 'Apply'  },
    ],
  },
  'Danilo Fabrics': {
    type: 'Nominated Supplier — Tier 3 Raw Material',
    location: 'Coimbatore, Tamil Nadu, India',
    overallFEM: { score: 61, target: 70, status: 'Below' },
    higgFEM: [
      { module: 'Energy',          score: 61, target: 70, status: 'below' },
      { module: 'Water',           score: 55, target: 70, status: 'below' },
      { module: 'Wastewater',      score: 69, target: 75, status: 'close' },
      { module: 'Air Emissions',   score: 72, target: 70, status: 'met'   },
      { module: 'Waste',           score: 58, target: 70, status: 'below' },
      { module: 'Chemicals/ZDHC',  score: 62, target: 70, status: 'below' },
    ],
    certs: [
      { name: 'OCS',      status: 'Pending',  expiry: '—',          action: 'Apply'  },
      { name: 'GOTS',     status: 'Gap',      expiry: '—',          action: 'Apply'  },
      { name: 'BCI',      status: 'Verified', expiry: '2026-01-31', action: 'View'   },
      { name: 'Higg FEM', status: 'Pending',  expiry: '—',          action: 'Upload' },
      { name: 'ISO 14001',status: 'Pending',  expiry: '—',          action: 'Apply'  },
    ],
  },
};

const SEASONS = ['All Seasons', 'AW2027', 'SS2027', 'AW2028'];
const SUPPLIERS = Object.keys(SUPPLIER_DATA);

// ── Sub-components ──────────────────────────────────────────────────────────
const HiggBar = ({ module, score, target, status }) => {
  const barColor = status === 'met' ? 'bg-emerald-500' : status === 'close' ? 'bg-orange-400' : 'bg-red-500';
  const textColor = status === 'met' ? 'text-emerald-400' : status === 'close' ? 'text-orange-400' : 'text-red-400';
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-slate-200 text-sm font-medium">{module}</span>
        <div className="flex items-center gap-3">
          <span className={`text-sm font-bold ${textColor}`}>{score}%</span>
          <span className="text-slate-500 text-xs">Target: {target}%</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
            status === 'met' ? 'bg-emerald-500/10 text-emerald-400'
            : status === 'close' ? 'bg-orange-500/10 text-orange-400'
            : 'bg-red-500/10 text-red-400'}`}>
            {status === 'met' ? '✓ Met' : status === 'close' ? '~ Close' : '✗ Below'}
          </span>
        </div>
      </div>
      <div className="relative w-full bg-slate-700 rounded-full h-3">
        <div className={`${barColor} h-3 rounded-full transition-all duration-700`} style={{ width: `${score}%` }} />
        <div className="absolute top-0 bottom-0 w-0.5 bg-white/70"
          style={{ left: `${target}%`, transform: 'translateX(-50%)' }} />
      </div>
    </div>
  );
};

const CertStatusBadge = ({ status }) => {
  const map = {
    Verified: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
    Partial:  'bg-orange-500/20 text-orange-400 border-orange-500/40',
    Pending:  'bg-slate-500/20 text-slate-300 border-slate-500/40',
    Gap:      'bg-red-500/20 text-red-400 border-red-500/40',
  };
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${map[status] || map.Pending}`}>{status}</span>;
};

// ── Main component ──────────────────────────────────────────────────────────
const HiggFemCertifications = () => {
  const navigate = useNavigate();
  const [selectedSupplier, setSelectedSupplier] = useState('TCH Garments Pvt Ltd');
  const [selectedSeason, setSelectedSeason]   = useState('AW2027');

  const data = SUPPLIER_DATA[selectedSupplier];
  const fem  = data.overallFEM;
  const femStatusColor = fem.status === 'Met' ? 'text-emerald-400' : fem.status === 'Below' ? 'text-red-400' : 'text-orange-400';

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Sustainability &amp; Certs</h1>
          <p className="text-slate-400 mt-1">Higg FEM scores &amp; certification status by supplier &amp; season</p>
        </div>
        <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800"
          onClick={() => navigate('/dashboard/manufacturer/overview')}>
          <ArrowLeft className="h-4 w-4 mr-2" />Mfr Overview
        </Button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-3 items-center p-4 bg-slate-800 rounded-xl border border-slate-700">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-sm">Supplier:</span>
          <div className="relative">
            <select
              value={selectedSupplier}
              onChange={e => setSelectedSupplier(e.target.value)}
              className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-1.5 text-sm text-white appearance-none pr-8 focus:outline-none focus:border-teal-500/60"
            >
              {SUPPLIERS.map(s => (
                <option key={s} value={s}>
                  {s} {SUPPLIER_DATA[s].type.startsWith('Own') ? '(Own)' : '(Nominated)'}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-sm">Season:</span>
          <div className="relative">
            <select
              value={selectedSeason}
              onChange={e => setSelectedSeason(e.target.value)}
              className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-1.5 text-sm text-white appearance-none pr-8 focus:outline-none focus:border-teal-500/60"
            >
              {SEASONS.map(s => <option key={s}>{s}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Supplier info pill */}
        <div className="ml-auto flex items-center gap-3 text-sm">
          <span className="text-slate-400">{data.type}</span>
          <span className="text-slate-500">·</span>
          <span className="text-slate-300">{data.location}</span>
          <span className={`px-3 py-0.5 rounded-full text-xs font-semibold border ${
            fem.status === 'Met' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
            : fem.status === 'Below' ? 'bg-red-500/20 text-red-400 border-red-500/40'
            : 'bg-orange-500/20 text-orange-400 border-orange-500/40'
          }`}>
            FEM {fem.score}/100 — {fem.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Higg FEM */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Leaf className="h-5 w-5 text-teal-400" />Higg FEM Environmental Module
            </CardTitle>
            <CardDescription className="text-slate-400">
              Score vs target per environmental pillar — white line marks target · Season: {selectedSeason}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.higgFEM.map((item, i) => <HiggBar key={i} {...item} />)}
            <div className="mt-4 p-3 rounded-lg bg-slate-900/50 border border-slate-700">
              <p className="text-slate-400 text-xs">
                Overall Higg FEM:&nbsp;
                <strong className="text-white">{fem.score}/100</strong>
                &nbsp;·&nbsp;Target:&nbsp;
                <strong className="text-teal-400">{fem.target}/100</strong>
                &nbsp;·&nbsp;Status:&nbsp;
                <span className={femStatusColor}>{fem.status}</span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Certification Status */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-400" />Certification Status
            </CardTitle>
            <CardDescription className="text-slate-400">
              Current certification register — {selectedSupplier}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-900 border-b border-slate-700">
                    {['Certificate', 'Status', 'Expiry', 'Action'].map(h => (
                      <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-white">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.certs.map((cert, i) => (
                    <tr key={cert.name}
                      className={`border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors ${i % 2 === 0 ? '' : 'bg-slate-900/20'}`}>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {cert.status === 'Verified' ? <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                            : cert.status === 'Gap'    ? <XCircle className="h-3.5 w-3.5 text-red-400" />
                            : <Clock className="h-3.5 w-3.5 text-orange-400" />}
                          <span className="text-white text-sm font-medium">{cert.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4"><CertStatusBadge status={cert.status} /></td>
                      <td className="py-3 px-4 text-slate-400 text-xs">{cert.expiry}</td>
                      <td className="py-3 px-4">
                        <Button size="sm" variant="outline"
                          className={`text-xs h-7 px-2.5 ${
                            cert.action === 'Apply' || cert.action === 'Upload'
                              ? 'border-teal-500/50 text-teal-400 hover:bg-teal-500/10'
                              : cert.action === 'Renew' || cert.action === 'Complete'
                              ? 'border-orange-500/50 text-orange-400 hover:bg-orange-500/10'
                              : 'border-slate-600 text-slate-300'
                          }`}>
                          {cert.action}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Nominated suppliers summary strip */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-4">
          <p className="text-slate-400 text-xs uppercase tracking-wide font-semibold mb-3">All Nominated Suppliers — FEM Overview</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {SUPPLIERS.map(s => {
              const d = SUPPLIER_DATA[s];
              const isSelected = s === selectedSupplier;
              return (
                <button key={s} onClick={() => setSelectedSupplier(s)}
                  className={`p-3 rounded-lg border text-left transition-all ${isSelected ? 'bg-teal-600/20 border-teal-500/50' : 'bg-slate-900/50 border-slate-700 hover:border-slate-500'}`}>
                  <p className={`text-sm font-medium ${isSelected ? 'text-teal-300' : 'text-white'}`}>{s}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{d.type}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div className={`h-1.5 rounded-full ${d.overallFEM.score >= d.overallFEM.target ? 'bg-emerald-500' : d.overallFEM.score >= d.overallFEM.target - 10 ? 'bg-orange-400' : 'bg-red-500'}`}
                        style={{ width: `${d.overallFEM.score}%` }} />
                    </div>
                    <span className={`text-xs font-bold ${d.overallFEM.score >= d.overallFEM.target ? 'text-emerald-400' : 'text-orange-400'}`}>{d.overallFEM.score}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HiggFemCertifications;
