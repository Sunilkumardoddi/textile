import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Palette, Shirt, CheckCircle, XCircle, ArrowLeft, Send, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import data from '@/data/seasonPOData.json';

const { aiStyle } = data;

const AIStyleEngine = () => {
    const navigate = useNavigate();
    const [selectedColor, setSelectedColor] = useState('Navy');
    const [selectedStripe, setSelectedStripe] = useState('No Stripe');
    const [selectedConstruction, setSelectedConstruction] = useState('2/1 Twill');
    const [approved, setApproved] = useState(null);

    const dispatchData = {
        ...aiStyle.dispatch,
        colour: selectedColor,
        construction: selectedConstruction,
    };

    return (
        <div className="space-y-6 pb-8" data-testid="ai-style-engine">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">AI Style Engine</h1>
                    <p className="text-slate-400 mt-1">Adjust, approve, and dispatch styles for AW2027</p>
                </div>
                <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800"
                    onClick={() => navigate('/dashboard/brand/seasons/mood-board')}>
                    <ArrowLeft className="h-4 w-4 mr-2" /> Mood Board
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* LEFT — Selected Design */}
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Shirt className="h-5 w-5 text-teal-400" />Selected Design
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {[
                            { label: 'Style No.', value: aiStyle.selectedDesign.styleNo },
                            { label: 'Category', value: aiStyle.selectedDesign.category },
                            { label: 'Fabric', value: aiStyle.selectedDesign.fabric },
                            { label: 'Construction', value: aiStyle.selectedDesign.construction },
                            { label: 'Colour', value: aiStyle.selectedDesign.colour },
                            { label: 'Old Price', value: aiStyle.selectedDesign.oldPrice },
                        ].map(({ label, value }) => (
                            <div key={label} className="flex justify-between py-1.5 border-b border-slate-700/50">
                                <span className="text-slate-400 text-sm">{label}</span>
                                <span className="text-white text-sm font-medium">{value}</span>
                            </div>
                        ))}

                        {/* Placeholder image area */}
                        <div className="mt-4 h-36 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 flex items-center justify-center">
                            <div className="text-center">
                                <Shirt className="h-10 w-10 text-slate-500 mx-auto mb-2" />
                                <p className="text-slate-500 text-xs">Style Preview</p>
                                <p className="text-slate-600 text-xs">{aiStyle.selectedDesign.styleNo}</p>
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
                                        onClick={() => setSelectedColor(swatch.name)}
                                        className={`flex flex-col items-center gap-1 group`}
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
                                        onClick={() => setSelectedStripe(opt)}
                                        className={`py-2 px-3 rounded-lg text-xs font-medium border transition-all ${
                                            selectedStripe === opt
                                                ? 'bg-teal-600/30 border-teal-500 text-teal-300'
                                                : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:border-slate-500'
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
                                        onClick={() => setSelectedConstruction(opt)}
                                        className={`py-2 px-3 rounded-lg text-xs font-medium border transition-all ${
                                            selectedConstruction === opt
                                                ? 'bg-blue-600/30 border-blue-500 text-blue-300'
                                                : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:border-slate-500'
                                        }`}>
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Approve / Reject */}
                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <Button
                                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                onClick={() => setApproved(true)}>
                                <CheckCircle className="h-4 w-4 mr-2" />Approve Style
                            </Button>
                            <Button
                                className="bg-red-600 hover:bg-red-700 text-white"
                                onClick={() => setApproved(false)}>
                                <XCircle className="h-4 w-4 mr-2" />Reject / Re-do
                            </Button>
                        </div>

                        {approved !== null && (
                            <div className={`p-3 rounded-lg text-sm text-center font-medium ${approved ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'}`}>
                                {approved ? '✓ Style Approved — dispatching to sourcing…' : '✗ Style rejected — returned for revision'}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* RIGHT — Dispatch to Sourcing */}
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Send className="h-5 w-5 text-orange-400" />Dispatch to Sourcing
                        </CardTitle>
                        <CardDescription className="text-slate-400">Auto-filled from AI adjustments</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {[
                            { label: 'Style Ref', value: dispatchData.styleRef },
                            { label: 'Construction', value: dispatchData.construction },
                            { label: 'Colour', value: dispatchData.colour },
                            { label: 'Costing Rate', value: dispatchData.costingRate },
                            { label: 'MOQ', value: dispatchData.moq },
                            { label: 'Delivery Date', value: dispatchData.deliveryDate },
                            { label: 'Tracking No.', value: dispatchData.trackingNo },
                            { label: 'Status', value: dispatchData.status },
                        ].map(({ label, value }) => (
                            <div key={label} className="flex justify-between py-1.5 border-b border-slate-700/50">
                                <span className="text-slate-400 text-sm">{label}</span>
                                <span className={`text-sm font-medium ${label === 'Status' ? 'text-teal-400' : 'text-white'}`}>{value}</span>
                            </div>
                        ))}

                        <Button className="w-full mt-4 bg-orange-600 hover:bg-orange-700 text-white"
                            onClick={() => navigate('/dashboard/brand/sourcing-costing')}>
                            Track in Sourcing Module <Send className="h-4 w-4 ml-2" />
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AIStyleEngine;
