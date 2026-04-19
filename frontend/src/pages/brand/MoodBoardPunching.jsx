import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, PlusCircle, Save, Send, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import data from '@/data/seasonPOData.json';

const { moodBoardPunching } = data;

const statusColors = {
    'Punch':     'bg-teal-600 hover:bg-teal-700 text-white',
    'Punching':  'bg-orange-500 hover:bg-orange-600 text-white',
    'Pending':   'bg-slate-600 hover:bg-slate-700 text-slate-300',
};

const MoodBoardPunching = () => {
    const navigate = useNavigate();
    const [selectedStyle, setSelectedStyle] = useState(moodBoardPunching.approvedStyles[0]);
    const [form, setForm] = useState({
        styleNo: selectedStyle.styleNo,
        styleName: selectedStyle.name,
        category: 'Woven Gents',
        team: 'South Team',
        colour: 'Navy',
        construction: '2/1 Twill',
        fabricMtr: '2.2',
        orderQty: '2400',
        totalFabric: '',
        supplier: 'Arvind Mills Ltd',
        targetPrice: '1250',
        delivery: '2025-08-15',
    });

    const totalFabric = parseFloat(form.fabricMtr || 0) * parseFloat(form.orderQty || 0);
    const totalPunched = moodBoardPunching.seasonPlan.reduce((a, b) => a + b.punched, 0);
    const totalStyles  = moodBoardPunching.seasonPlan.reduce((a, b) => a + b.total, 0);

    return (
        <div className="space-y-6 pb-8" data-testid="mood-board-punching">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Mood Board Punching</h1>
                    <p className="text-slate-400 mt-1">AW2027 — Select styles, enter punch data, generate season plan</p>
                </div>
                <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800"
                    onClick={() => navigate('/dashboard/brand/seasons/mood-board')}>
                    <ArrowLeft className="h-4 w-4 mr-2" /> Mood Board
                </Button>
            </div>

            {/* Filter bar */}
            <div className="flex flex-wrap items-center gap-3 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                <Filter className="h-4 w-4 text-slate-400" />
                {['Season', 'Category', 'Team', 'Status'].map(f => (
                    <Select key={f} defaultValue="all">
                        <SelectTrigger className="w-[130px] bg-slate-900 border-slate-600 text-slate-300 text-sm">
                            <SelectValue placeholder={f} />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                            <SelectItem value="all" className="text-white">All {f}s</SelectItem>
                        </SelectContent>
                    </Select>
                ))}
                <Button className="ml-auto bg-teal-600 hover:bg-teal-700 text-white text-sm">
                    <PlusCircle className="h-4 w-4 mr-2" />Punch New Style
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* LEFT — Approved Styles */}
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-white text-base">Approved Styles</CardTitle>
                        <CardDescription className="text-slate-400">Click a style to populate the punch form</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 divide-y divide-slate-700/50">
                        {moodBoardPunching.approvedStyles.map(style => (
                            <button
                                key={style.styleNo}
                                onClick={() => { setSelectedStyle(style); setForm(prev => ({ ...prev, styleNo: style.styleNo, styleName: style.name, orderQty: String(style.qty) })); }}
                                className={`w-full text-left px-4 py-3.5 hover:bg-slate-700/30 transition-colors ${selectedStyle?.styleNo === style.styleNo ? 'bg-teal-600/10 border-l-2 border-teal-500' : ''}`}>
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-white text-sm font-medium">{style.name}</span>
                                    <button className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${statusColors[style.status]}`}>
                                        {style.status}
                                    </button>
                                </div>
                                <p className="text-slate-500 text-xs">{style.styleNo} · {style.qty.toLocaleString()} pcs · {style.fabric}</p>
                            </button>
                        ))}
                    </CardContent>
                </Card>

                {/* MIDDLE — Punch Style Form */}
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-white text-base">Punch Style Card</CardTitle>
                        <CardDescription className="text-slate-400">Fill details and punch to season plan</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { label: 'Style No', key: 'styleNo' },
                                { label: 'Style Name', key: 'styleName' },
                            ].map(({ label, key }) => (
                                <div key={key} className="space-y-1">
                                    <Label className="text-slate-400 text-xs">{label}</Label>
                                    <Input value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                                        className="bg-slate-900 border-slate-600 text-white text-sm h-8" />
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { label: 'Colour', key: 'colour' },
                                { label: 'Construction', key: 'construction' },
                                { label: 'Fabric mtr/pc', key: 'fabricMtr' },
                                { label: 'Order Qty', key: 'orderQty' },
                                { label: 'Supplier', key: 'supplier' },
                                { label: 'Target Price (₹)', key: 'targetPrice' },
                                { label: 'Delivery Date', key: 'delivery' },
                            ].map(({ label, key }) => (
                                <div key={key} className="space-y-1">
                                    <Label className="text-slate-400 text-xs">{label}</Label>
                                    <Input value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                                        className="bg-slate-900 border-slate-600 text-white text-sm h-8" />
                                </div>
                            ))}
                            <div className="space-y-1">
                                <Label className="text-slate-400 text-xs">Total Fabric (mtrs)</Label>
                                <div className="h-8 px-3 rounded-md bg-slate-900/80 border border-slate-700 flex items-center text-teal-400 text-sm font-medium">
                                    {totalFabric.toLocaleString()}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2 pt-2">
                            <Button className="flex-1 bg-teal-600 hover:bg-teal-700 text-white text-sm">
                                <Send className="h-4 w-4 mr-2" />PUNCH
                            </Button>
                            <Button variant="outline" className="border-slate-600 text-slate-300 text-sm">
                                <Save className="h-4 w-4 mr-2" />Save Draft
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* RIGHT — Season Plan Summary */}
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-white text-base">Season Plan Punched Summary</CardTitle>
                        <p className="text-slate-400 text-xs">{totalPunched}/{totalStyles} styles punched</p>
                    </CardHeader>
                    <CardContent className="p-0">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-900 border-b border-slate-700">
                                    <th className="text-left py-2.5 px-4 text-xs font-semibold text-white">Category</th>
                                    <th className="text-center py-2.5 px-3 text-xs font-semibold text-white">Punched</th>
                                    <th className="text-right py-2.5 px-4 text-xs font-semibold text-white">Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                {moodBoardPunching.seasonPlan.map((row, i) => {
                                    const pct = Math.round((row.punched / row.total) * 100);
                                    return (
                                        <tr key={i} className={`border-b border-slate-700/50 ${i % 2 === 0 ? '' : 'bg-slate-900/20'}`}>
                                            <td className="py-2.5 px-4 text-slate-300 text-xs">{row.category}</td>
                                            <td className="py-2 px-3">
                                                <div className="flex flex-col items-center gap-1">
                                                    <span className="text-white text-xs font-medium">{row.punched}/{row.total}</span>
                                                    <div className="w-full bg-slate-700 rounded-full h-1.5">
                                                        <div className={`h-1.5 rounded-full ${pct >= 75 ? 'bg-emerald-500' : pct >= 50 ? 'bg-orange-400' : 'bg-red-500'}`} style={{ width: `${pct}%` }} />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-2.5 px-4 text-teal-400 text-xs text-right font-medium">{row.value}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            <tfoot>
                                <tr className="bg-slate-900/60 border-t-2 border-slate-600">
                                    <td className="py-3 px-4 text-white font-bold text-sm">TOTAL</td>
                                    <td className="py-3 px-3 text-center text-white font-bold text-sm">{totalPunched}/{totalStyles}</td>
                                    <td className="py-3 px-4 text-teal-400 font-bold text-sm text-right">
                                        ₹ {moodBoardPunching.seasonPlan.reduce((acc, r) => {
                                            const val = parseFloat(r.value.replace(/[^0-9.]/g, ''));
                                            return acc + (isNaN(val) ? 0 : val);
                                        }, 0).toFixed(1)}L
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                        <div className="p-4">
                            <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white text-sm"
                                onClick={() => navigate('/dashboard/brand/po-auto')}>
                                Generate PO Drafts →
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default MoodBoardPunching;
