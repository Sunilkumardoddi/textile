import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, CheckSquare, Square, Zap, ArrowRight, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import data from '@/data/seasonPOData.json';

const { moodBoard } = data;

const flowColors = {
    teal:   'bg-teal-600 border-teal-500',
    blue:   'bg-blue-600 border-blue-500',
    purple: 'bg-purple-600 border-purple-500',
    amber:  'bg-amber-500 border-amber-400',
    orange: 'bg-orange-500 border-orange-400',
    green:  'bg-emerald-600 border-emerald-500',
};

const SeasonMoodBoard = () => {
    const navigate = useNavigate();
    const [selectedBase, setSelectedBase] = useState('SS2026');
    const [checkedItems, setCheckedItems] = useState({});

    const toggleCheck = (idx) =>
        setCheckedItems(prev => ({ ...prev, [idx]: !prev[idx] }));

    return (
        <div className="space-y-6 pb-8" data-testid="season-mood-board">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Season Mood Board & New Season Creation</h1>
                    <p className="text-slate-400 mt-1">Configure AW2027 season using AI-assisted style workflow</p>
                </div>
                <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800"
                    onClick={() => navigate('/dashboard/brand')}>
                    <ArrowLeft className="h-4 w-4 mr-2" /> Dashboard
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* LEFT SIDEBAR — Seasons list */}
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-white text-base flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-teal-400" />Seasons
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="bg-teal-600/20 border-l-2 border-teal-500 px-4 py-3">
                            <p className="text-teal-300 text-sm font-semibold">✦ New Season</p>
                            <p className="text-teal-400/60 text-xs">AW2027</p>
                        </div>
                        {moodBoard.pastSeasons.map(s => (
                            <div key={s} className="px-4 py-3 hover:bg-slate-700/30 transition-colors cursor-pointer border-b border-slate-700/50">
                                <p className="text-slate-400 text-sm">{s}</p>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* MIDDLE — 3 Steps */}
                <div className="lg:col-span-2 space-y-5">
                    {/* Step 1 */}
                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-white text-base">Step 1 — Base Season Selector</CardTitle>
                            <CardDescription className="text-slate-400">Select a past season to base AW2027 styles on</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-3">
                                {moodBoard.pastSeasons.slice(0, 4).map(s => (
                                    <button
                                        key={s}
                                        onClick={() => setSelectedBase(s)}
                                        className={`py-3 px-4 rounded-xl border text-sm font-medium transition-all ${
                                            selectedBase === s
                                                ? 'border-teal-500 bg-teal-600/20 text-teal-300'
                                                : 'border-slate-700 bg-slate-900/50 text-slate-400 hover:border-slate-500'
                                        }`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Step 2 */}
                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-white text-base">Step 2 — Supplier Development Data</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {moodBoard.supplierDevChecklist.map((item, i) => (
                                <button key={i}
                                    onClick={() => toggleCheck(i)}
                                    className="w-full flex items-center gap-3 p-3 rounded-lg bg-slate-900/40 border border-slate-700 hover:border-slate-600 transition-colors text-left">
                                    {checkedItems[i]
                                        ? <CheckSquare className="h-5 w-5 text-teal-400 shrink-0" />
                                        : <Square className="h-5 w-5 text-slate-500 shrink-0" />}
                                    <span className={`text-sm ${checkedItems[i] ? 'text-slate-400 line-through' : 'text-slate-300'}`}>{item}</span>
                                </button>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Step 3 */}
                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-white text-base">Step 3 — AI Studio</CardTitle>
                            <CardDescription className="text-slate-400">Launch AI Style Engine to adjust styles for AW2027</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button className="w-full bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white font-semibold"
                                onClick={() => navigate('/dashboard/brand/ai-style')}>
                                <Zap className="h-4 w-4 mr-2" />Launch AI Studio
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* RIGHT — Approval & Dispatch Flow */}
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-white text-base">Approval & Dispatch Flow</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-0">
                            {moodBoard.approvalFlow.map((step, i) => (
                                <div key={i} className="relative pl-5 pb-5 last:pb-0">
                                    {/* vertical line */}
                                    {i < moodBoard.approvalFlow.length - 1 && (
                                        <div className="absolute left-2 top-5 bottom-0 w-0.5 bg-slate-700" />
                                    )}
                                    {/* step dot */}
                                    <div className={`absolute left-0 top-1 w-4 h-4 rounded-full flex items-center justify-center text-white text-xs font-bold ${flowColors[step.color].split(' ')[0]}`}>
                                        {step.step}
                                    </div>
                                    <p className="text-slate-200 text-sm font-medium pl-2">{step.label}</p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-700">
                            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm"
                                onClick={() => navigate('/dashboard/brand/po-auto')}>
                                Go to PO Auto-Generation <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default SeasonMoodBoard;
