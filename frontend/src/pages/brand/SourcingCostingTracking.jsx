import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, Truck, CheckCircle, Clock, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import data from '@/data/seasonPOData.json';

const { sourcing } = data;

const StageRow = ({ stage, date, status }) => {
    const isDone = status === 'Done';
    const isInProgress = status === 'In Progress';
    return (
        <div className="relative flex items-start gap-4 pb-5 last:pb-0">
            <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center z-10 ${
                    isDone ? 'bg-emerald-500 border-emerald-500' :
                    isInProgress ? 'bg-orange-500 border-orange-500' :
                    'bg-slate-700 border-slate-600'
                }`}>
                    {isDone ? <CheckCircle className="h-4 w-4 text-white" />
                        : isInProgress ? <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        : <Clock className="h-4 w-4 text-slate-400" />}
                </div>
                <div className="w-0.5 bg-slate-700 flex-1 mt-0.5 last:hidden" style={{ minHeight: 20 }} />
            </div>
            <div className="flex-1 pb-1">
                <p className={`text-sm font-semibold ${isDone ? 'text-slate-200' : isInProgress ? 'text-orange-300' : 'text-slate-500'}`}>{stage}</p>
                <p className="text-slate-500 text-xs">{date}</p>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                isDone ? 'bg-emerald-500/10 text-emerald-400' :
                isInProgress ? 'bg-orange-500/10 text-orange-400' :
                'bg-slate-700/50 text-slate-500'
            }`}>{status}</span>
        </div>
    );
};

const SourcingCostingTracking = () => {
    const navigate = useNavigate();

    return (
        <div className="space-y-6 pb-8" data-testid="sourcing-costing-tracking">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Sourcing Team — Costing & Tracking</h1>
                    <p className="text-slate-400 mt-1">Style AW27-WV-042 · Arvind Mills Ltd · {sourcing.totalCost} cost</p>
                </div>
                <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800"
                    onClick={() => navigate('/dashboard/brand/ai-style')}>
                    <ArrowLeft className="h-4 w-4 mr-2" /> AI Style Engine
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* LEFT — Costing Module */}
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-amber-400" />Costing Module
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-900 border-b border-slate-700">
                                    <th className="text-left py-2.5 px-4 text-xs font-semibold text-white">Component</th>
                                    <th className="text-right py-2.5 px-4 text-xs font-semibold text-white">Rate</th>
                                    <th className="text-right py-2.5 px-4 text-xs font-semibold text-white">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sourcing.costComponents.map((c, i) => (
                                    <tr key={i} className={`border-b border-slate-700/50 ${i % 2 === 0 ? '' : 'bg-slate-900/20'}`}>
                                        <td className="py-2.5 px-4 text-slate-300 text-sm">{c.component}</td>
                                        <td className="py-2.5 px-4 text-slate-400 text-sm text-right">{c.rate}</td>
                                        <td className="py-2.5 px-4 text-white text-sm text-right font-medium">{c.total}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="p-4 space-y-2 border-t border-slate-700">
                            <div className="flex justify-between">
                                <span className="text-slate-400 text-sm">Total Cost</span>
                                <span className="text-white font-bold">{sourcing.totalCost}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400 text-sm">Target Selling</span>
                                <span className="text-emerald-400 font-bold">{sourcing.targetSelling}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400 text-sm">Margin</span>
                                <span className="text-teal-400 font-bold text-lg">{sourcing.marginPercent}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* MIDDLE — Construction & Rate Details */}
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-white text-base">Construction & Rate Details</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-900 border-b border-slate-700">
                                    <th className="text-left py-2.5 px-4 text-xs font-semibold text-white">Spec</th>
                                    <th className="text-left py-2.5 px-4 text-xs font-semibold text-white">Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sourcing.constructionDetails.map((d, i) => (
                                    <tr key={i} className={`border-b border-slate-700/50 ${i % 2 === 0 ? '' : 'bg-slate-900/20'}`}>
                                        <td className="py-2.5 px-4 text-slate-400 text-sm">{d.spec}</td>
                                        <td className="py-2.5 px-4 text-white text-sm font-medium">{d.value}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>

                {/* RIGHT — Delivery Tracker */}
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Truck className="h-5 w-5 text-orange-400" />Time, Delivery & Tracking
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {sourcing.deliveryTracker.map((stage, i) => (
                            <StageRow key={i} {...stage} />
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default SourcingCostingTracking;
