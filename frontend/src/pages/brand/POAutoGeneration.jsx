import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Info, CheckCircle, Clock, AlertTriangle, FileText, Edit, Send, Download, ArrowLeft, Filter, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import data from '@/data/seasonPOData.json';

const { poAutoGen } = data;

const statusColors = {
    Approved: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
    Review:   'bg-orange-500/20 text-orange-400 border-orange-500/40',
    Draft:    'bg-slate-500/20 text-slate-400 border-slate-500/40',
    Pending:  'bg-blue-500/20 text-blue-400 border-blue-500/40',
};

const SUPPLIERS = [
    'All Suppliers',
    'Arvind Mills Ltd', 'Vardhman Textiles', 'Welspun India', 'Raymond Ltd',
    'Bombay Dyeing', 'Trident Group', 'Indo Count Industries', 'Sutlej Textiles',
    'RSWM Limited', 'Grasim Industries', 'KPR Mill Ltd', 'Siyaram Silk Mills',
    'Nitin Spinners', 'Sportking India', 'Alok Industries',
];

const CERTIFICATIONS = [
    'All Certifications',
    'GOTS', 'OCS', 'GRS', 'RCS', 'HIGG FEM', 'HIGG FSLM',
    'ZDHC', 'Fair Trade', 'OEKO-TEX STD 100', 'OEKO-TEX STEP',
    'OEKO-TEX Organic', 'SUPIMA', 'CMIA', 'PCP', 'BCI',
    'Egyptian Cotton', 'Australian Cotton',
];

