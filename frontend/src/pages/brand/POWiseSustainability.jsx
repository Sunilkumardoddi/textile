import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Leaf, Droplets, Wind, Recycle, Award, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// ── Static Seed Data ───────────────────────────────────────────────────────────

const PO_OPTIONS = [
  { id: 'PO-AW27-4812', brand: 'Zara', season: 'AW2027', qty: 12400 },
  { id: 'PO-AW27-3991', brand: 'H&M',  season: 'AW2027', qty: 8600  },
  { id: 'PO-AW27-5100', brand: 'M&S',  season: 'AW2027', qty: 15200 },
];

const SUSTAINABILITY_DATA = {
  'PO-AW27-4812': {
    kpis: { carbon: '8.4 kg CO₂e', water: '142 L', chemical: '91%', waste: '78%' },
    stages: [
      { name: 'Raw Material', score: 88 },
      { name: 'Spinning',     score: 82 },
      { name: 'Weaving',      score: 79 },
      { name: 'Dyeing',       score: 64 },
      { name: 'Cut & Sew',    score: 71 },
    ],
    certs: [
      { name: 'GOTS',      pct: 75 },
      { name: 'BCI',       pct: 50 },
      { name: 'OEKO-TEX',  pct: 100 },
      { name: 'SA8000',    pct: 50 },
      { name: 'bluesign',  pct: 50 },
      { name: 'Higg FEM',  pct: 25 },
    ],
    sdgs: [
      { num: 6,  label: 'Clean Water & Sanitation',    color: 'bg-blue-500/20 border-blue-500/40 text-blue-300',     score: 'Medium' },
      { num: 8,  label: 'Decent Work & Growth',        color: 'bg-amber-500/20 border-amber-500/40 text-amber-300',  score: 'High'   },
      { num: 12, label: 'Responsible Consumption',     color: 'bg-orange-500/20 border-orange-500/40 text-orange-300', score: 'Medium' },
      { num: 13, label: 'Climate Action',              color: 'bg-teal-500/20 border-teal-500/40 text-teal-300',     score: 'Low'    },
      { num: 15, label: 'Life on Land',                color: 'bg-green-500/20 border-green-500/40 text-green-300',  score: 'Medium' },
    ],
  },
  'PO-AW27-3991': {
    kpis: { carbon: '7.1 kg CO₂e', water: '118 L', chemical: '95%', waste: '82%' },
    stages: [
      { name: 'Raw Material', score: 92 },
      { name: 'Spinning',     score: 87 },
      { name: 'Weaving',      score: 83 },
      { name: 'Dyeing',       score: 74 },
      { name: 'Cut & Sew',    score: 69 },
    ],
    certs: [
      { name: 'GOTS',      pct: 100 },
      { name: 'BCI',       pct: 100 },
      { name: 'OEKO-TEX',  pct: 67  },
      { name: 'SA8000',    pct: 67  },
      { name: 'bluesign',  pct: 33  },
      { name: 'Higg FEM',  pct: 33  },
    ],
    sdgs: [
      { num: 6,  label: 'Clean Water & Sanitation',    color: 'bg-blue-500/20 border-blue-500/40 text-blue-300',     score: 'High'   },
      { num: 8,  label: 'Decent Work & Growth',        color: 'bg-amber-500/20 border-amber-500/40 text-amber-300',  score: 'High'   },
      { num: 12, label: 'Responsible Consumption',     color: 'bg-orange-500/20 border-orange-500/40 text-orange-300', score: 'High'   },
      { num: 13, label: 'Climate Action',              color: 'bg-teal-500/20 border-teal-500/40 text-teal-300',     score: 'Medium' },
      { num: 15, label: 'Life on Land',                color: 'bg-green-500/20 border-green-500/40 text-green-300',  score: 'Medium' },
    ],
  },
  'PO-AW27-5100': {
    kpis: { carbon: '6.8 kg CO₂e', water: '104 L', chemical: '97%', waste: '88%' },
    stages: [
      { name: 'Raw Material', score: 96 },
      { name: 'Spinning',     score: 93 },
      { name: 'Weaving',      score: 91 },
      { name: 'Dyeing',       score: 85 },
      { name: 'Cut & Sew',    score: 88 },
    ],
    certs: [
      { name: 'GOTS',      pct: 100 },
      { name: 'BCI',       pct: 33  },
      { name: 'OEKO-TEX',  pct: 100 },
      { name: 'SA8000',    pct: 100 },
      { name: 'bluesign',  pct: 67  },
      { name: 'Higg FEM',  pct: 67  },
    ],
    sdgs: [
      { num: 6,  label: 'Clean Water & Sanitation',    color: 'bg-blue-500/20 border-blue-500/40 text-blue-300',     score: 'High'   },
      { num: 8,  label: 'Decent Work & Growth',        color: 'bg-amber-500/20 border-amber-500/40 text-amber-300',  score: 'High'   },
      { num: 12, label: 'Responsible Consumption',     color: 'bg-orange-500/20 border-orange-500/40 text-orange-300', score: 'High'   },
      { num: 13, label: 'Climate Action',              color: 'bg-teal-500/20 border-teal-500/40 text-teal-300',     score: 'High'   },
      { num: 15, label: 'Life on Land',                color: 'bg-green-500/20 border-green-500/40 text-green-300',  score: 'High'   },
    ],
  },
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function scoreColor(score) {
  if (score >= 85) return 'bg-emerald-500';
  if (score >= 70) return 'bg-amber-500';
  return 'bg-red-500';
}

function scoreBadge(score) {
  if (score >= 85) return 'text-emerald-400';
  if (score >= 70) return 'text-amber-400';
  return 'text-red-400';
}

const SDG_SCORE_COLOR = {
  High:   'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  Medium: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  Low:    'bg-red-500/20 text-red-300 border-red-500/40',
};

// ── Component ──────────────────────────────────────────────────────────────────

export default function POWiseSustainability() {
  const navigate = useNavigate();
  const [activePO, setActivePO] = useState('PO-AW27-4812');

  const data = SUSTAINABILITY_DATA[activePO];

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/brand/po-sc-management')}
          className="text-slate-400 hover:text-white">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <Leaf className="w-6 h-6 text-teal-400" />
        <h1 className="text-xl font-semibold text-white">PO Wise Sustainability Metrics</h1>
      </div>

      {/* PO Tabs */}
      <div className="flex gap-2 mb-6">
        {PO_OPTIONS.map(po => (
          <button key={po.id} onClick={() => setActivePO(po.id)}
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
          { label: 'Carbon Footprint',    val: data.kpis.carbon,   icon: Wind,     color: 'text-slate-200' },
          { label: 'Water Usage/Garment', val: data.kpis.water,    icon: Droplets, color: 'text-blue-300'  },
          { label: 'Chemical Compliance', val: data.kpis.chemical, icon: Award,    color: 'text-emerald-300' },
          { label: 'Waste Diverted',      val: data.kpis.waste,    icon: Recycle,  color: 'text-teal-300'  },
        ].map(kpi => (
          <Card key={kpi.label} className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
                <span className="text-xs text-slate-400">{kpi.label}</span>
              </div>
              <div className={`text-2xl font-bold ${kpi.color}`}>{kpi.val}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Sections */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Stage Scores */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-slate-200">Sustainability Score by Stage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.stages.map(s => (
              <div key={s.name}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-sm text-slate-300">{s.name}</span>
                  <span className={`text-sm font-semibold ${scoreBadge(s.score)}`}>{s.score}/100</span>
                </div>
                <div className="h-2 rounded-full bg-slate-700">
                  <div className={`h-2 rounded-full transition-all duration-500 ${scoreColor(s.score)}`}
                    style={{ width: `${s.score}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Certification Coverage */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-slate-200">Certification Coverage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.certs.map(c => (
              <div key={c.name} className="flex items-center gap-3">
                <Award className="w-4 h-4 text-slate-500 flex-shrink-0" />
                <span className="text-sm text-slate-300 w-24">{c.name}</span>
                <div className="flex-1 h-1.5 rounded-full bg-slate-700">
                  <div className={`h-1.5 rounded-full transition-all duration-500 ${c.pct >= 80 ? 'bg-emerald-500' : c.pct >= 50 ? 'bg-teal-500' : 'bg-amber-500'}`}
                    style={{ width: `${c.pct}%` }} />
                </div>
                <span className={`text-xs font-medium w-10 text-right ${c.pct >= 80 ? 'text-emerald-400' : c.pct >= 50 ? 'text-teal-400' : 'text-amber-400'}`}>
                  {c.pct}%
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* SDG Alignment */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-slate-200 flex items-center gap-2">
            <Globe className="w-4 h-4 text-teal-400" />
            UN SDG Alignment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-3">
            {data.sdgs.map(sdg => (
              <div key={sdg.num} className={`rounded-xl border p-4 text-center ${sdg.color}`}>
                <div className="text-2xl font-bold mb-1">SDG {sdg.num}</div>
                <div className="text-xs leading-tight mb-3 opacity-80">{sdg.label}</div>
                <span className={`px-2 py-0.5 rounded-full text-xs border font-medium ${SDG_SCORE_COLOR[sdg.score]}`}>
                  {sdg.score}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
