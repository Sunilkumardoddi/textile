import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ChevronDown, ChevronUp, Zap, BarChart2, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const SHIFTS = {
  Morning: [108, 121, 188, 72, 44],
  Afternoon: [102, 118, 195, 68, 38],
  Night: [88, 95, 170, 52, 28],
};

const LINES = [
  { id: 'Line-1', style: 'ZR-AW27-JK001', target: 120, efficiency: 90, progress: 68, status: 'On Track', defects: { Measurement: '0.8%', Stitching: '0.4%', 'Fabric Faults': '0.2%', Finishing: '0.3%' }, daily: [{ day: 'Mon', target: 120, actual: 115 }, { day: 'Tue', target: 120, actual: 112 }, { day: 'Wed', target: 120, actual: 108 }] },
  { id: 'Line-2', style: 'HM-AW27-PK001', target: 150, efficiency: 81, progress: 88, status: 'Slight Delay', defects: { Measurement: '1.1%', Stitching: '0.9%', 'Fabric Faults': '0.3%', Finishing: '0.4%' }, daily: [{ day: 'Mon', target: 150, actual: 130 }, { day: 'Tue', target: 150, actual: 118 }, { day: 'Wed', target: 150, actual: 121 }] },
  { id: 'Line-3', style: 'HM-AW27-CN002', target: 200, efficiency: 94, progress: 72, status: 'On Track', defects: { Measurement: '0.5%', Stitching: '0.3%', 'Fabric Faults': '0.1%', Finishing: '0.2%' }, daily: [{ day: 'Mon', target: 200, actual: 195 }, { day: 'Tue', target: 200, actual: 192 }, { day: 'Wed', target: 200, actual: 188 }] },
  { id: 'Line-4', style: 'MS-AW27-CT001', target: 100, efficiency: 72, progress: 40, status: 'At Risk', defects: { Measurement: '1.5%', Stitching: '1.8%', 'Fabric Faults': '0.6%', Finishing: '0.8%' }, daily: [{ day: 'Mon', target: 100, actual: 78 }, { day: 'Tue', target: 100, actual: 70 }, { day: 'Wed', target: 100, actual: 72 }] },
  { id: 'Line-5', style: 'ZR-AW27-DRS004', target: 80, efficiency: 55, progress: 15, status: 'Critical', defects: { Measurement: '2.1%', Stitching: '3.2%', 'Fabric Faults': '1.4%', Finishing: '1.8%' }, daily: [{ day: 'Mon', target: 80, actual: 52 }, { day: 'Tue', target: 80, actual: 48 }, { day: 'Wed', target: 80, actual: 44 }] },
];

const DAILY_OUTPUT = [
  { date: '16 Apr', output: 482, target: 650, eff: '74%' },
  { date: '17 Apr', output: 510, target: 650, eff: '78%' },
  { date: '18 Apr', output: 545, target: 650, eff: '84%' },
  { date: '19 Apr', output: 533, target: 650, eff: '82%' },
  { date: '20 Apr', output: 498, target: 650, eff: '77%' },
  { date: '21 Apr', output: 572, target: 650, eff: '88%' },
  { date: '22 Apr', output: 533, target: 650, eff: '82%' },
];

function effColor(eff) {
  if (eff >= 90) return 'text-emerald-400';
  if (eff >= 70) return 'text-amber-400';
  return 'text-red-400';
}

function effBg(eff) {
  if (eff >= 90) return 'bg-emerald-500';
  if (eff >= 70) return 'bg-amber-500';
  return 'bg-red-500';
}

const STATUS_BADGE = {
  'On Track': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  'Slight Delay': 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  'At Risk': 'bg-orange-500/20 text-orange-300 border-orange-500/40',
  Critical: 'bg-red-500/20 text-red-300 border-red-500/40',
};