const POAutoGeneration = () => {
    const navigate = useNavigate();
    const [selectedPO, setSelectedPO] = useState(poAutoGen.poList[0].poNo);
    const [team, setTeam] = useState('all');
    const [supplier, setSupplier] = useState('All Suppliers');
    const [certification, setCertification] = useState('All Certifications');
    const detail = poAutoGen.selectedPO;

    const filteredPOs = poAutoGen.poList.filter(po => {
        const teamMatch = team === 'all' || (team === 'north' ? po.team === 'North' : po.team === 'South');
        const supplierMatch = supplier === 'All Suppliers' || po.supplier.includes(supplier.split(' ')[0]);
        return teamMatch && supplierMatch;
    });

    return (
        <div className="space-y-6 pb-8" data-testid="po-auto-generation">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">PO Auto-Generation</h1>
                    <p className="text-slate-400 mt-1">AW2027 — System-generated PO drafts for brand manager review</p>
                </div>
                <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800"
                    onClick={() => navigate('/dashboard/brand/mood-punching')}>
                    <ArrowLeft className="h-4 w-4 mr-2" /> Mood Board Punching
                </Button>
            </div>

            {/* PO Management Filters */}
            <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-3">
                    <CardTitle className="text-white text-base flex items-center gap-2">
                        <Filter className="h-4 w-4 text-teal-400" /> PO Management Filters
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                        Filter POs by team, supplier, and buyer certification requirements
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Team Filter */}
                        <div>
                            <p className="text-slate-400 text-xs uppercase tracking-wide mb-2">Team</p>
                            <div className="flex gap-2">
                                {[
                                    { value: 'all',   label: 'All Teams' },
                                    { value: 'north', label: 'North Team' },
                                    { value: 'south', label: 'South Team' },
                                ].map(opt => (
                                    <button
                                        key={opt.value}
                                        onClick={() => setTeam(opt.value)}
                                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors border ${
                                            team === opt.value
                                                ? 'bg-teal-600/20 border-teal-500/50 text-teal-300'
                                                : 'bg-slate-900/40 border-slate-700 text-slate-400 hover:border-slate-500'
                                        }`}>
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Supplier Dropdown */}
                        <div>
                            <p className="text-slate-400 text-xs uppercase tracking-wide mb-2">Supplier</p>
                            <Select value={supplier} onValueChange={setSupplier}>
                                <SelectTrigger className="bg-slate-900/40 border-slate-700 text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-slate-700 max-h-60">
                                    {SUPPLIERS.map(s => (
                                        <SelectItem key={s} value={s} className="text-white hover:bg-slate-700">
                                            {s}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Certification Filter (Buyer Requirement) */}
                        <div>
                            <p className="text-slate-400 text-xs uppercase tracking-wide mb-2">
                                Certification (Buyer Requirement)
                            </p>
                            <Select value={certification} onValueChange={setCertification}>
                                <SelectTrigger className="bg-slate-900/40 border-slate-700 text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-slate-700 max-h-60">
                                    {CERTIFICATIONS.map(c => (
                                        <SelectItem key={c} value={c} className="text-white hover:bg-slate-700">
                                            {c}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Active filter pills */}
                    {(team !== 'all' || supplier !== 'All Suppliers' || certification !== 'All Certifications') && (
                        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-700">
                            <span className="text-slate-500 text-xs self-center">Active filters:</span>
                            {team !== 'all' && (
                                <span className="px-2 py-0.5 rounded bg-teal-600/20 border border-teal-500/40 text-teal-300 text-xs">
                                    {team === 'north' ? 'North Team' : 'South Team'}
                                </span>
                            )}
                            {supplier !== 'All Suppliers' && (
                                <span className="px-2 py-0.5 rounded bg-blue-600/20 border border-blue-500/40 text-blue-300 text-xs">
                                    {supplier}
                                </span>
                            )}
                            {certification !== 'All Certifications' && (
                                <span className="px-2 py-0.5 rounded bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 text-xs">
                                    {certification}
                                </span>
                            )}
                            <button
                                onClick={() => { setTeam('all'); setSupplier('All Suppliers'); setCertification('All Certifications'); }}
                                className="text-slate-500 hover:text-slate-300 text-xs underline ml-1">
                                Clear all
                            </button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Info Banner */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
                <Info className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
                <p className="text-blue-300 text-sm">{poAutoGen.infoBanner}</p>
            </div>

            {/* Main Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* LEFT — PO List (2 cols) */}
                <Card className="lg:col-span-2 bg-slate-800/50 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-white text-base">PO List — AW2027</CardTitle>
                        <CardDescription className="text-slate-400">{filteredPOs.length} purchase orders</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-900 border-b border-slate-700">
                                        <th className="text-left py-2.5 px-4 text-xs font-semibold text-white">PO No.</th>
                                        <th className="text-left py-2.5 px-3 text-xs font-semibold text-white">Supplier</th>
                                        <th className="text-center py-2.5 px-3 text-xs font-semibold text-white">Styles</th>
                                        <th className="text-right py-2.5 px-4 text-xs font-semibold text-white">Value</th>
                                        <th className="text-left py-2.5 px-3 text-xs font-semibold text-white">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredPOs.map((po, i) => (
                                        <tr
                                            key={po.poNo}
                                            onClick={() => setSelectedPO(po.poNo)}
                                            className={`border-b border-slate-700/50 cursor-pointer transition-colors ${
                                                selectedPO === po.poNo ? 'bg-teal-600/10 border-l-2 border-l-teal-500' : 'hover:bg-slate-700/30'
                                            } ${i % 2 === 0 ? '' : 'bg-slate-900/20'}`}>
                                            <td className="py-2.5 px-4 text-white text-xs font-semibold">{po.poNo}</td>
                                            <td className="py-2.5 px-3 text-slate-300 text-xs">{po.supplier.split(' ')[0]}</td>
                                            <td className="py-2.5 px-3 text-center text-slate-300 text-xs">{po.styles}</td>
                                            <td className="py-2.5 px-4 text-teal-400 text-xs text-right font-medium">{po.value}</td>
                                            <td className="py-2.5 px-3">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${statusColors[po.status]}`}>{po.status}</span>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredPOs.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="py-8 text-center text-slate-500 text-sm">No POs match the selected filters</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* RIGHT — PO Detail (3 cols) */}
                <Card className="lg:col-span-3 bg-slate-800/50 border-slate-700">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-white">PO Detail — {detail.poNo}</CardTitle>
                                <div className="flex gap-4 text-xs text-slate-400 mt-1">
                                    <span>Season: {detail.season}</span>
                                    <span>Date: {detail.date}</span>
                                    <span>Due: {detail.dueDate}</span>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Styles table */}
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-900 border-b border-slate-700">
                                        {['Style No.', 'Name', 'Qty', 'Rate', 'Fabric', 'Value'].map(h => (
                                            <th key={h} className="text-left py-2.5 px-3 text-xs font-semibold text-white">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {detail.styles.map((s, i) => (
                                        <tr key={i} className={`border-b border-slate-700/50 ${i % 2 === 0 ? '' : 'bg-slate-900/20'}`}>
                                            <td className="py-2.5 px-3 text-slate-300 text-xs">{s.styleNo}</td>
                                            <td className="py-2.5 px-3 text-slate-300 text-xs">{s.name}</td>
                                            <td className="py-2.5 px-3 text-slate-300 text-xs">{s.qty.toLocaleString()}</td>
                                            <td className="py-2.5 px-3 text-slate-300 text-xs">{s.rate}</td>
                                            <td className="py-2.5 px-3 text-slate-300 text-xs">{s.fabric}</td>
                                            <td className="py-2.5 px-3 text-teal-400 text-xs font-medium">{s.value}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Total */}
                        <div className="p-3 rounded-xl bg-teal-600/10 border border-teal-600/30 flex items-center justify-between">
                            <span className="text-teal-300 font-semibold">Total PO Value</span>
                            <span className="text-teal-300 text-xl font-bold">{detail.totalValue}</span>
                        </div>

                        {/* Terms */}
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            {[
                                { label: 'Payment Terms', value: detail.paymentTerms },
                                { label: 'Balance %', value: detail.balancePercent },
                                { label: 'Delivery', value: detail.delivery },
                                { label: 'Penalty', value: detail.penalty },
                            ].map(({ label, value }) => (
                                <div key={label} className="p-2.5 rounded-lg bg-slate-900/40 border border-slate-700">
                                    <p className="text-slate-500 text-xs">{label}</p>
                                    <p className="text-slate-200 text-xs font-medium mt-0.5">{value}</p>
                                </div>
                            ))}
                        </div>

                        {/* Actions */}
                        <div className="grid grid-cols-2 gap-3 pt-1">
                            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm">
                                <CheckCircle className="h-4 w-4 mr-2" />Raise Final PO
                            </Button>
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white text-sm">
                                <Send className="h-4 w-4 mr-2" />Send to Mfr
                            </Button>
                            <Button variant="outline" className="border-slate-600 text-slate-300 text-sm">
                                <Download className="h-4 w-4 mr-2" />Download PDF
                            </Button>
                            <Button variant="outline" className="border-slate-600 text-slate-300 text-sm">
                                <Edit className="h-4 w-4 mr-2" />Edit PO
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default POAutoGeneration;
