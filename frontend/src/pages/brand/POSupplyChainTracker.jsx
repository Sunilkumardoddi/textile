import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, Download, FileText, CheckCircle, Clock, AlertTriangle, XCircle, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import data from '@/data/seasonPOData.json';

const { poTracker } = data;

const stageStatusMap = {
    Done:         { color: 'text-emerald-400', badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40', icon: CheckCircle },
    'In Progress':{ color: 'text-orange-400',  badge: 'bg-orange-500/20 text-orange-400 border-orange-500/40',   icon: Clock },
    Pending:      { color: 'text-slate-400',    badge: 'bg-slate-700/50 text-slate-400 border-slate-600',         icon: Clock },
};

const POSupplyChainTracker = () => {
    const navigate = useNavigate();
    const [poRef, setPoRef] = useState('PO-001');

    return (
        <div className="space-y-6 pb-8" data-testid="po-supply-chain-tracker">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">PO-wise Supply Chain Tracker</h1>
                    <p className="text-slate-400 mt-1">End-to-end stage visibility per purchase order</p>
                </div>
                <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800"
                    onClick={() => navigate('/dashboard/brand/po-auto')}>
                    <ArrowLeft className="h-4 w-4 mr-2" /> PO Auto-Generation
                </Button>
            </div>

            {/* Filter bar */}
            <div className="flex flex-wrap items-center gap-3 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                <Filter className="h-4 w-4 text-slate-400" />
                {[
                    { placeholder: 'Select PO', options: ['PO-001','PO-002','PO-003'] },
                    { placeholder: 'Supplier', options: ['Arvind Mills Ltd', 'Vardhman'] },
                    { placeholder: 'Stage', options: ['All Stages'] },
                    { placeholder: 'Status', options: ['All Statuses', 'Done', 'In Progress', 'Pending'] },
                ].map(({ placeholder, options }) => (
                    <Select key={placeholder} defaultValue={options[0]}>
                        <SelectTrigger className="w-[150px] bg-slate-900 border-slate-600 text-slate-300 text-sm">
                            <SelectValue placeholder={placeholder} />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                            {options.map(o => <SelectItem key={o} value={o} className="text-white">{o}</SelectItem>)}
                        </SelectContent>
                    </Select>
                ))}
                <div className="ml-auto flex gap-2">
                    <Button variant="outline" className="border-slate-600 text-slate-300 text-sm">
                        <FileText className="h-4 w-4 mr-2" />Export Excel
                    </Button>
                    <Button variant="outline" className="border-slate-600 text-slate-300 text-sm">
                        <Download className="h-4 w-4 mr-2" />Download PDF
                    </Button>
                </div>
            </div>

            {/* KPI Tiles */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                    { label: 'PO Value', value: poTracker.kpis.poValue, color: 'border-teal-500/30' },
                    { label: 'Styles in PO', value: poTracker.kpis.stylesInPO, color: 'border-blue-500/30' },
                    { label: 'SC Complete', value: `${poTracker.kpis.supplyChainComplete}%`, color: 'border-emerald-500/30' },
                    { label: 'Open Alerts', value: poTracker.kpis.openAlerts, color: 'border-red-500/30' },
                    { label: 'Delivery', value: poTracker.kpis.deliveryDeadline, color: 'border-amber-500/30' },
                ].map(({ label, value, color }) => (
                    <Card key={label} className={`bg-slate-800/50 border ${color}`}>
                        <CardContent className="p-4 text-center">
                            <p className="text-slate-400 text-xs uppercase tracking-wide mb-1">{label}</p>
                            <p className="text-white text-lg font-bold">{value}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Stages Table */}
            <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                    <CardTitle className="text-white text-base">Supply Chain Stage Tracker — {poRef} | Arvind Mills Ltd</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-900 border-b border-slate-700">
                                    {['#', 'Stage', 'Tier', 'Planned', 'Completed', 'Status', 'Details'].map(h => (
                                        <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-white">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {poTracker.stages.map((stage, i) => {
                                    const { badge, icon: Icon } = stageStatusMap[stage.status] || stageStatusMap.Pending;
                                    return (
                                        <tr key={i} className={`border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors ${i % 2 === 0 ? '' : 'bg-slate-900/20'}`}>
                                            <td className="py-3 px-4 text-slate-500 text-sm">{stage.no}</td>
                                            <td className="py-3 px-4 text-slate-200 text-sm font-medium">{stage.stage}</td>
                                            <td className="py-3 px-4">
                                                <span className="text-xs px-2 py-0.5 bg-slate-700/50 text-slate-400 border border-slate-600 rounded-full">{stage.tier}</span>
                                            </td>
                                            <td className="py-3 px-4 text-slate-400 text-xs">{stage.planned}</td>
                                            <td className="py-3 px-4 text-slate-400 text-xs">{stage.completed}</td>
                                            <td className="py-3 px-4">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badge}`}>
                                                    <Icon className="h-3 w-3" />{stage.status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <button className="text-teal-400 text-xs hover:underline">View</button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default POSupplyChainTracker;
