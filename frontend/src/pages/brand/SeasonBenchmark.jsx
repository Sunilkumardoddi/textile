import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, Minus, ArrowLeft, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import data from '@/data/seasonPOData.json';

const { seasonBenchmark } = data;

const DeltaCell = ({ delta, dir }) => {
    if (dir === 'up')   return <span className="inline-flex items-center gap-0.5 text-emerald-400 font-semibold text-sm"><TrendingUp className="h-3.5 w-3.5" />{delta}</span>;
    if (dir === 'down') return <span className="inline-flex items-center gap-0.5 text-red-400 font-semibold text-sm"><TrendingDown className="h-3.5 w-3.5" />{delta}</span>;
    return <span className="text-slate-400 text-sm">{delta}</span>;
};

const BenchmarkCell = ({ value, rowValue }) => {
    if (value === 'N/A') return <span className="text-slate-500 text-sm">N/A</span>;
    const rowNum = parseFloat(String(rowValue).replace(/[^0-9.]/g, ''));
    const benchNum = parseFloat(String(value).replace(/[^0-9.]/g, ''));
    const isBelow = !isNaN(rowNum) && !isNaN(benchNum) && rowNum < benchNum;
    return <span className={`font-semibold text-sm ${isBelow ? 'text-red-400' : 'text-emerald-400'}`}>{value}</span>;
};

const SeasonBenchmark = () => {
    const navigate = useNavigate();
    const [activeSeason, setActiveSeason] = useState(seasonBenchmark.currentSeason);

    return (
        <div className="space-y-6 pb-8" data-testid="season-benchmark">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Season Comparison & Benchmark</h1>
                    <p className="text-slate-400 mt-1">Sustainability metrics across seasons vs industry benchmark</p>
                </div>
                <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800"
                    onClick={() => navigate('/dashboard/brand')}>
                    <ArrowLeft className="h-4 w-4 mr-2" /> Dashboard
                </Button>
            </div>

            {/* Season Tabs */}
            <div className="flex gap-1 bg-slate-800/50 p-1 rounded-xl border border-slate-700 overflow-x-auto">
                {seasonBenchmark.seasons.map(s => (
                    <button
                        key={s}
                        onClick={() => setActiveSeason(s)}
                        className={`px-5 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                            activeSeason === s
                                ? 'bg-teal-600 text-white shadow'
                                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                        }`}
                    >
                        {s}
                    </button>
                ))}
            </div>

            {/* Comparison Table */}
            <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-purple-400" />
                        {activeSeason} — Season-over-Season Performance
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                        Comparing {activeSeason} vs prior 2 seasons, delta, and industry benchmark
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-900 border-b border-slate-700">
                                    <th className="text-left py-3.5 px-5 text-sm font-semibold text-white">Metric</th>
                                    <th className="text-center py-3.5 px-4 text-sm font-semibold text-teal-300">{seasonBenchmark.seasons[0]}</th>
                                    <th className="text-center py-3.5 px-4 text-sm font-semibold text-slate-300">{seasonBenchmark.seasons[1]}</th>
                                    <th className="text-center py-3.5 px-4 text-sm font-semibold text-slate-400">{seasonBenchmark.seasons[2]}</th>
                                    <th className="text-center py-3.5 px-4 text-sm font-semibold text-amber-300">Δ Delta</th>
                                    <th className="text-center py-3.5 px-4 text-sm font-semibold text-purple-300">Industry Benchmark</th>
                                </tr>
                            </thead>
                            <tbody>
                                {seasonBenchmark.rows.map((row, i) => (
                                    <tr key={row.metric}
                                        className={`border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors ${i % 2 === 0 ? '' : 'bg-slate-900/20'}`}>
                                        <td className="py-3.5 px-5 text-slate-200 font-medium text-sm">{row.metric}</td>
                                        <td className="py-3.5 px-4 text-center text-white font-bold text-sm">{row.aw2027}</td>
                                        <td className="py-3.5 px-4 text-center text-slate-300 text-sm">{row.ss2026}</td>
                                        <td className="py-3.5 px-4 text-center text-slate-400 text-sm">{row.aw2026}</td>
                                        <td className="py-3.5 px-4 text-center">
                                            <DeltaCell delta={row.delta} dir={row.deltaDir} />
                                        </td>
                                        <td className="py-3.5 px-4 text-center">
                                            <BenchmarkCell value={row.benchmark} rowValue={row.aw2027} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Insight Note */}
            <div className="p-5 rounded-xl border border-teal-500/40 bg-teal-500/5">
                <p className="text-slate-200 text-sm font-medium mb-1">📊 Key Insight — {activeSeason}</p>
                <p className="text-slate-400 text-sm leading-relaxed">{seasonBenchmark.insightNote}</p>
            </div>
        </div>
    );
};

export default SeasonBenchmark;