export default function ManufacturerProduction() {
  const [shift, setShift] = useState('Morning');
  const [expandedLine, setExpandedLine] = useState(null);

  const actuals = SHIFTS[shift];
  const linesRunning = LINES.length;
  const overallEff = Math.round(LINES.reduce((s, l, i) => s + (actuals[i] / l.target) * 100, 0) / LINES.length);
  const dailyOutput = actuals.reduce((s, a) => s + a, 0);
  const defectRate = '1.4%';

  return (
    <div className="min-h-screen bg-slate-900 p-6 text-white">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <Activity className="w-7 h-7 text-teal-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Production Tracking</h1>
            <p className="text-slate-400 text-sm">TCH Garments Pvt Ltd — Bangalore, India</p>
          </div>
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Lines Running', value: linesRunning, color: 'text-teal-400' },
            { label: 'Overall Efficiency', value: `${overallEff}%`, color: effColor(overallEff) },
            { label: 'Daily Output', value: `${dailyOutput.toLocaleString()} pcs`, color: 'text-blue-400' },
            { label: 'Defect Rate', value: defectRate, color: 'text-amber-400' },
          ].map(kpi => (
            <Card key={kpi.label} className="bg-slate-800 border-slate-700">
              <CardContent className="pt-4 pb-4">
                <p className="text-slate-400 text-xs mb-1">{kpi.label}</p>
                <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Daily Output Table */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-teal-400" /> Daily Output — Last 7 Days
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    {['Date', 'Target', 'Actual Output', 'Efficiency', 'vs Target'].map(h => (
                      <th key={h} className="text-left px-3 py-2 text-slate-400 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {DAILY_OUTPUT.map(row => {
                    const pct = Math.round((row.output / row.target) * 100);
                    return (
                      <tr key={row.date} className="border-b border-slate-700/40">
                        <td className="px-3 py-2 text-slate-300">{row.date}</td>
                        <td className="px-3 py-2 text-slate-400">{row.target}</td>
                        <td className="px-3 py-2 text-white font-medium">{row.output}</td>
                        <td className={`px-3 py-2 font-semibold ${effColor(pct)}`}>{row.eff}</td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-slate-700 rounded-full h-1.5">
                              <div className={`h-1.5 rounded-full ${effBg(pct)}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                            </div>
                            <span className="text-xs text-slate-500">{row.output - row.target > 0 ? `+${row.output - row.target}` : row.output - row.target}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Shift Selector + Style Production */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-white font-semibold text-lg flex items-center gap-2"><Zap className="w-4 h-4 text-teal-400" /> Style-wise Production Status</h2>
          <div className="flex gap-2">
            {['Morning', 'Afternoon', 'Night'].map(s => (
              <button
                key={s}
                onClick={() => setShift(s)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  shift === s
                    ? 'bg-teal-600/20 border-teal-500/50 text-teal-300'
                    : 'border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    {['Line', 'Style', 'Target/Day', 'Actual/Day', 'Efficiency', 'Progress', 'Status'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-slate-400 font-medium whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {LINES.map((line, idx) => {
                    const actual = actuals[idx];
                    const eff = Math.round((actual / line.target) * 100);
                    return (
                      <React.Fragment key={line.id}>
                        <tr
                          className="border-b border-slate-700/50 hover:bg-slate-700/30 cursor-pointer transition-colors"
                          onClick={() => setExpandedLine(expandedLine === line.id ? null : line.id)}
                        >
                          <td className="px-4 py-3 text-teal-400 font-medium">{line.id}</td>
                          <td className="px-4 py-3 text-white font-mono text-xs">{line.style}</td>
                          <td className="px-4 py-3 text-slate-300">{line.target}</td>
                          <td className="px-4 py-3 text-white font-semibold">{actual}</td>
                          <td className={`px-4 py-3 font-bold ${effColor(eff)}`}>{eff}%</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2 min-w-[100px]">
                              <div className="flex-1 bg-slate-700 rounded-full h-2">
                                <div className={`h-2 rounded-full ${effBg(line.progress)}`} style={{ width: `${line.progress}%` }} />
                              </div>
                              <span className="text-xs text-slate-400 w-7">{line.progress}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Badge className={`text-xs ${STATUS_BADGE[line.status]}`}>{line.status}</Badge>
                              {expandedLine === line.id ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                            </div>
                          </td>
                        </tr>
                        {expandedLine === line.id && (
                          <tr className="border-b border-slate-700/50">
                            <td colSpan={7} className="px-4 py-4 bg-slate-900/60">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                  <p className="text-slate-400 text-xs uppercase tracking-wide mb-3 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Defect Rate by Type</p>
                                  <div className="space-y-2">
                                    {Object.entries(line.defects).map(([type, rate]) => (
                                      <div key={type} className="flex items-center justify-between">
                                        <span className="text-slate-300 text-sm">{type}</span>
                                        <span className={`text-sm font-semibold ${parseFloat(rate) > 1 ? 'text-red-400' : 'text-emerald-400'}`}>{rate}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <p className="text-slate-400 text-xs uppercase tracking-wide mb-3">Daily Breakdown — Last 3 Days</p>
                                  <table className="w-full text-sm">
                                    <thead>
                                      <tr className="border-b border-slate-700">
                                        <th className="text-left text-slate-500 py-1 font-medium">Day</th>
                                        <th className="text-left text-slate-500 py-1 font-medium">Target</th>
                                        <th className="text-left text-slate-500 py-1 font-medium">Actual</th>
                                        <th className="text-left text-slate-500 py-1 font-medium">Eff %</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {line.daily.map(d => {
                                        const de = Math.round((d.actual / d.target) * 100);
                                        return (
                                          <tr key={d.day}>
                                            <td className="py-1 text-slate-300">{d.day}</td>
                                            <td className="py-1 text-slate-400">{d.target}</td>
                                            <td className="py-1 text-white">{d.actual}</td>
                                            <td className={`py-1 font-semibold ${effColor(de)}`}>{de}%</td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
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
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
