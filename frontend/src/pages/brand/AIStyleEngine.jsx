import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shirt, CheckCircle, XCircle, ArrowLeft, Send, Zap, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import data from '@/data/seasonPOData.json';

const { aiStyle } = data;

// Construction → price adjustment map
const CONSTRUCTION_PRICE = {
    '2/1 Twill':   '₹ 362/mtr',
    '3/1 Twill':   '₹ 378/mtr',
    'Plain Weave': '₹ 340/mtr',
    'Dobby Weave': '₹ 410/mtr',
};

const AIStyleEngine = () => {
    const navigate = useNavigate();
    const [selectedColor, setSelectedColor]               = useState('Navy');
    const [selectedStripe, setSelectedStripe]             = useState('No Stripe');
    const [selectedConstruction, setSelectedConstruction] = useState('2/1 Twill');
    const [approved, setApproved]                         = useState(null); // null | true | false
    const [dispatched, setDispatched]                     = useState(false);

    const selectedSwatch = aiStyle.colourSwatches.find(s => s.name === selectedColor);
    const costingRate    = CONSTRUCTION_PRICE[selectedConstruction] || '₹ 362/mtr';
    const stripeLabel    = selectedStripe === 'No Stripe' ? '' : ` + ${selectedStripe}`;
    const styleRef       = `AW27-WV-042-${selectedColor.slice(0, 3).toUpperCase()}`;

    const handleApprove = () => { setApproved(true);  setDispatched(false); };
    const handleReject  = () => { setApproved(false); setDispatched(false); };
    const handleReset   = () => { setApproved(null);  setDispatched(false); };
    const handleDispatch = () => setDispatched(true);

    return (
        <div className="space-y-6 pb-8" data-testid="ai-style-engine">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">AI Style Engine</h1>
                    <p className="text-slate-400 mt-1">Adjust, approve, and dispatch styles for AW2027</p>
                </div>
                <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800"
                    onClick={() => navigate('/dashboard/brand')}>
                    <ArrowLeft className="h-4 w-4 mr-2" /> Mood Board
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* LEFT — Selected Design (live-updates with selections) */}
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Shirt className="h-5 w-5 text-teal-400" />Selected Design
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {[
                            { label: 'Style No.',     value: aiStyle.selectedDesign.styleNo },
                            { label: 'Category',      value: aiStyle.selectedDesign.category },
                            { label: 'Fabric',        value: aiStyle.selectedDesign.fabric },
                            { label: 'Construction',  value: selectedConstruction },
                            { label: 'Pattern',       value: selectedStripe },
                            { label: 'Colour',        value: selectedColor },
                            { label: 'Base Price',    value: '₹ 348/mtr' },
                            { label: 'Adj. Price',    value: costingRate },
                        ].map(({ label, value }) => (
                            <div key={label} className="flex justify-between py-1.5 border-b border-slate-700/50">
                                <span className="text-slate-400 text-sm">{label}</span>
                                <span className={`text-sm font-medium ${
                                    label === 'Adj. Price' ? 'text-teal-300' :
                                    label === 'Colour' ? 'text-white' : 'text-white'
                                }`}>{value}</span>
                            </div>
                        ))}

                        {/* Live colour preview swatch */}
                        <div className="mt-4 h-28 rounded-xl border border-slate-600 flex items-center justify-center gap-4 transition-all"
                            style={{ backgroundColor: selectedSwatch ? selectedSwatch.hex + '33' : '#1e293b' }}>
                            <div className="w-14 h-14 rounded-full border-4 border-white/20 shadow-lg transition-all"
                                style={{ backgroundColor: selectedSwatch?.hex || '#1B2A4A' }} />
                            <div className="text-left">
                                <p className="text-white font-medium text-sm">{selectedColor}</p>
                                <p className="text-slate-400 text-xs">{selectedConstruction}{stripeLabel}</p>
                                <p className="text-teal-300 text-xs mt-1">{costingRate}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* MIDDLE — AI Adjustment Module */}
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Zap className="h-5 w-5 text-amber-400" />AI Adjustment Module
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Colour swatches */}
                        <div>
                            <p className="text-slate-400 text-xs uppercase tracking-wide font-semibold mb-3">Colour Change</p>
                            <div className="flex flex-wrap gap-3">
                                {aiStyle.colourSwatches.map(swatch => (
                                    <button
                                        key={swatch.name}
                                        onClick={() => { setSelectedColor(swatch.name); setApproved(null); setDispatched(false); }}
                                        className="flex flex-col items-center gap-1 group"
                                    >
                                        <div
                                            className={`w-10 h-10 rounded-full shadow-lg border-4 transition-all ${selectedColor === swatch.name ? 'border-white scale-110' : 'border-transparent group-hover:border-slate-400'}`}
                                            style={{ backgroundColor: swatch.hex }}
                                        />
                                        <span className={`text-xs ${selectedColor === swatch.name ? 'text-white' : 'text-slate-500'}`}>{swatch.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Stripe/Pattern toggles */}
                        <div>
                            <p className="text-slate-400 text-xs uppercase tracking-wide font-semibold mb-3">Stripe / Pattern</p>
                            <div className="grid grid-cols-2 gap-2">
                                {aiStyle.stripeOptions.map(opt => (
                                    <button key={opt}
                                        onClick={() => { setSelectedStripe(opt); setApproved(null); setDispatched(false); }}
                                        className={`py-2 px-3 rounded-lg text-xs font-medium border transition-all ${
                                            selectedStripe === opt
                                                ? 'bg-teal-600/20 border-teal-500/50 text-teal-300'
                                                : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white'
                                        }`}>
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Construction toggles */}
                        <div>
                            <p className="text-slate-400 text-xs uppercase tracking-wide font-semibold mb-3">Construction</p>
                            <div className="grid grid-cols-2 gap-2">
                                {aiStyle.constructionOptions.map(opt => (
                                    <button key={opt}
                                        onClick={() => { setSelectedConstruction(opt); setApproved(null); setDispatched(false); }}
                                        className={`py-2 px-3 rounded-lg text-xs font-medium border transition-all ${
                                            selectedConstruction === opt
                                                ? 'bg-teal-600/20 border-teal-500/50 text-teal-300'
                                                : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white'
                                        }`}>
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Approve / Reject */}
                        {approved === null && (
                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleApprove}>
                                    <CheckCircle className="h-4 w-4 mr-2" />Approve Style
                                </Button>
                                <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={handleReject}>
                                    <XCircle className="h-4 w-4 mr-2" />Reject / Re-do
                                </Button>
                            </div>
                        )}

                        {approved === true && (
                            <div className="space-y-2 pt-2">
                                <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-sm text-center font-medium">
                                    ✓ Style Approved — ready to dispatch
                                </div>
                                <button onClick={handleReset} className="w-full flex items-center justify-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors">
                                    <RotateCcw className="h-3 w-3" /> Reset & re-adjust
                                </button>
                            </div>
                        )}

                        {approved === false && (
                            <div className="space-y-2 pt-2">
                                <div className="p-3 rounded-lg bg-red-500/10 text-red-400 border border-red-500/30 text-sm text-center font-medium">
                                    ✗ Style rejected — adjust selections above
                                </div>
                                <button onClick={handleReset} className="w-full flex items-center justify-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors">
                                    <RotateCcw className="h-3 w-3" /> Re-open for editing
                                </button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* RIGHT — Dispatch to Sourcing */}
                <Card className={`bg-slate-800/50 border-slate-700 transition-all ${approved === true ? 'border-emerald-500/30' : ''}`}>
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Send className="h-5 w-5 text-orange-400" />Dispatch to Sourcing
                        </CardTitle>
                        <CardDescription className="text-slate-400">Auto-filled from AI adjustments</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {[
                            { label: 'Style Ref',      value: styleRef },
                            { label: 'Construction',   value: selectedConstruction },
                            { label: 'Pattern',        value: selectedStripe },
                            { label: 'Colour',         value: selectedColor },
                            { label: 'Costing Rate',   value: costingRate },
                            { label: 'MOQ',            value: aiStyle.dispatch.moq },
                            { label: 'Delivery Date',  value: aiStyle.dispatch.deliveryDate },
                            { label: 'Tracking No.',   value: styleRef.replace('AW27-WV-', 'TCH-SRC-AW27-') },
                            { label: 'Status',         value: dispatched ? 'Dispatched to Sourcing' : approved === true ? 'Approved — Pending Dispatch' : 'Pending Approval' },
                        ].map(({ label, value }) => (
                            <div key={label} className="flex justify-between py-1.5 border-b border-slate-700/50">
                                <span className="text-slate-400 text-sm">{label}</span>
                                <span className={`text-sm font-medium ${
                                    label === 'Status' && dispatched ? 'text-emerald-400' :
                                    label === 'Status' && approved === true ? 'text-teal-400' :
                                    label === 'Status' ? 'text-amber-400' :
                                    label === 'Costing Rate' ? 'text-teal-300' : 'text-white'
                                }`}>{value}</span>
                            </div>
                        ))}

                        <div className="pt-4 space-y-2">
                            {approved === true && !dispatched && (
                                <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white" onClick={handleDispatch}>
                                    <Send className="h-4 w-4 mr-2" />Dispatch to Sourcing
                                </Button>
                            )}
                            {dispatched && (
                                <Button className="w-full bg-emerald-700 hover:bg-emerald-800 text-white"
                                    onClick={() => navigate('/dashboard/brand/sourcing-costing')}>
                                    <CheckCircle className="h-4 w-4 mr-2" />Track in Sourcing Module
                                </Button>
                            )}
                            {(approved === null || approved === false) && (
                                <Button className="w-full" variant="outline" disabled
                                    className="w-full border-slate-700 text-slate-600 cursor-not-allowed">
                                    Approve style to enable dispatch
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AIStyleEngine;
